require('dotenv').config();
const db = require('./config/database');

async function addEmailColumn() {
  try {
    console.log('Adding email column to students table...');
    await db.query('ALTER TABLE students ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;');
    console.log('✅ Email column added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addEmailColumn();
