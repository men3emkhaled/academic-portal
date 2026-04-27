const db = require('./config/database');

const createTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS public.exam_schedules (
            id SERIAL PRIMARY KEY,
            department_id INTEGER REFERENCES public.departments(id) ON DELETE CASCADE,
            course_name VARCHAR(255) NOT NULL,
            exam_type VARCHAR(50) NOT NULL CHECK (exam_type IN ('Practical', 'Final')),
            exam_date DATE NOT NULL,
            start_time TIME NOT NULL,
            end_time TIME NOT NULL,
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `;
    try {
        await db.query(query);
        console.log("Exam schedules table created successfully.");
    } catch (err) {
        console.error("Error creating table:", err);
    } finally {
        process.exit();
    }
};

createTable();
