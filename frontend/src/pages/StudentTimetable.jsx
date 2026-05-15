import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserCheck, MapPin, ClipboardList, Coffee, 
  CheckCircle2, Calendar, Clock, Layout, 
  ChevronRight, ArrowRight, Zap, Info, 
  AlertCircle, LayoutDashboard, CalendarDays
} from 'lucide-react';
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

  const isAr = i18n.language === 'ar';

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
      if (!student?.department_id) return [];
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
    if (!student) navigate('/student/login');
  }, [student, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/student/login');
    toast.success(`${t('sidebar.logout')} ${t('auth.success')}`);
  };

  const formatTime = (time) => {
    if (!time) return '—';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? t('common.pm') : t('common.am');
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getTimetableForDay = (dayId) => {
    if (scheduleType === 'lectures') {
      return timetable.filter(item => item.day_of_week === dayId);
    } else {
      return (exams || []).sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date)).map(exam => ({
        ...exam,
        type: exam.exam_type || 'Exam',
        instructor: exam.instructor || 'Department',
        location: exam.location || t('mavi.matrix_node')
      }));
    }
  };

  const currentDayEntries = getTimetableForDay(selectedDay);
  const hasEntries = currentDayEntries.length > 0;
  const currentDayObj = days.find(d => d.id === selectedDay);
  const currentDayName = scheduleType === 'lectures' 
    ? (isAr ? currentDayObj?.arabic : currentDayObj?.name)
    : t('timetable.exams');

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-white dark:bg-[#0c0c14]">
        <div className="w-12 h-12 border-2 border-gray-200 dark:border-white/10 border-t-[#2cfc7d] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c14] text-gray-900 dark:text-white font-sans transition-colors duration-500 overflow-x-hidden relative" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] inset-inline-end-[-5%] w-[50vw] h-[50vw] bg-[#8b5cf6]/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] inset-inline-start-[-5%] w-[40vw] h-[40vw] bg-[#2cfc7d]/3 blur-[100px] rounded-full"></div>
      </div>

      <Sidebar onLogout={handleLogout} />

      <main className="md:ps-72 min-h-screen relative z-10 flex flex-col">
        
        {/* HERO SECTION */}
        <section className="px-6 lg:px-10 pt-16 pb-12 max-w-[1500px] mx-auto w-full space-y-12">
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2cfc7d]"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30">{t('sidebar.timetable')}</span>
              </div>
              <h1 className={`text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-[0.95] tracking-tighter uppercase text-gray-900 dark:text-white ${isAr ? 'font-arabic' : ''}`}>
                {currentDayName}
              </h1>
            </div>

            <div className="flex bg-white dark:bg-white/5 p-2 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl">
              <button
                onClick={() => setScheduleType('lectures')}
                className={`px-8 py-4 rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest transition-all ${scheduleType === 'lectures' ? 'bg-[#10b981] dark:bg-[#2cfc7d] text-white dark:text-black shadow-lg' : 'text-gray-400'}`}
              >
                {t('timetable.lectures')}
              </button>
              <button
                onClick={() => setScheduleType('exams')}
                className={`px-8 py-4 rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest transition-all ${scheduleType === 'exams' ? 'bg-[#10b981] dark:bg-[#2cfc7d] text-white dark:text-black shadow-lg' : 'text-gray-400'}`}
              >
                {t('timetable.exams')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
            
            {/* MOBILE ONLY: Horizontal Day Picker & Section Toggle */}
            <div className="lg:hidden space-y-6">
               <div className="flex bg-white dark:bg-white/5 p-2 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-xl">
                  <button
                    onClick={() => setViewMode('my-section')}
                    className={`flex-1 py-3 rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'my-section' ? 'bg-[#10b981] dark:bg-[#2cfc7d] text-white dark:text-black shadow-lg' : 'text-gray-400'}`}
                  >
                    {t('timetable.my_section')}
                  </button>
                  <button
                    onClick={() => setViewMode('all-sections')}
                    className={`flex-1 py-3 rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'all-sections' ? 'bg-[#10b981] dark:bg-[#2cfc7d] text-white dark:text-black shadow-lg' : 'text-gray-400'}`}
                  >
                    {t('timetable.all_sections')}
                  </button>
               </div>

               <div className={`flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 transition-all duration-500 ${scheduleType === 'exams' ? 'opacity-40 pointer-events-none' : ''}`}>
                  {days.map(day => {
                    const isActive = selectedDay === day.id;
                    return (
                      <button
                        key={day.id}
                        onClick={() => setSelectedDay(day.id)}
                        className={`flex-shrink-0 px-6 py-4 rounded-[1.8rem] flex flex-col items-center gap-1 border transition-all duration-300 ${isActive ? 'bg-black dark:bg-white text-white dark:text-black border-transparent shadow-xl scale-105' : 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-400'}`}
                      >
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40">{day.short}</span>
                        <span className={`text-sm font-black ${isAr ? 'font-arabic' : ''}`}>{isAr ? day.arabic : day.id.slice(0, 3)}</span>
                      </button>
                    );
                  })}
               </div>
            </div>

            {/* LEFT COLUMN: Controls & Day Selector (Desktop Only) */}
            <div className={`hidden lg:block lg:col-span-4 space-y-8 transition-all duration-500 ${scheduleType === 'exams' ? 'opacity-40 pointer-events-none' : ''}`}>
              
              {/* Context Selector */}
              <div className="bg-white dark:bg-[#151520] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-10 space-y-8">
                 <div className="flex items-center justify-between">
                    <h2 className="text-[9px] font-black uppercase tracking-[0.5em] text-gray-400 dark:text-white/30">{t('common.filter')}</h2>
                    <Zap className="w-4 h-4 text-[#8b5cf6]" />
                 </div>
                 <div className="space-y-4">
                    <button
                      onClick={() => setViewMode('my-section')}
                      className={`w-full flex items-center justify-between p-6 rounded-[1.5rem] border transition-all ${viewMode === 'my-section' ? 'bg-[#10b981]/5 border-[#10b981]/20 text-[#10b981] dark:text-[#2cfc7d]' : 'bg-gray-50 dark:bg-white/5 border-transparent text-gray-400'}`}
                    >
                      <span className="text-xs font-black uppercase tracking-widest">{t('timetable.my_section')} ({student?.section})</span>
                      {viewMode === 'my-section' && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setViewMode('all-sections')}
                      className={`w-full flex items-center justify-between p-6 rounded-[1.5rem] border transition-all ${viewMode === 'all-sections' ? 'bg-[#10b981]/5 border-[#10b981]/20 text-[#10b981] dark:text-[#2cfc7d]' : 'bg-gray-50 dark:bg-white/5 border-transparent text-gray-400'}`}
                    >
                      <span className="text-xs font-black uppercase tracking-widest">{t('timetable.all_sections')}</span>
                      {viewMode === 'all-sections' && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                 </div>
              </div>

              {/* Day Selector Matrix */}
              <div className="bg-white dark:bg-[#151520] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-10 space-y-8">
                 <div className="flex items-center justify-between">
                    <h2 className="text-[9px] font-black uppercase tracking-[0.5em] text-gray-400 dark:text-white/30">{t('common.navigation')}</h2>
                    <CalendarDays className="w-4 h-4 text-[#2cfc7d]" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    {days.map(day => {
                      const isActive = selectedDay === day.id;
                      return (
                        <button
                          key={day.id}
                          onClick={() => setSelectedDay(day.id)}
                          className={`p-6 rounded-[1.5rem] flex flex-col items-center gap-2 border transition-all duration-500 ${isActive ? 'bg-black dark:bg-white text-white dark:text-black border-transparent shadow-2xl scale-105' : 'bg-gray-50 dark:bg-white/5 border-transparent text-gray-400 hover:bg-gray-100'}`}
                        >
                          <span className={`text-xl font-black ${isAr ? 'font-arabic' : ''}`}>{isAr ? day.arabic : day.name}</span>
                        </button>
                      );
                    })}
                 </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Schedule Visualization */}
            <div className="lg:col-span-8 space-y-8">
               <div className="flex items-center justify-between px-2">
                  <div className="flex flex-col">
                    <h2 className={`text-3xl font-black uppercase tracking-tight ${isAr ? 'font-arabic' : ''}`}>
                      {scheduleType === 'lectures' ? t('timetable.lectures') : t('timetable.exams')}
                    </h2>
                    <span className="text-[9px] font-black uppercase tracking-[0.5em] text-gray-400 dark:text-white/20">{t('mavi.temporal_sequence')}</span>
                  </div>
                  <div className="bg-[#10b981]/10 dark:bg-[#2cfc7d]/10 px-6 py-2 rounded-2xl text-[#10b981] dark:text-[#2cfc7d] text-xs font-black uppercase tracking-widest">
                     {currentDayEntries.length} {isAr ? 'محاضرة' : 'Lecture'}
                  </div>
               </div>

               <div className="space-y-6">
                  {!hasEntries ? (
                    <div className="bg-white dark:bg-[#151520] border border-dashed border-gray-200 dark:border-white/10 rounded-[3rem] p-24 text-center">
                       <div className="w-24 h-24 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-8">
                          <Coffee className="w-10 h-10 text-gray-200 dark:text-white/10" />
                       </div>
                       <h3 className="text-2xl font-black uppercase tracking-tighter opacity-20">{scheduleType === 'lectures' ? t('timetable.holiday') : t('timetable.no_exams')}</h3>
                       <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-10 mt-2">{scheduleType === 'lectures' ? t('timetable.holiday_desc') : t('timetable.no_exams_desc')}</p>
                    </div>
                  ) : (
                    currentDayEntries.map((entry, idx) => {
                      const now = new Date();
                      const todayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
                      
                      let isLive = false;
                      let isCompleted = false;

                      if (scheduleType === 'lectures') {
                        const isToday = selectedDay === todayName;
                        isLive = isLectureNow(entry) && isToday;
                        isCompleted = isLectureCompleted(entry) && isToday;
                      } else if (entry.exam_date) {
                        const examDate = new Date(entry.exam_date);
                        const entryDateOnly = new Date(examDate.getFullYear(), examDate.getMonth(), examDate.getDate());
                        const todayDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        
                        if (entryDateOnly < todayDateOnly) {
                          isCompleted = true;
                        } else if (entryDateOnly.getTime() === todayDateOnly.getTime()) {
                          isLive = isLectureNow(entry);
                          isCompleted = isLectureCompleted(entry);
                        }
                      }

                      return (
                        <div 
                          key={idx}
                          onClick={() => navigate(`/student/course/${entry.course_id}`)}
                          className={`group bg-white dark:bg-[#151520] border rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-10 transition-all duration-700 relative overflow-hidden cursor-pointer ${isLive ? 'border-[#2cfc7d] shadow-[0_0_50px_rgba(44,252,125,0.1)]' : 'border-gray-100 dark:border-white/5 hover:-translate-y-1 hover:shadow-xl'}`}
                        >
                          {isLive && (
                            <div className="absolute top-0 inset-inline-end-0 bg-[#2cfc7d] text-black px-4 py-1 rounded-bl-[1rem] font-black text-[8px] uppercase tracking-[0.2em] animate-pulse">
                               {t('mavi.live_now')}
                            </div>
                          )}

                          <div className="flex items-center gap-6 flex-1">
                             <div className={`w-16 h-16 rounded-[1.5rem] flex flex-col items-center justify-center border transition-all duration-500 ${isLive ? 'bg-[#2cfc7d] text-black border-transparent shadow-xl' : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-400 group-hover:bg-black dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black'}`}>
                                <Clock className="w-5 h-5 mb-0.5" />
                                <span className="text-[9px] font-black">{entry.start_time?.substring(0, 5)}</span>
                             </div>

                             <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2">
                                   <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${entry.type === 'Lecture' ? 'bg-blue-500/10 text-blue-500' : 'bg-[#8b5cf6]/10 text-[#8b5cf6]'}`}>
                                      {entry.type}
                                   </span>
                                   {viewMode === 'all-sections' && (
                                     <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/40 text-[8px] font-black uppercase tracking-widest">
                                        SEC: {entry.sections_text}
                                     </span>
                                   )}
                                </div>
                                 <div className="flex items-center gap-2">
                                   <h3 className={`text-xl font-black uppercase tracking-tighter truncate ${isAr ? 'font-arabic' : ''} ${isCompleted ? 'line-through opacity-40' : ''}`}>
                                     {entry.course_name}
                                   </h3>
                                    {entry.exam_date && (
                                      <span className="px-4 py-1 rounded-xl bg-[#10b981]/10 text-[#10b981] dark:text-[#2cfc7d] text-xs font-black uppercase tracking-widest whitespace-nowrap">
                                        {new Date(entry.exam_date).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                      </span>
                                    )}
                                  </div>
                                  {entry.type === 'Lecture' && (
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                      {entry.instructor && (
                                        <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
                                          <UserCheck size={14} className="opacity-70" />
                                          <span className="text-[11px] font-black uppercase tracking-widest">{entry.instructor}</span>
                                        </div>
                                      )}
                                      {entry.location && (
                                        <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
                                          <MapPin size={14} className="opacity-70" />
                                          <span className="text-[11px] font-black uppercase tracking-widest">{entry.location}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                              </div>
                          </div>

                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isCompleted ? 'bg-[#10b981] text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-200 dark:text-white/5'}`}>
                             {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <ArrowRight className={`w-6 h-6 ${isAr ? 'rotate-180' : ''}`} />}
                          </div>
                        </div>
                      );
                    })
                  )}
               </div>
            </div>

          </div>
        </section>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
        .font-arabic { font-family: 'Cairo', sans-serif !important; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default StudentTimetable;
