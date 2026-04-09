# LocalFlix - Your Personal Movie Library

<div align="center">

![LocalFlix Logo](build/icon.svg)

**A beautiful, cross-platform desktop application for browsing, playing, and tracking your local movie collection**

[![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)](https://github.com/HriThik-MaNoj/LocalFlix/releases)
[![Platforms](https://img.shields.io/badge/platforms-Linux%20%7C%20Windows-lightgrey?style=for-the-badge)](https://github.com/HriThik-MaNoj/LocalFlix/releases)
[![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-28.0.0-47848F?style=for-the-badge&logo=electron)](https://www.electronjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)

[Features](#-features) • [Installation](#-installation) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Usage Guide](#-usage-guide)
- [Keyboard Shortcuts](#-keyboard-shortcuts)
- [Supported Formats](#-supported-formats)
- [Data Storage](#-data-storage)
- [Project Structure](#-project-structure)
- [Building from Source](#-building-from-source)
- [Distribution](#-distribution)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎬 Overview

LocalFlix is a modern, Netflix-inspired desktop application designed to help you organize and enjoy your personal movie collection. Built with Electron, it provides a beautiful dark-themed interface that automatically scans your directories for video files, generates thumbnails, and tracks your viewing progress—all stored locally on your machine.

Whether you have a small collection of family videos or a massive library of films, LocalFlix makes it easy to find, play, and keep track of what you've watched.

**Key Principles:**
- 🔒 **Privacy First** - All data stays on your machine, no cloud sync
- ⚡ **Fast & Lightweight** - Native performance with minimal resource usage
- 🎨 **Beautiful UI** - Modern dark theme inspired by Netflix
- 🌐 **Cross-Platform** - Works on Linux and Windows

---

## ✨ Features

### 🎬 Media Library
- **Automatic Scanning** - Recursively scan directories for video files
- **Smart Naming** - Automatically cleans up filenames for display
- **Thumbnail Generation** - Auto-generates movie posters from video frames
- **Multiple Directories** - Add and manage multiple movie folders
- **Real-time Search** - Instantly filter movies as you type
- **Flexible Sorting** - Sort by name, duration, file size, or recently watched

### 🎥 Video Player
- **Built-in Player** - Full-featured HTML5 video player
- **Playback Controls** - Play, pause, seek, volume, fullscreen
- **Speed Control** - Watch at 1x, 1.25x, 1.5x, or 2x speed
- **Resume Playback** - Pick up where you left off with smart prompts
- **Keyboard Navigation** - Full keyboard shortcut support

### 📊 Progress Tracking
- **Auto-Save Progress** - Automatically tracks your viewing position
- **Visual Progress Bars** - See your progress at a glance
- **Continue Watching** - Quick access to in-progress movies
- **Watch History** - Track last watched time and watch count
- **Mark as Watched** - Manually mark movies as complete
- **Reset Progress** - Easy progress reset with one click

### 🖼️ Smart Thumbnails
- **Auto-Generation** - Extracts frames at optimal positions (10% into video)
- **Lazy Loading** - Loads thumbnails only when visible for performance
- **Intelligent Caching** - Cached thumbnails load instantly on subsequent views
- **Fallback Support** - Graceful degradation if ffmpeg is unavailable

### 💾 Data Management
- **Local SQLite Database** - Fast, reliable local storage
- **Persistent Settings** - Remembers your directories and preferences
- **No Internet Required** - Fully offline functionality
- **Portable Option** - Run without installation (Windows)

### 🎨 User Experience
- **Netflix-Inspired UI** - Familiar, intuitive interface
- **Responsive Design** - Adapts to different window sizes
- **Smooth Animations** - Polished hover effects and transitions
- **Dark Theme** - Easy on the eyes for late-night viewing
- **Empty States** - Helpful guidance when no movies are found

---

## 📸 Screenshots

<div align="center">

| Welcome Screen | Movie Library | Video Player |
|:---:|:---:|:---:|
| Clean welcome screen with directory selection | Beautiful grid view with thumbnails and progress bars | Full-featured player with speed controls |
| ![Welcome](https://via.placeholder.com/400x225/1a1a1a/e50914?text=Welcome+Screen) | ![Library](https://via.placeholder.com/400x225/1a1a1a/e50914?text=Movie+Library) | ![Player](https://via.placeholder.com/400x225/1a1a1a/e50914?text=Video+Player) |

</div>

---

## 🚀 Installation

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **OS** | Windows 10 / Ubuntu 20.04 | Windows 11 / Ubuntu 22.04+ |
| **RAM** | 2 GB | 4 GB+ |
| **Disk Space** | 500 MB | 1 GB+ |
| **Node.js** | v16.0 | v22.0+ |
| **ffmpeg** | Optional (for thumbnails) | Required (full features) |

### Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v16 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **ffmpeg** (optional but recommended for thumbnails)

   **Linux:**
   ```bash
   # Ubuntu/Debian
   sudo apt-get update && sudo apt-get install ffmpeg

   # Fedora
   sudo dnf install ffmpeg

   # Arch Linux
   sudo pacman -S ffmpeg
   ```

   **Windows:**
   ```powershell
   # Using winget (Windows 11/10)
   winget install ffmpeg

   # Using Chocolatey
   choco install ffmpeg

   # Using Scoop
   scoop install ffmpeg

   # Or download from: https://ffmpeg.org/download.html
   ```

### Installation Methods

#### Method 1: Pre-built Binaries (Recommended)

Download the latest release from [GitHub Releases](https://github.com/HriThik-MaNoj/LocalFlix/releases):

**Linux:**
- `.AppImage` - Portable, runs on any Linux distribution
- `.deb` - For Debian/Ubuntu systems
- `.rpm` - For Fedora/RHEL systems
- `.snap` - For Snap-enabled systems

**Windows:**
- `Setup.exe` - Standard installer (recommended)
- `Portable.exe` - No installation required

#### Method 2: From Source

```bash
# Clone the repository
git clone https://github.com/HriThik-MaNoj/LocalFlix.git
cd LocalFlix

# Install dependencies
npm install

# Rebuild native modules for Electron
npm rebuild better-sqlite3 --runtime=electron --target=28.0.0 --disturl=https://electronjs.org/headers --build-from-source

# Start the application
npm start
```

---

## 🎯 Quick Start

1. **Launch LocalFlix**
   ```bash
   npm start
   ```

2. **Select Your Movie Directory**
   - Click "Select Movie Directory" on the welcome screen
   - Browse and select the folder containing your movies
   - The app will automatically scan for all supported video files

3. **Browse & Play**
   - Click any movie card to start watching
   - Progress saves automatically as you watch
   - Resume from where you left off next time

4. **Manage Your Library**
   - Add multiple directories using the ➕ button
   - Search movies in real-time
   - Sort by different criteria
   - Remove directories from the pills bar

---

## 📖 Usage Guide

### Directory Management

LocalFlix supports multiple movie directories:

**Add a Directory:**
1. Click the folder icon with ➕ in the header
2. Select a folder containing movies
3. Movies from all directories merge into one library

**Remove a Directory:**
- Click the ✕ button on any directory pill
- Movies from that directory are removed from the library

### Movie Cards Explained

Each movie card displays:

| Element | Description |
|---------|-------------|
| **Thumbnail** | Auto-generated poster from video frame |
| **Movie Title** | Cleaned filename (dots/underscores replaced with spaces) |
| **File Size** | Size of the video file (KB, MB, GB) |
| **Duration** | Total runtime (when available) |
| **Progress Bar** | Visual indicator of watched progress |
| **Progress Text** | Time watched / Total duration |
| **Watched Badge** | Green badge when 90%+ completed |
| **Reset Button** | × button to clear progress (appears on hover) |

### Continue Watching Section

Movies you've started but not finished appear in the "Continue Watching" section at the top:

- Shows only movies with progress > 0% and < 90%
- Sorted by most recently watched
- Click to resume from your last position
- Smart resume prompt asks if you want to continue or start over

### Progress Tracking

LocalFlix automatically tracks:

- **Current Position** - Where you left off in each movie
- **Total Duration** - Length of the movie
- **Last Watched** - Timestamp of your last viewing session
- **Watch Count** - Number of times you've started the movie
- **Completion Status** - Marked complete at 90%+ progress

**Manual Controls:**
- **Mark as Watched** - In the player, instantly marks movie as complete
- **Reset Progress** - Click × on progress bar to clear all progress

### Search & Filter

The search bar provides instant filtering:

- **Real-time** - Results update as you type
- **Case-insensitive** - Works with any capitalization
- **Partial matches** - Finds movies containing your search term
- **Clear button** - Quick reset with the ✕ button

### Sorting Options

| Sort By | Description |
|---------|-------------|
| **Name** | Alphabetical order (A-Z) |
| **Duration** | Longest to shortest |
| **File Size** | Largest to smallest |
| **Recently Watched** | Most recently opened first |

---

## ⌨️ Keyboard Shortcuts

### Global Shortcuts

| Key | Action |
|-----|--------|
| `ESC` | Close player / modal |
| `R` | Refresh movie library |
| `?` | Toggle shortcuts panel |

### Player Shortcuts (when video player is active)

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `←` | Seek backward 10 seconds |
| `→` | Seek forward 10 seconds |
| `Shift` + `←` | Seek backward 30 seconds |
| `Shift` + `→` | Seek forward 30 seconds |
| `1` | Set playback speed to 1x |
| `2` | Set playback speed to 1.25x |
| `3` | Set playback speed to 1.5x |
| `4` | Set playback speed to 2x |

---

## 🎞️ Supported Formats

LocalFlix supports all major video formats:

| Format | Extensions | Notes |
|--------|-----------|-------|
| **MP4** | `.mp4`, `.m4v` | Most widely supported |
| **Matroska** | `.mkv` | Popular for high-quality videos |
| **AVI** | `.avi` | Legacy format |
| **QuickTime** | `.mov` | Apple format |
| **Windows Media** | `.wmv` | Microsoft format |
| **Flash Video** | `.flv` | Legacy web format |
| **WebM** | `.webm` | Modern web format |
| **MPEG** | `.mpg`, `.mpeg` | DVD standard |
| **3GP** | `.3gp` | Mobile format |
| **OGG Video** | `.ogv` | Open format |

**Note:** Playback depends on your system's installed codecs. Install ffmpeg for best compatibility.

---

## 💾 Data Storage

All data is stored locally on your machine:

### Database Location

**Linux:**
```
~/.config/localflix/
├── localflix.db          # SQLite database (progress tracking)
├── settings.json         # User preferences and directories
└── thumbnails/           # Cached movie thumbnails
```

**Windows:**
```
%APPDATA%\LocalFlix\
├── localflix.db          # SQLite database (progress tracking)
├── settings.json         # User preferences and directories
└── thumbnails/           # Cached movie thumbnails
```

### Database Schema

The SQLite database (`localflix.db`) contains one table:

```sql
CREATE TABLE movie_progress (
  movie_path TEXT PRIMARY KEY,      -- Full path to video file
  movie_name TEXT NOT NULL,         -- Display name
  current_time REAL DEFAULT 0,      -- Current playback position (seconds)
  duration REAL DEFAULT 0,          -- Total duration (seconds)
  last_watched DATETIME,            -- Last viewing timestamp
  watch_count INTEGER DEFAULT 0,    -- Number of times started
  completed BOOLEAN DEFAULT 0       -- 90%+ completion flag
);
```

### Data Privacy

- ✅ No cloud sync
- ✅ No telemetry
- ✅ No analytics
- ✅ No internet connection required
- ✅ All data stays on your machine

---

## 📁 Project Structure

```
LocalFlix/
├──  main.js                      # Electron main process (IPC handlers)
├── 📄 preload.js                   # Secure context bridge for renderer
├──  package.json                 # Project config, dependencies, build settings
├── 📄 .gitignore                   # Git ignore patterns
│
├──  src/
│   ├── 📁 backend/
│   │   ├── 📄 MovieScanner.js      # Recursive video file scanner
│   │   ├── 📄 ProgressTracker.js   # SQLite database operations
│   │   ├── 📄 ThumbnailGenerator.js # ffmpeg thumbnail extraction
│   │   └── 📄 SettingsManager.js   # JSON settings persistence
│   │
│   └──  frontend/
│       ├──  index.html           # Main HTML structure
│       ├── 📄 app.js               # Frontend logic and state management
│       └── 📁 styles/
│           └── 📄 main.css         # Netflix-inspired dark theme
│
├── 📁 build/                       # Build resources
│   ├── 🖼️ icon.svg                 # App icon (film strip design)
│   ├── 🖼️ icon.png                 # PNG version for Windows
│   ├── 📄 localflix.desktop        # Linux desktop entry
│   └── 📄 installer.nsh            # Windows NSIS installer script
│
├──  .github/
│   ── 📁 workflows/
│       └── 📄 build.yml            # GitHub Actions CI/CD
│
├── 📁 flatpak/
│   └── 📄 com.localflix.app.yml    # Flatpak manifest
│
├── 📁 snap/
│   └── 📄 snapcraft.yaml           # Snap package configuration
│
├── 📁 scripts/
│   └── 📄 generate-icons.js        # Icon generation utility
│
└──  dist/                        # Built packages (git-ignored)
```

---

## 🛠️ Building from Source

### Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/HriThik-MaNoj/LocalFlix.git
cd LocalFlix

# 2. Install dependencies
npm install

# 3. Rebuild native modules
npm rebuild better-sqlite3 --runtime=electron --target=28.0.0 --disturl=https://electronjs.org/headers --build-from-source

# 4. Start in development mode
npm run dev
```

### Build Commands

| Command | Platform | Output |
|---------|----------|--------|
| `npm run build:linux` | Linux | AppImage, .deb, .rpm, .snap |
| `npm run build:windows` | Windows | NSIS installer, Portable exe |
| `npm run build:appimage` | Linux | AppImage only |
| `npm run build:deb` | Linux | Debian package |
| `npm run build:rpm` | Linux | RPM package |
| `npm run build:snap` | Linux | Snap package |
| `npm run build:nsis` | Windows | NSIS installer |
| `npm run build:portable` | Windows | Portable executable |
| `npm run build:all` | All | All formats (requires both OS) |

### Build Prerequisites

**Linux:**
```bash
# Build tools
sudo apt-get install build-essential python3

# For Snap builds
sudo snap install snapcraft --classic
```

**Windows:**
```bash
# Visual Studio Build Tools (for native modules)
# Download from: https://visualstudio.microsoft.com/downloads/
# Select "Desktop development with C++"

# Or install via Chocolatey
choco install visualstudio2022buildtools --package-parameters "--add Microsoft.VisualStudio.Workload.VCTools"
```

---

## 📦 Distribution

### GitHub Releases (Automated)

The repository includes a GitHub Actions workflow that automatically builds all packages when you create a tag:

```bash
# Create a new version tag
git tag v1.0.0

# Push the tag to trigger the build
git push origin v1.0.0
```

This triggers:
1. ✅ Linux build (AppImage, .deb, .rpm, .snap)
2. ✅ Windows build (NSIS, Portable)
3. ✅ Automatic GitHub Release with all artifacts
4. ✅ Auto-generated release notes

### Package Manager Distribution

**Snap Store:**
```bash
# Install Snapcraft
sudo snap install snapcraft --classic

# Build snap
npm run build:snap

# Upload to Snap Store
snapcraft login
snapcraft upload dist/localflix_*.snap --release=edge
```

**Flathub:**
1. Create a repository named `com.localflix.app`
2. Submit manifest to [flathub/flathub](https://github.com/flathub/flathub)
3. Follow their review process

### Direct Distribution

Share the built packages directly:
- **Linux:** `.AppImage` files work on any distribution
- **Windows:** Share `Setup.exe` installer or `Portable.exe`

---

## 🔧 Troubleshooting

### Common Issues

#### Videos Not Showing Up

**Problem:** Movies aren't appearing in the library

**Solutions:**
- Verify the directory contains video files with supported extensions
- Check file permissions - the app needs read access
- Ensure directories aren't in hidden/system folders
- Click the refresh button (↻) to rescan

#### Videos Won't Play

**Problem:** Clicking a movie doesn't start playback

**Solutions:**

**Linux:**
```bash
# Install system codecs
sudo apt-get install ffmpeg gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly

# Check codec support
ffprobe your_video.mp4
```

**Windows:**
```powershell
# Install ffmpeg
winget install ffmpeg

# Install K-Lite Codec Pack (optional)
# Download from: https://codecguide.com/
```

#### Thumbnails Not Generating

**Problem:** Movie cards show placeholder icons instead of thumbnails

**Solutions:**
```bash
# Verify ffmpeg is installed
ffmpeg -version

# Check if ffmpeg is in PATH
# Linux:
which ffmpeg
# Windows:
where ffmpeg

# Test thumbnail generation manually
ffmpeg -i your_video.mp4 -ss 10 -vframes 1 test_thumb.jpg
```

#### App Won't Start

**Problem:** Application crashes or fails to launch

**Solutions:**

**Linux:**
```bash
# Check for missing dependencies
ldd node_modules/better-sqlite3/build/Release/better_sqlite3.node

# Rebuild native modules
npm rebuild better-sqlite3 --runtime=electron --target=28.0.0 --disturl=https://electronjs.org/headers --build-from-source

# Run with debug output
npm run dev
```

**Windows:**
```powershell
# Install Visual C++ Redistributable
# Download from: https://aka.ms/vs/17/release/vc_redist.x64.exe

# Rebuild native modules
npm rebuild better-sqlite3 --runtime=electron --target=28.0.0 --disturl=https://electronjs.org/headers --build-from-source

# Run in development mode to see errors
npm run dev
```

#### Progress Not Saving

**Problem:** Movies don't remember your position

**Solutions:**
- Check disk space availability
- Verify database file is writable:
  ```bash
  # Linux
  ls -la ~/.config/localflix/localflix.db
  
  # Windows
  dir %APPDATA%\LocalFlix\localflix.db
  ```
- Reset the database (will lose all progress):
  ```bash
  # Linux
  rm ~/.config/localflix/localflix.db
  
  # Windows
  del %APPDATA%\LocalFlix\localflix.db
  ```

#### Build Fails

**Problem:** `npm run build` produces errors

**Solutions:**

**Native module errors:**
```bash
# Rebuild with correct Electron headers
npm rebuild better-sqlite3 --runtime=electron --target=28.0.0 --disturl=https://electronjs.org/headers --build-from-source
```

**Snap build fails:**
```bash
# Clean and retry
sudo snapcraft clean
npm run build:snap
```

**NSIS build fails (Windows):**
```bash
# Ensure NSIS is installed (comes with electron-builder)
# Check Node.js version compatibility
node --version  # Should be v16+
```

### Getting Help

If you're still experiencing issues:

1. **Check existing issues:** [GitHub Issues](https://github.com/HriThik-MaNoj/LocalFlix/issues)
2. **Create a new issue:** Include your OS, Node.js version, and error messages
3. **Run in dev mode:** `npm run dev` shows detailed console output

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Start for Contributors

```bash
# Fork the repository
# Clone your fork
git clone https://github.com/YOUR_USERNAME/LocalFlix.git
cd LocalFlix

# Install dependencies
npm install

# Create a feature branch
git checkout -b feature/your-feature

# Make your changes
# Test thoroughly
npm run dev

# Commit and push
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature

# Create a Pull Request
```

### Development Workflow

1. **Pick an issue** or propose a feature
2. **Create a branch** from `main`
3. **Make your changes**
4. **Test thoroughly** on your platform
5. **Submit a PR** with a clear description

### Code Style

- Follow existing code patterns
- Use meaningful variable names
- Add comments for complex logic
- Test on both Linux and Windows (if possible)

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 HriThik MaNoj

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- **Electron** - Cross-platform desktop framework
- **SQLite** - Local database engine
- **ffmpeg** - Video processing and thumbnail generation
- **electron-builder** - Packaging and distribution tool

---

<div align="center">

**Made with ❤️ by [HriThik MaNoj](https://github.com/HriThik-MaNoj)**

⭐ Star this repo if you found it helpful!

[Report Bug](https://github.com/HriThik-MaNoj/LocalFlix/issues) • [Request Feature](https://github.com/HriThik-MaNoj/LocalFlix/issues) • [Releases](https://github.com/HriThik-MaNoj/LocalFlix/releases)

</div>
