const Doctor = require('../../models/Doctor');
const db = require('../../config/database');

const getStudentProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, courseId);
        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied for this course' });
        }

        const result = await db.query(`
            SELECT 
                s.id as student_id, s.name as student_name, s.section, s.avatar_url,
                sc.progress_percentage, sc.status as enrollment_status,
                -- Quiz stats for this student in this course
                (SELECT COUNT(*) FROM quiz_attempts qa 
                 JOIN quizzes q ON qa.quiz_id = q.id 
                 WHERE qa.student_id = s.id AND q.course_id = $1 AND qa.status = 'completed') as quizzes_completed,
                (SELECT COUNT(*) FROM quizzes q 
                 WHERE q.course_id = $1 AND q.is_published = true) as quizzes_total,
                -- Average quiz score
                (SELECT ROUND(AVG(
                    CASE WHEN qa.total_points > 0 THEN (qa.score::numeric / qa.total_points) * 100 ELSE 0 END
                )::numeric, 1) FROM quiz_attempts qa 
                 JOIN quizzes q ON qa.quiz_id = q.id 
                 WHERE qa.student_id = s.id AND q.course_id = $1 AND qa.status = 'completed') as avg_quiz_score,
                -- Task completion
                (SELECT COUNT(*) FROM student_official_tasks sot
                 JOIN official_tasks ot ON sot.task_id = ot.id
                 WHERE sot.student_id = s.id AND ot.course_id = $1 AND sot.is_completed = true) as tasks_completed,
                (SELECT COUNT(*) FROM official_tasks ot WHERE ot.course_id = $1) as tasks_total,
                -- Grades total
                COALESCE(g.midterm_score, 0) + COALESCE(g.practical_score, 0) + COALESCE(g.oral_score, 0) as grade_total
            FROM student_courses sc
            JOIN students s ON sc.student_id = s.id
            LEFT JOIN grades g ON g.enrollment_id = sc.id
            WHERE sc.course_id = $1
            ORDER BY s.name
        `, [courseId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Student progress error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getCourseStudents = async (req, res) => {
    try {
        const { courseId } = req.params;
        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, courseId);
        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied for this course' });
        }

        const result = await db.query(`
            SELECT 
                s.id, s.name, s.email, s.section, s.level, s.avatar_url,
                sc.progress_percentage, sc.status, sc.enrolled_at
            FROM student_courses sc
            JOIN students s ON sc.student_id = s.id
            WHERE sc.course_id = $1
            ORDER BY s.name
        `, [courseId]);

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCourseProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, courseId);
        if (!hasAccess) return res.status(403).json({ message: 'Access denied' });

        const result = await db.query(
            'SELECT * FROM course_progress WHERE course_id = $1 ORDER BY order_index ASC, id ASC',
            [courseId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addCourseProgress = async (req, res) => {
    try {
        const { courseId, title, order_index } = req.body;
        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, courseId);
        if (!hasAccess) return res.status(403).json({ message: 'Access denied' });

        const result = await db.query(
            'INSERT INTO course_progress (course_id, title, is_completed, order_index) VALUES ($1, $2, false, COALESCE($3, 0)) RETURNING *',
            [courseId, title, order_index || 0]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateCourseProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, order_index } = req.body;

        const item = await db.query('SELECT course_id FROM course_progress WHERE id = $1', [id]);
        if (item.rows.length === 0) return res.status(404).json({ message: 'Item not found' });

        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, item.rows[0].course_id);
        if (!hasAccess) return res.status(403).json({ message: 'Access denied' });

        const result = await db.query(
            'UPDATE course_progress SET title = $1, order_index = COALESCE($2, order_index) WHERE id = $3 RETURNING *',
            [title, order_index, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const toggleCourseProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_completed } = req.body;

        const item = await db.query('SELECT course_id FROM course_progress WHERE id = $1', [id]);
        if (item.rows.length === 0) return res.status(404).json({ message: 'Item not found' });

        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, item.rows[0].course_id);
        if (!hasAccess) return res.status(403).json({ message: 'Access denied' });

        const result = await db.query(
            'UPDATE course_progress SET is_completed = $1 WHERE id = $2 RETURNING *',
            [is_completed, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteCourseProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await db.query('SELECT course_id FROM course_progress WHERE id = $1', [id]);
        if (item.rows.length === 0) return res.status(404).json({ message: 'Item not found' });

        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, item.rows[0].course_id);
        if (!hasAccess) return res.status(403).json({ message: 'Access denied' });

        await db.query('DELETE FROM course_progress WHERE id = $1', [id]);
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getStudentProgress, getCourseStudents, getCourseProgress, addCourseProgress, updateCourseProgress, toggleCourseProgress, deleteCourseProgress };
