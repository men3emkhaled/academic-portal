const express = require('express');
const router = express.Router();
const officialTaskController = require('../controllers/officialTaskController');
const { adminAuth } = require('../middleware/auth');
const { studentAuth } = require('../middleware/studentAuth');

// Student routes
router.get('/my-tasks', studentAuth, officialTaskController.getStudentTasks);
router.patch('/:id/toggle', studentAuth, officialTaskController.toggleTaskCompletion);

// Admin routes
router.get('/admin', adminAuth, officialTaskController.getAdminTasks);
router.post('/admin', adminAuth, officialTaskController.createOfficialTask);
router.put('/admin/:id', adminAuth, officialTaskController.updateOfficialTask);
router.delete('/admin/:id', adminAuth, officialTaskController.deleteOfficialTask);

module.exports = router;
