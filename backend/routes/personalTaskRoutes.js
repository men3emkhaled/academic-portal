const express = require('express');
const router = express.Router();
const personalTaskController = require('../controllers/personalTaskController');
const { studentAuth } = require('../middleware/studentAuth');

router.use(studentAuth); // جميع المسارات تحتاج توكن طالب

router.get('/', personalTaskController.getMyTasks);
router.post('/', personalTaskController.createTask);
router.put('/:id', personalTaskController.updateTask);
router.delete('/:id', personalTaskController.deleteTask);
router.patch('/:id/toggle', personalTaskController.toggleComplete);

module.exports = router;