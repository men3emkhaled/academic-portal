import React, { useState, useEffect, useMemo } from 'react';
import { UserCheck, MapPin, ClipboardList, Coffee, CheckCircle2, Calendar } from 'lucide-react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useStudentData } from '../context/StudentDataContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { useTranslation } from 'react-i18next';

const StudentTimetable = () => {
  const { t, i18n } = useTranslation();
  const { student, logout } = useStudentAuth();
  const { timetable: myTimetable, departmentTimetable, exams, loadingTimetable, loadingExams } = useStudentData();
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState('');
  const [currentWeekStart, setCurrentWeekStart] = useState(null);
  const [viewMode, setViewMode] = useState('my-section'); // 'my-section' or 'all-sections'
  const [scheduleType, setScheduleType] = useState('lectures'); // 'lectures' or 'exams'

  const days = [
    { id: 'Sunday', name: t('days.sunday'), short: t('days.sun'), arabic: 'الأحد' },
    { id: 'Monday', name: t('days.monday'), short: t('days.mon'), arabic: 'الإثنين' },
    { id: 'Tuesday', name: t('days.tuesday'), short: t('days.tue'), arabic: 'الثلاثاء' },
    { id: 'Wednesday', name: t('days.wednesday'), short: t('days.wed'), arabic: 'الأربعاء' },
    { id: 'Thursday', name: t('days.thursday'), short: t('days.thu'), arabic: 'الخميس' },
    { id: 'Friday', name: t('days.friday'), short: t('days.fri'), arabic: 'الجمعة' },
    { id: 'Saturday', name: t('days.saturday'), short: t('days.sat'), arabic: 'السبت' },
  ];

  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const isLectureCompleted = (entry) => {
    if (!entry.start_time) return false;
    const now = new Date();
    const [hours, minutes] = entry.start_time.split(':');
    const lectureTime = new Date();
    lectureTime.setHours(parseInt(hours), parseInt(minutes), 0);
    return now > new Date(lectureTime.getTime() + 10 * 60000);
  };

  const isLectureNow = (entry) => {
    if (!entry.start_time || !entry.end_time) return false;
    const now = new Date();
    const [startHours, startMinutes] = entry.start_time.split(':');
    const [endHours, endMinutes] = entry.end_time.split(':');
    const startTime = new Date();
    startTime.setHours(parseInt(startHours), parseInt(startMinutes), 0);
    const endTime = new Date();
    endTime.setHours(parseInt(endHours), parseInt(endMinutes), 0);
    return now >= startTime && now <= endTime;
  };

  useEffect(() => {
    const today = new Date();
    const todayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()];
    setSelectedDay(todayName);
    const weekStart = getStartOfWeek(today);
    setCurrentWeekStart(weekStart);
  }, []);

  const loading = loadingTimetable || loadingExams;

  const timetable = useMemo(() => {
    if (viewMode === 'my-section') {
      return myTimetable || [];
    } else {
      if (!student?.department_id) {
        return [];
      }
      const data = departmentTimetable || [];
      const uniqueMap = new Map();
      for (const entry of data) {
        const key = `${entry.day_of_week}|${entry.start_time}|${entry.end_time}|${entry.course_name}`;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, { ...entry, sections: [entry.section] });
        } else {
          const existing = uniqueMap.get(key);
          if (!existing.sections.includes(entry.section)) {
            existing.sections.push(entry.section);
          }
        }
      }
      return Array.from(uniqueMap.values()).map(entry => ({
        ...entry,
        sections_text: entry.sections.sort((a, b) => a - b).join(', ')
      }));
    }
  }, [myTimetable, departmentTimetable, viewMode, student]);

  useEffect(() => {
    if (!student) {
      navigate('/student/login');
    }
  }, [student, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/student/login');
    toast.success(t('sidebar.logout') + ' ' + t('auth.success'));
  };

  const formatTime = (time) => {
    if (!time) return '—';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? t('common.pm') : t('common.am');
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getTimetableForDay = (day) => {
    return timetable.filter(item => item.day_of_week === day);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-[#050505] transition-colors duration-500 overflow-hidden relative">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative flex items-center justify-center w-20 h-20 mb-6">
            <div className="absolute inset-0 border-4 border-emerald-500/20 dark:border-emerald-500/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center animate-pulse">
              <span className="text-xl font-black text-emerald-500">Z</span>
            </div>
          </div>
          <p className="text-gray-900 dark:text-white font-black text-[10px] uppercase tracking-[0.4em] mb-1 animate-pulse">ZNU PORTAL</p>
          <p className="text-gray-500 dark:text-gray-400 font-bold text-xs tracking-wide">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const currentDayEntries = getTimetableForDay(selectedDay);
  const hasEntries = currentDayEntries.length > 0;
  const currentDayObj = days.find(d => d.id === selectedDay);
  const currentDayName = currentDayObj?.name || selectedDay;

  const weekNumber = currentWeekStart
    ? Math.ceil(
      (new Date(currentWeekStart) - new Date(new Date().getFullYear(), 0, 1)) /
      (7 * 24 * 60 * 60 * 1000)
    )
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark text-gray-900 dark:text-white font-body transition-colors duration-300">
      <Sidebar onLogout={handleLogout} />

      <div className="md:ps-96 pb-24 md:pb-8">
        <div className="max-w-2xl mx-auto px-6 py-8">
          {/* Header with toggle buttons */}
          <div className="mb-8 text-start">
            <div className="flex items-baseline justify-between mb-6 flex-wrap gap-2">
              <h2 className="font-headline font-extrabold text-5xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">
                {currentDayName}
              </h2>
              <div className="flex bg-white dark:bg-dark-glass p-1.5 rounded-full border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-inner overflow-hidden">
                <button
                  onClick={() => setViewMode('my-section')}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${viewMode === 'my-section'
                    ? 'bg-primary text-white dark:text-dark shadow-md'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-5'
                    }`}
                >
                  {t('timetable.my_section')} ({student?.section || '?'})
                </button>
                <button
                  onClick={() => setViewMode('all-sections')}
                  disabled={!student?.department_id}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${viewMode === 'all-sections'
                    ? 'bg-primary text-white dark:text-dark shadow-md'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-5'
                    } ${!student?.department_id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={!student?.department_id ? t('timetable.no_dept') : t('timetable.all_sections_desc')}
                >
                  {t('timetable.all_sections')}
                </button>
              </div>
            </div>
            <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary/90 dark:text-primary/70">
              {t('timetable.week')} {weekNumber}
            </span>
          </div>

          {/* Main Toggle (Lectures vs Exams) */}
          <div className="flex bg-white dark:bg-dark-glass p-1.5 rounded-full border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-inner overflow-hidden mb-8">
            <button
              onClick={() => setScheduleType('lectures')}
              className={`flex-1 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${scheduleType === 'lectures' ? 'bg-primary text-white dark:text-dark shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              {t('timetable.lectures')}
            </button>
            <button
              onClick={() => setScheduleType('exams')}
              className={`flex-1 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${scheduleType === 'exams' ? 'bg-primary text-white dark:text-dark shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              {t('timetable.exams')}
            </button>
          </div>

          {scheduleType === 'lectures' ? (
            <>
              {/* Days Selector */}
              <div className="flex justify-between items-center bg-white dark:bg-dark-card border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-inner p-2 rounded-[2rem] overflow-x-auto no-scrollbar gap-2 mb-12">
                {days.map((day) => {
                  const isActive = selectedDay === day.id;
                  return (
                    <button
                      key={day.id}
                      onClick={() => setSelectedDay(day.id)}
                      className={`flex-1 min-w-[4rem] flex flex-col items-center py-4 rounded-2xl transition-all duration-300 ${isActive ? 'bg-primary text-white dark:text-dark shadow-[0_4px_15px_rgba(46,204,113,0.3)] dark:shadow-[0_0_20px_rgba(142,255,113,0.4)] scale-105' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                      <span className="text-[9px] font-black uppercase tracking-widest mb-1">
                        {day.short}
                      </span>
                      <span className="text-lg font-black font-headline">
                        {new Date(currentWeekStart).getDate() + days.findIndex(d => d.id === day.id)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Schedule List */}
              <div className="space-y-8">
                {!hasEntries ? (
                  <div className="text-center py-16 bg-white/50 dark:bg-dark-glass/50 backdrop-blur-md rounded-[2rem] border border-dashed border-gray-300 dark:border-white/10 shadow-sm dark:shadow-inner">
                    <div className="flex justify-center mb-6"><Coffee className="w-16 h-16 text-primary/40" /></div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">{t('timetable.holiday')}</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">{t('timetable.holiday_desc')}</p>
                  </div>
                ) : (
                  currentDayEntries.map((entry, idx) => {
                    const completed = isLectureCompleted(entry);
                    const isNow = isLectureNow(entry);
                    const isToday = selectedDay === ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];

                    const startFormatted = formatTime(entry.start_time);
                    const endFormatted = formatTime(entry.end_time);

                    let bgColor = '';
                    let statusBadge = null;


                    if (isNow && isToday) {
                      bgColor = 'bg-primary/10 border border-primary/50 shadow-[0_4px_20px_rgba(46,204,113,0.1)] dark:shadow-[0_0_40px_rgba(142,255,113,0.15)] ring-1 ring-primary/20 scale-[1.02]';
                      statusBadge = (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/20 text-primary border border-primary/50 text-[10px] uppercase tracking-widest font-black shadow-[0_0_15px_rgba(46,204,113,0.3)] dark:shadow-[0_0_15px_rgba(142,255,113,0.3)] animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-primary"></span> {t('timetable.live')}
                        </span>
                      );
                    } else if (completed && isToday) {
                      bgColor = 'bg-gray-100/50 dark:bg-dark-glass/40 border border-gray-200 dark:border-white/5 opacity-60 grayscale-[0.5] hover:opacity-100 transition-opacity';
                      statusBadge = (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-200 dark:bg-white/5 text-gray-500 border border-gray-300 dark:border-white/10 text-[10px] uppercase tracking-widest font-black">
                          ✓ {t('timetable.finished')}
                        </span>
                      );
                    } else {
                      bgColor = 'bg-white dark:bg-dark-card border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-xl group hover:border-primary/40 hover:-translate-y-1 hover:shadow-md dark:hover:shadow-2xl transition-all duration-500';
                      statusBadge = null;
                    }

                    return (
                      <div key={idx} className="relative">
                        <div
                          className={`relative overflow-hidden ${bgColor} p-6 sm:p-8 rounded-[2rem] backdrop-blur-md transition-all text-start`}
                        >
                          <div className="flex justify-between items-start mb-5">
                            <div className="space-y-2">
                              <span
                                className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 ${entry.type === 'Lecture' ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20' : 'bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20'}`}
                              >
                                {entry.type === 'Lecture' ? t('timetable.type_lecture') : (entry.type === 'Lab' ? t('timetable.type_lab') : (entry.type === 'Section' ? t('timetable.type_section') : entry.type))}
                              </span>
                              <h3 className="text-2xl font-headline font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 leading-tight tracking-tight">
                                {entry.course_name}
                              </h3>
                              {/* عرض السكاشن المجمعة في وضع "كل السكاشن" */}
                              {viewMode === 'all-sections' && entry.sections_text && (
                                <div className="text-xs text-gray-700 dark:text-white/80 bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 inline-block px-3 py-1 mt-2 rounded-full font-bold">
                                  {t('timetable.section')}: {entry.sections_text}
                                </div>
                              )}
                            </div>
                            <div className="text-end">
                              {statusBadge ? (
                                statusBadge
                              ) : (
                                <>
                                  <p className="font-headline font-black text-3xl text-gray-900 dark:text-white tracking-tighter">
                                    {startFormatted.split(' ')[0]}
                                  </p>
                                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-widest opacity-80 dark:opacity-60">
                                    {startFormatted.split(' ')[1]}
                                  </p>
                                </>
                              )}
                              {entry.is_quiz && (
                                <div className="mt-2">
                                  <span className="inline-block px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-[10px] font-bold uppercase tracking-wider">
                                    <span className={`flex items-center gap-1 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}><ClipboardList className="w-3 h-3" /> {t('timetable.quiz')}</span>
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-5 items-center mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                            {entry.instructor && (
                              <div className={`flex items-center gap-2 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                  <UserCheck className="w-4 h-4 text-primary" /> {entry.instructor}
                                </span>
                              </div>
                            )}
                            {entry.location && (
                              <div className={`flex items-center gap-2 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-secondary" /> {entry.location}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <div className="space-y-8">
              {!exams || exams.length === 0 ? (
                <div className="text-center py-16 bg-white/50 dark:bg-dark-glass/50 backdrop-blur-md rounded-[2rem] border border-dashed border-gray-300 dark:border-white/10 shadow-sm dark:shadow-inner">
                  <div className="flex justify-center mb-6"><ClipboardList className="w-16 h-16 text-primary/40" /></div>
                  <p className="text-gray-500 dark:text-gray-400 text-lg">{t('timetable.no_exams')}</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">{t('timetable.no_exams_desc')}</p>
                </div>
              ) : (
                exams.map((exam, idx) => {
                  const isPractical = exam.exam_type === 'Practical';
                  return (
                    <div key={idx} className="relative">
                      <div className={`relative overflow-hidden bg-white dark:bg-dark-card border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-xl group hover:border-primary/40 hover:-translate-y-1 hover:shadow-md dark:hover:shadow-2xl transition-all duration-500 p-6 sm:p-8 rounded-[2rem] backdrop-blur-md text-start`}>
                        <div className={`flex justify-between items-start mb-5 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                          <div className="space-y-2">
                            <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 ${isPractical ? 'bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20' : 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20'}`}>
                              {isPractical ? t('timetable.type_practical') : t('timetable.type_final')}
                            </span>
                            <h3 className="text-xl sm:text-2xl font-extrabold font-headline leading-tight pr-4 text-gray-900 dark:text-white">
                              {exam.course_name}
                            </h3>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-white/10">
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
                              <Calendar className="w-4 h-4 text-primary" />
                            </div>
                            <div className="text-start">
                              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">{t('timetable.exam_day')}</p>
                              <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                                {new Date(exam.exam_date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-GB', { weekday: 'long' })}<br />
                                <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(exam.exam_date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-GB')}</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 w-full sm:w-auto sm:ms-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0">
                              <Coffee className="w-4 h-4 text-primary" />
                            </div>
                            <div className="text-start">
                              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">{t('timetable.exam_time')}</p>
                              <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{formatTime(exam.start_time)} - {formatTime(exam.end_time)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
      <style>{`
        .font-headline { font-family: 'Manrope', 'Inter', sans-serif; }
        .bg-dark-glass { background: rgba(17, 17, 17, 0.7); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
      `}</style>
    </div>
  );
};

export default StudentTimetable;