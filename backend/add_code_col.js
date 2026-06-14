require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  try {
    // Add code column
    await pool.query(`
      ALTER TABLE courses
      ADD COLUMN IF NOT EXISTS code VARCHAR(50)
    `);
    console.log('✅ Added code column to courses table');

    // Verify
    const res = await pool.query(`SELECT id, name, code FROM courses LIMIT 5`);
    console.log('Sample rows:', res.rows);

    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
