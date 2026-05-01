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
            SELECT c.*, dc.is_archived,
                   (SELECT COUNT(*) FROM student_courses sc WHERE sc.course_id = c.id) as student_count,
                   d.name as department_name
            FROM courses c
            JOIN doctor_courses dc ON c.id = dc.course_id
            LEFT JOIN departments d ON c.department_id = d.id
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

    static async createCourse(doctorId, name, code, department_id, description = '') {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            const courseResult = await client.query(
                `INSERT INTO courses (name, code, department_id, description)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [name, code, department_id, description]
            );
            const course = courseResult.rows[0];
            await client.query(
                'INSERT INTO doctor_courses (doctor_id, course_id) VALUES ($1, $2)',
                [doctorId, course.id]
            );
            await client.query('COMMIT');
            return course;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async toggleArchiveCourse(doctorId, courseId, isArchived) {
        const result = await db.query(
            'UPDATE doctor_courses SET is_archived = $1 WHERE doctor_id = $2 AND course_id = $3 RETURNING *',
            [isArchived, doctorId, courseId]
        );
        return result.rows[0];
    }

    static async updateCourse(courseId, updates) {
        const { name, code, description, department_id } = updates;
        const result = await db.query(
            `UPDATE courses 
             SET name = COALESCE($1, name), 
                 code = COALESCE($2, code), 
                 description = COALESCE($3, description),
                 department_id = COALESCE($4, department_id),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $5 RETURNING *`,
            [name, code, description, department_id, courseId]
        );
        return result.rows[0];
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
