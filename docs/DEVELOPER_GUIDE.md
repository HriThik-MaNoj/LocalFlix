# LocalFlix Developer Guide

This guide is for developers who want to understand, modify, or extend LocalFlix.

---

## ️ Development Environment Setup

### Prerequisites

- **Node.js** v16+ (v22 recommended)
- **npm** (comes with Node.js)
- **Git**
- **ffmpeg** (optional but recommended)
- **Code Editor** (VS Code recommended)

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/HriThik-MaNoj/LocalFlix.git
cd LocalFlix

# Install dependencies
npm install

# Rebuild native modules for Electron
npm rebuild better-sqlite3 --runtime=electron --target=28.0.0 \
  --disturl=https://electronjs.org/headers --build-from-source

# Verify installation
npm run dev
```

### VS Code Configuration

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "javascript.updateImportsOnFileMove.enabled": "always"
}
```

Recommended extensions:
- ESLint
- Prettier
- GitLens
- Thunder Client (for testing APIs)

---

## 📁 Project Structure Deep Dive

### Main Process (`main.js`)

**Entry Point:** The main process is the first thing that runs

**Key Sections:**
```javascript
// 1. Imports
const { app, BrowserWindow, ipcMain, dialog } = require('electron');

// 2. Backend module initialization
const scanner = new MovieScanner();
const tracker = new ProgressTracker();
const thumbnailGenerator = new ThumbnailGenerator();
const settingsManager = new SettingsManager();

// 3. Window creation
function createWindow() {
  mainWindow = new BrowserWindow({
    // Configuration...
  });
}

// 4. IPC handlers
ipcMain.handle('scan-movies', async (event, directories) => {
  // Implementation...
});
```

**Adding New IPC Handlers:**

```javascript
// In main.js
ipcMain.handle('my-new-feature', async (event, param) => {
  try {
    // Your logic here
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// In preload.js
contextBridge.exposeInMainWorld('electronAPI', {
  // ...existing APIs...
  myNewFeature: (param) => ipcRenderer.invoke('my-new-feature', param)
});

// In frontend (app.js)
const result = await window.electronAPI.myNewFeature(param);
```

### Frontend Architecture (`src/frontend/app.js`)

**State Management:**

```javascript
// Global state (simple for current scale)
let movies = [];              // All scanned movies
let allProgress = [];         // Viewing progress
let directories = [];         // Added directories
let currentMovie = null;      // Currently playing movie
let thumbnailCache = new Map(); // In-memory thumbnail cache
```

**Event Flow:**

```
User Action → Event Handler → IPC Call → Main Process → Response → UI Update
```

**Adding New UI Features:**

1. Add HTML to `index.html`
2. Style in `main.css`
3. Add event listeners in `app.js`
4. Add IPC handler in `main.js` and `preload.js`

### Backend Modules

#### MovieScanner

**Extending with new formats:**

```javascript
// In MovieScanner constructor
this.videoExtensions = new Set([
  '.mp4', '.mkv', '.avi',
  // Add new format here:
  '.newformat'
]);
```

**Adding metadata extraction:**

```javascript
async _scanRecursive(dirPath, movies) {
  // ...existing code...
  
  // Add metadata extraction
  const metadata = await this._extractMetadata(fullPath);
  
  movies.push({
    // ...existing fields...
    metadata: metadata
  });
}

async _extractMetadata(videoPath) {
  // Use ffprobe to get metadata
  const command = `ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`;
  // Parse and return
}
```

#### ProgressTracker

**Adding new tracked fields:**

```javascript
// 1. Update database schema
_initializeDatabase() {
  this.db.exec(`
    CREATE TABLE IF NOT EXISTS movie_progress (
      // ...existing columns...
      rating INTEGER DEFAULT 0,  // New field
      notes TEXT DEFAULT ''      // New field
    );
  `);
  
  // Add index if needed
  this.db.exec(`
    CREATE INDEX IF NOT EXISTS idx_rating
    ON movie_progress(rating);
  `);
}

// 2. Update save method
saveProgress(moviePath, currentTime, duration, rating = 0) {
  const stmt = this.db.prepare(`
    INSERT INTO movie_progress (...)
    VALUES (@moviePath, ..., @rating)
    ON CONFLICT(movie_path) DO UPDATE SET
      // ...existing updates...
      rating = @rating
  `);
  
  stmt.run({ moviePath, currentTime, duration, rating });
}

// 3. Add IPC handler in main.js
ipcMain.handle('rate-movie', async (event, moviePath, rating) => {
  // Implementation
});
```

#### ThumbnailGenerator

**Customizing thumbnail size:**

```javascript
// In _extractFrame()
const command = `ffmpeg -ss ${timestamp} -i "${videoPath}" \
  -vframes 1 \
  -vf "scale=640:360:force_original_aspect_ratio=decrease,pad=640:360:(ow-iw)/2:(oh-ih)/2:black" \
  -y -q:v 5 "${outputPath}"`;
```

**Adding watermark:**

```javascript
_extractFrame(videoPath, outputPath, timestamp) {
  const watermarkPath = path.join(__dirname, 'watermark.png');
  const command = `ffmpeg -ss ${timestamp} -i "${videoPath}" \
    -i "${watermarkPath}" \
    -filter_complex "overlay=10:10" \
    -vframes 1 -y "${outputPath}"`;
  // ...
}
```

---

## 🧪 Testing Guide

