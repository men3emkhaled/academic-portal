// backend/controllers/resourceController.js
const db = require('../config/database');
const Resource = require('../models/Resource');
const xss = require('xss');

const getResourcesByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        // 1. جلب اسم المادة المطلوبة
        const courseResult = await db.query(
            'SELECT name FROM courses WHERE id = $1',
            [courseId]
        );
        if (courseResult.rows.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }
        const courseName = courseResult.rows[0].name;

        // 2. جلب جميع الموارد المرتبطة بأي مادة تحمل نفس الاسم (بغض النظر عن القسم)
        const resourcesResult = await db.query(
            `SELECT r.* 
             FROM resources r
             JOIN courses c ON r.course_id = c.id
             WHERE c.name = $1
             ORDER BY r.type, r.created_at`,
            [courseName]
        );

        res.json(resourcesResult.rows);
    } catch (error) {
        console.error('Error fetching resources:', error);
        res.status(500).json({ message: error.message });
    }
};

const createResource = async (req, res) => {
    try {
        const { courseId, type, title, url } = req.body;
        const safeTitle = xss(title);
        const safeUrl = xss(url);
        const resource = await Resource.create(courseId, type, safeTitle, safeUrl);
        res.status(201).json(resource);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateResource = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, title, url } = req.body;
        
        const safeTitle = title ? xss(title) : undefined;
        const safeUrl = url ? xss(url) : undefined;
        
        const resource = await Resource.update(id, type, safeTitle, safeUrl);
        if (!resource) return res.status(404).json({ message: 'Resource not found' });
        res.json(resource);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteResource = async (req, res) => {
    try {
        const { id } = req.params;
        await Resource.delete(id);
        res.json({ message: 'Resource deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getResourcesByCourse, createResource, updateResource, deleteResource };