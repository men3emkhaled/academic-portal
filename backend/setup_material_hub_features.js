const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

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

const createTablesSQL = `
CREATE TABLE IF NOT EXISTS material_hub_upvotes (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES material_hub_posts(id) ON DELETE CASCADE,
    student_id CHARACTER VARYING NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, student_id)
);

CREATE TABLE IF NOT EXISTS material_hub_bookmarks (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES material_hub_posts(id) ON DELETE CASCADE,
    student_id CHARACTER VARYING NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, student_id)
);

CREATE TABLE IF NOT EXISTS material_hub_comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES material_hub_posts(id) ON DELETE CASCADE,
    student_id CHARACTER VARYING NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;

async function run() {
    try {
        console.log('Connecting to database...');
        await pool.query(createTablesSQL);
        console.log('Tables for upvotes, bookmarks, and comments checked/created successfully!');
    } catch (err) {
        console.error('Error creating feature tables:', err);
    } finally {
        await pool.end();
    }
}

run();
