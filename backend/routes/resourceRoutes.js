// backend/routes/resourceRoutes.js
const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { adminAuth, checkPermission } = require('../middleware/auth');

router.get('/course/:courseId', resourceController.getResourcesByCourse);
router.post('/', checkPermission('manage_resources'), resourceController.createResource);
router.put('/:id', checkPermission('manage_resources'), resourceController.updateResource);
router.delete('/:id', checkPermission('manage_resources'), resourceController.deleteResource);

module.exports = router;