const RoadmapItem = require('../models/RoadmapItem');

const getAllRoadmapItems = async (req, res) => {
    try {
        const items = await RoadmapItem.findAll();
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getRoadmapItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await RoadmapItem.findById(id);
        if (!item) return res.status(404).json({ message: 'Roadmap item not found' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createRoadmapItem = async (req, res) => {
    try {
        const { title, description, video_url, order_index } = req.body;
        const newItem = await RoadmapItem.create(title, description, video_url, order_index || 0);
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateRoadmapItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, video_url, order_index } = req.body;
        const updated = await RoadmapItem.update(id, title, description, video_url, order_index);
        if (!updated) return res.status(404).json({ message: 'Item not found' });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteRoadmapItem = async (req, res) => {
    try {
        const { id } = req.params;
        await RoadmapItem.delete(id);
        res.json({ message: 'Roadmap item deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllRoadmapItems,
    getRoadmapItemById,
    createRoadmapItem,
    updateRoadmapItem,
    deleteRoadmapItem
};