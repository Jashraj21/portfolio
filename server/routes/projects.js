const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET all projects
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects ORDER BY featured DESC, created_at DESC');
    res.json({ success: true, projects: result.rows });
  } catch (err) {
    console.error('GET /projects error:', err);
    res.status(500).json({ success: false, message: 'Failed to load projects.' });
  }
});

// POST — add new project
router.post('/', async (req, res) => {
  const { title, description, tech_stack, github_url, live_url, emoji, featured, image_url } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO projects (title, description, tech_stack, github_url, live_url, emoji, featured, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        title || 'New Project',
        description || '',
        tech_stack || '',
        github_url || '#',
        live_url || '#',
        emoji || '🚀',
        featured || false,
        image_url || null,
      ]
    );
    res.json({ success: true, project: result.rows[0] });
  } catch (err) {
    console.error('POST /projects error:', err);
    res.status(500).json({ success: false, message: 'Failed to add project.' });
  }
});

// PUT — update a project
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, tech_stack, github_url, live_url, emoji, featured, image_url } = req.body;
  try {
    const result = await pool.query(
      `UPDATE projects SET
        title       = COALESCE($1, title),
        description = COALESCE($2, description),
        tech_stack  = COALESCE($3, tech_stack),
        github_url  = COALESCE($4, github_url),
        live_url    = COALESCE($5, live_url),
        emoji       = COALESCE($6, emoji),
        featured    = COALESCE($7, featured),
        image_url   = COALESCE($8, image_url)
       WHERE id = $9 RETURNING *`,
      [title, description, tech_stack, github_url, live_url, emoji, featured, image_url, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }
    res.json({ success: true, project: result.rows[0] });
  } catch (err) {
    console.error('PUT /projects/:id error:', err);
    res.status(500).json({ success: false, message: 'Failed to update project.' });
  }
});

// DELETE — remove a project
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM projects WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /projects/:id error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete project.' });
  }
});

module.exports = router;
