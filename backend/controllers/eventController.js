const Event = require('../models/Event');
const xss = require('xss');

// ============= Student Functions =============
const getUpcomingEvents = async (req, res) => {
    try {
        const events = await Event.getUpcoming();
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ============= Admin Functions =============
const getAllEvents = async (req, res) => {
    try {
        const events = await Event.getAll();
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createEvent = async (req, res) => {
    try {
        const { title, description, event_date, location, category, is_published } = req.body;
        if (!title || !event_date) {
            return res.status(400).json({ message: 'Title and event date are required' });
        }
        const safeTitle = xss(title);
        const safeDescription = description ? xss(description) : null;
        const safeLocation = location ? xss(location) : null;
        const safeCategory = category ? xss(category) : null;
        
        const event = await Event.create({ 
            title: safeTitle, 
            description: safeDescription, 
            event_date, 
            location: safeLocation, 
            category: safeCategory, 
            is_published 
        });
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, event_date, location, category, is_published } = req.body;
        
        const updates = {};
        if (title !== undefined) updates.title = xss(title);
        if (description !== undefined) updates.description = description ? xss(description) : null;
        if (event_date !== undefined) updates.event_date = event_date;
        if (location !== undefined) updates.location = location ? xss(location) : null;
        if (category !== undefined) updates.category = category ? xss(category) : null;
        if (is_published !== undefined) updates.is_published = is_published;
        
        const event = await Event.update(id, updates);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        await Event.delete(id);
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUpcomingEvents,
    getAllEvents,
    createEvent,
    updateEvent,
    deleteEvent
};
