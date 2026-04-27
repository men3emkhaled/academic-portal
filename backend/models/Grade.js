const db = require('../config/database');

class Grade {
  // جلب درجات الطالب للمواد المسجلة فقط (عبر enrollments)
  static async getStudentGrades(studentId) {
    const result = await db.query(
      `SELECT 
        c.id as course_id,
        c.name as course_name,
        c.max_score,
        c.midterm_max,
        c.practical_max,
        c.oral_max,
        g.midterm_score,
        g.midterm_status,
        g.practical_score,
        g.practical_status,
        g.oral_score,
        g.oral_status,
        COALESCE(g.midterm_score, 0) + COALESCE(g.practical_score, 0) + COALESCE(g.oral_score, 0) as total_score
      FROM student_courses sc
      JOIN courses c ON c.id = sc.course_id
      LEFT JOIN grades g ON g.enrollment_id = sc.id
      WHERE sc.student_id = $1
      ORDER BY c.name`,
      [studentId]
    );
    return result.rows;
  }

  // جلب درجة طالب لمادة معينة (عبر enrollment)
  static async getStudentGradeForCourse(studentId, courseName) {
    const result = await db.query(
      `SELECT g.* 
       FROM grades g
       JOIN student_courses sc ON sc.id = g.enrollment_id
       WHERE sc.student_id = $1 AND g.course_name = $2`,
      [studentId, courseName]
    );
    return result.rows[0];
  }

  // رفع الدرجات باستخدام enrollment_id
  static async uploadGradesWithEnrollment(courseName, examType, gradesData) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const grade of gradesData) {
        const { enrollment_id, score, status } = grade;
        
        let query = '';
        let params = [];
        
        if (examType === 'midterm') {
          query = `
            INSERT INTO grades (enrollment_id, midterm_score, midterm_status) 
            VALUES ($1, $2, $3) 
            ON CONFLICT (enrollment_id) 
            DO UPDATE SET 
              midterm_score = EXCLUDED.midterm_score,
              midterm_status = EXCLUDED.midterm_status,
              updated_at = CURRENT_TIMESTAMP
          `;
          params = [enrollment_id, score, status];
        } 
        else if (examType === 'practical') {
          query = `
            INSERT INTO grades (enrollment_id, practical_score, practical_status) 
            VALUES ($1, $2, $3) 
            ON CONFLICT (enrollment_id) 
            DO UPDATE SET 
              practical_score = EXCLUDED.practical_score,
              practical_status = EXCLUDED.practical_status,
              updated_at = CURRENT_TIMESTAMP
          `;
          params = [enrollment_id, score, status];
        }
        else if (examType === 'oral') {
          query = `
            INSERT INTO grades (enrollment_id, oral_score, oral_status) 
            VALUES ($1, $2, $3) 
            ON CONFLICT (enrollment_id) 
            DO UPDATE SET 
              oral_score = EXCLUDED.oral_score,
              oral_status = EXCLUDED.oral_status,
              updated_at = CURRENT_TIMESTAMP
          `;
          params = [enrollment_id, score, status];
        }
        
        await client.query(query, params);
      }
      
      await client.query('COMMIT');
      return { success: true, count: gradesData.length };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // تعديل درجة طالب واحد باستخدام enrollment_id
  static async updateSingleGradeWithEnrollment(enrollmentId, examType, score, status) {
    let field = '';
    let statusField = '';
    
    if (examType === 'midterm') {
      field = 'midterm_score';
      statusField = 'midterm_status';
    } else if (examType === 'practical') {
      field = 'practical_score';
      statusField = 'practical_status';
    } else if (examType === 'oral') {
      field = 'oral_score';
      statusField = 'oral_status';
    } else {
      throw new Error('Invalid exam type');
    }
    
    const result = await db.query(
      `INSERT INTO grades (enrollment_id, ${field}, ${statusField}) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (enrollment_id) 
       DO UPDATE SET 
         ${field} = EXCLUDED.${field},
         ${statusField} = EXCLUDED.${statusField},
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [enrollmentId, score, status || 'completed']
    );
    
    return result.rows[0];
  }

  // جلب كل الدرجات (للـ Admin)
  static async getAllGrades() {
    const result = await db.query(`
      SELECT 
        g.*,
        s.name as student_name,
        s.section,
        c.name as course_name
      FROM grades g
      JOIN student_courses sc ON sc.id = g.enrollment_id
      JOIN students s ON s.id = sc.student_id
      JOIN courses c ON c.id = sc.course_id
      ORDER BY s.id, c.name
    `);
    return result.rows;
  }

  // حذف درجات طالب (عبر enrollment)
  static async deleteByStudentId(studentId) {
    await db.query(
      `DELETE FROM grades WHERE enrollment_id IN (SELECT id FROM student_courses WHERE student_id = $1)`,
      [studentId]
    );
    return true;
  }
}

module.exports = Grade;