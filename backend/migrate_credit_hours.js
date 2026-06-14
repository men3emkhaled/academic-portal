// Migration: Add credit_hours column to courses table
const db = require('./config/database');

async function migrate() {
  try {
    // Add credit_hours column if it doesn't exist
    await db.query(`
      ALTER TABLE courses
      ADD COLUMN IF NOT EXISTS credit_hours integer DEFAULT 3
    `);
    
    console.log('✅ credit_hours column added to courses table (default: 3)');
    
    // Check current courses
    const result = await db.query('SELECT id, name, credit_hours FROM courses ORDER BY id');
    console.log(`📋 ${result.rows.length} courses found:`);
    result.rows.forEach(c => {
      console.log(`   - [${c.id}] ${c.name}: ${c.credit_hours} credit hours`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
