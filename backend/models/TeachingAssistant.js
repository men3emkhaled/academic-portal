const db = require('../config/database');
const bcrypt = require('bcryptjs');

class TeachingAssistant {
    static async create(name, email, password, department_id = null, phone = null) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            `INSERT INTO teaching_assistants (name, email, password, department_id, phone)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, name, email, phone, department_id, created_at`,
            [name, email, hashedPassword, department_id, phone]
        );
        return result.rows[0];
    }

    static async findById(id) {
        const result = await db.query(
            `SELECT ta.*, d.name as department_name
             FROM teaching_assistants ta
             LEFT JOIN departments d ON ta.department_id = d.id
             WHERE ta.id = $1`,
            [id]
        );
        return result.rows[0];
    }

    static async findByEmail(email) {
        const result = await db.query(
            'SELECT * FROM teaching_assistants WHERE email = $1',
            [email]
        );
        return result.rows[0];
    }

    static async getAll() {
        const result = await db.query(`
            SELECT ta.id, ta.name, ta.email, ta.phone, ta.department_id, ta.created_at,
                   d.name as department_name,
                   (SELECT COUNT(*) FROM ta_courses tc WHERE tc.ta_id = ta.id) as courses_count
            FROM teaching_assistants ta
            LEFT JOIN departments d ON ta.department_id = d.id
            ORDER BY ta.name
        `);
        return result.rows;
    }

    static async update(id, data) {
        const { name, email, password, department_id, phone } = data;
        const updates = [];
        const values = [];

        if (name) { updates.push(`name = $${updates.length + 1}`); values.push(name); }
        if (email) { updates.push(`email = $${updates.length + 1}`); values.push(email); }
        if (department_id !== undefined) { updates.push(`department_id = $${updates.length + 1}`); values.push(department_id); }
        if (phone !== undefined) { updates.push(`phone = $${updates.length + 1}`); values.push(phone); }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updates.push(`password = $${updates.length + 1}`);
            values.push(hashedPassword);
        }

        if (updates.length === 0) return null;

        const query = `UPDATE teaching_assistants SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${updates.length + 1} RETURNING id, name, email, phone, department_id`;
        values.push(id);
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async delete(id) {
        await db.query('DELETE FROM ta_courses WHERE ta_id = $1', [id]);
        const result = await db.query('DELETE FROM teaching_assistants WHERE id = $1 RETURNING id', [id]);
        return result.rows[0];
    }

    static async verifyPassword(ta, password) {
        return await bcrypt.compare(password, ta.password);
    }

    static async hasCourseAccess(taId, courseId) {
        const result = await db.query(
            'SELECT 1 FROM ta_courses WHERE ta_id = $1 AND course_id = $2',
            [taId, courseId]
        );
        return result.rows.length > 0;
    }

    static async getTACourses(taId) {
        const result = await db.query(`
            SELECT c.*, tc.assigned_at,
                   (SELECT COUNT(*) FROM student_courses sc WHERE sc.course_id = c.id) as student_count
            FROM courses c
            JOIN ta_courses tc ON c.id = tc.course_id
            WHERE tc.ta_id = $1
            ORDER BY c.name
        `, [taId]);
        return result.rows;
    }

    static async assignCourse(taId, courseId) {
        const result = await db.query(
            'INSERT INTO ta_courses (ta_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
            [taId, courseId]
        );
        return result.rows[0];
    }

    static async removeCourse(taId, courseId) {
        await db.query('DELETE FROM ta_courses WHERE ta_id = $1 AND course_id = $2', [taId, courseId]);
    }

    static async getTAsByCourse(courseId) {
        const result = await db.query(`
            SELECT ta.id, ta.name, ta.email, ta.phone
            FROM teaching_assistants ta
            JOIN ta_courses tc ON ta.id = tc.ta_id
            WHERE tc.course_id = $1
            ORDER BY ta.name
        `, [courseId]);
        return result.rows;
    }

    static async getDoctorsByCourse(courseId) {
        const result = await db.query(`
            SELECT d.id, d.name, d.email, d.department
            FROM doctors d
            JOIN doctor_courses dc ON d.id = dc.doctor_id
            WHERE dc.course_id = $1
            ORDER BY d.name
        `, [courseId]);
        return result.rows;
    }
}

module.exports = TeachingAssistant;
