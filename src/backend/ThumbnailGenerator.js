const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { app } = require('electron');

class ThumbnailGenerator {
  constructor() {
    this.cacheDir = path.join(app.getPath('userData'), 'thumbnails');
    this.isWindows = process.platform === 'win32';
    this._initializeCache();
  }

  async _initializeCache() {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      console.error('Error creating thumbnail cache directory:', error.message);
    }
  }

  /**
   * Generate thumbnail for a video file
   * @param {string} videoPath - Path to the video file
   * @param {number} timestamp - Timestamp in seconds to extract frame (default: 10% of duration)
   * @returns {Promise<string|null>} - Path to generated thumbnail or null if failed
   */
  async generateThumbnail(videoPath, timestamp = null) {
    const thumbnailPath = this._getThumbnailPath(videoPath);

    // Check if thumbnail already exists in cache
    try {
      await fs.access(thumbnailPath);
      return thumbnailPath;
    } catch {
      // Thumbnail doesn't exist, generate it
    }

    try {
      // First, try to get video duration
      const duration = await this._getVideoDuration(videoPath);

      // If no timestamp specified, use 10% into the video (or 5 seconds for short videos)
      if (timestamp === null) {
        timestamp = duration ? Math.max(5, duration * 0.1) : 5;
      }

      // Generate thumbnail using ffmpeg
      await this._extractFrame(videoPath, thumbnailPath, timestamp);

      return thumbnailPath;
    } catch (error) {
      console.error(`Error generating thumbnail for ${videoPath}:`, error.message);
      return null;
    }
  }

  /**
   * Get cached thumbnail path
   */
  _getThumbnailPath(videoPath) {
    // Create a hash from the video path and modification time
    const hash = this._generateHash(videoPath);
    return path.join(this.cacheDir, `${hash}.jpg`);
  }

  /**
   * Generate a unique hash for the video file
   */
  _generateHash(videoPath) {
    let hash = 0;
    const str = videoPath + Date.now(); // Include path for uniqueness
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get video duration using ffprobe
   */
  _getVideoDuration(videoPath) {
    return new Promise((resolve, reject) => {
      // Cross-platform path escaping
      const escapedPath = this.isWindows
        ? `"${videoPath}"`
        : `"${videoPath.replace(/\\/g, '/')}"`;

      // Cross-platform stderr redirection
      const stderrRedirect = this.isWindows ? '2>nul' : '2>/dev/null';
      const command = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${escapedPath} ${stderrRedirect}`;

      exec(command, { timeout: 10000, windowsHide: true }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`ffprobe error: ${error.message}`));
          return;
        }

        const duration = parseFloat(stdout.trim());
        resolve(isNaN(duration) ? null : duration);
      });
    });
  }

  /**
   * Extract a frame from the video at the specified timestamp
   */
  _extractFrame(videoPath, outputPath, timestamp) {
    return new Promise((resolve, reject) => {
      // Cross-platform path escaping
      const escapedInput = this.isWindows
        ? `"${videoPath}"`
        : `"${videoPath.replace(/\\/g, '/')}"`;

      const escapedOutput = this.isWindows
        ? `"${outputPath}"`
        : `"${outputPath.replace(/\\/g, '/')}"`;

      // Cross-platform stderr redirection
      const stderrRedirect = this.isWindows ? '2>nul' : '2>/dev/null';

      // Use ffmpeg to extract a single frame with better compatibility
      const command = `ffmpeg -ss ${timestamp} -i ${escapedInput} -vframes 1 -vf "scale=480:270:force_original_aspect_ratio=decrease,pad=480:270:(ow-iw)/2:(oh-ih)/2:black" -y -q:v 5 ${escapedOutput} ${stderrRedirect}`;

      exec(command, { timeout: 30000, maxBuffer: 1024 * 1024 * 10, windowsHide: true }, (error, stdout, stderr) => {
        if (error) {
          // Try fallback method with keyframe seeking
          this._extractFrameFallback(videoPath, outputPath, timestamp)
            .then(resolve)
            .catch(() => reject(new Error('Failed to extract frame')));
          return;
        }

        resolve(outputPath);
      });
    });
  }

  /**
   * Fallback method using input seeking (slower but more compatible)
   */
  _extractFrameFallback(videoPath, outputPath, timestamp) {
    return new Promise((resolve, reject) => {
      // Cross-platform path escaping
      const escapedInput = this.isWindows
        ? `"${videoPath}"`
        : `"${videoPath.replace(/\\/g, '/')}"`;

      const escapedOutput = this.isWindows
        ? `"${outputPath}"`
        : `"${outputPath.replace(/\\/g, '/')}"`;

      // Cross-platform stderr redirection
      const stderrRedirect = this.isWindows ? '2>nul' : '2>/dev/null';

      const command = `ffmpeg -i ${escapedInput} -ss ${timestamp} -vframes 1 -q:v 5 ${escapedOutput} ${stderrRedirect}`;

      exec(command, { timeout: 30000, maxBuffer: 1024 * 1024 * 10, windowsHide: true }, (error) => {
        if (error) {
          reject(new Error('Fallback extraction failed'));
          return;
        }
        resolve(outputPath);
      });
    });
  }

  /**
   * Clear all cached thumbnails
   */
  async clearCache() {
    try {
      const files = await fs.readdir(this.cacheDir);
      for (const file of files) {
        await fs.unlink(path.join(this.cacheDir, file));
      }
    } catch (error) {
      console.error('Error clearing thumbnail cache:', error.message);
    }
  }

  /**
   * Check if ffmpeg is available
   */
  static async isFfmpegAvailable() {
    return new Promise((resolve) => {
      // Cross-platform check: try 'where' on Windows, 'which' on Linux
      const command = process.platform === 'win32' ? 'where ffmpeg' : 'which ffmpeg';

      exec(command, { windowsHide: true }, (error) => {
        if (!error) {
          resolve(true);
          return;
        }

        // Fallback: try running ffmpeg directly
        exec('ffmpeg -version', { timeout: 5000, windowsHide: true }, (err) => {
          resolve(!err);
        });
      });
    });
  }
}

module.exports = ThumbnailGenerator;
