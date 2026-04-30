const db = require('../config/database');
const bcrypt = require('bcryptjs');

class Doctor {
    static async create(name, email, password, department = null) {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await db.query(
            `INSERT INTO doctors (name, email, password, department)
             VALUES ($1, $2, $3, $4)
             RETURNING id, name, email, department`,
            [name, email, hashedPassword, department]
        );
        return result.rows[0];
    }

    static async findById(id) {
        const result = await db.query('SELECT id, name, email, department FROM doctors WHERE id = $1', [id]);
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
            SELECT id, name, email, department
            FROM doctors
            ORDER BY name
        `);
        return result.rows;
    }
}

module.exports = Doctor;
