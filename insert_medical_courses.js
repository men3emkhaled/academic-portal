require('./backend/node_modules/dotenv').config({ path: './backend/.env' });
const { Pool } = require('./backend/node_modules/pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const medicalCourses = [
  // Semester 1 (Year One, Semester A)
  { code: 'BS001/BS002', name: 'Qualifying Mathematics or Qualifying Biology', semester: 1, credit_hours: 0 },
  { code: 'CS100', name: 'Computer Programming I', semester: 1, credit_hours: 3 },
  { code: 'BS100', name: 'Mathematics I', semester: 1, credit_hours: 3 },
  { code: 'BS102', name: 'Electronic Physics', semester: 1, credit_hours: 3 },
  { code: 'IT100', name: 'Digital Logic Design', semester: 1, credit_hours: 3 },
  { code: 'IS100', name: 'Introduction to Medical Informatics', semester: 1, credit_hours: 3 },
  { code: 'HU100', name: 'English', semester: 1, credit_hours: 2 },

  // Semester 2 (Year One, Semester B)
  { code: 'CS101', name: 'Computer Programming II', semester: 2, credit_hours: 3 },
  { code: 'BS101', name: 'Mathematics II', semester: 2, credit_hours: 3 },
  { code: 'BS103', name: 'Discrete Mathematics', semester: 2, credit_hours: 3 },
  { code: 'BS104', name: 'Biostatistics', semester: 2, credit_hours: 3 },
  { code: 'MED100', name: 'Anatomy and Physiology', semester: 2, credit_hours: 3 },
  { code: 'HU101', name: 'Report Writing and Presentation Skills', semester: 2, credit_hours: 2 },

  // Semester 3 (Year Two, Semester A)
  { code: 'CS200', name: 'Data Structures and Algorithms', semester: 3, credit_hours: 3 },
  { code: 'DS200', name: 'Operations Research for Health Care', semester: 3, credit_hours: 3 },
  { code: 'IS201', name: 'System Analysis and Design for Health Care', semester: 3, credit_hours: 3 },
  { code: 'IT200', name: 'Computer Architecture', semester: 3, credit_hours: 3 },
  { code: 'MED200', name: 'Microbiology and Parasitology', semester: 3, credit_hours: 3 },
  { code: 'HU200', name: 'Ethical Issues in Health Care and Anti-Corruption', semester: 3, credit_hours: 2 },

  // Semester 4 (Year Two, Semester B)
  { code: 'IS201_DB', name: 'Database Systems in Health Care', semester: 4, credit_hours: 3 },
  { code: 'IT201', name: 'Medical Multimedia', semester: 4, credit_hours: 3 },
  { code: 'CS201', name: 'Operating Systems', semester: 4, credit_hours: 3 },
  { code: 'DS201', name: 'Modeling and Simulation for Health Care', semester: 4, credit_hours: 3 },
  { code: 'MED201', name: 'Clinical Biochemistry and Hematology', semester: 4, credit_hours: 3 },
  { code: 'MED_HU_EL1', name: 'Humanities Elective (1)', semester: 4, credit_hours: 2 },

  // Semester 5 (Year Three, Semester A)
  { code: 'IS300_GIS', name: 'Geographical Information Systems for Health Care', semester: 5, credit_hours: 3 },
  { code: 'IT300', name: 'Telecommunications and Computer Networking in Health Care', semester: 5, credit_hours: 3 },
  { code: 'CS300', name: 'Artificial Intelligence in Health Care', semester: 5, credit_hours: 3 },
  { code: 'IS300_DBM', name: 'Health Care Database Management', semester: 5, credit_hours: 3 },
  { code: 'MED300', name: 'Basics of Histopathology', semester: 5, credit_hours: 3 },
  { code: 'MED_HU_EL2', name: 'Humanities Elective (2)', semester: 5, credit_hours: 2 },

  // Semester 6 (Year Three, Semester B)
  { code: 'IS301', name: 'Medical Decisions Support Systems', semester: 6, credit_hours: 3 },
  { code: 'DS300', name: 'Information Systems Project Management in Health Care', semester: 6, credit_hours: 3 },
  { code: 'MED301', name: 'Clinical Pharmacology and Drug Development', semester: 6, credit_hours: 3 },
  { code: 'IT301', name: 'Medical Signal Processing', semester: 6, credit_hours: 3 },
  { code: 'MED302', name: 'Public Health Informatics', semester: 6, credit_hours: 2 },
  { code: 'MED_HU_EL3', name: 'Humanities Elective (3)', semester: 6, credit_hours: 2 },

  // Semester 7 (Year Four, Semester A)
  { code: 'IT400', name: 'Medical Image Processing', semester: 7, credit_hours: 3 },
  { code: 'IS400', name: 'Information Security in Health Care', semester: 7, credit_hours: 3 },
  { code: 'IS401', name: 'Big Data Analysis in Health Care', semester: 7, credit_hours: 3 },
  { code: 'MED_EL1', name: 'Elective (1)', semester: 7, credit_hours: 3 },
  { code: 'MED_EL2', name: 'Elective (2)', semester: 7, credit_hours: 3 },
  { code: 'MED_PRJ1', name: 'Project 1', semester: 7, credit_hours: 3 },

  // Semester 8 (Year Four, Semester B)
  { code: 'IS402', name: 'Process Improvement in Health Care', semester: 8, credit_hours: 3 },
  { code: 'IS403', name: 'Medical Data Warehouses and Data Mining', semester: 8, credit_hours: 3 },
  { code: 'CS400_HCI', name: 'Human-Computer Interaction in Health Care', semester: 8, credit_hours: 3 }, // using CS400_HCI to avoid duplicates
  { code: 'MED_EL3', name: 'Elective (3)', semester: 8, credit_hours: 3 },
  { code: 'MED_EL4', name: 'Elective (4)', semester: 8, credit_hours: 3 },
  { code: 'MED_PRJ2', name: 'Project 2', semester: 8, credit_hours: 3 }
];

