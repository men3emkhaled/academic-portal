import React, { useState, useEffect } from 'react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useNavigate } from 'react-router-dom';
import studentApi from '../services/studentApi';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';

const StudentTimetable = () => {
  const { student, logout } = useStudentAuth();
  const navigate = useNavigate();
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayNames = {
    Monday: 'الإثنين',
    Tuesday: 'الثلاثاء',
    Wednesday: 'الأربعاء',
    Thursday: 'الخميس',
    Friday: 'الجمعة',
    Saturday: 'السبت',
    Sunday: 'الأحد'
  };

  useEffect(() => {
    if (!student) {
      navigate('/student/login');
      return;
    }
    fetchTimetable();
  }, [student, navigate]);

  const fetchTimetable = async () => {
    try {
      const response = await studentApi.get('/my-timetable');
      setTimetable(response.data);
    } catch (error) {
      console.error('Error fetching timetable:', error);
      toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/student/login');
    toast.success('Logged out successfully');
  };

  const getTimetableForDay = (day) => {
    return timetable.filter(item => item.day_of_week === day);
  };

  const formatTime = (time) => {
    if (!time) return '—';
    return time.substring(0, 5);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-dark">
      <Sidebar activePage="timetable" onLogout={handleLogout} />
      
      <div className="flex-1 ml-0 md:ml-64 p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
              📅 Weekly Schedule
            </h1>
            <p className="text-gray-400">
              Section {student?.section || 'Not assigned'} • Fall Semester 2024
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {days.map((day) => {
              const dayEntries = getTimetableForDay(day);
              const hasEntries = dayEntries.length > 0;
              
              return (
                <div key={day} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                  <div className="bg-primary/20 p-4 border-b border-white/10">
                    <h2 className="text-xl font-bold text-primary">{dayNames[day]}</h2>
                    <p className="text-xs text-gray-400">{day}</p>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    {!hasEntries ? (
                      <div className="text-center py-8">
                        <span className="text-3xl">🌴</span>
                        <p className="text-gray-500 mt-2">Holiday - No Classes</p>
                      </div>
                    ) : (
                      dayEntries.map((entry, idx) => (
                        <div key={idx} className="bg-dark/50 rounded-lg p-3 border border-white/10">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-white">{entry.course_name}</h3>
                              <p className="text-sm text-gray-400">{entry.type || 'Lecture'}</p>
                              {entry.instructor && (
                                <p className="text-xs text-primary mt-1">Dr. {entry.instructor}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-primary font-mono">
                                {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                              </p>
                              {entry.location && (
                                <p className="text-xs text-gray-500 mt-1">{entry.location}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Legend</h3>
            <div className="flex flex-wrap gap-4 text-xs">
              <span className="text-gray-400">📖 Lecture</span>
              <span className="text-gray-400">🔧 Section</span>
              <span className="text-gray-400">🧪 Lab</span>
              <span className="text-gray-400">🌴 Holiday</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTimetable;