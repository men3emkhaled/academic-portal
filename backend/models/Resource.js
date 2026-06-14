const db = require('../config/database');

class Resource {
    static async findByCourseId(courseId) {
        const result = await db.query(
            'SELECT * FROM resources WHERE course_id = $1 ORDER BY type, created_at',
            [courseId]
        );
        return result.rows;
    }

    static async create(courseId, type, title, url, batch = 2025) {
        const result = await db.query(
            'INSERT INTO resources (course_id, type, title, url, batch) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [courseId, type, title, url, batch]
        );
        return result.rows[0];
    }

    static async update(id, type, title, url, batch) {
        const updates = [];
        const values = [];
        let index = 1;
        if (type !== undefined) { updates.push(`type = $${index++}`); values.push(type); }
        if (title !== undefined) { updates.push(`title = $${index++}`); values.push(title); }
        if (url !== undefined) { updates.push(`url = $${index++}`); values.push(url); }
        if (batch !== undefined) { updates.push(`batch = $${index++}`); values.push(batch); }
        
        if (updates.length === 0) return null;
        
        values.push(id);
        const result = await db.query(
            `UPDATE resources SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${index} RETURNING *`,
            values
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