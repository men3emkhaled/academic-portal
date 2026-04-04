// backend/models/StudentCourse.js
const db = require('../config/database');

class StudentCourse {
  static async getAll() {
    const result = await db.query(`SELECT sc.*, s.name as student_name, c.name as course_name FROM student_courses sc JOIN students s ON sc.student_id=s.id JOIN courses c ON sc.course_id=c.id ORDER BY s.id, c.name`);
    return result.rows;
  }
  static async getByStudentId(studentId) {
    const result = await db.query(`SELECT sc.*, c.name as course_name, c.semester, c.max_score FROM student_courses sc JOIN courses c ON sc.course_id=c.id WHERE sc.student_id=$1 ORDER BY c.semester, c.name`, [studentId]);
    return result.rows;
  }
  static async getByCourseId(courseId) {
    const result = await db.query(`SELECT sc.*, s.name as student_name FROM student_courses sc JOIN students s ON sc.student_id=s.id WHERE sc.course_id=$1 ORDER BY s.name`, [courseId]);
    return result.rows;
  }
  static async enroll(studentId, courseId, progress=0, status='active') {
    const result = await db.query(`INSERT INTO student_courses (student_id, course_id, progress_percentage, status) VALUES ($1,$2,$3,$4) ON CONFLICT (student_id,course_id) DO UPDATE SET progress_percentage=EXCLUDED.progress_percentage, status=EXCLUDED.status, updated_at=CURRENT_TIMESTAMP RETURNING *`, [studentId, courseId, progress, status]);
    return result.rows[0];
  }
  static async updateProgress(studentId, courseId, progress) {
    const result = await db.query(`UPDATE student_courses SET progress_percentage=$1, updated_at=CURRENT_TIMESTAMP WHERE student_id=$2 AND course_id=$3 RETURNING *`, [progress, studentId, courseId]);
    return result.rows[0];
  }
  static async updateStatus(studentId, courseId, status) {
    const result = await db.query(`UPDATE student_courses SET status=$1, updated_at=CURRENT_TIMESTAMP WHERE student_id=$2 AND course_id=$3 RETURNING *`, [status, studentId, courseId]);
    return result.rows[0];
  }
  static async unenroll(studentId, courseId) {
    await db.query(`DELETE FROM student_courses WHERE student_id=$1 AND course_id=$2`, [studentId, courseId]);
    return true;
  }
  static async bulkEnroll(enrollments) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      for (const e of enrollments) {
        await client.query(`INSERT INTO student_courses (student_id, course_id, progress_percentage, status) VALUES ($1,$2,$3,$4) ON CONFLICT (student_id,course_id) DO UPDATE SET progress_percentage=EXCLUDED.progress_percentage, status=EXCLUDED.status`, [e.student_id, e.course_id, e.progress||0, e.status||'active']);
      }
      await client.query('COMMIT');
      return { success: true, count: enrollments.length };
    } catch(e) { await client.query('ROLLBACK'); throw e; }
    finally { client.release(); }
  }
}
module.exports = StudentCourse;