const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { adminAuth } = require('../middleware/auth');

// Public routes (anyone can view departments)
router.get('/', departmentController.getAllDepartments);

// Admin only routes
router.post('/', adminAuth, departmentController.createDepartment);
router.put('/:id', adminAuth, departmentController.updateDepartment);
router.delete('/:id', adminAuth, departmentController.deleteDepartment);

module.exports = router;