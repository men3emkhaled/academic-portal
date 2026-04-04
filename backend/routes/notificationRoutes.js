const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { adminAuth } = require('../middleware/auth');
const { studentAuth } = require('../middleware/studentAuth');

// ============= Student Routes =============
router.get('/my-notifications', studentAuth, notificationController.getMyNotifications);
router.put('/:id/read', studentAuth, notificationController.markAsRead);
router.put('/read-all', studentAuth, notificationController.markAllAsRead);

// ============= Admin Routes =============
router.get('/admin/all', adminAuth, notificationController.getAllNotifications);
router.post('/admin/send-to-student', adminAuth, notificationController.sendToStudent);
router.post('/admin/send-to-all', adminAuth, notificationController.sendToAll);
router.put('/admin/:id', adminAuth, notificationController.updateNotification);
router.delete('/admin/:id', adminAuth, notificationController.deleteNotification);

module.exports = router;