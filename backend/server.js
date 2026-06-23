const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();
const fs = require('fs');

const logger = require('./utils/logger');

// Sentry — initialize early to catch startup errors
let Sentry;
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  Sentry = require('@sentry/node');
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.1,
  });
  logger.info('Sentry initialized for production error tracking');
}

// Security: Crash on missing critical secrets at startup
const REQUIRED_SECRETS = ['JWT_SECRET'];
if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
  REQUIRED_SECRETS.push('DATABASE_URL');
}
for (const secret of REQUIRED_SECRETS) {
  if (!process.env[secret]) {
    logger.fatal({ secret }, `Missing required environment variable: ${secret}`);
    process.exit(1);
  }
}

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
const doctorRoutes = require('./routes/doctorRoutes');
const quizRoutes = require('./routes/quizRoutes');
const courseProgressRoutes = require('./routes/courseProgressRoutes');
const adminLogRoutes = require('./routes/adminLogRoutes');
const { adminActivityLogger } = require('./middleware/adminLogger');
const { cacheMiddleware } = require('./middleware/cache');
const AdminLog = require('./models/AdminLog');
const StudentLog = require('./models/StudentLog');
const studentLogRoutes = require('./routes/studentLogRoutes');
const OfficialTask = require('./models/OfficialTask');

const {
  standardLimiter,
  studentLoginLimiter,
  adminLoginLimiter,
  doctorLoginLimiter,
  forgotPasswordLimiter,
  inquiriesLimiter,
  courseRegisterLimiter,
  registerBulkLimiter,
} = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy — must equal the actual number of proxies in front of the server
app.set('trust proxy', 1);

// Pino HTTP request logging
const pinoHttp = require('pino-http')({
  logger,
  autoLogging: {
    ignore: (req) => req.url === '/api/health',
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      userId: req.raw?.user?.id || req.raw?.student?.id || null,
      ip: req.ip,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});
app.use(pinoHttp);

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://znu-cs.online',
  'https://www.znu-cs.online',
  /^https:\/\/academic-portal-.*\.vercel\.app$/,
  /^https:\/\/academic-portal-.*-projects\.vercel\.app$/,
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

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
      logger.warn({ origin }, 'CORS blocked');
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};

// Security: Explicit helmet configuration with hardened headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com", "https://apis.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'", "https://graph.microsoft.com", "https://www.googleapis.com", "https://*.supabase.co"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      frameSrc: ["'self'", "https://accounts.google.com"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  crossOriginEmbedderPolicy: false,
}));
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Apply standard limiter to all /api routes
app.use('/api', standardLimiter);

// Apply strict limiters on login endpoints
app.use('/api/student/login', studentLoginLimiter);
app.use('/api/admin/login', adminLoginLimiter);
app.use('/api/doctor/login', doctorLoginLimiter);
app.use('/api/student/forgot-password', forgotPasswordLimiter);
app.use('/api/student/inquiries', inquiriesLimiter);
app.use('/api/student/registration/register', courseRegisterLimiter);
app.use('/api/student/registration/register-bulk', registerBulkLimiter);

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Security: Protect uploads with JWT token + path traversal prevention
const jwt = require('jsonwebtoken');
app.use('/uploads', (req, res, next) => {
  const token = req.query.token || req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Authentication required to access files' });
  }
  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  const requestedPath = path.resolve(path.join(__dirname, 'uploads', req.path));
  const uploadsRoot = path.resolve(path.join(__dirname, 'uploads'));
  if (!requestedPath.startsWith(uploadsRoot)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  next();
}, express.static(path.join(__dirname, 'uploads')));

// ============= Routes =============
app.use('/api/admin', adminActivityLogger);
const { invalidateOnWrite } = require('./middleware/cache');
app.use('/api/admin', invalidateOnWrite(['/api/courses', '/api/timetable', '/api/departments']));
app.use('/api/courses', adminActivityLogger);
app.use('/api/grades', adminActivityLogger);
app.use('/api/timetable', adminActivityLogger);
app.use('/api/notifications', adminActivityLogger);
app.use('/api/resources', adminActivityLogger);
app.use('/api/roadmap', adminActivityLogger);
app.use('/api/departments', adminActivityLogger);
app.use('/api/events', adminActivityLogger);
app.use('/api/progress', adminActivityLogger);

app.use('/api/courses', cacheMiddleware(3600), courseRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/resources', cacheMiddleware(3600), resourceRoutes);
app.use('/api/roadmap', cacheMiddleware(600), roadmapRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/timetable', cacheMiddleware(1800), timetableRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/departments', cacheMiddleware(3600), departmentRoutes);
app.use('/api/student/personal-tasks', personalTaskRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/progress', courseProgressRoutes);
app.use('/api/official-tasks', adminActivityLogger);
app.use('/api/admin-logs', adminLogRoutes);
app.use('/api/student-logs', studentLogRoutes);
app.use('/api/exams', examScheduleRoutes);
app.use('/api/official-tasks', officialTaskRoutes);
app.use('/api/doctor', doctorRoutes);

const taRoutes = require('./routes/taRoutes');
app.use('/api/ta', taRoutes);

const materialHubRoutes = require('./routes/materialHubRoutes');
app.use('/api/material-hub', materialHubRoutes);

const aiRoutes = require('./routes/aiRoutes');
app.use('/api/ai', aiRoutes);

const internshipRoutes = require('./routes/internshipRoutes');
app.use('/api/internships', internshipRoutes);

// Enhanced health check
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'ok',
    database: 'disconnected',
    redis: 'disconnected',
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
  };

  try {
    const db = require('./config/database');
    await db.query('SELECT 1');
    health.database = 'connected';
  } catch (error) {
    health.status = 'degraded';
    logger.error({ err: error.message }, 'Health check — DB unreachable');
  }

  try {
    const { redis } = require('./utils/cache');
    await redis.ping();
    health.redis = 'connected';
  } catch (error) {
    logger.warn({ err: error.message }, 'Health check — Redis unreachable');
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

app.get('/api/app/version', (req, res) => {
  res.json({
    latest_version: process.env.APP_LATEST_VERSION || '1.0.0',
    apk_url: process.env.APP_APK_URL || '',
    release_notes: process.env.APP_RELEASE_NOTES || 'Bug fixes and improvements',
    force_update: process.env.APP_FORCE_UPDATE === 'true',
  });
});

if (process.env.NODE_ENV !== 'production') {
  app.get('/api/db-test', async (req, res) => {
    const { Pool } = require('pg');
    let pool;
    try {
      if (process.env.DATABASE_URL) {
        pool = new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false },
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
  logger.warn({ url: req.originalUrl, method: req.method }, 'Route not found');
  res.status(404).json({ message: 'Route not found' });
});

// Sentry error handler — must be before the generic error handler (v7 API)
if (Sentry) {
  app.use(Sentry.Handlers.errorHandler());
}

// Error handler — standardized format
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.isOperational
    ? err.message
    : (process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message);

  if (!err.isOperational) {
    logger.error({ err, statusCode, url: req.originalUrl }, 'Unexpected error');
  }

  res.status(statusCode).json({
    success: false,
    error: { message, code, ...(process.env.NODE_ENV !== 'production' && err.isOperational ? {} : {}) },
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

const server = app.listen(PORT, async () => {
  logger.info({ port: PORT }, 'Server starting');

  await AdminLog.ensureTable();
  await StudentLog.initializeTable();
  await OfficialTask.initializeTable();
  await require('./models/Notification').initializeTable();

  logger.info({ port: PORT }, `Server running on port ${PORT}`);
  logger.info(`API available at http://localhost:${PORT}/api`);
  logger.info(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = server;
