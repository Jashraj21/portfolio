const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const DATA_FILE = path.join(__dirname, '../data/contacts.json');

// POST — save a contact form submission
router.post('/', (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, email and message are required.' });
  }

  try {
    const contacts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    const newEntry = {
      id: Date.now(),
      name,
      email,
      subject: subject || '',
      message,
      created_at: new Date().toISOString(),
    };
    contacts.push(newEntry);
    fs.writeFileSync(DATA_FILE, JSON.stringify(contacts, null, 2));
    res.json({ success: true, message: "Message received! I'll be in touch soon." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
});

// GET — view all submissions
router.get('/', (req, res) => {
  try {
    const contacts = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    res.json({ success: true, contacts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load contacts.' });
  }
});

module.exports = router;
