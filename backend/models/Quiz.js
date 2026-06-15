const db = require('../config/database');

class Quiz {
    static async findById(id) {
        const result = await db.query(
            `SELECT q.*, c.name as course_name 
             FROM quizzes q 
             JOIN courses c ON q.course_id = c.id 
             WHERE q.id = $1`,
            [id]
        );
        return result.rows[0];
    }

    static async findByCourse(courseId, onlyPublished = false) {
        let query = 'SELECT * FROM quizzes WHERE course_id = $1';
        if (onlyPublished) {
            query += ' AND is_published = true';
        }
        query += ' ORDER BY created_at DESC';
        const result = await db.query(query, [courseId]);
        return result.rows;
    }

    static async getQuestions(quizId, shuffle = true) {
        const result = await db.query(
            'SELECT * FROM questions WHERE quiz_id = $1 ORDER BY order_index, id',
            [quizId]
        );
        if (!shuffle) return result.rows;
        // Fisher-Yates shuffle (avoids costly ORDER BY RANDOM() on DB)
        const rows = [...result.rows];
        for (let i = rows.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [rows[i], rows[j]] = [rows[j], rows[i]];
        }
        return rows;
    }

    static async getTotalPoints(quizId) {
        const result = await db.query(
            'SELECT COALESCE(SUM(points), 0) as total FROM questions WHERE quiz_id = $1',
            [quizId]
        );
        return parseInt(result.rows[0].total);
    }

    static async isPublished(quizId) {
        const result = await db.query(
            'SELECT is_published FROM quizzes WHERE id = $1',
            [quizId]
        );
        return result.rows[0]?.is_published || false;
    }

    // ✅ دالة للتحقق من صلاحية الاختبار زمنياً
    static async isAvailable(quizId) {
        const result = await db.query(
            `SELECT 
                start_date, 
                end_date,
                is_published,
                max_attempts
             FROM quizzes WHERE id = $1`,
            [quizId]
        );
        const quiz = result.rows[0];
        if (!quiz || !quiz.is_published) return false;
        
        const now = new Date();
        if (quiz.start_date && new Date(quiz.start_date) > now) return false;
        if (quiz.end_date && new Date(quiz.end_date) < now) return false;
        
        return true;
    }

    // ✅ الحصول على عدد المحاولات السابقة لطالب في اختبار
    static async countStudentAttempts(quizId, studentId) {
        const result = await db.query(
            `SELECT COUNT(*) as count 
             FROM quiz_attempts 
             WHERE quiz_id = $1 AND student_id = $2 AND status = 'completed'`,
            [quizId, studentId]
        );
        return parseInt(result.rows[0].count);
    }
}

module.exports = Quiz;