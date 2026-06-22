const db = require('../config/database');
const logger = require('../utils/logger');

class Notification {
  // تهيئة وتحديث جدول الإشعارات تلقائياً
  static async initializeTable() {
    try {
      await db.query(`
        ALTER TABLE notifications 
        ADD COLUMN IF NOT EXISTS department_id integer REFERENCES departments(id) ON DELETE CASCADE
      `);
      await db.query(`
        CREATE INDEX IF NOT EXISTS idx_notifications_department_id ON notifications(department_id)
      `);
      logger.info('Notifications table department_id ready');
      
      await this.cleanupOldDuplicates();
    } catch (error) {
      logger.error({ err: error.message }, 'Error updating notifications table schema');
    }
  }

  // دمج وتنظيف النسخ القديمة المكررة للمحافظة على أداء فائق
  static async cleanupOldDuplicates() {
    try {
      logger.info('Starting notification database deduplication cleanup...');
      
      const batchRes = await db.query(`
        SELECT title, content, date_trunc('minute', created_at) as minute, COUNT(*) as cnt
        FROM notifications
        WHERE student_id IS NOT NULL AND doctor_id IS NULL AND department_id IS NULL
        GROUP BY title, content, date_trunc('minute', created_at)
        HAVING COUNT(*) > 5
      `);
      
      logger.info({ batchCount: batchRes.rows.length }, 'Found duplicate notification batches to clean');
      
      let totalDeleted = 0;
      for (const batch of batchRes.rows) {
        const listRes = await db.query(`
          SELECT id, student_id FROM notifications
          WHERE title = $1 AND content = $2 AND date_trunc('minute', created_at) = $3
          AND student_id IS NOT NULL AND department_id IS NULL
        `, [batch.title, batch.content, batch.minute]);
        
        if (listRes.rows.length > 1) {
          const ids = listRes.rows.map(r => r.id);
          const sampleStudentId = listRes.rows[0].student_id;
          
          const studentRes = await db.query('SELECT department_id FROM students WHERE id = $1', [sampleStudentId]);
          const deptId = studentRes.rows[0]?.department_id;
          
          if (deptId) {
            const keepId = ids[0];
            await db.query(`
              UPDATE notifications
              SET student_id = NULL, department_id = $1
              WHERE id = $2
            `, [deptId, keepId]);
            
            const deleteIds = ids.slice(1);
            const delRes = await db.query(`
              DELETE FROM notifications
              WHERE id = ANY($1)
            `, [deleteIds]);
            totalDeleted += delRes.rowCount;
          }
        }
      }
      
      if (totalDeleted > 0) {
        logger.info({ totalDeleted }, 'Deduplication completed');
      } else {
        logger.info('Notification table is already clean and optimized');
      }
    } catch (err) {
      logger.error({ err }, 'Failed to run notifications deduplication');
    }
  }

  // جلب إشعارات طالب معين (عامة + تابعة لقسمه + خاصة به)
  static async getByStudentId(studentId) {
    const result = await db.query(
      `SELECT * FROM notifications 
       WHERE (
         student_id = $1 
         OR (
           student_id IS NULL 
           AND (
             department_id IS NULL 
             OR department_id = (SELECT department_id FROM students WHERE id = $1)
           )
         )
       ) 
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

  // جلب كل الإشعارات للـ Admin مع تفاصيل القسم
  static async getAll() {
    const result = await db.query(
      `SELECT n.*, s.name as student_name, d.name as doctor_name, dep.name as department_name
       FROM notifications n
       LEFT JOIN students s ON n.student_id = s.id
       LEFT JOIN doctors d ON n.doctor_id = d.id
       LEFT JOIN departments dep ON n.department_id = dep.id
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

  // Send to all students in a specific department (optimized: single row)
  static async sendToDepartment(departmentId, title, content, isMobileOnly = false) {
    const countRes = await db.query('SELECT COUNT(*) as cnt FROM students WHERE department_id = $1', [departmentId]);
    const affectedCount = parseInt(countRes.rows[0].cnt || 0);

    const result = await db.query(
      `INSERT INTO notifications (student_id, department_id, title, content, is_read, is_mobile_only) 
       VALUES (NULL, $1, $2, $3, false, $4) 
       RETURNING *`,
      [departmentId, title, content, isMobileOnly]
    );
    const notification = result.rows[0];
    notification.affected_count = affectedCount;
    return notification;
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