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

async function checkTables() {
    try {
        console.log('--- Checking Students Table ---');
        const studentsTable = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'students'");
        console.log(studentsTable.rows);

        console.log('\n--- Checking Departments Table ---');
        const departmentsTable = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'departments'");
        console.log(departmentsTable.rows);

        console.log('\n--- Checking Student Count ---');
        const studentCount = await pool.query("SELECT COUNT(*) FROM students");
        console.log(studentCount.rows[0]);

        console.log('\n--- Checking Department Count ---');
        const departmentCount = await pool.query("SELECT COUNT(*) FROM departments");
        console.log(departmentCount.rows[0]);

    } catch (err) {
        console.error('❌ Error checking database:', err.message);
    } finally {
        await pool.end();
    }
}

checkTables();
