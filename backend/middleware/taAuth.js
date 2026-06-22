const jwt = require('jsonwebtoken');
const TeachingAssistant = require('../models/TeachingAssistant');

const taAuth = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'ta') {
            return res.status(403).json({ message: 'Access denied. TA only.' });
        }
        
        const ta = await TeachingAssistant.findById(decoded.id);
        if (!ta) {
            return res.status(401).json({ message: 'Invalid token. TA not found.' });
        }

        req.ta = ta;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};

module.exports = { taAuth };
