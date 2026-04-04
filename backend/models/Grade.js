const db = require('../config/database');

class Grade {
  // جلب درجات طالب معين مع تفاصيل الكورسات
  static async getStudentGrades(studentId) {
    const result = await db.query(
      `SELECT 
        c.id as course_id,
        c.name as course_name,
        c.max_score,
        g.midterm_score,
        g.midterm_status,
        g.practical_score,
        g.practical_status,
        g.oral_score,
        g.oral_status,
        COALESCE(g.midterm_score, 0) + COALESCE(g.practical_score, 0) + COALESCE(g.oral_score, 0) as total_score
      FROM courses c
      LEFT JOIN grades g ON g.course_name = c.name AND g.student_id = $1
      WHERE c.semester = 2
      ORDER BY c.name`,
      [studentId]
    );
    return result.rows;
  }

  // جلب كل درجات طالب لمادة معينة
  static async getStudentGradeForCourse(studentId, courseName) {
    const result = await db.query(
      `SELECT * FROM grades WHERE student_id = $1 AND course_name = $2`,
      [studentId, courseName]
    );
    return result.rows[0];
  }

  // رفع الدرجات حسب نوع الامتحان
  static async uploadGrades(courseName, examType, gradesData) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const grade of gradesData) {
        const { student_id, score, status } = grade;
        
        let query = '';
        let params = [];
        
        if (examType === 'midterm') {
          query = `
            INSERT INTO grades (student_id, course_name, midterm_score, midterm_status) 
            VALUES ($1, $2, $3, $4) 
            ON CONFLICT (student_id, course_name) 
            DO UPDATE SET 
              midterm_score = EXCLUDED.midterm_score,
              midterm_status = EXCLUDED.midterm_status,
              updated_at = CURRENT_TIMESTAMP
          `;
          params = [student_id, courseName, score, status || 'completed'];
        } 
        else if (examType === 'practical') {
          query = `
            INSERT INTO grades (student_id, course_name, practical_score, practical_status) 
            VALUES ($1, $2, $3, $4) 
            ON CONFLICT (student_id, course_name) 
            DO UPDATE SET 
              practical_score = EXCLUDED.practical_score,
              practical_status = EXCLUDED.practical_status,
              updated_at = CURRENT_TIMESTAMP
          `;
          params = [student_id, courseName, score, status || 'pending'];
        }
        else if (examType === 'oral') {
          query = `
            INSERT INTO grades (student_id, course_name, oral_score, oral_status) 
            VALUES ($1, $2, $3, $4) 
            ON CONFLICT (student_id, course_name) 
            DO UPDATE SET 
              oral_score = EXCLUDED.oral_score,
              oral_status = EXCLUDED.oral_status,
              updated_at = CURRENT_TIMESTAMP
          `;
          params = [student_id, courseName, score, status || 'pending'];
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

  // تعديل درجة طالب واحد
  static async updateSingleGrade(studentId, courseName, examType, score, status) {
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
      `INSERT INTO grades (student_id, course_name, ${field}, ${statusField}) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (student_id, course_name) 
       DO UPDATE SET 
         ${field} = EXCLUDED.${field},
         ${statusField} = EXCLUDED.${statusField},
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [studentId, courseName, score, status || 'completed']
    );
    
    return result.rows[0];
  }

  // جلب كل الدرجات (للـ Admin)
  static async getAllGrades() {
    const result = await db.query(`
      SELECT 
        g.*,
        s.name as student_name,
        s.section
      FROM grades g
      JOIN students s ON g.student_id = s.id
      ORDER BY g.student_id, g.course_name
    `);
    return result.rows;
  }

  // حذف درجات طالب
  static async deleteByStudentId(studentId) {
    await db.query('DELETE FROM grades WHERE student_id = $1', [studentId]);
    return true;
  }
}

module.exports = Grade;