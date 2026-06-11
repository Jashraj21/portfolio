const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const pool = require('../db/pool');
require('dotenv').config();

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// POST — save + email a contact form submission
router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, email and message are required.' });
  }
  try {
    await pool.query(
      `INSERT INTO contacts (name, email, subject, message)
       VALUES ($1, $2, $3, $4)`,
      [name, email, subject || '', message]
    );

    // Send email if configured
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      await transporter.sendMail({
        from: `"Portfolio Contact" <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_USER,
        replyTo: email,
        subject: `📬 New message from ${name}: ${subject || 'Portfolio Contact'}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9f9f9;border-radius:8px;">
            <h2 style="color:#7c3aed;margin-bottom:4px;">New Portfolio Message</h2>
            <p style="color:#666;margin-top:0;">Someone reached out via your portfolio.</p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#666;width:80px;"><strong>Name</strong></td><td>${name}</td></tr>
              <tr><td style="padding:8px 0;color:#666;"><strong>Email</strong></td><td><a href="mailto:${email}" style="color:#7c3aed;">${email}</a></td></tr>
              <tr><td style="padding:8px 0;color:#666;"><strong>Subject</strong></td><td>${subject || '—'}</td></tr>
            </table>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />
            <p style="color:#666;margin-bottom:8px;"><strong>Message:</strong></p>
            <p style="color:#111;background:#fff;padding:16px;border-radius:6px;border-left:4px solid #7c3aed;line-height:1.6;">${message}</p>
            <p style="color:#999;font-size:12px;">Hit Reply to respond directly to ${name}.</p>
          </div>`,
      });
    }

    res.json({ success: true, message: "Message received! I'll be in touch soon." });
  } catch (err) {
    console.error('Contact error:', err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
});

// GET — view all submissions
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');
    res.json({ success: true, contacts: result.rows });
  } catch (err) {
    console.error('GET /contact error:', err);
    res.status(500).json({ success: false, message: 'Failed to load contacts.' });
  }
});

// PATCH — mark as read
router.patch('/:id/read', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE contacts SET read = TRUE WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Contact not found.' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('PATCH /contact/:id/read error:', err);
    res.status(500).json({ success: false });
  }
});

// DELETE — remove a message
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM contacts WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /contact/:id error:', err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
