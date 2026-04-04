const express = require('express');
const router = express.Router();
const { studentLogin, getCurrentStudent, changePassword } = require('../controllers/studentAuthController');
const { getMyGrades } = require('../controllers/gradeController');
const { getTimetableBySection } = require('../controllers/timetableController');
const { studentAuth } = require('../middleware/studentAuth');

// مسارات عامة (بدون Auth)
router.post('/login', studentLogin);

// المسارات المحمية (بتطلب توكن)
router.get('/me', studentAuth, getCurrentStudent);
router.post('/change-password', studentAuth, changePassword);
router.get('/my-grades', studentAuth, getMyGrades);
router.get('/my-timetable', studentAuth, async (req, res) => {
  try {
    const studentId = req.user.id;
    const Student = require('../models/Student');
    const student = await Student.findById(studentId);
    const timetable = await require('../models/Timetable').getBySection(student.section);
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;