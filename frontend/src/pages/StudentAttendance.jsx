import React, { useState, useEffect } from 'react';
import { UserCheck, CheckCircle2, XCircle, CalendarDays, Loader2 } from 'lucide-react';
import studentApi from '../services/studentApi';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const StudentAttendance = () => {
  const { t, i18n } = useTranslation();
  const { student, logout } = useStudentAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAr = i18n.language === 'ar';

  useEffect(() => {
    if (!student) navigate('/student/login');
  }, [student, navigate]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await studentApi.get('/student/my-attendance');
        setRecords(res.data || []);
      } catch (err) {
        toast.error(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/student/login');
    toast.success(`${t('sidebar.logout')} ${t('auth.success')}`);
  };

  const groupedByDay = records.reduce((acc, rec) => {
    const day = rec.session_date ? rec.session_date.split('T')[0] : 'unknown';
    if (!acc[day]) {
      acc[day] = { date: day, records: [] };
    }
    acc[day].records.push(rec);
    return acc;
  }, {});

  const dayEntries = Object.entries(groupedByDay)
    .sort(([a], [b]) => (a > b ? -1 : 1))
    .map(([, v]) => v);
  const totalPresent = records.filter(r => r.status === 'present').length;
  const totalAbsent = records.filter(r => r.status === 'absent').length;

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-white dark:bg-[#0c0c14]">
        <div className="w-12 h-12 border-2 border-gray-200 dark:border-white/10 border-t-[#34d399] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c14] text-gray-900 dark:text-white font-sans transition-colors duration-500 overflow-x-hidden relative" dir={isAr ? 'rtl' : 'ltr'}>

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] inset-inline-end-[-5%] w-[50vw] h-[50vw] bg-[#059669]/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] inset-inline-start-[-5%] w-[40vw] h-[40vw] bg-[#34d399]/3 blur-[100px] rounded-full"></div>
      </div>

      <Sidebar onLogout={handleLogout} />

      <main className="md:ps-72 min-h-screen relative z-10 flex flex-col">

        <section className="px-6 lg:px-10 pt-16 pb-12 max-w-[1500px] mx-auto w-full space-y-8 text-start">

          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
            <div className="space-y-4 text-start">
              <h1 className={`text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-[0.95] tracking-tighter uppercase text-gray-900 dark:text-white ${isAr ? 'font-arabic' : ''}`}>
                {t('attendance.title')}
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-md">
            <div className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[1.75rem] p-5 sm:p-6 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-0.5 bg-[#059669]/40 dark:bg-[#34d399]/40" />
              <div className="space-y-1">
                <p className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-400 dark:text-white/40">{t('attendance.present')}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white">{totalPresent}</span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-white/40">{t('attendance.count', { count: records.length })}</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[1.75rem] p-5 sm:p-6 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-0.5 bg-rose-400/40" />
              <div className="space-y-1">
                <p className="text-[11px] font-black uppercase tracking-[0.15em] text-gray-400 dark:text-white/40">Absent</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black tracking-tight text-rose-500">{totalAbsent}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 pb-20">
            {dayEntries.length === 0 ? (
              <div className="bg-white dark:bg-[#0d0d14] border border-dashed border-gray-100 dark:border-white/10 rounded-[2rem] p-16 text-center">
                <UserCheck className="w-12 h-12 mx-auto mb-4 text-gray-200 dark:text-white/10" />
                <h3 className="text-lg font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/30">{t('attendance.no_records')}</h3>
              </div>
            ) : (
              dayEntries.map(day => {
                const dateObj = new Date(day.date);
                const dayLabel = dateObj.toLocaleDateString(isAr ? 'ar-EG' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                const present = day.records.filter(r => r.status === 'present').length;
                const total = day.records.length;
                return (
                  <div key={day.date} className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[1.75rem] p-5 sm:p-6 relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-0.5 bg-[#059669]/40 dark:bg-[#34d399]/40" />
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-5 h-5 text-[#059669]" />
                        <h2 className="text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white">{dayLabel}</h2>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-black">
                        <span className="text-[#059669]">{present}</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-500">{total}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {day.records.map(rec => (
                        <div key={rec.record_id} className="flex items-center justify-between py-2.5 px-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                          <div className="flex items-center gap-3">
                            {rec.status === 'present' ? (
                              <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-500" />
                            )}
                            <div>
                              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                {rec.session_title}
                              </span>
                              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/30 block">
                                {rec.course_name}
                              </span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${rec.status === 'present' ? 'bg-[#059669]/10 text-[#059669]' : 'bg-rose-500/10 text-rose-500'}`}>
                            {rec.status === 'present' ? t('attendance.present') : 'Absent'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </section>
      </main>

    </div>
  );
};

export default StudentAttendance;
