const db = require('../config/database');

class CourseProgress {
  // جلب الأجزاء المنجزة لمادة معينة
  static async getByCourseId(courseId) {
    const result = await db.query(
      'SELECT * FROM course_progress WHERE course_id = $1 ORDER BY order_index, created_at',
      [courseId]
    );
    return result.rows;
  }

  // جلب الأجزاء لمادة بالاسم (لعرض نفس المحتوى لكل الأقسام)
  static async getByCourseName(courseName) {
    const result = await db.query(
      `SELECT cp.* 
       FROM course_progress cp
       JOIN courses c ON cp.course_id = c.id
       WHERE c.name = $1
       ORDER BY cp.order_index, cp.created_at`,
      [courseName]
    );
    return result.rows;
  }

  // إضافة جزء جديد
  static async create(courseId, title, isCompleted = true, orderIndex = 0) {
    // حساب order_index تلقائياً لو مش متحدد
    if (orderIndex === 0) {
      const countResult = await db.query(
        'SELECT COUNT(*) FROM course_progress WHERE course_id = $1',
        [courseId]
      );
      orderIndex = parseInt(countResult.rows[0].count) + 1;
    }

    const result = await db.query(
      `INSERT INTO course_progress (course_id, title, is_completed, order_index) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [courseId, title, isCompleted, orderIndex]
    );
    return result.rows[0];
  }

  // تحديث جزء
  static async update(id, title, isCompleted) {
    const result = await db.query(
      `UPDATE course_progress 
       SET title = COALESCE($1, title), 
           is_completed = COALESCE($2, is_completed),
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 RETURNING *`,
      [title, isCompleted, id]
    );
    return result.rows[0];
  }

  // تبديل حالة الإنجاز (مع تحديث الأجزاء الفرعية تلقائياً)
  static async toggleCompleted(id) {
    // 1. جلب العنصر الحالي
    const itemQuery = await db.query('SELECT * FROM course_progress WHERE id = $1', [id]);
    if (itemQuery.rows.length === 0) return null;
    
    const item = itemQuery.rows[0];
    const newState = !item.is_completed;
    
    // 2. تحديث العنصر الأساسي
    const updateQuery = await db.query(
      `UPDATE course_progress 
       SET is_completed = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 RETURNING *`,
      [newState, id]
    );
    const updatedItem = updateQuery.rows[0];

    // 3. لو كان ده شابتر رئيسي (مثلاً "10 Graphs")، نحدث كل الأجزاء الفرعية بتاعته (مثلاً "10.1", "10.2")
    const titleMatch = item.title.match(/^(\d+)\s/);
    if (titleMatch) {
      const chapterNum = titleMatch[1]; // مثلاً "10"
      
      await db.query(
        `UPDATE course_progress 
         SET is_completed = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE course_id = $2 AND title LIKE $3`,
        [newState, item.course_id, `${chapterNum}.%`]
      );
    }
    
    return updatedItem;
  }

  // حذف جزء
  static async delete(id) {
    await db.query('DELETE FROM course_progress WHERE id = $1', [id]);
    return true;
  }

  // حذف كل الأجزاء لمادة
  static async deleteByCourseId(courseId) {
    await db.query('DELETE FROM course_progress WHERE course_id = $1', [courseId]);
    return true;
  }

  // جلب كل الأجزاء مجمعة حسب المادة (للأدمن)
  static async getAllGrouped() {
    const result = await db.query(
      `SELECT cp.*, c.name as course_name, c.semester, d.name as department_name
       FROM course_progress cp
       JOIN courses c ON cp.course_id = c.id
       LEFT JOIN departments d ON c.department_id = d.id
       ORDER BY c.name, cp.order_index, cp.created_at`
    );
    return result.rows;
  }
}

module.exports = CourseProgress;
