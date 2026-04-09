# 🚀 LocalFlix Distribution Guide

Complete guide for building and distributing LocalFlix across Linux and Windows platforms.

---

## 📦 Quick Build Commands

| Platform | Format | Command | Output |
|----------|--------|---------|--------|
| **Linux** | All packages | `npm run build:linux` | AppImage + .deb + .rpm + .snap |
| **Linux** | AppImage | `npm run build:appimage` | `dist/LocalFlix-1.0.0-x86_64.AppImage` |
| **Linux** | Debian/Ubuntu | `npm run build:deb` | `dist/LocalFlix-1.0.0-amd64.deb` |
| **Linux** | RPM (Fedora) | `npm run build:rpm` | `dist/LocalFlix-1.0.0-x86_64.rpm` |
| **Linux** | Snap | `npm run build:snap` | `dist/localflix_1.0.0_amd64.snap` |
| **Windows** | All packages | `npm run build:windows` | NSIS + Portable |
| **Windows** | NSIS Installer | `npm run build:nsis` | `dist/LocalFlix-1.0.0-Setup-x64.exe` |
| **Windows** | Portable | `npm run build:portable` | `dist/LocalFlix-1.0.0-Portable-x64.exe` |

---

## 🐧 1. AppImage (Universal Linux)

**Best for:** Maximum compatibility, portable, no installation required

### Build:
```bash
npm run build:appimage
```

### Distribute:
- Upload `LocalFlix-1.0.0-x86_64.AppImage` to GitHub Releases
- Users download, make executable, and run:
  ```bash
  chmod +x LocalFlix-1.0.0-x86_64.AppImage
  ./LocalFlix-1.0.0-x86_64.AppImage
  ```

