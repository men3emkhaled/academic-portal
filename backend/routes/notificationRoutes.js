const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { adminAuth } = require('../middleware/auth');

// Admin only routes
router.get('/admin/all', adminAuth, notificationController.getAllNotifications);
router.post('/admin/send-to-student', adminAuth, notificationController.sendToStudent);
router.post('/admin/send-to-all', adminAuth, notificationController.sendToAll);
router.delete('/admin/:id', adminAuth, notificationController.deleteNotification);

module.exports = router;