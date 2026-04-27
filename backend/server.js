const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
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
const departmentRoutes = require('./routes/departmentRoutes');
const personalTaskRoutes = require('./routes/personalTaskRoutes');
const eventRoutes = require('./routes/eventRoutes');
const examScheduleRoutes = require('./routes/examScheduleRoutes');
const officialTaskRoutes = require('./routes/officialTaskRoutes');

// ✅ استيراد مسارات الاختبارات
const quizRoutes = require('./routes/quizRoutes');

// ✅ استيراد مسارات تقدم المواد
const courseProgressRoutes = require('./routes/courseProgressRoutes');

// ✅ استيراد مسارات سجل أنشطة الأدمن
const adminLogRoutes = require('./routes/adminLogRoutes');
const { adminActivityLogger } = require('./middleware/adminLogger');
const AdminLog = require('./models/AdminLog');
const StudentLog = require('./models/StudentLog');
const studentLogRoutes = require('./routes/studentLogRoutes');
const OfficialTask = require('./models/OfficialTask');

// ✅ استيراد معدلات الحد
const {
  standardLimiter,
  studentLoginLimiter,
  adminLoginLimiter,
} = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 5000;

// الثقة بالبروكسي (ضروري لـ Railway و Vercel)
app.set('trust proxy', 1);

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://znu-cs.online',
  'https://www.znu-cs.online',
];

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  return allowedOrigins.some(allowed => {
    if (allowed instanceof RegExp) return allowed.test(origin);
    return allowed === origin;
  });
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.warn(`⛔ CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ تطبيق المحدد العام على جميع مسارات /api
app.use('/api', standardLimiter);

// ✅ تطبيق محددات صارمة على نقاط تسجيل الدخول
app.use('/api/student/login', studentLoginLimiter);
app.use('/api/admin/login', adminLoginLimiter);

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// ✅ أهم سطر: يسمح للمتصفح بالوصول للملفات داخل مجلد uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.originalUrl}`);
  next();
});

// ============= Routes =============
// ✅ تطبيق logger على كل مسارات الأدمن (يسجل POST/PUT/DELETE)
app.use('/api/admin', adminActivityLogger);
app.use('/api/courses', adminActivityLogger);
app.use('/api/grades', adminActivityLogger);
app.use('/api/timetable', adminActivityLogger);
app.use('/api/notifications', adminActivityLogger);
app.use('/api/resources', adminActivityLogger);
app.use('/api/roadmap', adminActivityLogger);
app.use('/api/departments', adminActivityLogger);
app.use('/api/events', adminActivityLogger);
app.use('/api/progress', adminActivityLogger);

app.use('/api/courses', courseRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/student/personal-tasks', personalTaskRoutes);
app.use('/api/events', eventRoutes);

// ✅ إضافة مسارات الاختبارات
app.use('/api/quizzes', quizRoutes);

// ✅ إضافة مسارات تقدم المواد
app.use('/api/progress', courseProgressRoutes);
app.use('/api/official-tasks', adminActivityLogger);

// ✅ إضافة مسارات سجل أنشطة الأدمن
app.use('/api/admin-logs', adminLogRoutes);
app.use('/api/student-logs', studentLogRoutes);

app.use('/api/exams', examScheduleRoutes); // ✅ جديد
app.use('/api/official-tasks', officialTaskRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// App version check for mobile auto-update
app.get('/api/app/version', (req, res) => {
  res.json({
    latest_version: process.env.APP_LATEST_VERSION || '1.0.0',
    apk_url: process.env.APP_APK_URL || '',
    release_notes: process.env.APP_RELEASE_NOTES || 'Bug fixes and improvements',
    force_update: process.env.APP_FORCE_UPDATE === 'true',
  });
});

// DB test (development only)
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/db-test', async (req, res) => {
    const { Pool } = require('pg');
    let pool;
    try {
      if (process.env.DATABASE_URL) {
        pool = new Pool({ 
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false }
        });
      } else {
        pool = new Pool({ 
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
          database: process.env.DB_NAME,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
        });
      }
      const result = await pool.query('SELECT NOW()');
      await pool.end();
      res.json({ success: true, time: result.rows[0] });
    } catch (error) {
      if (pool) await pool.end();
      res.status(500).json({ success: false, error: error.message });
    }
  });
}

// 404 handler
app.use((req, res) => {
  console.log('❌ 404 - Route not found:', req.method, req.originalUrl);
  res.status(404).json({ 
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal Server Error'
    : (err.message || 'Internal Server Error');
  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);

  // ✅ إنشاء جدول الـ logs تلقائياً
  await AdminLog.ensureTable();
  await StudentLog.initializeTable();
  await OfficialTask.initializeTable();

  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Student login: http://localhost:${PORT}/api/student/login`);
  console.log(`👑 Admin login: http://localhost:${PORT}/api/admin/login`);
  console.log(`📋 Admin Logs: http://localhost:${PORT}/api/admin-logs`);
});