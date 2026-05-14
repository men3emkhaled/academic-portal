import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, CheckCircle2, Clock, Inbox, Trash2, CheckCircle,
  MessageSquare, FileText, AlertTriangle, ShieldCheck, 
  Sparkles, ArrowRight, Zap, Filter
} from 'lucide-react';

const DoctorNotifications = ({ 
  notifications, 
  onMarkRead, 
  onMarkAllRead,
  loading 
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  const getNotificationIcon = (content, title) => {
    const text = (content + title).toLowerCase();
    if (text.includes('inquiry') || text.includes('question') || text.includes('message')) return MessageSquare;
    if (text.includes('submission') || text.includes('assignment') || text.includes('quiz')) return FileText;
    if (text.includes('urgent') || text.includes('alert') || text.includes('warning')) return AlertTriangle;
    return Bell;
  };

  const getNotificationColor = (content, title) => {
    const text = (content + title).toLowerCase();
    if (text.includes('inquiry')) return 'violet';
    if (text.includes('submission')) return 'emerald';
    if (text.includes('urgent')) return 'rose';
    return 'blue';
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-10 pb-12"
    >
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">System Monitoring</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-none">Activity Center</h2>
          <p className="text-gray-500 dark:text-gray-400 font-semibold max-w-xl">
            Real-time synchronization of student activity, academic inquiries, and system alerts.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {notifications.some(n => !n.is_read) && (
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onMarkAllRead}
              className="group flex items-center gap-3 px-8 py-4.5 rounded-[1.8rem] bg-violet-500 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-violet-500/20 transition-all"
            >
              <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Archive All Syncs
            </motion.button>
          )}
        </div>
      </div>

      {/* Main Stream */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-px bg-gray-100 dark:bg-white/5 hidden md:block"></div>

        <div className="space-y-6 relative z-10">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-32 text-center"
              >
                <div className="relative w-16 h-16 mx-auto mb-8">
                  <div className="absolute inset-0 border-4 border-violet-500/10 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-transparent border-t-violet-500 rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Syncing Stream...</p>
              </motion.div>
            ) : notifications.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-32 text-center bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[3.5rem] shadow-sm"
              >
                <div className="w-24 h-24 bg-gray-50 dark:bg-black/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-gray-100 dark:border-white/5">
                  <Inbox className="w-12 h-12 text-gray-200 dark:text-white/10" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Sync Complete</h3>
                <p className="text-gray-400 font-semibold max-w-sm mx-auto">
                  No pending alerts or activity streams detected in your current workspace session.
                </p>
              </motion.div>
            ) : (
              notifications.map((n, i) => {
                const Icon = getNotificationIcon(n.content, n.title);
                const color = getNotificationColor(n.content, n.title);
                
                return (
                  <motion.div 
                    layout
                    key={n.id}
                    variants={itemVariants}
                    exit={{ opacity: 0, scale: 0.95, x: -20 }}
                    onClick={() => !n.is_read && onMarkRead(n.id)}
                    className={`group relative flex gap-8 p-8 md:p-10 rounded-[3rem] transition-all cursor-pointer border ${
                      !n.is_read 
                      ? 'bg-white dark:bg-white/[0.04] border-gray-200 dark:border-violet-500/30 shadow-2xl shadow-violet-500/[0.03]' 
                      : 'bg-white/50 dark:bg-white/[0.01] border-gray-100 dark:border-white/5 hover:border-violet-500/20'
                    }`}
                  >
                    {/* Time Pin */}
                    <div className="absolute left-8 -translate-x-[4.5px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-violet-500 hidden md:block ring-4 ring-white dark:ring-[#0f0f0f] z-20 transition-all group-hover:scale-150 shadow-[0_0_15px_rgba(139,92,246,0.5)]"></div>

                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[2rem] flex items-center justify-center shrink-0 transition-all group-hover:scale-110 shadow-inner ${
                      !n.is_read ? `bg-${color}-500/10 text-${color}-600 dark:text-${color}-400` : 'bg-gray-100 dark:bg-white/5 text-gray-400'
                    }`}>
                      <Icon className="w-7 h-7 md:w-8 md:h-8" />
                    </div>
                    
                    <div className="flex-1 min-w-0 py-2">
                      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h4 className={`text-lg font-black truncate ${!n.is_read ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                              {n.title}
                            </h4>
                            {!n.is_read && (
                              <span className={`px-3 py-1 rounded-full bg-${color}-500/10 text-${color}-600 dark:text-${color}-400 text-[8px] font-black uppercase tracking-widest`}>
                                New Alert
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest opacity-60">System Synchronized</p>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-400 group-hover:text-violet-500 transition-colors">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                            {new Date(n.created_at).toLocaleString([], { 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                      
                      <p className={`text-sm md:text-base leading-relaxed ${!n.is_read ? 'text-gray-600 dark:text-gray-300 font-semibold' : 'text-gray-400 dark:text-gray-500'}`}>
                        {n.content}
                      </p>

                      <div className="mt-6 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                         <span className="text-[10px] font-black text-violet-500 uppercase tracking-widest flex items-center gap-2">
                           Interact with Source <ArrowRight className="w-3 h-3" />
                         </span>
                      </div>
                    </div>

                    {!n.is_read && (
                      <div className="absolute right-8 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.8)] animate-pulse"></div>
                    )}
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default DoctorNotifications;
