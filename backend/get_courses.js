const db = require('./config/database');

async function run() {
    const depts = await db.query('SELECT * FROM departments');
    console.log("Departments:", depts.rows);
    
    const courses = await db.query('SELECT * FROM courses');
    console.log("Courses:", courses.rows.map(c => ({ id: c.id, name: c.name, department_id: c.department_id })));
    
    process.exit(0);
}

run();
