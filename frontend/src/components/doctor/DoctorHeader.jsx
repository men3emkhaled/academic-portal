import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Bell, HelpCircle, User, CheckCircle2, Clock, Inbox, ChevronRight } from 'lucide-react';

const DoctorHeader = ({ 
  doctor, onSearch, onCreateQuiz, 
  notifications = [], unreadCount = 0, onMarkRead, onMarkAllRead,
  setActiveTab
}) => {
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
    <header className="h-20 lg:h-24 bg-doctor-bg/80 backdrop-blur-xl border-b border-white/[0.03] flex items-center justify-between px-4 lg:px-10 z-40">
      {/* Search Bar */}
      <div className="relative w-full max-w-[180px] sm:max-w-96 group">
        <Search className="absolute left-4 lg:left-5 top-1/2 -translate-y-1/2 w-4 lg:w-5 h-4 lg:h-5 text-doctor-text-muted group-focus-within:text-doctor-primary transition-colors" />
        <input 
          type="text" 
          placeholder="Search..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full bg-doctor-text/5 border border-doctor-text/5 rounded-xl lg:rounded-2xl py-2.5 lg:py-3.5 pl-11 lg:pl-14 pr-4 lg:pr-6 text-sm lg:text-base text-doctor-text placeholder-doctor-text-muted focus:outline-none focus:border-doctor-primary/50 focus:ring-4 focus:ring-doctor-primary/10 transition-all font-medium"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 lg:gap-6">
        <button 
          onClick={onCreateQuiz}
          className="hidden lg:flex bg-doctor-primary/10 text-doctor-primary border border-doctor-primary/20 hover:bg-doctor-primary/20 font-bold px-6 py-3 rounded-2xl items-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Create Quiz</span>
        </button>

        <div className="flex items-center gap-2 lg:gap-3">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl border flex items-center justify-center transition-all relative ${
                showNotifications ? 'bg-doctor-primary text-white border-doctor-primary' : 'bg-doctor-text/5 border-doctor-text/5 text-doctor-text-muted hover:text-doctor-text hover:bg-doctor-text/10'
              }`}
            >
              <Bell className="w-4 lg:w-5 h-4 lg:h-5" />
              {unreadCount > 0 && (
                <div className="absolute top-2.5 lg:top-3 right-2.5 lg:right-3 w-4 h-4 bg-rose-500 rounded-full border-2 border-doctor-bg flex items-center justify-center">
                    <span className="text-[8px] font-black text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
                </div>
              )}
            </button>

            {showNotifications && (
              <div className="absolute top-14 lg:top-16 right-0 w-80 lg:w-96 bg-doctor-sidebar border border-doctor-text/10 rounded-3xl shadow-2xl z-50 overflow-hidden animate-slideUp">
                <div className="p-5 border-b border-doctor-text/5 flex items-center justify-between">
                  <h4 className="font-black text-doctor-text text-sm uppercase tracking-widest">Notifications</h4>
                  {unreadCount > 0 && (
                    <button 
                        onClick={onMarkAllRead}
                        className="text-[10px] font-black text-doctor-primary hover:underline uppercase tracking-widest"
                    >
                        Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="py-12 text-center">
                        <Inbox className="w-10 h-10 text-white/5 mx-auto mb-3" />
                        <p className="text-doctor-text-muted text-xs font-bold">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id}
                        onClick={() => !n.is_read && onMarkRead(n.id)}
                        className={`p-5 border-b border-white/5 flex gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer relative group ${!n.is_read ? 'bg-doctor-primary/5' : ''}`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            !n.is_read ? 'bg-doctor-primary/20 text-doctor-primary' : 'bg-white/5 text-doctor-text-muted'
                        }`}>
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <p className={`text-xs font-bold truncate pr-4 ${!n.is_read ? 'text-doctor-text' : 'text-doctor-text-muted'}`}>
                                    {n.title}
                                </p>
                                <span className="text-[9px] text-doctor-text-muted font-bold whitespace-nowrap">
                                    {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                            <p className="text-[11px] text-doctor-text-muted leading-relaxed line-clamp-2">
                                {n.content}
                            </p>
                        </div>
                        {!n.is_read && (
                            <div className="absolute right-4 bottom-5 w-1.5 h-1.5 rounded-full bg-doctor-primary shadow-[0_0_8px_#8b5cf6]"></div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                    <div className="p-4 bg-white/[0.02] text-center border-t border-white/5">
                        <button 
                          onClick={() => { setActiveTab('notifications'); setShowNotifications(false); }}
                          className="text-[10px] font-black text-doctor-text-muted uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2 w-full"
                        >
                            View all activity <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                )}
              </div>
            )}
          </div>

          <button className="hidden lg:flex w-12 h-12 rounded-2xl bg-doctor-text/5 border border-doctor-text/5 items-center justify-center text-doctor-text-muted hover:text-doctor-text hover:bg-doctor-text/10 transition-all">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="hidden lg:block h-10 w-[1px] bg-doctor-text/5 mx-2"></div>

        <div className="flex items-center gap-2 lg:gap-3 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-doctor-text tracking-tight leading-none mb-1 group-hover:text-doctor-primary transition-colors">Dr. {doctor?.name?.split(' ')[0]}</p>
            <p className="text-[10px] font-black text-doctor-text-muted uppercase tracking-widest">Active</p>
          </div>
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-gradient-to-br from-doctor-primary to-doctor-secondary p-[2px] group-hover:scale-105 transition-transform">
             <div className="w-full h-full rounded-[9px] lg:rounded-[14px] bg-doctor-sidebar flex items-center justify-center overflow-hidden">
                <img 
                  src={doctor?.avatar_url || `https://ui-avatars.com/api/?name=${doctor?.name}&background=8b5cf6&color=fff`} 
                  alt={doctor?.name}
                  className="w-full h-full object-cover"
                />
             </div>
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border-main); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--doctor-text-muted); }
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(10px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slideUp { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </header>
  );
};

export default DoctorHeader;
