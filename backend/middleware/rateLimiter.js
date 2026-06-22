const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const logger = require('../utils/logger');

const isDev = process.env.NODE_ENV === 'development';

// ============= إعدادات عامة =============
const standardLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: isDev ? 5000 : 1000, // حد أعلى في التطوير، لكن لا يزال مفعّل
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: 'Too many requests from this IP, please try again after 15 minutes.'
    }
});

// ============= تسجيل دخول الطالب =============
// تم إصلاح مشكلة IPv6 باستخدام ipKeyGenerator
const studentLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: isDev ? 50 : 10, // حد أعلى في التطوير
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: 'Too many failed login attempts. Please try again after 15 minutes.'
    },
    keyGenerator: (req) => {
        // استخدام الدالة الرسمية لضمان توافق IPv4/IPv6
        const ipKey = ipKeyGenerator(req);
        const username = req.body.username || 'unknown';
        return `${ipKey}:${username}`; // مفتاح يجمع بين IP واسم المستخدم
    },
    handler: (req, res, next, options) => {
        logger.warn({ ip: req.ip, username: req.body.username }, 'Rate limit exceeded for student login');
        res.status(options.statusCode).json(options.message);
    }
});

// ============= تسجيل دخول الأدمن =============
const adminLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 20 : 3,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: 'Too many failed admin login attempts. Your IP has been temporarily blocked.'
    },
    handler: (req, res, next, options) => {
        logger.error({ ip: req.ip, username: req.body.username }, 'Admin login rate limit exceeded');
        res.status(options.statusCode).json(options.message);
    }
});

// ============= رفع الملفات (Excel) =============
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // ساعة
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: 'Upload limit reached. Please try again later.'
    },
    keyGenerator: (req) => {
        const adminId = req.user?.id || 'anonymous';
        const ipKey = ipKeyGenerator(req);
        return `${ipKey}:${adminId}`;
    }
});

// ============= إنشاء حساب طالب (رفع Excel) =============
const studentCreationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: 'Student creation limit reached. Please try again after an hour.'
    },
    keyGenerator: (req) => {
        const adminId = req.user?.id || 'anonymous';
        const ipKey = ipKeyGenerator(req);
        return `${ipKey}:${adminId}`;
    }
});

// ============= تسجيل دخول الدكتور =============
const doctorLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 50 : 5,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: 'Too many failed login attempts. Please try again after 15 minutes.'
    },
    keyGenerator: (req) => {
        const ipKey = ipKeyGenerator(req);
        const username = req.body.username || 'unknown';
        return `${ipKey}:${username}`;
    },
    handler: (req, res, next, options) => {
        logger.warn({ ip: req.ip, username: req.body.username }, 'Rate limit exceeded for doctor login');
        res.status(options.statusCode).json(options.message);
    }
});

// ============= forgot-password (منع إغراق البريد الإلكتروني) =============
const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 20 : 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: 'Too many password reset requests. Please try again after 15 minutes.'
    },
    keyGenerator: (req) => {
        const ipKey = ipKeyGenerator(req);
        const studentId = req.body.studentId || 'unknown';
        return `${ipKey}:${studentId}`;
    },
    handler: (req, res, next, options) => {
        logger.warn({ ip: req.ip, studentId: req.body.studentId }, 'Rate limit exceeded for forgot-password');
        res.status(options.statusCode).json(options.message);
    }
});

// ============= الاستفسارات (منع السبام) =============
const inquiriesLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 50 : 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: 'Too many inquiries. Please try again after 15 minutes.'
    },
    keyGenerator: (req) => {
        const ipKey = ipKeyGenerator(req);
        const userId = req.user?.id || 'anonymous';
        return `${ipKey}:${userId}`;
    }
});

// ============= تسجيل المواد (منع الإساءة) =============
const courseRegisterLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 100 : 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: 'Too many registration requests. Please try again after 15 minutes.'
    },
    keyGenerator: (req) => {
        const ipKey = ipKeyGenerator(req);
        const userId = req.user?.id || 'anonymous';
        return `${ipKey}:${userId}`;
    }
});

// ============= التسجيل الجماعي (باستخدام Excel) =============
const registerBulkLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: isDev ? 20 : 2,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: 'Bulk registration limit reached. Please try again after an hour.'
    },
    keyGenerator: (req) => {
        const ipKey = ipKeyGenerator(req);
        const userId = req.user?.id || 'anonymous';
        return `${ipKey}:${userId}`;
    }
});

module.exports = {
    standardLimiter,
    studentLoginLimiter,
    adminLoginLimiter,
    doctorLoginLimiter,
    forgotPasswordLimiter,
    inquiriesLimiter,
    courseRegisterLimiter,
    registerBulkLimiter,
    uploadLimiter,
    studentCreationLimiter
};