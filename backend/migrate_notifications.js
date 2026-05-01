const db = require('./config/database');

async function migrate() {
    console.log('Starting migration: adding doctor_id to notifications...');
    try {
        await db.query(`
            ALTER TABLE notifications 
            ADD COLUMN doctor_id integer REFERENCES doctors(id) ON DELETE CASCADE;
            
            CREATE INDEX idx_notifications_doctor_id ON notifications(doctor_id);
        `);
        console.log('Migration successful: doctor_id added to notifications.');
    } catch (err) {
        if (err.code === '42701') {
            console.log('Column doctor_id already exists.');
        } else {
            console.error('Migration failed:', err);
        }
    } finally {
        process.exit();
    }
}

migrate();
