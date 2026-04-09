// State
let directories = [];
let movies = [];
let allProgress = [];
let currentMovie = null;
let thumbnailCache = new Map();
let ffmpegAvailable = false;
let thumbnailsLoading = new Set();
let thumbnailObserver = null;
let observedElements = new Map(); // Track which elements need thumbnails
let currentSort = 'name';
let currentSearch = '';
let pendingMovie = null; // For resume prompt

// DOM Elements
const directoryScreen = document.getElementById('directory-screen');
const mainScreen = document.getElementById('main-screen');
const selectDirectoryBtn = document.getElementById('select-directory-btn');
const addDirectoryBtn = document.getElementById('add-directory-btn');
const refreshBtn = document.getElementById('refresh-btn');
const shortcutsBtn = document.getElementById('shortcuts-btn');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');
const sortSelect = document.getElementById('sort-select');
const directoryPills = document.getElementById('directory-pills');
const movieGrid = document.getElementById('movie-grid');
const continueWatchingSection = document.getElementById('continue-watching');
const continueWatchingRow = document.getElementById('continue-watching-row');
const movieCount = document.getElementById('movie-count');
const loading = document.getElementById('loading');
const playerModal = document.getElementById('player-modal');
const closePlayer = document.getElementById('close-player');
const videoPlayer = document.getElementById('video-player');
const playerMovieTitle = document.getElementById('player-movie-title');
const markWatchedBtn = document.getElementById('mark-watched-btn');
const shortcutsModal = document.getElementById('shortcuts-modal');
const closeShortcuts = document.getElementById('close-shortcuts');
const speedBtns = document.querySelectorAll('.speed-btn');
const resumeModal = document.getElementById('resume-modal');
const resumeMessage = document.getElementById('resume-message');
const resumePlayBtn = document.getElementById('resume-play');
const startOverBtn = document.getElementById('start-over');

// Event Listeners
selectDirectoryBtn.addEventListener('click', handleSelectDirectory);
addDirectoryBtn.addEventListener('click', handleAddDirectory);
refreshBtn.addEventListener('click', refreshMovies);
shortcutsBtn.addEventListener('click', toggleShortcutsModal);
closeShortcuts.addEventListener('click', toggleShortcutsModal);
closePlayer.addEventListener('click', closePlayerModal);
markWatchedBtn.addEventListener('click', markAsWatched);
searchInput.addEventListener('input', handleSearch);
clearSearchBtn.addEventListener('click', clearSearch);
sortSelect.addEventListener('change', handleSortChange);
resumePlayBtn.addEventListener('click', handleResumePlay);
startOverBtn.addEventListener('click', handleStartOver);

// Event delegation for reset progress buttons
movieGrid.addEventListener('click', handleResetProgressClick);
continueWatchingRow.addEventListener('click', handleResetProgressClick);

// Playback speed buttons
speedBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const speed = parseFloat(btn.dataset.speed);
    setPlaybackSpeed(speed);
  });
});

// Video player events
videoPlayer.addEventListener('timeupdate', handleTimeUpdate);
videoPlayer.addEventListener('loadedmetadata', handleMetadataLoaded);
videoPlayer.addEventListener('ended', handleVideoEnded);

// Check for saved directory on startup
checkSavedDirectory();

// Functions
async function checkSavedDirectory() {
  const savedDirs = await window.electronAPI.getDirectories();
  
  if (savedDirs && savedDirs.length > 0) {
    directories = savedDirs;
    await loadMovies();
  }
}

async function handleSelectDirectory() {
  const directory = await window.electronAPI.selectDirectory();
  
  if (directory) {
    directories = [directory];
    await window.electronAPI.addDirectory(directory);
    await loadMovies();
  }
}

async function handleAddDirectory() {
  const directory = await window.electronAPI.selectDirectory();
  
  if (directory && !directories.includes(directory)) {
    directories = await window.electronAPI.addDirectory(directory);
    await loadMovies();
  }
}

async function handleRemoveDirectory(directory) {
  directories = await window.electronAPI.removeDirectory(directory);
  
  if (directories.length === 0) {
    // If no directories left, go back to selection screen
    directoryScreen.classList.add('active');
    mainScreen.classList.remove('active');
  } else {
    await loadMovies();
  }
}

async function refreshMovies() {
  if (directories.length === 0) {
    return;
  }
  
  // Add spinning animation to refresh button
  refreshBtn.classList.add('refreshing');
  
  try {
    await loadMovies();
  } finally {
    // Remove spinning animation after loading completes
    refreshBtn.classList.remove('refreshing');
  }
}

