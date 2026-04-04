const Timetable = require('../models/Timetable');
const XLSX = require('xlsx');
const fs = require('fs');

// جلب جدول سيكشن معين
const getTimetableBySection = async (req, res) => {
  try {
    const { section } = req.params;
    const timetable = await Timetable.getBySection(section);
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// رفع جدول عن طريق Excel (لسيكشن واحد)
const uploadTimetableExcel = async (req, res) => {
  let filePath = null;
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const { section } = req.body;
    if (!section) {
      return res.status(400).json({ message: 'Section is required' });
    }
    
    filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    const entries = [];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    for (const row of data) {
      let day = row['Day'] || row['day'] || row['DAY'];
      const startTime = row['Start Time'] || row['start_time'] || row['Start'];
      const endTime = row['End Time'] || row['end_time'] || row['End'];
      const courseName = row['Course Name'] || row['course_name'] || row['Course'];
      const location = row['Location'] || row['location'] || row['Hall'] || row['Lab'];
      const instructor = row['Instructor'] || row['instructor'] || row['Dr'] || '';
      const type = row['Type'] || row['type'] || 'Lecture';
      
      if (!day || !courseName) continue;
      
      // توحيد اسم اليوم
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
        course_name: courseName,
        location: location || null,
        instructor: instructor || null,
        type: type
      });
    }
    
    const result = await Timetable.bulkInsert(section, entries);
    
    fs.unlinkSync(filePath);
    res.json({ message: 'Timetable uploaded successfully', count: result.count });
  } catch (error) {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ message: error.message });
  }
};

// ✅ رفع جدول لجميع السكاشن دفعة واحدة (Excel به عمود Section)
const uploadTimetableAllSections = async (req, res) => {
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
    
    const sectionsData = new Map(); // section -> entries[]
    
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
      
      // توحيد اسم اليوم
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
        course_name: courseName,
        location: location || null,
        instructor: instructor || null,
        type: type
      });
    }
    
    const results = [];
    for (const [section, entries] of sectionsData) {
      const result = await Timetable.bulkInsert(section, entries);
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

// إضافة مدخل يدوي
const addTimetableEntry = async (req, res) => {
  try {
    const { section, day_of_week, start_time, end_time, course_name, location, instructor, type } = req.body;
    
    if (!section || !day_of_week || !course_name) {
      return res.status(400).json({ message: 'Section, day, and course name are required' });
    }
    
    const entry = await Timetable.addEntry(section, day_of_week, start_time, end_time, course_name, location, instructor, type);
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// تحديث مدخل
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

// حذف جدول سيكشن كامل
const deleteTimetableBySection = async (req, res) => {
  try {
    const { section } = req.params;
    await Timetable.deleteBySection(section);
    res.json({ message: `Timetable for section ${section} deleted` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// جلب كل الجداول (للـ Admin)
const getAllTimetables = async (req, res) => {
  try {
    const timetables = await Timetable.getAll();
    res.json(timetables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTimetableBySection,
  uploadTimetableExcel,
  uploadTimetableAllSections, // ✅ إضافة الدالة الجديدة
  addTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  deleteTimetableBySection,
  getAllTimetables
};