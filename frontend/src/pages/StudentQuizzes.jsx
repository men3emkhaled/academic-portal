import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useStudentData } from '../context/StudentDataContext';
import studentApi from '../services/studentApi';
import { ClipboardList, Search, Zap, Clock, RotateCcw, Calendar, CheckCircle2, FileQuestion, ArrowRight, PlayCircle, Eye, AlertCircle, Target, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';

const StudentQuizzes = () => {
  const { t, i18n } = useTranslation();
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
    toast.success(t('sidebar.logout') + ' ' + t('auth.success'));
  };

  const handleStartOrResume = async (quiz) => {
    try {
      await studentApi.post(`/quizzes/${quiz.id}/start`, {});
      navigate(`/student/quizzes/${quiz.id}/take`);
    } catch (error) {
      if (error.response?.status === 403) {
        const data = error.response.data;
        if (data.reason === 'active_attempt_exists' && data.attempt_id) {
          if (window.confirm(`${data.message}\n\n${t('quizzes.resume_confirm')}`)) {
            navigate(`/student/quizzes/${quiz.id}/take?resume=${data.attempt_id}`);
          }
        } else {
          toast.error(data.message || 'Quiz not available');
        }
      } else {
        toast.error(t('quizzes.start_failed'));
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

    if (!quiz.is_published) return { available: false, key: 'quizzes.status_not_published' };
    if (startDate && now < startDate) return { available: false, key: 'quizzes.status_starts', params: { date: startDate.toLocaleDateString() } };
    if (endDate && now > endDate) return { available: false, key: 'quizzes.status_ended' };
    if (attemptsCount >= maxAttempts) return { available: false, key: 'quizzes.status_no_attempts' };
    return { available: true, key: null };
  };

  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : null;

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
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-500 overflow-hidden relative">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400 font-bold text-xs tracking-wide">{t('quizzes.loading')}</p>
        </div>
      </div>
    );
  }

  const mainQuiz = filteredQuizzes.length > 0 ? filteredQuizzes[0] : null;
  const sideQuizzes = filteredQuizzes.slice(1, 4);

  // Circular Score Gauge for Completed list
  const ScoreGauge = ({ percentage, passing }) => {
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    const isPassed = percentage >= (passing || 50);
    const colorClass = isPassed ? "text-emerald-500" : "text-rose-500";
    
    return (
      <div className="relative flex items-center justify-center w-16 h-16">
        <svg viewBox="0 0 60 60" className="transform -rotate-90 w-16 h-16 overflow-visible">
          <circle cx="30" cy="30" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100 dark:text-white/5" />
          <circle cx="30" cy="30" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            strokeLinecap="round" className={`${colorClass} transition-all duration-1000 ease-out`} />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-sm font-black ${colorClass}`}>{percentage}%</span>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'available', label: t('quizzes.available'), icon: <FileQuestion className="w-4 h-4" />, count: quizzes.length },
    { id: 'completed', label: t('quizzes.completed'), icon: <CheckCircle2 className="w-4 h-4" />, count: completedCount }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white font-sans transition-colors duration-500 relative overflow-hidden">
      {/* Background Ambient Orbs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 dark:bg-primary/10 blur-[150px] rounded-full mix-blend-multiply dark:mix-blend-screen"></div>
      </div>

      <Sidebar activePage="quizzes" onLogout={handleLogout} />

      <div className="md:ps-96 pb-24 md:pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-2xl border border-primary/20 shadow-sm">
              <ClipboardList className="w-8 h-8 text-primary" />
            </div>
            <div className="text-start">
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">{t('quizzes.title')}</h1>
              <p className="text-gray-500 dark:text-gray-400 font-semibold mt-1">{t('quizzes.desc')}</p>
            </div>
          </div>

          {/* Search and Tabs */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            {/* Segmented Tabs */}
            <div className="flex p-1.5 bg-gray-200/50 dark:bg-white/5 backdrop-blur-xl rounded-[1.5rem] border border-gray-200/50 dark:border-white/5 shadow-inner">
              {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 outline-none ${
                      isActive 
                        ? 'text-gray-900 dark:text-white shadow-md' 
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-white/5'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-white dark:bg-[#222] rounded-xl shadow-sm transition-all animate-in zoom-in-95 duration-200"></div>
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <span className={isActive ? 'text-primary' : ''}>{tab.icon}</span>
                      {tab.label}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${isActive ? 'bg-primary/10 text-primary' : 'bg-gray-300/50 dark:bg-white/10'}`}>{tab.count}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-80 group">
              <div className="absolute inset-y-0 start-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                className="w-full bg-white dark:bg-[#111] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl py-3 ps-12 pe-4 font-bold focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all placeholder:text-gray-400 shadow-sm text-start"
                placeholder={t('quizzes.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {activeTab === 'available' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
              {filteredQuizzes.length === 0 ? (
                <div className="col-span-full py-20 bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-[2rem] border-2 border-dashed border-gray-300 dark:border-white/10 text-center shadow-sm">
                  <FileQuestion className="w-12 h-12 text-gray-400 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-500 dark:text-gray-400 text-xl font-bold">{t('quizzes.no_available')}</p>
                </div>
              ) : (
                <>
                  {/* Cinematic Featured Quiz */}
                  {mainQuiz && (() => {
                    const availability = getQuizAvailability(mainQuiz);
                    return (
                      <div className="lg:col-span-2 relative rounded-[2.5rem] bg-white dark:bg-[#111] border border-gray-200 dark:border-transparent overflow-hidden shadow-md dark:shadow-2xl group flex flex-col justify-between">
                        {/* Background Effects */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-blue-500/10 mix-blend-screen opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none mix-blend-screen"></div>

                        <div className="relative z-10 p-8 sm:p-12 text-start">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/20 border border-primary/30 text-primary text-xs font-black uppercase tracking-widest mb-6">
                            <Zap className="w-4 h-4 fill-primary" /> {t('quizzes.up_next')}
                          </div>
                          
                          <h2 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-4">{mainQuiz.title}</h2>
                          <p className="text-gray-500 dark:text-gray-400 text-lg font-semibold mb-8">{mainQuiz.course_name}</p>

                          <div className="flex flex-wrap gap-4 mb-10">
                            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50/80 dark:bg-white/10 backdrop-blur-md text-gray-700 dark:text-white text-sm font-bold border border-gray-200 dark:border-white/10">
                              <Clock className="w-4 h-4 text-primary" />
                              <span>{mainQuiz.time_limit_minutes} {t('quizzes.mins')}</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50/80 dark:bg-white/10 backdrop-blur-md text-gray-700 dark:text-white text-sm font-bold border border-gray-200 dark:border-white/10">
                              <RotateCcw className="w-4 h-4 text-primary" />
                              <span>{mainQuiz.attempts_count || 0}/{mainQuiz.max_attempts || 1} {t('quizzes.tries')}</span>
                            </div>
                            {(mainQuiz.start_date || mainQuiz.end_date) && (
                              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50/80 dark:bg-white/10 backdrop-blur-md text-gray-700 dark:text-white text-sm font-bold border border-gray-200 dark:border-white/10">
                                <Calendar className="w-4 h-4 text-primary" />
                                <span>{mainQuiz.end_date ? `${t('quizzes.due')} ${formatDate(mainQuiz.end_date)}` : `${t('quizzes.starts')} ${formatDate(mainQuiz.start_date)}`}</span>
                              </div>
                            )}
                          </div>

                          {availability.available ? (
                            <button
                              onClick={() => handleStartOrResume(mainQuiz)}
                              className="group/btn relative inline-flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-gray-900 font-black text-lg px-8 py-4 rounded-2xl shadow-[0_0_40px_rgba(46,204,113,0.4)] hover:shadow-[0_0_60px_rgba(46,204,113,0.6)] transition-all hover:scale-105 active:scale-95"
                            >
                              <PlayCircle className="w-6 h-6 rtl:rotate-180" /> {t('quizzes.start_assessment')}
                            </button>
                          ) : (
                            <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-bold px-8 py-4 rounded-2xl">
                              <AlertCircle className="w-5 h-5" /> {t(availability.key, availability.params)}
                            </div>
                          )}
                        </div>

                        {/* Previous Attempts Bar inside Featured Quiz */}
                        {mainQuiz.attempts?.length > 0 && (
                          <div className="relative z-10 bg-gray-50/80 dark:bg-black/40 backdrop-blur-md border-t border-gray-100 dark:border-white/10 p-6 sm:px-12 text-start">
                            <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">{t('quizzes.past_attempts')}</h4>
                            <div className="flex flex-wrap gap-4">
                              {mainQuiz.attempts.slice(0, 2).map((att) => (
                                <div key={att.id} className="flex items-center gap-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 hover:border-primary/30 transition-colors">
                                  <div>
                                    <span className="text-gray-900 dark:text-white font-bold text-lg">{att.percentage}%</span>
                                    <span className="text-gray-500 text-xs ms-2">({att.score}/{att.total_points})</span>
                                  </div>
                                  <button onClick={() => handleViewResult(mainQuiz.id, att.id)} className="p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary hover:text-gray-900 transition-colors">
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Right Column: Stats & Side Quizzes */}
                  <div className="lg:col-span-1 space-y-6 flex flex-col">
                    
                    {/* Bento Box Stats */}
                    <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl rounded-[2rem] border border-gray-200 dark:border-white/10 p-6 shadow-sm text-start">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">{t('quizzes.quick_stats')}</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-200/50 dark:border-white/5">
                          <div className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {t('quizzes.done')}
                          </div>
                          <span className="text-lg font-black text-gray-900 dark:text-white">{completedCount}</span>
                        </div>
                        <div className="flex justify-between items-center bg-primary/5 dark:bg-primary/10 p-3 rounded-xl border border-primary/20">
                          <div className="flex items-center gap-2 text-sm font-bold text-primary">
                            <FileQuestion className="w-4 h-4" /> {t('quizzes.pending')}
                          </div>
                          <span className="text-lg font-black text-primary">{pendingCount}</span>
                        </div>
                        <div className="flex justify-between items-center bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-200/50 dark:border-white/5">
                          <div className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300">
                            <Award className="w-4 h-4 text-amber-500" /> {t('quizzes.avg_score')}
                          </div>
                          <span className="text-lg font-black text-gray-900 dark:text-white">{averageScore}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Side Quizzes List */}
                    <div className="flex-1 space-y-4">
                      {sideQuizzes.map((quiz) => {
                        const availability = getQuizAvailability(quiz);
                        return (
                          <div key={quiz.id} className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl rounded-[2rem] p-6 border border-gray-200 dark:border-white/10 hover:shadow-xl hover:-translate-y-1 transition-all group shadow-sm flex flex-col justify-between h-[160px] text-start">
                            <div>
                              <h4 className="font-black text-gray-900 dark:text-white mb-1 line-clamp-1">{quiz.title}</h4>
                              <p className="text-xs text-primary font-bold">{quiz.course_name}</p>
                            </div>
                            <div className="flex justify-between items-end border-t border-gray-100 dark:border-white/5 pt-3">
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-bold">
                                {quiz.time_limit_minutes} {t('quizzes.mins')}
                              </span>
                              {availability.available ? (
                                <button
                                  onClick={() => handleStartOrResume(quiz)}
                                  className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white dark:hover:text-dark transition-colors"
                                >
                                  <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                                </button>
                              ) : (
                                <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> {t('quizzes.n_a')}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'completed' && (
            <div className="mt-8">
              {filteredCompleted.length === 0 ? (
                <div className="col-span-full py-20 bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-[2rem] border-2 border-dashed border-gray-300 dark:border-white/10 text-center shadow-sm">
                  <CheckCircle2 className="w-12 h-12 text-gray-400 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-500 dark:text-gray-400 text-xl font-bold">{t('quizzes.no_completed')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredCompleted.map((item) => (
                    <div key={item.attempt_id} className="group flex items-center gap-5 p-6 bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl rounded-[2rem] border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-start">
                      
                      {/* Circular Gauge Score */}
                      <ScoreGauge percentage={item.percentage} passing={item.passing_score} />
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-lg text-gray-900 dark:text-white truncate">{item.quiz_title}</h4>
                        <p className="text-sm text-primary font-bold truncate mb-1">{item.course_name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(item.completed_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleViewResult(item.quiz_id, item.attempt_id)}
                        className="w-12 h-12 shrink-0 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 flex items-center justify-center group-hover:bg-primary group-hover:text-white dark:group-hover:text-dark group-hover:border-primary transition-all"
                        title={t('quizzes.review_answers')}
                      >
                        <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default StudentQuizzes;