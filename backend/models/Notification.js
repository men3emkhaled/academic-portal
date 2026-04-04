const db = require('../config/database');

class Notification {
  static async getAll() {
    const result = await db.query(`
      SELECT n.*, s.name as student_name 
      FROM notifications n
      LEFT JOIN students s ON n.student_id = s.id
      ORDER BY n.created_at DESC
    `);
    return result.rows;
  }

  static async sendToStudent(studentId, title, content) {
    const result = await db.query(
      `INSERT INTO notifications (student_id, title, content, is_read) 
       VALUES ($1, $2, $3, false) RETURNING *`,
      [studentId, title, content]
    );
    return result.rows[0];
  }

  static async sendToAll(title, content) {
    const result = await db.query(
      `INSERT INTO notifications (student_id, title, content, is_read) 
       VALUES (NULL, $1, $2, false) RETURNING *`,
      [title, content]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await db.query('DELETE FROM notifications WHERE id = $1', [id]);
    return true;
  }
}

module.exports = Notification;