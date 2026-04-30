const db = require('./config/database');

async function createTables() {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // Create doctors table
        await client.query(`
            CREATE TABLE IF NOT EXISTS doctors (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE,
                password VARCHAR(255) NOT NULL,
                department VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('✅ doctors table created or already exists.');

        // Create doctor_courses table (Many-to-Many)
        await client.query(`
            CREATE TABLE IF NOT EXISTS doctor_courses (
                doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
                course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
                assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (doctor_id, course_id)
            );
        `);

        console.log('✅ doctor_courses table created or already exists.');

        // Insert a dummy doctor for testing
        // Wait, maybe the backend already hashes passwords? Let me check how students handle it.
        // Actually I'll let the user add doctors via UI or script later.
        
        await client.query('COMMIT');
        console.log('🎉 Setup completed successfully.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error creating tables:', error.message);
    } finally {
        client.release();
        process.exit();
    }
}

createTables();
