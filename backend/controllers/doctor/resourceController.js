const Doctor = require('../../models/Doctor');
const db = require('../../config/database');

const getMyResources = async (req, res) => {
    try {
        const { courseId } = req.params;
        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, courseId);
        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied for this course' });
        }

        const result = await db.query(
            'SELECT * FROM resources WHERE course_id = $1 ORDER BY type, created_at',
            [courseId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createResource = async (req, res) => {
    try {
        const { courseId, type, title, url, batch } = req.body;
        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, courseId);
        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied for this course' });
        }
        const batchVal = batch ? parseInt(batch, 10) : 2025;
        const result = await db.query(
            'INSERT INTO resources (course_id, type, title, url, batch) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [courseId, type, title, url, batchVal]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateResource = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, title, url, batch } = req.body;
        // Verify resource belongs to doctor's course
        const check = await db.query(
            `SELECT r.id FROM resources r
             JOIN doctor_courses dc ON r.course_id = dc.course_id
             WHERE r.id = $1 AND dc.doctor_id = $2`,
            [id, req.doctor.id]
        );
        if (check.rows.length === 0) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const batchVal = batch !== undefined ? parseInt(batch, 10) : undefined;
        let query = 'UPDATE resources SET type = COALESCE($1, type), title = COALESCE($2, title), url = COALESCE($3, url)';
        const params = [type, title, url];
        if (batchVal !== undefined) {
            query += ', batch = $4 WHERE id = $5 RETURNING *';
            params.push(batchVal, id);
        } else {
            query += ' WHERE id = $4 RETURNING *';
            params.push(id);
        }
        const result = await db.query(query, params);
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteResource = async (req, res) => {
    try {
        const { id } = req.params;
        const check = await db.query(
            `SELECT r.id FROM resources r
             JOIN doctor_courses dc ON r.course_id = dc.course_id
             WHERE r.id = $1 AND dc.doctor_id = $2`,
            [id, req.doctor.id]
        );
        if (check.rows.length === 0) {
            return res.status(403).json({ message: 'Access denied' });
        }
        await db.query('DELETE FROM resources WHERE id = $1', [id]);
        res.json({ message: 'Resource deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getMyResources, createResource, updateResource, deleteResource };
