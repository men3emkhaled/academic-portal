const db = require('../config/database');

class Resource {
    static async findByCourseId(courseId) {
        const result = await db.query(
            'SELECT * FROM resources WHERE course_id = $1 ORDER BY type, created_at',
            [courseId]
        );
        return result.rows;
    }

    static async create(courseId, type, title, url) {
        const result = await db.query(
            'INSERT INTO resources (course_id, type, title, url) VALUES ($1, $2, $3, $4) RETURNING *',
            [courseId, type, title, url]
        );
        return result.rows[0];
    }

    static async update(id, type, title, url) {
        const result = await db.query(
            'UPDATE resources SET type = $1, title = $2, url = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
            [type, title, url, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        await db.query('DELETE FROM resources WHERE id = $1', [id]);
        return true;
    }

    static async deleteByCourseId(courseId) {
        await db.query('DELETE FROM resources WHERE course_id = $1', [courseId]);
        return true;
    }
}

module.exports = Resource;