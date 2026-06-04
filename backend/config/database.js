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
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
    } else {
        console.log('✅ Connected to PostgreSQL database');
        release();
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
};