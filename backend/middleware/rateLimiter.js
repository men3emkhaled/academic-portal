const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit'); // ✅ استيراد الدالة المساعدة لـ IPv6

// ============= إعدادات عامة =============
const standardLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 1000, // الحد الأقصى: 1000 طلب لكل IP (لضمان عمل لوحة التحكم بسلاسة)
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
    max: 10, // 5 محاولات فاشلة
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
        console.warn(`⚠️ Rate limit exceeded for student login: IP ${req.ip}, username ${req.body.username}`);
        res.status(options.statusCode).json(options.message);
    }
});

// ============= تسجيل دخول الأدمن =============
const adminLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: 'Too many failed admin login attempts. Your IP has been temporarily blocked.'
    },
    handler: (req, res, next, options) => {
        console.error(`🚨 Admin login rate limit exceeded: IP ${req.ip}, username ${req.body.username}`);
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

module.exports = {
    standardLimiter,
    studentLoginLimiter,
    adminLoginLimiter,
    uploadLimiter,
    studentCreationLimiter
};