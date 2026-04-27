const ExamSchedule = require('../models/ExamSchedule');

const getAllExams = async (req, res) => {
    try {
        const { department_id } = req.query;
        const deptId = department_id ? parseInt(department_id, 10) : null;
        const exams = await ExamSchedule.getAll(deptId);
        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addExam = async (req, res) => {
    try {
        const { department_id, course_name, exam_type, exam_date, start_time, end_time } = req.body;
        if (!department_id || !course_name || !exam_type || !exam_date || !start_time || !end_time) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const exam = await ExamSchedule.add(req.body);
        res.status(201).json(exam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateExam = async (req, res) => {
    try {
        const { id } = req.params;
        const exam = await ExamSchedule.update(id, req.body);
        res.json(exam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteExam = async (req, res) => {
    try {
        const { id } = req.params;
        await ExamSchedule.delete(id);
        res.json({ message: 'Exam schedule deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllExams,
    addExam,
    updateExam,
    deleteExam
};
