const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');
const { adminAuth, checkPermission } = require('../middleware/auth');
const { studentAuth } = require('../middleware/studentAuth');
const { upload, handleMulterError } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');

// ============= Student Routes =============
router.get('/section/:section', studentAuth, timetableController.getTimetableBySection);

// ============= Student Routes =============
// ✅ جدول الطالب الشخصي: يعتمد على department_id + section من بيانات الطالب المسجل
router.get('/my-timetable', studentAuth, async (req, res) => {
  try {
    const Student = require('../models/Student');
    const Timetable = require('../models/Timetable');
    const student = await Student.findById(req.user.id);
    
    // ✅ التحقق من أن الطالب لديه department_id و section
    if (!student || !student.section || !student.department_id) {
      return res.json([]);
    }
    
    // ✅ جلب الجدول باستخدام (department_id + section) معاً
    const timetable = await Timetable.getStudentTimetable(student.department_id, student.section);
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// جلب جدول القسم بالكامل (كل السكاشن) للطالب
router.get('/department/:departmentId', studentAuth, timetableController.getTimetableByDepartment);

// ============= Admin Routes =============

// ✅ جلب جميع الجداول مجمعة حسب القسم (للإدارة المتقدمة)
router.get('/admin/grouped', checkPermission('manage_timetable'), timetableController.getAllTimetablesGrouped);

// جلب جميع الجداول (يمكن تصفيتها حسب القسم عبر query param)
router.get('/admin/all', checkPermission('manage_timetable'), timetableController.getAllTimetables);

// رفع جدول لسيكشن واحد (مع دعم القسم)
router.post(
  '/admin/upload',
  checkPermission('manage_timetable'),
  upload.single('file'),
  handleMulterError,
  uploadLimiter,
  timetableController.uploadTimetableExcel
);

// رفع جدول لجميع السكاشن دفعة واحدة (مع دعم القسم)
router.post(
  '/admin/upload-all',
  checkPermission('manage_timetable'),
  upload.single('file'),
  handleMulterError,
  uploadLimiter,
  timetableController.uploadTimetableAllSections
);

// إضافة مدخل يدوي (مع دعم القسم)
router.post('/admin/add', checkPermission('manage_timetable'), timetableController.addTimetableEntry);

// تحديث مدخل (مع دعم القسم)
router.put('/admin/:id', checkPermission('manage_timetable'), timetableController.updateTimetableEntry);

// حذف مدخل
router.delete('/admin/:id', checkPermission('manage_timetable'), timetableController.deleteTimetableEntry);

// حذف جدول سيكشن كامل (مع مراعاة القسم)
router.delete('/admin/section/:section', checkPermission('manage_timetable'), timetableController.deleteTimetableBySection);
router.delete('/admin/section/:section/department/:departmentId', checkPermission('manage_timetable'), timetableController.deleteTimetableBySection);

// جلب جدول سيكشن واحد للإدارة (يمكن تمرير department_id كـ query)
// مسار عام للعرض فقط، لا يتطلب توكن
router.get('/admin/section/:section', checkPermission('manage_timetable'), timetableController.getTimetableBySection);

// ✅ نسخ جدول من قسم إلى آخر
router.post('/admin/copy', checkPermission('manage_timetable'), timetableController.copyTimetableBetweenDepartments);

// إخفاء / إظهار مدخل محدد
router.patch('/admin/:id/hide', checkPermission('manage_timetable'), timetableController.toggleHideEntry);

// إخفاء جميع محاضرات يوم معين
router.patch('/admin/day/:day/hide-all', checkPermission('manage_timetable'), timetableController.hideAllSectionsByDay);

// إظهار جميع محاضرات يوم معين
router.patch('/admin/day/:day/show-all', checkPermission('manage_timetable'), timetableController.showAllSectionsByDay);

module.exports = router;