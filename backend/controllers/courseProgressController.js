const CourseProgress = require('../models/CourseProgress');
const db = require('../config/database');

// ============= Student/Public Functions =============

// جلب الأجزاء المنجزة لمادة (بالـ course_id)
const getProgressByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // جلب اسم المادة
    const courseResult = await db.query('SELECT name FROM courses WHERE id = $1', [courseId]);
    if (courseResult.rows.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }
    const courseName = courseResult.rows[0].name;

    // جلب الأجزاء لكل المواد بنفس الاسم (بغض النظر عن القسم)
    const progress = await CourseProgress.getByCourseName(courseName);

    // حساب الإحصائيات
    const total = progress.length;
    const completed = progress.filter(p => p.is_completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({
      items: progress,
      stats: {
        total,
        completed,
        pending: total - completed,
        percentage
      }
    });
  } catch (error) {
    console.error('Error fetching course progress:', error);
    res.status(500).json({ message: error.message });
  }
};

// ============= Admin Functions =============

// جلب كل الأجزاء مجمعة (للأدمن)
const getAllProgress = async (req, res) => {
  try {
    const progress = await CourseProgress.getAllGrouped();
    res.json(progress);
  } catch (error) {
    console.error('Error fetching all progress:', error);
    res.status(500).json({ message: error.message });
  }
};

// جلب الأجزاء لمادة محددة (للأدمن)
const getProgressByCourseAdmin = async (req, res) => {
  try {
    const { courseId } = req.params;
    const progress = await CourseProgress.getByCourseId(courseId);
    res.json(progress);
  } catch (error) {
    console.error('Error fetching course progress:', error);
    res.status(500).json({ message: error.message });
  }
};

// إضافة جزء جديد
const addProgressItem = async (req, res) => {
  try {
    const { course_id, title, is_completed } = req.body;

    if (!course_id || !title) {
      return res.status(400).json({ message: 'Course ID and title are required' });
    }

    // التحقق من وجود المادة
    const courseCheck = await db.query('SELECT id FROM courses WHERE id = $1', [course_id]);
    if (courseCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const item = await CourseProgress.create(
      course_id,
      title.trim(),
      is_completed !== undefined ? is_completed : true
    );

    res.status(201).json(item);
  } catch (error) {
    console.error('Error adding progress item:', error);
    res.status(500).json({ message: error.message });
  }
};

// تعديل جزء
const updateProgressItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, is_completed } = req.body;

    const item = await CourseProgress.update(id, title, is_completed);
    if (!item) {
      return res.status(404).json({ message: 'Progress item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Error updating progress item:', error);
    res.status(500).json({ message: error.message });
  }
};

// تبديل حالة الإنجاز
const toggleProgressItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await CourseProgress.toggleCompleted(id);
    if (!item) {
      return res.status(404).json({ message: 'Progress item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error toggling progress item:', error);
    res.status(500).json({ message: error.message });
  }
};

// حذف جزء
const deleteProgressItem = async (req, res) => {
  try {
    const { id } = req.params;
    await CourseProgress.delete(id);
    res.json({ message: 'Progress item deleted successfully' });
  } catch (error) {
    console.error('Error deleting progress item:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProgressByCourse,
  getAllProgress,
  getProgressByCourseAdmin,
  addProgressItem,
  updateProgressItem,
  toggleProgressItem,
  deleteProgressItem
};
