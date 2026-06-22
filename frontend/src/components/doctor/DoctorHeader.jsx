import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Bell, HelpCircle, User, CheckCircle2, Clock, Inbox, ChevronRight } from 'lucide-react';

const DoctorHeader = ({ 
  doctor, onSearch, onCreateQuiz, 
  notifications = [], unreadCount = 0, onMarkRead, onMarkAllRead,
  setActiveTab
}) => {
  const { t } = useTranslation();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 lg:h-20 bg-white/40 dark:bg-[#050505]/60 backdrop-blur-sm border-b border-gray-200/50 dark:border-white/5 flex items-center justify-between px-4 lg:px-8 z-40">
      
      <div className="relative w-full max-w-[180px] sm:max-w-md">
        <div className="relative flex items-center">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder={t('doctor.header.quick_search')}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full bg-gray-100/50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-6">
        <button onClick={onCreateQuiz} className="hidden lg:flex bg-gray-900 dark:bg-white text-white dark:text-black font-medium px-5 py-2.5 rounded-xl items-center gap-2 text-sm transition-all hover:opacity-90">
          <Plus className="w-4 h-4" />
          {t('doctor.header.new_assessment')}
        </button>

        <div className="relative" ref={notificationRef}>
          <button onClick={() => setShowNotifications(!showNotifications)} className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all relative ${
            showNotifications 
              ? 'bg-[#059669] text-white border-[#059669]' 
              : 'bg-white/50 dark:bg-white/[0.03] border-gray-200 dark:border-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}>
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white dark:border-[#050505] flex items-center justify-center text-[8px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-14 right-0 w-80 lg:w-[360px] bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{t('doctor.header.activity_feed')}</h4>
                {unreadCount > 0 && (
                  <button onClick={onMarkAllRead} className="text-xs text-[#059669] hover:underline font-medium">
                    {t('doctor.header.clear_all')}
                  </button>
                )}
              </div>
              <div className="max-h-[350px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-16 text-center px-10">
                    <Inbox className="w-8 h-8 text-gray-200 dark:text-white/10 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">{t('doctor.notifications.empty')}</p>
                  </div>
                ) : (
                  <div>
                    {notifications.map((n) => (
                      <div 
                        key={n.id}
                        onClick={() => !n.is_read && onMarkRead(n.id)}
                        className={`p-4 flex gap-3 hover:bg-gray-50 dark:hover:bg-white/[0.02] cursor-pointer ${!n.is_read ? 'bg-[#059669]/[0.02]' : ''}`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                            !n.is_read ? 'bg-[#059669]/10 text-[#059669]' : 'bg-gray-50 dark:bg-white/5 text-gray-400'
                        }`}>
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <p className={`text-sm font-medium truncate pr-3 ${!n.is_read ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                                    {n.title}
                                </p>
                                <span className="text-xs text-gray-400">
                                    {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-2">{n.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {notifications.length > 0 && (
                  <div className="p-3 bg-gray-50/50 dark:bg-white/[0.02] text-center border-t border-gray-100 dark:border-white/5">
                      <button onClick={() => { setActiveTab('notifications'); setShowNotifications(false); }} className="text-xs text-gray-400 hover:text-[#059669] font-medium flex items-center justify-center gap-1 w-full">
                          {t('doctor.header.full_feed')} <ChevronRight className="w-3 h-3" />
                      </button>
                  </div>
              )}
            </div>
          )}
        </div>

        <button className="hidden lg:flex w-10 h-10 rounded-xl bg-white/50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white">
          <HelpCircle className="w-4 h-4" />
        </button>

        <div className="hidden lg:block h-6 w-px bg-gray-200 dark:bg-white/5 mx-2"></div>

        <div className="flex items-center gap-3 cursor-pointer pl-4 border-l border-gray-100 dark:border-white/5">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Dr. {doctor?.name?.split(' ')[0]}</p>
          </div>
          <div className="w-9 h-9 rounded-lg overflow-hidden border border-gray-200 dark:border-white/10">
             <img 
               src={doctor?.avatar_url || `https://ui-avatars.com/api/?name=${doctor?.name}&background=059669&color=fff`} 
               alt={doctor?.name}
               className="w-full h-full object-cover"
             />
          </div>
        </div>
      </div>
    </header>
  );
};

export default DoctorHeader;
