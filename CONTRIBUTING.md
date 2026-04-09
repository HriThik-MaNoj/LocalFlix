# Contributing to LocalFlix

Thank you for your interest in contributing to LocalFlix! This document provides guidelines and instructions for contributing.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## 🌟 Code of Conduct

This project adheres to a code of conduct that promotes a welcoming and inclusive environment. Please read our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v16 or higher
- **npm** (comes with Node.js)
- **Git**
- **ffmpeg** (optional, for thumbnail features)

### Setup Development Environment

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/LocalFlix.git
cd LocalFlix

# 3. Install dependencies
npm install

# 4. Rebuild native modules for Electron
npm rebuild better-sqlite3 --runtime=electron --target=28.0.0 --disturl=https://electronjs.org/headers --build-from-source

# 5. Start in development mode
npm run dev
```

---

## 🎯 How to Contribute

### Types of Contributions

We welcome various types of contributions:

- **🐛 Bug Fixes** - Fix issues reported in the issue tracker
- **✨ New Features** - Add new functionality
- **🎨 UI/UX Improvements** - Enhance the user interface
- **📚 Documentation** - Improve docs, README, comments
- ** Testing** - Add or improve tests
- **🌐 Localization** - Translate the application
- **⚡ Performance** - Optimize code for better performance
- **🔒 Security** - Improve security practices

### Finding Something to Work On

- Check [open issues](https://github.com/HriThik-MaNoj/LocalFlix/issues) for bugs and feature requests
- Look for issues labeled `good-first-issue` or `help-wanted`
- Review the [project roadmap](#) (if available)

---

## 🔄 Development Workflow

### 1. Create a Branch

Always create a new branch from `main`:

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-123
```

**Branch naming conventions:**
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation changes
- `refactor/description` - Code refactoring
- `test/description` - Test additions or changes

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style and patterns
- Add comments for complex logic
- Keep changes focused and atomic

### 3. Test Your Changes

```bash
# Run in development mode
npm run dev

# Test build process
npm run build:linux  # or build:windows on Windows

# Test the built package
./dist/LocalFlix-*.AppImage  # Linux
# or
dist\LocalFlix-Setup-*.exe   # Windows
```

**Testing checklist:**
- [ ] Feature works as expected
- [ ] No console errors
- [ ] Works on both Linux and Windows (if possible)
- [ ] Doesn't break existing functionality
- [ ] UI looks good and is responsive

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add your feature description"
```

See [Commit Messages](#commit-messages) for conventions.

### 5. Push and Create a Pull Request

```bash
git push origin feature/your-feature-name
```

Then go to GitHub and create a Pull Request against the `main` branch.

---

## 📝 Coding Standards

### JavaScript Style Guide

We follow these general principles:

- **Use ES6+ syntax** - arrow functions, template literals, destructuring
- **Consistent naming:**
  - `camelCase` for variables and functions
  - `PascalCase` for classes
  - `UPPER_CASE` for constants
  - `kebab-case` for file names
- **Semicolons** - Always use semicolons
- **Quotes** - Use single quotes for strings
- **Indentation** - 2 spaces (no tabs)
- **Line length** - Maximum 100 characters
- **No trailing whitespace**

### Code Organization

- **Backend files** (`src/backend/`) - Node.js/Electron main process
- **Frontend files** (`src/frontend/`) - Renderer process (HTML/CSS/JS)
- **Keep concerns separated** - UI logic in frontend, system operations in backend

### Security Guidelines

- **Never expose secrets** - No API keys, passwords, or tokens
- **Use IPC securely** - Validate all inputs from renderer process
- **Context isolation** - Keep `contextIsolation: true` in main.js
- **No eval()** - Never use eval() or new Function()
- **Sanitize user input** - Validate all file paths and user data

### Example Code Style

```javascript
// Good ✅
class MovieScanner {
  constructor() {
    this.videoExtensions = new Set([
      '.mp4', '.mkv', '.avi', '.mov'
    ]);
  }

  async scanDirectory(directoryPath) {
    const movies = [];
    await this._scanRecursive(directoryPath, movies);
    return movies;
  }

