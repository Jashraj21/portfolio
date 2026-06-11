const express = require('express');
const router = express.Router();
const https = require('https');
const pool = require('../db/pool');

// Fetch repos from GitHub API
function fetchGitHubRepos(username) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/users/${username}/repos?sort=updated&per_page=100`,
      headers: {
        'User-Agent': 'portfolio-server',
        'Accept': 'application/vnd.github.v3+json',
        ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
      },
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

// GET /api/github/repos?username=Jashraj21
// Returns public repos (excluding forks) from GitHub
router.get('/repos', async (req, res) => {
  const username = req.query.username || process.env.GITHUB_USERNAME || 'Jashraj21';
  try {
    const repos = await fetchGitHubRepos(username);

    if (!Array.isArray(repos)) {
      return res.status(502).json({ success: false, message: 'GitHub API error', detail: repos });
    }

    const mapped = repos
      .filter((r) => !r.fork) // skip forks by default
      .map((r) => ({
        name: r.name,
        description: r.description || '',
        html_url: r.html_url,
        homepage: r.homepage || '',
        language: r.language || '',
        topics: r.topics || [],
        stars: r.stargazers_count,
        updated_at: r.updated_at,
      }));

    res.json({ success: true, repos: mapped, username });
  } catch (err) {
    console.error('GitHub fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch GitHub repos.' });
  }
});

// POST /api/github/import
// Body: { projects: [{ title, description, tech_stack, github_url, live_url, emoji, featured }] }
router.post('/import', async (req, res) => {
  const { projects } = req.body;
  if (!Array.isArray(projects) || projects.length === 0) {
    return res.status(400).json({ success: false, message: 'No projects provided.' });
  }
  try {
    const inserted = [];
    for (const p of projects) {
      const result = await pool.query(
        `INSERT INTO projects (title, description, tech_stack, github_url, live_url, emoji, featured)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          p.title || 'Untitled',
          p.description || '',
          p.tech_stack || '',
          p.github_url || '#',
          p.live_url || '#',
          p.emoji || '🚀',
          p.featured || false,
        ]
      );
      inserted.push(result.rows[0]);
    }
    res.json({ success: true, imported: inserted.length, projects: inserted });
  } catch (err) {
    console.error('GitHub import error:', err);
    res.status(500).json({ success: false, message: 'Failed to import projects.' });
  }
});

module.exports = router;
