const express = require('express');
const router = express.Router();
const { 
  studentLogin, 
  googleLogin,
  microsoftLogin,
  getCurrentStudent, 
  changePassword, 
  getPortalStats,
  linkEmail,
  verifyEmail,
  forgotPassword,
  resetPassword
} = require('../controllers/studentAuthController');
const { 
  uploadStudentsExcel, 
  getAllStudents, 
  updateStudentSection, 
  updateStudentDepartment, 
  resetStudentPassword,
  updateFcmToken 
} = require('../controllers/studentController');
const { getMyGrades } = require('../controllers/gradeController');
const { studentAuth } = require('../middleware/studentAuth');
const db = require('../config/database');

router.post('/login', studentLogin);
router.post('/google-login', googleLogin);
router.post('/microsoft-login', microsoftLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);
router.post('/link-email', studentAuth, linkEmail);
router.get('/portal-stats', getPortalStats);
router.get('/me', studentAuth, getCurrentStudent);
router.post('/change-password', studentAuth, changePassword);
router.get('/my-grades', studentAuth, getMyGrades);
router.post('/update-fcm', studentAuth, updateFcmToken);

// ✅ جلب الاختبارات المتاحة للطالب (مع الحقول الجديدة: التواريخ، المحاولات، عدد المحاولات السابقة)
router.get('/my-quizzes', studentAuth, async (req, res) => {
  try {
    const studentId = req.user.id;

    const quizzesResult = await db.query(
      `
      SELECT 
        q.*,
        c.name as course_name,
        (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) as question_count,
        (SELECT COUNT(*) FROM quiz_attempts 
         WHERE quiz_id = q.id AND student_id = $1 AND status = 'completed') as attempts_count
      FROM quizzes q
      JOIN courses c ON q.course_id = c.id
      WHERE c.id IN (
        SELECT course_id FROM student_courses WHERE student_id = $1
      )
      AND q.is_published = true
      ORDER BY q.created_at DESC
      `,
      [studentId]
    );

    const quizzes = quizzesResult.rows;

    // لكل اختبار، جلب المحاولات السابقة للطالب
    for (const quiz of quizzes) {
      const attemptsResult = await db.query(
        `
        SELECT 
          id,
          completed_at,
          score,
          total_points,
          ROUND((score::numeric / total_points) * 100) as percentage
        FROM quiz_attempts
        WHERE quiz_id = $1 AND student_id = $2 AND status = 'completed'
        ORDER BY completed_at DESC
        `,
        [quiz.id, studentId]
      );
      quiz.attempts = attemptsResult.rows;
    }

    res.json(quizzes);
  } catch (error) {
    console.error('Error fetching my-quizzes:', error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ جلب الاختبارات المكتملة للطالب (لتبويب Completed)
router.get('/completed-quizzes', studentAuth, async (req, res) => {
  try {
    const studentId = req.user.id;
    const result = await db.query(
      `
      SELECT 
        qa.id as attempt_id,
        qa.quiz_id,
        q.title as quiz_title,
        c.name as course_name,
        qa.score,
        qa.total_points,
        ROUND((qa.score::numeric / qa.total_points) * 100) as percentage,
        qa.completed_at,
        q.passing_score,
        q.time_limit_minutes
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      JOIN courses c ON q.course_id = c.id
      WHERE qa.student_id = $1 AND qa.status = 'completed'
      ORDER BY qa.completed_at DESC
      `,
      [studentId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching completed quizzes:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/my-timetable', studentAuth, async (req, res) => {
  try {
    const Student = require('../models/Student');
    const Timetable = require('../models/Timetable');
    const student = await Student.findById(req.user.id);
    if (!student || !student.section || !student.department_id) return res.json([]);
    const section = String(student.section);
    const deptId = student.department_id;
    console.log('📚 /api/student/my-timetable', { studentId: req.user.id, department_id: deptId, section });
    const timetable = await Timetable.getBySection(section, deptId);
    res.json(timetable);
  } catch (error) {
    console.error('Error fetching my-timetable:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;