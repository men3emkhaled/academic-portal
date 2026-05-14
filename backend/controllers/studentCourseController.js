const StudentCourse = require('../models/StudentCourse');
const Student = require('../models/Student');
const Course = require('../models/Course');
const db = require('../config/database');

const getStudentCourses = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const courses = await StudentCourse.getByStudentId(studentId);
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAvailableCourses = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    
    // ✅ جلب المواد المتاحة (غير المسجلة) مع تصفية حسب قسم الطالب
    const result = await db.query(
      `SELECT c.*
       FROM courses c
       WHERE c.id NOT IN (
         SELECT course_id FROM student_courses WHERE student_id = $1
       )
       AND (c.department_id = $2 OR c.department_id IS NULL)
       ORDER BY c.semester, c.name`,
      [studentId, student.department_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addCourseToStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const courseId = req.params.courseId || req.body.course_id;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const enrollment = await StudentCourse.enroll(studentId, courseId);
    if (!enrollment) return res.status(400).json({ message: 'Student already enrolled' });
    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeCourseFromStudent = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    await db.query(
      `DELETE FROM grades 
       WHERE student_id = $1 
         AND course_name = (SELECT name FROM courses WHERE id = $2)`,
      [studentId, courseId]
    );
    const result = await StudentCourse.unenroll(studentId, courseId);
    if (!result) return res.status(404).json({ message: 'Enrollment not found' });
    res.json({ message: 'Course removed and grades deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStudentCourses,
  getAvailableCourses,
  addCourseToStudent,
  removeCourseFromStudent,
};