async function loadMovies() {
  showLoading();

  const result = await window.electronAPI.scanMovies(directories);

  if (result.success) {
    movies = result.movies;
    allProgress = await window.electronAPI.getAllProgress();

    // Check if ffmpeg is available
    ffmpegAvailable = await window.electronAPI.checkFfmpeg();

    // Clear thumbnail cache for new movie list
    thumbnailCache.clear();
    thumbnailsLoading.clear();
    observedElements.clear(); // Prevent memory leak from previous scans

    // Setup Intersection Observer for lazy thumbnail loading
    setupThumbnailObserver();

    showMainScreen();
    renderDirectoryPills();
    applyFiltersAndRender();
    updateMovieCount();

    // Show warning if ffmpeg is not available
    if (!ffmpegAvailable) {
      showFfmpegWarning();
    }
  } else {
    alert('Error scanning movies: ' + result.error);
  }

  hideLoading();
}

function showMainScreen() {
  directoryScreen.classList.remove('active');
  mainScreen.classList.add('active');
}

function showFfmpegWarning() {
  // Check if warning already exists
  if (document.getElementById('ffmpeg-warning')) return;

  const warning = document.createElement('div');
  warning.id = 'ffmpeg-warning';
  warning.className = 'ffmpeg-warning';
  warning.innerHTML = `
    <div class="ffmpeg-warning-content">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span><strong>Thumbnails disabled:</strong> ffmpeg not found.</span>
      <span class="ffmpeg-install-hint">Install ffmpeg for movie thumbnails:</span>
      <code id="ffmpeg-cmd"></code>
      <button class="ffmpeg-dismiss" onclick="document.getElementById('ffmpeg-warning').remove()">✕</button>
    </div>
  `;

  // Show platform-specific install command
  const cmdEl = warning.querySelector('#ffmpeg-cmd');
  if (navigator.userAgent.includes('Windows')) {
    cmdEl.textContent = 'winget install ffmpeg  (or download from ffmpeg.org)';
  } else {
    cmdEl.textContent = 'sudo apt install ffmpeg  (or your distro\'s package manager)';
  }

  // Insert after header
  const header = document.querySelector('.header');
  if (header && header.parentNode) {
    header.parentNode.insertBefore(warning, header.nextSibling);
  }
}

function handleSearch(e) {
  currentSearch = e.target.value.toLowerCase().trim();
  
  // Show/hide clear button
  if (currentSearch) {
    clearSearchBtn.classList.remove('hidden');
  } else {
    clearSearchBtn.classList.add('hidden');
  }
  
  applyFiltersAndRender();
}

function clearSearch() {
  searchInput.value = '';
  currentSearch = '';
  clearSearchBtn.classList.add('hidden');
  applyFiltersAndRender();
}

function handleSortChange(e) {
  currentSort = e.target.value;
  applyFiltersAndRender();
}

function getFilteredAndSortedMovies() {
  let filtered = [...movies];
  
  // Apply search filter
  if (currentSearch) {
    filtered = filtered.filter(movie => 
      movie.name.toLowerCase().includes(currentSearch)
    );
  }
  
  // Apply sorting
  switch (currentSort) {
    case 'name':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'duration':
      filtered.sort((a, b) => (b.duration || 0) - (a.duration || 0));
      break;
    case 'size':
      filtered.sort((a, b) => b.size - a.size);
      break;
    case 'recent':
      const progressMap = new Map(allProgress.map(p => [p.movie_path, p]));
      filtered.sort((a, b) => {
        const progA = progressMap.get(a.path);
        const progB = progressMap.get(b.path);
        const timeA = progA ? new Date(progA.last_watched).getTime() : 0;
        const timeB = progB ? new Date(progB.last_watched).getTime() : 0;
        return timeB - timeA;
      });
      break;
  }
  
  return filtered;
}

function applyFiltersAndRender() {
  const filteredMovies = getFilteredAndSortedMovies();
  renderMovies(filteredMovies);
  renderContinueWatching(filteredMovies);
  updateMovieCount(filteredMovies.length);
}

