const db = require('../config/database');

class StudentAnswer {
    static async saveAnswer(attemptId, questionId, studentAnswer, isCorrect, pointsEarned, writtenAnswerUrl = null, needsReview = false) {
        const result = await db.query(
            `INSERT INTO student_answers 
                (attempt_id, question_id, student_answer, is_correct, points_earned, written_answer_url, needs_review) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (attempt_id, question_id) 
             DO UPDATE SET 
                student_answer = EXCLUDED.student_answer,
                is_correct = EXCLUDED.is_correct,
                points_earned = EXCLUDED.points_earned,
                written_answer_url = EXCLUDED.written_answer_url,
                needs_review = EXCLUDED.needs_review,
                answered_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [attemptId, questionId, studentAnswer, isCorrect, pointsEarned, writtenAnswerUrl, needsReview]
        );
        return result.rows[0];
    }

    static async getAnswersByAttempt(attemptId) {
        const result = await db.query(
            `SELECT sa.*, q.question_text, q.question_type, q.options, q.correct_answer, q.points 
             FROM student_answers sa
             JOIN questions q ON sa.question_id = q.id
             WHERE sa.attempt_id = $1`,
            [attemptId]
        );
        return result.rows;
    }

    static async calculateScore(attemptId) {
        const result = await db.query(
            `SELECT COALESCE(SUM(points_earned), 0) as score 
             FROM student_answers 
             WHERE attempt_id = $1`,
            [attemptId]
        );
        return parseInt(result.rows[0].score);
    }
}

module.exports = StudentAnswer;