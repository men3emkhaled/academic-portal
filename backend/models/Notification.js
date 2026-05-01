const db = require('../config/database');

class Notification {
  // جلب إشعارات طالب معين (عامة + خاصة به) - تستثني تنبيهات الموبايل فقط
  static async getByStudentId(studentId) {
    const result = await db.query(
      `SELECT * FROM notifications 
       WHERE (student_id = $1 OR student_id IS NULL) 
       AND doctor_id IS NULL
       AND is_mobile_only = false
       ORDER BY created_at DESC
       LIMIT 50`,
      [studentId]
    );
    return result.rows;
  }

  // جلب إشعارات دكتور معين
  static async getByDoctorId(doctorId) {
    const result = await db.query(
      `SELECT * FROM notifications 
       WHERE doctor_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [doctorId]
    );
    return result.rows;
  }

  // جلب كل الإشعارات (للـ Admin)
  static async getAll() {
    const result = await db.query(
      `SELECT n.*, s.name as student_name, d.name as doctor_name
       FROM notifications n
       LEFT JOIN students s ON n.student_id = s.id
       LEFT JOIN doctors d ON n.doctor_id = d.id
       ORDER BY n.created_at DESC`
    );
    return result.rows;
  }

  // إرسال إشعار لطالب معين
  static async sendToStudent(studentId, title, content, isMobileOnly = false) {
    const result = await db.query(
      `INSERT INTO notifications (student_id, title, content, is_read, is_mobile_only) 
       VALUES ($1, $2, $3, false, $4) 
       RETURNING *`,
      [studentId, title, content, isMobileOnly]
    );
    return result.rows[0];
  }

  // إرسال إشعار لدكتور معين
  static async sendToDoctor(doctorId, title, content) {
    const result = await db.query(
      `INSERT INTO notifications (student_id, doctor_id, title, content, is_read, is_mobile_only) 
       VALUES (NULL, $1, $2, $3, false, false) 
       RETURNING *`,
      [doctorId, title, content]
    );
    return result.rows[0];
  }

  // Send global notification to all students (student_id = NULL, doctor_id = NULL)
  static async sendToAll(title, content, isMobileOnly = false) {
    const result = await db.query(
      `INSERT INTO notifications (student_id, doctor_id, title, content, is_read, is_mobile_only) 
       VALUES (NULL, NULL, $1, $2, false, $3) 
       RETURNING *`,
      [title, content, isMobileOnly]
    );
    return result.rows[0];
  }

  // Send to all students in a specific department
  static async sendToDepartment(departmentId, title, content, isMobileOnly = false) {
    const result = await db.query(
      `INSERT INTO notifications (student_id, title, content, is_read, is_mobile_only) 
       SELECT id, $1, $2, false, $3 
       FROM students 
       WHERE department_id = $4
       RETURNING *`,
      [title, content, isMobileOnly, departmentId]
    );
    return result.rows;
  }

  // حذف إشعار
  static async delete(id) {
    await db.query('DELETE FROM notifications WHERE id = $1', [id]);
    return true;
  }

  // تحديث حالة إشعار إلى مقروء
  static async markAsRead(notificationId, userId, role = 'student') {
    let query;
    let params;

    if (role === 'doctor') {
        query = `UPDATE notifications SET is_read = true WHERE id = $1 AND doctor_id = $2 RETURNING *`;
        params = [notificationId, userId];
    } else {
        query = `UPDATE notifications SET is_read = true WHERE id = $1 AND (student_id = $2 OR student_id IS NULL) RETURNING *`;
        params = [notificationId, userId];
    }

    const result = await db.query(query, params);
    return result.rows[0];
  }

  // تحديث كل الإشعارات إلى مقروءة لمستخدم
  static async markAllAsRead(userId, role = 'student') {
    let query;
    let params;

    if (role === 'doctor') {
        query = `UPDATE notifications SET is_read = true WHERE doctor_id = $1 AND is_read = false RETURNING *`;
        params = [userId];
    } else {
        query = `UPDATE notifications SET is_read = true WHERE (student_id = $1 OR student_id IS NULL) AND is_read = false AND is_mobile_only = false RETURNING *`;
        params = [userId];
    }

    const result = await db.query(query, params);
    return result.rows;
  }
}

module.exports = Notification;