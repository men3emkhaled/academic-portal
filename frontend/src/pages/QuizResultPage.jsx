import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import studentApi from '../services/studentApi';
import toast from 'react-hot-toast';
import { AlertCircle, Clock, Target, FileQuestion, Activity, CheckCircle2, MonitorPlay, ArrowRight } from 'lucide-react';

const getDirectImageUrl = (url) => {
  if (!url) return '';
  if (url.includes('ibb.co') && !url.includes('i.ibb.co')) {
    const match = url.match(/ibb\.co\/([a-zA-Z0-9]+)$/);
    if (match) {
      return `https://i.ibb.co/${match[1]}/image.jpg`;
    }
  }
  return url;
};

const QuizResultPage = () => {
  const { quizId, attemptId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('review');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resultRes, leaderboardRes] = await Promise.all([
          studentApi.get(`/quizzes/attempts/${attemptId}/result`),
          studentApi.get(`/quizzes/${quizId}/leaderboard`).catch(() => ({ data: [] }))
        ]);
        setResult(resultRes.data);
        setLeaderboard(leaderboardRes.data);
      } catch (error) {
        toast.error('Failed to load result');
        navigate('/student/quizzes', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [quizId, attemptId, navigate]);

  const handleRetry = () => {
    navigate(`/student/quizzes/${quizId}/take`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!result || !result.answers || result.answers.length === 0) {
    return (
      <div className="min-h-screen bg-dark text-white flex flex-col items-center justify-center p-6">
        <p className="text-xl mb-4"><AlertCircle className="w-8 h-8 text-primary mx-auto mb-4" /> No results available</p>
        <button
          onClick={() => navigate('/student/quizzes')}
          className="px-6 py-3 bg-primary text-dark rounded-xl font-bold"
        >
          Back to Quizzes
        </button>
      </div>
    );
  }

  const { score, total_points, percentage, answers, time_spent, rank, quiz, student_id, status } = result;
  const isPendingReview = status === 'pending_review';
  const maxAttempts = quiz?.max_attempts || 1;
  const attemptsCount = quiz?.attempts_count || 1;
  const canRetry = !isPendingReview && attemptsCount < maxAttempts;

  return (
    <div className="min-h-screen bg-dark text-white font-body">
      <main className="pt-8 px-6 max-w-2xl mx-auto pb-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h2 className="font-headline font-extrabold text-4xl mb-8 tracking-tighter text-white flex justify-center items-center gap-3">
            {isPendingReview ? <><Clock className="w-8 h-8" /> Under Review</> : 'Quiz Completed!'}
          </h2>
          {isPendingReview ? (
            <div className="bg-dark-glass rounded-2xl p-8 border border-primary/30">
              <span className="text-6xl mb-4 block"><AlertCircle className="w-16 h-16 text-secondary mx-auto mb-4" /></span>
              <p className="text-lg text-gray-400">
                Your written answers are being reviewed.
              </p>
              <p className="text-sm text-gray-400 mt-2">
                You will be notified once grading is complete.
              </p>
            </div>
          ) : (
            <>
              <div className="relative inline-flex items-center justify-center p-12 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-[#002d0f] opacity-20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin-slow opacity-40"></div>
                <div className="glow-score w-48 h-48 rounded-full bg-dark-glass flex flex-col items-center justify-center relative z-10 border border-white/10/20">
                  <span className="font-headline font-black text-6xl text-primary drop-shadow-[0_0_15px_rgba(142,255,113,0.4)]">
                    {percentage}%
                  </span>
                  <span className="font-label text-xs uppercase tracking-widest text-gray-400 mt-2">
                    Accuracy
                  </span>
                </div>
              </div>
              <div className="bg-dark-card rounded-xl p-4 inline-block">
                <p className="font-headline font-bold text-xl">
                  Score: <span className="text-primary">{score}</span> / <span className="text-gray-400">{total_points}</span>
                </p>
              </div>
            </>
          )}
        </section>

        {/* Stats Bento */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-dark-glass p-6 rounded-xl border border-white/10/10">
            <span className="text-2xl mb-2 block"><Clock className="w-6 h-6 text-gray-400" /></span>
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Time Spent</p>
            <p className="font-headline font-bold text-xl text-white">{time_spent || '00:00'}</p>
          </div>
          <div className="bg-dark-glass p-6 rounded-xl border border-white/10/10">
            <span className="text-2xl mb-2 block"><Target className="w-6 h-6 text-primary" /></span>
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Rank</p>
            <p className="font-headline font-bold text-xl text-white">
              {isPendingReview ? '—' : `#${rank || '-'}`}
            </p>
          </div>
        </div>

        {/* Tabs (تظهر فقط إذا كانت المحاولة مكتملة) */}
        {!isPendingReview && (
          <div className="flex gap-4 border-b border-white/10 pb-3 mb-6">
            <button
              onClick={() => setActiveTab('review')}
              className={`px-4 py-1 rounded-full text-sm font-medium transition ${
                activeTab === 'review'
                  ? 'bg-primary text-dark'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileQuestion className="w-4 h-4" /> Review Answers
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-4 py-1 rounded-full text-sm font-medium transition ${
                activeTab === 'leaderboard'
                  ? 'bg-primary text-dark'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" /> Leaderboard
            </button>
          </div>
        )}

        {isPendingReview ? (
          /* ✅ عرض محسّن للإجابات أثناء المراجعة */
          <section className="space-y-6">
            <h3 className="font-headline font-bold text-xl mb-4">Your Submitted Answers</h3>
            {answers.map((ans, idx) => {
              if (!ans || !ans.question_id) return null;
              const hasText = ans.student_answer && ans.student_answer.trim() !== '';
              const hasImage = ans.written_answer_url && ans.written_answer_url.trim() !== '';
              
              return (
                <div
                  key={ans.question_id}
                  className="bg-dark-glass rounded-xl p-6 border-l-4 border-yellow-500/50 relative overflow-hidden"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/20 text-yellow-500 flex items-center justify-center shrink-0">
                      <span className="font-headline font-black">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-headline font-bold text-lg mb-4 text-white">
                        {ans.question_text}
                      </p>
                      
                      {/* عرض النص المكتوب */}
                      {hasText && (
                        <div className="mb-4 p-4 bg-dark-card rounded-lg border border-white/10/30">
                          <p className="text-xs text-gray-400 mb-1">Your written answer:</p>
                          <p className="text-white whitespace-pre-wrap">{ans.student_answer}</p>
                        </div>
                      )}
                      
                      {/* عرض الصورة المرفوعة */}
                      {hasImage && (
                        <div className="mb-4">
                          <img
                            src={getDirectImageUrl(`${process.env.REACT_APP_API_URL || ''}${ans.written_answer_url}`)}
                            alt="Your answer"
                            className="max-h-64 rounded-lg border border-white/10/30 cursor-pointer"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/400x200/1a1a1a/8eff71?text=Image+Not+Available';
                            }}
                            onClick={() => window.open(`${process.env.REACT_APP_API_URL || ''}${ans.written_answer_url}`, '_blank')}
                          />
                        </div>
                      )}
                      
                      {!hasText && !hasImage && (
                        <p className="text-red-400 text-sm">No answer provided</p>
                      )}
                      
                      <div className="mt-4 flex items-center gap-2 text-yellow-500">
                        <span><Clock className="w-4 h-4" /></span>
                        <span className="text-sm">Waiting for review</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        ) : activeTab === 'review' ? (
          <section className="space-y-6">
            {/* عرض الإجابات العادية (MCQ/True-False) مع دعم الصور المقالية بعد التصحيح */}
            {answers.map((ans, idx) => {
              if (!ans || !ans.question_id) return null;
              const isCorrect = ans.is_correct;
              const studentAnswer = ans.student_answer;
              const correctAnswer = ans.correct_answer;

              return (
                <div
                  key={ans.question_id}
                  className={`bg-dark-glass rounded-xl p-6 border-l-4 ${
                    isCorrect ? 'border-primary/50' : 'border-secondary/50'
                  } relative overflow-hidden group`}
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="text-8xl">{isCorrect ? <CheckCircle2 className="w-full h-full text-primary" /> : <AlertCircle className="w-full h-full text-secondary" />}</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isCorrect ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'
                      }`}
                    >
                      <span className="font-headline font-black">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-headline font-bold text-lg mb-2 text-white">
                        {ans.question_text || 'Question text not available'}
                      </p>

                      {ans.image_url && (
                        <div className="mb-4">
                          <img
                            src={getDirectImageUrl(ans.image_url)}
                            alt="Question illustration"
                            className="max-h-48 rounded-lg border border-white/10/30"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/400x200/1a1a1a/8eff71?text=Image+Not+Available';
                            }}
                          />
                        </div>
                      )}

                      {ans.question_type === 'written' ? (
                        <div>
                          {ans.written_answer_url && (
                            <img
                              src={getDirectImageUrl(`${process.env.REACT_APP_API_URL || ''}${ans.written_answer_url}`)}
                              alt="Your written answer"
                              className="max-h-64 rounded-lg border border-white/10/30 cursor-pointer"
                              onClick={() => window.open(`${process.env.REACT_APP_API_URL || ''}${ans.written_answer_url}`, '_blank')}
                            />
                          )}
                          <p className="text-sm text-gray-400 mt-2">
                            Points: {ans.points_earned ?? 0} / {ans.points ?? 0}
                          </p>
                        </div>
                      ) : ans.question_type === 'true_false' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div
                            className={`flex items-center gap-3 bg-primary/10 p-3 rounded-lg border ${
                              isCorrect ? 'border-primary/20' : 'border-secondary/20'
                            }`}
                          >
                            <span className="text-xl">{isCorrect ? <CheckCircle2 className="w-full h-full text-primary" /> : <AlertCircle className="w-full h-full text-secondary" />}</span>
                            <div>
                              <p className="text-[10px] uppercase text-gray-400 font-bold">Your Answer</p>
                              <p className={`font-bold ${isCorrect ? 'text-primary' : 'text-secondary'}`}>
                                {studentAnswer === 'true' ? 'True' : 'False'}
                              </p>
                            </div>
                          </div>
                          {!isCorrect && (
                            <div className="flex items-center gap-3 bg-primary/10 p-3 rounded-lg border border-primary/20">
                              <span className="text-xl">✅</span>
                              <div>
                                <p className="text-[10px] uppercase text-gray-400 font-bold">Correct Answer</p>
                                <p className="font-bold text-primary">
                                  {correctAnswer === 'true' ? 'True' : 'False'}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {ans.options?.map((opt, i) => {
                            const letter = String.fromCharCode(65 + i);
                            const isStudentChoice = studentAnswer === letter;
                            const isCorrectChoice = correctAnswer === letter;

                            let bgClass = 'bg-primary/10';
                            let borderClass = '';
                            let textClass = '';

                            if (isCorrectChoice) {
                              bgClass = 'bg-primary/10';
                              borderClass = 'border-primary/40';
                              textClass = 'text-primary';
                            } else if (isStudentChoice && !isCorrectChoice) {
                              bgClass = 'bg-secondary/10';
                              borderClass = 'border-secondary/40';
                              textClass = 'text-secondary';
                            }

                            return (
                              <div
                                key={i}
                                className={`flex items-center gap-3 p-3 rounded-lg border ${bgClass} ${borderClass}`}
                              >
                                <span className="font-bold mr-2">{letter}.</span>
                                <span className={textClass}>{opt}</span>
                                {isStudentChoice && (
                                  <span className="ml-auto text-xs text-gray-400">(Your answer)</span>
                                )}
                                {isCorrectChoice && (
                                  <span className="ml-auto text-xs text-primary">✓ Correct</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {ans.explanation && (
                        <div className="mt-4 p-4 bg-dark-card rounded-lg border border-primary/20">
                          <p className="text-xs uppercase tracking-wider text-primary mb-1"><MonitorPlay className="w-4 h-4" /> Explanation</p>
                          <p className="text-sm text-gray-400">{ans.explanation}</p>
                        </div>
                      )}

                      <p className="text-sm text-gray-400 mt-4">
                        Points: {ans.points_earned ?? 0} / {ans.points ?? 0}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        ) : (
          <section>
            {leaderboard.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No leaderboard data available.</p>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-xs uppercase tracking-wider text-gray-400 font-bold px-4 py-2">
                  <div className="col-span-2">Rank</div>
                  <div className="col-span-5">Student</div>
                  <div className="col-span-3 text-right">Score</div>
                  <div className="col-span-2 text-right">Time</div>
                </div>
                {leaderboard.map((entry) => (
                  <div
                    key={entry.student_id}
                    className={`grid grid-cols-12 gap-2 items-center p-4 rounded-lg ${
                      entry.student_id === student_id
                        ? 'bg-primary/20 border border-primary/50'
                        : 'bg-dark-glass'
                    }`}
                  >
                    <div className="col-span-2 font-bold">
                      {entry.rank === 1 ? <span className="text-secondary font-black">#1</span> : entry.rank === 2 ? <span className="text-gray-400 font-black">#2</span> : entry.rank === 3 ? <span className="text-[#cd7f32] font-black">#3</span> : `#${entry.rank}`}
                    </div>
                    <div className="col-span-5 truncate">{entry.student_name}</div>
                    <div className="col-span-3 text-right font-mono">
                      {entry.score} / {entry.total_points} ({entry.percentage}%)
                    </div>
                    <div className="col-span-2 text-right text-sm text-gray-400">
                      {entry.time_spent || '—'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* CTA Section */}
        <section className="mt-12 space-y-3">
          <button
            onClick={() => navigate('/student/quizzes')}
            className="w-full py-4 bg-primary text-dark font-headline font-extrabold text-lg rounded-xl shadow-[0_12px_40px_rgba(var(--primary),0.25)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-tight"
          >
            Back to Quizzes
          </button>
          {canRetry && (
            <button
              onClick={handleRetry}
              className="w-full py-4 bg-transparent border-2 border-primary text-primary font-headline font-extrabold text-lg rounded-xl hover:bg-primary/10 transition-all uppercase tracking-tight"
            >
              Retry Quiz ({attemptsCount}/{maxAttempts})
            </button>
          )}
          <button
            onClick={() => toast.success('Results copied to clipboard')}
            className="w-full text-gray-400 font-label text-sm uppercase tracking-widest hover:text-white transition-colors py-2"
          >
            Share Results
          </button>
        </section>
      </main>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        .glow-score {
          box-shadow: 0 0 60px rgba(142, 255, 113, 0.15);
        }
        .font-headline {
          font-family: 'Manrope', 'Inter', sans-serif;
        }
        .font-body {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
};

export default QuizResultPage;