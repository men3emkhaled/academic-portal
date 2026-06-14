require('./backend/node_modules/dotenv').config({ path: './backend/.env' });
const { Pool } = require('./backend/node_modules/pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Add batch column to students
    console.log('Adding batch column to students...');
    await client.query(`
      ALTER TABLE students 
      ADD COLUMN IF NOT EXISTS batch INTEGER DEFAULT 2025;
    `);

    // Update all existing null batches to 2025
    await client.query(`
      UPDATE students SET batch = 2025 WHERE batch IS NULL;
    `);

    // 2. Add batch column to resources
    console.log('Adding batch column to resources...');
    await client.query(`
      ALTER TABLE resources 
      ADD COLUMN IF NOT EXISTS batch INTEGER DEFAULT 2025;
    `);

    // Update existing
    await client.query(`
      UPDATE resources SET batch = 2025 WHERE batch IS NULL;
    `);

    // 3. Add batch column to material_hub_posts
    console.log('Adding batch column to material_hub_posts...');
    await client.query(`
      ALTER TABLE material_hub_posts 
      ADD COLUMN IF NOT EXISTS batch INTEGER DEFAULT 2025;
    `);

    // Update existing
    await client.query(`
      UPDATE material_hub_posts SET batch = 2025 WHERE batch IS NULL;
    `);

    await client.query('COMMIT');
    console.log('✅ Batch columns added successfully!');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to run migration:', e);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
