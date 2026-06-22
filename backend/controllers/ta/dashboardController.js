const TeachingAssistant = require('../../models/TeachingAssistant');
const db = require('../../config/database');

const getDashboardStats = async (req, res) => {
    try {
        const taId = req.ta.id;

        const coursesCount = await db.query(
            'SELECT COUNT(*) FROM ta_courses WHERE ta_id = $1',
            [taId]
        );

        const studentsCount = await db.query(
            `SELECT COUNT(DISTINCT sc.student_id) 
             FROM student_courses sc
             JOIN ta_courses tc ON sc.course_id = tc.course_id
             WHERE tc.ta_id = $1`,
            [taId]
        );

        const quizzesCount = await db.query(
            `SELECT COUNT(*) FROM quizzes q
             JOIN ta_courses tc ON q.course_id = tc.course_id
             WHERE tc.ta_id = $1`,
            [taId]
        );

        const resourcesCount = await db.query(
            `SELECT COUNT(*) FROM resources r
             JOIN ta_courses tc ON r.course_id = tc.course_id
             WHERE tc.ta_id = $1`,
            [taId]
        );

        res.json({
            courses: parseInt(coursesCount.rows[0].count),
            students: parseInt(studentsCount.rows[0].count),
            quizzes: parseInt(quizzesCount.rows[0].count),
            resources: parseInt(resourcesCount.rows[0].count),
        });
    } catch (error) {
        console.error('TA stats error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardStats };
