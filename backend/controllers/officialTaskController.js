const OfficialTask = require('../models/OfficialTask');

const getStudentTasks = async (req, res) => {
    try {
        const tasks = await OfficialTask.getForStudent(req.user.id);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const toggleTaskCompletion = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_completed, submission_url } = req.body;
        const updated = await OfficialTask.toggleComplete(id, req.user.id, is_completed, submission_url);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAdminTasks = async (req, res) => {
    try {
        const tasks = await OfficialTask.getAll();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createOfficialTask = async (req, res) => {
    try {
        const { course_id, title, description, drive_link, deadline, department_id, requires_submission } = req.body;
        const task = await OfficialTask.create(course_id, title, description, drive_link, deadline, department_id, requires_submission);
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateOfficialTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { course_id, title, description, drive_link, deadline, department_id, requires_submission } = req.body;
        const task = await OfficialTask.update(id, course_id, title, description, drive_link, deadline, department_id, requires_submission);
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteOfficialTask = async (req, res) => {
    try {
        const { id } = req.params;
        await OfficialTask.delete(id);
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getStudentTasks,
    toggleTaskCompletion,
    getAdminTasks,
    createOfficialTask,
    updateOfficialTask,
    deleteOfficialTask
};
