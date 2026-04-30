import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDoctorAuth } from '../context/DoctorAuthContext';
import { BookOpen, TrendingUp, FileText, CheckSquare, Award, Settings, LogOut, GraduationCap, ChevronRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import DoctorResourceManager from '../components/doctor/DoctorResourceManager';
import DoctorTaskManager from '../components/doctor/DoctorTaskManager';
import DoctorQuizManager from '../components/doctor/DoctorQuizManager';
import DoctorGradesView from '../components/doctor/DoctorGradesView';

const DoctorDashboard = () => {
  const { doctor, token, logout, doctorApi } = useDoctorAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('courses');
  const [stats, setStats] = useState({ courses: 0, students: 0, quizzes: 0, resources: 0 });
  const [myCourses, setMyCourses] = useState([]);

  useEffect(() => {
    if (!token) {
      navigate('/doctor/login', { replace: true });
      return;
    }
    
    // Fetch stats
    doctorApi('get', '/doctor/stats')
      .then(res => setStats(res.data))
      .catch(console.error);
      
    // Fetch courses
    doctorApi('get', '/doctor/courses')
      .then(res => setMyCourses(res.data))
      .catch(console.error);
  }, [token, navigate, doctorApi]);

  const handleLogout = () => {
    logout();
    navigate('/doctor/login');
  };

  const TABS = [
    { id: 'courses', label: 'My Courses', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'materials', label: 'Materials', icon: <FileText className="w-4 h-4" /> },
    { id: 'quizzes', label: 'Quizzes', icon: <Award className="w-4 h-4" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'grades', label: 'Grades View', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  if (!doctor) return <div className="min-h-screen flex items-center justify-center dark:bg-[#050505]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] p-4 md:p-10 text-gray-900 dark:text-slate-100 relative overflow-hidden transition-colors duration-300">
      {/* Background Decor */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-violet-500/[0.02] dark:bg-violet-500/[0.03] blur-[150px] rounded-full"></div>
      
      <div className="max-w-[1600px] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-8 bg-violet-500 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.5)]"></div>
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Doctor Portal</h1>
            </div>
            <p className="text-gray-500 dark:text-slate-400 font-medium ml-5 text-sm uppercase tracking-[0.3em]">Welcome, Dr. {doctor.name}</p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-violet-500 transition-all shadow-sm">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 hover:bg-red-500/20 px-5 py-3 rounded-2xl text-sm font-black transition-all shadow-sm hover:scale-105 active:scale-95"
            >
              Logout <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid gap-6 mb-12 md:grid-cols-4 animate-fadeIn">
          {/* Stats Cards */}
          <div className="bg-white dark:bg-[#111111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/5 p-6 rounded-[2rem] hover:border-violet-500/30 transition-all duration-500 shadow-sm dark:shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500">My Courses</p>
            </div>
            <p className="text-4xl font-black text-gray-900 dark:text-white">{stats.courses}</p>
          </div>
          
          <div className="bg-white dark:bg-[#111111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/5 p-6 rounded-[2rem] hover:border-blue-500/30 transition-all duration-500 shadow-sm dark:shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500">Students</p>
            </div>
            <p className="text-4xl font-black text-gray-900 dark:text-white">{stats.students}</p>
          </div>

          <div className="bg-white dark:bg-[#111111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/5 p-6 rounded-[2rem] hover:border-amber-500/30 transition-all duration-500 shadow-sm dark:shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500">Quizzes</p>
            </div>
            <p className="text-4xl font-black text-gray-900 dark:text-white">{stats.quizzes}</p>
          </div>

          <div className="bg-white dark:bg-[#111111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/5 p-6 rounded-[2rem] hover:border-emerald-500/30 transition-all duration-500 shadow-sm dark:shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500">Materials</p>
            </div>
            <p className="text-4xl font-black text-gray-900 dark:text-white">{stats.resources}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-10 bg-white/50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-[2.5rem] p-3 backdrop-blur-3xl overflow-x-auto no-scrollbar shadow-sm dark:shadow-inner">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-3.5 font-bold rounded-2xl transition-all text-sm whitespace-nowrap shadow-sm
                ${activeTab === tab.id
                  ? 'text-white dark:text-black bg-violet-500 dark:bg-violet-400 shadow-[0_8px_20px_rgba(139,92,246,0.3)] scale-105'
                  : 'text-gray-500 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 active:scale-95'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-[#111111]/80 backdrop-blur-2xl border border-gray-200 dark:border-white/5 shadow-xl dark:shadow-2xl rounded-[2.5rem] p-6 md:p-10 animate-fadeIn overflow-hidden min-h-[600px] relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 blur-[80px] rounded-full pointer-events-none"></div>
            
            {activeTab === 'courses' && (
              <div>
                <h2 className="text-2xl font-black mb-6">My Assigned Courses</h2>
                {myCourses.length === 0 ? (
                  <p className="text-gray-500">No courses assigned to you yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myCourses.map(c => (
                      <div key={c.id} className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-3xl">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{c.name}</h3>
                        <p className="text-sm text-gray-500">Semester: {c.semester}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'materials' && <DoctorResourceManager courses={myCourses} />}
            {activeTab === 'quizzes' && <DoctorQuizManager courses={myCourses} />}
            {activeTab === 'tasks' && <DoctorTaskManager courses={myCourses} />}
            {activeTab === 'grades' && <DoctorGradesView courses={myCourses} />}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
