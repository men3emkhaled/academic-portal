// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../context/StudentAuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { student } = useStudentAuth();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [semesterProgress, setSemesterProgress] = useState(72); // وهمي مؤقت

  useEffect(() => {
    if (!student) return;
    fetchDashboardData();
  }, [student]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // جلب الإعلانات (مؤقت من API موجود أو وهمي)
      const announcementsRes = await api.get('/announcements').catch(() => ({ data: [] }));
      setAnnouncements(announcementsRes.data || [
        { id: 1, title: 'Final Exam Schedule Published', content: 'The final examination schedule for the Fall 2023 semester is now available...', is_urgent: true, date: 'October 24, 2023' },
        { id: 2, title: 'New Research Opportunity: AI Ethics Lab', content: 'The Faculty of CI is inviting students to participate...', is_urgent: false, date: 'October 22, 2023' },
      ]);

      // جلب جدول اليوم
      const timetableRes = await api.get('/timetable/today').catch(() => ({ data: [] }));
      setTodaySchedule(timetableRes.data || [
        { id: 1, course_name: 'Machine Learning', start_time: '09:00', end_time: '11:00', location: 'Main Hall 4 - Building B', lecturer: 'Dr. Sarah Johnson', type: 'lecture' },
        { id: 2, course_name: 'Cryptography', start_time: '13:00', end_time: '14:30', location: 'Lab 302 - IT Center', lecturer: 'Dr. Mike Sterling', type: 'lecture' },
      ]);

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
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-neon/10 to-transparent border border-neon/30 rounded-2xl p-6">
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          Welcome back, <span className="neon-text">{student?.name}</span>
        </h1>
        <p className="text-gray-300 mt-2">You're making great progress this semester. Keep it up!</p>
        <div className="flex gap-4 mt-4 text-sm">
          <span className="text-gray-400">ID: {student?.id}</span>
          <span className="text-gray-400">Level: {student?.level || 1}</span>
        </div>
      </div>

      {/* Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Announcements (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-white border-l-4 border-neon pl-3">Latest Announcements</h2>
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
                    <span className="text-xs font-bold text-red-400 bg-red-500/20 px-2 py-1 rounded-full">URGENT</span>
                  )}
                </div>
                <p className="text-gray-300 text-sm">{ann.content}</p>
                <p className="text-gray-500 text-xs mt-3">{ann.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Today's Schedule + Quick Actions */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <div className="bg-charcoal/50 border border-neon/30 rounded-xl p-5">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>📅</span> Today's Schedule
            </h2>
            <div className="space-y-3">
              {todaySchedule.length === 0 ? (
                <p className="text-gray-400 text-sm">No classes scheduled today.</p>
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

          {/* Quick Actions */}
          <div className="bg-charcoal/50 border border-neon/30 rounded-xl p-5">
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button onClick={() => navigate('/courses')} className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-gray-300 hover:text-neon">
                📚 All Courses
              </button>
              <button onClick={() => navigate('/grades')} className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-gray-300 hover:text-neon">
                📊 View Grades
              </button>
              <button onClick={() => navigate('/roadmaps')} className="w-full text-left px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-gray-300 hover:text-neon">
                🗺️ Explore Roadmaps
              </button>
            </div>
          </div>

          {/* Semester Progress */}
          <div className="bg-charcoal/50 border border-neon/30 rounded-xl p-5">
            <h2 className="text-xl font-bold text-white mb-3">Semester Progress</h2>
            <div className="text-center">
              <p className="text-3xl font-bold text-neon">WEEK {semesterProgress} OF 16</p>
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