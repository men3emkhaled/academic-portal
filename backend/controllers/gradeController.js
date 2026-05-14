const Grade = require('../models/Grade');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Notification = require('../models/Notification');
const db = require('../config/database');
const XLSX = require('xlsx');
const fs = require('fs');

// جلب درجات طالب معين
const getGradesByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Authorization check: User must be the student or an admin
    if (req.user.role === 'student' && String(req.user.id) !== String(studentId)) {
        return res.status(403).json({ message: 'Access denied: You can only view your own grades' });
    }

    const student = await Student.findById(studentId);
    const grades = await Grade.getStudentGrades(studentId);
    
    res.json({
      studentId,
      studentName: student ? student.name : null,
      grades
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// رفع الدرجات (مع إنشاء enrollment تلقائياً)
const uploadAdvancedGrades = async (req, res) => {
  let filePath = null;
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const { courseId, examType } = req.body;
    
    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }
    
    if (!examType || !['midterm', 'practical', 'oral'].includes(examType)) {
      return res.status(400).json({ message: 'Valid exam type is required (midterm/practical/oral)' });
    }
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    const gradesData = [];
    
    for (const row of data) {
      let studentId = row['Student ID'] || row['student_id'] || row['StudentId'];
      let score = row['Score'] || row['score'] || row['Midterm Score'] || row['Practical Score'] || row['Oral Score'];
      let status = row['Status'] || row['status'] || (score !== undefined && score !== null && score !== '-' ? 'completed' : 'pending');
      
      if (!studentId) continue;
      
      // 1. التأكد من وجود الطالب
      let student = await Student.findById(studentId);
      if (!student) {
        const studentName = row['Student Name'] || row['student_name'] || `Student ${studentId}`;
        await Student.create(studentId, studentName, 'default123', 1, null);
      }
      
      // 2. البحث عن enrollment (أو إنشاؤه)
      let enrollment = await db.query(
        `SELECT id FROM student_courses WHERE student_id = $1 AND course_id = $2`,
        [String(studentId), courseId]
      );
      
      let enrollmentId;
      if (enrollment.rows.length === 0) {
        const insertResult = await db.query(
          `INSERT INTO student_courses (student_id, course_id, progress_percentage, status)
           VALUES ($1, $2, 0, 'active') RETURNING id`,
          [String(studentId), courseId]
        );
        enrollmentId = insertResult.rows[0].id;
      } else {
        enrollmentId = enrollment.rows[0].id;
      }
      
      // 3. تحضير قيمة الدرجة
      let scoreValue = null;
      if (score !== undefined && score !== null && score !== '-') {
        const parsed = parseFloat(score);
        if (!isNaN(parsed)) {
          scoreValue = parsed;
          status = 'completed';
        }
      }
      
      gradesData.push({
        enrollment_id: enrollmentId,
        score: scoreValue,
        status: status
      });
    }
    
    // 4. رفع الدرجات باستخدام enrollment_id
    const result = await Grade.uploadGradesWithEnrollment(course.name, examType, gradesData);
    
    // إرسال إشعار للقسم
    if (gradesData.length > 0) {
      if (course.department_id) {
        await Notification.sendToDepartment(
          course.department_id, 
          'تحديث درجات', 
          `درجات مادة ${course.name} نزلت لقسم ${course.department_name || 'الخاص بك'}`
        );
      } else {
        await Notification.sendToAll(
          'تحديث درجات', 
          `درجات مادة ${course.name} نزلت للجميع`
        );
      }
    }

    fs.unlinkSync(filePath);
    res.json({ 
      message: 'Grades uploaded successfully', 
      count: result.count,
      examType: examType,
      courseName: course.name
    });
  } catch (error) {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ message: error.message });
  }
};

