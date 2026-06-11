const pool = require('./pool');
const projects = require('../data/projects.json');
const settings = require('../data/settings.json');

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🌱 Seeding database from existing JSON files...');

    // Seed projects (skip if any already exist)
    const existing = await client.query('SELECT COUNT(*) FROM projects');
    if (parseInt(existing.rows[0].count) === 0) {
      for (const p of projects) {
        await client.query(
          `INSERT INTO projects (title, description, tech_stack, github_url, live_url, emoji, featured)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [p.title, p.description, p.tech_stack, p.github_url, p.live_url, p.emoji, p.featured]
        );
      }
      console.log(`✅ Seeded ${projects.length} projects`);
    } else {
      console.log('⏭️  Projects already seeded, skipping');
    }

    // Seed settings (upsert each key)
    for (const [key, value] of Object.entries(settings)) {
      await client.query(
        `INSERT INTO settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [key, value]
      );
    }
    console.log(`✅ Seeded ${Object.keys(settings).length} settings`);

    console.log('🎉 Seed complete!');
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  } finally {
    client.release();
    process.exit(0);
  }
}

seed();
