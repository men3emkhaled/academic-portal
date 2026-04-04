const express = require('express');
const router = express.Router();
const { studentLogin, getCurrentStudent, changePassword } = require('../controllers/studentAuthController');
const { studentAuth } = require('../middleware/studentAuth');

// ✅ كل المسارات هنا هتضاف بعد /api/student
// يعني: /api/student/login
router.post('/login', studentLogin);

// ✅ /api/student/me
router.get('/me', studentAuth, getCurrentStudent);

// ✅ /api/student/change-password
router.post('/change-password', studentAuth, changePassword);

module.exports = router;