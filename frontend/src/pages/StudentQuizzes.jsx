import React, { useState, useEffect, useMemo } from 'react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useStudentData } from '../context/StudentDataContext';
import studentApi from '../services/studentApi';
import { ClipboardList, Search, Zap, Clock, RotateCcw, Calendar, CheckCircle2, FileQuestion, ArrowRight, PlayCircle, Eye, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';

const StudentQuizzes = () => {
  const { student, logout } = useStudentAuth();
  const { quizzes, completedQuizzes, loadingQuizzes, fetchQuizzes } = useStudentData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState(false);
  const [activeTab, setActiveTab] = useState('available');

  const loading = loadingQuizzes;

  useEffect(() => {
    if (!student) {
      navigate('/student/login');
    }
  }, [student, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/student/login');
    toast.success('Logged out successfully');
  };

  const handleStartOrResume = async (quiz) => {
    try {
      await studentApi.post(`/quizzes/${quiz.id}/start`, {});
      navigate(`/student/quizzes/${quiz.id}/take`);
    } catch (error) {
      if (error.response?.status === 403) {
        const data = error.response.data;
        if (data.reason === 'active_attempt_exists' && data.attempt_id) {
          if (window.confirm(`${data.message}\n\nDo you want to resume it?`)) {
            navigate(`/student/quizzes/${quiz.id}/take?resume=${data.attempt_id}`);
          }
        } else {
          toast.error(data.message || 'Quiz not available');
        }
      } else {
        toast.error('Failed to start quiz');
      }
    }
  };

  const handleViewResult = (quizId, attemptId) => {
    navigate(`/student/quizzes/${quizId}/result/${attemptId}`);
  };

  const getQuizAvailability = (quiz) => {
    const now = new Date();
    const startDate = quiz.start_date ? new Date(quiz.start_date) : null;
    const endDate = quiz.end_date ? new Date(quiz.end_date) : null;
    const attemptsCount = quiz.attempts_count || 0;
    const maxAttempts = quiz.max_attempts || 1;

    if (!quiz.is_published) return { available: false, reason: 'Not published yet' };
    if (startDate && now < startDate) return { available: false, reason: `Starts ${startDate.toLocaleString()}` };
    if (endDate && now > endDate) return { available: false, reason: 'Quiz has ended' };
    if (attemptsCount >= maxAttempts) return { available: false, reason: 'No attempts remaining' };
    return { available: true, reason: null };
  };

  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleString() : null;

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          quiz.course_name?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!filterActive) return matchesSearch;
    return matchesSearch && (!quiz.attempts || quiz.attempts.length === 0);
  });

  const filteredCompleted = completedQuizzes.filter(item =>
    item.quiz_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.course_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const completedCount = completedQuizzes.length;
  const pendingCount = quizzes.filter(q => !q.attempts || q.attempts.length === 0).length;

  const averageScore = useMemo(() => {
    if (!completedQuizzes.length) return 0;
    const validPercentages = completedQuizzes
      .map(c => c.percentage)
      .filter(p => typeof p === 'number' && !isNaN(p));
    if (!validPercentages.length) return 0;
    const sum = validPercentages.reduce((acc, curr) => acc + curr, 0);
    const avg = sum / validPercentages.length;
    return Number.isInteger(avg) ? avg : avg.toFixed(1).replace(/\.0$/, '');
  }, [completedQuizzes]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark flex items-center justify-center transition-colors duration-300">
        <Sidebar onLogout={handleLogout} />
        <div className="md:ml-64">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const mainQuiz = filteredQuizzes.length > 0 ? filteredQuizzes[0] : null;
  const sideQuizzes = filteredQuizzes.slice(1, 3);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark text-gray-900 dark:text-white font-body transition-colors duration-300">
      <Sidebar onLogout={handleLogout} />
      <div className="md:ml-64 pb-24 md:pb-8">
        <main className="pt-8 px-6 max-w-screen-xl mx-auto">
          <h1 className="font-headline text-4xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-white/70 leading-tight pb-2 mb-6">
            My Quizzes
          </h1>

          <div className="mb-8 overflow-x-auto no-scrollbar">
            <div className="flex gap-2 bg-white dark:bg-dark-glass p-2 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-lg whitespace-nowrap min-w-max w-fit">
              <button
                onClick={() => setActiveTab('available')}
                className={`px-4 py-2 rounded-xl font-body text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'available'
                    ? 'bg-primary text-white dark:text-dark shadow-[0_4px_10px_rgba(46,204,113,0.3)] dark:shadow-[0_8px_16px_rgba(142,255,113,0.25)] scale-[1.02]'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                <FileQuestion className="w-4 h-4" />
                <span>Available ({quizzes.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-4 py-2 rounded-xl font-body text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'completed'
                    ? 'bg-primary text-white dark:text-dark shadow-[0_4px_10px_rgba(46,204,113,0.3)] dark:shadow-[0_8px_16px_rgba(142,255,113,0.25)] scale-[1.02]'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Completed ({completedCount})</span>
              </button>
            </div>
          </div>

          {activeTab === 'available' && (
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-grow group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  className="w-full bg-white dark:bg-dark-glass text-gray-900 dark:text-white border border-gray-200 dark:border-white/5 rounded-2xl py-4 pl-12 pr-4 font-body font-semibold focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-sm dark:shadow-lg"
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={() => setFilterActive(!filterActive)}
                className={`px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm dark:shadow-lg border ${
                  filterActive 
                    ? 'bg-primary/10 border-primary/40 text-primary shadow-[0_0_20px_rgba(46,204,113,0.15)] dark:shadow-[0_0_20px_rgba(142,255,113,0.15)]' 
                    : 'bg-white dark:bg-dark-glass border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/10'
                }`}
              >
                <Zap className={`w-5 h-5 ${filterActive ? 'fill-primary/20' : ''}`} />
                <span>Active Only</span>
              </button>
            </div>
          )}

          {activeTab === 'available' && (
            filteredQuizzes.length === 0 ? (
              <div className="text-center py-16 text-gray-500 dark:text-gray-400">No quizzes available.</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {mainQuiz && (() => {
                  const availability = getQuizAvailability(mainQuiz);
                  return (
                    <div className="lg:col-span-8 group relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/10 dark:from-primary/20 to-secondary/10 dark:to-secondary/20 rounded-[2rem] blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                      <div className="relative bg-white dark:bg-dark-card rounded-[2rem] p-8 shadow-md dark:shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 dark:bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/20 dark:group-hover:bg-primary/10 transition-colors"></div>
                        <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
                          <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
                              <Zap className="w-3.5 h-3.5 fill-primary/40" /> Featured Quiz
                            </div>
                            <h3 className="text-4xl font-headline font-extrabold text-gray-900 dark:text-white leading-tight">{mainQuiz.title}</h3>
                            
                            <div className="flex flex-wrap gap-4">
                              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 text-sm font-medium border border-gray-200 dark:border-white/5">
                                <Clock className="w-4 h-4 text-primary" />
                                <span>{mainQuiz.time_limit_minutes} min</span>
                              </div>
                              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 text-sm font-medium border border-gray-200 dark:border-white/5">
                                <RotateCcw className="w-4 h-4 text-primary" />
                                <span>{mainQuiz.attempts_count || 0}/{mainQuiz.max_attempts || 1} attempts</span>
                              </div>
                            </div>
                            
                            {(mainQuiz.start_date || mainQuiz.end_date) && (
                              <div className="flex flex-col gap-2 text-xs text-gray-500 dark:text-gray-400 mt-2">
                                {mainQuiz.start_date && <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> <span>Starts: {formatDate(mainQuiz.start_date)}</span></div>}
                                {mainQuiz.end_date && <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> <span>Ends: {formatDate(mainQuiz.end_date)}</span></div>}
                              </div>
                            )}
                          </div>
                          <div className="w-full md:w-auto flex flex-col justify-center shrink-0">
                            {availability.available ? (
                              <button
                                onClick={() => handleStartOrResume(mainQuiz)}
                                className="w-full md:w-48 bg-primary hover:bg-primary/90 text-white dark:text-dark font-extrabold px-8 py-5 rounded-2xl shadow-[0_8px_24px_rgba(46,204,113,0.3)] dark:shadow-[0_8px_24px_rgba(142,255,113,0.3)] hover:shadow-[0_12px_32px_rgba(46,204,113,0.4)] dark:hover:shadow-[0_12px_32px_rgba(142,255,113,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                              >
                                <span>Start Quiz</span>
                                <ArrowRight className="w-5 h-5" />
                              </button>
                            ) : (
                              <div className="w-full md:w-48 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 font-bold px-6 py-5 rounded-2xl text-center flex items-center justify-center gap-2">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <span className="text-sm">{availability.reason}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {mainQuiz.attempts?.length > 0 && (
                          <div className="border-t border-gray-200 dark:border-white/10 pt-6 mt-4">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><RotateCcw className="w-4 h-4 text-primary"/> Previous attempts</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {mainQuiz.attempts.slice(0, 2).map((att) => (
                                <div key={att.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-dark-glass rounded-xl border border-gray-200 dark:border-white/5 hover:border-primary/20 transition-colors">
                                  <div>
                                    <div className="flex items-end gap-2 mb-1">
                                      <span className="text-xl font-bold text-gray-900 dark:text-white">{att.percentage}%</span>
                                      <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">({att.score}/{att.total_points})</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                                      <Calendar className="w-3 h-3" />
                                      <span>{new Date(att.completed_at).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleViewResult(mainQuiz.id, att.id)}
                                    className="p-2.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white dark:hover:text-dark transition-colors"
                                    title="View Result"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                <div className="lg:col-span-4 space-y-4">
                  {sideQuizzes.map((quiz) => {
                    const availability = getQuizAvailability(quiz);
                    return (
                      <div key={quiz.id} className="bg-white dark:bg-dark-card rounded-[1.5rem] p-5 border border-gray-200 dark:border-white/5 hover:border-primary/30 dark:hover:border-primary/30 hover:-translate-y-1 transition-all group shadow-sm dark:shadow-lg">
                        <h4 className="font-headline font-bold text-lg text-gray-900 dark:text-white mb-1 leading-snug">{quiz.title}</h4>
                        <p className="text-xs text-primary/90 dark:text-primary/80 font-medium mb-4">{quiz.course_name}</p>
                        <div className="flex justify-between items-end mt-3 border-t border-gray-100 dark:border-white/5 pt-4">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{quiz.attempts_count || 0}/{quiz.max_attempts || 1} attempts</span>
                          </div>
                          {availability.available ? (
                            <button
                              onClick={() => handleStartOrResume(quiz)}
                              className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white dark:group-hover:text-dark transition-colors"
                              title="Start Quiz"
                            >
                              <PlayCircle className="w-5 h-5" />
                            </button>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-600 text-xs flex items-center gap-1" title={availability.reason}><Clock className="w-3.5 h-3.5"/> N/A</span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  <div className="bg-white dark:bg-dark-card rounded-[1.5rem] p-6 border border-gray-200 dark:border-white/5 relative overflow-hidden shadow-sm dark:shadow-lg mt-4">
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-primary/10 dark:bg-primary/5 rounded-full blur-2xl"></div>
                    <h4 className="font-headline font-bold text-sm uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-5">Your Stats</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl">
                        <div className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 text-gray-400" /> <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">Completed</span></div>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">{completedCount}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-primary/[0.05] border border-primary/10 rounded-2xl">
                        <div className="flex items-center gap-3"><FileQuestion className="w-4 h-4 text-primary" /> <span className="text-sm text-primary font-medium">Pending</span></div>
                        <span className="text-lg font-bold text-primary">{pendingCount}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-secondary/[0.05] border border-secondary/10 rounded-2xl">
                        <div className="flex items-center gap-3"><Zap className="w-4 h-4 text-secondary/80" /> <span className="text-sm text-secondary/80 font-medium">Avg Score</span></div>
                        <span className="text-lg font-bold text-secondary">{averageScore}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}

          {activeTab === 'completed' && (
            filteredCompleted.length === 0 ? (
              <div className="text-center py-16 text-gray-500 dark:text-gray-400">No completed quizzes yet.</div>
            ) : (
              <div className="space-y-4">
                {filteredCompleted.map((item) => (
                  <div key={item.attempt_id} className="group flex flex-col sm:flex-row items-center gap-6 p-6 bg-white dark:bg-dark-card rounded-[2rem] border border-gray-200 dark:border-white/5 hover:border-primary/30 dark:hover:border-primary/30 hover:shadow-[0_4px_20px_rgba(46,204,113,0.1)] dark:hover:shadow-[0_12px_40px_rgba(142,255,113,0.1)] shadow-sm dark:shadow-none transition-all duration-300">
                    <div className="w-16 h-16 shrink-0 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/10 group-hover:border-primary/20 group-hover:text-primary transition-all">
                      <CheckCircle2 className="w-8 h-8 text-gray-300 dark:text-gray-400 group-hover:text-primary" />
                    </div>
                    
                    <div className="flex-1 text-center sm:text-left w-full sm:w-auto">
                      <h4 className="font-headline font-bold text-xl text-gray-900 dark:text-white mb-1">{item.quiz_title}</h4>
                      <p className="text-sm text-primary/90 dark:text-primary/80 font-medium mb-2">{item.course_name}</p>
                      <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Completed: {new Date(item.completed_at).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-white/10">
                      <div className="text-center sm:text-right">
                        <p className={`text-3xl font-headline font-black tracking-tight ${item.percentage >= (item.passing_score || 50) ? 'text-[#22c55e] dark:text-[#8eff71]' : 'text-[#ef4444] dark:text-[#ff7351]'}`}>
                          {item.percentage}%
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1 uppercase tracking-wider">Score: {item.score}/{item.total_points}</p>
                      </div>
                      <button
                        onClick={() => handleViewResult(item.quiz_id, item.attempt_id)}
                        className="w-full sm:w-12 h-12 shrink-0 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-white flex items-center justify-center gap-2 hover:bg-primary hover:text-white dark:hover:text-dark transition-colors shadow-sm dark:shadow-inner"
                        title="Review Answers"
                      >
                        <span className="sm:hidden font-bold">Review</span>
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </main>
      </div>

      <style>{`
        .font-headline { font-family: 'Manrope', 'Inter', sans-serif; }
        .bg-dark-glass { background: rgba(17, 17, 17, 0.7); backdrop-filter: blur(12px); }
      `}</style>
    </div>
  );
};

export default StudentQuizzes;