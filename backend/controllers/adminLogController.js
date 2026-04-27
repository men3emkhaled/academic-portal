const AdminLog = require('../models/AdminLog');

// ✅ التأكد من وجود الجدول قبل أي عملية
let tableReady = false;
const ensureReady = async () => {
  if (!tableReady) {
    await AdminLog.ensureTable();
    tableReady = true;
  }
};

// جلب كل الـ logs مع فلاتر وتصفح
const getLogs = async (req, res) => {
  try {
    await ensureReady();
    const { page, limit, admin_id, module, action, date_from, date_to } = req.query;
    
    const result = await AdminLog.getAll({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
      adminId: admin_id,
      module,
      action,
      dateFrom: date_from,
      dateTo: date_to
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching admin logs:', error);
    res.status(500).json({ message: error.message });
  }
};

// جلب الإحصائيات
const getStats = async (req, res) => {
  try {
    await ensureReady();
    const [stats, topAdmins, moduleStats] = await Promise.all([
      AdminLog.getStats(),
      AdminLog.getTopAdmins(10),
      AdminLog.getModuleStats()
    ]);

    res.json({
      stats,
      topAdmins,
      moduleStats
    });
  } catch (error) {
    console.error('Error fetching log stats:', error);
    res.status(500).json({ message: error.message });
  }
};

// تنظيف logs قديمة
const cleanupLogs = async (req, res) => {
  try {
    await ensureReady();
    const days = parseInt(req.query.days) || 90;
    const deleted = await AdminLog.cleanupOld(days);
    res.json({ message: `Deleted ${deleted} old log entries (older than ${days} days)` });
  } catch (error) {
    console.error('Error cleaning up logs:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLogs, getStats, cleanupLogs };
