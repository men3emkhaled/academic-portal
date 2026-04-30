const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');

const doctorAuth = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'doctor') {
            return res.status(403).json({ message: 'Access denied. Doctor only.' });
        }
        
        // Ensure doctor exists
        const doctor = await Doctor.findById(decoded.id);
        if (!doctor) {
            return res.status(401).json({ message: 'Invalid token. Doctor not found.' });
        }

        req.doctor = doctor;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};

const verifyCourseAccess = async (req, res, next) => {
    const courseId = req.params.courseId || req.body.course_id || req.query.course_id;
    if (!courseId) {
        return res.status(400).json({ message: 'Course ID is required.' });
    }

    try {
        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, courseId);
        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied for this course.' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Error verifying course access.' });
    }
};

module.exports = { doctorAuth, verifyCourseAccess };
