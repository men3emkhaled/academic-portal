const db = require('./backend/config/database');
async function run() {
  const res = await db.query("SELECT c.id, c.name, c.code, d.name as dept_name FROM courses c LEFT JOIN departments d ON c.department_id = d.id WHERE d.code = 'AI' OR c.name ILIKE '%programming%';");
  console.log(res.rows);
  process.exit(0);
}
run();
