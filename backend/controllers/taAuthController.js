const jwt = require('jsonwebtoken');
const TeachingAssistant = require('../models/TeachingAssistant');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const ta = await TeachingAssistant.findByEmail(email);
        if (!ta) {
            return res.status(401).json({ message: 'username_not_found' });
        }

        const isValid = await TeachingAssistant.verifyPassword(ta, password);
        if (!isValid) {
            return res.status(401).json({ message: 'incorrect_password' });
        }

        const token = jwt.sign(
            { id: ta.id, email: ta.email, role: 'ta' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            ta: {
                id: ta.id,
                name: ta.name,
                email: ta.email,
                phone: ta.phone,
                department_id: ta.department_id,
                department_name: ta.department_name,
            },
        });
    } catch (error) {
        console.error('TA login error:', error);
        res.status(500).json({ message: 'Login failed' });
    }
};

const getProfile = async (req, res) => {
    try {
        const ta = await TeachingAssistant.findById(req.ta.id);
        res.json(ta);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { login, getProfile };
