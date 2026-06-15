import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStudentAuth } from '../context/StudentAuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const { student } = useStudentAuth();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [semesterProgress] = useState(72);

  useEffect(() => {
    if (!student) return;
    fetchDashboardData();
  }, [student]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const announcementsRes = await api.get('/announcements').catch(() => ({ data: [] }));
      setAnnouncements(announcementsRes.data || []);
      const timetableRes = await api.get('/timetable/today').catch(() => ({ data: [] }));
      setTodaySchedule(timetableRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-neon/30 border-t-neon rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-gradient-to-r from-neon/10 to-transparent border border-neon/30 rounded-2xl p-6">
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          {t('dashboard.welcome_back')}, <span className="neon-text">{student?.name}</span>
        </h1>
        <div className="flex gap-4 mt-4 text-sm">
          <span className="text-gray-400">{t('common.id')}: {student?.id}</span>
          <span className="text-gray-400">{t('dashboard.level')}: {student?.level || 1}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-white border-l-4 border-neon pl-3">{t('dashboard.announcements')}</h2>
          <div className="space-y-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className={`bg-charcoal/50 border rounded-xl p-5 transition-all hover:scale-[1.02] ${
                  ann.is_urgent ? 'border-red-500/50 bg-red-500/5' : 'border-neon/30'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-white">{ann.title}</h3>
                  {ann.is_urgent && (
                    <span className="text-xs font-bold text-red-400 bg-red-500/20 px-2 py-1 rounded-full">{t('dashboard.urgent')}</span>
                  )}
                </div>
                <p className="text-gray-300 text-sm">{ann.content}</p>
                <p className="text-gray-500 text-xs mt-3">{ann.date}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-charcoal/50 border border-neon/30 rounded-xl p-5">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>📅</span> {t('dashboard.today_schedule')}
            </h2>
            <div className="space-y-3">
              {todaySchedule.length === 0 ? (
                <p className="text-gray-400 text-sm">{t('dashboard.no_classes')}</p>
              ) : (
                todaySchedule.map((item) => (
                  <div key={item.id} className="border-b border-white/10 pb-3 last:border-0">
                    <p className="text-neon font-medium">{item.start_time} - {item.end_time}</p>
                    <p className="text-white font-semibold">{item.course_name}</p>
                    <p className="text-gray-400 text-sm">{item.location}</p>
                    <p className="text-gray-500 text-xs">{item.lecturer}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-charcoal/50 border border-neon/30 rounded-xl p-5">
            <h2 className="text-xl font-bold text-white mb-4">{t('dashboard.quick_actions')}</h2>
            <div className="space-y-2">
              <button onClick={() => navigate('/courses')} className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-gray-300 hover:text-neon">
                📚 {t('dashboard.all_courses')}
              </button>
              <button onClick={() => navigate('/grades')} className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-gray-300 hover:text-neon">
                📊 {t('dashboard.view_grades')}
              </button>
              <button onClick={() => navigate('/roadmaps')} className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-gray-300 hover:text-neon">
                🗺️ {t('dashboard.explore_roadmaps')}
              </button>
            </div>
          </div>

          <div className="bg-charcoal/50 border border-neon/30 rounded-xl p-5">
            <h2 className="text-xl font-bold text-white mb-3">{t('dashboard.semester_progress')}</h2>
            <div className="text-center">
              <p className="text-3xl font-bold text-neon">{t('dashboard.week_progress', { week: semesterProgress, total: 16 })}</p>
              <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                <div className="bg-neon h-2 rounded-full" style={{ width: `${semesterProgress}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
