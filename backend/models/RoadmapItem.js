const db = require('../config/database');

class RoadmapItem {
    static async findAll() {
        const result = await db.query('SELECT * FROM roadmap_items ORDER BY order_index ASC');
        return result.rows;
    }

    static async findById(id) {
        const result = await db.query('SELECT * FROM roadmap_items WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async create(title, description, video_url, order_index = 0) {
        const result = await db.query(
            `INSERT INTO roadmap_items (title, description, video_url, order_index)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [title, description, video_url, order_index]
        );
        return result.rows[0];
    }

    static async update(id, title, description, video_url, order_index) {
        const result = await db.query(
            `UPDATE roadmap_items
             SET title = $1, description = $2, video_url = $3, order_index = $4, updated_at = CURRENT_TIMESTAMP
             WHERE id = $5 RETURNING *`,
            [title, description, video_url, order_index, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        await db.query('DELETE FROM roadmap_items WHERE id = $1', [id]);
        return true;
    }
}

module.exports = RoadmapItem;