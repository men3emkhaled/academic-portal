const Doctor = require('../../models/Doctor');
const db = require('../../config/database');

const getCourseGrades = async (req, res) => {
    try {
        const { courseId } = req.params;
        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, courseId);
        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied for this course' });
        }

        const result = await db.query(
            `SELECT 
                sc.id as enrollment_id, s.id as student_id, s.name as student_name, s.section, s.avatar_url,
                g.midterm_score, g.midterm_status,
                g.practical_score, g.practical_status,
                g.oral_score, g.oral_status,
                COALESCE(g.midterm_score, 0) + COALESCE(g.practical_score, 0) + COALESCE(g.oral_score, 0) as total_score
             FROM student_courses sc
             JOIN students s ON sc.student_id = s.id
             LEFT JOIN grades g ON g.enrollment_id = sc.id
             WHERE sc.course_id = $1
             ORDER BY s.name`,
            [courseId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateGrade = async (req, res) => {
    try {
        const { courseId, enrollmentId } = req.params;
        const { midterm_score, practical_score, oral_score } = req.body;

        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, courseId);
        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied for this course' });
        }

        const check = await db.query('SELECT id FROM student_courses WHERE id = $1 AND course_id = $2', [enrollmentId, courseId]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Enrollment not found in this course' });
        }

        const result = await db.query(
            `INSERT INTO grades (enrollment_id, midterm_score, practical_score, oral_score) 
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (enrollment_id) 
             DO UPDATE SET 
                midterm_score = EXCLUDED.midterm_score,
                practical_score = EXCLUDED.practical_score,
                oral_score = EXCLUDED.oral_score,
                updated_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [
                enrollmentId,
                midterm_score !== '' && midterm_score !== null ? midterm_score : null,
                practical_score !== '' && practical_score !== null ? practical_score : null,
                oral_score !== '' && oral_score !== null ? oral_score : null
            ]
        );

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getCourseGrades, updateGrade };
