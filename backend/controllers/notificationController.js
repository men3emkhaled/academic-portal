const Notification = require('../models/Notification');
const Student = require('../models/Student');

// جلب كل الإشعارات (للـ Admin)
const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.getAll();
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: error.message });
  }
};

// إرسال إشعار لطالب معين
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
    console.log(`📨 Notification sent to student ${studentId}: ${title}`);
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error sending to student:', error);
    res.status(500).json({ message: error.message });
  }
};

// إرسال إشعار لكل الطلاب
const sendToAll = async (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    
    const notification = await Notification.sendToAll(title, content);
    console.log(`📢 Notification sent to all students: ${title}`);
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error sending to all:', error);
    res.status(500).json({ message: error.message });
  }
};

// حذف إشعار
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.delete(id);
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: error.message });
  }
};

// جلب إشعارات الطالب الحالي (للوحة الطالب)
const getMyNotifications = async (req, res) => {
  try {
    const studentId = req.user.id;
    const notifications = await Notification.getByStudentId(studentId);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching my notifications:', error);
    res.status(500).json({ message: error.message });
  }
};

// جلب عدد الإشعارات غير المقروءة
const getUnreadCount = async (req, res) => {
  try {
    const studentId = req.user.id;
    const count = await Notification.getUnreadCount(studentId);
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: error.message });
  }
};

// تحديث إشعار إلى مقروء
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
    console.error('Error marking as read:', error);
    res.status(500).json({ message: error.message });
  }
};

// تحديث كل الإشعارات إلى مقروءة
const markAllAsRead = async (req, res) => {
  try {
    const studentId = req.user.id;
    const notifications = await Notification.markAllAsRead(studentId);
    res.json({ count: notifications.length });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllNotifications,
  sendToStudent,
  sendToAll,
  deleteNotification,
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
};