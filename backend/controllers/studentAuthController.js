const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const StudentLog = require('../models/StudentLog');
const db = require('../config/database');
const { sendPasswordResetEmail, sendEmailVerification } = require('../utils/mailer');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const studentLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('📥 POST /api/student/login - Request received');
    console.log('📥 Body:', { username, password: '***' });
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    const student = await Student.findByUsername(username);
    
    if (!student) {
      console.log('❌ Student not found:', username);
      return res.status(401).json({ message: 'Invalid Student ID' });
    }
    
    const isValid = await Student.verifyPassword(student, password);
    
    if (!isValid) {
      console.log('❌ Invalid password for:', username);
      return res.status(401).json({ message: 'Invalid Password' });
    }
    
    const token = jwt.sign(
      { 
        id: student.id, 
        role: student.role || 'student',
        permissions: student.permissions || [] 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('✅ Login successful:', username);
    
    StudentLog.logLogin(student.id, student.name, 'Standard', req.ip || req.connection?.remoteAddress);

    res.json({
      token,
      student: {
        id: student.id,
        name: student.name,
        email: student.email || null,
        level: student.level,
        section: student.section,
        role: student.role || 'student',
        permissions: student.permissions || []
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getCurrentStudent = async (req, res) => {
  try {
    console.log('📥 GET /api/student/me - User ID:', req.user?.id);
    
    const student = await Student.findById(req.user.id);
    if (!student) {
      console.log('❌ Student not found:', req.user.id);
      return res.status(404).json({ message: 'Student not found' });
    }
    
    console.log('✅ Student found:', student.id, student.name);
    
    // Log daily active session (auto-login)
    StudentLog.logDailyVisit(student.id, student.name, req.ip || req.connection?.remoteAddress);

    res.json({
      id: student.id,
      name: student.name,
      email: student.email || null,
      level: student.level,
      section: student.section,
      department_id: student.department_id,
      role: student.role || 'student',
      permissions: student.permissions || []
    });
  } catch (error) {
    console.error('❌ Error in getCurrentStudent:', error);
    res.status(500).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, current_password, new_password } = req.body;
    const studentId = req.user.id;
    
    // Support both snake_case (mobile) and camelCase (web/legacy)
    const currentPass = currentPassword || current_password;
    const newPass = newPassword || new_password;

    if (!currentPass || !newPass) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }

    const student = await Student.findByUsername(studentId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const isValid = await Student.verifyPassword(student, currentPass);
    
    if (!isValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    if (newPass.length < 4) {
      return res.status(400).json({ message: 'Password must be at least 4 characters' });
    }
    
    await Student.updatePassword(studentId, newPass);
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPortalStats = async (req, res) => {
  try {
    const db = require('../config/database');
    const studentCount = await db.query('SELECT COUNT(*) FROM students');
    const departmentCount = await db.query('SELECT COUNT(*) FROM departments');
    
    res.json({
      studentsCount: parseInt(studentCount.rows[0].count),
      departmentsCount: parseInt(departmentCount.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching portal stats:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

const linkEmail = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    
    const existing = await db.query('SELECT id FROM students WHERE email = $1 AND id != $2', [email, studentId]);
    if (existing.rows.length > 0) return res.status(400).json({ message: 'Email already used by another account' });
    
    // Generate a verification token (contains studentId + email)
    const token = jwt.sign({ id: studentId, email: email }, process.env.JWT_SECRET, { expiresIn: '15m' });
    
    const sent = await sendEmailVerification(email, token);
    if (sent) {
      res.json({ message: 'Verification email sent! Check your inbox.' });
    } else {
      res.status(500).json({ message: 'Failed to send verification email' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token, studentId } = req.body;
    if (!token || !studentId) return res.status(400).json({ message: 'Token and Student ID are required' });
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Verification link is invalid or has expired' });
    }
    
    // Check if the entered student ID matches the one who requested
    if (decoded.id !== studentId) {
      return res.status(400).json({ message: 'Student ID does not match. Verification failed.' });
    }
    
    // Check email isn't taken by someone else in the meantime
    const existing = await db.query('SELECT id FROM students WHERE email = $1 AND id != $2', [decoded.email, studentId]);
    if (existing.rows.length > 0) return res.status(400).json({ message: 'Email already used by another account' });
    
    // All good — save the email
    await Student.updateEmail(studentId, decoded.email);
    res.json({ message: 'Email verified and linked successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ message: 'Student ID is required' });
    
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    if (!student.email) return res.status(400).json({ message: 'No email linked to this account. Contact admin.' });
    
    const secret = process.env.JWT_SECRET + student.password_hash;
    const token = jwt.sign({ id: student.id }, secret, { expiresIn: '15m' });
    
    const sent = await sendPasswordResetEmail(student.email, `${student.id}-${token}`);
    if (sent) {
      res.json({ message: 'Password reset link sent to your email' });
    } else {
      res.status(500).json({ message: 'Failed to send email' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: 'Token and new password are required' });
    
    const parts = token.split('-');
    if (parts.length < 2) return res.status(400).json({ message: 'Invalid token format' });
    
    const studentId = parts[0];
    const jwtToken = token.substring(studentId.length + 1);
    
    const student = await Student.findById(studentId);
    if (!student) return res.status(400).json({ message: 'Invalid token or student' });
    
    const secret = process.env.JWT_SECRET + student.password_hash;
    try {
      jwt.verify(jwtToken, secret);
    } catch (err) {
      return res.status(400).json({ message: 'Token is invalid or has expired' });
    }
    
    await Student.updatePassword(student.id, newPassword);
    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { credential, accessToken } = req.body;
    let email;

    if (credential) {
      // Legacy idToken verification
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload.email;
    } else if (accessToken) {
      // New access_token verification (from custom button)
      const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
      if (!response.ok) {
        return res.status(401).json({ message: 'Google authentication failed' });
      }
      const userData = await response.json();
      email = userData.email;
    } else {
      return res.status(400).json({ message: 'Google credential or access token is required' });
    }

    if (!email) {
      return res.status(400).json({ message: 'No email found in Google account' });
    }

    const result = await db.query('SELECT * FROM students WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'This email is not linked to any student account. Please login with your Student ID and link your email in Settings first.' });
    }

    const student = result.rows[0];

    const token = jwt.sign(
      { id: student.id, role: 'student', level: student.level, department_id: student.department_id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    StudentLog.logLogin(student.id, student.name, 'Google', req.ip || req.connection?.remoteAddress);

    res.json({
      success: true,
      token,
      student: {
        id: student.id,
        name: student.name,
        level: student.level,
        section: student.section,
        department_id: student.department_id,
        email: student.email
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
};

const microsoftLogin = async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) return res.status(400).json({ message: 'Microsoft access token is required' });

    // Fetch user profile from Microsoft Graph API
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      return res.status(401).json({ message: 'Microsoft authentication failed' });
    }

    const userData = await response.json();
    const email = userData.mail || userData.userPrincipalName;

    if (!email) {
      return res.status(400).json({ message: 'No email found in Microsoft account' });
    }

    const aiDomain = '@ai.znu.edu.eg';
    const aiDepartmentId = 5;
    let student;

    const normalizedEmail = email.toLowerCase().trim();

    if (normalizedEmail.endsWith(aiDomain)) {
      console.log('🔍 AI Domain detected:', normalizedEmail);
      const studentIdFromEmail = normalizedEmail.split('@')[0];
      console.log('🔍 Extracted Student ID:', studentIdFromEmail);

      // Search by ID and ensure they are in the AI department
      const result = await db.query('SELECT * FROM students WHERE id = $1 AND department_id = $2', [studentIdFromEmail, aiDepartmentId]);
      student = result.rows[0];
      
      if (!student) {
        console.log('❌ No AI student found with ID:', studentIdFromEmail, 'in department:', aiDepartmentId);
        return res.status(401).json({ 
          message: `No student found with ID ${studentIdFromEmail} in the Artificial Intelligence department. Please contact your admin.` 
        });
      }
    } else {
      // Standard search for non-AI domains or manually linked emails
      const result = await db.query('SELECT * FROM students WHERE email = $1', [normalizedEmail]);
      student = result.rows[0];
      
      if (!student) {
        return res.status(401).json({ message: 'This email is not linked to any student account. Please login with your Student ID and link your email in Settings first.' });
      }
    }

    const token = jwt.sign(
      { id: student.id, role: 'student', level: student.level, department_id: student.department_id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    StudentLog.logLogin(student.id, student.name, 'Microsoft', req.ip || req.connection?.remoteAddress);

    res.json({
      success: true,
      token,
      student: {
        id: student.id,
        name: student.name,
        level: student.level,
        section: student.section,
        department_id: student.department_id,
        email: student.email
      }
    });
  } catch (error) {
    console.error('Microsoft login error:', error);
    res.status(500).json({ message: 'Microsoft authentication failed' });
  }
};

module.exports = {
  studentLogin,
  googleLogin,
  getCurrentStudent,
  changePassword,
  getPortalStats,
  linkEmail,
  verifyEmail,
  forgotPassword,
  resetPassword,
  microsoftLogin
};