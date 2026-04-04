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

app.use(cors());
app.use(express.json());

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// ✅ كل routes تبدأ بـ /api
app.use('/api/courses', courseRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/student', studentRoutes);      // <-- هذا السطر مهم
app.use('/api/timetable', timetableRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  console.log('❌ 404 - Route not found:', req.method, req.originalUrl);
  res.status(404).json({ 
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: [
      'POST /api/student/login',
      'GET /api/student/me',
      'POST /api/student/change-password',
      'GET /api/grades/my-grades',
      'GET /api/health'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API base: http://localhost:${PORT}/api`);
  console.log(`✅ Health: http://localhost:${PORT}/api/health`);
});