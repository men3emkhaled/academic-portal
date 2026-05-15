const { Pool } = require('pg');
require('dotenv').config();

const poolConfig = process.env.DATABASE_URL ? {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
} : {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'academic_portal',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
};

const pool = new Pool(poolConfig);

async function checkAllTables() {
    try {
        const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        for (const row of tables.rows) {
            console.log(`\n--- Table: ${row.table_name} ---`);
            const columns = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${row.table_name}'`);
            console.log(columns.rows);
        }
    } catch (err) {
        console.error('❌ Error checking database:', err.message);
    } finally {
        await pool.end();
    }
}

checkAllTables();
