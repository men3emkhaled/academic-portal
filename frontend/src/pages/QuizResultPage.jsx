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
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-[#050505] transition-colors duration-500 overflow-hidden relative">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative flex items-center justify-center w-20 h-20 mb-6">
            <div className="absolute inset-0 border-4 border-emerald-500/20 dark:border-emerald-500/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center animate-pulse">
                <span className="text-xl font-black text-emerald-500">Z</span>
            </div>
          </div>
          <p className="text-gray-900 dark:text-white font-black text-[10px] uppercase tracking-[0.4em] mb-1 animate-pulse">ZNU PORTAL</p>
          <p className="text-gray-500 dark:text-gray-400 font-bold text-xs tracking-wide">جاري تحميل الجلسة...</p>
        </div>
      </div>
    );
  }

  if (!result || !result.answers || result.answers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark text-gray-900 dark:text-white flex flex-col items-center justify-center p-6 transition-colors duration-300">
        <p className="text-xl mb-4"><AlertCircle className="w-8 h-8 text-primary mx-auto mb-4" /> No results available</p>
        <button
          onClick={() => navigate('/student/quizzes')}
          className="px-6 py-3 bg-primary text-white dark:text-dark rounded-xl font-bold"
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
    <div className="min-h-screen bg-gray-50 dark:bg-dark text-gray-900 dark:text-white font-body transition-colors duration-300">
      <main className="pt-8 px-6 max-w-2xl mx-auto pb-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h2 className="font-headline font-extrabold text-4xl mb-8 tracking-tighter text-gray-900 dark:text-white flex justify-center items-center gap-3">
            {isPendingReview ? <><Clock className="w-8 h-8" /> Under Review</> : 'Quiz Completed!'}
          </h2>
          {isPendingReview ? (
            <div className="bg-white dark:bg-dark-glass rounded-2xl p-8 border border-primary/20 dark:border-primary/30 shadow-sm dark:shadow-none">
              <span className="text-6xl mb-4 block"><AlertCircle className="w-16 h-16 text-secondary mx-auto mb-4" /></span>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Your written answers are being reviewed.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                You will be notified once grading is complete.
              </p>
            </div>
          ) : (
            <>
              <div className="relative inline-flex items-center justify-center p-12 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-green-100 dark:border-[#002d0f] opacity-50 dark:opacity-20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin-slow opacity-40"></div>
                <div className="glow-score w-48 h-48 rounded-full bg-white dark:bg-dark-glass flex flex-col items-center justify-center relative z-10 border border-gray-200 dark:border-white/10/20 shadow-md dark:shadow-none">
                  <span className="font-headline font-black text-6xl text-primary drop-shadow-[0_0_15px_rgba(46,204,113,0.3)] dark:drop-shadow-[0_0_15px_rgba(142,255,113,0.4)]">
                    {percentage}%
                  </span>
                  <span className="font-label text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 mt-2">
                    Accuracy
                  </span>
                </div>
              </div>
              <div className="bg-white dark:bg-dark-card rounded-xl p-4 inline-block shadow-sm dark:shadow-none border border-gray-200 dark:border-transparent">
                <p className="font-headline font-bold text-xl">
                  Score: <span className="text-primary">{score}</span> / <span className="text-gray-500 dark:text-gray-400">{total_points}</span>
                </p>
              </div>
            </>
          )}
        </section>

        {/* Stats Bento */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white dark:bg-dark-glass p-6 rounded-xl border border-gray-200 dark:border-white/10/10 shadow-sm dark:shadow-none">
            <span className="text-2xl mb-2 block"><Clock className="w-6 h-6 text-gray-500 dark:text-gray-400" /></span>
            <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-1">Time Spent</p>
            <p className="font-headline font-bold text-xl text-gray-900 dark:text-white">{time_spent || '00:00'}</p>
          </div>
          <div className="bg-white dark:bg-dark-glass p-6 rounded-xl border border-gray-200 dark:border-white/10/10 shadow-sm dark:shadow-none">
            <span className="text-2xl mb-2 block"><Target className="w-6 h-6 text-primary" /></span>
            <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-1">Rank</p>
            <p className="font-headline font-bold text-xl text-gray-900 dark:text-white">
              {isPendingReview ? '—' : `#${rank || '-'}`}
            </p>
          </div>
        </div>

        {/* Tabs */}
        {!isPendingReview && (
          <div className="flex gap-4 border-b border-gray-200 dark:border-white/10 pb-3 mb-6">
            <button
              onClick={() => setActiveTab('review')}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition flex items-center gap-2 ${
                activeTab === 'review'
                  ? 'bg-primary text-white dark:text-dark shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <FileQuestion className="w-4 h-4" /> Review Answers
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition flex items-center gap-2 ${
                activeTab === 'leaderboard'
                  ? 'bg-primary text-white dark:text-dark shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <Activity className="w-4 h-4" /> Leaderboard
            </button>
          </div>
        )}

        {isPendingReview ? (
          <section className="space-y-6">
            <h3 className="font-headline font-bold text-xl mb-4 text-gray-900 dark:text-white">Your Submitted Answers</h3>
            {answers.map((ans, idx) => {
              if (!ans || !ans.question_id) return null;
              const hasText = ans.student_answer && ans.student_answer.trim() !== '';
              const hasImage = ans.written_answer_url && ans.written_answer_url.trim() !== '';
              
              return (
                <div
                  key={ans.question_id}
                  className="bg-white dark:bg-dark-glass rounded-xl p-6 border-l-4 border-yellow-400 dark:border-yellow-500/50 shadow-sm dark:shadow-none relative overflow-hidden"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-500 flex items-center justify-center shrink-0">
                      <span className="font-headline font-black">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-headline font-bold text-lg mb-4 text-gray-900 dark:text-white">
                        {ans.question_text}
                      </p>
                      
                      {hasText && (
                        <div className="mb-4 p-4 bg-gray-50 dark:bg-dark-card rounded-lg border border-gray-200 dark:border-white/10/30">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your written answer:</p>
                          <p className="text-gray-800 dark:text-white whitespace-pre-wrap">{ans.student_answer}</p>
                        </div>
                      )}
                      
                      {hasImage && (
                        <div className="mb-4">
                          <img
                            src={getDirectImageUrl(`${process.env.REACT_APP_API_URL || ''}${ans.written_answer_url}`)}
                            alt="Your answer"
                            className="max-h-64 rounded-lg border border-gray-200 dark:border-white/10/30 cursor-pointer shadow-sm"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/400x200/1a1a1a/8eff71?text=Image+Not+Available';
                            }}
                            onClick={() => window.open(`${process.env.REACT_APP_API_URL || ''}${ans.written_answer_url}`, '_blank')}
                          />
                        </div>
                      )}
                      
                      {!hasText && !hasImage && (
                        <p className="text-red-500 dark:text-red-400 text-sm font-medium">No answer provided</p>
                      )}
                      
                      <div className="mt-4 flex items-center gap-2 text-yellow-600 dark:text-yellow-500 font-medium">
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
            {answers.map((ans, idx) => {
              if (!ans || !ans.question_id) return null;
              const isCorrect = ans.is_correct;
              const studentAnswer = ans.student_answer;
              const correctAnswer = ans.correct_answer;

              return (
                <div
                  key={ans.question_id}
                  className={`bg-white dark:bg-dark-glass rounded-xl p-6 border-l-4 ${
                    isCorrect ? 'border-primary/80 dark:border-primary/50' : 'border-secondary/80 dark:border-secondary/50'
                  } shadow-sm dark:shadow-none relative overflow-hidden group`}
                >
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="text-8xl">{isCorrect ? <CheckCircle2 className="w-full h-full text-primary" /> : <AlertCircle className="w-full h-full text-secondary" />}</span>
                  </div>
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isCorrect ? 'bg-primary/10 dark:bg-primary/20 text-primary' : 'bg-secondary/10 dark:bg-secondary/20 text-secondary'
                      }`}
                    >
                      <span className="font-headline font-black">{idx + 1}</span>
                    </div>
                    <div className="flex-1 relative z-10">
                      <p className="font-headline font-bold text-lg mb-2 text-gray-900 dark:text-white">
                        {ans.question_text || 'Question text not available'}
                      </p>

                      {ans.image_url && (
                        <div className="mb-4">
                          <img
                            src={getDirectImageUrl(ans.image_url)}
                            alt="Question illustration"
                            className="max-h-48 rounded-lg border border-gray-200 dark:border-white/10/30"
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
                              className="max-h-64 rounded-lg border border-gray-200 dark:border-white/10/30 cursor-pointer shadow-sm"
                              onClick={() => window.open(`${process.env.REACT_APP_API_URL || ''}${ans.written_answer_url}`, '_blank')}
                            />
                          )}
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
                            Points: <span className="font-bold text-gray-900 dark:text-white">{ans.points_earned ?? 0}</span> / {ans.points ?? 0}
                          </p>
                        </div>
                      ) : ans.question_type === 'true_false' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div
                            className={`flex items-center gap-3 bg-gray-50 dark:bg-primary/10 p-3 rounded-lg border ${
                              isCorrect ? 'border-primary/30 dark:border-primary/20' : 'border-secondary/30 dark:border-secondary/20'
                            }`}
                          >
                            <span className="text-xl">{isCorrect ? <CheckCircle2 className="w-full h-full text-primary" /> : <AlertCircle className="w-full h-full text-secondary" />}</span>
                            <div>
                              <p className="text-[10px] uppercase text-gray-500 dark:text-gray-400 font-bold">Your Answer</p>
                              <p className={`font-bold ${isCorrect ? 'text-primary' : 'text-secondary'}`}>
                                {studentAnswer === 'true' ? 'True' : 'False'}
                              </p>
                            </div>
                          </div>
                          {!isCorrect && (
                            <div className="flex items-center gap-3 bg-primary/5 dark:bg-primary/10 p-3 rounded-lg border border-primary/20">
                              <span className="text-xl">✅</span>
                              <div>
                                <p className="text-[10px] uppercase text-gray-500 dark:text-gray-400 font-bold">Correct Answer</p>
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

                            let bgClass = 'bg-gray-50 dark:bg-primary/10';
                            let borderClass = 'border-gray-100 dark:border-transparent';
                            let textClass = 'text-gray-700 dark:text-white';

                            if (isCorrectChoice) {
                              bgClass = 'bg-primary/10';
                              borderClass = 'border-primary/40';
                              textClass = 'text-primary font-bold';
                            } else if (isStudentChoice && !isCorrectChoice) {
                              bgClass = 'bg-secondary/10';
                              borderClass = 'border-secondary/40';
                              textClass = 'text-secondary font-bold';
                            }

                            return (
                              <div
                                key={i}
                                className={`flex items-center gap-3 p-3 rounded-lg border ${bgClass} ${borderClass}`}
                              >
                                <span className="font-bold mr-2 text-gray-600 dark:text-gray-400">{letter}.</span>
                                <span className={textClass}>{opt}</span>
                                {isStudentChoice && (
                                  <span className="ml-auto text-xs text-gray-500 dark:text-gray-400 font-medium">(Your answer)</span>
                                )}
                                {isCorrectChoice && (
                                  <span className="ml-auto text-xs text-primary font-bold">✓ Correct</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {ans.explanation && (
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-dark-card rounded-lg border border-primary/20">
                          <p className="text-xs uppercase tracking-wider text-primary mb-1 font-bold flex items-center gap-1"><MonitorPlay className="w-4 h-4" /> Explanation</p>
                          <p className="text-sm text-gray-700 dark:text-gray-400">{ans.explanation}</p>
                        </div>
                      )}

                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 font-medium">
                        Points: <span className="font-bold text-gray-900 dark:text-white">{ans.points_earned ?? 0}</span> / {ans.points ?? 0}
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
              <p className="text-center text-gray-500 dark:text-gray-400 py-8 bg-white dark:bg-transparent rounded-2xl shadow-sm dark:shadow-none">No leaderboard data available.</p>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold px-4 py-2">
                  <div className="col-span-2">Rank</div>
                  <div className="col-span-5">Student</div>
                  <div className="col-span-3 text-right">Score</div>
                  <div className="col-span-2 text-right">Time</div>
                </div>
                {leaderboard.map((entry) => (
                  <div
                    key={entry.student_id}
                    className={`grid grid-cols-12 gap-2 items-center p-4 rounded-lg shadow-sm dark:shadow-none ${
                      entry.student_id === student_id
                        ? 'bg-primary/10 dark:bg-primary/20 border border-primary/30 dark:border-primary/50'
                        : 'bg-white dark:bg-dark-glass border border-gray-100 dark:border-transparent'
                    }`}
                  >
                    <div className="col-span-2 font-bold">
                      {entry.rank === 1 ? <span className="text-secondary font-black">#1</span> : entry.rank === 2 ? <span className="text-gray-500 dark:text-gray-400 font-black">#2</span> : entry.rank === 3 ? <span className="text-[#cd7f32] font-black">#3</span> : <span className="text-gray-700 dark:text-gray-300">#{entry.rank}</span>}
                    </div>
                    <div className="col-span-5 truncate font-medium text-gray-900 dark:text-white">{entry.student_name}</div>
                    <div className="col-span-3 text-right font-mono font-bold text-primary">
                      {entry.score} / {entry.total_points} ({entry.percentage}%)
                    </div>
                    <div className="col-span-2 text-right text-sm text-gray-500 dark:text-gray-400">
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
            className="w-full py-4 bg-primary text-white dark:text-dark font-headline font-extrabold text-lg rounded-xl shadow-[0_4px_15px_rgba(46,204,113,0.3)] dark:shadow-[0_12px_40px_rgba(var(--primary),0.25)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-tight"
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
            className="w-full text-gray-500 dark:text-gray-400 font-label text-sm font-bold uppercase tracking-widest hover:text-gray-900 dark:hover:text-white transition-colors py-2"
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
          box-shadow: 0 0 40px rgba(46, 204, 113, 0.2);
        }
        .dark .glow-score {
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