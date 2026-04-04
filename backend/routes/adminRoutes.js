const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const studentController = require('../controllers/studentController');
const { upload, handleMulterError } = require('../middleware/upload');
const { adminAuth } = require('../middleware/auth');
const db = require('../config/database'); // لاستخدام queries مباشرة للحذف

// تسجيل دخول الأدمن
router.post('/login', adminController.login);

// ✅ جلب كل الطلاب مع الباسوردات (للأدمن)
router.get('/students-with-passwords', adminAuth, async (req, res) => {
  try {
    const Student = require('../models/Student');
    const students = await Student.getAll();
    res.json(students.map(s => ({
      id: s.id,
      name: s.name,
      level: s.level,
      section: s.section,
      password: s.password_hash
    })));
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: error.message });
  }
});

// جلب كل الطلاب (بدون باسوردات)
router.get('/students', adminAuth, studentController.getAllStudents);

// رفع طلاب Excel
router.post('/upload-students', adminAuth, upload.single('file'), handleMulterError, studentController.uploadStudentsExcel);

// تعديل سيكشن طالب
router.put('/students/:id/section', adminAuth, studentController.updateStudentSection);

// إعادة تعيين باسورد طالب
router.put('/students/:id/reset-password', adminAuth, studentController.resetStudentPassword);

// ✅ حذف طالب (مع حذف كل السجلات المرتبطة)
router.delete('/students/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const Student = require('../models/Student');

    // حذف السجلات المرتبطة (grades, notifications, student_task_progress)
    await db.query('DELETE FROM grades WHERE student_id = $1', [id]);
    await db.query('DELETE FROM notifications WHERE student_id = $1', [id]);
    await db.query('DELETE FROM student_task_progress WHERE student_id = $1', [id]);
    // إذا كان عندك جداول أخرى مثل student_roadmap_progress ، احذفها أيضاً
    await db.query('DELETE FROM student_roadmap_progress WHERE student_id = $1', [id]);

    // حذف الطالب نفسه
    await Student.delete(id);

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;