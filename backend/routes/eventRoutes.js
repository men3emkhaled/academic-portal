const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { adminAuth, checkPermission } = require('../middleware/auth');
const { studentAuth } = require('../middleware/studentAuth');

// Student Route (Public to authenticated students)
router.get('/upcoming', studentAuth, eventController.getUpcomingEvents);

// ============= Admin Routes =============
router.get('/all', checkPermission('manage_events'), eventController.getAllEvents);
router.post('/', checkPermission('manage_events'), eventController.createEvent);
router.put('/:id', checkPermission('manage_events'), eventController.updateEvent);
router.delete('/:id', checkPermission('manage_events'), eventController.deleteEvent);

module.exports = router;
