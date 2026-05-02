const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const DATA_FILE = path.join(__dirname, '../data/settings.json');

const readSettings = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
const writeSettings = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// GET settings
router.get('/', (req, res) => {
  try {
    res.json({ success: true, settings: readSettings() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load settings.' });
  }
});

// PUT — update settings
router.put('/', (req, res) => {
  try {
    const current = readSettings();
    const updated = { ...current, ...req.body };
    writeSettings(updated);
    res.json({ success: true, settings: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save settings.' });
  }
});

module.exports = router;
