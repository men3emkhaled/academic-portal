const Notification = require('../models/Notification');
const Student = require('../models/Student');
const db = require('../config/database');
const { sendPushNotification } = require('../utils/fcmHelper');
const xss = require('xss');

// Helper to strip markdown for push notifications
const stripMarkdown = (text) => {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '[Image]') // Remove images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')     // Keep link text only
    .replace(/[*_#`~]/g, '');                    // Remove common markdown symbols
};

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

// ============= Doctor Functions =============
const getDoctorNotifications = async (req, res) => {
  try {
    const doctorId = req.doctor.id;
    const notifications = await Notification.getByDoctorId(doctorId);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markDoctorAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.doctor.id;
    await Notification.markAsRead(id, null, doctorId);
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAllDoctorAsRead = async (req, res) => {
  try {
    const doctorId = req.doctor.id;
    await Notification.markAllAsRead(null, doctorId);
    res.json({ message: 'All notifications marked as read' });
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
    const { studentId, title, content, sendPush, isMobileOnly } = req.body;
    if (!studentId || !title || !content) {
      return res.status(400).json({ message: 'Student ID, title, and content are required' });
    }
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    
    const safeTitle = xss(title);
    const safeContent = xss(content);
    
    const notification = await Notification.sendToStudent(studentId, safeTitle, safeContent, isMobileOnly);

    // Send Push if requested or if it's mobile only
    if ((sendPush || isMobileOnly) && student.fcm_token) {
      await sendPushNotification(student.fcm_token, {
        title: title,
        body: stripMarkdown(content)
      }, { type: 'notification', id: String(notification.id) });
    }

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendToAll = async (req, res) => {
  try {
    const { title, content, sendPush, isMobileOnly } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    const safeTitle = xss(title);
    const safeContent = xss(content);
    const notification = await Notification.sendToAll(safeTitle, safeContent, isMobileOnly);

    // Send Push if requested
    if (sendPush || isMobileOnly) {
      const studentsResult = await db.query('SELECT fcm_token FROM students WHERE fcm_token IS NOT NULL');
      const tokens = studentsResult.rows.map(r => r.fcm_token);
      if (tokens.length > 0) {
        await sendPushNotification(tokens, {
          title: title,
          body: stripMarkdown(content)
        }, { type: 'broadcast', id: String(notification.id) });
      }
    }

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendToDepartment = async (req, res) => {
  try {
    const { department_id, title, content, sendPush, isMobileOnly } = req.body;
    if (!department_id || !title || !content) {
      return res.status(400).json({ message: 'Department, title, and content are required' });
    }
    const safeTitle = xss(title);
    const safeContent = xss(content);
    const notification = await Notification.sendToDepartment(department_id, safeTitle, safeContent, isMobileOnly);

    // Send Push if requested
    if (sendPush || isMobileOnly) {
      const studentsResult = await db.query('SELECT fcm_token FROM students WHERE department_id = $1 AND fcm_token IS NOT NULL', [department_id]);
      const tokens = studentsResult.rows.map(r => r.fcm_token);
      if (tokens.length > 0) {
        await sendPushNotification(tokens, {
          title: title,
          body: stripMarkdown(content)
        }, { type: 'department', id: String(department_id) });
      }
    }

    res.status(201).json({ message: `Sent to ${notification.affected_count} nodes`, count: notification.affected_count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, is_read } = req.body;
    const safeTitle = title ? xss(title) : undefined;
    const safeContent = content ? xss(content) : undefined;
    const result = await db.query(
      `UPDATE notifications 
       SET title = COALESCE($1, title), 
           content = COALESCE($2, content), 
           is_read = COALESCE($3, is_read),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [safeTitle, safeContent, is_read, id]
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

const sendToDoctor = async (req, res) => {
  try {
    const { doctorId, title, content } = req.body;
    if (!doctorId || !title || !content) {
      return res.status(400).json({ message: 'Doctor ID, title, and content are required' });
    }
    
    const safeTitle = xss(title);
    const safeContent = xss(content);
    
    const notification = await Notification.sendToDoctor(doctorId, safeTitle, safeContent);
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendToAllDoctors = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    
    const safeTitle = xss(title);
    const safeContent = xss(content);
    
    // Get all doctors
    const doctorsResult = await db.query('SELECT id FROM doctors');
    const notifications = [];
    
    for (const doctor of doctorsResult.rows) {
        const notif = await Notification.sendToDoctor(doctor.id, safeTitle, safeContent);
        notifications.push(notif);
    }
    
    res.status(201).json({ message: `Sent to ${notifications.length} doctors`, count: notifications.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getDoctorNotifications,
  markDoctorAsRead,
  markAllDoctorAsRead,
  getAllNotifications,
  sendToStudent,
  sendToAll,
  sendToDepartment,
  sendToDoctor,
  sendToAllDoctors,
  updateNotification,
  deleteNotification,
};