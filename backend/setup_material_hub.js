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

const createTableSQL = `
CREATE TABLE IF NOT EXISTS material_hub_posts (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    student_id CHARACTER VARYING NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    type VARCHAR(10) CHECK (type IN ('lecture', 'exam')),
    caption TEXT,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_size BIGINT,
    status VARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by CHARACTER VARYING REFERENCES students(id) ON DELETE SET NULL,
    reject_reason TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITHOUT TIME ZONE
);
`;

async function run() {
    try {
        console.log('Connecting to database...');
        await pool.query(createTableSQL);
        console.log('Table "material_hub_posts" checked/created successfully');
    } catch (err) {
        console.error('Error creating table:', err);
    } finally {
        await pool.end();
    }
}

run();
