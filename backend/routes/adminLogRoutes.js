const express = require('express');
const router = express.Router();
const adminLogController = require('../controllers/adminLogController');
const { adminAuth } = require('../middleware/auth');

// ===== كل الـ routes محمية بـ adminAuth (root admin فقط) =====

// جلب الـ logs مع فلاتر
router.get('/', adminAuth, adminLogController.getLogs);

// جلب الإحصائيات
router.get('/stats', adminAuth, adminLogController.getStats);

// تنظيف الـ logs القديمة
router.delete('/cleanup', adminAuth, adminLogController.cleanupLogs);

module.exports = router;
