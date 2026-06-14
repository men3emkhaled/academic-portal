require('./backend/node_modules/dotenv').config({ path: './backend/.env' });
const { Pool } = require('./backend/node_modules/pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const newAviationCourses = [
  // Semester 1
  { code: 'AV111', name: 'Principles of flight 1', semester: 1, credit_hours: 2 },
  { code: 'CAV112', name: 'Introduction to Computational Thinking', semester: 1, credit_hours: 3 },
  { code: 'CAV113', name: 'Mathematics 1', semester: 1, credit_hours: 3 },
  { code: 'CAV114', name: 'English', semester: 1, credit_hours: 2 },
  { code: 'CAV115', name: 'Fundamentals of Management', semester: 1, credit_hours: 2 },
  { code: 'CIS116', name: 'Fundamentals of Economics and Feasibility Study', semester: 1, credit_hours: 2 },

  // Semester 2
  { code: 'AV121', name: 'Air law 1', semester: 2, credit_hours: 2 },
  { code: 'AV122', name: 'Air Navigation', semester: 2, credit_hours: 2 },
  { code: 'CAV122', name: 'Mathematics 2', semester: 2, credit_hours: 2 },
  { code: 'CAV123', name: 'Electronic Physics', semester: 2, credit_hours: 2 },
  { code: 'CIS124', name: 'Digital Logic Design', semester: 2, credit_hours: 3 },
  { code: 'CIS125', name: 'Discrete Structures', semester: 2, credit_hours: 2 },
  { code: 'CIS126', name: 'Computer Programming', semester: 2, credit_hours: 3 },
  { code: 'CAV127', name: 'Business Management', semester: 2, credit_hours: 2 },
  { code: 'CIS128', name: 'Communication and Negotiation Skills', semester: 2, credit_hours: 2 },

  // Semester 3
  { code: 'AV211', name: 'Aviation Meteorology 1', semester: 3, credit_hours: 2 },
  { code: 'AV212', name: 'Electricity', semester: 3, credit_hours: 3 },
  { code: 'AV213', name: 'Air law 2', semester: 3, credit_hours: 2 },
  { code: 'CIS214', name: 'Data Structures and Algorithms', semester: 3, credit_hours: 3 },
  { code: 'CIS215', name: 'Introduction to Information Systems', semester: 3, credit_hours: 2 },
  { code: 'CIS216', name: 'Operations Research', semester: 3, credit_hours: 3 },
  { code: 'CAV217', name: 'Strategic Planning', semester: 3, credit_hours: 2 },
  { code: 'CIS218', name: 'Entrepreneurship and Innovation', semester: 3, credit_hours: 2 },
  { code: 'CIS219', name: 'Organizational Behavior', semester: 3, credit_hours: 2 },

  // Semester 4
  { code: 'AV221', name: 'Instruments Systems', semester: 4, credit_hours: 3 },
  { code: 'AV222', name: 'Air Traffic Control System', semester: 4, credit_hours: 3 },
  { code: 'CIS223', name: 'Database Systems', semester: 4, credit_hours: 3 },
  { code: 'CIS224', name: 'Computer Organization and Architecture', semester: 4, credit_hours: 3 },
  { code: 'CIS225', name: 'Operating Systems', semester: 4, credit_hours: 3 },
  { code: 'CAV226', name: 'Human Rights and Anticorruption', semester: 4, credit_hours: 2 },
  { code: 'AV227', name: 'Unmanned aircraft', semester: 4, credit_hours: 3 },
  { code: 'AV228', name: 'Principles of flight 2', semester: 4, credit_hours: 3 },

  // Semester 5
  { code: 'AV311', name: 'Radio Navigation', semester: 5, credit_hours: 3 },
  { code: 'AV312', name: 'Aeronautical Information Management System', semester: 5, credit_hours: 3 },
  { code: 'CIS313', name: 'Systems Analysis and Design', semester: 5, credit_hours: 3 },
  { code: 'CIS314', name: 'Computer Networks', semester: 5, credit_hours: 3 },
  { code: 'CIS315', name: 'Modeling and Simulation', semester: 5, credit_hours: 3 },
  { code: 'AV316', name: 'Flight Planning & Monitoring', semester: 5, credit_hours: 3 },
  { code: 'AV317', name: 'Mass and Balance', semester: 5, credit_hours: 3 },

  // Semester 6
  { code: 'AV321', name: 'Aviation Meteorology 2', semester: 6, credit_hours: 2 },
  { code: 'AV322', name: 'CNS/ATM', semester: 6, credit_hours: 2 },
  { code: 'CIS323', name: 'Artificial Intelligence', semester: 6, credit_hours: 3 },
  { code: 'CIS324', name: 'Geographical Information Systems', semester: 6, credit_hours: 3 },
  { code: 'CIS325', name: 'Aviation Information System', semester: 6, credit_hours: 3 },
  { code: 'CAV326', name: 'Social, Ethical, and Professional Issues', semester: 6, credit_hours: 2 },
  { code: 'AV327', name: 'Operational Procedures', semester: 6, credit_hours: 3 },
  { code: 'AV328', name: 'Aircraft Performance', semester: 6, credit_hours: 3 },

  // Semester 7
  { code: 'AV411', name: 'Aerodromes', semester: 7, credit_hours: 3 },
  { code: 'AV412', name: 'Aviation English', semester: 7, credit_hours: 3 },
  { code: 'CIS413', name: 'Introduction to Big Data', semester: 7, credit_hours: 3 },
  { code: 'CIS414', name: 'Introduction to Cloud Computing', semester: 7, credit_hours: 3 },
  { code: 'CIS415', name: 'Project 1', semester: 7, credit_hours: 3 },
  { code: 'AV416', name: 'Aviation Safety Management Systems', semester: 7, credit_hours: 3 },
  { code: 'AV417', name: 'Search and Rescue', semester: 7, credit_hours: 3 },

  // Semester 8
  { code: 'AV421', name: 'Aviation Medicine', semester: 8, credit_hours: 2 },
  { code: 'AV422', name: 'Human Factors For Aviation', semester: 8, credit_hours: 2 },
  { code: 'AV423', name: 'Satellite Navigation', semester: 8, credit_hours: 3 },
  { code: 'CAV424', name: 'Report Writing and Presentation Skills', semester: 8, credit_hours: 2 },
  { code: 'CIS425', name: 'Introduction to Cybersecurity', semester: 8, credit_hours: 3 },
  { code: 'CIS426', name: 'Introduction to Internet of Things', semester: 8, credit_hours: 3 },
  { code: 'CIS427', name: 'Project 2', semester: 8, credit_hours: 3 }
];