function renderDirectoryPills() {
  if (directories.length <= 1) {
    directoryPills.classList.add('hidden');
    return;
  }
  
  directoryPills.classList.remove('hidden');
  directoryPills.innerHTML = '';
  
  directories.forEach(dir => {
    const pill = document.createElement('div');
    pill.className = 'directory-pill';
    const dirName = dir.split('/').pop();
    pill.innerHTML = `
      <span class="dir-name" title="${dir}">📁 ${dirName}</span>
      <button class="remove-dir" title="Remove directory">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;
    
    pill.querySelector('.remove-dir').addEventListener('click', (e) => {
      e.stopPropagation();
      handleRemoveDirectory(dir);
    });
    
    directoryPills.appendChild(pill);
  });
}

function renderMovies(movieList) {
  movieGrid.innerHTML = '';
  
  if (movieList.length === 0) {
    movieGrid.innerHTML = '<p class="no-movies">No movies found</p>';
    return;
  }
  
  movieList.forEach(movie => {
    const card = createMovieCard(movie);
    movieGrid.appendChild(card);
  });
}

function renderContinueWatching(movieList) {
  const moviesInProgress = allProgress.filter(p => p.current_time > 0 && !p.completed);
  
  if (moviesInProgress.length === 0) {
    continueWatchingSection.classList.add('hidden');
    return;
  }
  
  continueWatchingSection.classList.remove('hidden');
  continueWatchingRow.innerHTML = '';
  
  moviesInProgress.forEach(progress => {
    const movie = movieList.find(m => m.path === progress.movie_path);
    if (movie) {
      const card = createMovieCard(movie, true);
      continueWatchingRow.appendChild(card);
    }
  });
}

function createMovieCard(movie, showProgress = false) {
  const card = document.createElement('div');
  card.className = 'movie-card';

  const progress = allProgress.find(p => p.movie_path === movie.path);
  const progressPercent = progress && progress.duration > 0
    ? (progress.current_time / progress.duration) * 100
    : 0;
  const isCompleted = progress && progress.completed;

  // thumbnailPath from cache is ALREADY a file:// URL from the main process
  const thumbnailPath = thumbnailCache.get(movie.id);
  const isLoading = thumbnailsLoading.has(movie.id);

  // Build poster style with gradient fallback
  // If thumbnail is available, layer it on top of the gradient as fallback
  let posterStyle = '';
  if (thumbnailPath) {
    // thumbnailPath is already a proper file:// URL from main process
    // Use double quotes to avoid issues with single quotes in Windows usernames (e.g. O'Connor)
    posterStyle = `background-image: url("${thumbnailPath}"), linear-gradient(135deg, #2c3e50 0%, #34495e 100%); background-size: cover, auto; background-position: center, center;`;
  }

  // Use 'poster-loading' instead of 'loading' to avoid CSS class collision
  card.innerHTML = `
    <div class="movie-poster ${!thumbnailPath ? 'poster-loading' : ''}" style="${posterStyle}" data-movie-id="${movie.id}">
      ${!thumbnailPath ? `
      <div class="poster-placeholder">
        ${isLoading ? `
          <div class="thumbnail-loading">
            <div class="spinner-small"></div>
          </div>
        ` : `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
            <line x1="7" y1="2" x2="7" y2="22"></line>
            <line x1="17" y1="2" x2="17" y2="22"></line>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <line x1="2" y1="7" x2="7" y2="7"></line>
            <line x1="2" y1="17" x2="7" y2="17"></line>
            <line x1="17" y1="17" x2="22" y2="17"></line>
            <line x1="17" y1="7" x2="22" y2="7"></line>
          </svg>
        `}
      </div>
      ` : ''}
      <div class="play-overlay">
        <svg viewBox="0 0 24 24" fill="white">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      </div>
      ${isCompleted ? '<div class="completed-badge">✓ Watched</div>' : ''}
    </div>
    <div class="movie-info-card">
      <div class="movie-title" title="${movie.name}">${movie.name}</div>
      <div class="movie-meta">
        <span>${formatFileSize(movie.size)}</span>
        ${movie.duration ? `<span class="movie-duration">⏱ ${formatDuration(movie.duration)}</span>` : ''}
      </div>
      ${showProgress || progressPercent > 0 ? `
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progressPercent}%"></div>
          <button class="reset-progress-btn" data-movie-path="${movie.path}" title="Reset progress">
            ×
          </button>
        </div>
        <div class="progress-text">${formatTime(progress.current_time)} / ${formatTime(progress.duration)}</div>
      ` : ''}
    </div>
  `;
  
  card.addEventListener('click', () => openMovie(movie));
  
  // Register for lazy thumbnail loading with Intersection Observer
  if (ffmpegAvailable && !thumbnailPath && !thumbnailsLoading.has(movie.id)) {
    const posterElement = card.querySelector('.movie-poster');
    if (posterElement) {
      observedElements.set(movie.id, { movie, posterElement });
      if (thumbnailObserver) {
        thumbnailObserver.observe(posterElement);
      }
    }
  }
  
  return card;
}

async function loadThumbnailForMovie(movie) {
  if (!ffmpegAvailable || thumbnailCache.has(movie.id) || thumbnailsLoading.has(movie.id)) {
    return;
  }

  thumbnailsLoading.add(movie.id);

  try {
    const result = await window.electronAPI.generateThumbnail(movie.path);
    if (result.success && result.thumbnailPath) {
      thumbnailCache.set(movie.id, result.thumbnailPath);

      // Update the movie card with the new thumbnail
      // The main process already provides a proper file:// URL
      updateMovieCardThumbnail(movie.id, result.thumbnailPath);
    }
  } catch (error) {
    console.error(`Failed to generate thumbnail for ${movie.name}:`, error);
  } finally {
    thumbnailsLoading.delete(movie.id);
  }
}

function setupThumbnailObserver() {
  // Disconnect existing observer if any
  if (thumbnailObserver) {
    thumbnailObserver.disconnect();
  }
  
  // Create new Intersection Observer
  thumbnailObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Element is visible, find the corresponding movie and load thumbnail
        const movieId = entry.target.dataset.movieId;
        if (movieId && observedElements.has(movieId)) {
          const { movie } = observedElements.get(movieId);
          loadThumbnailForMovie(movie);
          // Stop observing once thumbnail is loading
          thumbnailObserver.unobserve(entry.target);
        }
      }
    });
  }, {
    // Trigger when element is 10% visible (starts loading before fully visible)
    threshold: 0.1,
    // Preload slightly outside viewport for smoother scrolling
    rootMargin: '100px'
  });
}

