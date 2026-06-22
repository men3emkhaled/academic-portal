import React, { useEffect, useState } from 'react';
import { 
  BookOpen, FileText, Map, CheckSquare, Settings, ShieldCheck, 
  Languages, Sun, Moon, LogOut, ArrowRight, User, GraduationCap, 
  Layers, Users, Bell, CalendarDays, TrendingUp, Sparkles
} from 'lucide-react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useStudentData } from '../context/StudentDataContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import studentApi from '../services/studentApi';

const StudentMenu = () => {
  const { t, i18n } = useTranslation();
  const { student, logout } = useStudentAuth();
  const { theme, toggleTheme } = useTheme();
  const { 
    notifications, 
    tasks: personalTasks, 
    officialTasks,
    gradesData
  } = useStudentData();
  const navigate = useNavigate();

  const isAr = i18n.language === 'ar';
  const [activeSemester, setActiveSemester] = useState(null);
  
  useEffect(() => {
    if (!student) navigate('/student/login');
  }, [student, navigate]);

  useEffect(() => {
    studentApi.get('/student/active-semester')
      .then(res => setActiveSemester(Number(res.data?.active_semester) || null))
      .catch(() => setActiveSemester(null));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/student/login');
    toast.success(`${t('sidebar.logout')} ${t('auth.success')}`);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  // Stats / Badges counts
  const unreadNotifCount = notifications.filter(n => !n.is_read).length;
  const pendingTasksCount = personalTasks.filter(t => !t.is_completed).length;
  const pendingOfficialCount = officialTasks.filter(t => !t.is_completed).length;
  const totalPendingTasks = pendingTasksCount + pendingOfficialCount;
  const registeredCoursesCount = (gradesData.grades || []).filter(g =>
    (g.enrollment_status === 'active' || !g.enrollment_status) &&
    (activeSemester !== null ? Number(g.semester) >= activeSemester : true)
  ).length;

  const menuItems = [
    { 
      id: 'course-registration', 
      label: t('sidebar.course_registration'), 
      desc: t('studentMenu.register_courses_desc'),
      icon: <BookOpen className="w-8 h-8" />, 
      path: '/student/registration',
      color: 'from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 text-blue-600 dark:text-blue-400 border-blue-500/20',
      badge: registeredCoursesCount > 0 ? `${registeredCoursesCount} ${t('studentMenu.courses')}` : null
    },
    { 
      id: 'grades', 
      label: t('sidebar.courses_grades'), 
      desc: t('studentMenu.grades_desc'),
      icon: <TrendingUp className="w-8 h-8" />, 
      path: '/student/grades',
      color: 'from-pink-500/10 to-rose-500/10 dark:from-pink-500/20 dark:to-rose-500/20 text-pink-600 dark:text-pink-400 border-pink-500/20',
      badge: gradesData.summary?.overallPercentage ? `${gradesData.summary.overallPercentage}%` : null
    },
    { 
      id: 'quizzes', 
      label: t('sidebar.quizzes'), 
      desc: t('studentMenu.quizzes_desc'),
      icon: <FileText className="w-8 h-8" />, 
      path: '/student/quizzes',
      color: 'from-[#059669]/10 to-[#34d399]/10 text-[#059669] dark:text-[#34d399] border-[#059669]/20',
      badge: null
    },
    { 
      id: 'roadmap', 
      label: t('sidebar.roadmap'), 
      desc: t('studentMenu.roadmap_desc'),
      icon: <Map className="w-8 h-8" />, 
      path: '/student/roadmap',
      color: 'from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 text-amber-600 dark:text-amber-400 border-amber-500/20',
      badge: t('studentMenu.level_label', { level: student?.level || 1 })
    },
    { 
      id: 'personal-tasks', 
      label: t('sidebar.personal_tasks'), 
      desc: t('studentMenu.tasks_desc'),
      icon: <CheckSquare className="w-8 h-8" />, 
      path: '/student/personal-tasks',
      color: 'from-[#059669]/10 to-[#34d399]/10 text-[#059669] dark:text-[#34d399] border-[#059669]/20',
      badge: totalPendingTasks > 0 ? `${totalPendingTasks} ${t('studentMenu.pending')}` : null
    },
    { 
      id: 'attendance', 
      label: t('sidebar.attendance'), 
      desc: t('studentMenu.attendance_desc'),
      icon: <Layers className="w-8 h-8" />, 
      path: '/student/attendance',
      color: 'from-cyan-500/10 to-teal-500/10 dark:from-cyan-500/20 dark:to-teal-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
      badge: null
    },
    { 
      id: 'ai', 
      label: 'Zag AI', 
      desc: t('studentMenu.ai_desc') || 'AI-powered academic assistant',
      icon: <Sparkles className="w-8 h-8" />, 
      path: '/student/ai',
      color: 'from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      badge: null
    },
    { 
      id: 'settings', 
      label: t('sidebar.settings'), 
      desc: t('studentMenu.settings_desc'),
      icon: <Settings className="w-8 h-8" />, 
      path: '/student/settings',
      color: 'from-gray-500/10 to-slate-500/10 dark:from-gray-500/20 dark:to-slate-500/20 text-gray-600 dark:text-gray-400 border-gray-500/20',
      badge: null
    },
  ];

  if (student && (student.role === 'assistant' || student.role === 'admin')) {
    menuItems.push({ 
      id: 'admin-panel', 
      label: t('sidebar.admin_panel'), 
      desc: t('studentMenu.admin_desc'),
      icon: <ShieldCheck className="w-8 h-8" />, 
      path: '/admin',
      color: 'from-rose-500/10 to-pink-500/10 dark:from-rose-500/20 dark:to-pink-500/20 text-rose-600 dark:text-rose-400 border-rose-500/20',
      badge: t('studentMenu.admin_btn')
    });
  }

  // Set page direction
  const pageDirection = isAr ? 'rtl' : 'ltr';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c14] text-gray-900 dark:text-white font-sans transition-colors duration-500 overflow-x-hidden relative" dir={pageDirection}>
      
      {/* Ambient Glowing Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] inset-inline-end-[-5%] w-[50vw] h-[50vw] bg-[#059669]/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] inset-inline-start-[-5%] w-[40vw] h-[40vw] bg-[#34d399]/3 blur-[100px] rounded-full"></div>
      </div>

      <Sidebar onLogout={handleLogout} />

      <main className="md:ps-72 min-h-screen relative z-10 flex flex-col pb-28 md:pb-10">
        <section className="px-6 lg:px-10 pt-10 md:pt-16 pb-12 max-w-[1400px] mx-auto w-full space-y-10">
          
          {/* Header & Student Identity Card */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-white dark:bg-[#0e0e16] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-sm relative overflow-hidden group">
            {/* Ambient Background Gradient for the Identity Card */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#059669]/2 to-[#34d399]/2 opacity-50 dark:opacity-20 pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10 text-center sm:text-start">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#059669] to-[#047857] flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-indigo-500/20 transform group-hover:scale-105 transition-transform duration-500">
                {student?.name ? student.name.charAt(0).toUpperCase() : <User className="w-10 h-10" />}
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className={`text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white ${isAr ? 'font-arabic' : ''}`}>
                    {student?.name}
                  </h1>
                  <span className="px-3 py-1 rounded-full bg-[#34d399]/10 text-[#059669] dark:text-[#34d399] text-[10px] font-black uppercase tracking-widest border border-[#34d399]/20">
                    {t('studentMenu.active_student')}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-semibold text-gray-400 dark:text-white/40">
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    {student?.department_name || student?.department_code || t('studentMenu.general_dept')}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-white/10 hidden sm:inline-block"></span>
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    {t('studentMenu.level_value', { level: student?.level || 1 })}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-white/10 hidden sm:inline-block"></span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-400" />
                    {t('studentMenu.section_value', { section: student?.section || '—' })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 relative z-10 shrink-0">
              <div className="text-center md:text-inline-end space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-white/20">
                  {t('studentMenu.student_id')}
                </p>
                <p className="text-lg font-black tracking-widest text-gray-900 dark:text-white opacity-80">
                  {student?.id}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Main Grid (Bento Grid Style) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                onClick={() => navigate(item.path)}
                className="group bg-white dark:bg-[#0e0e16] border border-gray-100 dark:border-white/5 rounded-[2.2rem] p-8 flex flex-col justify-between gap-8 hover:shadow-xl hover:border-primary/20 dark:hover:border-primary/20 hover:-translate-y-1.5 transition-all duration-500 cursor-pointer relative overflow-hidden"
              >
                {/* Micro Ambient Hover Glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center border shadow-inner`}>
                      {item.icon}
                    </div>
                    {item.badge && (
                      <span className="px-4 py-1.5 rounded-full bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white text-[10px] font-black uppercase tracking-widest border border-gray-100 dark:border-white/10 group-hover:bg-primary group-hover:text-white dark:group-hover:text-black transition-all">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-start">
                    <h3 className={`text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white ${isAr ? 'font-arabic' : ''}`}>
                      {item.label}
                    </h3>
                    <p className={`text-xs text-gray-400 dark:text-white/30 font-semibold leading-relaxed ${isAr ? 'font-arabic' : ''}`}>
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary opacity-60 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all duration-300">
                  <span>{t('studentMenu.go_now')}</span>
                  <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions & Preferences Row */}
          <div className="bg-white dark:bg-[#0e0e16] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={toggleLanguage}
                className="flex items-center justify-between p-5 rounded-[2rem] bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/5 transition-all active:scale-98 group"
              >
                <div className="flex items-center gap-4 text-start">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <Languages className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-xs font-black uppercase tracking-widest text-gray-400 ${isAr ? 'font-arabic' : ''}`}>{t('studentMenu.language_label')}</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white">{t('studentMenu.language_toggle')}</p>
                  </div>
                </div>
                <ArrowRight className={`w-4 h-4 opacity-30 group-hover:opacity-100 transition-all ${isAr ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={toggleTheme}
                className="flex items-center justify-between p-5 rounded-[2rem] bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/5 transition-all active:scale-98 group"
              >
                <div className="flex items-center gap-4 text-start">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shadow-inner">
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className={`text-xs font-black uppercase tracking-widest text-gray-400 ${isAr ? 'font-arabic' : ''}`}>{t('studentMenu.theme_label')}</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white">
                      {t(theme === 'dark' ? 'sidebar.light' : 'sidebar.dark')}
                    </p>
                  </div>
                </div>
                <ArrowRight className={`w-4 h-4 opacity-30 group-hover:opacity-100 transition-all ${isAr ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center justify-between p-5 rounded-[2rem] bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/10 hover:bg-rose-500/10 transition-all active:scale-98 group"
              >
                <div className="flex items-center gap-4 text-start">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-inner">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`text-xs font-black uppercase tracking-widest text-rose-400/60 ${isAr ? 'font-arabic' : ''}`}>{t('studentMenu.account_label')}</p>
                    <p className="text-sm font-black text-rose-500">{t('sidebar.logout')}</p>
                  </div>
                </div>
                <ArrowRight className={`w-4 h-4 text-rose-500 opacity-40 group-hover:opacity-100 transition-all ${isAr ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

        </section>
      </main>


    </div>
  );
};

export default StudentMenu;
