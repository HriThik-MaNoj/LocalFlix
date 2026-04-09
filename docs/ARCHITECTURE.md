# LocalFlix Architecture

This document provides a comprehensive overview of LocalFlix's architecture, design decisions, and technical implementation.

---

## 📐 System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        LocalFlix Application                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐         ┌──────────────────────────────┐  │
│  │  Main Process    │◄───────►│   Preload Script             │  │
│  │  (Node.js)       │   IPC   │   (Context Bridge)           │  │
│  │                  │         │                              │  │
│  │  • Window Mgmt   │         │  • Secure API exposure       │  │
│  │  • File System   │         │  • IPC method mapping        │  │
│  │  • Database      │         │                              │  │
│  │  • ffmpeg calls  │         │                              │  │
│  └────────┬─────────┘         └──────────┬───────────────────┘  │
│           │                              │                       │
│           │                              │                       │
│  ┌────────▼─────────┐         ┌──────────▼───────────────────┐  │
│  │  Backend Modules │         │   Renderer Process           │  │
│  │                  │         │   (Chromium)                 │  │
│  │  • MovieScanner  │         │                              │  │
│  │  • ProgressTrack │         │  • UI Components             │  │
│  │  • ThumbnailGen  │         │  • Event Handlers            │  │
│  │  • SettingsMgr   │         │  • State Management          │  │
│  └──────────────────┘         │  • Video Player              │  │
│                                └──────────────────────────────┘  │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                      External Dependencies                       │
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────  │
│  │  SQLite  │    │  ffmpeg  │    │ ffprobe  │    │  HTML5   │  │
│  │  (DB)    │    │(thumbs)  │    │(duration)│    │  Video   │  │
│  └──────────┘    └──────────┘    └──────────    └──────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture Layers

### 1. Main Process (Electron)

**Location:** `main.js`

**Responsibilities:**
- Application lifecycle management
- Window creation and configuration
- IPC (Inter-Process Communication) handler registration
- Security configuration (context isolation, node integration)

**Key Configuration:**
```javascript
{
  nodeIntegration: false,      // Security: No Node.js in renderer
  contextIsolation: true,      // Security: Isolated context
  preload: 'preload.js'        // Secure bridge
}
```

### 2. Preload Script

**Location:** `preload.js`

**Purpose:** Creates a secure bridge between main and renderer processes

**Mechanism:**
- Uses `contextBridge.exposeInMainWorld()` to expose APIs
- Only exposes necessary IPC methods
- Validates and sanitizes all data passing through

**Exposed APIs:**
```javascript
window.electronAPI = {
  selectDirectory, getSavedDirectory, getDirectories,
  addDirectory, removeDirectory, scanMovies,
  getProgress, saveProgress, resetProgress, getAllProgress,
  generateThumbnail, checkFfmpeg, pathToUrl
}
```

### 3. Backend Modules (Node.js)

#### 3.1 MovieScanner

**Location:** `src/backend/MovieScanner.js`

**Purpose:** Recursively scan directories for video files

**Features:**
- Recursive directory traversal
- Extension-based filtering (12 supported formats)
- Duration detection via ffprobe
- Filename parsing and cleanup
- Hash-based ID generation

**Flow:**
```
Input: Directory Path
  ↓
_readdir (recursive)
  ↓
Filter by extension
  ↓
Get file stats (size, modified)
  ↓
Get duration (ffprobe)
  ↓
Parse name (clean filename)
  ↓
Generate ID (hash)
  ↓
Output: Array of Movie Objects
```

#### 3.2 ProgressTracker

**Location:** `src/backend/ProgressTracker.js`

**Purpose:** Persist and retrieve movie viewing progress

**Database:** SQLite (better-sqlite3)

**Schema:**
```sql
CREATE TABLE movie_progress (
  movie_path TEXT PRIMARY KEY,
  movie_name TEXT NOT NULL,
  current_time REAL DEFAULT 0,
  duration REAL DEFAULT 0,
  last_watched DATETIME DEFAULT CURRENT_TIMESTAMP,
  watch_count INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT 0
);
```

