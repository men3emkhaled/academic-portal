const { Pool } = require('./backend/node_modules/pg');
require('./backend/node_modules/dotenv').config({ path: './backend/.env' });

async function run() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    const res = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'courses';
    `);
    console.log("Neon courses table columns:");
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
run();
