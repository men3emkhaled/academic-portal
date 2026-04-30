const db = require('../config/database');
const bcrypt = require('bcryptjs');

class Doctor {
    static async create(id, name, email, password, department_id = null) {
        // Here we could hash the password
        // The project seems to use plain text or simple hashes in some places. I'll use bcrypt.
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await db.query(
            `INSERT INTO doctors (id, name, email, password, department_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, name, email, department_id`,
            [id, name, email, hashedPassword, department_id]
        );
        return result.rows[0];
    }

    static async findById(id) {
        const result = await db.query('SELECT id, name, email, department_id FROM doctors WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async findByEmail(email) {
        const result = await db.query('SELECT * FROM doctors WHERE email = $1', [email]);
        return result.rows[0];
    }

    static async verifyPassword(doctor, password) {
        return await bcrypt.compare(password, doctor.password);
    }

    static async getDoctorCourses(doctorId) {
        const query = `
            SELECT c.* 
            FROM courses c
            JOIN doctor_courses dc ON c.id = dc.course_id
            WHERE dc.doctor_id = $1
        `;
        const result = await db.query(query, [doctorId]);
        return result.rows;
    }

    static async hasCourseAccess(doctorId, courseId) {
        const result = await db.query(
            'SELECT 1 FROM doctor_courses WHERE doctor_id = $1 AND course_id = $2',
            [doctorId, courseId]
        );
        return result.rows.length > 0;
    }

    static async assignCourse(doctorId, courseId) {
        const result = await db.query(
            'INSERT INTO doctor_courses (doctor_id, course_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
            [doctorId, courseId]
        );
        return result.rows[0];
    }

    static async removeCourse(doctorId, courseId) {
        await db.query(
            'DELETE FROM doctor_courses WHERE doctor_id = $1 AND course_id = $2',
            [doctorId, courseId]
        );
    }

    static async getAll() {
        const result = await db.query(`
            SELECT d.id, d.name, d.email, d.department_id, dep.name as department_name
            FROM doctors d
            LEFT JOIN departments dep ON d.department_id = dep.id
            ORDER BY d.name
        `);
        return result.rows;
    }
}

module.exports = Doctor;