**Features:**
- Auto-increment watch count
- Completion detection (90%+ threshold)
- Upsert on conflict (INSERT ... ON CONFLICT DO UPDATE)
- Indexed on last_watched for performance

#### 3.3 ThumbnailGenerator

**Location:** `src/backend/ThumbnailGenerator.js`

**Purpose:** Generate and cache video thumbnails

**Workflow:**
```
Video File
  ↓
Check cache (exists?)
  ↓ No
Get duration (ffprobe)
  ↓
Calculate timestamp (10% of duration)
  ↓
Extract frame (ffmpeg)
  ↓
Resize to 480x270
  ↓
Save as JPG in cache
  ↓
Return thumbnail path
```

**Features:**
- Lazy generation (only when needed)
- Intelligent caching (path + timestamp hash)
- Fallback extraction methods
- Timeout protection (30s max)

#### 3.4 SettingsManager

**Location:** `src/backend/SettingsManager.js`

**Purpose:** Persist user preferences

**Storage:** JSON file at `%APPDATA%/LocalFlix/settings.json`

**Tracked Settings:**
- `lastDirectory` - Last selected directory
- `directories` - Array of all added directories

### 4. Frontend (Renderer Process)

**Location:** `src/frontend/`

**Technology:** Vanilla JavaScript (no framework)

**Components:**

#### 4.1 State Management

```javascript
// Global state
let directories = [];      // Added directories
let movies = [];           // Scanned movies
let allProgress = [];      // Viewing progress
let currentMovie = null;   // Currently playing
let thumbnailCache = Map;  // Cached thumbnails
let ffmpegAvailable = false; // ffmpeg availability
```

#### 4.2 UI Screens

1. **Directory Screen** - Initial welcome/setup
2. **Main Screen** - Movie grid with search/sort
3. **Player Modal** - Video playback
4. **Shortcuts Modal** - Keyboard help
5. **Resume Modal** - Continue watching prompt

#### 4.3 Key Features

**Lazy Thumbnail Loading:**
- Uses Intersection Observer API
- Triggers at 10% visibility + 100px margin
- One-by-one generation to prevent queue flooding

**Real-time Search:**
- Filters on every keystroke
- Case-insensitive matching
- Debounced re-render

**Progress Bar UI:**
- Hover to reveal reset button
- Gradient fill animation
- Time display below

---

## 🔄 Data Flow

### Movie Scanning Flow

```
User clicks "Select Directory"
  ↓
main.js: select-directory IPC
  ↓
dialog.showOpenDialog()
  ↓
SettingsManager: save directory
  ↓
MovieScanner: scanDirectory()
  ↓
Recursive file system scan
  ↓
ffprobe: get duration for each file
  ↓
Return movie array to renderer
  ↓
Frontend: render movie cards
  ↓
Intersection Observer triggers thumbnails
  ↓
ThumbnailGenerator: extract frames
  ↓
Update cards with thumbnails
```

### Playback Flow

```
User clicks movie card
  ↓
Frontend: openMovie(movie)
  ↓
Check progress (IPC)
  ↓
Show resume prompt? (if progress > 30s)
  ↓
User chooses: Resume or Start Over
  ↓
main.js: path-to-url (Windows compat)
  ↓
Set video.src = file:// URL
  ↓
videoPlayer.play()
  ↓
timeupdate event fires
  ↓
saveProgress IPC (every ~250ms)
  ↓
SQLite: upsert progress record
  ↓
Frontend: update progress bar
```

---

## 🔐 Security Architecture

### Electron Security Model

