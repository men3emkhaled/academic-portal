const { Pool } = require('pg');
require('dotenv').config();

let poolConfig;

if (process.env.DATABASE_URL) {
    // Production (Neon / Supabase / etc.)
    // ✅ Security: Default to validating SSL certs. Set DB_SSL_REJECT_UNAUTHORIZED=false only if your provider requires it.
    const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false';
    poolConfig = {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized },
    };
    if (!rejectUnauthorized) {
        console.warn('⚠️ SSL certificate validation is DISABLED. Set DB_SSL_REJECT_UNAUTHORIZED=true for production.');
    }
} else {
    // Local development
    poolConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'academic_portal',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
    };
}

const pool = new Pool(poolConfig);

// ✅ اختبار الاتصال
pool.connect(async (err, client, release) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
    } else {
        console.log('✅ Connected to PostgreSQL database');
        release();
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS system_settings (
                    key VARCHAR(50) PRIMARY KEY,
                    value VARCHAR(100)
                );
            `);
            await pool.query(`
                INSERT INTO system_settings (key, value)
                VALUES ('active_semester', '2')
                ON CONFLICT (key) DO NOTHING;
            `);
            console.log('✅ System settings table ensured and initialized');
        } catch (dbErr) {
            console.error('❌ Error initializing system settings table:', dbErr.message);
        }
    }
});

const getActiveSemester = async () => {
    try {
        const res = await pool.query("SELECT value FROM system_settings WHERE key = 'active_semester'");
        if (res.rows.length > 0) {
            return parseInt(res.rows[0].value, 10);
        }
    } catch (err) {
        console.error('Error fetching active semester:', err.message);
    }
    return 2; // fallback
};

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
    getActiveSemester,
};