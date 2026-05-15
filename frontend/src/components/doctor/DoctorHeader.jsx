import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Bell, HelpCircle, User, CheckCircle2, Clock, Inbox, ChevronRight, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <header className="h-20 lg:h-24 bg-white/40 dark:bg-[#050505]/60 backdrop-blur-sm border-b border-gray-200/50 dark:border-white/5 flex items-center justify-between px-6 lg:px-12 z-40 transition-colors duration-500">
      
      {/* Search Bar Container */}
      <div className="relative w-full max-w-[180px] sm:max-w-md group">
        <div className="absolute inset-0 bg-violet-500/5 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
        <div className="relative flex items-center">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Quick Search..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full bg-gray-100/50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl py-3 pl-14 pr-6 text-[15px] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500/30 transition-all font-semibold"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 lg:gap-8">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreateQuiz}
          className="hidden lg:flex bg-gray-900 dark:bg-white text-white dark:text-black font-black px-8 py-3.5 rounded-2xl items-center gap-3 transition-all shadow-xl shadow-gray-200 dark:shadow-none hover:bg-black dark:hover:bg-gray-100"
        >
          <Plus className="w-5 h-5" />
          <span className="text-xs uppercase tracking-widest">New Assessment</span>
        </motion.button>

        <div className="flex items-center gap-3 lg:gap-4">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all relative ${
                showNotifications 
                  ? 'bg-violet-600 text-white border-violet-600' 
                  : 'bg-white/50 dark:bg-white/[0.03] border-gray-200 dark:border-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20'
              }`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-rose-500 rounded-full border-2 border-white dark:border-[#050505] flex items-center justify-center text-[8px] font-black text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-16 right-0 w-80 lg:w-[400px] bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-2xl z-50 overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <h4 className="font-black text-gray-900 dark:text-white text-xs uppercase tracking-[0.2em]">Activity Feed</h4>
                    {unreadCount > 0 && (
                      <button 
                          onClick={onMarkAllRead}
                          className="text-[10px] font-black text-violet-600 dark:text-violet-400 hover:underline uppercase tracking-widest"
                      >
                          Clear All
                      </button>
                    )}
                  </div>
                  <div className="max-h-[400px] overflow-y-auto hidden-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="py-20 text-center px-10">
                          <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Inbox className="w-8 h-8 text-gray-200 dark:text-white/10" />
                          </div>
                          <p className="text-gray-400 dark:text-gray-500 text-xs font-bold">Your agenda is clear.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50 dark:divide-white/5">
                        {notifications.map((n) => (
                          <div 
                            key={n.id}
                            onClick={() => !n.is_read && onMarkRead(n.id)}
                            className={`p-6 flex gap-4 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer relative group ${!n.is_read ? 'bg-violet-500/[0.02]' : ''}`}
                          >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                                !n.is_read ? 'bg-violet-500/10 text-violet-600 border-violet-500/20' : 'bg-gray-50 dark:bg-white/5 text-gray-400 border-transparent'
                            }`}>
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <p className={`text-[13px] font-black truncate pr-4 ${!n.is_read ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {n.title}
                                    </p>
                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                        {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                                <p className="text-[11px] text-gray-500 dark:text-gray-500 leading-relaxed line-clamp-2 font-medium">
                                    {n.content}
                                </p>
                            </div>
                            {!n.is_read && (
                                <div className="absolute right-4 bottom-6 w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_10px_#8b5cf6]"></div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                      <div className="p-5 bg-gray-50/50 dark:bg-white/[0.02] text-center border-t border-gray-100 dark:border-white/5">
                          <button 
                            onClick={() => { setActiveTab('notifications'); setShowNotifications(false); }}
                            className="text-[10px] font-black text-gray-400 hover:text-violet-500 dark:hover:text-violet-400 uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 w-full"
                          >
                              Full Feed <ChevronRight className="w-3 h-3" />
                          </button>
                      </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden lg:flex w-12 h-12 rounded-2xl bg-white/50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
          >
            <HelpCircle className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="hidden lg:block h-8 w-[1px] bg-gray-200 dark:bg-white/5 mx-2"></div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-5 group cursor-pointer pl-6 border-l border-gray-100 dark:border-white/5"
        >
          <div className="text-right hidden sm:block">
            <div className="flex items-center justify-end gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></span>
              <p className="text-sm font-black text-gray-900 dark:text-white tracking-tight">Inst. {doctor?.name?.split(' ')[0]}</p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-1.5 bg-gradient-to-tr from-violet-600/20 to-emerald-600/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="w-11 h-11 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 p-0.5 flex items-center justify-center relative z-10 overflow-hidden shadow-2xl transition-transform group-hover:rotate-3">
               <img 
                 src={doctor?.avatar_url || `https://ui-avatars.com/api/?name=${doctor?.name}&background=8b5cf6&color=fff`} 
                 alt={doctor?.name}
                 className="w-full h-full object-cover rounded-[0.8rem]"
               />
            </div>
          </div>
        </motion.div>
      </div>
    </header>
  );
};

export default DoctorHeader;
