import React, { useEffect } from 'react';
import { Trophy, TrendingUp, ShieldCheck, Info, CheckCircle2, CheckCircle, Bell } from 'lucide-react';
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

  const loading = loadingNotifications;

  useEffect(() => {
    if (!student) {
      navigate('/student/login');
    }
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
    toast.success(t('sidebar.logout') + ' ' + t('auth.success'));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (i18n.language === 'ar') {
      if (days === 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours === 0) return 'الآن';
        return `منذ ${hours} ساعة`;
      }
      if (days === 1) return 'أمس';
      if (days < 7) return `منذ ${days} أيام`;
      return date.toLocaleDateString('ar-EG');
    }

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) return 'Just now';
      return `${hours}h ago`;
    }
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const getNotificationStyle = (title, content) => {
    const lowerTitle = title.toLowerCase();
    const lowerContent = content.toLowerCase();
    if (lowerTitle.includes('contest') || lowerContent.includes('contest') || lowerTitle.includes('event')) {
      return {
        emoji: <Trophy className="w-6 h-6 text-emerald-500" />,
        category: t('notifications.category_event'),
        borderColor: 'border-emerald-500/50',
        glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)] dark:shadow-[0_0_30px_rgba(16,185,129,0.2)]',
        iconBg: 'bg-emerald-500/10',
        textColor: 'text-emerald-500'
      };
    }
    if (lowerTitle.includes('grade') || lowerContent.includes('grade') || lowerTitle.includes('score')) {
      return {
        emoji: <TrendingUp className="w-6 h-6 text-blue-500" />,
        category: t('notifications.category_grades'),
        borderColor: 'border-blue-500/50',
        glow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)] dark:shadow-[0_0_30px_rgba(59,130,246,0.2)]',
        iconBg: 'bg-blue-500/10',
        textColor: 'text-blue-500'
      };
    }
    if (lowerTitle.includes('security') || lowerContent.includes('login') || lowerTitle.includes('password')) {
      return {
        emoji: <ShieldCheck className="w-6 h-6 text-rose-500" />,
        category: t('notifications.category_security'),
        borderColor: 'border-rose-500/50',
        glow: 'shadow-[0_0_20px_rgba(244,63,94,0.3)] dark:shadow-[0_0_30px_rgba(244,63,94,0.2)]',
        iconBg: 'bg-rose-500/10',
        textColor: 'text-rose-500'
      };
    }
    return {
      emoji: <Info className="w-6 h-6 text-primary" />,
      category: t('notifications.category_info'),
      borderColor: 'border-primary/50',
      glow: 'shadow-[0_0_20px_rgba(46,204,113,0.3)] dark:shadow-[0_0_30px_rgba(46,204,113,0.2)]',
      iconBg: 'bg-primary/10',
      textColor: 'text-primary'
    };
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
          className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-bold px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/20 backdrop-blur-md hover:bg-primary hover:text-white dark:hover:bg-primary hover:border-primary transition-all shadow-sm mx-1 text-sm mt-2 mb-1"
        >
          {match[1]} <span className={`text-[10px] ${i18n.language === 'ar' ? 'rotate-180' : ''}`}>↗</span>
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
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-500 overflow-hidden relative">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400 font-bold text-xs tracking-wide">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white font-sans transition-colors duration-500 relative overflow-hidden">
      {/* Background Ambient Orbs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 dark:bg-blue-500/10 blur-[150px] rounded-full mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 dark:bg-primary/10 blur-[150px] rounded-full mix-blend-multiply dark:mix-blend-screen"></div>
      </div>

      <Sidebar activePage="notifications" onLogout={handleLogout} />

      <div className="md:ps-96 pb-24 md:pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-2">
            <div className="flex items-center gap-4 text-start">
              <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-2xl border border-primary/20 shadow-sm relative">
                <Bell className="w-8 h-8 text-primary" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 w-5 h-5 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-[#0a0a0a] -inset-inline-end-2">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">{t('notifications.title')}</h1>
                <p className="text-gray-500 dark:text-gray-400 font-semibold mt-1">{t('notifications.desc')}</p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> {t('notifications.mark_all')}
              </button>
            )}
          </div>

          {/* Masonry Grid Layout */}
          {notifications.length === 0 ? (
            <div className="py-20 bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-[2.5rem] border-2 border-dashed border-gray-300 dark:border-white/10 text-center shadow-sm flex flex-col items-center justify-center max-w-3xl mx-auto mt-12">
              <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center mb-6">
                <CheckCircle className="w-12 h-12 text-gray-300 dark:text-gray-600" />
              </div>
              <h4 className="font-black text-2xl text-gray-900 dark:text-white mb-2">{t('notifications.no_alerts')}</h4>
              <p className="text-gray-500 dark:text-gray-400 font-medium">{t('notifications.no_alerts_desc')}</p>
            </div>
          ) : (
            <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6 mt-8">
              {notifications.map((notification) => {
                const { emoji, category, borderColor, glow, iconBg, textColor } = getNotificationStyle(notification.title, notification.content);
                const isUnread = !notification.is_read;

                return (
                  <div
                    key={notification.id}
                    className={`break-inside-avoid relative overflow-hidden bg-white/90 dark:bg-[#111]/90 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 cursor-pointer transition-all duration-500 ${isUnread
                        ? `border-2 ${borderColor} ${glow} hover:-translate-y-2 hover:scale-[1.02]`
                        : 'border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-lg hover:-translate-y-1 opacity-80 hover:opacity-100'
                      } text-start`}
                    onClick={() => isUnread && markAsRead(notification.id)}
                  >
                    {/* Unread Glow Background */}
                    {isUnread && (
                      <div className={`absolute -top-20 w-48 h-48 rounded-full blur-[50px] opacity-20 pointer-events-none ${iconBg.replace('bg-', 'bg-')} -inset-inline-end-20`}></div>
                    )}

                    <div className="relative z-10">
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <div className={`w-14 h-14 rounded-[1.2rem] shrink-0 ${iconBg} flex items-center justify-center border border-white/5 shadow-inner`}>
                          {emoji}
                        </div>
                        <div className="text-start shrink-0">
                          <span className="inline-block px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                            {formatDate(notification.created_at)}
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <span className={`text-[10px] font-black uppercase tracking-widest mb-1 block ${textColor}`}>
                          {category}
                        </span>
                        <h3 className={`text-xl font-black leading-tight ${isUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {notification.title}
                        </h3>
                      </div>

                      <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {renderContent(notification.content)}
                      </div>

                      {isUnread && (
                        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/10 flex justify-end text-start">
                          <div className={`text-xs font-bold ${textColor} flex items-center gap-2 group-hover:underline`}>
                            <CheckCircle2 className="w-4 h-4" /> {t('notifications.click_to_read')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentNotifications;
