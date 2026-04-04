const RoadmapItem = require('../models/RoadmapItem');
const CareerTrack = require('../models/CareerTrack');
const StudentProgress = require('../models/StudentProgress');

// ============= Original Roadmap Item Functions =============
const getAllRoadmapItems = async (req, res) => {
  try {
    const items = await RoadmapItem.findAll();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRoadmapItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await RoadmapItem.findById(id);
    if (!item) return res.status(404).json({ message: 'Roadmap item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createRoadmapItem = async (req, res) => {
  try {
    const { title, description, video_url, order_index } = req.body;
    const newItem = await RoadmapItem.create(title, description, video_url, order_index || 0);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateRoadmapItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, video_url, order_index } = req.body;
    const updated = await RoadmapItem.update(id, title, description, video_url, order_index);
    if (!updated) return res.status(404).json({ message: 'Item not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteRoadmapItem = async (req, res) => {
  try {
    const { id } = req.params;
    await RoadmapItem.delete(id);
    res.json({ message: 'Roadmap item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============= Career Tracks Functions =============
const getAllTracks = async (req, res) => {
  try {
    const tracks = await CareerTrack.getAll();
    res.json(tracks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTrackById = async (req, res) => {
  try {
    const { id } = req.params;
    const track = await CareerTrack.getById(id);
    if (!track) return res.status(404).json({ message: 'Track not found' });
    res.json(track);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTrackTasks = async (req, res) => {
  try {
    const { id } = req.params;
    const track = await CareerTrack.getById(id);
    if (!track) return res.status(404).json({ message: 'Track not found' });
    res.json(track.tasks || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTrack = async (req, res) => {
  try {
    const { name, description, is_primary } = req.body;
    const track = await CareerTrack.create(name, description, is_primary || false);
    res.status(201).json(track);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTrack = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_primary } = req.body;
    const track = await CareerTrack.update(id, name, description, is_primary);
    if (!track) return res.status(404).json({ message: 'Track not found' });
    res.json(track);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTrack = async (req, res) => {
  try {
    const { id } = req.params;
    await CareerTrack.delete(id);
    res.json({ message: 'Track deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============= Task Functions =============
const addTask = async (req, res) => {
  try {
    const { trackId } = req.params;
    const { title, description, order_index } = req.body;
    const task = await CareerTrack.addTask(trackId, title, description, order_index || 0);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, order_index } = req.body;
    const task = await CareerTrack.updateTask(id, title, description, order_index);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    await CareerTrack.deleteTask(id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============= Student Progress Functions =============
const getStudentProgress = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { trackId } = req.params;
    const progress = await StudentProgress.getCompletionPercentage(studentId, trackId);
    const tasks = await StudentProgress.getStudentTrackProgress(studentId, trackId);
    res.json({ ...progress, tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleTask = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { taskId, isCompleted } = req.body;
    const result = await StudentProgress.toggleTask(studentId, taskId, isCompleted);
    res.json({ success: true, progress: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllRoadmapItems,
  getRoadmapItemById,
  createRoadmapItem,
  updateRoadmapItem,
  deleteRoadmapItem,
  getAllTracks,
  getTrackById,
  getTrackTasks,
  createTrack,
  updateTrack,
  deleteTrack,
  addTask,
  updateTask,
  deleteTask,
  getStudentProgress,
  toggleTask
};