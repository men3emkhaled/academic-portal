const db = require('../config/database');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

class Student {
  static async findById(id) {
    const result = await db.query(
      `SELECT s.id, s.name, s.email, s.level, s.section, s.department_id, s.password_hash, s.role, s.permissions,
              d.name as department_name, d.code as department_code
       FROM students s
       LEFT JOIN departments d ON s.department_id = d.id
       WHERE s.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findByUsername(username) {
    const result = await db.query(
      'SELECT * FROM students WHERE id = $1',
      [username]
    );
    return result.rows[0];
  }

  static async create(id, name, password, level = 1, section = null, department_id = null) {
    let finalPassword = password;
    if (password && password !== null && password !== undefined) {
      finalPassword = await bcrypt.hash(password, SALT_ROUNDS);
    }
    const sectionInt = section ? parseInt(section, 10) : null;
    
    const result = await db.query(
      `INSERT INTO students (id, name, password_hash, level, section, department_id) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       ON CONFLICT (id) DO UPDATE SET 
         name = EXCLUDED.name,
         password_hash = COALESCE(EXCLUDED.password_hash, students.password_hash),
         level = EXCLUDED.level,
         section = COALESCE(EXCLUDED.section, students.section),
         department_id = COALESCE(EXCLUDED.department_id, students.department_id)
       RETURNING id, name, level, section, department_id`,
      [id, name, finalPassword, level, sectionInt, department_id]
    );
    return result.rows[0];
  }

  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const result = await db.query(
      'UPDATE students SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id',
      [hashedPassword, id]
    );
    return result.rows[0];
  }

  static async verifyPassword(student, plainPassword) {
    if (!student || !student.password_hash) return false;
    return await bcrypt.compare(plainPassword, student.password_hash);
  }

  static async getAll() {
    const result = await db.query(`
      SELECT s.id, s.name, s.email, s.level, s.section, s.department_id, s.password_hash, s.role, s.permissions,
             d.name as department_name, d.code as department_code
      FROM students s
      LEFT JOIN departments d ON s.department_id = d.id
      ORDER BY s.id
    `);
    return result.rows;
  }

  static async updateSection(id, section) {
    const sectionInt = parseInt(section, 10);
    const result = await db.query(
      'UPDATE students SET section = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [sectionInt, id]
    );
    return result.rows[0];
  }

  static async updateEmail(id, email) {
    const result = await db.query(
      'UPDATE students SET email = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email',
      [email, id]
    );
    return result.rows[0];
  }

  static async updateDepartment(id, department_id) {
    const result = await db.query(
      'UPDATE students SET department_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [department_id, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await db.query('DELETE FROM students WHERE id = $1', [id]);
    return true;
  }

  static async updateRoleAndPermissions(id, role, permissions) {
    const permissionsJson = JSON.stringify(permissions || []);
    const result = await db.query(
      'UPDATE students SET role = $1, permissions = $2::jsonb, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [role, permissionsJson, id]
    );
    return result.rows[0];
  }

  // ✅ تسجيل الطالب تلقائياً في جميع مواد القسم
  static async enrollInDepartmentCourses(studentId, departmentId, client = null) {
    if (!departmentId) return;
    
    const executor = client || db;
    const coursesResult = await executor.query(
      'SELECT id FROM courses WHERE department_id = $1',
      [departmentId]
    );
    
    const courses = coursesResult.rows;
    
    for (const course of courses) {
      await executor.query(
        `INSERT INTO student_courses (student_id, course_id, progress_percentage, status)
         VALUES ($1, $2, 0, 'active')
         ON CONFLICT (student_id, course_id) DO NOTHING`,
        [studentId, course.id]
      );
    }
  }
}

module.exports = Student;