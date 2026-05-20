import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Users, AlertTriangle, CheckCircle2, 
  BarChart3, UserCheck, Calendar, Search, 
  TrendingUp, Award, Clock, BookOpen, Target,
  Filter, ChevronRight, Zap, Info, ArrowUpRight,
  LayoutGrid, List, PieChart, Eye, EyeOff, Sparkles,
  SearchX, TrendingDown, ShieldAlert
} from 'lucide-react';

const DoctorAnalytics = ({ courses }) => {
  const { doctorApi } = useDoctorAuth();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [activeView, setActiveView] = useState('overview'); 
  const [analyticsData, setAnalyticsData] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    if (selectedCourseId) {
      fetchAllData();
    } else {
      setAnalyticsData(null);
      setProgressData([]);
      setQuizData(null);
    }
  }, [selectedCourseId]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, progressRes, quizRes] = await Promise.all([
        doctorApi('get', `/doctor/course-analytics/${selectedCourseId}`),
        doctorApi('get', `/doctor/progress/${selectedCourseId}`),
        doctorApi('get', `/doctor/analytics/${selectedCourseId}`)
      ]);
      setAnalyticsData(analyticsRes.data);
      setProgressData(progressRes.data);
      setQuizData(quizRes.data);
    } catch (err) {
      toast.error('Failed to synchronize intelligence data');
    } finally {
      setLoading(false);
    }
  };

  const filteredProgress = progressData
    .filter(s =>
      (s.student_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      String(s.student_id || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return (a.student_name || '').localeCompare(b.student_name || '');
      if (sortBy === 'quiz') return (b.avg_quiz_score || 0) - (a.avg_quiz_score || 0);
      if (sortBy === 'grade') return (b.grade_total || 0) - (a.grade_total || 0);
      return 0;
    });

  const filteredAtRisk = analyticsData?.at_risk_students?.filter(s => 
    (s.student_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    String(s.student_id || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getScoreColor = (score) => {
    if (score === null || score === undefined) return 'text-gray-300 dark:text-white/20';
    if (score >= 75) return 'text-emerald-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-rose-500';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  const getProgressBar = (value, max = 100, color = null) => {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    const barColor = color || (pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500');
    return (
      <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full ${barColor}`}
        ></motion.div>
      </div>
    );
  };

  const distColors = {
    '0-20': { bg: 'bg-rose-500', text: 'text-rose-500' },
    '20-40': { bg: 'bg-orange-500', text: 'text-orange-500' },
    '40-60': { bg: 'bg-amber-500', text: 'text-amber-500' },
    '60-80': { bg: 'bg-blue-500', text: 'text-blue-500' },
    '80-100': { bg: 'bg-emerald-500', text: 'text-emerald-500' },
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-10 pb-12"
    >
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">System Intelligence</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-none">Intelligence Hub</h2>
          <p className="text-gray-500 dark:text-gray-400 font-semibold max-w-xl">
            Analyze class performance, detect academic risks, and synchronize student progress data.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="relative group min-w-[280px]">
              <div className="absolute inset-0 bg-violet-500/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="relative w-full bg-white/70 dark:bg-white/[0.03] backdrop-blur-md border border-gray-200 dark:border-white/5 rounded-2xl py-4 px-6 text-gray-900 dark:text-white font-black text-xs uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-violet-500/5 transition-all appearance-none cursor-pointer"
              >
                  <option value="" disabled>Select Target Course</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id} className="text-gray-900">{c.name}</option>
                  ))}
              </select>
              <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
            </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!selectedCourseId ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white/50 dark:bg-white/[0.01] border border-dashed border-gray-200 dark:border-white/5 rounded-[3.5rem] p-32 text-center"
          >
            <div className="w-24 h-24 rounded-[2.5rem] bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-8">
              <BarChart3 className="w-12 h-12 text-gray-300 dark:text-white/10" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Sync Pending</h3>
            <p className="text-gray-500 dark:text-gray-500 max-w-sm mx-auto font-semibold">Select a course to synchronize academic intelligence and visualize performance radar.</p>
          </motion.div>
        ) : loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-48 gap-8"
          >
              <div className="relative w-20 h-20">
                  <div className="absolute inset-0 border-4 border-violet-500/10 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-transparent border-t-violet-500 rounded-full animate-spin"></div>
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-violet-500 animate-pulse" />
              </div>
              <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Aggregating Academic Data...</p>
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-10"
          >
              {/* Core Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                  {[
                    { label: 'Total Enrollment', value: analyticsData?.total_students || 0, icon: Users, color: 'blue', sub: 'Active Profiles' },
                    { label: 'Avg Attendance', value: `${analyticsData?.average_attendance_percentage || 0}%`, icon: UserCheck, color: 'emerald', sub: 'Class Presence' },
                    { label: 'Academic Score', value: `${progressData.length > 0 ? (progressData.reduce((s, x) => s + (x.avg_quiz_score || 0), 0) / progressData.length).toFixed(1) : 0}%`, icon: Target, color: 'violet', sub: 'Performance Avg' },
                    { label: 'Risk Intensity', value: analyticsData?.at_risk_count || 0, icon: AlertTriangle, color: 'rose', sub: 'Critical Flags' }
                  ].map((stat, i) => (
                    <motion.div 
                      key={i}
                      variants={itemVariants}
                      whileHover={{ y: -5 }}
                      className="bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8 group relative overflow-hidden shadow-sm hover:shadow-xl transition-all"
                    >
                        <div className={`absolute -right-8 -top-8 w-32 h-32 bg-${stat.color}-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                        <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                          <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
                        </div>
                        <p className={`text-4xl font-black mb-1 ${stat.color === 'rose' && stat.value > 0 ? 'text-rose-500' : 'text-gray-900 dark:text-white'}`}>{stat.value}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                        <div className="mt-4 pt-4 border-t border-gray-50 dark:border-white/5">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">{stat.sub}</span>
                        </div>
                    </motion.div>
                  ))}
              </div>

              {/* View Controller */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                  <div className="flex p-2 bg-gray-100 dark:bg-white/[0.03] rounded-[2rem] w-fit border border-gray-200 dark:border-white/5 overflow-x-auto hidden-scrollbar backdrop-blur-sm">
                      {[
                          { id: 'overview', label: 'Overview', icon: LayoutGrid },
                          { id: 'performance', label: 'Progress Radar', icon: TrendingUp },
                          { id: 'risk', label: 'Risk Detection', icon: ShieldAlert },
                          { id: 'quizzes', label: 'Assessments', icon: Award }
                      ].map(view => (
                          <button
                              key={view.id}
                              onClick={() => setActiveView(view.id)}
                              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                                  activeView === view.id 
                                  ? 'bg-white dark:bg-white shadow-xl text-gray-900' 
                                  : 'text-gray-500 dark:text-gray-400 hover:text-violet-500'
                              }`}
                          >
                              <view.icon className={`w-4 h-4 ${activeView === view.id ? 'text-violet-600' : ''}`} />
                              {view.label}
                          </button>
                      ))}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="relative group w-full sm:w-80">
                          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                          <input
                              type="text"
                              placeholder="Synchronize specific record..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-[1.5rem] py-4 pl-14 pr-6 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-4 focus:ring-violet-500/5 transition-all font-semibold"
                          />
                      </div>
                  </div>
              </div>

              {/* Main Visualization Area */}
              <motion.div 
                layout
                className="bg-white dark:bg-[#0c0c0e]/40 backdrop-blur-sm border border-gray-200 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-2xl"
              >
                <AnimatePresence mode="wait">
                  {activeView === 'overview' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-10 lg:p-16"
                      >
                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-20">
                              <div className="space-y-12">
                                  <div className="flex items-center gap-5">
                                      <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                                          <TrendingUp className="w-7 h-7 text-violet-600 dark:text-violet-400" />
                                      </div>
                                      <div>
                                          <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Academic Momentum</h3>
                                          <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] mt-1.5 text-violet-500">Live Health Index</p>
                                      </div>
                                  </div>
                                  
                                  <div className="space-y-8">
                                      <div className="p-8 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[2.5rem] space-y-5">
                                          <div className="flex items-center justify-between">
                                              <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Attendance Stability</span>
                                              <span className="text-lg font-black text-emerald-500">{analyticsData?.average_attendance_percentage || 0}%</span>
                                          </div>
                                          {getProgressBar(analyticsData?.average_attendance_percentage || 0)}
                                          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold italic leading-relaxed opacity-70">
                                            Class presence is {analyticsData?.average_attendance_percentage > 70 ? 'exceeding baseline expectations' : 'within average parameters'}.
                                          </p>
                                      </div>
                                      <div className="p-8 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[2.5rem] space-y-5">
                                          <div className="flex items-center justify-between">
                                              <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Quiz Completion Flow</span>
                                              <span className="text-lg font-black text-violet-500">Healthy</span>
                                          </div>
                                          {getProgressBar(82, 100, 'bg-violet-500')}
                                          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold italic leading-relaxed opacity-70">
                                            Automated assessment velocity indicates strong student engagement levels.
                                          </p>
                                      </div>
                                  </div>
                              </div>

                              <div className="space-y-12">
                                  <div className="flex items-center gap-5">
                                      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                                          <Zap className="w-7 h-7 text-amber-500" />
                                      </div>
                                      <div>
                                          <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Smart Insights</h3>
                                          <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] mt-1.5 text-amber-500">Neural Pattern Detection</p>
                                      </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                      {[
                                        { label: 'High Achievers', value: progressData.filter(s => s.avg_quiz_score >= 85).length, icon: Award, color: 'emerald' },
                                        { label: 'Active Sessions', value: analyticsData?.total_sessions || 0, icon: Clock, color: 'violet' },
                                        { label: 'Progress Profiles', value: progressData.length, icon: Activity, color: 'blue' },
                                        { label: 'Quiz Sync Rate', value: '74%', icon: Sparkles, color: 'amber' }
                                      ].map((item, i) => (
                                        <div key={i} className="p-8 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[2.5rem] flex flex-col gap-4 group hover:border-violet-500/20 transition-all">
                                            <item.icon className={`w-7 h-7 text-${item.color}-500 transition-transform group-hover:scale-110`} />
                                            <div>
                                              <p className="text-3xl font-black text-gray-900 dark:text-white leading-none mb-1">{item.value}</p>
                                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                                            </div>
                                        </div>
                                      ))}
                                  </div>
                              </div>
                          </div>
                      </motion.div>
                  )}

                  {activeView === 'performance' && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-8 lg:p-12 overflow-x-auto custom-scrollbar"
                      >
                          <table className="w-full text-left border-separate border-spacing-y-4">
                              <thead>
                                  <tr className="text-gray-400">
                                      <th className="px-8 pb-4 text-[9px] font-black uppercase tracking-[0.2em]">Student Identity</th>
                                      <th className="px-8 pb-4 text-[9px] font-black uppercase tracking-[0.2em] text-center">Quiz Engagement</th>
                                      <th className="px-8 pb-4 text-[9px] font-black uppercase tracking-[0.2em] text-center">Academic Avg</th>
                                      <th className="px-8 pb-4 text-[9px] font-black uppercase tracking-[0.2em] text-center">Task Flow</th>
                                      <th className="px-8 pb-4 text-[9px] font-black uppercase tracking-[0.2em] text-center">Score Card</th>
                                      <th className="px-8 pb-4 text-[9px] font-black uppercase tracking-[0.2em] text-right">Trend</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  {filteredProgress.map(student => (
                                      <tr key={student.student_id} className="group transition-all">
                                          <td className="bg-gray-50/50 dark:bg-white/[0.02] px-8 py-6 rounded-l-[2.5rem] border-y border-l border-gray-100 dark:border-white/5 group-hover:bg-violet-500/[0.03] transition-all">
                                              <div className="flex items-center gap-5">
                                                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-violet-500/10 dark:bg-violet-500/10 flex items-center justify-center font-black text-violet-600 dark:text-violet-400 text-sm border border-violet-500/10">
                                                      {student.avatar_url ? (
                                                          <img src={student.avatar_url} alt={student.student_name} className="w-full h-full object-cover" />
                                                      ) : (
                                                          student.student_name.charAt(0)
                                                      )}
                                                  </div>
                                                  <div>
                                                      <p className="text-gray-900 dark:text-white font-black text-sm leading-none mb-2 truncate max-w-[150px]">{student.student_name}</p>
                                                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {student.student_id}</p>
                                                  </div>
                                              </div>
                                          </td>
                                          <td className="bg-gray-50/50 dark:bg-white/[0.02] px-8 py-6 border-y border-gray-100 dark:border-white/5 group-hover:bg-violet-500/[0.03] text-center">
                                              <div className="flex flex-col items-center gap-2.5 min-w-[120px]">
                                                  <span className="text-[10px] font-black text-gray-700 dark:text-white/80 uppercase tracking-widest">{student.quizzes_completed} / {student.quizzes_total}</span>
                                                  {getProgressBar(student.quizzes_completed, student.quizzes_total, 'bg-violet-500')}
                                              </div>
                                          </td>
                                          <td className="bg-gray-50/50 dark:bg-white/[0.02] px-8 py-6 border-y border-gray-100 dark:border-white/5 group-hover:bg-violet-500/[0.03] text-center">
                                              <div className="flex flex-col items-center gap-2.5 min-w-[120px]">
                                                  <span className={`text-base font-black ${getScoreColor(student.avg_quiz_score)}`}>
                                                      {student.avg_quiz_score !== null ? `${student.avg_quiz_score}%` : '—'}
                                                  </span>
                                                  {getProgressBar(student.avg_quiz_score || 0)}
                                              </div>
                                          </td>
                                          <td className="bg-gray-50/50 dark:bg-white/[0.02] px-8 py-6 border-y border-gray-100 dark:border-white/5 group-hover:bg-violet-500/[0.03] text-center">
                                              <div className="flex flex-col items-center gap-2.5 min-w-[120px]">
                                                  <span className="text-[10px] font-black text-gray-700 dark:text-white/80 uppercase tracking-widest">{student.tasks_completed} / {student.tasks_total}</span>
                                                  {getProgressBar(student.tasks_completed, student.tasks_total, 'bg-blue-500')}
                                              </div>
                                          </td>
                                          <td className="bg-gray-50/50 dark:bg-white/[0.02] px-8 py-6 border-y border-gray-100 dark:border-white/5 group-hover:bg-violet-500/[0.03] text-center">
                                              <div className="inline-flex flex-col items-center justify-center min-w-[5rem] py-2.5 px-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 shadow-sm">
                                                  <span className="text-base font-black text-gray-900 dark:text-white leading-none">{student.grade_total}/40</span>
                                                  <span className="text-[8px] font-black uppercase mt-1.5 text-gray-400">Total</span>
                                              </div>
                                          </td>
                                          <td className="bg-gray-50/50 dark:bg-white/[0.02] px-8 py-6 rounded-r-[2.5rem] border-y border-r border-gray-100 dark:border-white/5 group-hover:bg-violet-500/[0.03] text-right">
                                              <div className="flex justify-end">
                                                  <motion.div whileHover={{ scale: 1.1 }} className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10">
                                                      <TrendingUp className="w-5 h-5" />
                                                  </motion.div>
                                              </div>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </motion.div>
                  )}

                  {activeView === 'risk' && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-8 lg:p-12 overflow-x-auto"
                      >
                          <div className="mb-10 p-8 bg-rose-500/5 border border-rose-500/20 rounded-[2.5rem] flex items-start gap-5 backdrop-blur-sm">
                              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/10">
                                <ShieldAlert className="w-6 h-6 text-rose-500" />
                              </div>
                              <div>
                                  <h4 className="text-sm font-black text-rose-600 dark:text-rose-500 uppercase tracking-[0.2em] mb-2">Automated Risk Detection Radar</h4>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold leading-relaxed max-w-3xl">
                                    Students are flagged when performance drops below the 40th percentile or attendance stability fails to reach 50%. Neural patterns suggest immediate intervention for these profiles.
                                  </p>
                              </div>
                          </div>

                          {filteredAtRisk.length === 0 ? (
                              <div className="text-center py-32">
                                  <div className="w-24 h-24 bg-emerald-500/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
                                      <CheckCircle2 className="w-12 h-12 text-emerald-500/20" />
                                  </div>
                                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Zero Risk Intensity</h3>
                                  <p className="text-gray-400 font-semibold">Class academic integrity is currently optimal across all monitored parameters.</p>
                              </div>
                          ) : (
                              <table className="w-full text-left border-separate border-spacing-y-4">
                                  <thead>
                                      <tr className="text-gray-400">
                                          <th className="px-8 pb-4 text-[9px] font-black uppercase tracking-[0.2em]">Flagged Profile</th>
                                          <th className="px-8 pb-4 text-[9px] font-black uppercase tracking-[0.2em] text-center">Critical Indicators</th>
                                          <th className="px-8 pb-4 text-[9px] font-black uppercase tracking-[0.2em]">Sync Reason</th>
                                          <th className="px-8 pb-4 text-[9px] font-black uppercase tracking-[0.2em] text-right">Action Protocol</th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      {filteredAtRisk.map(student => (
                                          <tr key={student.student_id} className="group transition-all">
                                              <td className="bg-rose-500/[0.02] dark:bg-rose-500/[0.02] px-8 py-6 rounded-l-[2.5rem] border-y border-l border-rose-500/10 group-hover:bg-rose-500/[0.05] transition-all">
                                                  <div className="flex items-center gap-5">
                                                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-rose-500/10 flex items-center justify-center font-black text-rose-500 text-sm border border-rose-500/10">
                                                          {student.avatar_url ? (
                                                              <img src={student.avatar_url} alt={student.student_name} className="w-full h-full object-cover" />
                                                          ) : (
                                                              student.student_name.charAt(0)
                                                          )}
                                                      </div>
                                                      <div>
                                                          <p className="text-gray-900 dark:text-white font-black text-sm leading-none mb-2">{student.student_name}</p>
                                                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {student.student_id}</p>
                                                      </div>
                                                  </div>
                                              </td>
                                              <td className="bg-rose-500/[0.02] dark:bg-rose-500/[0.02] px-8 py-6 border-y border-rose-500/10 group-hover:bg-rose-500/[0.05] text-center">
                                                  <div className="flex items-center justify-center gap-10">
                                                      <div className="text-center">
                                                          <p className={`text-base font-black ${student.attendance_percentage < 50 ? 'text-rose-500' : 'text-amber-500'}`}>
                                                              {student.attendance_percentage !== null ? `${student.attendance_percentage}%` : '—'}
                                                          </p>
                                                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Presence</p>
                                                      </div>
                                                      <div className="text-center">
                                                          <p className={`text-base font-black ${student.avg_score < 50 ? 'text-rose-500' : 'text-amber-500'}`}>
                                                              {student.avg_score !== null ? `${student.avg_score}%` : '—'}
                                                          </p>
                                                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Score Avg</p>
                                                      </div>
                                                  </div>
                                              </td>
                                              <td className="bg-rose-500/[0.02] dark:bg-rose-500/[0.02] px-8 py-6 border-y border-rose-500/10 group-hover:bg-rose-500/[0.05]">
                                                  <span className="text-[10px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-500 px-5 py-2 rounded-full border border-rose-500/10 inline-flex items-center gap-2 uppercase tracking-widest">
                                                      <TrendingDown className="w-3 h-3" />
                                                      {student.risk_reason}
                                                  </span>
                                              </td>
                                              <td className="bg-rose-500/[0.02] dark:bg-rose-500/[0.02] px-8 py-6 rounded-r-[2.5rem] border-y border-r border-rose-500/10 group-hover:bg-rose-500/[0.05] text-right">
                                                  <motion.button 
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="bg-gray-900 dark:bg-white text-white dark:text-black font-black px-8 py-4 rounded-2xl text-[9px] uppercase tracking-widest shadow-xl transition-all"
                                                  >
                                                      Initiate Sync
                                                  </motion.button>
                                              </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          )}
                      </motion.div>
                  )}

                  {activeView === 'quizzes' && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-10 lg:p-16 space-y-16"
                      >
                          {/* Distribution Header */}
                          {quizData?.distribution && quizData.distribution.length > 0 && (
                              <div className="space-y-10">
                                  <div className="flex items-center gap-5">
                                      <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                                          <PieChart className="w-7 h-7 text-violet-600 dark:text-violet-400" />
                                      </div>
                                      <div>
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Grade Density Profile</h3>
                                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] mt-1.5 text-violet-500">Class Distribution Matrix</p>
                                      </div>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                                      {['0-20', '20-40', '40-60', '60-80', '80-100'].map(range => {
                                          const item = quizData.distribution.find(d => d.range === range);
                                          const count = item ? parseInt(item.count) : 0;
                                          const totalAttempts = quizData.distribution.reduce((sum, d) => sum + parseInt(d.count), 0);
                                          const pct = totalAttempts > 0 ? (count / totalAttempts) * 100 : 0;
                                          const colors = distColors[range];

                                          return (
                                              <div key={range} className="p-8 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[2.5rem] space-y-5 group hover:border-violet-500/20 transition-all">
                                                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${colors.text}`}>{range}%</p>
                                                  <p className="text-4xl font-black text-gray-900 dark:text-white">{count}</p>
                                                  {getProgressBar(count, totalAttempts, colors.bg)}
                                                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{pct.toFixed(0)}% Intensity</p>
                                              </div>
                                          );
                                      })}
                                  </div>
                              </div>
                          )}

                          {/* Detailed Assessments Table */}
                          <div className="space-y-10 pt-16 border-t border-gray-100 dark:border-white/5">
                              <div className="flex items-center gap-5">
                                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                                      <List className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                                  </div>
                                  <div>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Assessment Intelligence</h3>
                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] mt-1.5 text-emerald-500">Granular Evaluation Metrics</p>
                                  </div>
                              </div>
                              
                              <div className="grid grid-cols-1 gap-6">
                                  {quizData?.quizzes?.map(q => {
                                      const passRate = q.completed_attempts > 0
                                      ? Math.round((q.passed_count / q.completed_attempts) * 100)
                                      : 0;

                                      return (
                                          <div key={q.id} className="bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8 hover:bg-violet-500/[0.02] transition-all group">
                                              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
                                                  <div className="flex-1 space-y-3">
                                                      <div className="flex items-center gap-4">
                                                          <h4 className="text-xl font-black text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{q.title}</h4>
                                                          <span className={`text-[8px] font-black uppercase px-3 py-1.5 rounded-lg border ${q.is_published ? 'bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/10' : 'bg-gray-100 text-gray-400 border-gray-200 dark:bg-white/5 dark:border-white/10'}`}>
                                                              {q.is_published ? 'Live' : 'Draft'}
                                                          </span>
                                                      </div>
                                                      <div className="flex items-center gap-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                          <span className="flex items-center gap-2 bg-white dark:bg-black/20 px-3 py-1 rounded-lg border border-gray-100 dark:border-white/5"><Clock className="w-3.5 h-3.5 text-violet-500" /> {q.time_limit_minutes} Min</span>
                                                          <span className="flex items-center gap-2 bg-white dark:bg-black/20 px-3 py-1 rounded-lg border border-gray-100 dark:border-white/5"><Target className="w-3.5 h-3.5 text-emerald-500" /> Passing {q.passing_score}%</span>
                                                      </div>
                                                  </div>

                                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-12 shrink-0">
                                                      <div className="text-center">
                                                          <p className="text-2xl font-black text-gray-900 dark:text-white">{q.completed_attempts || 0}</p>
                                                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Attempts</p>
                                                      </div>
                                                      <div className="text-center">
                                                          <p className={`text-2xl font-black ${getScoreColor(q.avg_score)}`}>{q.avg_score !== null ? `${q.avg_score}%` : '—'}</p>
                                                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Avg Sync</p>
                                                      </div>
                                                      <div className="text-center">
                                                          <p className="text-2xl font-black text-blue-500">{q.max_score !== null ? `${Math.round(q.max_score)}%` : '—'}</p>
                                                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Top Radar</p>
                                                      </div>
                                                      <div className="text-center">
                                                          <p className={`text-2xl font-black ${passRate >= 70 ? 'text-emerald-500' : 'text-amber-500'}`}>{passRate}%</p>
                                                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Pass Integrity</p>
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>
                                      );
                                  })}
                              </div>
                          </div>
                      </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.1);
          border-radius: 10px;
        }
        .hidden-scrollbar::-webkit-scrollbar { display: none; }
        .hidden-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </motion.div>
  );
};

export default DoctorAnalytics;
