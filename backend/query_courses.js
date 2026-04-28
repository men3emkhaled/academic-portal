require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function run() {
  const res = await pool.query("SELECT c.id, c.name, d.name as dept_name FROM courses c LEFT JOIN departments d ON c.department_id = d.id;");
  console.log(JSON.stringify(res.rows, null, 2));
  process.exit(0);
}
run();
