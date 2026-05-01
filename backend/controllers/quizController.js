const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const StudentAnswer = require('../models/StudentAnswer');
const db = require('../config/database');
const supabase = require('../config/supabase');
const fs = require('fs');

const _forceSubmitAttempt = async (attemptId, quizId) => {
    try {
        const writtenCheck = await db.query(
            `SELECT COUNT(*) FROM student_answers sa
             JOIN questions q ON sa.question_id = q.id
             WHERE sa.attempt_id = $1 AND q.question_type = 'written'`,
            [attemptId]
        );
        const hasWritten = parseInt(writtenCheck.rows[0].count) > 0;
        let score = 0;
        const totalPoints = await Quiz.getTotalPoints(quizId);
        let finalStatus = 'completed';

        if (hasWritten) {
            finalStatus = 'pending_review';
        } else {
            score = await StudentAnswer.calculateScore(attemptId);
        }

        await QuizAttempt.complete(attemptId, score, totalPoints, finalStatus);
        return finalStatus;
    } catch (e) {
        console.error('Force submit error:', e);
    }
};

// ============= STUDENT FUNCTIONS =============

const startQuiz = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { quizId } = req.params;
        const { attempt_id } = req.body;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        const isAvailable = await Quiz.isAvailable(quizId);
        if (!isAvailable) {
            return res.status(403).json({ 
                message: 'Quiz is not currently available',
                reason: 'not_available'
            });
        }

        const completedAttempts = await Quiz.countStudentAttempts(quizId, studentId);
        const maxAttempts = quiz.max_attempts || 1;

        const activeAttempt = await QuizAttempt.findActiveByStudent(studentId, quizId);

        if (activeAttempt) {
            if (attempt_id && parseInt(attempt_id) === activeAttempt.id) {
                const remainingSeconds = await QuizAttempt.getRemainingSeconds(activeAttempt.id);
                
                if (remainingSeconds <= -60) {
                    await _forceSubmitAttempt(activeAttempt.id, quizId);
                    return res.status(403).json({
                        message: 'Time limit exceeded. Your attempt has been automatically submitted.',
                        reason: 'time_exceeded'
                    });
                }

                const questions = await Quiz.getQuestions(quizId, true);
                const sanitizedQuestions = questions.map(q => ({
                    id: q.id,
                    question_text: q.question_text,
                    question_type: q.question_type,
                    options: q.options,
                    points: q.points,
                    image_url: q.image_url,
                }));

                return res.json({
                    attempt_id: activeAttempt.id,
                    quiz_title: quiz.title,
                    time_limit_minutes: quiz.time_limit_minutes,
                    is_official: quiz.is_official || false,
                    remaining_seconds: remainingSeconds,
                    questions: sanitizedQuestions,
                    total_points: await Quiz.getTotalPoints(quizId),
                    is_resuming: true
                });
            }

            return res.status(403).json({
                message: 'You have an ongoing attempt for this quiz. Please resume it.',
                reason: 'active_attempt_exists',
                attempt_id: activeAttempt.id,
                remaining_seconds: await QuizAttempt.getRemainingSeconds(activeAttempt.id)
            });
        }

        if (completedAttempts >= maxAttempts) {
            return res.status(403).json({
                message: `You have reached the maximum number of attempts (${maxAttempts}).`,
                reason: 'max_attempts_reached'
            });
        }

        const newAttempt = await QuizAttempt.create(studentId, quizId);
        const questions = await Quiz.getQuestions(quizId, true);
        const remainingSeconds = await QuizAttempt.getRemainingSeconds(newAttempt.id);

        const sanitizedQuestions = questions.map(q => ({
            id: q.id,
            question_text: q.question_text,
            question_type: q.question_type,
            options: q.options,
            points: q.points,
            image_url: q.image_url,
        }));

        res.json({
            attempt_id: newAttempt.id,
            quiz_title: quiz.title,
            time_limit_minutes: quiz.time_limit_minutes,
            is_official: quiz.is_official || false,
            remaining_seconds: remainingSeconds,
            questions: sanitizedQuestions,
            total_points: await Quiz.getTotalPoints(quizId),
            is_resuming: false
        });

    } catch (error) {
        console.error('Start quiz error:', error);
        res.status(500).json({ message: error.message });
    }
};

