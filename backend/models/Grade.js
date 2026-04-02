const db = require('../config/database');

class Grade {
    static async findByStudentId(studentId) {
        const result = await db.query(
            `SELECT g.student_id, g.course_name, g.midterm_score, c.max_score
             FROM grades g
             JOIN courses c ON g.course_name = c.name
             WHERE g.student_id = $1
             ORDER BY g.course_name`,
            [studentId]
        );
        return result.rows;
    }

    // 🔹 الدالة المعدلة: تجلب فقط مواد الفصل الثاني (semester = 2)
    static async getStudentGradesWithAllCourses(studentId) {
        const result = await db.query(
            `SELECT 
                c.id as course_id,
                c.name as course_name,
                c.max_score,
                g.midterm_score
             FROM courses c
             LEFT JOIN grades g ON g.course_name = c.name AND g.student_id = $1
             WHERE c.semester = 2
             ORDER BY c.name`,
            [studentId]
        );
        return result.rows;
    }

    static async bulkInsert(grades) {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            for (const grade of grades) {
                await client.query(
                    `INSERT INTO grades (student_id, course_name, midterm_score) 
                     VALUES ($1, $2, $3) 
                     ON CONFLICT (student_id, course_name) 
                     DO UPDATE SET midterm_score = EXCLUDED.midterm_score, updated_at = CURRENT_TIMESTAMP`,
                    [grade.student_id, grade.course_name, grade.midterm_score]
                );
            }
            await client.query('COMMIT');
            return { success: true, count: grades.length };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async getAll() {
        const result = await db.query('SELECT * FROM grades ORDER BY student_id, course_name');
        return result.rows;
    }

    static async deleteByStudentId(studentId) {
        await db.query('DELETE FROM grades WHERE id IN (SELECT id FROM grades WHERE student_id = $1)', [studentId]);
        return true;
    }
}

module.exports = Grade;