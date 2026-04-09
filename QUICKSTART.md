# Quick Start Guide for LocalFlix

## 🚀 Getting Started

### Running the Application

**Linux/macOS:**
```bash
cd /home/hri7hik/LocalFlix
npm start
```

**Windows (Command Prompt/PowerShell):**
```powershell
cd C:\path\to\LocalFlix
npm start
```

### Development Mode (with dev tools)

```bash
npm run dev
```

## 📖 How to Use

1. **Launch the App**
   - Run `npm start` from the LocalFlix directory

2. **Select Your Movie Directory**
   - On first launch, you'll see a welcome screen
   - Click "Select Movie Directory" button
   - Browse and select the folder containing your movies
   - The app will recursively scan for all video files

3. **Browse Your Movies**
   - All found movies appear in a Netflix-style grid
   - Each movie card shows:
     - Movie name (cleaned up from filename)
     - File size
     - Progress bar (if you've started watching)
     - "Watched" badge (if completed)

4. **Watch a Movie**
   - Click any movie card to open the video player
   - The player supports:
     - Play/Pause
     - Seek forward/backward
     - Volume control
     - Fullscreen mode
     - Standard video controls

5. **Progress Tracking**
   - Progress saves automatically as you watch
   - Close the player anytime - your position is saved
   - "Continue Watching" section shows movies in progress
   - Click "Mark as Watched" to mark a movie as complete

6. **Change Directory**
   - Click the folder icon next to the LocalFlix logo
   - Select a new directory to scan
   - Movies list updates automatically

## 🎹 Keyboard Shortcuts

- **ESC** - Close video player
- **Space** - Play/Pause (when video player focused)
- **Arrow Left/Right** - Seek backward/forward (when video player focused)

## 🎬 Supported Video Formats

- MP4 (.mp4, .m4v)
- MKV (.mkv)
- AVI (.avi)
- MOV (.mov)
- WMV (.wmv)
- FLV (.flv)
- WebM (.webm)
- MPEG (.mpg, .mpeg)
- 3GP (.3gp)
- OGG Video (.ogv)

## 🖼️ Thumbnails

LocalFlix automatically generates thumbnails from your video files:
- Thumbnails are extracted at 10% into each movie
- Generated thumbnails are cached for faster loading
- Thumbnails are stored in: `~/.config/localflix/thumbnails/`

**Note:** Thumbnail generation requires `ffmpeg`. If not installed:

**Linux:**
```bash
sudo apt-get install ffmpeg  # Ubuntu/Debian
```

**Windows:**
```powershell
winget install ffmpeg  # Windows 11/10
```

## 💾 Data Storage

Your watching progress is saved in:

**Linux:**
```
~/.config/localflix/localflix.db
```

**Windows:**
```
%APPDATA%\LocalFlix\localflix.db
```

This SQLite database stores:
- Movie file paths
- Current playback position
- Total duration
- Last watched time
- Watch count
- Completion status

## 🔧 Troubleshooting

### Videos Won't Play
- Ensure you have the necessary codecs installed on your system
- **Linux:** Install ffmpeg: `sudo apt install ffmpeg` (Ubuntu/Debian) or gstreamer plugins
- **Windows:** Install ffmpeg: `winget install ffmpeg` or download from ffmpeg.org

### Movies Not Found
- Verify the directory contains video files with supported extensions
- Check file permissions - the app needs read access
- The scanner skips hidden folders and system directories

### App Won't Start
- Ensure Node.js v16+ is installed
- Run `npm install` to ensure all dependencies are installed
- **Linux:** Rebuild native modules: `npm rebuild better-sqlite3 --runtime=electron --target=28.0.0 --disturl=https://electronjs.org/headers --build-from-source`
- **Windows:** Install Microsoft Visual C++ Redistributable from https://aka.ms/vs/17/release/vc_redist.x64.exe

### Thumbnails Not Generating
- Ensure ffmpeg is installed and in your PATH
- Verify ffmpeg is accessible: `ffmpeg -version` (Linux) or `ffmpeg -version` (Windows)
- Check video files are not corrupted

## 📦 Building for Distribution

Create installable packages:

**Linux:**
```bash
npm run build:linux
```

This creates:
- `.AppImage` - Portable app (runs on any Linux distro)
- `.deb` - Debian/Ubuntu package
- `.rpm` - Fedora/RHEL package
- `.snap` - Snap package

**Windows:**
```bash
npm run build:windows
```

This creates:
- `Setup.exe` - NSIS installer (recommended)
- `Portable.exe` - Portable executable (no installation)

Find the built packages in the `dist/` folder.

## 🎨 Customization

Want to change the theme? Edit `src/frontend/styles/main.css`:
- `--accent` - Main accent color (default: Netflix red #e50914)
- `--bg-primary` - Background color
- `--text-primary` - Text color

---

Enjoy your personal movie library! 🍿
