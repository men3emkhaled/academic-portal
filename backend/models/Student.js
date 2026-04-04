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
    // ✅ لو الطالب موجود، متغيرش الباسورد والسكشن إلا لو جايين جدد
    const existing = await this.findById(id);
    
    let finalPassword = password;
    let finalSection = section;
    
    if (existing) {
      // لو الطالب موجود، خلي الباسورد القديم لو مجاش جديد
      finalPassword = password === 'default123' ? existing.password_hash : password;
      finalSection = section !== null && section !== undefined ? section : existing.section;
    }
    
    const result = await db.query(
      `INSERT INTO students (id, name, password_hash, level, section) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (id) DO UPDATE SET 
         name = EXCLUDED.name,
         password_hash = COALESCE(EXCLUDED.password_hash, students.password_hash),
         level = EXCLUDED.level,
         section = COALESCE(EXCLUDED.section, students.section)
       RETURNING id, name, level, section`,
      [id, name, finalPassword, level, finalSection]
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
    const result = await db.query(
      'UPDATE students SET section = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [section, id]
    );
    return result.rows[0];
  }
}

module.exports = Student;