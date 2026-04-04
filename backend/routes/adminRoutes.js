const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const studentController = require('../controllers/studentController');
const { upload, handleMulterError } = require('../middleware/upload');  // ✅ import صحيح
const { adminAuth } = require('../middleware/auth');

router.post('/login', adminController.login);

router.get('/students', adminAuth, studentController.getAllStudents);

// ✅ استخدام upload.single بشكل صحيح
router.post('/upload-students', 
    adminAuth, 
    upload.single('file'), 
    handleMulterError, 
    studentController.uploadStudentsExcel
);

router.put('/students/:id/section', adminAuth, studentController.updateStudentSection);
router.put('/students/:id/reset-password', adminAuth, studentController.resetStudentPassword);

module.exports = router;