  _parseMovieName(fileName) {
    return fileName
      .replace(/\.[^/.]+$/, '')
      .replace(/[._]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

module.exports = MovieScanner;
```

---

## 🧪 Testing

### Manual Testing

Before submitting a PR, manually test:

1. **Happy path** - Normal usage works
2. **Edge cases** - Empty directories, missing files, permissions
3. **Error handling** - Graceful failures with user feedback
4. **Cross-platform** - Test on both Linux and Windows if possible

### Testing Checklist

- [ ] App starts without errors
- [ ] Directory selection works
- [ ] Movies are scanned and displayed
- [ ] Thumbnails generate (if ffmpeg available)
- [ ] Video playback works
- [ ] Progress saves and loads correctly
- [ ] Search and sorting work
- [ ] Keyboard shortcuts function
- [ ] UI is responsive and looks good

---

## 📝 Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only changes
- `style` - Code style changes (formatting, no code change)
- `refactor` - Code change that neither fixes a bug nor adds a feature
- `perf` - Performance improvement
- `test` - Adding or updating tests
- `build` - Build system or external dependencies
- `ci` - CI configuration files
- `chore` - Other changes that don't modify src or test files

### Examples

```bash
# Good examples ✅
feat: add Windows NSIS installer support
fix: resolve path separator issues on Windows
docs: update README with Windows installation guide
feat(player): add playback speed control
fix(scanner): handle filenames with special characters
refactor(thumbnails): optimize lazy loading with IntersectionObserver
ci: add Windows build job to GitHub Actions

# Bad examples ❌
update code
fix stuff
changed some things
wip
```

### Breaking Changes

If your change introduces breaking changes, add `!` after the type:

```bash
feat!: change database schema to support multiple users
```

---

## 🔄 Pull Request Process

### Before Submitting

1. **Update documentation** - If your change affects usage
2. **Test thoroughly** - Follow the testing checklist
3. **Rebase on main** - Ensure your branch is up to date
4. **Squash commits** - Clean up your commit history

### PR Template

When creating a PR, please include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
Describe the testing you performed

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have tested my changes on Linux
- [ ] I have tested my changes on Windows (if applicable)
- [ ] I have updated the documentation
- [ ] My changes don't introduce new warnings or errors
```

### Review Process

1. **Automated checks** - CI will run builds and tests
2. **Code review** - Maintainers will review your code
3. **Address feedback** - Make requested changes
4. **Approval** - Once approved, your PR will be merged
5. **Celebration** - 🎉 Your contribution is now part of LocalFlix!

### After Merge

- Delete your branch
- Pull latest main to stay up to date
- Start working on your next contribution!

---

## 🐛 Reporting Bugs

### Bug Report Template

```markdown
**Description**
A clear and concise description of the bug

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected Behavior**
What you expected to happen

**Actual Behavior**
What actually happened

**Environment:**
- OS: [e.g., Ubuntu 22.04, Windows 11]
- Node.js version: [e.g., 22.0.0]
- LocalFlix version: [e.g., 1.0.0]
- ffmpeg version (if applicable): [e.g., 6.0]

**Screenshots**
If applicable, add screenshots

**Additional Context**
Add any other context about the problem
```

### Before Reporting

- [ ] Check existing issues to avoid duplicates
- [ ] Try to reproduce with latest version
- [ ] Gather system information
- [ ] Include error messages and logs

---

## 💡 Suggesting Features

### Feature Request Template

```markdown
**Problem Statement**
A clear description of the problem this feature solves

**Proposed Solution**
A clear and concise description of what you want to happen

**Alternative Solutions**
Any alternative solutions or features you've considered

**Use Case**
Describe how this feature would be used

**Additional Context**
Mockups, examples, or other context
```

### Feature Guidelines

- Features should align with LocalFlix's purpose
- Consider privacy implications
- Keep the app lightweight and fast
- Maintain cross-platform compatibility

---

##  Learning Resources

If you're new to Electron development:

- [Electron Documentation](https://www.electronjs.org/docs)
- [Electron Quick Start](https://www.electronjs.org/docs/tutorial/quick-start)
- [IPC Communication](https://www.electronjs.org/docs/tutorial/ipc)
- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3)

---

## 🙏 Thank You

Every contribution, no matter how small, makes a difference. Thank you for taking the time to contribute to LocalFlix!

<div align="center">

**[HriThik MaNoj](https://github.com/HriThik-MaNoj)** and all contributors

</div>
