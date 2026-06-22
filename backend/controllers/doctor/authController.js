const jwt = require('jsonwebtoken');
const Doctor = require('../../models/Doctor');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const doctor = await Doctor.findByEmail(email);
        if (!doctor) {
            return res.status(401).json({ message: 'username_not_found' });
        }

        const isValid = await Doctor.verifyPassword(doctor, password);
        if (!isValid) {
            return res.status(401).json({ message: 'incorrect_password' });
        }

        const token = jwt.sign(
            { id: doctor.id, role: 'doctor', name: doctor.name },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            message: 'Login successful',
            doctor: { id: doctor.id, name: doctor.name, email: doctor.email }
        });
    } catch (error) {
        console.error('Doctor login error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.doctor.id);
        res.json(doctor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { login, getProfile };
