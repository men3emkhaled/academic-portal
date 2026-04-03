const express = require('express');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs');

// استيراد المسارات (Routes)
const courseRoutes = require('./routes/courseRoutes');
const gradeRoutes = require('./routes/gradeRoutes');
const adminRoutes = require('./routes/adminRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ------------------------------
// 1. إعدادات CORS المتقدمة (آمنة)
// ------------------------------
const allowedOrigins = [
  'http://localhost:5173',
  'https://cs-academic-portal.netlify.app',
  /\.netlify\.app$/,
  // يمكنك إضافة روابط أخرى هنا
];

// دالة مساعدة للتحقق من الأصل المسموح به
const isOriginAllowed = (origin) => {
  if (!origin) return true; // السماح للأدوات مثل Postman
  return allowedOrigins.some(allowed => {
    if (allowed instanceof RegExp) return allowed.test(origin);
    return allowed === origin;
  });
};

// تكوين CORS
const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200, // بعض المتصفحات القديمة تحتاج هذا
};

app.use(cors(corsOptions));

// ------------------------------
// 2. Middleware الأساسية
// ------------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ------------------------------
// 3. إنشاء مجلد الرفع (uploads)
// ------------------------------
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// ------------------------------
// 4. تسجيل المسارات (Routes)
// ------------------------------
app.use('/api/courses', courseRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/roadmap', roadmapRoutes);

// ------------------------------
// 5. نقطة نهاية للصحة (Health Check)
// ------------------------------
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ------------------------------
// 6. التعامل مع المسارات غير الموجودة (404)
// ------------------------------
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ------------------------------
// 7. معالجة الأخطاء العامة (Error Handler)
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
// 8. تشغيل الخادم
// ------------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ CORS enabled for Netlify & localhost`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
});