const db = require('../config/database');

class Timetable {
  // ✅ جديد: جلب جدول الطالب بناءً على (department_id + section)
  static async getStudentTimetable(departmentId, section) {
    if (!departmentId || section === null || section === undefined) {
      throw new Error('Department ID and Section are required');
    }
    
    // تحويل section إلى نص صريح
    const sectionStr = String(section);
    
    const result = await db.query(
      `SELECT * FROM timetable 
       WHERE department_id = $1::INTEGER AND section = $2::VARCHAR AND is_hidden = false
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
      [departmentId, sectionStr]
    );
    return result.rows;
  }

  // جلب جدول سيكشن معين (المحاضرات غير المخفية فقط) - مع دعم القسم
  static async getBySection(section, departmentId = null) {
    let query = `SELECT *, is_quiz, is_hidden FROM timetable WHERE section = $1 AND is_hidden = false`;
    const params = [section];
    if (departmentId) {
      query += ` AND department_id = $2`;
      params.push(departmentId);
    }
    query += ` ORDER BY 
      CASE day_of_week
        WHEN 'Monday' THEN 1
        WHEN 'Tuesday' THEN 2
        WHEN 'Wednesday' THEN 3
        WHEN 'Thursday' THEN 4
        WHEN 'Friday' THEN 5
        WHEN 'Saturday' THEN 6
        WHEN 'Sunday' THEN 7
      END,
      start_time`;
    const result = await db.query(query, params);
    return result.rows;
  }

  // جلب كل جداول القسم (لكل السكاشن)
  static async getByDepartment(departmentId) {
    const result = await db.query(
      `SELECT *, is_quiz, is_hidden FROM timetable 
       WHERE department_id = $1 AND is_hidden = false
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
         section,
         start_time`,
      [departmentId]
    );
    return result.rows;
  }

  // إضافة مدخل جديد (مع دعم القسم)
  static async addEntry(section, day_of_week, start_time, end_time, course_name, location, instructor, type, is_quiz = false, department_id = null) {
    const result = await db.query(
      `INSERT INTO timetable (section, day_of_week, start_time, end_time, course_name, location, instructor, type, is_quiz, is_hidden, department_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, false, $10)
       ON CONFLICT (department_id, section, day_of_week, start_time, end_time, course_name, location)
       DO UPDATE SET updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [section, day_of_week, start_time, end_time, course_name, location, instructor, type, is_quiz, department_id]
    );
    return result.rows[0];
  }

