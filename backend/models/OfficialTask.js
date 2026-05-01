const db = require('../config/database');

class OfficialTask {
  static async initializeTable() {
    try {
      // Create official_tasks table
      await db.query(`
        CREATE TABLE IF NOT EXISTS official_tasks (
          id SERIAL PRIMARY KEY,
          course_id INT REFERENCES courses(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          drive_link TEXT,
          requires_submission BOOLEAN DEFAULT FALSE,
          deadline TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // ✅ Add department_id column if it doesn't exist (Migration)
      try {
        await db.query(`
          ALTER TABLE official_tasks 
          ADD COLUMN IF NOT EXISTS department_id INT REFERENCES departments(id) ON DELETE SET NULL,
          ADD COLUMN IF NOT EXISTS requires_submission BOOLEAN DEFAULT FALSE
        `);
      } catch (colErr) {
        console.log('ℹ️ Migration official_tasks failed or already applied');
      }

      // Create student_official_tasks table
      await db.query(`
        CREATE TABLE IF NOT EXISTS student_official_tasks (
          student_id VARCHAR REFERENCES students(id) ON DELETE CASCADE,
          task_id INT REFERENCES official_tasks(id) ON DELETE CASCADE,
          is_completed BOOLEAN DEFAULT FALSE,
          completed_at TIMESTAMP,
          submission_url TEXT,
          grade VARCHAR(50),
          feedback TEXT,
          PRIMARY KEY (student_id, task_id)
        )
      `);
      
      try {
        await db.query(`
          ALTER TABLE student_official_tasks 
          ADD COLUMN IF NOT EXISTS submission_url TEXT,
          ADD COLUMN IF NOT EXISTS grade VARCHAR(50),
          ADD COLUMN IF NOT EXISTS feedback TEXT
        `);
      } catch (colErr) {
        console.log('ℹ️ Migration student_official_tasks failed or already applied');
      }
      
      console.log('✅ Official tasks tables initialized');
    } catch (err) {
      console.error('❌ Error initializing official tasks tables:', err.message);
    }
  }

  static async getAll() {
    const result = await db.query(`
      SELECT ot.*, c.name as course_name, d.name as department_name
      FROM official_tasks ot
      JOIN courses c ON ot.course_id = c.id
      LEFT JOIN departments d ON ot.department_id = d.id
      ORDER BY ot.created_at DESC
    `);
    return result.rows;
  }

  static async getForStudent(studentId) {
    // Get student's department_id first
    const studentRes = await db.query('SELECT department_id FROM students WHERE id = $1', [studentId]);
    const deptId = studentRes.rows[0]?.department_id || null;

    const result = await db.query(`
      SELECT 
        ot.*, 
        c.name as course_name,
        COALESCE(sot.is_completed, FALSE) as is_completed,
        sot.completed_at,
        sot.submission_url,
        sot.grade,
        sot.feedback
      FROM official_tasks ot
      JOIN courses c ON ot.course_id = c.id
      LEFT JOIN student_official_tasks sot ON ot.id = sot.task_id AND sot.student_id = $1
      WHERE ot.department_id IS NULL OR ot.department_id = $2
      ORDER BY ot.deadline ASC NULLS LAST, ot.created_at DESC
    `, [studentId, deptId]);
    return result.rows;
  }

  static async create(course_id, title, description, drive_link, deadline, department_id = null, requires_submission = false) {
    const result = await db.query(
      `INSERT INTO official_tasks (course_id, title, description, drive_link, deadline, department_id, requires_submission)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [course_id, title, description, drive_link, deadline, department_id, requires_submission]
    );
    return result.rows[0];
  }

  static async update(id, course_id, title, description, drive_link, deadline, department_id = null, requires_submission = false) {
    const result = await db.query(
      `UPDATE official_tasks 
       SET course_id = $1, title = $2, description = $3, drive_link = $4, deadline = $5, department_id = $6, requires_submission = $7
       WHERE id = $8 RETURNING *`,
      [course_id, title, description, drive_link, deadline, department_id, requires_submission, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await db.query(`DELETE FROM official_tasks WHERE id = $1`, [id]);
    return true;
  }

  static async toggleComplete(taskId, studentId, isCompleted, submissionUrl = null) {
    const check = await db.query(
      `SELECT * FROM student_official_tasks WHERE student_id = $1 AND task_id = $2`,
      [studentId, taskId]
    );

    if (check.rows.length === 0) {
      const result = await db.query(
        `INSERT INTO student_official_tasks (student_id, task_id, is_completed, completed_at, submission_url)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [studentId, taskId, isCompleted, isCompleted ? new Date() : null, submissionUrl]
      );
      return result.rows[0];
    } else {
      const result = await db.query(
        `UPDATE student_official_tasks 
         SET is_completed = $1, completed_at = $2, submission_url = COALESCE($5, submission_url)
         WHERE student_id = $3 AND task_id = $4 RETURNING *`,
        [isCompleted, isCompleted ? new Date() : null, studentId, taskId, submissionUrl]
      );
      return result.rows[0];
    }
  }

  static async getSubmissions(taskId) {
    const result = await db.query(`
      SELECT 
        sot.*,
        s.name as student_name
      FROM student_official_tasks sot
      JOIN students s ON sot.student_id = s.id
      WHERE sot.task_id = $1
      ORDER BY sot.completed_at DESC NULLS LAST
    `, [taskId]);
    return result.rows;
  }

  static async gradeSubmission(taskId, studentId, grade, feedback) {
    const result = await db.query(
      `UPDATE student_official_tasks 
       SET grade = $1, feedback = $2
       WHERE task_id = $3 AND student_id = $4
       RETURNING *`,
      [grade, feedback, taskId, studentId]
    );
    return result.rows[0];
  }

  static async getRecentSubmissionsForDoctor(doctorId, limit = 5) {
    const result = await db.query(`
      SELECT 
        sot.*,
        s.name as student_name,
        ot.title as task_title,
        c.name as course_name
      FROM student_official_tasks sot
      JOIN students s ON sot.student_id = s.id
      JOIN official_tasks ot ON sot.task_id = ot.id
      JOIN courses c ON ot.course_id = c.id
      JOIN doctor_courses dc ON c.id = dc.course_id
      WHERE dc.doctor_id = $1 AND sot.is_completed = true
      ORDER BY sot.completed_at DESC
      LIMIT $2
    `, [doctorId, limit]);
    return result.rows;
  }
}

module.exports = OfficialTask;
