// backend/controllers/resourceController.js
const Resource = require('../models/Resource');

const getResourcesByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const resources = await Resource.findByCourseId(courseId);
        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createResource = async (req, res) => {
    try {
        const { courseId, type, title, url } = req.body;
        const resource = await Resource.create(courseId, type, title, url);
        res.status(201).json(resource);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateResource = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, title, url } = req.body;
        const resource = await Resource.update(id, type, title, url);
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