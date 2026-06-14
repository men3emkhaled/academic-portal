require('./backend/node_modules/dotenv').config({ path: './backend/.env' });
const db = require('./backend/config/database');
async function run() {
  const depts = await db.pool.query("SELECT * FROM departments;");
  console.log("DEPARTMENTS:", depts.rows);
  const res = await db.pool.query("SELECT c.id, c.name, c.code, c.semester, c.credit_hours, c.department_id, d.name as dept_name FROM courses c LEFT JOIN departments d ON c.department_id = d.id;");
  console.log("COURSES:", res.rows);
  process.exit(0);
}
run();
