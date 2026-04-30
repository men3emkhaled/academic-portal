const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const analyticsController = require('../controllers/analyticsController');
const { doctorAuth } = require('../middleware/doctorAuth');

// ==================== AUTH ====================
router.post('/login', doctorController.login);

// ==================== PROTECTED ROUTES ====================
router.use(doctorAuth); // كل المسارات اللي تحت محمية

// Dashboard
router.get('/stats', doctorController.getDashboardStats);
router.get('/profile', doctorController.getProfile);

// Courses (Read Only)
router.get('/courses', doctorController.getMyCourses);

// Quizzes
router.get('/quizzes', doctorController.getMyQuizzes);
router.post('/quizzes', doctorController.createQuiz);
router.put('/quizzes/:id', doctorController.updateQuiz);
router.delete('/quizzes/:id', doctorController.deleteQuiz);
router.patch('/quizzes/:id/publish', doctorController.togglePublishQuiz);

// Questions
router.get('/quizzes/:quizId/questions', doctorController.getQuestions);
router.post('/quizzes/:quizId/questions', doctorController.addQuestion);
router.put('/quizzes/:quizId/questions/:questionId', doctorController.updateQuestion);
router.delete('/quizzes/:quizId/questions/:questionId', doctorController.deleteQuestion);

// Attempts
router.get('/quizzes/:quizId/attempts', doctorController.getQuizAttempts);

// Resources
router.get('/resources/:courseId', doctorController.getMyResources);
router.post('/resources', doctorController.createResource);
router.put('/resources/:id', doctorController.updateResource);
router.delete('/resources/:id', doctorController.deleteResource);

// Grades
router.get('/grades/:courseId', doctorController.getCourseGrades);
router.put('/grades/:courseId/enrollments/:enrollmentId', doctorController.updateGrade);

// Official Tasks
router.get('/tasks', doctorController.getMyTasks);
router.post('/tasks', doctorController.createTask);
router.put('/tasks/:id', doctorController.updateTask);
router.delete('/tasks/:id', doctorController.deleteTask);
router.get('/tasks/:taskId/submissions', doctorController.getTaskSubmissions);
router.post('/tasks/:taskId/submissions/:studentId/grade', doctorController.gradeTaskSubmission);

// Reviews (Written Answers)
router.get('/reviews/pending', doctorController.getPendingReviews);
router.get('/reviews/attempts/:attemptId', doctorController.getAttemptForReview);
router.patch('/reviews/answers/:answerId/grade', doctorController.gradeWrittenAnswer);

// Student Progress & Analytics
router.get('/progress/:courseId', doctorController.getStudentProgress);
router.get('/analytics/:courseId', doctorController.getQuizAnalytics);
router.get('/course-analytics/:courseId', analyticsController.getCourseAnalytics);
router.get('/students/:courseId', doctorController.getCourseStudents);

// Course Content Progress (Syllabus Tracking)
router.get('/course-progress/:courseId', doctorController.getCourseProgress);
router.post('/course-progress', doctorController.addCourseProgress);
router.put('/course-progress/:id', doctorController.updateCourseProgress);
router.patch('/course-progress/:id/toggle', doctorController.toggleCourseProgress);
router.delete('/course-progress/:id', doctorController.deleteCourseProgress);

// Attendance
router.get('/attendance/:courseId/sessions', doctorController.getAttendanceSessions);
router.post('/attendance/sessions', doctorController.createAttendanceSession);
router.put('/attendance/sessions/:id', doctorController.updateAttendanceSession);
router.delete('/attendance/sessions/:id', doctorController.deleteAttendanceSession);
router.get('/attendance/:courseId/export', doctorController.exportCourseAttendance);
router.get('/attendance/sessions/:sessionId/records', doctorController.getAttendanceRecords);
router.post('/attendance/scan', doctorController.scanAttendance);
router.post('/attendance/manual', doctorController.toggleManualAttendance);

// Announcements
router.get('/announcements/:courseId', doctorController.getAnnouncements);
router.post('/announcements', doctorController.createAnnouncement);
router.delete('/announcements/:id', doctorController.deleteAnnouncement);

module.exports = router;
