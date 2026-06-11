const pool = require('./pool');

const createTables = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Projects table
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id          SERIAL PRIMARY KEY,
        title       VARCHAR(255) NOT NULL,
        description TEXT,
        tech_stack  TEXT,
        github_url  TEXT DEFAULT '#',
        live_url    TEXT DEFAULT '#',
        emoji       VARCHAR(10) DEFAULT '🚀',
        featured    BOOLEAN DEFAULT FALSE,
        created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Contacts table (contact form submissions)
    await client.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(255) NOT NULL,
        email      VARCHAR(255) NOT NULL,
        subject    VARCHAR(255),
        message    TEXT NOT NULL,
        read       BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Settings table (key-value store for social links, profile info, etc.)
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key   VARCHAR(100) PRIMARY KEY,
        value TEXT
      );
    `);

    await client.query('COMMIT');
    console.log('✅ All database tables ready');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating tables:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = createTables;
