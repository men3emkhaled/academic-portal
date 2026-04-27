const db = require('../config/database');

class ExamSchedule {
    static async getAll(departmentId = null) {
        let query = 'SELECT e.*, d.name as department_name FROM exam_schedules e LEFT JOIN departments d ON e.department_id = d.id';
        const params = [];
        if (departmentId) {
            query += ' WHERE e.department_id = $1';
            params.push(departmentId);
        }
        query += ' ORDER BY e.exam_date ASC, e.start_time ASC';
        const result = await db.query(query, params);
        return result.rows;
    }

    static async add(data) {
        const { department_id, course_name, exam_type, exam_date, start_time, end_time } = data;
        const result = await db.query(
            `INSERT INTO exam_schedules (department_id, course_name, exam_type, exam_date, start_time, end_time)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [department_id, course_name, exam_type, exam_date, start_time, end_time]
        );
        return result.rows[0];
    }

    static async update(id, data) {
        const { department_id, course_name, exam_type, exam_date, start_time, end_time } = data;
        const result = await db.query(
            `UPDATE exam_schedules SET department_id = $1, course_name = $2, exam_type = $3, exam_date = $4, start_time = $5, end_time = $6, updated_at = CURRENT_TIMESTAMP
             WHERE id = $7 RETURNING *`,
            [department_id, course_name, exam_type, exam_date, start_time, end_time, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        await db.query('DELETE FROM exam_schedules WHERE id = $1', [id]);
        return true;
    }
}
module.exports = ExamSchedule;
