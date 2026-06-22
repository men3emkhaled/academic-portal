import React, { useEffect } from 'react';
import { ArrowRight, Bell } from 'lucide-react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useStudentData } from '../context/StudentDataContext';
import { useNavigate } from 'react-router-dom';
import studentApi from '../services/studentApi';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { useTranslation } from 'react-i18next';

const StudentNotifications = () => {
  const { t, i18n } = useTranslation();
  const { student, logout } = useStudentAuth();
  const { notifications, setNotifications, loadingNotifications, markNotificationAsRead } = useStudentData();
  const navigate = useNavigate();

  const isAr = i18n.language === 'ar';
  const loading = loadingNotifications;

  useEffect(() => {
    if (!student) navigate('/student/login');
  }, [student, navigate]);

  const markAsRead = async (id) => {
    await markNotificationAsRead(id);
  };

  const markAllAsRead = async () => {
    try {
      await studentApi.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      toast.success(t('notifications.all_read_success'));
    } catch (error) {
      toast.error(t('notifications.all_read_error'));
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

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) return t('common.just_now');
      return t('common.hours_ago', { hours });
    }
    if (days === 1) return t('common.yesterday');
    if (days < 7) return t('common.days_ago', { count: days });
    return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : undefined);
  };

  const renderContent = (text) => {
    if (!text) return '';
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const textBefore = text.substring(lastIndex, match.index).trim();
        if (textBefore) parts.push(<span key={`text-${lastIndex}`} className="inline">{textBefore}{' '}</span>);
      }
      parts.push(
        <a
          key={`link-${match.index}`}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-black px-4 py-2 rounded-xl border border-gray-100 dark:border-white/5 hover:bg-[#059669] hover:text-white dark:hover:bg-[#34d399] dark:hover:text-black transition-all mx-1 text-xs mt-2"
        >
          {match[1]} <ArrowRight className={`w-3 h-3 ${isAr ? 'rotate-180' : ''}`} />
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }
    if (lastIndex < text.length) {
      const textAfter = text.substring(lastIndex).trim();
      if (textAfter) parts.push(<span key={`text-${lastIndex}`} className="inline">{' '}{textAfter}</span>);
    }
    return parts.length > 0 ? parts : text;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-white dark:bg-[#0c0c14]">
        <div className="w-12 h-12 border-2 border-gray-200 dark:border-white/10 border-t-[#34d399] rounded-full animate-spin"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

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
        <section className="px-6 lg:px-10 pt-16 pb-12 max-w-[1500px] mx-auto w-full space-y-8 text-start">

          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
            <div className="space-y-4 text-start">
              <h1 className={`text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-[0.95] tracking-tighter uppercase text-gray-900 dark:text-white ${isAr ? 'font-arabic' : ''}`}>
                {t('notifications.title')}
              </h1>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="bg-[#059669] dark:bg-[#34d399] text-white dark:text-black text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-2xl hover:scale-[1.02] transition-all shadow-lg shrink-0"
              >
                {t('notifications.mark_all')}
              </button>
            )}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-md">
            <div className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[1.75rem] p-5 sm:p-6 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-0.5 bg-[#059669]/40 dark:bg-[#34d399]/40" />
              <div className="space-y-1">
                <p className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-400 dark:text-white/40">{t('notifications.title')}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white">{unreadCount}</span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-white/40">{t('dashboard.unread')}</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[1.75rem] p-5 sm:p-6 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-0.5 bg-[#059669]/40 dark:bg-[#34d399]/40" />
              <div className="space-y-1">
                <p className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-400 dark:text-white/40">{t('mavi.logged')}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white">{notifications.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* NOTIFICATIONS LIST */}
          <div className="space-y-4 pb-20 max-w-3xl">
            {notifications.length === 0 ? (
              <div className="bg-white dark:bg-[#0d0d14] border border-dashed border-gray-100 dark:border-white/10 rounded-[2rem] p-16 text-center">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-200 dark:text-white/10" />
                <h3 className="text-lg font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/30">{t('notifications.no_alerts')}</h3>
                <p className="text-sm font-semibold text-gray-400 dark:text-white/20 mt-2">{t('notifications.no_alerts_desc')}</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const isUnread = !notification.is_read;

                return (
                  <div
                    key={notification.id}
                    onClick={() => isUnread && markAsRead(notification.id)}
                    className={`bg-white dark:bg-[#0d0d14] border rounded-[1.75rem] p-5 sm:p-6 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-xl shadow-sm relative overflow-hidden text-start cursor-pointer ${
                      isUnread
                        ? 'border-[#059669]/20 dark:border-[#34d399]/20'
                        : 'border-gray-100 dark:border-white/5 opacity-60'
                    }`}
                  >
                    <div className={`absolute top-0 inset-x-0 h-0.5 ${isUnread ? 'bg-[#059669] dark:bg-[#34d399]' : 'bg-gray-100 dark:bg-white/5'}`} />

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0" dir="auto">
                        <div className="flex items-center gap-3 mb-2">
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-[#059669] dark:bg-[#34d399] shrink-0" />
                          )}
                          <h3 className={`text-sm font-black leading-tight uppercase tracking-tight ${isUnread ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-white/50'}`}>
                            {renderContent(notification.content || notification.message || notification.title)}
                          </h3>
                        </div>
                        <div className={`text-xs mt-1 font-semibold ${isUnread ? 'text-gray-400 dark:text-white/30' : 'text-gray-500 dark:text-white/20'}`}>
                          {notification.title}
                        </div>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-white/30 whitespace-nowrap shrink-0">
                        {formatDate(notification.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </section>
      </main>

    </div>
  );
};

export default StudentNotifications;
