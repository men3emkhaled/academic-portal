const { generateToken } = require('../middleware/auth');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Simple admin authentication (you can modify this)
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        
        if (username === adminUsername && password === adminPassword) {
            const token = generateToken(1);
            res.json({ token, message: 'Login successful' });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { login };