### Manual Testing Checklist

```markdown
## Core Functionality
- [ ] App launches without errors
- [ ] Welcome screen displays correctly
- [ ] Directory selection works
- [ ] Movies are scanned and displayed
- [ ] Thumbnails generate (with ffmpeg)
- [ ] Video playback works
- [ ] Progress saves and loads
- [ ] Search filters correctly
- [ ] Sort options work
- [ ] Keyboard shortcuts function

## Edge Cases
- [ ] Empty directory
- [ ] Directory with no videos
- [ ] Very large directory (1000+ files)
- [ ] Files with special characters
- [ ] Very long filenames
- [ ] Corrupted video files
- [ ] Missing ffmpeg
- [ ] No write permissions

## Cross-Platform
- [ ] Works on Linux
- [ ] Works on Windows
- [ ] Paths handled correctly on both
- [ ] UI looks good on both
```

### Debugging Tips

**Enable verbose logging:**

```javascript
// In main.js
app.whenReady().then(() => {
  // Add debug logging
  if (process.argv.includes('--dev')) {
    console.log('=== DEBUG MODE ===');
    console.log('Platform:', process.platform);
    console.log('AppData:', app.getPath('userData'));
  }
});
```

**Debug IPC communication:**

```javascript
// Add logging to IPC handlers
ipcMain.handle('scan-movies', async (event, directories) => {
  console.log('[IPC] scan-movies called with:', directories);
  const result = await scanner.scanDirectory(directories[0]);
  console.log('[IPC] scan-movies returning:', result.length, 'movies');
  return result;
});
```

**Debug renderer process:**

```javascript
// In app.js, add console logs
async function loadMovies() {
  console.log('[Frontend] loadMovies called');
  console.log('[Frontend] directories:', directories);
  
  const result = await window.electronAPI.scanMovies(directories);
  console.log('[Frontend] scan result:', result);
  
  // ...rest of code...
}
```

---

## 🔧 Common Modifications

### Changing the Theme

**Edit:** `src/frontend/styles/main.css`

```css
:root {
  --bg-primary: #0f0f0f;      /* Main background */
  --bg-secondary: #1a1a1a;    /* Card background */
  --bg-tertiary: #252525;     /* Hover states */
  --text-primary: #ffffff;    /* Main text */
  --text-secondary: #a0a0a0;  /* Secondary text */
  --accent: #e50914;          /* Netflix red */
  --accent-hover: #f40612;    /* Hover color */
  --success: #46d369;         /* Success/green */
}
```

**Example: Blue theme**

```css
:root {
  --accent: #0080ff;
  --accent-hover: #0066cc;
  --bg-primary: #0a1628;
  --bg-secondary: #132238;
}
```

### Adding a New Video Format

**Edit:** `src/backend/MovieScanner.js`

```javascript
constructor() {
  this.videoExtensions = new Set([
    '.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv',
    '.webm', '.m4v', '.mpg', '.mpeg', '.3gp', '.ogv',
    // Add new format:
    '.ts'  // MPEG transport stream
  ]);
}
```

**Also update:**
- `package.json` → `build.linux.mimeTypes`
- `build/localflix.desktop` → `MimeType`
- `README.md` → Supported formats section

### Adding Keyboard Shortcuts

**Edit:** `src/frontend/app.js`

```javascript
document.addEventListener('keydown', (e) => {
  // ...existing shortcuts...
  
  // Add new shortcut
  if (e.key === 'm' || e.key === 'M') {
    if (!playerModal.classList.contains('hidden')) {
      toggleMute();
    }
  }
});

// Add to shortcuts modal HTML
<div class="shortcut-item">
  <div class="shortcut-keys">
    <kbd>M</kbd>
  </div>
  <div class="shortcut-desc">Mute / Unmute</div>
</div>
```

---

## 📦 Building and Packaging

### Development Build

```bash
# Quick build for testing
npm run build:linux

# Test the AppImage
./dist/LocalFlix-*.AppImage

# Test the .deb package
sudo dpkg -i dist/LocalFlix-*.deb
```

### Production Build

```bash
# Set version in package.json
# Update CHANGELOG.md
# Commit changes

# Create tag
git tag v1.1.0
git push origin v1.1.0

# GitHub Actions will automatically build and release
```

### Adding New Build Target

**Edit:** `package.json`

```json
{
  "build": {
    "linux": {
      "target": [
        "AppImage",
        "deb",
        "rpm",
        "snap",
        "flatpak"  // Add new target
      ]
    }
  }
}
```

---

## 🚀 Deployment

### GitHub Releases (Automated)

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Commit and push
4. Create tag: `git tag v1.0.0`
5. Push tag: `git push origin v1.0.0`
6. GitHub Actions builds all packages
7. Download artifacts from Actions tab
8. Attach to GitHub Release

### Manual Distribution

```bash
# Build packages
npm run build:all

# Distribute files from dist/
# - LocalFlix-*.AppImage (Linux portable)
# - LocalFlix-*.deb (Debian/Ubuntu)
# - LocalFlix-Setup-*.exe (Windows installer)
# - LocalFlix-Portable-*.exe (Windows portable)
```

---

## 📚 Additional Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [electron-builder Documentation](https://www.electron.build/)
- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3)
- [ffmpeg Documentation](https://ffmpeg.org/documentation.html)
- [MDN Web Docs](https://developer.mozilla.org/)

---

**Happy coding! 🚀**
