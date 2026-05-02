const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const DATA_FILE = path.join(__dirname, '../data/projects.json');

// GET all projects
router.get('/', (req, res) => {
  try {
    const projects = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    res.json({ success: true, projects });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to load projects.' });
  }
});

module.exports = router;
