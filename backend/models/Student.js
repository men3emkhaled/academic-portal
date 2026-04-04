const db = require('../config/database');

class Student {
  static async findById(id) {
    const result = await db.query(
      'SELECT id, name, level, section, password_hash FROM students WHERE id = $1',
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

  static async create(id, name, password, level = 1, section = null) {
    const sectionInt = section ? parseInt(section, 10) : null;
    
    const result = await db.query(
      `INSERT INTO students (id, name, password_hash, level, section) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (id) DO UPDATE SET 
         name = EXCLUDED.name,
         password_hash = COALESCE(EXCLUDED.password_hash, students.password_hash),
         level = EXCLUDED.level,
         section = COALESCE(EXCLUDED.section, students.section)
       RETURNING id, name, level, section`,
      [id, name, password, level, sectionInt]
    );
    return result.rows[0];
  }

  static async updatePassword(id, newPassword) {
    const result = await db.query(
      'UPDATE students SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id',
      [newPassword, id]
    );
    return result.rows[0];
  }

  static async verifyPassword(student, plainPassword) {
    return student.password_hash === plainPassword;
  }

  static async getAll() {
    const result = await db.query('SELECT id, name, level, section, password_hash FROM students ORDER BY id');
    return result.rows;
  }

  static async updateSection(id, section) {
    const sectionInt = parseInt(section, 10);
    const result = await db.query(
      'UPDATE students SET section = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [sectionInt, id]
    );
    return result.rows[0];
  }

  // ✅ دالة حذف الطالب (تستخدم في adminRoutes)
  static async delete(id) {
    await db.query('DELETE FROM students WHERE id = $1', [id]);
    return true;
  }
}

module.exports = Student;