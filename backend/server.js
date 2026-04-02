const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const courseRoutes = require('./routes/courseRoutes');
const gradeRoutes = require('./routes/gradeRoutes');
const adminRoutes = require('./routes/adminRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ إعدادات CORS المتوافقة مع Netlify (وأي عنوان آخر في التطوير)
const allowedOrigins = [
  'http://localhost:5173',           // التطوير المحلي
  'https://cs-academic-portal.netlify.app/',   // 👈 استبدل برابط Netlify الفعلي
  /\.netlify\.app$/                  // أي رابط netlify.app (regex)
];

app.use(cors({
  origin: function (origin, callback) {
    // السماح بطلبات بدون origin (مثل Postman أو curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(o => o === origin || (o instanceof RegExp && o.test(origin)))) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// دعم preflight requests (OPTIONS)
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// إنشاء مجلد uploads إذا لم يكن موجوداً
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Routes
app.use('/api/courses', courseRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/roadmap', roadmapRoutes);

// مسار تجريبي للصحة
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// معالجة الأخطاء العامة
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ CORS enabled for origins: ${allowedOrigins.join(', ')}`);
});