function updateMovieCardThumbnail(movieId, thumbnailPath) {
  const posterElements = document.querySelectorAll(`.movie-poster[data-movie-id="${movieId}"]`);

  posterElements.forEach(poster => {
    // thumbnailPath is already a proper file:// URL from main process
    // Layer thumbnail on top of gradient as fallback, use double quotes for paths with special chars
    poster.style.backgroundImage = `url("${thumbnailPath}"), linear-gradient(135deg, #2c3e50 0%, #34495e 100%)`;
    poster.style.backgroundSize = 'cover, auto';
    poster.style.backgroundPosition = 'center, center';
    // Remove the poster-loading class (not 'loading' which is the global spinner)
    poster.classList.remove('poster-loading');

    // Remove the placeholder SVG
    const placeholder = poster.querySelector('.poster-placeholder');
    if (placeholder) {
      placeholder.remove();
    }
  });
}

async function openMovie(movie) {
  currentMovie = movie;
  playerMovieTitle.textContent = movie.name;
  
  // Check if there's saved progress
  const progress = await window.electronAPI.getProgress(movie.path);
  
  // Show resume prompt if there's meaningful progress (> 30 seconds and not completed)
  if (progress && progress.current_time > 30 && !progress.completed) {
    pendingMovie = movie;
    resumeMessage.textContent = `You left off at ${formatTime(progress.current_time)}`;
    resumeModal.classList.remove('hidden');
    return;
  }
  
  // No progress, start playing from beginning
  playMovie(movie, 0);
}

function handleResumePlay() {
  if (pendingMovie) {
    resumeModal.classList.add('hidden');
    const progress = allProgress.find(p => p.movie_path === pendingMovie.path);
    const startTime = progress ? progress.current_time : 0;
    playMovie(pendingMovie, startTime);
    pendingMovie = null;
  }
}

function handleStartOver() {
  if (pendingMovie) {
    resumeModal.classList.add('hidden');
    playMovie(pendingMovie, 0);
    pendingMovie = null;
  }
}

function playMovie(movie, startTime) {
  currentMovie = movie;

  // Set video source using cross-platform file URL
  window.electronAPI.pathToUrl(movie.path).then(fileUrl => {
    videoPlayer.src = fileUrl;

    // Set start time
    if (startTime > 0) {
      videoPlayer.addEventListener('loadedmetadata', function onMetadata() {
        videoPlayer.currentTime = startTime;
        videoPlayer.removeEventListener('loadedmetadata', onMetadata);
      });
    }

    playerModal.classList.remove('hidden');
    videoPlayer.play();
  });
}

function closePlayerModal() {
  // Save progress before closing
  if (currentMovie && videoPlayer.currentTime > 0) {
    saveMovieProgress(videoPlayer.currentTime, videoPlayer.duration || 0);
  }

  videoPlayer.pause();
  videoPlayer.src = '';
  playerModal.classList.add('hidden');
  currentMovie = null;

  // Refresh movie grid to show updated progress
  if (directories.length > 0) {
    loadMovies();
  }
}

function handleTimeUpdate() {
  if (currentMovie) {
    saveMovieProgress(videoPlayer.currentTime, videoPlayer.duration || 0);
  }
}

