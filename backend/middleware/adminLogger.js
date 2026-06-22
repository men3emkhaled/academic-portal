const AdminLog = require('../models/AdminLog');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Middleware لتسجيل كل عمليات الأدمن تلقائياً
 * يعمل بعد انتهاء الـ request ويسجل النتيجة
 */

// تحديد الـ module والـ action من الـ route
const resolveRouteInfo = (method, path) => {
  const normalizedPath = path.replace(/\/\d+/g, '/:id').replace(/\/[a-f0-9-]{36}/g, '/:uuid');
  
  const routeMap = [
    // Students
    { pattern: /\/admin\/students.*upload/i, module: 'Students', action: 'Upload Students Excel' },
    { pattern: /\/admin\/students\/.*\/role/i, module: 'Students', action: 'Update Student Role' },
    { pattern: /\/admin\/students\/.*\/reset-password/i, module: 'Students', action: 'Reset Student Password' },
    { pattern: /\/admin\/students\/.*\/section/i, module: 'Students', action: 'Update Student Section' },
    { pattern: /\/admin\/students\/.*\/courses/i, module: 'Student Courses', action: `${method === 'POST' ? 'Add' : method === 'DELETE' ? 'Remove' : 'View'} Student Course` },
    { pattern: /\/admin\/students/i, module: 'Students', action: `${method === 'POST' ? 'Create' : method === 'PUT' ? 'Update' : method === 'DELETE' ? 'Delete' : 'View'} Student` },
    
    // Courses
    { pattern: /\/courses/i, module: 'Courses', action: `${method === 'POST' ? 'Create' : method === 'PUT' ? 'Update' : method === 'DELETE' ? 'Delete' : 'View'} Course` },
    
    // Grades
    { pattern: /\/grades.*upload/i, module: 'Grades', action: 'Upload Grades' },
    { pattern: /\/grades.*update-single/i, module: 'Grades', action: 'Update Single Grade' },
    { pattern: /\/grades/i, module: 'Grades', action: `${method === 'POST' ? 'Upload' : method === 'PUT' ? 'Update' : method === 'DELETE' ? 'Delete' : 'View'} Grades` },
    
    // Timetable
    { pattern: /\/timetable.*section/i, module: 'Timetable', action: 'Delete Section Timetable' },
    { pattern: /\/timetable.*upload/i, module: 'Timetable', action: 'Upload Timetable' },
    { pattern: /\/timetable/i, module: 'Timetable', action: `${method === 'POST' ? 'Create' : method === 'PUT' ? 'Update' : method === 'DELETE' ? 'Delete' : 'View'} Timetable Entry` },
    
    // Notifications
    { pattern: /\/notifications/i, module: 'Notifications', action: `${method === 'POST' ? 'Send' : method === 'PUT' ? 'Update' : method === 'DELETE' ? 'Delete' : 'View'} Notification` },
    
    // Quizzes
    { pattern: /\/quizzes.*questions/i, module: 'Quizzes', action: `${method === 'POST' ? 'Add' : method === 'PUT' ? 'Update' : method === 'DELETE' ? 'Delete' : 'View'} Question` },
    { pattern: /\/quizzes.*publish/i, module: 'Quizzes', action: 'Toggle Quiz Publish' },
    { pattern: /\/quizzes.*review/i, module: 'Quizzes', action: 'Review Quiz Answers' },
    { pattern: /\/quizzes.*grade/i, module: 'Quizzes', action: 'Grade Written Answer' },
    { pattern: /\/quizzes/i, module: 'Quizzes', action: `${method === 'POST' ? 'Create' : method === 'PUT' ? 'Update' : method === 'DELETE' ? 'Delete' : 'View'} Quiz` },
    
    // Resources
    { pattern: /\/resources/i, module: 'Resources', action: `${method === 'POST' ? 'Upload' : method === 'PUT' ? 'Update' : method === 'DELETE' ? 'Delete' : 'View'} Resource` },
    
    // Roadmap
    { pattern: /\/roadmap/i, module: 'Roadmap', action: `${method === 'POST' ? 'Create' : method === 'PUT' ? 'Update' : method === 'DELETE' ? 'Delete' : 'View'} Roadmap` },
    
    // Departments
    { pattern: /\/departments/i, module: 'Departments', action: `${method === 'POST' ? 'Create' : method === 'PUT' ? 'Update' : method === 'DELETE' ? 'Delete' : 'View'} Department` },
    
    // Events
    { pattern: /\/events/i, module: 'Events', action: `${method === 'POST' ? 'Create' : method === 'PUT' ? 'Update' : method === 'DELETE' ? 'Delete' : 'View'} Event` },
    
    // Progress
    { pattern: /\/progress.*toggle/i, module: 'Progress', action: 'Toggle Progress Item' },
    { pattern: /\/progress/i, module: 'Progress', action: `${method === 'POST' ? 'Add' : method === 'PUT' ? 'Update' : method === 'DELETE' ? 'Delete' : 'View'} Progress Item` },
    
    // Admin Auth
    { pattern: /\/admin\/login/i, module: 'Auth', action: 'Admin Login' },
  ];

  for (const route of routeMap) {
    if (route.pattern.test(path)) {
      return { module: route.module, action: route.action };
    }
  }

  return { module: 'Other', action: `${method} ${normalizedPath}` };
};

