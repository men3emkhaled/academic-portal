const db = require('../config/database');
const bcrypt = require('bcryptjs');

const getAllDoctors = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT d.id, d.name, d.email, d.department, d.created_at,
                   (SELECT COUNT(*) FROM doctor_courses dc WHERE dc.doctor_id = d.id) as courses_count
            FROM doctors d
            ORDER BY d.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createDoctor = async (req, res) => {
    try {
        const { name, email, password, department } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }

        // Check if email exists
        const emailCheck = await db.query('SELECT id FROM doctors WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await db.query(
            'INSERT INTO doctors (name, email, password, department) VALUES ($1, $2, $3, $4) RETURNING id, name, email, department, created_at',
            [name, email, hashedPassword, department || null]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, department } = req.body;

        const updates = [];
        const values = [];

        if (name) { updates.push(`name = $${updates.length + 1}`); values.push(name); }
        if (email) { updates.push(`email = $${updates.length + 1}`); values.push(email); }
        if (department !== undefined) { updates.push(`department = $${updates.length + 1}`); values.push(department); }
        
        if (password) { 
            const hashedPassword = await bcrypt.hash(password, 10);
            updates.push(`password = $${updates.length + 1}`); 
            values.push(hashedPassword); 
        }

        if (updates.length === 0) return res.status(400).json({ message: 'No fields to update' });

        const query = `UPDATE doctors SET ${updates.join(', ')} WHERE id = $${updates.length + 1} RETURNING id, name, email, department, created_at`;
        values.push(id);
        
        const result = await db.query(query, values);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Doctor not found' });
        
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        // Cascade manually if not defined in schema
        await db.query('DELETE FROM doctor_courses WHERE doctor_id = $1', [id]);
        
        const result = await db.query('DELETE FROM doctors WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Doctor not found' });
        
        res.json({ message: 'Doctor deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Course Assignment
const getDoctorCourses = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(`
            SELECT c.*, dc.assigned_at 
            FROM courses c
            JOIN doctor_courses dc ON c.id = dc.course_id
            WHERE dc.doctor_id = $1
            ORDER BY c.name
        `, [id]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const assignCourseToDoctor = async (req, res) => {
    try {
        const { id, courseId } = req.params;
        
        // Check if already assigned
        const check = await db.query('SELECT * FROM doctor_courses WHERE doctor_id = $1 AND course_id = $2', [id, courseId]);
        if (check.rows.length > 0) {
            return res.status(400).json({ message: 'Course already assigned to this doctor' });
        }

        await db.query('INSERT INTO doctor_courses (doctor_id, course_id) VALUES ($1, $2)', [id, courseId]);
        res.status(201).json({ message: 'Course assigned successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const removeCourseFromDoctor = async (req, res) => {
    try {
        const { id, courseId } = req.params;
        await db.query('DELETE FROM doctor_courses WHERE doctor_id = $1 AND course_id = $2', [id, courseId]);
        res.json({ message: 'Course removed from doctor' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllDoctors, createDoctor, updateDoctor, deleteDoctor,
    getDoctorCourses, assignCourseToDoctor, removeCourseFromDoctor
};
