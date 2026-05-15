import React, { useState, useEffect } from 'react';
import { Users, BookOpen, ClipboardList, Zap, Upload, Plus, CheckSquare, Calendar, ChevronRight, Clock, MapPin, MessageSquare, ArrowUpRight } from 'lucide-react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import { motion } from 'framer-motion';

const DoctorOverview = ({ stats, doctor, timetable, setActiveTab }) => {
  const { doctorApi } = useDoctorAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await doctorApi('get', '/doctor/recent-activity');
        setActivities(res.data);
      } catch (err) {
        console.error('Failed to fetch recent activity', err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, [doctorApi]);

  const SUMMARY_CARDS = [
    { label: 'Active Students', value: stats.students, icon: Users, color: 'violet', gradient: 'from-violet-500/20 to-purple-500/20' },
    { label: 'Courses', value: stats.courses, icon: BookOpen, color: 'blue', gradient: 'from-blue-500/20 to-indigo-500/20' },
    { label: 'Portal Quizzes', value: stats.quizzes, icon: ClipboardList, color: 'amber', gradient: 'from-amber-500/20 to-orange-500/20' },
    { label: 'New Resources', value: stats.resources, icon: Zap, color: 'emerald', gradient: 'from-emerald-500/20 to-teal-500/20' },
  ];

  const QUICK_ACTIONS = [
    { label: 'Upload Material', desc: 'Add slides or reading docs', icon: Upload, color: 'violet', tab: 'materials' },
    { label: 'Create Quiz', desc: 'Draft a new assessment', icon: Plus, color: 'blue', tab: 'quizzes' },
    { label: 'Grade Tasks', desc: 'Review submissions', icon: CheckSquare, color: 'amber', tab: 'tasks' },
    { label: 'Schedule Class', desc: 'Set up a live session', icon: Calendar, color: 'emerald', tab: 'schedule' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1, y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-12 pb-20"
    >
      {/* Welcome Title */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
              Hello, Inst. {doctor?.name.split(' ')[0]}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-lg lg:text-xl max-w-2xl">
              Welcome back to your academic hub. Here is what's happening with your classes today.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-violet-500/10 border border-violet-500/20 rounded-2xl">
            <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></div>
            <span className="text-xs font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest">Portal Active</span>
          </div>
        </div>
      </motion.div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {SUMMARY_CARDS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={i}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="relative group overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              <div className="bg-white/80 dark:bg-white/[0.03] backdrop-blur-sm border border-white dark:border-white/5 p-8 rounded-[2.5rem] relative z-10 shadow-2xl shadow-gray-200/50 dark:shadow-none transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl bg-${stat.color}-500/10 dark:bg-${stat.color}-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-${stat.color}-500/20`}>
                  <Icon className={`w-7 h-7 text-${stat.color}-600 dark:text-${stat.color}-400 transition-colors`} />
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-4xl font-black text-gray-900 dark:text-white mb-2 leading-none">{stat.value}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-[11px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Left Column: Quick Actions & Recent Activity */}
        <div className="xl:col-span-2 space-y-12">
          {/* Quick Actions */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                Quick Hub <span className="w-8 h-[2px] bg-violet-500/30 rounded-full"></span>
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {QUICK_ACTIONS.map((action, i) => {
                const Icon = action.icon;
                return (
                  <motion.button 
                    key={i}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(action.tab)}
                    className="bg-white/40 dark:bg-white/[0.02] backdrop-blur-md border border-white dark:border-white/5 p-6 rounded-[2rem] flex items-center gap-6 hover:bg-white/80 dark:hover:bg-white/[0.05] hover:border-violet-500/30 transition-all group text-left shadow-sm dark:shadow-none"
                  >
                    <div className={`w-16 h-16 rounded-2xl bg-${action.color}-500/10 dark:bg-${action.color}-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-${action.color}-500/10`}>
                      <Icon className={`w-7 h-7 text-${action.color}-600 dark:text-${action.color}-400`} />
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white font-black text-lg leading-none mb-1.5">{action.label}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{action.desc}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </section>

          {/* Recent Activity */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                Insights <span className="w-8 h-[2px] bg-violet-500/30 rounded-full"></span>
              </h3>
              <button 
                onClick={() => setActiveTab('inquiries')}
                className="group flex items-center gap-2 text-violet-600 dark:text-violet-400 font-black text-xs uppercase tracking-widest hover:translate-x-1 transition-transform"
              >
                Inquiries Center <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm border border-white dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-gray-200/50 dark:shadow-none">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <div className="w-10 h-10 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Synching Data...</p>
                </div>
              ) : activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center px-10">
                   <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                     <Clock className="w-10 h-10 text-gray-300 dark:text-white/10" />
                   </div>
                   <p className="text-gray-900 dark:text-white font-black text-xl mb-2">Queue is Empty</p>
                   <p className="text-gray-500 dark:text-gray-400 text-sm font-medium max-w-xs mx-auto">New student submissions and course activities will appear here.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-white/5">
                  {activities.map((activity, i) => (
                    <motion.div 
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-6 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center overflow-hidden border border-white dark:border-white/5 group relative">
                          <img 
                            src={activity.avatar_url || `https://ui-avatars.com/api/?name=${activity.user}&background=random&color=fff`} 
                            alt={activity.user}
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          />
                        </div>
                        <div>
                          <p className="text-gray-900 dark:text-white font-black text-[15px] mb-1">
                            {activity.user} <span className="text-gray-500 dark:text-gray-400 font-medium lowercase">{activity.action}</span>
                          </p>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-violet-500">{activity.category}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-white/10"></span>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                              <Clock className="w-3 h-3" />
                              {new Date(activity.time).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      {activity.status && (
                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                          activity.type === 'assignment' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                            : 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20'
                        }`}>
                          {activity.status}
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Upcoming Schedule */}
        <div className="space-y-12">
          <section>
             <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                Agenda <span className="w-8 h-[2px] bg-violet-500/30 rounded-full"></span>
              </h3>
              <div className="px-4 py-1.5 bg-gray-100 dark:bg-white/5 rounded-xl">
                <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm border border-white dark:border-white/5 rounded-[3rem] p-8 space-y-10 relative overflow-hidden shadow-2xl shadow-gray-200/50 dark:shadow-none">
              {/* Vertical line with gradient */}
              <div className="absolute left-[39px] top-12 bottom-12 w-[2px] bg-gradient-to-b from-violet-500/50 via-gray-100 dark:via-white/5 to-transparent"></div>
              
              {timetable && timetable.length > 0 ? (
                <div className="space-y-10">
                  {timetable.slice(0, 4).map((entry, i) => (
                    <motion.div 
                      key={i} 
                      variants={itemVariants}
                      className="relative flex gap-8 group"
                    >
                      {/* Indicator */}
                      <div className="relative z-10 w-3 h-3 rounded-full bg-violet-500 mt-2 ring-8 ring-violet-500/10 group-hover:scale-125 transition-transform duration-500"></div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-violet-600 dark:text-violet-400 text-[10px] font-black tracking-[0.2em] uppercase bg-violet-500/10 px-2 py-0.5 rounded-md">
                            {entry.start_time.slice(0, 5)} - {entry.end_time.slice(0, 5)}
                          </span>
                        </div>
                        <h4 className="text-gray-900 dark:text-white font-black text-lg leading-tight mb-3 group-hover:text-violet-500 transition-colors">
                          {entry.course_name}
                        </h4>
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                             <MapPin className="w-3.5 h-3.5" />
                             <span className="text-[11px] font-bold uppercase tracking-wider">{entry.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                             <Clock className="w-3.5 h-3.5" />
                             <span className="text-[11px] font-bold uppercase tracking-wider">{entry.type}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                   <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                     <Calendar className="w-8 h-8 text-gray-300 dark:text-white/10" />
                   </div>
                   <p className="text-gray-500 dark:text-gray-400 text-sm font-black uppercase tracking-widest">Free Agenda Today</p>
                </div>
              )}

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('schedule')}
                className="w-full bg-gray-900 dark:bg-white text-white dark:text-black font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-gray-200 dark:shadow-none"
              >
                Full Schedule
              </motion.button>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
};

export default DoctorOverview;
