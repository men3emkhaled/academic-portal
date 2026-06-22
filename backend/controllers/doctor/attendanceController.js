const jwt = require('jsonwebtoken');
const Doctor = require('../../models/Doctor');
const db = require('../../config/database');
const XLSX = require('xlsx');
const path = require('path');

const getAttendanceSessions = async (req, res) => {
    try {
        const { courseId } = req.params;
        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, courseId);
        if (!hasAccess) return res.status(403).json({ message: 'Access denied' });

        const result = await db.query(
            'SELECT * FROM attendance_sessions WHERE course_id = $1 ORDER BY date DESC, created_at DESC',
            [courseId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createAttendanceSession = async (req, res) => {
    try {
        const { courseId } = req.body;
        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, courseId);
        if (!hasAccess) return res.status(403).json({ message: 'Access denied' });

        const result = await db.query(
            'INSERT INTO attendance_sessions (course_id, doctor_id, date) VALUES ($1, $2, CURRENT_DATE) RETURNING *',
            [courseId, req.doctor.id]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAttendanceRecords = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const sessionResult = await db.query('SELECT course_id FROM attendance_sessions WHERE id = $1', [sessionId]);
        if (sessionResult.rows.length === 0) return res.status(404).json({ message: 'Session not found' });

        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, sessionResult.rows[0].course_id);
        if (!hasAccess) return res.status(403).json({ message: 'Access denied' });

        const result = await db.query(`
            SELECT ar.id, ar.student_id, ar.status, ar.scanned_at, s.name as student_name
            FROM attendance_records ar
            JOIN students s ON ar.student_id = s.id
            WHERE ar.session_id = $1
            ORDER BY ar.scanned_at DESC
        `, [sessionId]);

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const scanAttendance = async (req, res) => {
    try {
        const { sessionId, token } = req.body;

        const sessionResult = await db.query('SELECT course_id FROM attendance_sessions WHERE id = $1', [sessionId]);
        if (sessionResult.rows.length === 0) return res.status(404).json({ message: 'Session not found' });
        const courseId = sessionResult.rows[0].course_id;

        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, courseId);
        if (!hasAccess) return res.status(403).json({ message: 'Access denied' });

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (e) {
            return res.status(400).json({ message: 'Invalid or expired QR Code' });
        }

        if (decoded.course_id != courseId || decoded.type !== 'attendance') {
            return res.status(400).json({ message: 'QR Code is not for this course' });
        }

        const studentId = decoded.student_id;

        const enrollResult = await db.query('SELECT 1 FROM student_courses WHERE student_id = $1 AND course_id = $2', [studentId, courseId]);
        if (enrollResult.rows.length === 0) return res.status(400).json({ message: 'Student not enrolled in this course' });

        try {
            await db.query(
                'INSERT INTO attendance_records (session_id, student_id, status) VALUES ($1, $2, $3)',
                [sessionId, studentId, 'present']
            );
        } catch (err) {
            if (err.code === '23505') {
                return res.status(400).json({ message: 'Student already marked present' });
            }
            throw err;
        }

        const studentData = await db.query('SELECT name FROM students WHERE id = $1', [studentId]);

        res.json({ message: 'Attendance recorded', student: { id: studentId, name: studentData.rows[0]?.name } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const toggleManualAttendance = async (req, res) => {
    try {
        const { sessionId, studentId } = req.body;

        const sessionResult = await db.query('SELECT course_id FROM attendance_sessions WHERE id = $1', [sessionId]);
        if (sessionResult.rows.length === 0) return res.status(404).json({ message: 'Session not found' });

        const courseId = sessionResult.rows[0].course_id;
        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, courseId);
        if (!hasAccess) return res.status(403).json({ message: 'Access denied' });

        const recordResult = await db.query(
            'SELECT id FROM attendance_records WHERE session_id = $1 AND student_id = $2',
            [sessionId, studentId]
        );

        if (recordResult.rows.length > 0) {
            await db.query('DELETE FROM attendance_records WHERE id = $1', [recordResult.rows[0].id]);
            res.json({ message: 'Attendance removed', status: 'absent' });
        } else {
            await db.query(
                'INSERT INTO attendance_records (session_id, student_id, status) VALUES ($1, $2, $3)',
                [sessionId, studentId, 'present']
            );
            res.json({ message: 'Attendance marked', status: 'present' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateAttendanceSession = async (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;

        const sessionResult = await db.query('SELECT course_id FROM attendance_sessions WHERE id = $1', [id]);
        if (sessionResult.rows.length === 0) return res.status(404).json({ message: 'Session not found' });

        const courseId = sessionResult.rows[0].course_id;
        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, courseId);
        if (!hasAccess) return res.status(403).json({ message: 'Access denied' });

        const result = await db.query(
            'UPDATE attendance_sessions SET title = $1 WHERE id = $2 RETURNING *',
            [title, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteAttendanceSession = async (req, res) => {
    try {
        const { id } = req.params;

        const sessionResult = await db.query('SELECT course_id FROM attendance_sessions WHERE id = $1', [id]);
        if (sessionResult.rows.length === 0) return res.status(404).json({ message: 'Session not found' });

        const courseId = sessionResult.rows[0].course_id;
        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, courseId);
        if (!hasAccess) return res.status(403).json({ message: 'Access denied' });

        await db.query('DELETE FROM attendance_records WHERE session_id = $1', [id]);
        await db.query('DELETE FROM attendance_sessions WHERE id = $1', [id]);

        res.json({ message: 'Session deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const exportCourseAttendance = async (req, res) => {
    try {
        const { courseId } = req.params;
        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, courseId);
        if (!hasAccess) return res.status(403).json({ message: 'Access denied' });

        // Get Course Name
        const courseRes = await db.query('SELECT name FROM courses WHERE id = $1', [courseId]);
        const courseName = courseRes.rows[0]?.name || 'Course';

        // Get all students enrolled in this course
        const students = await db.query(`
            SELECT s.id, s.name, s.section
            FROM student_courses sc
            JOIN students s ON sc.student_id = s.id
            WHERE sc.course_id = $1
            ORDER BY s.name
        `, [courseId]);

        // Get all attendance sessions for this course
        const sessions = await db.query(`
            SELECT id, date, title 
            FROM attendance_sessions 
            WHERE course_id = $1 
            ORDER BY date ASC, created_at ASC
        `, [courseId]);

        // Get all attendance records for these sessions
        const records = await db.query(`
            SELECT session_id, student_id, status 
            FROM attendance_records 
            WHERE session_id IN (SELECT id FROM attendance_sessions WHERE course_id = $1)
        `, [courseId]);

        // Create a lookup for records
        const recordLookup = {};
        records.rows.forEach(r => {
            recordLookup[`${r.session_id}_${r.student_id}`] = r.status;
        });

        // Prepare data for Excel
        const data = students.rows.map(student => {
            const row = {
                'Student Name': student.name,
                'Student ID': student.id,
                'Section': student.section
            };

            let presentCount = 0;
            sessions.rows.forEach(session => {
                const dateStr = session.title || new Date(session.date).toLocaleDateString();
                const status = recordLookup[`${session.id}_${student.id}`] || 'Absent';
                row[dateStr] = status;
                if (status.toLowerCase() === 'present') presentCount++;
            });

            row['Total Present'] = presentCount;
            row['Attendance %'] = sessions.rows.length > 0 
                ? Math.round((presentCount / sessions.rows.length) * 100) + '%' 
                : '0%';

            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        res.setHeader('Content-Disposition', `attachment; filename=Attendance_${courseName.replace(/\s+/g, '_')}.xlsx`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        console.error('Export attendance error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAttendanceSessions, createAttendanceSession, getAttendanceRecords, scanAttendance, toggleManualAttendance, updateAttendanceSession, deleteAttendanceSession, exportCourseAttendance };
