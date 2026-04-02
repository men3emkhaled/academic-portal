// backend/routes/resourceRoutes.js
const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { adminAuth } = require('../middleware/auth');

router.get('/course/:courseId', resourceController.getResourcesByCourse);
router.post('/', adminAuth, resourceController.createResource);
router.put('/:id', adminAuth, resourceController.updateResource);
router.delete('/:id', adminAuth, resourceController.deleteResource);

module.exports = router;