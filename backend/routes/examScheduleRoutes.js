const express = require('express');
const router = express.Router();
const examScheduleController = require('../controllers/examScheduleController');
const { checkPermission } = require('../middleware/auth');
const { studentAuth } = require('../middleware/studentAuth');

// Student route
router.get('/', studentAuth, examScheduleController.getAllExams);

// Admin routes
router.get('/admin', checkPermission('manage_timetable'), examScheduleController.getAllExams);
router.post('/admin', checkPermission('manage_timetable'), examScheduleController.addExam);
router.put('/admin/:id', checkPermission('manage_timetable'), examScheduleController.updateExam);
router.delete('/admin/:id', checkPermission('manage_timetable'), examScheduleController.deleteExam);

module.exports = router;
