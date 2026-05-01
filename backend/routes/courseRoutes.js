const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { adminAuth, checkPermission } = require(`${__dirname}/../middleware/auth`);

router.get('/', courseController.getAllCourses);
router.get('/semester/:semester', courseController.getCoursesBySemester);
router.get('/department/:departmentId', courseController.getCoursesByDepartment);
router.get('/:id', courseController.getCourseById);

// Admin routes
router.post('/', checkPermission('manage_courses'), courseController.createCourse);
router.put('/:id', checkPermission('manage_courses'), courseController.updateCourse);
router.delete('/:id', checkPermission('manage_courses'), courseController.deleteCourse);

module.exports = router;