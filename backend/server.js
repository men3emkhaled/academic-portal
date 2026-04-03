const express = require('express');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// استيراد المسارات (Routes)
const courseRoutes = require('./routes/courseRoutes');
const gradeRoutes = require('./routes/gradeRoutes');
const adminRoutes = require('./routes/adminRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. إعدادات CORS
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

// 2. Middleware الأساسية
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- هام: تعريف مجلد ملفات الـ React الثابتة ---
// السيرفر سيبحث عن ملفات الـ CSS والـ JS داخل فولدر dist
app.use(express.static(path.join(__dirname, 'dist')));

// 3. إنشاء مجلد الرفع
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// 4. تسجيل مسارات الـ API (يجب أن تكون قبل مسار الـ React)
app.use('/api/courses', courseRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/roadmap', roadmapRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// 5. حل مشكلة الـ 404 والـ PathError (تشغيل الـ Frontend)
// أي مسار لا يبدأ بـ /api سيقوم السيرفر بإرسال ملف الـ index.html
app.get('/{*path}', (req, res) => {
  const indexPath = path.resolve(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // هذه الرسالة تظهر فقط إذا لم تقم بعمل Build للـ Frontend
    res.status(404).send('Frontend build not found. Make sure "dist" folder exists.');
  }
});

// 6. معالجة الأخطاء العامة
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});