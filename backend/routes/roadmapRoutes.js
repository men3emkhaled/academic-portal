const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');
const { adminAuth } = require('../middleware/auth');

router.get('/', roadmapController.getAllRoadmapItems);
router.get('/:id', roadmapController.getRoadmapItemById);
router.post('/', adminAuth, roadmapController.createRoadmapItem);
router.put('/:id', adminAuth, roadmapController.updateRoadmapItem);
router.delete('/:id', adminAuth, roadmapController.deleteRoadmapItem);

module.exports = router;