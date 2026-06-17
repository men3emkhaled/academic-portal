import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck, BookOpen, ListTodo, ChevronRight, IdCard,
  GraduationCap, ArrowRight, Layers
} from 'lucide-react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useStudentData } from '../context/StudentDataContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import studentApi from '../services/studentApi';
import { transliterateArabic } from '../utils/transliteration';
import {
  PageContainer, PageHeader, SectionCard, StatCard,
  StatusBadge, EmptyState, LoadingState, Modal
} from '@/components/common';
import { Button } from '@/components/ui/button';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'dashboard.greeting_morning';
  if (hour < 18) return 'dashboard.greeting_afternoon';
  return 'dashboard.greeting_evening';
};

const StudentDashboard = () => {
  const { student, logout } = useStudentAuth();
  const { t, i18n } = useTranslation();
  const {
    gradesData, loadingGrades,
    notifications: allNotifications, loadingNotifications, markNotificationAsRead,
    officialTasks, loadingOfficialTasks, fetchOfficialTasks,
    tasks: personalTasks, loadingTasks, fetchTasks
  } = useStudentData();
  const navigate = useNavigate();

  const [greeting, setGreeting] = useState('');
  const [isCardExpanded, setIsCardExpanded] = useState(false);
  const [activeSemester, setActiveSemester] = useState(null);

  useEffect(() => {
    setGreeting(t(getGreeting()));
    const interval = setInterval(() => setGreeting(t(getGreeting())), 60000);
    return () => clearInterval(interval);
  }, [t]);

  useEffect(() => {
    studentApi.get('/student/active-semester')
      .then(res => setActiveSemester(Number(res.data?.active_semester) || null))
      .catch(() => setActiveSemester(null));
  }, []);

  const notifications = useMemo(() => {
    return allNotifications.slice(0, 3);
  }, [allNotifications]);

  const grades = useMemo(() => {
    const all = gradesData.grades || [];
    if (activeSemester === null) return all.filter(g => g.enrollment_status === 'active' || !g.enrollment_status);
    return all.filter(g =>
      (g.enrollment_status === 'active' || !g.enrollment_status) &&
      Number(g.semester) >= activeSemester
    );
  }, [gradesData.grades, activeSemester]);
  const loading = loadingGrades;
  const notifLoading = loadingNotifications;

  const pendingOfficial = officialTasks.filter(t => !t.is_completed) || [];
  const pendingPersonal = personalTasks.filter(t => !t.is_completed) || [];
  const totalPendingTasks = pendingOfficial.length + pendingPersonal.length;

  useEffect(() => {
    if (!student) navigate('/student/login');
  }, [student, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/student/login');
    toast.success(`${t('sidebar.logout')} ${t('auth.success')}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return t('common.today');
    if (days === 1) return t('common.yesterday');
    return t('common.days_ago', { count: days });
  };

  const isAr = i18n.language === 'ar';

  const levelLabel = isAr
    ? (student?.level === 1 ? 'الفرقة الأولى' :
       student?.level === 2 ? 'الفرقة الثانية' :
       student?.level === 3 ? 'الفرقة الثالثة' :
       student?.level === 4 ? 'الفرقة الرابعة' : `الفرقة ${student?.level}`)
    : (student?.level === 1 ? 'First Year' :
       student?.level === 2 ? 'Second Year' :
       student?.level === 3 ? 'Third Year' :
       student?.level === 4 ? 'Fourth Year' : `Year ${student?.level}`);

  if (loading) {
    return (
      <div className="min-h-screen bg-background" dir={isAr ? 'rtl' : 'ltr'}>
        <Sidebar onLogout={handleLogout} />
        <main className="md:ps-72 min-h-screen">
          <LoadingState />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      <Sidebar onLogout={handleLogout} />

      <main className="md:ps-72 min-h-screen flex flex-col">
        <PageContainer>

          {/* Header */}
          <PageHeader
            title={t('sidebar.dashboard')}
            description={greeting ? `${greeting}${student?.name ? `, ${isAr ? student.name : transliterateArabic(student.name)}` : ''}` : undefined}
            actions={
              <Button variant="outline" onClick={() => setIsCardExpanded(true)}>
                <IdCard className="size-4" />
                {t('dashboard.id_card')}
              </Button>
            }
          />

          {/* Stat row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              label={t('dashboard.active_courses')}
              value={grades.length}
              icon={BookOpen}
              accent
            />
            <StatCard
              label={t('dashboard.pending_tasks')}
              value={totalPendingTasks}
              icon={ListTodo}
              hint={t('dashboard.pending_tasks')}
            />
            <StatCard
              label={t('settings.level')}
              value={`#${student?.level ?? '—'}`}
              icon={GraduationCap}
              hint={levelLabel}
            />
          </div>

          {/* Active courses */}
          <SectionCard
            title={t('dashboard.active_courses')}
            actions={
              <StatusBadge variant="neutral">{grades.length}</StatusBadge>
            }
            bodyClassName="p-0"
          >
            {grades.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon={Layers}
                  title={t('dashboard.active_courses')}
                />
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {grades.map((grade, idx) => (
                  <li key={grade.course_id || idx}>
                    <button
                      type="button"
                      onClick={() => navigate(`/student/course/${grade.course_id}`)}
                      className="group flex w-full items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-muted/50"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground group-hover:text-primary">
                        <BookOpen className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-sm font-medium text-foreground ${isAr ? 'font-arabic' : ''}`}>
                          {grade.course_name}
                        </span>
                      </span>
                      <ArrowRight className={`size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground ${isAr ? 'rotate-180' : ''}`} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          {/* Pending tasks shortcut */}
          <SectionCard bodyClassName="p-0">
            <button
              type="button"
              onClick={() => navigate('/student/personal-tasks')}
              className="group flex w-full items-center gap-4 px-4 py-4 text-start transition-colors hover:bg-muted/50"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                <ListTodo className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground">{t('dashboard.pending_tasks')}</span>
                <span className="block text-xs text-muted-foreground">{totalPendingTasks}</span>
              </span>
              <ChevronRight className={`size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground ${isAr ? 'rotate-180' : ''}`} />
            </button>
          </SectionCard>

        </PageContainer>
      </main>

      {/* ID card modal */}
      <Modal
        open={isCardExpanded}
        onOpenChange={setIsCardExpanded}
        title={t('dashboard.id_card')}
        size="sm"
      >
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
            <span>ZNU-{student?.id}</span>
            <ShieldCheck className="size-4 text-primary" />
          </div>

          <div className="flex size-24 items-center justify-center overflow-hidden rounded-full border bg-muted">
            {student?.avatar_url ? (
              <img src={student.avatar_url} alt={student.name} className="size-full object-cover" />
            ) : (
              <span className="text-2xl font-semibold text-muted-foreground">{student?.name?.charAt(0)}</span>
            )}
          </div>

          <h2 className={`text-lg font-semibold text-foreground ${isAr ? 'font-arabic' : ''}`}>
            {isAr ? student?.name : transliterateArabic(student?.name)}
          </h2>

          <div className="grid w-full grid-cols-2 gap-3">
            <div className="rounded-lg border bg-muted/50 p-3 text-start">
              <span className="block text-xs text-muted-foreground">{t('settings.level')}</span>
              <span className="mt-1 block text-sm font-medium text-foreground">{levelLabel}</span>
            </div>
            <div className="rounded-lg border bg-muted/50 p-3 text-start">
              <span className="block text-xs text-muted-foreground">{t('settings.section')}</span>
              <span className="mt-1 block text-sm font-medium text-foreground">{student?.section || '3'}</span>
            </div>
          </div>

          <div className="w-full rounded-lg border border-primary/20 bg-primary/10 p-3 text-start">
            <span className="block text-xs text-primary/80">{t('dashboard.dept')}</span>
            <span className="mt-1 block text-sm font-semibold text-primary">{student?.department_name || 'Artificial Intelligence'}</span>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentDashboard;
