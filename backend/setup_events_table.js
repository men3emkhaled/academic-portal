const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const createTableSQL = `
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date TIMESTAMP NOT NULL,
    location VARCHAR(255),
    category VARCHAR(100),
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

async function run() {
    try {
        console.log('Connecting to:', process.env.DATABASE_URL);
        const res = await pool.query(createTableSQL);
        console.log('Table events checked/created successfully');
        
        // Let's insert a test event if none exist
        const check = await pool.query('SELECT COUNT(*) FROM events');
        if (parseInt(check.rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO events (title, description, event_date, location, category)
                VALUES ('Welcome to ZNU', 'Registration and Orientation', CURRENT_TIMESTAMP + interval '1 day', 'Main Hall', 'Academic')
            `);
            console.log('Inserted test event');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

run();
