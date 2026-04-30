import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDoctorAuth } from '../context/DoctorAuthContext';
import {
  BookOpen, TrendingUp, FileText, CheckSquare, Award, LogOut, GraduationCap,
  Sun, Moon, LayoutDashboard, FolderOpen, ClipboardList, BarChart3, Menu, X, ChevronRight,
  Activity, PieChart, ListChecks, Megaphone, Users
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import DoctorResourceManager from '../components/doctor/DoctorResourceManager';
import DoctorTaskManager from '../components/doctor/DoctorTaskManager';
import DoctorQuizManager from '../components/doctor/DoctorQuizManager';
import DoctorGradesView from '../components/doctor/DoctorGradesView';
import DoctorStudentProgress from '../components/doctor/DoctorStudentProgress';
import DoctorQuizAnalytics from '../components/doctor/DoctorQuizAnalytics';
import DoctorCourseProgress from '../components/doctor/DoctorCourseProgress';
import DoctorAttendance from '../components/doctor/DoctorAttendance';
import DoctorAnnouncements from '../components/doctor/DoctorAnnouncements';

const DoctorDashboard = () => {
  const { doctor, token, logout, loading: authLoading, doctorApi } = useDoctorAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ courses: 0, students: 0, quizzes: 0, resources: 0 });
  const [myCourses, setMyCourses] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setDataLoading(true);
    try {
      const [statsRes, coursesRes] = await Promise.all([
        doctorApi('get', '/doctor/stats'),
        doctorApi('get', '/doctor/courses')
      ]);
      setStats(statsRes.data);
      setMyCourses(coursesRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setDataLoading(false);
    }
  }, [token, doctorApi]);

  useEffect(() => {
    if (!token && !authLoading) {
      navigate('/doctor/login', { replace: true });
      return;
    }
    fetchData();
  }, [token, authLoading, navigate, fetchData]);

  const handleLogout = () => {
    logout();
    navigate('/doctor/login');
  };

  const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, color: 'violet' },
    { id: 'materials', label: 'Materials', icon: FolderOpen, color: 'blue' },
    { id: 'quizzes', label: 'Quizzes', icon: Award, color: 'amber' },
    { id: 'tasks', label: 'Tasks', icon: ClipboardList, color: 'emerald' },
    { id: 'grades', label: 'Grades', icon: BarChart3, color: 'rose' },
    { id: 'syllabus', label: 'Syllabus', icon: ListChecks, color: 'teal' },
    { id: 'announcements', label: 'Announcements', icon: Megaphone, color: 'amber' },
    { id: 'attendance', label: 'Attendance', icon: Users, color: 'sky' },
    { id: 'progress', label: 'Student Progress', icon: Activity, color: 'purple' },
    { id: 'analytics', label: 'Analytics', icon: PieChart, color: 'indigo' },
  ];

  const STAT_CARDS = [
    { label: 'Courses', value: stats.courses, icon: BookOpen, color: 'violet', gradient: 'from-violet-500 to-purple-600' },
    { label: 'Students', value: stats.students, icon: GraduationCap, color: 'blue', gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Quizzes', value: stats.quizzes, icon: Award, color: 'amber', gradient: 'from-amber-500 to-orange-500' },
    { label: 'Materials', value: stats.resources, icon: FileText, color: 'emerald', gradient: 'from-emerald-500 to-teal-500' },
  ];

  // Full-screen loading
  if (authLoading || !doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#050505]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-violet-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500 animate-spin"></div>
          </div>
          <p className="text-sm font-medium text-gray-400 dark:text-slate-500 tracking-widest uppercase">Loading Portal</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-slate-100 transition-colors duration-300">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-30%] right-[-15%] w-[60%] h-[60%] bg-violet-500/[0.03] dark:bg-violet-500/[0.04] blur-[180px] rounded-full"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/[0.02] dark:bg-blue-500/[0.03] blur-[150px] rounded-full"></div>
      </div>

      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-2xl border-b border-gray-200/60 dark:border-white/5">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo & Doctor Info */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-black tracking-tight text-gray-900 dark:text-white">Doctor Portal</h1>
                <p className="text-xs text-gray-500 dark:text-slate-500 font-medium -mt-0.5">Dr. {doctor.name}</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 bg-gray-100/80 dark:bg-white/[0.03] p-1.5 rounded-2xl border border-gray-200/50 dark:border-white/5">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm dark:shadow-none'
                        : 'text-gray-500 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? `text-${tab.color}-500` : ''}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:text-violet-500 transition-all"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 text-gray-600 dark:text-gray-400"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200/50 dark:border-white/5 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-2xl pb-4 px-4">
            <div className="pt-3 space-y-1">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400'
                        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </button>
                );
              })}
              <button
                onClick={handleLogout}
                className="w-full sm:hidden flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-6 md:py-10 relative z-10">
        {/* Stats Cards — Only on Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
            {STAT_CARDS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="group relative bg-white dark:bg-[#111111]/80 backdrop-blur-xl border border-gray-200/60 dark:border-white/5 p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-sm hover:shadow-lg dark:shadow-none transition-all duration-500 overflow-hidden"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {/* Hover gradient accent */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-[0.03] dark:group-hover:opacity-[0.06] transition-opacity duration-500 rounded-2xl md:rounded-3xl`}></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 md:w-12 md:h-12 bg-${stat.color}-500/10 rounded-xl md:rounded-2xl flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 md:w-6 md:h-6 text-${stat.color}-500`} />
                      </div>
                    </div>
                    <p className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-1">
                      {dataLoading ? (
                        <span className="inline-block w-12 h-8 bg-gray-200 dark:bg-white/10 rounded-lg animate-pulse"></span>
                      ) : stat.value}
                    </p>
                    <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[0.15em]">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Content Area */}
        <div className="animate-fadeIn">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-transparent dark:from-violet-500/10 dark:via-purple-500/5 border border-violet-200/40 dark:border-violet-500/10 rounded-2xl md:rounded-3xl p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2">
                  Welcome back, Dr. {doctor.name} 👋
                </h2>
                <p className="text-gray-500 dark:text-slate-400 text-sm md:text-base max-w-2xl">
                  Manage your courses, create quizzes, upload materials, and track student grades — all from one place.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {[
                  { label: 'Upload Material', tab: 'materials', icon: FolderOpen, color: 'blue' },
                  { label: 'Create Quiz', tab: 'quizzes', icon: Award, color: 'amber' },
                  { label: 'Add Task', tab: 'tasks', icon: ClipboardList, color: 'emerald' },
                  { label: 'View Grades', tab: 'grades', icon: BarChart3, color: 'rose' },
                ].map(action => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.tab}
                      onClick={() => setActiveTab(action.tab)}
                      className={`group flex flex-col items-center gap-3 p-5 md:p-6 bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl hover:border-${action.color}-300 dark:hover:border-${action.color}-500/20 hover:shadow-lg transition-all duration-300`}
                    >
                      <div className={`w-12 h-12 bg-${action.color}-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-6 h-6 text-${action.color}-500`} />
                      </div>
                      <span className="text-xs md:text-sm font-bold text-gray-600 dark:text-slate-400 text-center">{action.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* My Courses Grid */}
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-violet-500" /> My Courses
                </h3>
                {dataLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="bg-white dark:bg-white/5 border border-gray-200/60 dark:border-white/5 rounded-2xl p-6 animate-pulse">
                        <div className="h-5 bg-gray-200 dark:bg-white/10 rounded w-3/4 mb-3"></div>
                        <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : myCourses.length === 0 ? (
                  <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl p-12 text-center">
                    <BookOpen className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-slate-500 font-medium">No courses assigned yet.</p>
                    <p className="text-xs text-gray-400 dark:text-slate-600 mt-1">Contact the admin to assign courses to your account.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myCourses.map((c, i) => (
                      <div
                        key={c.id}
                        className="group bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 p-5 md:p-6 rounded-2xl hover:border-violet-300 dark:hover:border-violet-500/20 hover:shadow-md transition-all duration-300"
                        style={{ animationDelay: `${i * 60}ms` }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-violet-500/20 transition-colors">
                            <BookOpen className="w-5 h-5 text-violet-500" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-gray-900 dark:text-white truncate">{c.name}</h4>
                            <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                              {c.semester ? `Semester ${c.semester}` : 'General'}
                              {c.department_name && ` · ${c.department_name}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'materials' && <DoctorResourceManager courses={myCourses} />}
          {activeTab === 'quizzes' && <DoctorQuizManager courses={myCourses} />}
          {activeTab === 'tasks' && <DoctorTaskManager courses={myCourses} />}
          {activeTab === 'grades' && <DoctorGradesView courses={myCourses} />}
          {activeTab === 'syllabus' && <DoctorCourseProgress courses={myCourses} />}
          {activeTab === 'announcements' && <DoctorAnnouncements courses={myCourses} />}
          {activeTab === 'attendance' && <DoctorAttendance courses={myCourses} />}
          {activeTab === 'progress' && <DoctorStudentProgress courses={myCourses} />}
          {activeTab === 'analytics' && <DoctorQuizAnalytics courses={myCourses} />}
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