### Optional: Publish to AppImageHub
1. Submit to [AppImageHub](https://appimage.github.io/)
2. Add desktop file and icon to `.github/` for automatic listing

---

## 📦 2. Snap Package (Ubuntu/Snap Store)

**Best for:** Ubuntu Software Center, auto-updates, wide reach

### Build:
```bash
npm run build:snap
```

### Test locally:
```bash
sudo snap install --dangerous dist/localflix_1.0.0_amd64.snap
```

### Publish to Snap Store:

#### Option A: Direct upload
```bash
# Install snapcraft
sudo snap install snapcraft --classic

# Login to Snap Store
snapcraft login

# Upload
snapcraft upload dist/localflix_1.0.0_amd64.snap --release=edge
```

#### Option B: GitHub + Snap Store integration
1. Create a Snap at [snapcraft.io](https://snapcraft.io)
2. Connect your GitHub repository
3. Enable auto-builds on tags
4. Snap will auto-publish when you push tags

### Release to stable:
```bash
snapcraft release localflix 1.0.0 stable
```

---

## 📦 3. Flatpak (Flathub)

**Best for:** Fedora, Pop!_OS, Linux Mint, most non-Ubuntu distros

### Prerequisites:
```bash
# Install flatpak-builder
sudo apt install flatpak-builder  # Ubuntu/Debian
sudo dnf install flatpak-builder  # Fedora

# Add Flathub repository
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
```

### Build:
```bash
npm run build:flatpak
```

### Test locally:
```bash
flatpak-builder --run build-dir flatpak/com.localflix.app.yml localflix
```

### Publish to Flathub:

1. **Create GitHub repository:**
   - Name: `com.localflix.app`
   - Must match app-id exactly

2. **Add manifest file:**
   - Copy `flatpak/com.localflix.app.yml` to root as `com.localflix.app.yml`

3. **Submit to Flathub:**
   - Open issue at [flathub/flathub](https://github.com/flathub/flathub/issues)
   - Request new app submission
   - Follow their review process (usually 1-2 weeks)

4. **After approval:**
   - Push manifest to your repo
   - Flathub will auto-build and distribute

---

## 🎯 4. Debian/Ubuntu .deb Package

**Best for:** Native installation on Debian, Ubuntu, Linux Mint

### Build:
```bash
npm run build:deb
```

### Install locally:
```bash
sudo dpkg -i dist/LocalFlix-1.0.0-amd64.deb
sudo apt-get install -f  # Fix dependencies if needed
```

### Publish:
- Create a Personal Package Archive (PPA) on Launchpad
- Or upload to GitHub Releases for manual download

---

## 🎯 5. RPM Package (Fedora/RHEL)

**Best for:** Fedora, CentOS, RHEL, openSUSE

### Build:
```bash
npm run build:rpm
```

### Install locally:
```bash
sudo dnf install dist/LocalFlix-1.0.0-x86_64.rpm
```

### Publish:
- Submit to Fedora Copr
- Or upload to GitHub Releases

---

## 🪟 6. Windows NSIS Installer

**Best for:** Standard Windows installation, user-friendly setup

### Build:
```bash
npm run build:nsis
```

### Distribute:
- Upload `LocalFlix-1.0.0-Setup-x64.exe` to GitHub Releases
- Users run the installer and follow the setup wizard
- Creates Start Menu shortcut and optional desktop shortcut

### Features:
- Guided installation wizard
- Custom installation directory
- Automatic desktop shortcut creation
- Start Menu integration
- Uninstaller in Control Panel

---

## 🪟 7. Windows Portable

**Best for:** No-install usage, USB drives, testing

### Build:
```bash
npm run build:portable
```

### Distribute:
- Upload `LocalFlix-1.0.0-Portable-x64.exe` to GitHub Releases
- Users simply double-click to run
- No installation required
- All data stored locally

---

## 🤖 Automated Builds (GitHub Actions)

The included workflow automatically builds all packages when you create a git tag.

### Trigger a build:
```bash
git tag v1.0.0
git push origin v1.0.0
```

This will:
1. ✅ Build AppImage, .deb, .rpm, and .snap
2. ✅ Upload as GitHub Actions artifacts
3. ✅ Create a GitHub Release with all packages attached
4. ✅ Generate release notes automatically

### Download builds:
- Go to **Actions** tab in your GitHub repo
- Click on the workflow run
- Download artifacts from the bottom

---

## 📋 Pre-Release Checklist

Before publishing:

- [ ] Update version in `package.json`
- [ ] Update icon in `build/icon.svg` (professional, 512x512)
- [ ] Test all build formats locally
- [ ] Verify ffmpeg dependency works in sandboxed formats
- [ ] Write release notes
- [ ] Create git tag: `git tag v1.0.0`
- [ ] Push tag: `git push origin v1.0.0`
- [ ] Verify GitHub Actions completed successfully
- [ ] Download and test each package format

---

## 🔧 Troubleshooting

### Build fails with "better-sqlite3" error
```bash
npm rebuild better-sqlite3 --runtime=electron --target=28.0.0 --disturl=https://electronjs.org/headers --build-from-source
```

### Snap build fails
```bash
# Clean previous builds
sudo snapcraft clean
npm run build:snap
```

### Flatpak build issues
```bash
# Clear cache
rm -rf .flatpak-builder/
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
```

### AppImage won't run
```bash
chmod +x LocalFlix-*.AppImage
./LocalFlix-*.AppImage
```

### Windows build fails
```bash
# Ensure you're on Windows (requires Windows OS)
npm run build:windows

# Check that .NET Framework is installed
# Install Microsoft Visual C++ Redistributable:
# https://aka.ms/vs/17/release/vc_redist.x64.exe
```

### Windows installer signing (optional)
```bash
# For production releases, sign your installer with a code signing certificate
# Set environment variable:
# CSC_LINK=your_certificate.p12
# CSC_KEY_PASSWORD=your_password
npm run build:nsis
```

---

## 📊 Distribution Priority (Recommended)

### For Linux:
1. **Start here:** GitHub Releases with AppImage + .deb (covers most users)
2. **Expand reach:** Publish to Snap Store (Ubuntu Software Center)
3. **Complete coverage:** Submit to Flathub (Fedora, Pop!_OS, etc.)

### For Windows:
1. **Start here:** GitHub Releases with NSIS installer
2. **Add portable:** Include Portable version for no-install users
3. **Optional:** Publish to Microsoft Store (requires additional setup)

---

## 🎨 Customization

### Change app icon
Replace `build/icon.svg` with your own, then rebuild.

### Change package metadata
Edit `package.json` → `build` section.

### Add more platforms
Add to `linux.target` array in `package.json`.

---

## 📞 Support

- **GitHub Issues:** Report bugs or request features
- **Snap Store:** [snapcraft.io/localflix](https://snapcraft.io) (after publishing)
- **Flathub:** [flathub.org](https://flathub.org) (after approval)

---

**Happy distributing! 🎉**
