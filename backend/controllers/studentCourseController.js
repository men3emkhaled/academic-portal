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
      `SELECT c.*,
        (SELECT json_agg(json_build_object(
          'instructor_type', cis.instructor_type,
          'instructor_id', cis.instructor_id,
          'section', cis.section,
          'name', CASE WHEN cis.instructor_type = 'doctor' THEN d.name ELSE ta.name END
        )) FROM course_instructor_sections cis
        LEFT JOIN doctors d ON cis.instructor_type = 'doctor' AND cis.instructor_id = d.id
        LEFT JOIN teaching_assistants ta ON cis.instructor_type = 'ta' AND cis.instructor_id = ta.id
        WHERE cis.course_id = c.id) as instructors
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

    // Auto-assign instructor based on student's section
    let instructorType = null;
    let instructorId = null;
    const sectionStr = student.section != null ? String(student.section) : null;
    if (sectionStr) {
      const sectionInstructor = await db.query(
        `SELECT instructor_type, instructor_id FROM course_instructor_sections
         WHERE course_id = $1 AND section = $2`,
        [courseId, sectionStr]
      );
      if (sectionInstructor.rows.length > 0) {
        instructorType = sectionInstructor.rows[0].instructor_type;
        instructorId = sectionInstructor.rows[0].instructor_id;
      }
    }

    const enrollment = await StudentCourse.enroll(studentId, courseId, 0, 'active', instructorType, instructorId);
    if (!enrollment) return res.status(400).json({ message: 'Student already enrolled' });
    res.status(201).json({ ...enrollment, instructor_type: instructorType, instructor_id: instructorId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeCourseFromStudent = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const result = await StudentCourse.unenroll(studentId, courseId);
    if (!result) return res.status(404).json({ message: 'Enrollment not found' });
    res.json({ message: 'Course removed successfully. Grades preserved for future re-enrollment.' });
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