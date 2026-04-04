const Notification = require('../models/Notification');
const Student = require('../models/Student');

// Get notifications for logged-in student
const getMyNotifications = async (req, res) => {
  try {
    const studentId = req.user.id;
    const notifications = await Notification.getByStudentId(studentId);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unread count for student
const getUnreadCount = async (req, res) => {
  try {
    const studentId = req.user.id;
    const count = await Notification.getUnreadCount(studentId);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark single notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;
    const notification = await Notification.markAsRead(id, studentId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark all notifications as read for student
const markAllAsRead = async (req, res) => {
  try {
    const studentId = req.user.id;
    const notifications = await Notification.markAllAsRead(studentId);
    res.json({ count: notifications.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============= Admin Functions =============

// Get all notifications
const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.getAll();
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send notification to specific student
const sendToStudent = async (req, res) => {
  try {
    const { studentId, title, content } = req.body;
    
    if (!studentId || !title || !content) {
      return res.status(400).json({ message: 'Student ID, title, and content are required' });
    }
    
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const notification = await Notification.sendToStudent(studentId, title, content);
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send notification to all students
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

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.delete(id);
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  getAllNotifications,
  sendToStudent,
  sendToAll,
  deleteNotification
};