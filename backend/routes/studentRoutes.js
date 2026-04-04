const express = require('express');
const router = express.Router();
const { studentLogin, getCurrentStudent, changePassword } = require('../controllers/studentAuthController');
const { getMyGrades } = require('../controllers/gradeController');
const { studentAuth } = require('../middleware/studentAuth');

router.post('/login', studentLogin);
router.get('/me', studentAuth, getCurrentStudent);
router.post('/change-password', studentAuth, changePassword);
router.get('/my-grades', studentAuth, getMyGrades);

router.get('/my-timetable', studentAuth, async (req, res) => {
  try {
    const Student = require('../models/Student');
    const Timetable = require('../models/Timetable');
    const student = await Student.findById(req.user.id);
    if (!student || !student.section) return res.json([]);
    const timetable = await Timetable.getBySection(student.section);
    res.json(timetable);
  } catch (error) {
    console.error('Error fetching my-timetable:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;