const Grade = require('../models/Grade');
const Student = require('../models/Student');
const Course = require('../models/Course');
const XLSX = require('xlsx');
const fs = require('fs');

// جلب درجات طالب معين (بالـ ID)
const getGradesByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;
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

// رفع الدرجات (متقدم - يدعم 3 أنواع)
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
    const studentsToUpdate = [];
    
    for (const row of data) {
      let studentId = row['Student ID'] || row['student_id'] || row['StudentId'];
      let score = row['Score'] || row['score'] || row['Midterm Score'] || row['Practical Score'] || row['Oral Score'];
      let status = row['Status'] || row['status'] || (score !== undefined && score !== null && score !== '-' ? 'completed' : 'pending');
      
      if (!studentId) continue;
      
      let scoreValue = null;
      if (score !== undefined && score !== null && score !== '-') {
        const parsed = parseFloat(score);
        if (!isNaN(parsed)) {
          scoreValue = parsed;
          status = 'completed';
        }
      }
      
      gradesData.push({
        student_id: String(studentId),
        score: scoreValue,
        status: status
      });
      
      const studentName = row['Student Name'] || row['student_name'];
      if (studentName) {
        studentsToUpdate.push({ id: String(studentId), name: String(studentName) });
      }
    }
    
    for (const student of studentsToUpdate) {
      await Student.create(student.id, student.name, 'default123', 1, null);
    }
    
    const result = await Grade.uploadGrades(course.name, examType, gradesData);
    
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
    
    if (score !== null && score !== undefined && score > course.max_score) {
      return res.status(400).json({ message: `Score cannot exceed ${course.max_score}` });
    }
    
    const updatedGrade = await Grade.updateSingleGrade(studentId, courseName, examType, score, status);
    
    res.json({ 
      message: 'Grade updated successfully',
      grade: updatedGrade
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// جلب كل الدرجات (للـ Admin)
const getAllGrades = async (req, res) => {
  try {
    const grades = await Grade.getAllGrades();
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// جلب درجات الطالب المسجل (للوحة تحكم الطالب) - المعدلة عشان تظهر كل المواد
const getMyGrades = async (req, res) => {
  try {
    const studentId = req.user.id;
    const student = await Student.findById(studentId);
    
    // جلب كل المواد (حتى اللي مفيش درجات)
    const allCourses = await Course.findAll();
    const semester2Courses = allCourses.filter(c => c.semester === 2);
    
    // جلب الدرجات الموجودة
    const existingGrades = await Grade.getStudentGrades(studentId);
    
    // دمج المواد مع الدرجات
    const gradesMap = new Map();
    existingGrades.forEach(grade => {
      gradesMap.set(grade.course_name, grade);
    });
    
    const grades = semester2Courses.map(course => {
      const existing = gradesMap.get(course.name);
      return {
        course_id: course.id,
        course_name: course.name,
        max_score: course.max_score,
        midterm_score: existing?.midterm_score !== undefined && existing?.midterm_score !== null ? existing.midterm_score : null,
        midterm_status: existing?.midterm_status || 'pending',
        practical_score: existing?.practical_score !== undefined && existing?.practical_score !== null ? existing.practical_score : null,
        practical_status: existing?.practical_status || 'pending',
        oral_score: existing?.oral_score !== undefined && existing?.oral_score !== null ? existing.oral_score : null,
        oral_status: existing?.oral_status || 'pending'
      };
    });
    
    // حساب الإحصائيات
    let totalEarned = 0;
    let totalPossible = 0;
    let coursesWithGrades = 0;
    
    for (const grade of grades) {
      const earned = (grade.midterm_score || 0) + (grade.practical_score || 0) + (grade.oral_score || 0);
      totalPossible += grade.max_score;
      if (earned > 0) {
        totalEarned += earned;
        coursesWithGrades++;
      }
    }
    
    const overallPercentage = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;
    
    res.json({
      student: {
        id: studentId,
        name: student?.name,
        level: student?.level,
        section: student?.section
      },
      grades,
      summary: {
        totalEarned,
        totalPossible,
        overallPercentage: Math.round(overallPercentage),
        coursesWithGrades
      }
    });
  } catch (error) {
    console.error('Error in getMyGrades:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getGradesByStudentId,
  uploadAdvancedGrades,
  updateSingleGrade,
  getAllGrades,
  getMyGrades
};