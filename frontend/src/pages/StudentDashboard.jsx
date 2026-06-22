import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy, TrendingUp, ShieldCheck, Info, ExternalLink,
  GraduationCap, Layers, Users, ChevronRight, BookOpen,
  Bell, ListTodo, CheckCircle2, Circle, Clock, LayoutDashboard,
  CalendarDays, ArrowRight, Zap, Star, X, MousePointer2,
  AlertCircle, FileText, Plus
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

const StatCard = ({ label, value, subtext, color = 'emerald', onClick }) => {
  const colorMap = {
    emerald: { ring: 'hover:border-[#059669] dark:hover:border-[#34d399]' },
    purple: { ring: 'hover:border-[#059669] dark:hover:border-[#34d399]' },
    amber: { ring: 'hover:border-[#f39c12] dark:hover:border-[#fbbf24]' },
  };
  const accentMap = {
    emerald: 'bg-[#059669] dark:bg-[#34d399]',
    purple: 'bg-[#059669] dark:bg-[#34d399]',
    amber: 'bg-[#f39c12] dark:bg-[#fbbf24]',
  };
  const c = colorMap[color] || colorMap.emerald;

  return (
    <button
      onClick={onClick}
      className={`group relative bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[1.75rem] p-5 sm:p-6 text-start w-full transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${c.ring} focus:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]/20 overflow-hidden`}
    >
      <div className={`absolute top-0 inset-x-0 h-0.5 ${accentMap[color] || accentMap.emerald} opacity-60`} />
      <div className="space-y-1.5">
        <p className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-400 dark:text-white/40">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white">{value ?? '—'}</span>
          {subtext && (
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-white/40">{subtext}</span>
          )}
        </div>
      </div>
    </button>
  );
};

const TaskItem = ({ task, isOfficial, onToggle, isAr }) => {
  const Icon = task.is_completed ? CheckCircle2 : Circle;
  return (
    <div className="flex items-center gap-3 py-2.5 px-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
      <button
        onClick={() => onToggle?.(task)}
        className={`shrink-0 transition-all duration-300 ${task.is_completed ? 'text-[#059669] dark:text-[#34d399]' : 'text-gray-300 dark:text-white/20 group-hover:text-gray-400 dark:group-hover:text-white/40'}`}
      >
        {task.is_completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold truncate text-gray-900 dark:text-white ${task.is_completed ? 'line-through opacity-50' : ''}`}>
          {task.title || task.task_name || task.description}
        </p>
        {task.due_date && (
          <p className="text-[10px] font-semibold text-gray-400 dark:text-white/30 mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(task.due_date).toLocaleDateString()}
          </p>
        )}
      </div>
      {isOfficial && (
        <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-[#059669]/10 text-[#059669] dark:bg-[#34d399]/10 dark:text-[#34d399]">
          Official
        </span>
      )}
    </div>
  );
};

const NotificationItem = ({ notif, onMarkRead, isAr }) => {
  return (
    <div
      className={`flex items-start gap-3 py-3 px-4 rounded-2xl transition-all cursor-pointer ${
        !notif.is_read
          ? 'bg-[#059669]/5 dark:bg-[#34d399]/5 border border-[#059669]/10 dark:border-[#34d399]/10'
          : 'hover:bg-gray-50 dark:hover:bg-white/[0.02]'
      }`}
      onClick={() => !notif.is_read && onMarkRead?.(notif.id)}
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
        !notif.is_read
          ? 'bg-[#059669] dark:bg-[#34d399] text-white dark:text-black'
          : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/30'
      }`}>
        <Bell className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0" dir="auto">
        <p className={`text-sm ${!notif.is_read ? 'font-black text-gray-900 dark:text-white' : 'font-semibold text-gray-500 dark:text-white/50'} truncate`}>
          {notif.content || notif.message || notif.title}
        </p>
        <p className="text-[11px] text-gray-400 dark:text-white/30 mt-0.5">{notif.title}</p>
      </div>
      {!notif.is_read && (
        <span className="w-2 h-2 rounded-full bg-[#059669] dark:bg-[#34d399] shrink-0 mt-2" />
      )}
    </div>
  );
};

