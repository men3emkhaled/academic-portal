const Student = require('../models/Student');
const XLSX = require('xlsx');
const fs = require('fs');

const uploadStudentsExcel = async (req, res) => {
  let filePath = null;
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    const students = [];
    
    for (const row of data) {
      const studentId = row['Student ID'] || row['student_id'] || row['ID'];
      const studentName = row['Student Name'] || row['student_name'] || row['Name'];
      let password = row['Password'] || row['password'] || 'default123';
      const level = row['Level'] || row['level'] || 1;
      let section = row['Section'] || row['section'] || null;
      
      if (!studentId || !studentName) continue;
      
      // ✅ تحويل section إلى رقم (1-6)
      if (section) {
        const sectionMap = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6 };
        if (typeof section === 'string' && sectionMap[section.toUpperCase()]) {
          section = sectionMap[section.toUpperCase()];
        } else {
          section = parseInt(section, 10);
        }
        if (isNaN(section) || section < 1 || section > 6) section = null;
      }
      
      // الحفاظ على الباسورد القديم
      const existingStudent = await Student.findById(studentId);
      if (existingStudent && password === 'default123') {
        password = existingStudent.password_hash;
      }
      
      students.push({
        id: String(studentId),
        name: String(studentName),
        password: String(password),
        level: parseInt(level, 10),
        section: section
      });
    }
    
    if (students.length === 0) {
      return res.status(400).json({ message: 'No valid student data found' });
    }
    
    const updatedStudents = [];
    for (const student of students) {
      const result = await Student.create(student.id, student.name, student.password, student.level, student.section);
      updatedStudents.push(result);
    }
    
    fs.unlinkSync(filePath);
    res.json({ 
      message: 'Students uploaded successfully', 
      count: students.length,
      students: updatedStudents
    });
  } catch (error) {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ message: error.message });
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
    res.json({ message: 'Password reset successfully', newPassword: finalPassword });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadStudentsExcel,
  getAllStudents,
  updateStudentSection,
  resetStudentPassword
};