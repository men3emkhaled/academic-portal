const db = require('../config/database');

class Notification {
  // جلب إشعارات طالب معين (عامة + خاصة به)
  static async getByStudentId(studentId) {
    const result = await db.query(
      `SELECT * FROM notifications 
       WHERE student_id = $1 OR student_id IS NULL
       ORDER BY created_at DESC
       LIMIT 50`,
      [studentId]
    );
    return result.rows;
  }

  // جلب كل الإشعارات (للـ Admin)
  static async getAll() {
    const result = await db.query(
      `SELECT n.*, s.name as student_name 
       FROM notifications n
       LEFT JOIN students s ON n.student_id = s.id
       ORDER BY n.created_at DESC`
    );
    return result.rows;
  }

  // إرسال إشعار لطالب معين
  static async sendToStudent(studentId, title, content) {
    const result = await db.query(
      `INSERT INTO notifications (student_id, title, content, is_read) 
       VALUES ($1, $2, $3, false) 
       RETURNING *`,
      [studentId, title, content]
    );
    return result.rows[0];
  }

  // إرسال إشعار عام لكل الطلاب (student_id = NULL)
  static async sendToAll(title, content) {
    const result = await db.query(
      `INSERT INTO notifications (student_id, title, content, is_read) 
       VALUES (NULL, $1, $2, false) 
       RETURNING *`,
      [title, content]
    );
    return result.rows[0];
  }

  // حذف إشعار
  static async delete(id) {
    await db.query('DELETE FROM notifications WHERE id = $1', [id]);
    return true;
  }

  // تحديث حالة إشعار إلى مقروء
  static async markAsRead(notificationId, studentId) {
    const result = await db.query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE id = $1 AND (student_id = $2 OR student_id IS NULL)
       RETURNING *`,
      [notificationId, studentId]
    );
    return result.rows[0];
  }

  // تحديث كل الإشعارات إلى مقروءة لطالب
  static async markAllAsRead(studentId) {
    const result = await db.query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE (student_id = $1 OR student_id IS NULL) AND is_read = false
       RETURNING *`,
      [studentId]
    );
    return result.rows;
  }
}

module.exports = Notification;