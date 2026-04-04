const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');
const { adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// مسارات عامة
router.get('/section/:section', timetableController.getTimetableBySection);

// مسارات الـ Admin
router.get('/admin/all', adminAuth, timetableController.getAllTimetables);
router.post('/admin/upload', adminAuth, upload.single('file'), timetableController.uploadTimetableExcel);
router.post('/admin/add', adminAuth, timetableController.addTimetableEntry);
router.put('/admin/:id', adminAuth, timetableController.updateTimetableEntry);
router.delete('/admin/:id', adminAuth, timetableController.deleteTimetableEntry);
router.delete('/admin/section/:section', adminAuth, timetableController.deleteTimetableBySection);

module.exports = router;