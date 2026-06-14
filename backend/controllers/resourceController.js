// backend/controllers/resourceController.js
const db = require('../config/database');
const Resource = require('../models/Resource');
const xss = require('xss');

const getResourcesByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user?.id;

        // 1. جلب اسم المادة المطلوبة
        const courseResult = await db.query(
            'SELECT name FROM courses WHERE id = $1',
            [courseId]
        );
        if (courseResult.rows.length === 0) {
            return res.status(404).json({ message: 'Course not found' });
        }
        const courseName = courseResult.rows[0].name;

        // 2. جلب دفعة الطالب الافتراضية
        let studentBatch = 2025;
        if (studentId) {
            const studentResult = await db.query(
                'SELECT batch FROM students WHERE id = $1',
                [studentId]
            );
            if (studentResult.rows[0]) {
                studentBatch = studentResult.rows[0].batch;
            }
        }

        // 3. تحديد الفلترة بناءً على الـ Query Parameter
        const reqBatch = req.query.batch;
        let resourcesResult;

        if (reqBatch === 'all') {
            resourcesResult = await db.query(
                `SELECT r.* 
                 FROM resources r
                 JOIN courses c ON r.course_id = c.id
                 WHERE c.name = $1
                 ORDER BY r.batch DESC, r.type, r.created_at`,
                [courseName]
            );
        } else {
            const filterBatch = reqBatch ? parseInt(reqBatch, 10) : studentBatch;
            resourcesResult = await db.query(
                `SELECT r.* 
                 FROM resources r
                 JOIN courses c ON r.course_id = c.id
                 WHERE c.name = $1 AND r.batch = $2
                 ORDER BY r.type, r.created_at`,
                [courseName, filterBatch]
            );
        }

        res.json(resourcesResult.rows);
    } catch (error) {
        console.error('Error fetching resources:', error);
        res.status(500).json({ message: error.message });
    }
};

const createResource = async (req, res) => {
    try {
        const { courseId, type, title, url, batch } = req.body;
        const safeTitle = xss(title);
        const safeUrl = xss(url);
        const batchVal = batch ? parseInt(batch, 10) : 2025;
        const resource = await Resource.create(courseId, type, safeTitle, safeUrl, batchVal);
        res.status(201).json(resource);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateResource = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, title, url, batch } = req.body;
        
        const safeTitle = title ? xss(title) : undefined;
        const safeUrl = url ? xss(url) : undefined;
        const batchVal = batch !== undefined ? parseInt(batch, 10) : undefined;
        
        const resource = await Resource.update(id, type, safeTitle, safeUrl, batchVal);
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