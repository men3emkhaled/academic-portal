const db = require('./config/database');

async function run() {
    try {
        // Attempt to find the Aviation department ID dynamically
        let departmentId = null;
        
        // Search by Arabic name first
        const deptResAr = await db.query("SELECT id FROM departments WHERE name LIKE $1", ['%طيران%']);
        if (deptResAr.rows.length > 0) {
            departmentId = deptResAr.rows[0].id;
            console.log(`Found Aviation department with ID: ${departmentId}`);
        } else {
            // Search by English name
            const deptResEng = await db.query("SELECT id FROM departments WHERE name ILIKE $1", ['%Aviation%']);
            if (deptResEng.rows.length > 0) {
                departmentId = deptResEng.rows[0].id;
                console.log(`Found Aviation department with ID: ${departmentId}`);
            }
        }

        // If not found, use a prompt or default ID (you can change this manually if it fails)
        if (!departmentId) {
            console.warn("Aviation department not found automatically, defaulting to ID 6.");
            console.warn("Please change the department_id manually in this script if 6 is incorrect.");
            departmentId = 6; 
        }

        const exams = [
            { course_name: 'Electronic Physics', exam_type: 'Final', exam_date: '2026-05-23', start_time: '09:30:00', end_time: '11:30:00' },
            { course_name: 'Mathematics 2', exam_type: 'Final', exam_date: '2026-06-01', start_time: '09:30:00', end_time: '11:30:00' },
            { course_name: 'Mathematics 1', exam_type: 'Final', exam_date: '2026-06-01', start_time: '12:00:00', end_time: '14:00:00' },
            { course_name: 'Digital Logic Design', exam_type: 'Final', exam_date: '2026-06-03', start_time: '09:30:00', end_time: '11:30:00' },
            { course_name: 'Discrete Mathematics', exam_type: 'Final', exam_date: '2026-06-06', start_time: '09:30:00', end_time: '11:30:00' },
            { course_name: 'Communication Skills', exam_type: 'Final', exam_date: '2026-06-08', start_time: '09:30:00', end_time: '11:30:00' },
            { course_name: 'Programming 1', exam_type: 'Final', exam_date: '2026-06-10', start_time: '09:30:00', end_time: '11:30:00' },
            { course_name: 'Aviation Law 1', exam_type: 'Final', exam_date: '2026-06-13', start_time: '09:30:00', end_time: '11:30:00' },
            { course_name: 'Mathematics Prep', exam_type: 'Final', exam_date: '2026-06-13', start_time: '12:00:00', end_time: '14:00:00' },
            { course_name: 'Air Navigation', exam_type: 'Final', exam_date: '2026-06-15', start_time: '09:30:00', end_time: '11:30:00' }
        ];

        for (const exam of exams) {
            await db.query(
                `INSERT INTO public.exam_schedules (department_id, course_name, exam_type, exam_date, start_time, end_time)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [departmentId, exam.course_name, exam.exam_type, exam.exam_date, exam.start_time, exam.end_time]
            );
            console.log(`Inserted ${exam.course_name} at ${exam.exam_date}`);
        }
        
        console.log("✅ All Aviation exams inserted successfully.");
    } catch (err) {
        console.error("Error inserting exams:", err);
    } finally {
        process.exit();
    }
}

run();
