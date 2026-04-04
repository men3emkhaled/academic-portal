const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { adminAuth } = require(`${__dirname}/../middleware/auth`);

router.get('/', courseController.getAllCourses);
router.get('/semester/:semester', courseController.getCoursesBySemester);
router.get('/:id', courseController.getCourseById);

// Admin routes
router.post('/', adminAuth, courseController.createCourse);
router.put('/:id', adminAuth, courseController.updateCourse);
router.delete('/:id', adminAuth, courseController.deleteCourse);

module.exports = router;