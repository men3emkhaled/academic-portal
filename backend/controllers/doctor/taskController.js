const Doctor = require('../../models/Doctor');
const db = require('../../config/database');

const getMyTasks = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT ot.*, c.name as course_name 
             FROM official_tasks ot
             JOIN courses c ON ot.course_id = c.id
             JOIN doctor_courses dc ON ot.course_id = dc.course_id
             WHERE dc.doctor_id = $1
             ORDER BY ot.deadline DESC`,
            [req.doctor.id]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createTask = async (req, res) => {
    try {
        const { course_id, title, description, deadline, drive_link, requires_submission } = req.body;
        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, course_id);
        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied for this course' });
        }
        const result = await db.query(
            `INSERT INTO official_tasks (course_id, title, description, deadline, drive_link, requires_submission)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [course_id, title, description, deadline || null, drive_link || null, requires_submission || false]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, deadline, drive_link, requires_submission } = req.body;
        const check = await db.query(
            `SELECT ot.id FROM official_tasks ot
             JOIN doctor_courses dc ON ot.course_id = dc.course_id
             WHERE ot.id = $1 AND dc.doctor_id = $2`,
            [id, req.doctor.id]
        );
        if (check.rows.length === 0) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const result = await db.query(
            `UPDATE official_tasks SET title = $1, description = $2, deadline = $3, drive_link = $4, requires_submission = $5, created_at = CURRENT_TIMESTAMP
             WHERE id = $6 RETURNING *`,
            [title, description, deadline || null, drive_link || null, requires_submission || false, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const check = await db.query(
            `SELECT ot.id FROM official_tasks ot
             JOIN doctor_courses dc ON ot.course_id = dc.course_id
             WHERE ot.id = $1 AND dc.doctor_id = $2`,
            [id, req.doctor.id]
        );
        if (check.rows.length === 0) {
            return res.status(403).json({ message: 'Access denied' });
        }
        await db.query('DELETE FROM official_tasks WHERE id = $1', [id]);
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTaskSubmissions = async (req, res) => {
    try {
        const { taskId } = req.params;
        const check = await db.query(
            `SELECT ot.id FROM official_tasks ot
             JOIN doctor_courses dc ON ot.course_id = dc.course_id
             WHERE ot.id = $1 AND dc.doctor_id = $2`,
            [taskId, req.doctor.id]
        );
        if (check.rows.length === 0) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const OfficialTask = require('../../models/OfficialTask');
        const submissions = await OfficialTask.getSubmissions(taskId);
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const gradeTaskSubmission = async (req, res) => {
    try {
        const { taskId, studentId } = req.params;
        const { grade, feedback } = req.body;

        const check = await db.query(
            `SELECT ot.id FROM official_tasks ot
             JOIN doctor_courses dc ON ot.course_id = dc.course_id
             WHERE ot.id = $1 AND dc.doctor_id = $2`,
            [taskId, req.doctor.id]
        );
        if (check.rows.length === 0) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const OfficialTask = require('../../models/OfficialTask');
        const updated = await OfficialTask.gradeSubmission(taskId, studentId, grade, feedback);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getMyTasks, createTask, updateTask, deleteTask, getTaskSubmissions, gradeTaskSubmission };
