const db = require('../config/database');

class OfficialTask {
  static async initializeTable() {
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS official_tasks (
          id SERIAL PRIMARY KEY,
          course_id INT REFERENCES courses(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          drive_link TEXT NOT NULL,
          deadline TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await db.query(`
        CREATE TABLE IF NOT EXISTS student_official_tasks (
          student_id VARCHAR REFERENCES students(id) ON DELETE CASCADE,
          task_id INT REFERENCES official_tasks(id) ON DELETE CASCADE,
          is_completed BOOLEAN DEFAULT FALSE,
          completed_at TIMESTAMP,
          PRIMARY KEY (student_id, task_id)
        )
      `);
      console.log('✅ Official tasks tables initialized');
    } catch (err) {
      console.error('❌ Error initializing official tasks tables:', err.message);
    }
  }

  static async getAll() {
    const result = await db.query(`
      SELECT ot.*, c.name as course_name 
      FROM official_tasks ot
      JOIN courses c ON ot.course_id = c.id
      ORDER BY ot.created_at DESC
    `);
    return result.rows;
  }

  static async getForStudent(studentId) {
    const result = await db.query(`
      SELECT 
        ot.*, 
        c.name as course_name,
        COALESCE(sot.is_completed, FALSE) as is_completed,
        sot.completed_at
      FROM official_tasks ot
      JOIN courses c ON ot.course_id = c.id
      LEFT JOIN student_official_tasks sot ON ot.id = sot.task_id AND sot.student_id = $1
      ORDER BY ot.deadline ASC NULLS LAST, ot.created_at DESC
    `, [studentId]);
    return result.rows;
  }

  static async create(course_id, title, description, drive_link, deadline) {
    const result = await db.query(
      `INSERT INTO official_tasks (course_id, title, description, drive_link, deadline)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [course_id, title, description, drive_link, deadline]
    );
    return result.rows[0];
  }

  static async update(id, course_id, title, description, drive_link, deadline) {
    const result = await db.query(
      `UPDATE official_tasks 
       SET course_id = $1, title = $2, description = $3, drive_link = $4, deadline = $5
       WHERE id = $6 RETURNING *`,
      [course_id, title, description, drive_link, deadline, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await db.query(`DELETE FROM official_tasks WHERE id = $1`, [id]);
    return true;
  }

  static async toggleComplete(taskId, studentId, isCompleted) {
    const check = await db.query(
      `SELECT * FROM student_official_tasks WHERE student_id = $1 AND task_id = $2`,
      [studentId, taskId]
    );

    if (check.rows.length === 0) {
      const result = await db.query(
        `INSERT INTO student_official_tasks (student_id, task_id, is_completed, completed_at)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [studentId, taskId, isCompleted, isCompleted ? new Date() : null]
      );
      return result.rows[0];
    } else {
      const result = await db.query(
        `UPDATE student_official_tasks 
         SET is_completed = $1, completed_at = $2
         WHERE student_id = $3 AND task_id = $4 RETURNING *`,
        [isCompleted, isCompleted ? new Date() : null, studentId, taskId]
      );
      return result.rows[0];
    }
  }
}

module.exports = OfficialTask;
