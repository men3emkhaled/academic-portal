import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTAAuth } from '../context/TAAuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

import TASidebar from '../components/ta/TASidebar';
import TAHeader from '../components/ta/TAHeader';
import TAOverview from '../components/ta/TAOverview';
import TACourses from '../components/ta/TACourses';
import TATasks from '../components/ta/TATasks';
import TASettings from '../components/ta/TASettings';
import TANotifications from '../components/ta/TANotifications';
import TAQuizManager from '../components/ta/TAQuizManager';
import TAResourceManager from '../components/ta/TAResourceManager';
import TAGradesView from '../components/ta/TAGradesView';
import TAAttendance from '../components/ta/TAAttendance';
import TAAnnouncements from '../components/ta/TAAnnouncements';
import TACourseProgress from '../components/ta/TACourseProgress';
import TAStudents from '../components/ta/TAStudents';

const TADashboard = () => {
  const { t, i18n } = useTranslation();
  const { ta, token, logout, loading: authLoading, taApi } = useTAAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTabState] = useState('overview');
  const [direction, setDirection] = useState(0);
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const TABS_ORDER = ['overview', 'courses', 'materials', 'quizzes', 'tasks', 'attendance', 'grades', 'announcements', 'students', 'settings', 'notifications'];

  const handleTabChange = (newTab) => {
    if (newTab === activeTab) return;
    const oldIndex = TABS_ORDER.indexOf(activeTab);
    const newIndex = TABS_ORDER.indexOf(newTab);
    if (oldIndex !== -1 && newIndex !== -1) {
      setDirection(newIndex > oldIndex ? 1 : -1);
    }
    setActiveTabState(newTab);
  };

  const fetchData = useCallback(async () => {
    if (!token) return;
    setDataLoading(true);
    try {
      const [statsRes, coursesRes] = await Promise.all([
        taApi('get', '/ta/stats'),
        taApi('get', '/ta/courses'),
      ]);
      setStats(statsRes.data);
      setCourses(coursesRes.data);
    } catch (err) {
      console.error('Failed to load TA data', err);
    } finally {
      setDataLoading(false);
    }
  }, [token, taApi]);

  useEffect(() => {
    if (!token && !authLoading) {
      navigate('/ta/login', { replace: true });
      return;
    }
    fetchData();
  }, [token, authLoading, navigate, fetchData]);

  const handleLogout = () => {
    logout();
    navigate('/ta/login');
  };

  if (authLoading || !ta) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#010101]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-[#059669]/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#059669] animate-spin"></div>
          </div>
          <p className="text-sm font-bold text-gray-400 tracking-widest uppercase">{t('ta.dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <TAOverview stats={stats} courses={courses} />;
      case 'courses': return <TACourses courses={courses} />;
      case 'materials': return <TAResourceManager courses={courses} />;
      case 'quizzes': return <TAQuizManager courses={courses} />;
      case 'tasks': return <TATasks courses={courses} />;
      case 'attendance': return <TAAttendance courses={courses} />;
      case 'grades': return <TAGradesView courses={courses} />;
      case 'announcements': return <TAAnnouncements courses={courses} />;
      case 'students': return <TAStudents courses={courses} />;
      case 'settings': return <TASettings />;
      case 'notifications': return <TANotifications loading={dataLoading} />;
      default: return <TAOverview stats={stats} courses={courses} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#fafafa] dark:bg-[#010101] text-gray-900 dark:text-white font-sans overflow-hidden">
      <TASidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        ta={ta}
        onLogout={handleLogout}
      />

      <div className="flex-1 lg:ps-96 flex flex-col min-w-0 overflow-hidden relative transition-all duration-300">
        <TAHeader
          ta={ta}
          onSearch={setSearchQuery}
          setActiveTab={handleTabChange}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-10 pb-32 lg:pb-10 hidden-scrollbar relative z-10">
          <div
            key={activeTab}
            className={`max-w-[1400px] mx-auto min-h-full w-full ${direction === 0 ? 'animate-fadeIn' : (direction === 1 ? (i18n.language === 'ar' ? 'animate-slideInLeft' : 'animate-slideInRight') : (i18n.language === 'ar' ? 'animate-slideInRight' : 'animate-slideInLeft'))}`}
          >
            {renderTab()}
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

export default TADashboard;
