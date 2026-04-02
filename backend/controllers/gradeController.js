const Grade = require('../models/Grade');
const Student = require('../models/Student');
const Course = require('../models/Course');
const { parseExcelGrades } = require('../utils/excelParser');
const fs = require('fs');

const getGradesByStudentId = async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findById(studentId);
        // استخدم الدالة الجديدة التي تجلب جميع المواد
        const grades = await Grade.getStudentGradesWithAllCourses(studentId);
        res.json({
            studentId,
            studentName: student ? student.name : null,
            grades
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const uploadGradesExcel = async (req, res) => {
    let filePath = null;
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        const { courseId } = req.body;
        if (!courseId) return res.status(400).json({ message: 'Course ID is required' });
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        filePath = req.file.path;
        const { grades, students } = parseExcelGrades(filePath);
        if (grades.length === 0) return res.status(400).json({ message: 'No valid data found in Excel file' });
        for (const student of students) {
            await Student.create(student.id, student.name);
        }
        const gradesWithCourse = grades.map(g => ({
            student_id: g.student_id,
            course_name: course.name,
            midterm_score: g.midterm_score
        }));
        const result = await Grade.bulkInsert(gradesWithCourse);
        fs.unlinkSync(filePath);
        res.json({ message: 'Grades uploaded successfully', count: result.count, studentsCount: students.length });
    } catch (error) {
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.status(500).json({ message: error.message });
    }
};

const getAllGrades = async (req, res) => {
    try {
        const grades = await Grade.getAll();
        res.json(grades);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getGradesByStudentId, uploadGradesExcel, getAllGrades };