const PersonalTask = require('../models/PersonalTask');

const getMyTasks = async (req, res) => {
  try {
    const studentId = req.user.id;
    const tasks = await PersonalTask.getAllForStudent(studentId);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { title, description, order_index } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    const task = await PersonalTask.create(studentId, title, description, order_index || 0);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;
    const { title, description, is_completed, order_index } = req.body;
    const task = await PersonalTask.update(id, studentId, title, description, is_completed, order_index);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;
    await PersonalTask.delete(id, studentId);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleComplete = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;
    const { is_completed } = req.body;
    const task = await PersonalTask.toggleComplete(id, studentId, is_completed);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyTasks, createTask, updateTask, deleteTask, toggleComplete };