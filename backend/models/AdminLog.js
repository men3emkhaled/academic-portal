const db = require('../config/database');
const logger = require('../utils/logger');

class AdminLog {
  // إنشاء جدول الـ logs تلقائياً عند بدء السيرفر
  static async ensureTable() {
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS admin_logs (
          id SERIAL PRIMARY KEY,
          admin_id VARCHAR(100) NOT NULL,
          admin_name VARCHAR(255) DEFAULT 'Root Admin',
          admin_role VARCHAR(50) DEFAULT 'admin',
          action VARCHAR(100) NOT NULL,
          module VARCHAR(100) DEFAULT 'Unknown',
          details JSONB DEFAULT '{}'::jsonb,
          method VARCHAR(10) DEFAULT 'GET',
          endpoint VARCHAR(500) DEFAULT '/',
          ip_address VARCHAR(100),
          status_code INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // ✅ تحديث الجدول القديم لو كان موجود من قبل بدون هذه الأعمدة
      try {
        await db.query(`ALTER TABLE admin_logs ADD COLUMN IF NOT EXISTS admin_name VARCHAR(255) DEFAULT 'Root Admin'`);
        await db.query(`ALTER TABLE admin_logs ADD COLUMN IF NOT EXISTS admin_role VARCHAR(50) DEFAULT 'admin'`);
        await db.query(`ALTER TABLE admin_logs ADD COLUMN IF NOT EXISTS module VARCHAR(100) DEFAULT 'Unknown'`);
        await db.query(`ALTER TABLE admin_logs ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}'::jsonb`);
        await db.query(`ALTER TABLE admin_logs ADD COLUMN IF NOT EXISTS method VARCHAR(10) DEFAULT 'GET'`);
        await db.query(`ALTER TABLE admin_logs ADD COLUMN IF NOT EXISTS endpoint VARCHAR(500) DEFAULT '/'`);
        await db.query(`ALTER TABLE admin_logs ADD COLUMN IF NOT EXISTS ip_address VARCHAR(100)`);
        await db.query(`ALTER TABLE admin_logs ADD COLUMN IF NOT EXISTS status_code INTEGER`);
      } catch (alterError) {
        logger.warn({ err: alterError.message }, 'Alter table skipped or failed (safe to ignore)');
      }

      await db.query(`CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id)`);
      await db.query(`CREATE INDEX IF NOT EXISTS idx_admin_logs_module ON admin_logs(module)`);
      await db.query(`CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC)`);
      logger.info('Admin logs table ready');
    } catch (error) {
      logger.error({ err: error.message }, 'Error creating admin_logs table');
      throw new Error('Failed to create admin_logs table: ' + error.message);
    }
  }

  // إضافة log جديد
  static async create({ adminId, adminName, adminRole, action, module, details, method, endpoint, ipAddress, statusCode }) {
    const query = `
      INSERT INTO admin_logs (admin_id, admin_name, admin_role, action, module, details, method, endpoint, ip_address, status_code)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const values = [
      adminId || 'unknown',
      adminName || 'Unknown',
      adminRole || 'admin',
      action,
      module,
      JSON.stringify(details || {}),
      method,
      endpoint,
      ipAddress || null,
      statusCode || null
    ];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  // جلب كل الـ logs مع فلاتر
  static async getAll({ page = 1, limit = 50, adminId, module, action, dateFrom, dateTo } = {}) {
    let whereClause = [];
    let values = [];
    let paramIndex = 1;

    if (adminId) {
      whereClause.push(`admin_id = $${paramIndex++}`);
      values.push(adminId);
    }
    if (module) {
      whereClause.push(`module = $${paramIndex++}`);
      values.push(module);
    }
    if (action) {
      whereClause.push(`action ILIKE $${paramIndex++}`);
      values.push(`%${action}%`);
    }
    if (dateFrom) {
      whereClause.push(`created_at >= $${paramIndex++}`);
      values.push(dateFrom);
    }
    if (dateTo) {
      whereClause.push(`created_at <= $${paramIndex++}`);
      values.push(dateTo);
    }

    const where = whereClause.length > 0 ? `WHERE ${whereClause.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    // عدد إجمالي السجلات
    const countQuery = `SELECT COUNT(*) FROM admin_logs ${where}`;
    const countResult = await db.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // جلب السجلات
    const dataQuery = `
      SELECT * FROM admin_logs 
      ${where}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    values.push(limit, offset);
    const dataResult = await db.query(dataQuery, values);

    return {
      logs: dataResult.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // جلب إحصائيات مختصرة
  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_actions,
        COUNT(DISTINCT admin_id) as unique_admins,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as today_actions,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as week_actions
      FROM admin_logs
    `;
    const result = await db.query(query);
    return result.rows[0];
  }

  // جلب أكثر الأدمنز نشاطاً
  static async getTopAdmins(limit = 10) {
    const query = `
      SELECT 
        admin_id,
        admin_name,
        admin_role,
        COUNT(*) as total_actions,
        MAX(created_at) as last_action
      FROM admin_logs
      GROUP BY admin_id, admin_name, admin_role
      ORDER BY total_actions DESC
      LIMIT $1
    `;
    const result = await db.query(query, [limit]);
    return result.rows;
  }

  // جلب الأنشطة حسب الموديول
  static async getModuleStats() {
    const query = `
      SELECT 
        module,
        COUNT(*) as total_actions,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as today
      FROM admin_logs
      GROUP BY module
      ORDER BY total_actions DESC
    `;
    const result = await db.query(query);
    return result.rows;
  }

  // حذف logs قديمة (أكثر من 90 يوم)
  static async cleanupOld(days = 90) {
    const result = await db.query(
      'DELETE FROM admin_logs WHERE created_at < NOW() - $1::interval',
      [`${days} days`]
    );
    return result.rowCount;
  }
}

module.exports = AdminLog;
