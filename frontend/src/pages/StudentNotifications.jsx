import React, { useEffect } from 'react';
import { 
  Trophy, TrendingUp, ShieldCheck, 
  Info, CheckCircle2, CheckCircle, 
  Bell, Zap, ArrowRight, Star,
  Layers, Info as InfoIcon
} from 'lucide-react';
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
        icon: <Trophy className="w-6 h-6" />,
        category: t('notifications.category_event'),
        color: '#10b981',
        glow: 'shadow-[0_0_30px_rgba(16,185,129,0.2)]'
      };
    }
    if (lowerTitle.includes('grade') || lowerContent.includes('grade') || lowerTitle.includes('score')) {
      return {
        icon: <TrendingUp className="w-6 h-6" />,
        category: t('notifications.category_grades'),
        color: '#3b82f6',
        glow: 'shadow-[0_0_30px_rgba(59,130,246,0.2)]'
      };
    }
    if (lowerTitle.includes('security') || lowerContent.includes('login') || lowerTitle.includes('password')) {
      return {
        icon: <ShieldCheck className="w-6 h-6" />,
        category: t('notifications.category_security'),
        color: '#f43f5e',
        glow: 'shadow-[0_0_30px_rgba(244,63,94,0.2)]'
      };
    }
    return {
      icon: <InfoIcon className="w-6 h-6" />,
      category: t('notifications.category_info'),
      color: '#10b981',
      glow: 'shadow-[0_0_30px_rgba(16,185,129,0.2)]'
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
          className="inline-flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white font-black px-4 py-2 rounded-xl border border-gray-100 dark:border-white/5 hover:bg-[#10b981] hover:text-white dark:hover:bg-[#2cfc7d] dark:hover:text-black transition-all mx-1 text-xs mt-2"
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
        <div className="w-12 h-12 border-2 border-gray-200 dark:border-white/10 border-t-[#2cfc7d] rounded-full animate-spin"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

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
        <section className="px-6 lg:px-10 pt-16 pb-12 max-w-[1500px] mx-auto w-full space-y-12 text-start">
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            <div className="space-y-4 text-start">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2cfc7d]"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30">{t('notifications.title')}</span>
              </div>
              <h1 className={`text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-[0.95] tracking-tighter uppercase text-gray-900 dark:text-white ${isAr ? 'font-arabic' : ''}`}>
                {t('mavi.system')}
              </h1>
            </div>

            {unreadCount > 0 && (
              <div className="flex bg-white dark:bg-white/5 p-2 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl">
                 <div className="flex items-center gap-6 px-8 py-4">
                    <button 
                       onClick={markAllAsRead}
                       className="bg-[#10b981] dark:bg-[#2cfc7d] text-white dark:text-black text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-2xl hover:scale-[1.02] transition-all shadow-lg"
                    >
                       {t('notifications.mark_all')}
                    </button>
                 </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
            
            {/* Header Bento Card */}
            <div className="lg:col-span-12 bg-white dark:bg-[#151520] border border-gray-100 dark:border-white/5 rounded-[3rem] p-12 flex flex-col md:flex-row justify-between gap-12 group hover:shadow-2xl transition-all duration-700 text-start">
               <div className="space-y-6 flex-1 text-start">
                  <p className={`text-3xl font-black leading-tight tracking-tight ${isAr ? 'font-arabic' : ''}`}>
                    {t('mavi.notifications_desc')}
                  </p>
               </div>
               <div className="grid grid-cols-2 gap-10 md:w-1/3 border-t md:border-t-0 md:border-s border-gray-100 dark:border-white/5 pt-10 md:pt-0 md:ps-12">
                  <div className="space-y-1">
                     <span className="text-4xl font-black text-[#10b981] dark:text-[#2cfc7d]">{unreadCount}</span>
                     <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30">{t('mavi.active')}</p>
                  </div>
                  <div className="space-y-1">
                     <span className="text-4xl font-black text-gray-900 dark:text-white">{notifications.length}</span>
                     <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30">{t('mavi.logged')}</p>
                  </div>
               </div>
            </div>

            {/* NOTIFICATIONS MATRIX */}
            <div className="lg:col-span-12 space-y-8">
               <div className="columns-1 md:columns-2 xl:columns-3 gap-8 space-y-8">
                  {notifications.length === 0 ? (
                    <div className="col-span-full py-32 bg-white dark:bg-[#151520] border border-dashed border-gray-100 dark:border-white/10 rounded-[3rem] text-center opacity-40">
                       <Bell className="w-16 h-16 mx-auto mb-6 opacity-20" />
                       <h3 className="text-xl font-black uppercase tracking-[0.4em]">{t('notifications.no_alerts')}</h3>
                    </div>
                  ) : (
                    notifications.map((notification, idx) => {
                      const { icon, category, color, glow } = getNotificationStyle(notification.title, notification.content);
                      const isUnread = !notification.is_read;

                      return (
                        <div 
                          key={notification.id}
                          onClick={() => isUnread && markAsRead(notification.id)}
                          className={`break-inside-avoid group bg-white dark:bg-[#151520] border rounded-[3rem] p-10 space-y-8 transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl shadow-sm relative overflow-hidden text-start cursor-pointer ${isUnread ? `border-[#10b981]/20 dark:border-[#2cfc7d]/20 ${glow}` : 'border-gray-100 dark:border-white/5 opacity-60'}`}
                        >
                           <div className="flex justify-between items-start">
                              <div 
                                 className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-inner"
                                 style={{ backgroundColor: `${color}15`, color: color }}
                              >
                                 {icon}
                              </div>
                              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                 {formatDate(notification.created_at)}
                              </div>
                           </div>

                           <div className="space-y-2 text-start">
                              <h3 className={`text-xl font-black leading-tight uppercase tracking-tighter ${isAr ? 'font-arabic' : ''}`}>
                                 {notification.title}
                              </h3>
                           </div>

                           <div className="text-gray-500 dark:text-white/40 text-sm leading-relaxed font-medium group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                              {renderContent(notification.content)}
                           </div>

                           {isUnread && (
                             <div className="pt-6 border-t border-black/5 dark:border-white/5 flex justify-end">
                                <div className="text-[9px] font-black uppercase tracking-widest text-[#10b981] dark:text-[#2cfc7d] flex items-center gap-2">
                                   <Zap className="w-3 h-3 fill-current" /> {t('notifications.click_to_read')}
                                </div>
                             </div>
                           )}
                        </div>
                      );
                    })
                  )}
               </div>
            </div>

          </div>
        </section>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
        .font-arabic { font-family: 'Cairo', sans-serif !important; }
      `}</style>
    </div>
  );
};

export default StudentNotifications;
