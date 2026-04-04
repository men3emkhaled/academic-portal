const db = require('../config/database');
const bcrypt = require('bcryptjs');

class Student {
  static async findById(id) {
    const result = await db.query(
      'SELECT id, name, level, section, created_at, updated_at FROM students WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findByUsername(username) {
    const result = await db.query(
      'SELECT * FROM students WHERE id = $1',
      [username]
    );
    return result.rows[0];
  }

  static async getAllWithPasswords() {
    // جلب الطلاب مع إظهار الباسورد الأصلي وحالة التغيير
    const result = await db.query(`
      SELECT 
        s.id, 
        s.name, 
        s.level, 
        s.section,
        CASE 
          WHEN s.password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cZxqVvLQVQg6V7XKjKXw5Yx5KqG' 
          THEN '123456' 
          ELSE '••••••' 
        END as password_display,
        CASE 
          WHEN s.password_hash != '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cZxqVvLQVQg6V7XKjKXw5Yx5KqG' 
          THEN true 
          ELSE false 
        END as password_changed,
        s.created_at,
        s.updated_at
      FROM students s
      ORDER BY s.id
    `);
    return result.rows;
  }

  static async getAll() {
    const result = await db.query('SELECT id, name, level, section FROM students ORDER BY id');
    return result.rows;
  }

  static async create(id, name, password, level = 1, section = null) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO students (id, name, password_hash, level, section) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (id) DO UPDATE SET 
         name = EXCLUDED.name,
         level = EXCLUDED.level,
         section = EXCLUDED.section,
         updated_at = CURRENT_TIMESTAMP
       RETURNING id, name, level, section`,
      [id, name, hashedPassword, level, section]
    );
    return result.rows[0];
  }

  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await db.query(
      'UPDATE students SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id',
      [hashedPassword, id]
    );
    return result.rows[0];
  }

  static async verifyPassword(student, plainPassword) {
    return await bcrypt.compare(plainPassword, student.password_hash);
  }

  static async updateSection(id, section) {
    const result = await db.query(
      'UPDATE students SET section = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [section, id]
    );
    return result.rows[0];
  }

  static async getTotalScore(studentId) {
    const result = await db.query(
      `SELECT 
        COALESCE(SUM(
          CASE 
            WHEN midterm_score IS NOT NULL THEN midterm_score 
            ELSE 0 
          END +
          CASE 
            WHEN practical_score IS NOT NULL THEN practical_score 
            ELSE 0 
          END +
          CASE 
            WHEN oral_score IS NOT NULL THEN oral_score 
            ELSE 0 
          END
        ), 0) as total_score
       FROM grades 
       WHERE student_id = $1`,
      [studentId]
    );
    return result.rows[0].total_score;
  }
}

module.exports = Student;