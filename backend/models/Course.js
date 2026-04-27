const db = require('../config/database');

class Course {
  // جلب جميع المواد مع اسم القسم (إذا أردت)
  static async findAll() {
    const result = await db.query(`
      SELECT c.*, d.name as department_name, d.code as department_code
      FROM courses c
      LEFT JOIN departments d ON c.department_id = d.id
      ORDER BY c.semester, c.name
    `);
    return result.rows;
  }

  static async findBySemester(semester) {
    const result = await db.query(`
      SELECT c.*, d.name as department_name
      FROM courses c
      LEFT JOIN departments d ON c.department_id = d.id
      WHERE c.semester = $1
      ORDER BY c.name
    `, [semester]);
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query(`
      SELECT c.*, d.name as department_name
      FROM courses c
      LEFT JOIN departments d ON c.department_id = d.id
      WHERE c.id = $1
    `, [id]);
    return result.rows[0];
  }

  static async findByName(name) {
    const result = await db.query('SELECT * FROM courses WHERE name = $1', [name]);
    return result.rows[0];
  }

  // دالة create المعدلة (تقبل department_id)
  static async create(name, semester, description, max_score = 40, department_id = null) {
    const result = await db.query(
      `INSERT INTO courses (name, semester, description, max_score, midterm_max, practical_max, oral_max, department_id) 
       VALUES ($1, $2, $3, $4, 15, 15, 10, $5) 
       RETURNING *`,
      [name, semester, description, max_score, department_id]
    );
    return result.rows[0];
  }

  // دالة update المعدلة (تقبل department_id)
  static async update(id, name, semester, description, max_score, department_id = null) {
    const result = await db.query(
      `UPDATE courses 
       SET name = $1, semester = $2, description = $3, max_score = $4, department_id = $5, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $6 RETURNING *`,
      [name, semester, description, max_score, department_id, id]
    );
    return result.rows[0];
  }

  static async updateGradeDistribution(id, midterm_max, practical_max, oral_max) {
    const total = midterm_max + practical_max + oral_max;
    const result = await db.query(
      `UPDATE courses 
       SET midterm_max = $1, practical_max = $2, oral_max = $3, max_score = $4, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5 RETURNING *`,
      [midterm_max, practical_max, oral_max, total, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await db.query('DELETE FROM courses WHERE id = $1', [id]);
    return true;
  }
}

module.exports = Course;