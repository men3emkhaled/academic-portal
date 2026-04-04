const Notification = require('../models/Notification');
const Student = require('../models/Student');

const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.getAll();
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendToStudent = async (req, res) => {
  try {
    const { studentId, title, content } = req.body;
    if (!studentId || !title || !content) {
      return res.status(400).json({ message: 'Student ID, title, and content are required' });
    }
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const notification = await Notification.sendToStudent(studentId, title, content);
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendToAll = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    const notification = await Notification.sendToAll(title, content);
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    await Notification.delete(req.params.id);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllNotifications,
  sendToStudent,
  sendToAll,
  deleteNotification,
};