function handleMetadataLoaded() {
  // Load initial progress if available
  if (currentMovie) {
    window.electronAPI.getProgress(currentMovie.path).then(progress => {
      if (progress && progress.current_time > 0) {
        videoPlayer.currentTime = progress.current_time;
      }
    });
  }
}

function handleVideoEnded() {
  if (currentMovie) {
    // Mark as completed
    saveMovieProgress(videoPlayer.duration, videoPlayer.duration);
  }
}

async function saveMovieProgress(currentTime, duration) {
  await window.electronAPI.saveProgress(currentMovie.path, currentTime, duration);
  
  // Update local progress cache immediately
  const existingIndex = allProgress.findIndex(p => p.movie_path === currentMovie.path);
  const completed = duration > 0 && (currentTime / duration) >= 0.9;
  
  const progressEntry = {
    movie_path: currentMovie.path,
    movie_name: currentMovie.name,
    current_time: currentTime,
    duration: duration,
    last_watched: new Date().toISOString(),
    completed: completed ? 1 : 0
  };
  
  if (existingIndex >= 0) {
    allProgress[existingIndex] = { ...allProgress[existingIndex], ...progressEntry };
  } else {
    allProgress.unshift(progressEntry);
  }
  
  // Re-render to show updated progress
  applyFiltersAndRender();
}

async function markAsWatched() {
  if (currentMovie) {
    await window.electronAPI.saveProgress(
      currentMovie.path, 
      videoPlayer.duration, 
      videoPlayer.duration
    );
    closePlayerModal();
  }
}

function updateMovieCount(count = movies.length) {
  movieCount.textContent = `${count} movie${count !== 1 ? 's' : ''}`;
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '0m';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function showLoading() {
  loading.classList.remove('hidden');
}

function hideLoading() {
  loading.classList.add('hidden');
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Don't trigger shortcuts when typing in inputs
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  
  if (e.key === 'Escape') {
    if (!playerModal.classList.contains('hidden')) {
      closePlayerModal();
    } else if (!shortcutsModal.classList.contains('hidden')) {
      toggleShortcutsModal();
    } else if (!resumeModal.classList.contains('hidden')) {
      resumeModal.classList.add('hidden');
      pendingMovie = null;
    }
    return;
  }
  
  // Toggle shortcuts modal with ?
  if (e.key === '?' && !playerModal.classList.contains('hidden')) {
    e.preventDefault();
    toggleShortcutsModal();
    return;
  }
  
  // Only handle player shortcuts when player is open
  if (!playerModal.classList.contains('hidden')) {
    // Prevent default for these keys
    if (['Space', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      e.preventDefault();
    }
    
    // Space for play/pause
    if (e.code === 'Space') {
      if (videoPlayer.paused) {
        videoPlayer.play();
      } else {
        videoPlayer.pause();
      }
      return;
    }
    
    // Arrow keys for seeking
    if (e.code === 'ArrowLeft') {
      const seekTime = e.shiftKey ? 30 : 10;
      videoPlayer.currentTime = Math.max(0, videoPlayer.currentTime - seekTime);
      return;
    }
    
    if (e.code === 'ArrowRight') {
      const seekTime = e.shiftKey ? 30 : 10;
      videoPlayer.currentTime = Math.min(videoPlayer.duration, videoPlayer.currentTime + seekTime);
      return;
    }
    
    // Playback speed shortcuts (1-4)
    if (e.key >= '1' && e.key <= '4') {
      const speedMap = { '1': 1, '2': 1.25, '3': 1.5, '4': 2 };
      setPlaybackSpeed(speedMap[e.key]);
      return;
    }
  }
  
  // Refresh movies with R (works even when player is closed)
  if (e.key === 'r' || e.key === 'R') {
    refreshMovies();
    return;
  }
});

// Playback speed control
function setPlaybackSpeed(speed) {
  videoPlayer.playbackRate = speed;
  
  // Update button states
  speedBtns.forEach(btn => {
    const btnSpeed = parseFloat(btn.dataset.speed);
    if (btnSpeed === speed) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

async function handleResetProgressClick(e) {
  const resetBtn = e.target.closest('.reset-progress-btn');
  if (!resetBtn) return;
  
  e.stopPropagation();
  
  const moviePath = resetBtn.dataset.moviePath;
  if (!moviePath) return;
  
  await window.electronAPI.resetProgress(moviePath);
  
  // Refresh the view
  await loadMovies();
}

// Toggle shortcuts modal
function toggleShortcutsModal() {
  shortcutsModal.classList.toggle('hidden');
}
