const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const MovieScanner = require('./src/backend/MovieScanner');
const ProgressTracker = require('./src/backend/ProgressTracker');
const ThumbnailGenerator = require('./src/backend/ThumbnailGenerator');
const SettingsManager = require('./src/backend/SettingsManager');

let mainWindow;
let scanner;
let tracker;
let thumbnailGenerator;
let settingsManager;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    frame: true,
    backgroundColor: '#141414',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('src/frontend/index.html');
  
  // Remove default menu
  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  settingsManager = new SettingsManager();
  scanner = new MovieScanner();
  tracker = new ProgressTracker();
  thumbnailGenerator = new ThumbnailGenerator();
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Movie Directory'
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    const directory = result.filePaths[0];
    // Save the selected directory to settings
    settingsManager.set('lastDirectory', directory);
    return directory;
  }
  return null;
});

ipcMain.handle('get-saved-directory', async () => {
  return settingsManager.get('lastDirectory');
});

ipcMain.handle('get-directories', async () => {
  return settingsManager.get('directories') || [];
});

ipcMain.handle('add-directory', async (event, directory) => {
  const dirs = settingsManager.get('directories') || [];
  if (!dirs.includes(directory)) {
    dirs.push(directory);
    settingsManager.set('directories', dirs);
  }
  return dirs;
});

ipcMain.handle('remove-directory', async (event, directory) => {
  let dirs = settingsManager.get('directories') || [];
  dirs = dirs.filter(d => d !== directory);
  settingsManager.set('directories', dirs);
  return dirs;
});

ipcMain.handle('scan-movies', async (event, directories) => {
  try {
    // Support both single directory (backward compat) and array of directories
    const dirArray = Array.isArray(directories) ? directories : [directories];
    const allMovies = [];
    
    for (const directory of dirArray) {
      const movies = await scanner.scanDirectory(directory);
      allMovies.push(...movies);
    }
    
    return { success: true, movies: allMovies };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-progress', async (event, moviePath) => {
  return tracker.getProgress(moviePath);
});

ipcMain.handle('save-progress', async (event, moviePath, currentTime, duration) => {
  tracker.saveProgress(moviePath, currentTime, duration);
  return { success: true };
});

ipcMain.handle('get-all-progress', async () => {
  return tracker.getAllProgress();
});

ipcMain.handle('generate-thumbnail', async (event, videoPath) => {
  try {
    const thumbnailPath = await thumbnailGenerator.generateThumbnail(videoPath);
    if (thumbnailPath) {
      // Convert to properly encoded file:// URL for cross-platform compatibility
      const normalizedPath = thumbnailPath.replace(/\\/g, '/');
      const fileUrl = process.platform === 'win32'
        ? 'file:///' + encodeURI(normalizedPath)
        : 'file://' + encodeURI(normalizedPath);
      return { success: true, thumbnailPath: fileUrl };
    }
    return { success: false, error: 'Failed to generate thumbnail' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('reset-progress', async (event, moviePath) => {
  try {
    tracker.resetProgress(moviePath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('check-ffmpeg', async () => {
  return await ThumbnailGenerator.isFfmpegAvailable();
});

ipcMain.handle('path-to-url', async (event, filePath) => {
  // Convert file path to properly encoded file:// URL for cross-platform compatibility
  const normalizedPath = filePath.replace(/\\/g, '/');
  if (process.platform === 'win32') {
    return 'file:///' + encodeURI(normalizedPath);
  }
  return 'file://' + encodeURI(normalizedPath);
});
