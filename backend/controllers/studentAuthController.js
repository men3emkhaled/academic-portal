const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

const studentLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('📥 POST /api/student/login - Request received');
    console.log('📥 Body:', { username, password });
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    const student = await Student.findByUsername(username);
    
    if (!student) {
      console.log('❌ Student not found:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isValid = await Student.verifyPassword(student, password);
    
    if (!isValid) {
      console.log('❌ Invalid password for:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: student.id, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('✅ Login successful:', username);
    
    res.json({
      token,
      student: {
        id: student.id,
        name: student.name,
        level: student.level,
        section: student.section
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getCurrentStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json({
      id: student.id,
      name: student.name,
      level: student.level,
      section: student.section
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const studentId = req.user.id;
    
    const student = await Student.findByUsername(studentId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const isValid = await Student.verifyPassword(student, currentPassword);
    
    if (!isValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    if (newPassword.length < 4) {
      return res.status(400).json({ message: 'Password must be at least 4 characters' });
    }
    
    await Student.updatePassword(studentId, newPassword);
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  studentLogin,
  getCurrentStudent,
  changePassword
};