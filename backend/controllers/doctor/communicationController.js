const Doctor = require('../../models/Doctor');
const db = require('../../config/database');

const getAnnouncements = async (req, res) => {
    try {
        const { courseId } = req.params;
        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, courseId);
        if (!hasAccess) return res.status(403).json({ message: 'Access denied' });

        const result = await db.query(
            'SELECT * FROM course_announcements WHERE course_id = $1 ORDER BY created_at DESC',
            [courseId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createAnnouncement = async (req, res) => {
    try {
        const { courseId, title, content } = req.body;
        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, courseId);
        if (!hasAccess) return res.status(403).json({ message: 'Access denied' });

        const result = await db.query(
            'INSERT INTO course_announcements (course_id, doctor_id, title, content) VALUES ($1, $2, $3, $4) RETURNING *',
            [courseId, req.doctor.id, title, content]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const annResult = await db.query('SELECT course_id FROM course_announcements WHERE id = $1', [id]);
        if (annResult.rows.length === 0) return res.status(404).json({ message: 'Announcement not found' });

        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, annResult.rows[0].course_id);
        if (!hasAccess) return res.status(403).json({ message: 'Access denied' });

        await db.query('DELETE FROM course_announcements WHERE id = $1', [id]);
        res.json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAnnouncements, createAnnouncement, deleteAnnouncement };
