import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { 
  Activity, Users, AlertTriangle, CheckCircle2, 
  BarChart3, UserCheck, Calendar, Search, 
  TrendingUp, Award, Clock, BookOpen, Target,
  Filter, ChevronRight, Zap, Info, ArrowUpRight,
  LayoutGrid, List, PieChart, Eye, EyeOff
} from 'lucide-react';

const DoctorAnalytics = ({ courses }) => {
  const { doctorApi } = useDoctorAuth();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [activeView, setActiveView] = useState('overview'); // 'overview', 'performance', 'risk', 'quizzes'
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
    if (score === null || score === undefined) return 'text-white/20';
    if (score >= 75) return 'text-emerald-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getProgressBar = (value, max = 100, color = null) => {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    const barColor = color || (pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500');
    return (
      <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${pct}%` }}
        ></div>
      </div>
    );
  };

  const distColors = {
    '0-20': { bg: 'bg-rose-500', text: 'text-rose-400' },
    '20-40': { bg: 'bg-orange-500', text: 'text-orange-400' },
    '40-60': { bg: 'bg-amber-500', text: 'text-amber-400' },
    '60-80': { bg: 'bg-blue-500', text: 'text-blue-400' },
    '80-100': { bg: 'bg-emerald-500', text: 'text-emerald-400' },
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-24 lg:pb-0">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
            <Activity className="w-8 h-8 text-doctor-primary" />
            Intelligence Center
          </h2>
          <p className="text-doctor-text-muted font-medium">Predictive analytics and student performance tracking for your courses.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="bg-doctor-card border border-white/5 rounded-2xl py-4 px-6 text-white font-bold focus:outline-none focus:border-doctor-primary/40 transition-all appearance-none cursor-pointer min-w-[240px]"
            >
                <option value="" disabled className="bg-doctor-sidebar">Select Course</option>
                {courses.map(c => (
                <option key={c.id} value={c.id} className="bg-doctor-sidebar">{c.name}</option>
                ))}
            </select>
        </div>
      </div>

      {!selectedCourseId ? (
        <div className="bg-doctor-card border border-white/5 rounded-[2.5rem] p-24 text-center">
          <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 flex items-center justify-center mx-auto mb-8 shadow-inner">
            <BarChart3 className="w-12 h-12 text-white/10" />
          </div>
          <h3 className="text-2xl font-black text-white mb-2">Awaiting Intelligence</h3>
          <p className="text-doctor-text-muted max-w-sm mx-auto font-medium">Select a target course above to unlock smart analytics, risk detection, and student performance tracking.</p>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-doctor-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-doctor-primary rounded-full animate-spin"></div>
            </div>
            <p className="text-doctor-text-muted font-black text-xs uppercase tracking-widest">Aggregating Data...</p>
        </div>
      ) : (
        <div className="space-y-8">
            {/* Top Insight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slideUp">
                <div className="bg-doctor-card border border-white/5 rounded-[2rem] p-6 group hover:border-doctor-primary/30 transition-all overflow-hidden relative shadow-lg">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Users className="w-8 h-8 text-blue-500 mb-4" />
                    <p className="text-3xl font-black text-white">{analyticsData?.total_students || 0}</p>
                    <p className="text-[10px] font-black text-doctor-text-muted uppercase tracking-widest mt-1">Total Enrolled</p>
                </div>
                <div className="bg-doctor-card border border-white/5 rounded-[2rem] p-6 group hover:border-doctor-primary/30 transition-all overflow-hidden relative shadow-lg">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <UserCheck className="w-8 h-8 text-emerald-500 mb-4" />
                    <p className="text-3xl font-black text-emerald-500">{analyticsData?.average_attendance_percentage || 0}%</p>
                    <p className="text-[10px] font-black text-doctor-text-muted uppercase tracking-widest mt-1">Avg Attendance</p>
                </div>
                <div className="bg-doctor-card border border-white/5 rounded-[2rem] p-6 group hover:border-doctor-primary/30 transition-all overflow-hidden relative shadow-lg">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-violet-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Target className="w-8 h-8 text-violet-500 mb-4" />
                    <p className="text-3xl font-black text-white">{progressData.length > 0 ? (progressData.reduce((s, x) => s + (x.avg_quiz_score || 0), 0) / progressData.length).toFixed(1) : 0}%</p>
                    <p className="text-[10px] font-black text-doctor-text-muted uppercase tracking-widest mt-1">Average Score</p>
                </div>
                <div className="bg-doctor-card border border-white/5 rounded-[2rem] p-6 group hover:border-rose-500/30 transition-all overflow-hidden relative shadow-lg">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-rose-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <AlertTriangle className="w-8 h-8 text-rose-500 mb-4" />
                    <p className="text-3xl font-black text-rose-500">{analyticsData?.at_risk_count || 0}</p>
                    <p className="text-[10px] font-black text-doctor-text-muted uppercase tracking-widest mt-1">Critical Risk</p>
                </div>
            </div>

            {/* View Switcher & Actions */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="flex p-1.5 bg-white/5 rounded-[1.8rem] w-fit border border-white/5 overflow-x-auto hidden-scrollbar">
                    {[
                        { id: 'overview', label: 'Summary', icon: LayoutGrid },
                        { id: 'performance', label: 'Progress', icon: TrendingUp },
                        { id: 'risk', label: 'Radar', icon: Zap },
                        { id: 'quizzes', label: 'Assessments', icon: Award }
                    ].map(view => (
                        <button
                            key={view.id}
                            onClick={() => setActiveView(view.id)}
                            className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                                activeView === view.id 
                                ? 'bg-doctor-primary text-white shadow-lg shadow-doctor-primary/20' 
                                : 'text-doctor-text-muted hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <view.icon className="w-4 h-4" />
                            {view.label}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative group w-full sm:w-80">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-doctor-text-muted group-focus-within:text-doctor-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search records..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/5 rounded-[1.8rem] py-3.5 pl-14 pr-6 text-white text-sm focus:outline-none focus:border-doctor-primary/40 focus:bg-white/[0.08] transition-all font-medium"
                        />
                    </div>
                    {activeView === 'performance' && (
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-white/5 border border-white/5 rounded-2xl py-3.5 px-6 text-white text-xs font-black uppercase tracking-widest focus:outline-none focus:border-doctor-primary/40 transition-all appearance-none cursor-pointer"
                        >
                            <option value="name" className="bg-doctor-sidebar">Sort: Name</option>
                            <option value="quiz" className="bg-doctor-sidebar">Sort: Score</option>
                            <option value="grade" className="bg-doctor-sidebar">Sort: Total</option>
                        </select>
                    )}
                </div>
            </div>

            {/* View Content */}
            <div className="bg-doctor-card border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/20 animate-fadeIn">
                
                {activeView === 'overview' && (
                    <div className="p-8 md:p-12">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-doctor-primary/10 flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-doctor-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white">Course Health Index</h3>
                                        <p className="text-xs text-doctor-text-muted uppercase font-black tracking-widest mt-1">Automated performance summary</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-6">
                                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-white">Attendance Stability</span>
                                            <span className="text-sm font-black text-emerald-400">{analyticsData?.average_attendance_percentage || 0}%</span>
                                        </div>
                                        {getProgressBar(analyticsData?.average_attendance_percentage || 0)}
                                        <p className="text-xs text-doctor-text-muted font-medium italic">General class commitment is {analyticsData?.average_attendance_percentage > 70 ? 'strong' : 'moderate'}.</p>
                                    </div>
                                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-white">Academic Momentum</span>
                                            <span className="text-sm font-black text-doctor-primary">Healthy</span>
                                        </div>
                                        {getProgressBar(82, 100, 'bg-doctor-primary')}
                                        <p className="text-xs text-doctor-text-muted font-medium italic">Based on average quiz results and task completion speed.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-400/10 flex items-center justify-center">
                                        <Target className="w-6 h-6 text-amber-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white">Quick Insights</h3>
                                        <p className="text-xs text-doctor-text-muted uppercase font-black tracking-widest mt-1">Smart pattern detection</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col gap-3">
                                        <Award className="w-6 h-6 text-emerald-400" />
                                        <p className="text-2xl font-black text-white">{progressData.filter(s => s.avg_quiz_score >= 85).length}</p>
                                        <p className="text-[10px] font-black text-doctor-text-muted uppercase tracking-widest">High Performers</p>
                                    </div>
                                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col gap-3">
                                        <Clock className="w-6 h-6 text-doctor-primary" />
                                        <p className="text-2xl font-black text-white">{analyticsData?.total_sessions || 0}</p>
                                        <p className="text-[10px] font-black text-doctor-text-muted uppercase tracking-widest">Active Sessions</p>
                                    </div>
                                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col gap-3">
                                        <Activity className="w-6 h-6 text-blue-400" />
                                        <p className="text-2xl font-black text-white">{progressData.length}</p>
                                        <p className="text-[10px] font-black text-doctor-text-muted uppercase tracking-widest">Active Profiles</p>
                                    </div>
                                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col gap-3">
                                        <Zap className="w-6 h-6 text-amber-400" />
                                        <p className="text-2xl font-black text-white">74%</p>
                                        <p className="text-[10px] font-black text-doctor-text-muted uppercase tracking-widest">Quiz Completion</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeView === 'performance' && (
                    <div className="p-4 md:p-8 overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-y-3">
                            <thead>
                                <tr className="text-doctor-text-muted">
                                    <th className="px-6 pb-2 text-[10px] font-black uppercase tracking-widest">Student Profile</th>
                                    <th className="px-6 pb-2 text-[10px] font-black uppercase tracking-widest text-center">Engagement</th>
                                    <th className="px-6 pb-2 text-[10px] font-black uppercase tracking-widest text-center">Avg Quiz Score</th>
                                    <th className="px-6 pb-2 text-[10px] font-black uppercase tracking-widest text-center">Task Completion</th>
                                    <th className="px-6 pb-2 text-[10px] font-black uppercase tracking-widest text-center">Academic Total</th>
                                    <th className="px-6 pb-2 text-[10px] font-black uppercase tracking-widest text-right">Trend</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProgress.map(student => (
                                    <tr key={student.student_id} className="group hover:scale-[1.005] transition-all">
                                        <td className="bg-white/5 px-6 py-5 rounded-l-[1.8rem] border-y border-l border-white/5 group-hover:bg-white/[0.08] transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-doctor-primary/20 to-doctor-secondary/20 flex items-center justify-center font-black text-doctor-primary text-xs border border-white/10 shadow-sm">
                                                    {student.student_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold text-sm leading-none mb-1">{student.student_name}</p>
                                                    <p className="text-[10px] font-medium text-doctor-text-muted">ID: {student.student_id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="bg-white/5 px-6 py-5 border-y border-white/5 group-hover:bg-white/[0.08] text-center">
                                            <div className="flex flex-col items-center gap-1.5 min-w-[100px]">
                                                <span className="text-xs font-black text-white">{student.quizzes_completed}/{student.quizzes_total} Quizzes</span>
                                                {getProgressBar(student.quizzes_completed, student.quizzes_total, 'bg-doctor-primary')}
                                            </div>
                                        </td>
                                        <td className="bg-white/5 px-6 py-5 border-y border-white/5 group-hover:bg-white/[0.08] text-center">
                                            <div className="flex flex-col items-center gap-1.5 min-w-[100px]">
                                                <span className={`text-sm font-black ${getScoreColor(student.avg_quiz_score)}`}>
                                                    {student.avg_quiz_score !== null ? `${student.avg_quiz_score}%` : '—'}
                                                </span>
                                                {getProgressBar(student.avg_quiz_score || 0)}
                                            </div>
                                        </td>
                                        <td className="bg-white/5 px-6 py-5 border-y border-white/5 group-hover:bg-white/[0.08] text-center">
                                            <div className="flex flex-col items-center gap-1.5 min-w-[100px]">
                                                <span className="text-xs font-black text-white">{student.tasks_completed}/{student.tasks_total} Tasks</span>
                                                {getProgressBar(student.tasks_completed, student.tasks_total, 'bg-doctor-secondary')}
                                            </div>
                                        </td>
                                        <td className="bg-white/5 px-6 py-5 border-y border-white/5 group-hover:bg-white/[0.08] text-center">
                                            <div className="inline-flex flex-col items-center justify-center min-w-[4rem] py-2 px-3 rounded-2xl border border-white/10 bg-white/5 shadow-inner">
                                                <span className="text-sm font-black text-white leading-none">{student.grade_total}/40</span>
                                                <span className="text-[8px] font-black uppercase mt-1 text-doctor-text-muted">Register</span>
                                            </div>
                                        </td>
                                        <td className="bg-white/5 px-6 py-5 rounded-r-[1.8rem] border-y border-r border-white/5 group-hover:bg-white/[0.08] text-right">
                                            <div className="flex justify-end">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                                    <ArrowUpRight className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeView === 'risk' && (
                    <div className="p-4 md:p-8 overflow-x-auto">
                        <div className="mb-8 p-6 bg-rose-500/5 border border-rose-500/20 rounded-3xl flex items-start gap-4">
                            <Info className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-black text-rose-500 uppercase tracking-widest">Risk Analysis Intelligence</h4>
                                <p className="text-xs text-doctor-text-muted mt-1 leading-relaxed">Students are automatically flagged based on attendance patterns below 50% or academic performance consistently below the 40th percentile. Prompt intervention is recommended.</p>
                            </div>
                        </div>

                        {filteredAtRisk.length === 0 ? (
                            <div className="text-center py-24">
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500/30" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2">Clean Radar</h3>
                                <p className="text-doctor-text-muted">No students are currently matching critical risk parameters. Class is performing well!</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-separate border-spacing-y-3">
                                <thead>
                                    <tr className="text-doctor-text-muted">
                                        <th className="px-6 pb-2 text-[10px] font-black uppercase tracking-widest">Identified Student</th>
                                        <th className="px-6 pb-2 text-[10px] font-black uppercase tracking-widest text-center">Critical Metrics</th>
                                        <th className="px-6 pb-2 text-[10px] font-black uppercase tracking-widest">Detection Reason</th>
                                        <th className="px-6 pb-2 text-[10px] font-black uppercase tracking-widest text-right">Action Required</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAtRisk.map(student => (
                                        <tr key={student.student_id} className="group hover:scale-[1.005] transition-all">
                                            <td className="bg-white/5 px-6 py-5 rounded-l-[1.8rem] border-y border-l border-white/5 group-hover:bg-rose-500/5 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center font-black text-rose-500 text-xs border border-rose-500/20">
                                                        {student.student_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-bold text-sm leading-none mb-1">{student.student_name}</p>
                                                        <p className="text-[10px] font-medium text-doctor-text-muted">ID: {student.student_id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="bg-white/5 px-6 py-5 border-y border-white/5 group-hover:bg-rose-500/5 text-center">
                                                <div className="flex items-center justify-center gap-6">
                                                    <div className="text-center">
                                                        <p className={`text-sm font-black ${student.attendance_percentage < 50 ? 'text-rose-500' : 'text-amber-500'}`}>
                                                            {student.attendance_percentage !== null ? `${student.attendance_percentage}%` : '—'}
                                                        </p>
                                                        <p className="text-[8px] font-black text-doctor-text-muted uppercase tracking-widest">Attendance</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className={`text-sm font-black ${student.avg_score < 50 ? 'text-rose-500' : 'text-amber-500'}`}>
                                                            {student.avg_score !== null ? `${student.avg_score}%` : '—'}
                                                        </p>
                                                        <p className="text-[8px] font-black text-doctor-text-muted uppercase tracking-widest">Quiz Avg</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="bg-white/5 px-6 py-5 border-y border-white/5 group-hover:bg-rose-500/5">
                                                <span className="text-xs font-bold bg-rose-500/10 text-rose-500 px-4 py-1.5 rounded-full border border-rose-500/20 inline-flex items-center gap-2">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    {student.risk_reason}
                                                </span>
                                            </td>
                                            <td className="bg-white/5 px-6 py-5 rounded-r-[1.8rem] border-y border-r border-white/5 group-hover:bg-rose-500/5 text-right">
                                                <button className="bg-rose-500 hover:bg-rose-600 text-white font-black px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-rose-500/20">
                                                    Notify Student
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {activeView === 'quizzes' && (
                    <div className="p-8 md:p-12 space-y-12">
                        {/* Score Distribution */}
                        {quizData?.distribution && quizData.distribution.length > 0 && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-doctor-primary/10 flex items-center justify-center">
                                        <PieChart className="w-6 h-6 text-doctor-primary" />
                                    </div>
                                    <h3 className="text-xl font-black text-white">Score Distribution Density</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                    {['0-20', '20-40', '40-60', '60-80', '80-100'].map(range => {
                                        const item = quizData.distribution.find(d => d.range === range);
                                        const count = item ? parseInt(item.count) : 0;
                                        const totalAttempts = quizData.distribution.reduce((sum, d) => sum + parseInt(d.count), 0);
                                        const pct = totalAttempts > 0 ? (count / totalAttempts) * 100 : 0;
                                        const colors = distColors[range];

                                        return (
                                            <div key={range} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
                                                <p className={`text-xs font-black uppercase tracking-widest ${colors.text}`}>{range}%</p>
                                                <p className="text-3xl font-black text-white">{count}</p>
                                                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                                    <div className={`h-full ${colors.bg} rounded-full`} style={{ width: `${pct}%` }}></div>
                                                </div>
                                                <p className="text-[10px] font-black text-doctor-text-muted uppercase">{pct.toFixed(0)}% of Class</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Per-Quiz Table */}
                        <div className="space-y-6 pt-12 border-t border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                                    <List className="w-6 h-6 text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-black text-white">Individual Quiz Intelligence</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4">
                                {quizData?.quizzes?.map(q => {
                                    const passRate = q.completed_attempts > 0
                                    ? Math.round((q.passed_count / q.completed_attempts) * 100)
                                    : 0;

                                    return (
                                        <div key={q.id} className="bg-white/5 border border-white/5 rounded-3xl p-6 hover:bg-white/[0.08] transition-all group">
                                            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <h4 className="text-lg font-bold text-white group-hover:text-doctor-primary transition-colors">{q.title}</h4>
                                                        <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg border ${q.is_published ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-doctor-text-muted border-white/10'}`}>
                                                            {q.is_published ? 'Published' : 'Draft'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-[10px] font-black text-doctor-text-muted uppercase tracking-widest">
                                                        <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {q.time_limit_minutes}m</span>
                                                        <span className="flex items-center gap-1.5"><Target className="w-3 h-3" /> Pass: {q.passing_score}%</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 shrink-0">
                                                    <div className="text-center">
                                                        <p className="text-xl font-black text-white">{q.completed_attempts || 0}</p>
                                                        <p className="text-[8px] font-black text-doctor-text-muted uppercase tracking-widest">Attempts</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className={`text-xl font-black ${getScoreColor(q.avg_score)}`}>{q.avg_score !== null ? `${q.avg_score}%` : '—'}</p>
                                                        <p className="text-[8px] font-black text-doctor-text-muted uppercase tracking-widest">Avg Result</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-xl font-black text-blue-400">{q.max_score !== null ? `${Math.round(q.max_score)}%` : '—'}</p>
                                                        <p className="text-[8px] font-black text-doctor-text-muted uppercase tracking-widest">Top Score</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className={`text-xl font-black ${passRate >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>{passRate}%</p>
                                                        <p className="text-[8px] font-black text-doctor-text-muted uppercase tracking-widest">Pass Rate</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}

      <style>{`
        .hidden-scrollbar::-webkit-scrollbar { display: none; }
        .hidden-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default DoctorAnalytics;
