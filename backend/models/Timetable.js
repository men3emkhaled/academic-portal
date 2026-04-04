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

  // باقي الدوال...
}

module.exports = Timetable;