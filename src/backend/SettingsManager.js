const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class SettingsManager {
  constructor() {
    this.settingsPath = path.join(app.getPath('userData'), 'settings.json');
    this.settings = this._loadSettings();
  }

  _loadSettings() {
    try {
      if (fs.existsSync(this.settingsPath)) {
        const data = fs.readFileSync(this.settingsPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error.message);
    }
    return {};
  }

  _saveSettings() {
    try {
      const data = JSON.stringify(this.settings, null, 2);
      fs.writeFileSync(this.settingsPath, data, 'utf8');
    } catch (error) {
      console.error('Error saving settings:', error.message);
    }
  }

  get(key) {
    return this.settings[key] || null;
  }

  set(key, value) {
    this.settings[key] = value;
    this._saveSettings();
  }

  getAll() {
    return { ...this.settings };
  }
}

module.exports = SettingsManager;
