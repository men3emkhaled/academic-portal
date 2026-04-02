const db = require('../config/database');

class Student {
    static async findById(id) {
        const result = await db.query('SELECT * FROM students WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async create(id, name) {
        const result = await db.query(
            `INSERT INTO students (id, name) 
             VALUES ($1, $2) 
             ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name 
             RETURNING *`,
            [id, name]
        );
        return result.rows[0];
    }

    static async getAll() {
        const result = await db.query('SELECT * FROM students ORDER BY id');
        return result.rows;
    }

    static async delete(id) {
        await db.query('DELETE FROM students WHERE id = $1', [id]);
        return true;
    }
}

module.exports = Student;