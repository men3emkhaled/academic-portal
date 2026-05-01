import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDoctorAuth } from '../context/DoctorAuthContext';
import { useTheme } from '../context/ThemeContext';

// Components
import DoctorSidebar from '../components/doctor/DoctorSidebar';
import DoctorHeader from '../components/doctor/DoctorHeader';
import DoctorOverview from '../components/doctor/DoctorOverview';
import DoctorCourses from '../components/doctor/DoctorCourses';
import DoctorResourceManager from '../components/doctor/DoctorResourceManager';
import DoctorTaskManager from '../components/doctor/DoctorTaskManager';
import DoctorQuizManager from '../components/doctor/DoctorQuizManager';
import DoctorGradesView from '../components/doctor/DoctorGradesView';
import DoctorStudentProgress from '../components/doctor/DoctorStudentProgress';
import DoctorQuizAnalytics from '../components/doctor/DoctorQuizAnalytics';
import DoctorAnalytics from '../components/doctor/DoctorAnalytics';
import DoctorCourseProgress from '../components/doctor/DoctorCourseProgress';
import DoctorAttendance from '../components/doctor/DoctorAttendance';
import DoctorAnnouncements from '../components/doctor/DoctorAnnouncements';
import DoctorSettings from '../components/doctor/DoctorSettings';

const DoctorDashboard = () => {
  const { doctor, token, logout, loading: authLoading, doctorApi } = useDoctorAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ courses: 0, students: 0, quizzes: 0, resources: 0 });
  const [myCourses, setMyCourses] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    if (!token) return;
    setDataLoading(true);
    try {
      const [statsRes, coursesRes, timetableRes] = await Promise.all([
        doctorApi('get', '/doctor/stats'),
        doctorApi('get', '/doctor/courses'),
        doctorApi('get', '/doctor/timetable')
      ]);
      setStats(statsRes.data);
      setMyCourses(coursesRes.data);
      setTimetable(timetableRes.data);
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

  const filteredCourses = myCourses.filter(course => 
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.department_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Full-screen loading
  if (authLoading || !doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-doctor-bg">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-doctor-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-doctor-primary animate-spin"></div>
          </div>
          <p className="text-sm font-bold text-doctor-text-muted tracking-widest uppercase">Loading Portal</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-doctor-bg text-white font-sans overflow-hidden">
      {/* Sidebar / Bottom Bar */}
      <DoctorSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        doctor={doctor} 
        onLogout={handleLogout} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Background Glows */}
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-doctor-primary/10 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-doctor-primary/5 blur-[120px] rounded-full pointer-events-none"></div>

        <DoctorHeader 
          doctor={doctor} 
          onSearch={setSearchQuery}
          onCreateQuiz={() => setActiveTab('quizzes')}
        />

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 pb-32 lg:pb-10 hidden-scrollbar relative z-10">
          <div className="max-w-[1400px] mx-auto">
            {activeTab === 'overview' && (
              <DoctorOverview 
                stats={stats} 
                doctor={doctor} 
                timetable={timetable} 
              />
            )}

            {activeTab === 'courses' && (
              <DoctorCourses 
                courses={myCourses} 
                onRefresh={fetchData} 
              />
            )}

            {activeTab === 'materials' && <DoctorResourceManager courses={myCourses} />}
            {activeTab === 'quizzes' && <DoctorQuizManager courses={myCourses} />}
            {activeTab === 'tasks' && <DoctorTaskManager courses={myCourses} />}
            {activeTab === 'grades' && <DoctorGradesView courses={myCourses} />}
            {activeTab === 'analytics' && <DoctorAnalytics courses={myCourses} />}
            
            {/* These tabs are accessible via their respective managers but kept here for compatibility */}
            {activeTab === 'syllabus' && <DoctorCourseProgress courses={myCourses} />}
            {activeTab === 'announcements' && <DoctorAnnouncements courses={myCourses} />}
            {activeTab === 'attendance' && <DoctorAttendance courses={myCourses} />}
            {activeTab === 'progress' && <DoctorStudentProgress courses={myCourses} />}
            {activeTab === 'quiz_analytics' && <DoctorQuizAnalytics courses={myCourses} />}
            {activeTab === 'settings' && <DoctorSettings />}
          </div>
        </main>
      </div>

      <style>{`
        .hidden-scrollbar::-webkit-scrollbar { display: none; }
        .hidden-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @media (max-width: 1023px) {
          .pb-safe-content { padding-bottom: 5rem; }
        }
      `}</style>
    </div>
  );
};

export default DoctorDashboard;
