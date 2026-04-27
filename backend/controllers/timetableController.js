const Timetable = require('../models/Timetable');
const XLSX = require('xlsx');
const fs = require('fs');
const db = require('../config/database');
const xss = require('xss');

// جلب جدول سيكشن معين (لن تظهر المخفية) - يدعم القسم
const getTimetableBySection = async (req, res) => {
  try {
    const { section } = req.params;
    const { department_id } = req.query;
    // تحويل department_id إلى integer إن وجد
    const deptId = department_id ? parseInt(department_id, 10) : null;
    const timetable = await Timetable.getBySection(section, deptId);
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ جلب جدول القسم بالكامل (كل السكاشن) للطالب
const getTimetableByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    if (!departmentId) {
      return res.status(400).json({ message: 'Department ID is required' });
    }
    // تحويل departmentId إلى integer
    const deptId = parseInt(departmentId, 10);
    const timetables = await Timetable.getByDepartment(deptId);
    res.json(timetables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// رفع جدول عن طريق Excel (لسيكشن واحد) - يدعم القسم
const uploadTimetableExcel = async (req, res) => {
  let filePath = null;
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const { section, department_id } = req.body;
    if (!section) {
      return res.status(400).json({ message: 'Section is required' });
    }
    if (!department_id) {
      return res.status(400).json({ message: 'Department ID is required' });
    }
    
    // تحويل department_id إلى integer
    const deptId = parseInt(department_id, 10);
    
    filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    const entries = [];
    
    for (const row of data) {
      let day = row['Day'] || row['day'] || row['DAY'];
      const startTime = row['Start Time'] || row['start_time'] || row['Start'];
      const endTime = row['End Time'] || row['end_time'] || row['End'];
      const courseName = row['Course Name'] || row['course_name'] || row['Course'];
      const location = row['Location'] || row['location'] || row['Hall'] || row['Lab'];
      const instructor = row['Instructor'] || row['instructor'] || row['Dr'] || '';
      const type = row['Type'] || row['type'] || 'Lecture';
      
      if (!day || !courseName) continue;
      
      if (day.toLowerCase().startsWith('mon')) day = 'Monday';
      else if (day.toLowerCase().startsWith('tue')) day = 'Tuesday';
      else if (day.toLowerCase().startsWith('wed')) day = 'Wednesday';
      else if (day.toLowerCase().startsWith('thu')) day = 'Thursday';
      else if (day.toLowerCase().startsWith('fri')) day = 'Friday';
      else if (day.toLowerCase().startsWith('sat')) day = 'Saturday';
      else if (day.toLowerCase().startsWith('sun')) day = 'Sunday';
      
      entries.push({
        day,
        start_time: startTime || null,
        end_time: endTime || null,
        course_name: courseName ? xss(courseName.toString()) : null,
        location: location ? xss(location.toString()) : null,
        instructor: instructor ? xss(instructor.toString()) : null,
        type: type ? xss(type.toString()) : 'Lecture'
      });
    }
    
    const result = await Timetable.bulkInsert(section, entries, deptId);
    
    fs.unlinkSync(filePath);
    res.json({ message: 'Timetable uploaded successfully', count: result.count });
  } catch (error) {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ message: error.message });
  }
};

// رفع جدول لجميع السكاشن دفعة واحدة - يدعم القسم
const uploadTimetableAllSections = async (req, res) => {
  let filePath = null;
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const { department_id } = req.body;
    if (!department_id) {
      return res.status(400).json({ message: 'Department ID is required' });
    }
    
    // تحويل department_id إلى integer
    const deptId = parseInt(department_id, 10);
    
    filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    const sectionsData = new Map();
    
    for (const row of data) {
      let section = row['Section'] || row['section'] || null;
      let day = row['Day'] || row['day'] || row['DAY'];
      const startTime = row['Start Time'] || row['start_time'] || row['Start'];
      const endTime = row['End Time'] || row['end_time'] || row['End'];
      const courseName = row['Course Name'] || row['course_name'] || row['Course'];
      const location = row['Location'] || row['location'] || row['Hall'] || row['Lab'];
      const instructor = row['Instructor'] || row['instructor'] || '';
      const type = row['Type'] || row['type'] || 'Lecture';
      
      if (!section || !day || !courseName) continue;
      
      if (day.toLowerCase().startsWith('mon')) day = 'Monday';
      else if (day.toLowerCase().startsWith('tue')) day = 'Tuesday';
      else if (day.toLowerCase().startsWith('wed')) day = 'Wednesday';
      else if (day.toLowerCase().startsWith('thu')) day = 'Thursday';
      else if (day.toLowerCase().startsWith('fri')) day = 'Friday';
      else if (day.toLowerCase().startsWith('sat')) day = 'Saturday';
      else if (day.toLowerCase().startsWith('sun')) day = 'Sunday';
      
      if (!sectionsData.has(section)) {
        sectionsData.set(section, []);
      }
      
      sectionsData.get(section).push({
        day,
        start_time: startTime || null,
        end_time: endTime || null,
        course_name: courseName ? xss(courseName.toString()) : null,
        location: location ? xss(location.toString()) : null,
        instructor: instructor ? xss(instructor.toString()) : null,
        type: type ? xss(type.toString()) : 'Lecture'
      });
    }
    
    const results = [];
    for (const [section, entries] of sectionsData) {
      const result = await Timetable.bulkInsert(section, entries, deptId);
      results.push({ section, count: result.count });
    }
    
    fs.unlinkSync(filePath);
    res.json({ 
      message: 'Timetable uploaded successfully for all sections', 
      sections: results.map(r => r.section),
      count: results.reduce((acc, r) => acc + r.count, 0)
    });
  } catch (error) {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ message: error.message });
  }
};

