const Student = require('../models/Student');
const XLSX = require('xlsx');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// رفع الطلاب من Excel
const uploadStudentsExcel = async (req, res) => {
  let filePath = null;
  try {
    console.log('📥 Request received at /upload-students');
    console.log('📋 Request body:', req.body);
    console.log('📎 Request file:', req.file);
    
    if (!req.file) {
      console.log('❌ No file in request');
      return res.status(400).json({ 
        message: 'No file uploaded',
        details: 'Please select an Excel file to upload'
      });
    }
    
    filePath = req.file.path;
    console.log('📁 File saved at:', filePath);
    
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log('📊 Excel data rows:', data.length);
    
    const students = [];
    
    for (const row of data) {
      const studentId = row['Student ID'] || row['student_id'] || row['ID'];
      const studentName = row['Student Name'] || row['student_name'] || row['Name'];
      let password = row['Password'] || row['password'] || '123456';
      const level = row['Level'] || row['level'] || 1;
      const section = row['Section'] || row['section'] || null;
      
      if (!studentId || !studentName) {
        console.log('⚠️ Skipping row missing ID or Name:', row);
        continue;
      }
      
      students.push({
        id: String(studentId),
        name: String(studentName),
        password: String(password),
        level: parseInt(level),
        section: section ? String(section) : null
      });
    }
    
    if (students.length === 0) {
      console.log('❌ No valid student data found');
      return res.status(400).json({ 
        message: 'No valid student data found',
        details: 'Excel file must contain columns: Student ID, Student Name'
      });
    }
    
    console.log(`✅ Found ${students.length} students to upload`);
    
    for (const student of students) {
      await Student.create(student.id, student.name, student.password, student.level, student.section);
    }
    
    fs.unlinkSync(filePath);
    console.log('✅ Upload successful');
    
    res.json({ 
      message: 'Students uploaded successfully', 
      count: students.length,
      students: students.map(s => ({ id: s.id, name: s.name, level: s.level, section: s.section }))
    });
  } catch (error) {
    console.error('❌ Error in uploadStudentsExcel:', error);
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ 
      message: error.message,
      details: error.stack
    });
  }
};

// جلب كل الطلاب مع الباسوردات وحالة التغيير
const getAllStudentsWithPasswords = async (req, res) => {
  try {
    const result = await Student.getAllWithPasswords();
    res.json(result);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: error.message });
  }
};

// جلب كل الطلاب (بدون باسوردات - للاستخدام العادي)
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.getAll();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// تحديث سيكشن طالب
const updateStudentSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { section } = req.body;
    
    if (!section) {
      return res.status(400).json({ message: 'Section is required' });
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

// إعادة تعيين كلمة مرور طالب
const resetStudentPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    const student = await Student.findByUsername(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    await Student.updatePassword(id, newPassword || '123456');
    res.json({ message: 'Password reset successfully', newPassword: newPassword || '123456' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// تعديل درجة طالب واحد في مادة معينة
const updateSingleStudentGrade = async (req, res) => {
  try {
    const { studentId, courseName, examType, score, status } = req.body;
    
    if (!studentId || !courseName || !examType) {
      return res.status(400).json({ message: 'Student ID, course name, and exam type are required' });
    }
    
    const Grade = require('../models/Grade');
    const updatedGrade = await Grade.updateSingleGrade(studentId, courseName, examType, score, status);
    
    res.json({ 
      message: 'Grade updated successfully',
      grade: updatedGrade
    });
  } catch (error) {
    console.error('Error updating grade:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadStudentsExcel,
  getAllStudents,
  getAllStudentsWithPasswords,
  updateStudentSection,
  resetStudentPassword,
  updateSingleStudentGrade
};