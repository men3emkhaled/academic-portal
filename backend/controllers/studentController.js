const Student = require('../models/Student');
const XLSX = require('xlsx');
const fs = require('fs');
const db = require('../config/database');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

const uploadStudentsExcel = async (req, res) => {
  let filePath = null;
  const client = await db.pool.connect();
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    await client.query('BEGIN');

    // جلب قائمة الأقسام لتحويل الكود إلى id
    const deptResult = await client.query('SELECT id, code FROM departments');
    const deptMap = {};
    deptResult.rows.forEach(d => { deptMap[d.code] = d.id; });

    // جلب جميع الطلاب الموجودين في الملف دفعة واحدة لتوفير الوقت
    const studentIds = data.map(row => String(row['Student ID'] || row['student_id'] || row['ID'] || row['id'])).filter(id => id && id !== 'undefined');
    const existingStudentsResult = await client.query('SELECT * FROM students WHERE id = ANY($1)', [studentIds]);
    const existingStudentsMap = {};
    existingStudentsResult.rows.forEach(s => { existingStudentsMap[s.id] = s; });

    const updatedStudents = [];

    for (const row of data) {
      const studentId = String(row['Student ID'] || row['student_id'] || row['ID'] || row['id']);
      if (!studentId || studentId === 'undefined') continue;

      const existingStudent = existingStudentsMap[studentId];
      if (!existingStudent) continue; // تخطي الطلاب غير الموجودين

      const studentName = row['Student Name'] || row['student_name'] || row['Name'] || row['name'] || existingStudent.name;

      // معالجة كلمة المرور: إذا وجدت جديدة نقوم بتشفيرها، وإلا نترك الهاش القديم
      let passwordHashToSet = null;
      const passwordFromExcel = row['Password'] || row['password'];
      if (passwordFromExcel && String(passwordFromExcel).trim() !== '') {
        passwordHashToSet = await bcrypt.hash(String(passwordFromExcel).trim(), SALT_ROUNDS);
      }

      const level = row['Level'] || row['level'] || existingStudent.level || 1;

      let section = row['Section'] || row['section'] || existingStudent.section;
      if (section) {
        const sectionMap = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6 };
        if (typeof section === 'string' && sectionMap[section.toUpperCase()]) {
          section = sectionMap[section.toUpperCase()];
        } else {
          section = parseInt(section, 10);
        }
        if (isNaN(section) || section < 1 || section > 6) {
          section = existingStudent.section;
        }
      }

      const deptCode = row['Department Code'] || row['department_code'] || row['Department'] || null;
      let department_id = existingStudent.department_id;
      if (deptCode && deptMap[deptCode]) {
        department_id = deptMap[deptCode];
      }

      // بناء جملة UPDATE ديناميكياً لكل طالب
      const updates = [];
      const values = [];
      let paramIndex = 1;

      updates.push(`name = $${paramIndex++}`);
      values.push(String(studentName));

      updates.push(`level = $${paramIndex++}`);
      values.push(parseInt(level, 10));

      updates.push(`section = $${paramIndex++}`);
      values.push(section);

      updates.push(`department_id = $${paramIndex++}`);
      values.push(department_id);

      if (passwordHashToSet !== null) {
        updates.push(`password_hash = $${paramIndex++}`);
        values.push(passwordHashToSet);
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(studentId); // للـ WHERE clause

      const query = `UPDATE students SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
      const result = await client.query(query, values);

      if (result.rows.length > 0) {
        const updatedStudent = result.rows[0];
        updatedStudents.push(updatedStudent);
        // تسجيل الطالب في مواد القسم
        if (department_id) {
          await Student.enrollInDepartmentCourses(studentId, department_id, client);
        }
      }
    }

    await client.query('COMMIT');
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    
    res.json({
      message: 'Students updated successfully',
      count: updatedStudents.length,
      students: updatedStudents
    });
  } catch (error) {
    await client.query('ROLLBACK');
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    console.error('Upload students error:', error);
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
};

const getAllStudents = async (req, res) => {
  try {
    const students = await Student.getAll();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStudentSection = async (req, res) => {
  try {
    const { id } = req.params;
    let { section } = req.body;

    if (!section) {
      return res.status(400).json({ message: 'Section is required' });
    }

    section = parseInt(section, 10);
    if (isNaN(section) || section < 1 || section > 6) {
      return res.status(400).json({ message: 'Section must be a number between 1 and 6' });
    }

    const student = await Student.updateSection(id, section);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStudentDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    let { department_id } = req.body;

    if (department_id === undefined || department_id === null) {
      return res.status(400).json({ message: 'Department ID is required' });
    }

    const student = await Student.updateDepartment(id, department_id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await Student.enrollInDepartmentCourses(id, department_id);

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetStudentPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const student = await Student.findByUsername(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const finalPassword = newPassword || '123456';
    await Student.updatePassword(id, finalPassword);
    // ✅ لا نُعيد كلمة المرور في الرد لأسباب أمنية
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateFcmToken = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { fcm_token } = req.body;

    if (!studentId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!fcm_token) {
      return res.status(400).json({ message: 'FCM token is required' });
    }

    const result = await db.query(
      'UPDATE students SET fcm_token = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, fcm_token',
      [fcm_token, studentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'FCM token updated successfully', student: result.rows[0] });
  } catch (error) {
    console.error('Update FCM Token error:', error);
    res.status(500).json({ message: error.message });
  }
};

const updateStudentRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, permissions } = req.body;

    if (!['student', 'assistant', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified.' });
    }

    const student = await Student.updateRoleAndPermissions(id, role, permissions);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Role and permissions updated successfully', student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadStudentsExcel,
  getAllStudents,
  updateStudentSection,
  updateStudentDepartment,
  resetStudentPassword,
  updateFcmToken,
  updateStudentRole
};