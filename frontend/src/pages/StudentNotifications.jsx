import React, { useEffect } from 'react';
import { Trophy, TrendingUp, ShieldCheck, Info, CheckCircle2, CheckCircle } from 'lucide-react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useStudentData } from '../context/StudentDataContext';
import { useNavigate } from 'react-router-dom';
import studentApi from '../services/studentApi';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';

const StudentNotifications = () => {
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
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/student/login');
    toast.success('Logged out successfully');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const getNotificationStyle = (title, content) => {
    const lowerTitle = title.toLowerCase();
    const lowerContent = content.toLowerCase();
    if (lowerTitle.includes('contest') || lowerContent.includes('contest')) {
      return { emoji: <Trophy className="w-6 h-6 text-primary" />, category: 'Event', borderColor: 'bg-primary', iconBg: 'bg-primary/10 dark:bg-primary/20', textColor: 'text-primary' };
    }
    if (lowerTitle.includes('grade') || lowerContent.includes('grade')) {
      return { emoji: <TrendingUp className="w-6 h-6 text-secondary" />, category: 'Grades', borderColor: 'bg-secondary', iconBg: 'bg-secondary/10 dark:bg-secondary/20', textColor: 'text-secondary' };
    }
    if (lowerTitle.includes('security') || lowerContent.includes('login')) {
      return { emoji: <ShieldCheck className="w-6 h-6 text-tertiary" />, category: 'Security', borderColor: 'bg-tertiary', iconBg: 'bg-tertiary/10 dark:bg-tertiary/20', textColor: 'text-tertiary' };
    }
    return { emoji: <Info className="w-6 h-6 text-primary" />, category: 'Info', borderColor: 'bg-primary', iconBg: 'bg-primary/10 dark:bg-primary/20', textColor: 'text-primary' };
  };

  // دالة متقدمة لتحويل النص وتصميم الروابط بشكل جميل
  const renderContent = (text) => {
    if (!text) return '';

    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      // Add text before link
      if (match.index > lastIndex) {
        const textBefore = text.substring(lastIndex, match.index).trim();
        if (textBefore) {
          parts.push(
            <span key={`text-${lastIndex}`} className="inline">
              {textBefore}{' '}
            </span>
          );
        }
      }
      // Add styled link as button
      parts.push(
        <a
          key={`link-${match.index}`}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-green-50 text-green-700 dark:from-green-500/30 dark:to-green-500/15 dark:text-green-300 font-semibold px-5 py-2.5 rounded-xl border border-green-300 dark:border-green-500/50 backdrop-blur-lg hover:border-green-400 dark:hover:border-green-400/70 hover:from-green-200 hover:to-green-100 dark:hover:from-green-500/40 dark:hover:to-green-500/25 transition-all shadow-sm hover:shadow-md mx-1"
        >
          🔗 {match[1]}
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const textAfter = text.substring(lastIndex).trim();
      if (textAfter) {
        parts.push(
          <span key={`text-${lastIndex}`} className="inline">
            {' '}{textAfter}
          </span>
        );
      }
    }

    return parts.length > 0 ? parts : text;
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

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark text-gray-900 dark:text-white font-body transition-colors duration-300">
      <Sidebar activePage="notifications" onLogout={handleLogout} />

      <div className="md:ml-64 pb-24 md:pb-8">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-headline text-4xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-white/70 leading-tight pb-2 mb-2">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-primary/20 hover:text-primary hover:border-primary/40 shadow-sm dark:shadow-inner rounded-full text-xs font-bold uppercase tracking-wider transition-all"
              >
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="text-center mt-16 opacity-70">
              <div className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-dashed border-gray-300 dark:border-white/10 bg-white/50 dark:bg-dark-glass/50 shadow-sm dark:shadow-inner">
                <span className="text-4xl text-gray-500">✅</span>
              </div>
              <h4 className="font-headline font-bold text-xl text-gray-900 dark:text-white">All caught up!</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-[200px] mx-auto">
                No new alerts. Your kinetic schedule is running smoothly.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {notifications.map((notification) => {
                const { emoji, category, borderColor, iconBg, textColor } = getNotificationStyle(notification.title, notification.content);
                const isUnread = !notification.is_read;
                return (
                  <div
                    key={notification.id}
                    className={`relative rounded-xl p-6 backdrop-blur-sm transition-all duration-200 shadow-sm dark:shadow-none ${
                      isUnread
                        ? 'bg-white dark:bg-dark-card border border-primary/30 shadow-[0_4px_15px_rgba(46,204,113,0.15)] dark:shadow-[0_12px_40px_rgba(142,255,113,0.15)] -translate-y-1 hover:shadow-[0_8px_20px_rgba(46,204,113,0.2)] dark:hover:shadow-[0_15px_50px_rgba(142,255,113,0.2)] hover:-translate-y-1.5 transition-all duration-300'
                        : 'bg-white/60 dark:bg-dark-glass border border-gray-200 dark:border-white/5 opacity-80 hover:opacity-100'
                    }`}
                    onClick={() => isUnread && markAsRead(notification.id)}
                  >
                    {isUnread && (
                      <div className={`absolute top-0 left-0 w-1 h-full ${borderColor} rounded-l-xl shadow-[0_0_10px_rgba(46,204,113,0.5)] dark:shadow-[0_0_20px_rgba(142,255,113,0.6)]`} />
                    )}
                    
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center`}>
                          {emoji}
                        </div>
                        <div>
                          <h3 className={`font-headline font-bold text-xl ${isUnread ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                            {notification.title}
                          </h3>
                          <p className={`text-xs font-label uppercase tracking-widest mt-0.5 ${textColor}`}>
                            {category}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-label text-gray-500 dark:text-gray-400/60 uppercase tracking-tighter">
                        {formatDate(notification.created_at)}
                      </span>
                    </div>
                    
                    <div className="text-gray-600 dark:text-gray-400 text-base leading-relaxed mt-4 whitespace-pre-wrap" dir="auto">
                      {renderContent(notification.content)}
                    </div>
                    
                    {isUnread && (
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                          className="text-xs font-bold text-primary/80 dark:text-primary/70 hover:text-primary transition-colors uppercase tracking-wider px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20"
                        >
                          Mark as read
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <style>{`
        .font-headline { font-family: 'Manrope', 'Inter', sans-serif; }
        .bg-dark-glass { background: rgba(17, 17, 17, 0.7); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
      `}</style>
    </div>
  );
};

export default StudentNotifications;