import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useStudentData } from '../context/StudentDataContext';
import { useNavigate } from 'react-router-dom';
import { 
  Trash2,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import studentApi from '../services/studentApi';

const StudentCourseRegistration = () => {
  const { student, logout } = useStudentAuth();
  const { fetchGrades, fetchTimetable } = useStudentData();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const isAr = i18n.language === 'ar';

  const [activeSemester, setActiveSemester] = useState(2);
  const [activeTab, setActiveTab] = useState('active');
  const [availableCourses, setAvailableCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourses, setSelectedCourses] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDropCourse, setConfirmDropCourse] = useState(null);

  useEffect(() => {
    if (!student) navigate('/student/login');
  }, [student, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/student/login');
    toast.success(`${t('sidebar.logout')} ${t('auth.success')}`);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [availRes, enrollRes, semRes] = await Promise.all([
        studentApi.get('/student/registration/available-courses'),
        studentApi.get('/student/registration/my-courses'),
        studentApi.get('/student/active-semester')
      ]);

      const norm = (arr) => arr.map(c => ({
        id: c.course_id || c.id,
        name: c.course_name || c.name,
        code: c.code || `CR-${c.course_id || c.id}`,
        semester: Number(c.semester) || 1,
        credit_hours: Number(c.credit_hours) || 3,
      }));

      setAvailableCourses(norm(availRes.data || []));
      setEnrolledCourses(norm(enrollRes.data?.courses || []));
      setActiveSemester(Number(semRes.data?.active_semester) || 2);
    } catch (error) {
      console.error('Error fetching course registration details:', error);
      toast.error(t('courseRegistrationPage.load_failed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (student) fetchData(); }, [student]);

  const handleRegisterSingle = async (courseId) => {
    const courseToRegister = availableCourses.find(c => c.id === courseId);
    const courseCredits = courseToRegister ? (Number(courseToRegister.credit_hours) || 3) : 3;
    if (totalCredits + courseCredits > 18) {
      toast.error(t('courseRegistrationPage.max_credits'));
      return;
    }

    setActionLoading(true);
    try {
      await studentApi.post('/student/registration/register', { course_id: courseId });
      toast.success(t('courseRegistrationPage.register_success_one'));
      await Promise.all([fetchGrades(), fetchTimetable()]);
      setSelectedCourses(prev => { const n = new Set(prev); n.delete(courseId); return n; });
      await fetchData();
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message;
      toast.error(t('courseRegistrationPage.error_prefix') + errMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegisterBulk = async () => {
    if (selectedCourses.size === 0) return;

    let selectedCredits = 0;
    selectedCourses.forEach(id => {
      const c = availableCourses.find(course => course.id === id);
      if (c) selectedCredits += (Number(c.credit_hours) || 3);
    });
    if (totalCredits + selectedCredits > 18) {
      toast.error(t('courseRegistrationPage.exceeds_max'));
      return;
    }

    setActionLoading(true);
    try {
      await studentApi.post('/student/registration/register-bulk', { course_ids: Array.from(selectedCourses) });
      toast.success(t('courseRegistrationPage.register_success_multi'));
      await Promise.all([fetchGrades(), fetchTimetable()]);
      setSelectedCourses(new Set());
      await fetchData();
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message;
      toast.error(t('courseRegistrationPage.error_prefix') + errMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDropCourse = async () => {
    if (!confirmDropCourse) return;
    setActionLoading(true);
    try {
      await studentApi.delete(`/student/registration/drop/${confirmDropCourse.id}`);
      toast.success(t('courseRegistrationPage.drop_success'));
      await Promise.all([fetchGrades(), fetchTimetable()]);
      setConfirmDropCourse(null);
      await fetchData();
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message;
      toast.error(t('courseRegistrationPage.error_prefix') + errMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSelectCourse = (courseId) => {
    setSelectedCourses(prev => {
      const n = new Set(prev);
      n.has(courseId) ? n.delete(courseId) : n.add(courseId);
      return n;
    });
  };

  const toggleAllCourses = (courses) => {
    const allSel = courses.every(c => selectedCourses.has(c.id));
    setSelectedCourses(prev => {
      const n = new Set(prev);
      courses.forEach(c => allSel ? n.delete(c.id) : n.add(c.id));
      return n;
    });
  };

  const enrolledIds = useMemo(() => new Set(enrolledCourses.map(c => c.id)), [enrolledCourses]);

  // All known courses = enrolled + available (no duplicates)
  const allCourses = useMemo(() => {
    const map = new Map();
    enrolledCourses.forEach(c => map.set(c.id, { ...c, enrolled: true }));
    availableCourses.forEach(c => { if (!map.has(c.id)) map.set(c.id, { ...c, enrolled: false }); });
    return Array.from(map.values());
  }, [enrolledCourses, availableCourses]);

  const totalCredits = useMemo(() => enrolledCourses.filter(c => Number(c.semester) >= activeSemester).reduce((s, c) => s + (Number(c.credit_hours) || 0), 0), [enrolledCourses, activeSemester]);

  const applySearch = (courses) => {
    const q = searchQuery.toLowerCase();
    if (!q) return courses;
    return courses.filter(c => c.name?.toLowerCase().includes(q) || c.code?.toLowerCase().includes(q));
  };

  const pastCourses    = useMemo(() => applySearch(allCourses.filter(c => c.semester <  activeSemester)), [allCourses, searchQuery, activeSemester]);
  const activeCourses  = useMemo(() => applySearch(allCourses.filter(c => c.semester === activeSemester || (c.semester > activeSemester && c.enrolled))), [allCourses, searchQuery, activeSemester]);
  const upcomingCourses= useMemo(() => applySearch(allCourses.filter(c => c.semester >  activeSemester && !c.enrolled)), [allCourses, searchQuery, activeSemester]);

  const tabs = [
    {
      id: 'past',
      labelKey: 'courseRegistrationPage.done_label',
      courses: pastCourses,
      color: 'bg-gray-900 dark:bg-white text-white dark:text-black',
      activeColor: 'text-gray-400',
    },
    {
      id: 'active',
      labelKey: 'courseRegistrationPage.now_label',
      courses: activeCourses,
      color: 'bg-[#34d399] text-black shadow-lg shadow-[#059669]/20',
      activeColor: 'text-gray-400',
    },
    {
      id: 'upcoming',
      labelKey: 'courseRegistrationPage.next_label',
      courses: upcomingCourses,
      color: 'bg-[#059669] text-white',
      activeColor: 'text-gray-400',
    },
  ];

  const currentTabData = tabs.find(t => t.id === activeTab);
  const displayCourses = currentTabData?.courses || [];

  // Group display courses by semester
  const bySemester = useMemo(() => {
    const groups = {};
    displayCourses.forEach(c => {
      const s = c.semester;
      if (!groups[s]) groups[s] = [];
      groups[s].push(c);
    });
    return groups;
  }, [displayCourses]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c14] text-gray-900 dark:text-white font-sans transition-colors duration-500 overflow-x-hidden relative" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] inset-inline-end-[-5%] w-[50vw] h-[50vw] bg-[#059669]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] inset-inline-start-[-5%] w-[40vw] h-[40vw] bg-[#34d399]/3 blur-[100px] rounded-full" />
      </div>

      <Sidebar onLogout={handleLogout} />

      <main className="md:ps-72 min-h-screen relative z-10 flex flex-col">
        <section className="px-6 lg:px-10 pt-16 pb-12 max-w-[1500px] mx-auto w-full space-y-12">

          {/* HERO */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            <div className="space-y-4">
              <h1 className={`text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-[0.95] tracking-tighter uppercase text-gray-900 dark:text-white ${isAr ? 'font-arabic' : ''}`}>
                {t('courseRegistrationPage.title')}
              </h1>
            </div>

            <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-10 rounded-[3rem] shadow-xl flex items-center gap-8 group">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30">
                  {t('course_registration.total_credits')}
                </span>
                <div className="text-5xl font-black tracking-tighter text-gray-900 dark:text-white">{totalCredits}</div>
              </div>
            </div>
          </div>

          {/* 3-TAB SWITCHER + SEARCH */}
          <div className="flex flex-col md:flex-row items-center gap-4 justify-between bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 p-3 rounded-[2rem] shadow-md">
            <div className="flex gap-1.5 w-full md:w-auto overflow-x-auto sm:overflow-x-visible no-scrollbar pb-1 sm:pb-0">
              {tabs.map(tab => {
                const isSel = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setSearchQuery(''); setSelectedCourses(new Set()); }}
                    className={`flex-1 md:flex-initial flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-5 py-3.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest transition-all ${isSel ? tab.color : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                  >
                    <span className="whitespace-nowrap">{t(tab.labelKey)}</span>
                    <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full ${isSel ? 'bg-black/10' : 'bg-gray-200 dark:bg-white/10 text-gray-500'}`}>
                      {tab.courses.length}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('courseRegistrationPage.search_placeholder')}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl px-6 py-3.5 text-sm focus:outline-none focus:border-[#34d399] text-gray-900 dark:text-white transition-all"
              />
            </div>
          </div>

          {/* CONTENT */}
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <Loader2 className="w-12 h-12 text-[#34d399] animate-spin mb-4" />
              <p className="text-gray-400 text-sm font-black uppercase tracking-widest">{t('dashboard.loading')}</p>
            </div>
          ) : (
            <div className="space-y-12 pb-32">



              {displayCourses.length === 0 ? (
                <div className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[3rem] p-16 text-center space-y-4">
                  <p className="text-gray-400 text-sm font-black uppercase tracking-widest">
                    {t('courseRegistrationPage.no_courses')}
                  </p>
                </div>
              ) : (
                Object.keys(bySemester).sort((a, b) => Number(a) - Number(b)).map(semKey => {
                  const coursesInSem = bySemester[semKey];
                  const notEnrolledHere = coursesInSem.filter(c => !c.enrolled);
                  return (
                    <div key={semKey} className="space-y-6">
                      <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-black uppercase tracking-tight">
                          {t('courseRegistrationPage.semester_label', { sem: semKey })}
                        </h2>
                        {notEnrolledHere.length > 0 && (
                          <button
                            onClick={() => toggleAllCourses(notEnrolledHere)}
                            className="text-xs font-black uppercase tracking-widest text-[#34d399] hover:underline"
                          >
                            {notEnrolledHere.every(c => selectedCourses.has(c.id))
                              ? t('courseRegistrationPage.deselect_all')
                              : t('courseRegistrationPage.select_all')}
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {coursesInSem.map(course => (
                          <CourseCard
                            key={course.id}
                            course={course}
                            isEnrolled={course.enrolled}
                            isSelected={selectedCourses.has(course.id)}
                            onToggleSelect={() => toggleSelectCourse(course.id)}
                            onRegister={() => handleRegisterSingle(course.id)}
                            onDrop={() => setConfirmDropCourse(course)}
                            actionLoading={actionLoading}
                            isAr={isAr}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </section>
      </main>

      {/* BULK REGISTER BAR */}
      {selectedCourses.size > 0 && (
        <div className="fixed bottom-10 start-6 end-6 md:start-[21rem] md:end-6 z-[60] bg-[#059669] dark:bg-[#34d399] text-black rounded-[2rem] p-6 shadow-2xl flex items-center justify-between gap-6 animate-slideUp">
          <div className="flex items-center gap-4">
            <span className="text-sm font-black uppercase tracking-wider">
              {selectedCourses.size} {t('courseRegistrationPage.selected_suffix')}
            </span>
          </div>
          <button
            onClick={handleRegisterBulk}
            disabled={actionLoading}
            className="bg-black text-white px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="text-lg leading-none">+</span>}
            {t('courseRegistrationPage.register_btn')}
          </button>
        </div>
      )}

      {/* CONFIRM DROP MODAL */}
      {confirmDropCourse && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 dark:bg-black/90 backdrop-blur-sm" onClick={() => setConfirmDropCourse(null)} />
          <div className="relative w-full max-w-[500px] bg-white dark:bg-[#0c0c14] border border-gray-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-300 text-start">
            <div className="flex items-center gap-3 text-rose-500">
              <h3 className="text-xl font-black uppercase tracking-tight">
                {t('courseRegistrationPage.drop_modal_title')}
              </h3>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              {t('courseRegistrationPage.drop_modal_confirm')}
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
              <button
                onClick={() => setConfirmDropCourse(null)}
                className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                {t('courseRegistrationPage.drop_modal_cancel')}
              </button>
              <button
                onClick={handleDropCourse}
                disabled={actionLoading}
                className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {t('courseRegistrationPage.drop_modal_drop')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

const CourseCard = ({ course, isEnrolled, isSelected, onToggleSelect, onRegister, onDrop, actionLoading, isAr }) => {
  const { t } = useTranslation();
  return (
    <div
      onClick={!isEnrolled ? onToggleSelect : undefined}
      className={`group bg-white dark:bg-[#0d0d14] border rounded-[2.5rem] p-8 space-y-6 transition-all duration-500 relative overflow-hidden shadow-sm
        ${!isEnrolled ? 'cursor-pointer hover:border-[#34d399]/40' : ''}
        ${isSelected ? 'border-[#059669] dark:border-[#34d399] bg-[#059669]/5' : 'border-gray-100 dark:border-white/5'}
        ${isEnrolled ? 'ring-1 ring-[#34d399]/20' : ''}
      `}
    >
      {/* Enrolled badge */}
      {isEnrolled && (
        <div className="absolute top-6 inset-inline-end-6">
          <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-[#059669] dark:text-[#34d399] bg-[#059669]/10 dark:bg-[#34d399]/10 px-2.5 py-1 rounded-full">
            {t('courseRegistrationPage.enrolled_badge')}
          </span>
        </div>
      )}

      {!isEnrolled && (
        <div className="flex justify-between items-start">
          <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${isSelected ? 'bg-[#059669] dark:bg-[#34d399] border-transparent' : 'border-gray-300 dark:border-white/10 bg-transparent'}`}>
            {isSelected && <span className="text-black font-black text-xs">✓</span>}
          </div>
        </div>
      )}

      <div className="space-y-1.5 text-start">
        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/20">{course.code}</span>
        <h3 className={`text-xl font-black leading-tight uppercase tracking-tighter ${isAr ? 'font-arabic' : ''}`}>
          {course.name}
        </h3>
      </div>

      <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-6">
        <div className="flex flex-col text-start">
          <span className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">
            {t('courseRegistrationPage.credits_label')}
          </span>
          <span className="text-lg font-black text-gray-900 dark:text-white">{course.credit_hours || 3}</span>
        </div>

        {!isEnrolled ? (
          <button
            onClick={e => { e.stopPropagation(); onRegister(); }}
            disabled={actionLoading}
            className="bg-[#059669]/15 hover:bg-[#059669] dark:bg-[#34d399]/15 dark:hover:bg-[#34d399] text-[#059669] dark:text-[#34d399] hover:text-black dark:hover:text-black px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-1.5 disabled:opacity-50"
          >
            {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span className="text-lg leading-none">+</span>}
            {t('courseRegistrationPage.add_btn')}
          </button>
        ) : (
          <button
            onClick={e => { e.stopPropagation(); onDrop(); }}
            disabled={actionLoading}
            className="w-10 h-10 rounded-full border border-gray-100 dark:border-white/10 flex items-center justify-center hover:bg-rose-500/15 hover:text-rose-500 hover:border-transparent transition-all duration-300 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default StudentCourseRegistration;
