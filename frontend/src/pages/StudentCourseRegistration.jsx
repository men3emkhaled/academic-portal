import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useStudentData } from '../context/StudentDataContext';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen, Plus, Trash2, CheckSquare,
  Layers, AlertTriangle, Clock, Zap, CheckCircle2, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import studentApi from '../services/studentApi';
import {
  PageContainer, PageHeader, SectionCard, StatCard, StatusBadge,
  EmptyState, LoadingState, SearchInput, Toolbar, SegmentedTabs, Modal,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
      toast.error(isAr ? 'فشل تحميل بيانات تسجيل المواد' : 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (student) fetchData(); }, [student]);

  const handleRegisterSingle = async (courseId) => {
    const courseToRegister = availableCourses.find(c => c.id === courseId);
    const courseCredits = courseToRegister ? (Number(courseToRegister.credit_hours) || 3) : 3;
    if (totalCredits + courseCredits > 18) {
      toast.error(isAr ? 'عذراً، لا يمكنك تسجيل أكثر من 18 ساعة معتمدة.' : 'Sorry, you cannot register more than 18 credit hours.');
      return;
    }

    setActionLoading(true);
    try {
      await studentApi.post('/student/registration/register', { course_id: courseId });
      toast.success(isAr ? 'تم تسجيل المادة!' : 'Course registered!');
      await Promise.all([fetchGrades(), fetchTimetable()]);
      setSelectedCourses(prev => { const n = new Set(prev); n.delete(courseId); return n; });
      await fetchData();
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message;
      toast.error((isAr ? 'خطأ: ' : 'Error: ') + errMsg);
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
      toast.error(isAr ? 'عذراً، إجمالي الساعات بعد التسجيل سيتجاوز الحد الأقصى (18 ساعة).' : 'Sorry, total credit hours after registration will exceed the maximum (18 credit hours).');
      return;
    }

    setActionLoading(true);
    try {
      await studentApi.post('/student/registration/register-bulk', { course_ids: Array.from(selectedCourses) });
      toast.success(isAr ? 'تم تسجيل المواد!' : 'Courses registered!');
      await Promise.all([fetchGrades(), fetchTimetable()]);
      setSelectedCourses(new Set());
      await fetchData();
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message;
      toast.error((isAr ? 'خطأ: ' : 'Error: ') + errMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDropCourse = async () => {
    if (!confirmDropCourse) return;
    setActionLoading(true);
    try {
      await studentApi.delete(`/student/registration/drop/${confirmDropCourse.id}`);
      toast.success(isAr ? 'تم إلغاء تسجيل المادة.' : 'Course dropped.');
      await Promise.all([fetchGrades(), fetchTimetable()]);
      setConfirmDropCourse(null);
      await fetchData();
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message;
      toast.error((isAr ? 'خطأ: ' : 'Error: ') + errMsg);
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
      labelEn: 'Done',
      labelAr: 'المواد المنتهية',
      icon: CheckCircle2,
      courses: pastCourses,
    },
    {
      id: 'active',
      labelEn: 'Now',
      labelAr: 'الترم الحالي',
      icon: Zap,
      courses: activeCourses,
    },
    {
      id: 'upcoming',
      labelEn: 'Next',
      labelAr: 'مواد قادمة',
      icon: Clock,
      courses: upcomingCourses,
    },
  ];

  const tabOptions = tabs.map(tab => ({
    value: tab.id,
    label: isAr ? tab.labelAr : tab.labelEn,
    icon: tab.icon,
    count: tab.courses.length,
  }));

  const currentTabData = tabs.find(tab => tab.id === activeTab);
  const displayCourses = currentTabData?.courses || [];

  const sectionDescription = isAr
    ? (activeTab === 'past' ? 'مواد الفصول السابقة — يمكنك التعديل بحرية' : activeTab === 'active' ? 'مواد الفصل الحالي' : 'مواد الفصول القادمة — سجّل مسبقاً')
    : (activeTab === 'past' ? 'Past semesters — edit freely' : activeTab === 'active' ? 'Current semester courses' : 'Upcoming semesters — register early');

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
    <div className="min-h-screen bg-background text-foreground font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      <Sidebar onLogout={handleLogout} />

      <main className="md:ps-72 min-h-screen">
        <PageContainer>
          <PageHeader
            icon={BookOpen}
            title={isAr ? 'تسجيل الكورسات' : 'My Courses'}
            description={t('course_registration.title')}
            actions={
              <StatCard
                label={t('course_registration.total_credits')}
                value={totalCredits}
                icon={Layers}
                accent
                className="min-w-[10rem]"
              />
            }
          />

          <Toolbar>
            <SegmentedTabs
              value={activeTab}
              onChange={(val) => { setActiveTab(val); setSearchQuery(''); setSelectedCourses(new Set()); }}
              options={tabOptions}
            />
            <SearchInput
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'بحث...' : 'Search courses...'}
            />
          </Toolbar>

          {loading ? (
            <LoadingState label={t('dashboard.loading')} />
          ) : displayCourses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title={isAr ? 'لا توجد مواد هنا' : 'No courses here'}
              description={sectionDescription}
            />
          ) : (
            <div className="space-y-5 pb-28">
              {Object.keys(bySemester).sort((a, b) => Number(a) - Number(b)).map(semKey => {
                const coursesInSem = bySemester[semKey];
                const notEnrolledHere = coursesInSem.filter(c => !c.enrolled);
                const allSelectedHere = notEnrolledHere.length > 0 && notEnrolledHere.every(c => selectedCourses.has(c.id));
                return (
                  <SectionCard
                    key={semKey}
                    title={isAr ? `الترم ${semKey}` : `Semester ${semKey}`}
                    description={sectionDescription}
                    bodyClassName="p-0"
                    actions={
                      notEnrolledHere.length > 0 ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAllCourses(notEnrolledHere)}
                          className="text-primary hover:text-primary"
                        >
                          {allSelectedHere
                            ? (isAr ? 'إلغاء تحديد الكل' : 'Deselect All')
                            : (isAr ? 'تحديد الكل' : 'Select All')}
                        </Button>
                      ) : null
                    }
                  >
                    <ul className="divide-y divide-border">
                      {coursesInSem.map(course => (
                        <CourseRow
                          key={course.id}
                          course={course}
                          isEnrolled={course.enrolled}
                          isSelected={selectedCourses.has(course.id)}
                          onToggleSelect={() => toggleSelectCourse(course.id)}
                          onRegister={() => handleRegisterSingle(course.id)}
                          onDrop={() => setConfirmDropCourse(course)}
                          actionLoading={actionLoading}
                          isAr={isAr}
                          t={t}
                        />
                      ))}
                    </ul>
                  </SectionCard>
                );
              })}
            </div>
          )}
        </PageContainer>
      </main>

      {/* BULK REGISTER BAR */}
      <AnimatePresence>
        {selectedCourses.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-6 start-4 end-4 md:start-[20rem] md:end-6 z-[60] flex items-center justify-between gap-4 rounded-xl border bg-card p-3 shadow-sm"
          >
            <div className="flex items-center gap-2 ps-1 text-sm font-medium text-foreground">
              <span className="flex size-7 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                <CheckSquare className="size-4" />
              </span>
              {isAr ? `${selectedCourses.size} مواد محددة` : `${selectedCourses.size} selected`}
            </div>
            <Button onClick={handleRegisterBulk} disabled={actionLoading}>
              {actionLoading ? <Spinner /> : <Plus className="size-4" />}
              {isAr ? 'تسجيل المحدد' : 'Register'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONFIRM DROP MODAL */}
      <Modal
        open={!!confirmDropCourse}
        onOpenChange={(open) => { if (!open) setConfirmDropCourse(null); }}
        size="sm"
        title={
          <span className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5" />
            {isAr ? 'إلغاء تسجيل المادة' : 'Drop Course'}
          </span>
        }
        description={
          confirmDropCourse
            ? (isAr
                ? `هل أنت متأكد من إلغاء تسجيل "${confirmDropCourse.name}"؟ سيتم حذف جميع درجاتك نهائياً.`
                : `Drop "${confirmDropCourse.name}"? All grades for this course will be permanently deleted.`)
            : undefined
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDropCourse(null)}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="destructive" onClick={handleDropCourse} disabled={actionLoading}>
              {actionLoading && <Spinner />}
              {isAr ? 'إلغاء التسجيل' : 'Drop'}
            </Button>
          </>
        }
      />
    </div>
  );
};

