# CHANGELOG

All notable changes to LocalFlix will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Initial release of LocalFlix
- Cross-platform support for Linux and Windows
- Netflix-inspired dark theme UI
- Automatic movie directory scanning
- Thumbnail generation with ffmpeg
- Progress tracking with SQLite database
- Video player with playback speed control
- Search and sorting functionality
- Multiple directory support
- Continue Watching section
- Resume playback prompts
- Keyboard shortcuts
- NSIS installer for Windows
- Portable Windows executable
- GitHub Actions CI/CD pipeline
- Comprehensive documentation

---

## [1.0.0] - 2026-04-09

### Added
- **Core Application**
  - Electron-based desktop application
  - Main process with secure IPC communication
  - Renderer process with vanilla JavaScript
  
- **Movie Library**
  - Recursive directory scanning
  - Support for 10+ video formats (MP4, MKV, AVI, MOV, WMV, FLV, WebM, etc.)
  - Automatic filename cleanup for display
  - File size and duration display
  - Grid view with responsive layout
  
- **Video Player**
  - HTML5 video player with native controls
  - Play/pause/seek functionality
  - Fullscreen mode
  - Volume control
  - Playback speed options (1x, 1.25x, 1.5x, 2x)
  - Keyboard shortcuts for all controls
  
- **Progress Tracking**
  - SQLite database for local storage
  - Auto-save playback position
  - Visual progress bars on movie cards
  - Continue Watching section
  - Resume prompt for in-progress movies
  - Mark as watched functionality
  - Reset progress option
  - Watch count and last watched timestamp
  
- **Thumbnail System**
  - Automatic thumbnail generation via ffmpeg
  - Frame extraction at 10% into video
  - Lazy loading with Intersection Observer
  - Thumbnail caching for performance
  - Graceful fallback when ffmpeg unavailable
  
- **User Interface**
  - Netflix-inspired dark theme
  - Welcome screen for first-time users
  - Directory selection dialog
  - Search bar with real-time filtering
  - Sort options (name, duration, size, recent)
  - Directory pills for multiple folders
  - Smooth animations and hover effects
  - Keyboard shortcuts modal
  - Loading states and empty states
  
- **Cross-Platform Support**
  - Linux: AppImage, .deb, .rpm, .snap, Flatpak
  - Windows: NSIS installer, Portable executable
  - Cross-platform path handling
  - Platform-specific file:// URL conversion
  - Windows-compatible ffmpeg commands
  
- **Build & Distribution**
  - electron-builder configuration
  - GitHub Actions workflow
  - Automated builds on tag push
  - NSIS installer with custom script
  - Snap package configuration
  - Flatpak manifest
  
- **Documentation**
  - Comprehensive README
  - Quick Start guide
  - Distribution guide
  - Contributing guidelines
  - Code of Conduct
  - Security policy

### Technical Details
- **Backend**
  - `MovieScanner.js` - Recursive video file scanner with ffprobe duration detection
  - `ProgressTracker.js` - SQLite database with better-sqlite3
  - `ThumbnailGenerator.js` - ffmpeg integration with fallback support
  - `SettingsManager.js` - JSON-based settings persistence
  
- **Frontend**
  - Vanilla JavaScript (no framework dependencies)
  - CSS Grid and Flexbox layouts
  - Intersection Observer for lazy loading
  - Event delegation for performance
  
- **Security**
  - Context isolation enabled
  - Node integration disabled in renderer
  - Secure IPC via preload.js
  - No remote module usage
  - Input validation on all file paths

---

## Version History

| Version | Release Date | Key Features |
|---------|--------------|--------------|
| [1.0.0] | 2026-04-09 | Initial release with full feature set |

---

## Planned Features

### Version 1.1.0 (Planned)
- [ ] Movie metadata editing
- [ ] Custom thumbnail upload
- [ ] Playlist creation
- [ ] Watch history timeline
- [ ] Movie ratings and reviews
- [ ] Export/import progress data

### Version 1.2.0 (Planned)
- [ ] Subtitle support
- [ ] Audio track selection
- [ ] Picture-in-picture mode
- [ ] Mini player mode
- [ ] Theme customization
- [ ] Custom accent colors

### Version 2.0.0 (Future)
- [ ] Optional cloud sync (opt-in)
- [ ] Mobile companion app
- [ ] Recommendation engine
- [ ] Watch party feature
- [ ] Plugin system

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for information on how to contribute to LocalFlix.

---

## Links

- [GitHub Repository](https://github.com/HriThik-MaNoj/LocalFlix)
- [Releases](https://github.com/HriThik-MaNoj/LocalFlix/releases)
- [Issues](https://github.com/HriThik-MaNoj/LocalFlix/issues)
- [Documentation](https://github.com/HriThik-MaNoj/LocalFlix#readme)

---

**Maintained by [HriThik MaNoj](https://github.com/HriThik-MaNoj)**
