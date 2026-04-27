const express = require('express');
const router = express.Router();
const progressController = require('../controllers/courseProgressController');
const { checkPermission } = require('../middleware/auth');

// ===== Public/Student routes =====
// جلب الأجزاء المنجزة لمادة (يستخدمه الطالب والموبايل)
router.get('/course/:courseId', progressController.getProgressByCourse);

// ===== Admin routes =====
// جلب كل الأجزاء مجمعة
router.get('/admin/all', checkPermission('manage_progress'), progressController.getAllProgress);

// جلب أجزاء مادة محددة (للأدمن)
router.get('/admin/course/:courseId', checkPermission('manage_progress'), progressController.getProgressByCourseAdmin);

// إضافة جزء جديد
router.post('/admin', checkPermission('manage_progress'), progressController.addProgressItem);

// تعديل جزء
router.put('/admin/:id', checkPermission('manage_progress'), progressController.updateProgressItem);

// تبديل حالة الإنجاز
router.patch('/admin/:id/toggle', checkPermission('manage_progress'), progressController.toggleProgressItem);

// حذف جزء
router.delete('/admin/:id', checkPermission('manage_progress'), progressController.deleteProgressItem);

module.exports = router;
