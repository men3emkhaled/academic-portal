const db = require('../config/database');

class Department {
  static async getAll() {
    const result = await db.query('SELECT * FROM departments ORDER BY id ASC');
    return result.rows;
  }

  static async getById(id) {
    const result = await db.query('SELECT * FROM departments WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(name, code, description) {
    const result = await db.query(
      `INSERT INTO departments (name, code, description) 
       VALUES ($1, $2, $3) RETURNING *`,
      [name, code, description]
    );
    return result.rows[0];
  }

  static async update(id, name, code, description) {
    const result = await db.query(
      `UPDATE departments 
       SET name = $1, code = $2, description = $3, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4 RETURNING *`,
      [name, code, description, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await db.query('DELETE FROM departments WHERE id = $1', [id]);
    return true;
  }
}

module.exports = Department;