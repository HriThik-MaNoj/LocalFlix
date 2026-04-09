const { exec, spawn } = require('child_process');
const fs = require('fs');
const fsPromises = require('fs').promises;
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
      await fsPromises.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      console.error('Error creating thumbnail cache directory:', error.message);
    }
  }

  /**
   * Execute a command using spawn (more reliable than exec for paths with special characters)
   * On Windows, avoids cmd.exe parsing issues with %, ^, ! in paths
   */
  _runCommand(command, args, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        windowsHide: true,
        timeout,
        // On Windows, don't use shell to avoid cmd.exe special char issues
        shell: false
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => { stdout += data.toString(); });
      child.stderr.on('data', (data) => { stderr += data.toString(); });

      child.on('error', (err) => {
        reject(err);
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        }
      });

      child.on('timeout', () => {
        child.kill();
        reject(new Error('Command timed out'));
      });
    });
  }

  /**
   * Run ffprobe to get video duration
   */
  _getDuration(videoPath) {
    const args = [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      videoPath
    ];
    return this._runCommand('ffprobe', args, 10000);
  }

  /**
   * Extract a frame from video using ffmpeg
   */
  _extractFrameWithSpawn(videoPath, outputPath, timestamp) {
    const args = [
      '-ss', timestamp.toString(),
      '-i', videoPath,
      '-vframes', '1',
      '-vf', 'scale=480:270:force_original_aspect_ratio=decrease,pad=480:270:(ow-iw)/2:(oh-ih)/2:black',
      '-y',
      '-q:v', '5',
      outputPath
    ];
    return this._runCommand('ffmpeg', args, 30000);
  }

  /**
   * Fallback: extract frame with input seeking (slower but more compatible)
   */
  _extractFrameFallbackWithSpawn(videoPath, outputPath, timestamp) {
    const args = [
      '-i', videoPath,
      '-ss', timestamp.toString(),
      '-vframes', '1',
      '-q:v', '5',
      outputPath
    ];
    return this._runCommand('ffmpeg', args, 30000);
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
      await fsPromises.access(thumbnailPath);
      return thumbnailPath;
    } catch {
      // Thumbnail doesn't exist, generate it
    }

    try {
      // Get video duration using spawn (avoids cmd.exe issues on Windows)
      const { stdout } = await this._getDuration(videoPath);
      const duration = parseFloat(stdout);
      const dur = isNaN(duration) ? null : duration;

      // If no timestamp specified, use 10% into the video (or 5 seconds for short videos)
      if (timestamp === null) {
        timestamp = dur ? Math.max(5, dur * 0.1) : 5;
      }

      // Generate thumbnail using spawn
      await this._extractFrameWithSpawn(videoPath, thumbnailPath, timestamp);

      return thumbnailPath;
    } catch (error) {
      // Try fallback method
      try {
        const { stdout } = await this._getDuration(videoPath);
        const duration = parseFloat(stdout);
        const dur = isNaN(duration) ? null : duration;
        const ts = timestamp || (dur ? Math.max(5, dur * 0.1) : 5);

        await this._extractFrameFallbackWithSpawn(videoPath, thumbnailPath, ts);
        return thumbnailPath;
      } catch (fallbackError) {
        console.error(`Error generating thumbnail for ${videoPath}:`, error.message);
        return null;
      }
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
   * Generate a stable hash for the video file based on path + modification time.
   * Uses mtime so the same file always produces the same thumbnail cache key,
   * but if the file is replaced the cache key changes.
   */
  _generateHash(videoPath) {
    try {
      // Use file modification time for stable hashing
      const stats = require('fs').statSync(videoPath);
      const mtime = stats.mtimeMs.toString();
      const str = videoPath + '|' + mtime;

      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(36);
    } catch {
      // Fallback: hash based on path only
      let hash = 0;
      for (let i = 0; i < videoPath.length; i++) {
        const char = videoPath.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(36);
    }
  }

  /**
   * Clear all cached thumbnails
   */
  async clearCache() {
    try {
      const files = await fsPromises.readdir(this.cacheDir);
      for (const file of files) {
        await fsPromises.unlink(path.join(this.cacheDir, file));
      }
    } catch (error) {
      console.error('Error clearing thumbnail cache:', error.message);
    }
  }

  /**
   * Check if ffmpeg is available using spawn (avoids cmd.exe issues)
   */
  static async isFfmpegAvailable() {
    return new Promise((resolve) => {
      const child = spawn('ffmpeg', ['-version'], {
        windowsHide: true,
        timeout: 5000,
        shell: false
      });

      child.on('error', () => resolve(false));
      child.on('close', (code) => resolve(code === 0));
      child.on('spawn', () => {
        // Successfully spawned - ffmpeg exists
        child.kill();
        resolve(true);
      });
    });
  }
}

module.exports = ThumbnailGenerator;
