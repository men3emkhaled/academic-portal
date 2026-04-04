const db = require('../config/database');

class Course {
  static async findAll() {
    const result = await db.query('SELECT * FROM courses ORDER BY semester, name');
    return result.rows;
  }
  static async findBySemester(semester) {
    const result = await db.query('SELECT * FROM courses WHERE semester = $1 ORDER BY name', [semester]);
    return result.rows;
  }
  static async findById(id) {
    const result = await db.query('SELECT * FROM courses WHERE id = $1', [id]);
    return result.rows[0];
  }
  static async create(name, semester, description, max_score = 40, midtermWeight = 15, practicalWeight = 15, oralWeight = 10) {
    const result = await db.query(
      `INSERT INTO courses (name, semester, description, max_score, midterm_weight, practical_weight, oral_weight) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, semester, description, max_score, midtermWeight, practicalWeight, oralWeight]
    );
    return result.rows[0];
  }
  static async update(id, name, semester, description, max_score, midtermWeight, practicalWeight, oralWeight) {
    const result = await db.query(
      `UPDATE courses SET name=$1, semester=$2, description=$3, max_score=$4, midterm_weight=$5, practical_weight=$6, oral_weight=$7, updated_at=CURRENT_TIMESTAMP WHERE id=$8 RETURNING *`,
      [name, semester, description, max_score, midtermWeight, practicalWeight, oralWeight, id]
    );
    return result.rows[0];
  }
  static async delete(id) {
    await db.query('DELETE FROM courses WHERE id = $1', [id]);
    return true;
  }
  static async getWeights(id) {
    const result = await db.query('SELECT midterm_weight, practical_weight, oral_weight, max_score FROM courses WHERE id = $1', [id]);
    return result.rows[0];
  }
}
module.exports = Course;