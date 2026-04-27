// backend/hashPasswords.js
const db = require('./config/database');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

async function hashExistingPasswords() {
  try {
    const res = await db.query('SELECT id, password_hash FROM students');
    const students = res.rows;
    
    for (const student of students) {
      const plainPassword = student.password_hash;
      // إذا كان الباسورد يبدو مشفراً (يبدأ بـ $2b$) نتخطاه
      if (plainPassword && plainPassword.startsWith('$2b$')) {
        console.log(`✅ Student ${student.id} already hashed`);
        continue;
      }
      const hashed = await bcrypt.hash(plainPassword, SALT_ROUNDS);
      await db.query('UPDATE students SET password_hash = $1 WHERE id = $2', [hashed, student.id]);
      console.log(`🔒 Hashed password for student ${student.id}`);
    }
    console.log('✅ All passwords hashed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

hashExistingPasswords();