// استخراج تفاصيل ذات صلة من الـ request body
const extractDetails = (method, path, body, params) => {
  const details = {};
  
  if (params) {
    if (params.id) details.targetId = params.id;
    if (params.studentId) details.studentId = params.studentId;
    if (params.courseId) details.courseId = params.courseId;
    if (params.quizId) details.quizId = params.quizId;
  }

  if (body && method !== 'GET') {
    // لا نحفظ كلمات المرور أبداً
    const safeBody = { ...body };
    delete safeBody.password;
    delete safeBody.newPassword;
    delete safeBody.token;
    
    // نحتفظ بأهم الحقول فقط
    if (safeBody.name) details.name = safeBody.name;
    if (safeBody.title) details.title = safeBody.title;
    if (safeBody.course_id) details.courseId = safeBody.course_id;
    if (safeBody.student_id) details.studentId = safeBody.student_id;
    if (safeBody.role) details.role = safeBody.role;
    if (safeBody.permissions) details.permissions = safeBody.permissions;
    if (safeBody.section) details.section = safeBody.section;
    if (safeBody.level) details.level = safeBody.level;
    if (safeBody.examType) details.examType = safeBody.examType;
    if (safeBody.content) details.contentPreview = safeBody.content?.substring(0, 100);
  }

  return details;
};

/**
 * Middleware الرئيسي لتسجيل أنشطة الأدمن
 * يُستخدم على كل الـ admin routes
 */
const adminActivityLogger = (req, res, next) => {
  // تجاهل GET requests
  if (req.method === 'GET') {
    return next();
  }

  // تجاهل الـ login endpoint و admin-logs routes
  if (req.originalUrl.includes('/admin/login') || req.originalUrl.includes('/admin-logs')) {
    return next();
  }

  // نحتفظ بالـ original res.json لنلتقط الاستجابة
  const originalJson = res.json.bind(res);
  
  res.json = function(data) {
    // بعد ما الـ response جاهز → نسجل الـ log
    setImmediate(async () => {
      try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        let adminId = 'unknown';
        let adminName = 'Unknown';
        let adminRole = 'admin';

        if (token) {
          try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            adminId = decoded.id || 'unknown';
            adminRole = decoded.role || 'admin';
            
            // لو root admin
            if (adminId === 'admin_user') {
              adminName = 'Root Admin';
            } else {
              // محاولة جلب اسم الأدمن/المساعد
              try {
                const db = require('../config/database');
                const result = await db.query('SELECT name FROM students WHERE id = $1', [adminId]);
                adminName = result.rows[0]?.name || `Admin ${adminId}`;
              } catch {
                adminName = `Admin ${adminId}`;
              }
            }
          } catch {
            // Token غير صالح
          }
        }

        const { module, action } = resolveRouteInfo(req.method, req.originalUrl);
        const details = extractDetails(req.method, req.originalUrl, req.body, req.params);

        await AdminLog.create({
          adminId,
          adminName,
          adminRole,
          action,
          module,
          details,
          method: req.method,
          endpoint: req.originalUrl,
          ipAddress: req.ip || req.connection?.remoteAddress,
          statusCode: res.statusCode
        });
      } catch (error) {
        logger.error({ err: error.message }, 'Activity log error (non-blocking)');
      }
    });

    return originalJson(data);
  };

  next();
};

/**
 * تسجيل عملية Login ناجحة بشكل خاص
 */
const logAdminLogin = async (req, adminId, adminName, adminRole) => {
  try {
    await AdminLog.create({
      adminId,
      adminName,
      adminRole,
      action: 'Login',
      module: 'Auth',
      details: { username: req.body?.username },
      method: 'POST',
      endpoint: '/api/admin/login',
      ipAddress: req.ip || req.connection?.remoteAddress,
      statusCode: 200
    });
  } catch (error) {
    logger.error({ err: error.message }, 'Login log error');
  }
};

module.exports = { adminActivityLogger, logAdminLogin };
