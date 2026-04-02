const Course = require('../models/Course');
const Resource = require('../models/Resource');

const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.findAll();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCoursesBySemester = async (req, res) => {
    try {
        const { semester } = req.params;
        const courses = await Course.findBySemester(semester);
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.findById(id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        const resources = await Resource.findByCourseId(id);
        res.json({ ...course, resources });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createCourse = async (req, res) => {
    try {
        const { name, semester, description, max_score } = req.body;
        const course = await Course.create(name, semester, description, max_score);
        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, semester, description, max_score } = req.body;
        const course = await Course.update(id, name, semester, description, max_score);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        await Resource.deleteByCourseId(id);
        await Course.delete(id);
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllCourses,
    getCoursesBySemester,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse
};