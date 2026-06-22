const db = require('../config/database');
const TeachingAssistant = require('../models/TeachingAssistant');
const taAuthController = require('./taAuthController');
const dashboardController = require('./ta/dashboardController');
const quizController = require('./ta/quizController');
const resourceController = require('./ta/resourceController');
const taskController = require('./ta/taskController');
const profileController = require('./ta/profileController');

const gradeController = require('./doctor/gradeController');
const attendanceController = require('./doctor/attendanceController');
const progressController = require('./doctor/progressController');
const communicationController = require('./doctor/communicationController');

// ── Original standalone TA endpoints ──

const getTADashboardStats = async (req, res) => {
    try {
        const taId = req.ta.id;
        const courses = await TeachingAssistant.getTACourses(taId);
        const courseIds = courses.map(c => c.id);
        let totalStudents = 0;
        if (courseIds.length > 0) {
            const studentCount = await db.query(
                'SELECT COUNT(DISTINCT student_id) as count FROM student_courses WHERE course_id = ANY($1)',
                [courseIds]
            );
            totalStudents = parseInt(studentCount.rows[0].count) || 0;
        }
        res.json({ courses_count: courses.length, students_count: totalStudents });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTACourses = async (req, res) => {
    try {
        const taId = req.ta.id;
        const courses = await TeachingAssistant.getTACourses(taId);
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTAStudents = async (req, res) => {
    try {
        const { courseId } = req.params;
        const taId = req.ta.id;
        const hasAccess = await db.query(
            'SELECT id FROM ta_courses WHERE ta_id = $1 AND course_id = $2',
            [taId, courseId]
        );
        if (hasAccess.rows.length === 0) {
            return res.status(403).json({ message: 'Access denied to this course' });
        }
        const result = await db.query(`
            SELECT s.id, s.name, s.email, s.section, s.level, s.avatar_url,
                   sc.progress_percentage, sc.status, sc.enrolled_at
            FROM students s
            JOIN student_courses sc ON s.id = sc.student_id
            WHERE sc.course_id = $1
            ORDER BY s.name
        `, [courseId]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    // Original standalone
    getTADashboardStats, getTACourses, getTAStudents,

    // Auth
    login: taAuthController.login,
    getProfile: taAuthController.getProfile,

    // Dashboard
    getDashboardStats: dashboardController.getDashboardStats,

    // Quizzes
    getMyQuizzes: quizController.getMyQuizzes,
    createQuiz: quizController.createQuiz,
    updateQuiz: quizController.updateQuiz,
    deleteQuiz: quizController.deleteQuiz,
    togglePublishQuiz: quizController.togglePublishQuiz,
    getQuestions: quizController.getQuestions,
    addQuestion: quizController.addQuestion,
    updateQuestion: quizController.updateQuestion,
    deleteQuestion: quizController.deleteQuestion,
    getQuizAttempts: quizController.getQuizAttempts,
    getPendingReviews: quizController.getPendingReviews,
    getAttemptForReview: quizController.getAttemptForReview,
    gradeWrittenAnswer: quizController.gradeWrittenAnswer,
    getQuizAnalytics: quizController.getQuizAnalytics,

    // Resources
    getMyResources: resourceController.getMyResources,
    createResource: resourceController.createResource,
    updateResource: resourceController.updateResource,
    deleteResource: resourceController.deleteResource,

    // Grades (shared — uses doctor controller + taCompatibility)
    getCourseGrades: gradeController.getCourseGrades,
    updateGrade: gradeController.updateGrade,

    // Tasks
    getMyTasks: taskController.getMyTasks,
    createTask: taskController.createTask,
    updateTask: taskController.updateTask,
    deleteTask: taskController.deleteTask,
    getTaskSubmissions: taskController.getTaskSubmissions,
    gradeTaskSubmission: taskController.gradeTaskSubmission,

    // Attendance (shared)
    getAttendanceSessions: attendanceController.getAttendanceSessions,
    createAttendanceSession: attendanceController.createAttendanceSession,
    getAttendanceRecords: attendanceController.getAttendanceRecords,
    scanAttendance: attendanceController.scanAttendance,
    toggleManualAttendance: attendanceController.toggleManualAttendance,
    updateAttendanceSession: attendanceController.updateAttendanceSession,
    deleteAttendanceSession: attendanceController.deleteAttendanceSession,
    exportCourseAttendance: attendanceController.exportCourseAttendance,

    // Announcements (shared)
    getAnnouncements: communicationController.getAnnouncements,
    createAnnouncement: communicationController.createAnnouncement,
    deleteAnnouncement: communicationController.deleteAnnouncement,

    // Student Progress (shared)
    getStudentProgress: progressController.getStudentProgress,
    getCourseStudents: progressController.getCourseStudents,
    getCourseProgress: progressController.getCourseProgress,
    addCourseProgress: progressController.addCourseProgress,
    updateCourseProgress: progressController.updateCourseProgress,
    toggleCourseProgress: progressController.toggleCourseProgress,
    deleteCourseProgress: progressController.deleteCourseProgress,

    // Profile
    updateProfile: profileController.updateProfile,
    changePassword: profileController.changePassword,
    uploadAvatar: profileController.uploadAvatar,
};
