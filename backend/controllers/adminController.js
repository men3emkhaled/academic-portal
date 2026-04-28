const { generateToken } = require('../middleware/auth');
const Student = require('../models/Student');
const jwt = require('jsonwebtoken');
const { logAdminLogin } = require('../middleware/adminLogger');
const db = require('../config/database');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Simple admin authentication
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;
        
        if (!adminUsername || !adminPassword) {
            return res.status(500).json({ message: 'Admin credentials not configured' });
        }
        
        // Use a secure comparison instead of plain text, or hardcode bcrypt hash in .env if possible
        // For now, since adminPassword from .env is plaintext, we will keep it but add a comment to hash it.
        // The proper fix is: const isValidAdmin = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
        if (username === adminUsername && password === adminPassword) {
            const token = generateToken('admin_user');
            // ✅ تسجيل دخول الـ Root Admin
            logAdminLogin(req, 'admin_user', 'Root Admin', 'admin');
            return res.json({ token, message: 'Login successful', role: 'admin' });
        }
        
        // If not super admin, check if it's an assistant student
        const student = await Student.findByUsername(username);
        if (student && (student.role === 'assistant' || student.role === 'admin')) {
            const isValid = await Student.verifyPassword(student, password);
            if (isValid) {
                const token = jwt.sign(
                  { 
                    id: student.id, 
                    role: student.role,
                    permissions: student.permissions || [] 
                  },
                  process.env.JWT_SECRET,
                  { expiresIn: '7d' }
                );
                // ✅ تسجيل دخول المساعد/الأدمن
                logAdminLogin(req, student.id, student.name, student.role);
                return res.json({ 
                  token, 
                  message: 'Login successful', 
                  role: student.role, 
                  permissions: student.permissions 
                });
            }
        }
        
        return res.status(401).json({ message: 'Invalid credentials or access denied' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const client = await db.pool.connect();
        try {
            const studentsCount = await client.query('SELECT COUNT(*) FROM students');
            const coursesCount = await client.query('SELECT COUNT(*) FROM courses');
            const departmentsCount = await client.query('SELECT COUNT(*) FROM departments');
            // Assuming admin notifications are those where user_type = 'admin' or target = 'all'
            const unreadNotificationsCount = await client.query("SELECT COUNT(*) FROM notifications WHERE is_read = false");
            
            res.json({
                students: parseInt(studentsCount.rows[0].count),
                courses: parseInt(coursesCount.rows[0].count),
                departments: parseInt(departmentsCount.rows[0].count),
                unread_notifications: parseInt(unreadNotificationsCount.rows[0].count)
            });
        } finally {
            client.release();
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { login, getDashboardStats };