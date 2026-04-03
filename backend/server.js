const express = require('express');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs');
const path = require('path'); // إضافة مكتبة path للتعامل مع المسارات

// استيراد المسارات (Routes)
const courseRoutes = require('./routes/courseRoutes');
const gradeRoutes = require('./routes/gradeRoutes');
const adminRoutes = require('./routes/adminRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ------------------------------
// 1. إعدادات CORS
// ------------------------------
const allowedOrigins = [
  'http://localhost:5173',
  'https://cs-academic-portal.netlify.app',
  /\.netlify\.app$/,
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(allowed => 
      allowed instanceof RegExp ? allowed.test(origin) : allowed === origin
    )) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// ------------------------------
// 2. Middleware الأساسية
// ------------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- هام جداً: تعريف مجلد ملفات الـ React الثابتة ---
// تأكد أن المجلد اسمه 'dist' (إذا كنت تستخدم Vite) أو 'build'
app.use(express.static(path.join(__dirname, 'dist')));

// ------------------------------
// 3. إنشاء مجلد الرفع (uploads)
// ------------------------------
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// ------------------------------
// 4. تسجيل مسارات الـ API
// ------------------------------
app.use('/api/courses', courseRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/roadmap', roadmapRoutes);

// نقطة نهاية للصحة (Health Check)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ------------------------------
// 5. تشغيل الـ Frontend (React Catch-all)
// ------------------------------
// هذا الجزء يحل مشكلة PathError في Express 5 ويقوم بتشغيل واجهة الموقع
app.get('/{*path}', (req, res) => {
  const indexPath = path.resolve(__dirname, 'dist', 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // إذا لم يجد السيرفر ملفات الـ React (تأكد من عمل Build)
    res.status(404).send('Frontend build not found. Please run "npm run build" in your frontend folder.');
  }
});

// ------------------------------
// 6. معالجة الأخطاء العامة (Error Handler)
// ------------------------------
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ------------------------------
// 7. تشغيل الخادم
// ------------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ Production-ready with React support`);
});