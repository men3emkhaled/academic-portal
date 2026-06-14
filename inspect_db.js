require('./backend/node_modules/dotenv').config({ path: './backend/.env' });
const { Pool } = require('./backend/node_modules/pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

(async () => {
  const client = await pool.connect();

  // student_courses structure
  const scRes = await client.query("SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'student_courses' ORDER BY ordinal_position");
  console.log('=== STUDENT_COURSES TABLE STRUCTURE ===');
  scRes.rows.forEach(r => console.log(r.column_name, '|', r.data_type, '|', r.column_default));

  // Sample student_courses
  const scSample = await client.query('SELECT * FROM student_courses LIMIT 5');
  console.log('\n=== SAMPLE STUDENT_COURSES ===');
  scSample.rows.forEach(r => console.log(JSON.stringify(r)));

  // timetable structure
  const ttRes = await client.query("SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'timetable' ORDER BY ordinal_position");
  console.log('\n=== TIMETABLE TABLE STRUCTURE ===');
  ttRes.rows.forEach(r => console.log(r.column_name, '|', r.data_type, '|', r.column_default));

  // Sample timetable
  const ttSample = await client.query('SELECT * FROM timetable LIMIT 3');
  console.log('\n=== SAMPLE TIMETABLE ===');
  ttSample.rows.forEach(r => console.log(JSON.stringify(r)));

  // Level distribution of students
  const levels = await client.query('SELECT level, department_id, count(*) FROM students GROUP BY level, department_id ORDER BY department_id, level');
  console.log('\n=== STUDENT LEVEL DISTRIBUTION ===');
  levels.rows.forEach(r => console.log(JSON.stringify(r)));

  // exam_schedules structure
  const esRes = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'exam_schedules' ORDER BY ordinal_position");
  console.log('\n=== EXAM_SCHEDULES TABLE STRUCTURE ===');
  esRes.rows.forEach(r => console.log(r.column_name, '|', r.data_type));

  client.release();
  await pool.end();
  process.exit(0);
})();
