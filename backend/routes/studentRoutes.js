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
  updateFcmToken,
  generateAttendanceToken,
  getCourseHubData,
  uploadAvatar,
  getMyAttendance
} = require('../controllers/studentController');
const { 
  createInquiry, 
  getStudentInquiries 
} = require('../controllers/inquiryController');
const { getMyGrades } = require('../controllers/gradeController');
const { studentAuth } = require('../middleware/studentAuth');
const { uploadAvatar: multerUploadAvatar, handleMulterError } = require('../middleware/upload');
const db = require('../config/database');

router.post('/login', studentLogin);
router.post('/google-login', googleLogin);
router.post('/microsoft-login', microsoftLogin);
router.post('/change-password', studentAuth, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);
router.post('/link-email', studentAuth, linkEmail);
router.get('/portal-stats', getPortalStats);
router.get('/me', studentAuth, getCurrentStudent);
router.get('/my-grades', studentAuth, getMyGrades);
router.post('/update-fcm', studentAuth, updateFcmToken);
router.get('/attendance/token/:courseId', studentAuth, generateAttendanceToken);
router.get('/course/:courseId/hub', studentAuth, getCourseHubData);
router.post('/upload-avatar', studentAuth, (req, res, next) => {
  multerUploadAvatar.single('avatar')(req, res, (err) => {
      if (err) {
          return handleMulterError(err, req, res, next);
      }
      next();
  });
}, uploadAvatar);

// --- Inquiries ---
router.post('/inquiries', studentAuth, createInquiry);
router.get('/my-inquiries', studentAuth, getStudentInquiries);

// ✅ جلب الاختبارات المتاحة للطالب (مع الـ attempts في query واحد — تم إصلاح N+1)
router.get('/my-quizzes', studentAuth, async (req, res) => {
  try {
    const studentId = req.user.id;
    const result = await db.query(
      `SELECT 
        q.*,
        c.name as course_name,
        (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) as question_count,
        (SELECT COUNT(*) FROM quiz_attempts 
         WHERE quiz_id = q.id AND student_id = $1 AND status = 'completed') as attempts_count,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', qa.id,
              'completed_at', qa.completed_at,
              'score', qa.score,
              'total_points', qa.total_points,
              'percentage', ROUND((qa.score::numeric / qa.total_points) * 100)
            ) ORDER BY qa.completed_at DESC
          ) FROM quiz_attempts qa
          WHERE qa.quiz_id = q.id AND qa.student_id = $1 AND qa.status = 'completed'),
          '[]'::json
        ) as attempts
      FROM quizzes q
      JOIN courses c ON q.course_id = c.id
      WHERE c.id IN (
        SELECT course_id FROM student_courses WHERE student_id = $1
      )
      AND q.is_published = true
      ORDER BY q.created_at DESC`,
      [studentId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ جلب الاختبارات المكتملة للطالب
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
    res.status(500).json({ message: error.message });
  }
});

// ── Active Semester ──
router.get('/active-semester', async (req, res) => {
  try {
    const activeSemester = await db.getActiveSemester();
    res.json({ active_semester: activeSemester });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Course Registration (Student Self-Service) ──
const {
  getAvailableCourses: getRegAvailable,
  getRegisteredCourses,
  registerCourse,
  dropCourse,
  registerBulk,
} = require('../controllers/courseRegistrationController');

router.get('/registration/available-courses', studentAuth, getRegAvailable);
router.get('/registration/my-courses', studentAuth, getRegisteredCourses);
router.post('/registration/register', studentAuth, registerCourse);
router.post('/registration/register-bulk', studentAuth, registerBulk);
router.delete('/registration/drop/:courseId', studentAuth, dropCourse);

router.get('/my-timetable', studentAuth, async (req, res) => {
  try {
    const Student = require('../models/Student');
    const Timetable = require('../models/Timetable');
    const student = await Student.findById(req.user.id);
    if (!student || !student.section || !student.department_id) return res.json([]);
    const section = String(student.section);
    const deptId = student.department_id;
    const timetable = await Timetable.getBySection(section, deptId);
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ جلب بنك الأسئلة للمادة (كل الأسئلة الاختيارية من الاختبارات المنشورة)
router.get('/my-attendance', studentAuth, getMyAttendance);

router.get('/course/:courseId/question-bank', studentAuth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    // التحقق من تسجيل الطالب في المادة
    const enrollment = await db.query(
      `SELECT 1 FROM student_courses WHERE student_id = $1 AND course_id = $2`,
      [studentId, courseId]
    );
    if (enrollment.rows.length === 0) {
      return res.status(403).json({ message: 'Access denied: not registered in this course' });
    }

    const result = await db.query(
      `SELECT 
        q.id,
        q.question_text,
        q.question_type,
        q.options,
        q.correct_answer,
        q.explanation,
        q.image_url,
        qz.title as quiz_title
       FROM questions q
       JOIN quizzes qz ON q.quiz_id = qz.id
       WHERE qz.course_id = $1 AND qz.is_published = true 
         AND q.question_type IN ('mcq', 'true_false')
       ORDER BY qz.id, q.id`,
      [courseId]
    );

    const questions = result.rows.map(row => {
      let opts = row.options;
      if (typeof opts === 'string') {
        try {
          opts = JSON.parse(opts);
        } catch (e) {
          opts = [];
        }
      }
      return {
        ...row,
        options: Array.isArray(opts) ? opts : []
      };
    });

    res.json(questions);
  } catch (error) {
    console.error('Error fetching course question bank:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;