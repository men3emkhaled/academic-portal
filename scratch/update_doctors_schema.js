const db = require('../backend/config/database');

async function updateSchema() {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        console.log('🔄 Updating doctors table schema...');
        
        await client.query(`
            ALTER TABLE doctors 
            ADD COLUMN IF NOT EXISTS bio TEXT,
            ADD COLUMN IF NOT EXISTS avatar_url TEXT,
            ADD COLUMN IF NOT EXISTS phone VARCHAR(20)
        `);

        console.log('✅ doctors table updated.');

        await client.query('COMMIT');
        console.log('🎉 Schema update completed successfully.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error updating schema:', error.message);
    } finally {
        client.release();
        process.exit();
    }
}

updateSchema();