// Mapping existing DB course names to their new codes
const dbNameToNewCourse = {
  'Mathematics 2': 'BS101',
  'Programming 2': 'CS101',
  'Discrete Mathematics': 'BS103',
  'Statistics and Probability': 'BS104',
  'Anatomy': 'MED100',
  'Social Ethical': 'HU200'
};

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Fetch current courses in Medical Sciences (department_id = 3)
    const currentRes = await client.query('SELECT * FROM courses WHERE department_id = 3');
    console.log(`Found ${currentRes.rows.length} existing medical informatics courses in DB.`);

    const updatedCodes = new Set();

    for (const dbRow of currentRes.rows) {
      const matchCode = dbNameToNewCourse[dbRow.name];
      if (matchCode) {
        const newCourseDef = medicalCourses.find(c => c.code === matchCode);
        if (newCourseDef) {
          console.log(`Updating existing course ID ${dbRow.id} "${dbRow.name}" -> Code: ${newCourseDef.code}, Name: "${newCourseDef.name}", Sem: ${newCourseDef.semester}, Credits: ${newCourseDef.credit_hours}`);
          await client.query(
            `UPDATE courses 
             SET name = $1, code = $2, semester = $3, credit_hours = $4, updated_at = CURRENT_TIMESTAMP
             WHERE id = $5`,
            [newCourseDef.name, newCourseDef.code, newCourseDef.semester, newCourseDef.credit_hours, dbRow.id]
          );
          updatedCodes.add(matchCode);
        }
      } else {
        console.log(`⚠️ Existing course "${dbRow.name}" (ID ${dbRow.id}) could not be matched automatically.`);
      }
    }

    // Now insert the rest of the courses
    for (const c of medicalCourses) {
      if (updatedCodes.has(c.code)) {
        continue; // Already updated, skip insertion
      }
      
      console.log(`Inserting new Medical Informatics course: ${c.code} - ${c.name}`);
      await client.query(
        `INSERT INTO courses (name, semester, description, max_score, midterm_max, practical_max, oral_max, department_id, code, credit_hours) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [c.name, c.semester, '.', 100, 40, 30, 30, 3, c.code, c.credit_hours]
      );
    }
    
    // Clear Redis Cache
    const { clearCachePattern } = require('./backend/utils/cache');
    await clearCachePattern('courses:*');
    console.log('Cleared Redis cache for courses.');

    await client.query('COMMIT');
    console.log('✅ Medical Informatics all 8 semesters courses updated and inserted successfully!');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', e);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
