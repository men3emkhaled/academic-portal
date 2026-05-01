const db = require('../config/database');

class Inquiry {
  static async create(studentId, courseId, type, subject, content) {
    const result = await db.query(
      `INSERT INTO inquiries (student_id, course_id, type, subject, content)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [studentId, courseId, type, subject, content]
    );
    return result.rows[0];
  }

  static async getForStudent(studentId) {
    const result = await db.query(`
      SELECT i.*, c.name as course_name
      FROM inquiries i
      JOIN courses c ON i.course_id = c.id
      WHERE i.student_id = $1
      ORDER BY i.created_at DESC
    `, [studentId]);
    return result.rows;
  }

  static async getForDoctor(doctorId) {
    const result = await db.query(`
      SELECT i.*, s.name as student_name, s.avatar_url, c.name as course_name
      FROM inquiries i
      JOIN students s ON i.student_id = s.id
      JOIN courses c ON i.course_id = c.id
      JOIN doctor_courses dc ON c.id = dc.course_id
      WHERE dc.doctor_id = $1
      ORDER BY i.created_at DESC
    `, [doctorId]);
    return result.rows;
  }

  static async reply(inquiryId, reply) {
    const result = await db.query(
      `UPDATE inquiries 
       SET doctor_reply = $1, status = 'replied', replied_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [reply, inquiryId]
    );
    return result.rows[0];
  }

  static async getRecentForDoctor(doctorId, limit = 5) {
    const result = await db.query(`
      SELECT i.*, s.name as student_name, s.avatar_url, c.name as course_name
      FROM inquiries i
      JOIN students s ON i.student_id = s.id
      JOIN courses c ON i.course_id = c.id
      JOIN doctor_courses dc ON c.id = dc.course_id
      WHERE dc.doctor_id = $1
      ORDER BY i.created_at DESC
      LIMIT $2
    `, [doctorId, limit]);
    return result.rows;
  }
}

module.exports = Inquiry;
