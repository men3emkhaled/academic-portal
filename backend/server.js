const express = require('express');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs');

const courseRoutes = require('./routes/courseRoutes');
const gradeRoutes = require('./routes/gradeRoutes');
const adminRoutes = require('./routes/adminRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const studentRoutes = require('./routes/studentRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS
app.use(cors({
    origin: ['http://localhost:5173', 'https://cs-academic-portal.netlify.app'],
    credentials: true
}));
app.use(express.json());

// مجلد uploads
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// ✅ Logging middleware
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.originalUrl}`);
    next();
});

// Routes
app.use('/api/courses', courseRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ✅ 404 handler with debugging
app.use((req, res) => {
    console.log('❌ 404 - Route not found:', req.method, req.originalUrl);
    res.status(404).json({ 
        message: `Route ${req.method} ${req.originalUrl} not found`,
        availableRoutes: [
            'GET /api/health',
            'POST /api/student/login',
            'GET /api/student/me',
            'GET /api/grades/my-grades',
            'GET /api/timetable/my-timetable',
            'GET /api/roadmap/tracks'
        ]
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Internal Server Error:', err.message);
    console.error(err.stack);
    res.status(500).json({ 
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
});