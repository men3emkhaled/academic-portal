const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const studentController = require('../controllers/studentController');
const studentCourseController = require('../controllers/studentCourseController');
const adminDoctorController = require('../controllers/adminDoctorController');
const adminTAController = require('../controllers/adminTeachingAssistantController');
const gradeController = require('../controllers/gradeController');
const xss = require('xss');
const { upload, handleMulterError } = require('../middleware/upload');
const { adminAuth, checkPermission } = require('../middleware/auth');
const { studentCreationLimiter } = require('../middleware/rateLimiter');
const db = require('../config/database');
const quizController = require('../controllers/quizController');

router.post('/login', adminController.login);
router.get('/stats', adminAuth, adminController.getDashboardStats);

// ------------------- Students Management -------------------
router.get('/students-with-passwords', adminAuth, async (req, res) => {
  try {
    const Student = require('../models/Student');
    const students = await Student.getAll();
    res.json(students.map(s => ({
      id: s.id,
      name: s.name,
      level: s.level,
      section: s.section,
      department_id: s.department_id,
      department_name: s.department_name,
      password: '••••••'
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/students', adminAuth, studentController.getAllStudents);

// ✅ إضافة طالب يدويًا
router.post('/students', adminAuth, async (req, res) => {
  try {
    const { id, name, password, level, section, department_id, batch } = req.body;
    if (!id || !name) {
      return res.status(400).json({ message: 'Student ID and name are required' });
    }
    const Student = require('../models/Student');
    const student = await Student.create(id, xss(name), password || '123456', level || 1, section, department_id, batch || 2025);
    
    // ✅ Auto-enrollment removed — students register courses manually now
    
    res.status(201).json(student);
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post(
  '/upload-students',
  adminAuth,
  upload.single('file'),
  handleMulterError,
  studentCreationLimiter,
  studentController.uploadStudentsExcel
);

router.put('/students/:id/section', adminAuth, studentController.updateStudentSection);
router.put('/students/:id/role', adminAuth, studentController.updateStudentRole);
router.put('/students/:id/reset-password', adminAuth, studentController.resetStudentPassword);

// ✅ جديد: إدارة درجات الطالب الفردي
router.get('/students/:studentId/grades', adminAuth, gradeController.getGradesByStudentId);
router.put('/students/:studentId/grades/:courseId', adminAuth, gradeController.updateStudentGradeByCourseId);

// ------------------- Student Courses Management -------------------
router.get('/students/:studentId/courses', adminAuth, studentCourseController.getStudentCourses);
router.post('/students/:studentId/courses', adminAuth, studentCourseController.addCourseToStudent);
router.get('/students/:studentId/available-courses', adminAuth, studentCourseController.getAvailableCourses);
router.post('/students/:studentId/courses/:courseId', adminAuth, studentCourseController.addCourseToStudent);
router.delete('/students/:studentId/courses/:courseId', adminAuth, studentCourseController.removeCourseFromStudent);

// ------------------- Update & Delete Student -------------------
router.put('/students/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, level, section, department_id, batch } = req.body;
    const updates = [];
    const values = [];
    if (name) { updates.push(`name = $${updates.length + 1}`); values.push(name); }
    if (level !== undefined) { updates.push(`level = $${updates.length + 1}`); values.push(parseInt(level)); }
    if (section !== undefined) { updates.push(`section = $${updates.length + 1}`); values.push(section); }
    if (department_id !== undefined) { updates.push(`department_id = $${updates.length + 1}`); values.push(department_id); }
    if (batch !== undefined) { updates.push(`batch = $${updates.length + 1}`); values.push(parseInt(batch)); }
    if (updates.length === 0) return res.status(400).json({ message: 'No fields to update' });
    const query = `UPDATE students SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${updates.length + 1} RETURNING *`;
    values.push(id);
    const result = await db.query(query, values);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Student not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/students/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM student_answers WHERE attempt_id IN (SELECT id FROM quiz_attempts WHERE student_id = $1)', [id]);
    await db.query('DELETE FROM quiz_attempts WHERE student_id = $1', [id]);
    await db.query('DELETE FROM grades WHERE student_id = $1', [id]);
    await db.query('DELETE FROM notifications WHERE student_id = $1', [id]);
    await db.query('DELETE FROM student_task_progress WHERE student_id = $1', [id]);
    await db.query('DELETE FROM student_courses WHERE student_id = $1', [id]);
    await db.query('DELETE FROM students WHERE id = $1', [id]);
    res.json({ message: 'Student and all related data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== DOCTORS MANAGEMENT (ADMIN) ====================
router.get('/doctors', adminAuth, adminDoctorController.getAllDoctors);
router.post('/doctors', adminAuth, adminDoctorController.createDoctor);
router.put('/doctors/:id', adminAuth, adminDoctorController.updateDoctor);
router.delete('/doctors/:id', adminAuth, adminDoctorController.deleteDoctor);
router.get('/doctors/:id/courses', adminAuth, adminDoctorController.getDoctorCourses);
router.post('/doctors/:id/courses/:courseId', adminAuth, adminDoctorController.assignCourseToDoctor);
router.delete('/doctors/:id/courses/:courseId', adminAuth, adminDoctorController.removeCourseFromDoctor);

// ==================== TEACHING ASSISTANTS MANAGEMENT (ADMIN) ====================
router.get('/teaching-assistants', adminAuth, adminTAController.getAllTAs);
router.post('/teaching-assistants', adminAuth, adminTAController.createTA);
router.put('/teaching-assistants/:id', adminAuth, adminTAController.updateTA);
router.delete('/teaching-assistants/:id', adminAuth, adminTAController.deleteTA);
router.get('/teaching-assistants/:id/courses', adminAuth, adminTAController.getTACourses);
router.post('/teaching-assistants/:id/courses/:courseId', adminAuth, adminTAController.assignCourseToTA);
router.delete('/teaching-assistants/:id/courses/:courseId', adminAuth, adminTAController.removeCourseFromTA);

// ==================== QUIZ MANAGEMENT (ADMIN) ====================
router.get('/quizzes', checkPermission('manage_quizzes'), quizController.getAllQuizzes);
router.post('/quizzes', checkPermission('manage_quizzes'), quizController.createQuiz);
router.put('/quizzes/:id', checkPermission('manage_quizzes'), quizController.updateQuiz);
router.delete('/quizzes/:id', checkPermission('manage_quizzes'), quizController.deleteQuiz);
router.patch('/quizzes/:id/publish', checkPermission('manage_quizzes'), quizController.togglePublishQuiz);
router.get('/quizzes/:id/publish', checkPermission('manage_quizzes'), quizController.togglePublishQuiz);
router.get('/quizzes/:quizId/questions', checkPermission('manage_quizzes'), quizController.getQuestionsAdmin);
router.post('/quizzes/:quizId/questions', checkPermission('manage_quizzes'), quizController.addQuestion);
router.put('/quizzes/:quizId/questions/:questionId', checkPermission('manage_quizzes'), quizController.updateQuestion);
router.delete('/quizzes/:quizId/questions/:questionId', checkPermission('manage_quizzes'), quizController.deleteQuestion);
router.get('/quizzes/:quizId/attempts', checkPermission('manage_quizzes'), quizController.getQuizAttempts);
router.get('/attempts/:attemptId/details', checkPermission('manage_quizzes'), quizController.getAttemptDetails);

// ✅ مسارات المراجعة (Written Answers)
router.get('/quizzes/pending-reviews', checkPermission('manage_quizzes'), quizController.getPendingReviews);
router.get('/quizzes/attempts/:attemptId/review', checkPermission('manage_quizzes'), quizController.getAttemptForReview);
router.patch('/quizzes/answers/:answerId/grade', checkPermission('manage_quizzes'), quizController.gradeWrittenAnswer);

// ── Upgrade Semester ──
router.post('/upgrade-semester', adminAuth, async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Get current active semester
    const semRes = await client.query("SELECT value FROM system_settings WHERE key = 'active_semester'");
    const currentSem = semRes.rows.length > 0 ? parseInt(semRes.rows[0].value, 10) : 2;
    const nextSem = currentSem + 1;

    // 2. Update active semester
    await client.query(
      "INSERT INTO system_settings (key, value) VALUES ('active_semester', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
      [String(nextSem)]
    );

    // 3. Archive all current active student courses
    // 'active' -> 'completed'
    await client.query(
      "UPDATE student_courses SET status = 'completed' WHERE status = 'active'"
    );

    // 4. Clear timetable and exam schedule for the new semester
    await client.query("DELETE FROM timetable");
    await client.query("DELETE FROM exam_schedules");

    // 5. If the next semester is odd (3, 5, 7, etc.), increment students level by 1
    if (nextSem % 2 !== 0) {
      await client.query(
        "UPDATE students SET level = level + 1 WHERE level < 4"
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Semester upgraded successfully', active_semester: nextSem });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during semester transition:', error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

module.exports = router;