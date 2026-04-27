const db = require('../config/database');

class Event {
    static async getAll() {
        const result = await db.query('SELECT * FROM events ORDER BY event_date ASC');
        return result.rows;
    }

    static async getUpcoming() {
        const result = await db.query(
            'SELECT * FROM events WHERE event_date >= CURRENT_TIMESTAMP AND is_published = true ORDER BY event_date ASC'
        );
        return result.rows;
    }

    static async findById(id) {
        const result = await db.query('SELECT * FROM events WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async create(eventData) {
        const { title, description, event_date, location, category, is_published } = eventData;
        const result = await db.query(
            `INSERT INTO events (title, description, event_date, location, category, is_published) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING *`,
            [title, description, event_date, location, category, is_published ?? true]
        );
        return result.rows[0];
    }

    static async update(id, eventData) {
        const { title, description, event_date, location, category, is_published } = eventData;
        const result = await db.query(
            `UPDATE events 
             SET title = COALESCE($1, title), 
                 description = COALESCE($2, description), 
                 event_date = COALESCE($3, event_date), 
                 location = COALESCE($4, location), 
                 category = COALESCE($5, category), 
                 is_published = COALESCE($6, is_published),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $7 
             RETURNING *`,
            [title, description, event_date, location, category, is_published, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        await db.query('DELETE FROM events WHERE id = $1', [id]);
        return true;
    }
}

module.exports = Event;
