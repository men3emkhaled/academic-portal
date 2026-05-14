import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, TrendingUp, ShieldCheck, Info, ExternalLink, GraduationCap, Layers, Users, ChevronRight, BookOpen, Bell, ListTodo, CheckCircle2, Circle, Clock, LayoutDashboard, CalendarDays } from 'lucide-react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useStudentData } from '../context/StudentDataContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import studentApi from '../services/studentApi';

const getNotificationStyle = (title, content) => {
  const lowerTitle = title.toLowerCase();
  const lowerContent = content.toLowerCase();
  if (lowerTitle.includes('contest') || lowerContent.includes('contest')) {
    return { emoji: <Trophy className="w-5 h-5 text-primary" />, category: 'Event', iconBg: 'bg-primary/10 dark:bg-primary/20', textColor: 'text-primary' };
  }
  if (lowerTitle.includes('grade') || lowerContent.includes('grade')) {
    return { emoji: <TrendingUp className="w-5 h-5 text-blue-500" />, category: 'Grades', iconBg: 'bg-blue-500/10 dark:bg-blue-500/20', textColor: 'text-blue-500' };
  }
  if (lowerTitle.includes('security') || lowerContent.includes('login')) {
    return { emoji: <ShieldCheck className="w-5 h-5 text-orange-500" />, category: 'Security', iconBg: 'bg-orange-500/10 dark:bg-orange-500/20', textColor: 'text-orange-500' };
  }
  return { emoji: <Info className="w-5 h-5 text-emerald-500" />, category: 'Info', iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20', textColor: 'text-emerald-500' };
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'dashboard.greeting_morning';
  if (hour < 18) return 'dashboard.greeting_afternoon';
  return 'dashboard.greeting_evening';
};

const StudentDashboard = () => {
  const { student, logout } = useStudentAuth();
  const { t, i18n } = useTranslation();
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
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const recent = allNotifications.filter(notif => new Date(notif.created_at) >= threeDaysAgo);
    return recent.slice(0, 4);
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

  const markAsRead = async (id) => await markNotificationAsRead(id);

  const handleToggleOfficial = async (taskId, currentStatus) => {
    try {
      await studentApi.patch(`/official-tasks/${taskId}/toggle`, { is_completed: !currentStatus });
      fetchOfficialTasks();
      toast.success(!currentStatus ? t('tasks.mark_done') : t('tasks.mark_undone'));
    } catch (error) {
      toast.error(t('tasks.error_update'));
    }
  };

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

  const renderContent = (text) => {
    if (!text) return '';
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex, match.index)}</span>);
      }
      parts.push(
        <a key={`link-${match.index}`} href={match[2]} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline font-semibold mx-1">
          <ExternalLink className="w-3 h-3" /> {match[1]}
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }
    if (lastIndex < text.length) parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>);
    return parts.length > 0 ? parts : text;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-[#0a0a0a]">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white font-sans transition-colors duration-500 overflow-hidden relative">
      {/* Ambient Backgrounds */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-50 dark:opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-blue-500/10 blur-[150px] rounded-full"></div>
      </div>

      <Sidebar onLogout={handleLogout} />

      <div className="md:ps-96 pb-24 md:pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

          {/* HEADER / HERO SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Welcome Card (Spans 2 columns on large screens) */}
            <div
              onClick={() => setIsCardExpanded(true)}
              className="lg:col-span-2 relative overflow-hidden rounded-[2rem] bg-white/70 dark:bg-white/5 backdrop-blur-2xl border border-gray-200 dark:border-white/10 p-6 sm:p-10 shadow-sm dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] group transition-all duration-500 cursor-pointer hover:shadow-xl hover:-translate-y-1"
            >
              <div className="absolute top-0 inset-inline-end-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-700"></div>

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight mb-2">
                    {student?.name}
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 text-base font-medium max-w-lg">
                    {t('dashboard.welcome_msg')}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 mt-8">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/10 text-sm font-semibold">
                    <GraduationCap className="w-5 h-5 text-primary" /> {t('dashboard.id_card')}: {student?.id}
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/10 text-sm font-semibold">
                    <Layers className="w-5 h-5 text-blue-500" /> {t('dashboard.level')}: {student?.level}
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-black/40 border border-gray-200 dark:border-white/10 text-sm font-semibold">
                    <Users className="w-5 h-5 text-orange-500" /> {t('dashboard.section')}: {student?.section || t('common.not_assigned')}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Widget */}
            <div className="relative overflow-hidden rounded-[2rem] bg-white/70 dark:bg-white/5 backdrop-blur-2xl border border-gray-200 dark:border-white/10 p-6 sm:p-8 shadow-sm flex flex-col justify-center gap-6 group hover:border-primary/30 transition-all duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{t('dashboard.enrolled_courses')}</p>
                  <h3 className="text-4xl font-black text-gray-900 dark:text-white">{grades.length}</h3>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <BookOpen className="w-7 h-7" />
                </div>
              </div>
              <div className="h-px w-full bg-gray-200 dark:bg-white/10"></div>
              <div className="flex items-center justify-between cursor-pointer group/task" onClick={() => navigate('/student/personal-tasks')}>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{t('dashboard.pending_tasks')}</p>
                  <h3 className="text-4xl font-black text-gray-900 dark:text-white group-hover/task:text-primary transition-colors">{totalPendingTasks}</h3>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover/task:scale-110 group-hover/task:-rotate-6 transition-all">
                  <ListTodo className="w-7 h-7" />
                </div>
              </div>
            </div>
          </div>

          {/* MIDDLE SECTION: Tasks & Notifications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Task Manager Widget */}
            <div className="bg-white/70 dark:bg-[#111111]/80 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-sm flex flex-col h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black flex items-center gap-2">
                  <ListTodo className="w-6 h-6 text-primary" /> {t('dashboard.action_items')}
                </h2>
                <button onClick={() => navigate('/student/personal-tasks')} className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-primary transition-colors flex items-center gap-1">
                  {t('dashboard.view_all')} <ChevronRight className={`w-4 h-4 ${i18n.language === 'ar' ? 'rotate-180' : ''}`} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {loadingTasks || loadingOfficialTasks ? (
                  <div className="w-full h-full flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                ) : totalPendingTasks === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
                    <CheckCircle2 className="w-12 h-12 mb-2 opacity-50" />
                    <p className="font-semibold">{t('tasks.no_tasks')}</p>
                  </div>
                ) : (
                  <>
                    {pendingOfficial.slice(0, 3).map(task => (
                      <div key={`off-${task.id}`} className="group flex items-center gap-4 p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#161616] hover:border-primary/30 transition-colors">
                        <button onClick={() => handleToggleOfficial(task.id, false)} className="text-gray-300 dark:text-gray-600 hover:text-primary transition-colors">
                          <Circle className="w-6 h-6" />
                        </button>
                        <div className="flex-1 min-w-0 text-start">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">{task.course_name}</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">{t('tasks.official_tasks')}</span>
                          </div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{task.title}</p>
                        </div>
                        <a href={task.drive_link} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-primary transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                    {pendingPersonal.slice(0, 3).map(task => (
                      <div key={`pers-${task.id}`} className="group flex items-center gap-4 p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[#161616] hover:border-blue-500/30 transition-colors">
                        <div className="text-gray-300 dark:text-gray-600"><Circle className="w-6 h-6" /></div>
                        <div className="flex-1 min-w-0 text-start">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded mb-1 inline-block">{t('tasks.personal_tasks')}</span>
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{task.title}</p>
                        </div>
                        <button onClick={() => navigate('/student/personal-tasks')} className="p-2 rounded-xl text-gray-400 hover:text-blue-500 transition-colors">
                          <ChevronRight className={`w-4 h-4 ${i18n.language === 'ar' ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Notifications Widget */}
            <div className="bg-white/70 dark:bg-[#111111]/80 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-sm flex flex-col h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black flex items-center gap-2 text-start">
                  <Bell className="w-6 h-6 text-orange-500" /> {t('dashboard.inbox')}
                </h2>
                <button onClick={() => navigate('/student/notifications')} className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-orange-500 transition-colors flex items-center gap-1">
                  {t('dashboard.view_all')} <ChevronRight className={`w-4 h-4 ${i18n.language === 'ar' ? 'rotate-180' : ''}`} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {notifLoading ? (
                  <div className="w-full h-full flex items-center justify-center"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>
                ) : notifications.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
                    <Bell className="w-12 h-12 mb-2 opacity-50" />
                    <p className="font-semibold">{t('dashboard.no_notifications')}</p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const { emoji, category, iconBg, textColor } = getNotificationStyle(notif.title, notif.content);
                    const isUnread = !notif.is_read;
                    return (
                      <div key={notif.id} className={`relative p-4 rounded-2xl border transition-all ${isUnread ? 'bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-white/10 shadow-sm' : 'bg-transparent border-transparent opacity-60 hover:opacity-100'}`}>
                        {isUnread && <div className="absolute top-1/2 -inset-inline-start-1 w-2 h-2 rounded-full bg-primary -translate-y-1/2"></div>}
                        <div className="flex gap-3 text-start">
                          <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${iconBg}`}>{emoji}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <p className={`text-xs font-bold uppercase tracking-wider ${textColor}`}>{category}</p>
                              <span className="text-[10px] font-bold text-gray-400">{formatDate(notif.created_at)}</span>
                            </div>
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1 truncate">{notif.title}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{renderContent(notif.content)}</p>
                            {isUnread && (
                              <button onClick={() => markAsRead(notif.id)} className="mt-2 text-[10px] font-bold uppercase tracking-wider text-primary hover:underline">
                                {t('dashboard.mark_read')}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* BOTTOM SECTION: My Courses */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black flex items-center gap-2 text-gray-900 dark:text-white text-start">
                <LayoutDashboard className="w-7 h-7 text-primary" /> {t('dashboard.active_courses')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {grades.length === 0 ? (
                <div className="col-span-full py-16 bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-dashed border-gray-300 dark:border-white/10 rounded-[2rem] text-center">
                  <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{t('dashboard.no_courses')}</p>
                  <p className="text-sm text-gray-500 mt-1">{t('dashboard.contact_admin')}</p>
                </div>
              ) : (
                grades.map((grade, idx) => {
                  const colors = [
                    { from: 'from-emerald-400', to: 'to-teal-500', text: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { from: 'from-blue-400', to: 'to-indigo-500', text: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { from: 'from-violet-400', to: 'to-purple-500', text: 'text-violet-500', bg: 'bg-violet-500/10' },
                    { from: 'from-amber-400', to: 'to-orange-500', text: 'text-amber-500', bg: 'bg-amber-500/10' },
                  ];
                  const c = colors[idx % colors.length];

                  const totalScore = (parseFloat(grade.midterm_score) || 0) + (parseFloat(grade.practical_score) || 0) + (parseFloat(grade.oral_score) || 0);
                  const maxScore = parseFloat(grade.max_score) || 100;
                  const percentage = Math.min(100, (totalScore / maxScore) * 100);
                  const hasScores = grade.midterm_score != null || grade.practical_score != null || grade.oral_score != null;

                  return (
                    <div
                      key={idx}
                      onClick={() => navigate(`/student/course/${grade.course_id}`)}
                      className="group relative bg-white/80 dark:bg-[#111111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2rem] p-6 cursor-pointer hover:-translate-y-1 transition-all duration-300 hover:shadow-2xl overflow-hidden flex flex-col justify-between min-h-[220px]"
                    >
                      {/* Hover Glow */}
                      <div className={`absolute -inset-inline-end-20 -top-20 w-40 h-40 ${c.bg} blur-[50px] rounded-full group-hover:scale-150 transition-transform duration-700`}></div>

                      <div className="relative z-10 flex justify-between items-start mb-4">
                        <div className={`w-14 h-14 rounded-2xl ${c.bg} ${c.text} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                          <BookOpen className="w-7 h-7" />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-white dark:group-hover:bg-white/10 transition-colors">
                          <ChevronRight className={`w-5 h-5 group-hover:translate-x-1 transition-transform ${i18n.language === 'ar' ? 'rotate-180' : ''}`} />
                        </div>
                      </div>

                      <div className="relative z-10 text-start">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 line-clamp-2 leading-tight">
                          {grade.course_name}
                        </h3>

                        {hasScores ? (
                          <div className="space-y-2">
                            <div className="flex justify-between items-end">
                              <span className={`text-2xl font-black ${c.text}`}>{totalScore.toFixed(0)}<span className="text-sm text-gray-400">/{maxScore}</span></span>
                              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{percentage.toFixed(0)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                              <div className={`h-full bg-gradient-to-r ${c.from} ${c.to} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${percentage}%` }}></div>
                            </div>
                          </div>
                        ) : (
                          <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                              <Clock className="w-4 h-4" /> {t('dashboard.no_scores')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Classic Standard ID Card Overlay ── */}
      {isCardExpanded && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 font-sans">
          {/* Simple semi-transparent backdrop with strong blur */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-opacity duration-300"
            onClick={() => setIsCardExpanded(false)}
          />

          {/* Card Container - White, rounded corners, simple shadow */}
          <div className="relative w-full max-w-[450px] bg-white rounded-xl overflow-hidden shadow-2xl z-10 text-gray-900 animate-scaleUp">

            {/* Blue Header Bar */}
            <div className="bg-[#1874cd] py-4 text-center">
              <h2 className="text-white text-[22px] font-bold tracking-widest uppercase m-0 leading-none">{t('dashboard.id_card')}</h2>
            </div>

            {/* Card Body */}
            <div className="p-6 flex items-start justify-between gap-5 relative">

              {/* Profile Picture (Left/Right) */}
              <div className="w-[110px] h-[140px] shrink-0 bg-gray-100 rounded border border-gray-300 overflow-hidden flex items-center justify-center shadow-sm">
                {student?.avatar_url ? (
                  <img src={student.avatar_url} alt={student.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-black text-gray-400">{student?.name?.charAt(0)}</span>
                )}
              </div>

              {/* Information Text (Center) */}
              <div className="flex-1 flex flex-col pt-1 text-start">
                <div className="flex gap-2 items-center mb-1">
                  <span className="font-bold text-[13px] text-black">ID:</span>
                  <span className="text-[13px] font-bold text-black">{student?.id}</span>
                </div>

                <div className="text-[15px] font-semibold text-gray-800 mb-3 leading-tight" dir="auto">
                  {student?.name}
                </div>

                <div className="flex gap-2 items-center mb-1.5">
                  <span className="text-[11px] text-gray-600 font-semibold w-16 shrink-0">{t('dashboard.level')}:</span>
                  <span className="text-[12px] font-bold text-gray-800">{student?.level}</span>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="text-[11px] text-gray-600 font-semibold w-16 shrink-0 pt-[2px]">{t('dashboard.dept')}:</span>
                  <span className="text-[12px] font-bold text-gray-800 leading-tight" dir="auto">{student?.department || t('common.not_assigned')}</span>
                </div>
              </div>

              {/* Vertical Barcode (Right/Left) */}
              <div className="w-[30px] shrink-0 flex flex-col justify-between pt-1 pb-1 h-[130px] opacity-80">
                {[3, 1, 2, 1, 4, 1, 2, 3, 1, 1, 3, 2, 1, 2, 3, 1, 4, 2, 1, 1, 3, 2, 1, 2, 3, 1, 1, 4, 2, 3, 1, 2, 1].map((h, i) => (
                  <div key={i} className="w-full bg-black" style={{ height: `${h}px` }}></div>
                ))}
              </div>
            </div>
          </div>

          {/* Close Button - Outside the card */}
          <button
            onClick={() => setIsCardExpanded(false)}
            className={`absolute top-6 inset-inline-end-6 sm:top-10 sm:inset-inline-end-10 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors z-[110]`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.3); border-radius: 4px; }
      `}</style>
    </div>
  );
};

export default StudentDashboard;