const OfficialTask = require('../models/OfficialTask');
const Doctor = require('../models/Doctor');
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

const getDoctorTasks = async (req, res) => {
    try {
        const courses = await Doctor.getDoctorCourses(req.doctor.id);
        const courseIds = courses.map(c => c.id);
        const tasks = await OfficialTask.getByCourseIds(courseIds);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createDoctorTask = async (req, res) => {
    try {
        const { course_id, title, description, drive_link, deadline, department_id, requires_submission } = req.body;
        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, course_id);
        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied for this course.' });
        }
        const task = await OfficialTask.create(course_id, title, description, drive_link, deadline, department_id, requires_submission);
        const courseResult = await db.query('SELECT name FROM courses WHERE id = $1', [course_id]);
        const courseName = courseResult.rows[0]?.name || 'Course';
        const studentsResult = await db.query(
            'SELECT student_id FROM student_courses WHERE course_id = $1',
            [course_id]
        );
        for (const row of studentsResult.rows) {
            await Notification.sendToStudent(
                row.student_id,
                'New Official Task',
                `Dr. ${req.doctor.name} assigned a task: "${title}" in ${courseName}`
            );
        }
        res.status(201).json(task);
    } catch (error) {
        console.error('Create doctor official task error:', error);
        res.status(500).json({ message: error.message });
    }
};

const updateDoctorTask = async (req, res) => {
    try {
        const { id } = req.params;
        const existingTask = await db.query('SELECT course_id FROM official_tasks WHERE id = $1', [id]);
        if (existingTask.rows.length === 0) {
            return res.status(404).json({ message: 'Task not found.' });
        }
        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, existingTask.rows[0].course_id);
        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied for this task.' });
        }
        const { course_id, title, description, drive_link, deadline, department_id, requires_submission } = req.body;
        const task = await OfficialTask.update(id, course_id, title, description, drive_link, deadline, department_id, requires_submission);
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteDoctorTask = async (req, res) => {
    try {
        const { id } = req.params;
        const existingTask = await db.query('SELECT course_id FROM official_tasks WHERE id = $1', [id]);
        if (existingTask.rows.length === 0) {
            return res.status(404).json({ message: 'Task not found.' });
        }
        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, existingTask.rows[0].course_id);
        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied for this task.' });
        }
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
    deleteOfficialTask,
    getDoctorTasks,
    createDoctorTask,
    updateDoctorTask,
    deleteDoctorTask
};
