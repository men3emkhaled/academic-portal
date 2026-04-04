const db = require('../config/database');

class Timetable {
  // ✅ دالة جلب الجدول حسب section
  static async getBySection(section) {
    const result = await db.query(
      `SELECT * FROM timetable 
       WHERE section = $1 
       ORDER BY 
         CASE day_of_week
           WHEN 'Monday' THEN 1
           WHEN 'Tuesday' THEN 2
           WHEN 'Wednesday' THEN 3
           WHEN 'Thursday' THEN 4
           WHEN 'Friday' THEN 5
           WHEN 'Saturday' THEN 6
           WHEN 'Sunday' THEN 7
         END,
         start_time`,
      [section]
    );
    return result.rows;
  }

  // إضافة مدخل جديد في الجدول
  static async addEntry(section, day_of_week, start_time, end_time, course_name, location, instructor, type) {
    const result = await db.query(
      `INSERT INTO timetable (section, day_of_week, start_time, end_time, course_name, location, instructor, type) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [section, day_of_week, start_time, end_time, course_name, location, instructor, type]
    );
    return result.rows[0];
  }

  // رفع جدول كامل (Excel)
  static async bulkInsert(section, entries) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      
      // حذف الجدول القديم للسيكشن
      await client.query('DELETE FROM timetable WHERE section = $1', [section]);
      
      for (const entry of entries) {
        await client.query(
          `INSERT INTO timetable (section, day_of_week, start_time, end_time, course_name, location, instructor, type) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [section, entry.day, entry.start_time, entry.end_time, entry.course_name, entry.location, entry.instructor, entry.type]
        );
      }
      
      await client.query('COMMIT');
      return { success: true, count: entries.length };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // تحديث مدخل
  static async updateEntry(id, updates) {
    const { day_of_week, start_time, end_time, course_name, location, instructor, type } = updates;
    const result = await db.query(
      `UPDATE timetable 
       SET day_of_week = $1, start_time = $2, end_time = $3, 
           course_name = $4, location = $5, instructor = $6, type = $7,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [day_of_week, start_time, end_time, course_name, location, instructor, type, id]
    );
    return result.rows[0];
  }

  // حذف مدخل
  static async deleteEntry(id) {
    await db.query('DELETE FROM timetable WHERE id = $1', [id]);
    return true;
  }

  // حذف جدول سيكشن كامل
  static async deleteBySection(section) {
    await db.query('DELETE FROM timetable WHERE section = $1', [section]);
    return true;
  }

  // جلب كل الجداول
  static async getAll() {
    const result = await db.query('SELECT * FROM timetable ORDER BY section');
    return result.rows;
  }
}

module.exports = Timetable;