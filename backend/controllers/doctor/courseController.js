const Doctor = require('../../models/Doctor');
const db = require('../../config/database');

const getMyCourses = async (req, res) => {
    try {
        const courses = await Doctor.getDoctorCourses(req.doctor.id);
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createCourse = async (req, res) => {
    try {
        const { name, code, department_id, description } = req.body;
        const course = await Doctor.createCourse(req.doctor.id, name, code, department_id, description);
        res.status(201).json(course);
    } catch (error) {
        console.error('Create course error:', error);
        res.status(500).json({ message: error.message });
    }
};

const updateCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, courseId);
        if (!hasAccess) return res.status(403).json({ message: 'No access to this course' });
        
        const course = await Doctor.updateCourse(courseId, req.body);
        res.json(course);
    } catch (error) {
        console.error('Update course error:', error);
        res.status(500).json({ message: error.message });
    }
};

const toggleArchiveCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { is_archived } = req.body;
        const result = await Doctor.toggleArchiveCourse(req.doctor.id, courseId, is_archived);
        res.json(result);
    } catch (error) {
        console.error('Toggle archive error:', error);
        res.status(500).json({ message: error.message });
    }
};

const assignExistingCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const result = await Doctor.assignCourse(req.doctor.id, courseId);
        res.json(result);
    } catch (error) {
        console.error('Assign course error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getMyCourses, createCourse, updateCourse, toggleArchiveCourse, assignExistingCourse };
