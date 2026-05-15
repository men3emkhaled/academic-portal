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

async function fixStudentsTable() {
    try {
        console.log('--- Adding missing columns to students table ---');
        
        await pool.query("ALTER TABLE students ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1");
        await pool.query("ALTER TABLE students ADD COLUMN IF NOT EXISTS department_id INTEGER");
        await pool.query("ALTER TABLE students ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'student'");
        await pool.query("ALTER TABLE students ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb");
        
        // Also check if updated_at exists
        await pool.query("ALTER TABLE students ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");

        console.log('✅ Columns added successfully');

        // Optional: Add foreign key if it doesn't exist
        try {
            await pool.query("ALTER TABLE students ADD CONSTRAINT fk_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL");
            console.log('✅ Foreign key constraint added');
        } catch (fkErr) {
            console.log('Notice: Foreign key already exists or failed to add (safe to ignore)', fkErr.message);
        }

    } catch (err) {
        console.error('❌ Error fixing students table:', err.message);
    } finally {
        await pool.end();
    }
}

fixStudentsTable();
