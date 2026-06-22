const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const logger = require('../utils/logger');

let poolConfig;

if (process.env.DATABASE_URL) {
    const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false';
    poolConfig = {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized },
        max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        statement_timeout: 10000,
    };
    if (!rejectUnauthorized) {
        logger.warn('SSL certificate validation is DISABLED. Set DB_SSL_REJECT_UNAUTHORIZED=true for production.');
    }
} else {
    poolConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'academic_portal',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        statement_timeout: 10000,
    };
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
    logger.error({ err }, 'Unexpected PostgreSQL pool error');
});

pool.connect(async (err, client, release) => {
    if (err) {
        logger.error({ err: err.message }, 'Database connection error');
    } else {
        logger.info('Connected to PostgreSQL database');
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
            logger.info('System settings table ensured and initialized');
        } catch (dbErr) {
            logger.error({ err: dbErr.message }, 'Error initializing system settings table');
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
        logger.error({ err: err.message }, 'Error fetching active semester');
    }
    return 2;
};

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
    getActiveSemester,
};
