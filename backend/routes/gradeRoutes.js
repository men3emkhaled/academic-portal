const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');
const { adminAuth } = require('../middleware/auth');
const { studentAuth } = require('../middleware/studentAuth');
const { upload, handleMulterError } = require('../middleware/upload');

// Student Routes
router.get('/student/:studentId', gradeController.getGradesByStudentId);
router.get('/my-grades', studentAuth, gradeController.getMyGrades);

// Admin Routes
router.get('/admin/all', adminAuth, gradeController.getAllGrades);
router.post('/admin/upload-advanced', adminAuth, upload.single('file'), handleMulterError, gradeController.uploadAdvancedGrades);
router.put('/admin/update-single', adminAuth, gradeController.updateSingleGrade);

module.exports = router;