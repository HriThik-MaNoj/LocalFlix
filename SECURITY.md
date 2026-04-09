# Security Policy

## Supported Versions

The following versions of LocalFlix are currently supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## Reporting a Vulnerability

We take the security of LocalFlix seriously. If you discover a security vulnerability, please follow these steps:

### 1. **DO NOT** create a public GitHub issue

Public disclosure of security vulnerabilities can put users at risk before a fix is available.

### 2. Report via email

Send a detailed report to: **contact@localflix.app**

Include the following information:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)
- Your contact information for follow-up

### 3. What to expect

- **Acknowledgment:** We will acknowledge receipt of your report within **48 hours**
- **Assessment:** We will assess the vulnerability and determine its impact within **7 days**
- **Fix Timeline:** Critical vulnerabilities will be addressed within **30 days**, others within **90 days**
- **Disclosure:** We will coordinate with you on the disclosure timeline

---

## Security Best Practices

### For Users

1. **Download from official sources only:**
   - GitHub Releases: https://github.com/HriThik-MaNoj/LocalFlix/releases
   - Official package managers (Snap Store, Flathub)

2. **Verify checksums:**
   - Always verify downloaded files match published checksums

3. **Keep LocalFlix updated:**
   - Security patches are released promptly
   - Enable auto-updates when available

4. **Be cautious with movie files:**
   - Only scan directories you trust
   - LocalFlix doesn't execute video files, but malicious files could exploit system codecs

### For Developers

1. **Never commit secrets:**
   - No API keys, passwords, or tokens in code
   - Use environment variables for sensitive data

2. **Validate all inputs:**
   - Sanitize file paths
   - Validate user input
   - Check IPC messages

3. **Keep dependencies updated:**
   - Regularly run `npm audit`
   - Update dependencies promptly
   - Review dependency changes

4. **Follow secure coding practices:**
   - Enable context isolation
   - Disable nodeIntegration in renderer
   - Use preload.js for secure IPC
   - Never use eval() or new Function()

---

## Known Security Considerations

### File Path Handling

LocalFlix reads and processes video files from your local filesystem. While we implement path validation:

- Only scan directories you trust
- Malicious filenames could potentially exploit edge cases
- Report any path traversal vulnerabilities immediately

### ffmpeg Integration

ffmpeg is executed to generate thumbnails and detect video duration:

- Commands are properly escaped
- Timeout limits prevent resource exhaustion
- Output is sanitized
- Report any command injection vulnerabilities

### Database Security

SQLite database stores local progress data:

- No SQL injection risk (using parameterized queries)
- Database is local-only (no network exposure)
- Report any database-related vulnerabilities

### Electron Security

We follow Electron security best practices:

- ✅ Context isolation enabled
- ✅ Node integration disabled in renderer
- ✅ Remote module disabled
- ✅ WebSecurity enabled
- ✅ No eval() usage
- ✅ Sandboxed renderer

If you find any security bypass, report it immediately.

---

## Security Updates

Security updates will be released as:

- **Patch versions** (e.g., 1.0.1) for critical vulnerabilities
- **Minor versions** (e.g., 1.1.0) for non-critical fixes
- Announced in [CHANGELOG.md](CHANGELOG.md)
- Tagged with `[SECURITY]` in release notes

---

## Dependency Security

We monitor dependencies for vulnerabilities:

```bash
# Run security audit
npm audit

# Fix automatically fixable issues
npm audit fix

# For breaking changes
npm audit fix --force
```

Critical dependency vulnerabilities are prioritized and patched immediately.

---

## Acknowledgments

We appreciate responsible disclosure and will acknowledge security researchers who help improve our security (unless they prefer to remain anonymous).

**Security Hall of Fame:**
- *(Contributors will be added here)*

---

## Contact

- **Security Email:** contact@localflix.app
- **GitHub Issues:** (For non-security issues only)
- **Repository:** https://github.com/HriThik-MaNoj/LocalFlix

---

**Thank you for helping keep LocalFlix secure!** 🔒
