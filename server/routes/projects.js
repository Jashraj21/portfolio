const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const DATA_FILE = path.join(__dirname, '../data/projects.json');

const readProjects = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
const writeProjects = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// GET all projects
router.get('/', (req, res) => {
  try {
    res.json({ success: true, projects: readProjects() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load projects.' });
  }
});

// POST — add new project
router.post('/', (req, res) => {
  try {
    const projects = readProjects();
    const newProject = {
      id: Date.now(),
      title: req.body.title || 'New Project',
      description: req.body.description || '',
      tech_stack: req.body.tech_stack || '',
      github_url: req.body.github_url || '#',
      live_url: req.body.live_url || '#',
      emoji: req.body.emoji || '🚀',
      featured: req.body.featured || false,
    };
    projects.push(newProject);
    writeProjects(projects);
    res.json({ success: true, project: newProject });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add project.' });
  }
});

// PUT — update a project
router.put('/:id', (req, res) => {
  try {
    const projects = readProjects();
    const idx = projects.findIndex((p) => String(p.id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ success: false, message: 'Project not found.' });
    projects[idx] = { ...projects[idx], ...req.body };
    writeProjects(projects);
    res.json({ success: true, project: projects[idx] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update project.' });
  }
});

// DELETE — remove a project
router.delete('/:id', (req, res) => {
  try {
    const projects = readProjects();
    const filtered = projects.filter((p) => String(p.id) !== String(req.params.id));
    writeProjects(filtered);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete project.' });
  }
});

module.exports = router;
