const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  getSavedDirectory: () => ipcRenderer.invoke('get-saved-directory'),
  getDirectories: () => ipcRenderer.invoke('get-directories'),
  addDirectory: (directory) => ipcRenderer.invoke('add-directory', directory),
  removeDirectory: (directory) => ipcRenderer.invoke('remove-directory', directory),
  scanMovies: (directories) => ipcRenderer.invoke('scan-movies', directories),
  getProgress: (moviePath) => ipcRenderer.invoke('get-progress', moviePath),
  saveProgress: (moviePath, currentTime, duration) =>
    ipcRenderer.invoke('save-progress', moviePath, currentTime, duration),
  resetProgress: (moviePath) => ipcRenderer.invoke('reset-progress', moviePath),
  getAllProgress: () => ipcRenderer.invoke('get-all-progress'),
  generateThumbnail: (videoPath) => ipcRenderer.invoke('generate-thumbnail', videoPath),
  checkFfmpeg: () => ipcRenderer.invoke('check-ffmpeg'),
  pathToUrl: (filePath) => ipcRenderer.invoke('path-to-url', filePath)
});
