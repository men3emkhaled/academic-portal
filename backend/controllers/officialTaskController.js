const OfficialTask = require('../models/OfficialTask');
const Notification = require('../models/Notification');
const db = require('../config/database');

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
        const student_id = req.user.id;
        const student_name = req.user.name;

        const updated = await OfficialTask.toggleComplete(id, student_id, is_completed, submission_url);
        
        // Notify doctors if a task is submitted
        if (is_completed) {
            const taskDetails = await db.query(
                'SELECT ot.title, c.id as course_id, c.name as course_name FROM official_tasks ot JOIN courses c ON ot.course_id = c.id WHERE ot.id = $1',
                [id]
            );
            
            if (taskDetails.rows.length > 0) {
                const { title, course_id, course_name } = taskDetails.rows[0];
                
                const doctorsResult = await db.query(
                    'SELECT doctor_id FROM doctor_courses WHERE course_id = $1',
                    [course_id]
                );
                
                for (const row of doctorsResult.rows) {
                    await Notification.sendToDoctor(
                        row.doctor_id,
                        'New Task Submission',
                        `${student_name} submitted task: "${title}" in ${course_name}`
                    );
                }
            }
        }

        res.json(updated);
    } catch (error) {
        console.error('Toggle task completion error:', error);
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
        
        // Notify doctors assigned to this course
        const doctorsResult = await db.query(
            'SELECT doctor_id FROM doctor_courses WHERE course_id = $1',
            [course_id]
        );
        const courseResult = await db.query('SELECT name FROM courses WHERE id = $1', [course_id]);
        const courseName = courseResult.rows[0]?.name || 'Course';

        for (const row of doctorsResult.rows) {
            await Notification.sendToDoctor(
                row.doctor_id,
                'New Official Task Assigned',
                `Admin assigned a new task: "${title}" in ${courseName}`
            );
        }

        res.status(201).json(task);
    } catch (error) {
        console.error('Create official task error:', error);
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
