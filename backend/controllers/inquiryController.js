const Inquiry = require('../models/Inquiry');
const Notification = require('../models/Notification');
const db = require('../config/database');
const xss = require('xss');

const createInquiry = async (req, res) => {
    try {
        const { course_id, type, subject, content } = req.body;
        const student_id = req.user.id;
        const student_name = req.user.name;

        if (!course_id || !type || !content) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const inquiry = await Inquiry.create(
            student_id,
            course_id,
            type,
            xss(subject || ''),
            xss(content)
        );

        // Notify all doctors assigned to this course
        const doctorsResult = await db.query(
            'SELECT doctor_id FROM doctor_courses WHERE course_id = $1',
            [course_id]
        );
        
        const courseResult = await db.query('SELECT name FROM courses WHERE id = $1', [course_id]);
        const courseName = courseResult.rows[0]?.name || 'Course';

        for (const row of doctorsResult.rows) {
            await Notification.sendToDoctor(
                row.doctor_id,
                `New ${type} received`,
                `${student_name} sent a new ${type} in ${courseName}: "${subject || 'No Subject'}"`
            );
        }

        res.status(201).json(inquiry);
    } catch (error) {
        console.error('Create inquiry error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getStudentInquiries = async (req, res) => {
    try {
        const inquiries = await Inquiry.getForStudent(req.user.id);
        res.json(inquiries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDoctorInquiries = async (req, res) => {
    try {
        const inquiries = await Inquiry.getForDoctor(req.doctor.id);
        res.json(inquiries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const replyToInquiry = async (req, res) => {
    try {
        const { id } = req.params;
        const { reply } = req.body;
        const doctorName = req.doctor.name;

        if (!reply) {
            return res.status(400).json({ message: 'Reply content is required' });
        }

        const inquiry = await Inquiry.reply(id, xss(reply));
        
        // Notify student
        await Notification.sendToStudent(
            inquiry.student_id,
            `Doctor replied to your ${inquiry.type}`,
            `Dr. ${doctorName} replied to your message: "${inquiry.subject || 'No Subject'}"`
        );

        res.json(inquiry);
    } catch (error) {
        console.error('Reply to inquiry error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createInquiry,
    getStudentInquiries,
    getDoctorInquiries,
    replyToInquiry
};
