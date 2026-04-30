const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const db = require('../config/database');

// ==================== AUTH ====================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const doctor = await Doctor.findByEmail(email);
        if (!doctor) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isValid = await Doctor.verifyPassword(doctor, password);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: doctor.id, role: 'doctor', name: doctor.name },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            message: 'Login successful',
            doctor: { id: doctor.id, name: doctor.name, email: doctor.email }
        });
    } catch (error) {
        console.error('Doctor login error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ==================== DASHBOARD ====================
const getDashboardStats = async (req, res) => {
    try {
        const doctorId = req.doctor.id;

        // عدد المواد المخصصة للدكتور
        const coursesCount = await db.query(
            'SELECT COUNT(*) FROM doctor_courses WHERE doctor_id = $1',
            [doctorId]
        );

        // عدد الطلاب المسجلين في مواد الدكتور
        const studentsCount = await db.query(
            `SELECT COUNT(DISTINCT sc.student_id) 
             FROM student_courses sc
             JOIN doctor_courses dc ON sc.course_id = dc.course_id
             WHERE dc.doctor_id = $1`,
            [doctorId]
        );

        // عدد الكويزات في مواد الدكتور
        const quizzesCount = await db.query(
            `SELECT COUNT(*) FROM quizzes q
             JOIN doctor_courses dc ON q.course_id = dc.course_id
             WHERE dc.doctor_id = $1`,
            [doctorId]
        );

        // عدد الموارد (Resources) في مواد الدكتور
        const resourcesCount = await db.query(
            `SELECT COUNT(*) FROM resources r
             JOIN doctor_courses dc ON r.course_id = dc.course_id
             WHERE dc.doctor_id = $1`,
            [doctorId]
        );

        res.json({
            courses: parseInt(coursesCount.rows[0].count),
            students: parseInt(studentsCount.rows[0].count),
            quizzes: parseInt(quizzesCount.rows[0].count),
            resources: parseInt(resourcesCount.rows[0].count),
        });
    } catch (error) {
        console.error('Doctor stats error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ==================== MY COURSES (READ ONLY) ====================
const getMyCourses = async (req, res) => {
    try {
        const courses = await Doctor.getDoctorCourses(req.doctor.id);
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==================== QUIZZES FOR MY COURSES ====================
const getMyQuizzes = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT q.*, c.name as course_name 
             FROM quizzes q
             JOIN courses c ON q.course_id = c.id
             JOIN doctor_courses dc ON q.course_id = dc.course_id
             WHERE dc.doctor_id = $1
             ORDER BY q.created_at DESC`,
            [req.doctor.id]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createQuiz = async (req, res) => {
    try {
        const { course_id, title, description, time_limit_minutes, passing_score,
                max_attempts, start_date, end_date, is_official } = req.body;
        
        if (!course_id || !title || !time_limit_minutes) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Verify doctor has access to this course
        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, course_id);
        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied for this course' });
        }

        const result = await db.query(
            `INSERT INTO quizzes 
                (course_id, title, description, time_limit_minutes, passing_score, 
                 max_attempts, start_date, end_date, is_published, is_official) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false, $9) RETURNING *`,
            [course_id, title, description, time_limit_minutes, passing_score || 50,
             max_attempts || 1, start_date || null, end_date || null, is_official || false]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const { course_id, title, description, time_limit_minutes, passing_score,
                max_attempts, start_date, end_date, is_official } = req.body;

        // Verify quiz belongs to doctor's courses
        const quizCheck = await db.query(
            `SELECT q.id FROM quizzes q
             JOIN doctor_courses dc ON q.course_id = dc.course_id
             WHERE q.id = $1 AND dc.doctor_id = $2`,
            [id, req.doctor.id]
        );
        if (quizCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const result = await db.query(
            `UPDATE quizzes 
             SET course_id = $1, title = $2, description = $3, 
                 time_limit_minutes = $4, passing_score = $5, 
                 max_attempts = $6, start_date = $7, end_date = $8,
                 is_official = $9, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $10 RETURNING *`,
            [course_id, title, description, time_limit_minutes, passing_score,
             max_attempts || 1, start_date || null, end_date || null, is_official || false, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const quizCheck = await db.query(
            `SELECT q.id FROM quizzes q
             JOIN doctor_courses dc ON q.course_id = dc.course_id
             WHERE q.id = $1 AND dc.doctor_id = $2`,
            [id, req.doctor.id]
        );
        if (quizCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Access denied' });
        }
        await db.query('DELETE FROM quizzes WHERE id = $1', [id]);
        res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const togglePublishQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_published } = req.body;
        const quizCheck = await db.query(
            `SELECT q.id FROM quizzes q
             JOIN doctor_courses dc ON q.course_id = dc.course_id
             WHERE q.id = $1 AND dc.doctor_id = $2`,
            [id, req.doctor.id]
        );
        if (quizCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const result = await db.query(
            'UPDATE quizzes SET is_published = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [is_published, id]
        );
        res.json({ message: is_published ? 'Quiz published' : 'Quiz unpublished', quiz: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==================== QUESTIONS ====================
const getQuestions = async (req, res) => {
    try {
        const { quizId } = req.params;
        const quizCheck = await db.query(
            `SELECT q.id FROM quizzes q
             JOIN doctor_courses dc ON q.course_id = dc.course_id
             WHERE q.id = $1 AND dc.doctor_id = $2`,
            [quizId, req.doctor.id]
        );
        if (quizCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const result = await db.query(
            'SELECT * FROM questions WHERE quiz_id = $1 ORDER BY order_index, id',
            [quizId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addQuestion = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { question_text, question_type, options, correct_answer, points, explanation, image_url } = req.body;

        const quizCheck = await db.query(
            `SELECT q.id FROM quizzes q
             JOIN doctor_courses dc ON q.course_id = dc.course_id
             WHERE q.id = $1 AND dc.doctor_id = $2`,
            [quizId, req.doctor.id]
        );
        if (quizCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const result = await db.query(
            `INSERT INTO questions 
                (quiz_id, question_text, question_type, options, correct_answer, points, explanation, image_url) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [quizId, question_text, question_type, JSON.stringify(options),
             correct_answer, points || 1, explanation || null, image_url || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateQuestion = async (req, res) => {
    try {
        const { quizId, questionId } = req.params;
        const { question_text, question_type, options, correct_answer, points, explanation, image_url } = req.body;

        const quizCheck = await db.query(
            `SELECT q.id FROM quizzes q
             JOIN doctor_courses dc ON q.course_id = dc.course_id
             WHERE q.id = $1 AND dc.doctor_id = $2`,
            [quizId, req.doctor.id]
        );
        if (quizCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const result = await db.query(
            `UPDATE questions 
             SET question_text = $1, question_type = $2, options = $3, correct_answer = $4, 
                 points = $5, explanation = $6, image_url = $7, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $8 AND quiz_id = $9 RETURNING *`,
            [question_text, question_type, JSON.stringify(options), correct_answer,
             points, explanation || null, image_url || null, questionId, quizId]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Question not found' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteQuestion = async (req, res) => {
    try {
        const { quizId, questionId } = req.params;
        const quizCheck = await db.query(
            `SELECT q.id FROM quizzes q
             JOIN doctor_courses dc ON q.course_id = dc.course_id
             WHERE q.id = $1 AND dc.doctor_id = $2`,
            [quizId, req.doctor.id]
        );
        if (quizCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Access denied' });
        }
        await db.query('DELETE FROM questions WHERE id = $1 AND quiz_id = $2', [questionId, quizId]);
        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==================== QUIZ ATTEMPTS (VIEW ONLY) ====================
const getQuizAttempts = async (req, res) => {
    try {
        const { quizId } = req.params;
        const quizCheck = await db.query(
            `SELECT q.id FROM quizzes q
             JOIN doctor_courses dc ON q.course_id = dc.course_id
             WHERE q.id = $1 AND dc.doctor_id = $2`,
            [quizId, req.doctor.id]
        );
        if (quizCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const result = await db.query(
            `SELECT qa.id, qa.student_id, s.name as student_name,
                    qa.started_at, qa.completed_at, qa.score, qa.total_points, qa.status,
                    CASE WHEN qa.total_points > 0 THEN ROUND((qa.score::numeric / qa.total_points) * 100)
                    ELSE 0 END as percentage
             FROM quiz_attempts qa
             JOIN students s ON qa.student_id = s.id
             WHERE qa.quiz_id = $1
             ORDER BY qa.started_at DESC`,
            [quizId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==================== RESOURCES FOR MY COURSES ====================
const getMyResources = async (req, res) => {
    try {
        const { courseId } = req.params;
        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, courseId);
        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied for this course' });
        }

        const result = await db.query(
            'SELECT * FROM resources WHERE course_id = $1 ORDER BY type, created_at',
            [courseId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createResource = async (req, res) => {
    try {
        const { courseId, type, title, url } = req.body;
        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, courseId);
        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied for this course' });
        }
        const result = await db.query(
            'INSERT INTO resources (course_id, type, title, url) VALUES ($1, $2, $3, $4) RETURNING *',
            [courseId, type, title, url]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateResource = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, title, url } = req.body;
        // Verify resource belongs to doctor's course
        const check = await db.query(
            `SELECT r.id FROM resources r
             JOIN doctor_courses dc ON r.course_id = dc.course_id
             WHERE r.id = $1 AND dc.doctor_id = $2`,
            [id, req.doctor.id]
        );
        if (check.rows.length === 0) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const result = await db.query(
            'UPDATE resources SET type = COALESCE($1, type), title = COALESCE($2, title), url = COALESCE($3, url) WHERE id = $4 RETURNING *',
            [type, title, url, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteResource = async (req, res) => {
    try {
        const { id } = req.params;
        const check = await db.query(
            `SELECT r.id FROM resources r
             JOIN doctor_courses dc ON r.course_id = dc.course_id
             WHERE r.id = $1 AND dc.doctor_id = $2`,
            [id, req.doctor.id]
        );
        if (check.rows.length === 0) {
            return res.status(403).json({ message: 'Access denied' });
        }
        await db.query('DELETE FROM resources WHERE id = $1', [id]);
        res.json({ message: 'Resource deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==================== GRADES (VIEW ONLY) ====================
const getCourseGrades = async (req, res) => {
    try {
        const { courseId } = req.params;
        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, courseId);
        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied for this course' });
        }

        const result = await db.query(
            `SELECT 
                sc.id as enrollment_id, s.id as student_id, s.name as student_name, s.section,
                g.midterm_score, g.midterm_status,
                g.practical_score, g.practical_status,
                g.oral_score, g.oral_status,
                COALESCE(g.midterm_score, 0) + COALESCE(g.practical_score, 0) + COALESCE(g.oral_score, 0) as total_score
             FROM student_courses sc
             JOIN students s ON sc.student_id = s.id
             LEFT JOIN grades g ON g.enrollment_id = sc.id
             WHERE sc.course_id = $1
             ORDER BY s.name`,
            [courseId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateGrade = async (req, res) => {
    try {
        const { courseId, enrollmentId } = req.params;
        const { midterm_score, practical_score, oral_score } = req.body;

        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, courseId);
        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied for this course' });
        }

        const check = await db.query('SELECT id FROM student_courses WHERE id = $1 AND course_id = $2', [enrollmentId, courseId]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Enrollment not found in this course' });
        }

        const result = await db.query(
            `INSERT INTO grades (enrollment_id, midterm_score, practical_score, oral_score) 
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (enrollment_id) 
             DO UPDATE SET 
                midterm_score = EXCLUDED.midterm_score,
                practical_score = EXCLUDED.practical_score,
                oral_score = EXCLUDED.oral_score,
                updated_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [
                enrollmentId, 
                midterm_score !== '' && midterm_score !== null ? midterm_score : null, 
                practical_score !== '' && practical_score !== null ? practical_score : null, 
                oral_score !== '' && oral_score !== null ? oral_score : null
            ]
        );

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==================== OFFICIAL TASKS FOR MY COURSES ====================
const getMyTasks = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT ot.*, c.name as course_name 
             FROM official_tasks ot
             JOIN courses c ON ot.course_id = c.id
             JOIN doctor_courses dc ON ot.course_id = dc.course_id
             WHERE dc.doctor_id = $1
             ORDER BY ot.deadline DESC`,
            [req.doctor.id]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createTask = async (req, res) => {
    try {
        const { course_id, title, description, deadline, drive_link } = req.body;
        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, course_id);
        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied for this course' });
        }
        const result = await db.query(
            `INSERT INTO official_tasks (course_id, title, description, deadline, drive_link)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [course_id, title, description, deadline || null, drive_link || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, deadline, drive_link } = req.body;
        const check = await db.query(
            `SELECT ot.id FROM official_tasks ot
             JOIN doctor_courses dc ON ot.course_id = dc.course_id
             WHERE ot.id = $1 AND dc.doctor_id = $2`,
            [id, req.doctor.id]
        );
        if (check.rows.length === 0) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const result = await db.query(
            `UPDATE official_tasks SET title = $1, description = $2, deadline = $3, drive_link = $4, created_at = CURRENT_TIMESTAMP
             WHERE id = $5 RETURNING *`,
            [title, description, deadline || null, drive_link || null, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const check = await db.query(
            `SELECT ot.id FROM official_tasks ot
             JOIN doctor_courses dc ON ot.course_id = dc.course_id
             WHERE ot.id = $1 AND dc.doctor_id = $2`,
            [id, req.doctor.id]
        );
        if (check.rows.length === 0) {
            return res.status(403).json({ message: 'Access denied' });
        }
        await db.query('DELETE FROM official_tasks WHERE id = $1', [id]);
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==================== PENDING REVIEWS ====================
const getPendingReviews = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                qa.id as attempt_id, qa.student_id, s.name as student_name,
                qa.quiz_id, q.title as quiz_title, qa.started_at, qa.completed_at, qa.status,
                (SELECT COUNT(*) FROM student_answers sa 
                 WHERE sa.attempt_id = qa.id AND sa.needs_review = true) as pending_count
            FROM quiz_attempts qa
            JOIN students s ON qa.student_id = s.id
            JOIN quizzes q ON qa.quiz_id = q.id
            JOIN doctor_courses dc ON q.course_id = dc.course_id
            WHERE qa.status = 'pending_review' AND dc.doctor_id = $1
            ORDER BY qa.completed_at ASC
        `, [req.doctor.id]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAttemptForReview = async (req, res) => {
    try {
        const { attemptId } = req.params;
        // Verify this attempt belongs to a quiz in the doctor's courses
        const check = await db.query(
            `SELECT qa.id FROM quiz_attempts qa
             JOIN quizzes q ON qa.quiz_id = q.id
             JOIN doctor_courses dc ON q.course_id = dc.course_id
             WHERE qa.id = $1 AND dc.doctor_id = $2`,
            [attemptId, req.doctor.id]
        );
        if (check.rows.length === 0) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const result = await db.query(`
            SELECT sa.id as answer_id, sa.question_id, q.question_text, q.points,
                   sa.written_answer_url, sa.student_answer, sa.points_earned
            FROM student_answers sa
            JOIN questions q ON sa.question_id = q.id
            WHERE sa.attempt_id = $1 AND sa.needs_review = true
        `, [attemptId]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const gradeWrittenAnswer = async (req, res) => {
    try {
        const { answerId } = req.params;
        const { points_earned } = req.body;

        // Verify ownership
        const check = await db.query(
            `SELECT sa.attempt_id FROM student_answers sa
             JOIN quiz_attempts qa ON sa.attempt_id = qa.id
             JOIN quizzes q ON qa.quiz_id = q.id
             JOIN doctor_courses dc ON q.course_id = dc.course_id
             WHERE sa.id = $1 AND dc.doctor_id = $2`,
            [answerId, req.doctor.id]
        );
        if (check.rows.length === 0) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await db.query(
            `UPDATE student_answers 
             SET points_earned = $1, needs_review = false, is_correct = ($1 > 0)
             WHERE id = $2`,
            [points_earned, answerId]
        );

        const answerInfo = await db.query('SELECT attempt_id FROM student_answers WHERE id = $1', [answerId]);
        const attemptId = answerInfo.rows[0].attempt_id;

        const remaining = await db.query(
            'SELECT COUNT(*) FROM student_answers WHERE attempt_id = $1 AND needs_review = true',
            [attemptId]
        );

        if (parseInt(remaining.rows[0].count) === 0) {
            const QuizAttempt = require('../models/QuizAttempt');
            const StudentAnswer = require('../models/StudentAnswer');
            const score = await StudentAnswer.calculateScore(attemptId);
            const attempt = await QuizAttempt.findById(attemptId);
            await QuizAttempt.complete(attemptId, score, attempt.total_points, 'completed');
        }

        res.json({ message: 'Answer graded successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==================== STUDENT PROGRESS ====================
const getStudentProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, courseId);
        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied for this course' });
        }

        const result = await db.query(`
            SELECT 
                s.id as student_id, s.name as student_name, s.section,
                sc.progress_percentage, sc.status as enrollment_status,
                -- Quiz stats for this student in this course
                (SELECT COUNT(*) FROM quiz_attempts qa 
                 JOIN quizzes q ON qa.quiz_id = q.id 
                 WHERE qa.student_id = s.id AND q.course_id = $1 AND qa.status = 'completed') as quizzes_completed,
                (SELECT COUNT(*) FROM quizzes q 
                 WHERE q.course_id = $1 AND q.is_published = true) as quizzes_total,
                -- Average quiz score
                (SELECT ROUND(AVG(
                    CASE WHEN qa.total_points > 0 THEN (qa.score::numeric / qa.total_points) * 100 ELSE 0 END
                )::numeric, 1) FROM quiz_attempts qa 
                 JOIN quizzes q ON qa.quiz_id = q.id 
                 WHERE qa.student_id = s.id AND q.course_id = $1 AND qa.status = 'completed') as avg_quiz_score,
                -- Task completion
                (SELECT COUNT(*) FROM student_official_tasks sot
                 JOIN official_tasks ot ON sot.task_id = ot.id
                 WHERE sot.student_id = s.id AND ot.course_id = $1 AND sot.is_completed = true) as tasks_completed,
                (SELECT COUNT(*) FROM official_tasks ot WHERE ot.course_id = $1) as tasks_total,
                -- Grades total
                COALESCE(g.midterm_score, 0) + COALESCE(g.practical_score, 0) + COALESCE(g.oral_score, 0) as grade_total
            FROM student_courses sc
            JOIN students s ON sc.student_id = s.id
            LEFT JOIN grades g ON g.enrollment_id = sc.id
            WHERE sc.course_id = $1
            ORDER BY s.name
        `, [courseId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Student progress error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ==================== QUIZ ANALYTICS ====================
const getQuizAnalytics = async (req, res) => {
    try {
        const { courseId } = req.params;
        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, courseId);
        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied for this course' });
        }

        // Per-quiz stats
        const quizStats = await db.query(`
            SELECT 
                q.id, q.title, q.passing_score, q.is_published, q.time_limit_minutes,
                COUNT(DISTINCT qa.student_id) as total_attempts,
                COUNT(DISTINCT CASE WHEN qa.status = 'completed' THEN qa.student_id END) as completed_attempts,
                ROUND(AVG(CASE WHEN qa.total_points > 0 AND qa.status = 'completed'
                    THEN (qa.score::numeric / qa.total_points) * 100 ELSE NULL END)::numeric, 1) as avg_score,
                MAX(CASE WHEN qa.total_points > 0 AND qa.status = 'completed'
                    THEN (qa.score::numeric / qa.total_points) * 100 ELSE NULL END) as max_score,
                MIN(CASE WHEN qa.total_points > 0 AND qa.status = 'completed'
                    THEN (qa.score::numeric / qa.total_points) * 100 ELSE NULL END) as min_score,
                COUNT(DISTINCT CASE WHEN qa.status = 'completed' AND qa.total_points > 0 
                    AND (qa.score::numeric / qa.total_points) * 100 >= q.passing_score 
                    THEN qa.student_id END) as passed_count
            FROM quizzes q
            LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
            WHERE q.course_id = $1
            GROUP BY q.id, q.title, q.passing_score, q.is_published, q.time_limit_minutes
            ORDER BY q.created_at DESC
        `, [courseId]);

        // Overall course quiz summary
        const courseSummary = await db.query(`
            SELECT 
                COUNT(DISTINCT q.id) as total_quizzes,
                COUNT(DISTINCT CASE WHEN q.is_published THEN q.id END) as published_quizzes,
                COUNT(DISTINCT qa.student_id) as students_attempted,
                ROUND(AVG(CASE WHEN qa.total_points > 0 AND qa.status = 'completed'
                    THEN (qa.score::numeric / qa.total_points) * 100 ELSE NULL END)::numeric, 1) as overall_avg
            FROM quizzes q
            LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
            WHERE q.course_id = $1
        `, [courseId]);

        // Score distribution (0-20, 20-40, 40-60, 60-80, 80-100)
        const distribution = await db.query(`
            SELECT 
                CASE 
                    WHEN pct < 20 THEN '0-20'
                    WHEN pct < 40 THEN '20-40'
                    WHEN pct < 60 THEN '40-60'
                    WHEN pct < 80 THEN '60-80'
                    ELSE '80-100'
                END as range,
                COUNT(*) as count
            FROM (
                SELECT (qa.score::numeric / NULLIF(qa.total_points, 0)) * 100 as pct
                FROM quiz_attempts qa
                JOIN quizzes q ON qa.quiz_id = q.id
                WHERE q.course_id = $1 AND qa.status = 'completed' AND qa.total_points > 0
            ) sub
            GROUP BY range
            ORDER BY range
        `, [courseId]);

        res.json({
            quizzes: quizStats.rows,
            summary: courseSummary.rows[0],
            distribution: distribution.rows
        });
    } catch (error) {
        console.error('Quiz analytics error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ==================== COURSE STUDENTS ====================
const getCourseStudents = async (req, res) => {
    try {
        const { courseId } = req.params;
        const hasAccess = await Doctor.hasCourseAccess(req.doctor.id, courseId);
        if (!hasAccess) {
            return res.status(403).json({ message: 'Access denied for this course' });
        }

        const result = await db.query(`
            SELECT 
                s.id, s.name, s.email, s.section, s.level,
                sc.progress_percentage, sc.status, sc.enrolled_at
            FROM student_courses sc
            JOIN students s ON sc.student_id = s.id
            WHERE sc.course_id = $1
            ORDER BY s.name
        `, [courseId]);

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==================== PROFILE ====================
const getProfile = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.doctor.id);
        res.json(doctor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    login, getDashboardStats, getProfile,
    getMyCourses,
    getMyQuizzes, createQuiz, updateQuiz, deleteQuiz, togglePublishQuiz,
    getQuestions, addQuestion, updateQuestion, deleteQuestion, getQuizAttempts,
    getMyResources, createResource, updateResource, deleteResource,
    getCourseGrades, updateGrade,
    getMyTasks, createTask, updateTask, deleteTask,
    getPendingReviews, getAttemptForReview, gradeWrittenAnswer,
    getStudentProgress, getQuizAnalytics, getCourseStudents,
};