const saveAnswer = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { attemptId, questionId } = req.params;
        const { answer } = req.body;

        console.log('📥 [saveAnswer] Received request');

        const attempt = await QuizAttempt.findById(attemptId);
        if (!attempt || attempt.student_id !== studentId) {
            return res.status(403).json({ message: 'Access denied' });
        }
        if (attempt.status !== 'in_progress') {
            return res.status(400).json({ message: 'Quiz already completed' });
        }

        const remainingSeconds = await QuizAttempt.getRemainingSeconds(attemptId);
        if (remainingSeconds <= -60) {
            await _forceSubmitAttempt(attemptId, attempt.quiz_id);
            return res.status(403).json({ message: 'Time limit exceeded. Answers are no longer accepted and quiz has been auto-submitted.' });
        }

        const questionResult = await db.query(
            'SELECT * FROM questions WHERE id = $1',
            [questionId]
        );
        const question = questionResult.rows[0];
        if (!question) return res.status(404).json({ message: 'Question not found' });

        let isCorrect = false;
        let pointsEarned = 0;
        let writtenAnswerUrl = null;
        let needsReview = false;
        let studentAnswerText = answer || null;

        if (question.question_type === 'written') {
            needsReview = true;
            pointsEarned = 0;

            if (req.file) {
                const fileBuffer = fs.readFileSync(req.file.path);
                const fileName = `${Date.now()}-${req.file.originalname}`;

                const { data, error } = await supabase.storage
                    .from('written-answers')
                    .upload(fileName, fileBuffer, {
                        contentType: req.file.mimetype,
                        cacheControl: '3600',
                        upsert: false
                    });

                if (error) {
                    console.error('❌ Supabase upload error:', error);
                    return res.status(500).json({ message: 'Failed to upload image to storage' });
                }

                const { data: publicUrlData } = supabase.storage
                    .from('written-answers')
                    .getPublicUrl(fileName);

                writtenAnswerUrl = publicUrlData.publicUrl;
                console.log('✅ Image uploaded to Supabase:', writtenAnswerUrl);

                fs.unlinkSync(req.file.path);
            }

            studentAnswerText = answer || null;

            if (!studentAnswerText && !writtenAnswerUrl) {
                return res.status(400).json({ message: 'No answer provided (text or image)' });
            }
        } else {
            if (question.question_type === 'true_false') {
                isCorrect = (answer === question.correct_answer);
            } else {
                isCorrect = (answer === question.correct_answer);
            }
            pointsEarned = isCorrect ? question.points : 0;
        }

        await StudentAnswer.saveAnswer(
            attemptId, questionId, 
            studentAnswerText, 
            isCorrect, pointsEarned, 
            writtenAnswerUrl, 
            needsReview
        );

        res.json({ 
            success: true, 
            is_correct: isCorrect, 
            needs_review: needsReview 
        });

    } catch (error) {
        console.error('❌ Save answer error:', error);
        res.status(500).json({ message: error.message });
    }
};

