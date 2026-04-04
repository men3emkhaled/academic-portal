const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');
const { adminAuth } = require('../middleware/auth');
const { studentAuth } = require('../middleware/studentAuth');

// ============= Public Routes (static first) =============
router.get('/', roadmapController.getAllRoadmapItems);
router.get('/tracks', roadmapController.getAllTracks);                     // ✅ قبل /:id
router.get('/tracks/:id', roadmapController.getTrackById);                // ✅
router.get('/tracks/:id/tasks', roadmapController.getTrackTasks);         // ✅

// ============= Student Progress Routes =============
router.get('/progress/:trackId', studentAuth, roadmapController.getStudentProgress);
router.post('/toggle-task', studentAuth, roadmapController.toggleTask);

// ============= Dynamic Route (must be last) =============
router.get('/:id', roadmapController.getRoadmapItemById);                 // ⚠️ بعد كل الثابتة

// ============= Admin Routes =============
router.post('/', adminAuth, roadmapController.createRoadmapItem);
router.put('/:id', adminAuth, roadmapController.updateRoadmapItem);
router.delete('/:id', adminAuth, roadmapController.deleteRoadmapItem);
router.post('/tracks', adminAuth, roadmapController.createTrack);
router.put('/tracks/:id', adminAuth, roadmapController.updateTrack);
router.delete('/tracks/:id', adminAuth, roadmapController.deleteTrack);
router.post('/tracks/:trackId/tasks', adminAuth, roadmapController.addTask);
router.put('/tasks/:id', adminAuth, roadmapController.updateTask);
router.delete('/tasks/:id', adminAuth, roadmapController.deleteTask);

module.exports = router;