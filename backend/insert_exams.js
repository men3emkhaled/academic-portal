const db = require('./config/database');

async function run() {
    const exams = [
        { course_name: 'Social Ethical', exam_type: 'Final', exam_date: '2026-05-23', start_time: '09:30:00', end_time: '11:30:00' },
        { course_name: 'Mathematics 2', exam_type: 'Final', exam_date: '2026-06-01', start_time: '09:30:00', end_time: '11:30:00' },
        { course_name: 'Digital Logic Design', exam_type: 'Final', exam_date: '2026-06-03', start_time: '09:30:00', end_time: '11:30:00' },
        { course_name: 'Discrete Mathematics', exam_type: 'Final', exam_date: '2026-06-06', start_time: '09:30:00', end_time: '11:30:00' },
        { course_name: 'Operation Research', exam_type: 'Final', exam_date: '2026-06-08', start_time: '09:30:00', end_time: '11:30:00' },
        { course_name: 'Programming 2', exam_type: 'Final', exam_date: '2026-06-10', start_time: '09:30:00', end_time: '11:30:00' }
    ];

    try {
        for (const exam of exams) {
            await db.query(
                `INSERT INTO public.exam_schedules (department_id, course_name, exam_type, exam_date, start_time, end_time)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [5, exam.course_name, exam.exam_type, exam.exam_date, exam.start_time, exam.end_time]
            );
            console.log(`Inserted ${exam.course_name}`);
        }
    } catch (err) {
        console.error("Error inserting exams:", err);
    } finally {
        process.exit();
    }
}

run();
