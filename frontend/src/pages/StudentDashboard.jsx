import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, TrendingUp, ShieldCheck, Info, ExternalLink, 
  GraduationCap, Layers, Users, ChevronRight, BookOpen, 
  Bell, ListTodo, CheckCircle2, Circle, Clock, LayoutDashboard, 
  CalendarDays, ArrowRight, Zap, Star, X, MousePointer2
} from 'lucide-react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useStudentData } from '../context/StudentDataContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import studentApi from '../services/studentApi';
import { useTheme } from '../context/ThemeContext';
import { transliterateArabic } from '../utils/transliteration';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'dashboard.greeting_morning';
  if (hour < 18) return 'dashboard.greeting_afternoon';
  return 'dashboard.greeting_evening';
};

const StudentDashboard = () => {
  const { student, logout } = useStudentAuth();
  const { t, i18n } = useTranslation();
  const { isDarkMode } = useTheme();
  const {
    gradesData, loadingGrades,
    notifications: allNotifications, loadingNotifications, markNotificationAsRead,
    officialTasks, loadingOfficialTasks, fetchOfficialTasks,
    tasks: personalTasks, loadingTasks, fetchTasks
  } = useStudentData();
  const navigate = useNavigate();

  const [greeting, setGreeting] = useState('');
  const [isCardExpanded, setIsCardExpanded] = useState(false);

  useEffect(() => {
    setGreeting(t(getGreeting()));
    const interval = setInterval(() => setGreeting(t(getGreeting())), 60000);
    return () => clearInterval(interval);
  }, [t]);

  const notifications = useMemo(() => {
    return allNotifications.slice(0, 3);
  }, [allNotifications]);

  const grades = gradesData.grades || [];
  const loading = loadingGrades;
  const notifLoading = loadingNotifications;

  const pendingOfficial = officialTasks.filter(t => !t.is_completed) || [];
  const pendingPersonal = personalTasks.filter(t => !t.is_completed) || [];
  const totalPendingTasks = pendingOfficial.length + pendingPersonal.length;

  useEffect(() => {
    if (!student) navigate('/student/login');
  }, [student, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/student/login');
    toast.success(`${t('sidebar.logout')} ${t('auth.success')}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return t('common.today');
    if (days === 1) return t('common.yesterday');
    return t('common.days_ago', { count: days });
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-white dark:bg-[#0c0c14]">
        <div className="w-12 h-12 border-2 border-gray-200 dark:border-white/10 border-t-[#2cfc7d] rounded-full animate-spin"></div>
      </div>
    );
  }

  const isAr = i18n.language === 'ar';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c14] text-gray-900 dark:text-white font-sans transition-colors duration-500 overflow-x-hidden relative" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] inset-inline-end-[-5%] w-[50vw] h-[50vw] bg-[#8b5cf6]/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] inset-inline-start-[-5%] w-[40vw] h-[40vw] bg-[#2cfc7d]/3 blur-[100px] rounded-full"></div>
      </div>

      <Sidebar onLogout={handleLogout} />

      <main className="md:ps-72 min-h-screen relative z-10 flex flex-col">
        
        {/* HERO SECTION */}
        <section className="px-6 lg:px-10 pt-16 pb-12 max-w-[1500px] mx-auto w-full space-y-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            <div className="space-y-4 max-w-2xl text-start">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2cfc7d]"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30">{t('sidebar.dashboard')}</span>
              </div>
              <h1 className={`text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-[0.95] tracking-tighter uppercase text-gray-900 dark:text-white ${isAr ? 'font-arabic' : ''}`}>
                {t('sidebar.dashboard')}
              </h1>
            </div>

            <div className="relative group shrink-0">
              <button 
                onClick={() => setIsCardExpanded(true)}
                className="w-36 h-36 rounded-full bg-[#8b5cf6] dark:bg-[#d4a3ff] text-white dark:text-black flex flex-col items-center justify-center gap-2 hover:scale-105 hover:rotate-6 transition-all duration-500 shadow-xl group"
              >
                <MousePointer2 className="w-5 h-5" />
                <span className="text-[8px] font-black uppercase tracking-widest text-center px-4 leading-tight">
                  {t('dashboard.id_card')}
                </span>
              </button>
              <div className="absolute -top-1 -inset-inline-end-1 bg-[#10b981] dark:bg-[#2cfc7d] text-white dark:text-black px-4 py-1.5 rounded-2xl font-black text-lg shadow-lg rotate-12">
                #{student?.level}
              </div>
            </div>
          </div>

          {/* MAIN BENTO GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
            
            {/* Summary Row */}
            <div className="lg:col-span-12 bg-white dark:bg-[#151520] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-10 text-gray-900 dark:text-white flex flex-col md:flex-row justify-between gap-10 group transition-all duration-500 hover:shadow-2xl">
              <div className="space-y-6 flex-1">
                <p className={`text-[1.8rem] font-black leading-[1.1] tracking-tight ${isAr ? 'font-arabic' : ''}`}>
                  {t('mavi.grades_desc')}
                </p>
              </div>
              <div className="md:w-1/3 flex flex-col justify-between border-t md:border-t-0 md:border-s border-black/5 dark:border-white/5 pt-6 md:pt-0 md:ps-10">
                 <div className="space-y-0">
                    <span className="text-5xl font-black text-[#10b981] dark:text-[#2cfc7d]">{grades.length}</span>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30">{t('dashboard.enrolled_courses')}</p>
                 </div>
                 <div className="space-y-0 mt-6">
                    <span className="text-2xl font-black text-gray-900 dark:text-white">{student?.section || 'N/A'}</span>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30">{t('dashboard.section')}</p>
                 </div>
              </div>
            </div>

            {/* FULL WIDTH COURSES MATRIX - NO SCROLLING */}
            <div className="lg:col-span-12 space-y-8">
               <div className="flex items-center justify-between px-2">
                  <div className="flex flex-col">
                    <h2 className={`text-[clamp(1.5rem,3vw,2.5rem)] font-black uppercase tracking-tight ${isAr ? 'font-arabic' : ''}`}>
                      {t('dashboard.active_courses')}
                    </h2>
                  </div>
                  <div className="bg-[#10b981]/10 dark:bg-[#2cfc7d]/10 px-4 py-2 rounded-xl text-[#10b981] dark:text-[#2cfc7d] text-xs font-black">
                     {grades.length}
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {grades.map((grade, idx) => (
                    <div 
                      key={idx}
                      onClick={() => navigate(`/student/course/${grade.course_id}`)}
                      className="group bg-white dark:bg-[#151520] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8 space-y-8 cursor-pointer hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                         <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-[#2cfc7d]/10 flex items-center justify-center text-[#10b981] dark:text-[#2cfc7d] group-hover:bg-emerald-500 dark:group-hover:bg-black group-hover:text-white transition-all duration-500">
                            <BookOpen className="w-6 h-6" />
                         </div>
                         <div className="w-10 h-10 rounded-full border border-gray-100 dark:border-white/10 flex items-center justify-center group-hover:border-white/30 transition-all duration-500">
                            <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                         </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className={`text-2xl font-black leading-tight uppercase tracking-tighter ${isAr ? 'font-arabic' : ''}`}>
                          {grade.course_name}
                        </h3>
                      </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Bottom Row: Pending Tasks Large */}
            <div className="lg:col-span-12 bg-[#2cfc7d] rounded-[2.5rem] p-12 text-black flex flex-col md:flex-row items-center justify-between gap-10 group overflow-hidden relative shadow-2xl">
               <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-transparent pointer-events-none" />
               <div className="space-y-4 relative z-10 text-center md:text-start">
                 <h3 className="text-[3rem] lg:text-[4rem] font-black uppercase italic leading-none">{t('dashboard.pending_tasks')}</h3>
               </div>
               <div className="flex items-center gap-12 relative z-10">
                 <span className="text-[6rem] lg:text-[8rem] font-black tracking-tighter leading-none">{totalPendingTasks}</span>
                 <button 
                  onClick={() => navigate('/student/personal-tasks')}
                  className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl"
                 >
                   <ChevronRight className={`w-8 h-8 ${isAr ? 'rotate-180' : ''}`} />
                 </button>
               </div>
            </div>

          </div>
        </section>
      </main>

      {/* ID MODAL */}
      {isCardExpanded && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 dark:bg-black/95 backdrop-blur-md" onClick={() => setIsCardExpanded(false)} />
          <div className="relative w-full max-w-[500px] bg-white dark:bg-[#0c0c14] border border-gray-200 dark:border-white/10 rounded-[3.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="h-3 bg-gradient-to-r from-[#10b981] via-[#8b5cf6] to-[#10b981] dark:from-[#2cfc7d] dark:via-[#d4a3ff] dark:to-[#2cfc7d]"></div>
            <div className="p-10 flex flex-col items-center text-center space-y-8">
               <div className="w-full flex items-center justify-between opacity-50">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">ZNU-{student?.id}</span>
                  <ShieldCheck className="w-4 h-4 text-[#10b981] dark:text-[#2cfc7d]" />
               </div>

              <div className="w-32 h-32 rounded-full border-4 border-gray-100 dark:border-white/5 p-1 bg-gray-50 dark:bg-white/5 shadow-inner">
                {student?.avatar_url ? (
                  <img src={student.avatar_url} alt={student.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-black text-gray-200 dark:text-white/5">{student?.name?.charAt(0)}</div>
                )}
              </div>

              <div className="space-y-1">
                <h2 className={`text-4xl font-black uppercase text-gray-900 dark:text-white tracking-tighter ${isAr ? 'font-arabic' : ''}`}>
                  {isAr ? student?.name : transliterateArabic(student?.name)}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full">
                 <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5">
                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 block mb-2">{t('settings.level')}</span>
                    <span className="text-xs font-black uppercase text-gray-900 dark:text-white">
                        {isAr ? (
                           student?.level === 1 ? 'الفرقة الأولى' :
                           student?.level === 2 ? 'الفرقة الثانية' :
                           student?.level === 3 ? 'الفرقة الثالثة' :
                           student?.level === 4 ? 'الفرقة الرابعة' : `الفرقة ${student?.level}`
                        ) : (
                           student?.level === 1 ? 'First Year' :
                           student?.level === 2 ? 'Second Year' :
                           student?.level === 3 ? 'Third Year' :
                           student?.level === 4 ? 'Fourth Year' : `Year ${student?.level}`
                        )}
                    </span>
                 </div>
                 <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5">
                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 block mb-2">{t('settings.section')}</span>
                    <span className="text-xs font-black uppercase text-gray-900 dark:text-white">{student?.section || '3'}</span>
                 </div>
              </div>

              <div className="bg-[#8b5cf6] dark:bg-[#d4a3ff] w-full p-6 rounded-[2.5rem] shadow-xl shadow-purple-500/10">
                 <span className="text-[8px] font-black uppercase tracking-widest text-white/40 dark:text-black/40 block mb-1">{t('dashboard.dept')}</span>
                 <span className="text-xl font-black uppercase text-white dark:text-black">{student?.department_name || 'Artificial Intelligence'}</span>
              </div>

              <button onClick={() => setIsCardExpanded(false)} className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
        .font-arabic { font-family: 'Cairo', sans-serif !important; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default StudentDashboard;