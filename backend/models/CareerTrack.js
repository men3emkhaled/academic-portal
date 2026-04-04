const db = require('../config/database');

class CareerTrack {
  // جلب كل المسارات
  static async getAll() {
    const result = await db.query(`
      SELECT * FROM career_tracks ORDER BY is_primary DESC, name
    `);
    return result.rows;
  }

  // جلب مسار معين مع مهامه
  static async getById(id) {
    const trackResult = await db.query(
      'SELECT * FROM career_tracks WHERE id = $1',
      [id]
    );
    const track = trackResult.rows[0];
    
    if (track) {
      const tasksResult = await db.query(
        'SELECT * FROM roadmap_tasks WHERE track_id = $1 ORDER BY order_index',
        [id]
      );
      track.tasks = tasksResult.rows;
    }
    
    return track;
  }

  // إضافة مسار جديد
  static async create(name, description, is_primary = false) {
    const result = await db.query(
      `INSERT INTO career_tracks (name, description, is_primary) 
       VALUES ($1, $2, $3) RETURNING *`,
      [name, description, is_primary]
    );
    return result.rows[0];
  }

  // تحديث مسار
  static async update(id, name, description, is_primary) {
    const result = await db.query(
      `UPDATE career_tracks 
       SET name = $1, description = $2, is_primary = $3, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4 RETURNING *`,
      [name, description, is_primary, id]
    );
    return result.rows[0];
  }

  // حذف مسار
  static async delete(id) {
    await db.query('DELETE FROM career_tracks WHERE id = $1', [id]);
    return true;
  }

  // إضافة مهمة لمسار
  static async addTask(track_id, title, description, order_index) {
    const result = await db.query(
      `INSERT INTO roadmap_tasks (track_id, title, description, order_index) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [track_id, title, description, order_index]
    );
    return result.rows[0];
  }

  // تحديث مهمة
  static async updateTask(task_id, title, description, order_index) {
    const result = await db.query(
      `UPDATE roadmap_tasks 
       SET title = $1, description = $2, order_index = $3, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4 RETURNING *`,
      [title, description, order_index, task_id]
    );
    return result.rows[0];
  }

  // حذف مهمة
  static async deleteTask(task_id) {
    await db.query('DELETE FROM roadmap_tasks WHERE id = $1', [task_id]);
    return true;
  }
}

module.exports = CareerTrack;