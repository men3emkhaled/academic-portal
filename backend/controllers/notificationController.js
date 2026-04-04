const Notification = require('../models/Notification');
const Student = require('../models/Student');
const db = require('../config/database');

// ============= Student Functions =============
const getMyNotifications = async (req, res) => {
  try {
    const studentId = req.user.id;
    const notifications = await Notification.getByStudentId(studentId);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;
    const notification = await Notification.markAsRead(id, studentId);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, is_read } = req.body;
    const result = await db.query(
      `UPDATE notifications 
       SET title = COALESCE($1, title), 
           content = COALESCE($2, content), 
           is_read = COALESCE($3, is_read),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [title, content, is_read, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.delete(id);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getAllNotifications,
  sendToStudent,
  sendToAll,
  updateNotification,
  deleteNotification,
};