// إضافة مدخل يدوي - يدعم القسم
const addTimetableEntry = async (req, res) => {
  try {
    const { section, day_of_week, start_time, end_time, course_name, location, instructor, type, is_quiz, department_id } = req.body;
    
    if (!section || !day_of_week || !course_name) {
      return res.status(400).json({ message: 'Section, day, and course name are required' });
    }
    if (!department_id) {
      return res.status(400).json({ message: 'Department ID is required' });
    }
    
    // تحويل department_id إلى integer
    const deptId = parseInt(department_id, 10);
    
    const safeCourseName = xss(course_name);
    const safeLocation = location ? xss(location) : null;
    const safeInstructor = instructor ? xss(instructor) : null;
    const safeType = type ? xss(type) : null;
    
    const entry = await Timetable.addEntry(
        xss(section), day_of_week, start_time, end_time, 
        safeCourseName, safeLocation, safeInstructor, safeType, is_quiz, deptId
    );
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// تحديث مدخل - يدعم القسم
const updateTimetableEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const entry = await Timetable.updateEntry(id, updates);
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// حذف مدخل
const deleteTimetableEntry = async (req, res) => {
  try {
    const { id } = req.params;
    await Timetable.deleteEntry(id);
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// حذف جدول سيكشن كامل - يدعم القسم
// حذف جدول سيكشن كامل - يدعم القسم
const deleteTimetableBySection = async (req, res) => {
  try {
    const { section, departmentId } = req.params;
    const department_id = departmentId || req.query.department_id || req.body.department_id;
    
    // لو مفيش department_id، احذف من كل الأقسام
    if (department_id) {
      const deptId = parseInt(department_id, 10);
      await Timetable.deleteBySection(section, deptId);
      res.json({ message: `Timetable for section ${section} in department ${deptId} deleted` });
    } else {
      // حذف من كل الأقسام
      await db.query('DELETE FROM timetable WHERE section = $1', [section]);
      res.json({ message: `Timetable for section ${section} deleted from all departments` });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// جلب كل الجداول (للـ Admin) – تظهر كل المدخلات حتى المخفية - يدعم القسم
const getAllTimetables = async (req, res) => {
  try {
    const { department_id } = req.query;
    // تحويل department_id إلى integer إن وجد
    const deptId = department_id ? parseInt(department_id, 10) : null;
    const timetables = await Timetable.getAll(true, deptId);
    res.json(timetables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// جلب كل الجداول مجمعة حسب القسم (للعرض المحسن في الواجهة)
const getAllTimetablesGrouped = async (req, res) => {
  try {
    const timetables = await Timetable.getAllGroupedByDepartment();
    res.json(timetables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// إخفاء / إظهار مدخل محدد
const toggleHideEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_hidden } = req.body;
    const entry = await Timetable.toggleHideEntry(id, is_hidden);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// إخفاء جميع محاضرات يوم معين
const hideAllSectionsByDay = async (req, res) => {
  try {
    const { day } = req.params;
    const { department_id } = req.body;
    // تحويل department_id إلى integer إن وجد
    const deptId = department_id ? parseInt(department_id, 10) : null;
    await Timetable.hideAllByDay(day, deptId);
    res.json({ message: `All entries for ${day} are now hidden` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// إظهار جميع محاضرات يوم معين
const showAllSectionsByDay = async (req, res) => {
  try {
    const { day } = req.params;
    const { department_id } = req.body;
    // تحويل department_id إلى integer إن وجد
    const deptId = department_id ? parseInt(department_id, 10) : null;
    await Timetable.showAllByDay(day, deptId);
    res.json({ message: `All entries for ${day} are now visible` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// نسخ جداول من قسم إلى آخر
const copyTimetableBetweenDepartments = async (req, res) => {
  const { source_department_id, target_department_id } = req.body;
  if (!source_department_id || !target_department_id) {
    return res.status(400).json({ message: 'Both source_department_id and target_department_id are required' });
  }
  
  try {
    // تحويل كلا الـ IDs إلى integer
    const sourceDeptId = parseInt(source_department_id, 10);
    const targetDeptId = parseInt(target_department_id, 10);
    
    const sourceEntries = await db.query(
      'SELECT section, day_of_week, start_time, end_time, course_name, location, instructor, type, is_quiz FROM timetable WHERE department_id = $1',
      [sourceDeptId]
    );
    
    if (sourceEntries.rows.length === 0) {
      return res.status(404).json({ message: 'No timetable entries found in source department' });
    }
    
    const sectionsMap = new Map();
    for (const entry of sourceEntries.rows) {
      if (!sectionsMap.has(entry.section)) {
        sectionsMap.set(entry.section, []);
      }
      sectionsMap.get(entry.section).push({
        day: entry.day_of_week,
        start_time: entry.start_time,
        end_time: entry.end_time,
        course_name: entry.course_name,
        location: entry.location,
        instructor: entry.instructor,
        type: entry.type,
        is_quiz: entry.is_quiz
      });
    }
    
    const results = [];
    for (const [section, entries] of sectionsMap) {
      const result = await Timetable.bulkInsert(section, entries, targetDeptId);
      results.push({ section, count: result.count });
    }
    
    res.json({
      message: 'Timetable copied successfully',
      sections: results.map(r => r.section),
      count: results.reduce((acc, r) => acc + r.count, 0)
    });
  } catch (error) {
    console.error('Error copying timetable:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTimetableBySection,
  getTimetableByDepartment,  // ✅ جديد
  uploadTimetableExcel,
  uploadTimetableAllSections,
  addTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  deleteTimetableBySection,
  getAllTimetables,
  getAllTimetablesGrouped,
  toggleHideEntry,
  hideAllSectionsByDay,
  showAllSectionsByDay,
  copyTimetableBetweenDepartments
};