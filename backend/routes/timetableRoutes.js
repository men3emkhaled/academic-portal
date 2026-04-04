const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');
const { adminAuth } = require('../middleware/auth');
const { studentAuth } = require('../middleware/studentAuth');
const { upload, handleMulterError } = require('../middleware/upload');

// ============= Public Routes =============
router.get('/section/:section', timetableController.getTimetableBySection);

// ✅ إضافة route للطالب (my-timetable)
router.get('/my-timetable', studentAuth, async (req, res) => {
  try {
    const Student = require('../models/Student');
    const Timetable = require('../models/Timetable');
    
    const student = await Student.findById(req.user.id);
    if (!student || !student.section) {
      return res.json([]);
    }
    
    const timetable = await Timetable.getBySection(student.section);
    res.json(timetable);
  } catch (error) {
    console.error('Error fetching my-timetable:', error);
    res.status(500).json({ message: error.message });
  }
});

// ============= Admin Routes =============
router.get('/admin/all', adminAuth, timetableController.getAllTimetables);
router.post('/admin/upload', adminAuth, upload.single('file'), handleMulterError, timetableController.uploadTimetableExcel);
router.post('/admin/add', adminAuth, timetableController.addTimetableEntry);
router.put('/admin/:id', adminAuth, timetableController.updateTimetableEntry);
router.delete('/admin/:id', adminAuth, timetableController.deleteTimetableEntry);
router.delete('/admin/section/:section', adminAuth, timetableController.deleteTimetableBySection);

module.exports = router;