// تعديل درجة طالب واحد
const updateSingleGrade = async (req, res) => {
  try {
    const { studentId, courseName, examType, score, status } = req.body;
    
    if (!studentId || !courseName || !examType) {
      return res.status(400).json({ message: 'Student ID, course name, and exam type are required' });
    }
    
    const course = await Course.findByName(courseName);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // التحقق من الحد الأقصى
    let maxAllowed = 0;
    if (examType === 'midterm') maxAllowed = course.midterm_max || 15;
    else if (examType === 'practical') maxAllowed = course.practical_max || 15;
    else if (examType === 'oral') maxAllowed = course.oral_max || 10;
    
    if (score !== null && score !== undefined && score > maxAllowed) {
      return res.status(400).json({ message: `${examType} score cannot exceed ${maxAllowed}` });
    }
    
    // البحث عن enrollment_id
    const enrollment = await db.query(
      `SELECT id FROM student_courses WHERE student_id = $1 AND course_id = $2`,
      [studentId, course.id]
    );
    if (enrollment.rows.length === 0) {
      return res.status(404).json({ message: 'Student is not enrolled in this course' });
    }
    const enrollmentId = enrollment.rows[0].id;
    
    const updatedGrade = await Grade.updateSingleGradeWithEnrollment(enrollmentId, examType, score, status);
    
    res.json({ 
      message: 'Grade updated successfully',
      grade: updatedGrade
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// جلب كل الدرجات (للـ Admin) - يتضمن القسم
const getAllGrades = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        g.*,
        s.name as student_name,
        s.section,
        c.name as course_name,
        c.semester,
        d.name as department_name,
        d.code as department_code
      FROM grades g
      JOIN student_courses sc ON sc.id = g.enrollment_id
      JOIN students s ON s.id = sc.student_id
      JOIN courses c ON c.id = sc.course_id
      LEFT JOIN departments d ON c.department_id = d.id
      ORDER BY s.id, c.name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error in getAllGrades:', error);
    res.status(500).json({ message: error.message });
  }
};

// جلب درجات الطالب المسجل (عبر enrollments) – تعرض فقط مواد الفصل الثاني (Semester 2)
const getMyGrades = async (req, res) => {
  try {
    const studentId = req.user.id;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    
    // جلب المواد المسجلة مع درجاتها – فقط الفصل الثاني
    const grades = await db.query(
      `SELECT 
        c.id as course_id,
        c.name as course_name,
        c.semester,
        c.max_score,
        c.midterm_max,
        c.practical_max,
        c.oral_max,
        g.midterm_score,
        g.midterm_status,
        g.practical_score,
        g.practical_status,
        g.oral_score,
        g.oral_status,
        COALESCE(g.midterm_score, 0) + COALESCE(g.practical_score, 0) + COALESCE(g.oral_score, 0) as total_score
      FROM student_courses sc
      JOIN courses c ON c.id = sc.course_id
      LEFT JOIN grades g ON g.enrollment_id = sc.id
      WHERE sc.student_id = $1 AND c.semester = 2
      ORDER BY c.name`,
      [studentId]
    );
    
    const gradesList = grades.rows;
    
    // حساب المجاميع والمواد الناجحة
    let totalEarned = 0;
    let totalPossible = 0;
    let coursesPassed = 0;
    
    for (const grade of gradesList) {
      const earned = (grade.midterm_score || 0) + (grade.practical_score || 0) + (grade.oral_score || 0);
      totalPossible += grade.max_score;
      totalEarned += earned;
      
      // هل اكتملت جميع الدرجات الثلاثة؟
      const allExist = (grade.midterm_score !== null && grade.midterm_score !== undefined) &&
                       (grade.practical_score !== null && grade.practical_score !== undefined) &&
                       (grade.oral_score !== null && grade.oral_score !== undefined);
      
      if (allExist) {
        const percentage = (earned / grade.max_score) * 100;
        if (percentage >= 50) coursesPassed++;
      }
    }
    
    const overallPercentage = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
    
    res.json({
      student: {
        id: studentId,
        name: student.name,
        level: student.level,
        section: student.section
      },
      grades: gradesList,
      summary: {
        totalEarned,
        totalPossible,
        overallPercentage,
        coursesPassed,
        totalCourses: gradesList.length
      }
    });
  } catch (error) {
    console.error('Error in getMyGrades:', error);
    res.status(500).json({ message: error.message });
  }
};

// تفريغ درجات مادة بالكامل لنوع امتحان معين
const clearCourseGrades = async (req, res) => {
  try {
    const { courseId, examType } = req.query;
    
    if (!courseId || !examType) {
      return res.status(400).json({ message: 'Course ID and Exam Type are required' });
    }
    
    let field = '';
    let statusField = '';
    
    if (examType === 'midterm') {
      field = 'midterm_score';
      statusField = 'midterm_status';
    } else if (examType === 'practical') {
      field = 'practical_score';
      statusField = 'practical_status';
    } else if (examType === 'oral') {
      field = 'oral_score';
      statusField = 'oral_status';
    } else {
      return res.status(400).json({ message: 'Invalid exam type' });
    }
    
    const result = await db.query(
      `UPDATE grades 
       SET ${field} = NULL, ${statusField} = 'pending' 
       WHERE enrollment_id IN (SELECT id FROM student_courses WHERE course_id = $1)`,
      [courseId]
    );
    
    res.json({ 
      message: 'Grades cleared successfully', 
      count: result.rowCount 
    });
  } catch (error) {
    console.error('Error in clearCourseGrades:', error);
    res.status(500).json({ message: error.message });
  }
};

// تعديل درجة طالب لمادة معينة عبر ID المادة
const updateStudentGradeByCourseId = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const { examType, score, status } = req.body;
    
    if (!studentId || !courseId || !examType) {
      return res.status(400).json({ message: 'Student ID, course ID, and exam type are required' });
    }
    
    // البحث عن enrollment_id
    const enrollment = await db.query(
      `SELECT id FROM student_courses WHERE student_id = $1 AND course_id = $2`,
      [studentId, courseId]
    );
    
    if (enrollment.rows.length === 0) {
      return res.status(404).json({ message: 'Student is not enrolled in this course' });
    }
    
    const enrollmentId = enrollment.rows[0].id;
    const updatedGrade = await Grade.updateSingleGradeWithEnrollment(enrollmentId, examType, score, status);
    
    res.json({ 
      message: 'Grade updated successfully',
      grade: updatedGrade
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getGradesByStudentId,
  uploadAdvancedGrades,
  updateSingleGrade,
  updateStudentGradeByCourseId, // ✅ جديد
  getAllGrades,
  getMyGrades,
  clearCourseGrades
};