const submitQuiz = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { attemptId } = req.params;

        const attempt = await QuizAttempt.findById(attemptId);
        if (!attempt || attempt.student_id !== studentId) {
            return res.status(403).json({ message: 'Access denied' });
        }
        if (attempt.status !== 'in_progress') {
            return res.status(400).json({ message: 'Quiz already submitted' });
        }

        const writtenCheck = await db.query(
            `SELECT COUNT(*) FROM student_answers sa
             JOIN questions q ON sa.question_id = q.id
             WHERE sa.attempt_id = $1 AND q.question_type = 'written'`,
            [attemptId]
        );
        const hasWritten = parseInt(writtenCheck.rows[0].count) > 0;

        let score = 0;
        const totalPoints = await Quiz.getTotalPoints(attempt.quiz_id);
        let finalStatus = 'completed';

        if (hasWritten) {
            finalStatus = 'pending_review';
        } else {
            score = await StudentAnswer.calculateScore(attemptId);
        }

        await QuizAttempt.complete(attemptId, score, totalPoints, finalStatus);

        res.json({
            message: hasWritten ? 'Quiz submitted for review' : 'Quiz submitted successfully',
            score: hasWritten ? null : score,
            total_points: totalPoints,
            percentage: hasWritten ? null : Math.round((score / totalPoints) * 100),
            status: finalStatus
        });

    } catch (error) {
        console.error('Submit quiz error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getAttemptResult = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { attemptId } = req.params;

        const attemptQuery = await db.query(
            `SELECT 
                qa.*,
                q.title as quiz_title,
                q.max_attempts,
                s.name as student_name,
                EXTRACT(EPOCH FROM (qa.completed_at - qa.started_at))::int as time_spent_seconds
             FROM quiz_attempts qa
             JOIN quizzes q ON qa.quiz_id = q.id
             JOIN students s ON qa.student_id = s.id
             WHERE qa.id = $1`,
            [attemptId]
        );

        if (attemptQuery.rows.length === 0) {
            return res.status(404).json({ message: 'Attempt not found' });
        }
        const attempt = attemptQuery.rows[0];

        if (attempt.student_id !== studentId) {
            return res.status(403).json({ message: 'Access denied' });
        }
        if (attempt.status === 'in_progress') {
            return res.status(400).json({ message: 'Quiz not yet completed' });
        }

        const attemptsCount = await Quiz.countStudentAttempts(attempt.quiz_id, studentId);

        let rank = null;
        let score = attempt.score;
        let percentage = null;

        if (attempt.status === 'completed') {
            const rankQuery = await db.query(
                `SELECT COUNT(*) + 1 as rank
                 FROM quiz_attempts
                 WHERE quiz_id = $1
                   AND status = 'completed'
                   AND score > $2`,
                [attempt.quiz_id, attempt.score]
            );
            rank = parseInt(rankQuery.rows[0].rank) || 1;
            percentage = Math.round((score / attempt.total_points) * 100);
        }

        const answersResult = await db.query(
            `SELECT 
                sa.*,
                q.question_text,
                q.question_type,
                q.options,
                q.correct_answer,
                q.points,
                q.explanation,
                q.image_url
             FROM student_answers sa
             JOIN questions q ON sa.question_id = q.id
             WHERE sa.attempt_id = $1
             ORDER BY q.id`,
            [attemptId]
        );

        const timeSpentFormatted = attempt.time_spent_seconds
            ? `${Math.floor(attempt.time_spent_seconds / 60)}:${String(attempt.time_spent_seconds % 60).padStart(2, '0')}`
            : '00:00';

        res.json({
            attempt_id: attempt.id,
            student_id: studentId,
            score: score,
            total_points: attempt.total_points,
            percentage: percentage,
            time_spent: timeSpentFormatted,
            time_spent_seconds: attempt.time_spent_seconds,
            rank: rank,
            status: attempt.status,
            quiz: {
                max_attempts: attempt.max_attempts || 1,
                attempts_count: attemptsCount,
            },
            answers: answersResult.rows.map(a => ({
                question_id: a.question_id,
                question_text: a.question_text,
                question_type: a.question_type,
                options: a.options,
                student_answer: a.student_answer,
                written_answer_url: a.written_answer_url,
                correct_answer: a.correct_answer,
                is_correct: a.is_correct,
                points_earned: a.points_earned,
                points: a.points,
                explanation: a.explanation,
                image_url: a.image_url,
                needs_review: a.needs_review
            }))
        });

    } catch (error) {
        console.error('Get result error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getLeaderboard = async (req, res) => {
    try {
        const { quizId } = req.params;

        const result = await db.query(
            `SELECT 
                qa.student_id,
                s.name as student_name,
                MAX(qa.score) as score,
                MAX(qa.total_points) as total_points,
                MAX(qa.percentage) as percentage,
                MIN(EXTRACT(EPOCH FROM (qa.completed_at - qa.started_at)))::int as time_spent_seconds
             FROM (
                 SELECT 
                     qa.*,
                     ROUND((qa.score::numeric / qa.total_points) * 100) as percentage
                 FROM quiz_attempts qa
                 WHERE qa.quiz_id = $1 AND qa.status = 'completed'
             ) qa
             JOIN students s ON qa.student_id = s.id
             GROUP BY qa.student_id, s.id, s.name
             ORDER BY score DESC, time_spent_seconds ASC`,
            [quizId]
        );

        const leaderboard = result.rows.map((entry, index) => {
            const timeSpent = entry.time_spent_seconds
                ? `${Math.floor(entry.time_spent_seconds / 60)}:${String(entry.time_spent_seconds % 60).padStart(2, '0')}`
                : '—';
            return {
                rank: index + 1,
                student_id: entry.student_id,
                student_name: entry.student_name,
                score: entry.score,
                total_points: entry.total_points,
                percentage: entry.percentage,
                time_spent: timeSpent,
            };
        });

        res.json(leaderboard);
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ============= ADMIN FUNCTIONS =============

const getAllQuizzes = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT q.*, c.name as course_name 
            FROM quizzes q 
            JOIN courses c ON q.course_id = c.id 
            ORDER BY q.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Get all quizzes error:', error);
        res.status(500).json({ message: error.message });
    }
};

const createQuiz = async (req, res) => {
    try {
        const { 
            course_id, title, description, time_limit_minutes, passing_score,
            max_attempts, start_date, end_date, is_official
        } = req.body;
        
        if (!course_id || !title || !time_limit_minutes) {
            return res.status(400).json({ message: 'Missing required fields' });
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
        console.error('Create quiz error:', error);
        res.status(500).json({ message: error.message });
    }
};

const updateQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            course_id, title, description, time_limit_minutes, passing_score,
            max_attempts, start_date, end_date, is_official
        } = req.body;
        
        const result = await db.query(
            `UPDATE quizzes 
             SET course_id = $1, title = $2, description = $3, 
                 time_limit_minutes = $4, passing_score = $5, 
                 max_attempts = $6, start_date = $7, end_date = $8,
                 is_official = $9,
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $10 RETURNING *`,
            [course_id, title, description, time_limit_minutes, passing_score,
             max_attempts || 1, start_date || null, end_date || null, is_official || false, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update quiz error:', error);
        res.status(500).json({ message: error.message });
    }
};

const deleteQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM quizzes WHERE id = $1', [id]);
        res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        console.error('Delete quiz error:', error);
        res.status(500).json({ message: error.message });
    }
};

const togglePublishQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_published } = req.body;

        const result = await db.query(
            'UPDATE quizzes SET is_published = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [is_published, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        res.json({
            message: is_published ? 'Quiz published' : 'Quiz unpublished',
            quiz: result.rows[0]
        });
    } catch (error) {
        console.error('Toggle publish error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getQuestionsAdmin = async (req, res) => {
    try {
        const { quizId } = req.params;
        const result = await db.query(
            'SELECT * FROM questions WHERE quiz_id = $1 ORDER BY order_index, id',
            [quizId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get questions admin error:', error);
        res.status(500).json({ message: error.message });
    }
};

const addQuestion = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { 
            question_text, question_type, options, correct_answer, points,
            explanation, image_url 
        } = req.body;
        
        const quizCheck = await db.query('SELECT id FROM quizzes WHERE id = $1', [quizId]);
        if (quizCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Quiz not found' });
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
        console.error('Add question error:', error);
        res.status(500).json({ message: error.message });
    }
};

const updateQuestion = async (req, res) => {
    try {
        const { quizId, questionId } = req.params;
        const { 
            question_text, question_type, options, correct_answer, points,
            explanation, image_url 
        } = req.body;
        
        const result = await db.query(
            `UPDATE questions 
             SET question_text = $1, question_type = $2, options = $3, correct_answer = $4, 
                 points = $5, explanation = $6, image_url = $7, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $8 AND quiz_id = $9 RETURNING *`,
            [question_text, question_type, JSON.stringify(options), correct_answer, 
             points, explanation || null, image_url || null, questionId, quizId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update question error:', error);
        res.status(500).json({ message: error.message });
    }
};

const deleteQuestion = async (req, res) => {
    try {
        const { quizId, questionId } = req.params;
        const result = await db.query(
            'DELETE FROM questions WHERE id = $1 AND quiz_id = $2 RETURNING id',
            [questionId, quizId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        console.error('Delete question error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getQuizAttempts = async (req, res) => {
    try {
        const { quizId } = req.params;
        const result = await db.query(
            `SELECT 
                qa.id,
                qa.student_id,
                s.name as student_name,
                qa.started_at,
                qa.completed_at,
                qa.score,
                qa.total_points,
                qa.status,
                s.avatar_url,
                CASE 
                    WHEN qa.total_points > 0 THEN ROUND((qa.score::numeric / qa.total_points) * 100)
                    ELSE 0
                END as percentage
             FROM quiz_attempts qa
             JOIN students s ON qa.student_id = s.id
             WHERE qa.quiz_id = $1
             ORDER BY qa.started_at DESC`,
            [quizId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get quiz attempts error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getAttemptDetails = async (req, res) => {
    try {
        const { attemptId } = req.params;
        
        const attemptResult = await db.query(
            `SELECT qa.*, q.title as quiz_title, s.name as student_name 
             FROM quiz_attempts qa
             JOIN quizzes q ON qa.quiz_id = q.id
             JOIN students s ON qa.student_id = s.id
             WHERE qa.id = $1`,
            [attemptId]
        );
        if (attemptResult.rows.length === 0) {
            return res.status(404).json({ message: 'Attempt not found' });
        }
        const attempt = attemptResult.rows[0];

        const answersResult = await db.query(
            `SELECT 
                sa.*,
                q.question_text,
                q.question_type,
                q.options,
                q.correct_answer,
                q.points as question_points
             FROM student_answers sa
             JOIN questions q ON sa.question_id = q.id
             WHERE sa.attempt_id = $1
             ORDER BY q.id`,
            [attemptId]
        );

        res.json({
            attempt: {
                id: attempt.id,
                student_id: attempt.student_id,
                student_name: attempt.student_name,
                quiz_title: attempt.quiz_title,
                started_at: attempt.started_at,
                completed_at: attempt.completed_at,
                score: attempt.score,
                total_points: attempt.total_points,
                percentage: attempt.total_points > 0 ? Math.round((attempt.score / attempt.total_points) * 100) : 0,
                status: attempt.status
            },
            answers: answersResult.rows.map(a => ({
                question_id: a.question_id,
                question_text: a.question_text,
                question_type: a.question_type,
                options: a.options,
                student_answer: a.student_answer,
                written_answer_url: a.written_answer_url,
                correct_answer: a.correct_answer,
                is_correct: a.is_correct,
                points_earned: a.points_earned,
                points: a.question_points,
                needs_review: a.needs_review
            }))
        });

    } catch (error) {
        console.error('Get attempt details error:', error);
        res.status(500).json({ message: error.message });
    }
};

// دوال المراجعة
const getPendingReviews = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                qa.id as attempt_id,
                qa.student_id,
                s.name as student_name,
                qa.quiz_id,
                q.title as quiz_title,
                qa.started_at,
                qa.completed_at,
                qa.status,
                s.avatar_url,
                (SELECT COUNT(*) FROM student_answers sa 
                 WHERE sa.attempt_id = qa.id AND sa.needs_review = true) as pending_count
            FROM quiz_attempts qa
            JOIN students s ON qa.student_id = s.id
            JOIN quizzes q ON qa.quiz_id = q.id
            WHERE qa.status = 'pending_review'
            ORDER BY qa.completed_at ASC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Get pending reviews error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getAttemptForReview = async (req, res) => {
    try {
        const { attemptId } = req.params;
        const result = await db.query(`
            SELECT 
                sa.id as answer_id,
                sa.question_id,
                q.question_text,
                q.points,
                sa.written_answer_url,
                sa.student_answer,
                sa.points_earned
            FROM student_answers sa
            JOIN questions q ON sa.question_id = q.id
            WHERE sa.attempt_id = $1 AND sa.needs_review = true
        `, [attemptId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Get attempt for review error:', error);
        res.status(500).json({ message: error.message });
    }
};

const gradeWrittenAnswer = async (req, res) => {
    try {
        const { answerId } = req.params;
        const { points_earned } = req.body;

        await db.query(
            `UPDATE student_answers 
             SET points_earned = $1, needs_review = false, is_correct = ($1 > 0)
             WHERE id = $2`,
            [points_earned, answerId]
        );

        const answerInfo = await db.query(`SELECT attempt_id FROM student_answers WHERE id = $1`, [answerId]);
        const attemptId = answerInfo.rows[0].attempt_id;

        const remaining = await db.query(
            `SELECT COUNT(*) FROM student_answers WHERE attempt_id = $1 AND needs_review = true`,
            [attemptId]
        );

        if (parseInt(remaining.rows[0].count) === 0) {
            const score = await StudentAnswer.calculateScore(attemptId);
            const attempt = await QuizAttempt.findById(attemptId);
            await QuizAttempt.complete(attemptId, score, attempt.total_points, 'completed');
        }

        res.json({ message: 'Answer graded successfully' });
    } catch (error) {
        console.error('Grade written answer error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    startQuiz,
    saveAnswer,
    submitQuiz,
    getAttemptResult,
    getLeaderboard,
    getAllQuizzes,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    togglePublishQuiz,
    getQuestionsAdmin,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    getQuizAttempts,
    getAttemptDetails,
    getPendingReviews,
    getAttemptForReview,
    gradeWrittenAnswer
};