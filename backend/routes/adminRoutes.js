const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const studentController = require('../controllers/studentController');
const upload = require('../middleware/upload');
const { adminAuth } = require('../middleware/auth');

// تسجيل دخول الأدمن
router.post('/login', adminController.login);

// مسارات الطلاب (للأدمن)
router.get('/students', adminAuth, studentController.getAllStudents);
router.post('/upload-students', adminAuth, upload.single('file'), studentController.uploadStudentsExcel);
router.put('/students/:id/section', adminAuth, studentController.updateStudentSection);
router.put('/students/:id/reset-password', adminAuth, studentController.resetStudentPassword);

module.exports = router;