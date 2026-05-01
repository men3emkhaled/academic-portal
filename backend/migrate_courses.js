require('dotenv').config();
const db = require('./config/database');

async function migrate() {
    try {
        console.log('Starting migration...');
        
        // 1. Add description to courses
        await db.query(`
            ALTER TABLE courses 
            ADD COLUMN IF NOT EXISTS description TEXT
        `);
        console.log('✅ Added description to courses');

        // 2. Add is_archived to doctor_courses
        await db.query(`
            ALTER TABLE doctor_courses 
            ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false
        `);
        console.log('✅ Added is_archived to doctor_courses');

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
