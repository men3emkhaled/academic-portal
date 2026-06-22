import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useStudentData } from '../context/StudentDataContext';
import studentApi from '../services/studentApi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';

const StudentQuizzes = () => {
  const { t, i18n } = useTranslation();
  const { student, logout } = useStudentAuth();
  const { quizzes, completedQuizzes, loadingQuizzes, fetchQuizzes } = useStudentData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('available');

  const isAr = i18n.language === 'ar';
  const loading = loadingQuizzes;

  useEffect(() => {
    if (!student) navigate('/student/login');
  }, [student, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/student/login');
    toast.success(`${t('sidebar.logout')} ${t('auth.success')}`);
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
          toast.error(data.message || t('common.n_a'));
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
    return matchesSearch;
  });

  const filteredCompleted = completedQuizzes.filter(item =>
    item.quiz_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.course_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const averageScore = useMemo(() => {
    if (!completedQuizzes.length) return 0;
    const validPercentages = completedQuizzes
      .map(c => c.percentage)
      .filter(p => typeof p === 'number' && !isNaN(p));
    if (!validPercentages.length) return 0;
    const sum = validPercentages.reduce((acc, curr) => acc + curr, 0);
    return (sum / validPercentages.length).toFixed(1).replace(/\.0$/, '');
  }, [completedQuizzes]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-white dark:bg-[#0c0c14]">
        <div className="w-12 h-12 border-2 border-gray-200 dark:border-white/10 border-t-[#34d399] rounded-full animate-spin"></div>
      </div>
    );
  }

  const mainQuiz = filteredQuizzes.length > 0 ? filteredQuizzes[0] : null;
  const otherQuizzes = filteredQuizzes.slice(1);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c14] text-gray-900 dark:text-white font-sans transition-colors duration-500 overflow-x-hidden relative" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] inset-inline-end-[-5%] w-[50vw] h-[50vw] bg-[#059669]/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] inset-inline-start-[-5%] w-[40vw] h-[40vw] bg-[#34d399]/3 blur-[100px] rounded-full"></div>
      </div>

      <Sidebar onLogout={handleLogout} />

      <main className="md:ps-72 min-h-screen relative z-10 flex flex-col">
        
        {/* HERO SECTION */}
        <section className="px-6 lg:px-10 pt-16 pb-12 max-w-[1500px] mx-auto w-full space-y-12">
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            <div className="space-y-4">
              <h1 className={`text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-[0.95] tracking-tighter uppercase text-gray-900 dark:text-white ${isAr ? 'font-arabic' : ''}`}>
                {t('mavi.knowledge')}
              </h1>
            </div>

            <div className="flex bg-white dark:bg-white/5 p-2 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl">
              <button
                onClick={() => setActiveTab('available')}
                className={`px-8 py-4 rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'available' ? 'bg-[#059669] dark:bg-[#34d399] text-white dark:text-black shadow-lg' : 'text-gray-400'}`}
              >
                {t('quizzes.available')}
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-8 py-4 rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'completed' ? 'bg-[#059669] dark:bg-[#34d399] text-white dark:text-black shadow-lg' : 'text-gray-400'}`}
              >
                {t('quizzes.completed')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
            
            {/* Stats Summary Bento Card */}
            <div className="lg:col-span-12 bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[3rem] p-12 flex flex-col md:flex-row justify-between gap-12 group hover:shadow-2xl transition-all duration-700">
               <div className="space-y-6 flex-1 text-start">
                  <span className="text-[9px] font-black uppercase tracking-[0.5em] text-gray-400 dark:text-white/30">{t('mavi.analytics_node')}</span>
                  <p className={`text-3xl font-black leading-tight tracking-tight ${isAr ? 'font-arabic' : ''}`}>
                    {t('mavi.quiz_desc')}
                  </p>
               </div>
               <div className="grid grid-cols-2 gap-10 md:w-1/2 border-t md:border-t-0 md:border-s border-gray-100 dark:border-white/5 pt-10 md:pt-0 md:ps-12 text-start">
                  <div className="space-y-1">
                     <span className="text-4xl font-black text-[#059669] dark:text-[#34d399]">{averageScore}%</span>
                     <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30">{t('quizzes.avg_score')}</p>
                  </div>
                  <div className="space-y-1">
                     <span className="text-4xl font-black text-gray-900 dark:text-white">{completedQuizzes.length}</span>
                     <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30">{t('quizzes.done')}</p>
                  </div>
                  <div className="space-y-1">
                     <span className="text-4xl font-black text-[#059669]">{quizzes.length}</span>
                     <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30">{t('quizzes.pending')}</p>
                  </div>
                  <div className="space-y-1">
                     <span className="text-4xl font-black text-gray-900 dark:text-white">#{student?.level}</span>
                     <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30">{t('mavi.sync_level')}</p>
                  </div>
               </div>
            </div>

            {/* QUIZZES MATRIX */}
            <div className="lg:col-span-12 space-y-8">
               
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                  <div className="flex flex-col text-start">
                    <h2 className={`text-3xl font-black uppercase tracking-tight ${isAr ? 'font-arabic' : ''}`}>
                      {activeTab === 'available' ? t('quizzes.available') : t('quizzes.completed')}
                    </h2>
                    <span className="text-[9px] font-black uppercase tracking-[0.5em] text-gray-400 dark:text-white/20">{t('mavi.ingestion_nodes')}</span>
                  </div>

                  <div className="relative group min-w-[300px]">
                     <input 
                        type="text"
                        placeholder={t('quizzes.search_placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-2xl py-4 px-6 font-black text-xs uppercase tracking-widest focus:ring-2 focus:ring-[#059669]/20 outline-none transition-all shadow-sm text-start"
                     />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {(activeTab === 'available' ? filteredQuizzes : filteredCompleted).length === 0 ? (
                    <div className="col-span-full py-32 bg-white dark:bg-[#0d0d14] border border-dashed border-gray-100 dark:border-white/10 rounded-[3rem] text-center opacity-40">
                       <h3 className="text-xl font-black uppercase tracking-[0.4em]">{t('common.no_data')}</h3>
                    </div>
                  ) : (
                    (activeTab === 'available' ? filteredQuizzes : filteredCompleted).map((quiz, idx) => {
                      const availability = activeTab === 'available' ? getQuizAvailability(quiz) : { available: false };
                      const isCompleted = activeTab === 'completed';

                      return (
                        <div 
                          key={quiz.id || idx}
                          className="group bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[3rem] p-10 space-y-10 hover:border-[#059669] dark:hover:border-[#34d399] transition-all duration-700 hover:-translate-y-1.5 hover:shadow-2xl shadow-sm relative overflow-hidden"
                        >
                          <div className="flex justify-between items-start">
                              {isCompleted ? (
                               <div className="text-4xl font-black tracking-tighter text-[#059669] dark:text-[#34d399]">{quiz.percentage}%</div>
                             ) : (
                               <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${availability.available ? 'bg-[#059669]/10 border-[#059669]/20 text-[#059669] dark:text-[#34d399]' : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-400'}`}>
                                  {availability.available ? t('mavi.ready') : t('mavi.locked')}
                               </div>
                             )}
                          </div>

                          <div className="space-y-2 text-start">
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">{isCompleted ? formatDate(quiz.completed_at) : quiz.course_name}</span>
                            <h3 className={`text-2xl font-black leading-tight uppercase tracking-tighter line-clamp-2 ${isAr ? 'font-arabic' : ''}`}>
                              {isCompleted ? quiz.quiz_title : quiz.title}
                            </h3>
                          </div>

                          {!isCompleted && (
                            <div className="grid grid-cols-2 gap-4 border-t border-black/5 dark:border-white/5 pt-8 text-start">
                               <div className="flex flex-col">
                                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('quizzes.mins')}</span>
                                   <span className="text-lg font-black text-gray-900 dark:text-white">{quiz.time_limit_minutes}m</span>
                                </div>
                                <div className="flex flex-col">
                                   <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('quizzes.tries')}</span>
                                   <span className="text-lg font-black text-gray-900 dark:text-white">{quiz.attempts_count || 0}/{quiz.max_attempts || 1}</span>
                               </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-auto">
                             {isCompleted ? (
                                <button 
                                   onClick={() => handleViewResult(quiz.quiz_id, quiz.attempt_id)}
                                   className="w-full py-4 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center gap-2 group-hover:bg-white/10 transition-colors text-[10px] font-black uppercase tracking-widest"
                                >
                                   {t('quizzes.review_answers')}
                                </button>
                             ) : (
                               availability.available ? (
                                <button 
                                   onClick={() => handleStartOrResume(quiz)}
                                   className="w-full py-4 bg-[#059669] dark:bg-[#34d399] text-white dark:text-black rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all text-[10px] font-black uppercase tracking-widest shadow-lg"
                                >
                                   {t('quizzes.start_assessment')}
                                </button>
                               ) : (
                                <div className="w-full py-4 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                   {t(availability.key, availability.params)}
                                </div>
                               )
                             )}
                          </div>
                        </div>
                      );
                    })
                  )}
               </div>
            </div>

          </div>
        </section>
      </main>


    </div>
  );
};

export default StudentQuizzes;