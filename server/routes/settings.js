const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// Helper: convert rows array to a plain object { key: value, ... }
const rowsToObject = (rows) =>
  rows.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {});

// GET settings — returns a flat object like the old settings.json
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT key, value FROM settings');
    res.json({ success: true, settings: rowsToObject(result.rows) });
  } catch (err) {
    console.error('GET /settings error:', err);
    res.status(500).json({ success: false, message: 'Failed to load settings.' });
  }
});

// PUT — upsert all provided key-value pairs
router.put('/', async (req, res) => {
  const updates = req.body; // e.g. { github: '...', linkedin: '...' }
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const [key, value] of Object.entries(updates)) {
        await client.query(
          `INSERT INTO settings (key, value) VALUES ($1, $2)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
          [key, value]
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    // Return the full updated settings
    const result = await pool.query('SELECT key, value FROM settings');
    res.json({ success: true, settings: rowsToObject(result.rows) });
  } catch (err) {
    console.error('PUT /settings error:', err);
    res.status(500).json({ success: false, message: 'Failed to save settings.' });
  }
});

module.exports = router;
