const express = require('express');
const router = express.Router();
const taController = require('../controllers/taController');
const { taAuth } = require('../middleware/taAuth');
const { taCompatibility } = require('../middleware/taCompatibility');
const { uploadAvatar, handleMulterError } = require('../middleware/upload');

// Auth
router.post('/login', taController.login);

// Profile
router.get('/profile', taAuth, taController.getProfile);
router.put('/profile', taAuth, taController.updateProfile);
router.put('/change-password', taAuth, taController.changePassword);
router.post('/upload-avatar', taAuth, (req, res, next) => {
    uploadAvatar.single('avatar')(req, res, (err) => {
        if (err) return handleMulterError(err, req, res, next);
        next();
    });
}, taController.uploadAvatar);

// Dashboard
router.get('/stats', taAuth, taController.getDashboardStats);

// Courses (read-only)
router.get('/courses', taAuth, taController.getTACourses);
router.get('/courses/:courseId/students', taAuth, taController.getTAStudents);

// ═══════════════════════════════════════════════════════
// All routes below require taCompatibility to map req.ta → req.doctor
// so existing doctor controllers work unchanged
// ═══════════════════════════════════════════════════════

router.use(taAuth, taCompatibility);

// Grades (shared pool)
router.get('/grades/:courseId', taController.getCourseGrades);
router.put('/grades/:courseId/enrollments/:enrollmentId', taController.updateGrade);

// Resources (shared pool)
router.get('/resources/:courseId', taController.getMyResources);
router.post('/resources', taController.createResource);
router.put('/resources/:id', taController.updateResource);
router.delete('/resources/:id', taController.deleteResource);

// Quizzes
router.get('/quizzes', taController.getMyQuizzes);
router.post('/quizzes', taController.createQuiz);
router.put('/quizzes/:id', taController.updateQuiz);
router.delete('/quizzes/:id', taController.deleteQuiz);
router.patch('/quizzes/:id/publish', taController.togglePublishQuiz);

// Questions
router.get('/quizzes/:quizId/questions', taController.getQuestions);
router.post('/quizzes/:quizId/questions', taController.addQuestion);
router.put('/quizzes/:quizId/questions/:questionId', taController.updateQuestion);
router.delete('/quizzes/:quizId/questions/:questionId', taController.deleteQuestion);

// Attempts
router.get('/quizzes/:quizId/attempts', taController.getQuizAttempts);

// Reviews (Written Answers)
router.get('/reviews/pending', taController.getPendingReviews);
router.get('/reviews/attempts/:attemptId', taController.getAttemptForReview);
router.patch('/reviews/answers/:answerId/grade', taController.gradeWrittenAnswer);

// Analytics
router.get('/analytics/:courseId', taController.getQuizAnalytics);

// Tasks
router.get('/tasks', taController.getMyTasks);
router.post('/tasks', taController.createTask);
router.put('/tasks/:id', taController.updateTask);
router.delete('/tasks/:id', taController.deleteTask);
router.get('/tasks/:taskId/submissions', taController.getTaskSubmissions);
router.post('/tasks/:taskId/submissions/:studentId/grade', taController.gradeTaskSubmission);

// Attendance
router.get('/attendance/:courseId/sessions', taController.getAttendanceSessions);
router.post('/attendance/sessions', taController.createAttendanceSession);
router.put('/attendance/sessions/:id', taController.updateAttendanceSession);
router.delete('/attendance/sessions/:id', taController.deleteAttendanceSession);
router.get('/attendance/:courseId/export', taController.exportCourseAttendance);
router.get('/attendance/sessions/:sessionId/records', taController.getAttendanceRecords);
router.post('/attendance/scan', taController.scanAttendance);
router.post('/attendance/manual', taController.toggleManualAttendance);

// Announcements
router.get('/announcements/:courseId', taController.getAnnouncements);
router.post('/announcements', taController.createAnnouncement);
router.delete('/announcements/:id', taController.deleteAnnouncement);

// Student Progress
router.get('/progress/:courseId', taController.getStudentProgress);
router.get('/progress/:courseId/students', taController.getCourseStudents);
router.get('/course-progress/:courseId', taController.getCourseProgress);
router.post('/course-progress', taController.addCourseProgress);
router.put('/course-progress/:id', taController.updateCourseProgress);
router.patch('/course-progress/:id/toggle', taController.toggleCourseProgress);
router.delete('/course-progress/:id', taController.deleteCourseProgress);

module.exports = router;
