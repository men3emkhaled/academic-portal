const Course = require('../models/Course');
const Resource = require('../models/Resource');
const xss = require('xss');

// جلب جميع المواد (مع معلومات القسم إذا وجد)
const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.findAll();
        res.json(courses);
    } catch (error) {
        console.error('❌ Error in getAllCourses:', error);
        res.status(500).json({ message: error.message });
    }
};

// جلب المواد حسب الترم الدراسي
const getCoursesBySemester = async (req, res) => {
    try {
        const { semester } = req.params;
        const courses = await Course.findBySemester(semester);
        res.json(courses);
    } catch (error) {
        console.error('❌ Error in getCoursesBySemester:', error);
        res.status(500).json({ message: error.message });
    }
};

const getCoursesByDepartment = async (req, res) => {
    try {
        const { departmentId } = req.params;
        const courses = await Course.findByDepartment(departmentId);
        res.json(courses);
    } catch (error) {
        console.error('❌ Error in getCoursesByDepartment:', error);
        res.status(500).json({ message: error.message });
    }
};

// جلب مادة واحدة بالمعرف مع مواردها
const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.findById(id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        const resources = await Resource.findByCourseId(id);
        res.json({ ...course, resources });
    } catch (error) {
        console.error('❌ Error in getCourseById:', error);
        res.status(500).json({ message: error.message });
    }
};

// إضافة مادة جديدة (مع department_id)
const createCourse = async (req, res) => {
    try {
        console.log('📦 Received body for POST /api/courses:', req.body);
        
        const { name, semester, description, max_score, department_id } = req.body;
        
        // التحقق من الحقول المطلوبة
        if (!name || !semester || !description) {
            return res.status(400).json({ 
                message: 'Missing required fields: name, semester, description' 
            });
        }
        
        // إذا كان department_id غير موجود، يمكنك تعيين قيمة افتراضية (مثلاً 1 لقسم CS)
        // أو إرجاع خطأ إذا كان الحقل مطلوباً
        const finalDepartmentId = department_id || null;
        
        const safeName = xss(name);
        const safeDescription = xss(description);
        
        const course = await Course.create(
            safeName, 
            semester, 
            safeDescription, 
            max_score || 40, 
            finalDepartmentId
        );
        
        res.status(201).json(course);
    } catch (error) {
        console.error('❌ Error in createCourse:', error);
        // إرجاع رسالة خطأ مفصلة للمطور (في بيئة التطوير)
        res.status(500).json({ 
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// تحديث مادة (مع department_id)
const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, semester, description, max_score, department_id } = req.body;
        
        const safeName = name ? xss(name) : undefined;
        const safeDescription = description ? xss(description) : undefined;
        
        const course = await Course.update(
            id, 
            safeName, 
            semester, 
            safeDescription, 
            max_score, 
            department_id
        );
        
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json(course);
    } catch (error) {
        console.error('❌ Error in updateCourse:', error);
        res.status(500).json({ message: error.message });
    }
};

// حذف مادة (مع حذف الموارد المرتبطة)
const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        await Resource.deleteByCourseId(id);
        await Course.delete(id);
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('❌ Error in deleteCourse:', error);
        res.status(500).json({ message: error.message });
    }
};

// تحديث توزيع الدرجات لمادة (اختياري)
const updateGradeDistribution = async (req, res) => {
    try {
        const { id } = req.params;
        const { midterm_max, practical_max, oral_max } = req.body;
        const course = await Course.updateGradeDistribution(id, midterm_max, practical_max, oral_max);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json(course);
    } catch (error) {
        console.error('❌ Error in updateGradeDistribution:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllCourses,
    getCoursesBySemester,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    updateGradeDistribution,
    getCoursesByDepartment
};