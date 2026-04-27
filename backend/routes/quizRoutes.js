const express = require('express');
const router = express.Router();
const { studentAuth } = require('../middleware/studentAuth');
const { 
    startQuiz, 
    saveAnswer, 
    submitQuiz, 
    getAttemptResult, 
    getLeaderboard 
} = require('../controllers/quizController');
// ✅ استيراد middleware رفع الصور الجديد
const { uploadWrittenAnswer } = require('../middleware/upload');

// بدء الاختبار (POST)
router.post('/:quizId/start', studentAuth, startQuiz);

router.get('/:quizId/start', studentAuth, (req, res) => {
    res.status(405).json({ 
        message: 'Please use POST method to start the quiz.' 
    });
});

// ✅ حفظ إجابة سؤال – يدعم رفع الصورة عبر uploadWrittenAnswer
router.post(
    '/attempts/:attemptId/questions/:questionId/answer',
    studentAuth,
    uploadWrittenAnswer.single('written_answer'), // اسم الحقل في FormData
    saveAnswer
);

// تسليم الاختبار
router.post('/attempts/:attemptId/submit', studentAuth, submitQuiz);
router.get('/attempts/:attemptId/submit', studentAuth, (req, res) => {
    res.status(405).json({ 
        message: 'Please use POST method to submit the quiz.' 
    });
});

// نتيجة الاختبار
router.get('/attempts/:attemptId/result', studentAuth, getAttemptResult);

// لوحة المتصدرين
router.get('/:quizId/leaderboard', studentAuth, getLeaderboard);

module.exports = router;