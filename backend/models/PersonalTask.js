const db = require('../config/database');

class PersonalTask {
  static async getAllForStudent(studentId) {
    const result = await db.query(
      `SELECT * FROM personal_tasks 
       WHERE student_id = $1 
       ORDER BY order_index, created_at`,
      [studentId]
    );
    return result.rows;
  }

  static async getById(id, studentId) {
    const result = await db.query(
      `SELECT * FROM personal_tasks WHERE id = $1 AND student_id = $2`,
      [id, studentId]
    );
    return result.rows[0];
  }

  static async create(studentId, title, description, orderIndex = 0) {
    const result = await db.query(
      `INSERT INTO personal_tasks (student_id, title, description, order_index)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [studentId, title, description, orderIndex]
    );
    return result.rows[0];
  }

  static async update(id, studentId, title, description, isCompleted, orderIndex) {
    const result = await db.query(
      `UPDATE personal_tasks 
       SET title = $1, description = $2, is_completed = $3, order_index = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND student_id = $6 RETURNING *`,
      [title, description, isCompleted, orderIndex, id, studentId]
    );
    return result.rows[0];
  }

  static async delete(id, studentId) {
    await db.query(`DELETE FROM personal_tasks WHERE id = $1 AND student_id = $2`, [id, studentId]);
    return true;
  }

  static async toggleComplete(id, studentId, isCompleted) {
    const result = await db.query(
      `UPDATE personal_tasks 
       SET is_completed = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND student_id = $3 RETURNING *`,
      [isCompleted, id, studentId]
    );
    return result.rows[0];
  }
}

module.exports = PersonalTask;