const StudentDashboard = () => {
  const { student, logout } = useStudentAuth();
  const { t, i18n } = useTranslation();
  const { isDarkMode } = useTheme();
  const {
    gradesData, loadingGrades,
    notifications: allNotifications, loadingNotifications, markNotificationAsRead,
    officialTasks, loadingOfficialTasks, fetchOfficialTasks, setOfficialTasks,
    tasks: personalTasks, loadingTasks, fetchTasks, setTasks
  } = useStudentData();
  const navigate = useNavigate();

  const handleToggleTask = async (task) => {
    const isOfficial = task._isOfficial;
    const currentStatus = task.is_completed;
    const taskId = task.id;

    if (isOfficial) {
      setOfficialTasks(prev => prev.map(t => t.id === taskId ? { ...t, is_completed: !currentStatus } : t));
      try {
        await studentApi.patch(`/official-tasks/${taskId}/toggle`, { is_completed: !currentStatus });
        toast.success(!currentStatus ? t('tasks.official_completed') : t('tasks.marked_pending'));
      } catch (error) {
        fetchOfficialTasks();
        toast.error(t('common.error_save'));
      }
    } else {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, is_completed: !currentStatus } : t));
      try {
        await studentApi.patch(`/student/personal-tasks/${taskId}/toggle`, { is_completed: !currentStatus });
        toast.success(currentStatus ? t('tasks.marked_pending') : t('tasks.completed_toast'));
      } catch (error) {
        fetchTasks();
        toast.error(t('common.error_save'));
      }
    }
  };

  const [greeting, setGreeting] = useState('');
  const [isCardExpanded, setIsCardExpanded] = useState(false);
  const [activeSemester, setActiveSemester] = useState(null);

  useEffect(() => {
    setGreeting(t(getGreeting()));
    const interval = setInterval(() => setGreeting(t(getGreeting())), 60000);
    return () => clearInterval(interval);
  }, [t]);

  useEffect(() => {
    studentApi.get('/student/active-semester')
      .then(res => setActiveSemester(Number(res.data?.active_semester) || null))
      .catch(() => setActiveSemester(null));
  }, []);

  const notifications = useMemo(() => {
    return allNotifications.slice(0, 3);
  }, [allNotifications]);

  const unreadCount = useMemo(() => {
    return allNotifications.filter(n => !n.is_read).length;
  }, [allNotifications]);

  const grades = useMemo(() => {
    const all = gradesData.grades || [];
    if (activeSemester === null) return all.filter(g => g.enrollment_status === 'active' || !g.enrollment_status);
    return all.filter(g =>
      (g.enrollment_status === 'active' || !g.enrollment_status) &&
      Number(g.semester) >= activeSemester
    );
  }, [gradesData.grades, activeSemester]);

  const avgGrade = useMemo(() => {
    if (gradesData.summary?.average) return Number(gradesData.summary.average).toFixed(1);
    const withGrades = grades.filter(g => g.grade != null && g.grade !== '');
    if (!withGrades.length) return null;
    const sum = withGrades.reduce((acc, g) => acc + Number(g.grade), 0);
    return (sum / withGrades.length).toFixed(1);
  }, [grades, gradesData.summary]);

  const loading = loadingGrades;
  const notifLoading = loadingNotifications;

  const pendingOfficial = officialTasks.filter(t => !t.is_completed) || [];
  const pendingPersonal = personalTasks.filter(t => !t.is_completed) || [];
  const totalPendingTasks = pendingOfficial.length + pendingPersonal.length;
  const mergedPendingTasks = useMemo(() => {
    const official = pendingOfficial.slice(0, 3).map(t => ({ ...t, _isOfficial: true }));
    const personal = pendingPersonal.slice(0, 3).map(t => ({ ...t, _isOfficial: false }));
    return [...official, ...personal].slice(0, 5);
  }, [pendingOfficial, pendingPersonal]);

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
        <div className="w-12 h-12 border-2 border-gray-200 dark:border-white/10 border-t-[#34d399] rounded-full animate-spin"></div>
      </div>
    );
  }

  const isAr = i18n.language === 'ar';

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
        <section className="px-6 lg:px-10 pt-16 pb-8 max-w-[1500px] mx-auto w-full space-y-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl text-start">
              <h1 className={`text-[clamp(2rem,5vw,4rem)] font-black leading-[0.95] tracking-tighter uppercase text-gray-900 dark:text-white ${isAr ? 'font-arabic' : ''}`}>
                {t('sidebar.dashboard')}
              </h1>
              {student?.name && (
                <p className="text-sm sm:text-base font-semibold text-gray-500 dark:text-white/50">
                  {t('dashboard.welcome_back')}, {isAr ? student?.name : transliterateArabic(student?.name)}
                </p>
              )}
            </div>

            <div className="relative group shrink-0">
              <button
                onClick={() => setIsCardExpanded(true)}
                className="w-32 h-32 rounded-full bg-[#059669] dark:bg-[#34d399] text-white dark:text-black flex flex-col items-center justify-center gap-2 hover:scale-105 hover:rotate-6 transition-all duration-500 shadow-xl group"
              >
                <MousePointer2 className="w-5 h-5" />
                <span className="text-[8px] font-black uppercase tracking-widest text-center px-4 leading-tight">
                  {t('dashboard.id_card')}
                </span>
              </button>
              <div className="absolute -top-1 -inset-inline-end-1 bg-[#059669] dark:bg-[#34d399] text-white dark:text-black px-4 py-1.5 rounded-2xl font-black text-lg shadow-lg rotate-12">
                #{student?.level}
              </div>
            </div>
          </div>

          {/* QUICK STATS ROW */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              label={t('dashboard.active_courses')}
              value={grades.length}
              color="emerald"
              onClick={() => navigate('/student/grades')}
            />
            <StatCard
              label={t('dashboard.pending_tasks')}
              value={totalPendingTasks}
              color="amber"
              onClick={() => navigate('/student/personal-tasks')}
            />
            <StatCard
              label={t('sidebar.notifications')}
              value={unreadCount}
              subtext={unreadCount > 0 ? t('dashboard.unread') : ''}
              color="emerald"
              onClick={() => navigate('/student/notifications')}
            />
            <StatCard
              label={t('dashboard.avg_grade')}
              value={avgGrade != null ? avgGrade : '—'}
              color="emerald"
            />
          </div>

          {/* MAIN BENTO GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-24">

            {/* ACTIVE COURSES */}
            <div className="lg:col-span-12 space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <h2 className={`text-[clamp(1.25rem,2.5vw,2rem)] font-black uppercase tracking-tight ${isAr ? 'font-arabic' : ''}`}>
                    {t('dashboard.active_courses')}
                  </h2>
                  <div className="bg-[#059669]/10 dark:bg-[#34d399]/10 px-3.5 py-1.5 rounded-xl text-[#059669] dark:text-[#34d399] text-[10px] font-black">
                    {grades.length}
                  </div>
                </div>
                <button
                  onClick={() => navigate('/student/grades')}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/30 hover:text-[#059669] dark:hover:text-[#34d399] transition-colors flex items-center gap-1"
                >
                  {t('dashboard.view_all')}
                  <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {grades.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {grades.map((grade, idx) => (
                    <div
                      key={grade.course_id || idx}
                      onClick={() => navigate(`/student/course/${grade.course_id}`)}
                      className="group bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[2rem] p-6 sm:p-7 cursor-pointer hover:border-[#059669] dark:hover:border-[#34d399] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl shadow-sm relative overflow-hidden"
                    >
                      <div className="absolute top-0 inset-x-0 h-0.5 bg-[#059669]/40 dark:bg-[#34d399]/40" />
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className={`text-xl sm:text-2xl font-black leading-tight uppercase tracking-tighter flex-1 ${isAr ? 'font-arabic' : ''}`}>
                            {grade.course_name}
                          </h3>
                          <div className="flex items-center gap-2 shrink-0">
                            {grade.semester && (
                              <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-white/40 border border-gray-100 dark:border-white/5">
                                S{grade.semester}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          {grade.grade != null && grade.grade !== '' ? (
                            <div className={`px-3 py-1.5 rounded-xl text-[11px] font-black ${
                              Number(grade.grade) >= 85
                                ? 'bg-[#059669]/10 text-[#059669] dark:bg-[#34d399]/10 dark:text-[#34d399]'
                                : Number(grade.grade) >= 65
                                ? 'bg-[#f39c12]/10 text-[#f39c12] dark:bg-[#fbbf24]/10 dark:text-[#fbbf24]'
                                : 'bg-rose-500/10 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400'
                            }`}>
                              {grade.grade}%
                            </div>
                          ) : (
                            <div className="px-3 py-1.5 rounded-xl text-[11px] font-black bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-white/40">
                              {t('grades.pending')}
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 dark:text-white/30 group-hover:text-[#059669] dark:group-hover:text-[#34d399] transition-colors">
                            {t('dashboard.view_course')}
                            <ArrowRight className={`w-3 h-3 ${isAr ? 'rotate-180' : ''}`} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-4">
                    <div className="w-5 h-0.5 bg-gray-200 dark:bg-white/10 rounded-full rotate-45" />
                    <div className="w-5 h-0.5 bg-gray-200 dark:bg-white/10 rounded-full -rotate-45 absolute" />
                  </div>
                  <p className="text-sm font-semibold text-gray-400 dark:text-white/30">{t('dashboard.no_courses')}</p>
                </div>
              )}
            </div>

            {/* BOTTOM ROW: NOTIFICATIONS + PENDING TASKS */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <h2 className={`text-[clamp(1.1rem,2vw,1.5rem)] font-black uppercase tracking-tight ${isAr ? 'font-arabic' : ''}`}>
                    {t('sidebar.notifications')}
                  </h2>
                  {unreadCount > 0 && (
                    <div className="bg-[#059669]/10 dark:bg-[#34d399]/10 px-3 py-1.5 rounded-xl text-[#059669] dark:text-[#34d399] text-[10px] font-black">
                      {unreadCount} {t('common.unread')}
                    </div>
                  )}
                </div>
              </div>

              {notifLoading ? (
                <div className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[2rem] p-8 space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/5" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-3/4 bg-gray-100 dark:bg-white/5 rounded-full" />
                        <div className="h-2 w-1/2 bg-gray-50 dark:bg-white/5 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length > 0 ? (
                <div className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[2rem] p-5 sm:p-6 space-y-1">
                  {notifications.map((notif) => (
                    <NotificationItem
                      key={notif.id}
                      notif={notif}
                      onMarkRead={markNotificationAsRead}
                      isAr={isAr}
                    />
                  ))}
                  {allNotifications.length > 3 && (
                    <button
                      onClick={() => navigate('/student/notifications')}
                      className="w-full mt-2 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/30 hover:text-[#059669] dark:hover:text-[#34d399] transition-colors"
                    >
                      {t('dashboard.view_all')} ({allNotifications.length - 3})
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center">
                  <Bell className="w-10 h-10 text-gray-200 dark:text-white/10 mb-3" />
                  <p className="text-sm font-semibold text-gray-400 dark:text-white/30">{t('dashboard.no_notifications')}</p>
                </div>
              )}
            </div>

            {/* PENDING TASKS SIDEBAR */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <h2 className={`text-[clamp(1.1rem,2vw,1.5rem)] font-black uppercase tracking-tight ${isAr ? 'font-arabic' : ''}`}>
                    {t('dashboard.pending_tasks')}
                  </h2>
                  {totalPendingTasks > 0 && (
                    <div className="bg-[#f39c12]/10 dark:bg-[#fbbf24]/10 px-3 py-1.5 rounded-xl text-[#f39c12] dark:text-[#fbbf24] text-[10px] font-black">
                      {totalPendingTasks}
                    </div>
                  )}
                </div>
              </div>

              {mergedPendingTasks.length > 0 ? (
                <div className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[2rem] p-5 sm:p-6 space-y-1">
                  {mergedPendingTasks.map((task, idx) => (
                    <TaskItem
                      key={task.id || idx}
                      task={task}
                      isOfficial={task._isOfficial}
                      onToggle={handleToggleTask}
                      isAr={isAr}
                    />
                  ))}
                  <button
                    onClick={() => navigate('/student/personal-tasks')}
                    className="w-full mt-2 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/30 hover:text-[#059669] dark:hover:text-[#34d399] transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {t('dashboard.view_all_tasks')}
                  </button>
                </div>
              ) : (
                <div className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center">
                  <CheckCircle2 className="w-10 h-10 text-[#059669] dark:text-[#34d399] mb-3" />
                  <p className="text-sm font-semibold text-gray-400 dark:text-white/30">{t('dashboard.no_pending_tasks')}</p>
                </div>
              )}
            </div>

          </div>
        </section>
      </main>

      {/* ID MODAL */}
      {isCardExpanded && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 dark:bg-black/95 backdrop-blur-md" onClick={() => setIsCardExpanded(false)} />
          <div className="relative w-full max-w-[500px] bg-white dark:bg-[#0c0c14] border border-gray-200 dark:border-white/10 rounded-[3.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="h-3 bg-gradient-to-r from-[#059669] via-[#34d399] to-[#059669] dark:from-[#34d399] dark:via-[#059669] dark:to-[#34d399]"></div>
            <div className="p-10 flex flex-col items-center text-center space-y-8">
              <div className="w-full flex items-center justify-between opacity-50">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">ZNU-{student?.id}</span>
                <ShieldCheck className="w-4 h-4 text-[#059669] dark:text-[#34d399]" />
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
                    {student?.level === 1 ? t('settings.level_1') :
                      student?.level === 2 ? t('settings.level_2') :
                      student?.level === 3 ? t('settings.level_3') :
                      student?.level === 4 ? t('settings.level_4') : t('settings.level_num', { num: student?.level })}
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5">
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 block mb-2">{t('settings.section')}</span>
                  <span className="text-xs font-black uppercase text-gray-900 dark:text-white">{student?.section || '3'}</span>
                </div>
              </div>

              <div className="bg-[#059669] dark:bg-[#34d399] w-full p-6 rounded-[2.5rem] shadow-xl shadow-[#059669]/10">
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
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default StudentDashboard;
