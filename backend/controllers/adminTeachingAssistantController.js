const TeachingAssistant = require('../models/TeachingAssistant');

const getAllTAs = async (req, res) => {
    try {
        const tas = await TeachingAssistant.getAll();
        res.json(tas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createTA = async (req, res) => {
    try {
        const { name, email, password, department_id, phone } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }

        const existing = await TeachingAssistant.findByEmail(email);
        if (existing) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const ta = await TeachingAssistant.create(name, email, password, department_id, phone);
        res.status(201).json(ta);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateTA = async (req, res) => {
    try {
        const { id } = req.params;
        const ta = await TeachingAssistant.update(id, req.body);
        if (!ta) return res.status(404).json({ message: 'Teaching assistant not found' });
        res.json(ta);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteTA = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await TeachingAssistant.delete(id);
        if (!result) return res.status(404).json({ message: 'Teaching assistant not found' });
        res.json({ message: 'Teaching assistant deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTACourses = async (req, res) => {
    try {
        const { id } = req.params;
        const courses = await TeachingAssistant.getTACourses(id);
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const assignCourseToTA = async (req, res) => {
    try {
        const { id, courseId } = req.params;

        const existing = await TeachingAssistant.assignCourse(id, courseId);
        if (!existing) {
            return res.status(400).json({ message: 'Course already assigned to this TA' });
        }

        res.status(201).json({ message: 'Course assigned successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const removeCourseFromTA = async (req, res) => {
    try {
        const { id, courseId } = req.params;
        await TeachingAssistant.removeCourse(id, courseId);
        res.json({ message: 'Course removed from TA' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllTAs, createTA, updateTA, deleteTA,
    getTACourses, assignCourseToTA, removeCourseFromTA,
};