const Spinner = () => (
  <span className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
);

const CourseRow = ({ course, isEnrolled, isSelected, onToggleSelect, onRegister, onDrop, actionLoading, isAr, t }) => {
  return (
    <li
      onClick={!isEnrolled ? onToggleSelect : undefined}
      className={cn(
        'flex items-center gap-3 px-4 py-3 transition-colors',
        !isEnrolled && 'cursor-pointer hover:bg-muted/50',
        isSelected && 'bg-primary/5'
      )}
    >
      {/* Selection control / enrolled marker */}
      {!isEnrolled ? (
        <span
          className={cn(
            'flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors',
            isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-transparent'
          )}
        >
          {isSelected && <Check className="size-3.5" />}
        </span>
      ) : (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
          <BookOpen className="size-4" />
        </span>
      )}

      {/* Course identity */}
      <div className="min-w-0 flex-1 text-start">
        <div className="flex items-center gap-2">
          <p className={cn('truncate text-sm font-medium text-foreground', isAr && 'font-arabic')}>
            {course.name}
          </p>
          {isEnrolled && (
            <StatusBadge variant="success" icon={CheckCircle2}>
              {isAr ? 'مسجل' : 'Enrolled'}
            </StatusBadge>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {course.code} · {course.credit_hours || 3} {isAr ? 'ساعة' : 'cr'}
        </p>
      </div>

      {/* Actions */}
      {!isEnrolled ? (
        <Button
          variant="outline"
          size="sm"
          onClick={e => { e.stopPropagation(); onRegister(); }}
          disabled={actionLoading}
          className="shrink-0"
        >
          {actionLoading ? <Spinner /> : <Plus className="size-3.5" />}
          {isAr ? 'تسجيل' : 'Add'}
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={e => { e.stopPropagation(); onDrop(); }}
          disabled={actionLoading}
          aria-label={isAr ? 'إلغاء التسجيل' : 'Drop'}
          className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="size-4" />
        </Button>
      )}
    </li>
  );
};

export default StudentCourseRegistration;
