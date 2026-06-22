const TeachingAssistant = require('../../models/TeachingAssistant');
const db = require('../../config/database');

const getMyTAs = async (req, res) => {
    try {
        const doctorId = req.doctor.id;
        const result = await db.query(`
            SELECT ta.id, ta.name, ta.email, ta.phone, ta.created_at,
                   d.name as department_name,
                   COALESCE(
                       (SELECT COUNT(*) FROM ta_courses tc
                        JOIN doctor_courses dc ON tc.course_id = dc.course_id
                        WHERE tc.ta_id = ta.id AND dc.doctor_id = $1), 0
                   ) as courses_count
            FROM teaching_assistants ta
            LEFT JOIN departments d ON ta.department_id = d.id
            WHERE ta.id IN (
                SELECT tc.ta_id FROM ta_courses tc
                JOIN doctor_courses dc ON tc.course_id = dc.course_id
                WHERE dc.doctor_id = $1
            )
            ORDER BY ta.name
        `, [doctorId]);
        res.json(result.rows);
    } catch (error) {
        if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
            return res.json([]);
        }
        console.error('getMyTAs error:', error);
        res.status(500).json({ message: error.message });
    }
};

const createTA = async (req, res) => {
    try {
        const { name, email, password, phone, department_id } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }
        const existing = await TeachingAssistant.findByEmail(email);
        if (existing) {
            return res.status(400).json({ message: 'Email already in use' });
        }
        const ta = await TeachingAssistant.create(name, email, password, department_id, phone);
        res.status(201).json(ta);
    } catch (error) {
        console.error('createTA error:', error);
        res.status(500).json({ message: error.message });
    }
};

const assignTAToCourse = async (req, res) => {
    try {
        const { taId, courseId } = req.params;
        const doctorId = req.doctor.id;
        const hasCourse = await db.query(
            'SELECT id FROM doctor_courses WHERE doctor_id = $1 AND course_id = $2',
            [doctorId, courseId]
        );
        if (hasCourse.rows.length === 0) {
            return res.status(403).json({ message: 'Access denied to this course' });
        }
        const result = await TeachingAssistant.assignCourse(taId, courseId);
        if (!result) {
            return res.status(400).json({ message: 'TA already assigned to this course' });
        }
        res.json({ message: 'TA assigned to course successfully' });
    } catch (error) {
        console.error('assignTAToCourse error:', error);
        res.status(500).json({ message: error.message });
    }
};

const removeTAFromCourse = async (req, res) => {
    try {
        const { taId, courseId } = req.params;
        const doctorId = req.doctor.id;
        const hasCourse = await db.query(
            'SELECT id FROM doctor_courses WHERE doctor_id = $1 AND course_id = $2',
            [doctorId, courseId]
        );
        if (hasCourse.rows.length === 0) {
            return res.status(403).json({ message: 'Access denied to this course' });
        }
        await TeachingAssistant.removeCourse(taId, courseId);
        res.json({ message: 'TA removed from course' });
    } catch (error) {
        console.error('removeTAFromCourse error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getCourseTAs = async (req, res) => {
    try {
        const { courseId } = req.params;
        const doctorId = req.doctor.id;
        const hasCourse = await db.query(
            'SELECT id FROM doctor_courses WHERE doctor_id = $1 AND course_id = $2',
            [doctorId, courseId]
        );
        if (hasCourse.rows.length === 0) {
            return res.status(403).json({ message: 'Access denied to this course' });
        }
        const tas = await TeachingAssistant.getTAsByCourse(courseId);
        res.json(tas);
    } catch (error) {
        console.error('getCourseTAs error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getMyTAs, createTA, assignTAToCourse, removeTAFromCourse, getCourseTAs };
