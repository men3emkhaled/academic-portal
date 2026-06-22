const db = require('./config/database');

async function createTATables() {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // Create teaching_assistants table
        await client.query(`
            CREATE TABLE IF NOT EXISTS teaching_assistants (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('\u2705 teaching_assistants table created or already exists.');

        // Create ta_courses junction table (Many-to-Many)
        await client.query(`
            CREATE TABLE IF NOT EXISTS ta_courses (
                ta_id INTEGER REFERENCES teaching_assistants(id) ON DELETE CASCADE,
                course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
                assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (ta_id, course_id)
            );
        `);
        console.log('\u2705 ta_courses table created or already exists.');

        // Add doctor_id and assistant_id to student_courses
        await client.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'student_courses' AND column_name = 'doctor_id'
                ) THEN
                    ALTER TABLE student_courses ADD COLUMN doctor_id INTEGER REFERENCES doctors(id) ON DELETE SET NULL;
                END IF;
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'student_courses' AND column_name = 'assistant_id'
                ) THEN
                    ALTER TABLE student_courses ADD COLUMN assistant_id INTEGER REFERENCES teaching_assistants(id) ON DELETE SET NULL;
                END IF;
            END $$;
        `);
        console.log('\u2705 Added doctor_id and assistant_id columns to student_courses.');

        await client.query('COMMIT');
        console.log('\uD83C\uDF89 TA setup completed successfully.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('\u274C Error creating TA tables:', error.message);
    } finally {
        client.release();
        process.exit();
    }
}

createTATables();
