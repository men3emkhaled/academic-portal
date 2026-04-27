const XLSX = require('xlsx');

// تحليل ملف Excel للطلاب (مع Password و Section)
const parseStudentExcel = (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    const students = [];
    
    for (const row of data) {
      const studentId = row['Student ID'] || row['student_id'] || row['ID'];
      const studentName = row['Student Name'] || row['student_name'] || row['Name'];
      const password = row['Password'] || row['password'] || '123456';
      const level = row['Level'] || row['level'] || 1;
      const section = row['Section'] || row['section'] || null;
      
      if (studentId && studentName) {
        students.push({
          id: String(studentId),
          name: String(studentName),
          password: String(password),
          level: parseInt(level),
          section: section ? String(section) : null
        });
      }
    }
    
    return students;
  } catch (error) {
    throw new Error(`Error parsing student Excel: ${error.message}`);
  }
};

// تحليل ملف Excel للدرجات (يدعم 3 أنواع)
const parseGradesExcel = (filePath, examType) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    const grades = [];
    
    for (const row of data) {
      const studentId = row['Student ID'] || row['student_id'] || row['StudentId'];
      let score = null;
      let status = 'pending';
      
      if (examType === 'midterm') {
        score = row['Midterm Score'] || row['midterm_score'] || row['Score'];
      } else if (examType === 'practical') {
        score = row['Practical Score'] || row['practical_score'] || row['Score'];
      } else if (examType === 'oral') {
        score = row['Oral Score'] || row['oral_score'] || row['Score'];
      }
      
      const statusFromRow = row['Status'] || row['status'];
      if (statusFromRow) {
        status = statusFromRow;
      } else if (score !== undefined && score !== null && score !== '-') {
        status = 'completed';
      }
      
      if (!studentId) continue;
      
      let scoreValue = null;
      if (score !== undefined && score !== null && score !== '-') {
        const parsed = parseFloat(score);
        if (!isNaN(parsed)) {
          scoreValue = parsed;
        }
      }
      
      grades.push({
        student_id: String(studentId),
        score: scoreValue,
        status: status
      });
    }
    
    return grades;
  } catch (error) {
    throw new Error(`Error parsing grades Excel: ${error.message}`);
  }
};

// تحليل ملف Excel للجدول
const parseTimetableExcel = (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    const entries = [];
    const daysMap = {
      'mon': 'Monday', 'tue': 'Tuesday', 'wed': 'Wednesday', 'thu': 'Thursday',
      'fri': 'Friday', 'sat': 'Saturday', 'sun': 'Sunday'
    };
    
    for (const row of data) {
      let day = row['Day'] || row['day'] || row['DAY'];
      const startTime = row['Start Time'] || row['start_time'] || row['Start'];
      const endTime = row['End Time'] || row['end_time'] || row['End'];
      const courseName = row['Course Name'] || row['course_name'] || row['Course'];
      const location = row['Location'] || row['location'] || row['Hall'] || row['Lab'];
      const instructor = row['Instructor'] || row['instructor'] || '';
      const type = row['Type'] || row['type'] || 'Lecture';
      
      if (!day || !courseName) continue;
      
      // Normalize day name
      const lowerDay = day.toLowerCase().substring(0, 3);
      if (daysMap[lowerDay]) {
        day = daysMap[lowerDay];
      }
      
      entries.push({
        day,
        start_time: startTime || null,
        end_time: endTime || null,
        course_name: courseName,
        location: location || null,
        instructor: instructor || null,
        type: type
      });
    }
    
    return entries;
  } catch (error) {
    throw new Error(`Error parsing timetable Excel: ${error.message}`);
  }
};

module.exports = { 
  parseStudentExcel, 
  parseGradesExcel, 
  parseTimetableExcel 
};