const OfficialTask = require('../models/OfficialTask');

const getAdminTasks = async (req, res) => {
  try {
    const tasks = await OfficialTask.getAll();
    res.json(tasks);
  } catch (error) {
    console.error('❌ Error in getAdminTasks:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const createOfficialTask = async (req, res) => {
  try {
    const { course_id, title, description, drive_link, deadline, department_id } = req.body;
    if (!course_id || !title || !drive_link) {
      return res.status(400).json({ message: 'Course, Title and Drive Link are required' });
    }
    const task = await OfficialTask.create(course_id, title, description, drive_link, deadline, department_id);
    res.status(201).json(task);
  } catch (error) {
    console.error('❌ Error in createOfficialTask:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const updateOfficialTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { course_id, title, description, drive_link, deadline, department_id } = req.body;
    const task = await OfficialTask.update(id, course_id, title, description, drive_link, deadline, department_id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    console.error('❌ Error in updateOfficialTask:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const deleteOfficialTask = async (req, res) => {
  try {
    const { id } = req.params;
    await OfficialTask.delete(id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('❌ Error in deleteOfficialTask:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const getStudentTasks = async (req, res) => {
  try {
    const studentId = req.user.id;
    const tasks = await OfficialTask.getForStudent(studentId);
    res.json(tasks);
  } catch (error) {
    console.error('❌ Error in getStudentTasks:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const toggleTaskCompletion = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { id } = req.params;
    const { is_completed } = req.body;
    const status = await OfficialTask.toggleComplete(id, studentId, is_completed);
    res.json(status);
  } catch (error) {
    console.error('❌ Error in toggleTaskCompletion:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAdminTasks,
  createOfficialTask,
  updateOfficialTask,
  deleteOfficialTask,
  getStudentTasks,
  toggleTaskCompletion
};
