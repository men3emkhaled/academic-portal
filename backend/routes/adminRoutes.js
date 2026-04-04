const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const studentController = require('../controllers/studentController');
const { upload, handleMulterError } = require('../middleware/upload');
const { adminAuth } = require('../middleware/auth');

// تسجيل دخول الأدمن
router.post('/login', adminController.login);

// ✅ جلب كل الطلاب مع الباسوردات (للأدمن)
router.get('/students-with-passwords', adminAuth, async (req, res) => {
  try {
    const Student = require('../models/Student');
    const students = await Student.getAll();
    
    // إرجاع الطلاب مع الباسوردات (من غير hashing)
    res.json(students.map(s => ({
      id: s.id,
      name: s.name,
      level: s.level,
      section: s.section,
      password: s.password_hash  // الباسورد الحالي
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

module.exports = router;