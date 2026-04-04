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

    static async findByName(name) {
        const result = await db.query('SELECT * FROM courses WHERE name = $1', [name]);
        return result.rows[0];
    }

    static async create(name, semester, description, max_score = 15) {
        const result = await db.query(
            'INSERT INTO courses (name, semester, description, max_score) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, semester, description, max_score]
        );
        return result.rows[0];
    }

    static async update(id, name, semester, description, max_score) {
        const result = await db.query(
            `UPDATE courses 
             SET name = $1, semester = $2, description = $3, max_score = $4, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $5 RETURNING *`,
            [name, semester, description, max_score, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        await db.query('DELETE FROM courses WHERE id = $1', [id]);
        return true;
    }
}

module.exports = Course;