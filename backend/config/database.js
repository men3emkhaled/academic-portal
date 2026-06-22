const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const logger = require('../utils/logger');

const isProduction = process.env.NODE_ENV === 'production';
const poolMax = parseInt(process.env.DB_POOL_MAX, 10) || (isProduction ? 25 : 10);

let poolConfig;

if (process.env.DATABASE_URL) {
    const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false';
    poolConfig = {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized },
        max: poolMax,
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 5000,
        statement_timeout: 15000,
        allowExitOnIdle: true,
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
        max: poolMax,
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 5000,
        statement_timeout: 15000,
        allowExitOnIdle: true,
    };
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
    logger.error({ err }, 'Unexpected PostgreSQL pool error');
});

const queryWithTimeout = async (text, params, timeout = 10000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
        const result = await pool.query(text, params);
        return result;
    } catch (err) {
        if (controller.signal.aborted) {
            throw new Error(`Query timed out after ${timeout}ms: ${text.slice(0, 80)}`);
        }
        throw err;
    } finally {
        clearTimeout(timer);
    }
};

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

let keepAliveTimer;
const startKeepAlive = () => {
    if (!isProduction) return;
    keepAliveTimer = setInterval(async () => {
        try {
            await pool.query('SELECT 1');
        } catch {
            // ignore keepalive failures
        }
    }, 15000);
};
startKeepAlive();

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
    query: (text, params) => queryWithTimeout(text, params),
    pool,
    getActiveSemester,
};
