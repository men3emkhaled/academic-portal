const Student = require('../models/Student');
const { parseStudentExcel } = require('../utils/excelParser');
const fs = require('fs');

const uploadStudentsExcel = async (req, res) => {
    let filePath = null;
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        filePath = req.file.path;
        const students = parseStudentExcel(filePath);
        if (students.length === 0) return res.status(400).json({ message: 'No valid student data found' });
        
        for (const student of students) {
            await Student.create(student.id, student.name);
        }
        fs.unlinkSync(filePath);
        res.json({ message: 'Students uploaded successfully', count: students.length });
    } catch (error) {
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { uploadStudentsExcel };