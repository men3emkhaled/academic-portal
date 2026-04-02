const express = require('express');
const router = express.Router();
const gradeController = require('../controllers/gradeController');
const { adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/student/:studentId', gradeController.getGradesByStudentId);
router.get('/', adminAuth, gradeController.getAllGrades);
router.post('/upload', adminAuth, upload.single('file'), gradeController.uploadGradesExcel);

module.exports = router;