const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

class ProgressTracker {
  constructor() {
    const dbPath = path.join(app.getPath('userData'), 'localflix.db');
    this.db = new Database(dbPath);
    this._initializeDatabase();
  }

  _initializeDatabase() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS movie_progress (
        movie_path TEXT PRIMARY KEY,
        movie_name TEXT NOT NULL,
        current_time REAL DEFAULT 0,
        duration REAL DEFAULT 0,
        last_watched DATETIME DEFAULT CURRENT_TIMESTAMP,
        watch_count INTEGER DEFAULT 0,
        completed BOOLEAN DEFAULT 0
      );
      
      CREATE INDEX IF NOT EXISTS idx_last_watched 
      ON movie_progress(last_watched);
    `);
  }

  saveProgress(moviePath, currentTime, duration) {
    const stmt = this.db.prepare(`
      INSERT INTO movie_progress (movie_path, movie_name, current_time, duration, last_watched, watch_count, completed)
      VALUES (@moviePath, @movieName, @currentTime, @duration, CURRENT_TIMESTAMP, 1, @completed)
      ON CONFLICT(movie_path) DO UPDATE SET
        current_time = @currentTime,
        duration = @duration,
        last_watched = CURRENT_TIMESTAMP,
        watch_count = watch_count + 1,
        completed = @completed
    `);

    const movieName = moviePath.split(path.sep).pop().replace(/\.[^/.]+$/, '');
    const completed = duration > 0 && (currentTime / duration) >= 0.9;

    stmt.run({
      moviePath,
      movieName,
      currentTime,
      duration,
      completed: completed ? 1 : 0
    });
  }

  getProgress(moviePath) {
    const stmt = this.db.prepare(
      'SELECT * FROM movie_progress WHERE movie_path = ?'
    );
    return stmt.get(moviePath) || null;
  }

  getAllProgress() {
    const stmt = this.db.prepare(
      'SELECT * FROM movie_progress ORDER BY last_watched DESC'
    );
    return stmt.all();
  }

  resetProgress(moviePath) {
    const stmt = this.db.prepare(
      'DELETE FROM movie_progress WHERE movie_path = ?'
    );
    stmt.run(moviePath);
  }

  close() {
    this.db.close();
  }
}

module.exports = ProgressTracker;
