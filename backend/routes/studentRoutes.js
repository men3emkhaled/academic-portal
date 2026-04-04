const express = require('express');
const router = express.Router();
const { studentLogin, getCurrentStudent, changePassword } = require('../controllers/studentAuthController');
const { studentAuth } = require('../middleware/studentAuth');

// مسارات عامة (بدون Auth)
router.post('/login', studentLogin);

// المسارات المحمية (بتطلب توكن)
router.get('/me', studentAuth, getCurrentStudent);
router.post('/change-password', studentAuth, changePassword);

module.exports = router;