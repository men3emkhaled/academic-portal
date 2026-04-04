const { Pool } = require('pg');
require('dotenv').config();

console.log('🔧 Initializing database connection...');

let poolConfig;

if (process.env.DATABASE_URL) {
    console.log('📡 Using DATABASE_URL connection string');
    poolConfig = {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
    };
} else {
    console.log('🏠 Using individual database variables');
    poolConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'academic_portal',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        connectionTimeoutMillis: 10000,
    };
}

const pool = new Pool(poolConfig);

// ✅ اختبار الاتصال
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
        console.error('❌ Full error:', err);
    } else {
        console.log('✅ Connected to PostgreSQL database successfully');
        release();
    }
});

// ✅ اختبار الاستعلام
const testQuery = async () => {
    try {
        const result = await pool.query('SELECT NOW() as now, version() as version');
        console.log('✅ Database test query successful:', result.rows[0].now);
    } catch (err) {
        console.error('❌ Database test query failed:', err.message);
    }
};
testQuery();

module.exports = {
    query: async (text, params) => {
        try {
            const result = await pool.query(text, params);
            return result;
        } catch (err) {
            console.error('❌ Query error:', text, err.message);
            throw err;
        }
    },
    pool,
};