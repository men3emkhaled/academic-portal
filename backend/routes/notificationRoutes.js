const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { adminAuth, checkPermission } = require('../middleware/auth');
const { studentAuth } = require('../middleware/studentAuth');

// ============= Student Routes =============
router.get('/my-notifications', studentAuth, notificationController.getMyNotifications);
router.put('/:id/read', studentAuth, notificationController.markAsRead);
router.put('/read-all', studentAuth, notificationController.markAllAsRead);

// ============= Admin Routes =============
router.get('/admin/all', checkPermission('manage_notifications'), notificationController.getAllNotifications);
router.post('/admin/send-to-student', checkPermission('manage_notifications'), notificationController.sendToStudent);
router.post('/admin/send-to-all', checkPermission('manage_notifications'), notificationController.sendToAll);
router.post('/admin/send-to-department', checkPermission('manage_notifications'), notificationController.sendToDepartment);
router.put('/admin/:id', checkPermission('manage_notifications'), notificationController.updateNotification);
router.delete('/admin/:id', checkPermission('manage_notifications'), notificationController.deleteNotification);

module.exports = router;