// Map of current names in DB to their new code/name to match them precisely without deleting
const dbNameToNewCourse = {
  'Mathematics 2': 'CAV122',
  'Discrete Mathematics': 'CIS125',
  'Physics': 'CAV123',
  'Aviation Law 1': 'AV121',
  'Communication and Negotiation Skills': 'CIS128',
  'Digital Logic Design': 'CIS124',
  'Air Navigation': 'AV122',
  'Computer Programming 1': 'CIS126'
};

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Drop check constraint on semester to allow values 1-8 (or 1-12)
    console.log('Dropping existing semester check constraint...');
    await client.query('ALTER TABLE courses DROP CONSTRAINT IF EXISTS courses_semester_check');
    
    // Add a new constraint for semesters 1-12
    await client.query('ALTER TABLE courses ADD CONSTRAINT courses_semester_check CHECK (semester >= 1 AND semester <= 12)');
    console.log('Added updated semester check constraint (1-12).');

    // Fetch current courses in Aviation (department_id = 2)
    const currentRes = await client.query('SELECT * FROM courses WHERE department_id = 2');
    console.log(`Found ${currentRes.rows.length} existing aviation courses in DB.`);

    const updatedIds = new Set();

    for (const dbRow of currentRes.rows) {
      const matchCode = dbNameToNewCourse[dbRow.name];
      if (matchCode) {
        const newCourseDef = newAviationCourses.find(c => c.code === matchCode);
        if (newCourseDef) {
          console.log(`Updating existing course ID ${dbRow.id} "${dbRow.name}" -> Code: ${newCourseDef.code}, Name: "${newCourseDef.name}", Sem: ${newCourseDef.semester}, Credits: ${newCourseDef.credit_hours}`);
          await client.query(
            `UPDATE courses 
             SET name = $1, code = $2, semester = $3, credit_hours = $4, updated_at = CURRENT_TIMESTAMP
             WHERE id = $5`,
            [newCourseDef.name, newCourseDef.code, newCourseDef.semester, newCourseDef.credit_hours, dbRow.id]
          );
          updatedIds.add(matchCode);
        }
      } else {
        console.log(`⚠️ Existing course "${dbRow.name}" (ID ${dbRow.id}) could not be matched automatically.`);
      }
    }

    // Now insert the rest of the courses
    for (const c of newAviationCourses) {
      if (updatedIds.has(c.code)) {
        continue; // Already updated, skip insertion
      }
      
      console.log(`Inserting new course: ${c.code} - ${c.name}`);
      await client.query(
        `INSERT INTO courses (name, semester, description, max_score, midterm_max, practical_max, oral_max, department_id, code, credit_hours) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [c.name, c.semester, '.', 100, 40, 30, 30, 2, c.code, c.credit_hours]
      );
    }
    
    await client.query('COMMIT');
    console.log('✅ Update and Insertion finished successfully! No data was deleted!');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', e);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