```
┌─────────────────────────────────────────┐
│         Security Layers                  │
├─────────────────────────────────────────┤
│                                          │
│  1. Context Isolation (enabled)          │
│     - Renderer has no Node.js access     │
│     - Separate JS contexts               │
│                                          │
│  2. Preload Script (bridge)              │
│     - Whitelisted IPC methods only       │
│     - Input validation                   │
│                                          │
│  3. IPC Validation                       │
│     - Sanitize file paths                │
│     - Timeout on child processes         │
│                                          │
│  4. Content Security Policy              │
│     - No inline scripts (except unsafe)  │
│     - No external resources              │
│                                          │
│  5. Child Process Safety                 │
│     - Escaped paths in ffmpeg commands   │
│     - Timeout limits                     │
│     - Max buffer sizes                   │
│                                          │
└─────────────────────────────────────────┘
```

### Cross-Platform Path Handling

**Challenge:** Windows uses `\`, Linux uses `/`

**Solution:**
```javascript
// Main process handles conversion
if (process.platform === 'win32') {
  fileUrl = 'file:///' + path.replace(/\\/g, '/');
} else {
  fileUrl = 'file://' + path;
}

// Use path.sep for splitting
moviePath.split(path.sep).pop()
```

---

## 📊 Performance Optimizations

### 1. Lazy Loading
- Thumbnails load only when visible
- Intersection Observer threshold: 10%
- Preload margin: 100px

### 2. Caching
- Thumbnail cache (in-memory Map)
- Thumbnail files (disk cache)
- Progress cache (in-memory array)

### 3. Debouncing
- Progress saves batched (every timeupdate)
- Search filters immediate (no delay needed)

### 4. Efficient Rendering
- Event delegation for movie cards
- Single re-render on progress update
- Virtual scrolling not needed (< 1000 movies typical)

### 5. ffmpeg Optimization
- Timeout limits prevent hangs
- Fallback methods for compatibility
- Keyframe seeking when possible

---

## 🧩 Design Decisions

### Why Electron?

**Pros:**
- Cross-platform (Linux + Windows + macOS)
- Web technologies (HTML/CSS/JS)
- Large ecosystem (npm packages)
- Easy distribution

**Cons:**
- Larger bundle size (~150MB)
- Higher memory usage (~200MB)
- Not native performance

**Decision:** Acceptable trade-off for rapid development and cross-platform support.

### Why Vanilla JavaScript?

**Pros:**
- Zero framework overhead
- No build step for frontend
- Easy to understand and maintain
- Smaller bundle size

**Cons:**
- More boilerplate code
- No reactive data binding
- Manual DOM updates

**Decision:** App is simple enough that a framework would be overkill.

### Why SQLite?

**Pros:**
- Zero configuration
- Single file database
- ACID compliance
- Fast reads and writes
- No server required

**Cons:**
- Not suitable for concurrent writes (not needed here)
- Limited to local storage (by design)

**Decision:** Perfect fit for local-only progress tracking.

### Why ffmpeg?

**Pros:**
- Industry standard
- Supports all formats
- Reliable and fast
- Cross-platform

**Cons:**
- External dependency
- ~50MB additional size
- May not be installed

**Decision:** Industry standard with graceful degradation (works without thumbnails).

---

## 🔮 Future Architecture Considerations

### Version 2.0: Plugin System

```
┌─────────────────────────────────────────┐
│         Plugin Architecture              │
├─────────────────────────────────────────┤
│  Core Application                        │
│    ├── Plugin Manager                    │
│    ├── Event Bus                         │
│    └── API Gateway                       │
│                                          │
│  Plugins:                                │
│    ├── Subtitle Plugin                   │
│    ├── Metadata Plugin (TMDB)           │
│    ├── Theme Plugin                      │
│    └── Export Plugin                     │
└─────────────────────────────────────────┘
```

### Version 3.0: Optional Cloud Sync

```
┌─────────────────────────────────────────┐
│         Cloud Architecture               │
├─────────────────────────────────────────┤
│  Local Database ←→ Sync Engine ←→ Cloud │
│                                          │
│  Features:                               │
│    - End-to-end encryption               │
│    - Conflict resolution                 │
│    - Multi-device support                │
│    - Opt-in (privacy first)              │
└─────────────────────────────────────────┘
```

---

**Last Updated:** April 2026  
**Maintained by:** HriThik MaNoj
