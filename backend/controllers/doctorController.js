const authController = require('./doctor/authController');
const dashboardController = require('./doctor/dashboardController');
const courseController = require('./doctor/courseController');
const quizController = require('./doctor/quizController');
const resourceController = require('./doctor/resourceController');
const gradeController = require('./doctor/gradeController');
const taskController = require('./doctor/taskController');
const attendanceController = require('./doctor/attendanceController');
const communicationController = require('./doctor/communicationController');
const progressController = require('./doctor/progressController');
const profileController = require('./doctor/profileController');
const scheduleController = require('./doctor/scheduleController');
const taController = require('./doctor/taController');
const standaloneTaController = require('./taController');
const instructorSectionController = require('./doctor/instructorSectionController');

module.exports = {
    // Auth
    login: authController.login,
    getProfile: authController.getProfile,

    // Dashboard
    getDashboardStats: dashboardController.getDashboardStats,
    getRecentActivity: dashboardController.getRecentActivity,

    // Courses
    getMyCourses: courseController.getMyCourses,
    createCourse: courseController.createCourse,
    updateCourse: courseController.updateCourse,
    toggleArchiveCourse: courseController.toggleArchiveCourse,
    assignExistingCourse: courseController.assignExistingCourse,

    // Timetable / Schedule
    getMyTimetable: scheduleController.getMyTimetable,
    addTimetableEntry: scheduleController.addTimetableEntry,
    updateTimetableEntry: scheduleController.updateTimetableEntry,
    deleteTimetableEntry: scheduleController.deleteTimetableEntry,

    // Quizzes
    getMyQuizzes: quizController.getMyQuizzes,
    createQuiz: quizController.createQuiz,
    updateQuiz: quizController.updateQuiz,
    deleteQuiz: quizController.deleteQuiz,
    togglePublishQuiz: quizController.togglePublishQuiz,

    // Questions
    getQuestions: quizController.getQuestions,
    addQuestion: quizController.addQuestion,
    updateQuestion: quizController.updateQuestion,
    deleteQuestion: quizController.deleteQuestion,

    // Quiz Attempts
    getQuizAttempts: quizController.getQuizAttempts,

    // Quiz Reviews
    getPendingReviews: quizController.getPendingReviews,
    getAttemptForReview: quizController.getAttemptForReview,
    gradeWrittenAnswer: quizController.gradeWrittenAnswer,

    // Quiz Analytics
    getQuizAnalytics: quizController.getQuizAnalytics,

    // Resources
    getMyResources: resourceController.getMyResources,
    createResource: resourceController.createResource,
    updateResource: resourceController.updateResource,
    deleteResource: resourceController.deleteResource,

    // Grades
    getCourseGrades: gradeController.getCourseGrades,
    updateGrade: gradeController.updateGrade,

    // Tasks
    getMyTasks: taskController.getMyTasks,
    createTask: taskController.createTask,
    updateTask: taskController.updateTask,
    deleteTask: taskController.deleteTask,
    getTaskSubmissions: taskController.getTaskSubmissions,
    gradeTaskSubmission: taskController.gradeTaskSubmission,

    // Student Progress
    getStudentProgress: progressController.getStudentProgress,
    getCourseStudents: progressController.getCourseStudents,

    // Course Content Progress
    getCourseProgress: progressController.getCourseProgress,
    addCourseProgress: progressController.addCourseProgress,
    updateCourseProgress: progressController.updateCourseProgress,
    toggleCourseProgress: progressController.toggleCourseProgress,
    deleteCourseProgress: progressController.deleteCourseProgress,

    // Attendance
    getAttendanceSessions: attendanceController.getAttendanceSessions,
    createAttendanceSession: attendanceController.createAttendanceSession,
    getAttendanceRecords: attendanceController.getAttendanceRecords,
    scanAttendance: attendanceController.scanAttendance,
    toggleManualAttendance: attendanceController.toggleManualAttendance,
    updateAttendanceSession: attendanceController.updateAttendanceSession,
    deleteAttendanceSession: attendanceController.deleteAttendanceSession,
    exportCourseAttendance: attendanceController.exportCourseAttendance,

    // Announcements
    getAnnouncements: communicationController.getAnnouncements,
    createAnnouncement: communicationController.createAnnouncement,
    deleteAnnouncement: communicationController.deleteAnnouncement,

    // Profile
    updateProfile: profileController.updateProfile,
    changePassword: profileController.changePassword,
    uploadAvatar: profileController.uploadAvatar,

    // TA Management (doctor-scoped)
    getMyTAs: taController.getMyTAs,
    createTA: taController.createTA,
    assignTAToCourse: taController.assignTAToCourse,
    removeTAFromCourse: taController.removeTAFromCourse,
    getCourseTAs: taController.getCourseTAs,

    // TA Dashboard (standalone, uses req.ta)
    getTADashboardStats: standaloneTaController.getTADashboardStats,
    getTACourses: standaloneTaController.getTACourses,
    getTAStudents: standaloneTaController.getTAStudents,

    // Instructor-Section Management
    getCourseInstructorSections: instructorSectionController.getCourseInstructorSections,
    createInstructorSection: instructorSectionController.createInstructorSection,
    deleteInstructorSection: instructorSectionController.deleteInstructorSection,
    getCourseInstructors: instructorSectionController.getCourseInstructors
};
