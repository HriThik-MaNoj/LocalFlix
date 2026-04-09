const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');

class MovieScanner {
  constructor() {
    this.videoExtensions = new Set([
      '.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', 
      '.webm', '.m4v', '.mpg', '.mpeg', '.3gp', '.ogv'
    ]);
  }

  async scanDirectory(directoryPath) {
    const movies = [];
    await this._scanRecursive(directoryPath, movies);
    return movies;
  }

  async _scanRecursive(dirPath, movies) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          // Skip hidden directories and common non-media folders
          if (!entry.name.startsWith('.') && 
              !['node_modules', '.git', '__pycache__'].includes(entry.name)) {
            await this._scanRecursive(fullPath, movies);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (this.videoExtensions.has(ext)) {
            const stats = await fs.stat(fullPath);
            const duration = await this._getVideoDuration(fullPath);
            movies.push({
              id: this._generateId(fullPath),
              path: fullPath,
              name: this._parseMovieName(entry.name),
              fileName: entry.name,
              size: stats.size,
              modified: stats.mtime,
              extension: ext,
              duration: duration
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dirPath}:`, error.message);
    }
  }

  _getVideoDuration(videoPath) {
    return new Promise((resolve) => {
      // Escape quotes in path for Windows compatibility
      const escapedPath = videoPath.replace(/"/g, '\\"');
      const command = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${escapedPath}"`;

      exec(command, { timeout: 5000, windowsHide: true }, (error, stdout) => {
        if (error) {
          resolve(null);
          return;
        }

        const duration = parseFloat(stdout.trim());
        resolve(isNaN(duration) ? null : duration);
      });
    });
  }

  _parseMovieName(fileName) {
    // Remove extension and clean up name
    return fileName
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[._]/g, ' ') // Replace dots and underscores with spaces
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .trim();
  }

  _generateId(filePath) {
    // Simple hash-based ID from file path
    let hash = 0;
    for (let i = 0; i < filePath.length; i++) {
      const char = filePath.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

module.exports = MovieScanner;