  // رفع جدول كامل (Excel) – مع دعم القسم
  static async bulkInsert(section, entries, departmentId = null) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      // حذف الجدول القديم لنفس السيكشن ونفس القسم
      await client.query('DELETE FROM timetable WHERE section = $1 AND department_id = $2', [section, departmentId]);
      for (const entry of entries) {
        await client.query(
          `INSERT INTO timetable (section, day_of_week, start_time, end_time, course_name, location, instructor, type, is_quiz, is_hidden, department_id) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, false, $10)
           ON CONFLICT (department_id, section, day_of_week, start_time, end_time, course_name, location)
           DO NOTHING`,
          [section, entry.day, entry.start_time, entry.end_time, entry.course_name, entry.location, entry.instructor, entry.type, entry.is_quiz || false, departmentId]
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

  // تحديث مدخل (يدعم تحديث department_id)
  static async updateEntry(id, updates) {
    const { day_of_week, start_time, end_time, course_name, location, instructor, type, is_quiz, is_hidden, department_id, section } = updates;
    const result = await db.query(
      `UPDATE timetable 
       SET day_of_week = COALESCE($1, day_of_week), 
           start_time = COALESCE($2, start_time), 
           end_time = COALESCE($3, end_time), 
           course_name = COALESCE($4, course_name), 
           location = COALESCE($5, location), 
           instructor = COALESCE($6, instructor), 
           type = COALESCE($7, type), 
           is_quiz = COALESCE($8, is_quiz), 
           is_hidden = COALESCE($9, is_hidden),
           department_id = COALESCE($10, department_id),
           section = COALESCE($11, section),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $12 RETURNING *`,
      [day_of_week, start_time, end_time, course_name, location, instructor, type, is_quiz, is_hidden, department_id, section, id]
    );
    return result.rows[0];
  }

  // حذف مدخل
  static async deleteEntry(id) {
    await db.query('DELETE FROM timetable WHERE id = $1', [id]);
    return true;
  }

  // حذف جدول سيكشن كامل (مع مراعاة القسم)
  static async deleteBySection(section, departmentId = null) {
    if (departmentId) {
      await db.query('DELETE FROM timetable WHERE section = $1 AND department_id = $2', [section, departmentId]);
    } else {
      await db.query('DELETE FROM timetable WHERE section = $1', [section]);
    }
    return true;
  }

  // جلب كل الجداول (للأدمن) – مع إمكانية التصفية حسب القسم
  static async getAll(includeHidden = true, departmentId = null) {
    let query = 'SELECT *, is_quiz, is_hidden FROM timetable';
    const conditions = [];
    const params = [];
    if (!includeHidden) {
      conditions.push('is_hidden = false');
    }
    if (departmentId) {
      conditions.push(`department_id = $${params.length + 1}`);
      params.push(departmentId);
    }
    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY department_id, section, day_of_week, start_time';
    const result = await db.query(query, params);
    return result.rows;
  }

  // ✅ جلب جميع السكاشن المجمعة حسب القسم (للإدارة المتقدمة)
  static async getAllGroupedByDepartment() {
    const result = await db.query(`
      SELECT 
        t.*,
        d.name as department_name,
        d.code as department_code
      FROM timetable t
      LEFT JOIN departments d ON t.department_id = d.id
      ORDER BY d.name, t.section, 
        CASE t.day_of_week
          WHEN 'Monday' THEN 1
          WHEN 'Tuesday' THEN 2
          WHEN 'Wednesday' THEN 3
          WHEN 'Thursday' THEN 4
          WHEN 'Friday' THEN 5
          WHEN 'Saturday' THEN 6
          WHEN 'Sunday' THEN 7
        END,
        t.start_time
    `);
    return result.rows;
  }

  // ✅ إخفاء / إظهار مدخل محدد
  static async toggleHideEntry(id, is_hidden) {
    const result = await db.query(
      'UPDATE timetable SET is_hidden = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [is_hidden, id]
    );
    return result.rows[0];
  }

  // ✅ إخفاء جميع محاضرات يوم معين (لقسم محدد أو لجميع الأقسام)
  static async hideAllByDay(day, departmentId = null) {
    if (departmentId) {
      await db.query('UPDATE timetable SET is_hidden = true WHERE day_of_week = $1 AND department_id = $2', [day, departmentId]);
    } else {
      await db.query('UPDATE timetable SET is_hidden = true WHERE day_of_week = $1', [day]);
    }
    return true;
  }

  // ✅ إظهار جميع محاضرات يوم معين (لقسم محدد أو لجميع الأقسام)
  static async showAllByDay(day, departmentId = null) {
    if (departmentId) {
      await db.query('UPDATE timetable SET is_hidden = false WHERE day_of_week = $1 AND department_id = $2', [day, departmentId]);
    } else {
      await db.query('UPDATE timetable SET is_hidden = false WHERE day_of_week = $1', [day]);
    }
    return true;
  }

  // ✅ جديد: جلب جدول المحاضر بناءً على اسمه
  static async getByInstructor(instructorName) {
    if (!instructorName) return [];
    const result = await db.query(
      `SELECT t.*, d.name as department_name 
       FROM timetable t
       LEFT JOIN departments d ON t.department_id = d.id
       WHERE t.instructor ILIKE $1 AND t.is_hidden = false
       ORDER BY 
         CASE t.day_of_week
           WHEN 'Monday' THEN 1
           WHEN 'Tuesday' THEN 2
           WHEN 'Wednesday' THEN 3
           WHEN 'Thursday' THEN 4
           WHEN 'Friday' THEN 5
           WHEN 'Saturday' THEN 6
           WHEN 'Sunday' THEN 7
         END,
         t.start_time`,
      [`%${instructorName}%`]
    );
    return result.rows;
  }
}

module.exports = Timetable;