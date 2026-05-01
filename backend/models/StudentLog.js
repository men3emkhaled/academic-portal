const db = require('../config/database');

class StudentLog {
  static async initializeTable() {
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS student_logins (
          id SERIAL PRIMARY KEY,
          student_id VARCHAR(50) NOT NULL,
          student_name VARCHAR(255) NOT NULL,
          method VARCHAR(50) DEFAULT 'Standard',
          ip_address VARCHAR(100),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await db.query(`CREATE INDEX IF NOT EXISTS idx_student_logins_student_id ON student_logins(student_id)`);
      await db.query(`CREATE INDEX IF NOT EXISTS idx_student_logins_created_at ON student_logins(created_at DESC)`);
      console.log('✅ student_logins table ready');
    } catch (error) {
      console.error('❌ Error creating student_logins table:', error);
    }
  }

  static async logLogin(studentId, studentName, method, ipAddress) {
    try {
      await db.query(
        `INSERT INTO student_logins (student_id, student_name, method, ip_address)
         VALUES ($1, $2, $3, $4)`,
        [studentId, studentName, method, ipAddress]
      );
    } catch (error) {
      console.error('⚠️ Error saving student login log:', error.message);
    }
  }

  static async logDailyVisit(studentId, studentName, ipAddress) {
    try {
      // 1. تنظيف الداتا بيز من أي نشاط (Auto-Login) أقدم من 24 ساعة
      await db.query(`DELETE FROM student_logins WHERE method = 'Auto-Login' AND created_at < NOW() - INTERVAL '24 hours'`);

      // 2. التحقق لو الطالب تم تسجيل نشاطه في آخر 24 ساعة
      const checkResult = await db.query(
        `SELECT id FROM student_logins 
         WHERE student_id = $1 
         AND method = 'Auto-Login'
         AND created_at >= NOW() - INTERVAL '24 hours'
         LIMIT 1`,
        [studentId]
      );
      
      if (checkResult.rows.length === 0) {
        await this.logLogin(studentId, studentName, 'Auto-Login', ipAddress);
      }
    } catch (error) {
      console.error('⚠️ Error in logDailyVisit:', error.message);
    }
  }

  static async getLogins(page = 1, limit = 30) {
    const offset = (page - 1) * limit;
    try {
      const countResult = await db.query('SELECT COUNT(*) FROM student_logins');
      const total = parseInt(countResult.rows[0].count);

      const result = await db.query(
        `SELECT l.*, s.avatar_url 
         FROM student_logins l
         LEFT JOIN students s ON l.student_id = s.id
         ORDER BY l.created_at DESC 
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      return {
        logs: result.rows,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = StudentLog;
