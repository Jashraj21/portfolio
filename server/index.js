const express = require('express');
const cors = require('cors');
require('dotenv').config();
const createTables = require('./db/schema');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize DB tables on startup
createTables().catch(err => console.error('Failed to initialize DB:', err));

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    /\.vercel\.app$/,
    'https://jashraaj.xyz',
    'https://www.jashraaj.xyz',
    /\.jashraaj\.xyz$/,
  ],
}));
app.use(express.json());

// Routes
app.use('/api/projects', require('./routes/projects'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/github', require('./routes/github'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Portfolio API is running 🚀' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
