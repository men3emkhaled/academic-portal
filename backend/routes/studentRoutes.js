const express = require('express');
const router = express.Router();
const { studentLogin, getCurrentStudent, changePassword } = require('../controllers/studentAuthController');
const { getMyGrades } = require('../controllers/gradeController');
const { studentAuth } = require('../middleware/studentAuth');

// مسارات عامة (بدون Auth)
router.post('/login', studentLogin);

// المسارات المحمية (بتطلب توكن)
router.get('/me', studentAuth, getCurrentStudent);
router.post('/change-password', studentAuth, changePassword);
router.get('/my-grades', studentAuth, getMyGrades);

// ✅ إضافة route الجدول - تجيب الجدول على حسب section الطالب
router.get('/my-timetable', studentAuth, async (req, res) => {
  try {
    const Student = require('../models/Student');
    const Timetable = require('../models/Timetable');
    
    // جيب بيانات الطالب المسجل
    const student = await Student.findById(req.user.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    if (!student.section) {
      return res.json([]);
    }
    
    // جيب الجدول بتاع section بتاعه
    const timetable = await Timetable.getBySection(student.section);
    
    console.log(`📅 Timetable fetched for section ${student.section}: ${timetable.length} entries`);
    
    res.json(timetable);
  } catch (error) {
    console.error('Error fetching my-timetable:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;