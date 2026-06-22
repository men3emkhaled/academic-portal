const db = require('../../config/database');

const getMyTimetable = async (req, res) => {
    try {
        const Timetable = require('../../models/Timetable');
        const timetable = await Timetable.getByInstructor(req.doctor.name);
        res.json(timetable);
    } catch (error) {
        console.error('Doctor timetable error:', error);
        res.status(500).json({ message: error.message });
    }
};

const addTimetableEntry = async (req, res) => {
    try {
        const { section, day_of_week, start_time, end_time, course_name, location, type, department_id } = req.body;
        const Timetable = require('../../models/Timetable');
        const entry = await Timetable.addEntry(
            section, day_of_week, start_time, end_time, course_name, 
            location, req.doctor.name, type, false, department_id
        );
        res.json(entry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateTimetableEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const Timetable = require('../../models/Timetable');
        const current = await db.query('SELECT instructor FROM timetable WHERE id = $1', [id]);
        if (current.rows.length === 0) return res.status(404).json({ message: 'Entry not found' });
        if (!current.rows[0].instructor.toLowerCase().includes(req.doctor.name.toLowerCase())) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const updated = await Timetable.updateEntry(id, req.body);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteTimetableEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const Timetable = require('../../models/Timetable');
        const current = await db.query('SELECT instructor FROM timetable WHERE id = $1', [id]);
        if (current.rows.length === 0) return res.status(404).json({ message: 'Entry not found' });
        if (!current.rows[0].instructor.toLowerCase().includes(req.doctor.name.toLowerCase())) {
            return res.status(403).json({ message: 'Access denied' });
        }
        await Timetable.deleteEntry(id);
        res.json({ message: 'Entry deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getMyTimetable, addTimetableEntry, updateTimetableEntry, deleteTimetableEntry };
