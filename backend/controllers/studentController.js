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
      let password = row['Password'] || row['password'] || '123456';
      const level = row['Level'] || row['level'] || 1;
      let section = row['Section'] || row['section'] || null;
      
      if (!studentId || !studentName) continue;
      
      // ✅ التعامل مع الـ section كـ string (حرف)
      if (section) {
        section = String(section).toUpperCase().trim();
        // لو الرقم كان رقم زي 1، حوله لـ A
        if (section === '1') section = 'A';
        else if (section === '2') section = 'B';
        else if (section === '3') section = 'C';
        else if (section === '4') section = 'D';
        else if (section === '5') section = 'E';
        else if (section === '6') section = 'F';
      }
      
      students.push({
        id: String(studentId),
        name: String(studentName),
        password: String(password),
        level: parseInt(level),
        section: section
      });
    }
    
    if (students.length === 0) {
      return res.status(400).json({ message: 'No valid student data found' });
    }
    
    for (const student of students) {
      await Student.create(student.id, student.name, student.password, student.level, student.section);
    }
    
    fs.unlinkSync(filePath);
    res.json({ 
      message: 'Students uploaded successfully', 
      count: students.length,
      students: students.map(s => ({ id: s.id, name: s.name, level: s.level, section: s.section }))
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
    
    // ✅ التعامل مع الـ section كـ string
    section = String(section).toUpperCase().trim();
    const validSections = ['A', 'B', 'C', 'D', 'E', 'F'];
    if (!validSections.includes(section)) {
      return res.status(400).json({ message: 'Section must be A, B, C, D, E, or F' });
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
    
    await Student.updatePassword(id, newPassword || '123456');
    res.json({ message: 'Password reset successfully' });
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