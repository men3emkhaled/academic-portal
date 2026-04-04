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
  const [selectedDay, setSelectedDay] = useState('Monday');

  const days = [
    { id: 'Monday', name: 'الإثنين', short: 'Mon' },
    { id: 'Tuesday', name: 'الثلاثاء', short: 'Tue' },
    { id: 'Wednesday', name: 'الأربعاء', short: 'Wed' },
    { id: 'Thursday', name: 'الخميس', short: 'Thu' },
    { id: 'Friday', name: 'الجمعة', short: 'Fri' },
    { id: 'Saturday', name: 'السبت', short: 'Sat' },
    { id: 'Sunday', name: 'الأحد', short: 'Sun' },
  ];

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

  const formatTime = (time) => {
    if (!time) return '—';
    return time.substring(0, 5);
  };

  const getTimetableForDay = (day) => {
    return timetable.filter(item => item.day_of_week === day);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-dark">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const currentDayEntries = getTimetableForDay(selectedDay);
  const hasEntries = currentDayEntries.length > 0;

  return (
    <div className="min-h-screen bg-dark">
      <Sidebar onLogout={handleLogout} />
      
      <div className="md:ml-64 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2">
              📅 Weekly Schedule
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Section {student?.section || 'Not assigned'} • Fall Semester 2024
            </p>
          </div>

          {/* Days of Week - Horizontal Scrolling */}
          <div className="overflow-x-auto pb-2 mb-6">
            <div className="flex gap-2 min-w-max">
              {days.map((day) => (
                <button
                  key={day.id}
                  onClick={() => setSelectedDay(day.id)}
                  className={`
                    px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-200
                    ${selectedDay === day.id 
                      ? 'bg-primary text-dark shadow-lg shadow-primary/30' 
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <div className="text-center">
                    <div className="text-sm sm:text-base">{day.name}</div>
                    <div className="text-xs text-gray-400 sm:hidden">{day.short}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Timetable Content for Selected Day */}
          <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <div className="bg-primary/10 p-4 border-b border-white/10">
              <h2 className="text-lg sm:text-xl font-bold text-primary">
                {days.find(d => d.id === selectedDay)?.name}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                {selectedDay} • {hasEntries ? `${currentDayEntries.length} class(es)` : 'No classes scheduled'}
              </p>
            </div>

            <div className="p-4">
              {!hasEntries ? (
                <div className="text-center py-12 sm:py-16">
                  <span className="text-5xl sm:text-6xl mb-4 block">🌴</span>
                  <p className="text-gray-400 text-base sm:text-lg">Holiday - No Classes</p>
                  <p className="text-gray-500 text-sm mt-2">Enjoy your day off!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentDayEntries.map((entry, idx) => (
                    <div 
                      key={idx} 
                      className="bg-dark/50 rounded-xl p-4 border border-white/10 hover:border-primary/30 transition-all duration-200 hover:shadow-lg"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded-full">
                              {entry.type || 'Lecture'}
                            </span>
                            <h3 className="text-base sm:text-lg font-bold text-white">
                              {entry.course_name}
                            </h3>
                          </div>
                          {entry.instructor && (
                            <p className="text-sm text-gray-400 mt-2 flex items-center gap-1">
                              <span>👨‍🏫</span> {entry.instructor}
                            </p>
                          )}
                        </div>
                        
                        <div className="text-left sm:text-right">
                          <p className="text-base sm:text-lg font-semibold text-primary font-mono">
                            {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                          </p>
                          {entry.location && (
                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1 sm:justify-end">
                              <span>📍</span> {entry.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Legend</h3>
            <div className="flex flex-wrap gap-4 text-xs sm:text-sm">
              <span className="flex items-center gap-1">📖 <span className="text-gray-400">Lecture</span></span>
              <span className="flex items-center gap-1">🔧 <span className="text-gray-400">Section</span></span>
              <span className="flex items-center gap-1">🧪 <span className="text-gray-400">Lab</span></span>
              <span className="flex items-center gap-1">🌴 <span className="text-gray-400">Holiday</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTimetable;