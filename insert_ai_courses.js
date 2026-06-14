require('./backend/node_modules/dotenv').config({ path: './backend/.env' });
const { Pool } = require('./backend/node_modules/pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const aiCourses = [
  // Semester 3 (Year Two, Semester A)
  { code: 'CS200', name: 'Data Structures', semester: 3, credit_hours: 3 },
  { code: 'IT200', name: 'Computer Architecture', semester: 3, credit_hours: 3 },
  { code: 'IS200', name: 'Database Systems', semester: 3, credit_hours: 3 },
  { code: 'IT201', name: 'Computer Graphics', semester: 3, credit_hours: 3 },
  { code: 'CS201', name: 'Operating Systems', semester: 3, credit_hours: 3 },
  { code: 'HU101', name: 'Report Writing and Presentation Skills', semester: 3, credit_hours: 2 },

  // Semester 4 (Year Two, Semester B)
  { code: 'IS201', name: 'Software Engineering', semester: 4, credit_hours: 3 },
  { code: 'CS202', name: 'Algorithms', semester: 4, credit_hours: 3 },
  { code: 'IT202', name: 'Computer Networking', semester: 4, credit_hours: 3 },
  { code: 'CS203', name: 'Artificial Intelligence', semester: 4, credit_hours: 3 },
  { code: 'DS200', name: 'Data Science', semester: 4, credit_hours: 3 },
  { code: 'HU_EL1', name: 'Humanities Elective (1)', semester: 4, credit_hours: 3 },

  // Semester 5 (Year Three, Semester A)
  { code: 'IT302', name: 'Introduction to Internet of Things', semester: 5, credit_hours: 3 },
  { code: 'CS301', name: 'Machine Learning', semester: 5, credit_hours: 3 },
  { code: 'IS300', name: 'Data Mining and Predictive Analytics', semester: 5, credit_hours: 3 },
  { code: 'BS104_AI', name: 'Graph Algorithms', semester: 5, credit_hours: 3 }, // using BS104_AI to distinguish from BS104 in Semester 1
  { code: 'BS105', name: 'Numerical Analysis', semester: 5, credit_hours: 3 },
  { code: 'HU_EL2', name: 'Humanities Elective (2)', semester: 5, credit_hours: 2 },

  // Semester 6 (Year Three, Semester B)
  { code: 'CS412', name: 'Intelligent Agents', semester: 6, credit_hours: 3 },
  { code: 'DS301', name: 'Computational Intelligence', semester: 6, credit_hours: 3 },
  { code: 'IS400', name: 'Big Data Analytics', semester: 6, credit_hours: 3 },
  { code: 'CS400', name: 'High Performance Computing', semester: 6, credit_hours: 3 },
  { code: 'CS402', name: 'Distributed and Concurrent Algorithms', semester: 6, credit_hours: 3 },
  { code: 'HU_EL3', name: 'Humanities Elective (3)', semester: 6, credit_hours: 2 },

  // Semester 7 (Year Four, Semester A)
  { code: 'CS407', name: 'Natural Language Processing', semester: 7, credit_hours: 3 },
  { code: 'IS414', name: 'Data Analytics Programming', semester: 7, credit_hours: 3 },
  { code: 'IT403', name: 'Computer Vision', semester: 7, credit_hours: 3 },
  { code: 'AI_EL1', name: 'Specialization Elective (1)', semester: 7, credit_hours: 3 },
  { code: 'AI_EL2', name: 'Specialization Elective (2)', semester: 7, credit_hours: 3 },
  { code: 'AI_PRJ1', name: 'Project 1', semester: 7, credit_hours: 3 },

  // Semester 8 (Year Four, Semester B)
  { code: 'IS404', name: 'Web & Social Media Analytics', semester: 8, credit_hours: 3 },
  { code: 'IT405', name: 'Robotics', semester: 8, credit_hours: 3 },
  { code: 'CS404', name: 'Neural networks and deep learning', semester: 8, credit_hours: 3 },
  { code: 'AI_EL3', name: 'Specialization Elective (3)', semester: 8, credit_hours: 3 },
  { code: 'AI_EL4', name: 'Specialization Elective (4)', semester: 8, credit_hours: 3 },
  { code: 'AI_PRJ2', name: 'Project 2', semester: 8, credit_hours: 3 }
];

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify AI department exists (id = 5)
    const deptRes = await client.query('SELECT * FROM departments WHERE id = 5');
    if (deptRes.rows.length === 0) {
      throw new Error('Department of Artificial Intelligence (id = 5) not found!');
    }
    console.log('Found Department:', deptRes.rows[0].name);

    for (const c of aiCourses) {
      // Check if course already exists by code or name in this department
      const existsRes = await client.query(
        'SELECT id FROM courses WHERE department_id = 5 AND (code = $1 OR name = $2)',
        [c.code, c.name]
      );

      if (existsRes.rows.length > 0) {
        console.log(`Course ${c.code} - "${c.name}" already exists. Updating it...`);
        await client.query(
          `UPDATE courses 
           SET name = $1, semester = $2, credit_hours = $3, updated_at = CURRENT_TIMESTAMP
           WHERE department_id = 5 AND (code = $4 OR name = $5)`,
          [c.name, c.semester, c.credit_hours, c.code, c.name]
        );
      } else {
        console.log(`Inserting new AI course: ${c.code} - ${c.name}`);
        await client.query(
          `INSERT INTO courses (name, semester, description, max_score, midterm_max, practical_max, oral_max, department_id, code, credit_hours) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [c.name, c.semester, '.', 100, 40, 30, 30, 5, c.code, c.credit_hours]
        );
      }
    }

    // Clear Redis cache pattern to ensure changes reflect immediately
    const { clearCachePattern } = require('./backend/utils/cache');
    await clearCachePattern('courses:*');
    console.log('Cleared Redis Cache for courses.');

    await client.query('COMMIT');
    console.log('✅ Artificial Intelligence Semesters 3-8 courses added successfully!');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ Insertion failed:', e);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
