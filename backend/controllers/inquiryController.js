const Inquiry = require('../models/Inquiry');
const xss = require('xss');

const createInquiry = async (req, res) => {
    try {
        const { course_id, type, subject, content } = req.body;
        const student_id = req.user.id;

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

        res.status(201).json(inquiry);
    } catch (error) {
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

        if (!reply) {
            return res.status(400).json({ message: 'Reply content is required' });
        }

        const inquiry = await Inquiry.reply(id, xss(reply));
        res.json(inquiry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createInquiry,
    getStudentInquiries,
    getDoctorInquiries,
    replyToInquiry
};
