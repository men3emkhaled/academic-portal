/**
 * Initial database schema — first migration.
 * Creates all core tables for the Academic Portal.
 */
exports.up = (pgm) => {
  // ── Students ──
  pgm.createTable('students', {
    id: { type: 'varchar(50)', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    name_ar: { type: 'varchar(255)' },
    email: { type: 'varchar(255)', unique: true },
    password: { type: 'varchar(255)' },
    level: { type: 'integer', default: 1 },
    section: { type: 'integer', default: 1 },
    department: { type: 'varchar(100)' },
    semester: { type: 'integer', default: 1 },
    batch: { type: 'integer' },
    gpa: { type: 'numeric(3,2)', default: 0 },
    total_hours: { type: 'integer', default: 0 },
    completed_hours: { type: 'integer', default: 0 },
    phone: { type: 'varchar(20)' },
    avatar_url: { type: 'text' },
    is_graduated: { type: 'boolean', default: false },
    status: { type: 'varchar(20)', default: 'active' },
    require_password_change: { type: 'boolean', default: false },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // ── Admins ──
  pgm.createTable('admins', {
    id: { type: 'serial', primaryKey: true },
    username: { type: 'varchar(50)', unique: true, notNull: true },
    password: { type: 'varchar(255)', notNull: true },
    role: { type: 'varchar(20)', default: 'admin' },
    name: { type: 'varchar(255)' },
    email: { type: 'varchar(255)' },
    avatar_url: { type: 'text' },
    last_login: { type: 'timestamp' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // ── Courses ──
  pgm.createTable('courses', {
    id: { type: 'serial', primaryKey: true },
    code: { type: 'varchar(20)', unique: true, notNull: true },
    name: { type: 'varchar(255)', notNull: true },
    name_ar: { type: 'varchar(255)' },
    description: { type: 'text' },
    credit_hours: { type: 'integer', notNull: true },
    level: { type: 'integer', default: 1 },
    semester: { type: 'integer', default: 1 },
    department: { type: 'varchar(100)' },
    batch: { type: 'integer' },
    schedule: { type: 'jsonb' },
    is_active: { type: 'boolean', default: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // ── Student Courses ──
  pgm.createTable('student_courses', {
    id: { type: 'serial', primaryKey: true },
    student_id: { type: 'varchar(50)', notNull: true, references: 'students(id)', onDelete: 'CASCADE' },
    course_id: { type: 'integer', notNull: true, references: 'courses(id)', onDelete: 'CASCADE' },
    semester: { type: 'integer', default: 1 },
    academic_year: { type: 'varchar(20)' },
    grade: { type: 'varchar(5)' },
    points: { type: 'numeric(3,1)' },
    status: { type: 'varchar(20)', default: 'enrolled' },
    instructor_type: { type: 'varchar(10)' },
    instructor_id: { type: 'integer' },
    enrolled_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
  pgm.addConstraint('student_courses', 'unique_student_course', { unique: ['student_id', 'course_id', 'semester'] });

  // ── Doctors ──
  pgm.createTable('doctors', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    name_ar: { type: 'varchar(255)' },
    email: { type: 'varchar(255)', unique: true, notNull: true },
    password: { type: 'varchar(255)', notNull: true },
    phone: { type: 'varchar(20)' },
    title: { type: 'varchar(100)' },
    department: { type: 'varchar(100)' },
    avatar_url: { type: 'text' },
    is_active: { type: 'boolean', default: true },
    last_login: { type: 'timestamp' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // ── Doctor Courses ──
  pgm.createTable('doctor_courses', {
    id: { type: 'serial', primaryKey: true },
    doctor_id: { type: 'integer', notNull: true, references: 'doctors(id)', onDelete: 'CASCADE' },
    course_id: { type: 'integer', notNull: true, references: 'courses(id)', onDelete: 'CASCADE' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
  pgm.addConstraint('doctor_courses', 'unique_doctor_course', { unique: ['doctor_id', 'course_id'] });

  // ── Teaching Assistants ──
  pgm.createTable('teaching_assistants', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    name_ar: { type: 'varchar(255)' },
    email: { type: 'varchar(255)', unique: true, notNull: true },
    password: { type: 'varchar(255)', notNull: true },
    phone: { type: 'varchar(20)' },
    department: { type: 'varchar(100)' },
    avatar_url: { type: 'text' },
    is_active: { type: 'boolean', default: true },
    last_login: { type: 'timestamp' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // ── TA Courses ──
  pgm.createTable('ta_courses', {
    id: { type: 'serial', primaryKey: true },
    ta_id: { type: 'integer', notNull: true, references: 'teaching_assistants(id)', onDelete: 'CASCADE' },
    course_id: { type: 'integer', notNull: true, references: 'courses(id)', onDelete: 'CASCADE' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
  pgm.addConstraint('ta_courses', 'unique_ta_course', { unique: ['ta_id', 'course_id'] });

  // ── Course Instructor Sections ──
  pgm.createTable('course_instructor_sections', {
    id: { type: 'serial', primaryKey: true },
    course_id: { type: 'integer', notNull: true, references: 'courses(id)', onDelete: 'CASCADE' },
    instructor_type: { type: 'varchar(10)', notNull: true },
    instructor_id: { type: 'integer', notNull: true },
    section: { type: 'varchar(50)', notNull: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
  pgm.addConstraint('course_instructor_sections', 'unique_course_section', { unique: ['course_id', 'section'] });

  // ── Grades ──
  pgm.createTable('grades', {
    id: { type: 'serial', primaryKey: true },
    student_course_id: { type: 'integer', notNull: true, references: 'student_courses(id)', onDelete: 'CASCADE' },
    grade_type: { type: 'varchar(20)', notNull: true },
    grade: { type: 'numeric(5,2)' },
    max_grade: { type: 'numeric(5,2)' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // ── Quizzes ──
  pgm.createTable('quizzes', {
    id: { type: 'serial', primaryKey: true },
    course_id: { type: 'integer', notNull: true, references: 'courses(id)', onDelete: 'CASCADE' },
    created_by_type: { type: 'varchar(10)' },
    created_by_id: { type: 'integer' },
    title: { type: 'varchar(255)', notNull: true },
    description: { type: 'text' },
    duration_minutes: { type: 'integer', default: 30 },
    total_points: { type: 'integer', default: 0 },
    is_active: { type: 'boolean', default: true },
    start_time: { type: 'timestamp' },
    end_time: { type: 'timestamp' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // ── Quiz Questions ──
  pgm.createTable('quiz_questions', {
    id: { type: 'serial', primaryKey: true },
    quiz_id: { type: 'integer', notNull: true, references: 'quizzes(id)', onDelete: 'CASCADE' },
    question_text: { type: 'text', notNull: true },
    question_type: { type: 'varchar(20)', default: 'multiple_choice' },
    options: { type: 'jsonb' },
    correct_answer: { type: 'text' },
    points: { type: 'integer', default: 1 },
    order_index: { type: 'integer', default: 0 },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // ── Quiz Attempts ──
  pgm.createTable('quiz_attempts', {
    id: { type: 'serial', primaryKey: true },
    quiz_id: { type: 'integer', notNull: true, references: 'quizzes(id)', onDelete: 'CASCADE' },
    student_id: { type: 'varchar(50)', notNull: true, references: 'students(id)', onDelete: 'CASCADE' },
    score: { type: 'numeric(5,2)' },
    total_possible: { type: 'numeric(5,2)' },
    submitted_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    time_spent_seconds: { type: 'integer' },
  });

  // ── Quiz Answers ──
  pgm.createTable('quiz_answers', {
    id: { type: 'serial', primaryKey: true },
    attempt_id: { type: 'integer', notNull: true, references: 'quiz_attempts(id)', onDelete: 'CASCADE' },
    question_id: { type: 'integer', notNull: true, references: 'quiz_questions(id)', onDelete: 'CASCADE' },
    answer: { type: 'text' },
    is_correct: { type: 'boolean' },
    points_earned: { type: 'numeric(5,2)' },
    image_url: { type: 'text' },
    reviewed: { type: 'boolean', default: false },
    reviewed_by: { type: 'integer' },
    reviewed_at: { type: 'timestamp' },
  });

  // ── Tasks ──
  pgm.createTable('tasks', {
    id: { type: 'serial', primaryKey: true },
    course_id: { type: 'integer', notNull: true, references: 'courses(id)', onDelete: 'CASCADE' },
    created_by_type: { type: 'varchar(10)' },
    created_by_id: { type: 'integer' },
    title: { type: 'varchar(255)', notNull: true },
    description: { type: 'text' },
    due_date: { type: 'timestamp' },
    max_score: { type: 'integer', default: 100 },
    type: { type: 'varchar(20)', default: 'assignment' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // ── Task Submissions ──
  pgm.createTable('task_submissions', {
    id: { type: 'serial', primaryKey: true },
    task_id: { type: 'integer', notNull: true, references: 'tasks(id)', onDelete: 'CASCADE' },
    student_id: { type: 'varchar(50)', notNull: true, references: 'students(id)', onDelete: 'CASCADE' },
    file_url: { type: 'text' },
    text_content: { type: 'text' },
    score: { type: 'integer' },
    feedback: { type: 'text' },
    status: { type: 'varchar(20)', default: 'submitted' },
    submitted_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    graded_at: { type: 'timestamp' },
    graded_by: { type: 'integer' },
  });

  // ── Attendance Sessions ──
  pgm.createTable('attendance_sessions', {
    id: { type: 'serial', primaryKey: true },
    course_id: { type: 'integer', notNull: true, references: 'courses(id)', onDelete: 'CASCADE' },
    created_by_type: { type: 'varchar(10)' },
    created_by_id: { type: 'integer' },
    title: { type: 'varchar(255)' },
    date: { type: 'date', notNull: true },
    start_time: { type: 'time' },
    end_time: { type: 'time' },
    session_code: { type: 'varchar(20)' },
    qr_data: { type: 'text' },
    is_active: { type: 'boolean', default: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // ── Attendance Records ──
  pgm.createTable('attendance_records', {
    id: { type: 'serial', primaryKey: true },
    session_id: { type: 'integer', notNull: true, references: 'attendance_sessions(id)', onDelete: 'CASCADE' },
    student_id: { type: 'varchar(50)', notNull: true, references: 'students(id)', onDelete: 'CASCADE' },
    status: { type: 'varchar(20)', default: 'absent' },
    check_in_time: { type: 'timestamp' },
    check_in_method: { type: 'varchar(20)' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
  pgm.addConstraint('attendance_records', 'unique_session_student', { unique: ['session_id', 'student_id'] });

  // ── Resources ──
  pgm.createTable('resources', {
    id: { type: 'serial', primaryKey: true },
    course_id: { type: 'integer', notNull: true, references: 'courses(id)', onDelete: 'CASCADE' },
    created_by_type: { type: 'varchar(10)' },
    created_by_id: { type: 'integer' },
    title: { type: 'varchar(255)', notNull: true },
    description: { type: 'text' },
    file_url: { type: 'text' },
    file_type: { type: 'varchar(50)' },
    file_size: { type: 'bigint' },
    is_public: { type: 'boolean', default: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // ── Announcements ──
  pgm.createTable('announcements', {
    id: { type: 'serial', primaryKey: true },
    course_id: { type: 'integer', notNull: true, references: 'courses(id)', onDelete: 'CASCADE' },
    created_by_type: { type: 'varchar(10)' },
    created_by_id: { type: 'integer' },
    title: { type: 'varchar(255)', notNull: true },
    content: { type: 'text', notNull: true },
    priority: { type: 'varchar(10)', default: 'normal' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // ── Course Progress ──
  pgm.createTable('course_progress', {
    id: { type: 'serial', primaryKey: true },
    course_id: { type: 'integer', notNull: true, references: 'courses(id)', onDelete: 'CASCADE' },
    created_by_type: { type: 'varchar(10)' },
    created_by_id: { type: 'integer' },
    week_number: { type: 'integer' },
    title: { type: 'varchar(255)' },
    description: { type: 'text' },
    topics: { type: 'jsonb' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // ── Notifications ──
  pgm.createTable('notifications', {
    id: { type: 'serial', primaryKey: true },
    user_type: { type: 'varchar(20)' },
    user_id: { type: 'varchar(50)' },
    title: { type: 'varchar(255)', notNull: true },
    message: { type: 'text', notNull: true },
    type: { type: 'varchar(50)' },
    is_read: { type: 'boolean', default: false },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // ── Events ──
  pgm.createTable('calendar_events', {
    id: { type: 'serial', primaryKey: true },
    course_id: { type: 'integer', references: 'courses(id)', onDelete: 'SET NULL' },
    title: { type: 'varchar(255)', notNull: true },
    description: { type: 'text' },
    event_date: { type: 'date', notNull: true },
    event_time: { type: 'time' },
    event_type: { type: 'varchar(50)' },
    created_by: { type: 'varchar(50)' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // ── System Settings ──
  pgm.createTable('system_settings', {
    key: { type: 'varchar(50)', primaryKey: true },
    value: { type: 'varchar(100)' },
  });

  // ── Admin Logs ──
  pgm.createTable('admin_logs', {
    id: { type: 'serial', primaryKey: true },
    admin_id: { type: 'integer' },
    action: { type: 'varchar(255)', notNull: true },
    entity_type: { type: 'varchar(50)' },
    entity_id: { type: 'varchar(50)' },
    details: { type: 'jsonb' },
    ip_address: { type: 'varchar(45)' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // ── Student Logs ──
  pgm.createTable('student_logs', {
    id: { type: 'serial', primaryKey: true },
    student_id: { type: 'varchar(50)', notNull: true },
    action: { type: 'varchar(255)', notNull: true },
    details: { type: 'jsonb' },
    ip_address: { type: 'varchar(45)' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // ── Material Hub Posts ──
  pgm.createTable('material_hub_posts', {
    id: { type: 'serial', primaryKey: true },
    course_id: { type: 'integer', notNull: true, references: 'courses(id)', onDelete: 'CASCADE' },
    student_id: { type: 'varchar(50)', notNull: true, references: 'students(id)', onDelete: 'CASCADE' },
    type: { type: 'varchar(10)' },
    caption: { type: 'text' },
    file_url: { type: 'text', notNull: true },
    file_name: { type: 'varchar(255)' },
    file_size: { type: 'bigint' },
    status: { type: 'varchar(10)', default: 'pending' },
    reviewed_by: { type: 'varchar(50)', references: 'students(id)', onDelete: 'SET NULL' },
    reject_reason: { type: 'text' },
    batch: { type: 'varchar(50)' },
    session: { type: 'varchar(50)' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // ── Material Hub Comments ──
  pgm.createTable('material_hub_comments', {
    id: { type: 'serial', primaryKey: true },
    post_id: { type: 'integer', notNull: true, references: 'material_hub_posts(id)', onDelete: 'CASCADE' },
    student_id: { type: 'varchar(50)', notNull: true, references: 'students(id)', onDelete: 'CASCADE' },
    content: { type: 'text', notNull: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // ── Material Hub Upvotes ──
  pgm.createTable('material_hub_upvotes', {
    id: { type: 'serial', primaryKey: true },
    post_id: { type: 'integer', notNull: true, references: 'material_hub_posts(id)', onDelete: 'CASCADE' },
    student_id: { type: 'varchar(50)', notNull: true, references: 'students(id)', onDelete: 'CASCADE' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
  pgm.addConstraint('material_hub_upvotes', 'unique_post_student_upvote', { unique: ['post_id', 'student_id'] });

  // ── Material Hub Bookmarks ──
  pgm.createTable('material_hub_bookmarks', {
    id: { type: 'serial', primaryKey: true },
    post_id: { type: 'integer', notNull: true, references: 'material_hub_posts(id)', onDelete: 'CASCADE' },
    student_id: { type: 'varchar(50)', notNull: true, references: 'students(id)', onDelete: 'CASCADE' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
  pgm.addConstraint('material_hub_bookmarks', 'unique_post_student_bookmark', { unique: ['post_id', 'student_id'] });

  // ── Official Tasks ──
  pgm.createTable('official_tasks', {
    id: { type: 'serial', primaryKey: true },
    title: { type: 'varchar(255)', notNull: true },
    description: { type: 'text' },
    type: { type: 'varchar(50)' },
    level: { type: 'integer' },
    department: { type: 'varchar(100)' },
    due_date: { type: 'timestamp' },
    file_url: { type: 'text' },
    is_active: { type: 'boolean', default: true },
    created_by: { type: 'integer' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // ── Exam Schedules ──
  pgm.createTable('exam_schedules', {
    id: { type: 'serial', primaryKey: true },
    course_id: { type: 'integer', notNull: true, references: 'courses(id)', onDelete: 'CASCADE' },
    exam_type: { type: 'varchar(50)', notNull: true },
    exam_date: { type: 'date', notNull: true },
    start_time: { type: 'time' },
    end_time: { type: 'time' },
    location: { type: 'varchar(255)' },
    notes: { type: 'text' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // ── Timetables ──
  pgm.createTable('timetables', {
    id: { type: 'serial', primaryKey: true },
    course_id: { type: 'integer', notNull: true, references: 'courses(id)', onDelete: 'CASCADE' },
    day_of_week: { type: 'integer', notNull: true },
    start_time: { type: 'time', notNull: true },
    end_time: { type: 'time', notNull: true },
    location: { type: 'varchar(255)' },
    group_name: { type: 'varchar(50)' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // ── Departments ──
  pgm.createTable('departments', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'varchar(255)', notNull: true },
    name_ar: { type: 'varchar(255)' },
    code: { type: 'varchar(20)', unique: true },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  // ── Indexes ──
  pgm.createIndex('student_courses', 'student_id');
  pgm.createIndex('student_courses', 'course_id');
  pgm.createIndex('student_courses', ['instructor_type', 'instructor_id']);
  pgm.createIndex('course_instructor_sections', 'course_id');
  pgm.createIndex('doctor_courses', 'doctor_id');
  pgm.createIndex('doctor_courses', 'course_id');
  pgm.createIndex('ta_courses', 'ta_id');
  pgm.createIndex('ta_courses', 'course_id');
  pgm.createIndex('quiz_attempts', 'quiz_id');
  pgm.createIndex('quiz_attempts', 'student_id');
  pgm.createIndex('notifications', ['user_type', 'user_id']);
  pgm.createIndex('admin_logs', 'admin_id');
  pgm.createIndex('student_logs', 'student_id');
  pgm.createIndex('material_hub_posts', 'course_id');
  pgm.createIndex('attendance_sessions', 'course_id');
  pgm.createIndex('task_submissions', 'task_id');
  pgm.createIndex('resources', 'course_id');
  pgm.createIndex('announcements', 'course_id');
};

exports.down = (pgm) => {
  pgm.dropTable('exam_schedules');
  pgm.dropTable('official_tasks');
  pgm.dropTable('material_hub_bookmarks');
  pgm.dropTable('material_hub_upvotes');
  pgm.dropTable('material_hub_comments');
  pgm.dropTable('material_hub_posts');
  pgm.dropTable('student_logs');
  pgm.dropTable('admin_logs');
  pgm.dropTable('system_settings');
  pgm.dropTable('calendar_events');
  pgm.dropTable('notifications');
  pgm.dropTable('course_progress');
  pgm.dropTable('announcements');
  pgm.dropTable('resources');
  pgm.dropTable('attendance_records');
  pgm.dropTable('attendance_sessions');
  pgm.dropTable('task_submissions');
  pgm.dropTable('tasks');
  pgm.dropTable('quiz_answers');
  pgm.dropTable('quiz_attempts');
  pgm.dropTable('quiz_questions');
  pgm.dropTable('quizzes');
  pgm.dropTable('grades');
  pgm.dropTable('course_instructor_sections');
  pgm.dropTable('ta_courses');
  pgm.dropTable('teaching_assistants');
  pgm.dropTable('doctor_courses');
  pgm.dropTable('doctors');
  pgm.dropTable('student_courses');
  pgm.dropTable('courses');
  pgm.dropTable('admins');
  pgm.dropTable('students');
  pgm.dropTable('timetables');
  pgm.dropTable('departments');
};
