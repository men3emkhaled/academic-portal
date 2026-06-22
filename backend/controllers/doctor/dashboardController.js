const Doctor = require('../../models/Doctor');
const OfficialTask = require('../../models/OfficialTask');
const Inquiry = require('../../models/Inquiry');
const db = require('../../config/database');

const getDashboardStats = async (req, res) => {
    try {
        const doctorId = req.doctor.id;

        // عدد المواد المخصصة للدكتور
        const coursesCount = await db.query(
            'SELECT COUNT(*) FROM doctor_courses WHERE doctor_id = $1',
            [doctorId]
        );

        // عدد الطلاب المسجلين في مواد الدكتور
        const studentsCount = await db.query(
            `SELECT COUNT(DISTINCT sc.student_id) 
             FROM student_courses sc
             JOIN doctor_courses dc ON sc.course_id = dc.course_id
             WHERE dc.doctor_id = $1`,
            [doctorId]
        );

        // عدد الكويزات في مواد الدكتور
        const quizzesCount = await db.query(
            `SELECT COUNT(*) FROM quizzes q
             JOIN doctor_courses dc ON q.course_id = dc.course_id
             WHERE dc.doctor_id = $1`,
            [doctorId]
        );

        // عدد الموارد (Resources) في مواد الدكتور
        const resourcesCount = await db.query(
            `SELECT COUNT(*) FROM resources r
             JOIN doctor_courses dc ON r.course_id = dc.course_id
             WHERE dc.doctor_id = $1`,
            [doctorId]
        );

        res.json({
            courses: parseInt(coursesCount.rows[0].count),
            students: parseInt(studentsCount.rows[0].count),
            quizzes: parseInt(quizzesCount.rows[0].count),
            resources: parseInt(resourcesCount.rows[0].count),
        });
    } catch (error) {
        console.error('Doctor stats error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getRecentActivity = async (req, res) => {
    try {
        const doctorId = req.doctor.id;
        const submissions = await OfficialTask.getRecentSubmissionsForDoctor(doctorId, 5);
        const inquiries = await Inquiry.getRecentForDoctor(doctorId, 5);
        
        const activities = [
            ...submissions.map(s => ({
                id: `sub_${s.task_id}_${s.student_id}`,
                user: s.student_name,
                avatar_url: s.avatar_url,
                action: 'submitted task',
                target: s.task_title,
                time: s.completed_at,
                category: s.course_name,
                status: 'Completed',
                type: 'assignment'
            })),
            ...inquiries.map(i => ({
                id: `inq_${i.id}`,
                user: i.student_name,
                avatar_url: i.avatar_url,
                action: i.type === 'complaint' ? 'sent a complaint' : 'asked a question',
                target: i.subject || 'Inquiry',
                time: i.created_at,
                category: i.course_name,
                status: i.status === 'replied' ? 'Replied' : 'Pending',
                type: i.type === 'complaint' ? 'complaint' : 'question'
            }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);

        res.json(activities);
    } catch (error) {
        console.error('getRecentActivity error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardStats, getRecentActivity };
