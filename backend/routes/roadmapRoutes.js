const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');
const { adminAuth, checkPermission } = require('../middleware/auth');
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

// ==========================================
// Admin Routes (Protected)
// ==========================================
router.post('/', checkPermission('manage_roadmap'), roadmapController.createRoadmapItem);
router.put('/:id', checkPermission('manage_roadmap'), roadmapController.updateRoadmapItem);
router.delete('/:id', checkPermission('manage_roadmap'), roadmapController.deleteRoadmapItem);
router.post('/tracks', checkPermission('manage_roadmap'), roadmapController.createTrack);
router.put('/tracks/:id', checkPermission('manage_roadmap'), roadmapController.updateTrack);
router.delete('/tracks/:id', checkPermission('manage_roadmap'), roadmapController.deleteTrack);
router.post('/tracks/:trackId/tasks', checkPermission('manage_roadmap'), roadmapController.addTask);
router.put('/tasks/:id', checkPermission('manage_roadmap'), roadmapController.updateTask);
router.delete('/tasks/:id', checkPermission('manage_roadmap'), roadmapController.deleteTask);

module.exports = router;