const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');
const { adminAuth, checkPermission } = require('../middleware/auth');
const { studentAuth } = require('../middleware/studentAuth');
const { upload, handleMulterError } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');

// ============= Student Routes =============
router.get('/student/:studentId', studentAuth, gradeController.getGradesByStudentId);
router.get('/my-grades', studentAuth, gradeController.getMyGrades);

// ============= Admin Routes =============
router.get('/admin/all', checkPermission('manage_grades'), gradeController.getAllGrades);

router.post(
  '/admin/upload-advanced',
  checkPermission('manage_grades'),
  upload.single('file'),
  handleMulterError,
  uploadLimiter,
  gradeController.uploadAdvancedGrades
);

router.put('/admin/update-single', checkPermission('manage_grades'), gradeController.updateSingleGrade);
router.delete('/admin/clear-course-grades', checkPermission('manage_grades'), gradeController.clearCourseGrades);

module.exports = router;