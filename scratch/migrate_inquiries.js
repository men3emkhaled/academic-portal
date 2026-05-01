const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });
const db = require('../backend/config/database');

async function migrate() {
    try {
        console.log('🚀 Starting Inquiry Table Migration...');
        
        await db.query(`
            CREATE TABLE IF NOT EXISTS inquiries (
                id SERIAL PRIMARY KEY,
                student_id VARCHAR REFERENCES students(id) ON DELETE CASCADE,
                course_id INT REFERENCES courses(id) ON DELETE CASCADE,
                type VARCHAR(50) NOT NULL, -- 'question', 'complaint'
                subject VARCHAR(255),
                content TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'replied', 'closed'
                doctor_reply TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                replied_at TIMESTAMP
            )
        `);
        
        console.log('✅ Inquiry table created successfully.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
