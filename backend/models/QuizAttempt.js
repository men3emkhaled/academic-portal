const db = require('../config/database');

class QuizAttempt {
    static async create(studentId, quizId) {
        const result = await db.query(
            `INSERT INTO quiz_attempts (student_id, quiz_id, status) 
             VALUES ($1, $2, 'in_progress') RETURNING *`,
            [studentId, quizId]
        );
        return result.rows[0];
    }

    static async findById(id) {
        const result = await db.query(
            `SELECT qa.*, q.title, q.time_limit_minutes, q.course_id 
             FROM quiz_attempts qa 
             JOIN quizzes q ON qa.quiz_id = q.id 
             WHERE qa.id = $1`,
            [id]
        );
        return result.rows[0];
    }

    static async findActiveByStudent(studentId, quizId) {
        const result = await db.query(
            `SELECT * FROM quiz_attempts 
             WHERE student_id = $1 AND quiz_id = $2 AND status = 'in_progress' 
             ORDER BY started_at DESC LIMIT 1`,
            [studentId, quizId]
        );
        return result.rows[0];
    }

    static async complete(attemptId, score, totalPoints, status = 'completed') {
        const result = await db.query(
            `UPDATE quiz_attempts 
             SET completed_at = CURRENT_TIMESTAMP, score = $1, total_points = $2, status = $3 
             WHERE id = $4 RETURNING *`,
            [score, totalPoints, status, attemptId]
        );
        return result.rows[0];
    }

    static async getRemainingSeconds(attemptId) {
        const result = await db.query(
            `SELECT 
                q.time_limit_minutes * 60 - EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - qa.started_at)) AS remaining
             FROM quiz_attempts qa
             JOIN quizzes q ON qa.quiz_id = q.id
             WHERE qa.id = $1`,
            [attemptId]
        );
        return Math.max(0, Math.floor(result.rows[0].remaining));
    }
}

module.exports = QuizAttempt;