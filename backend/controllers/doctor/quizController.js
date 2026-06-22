const Doctor = require('../../models/Doctor');
const db = require('../../config/database');

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
            `SELECT qa.id, qa.student_id, s.name as student_name, s.avatar_url,
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

// ==================== PENDING REVIEWS ====================
const getPendingReviews = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                qa.id as attempt_id, qa.student_id, s.name as student_name, s.avatar_url,
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
            const QuizAttempt = require('../../models/QuizAttempt');
            const StudentAnswer = require('../../models/StudentAnswer');
            const score = await StudentAnswer.calculateScore(attemptId);
            const attempt = await QuizAttempt.findById(attemptId);
            await QuizAttempt.complete(attemptId, score, attempt.total_points, 'completed');
        }

        res.json({ message: 'Answer graded successfully' });
    } catch (error) {
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

module.exports = { getMyQuizzes, createQuiz, updateQuiz, deleteQuiz, togglePublishQuiz, getQuestions, addQuestion, updateQuestion, deleteQuestion, getQuizAttempts, getPendingReviews, getAttemptForReview, gradeWrittenAnswer, getQuizAnalytics };
