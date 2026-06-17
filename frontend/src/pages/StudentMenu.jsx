import React, { useEffect, useState } from 'react';
import {
  BookOpen, FileText, Map, CheckSquare, Settings, ShieldCheck,
  Languages, Sun, Moon, LogOut, ArrowRight, User, GraduationCap,
  Layers, Users, TrendingUp
} from 'lucide-react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useStudentData } from '../context/StudentDataContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import studentApi from '../services/studentApi';
import { PageContainer, PageHeader, SectionCard, StatusBadge } from '@/components/common';
import { cn } from '@/lib/utils';

const StudentMenu = () => {
  const { t, i18n } = useTranslation();
  const { student, logout } = useStudentAuth();
  const { theme, toggleTheme } = useTheme();
  const {
    notifications,
    tasks: personalTasks,
    officialTasks,
    gradesData
  } = useStudentData();
  const navigate = useNavigate();

  const isAr = i18n.language === 'ar';
  const [activeSemester, setActiveSemester] = useState(null);

  useEffect(() => {
    if (!student) navigate('/student/login');
  }, [student, navigate]);

  useEffect(() => {
    studentApi.get('/student/active-semester')
      .then(res => setActiveSemester(Number(res.data?.active_semester) || null))
      .catch(() => setActiveSemester(null));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/student/login');
    toast.success(`${t('sidebar.logout')} ${t('auth.success')}`);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  // Stats / Badges counts
  const unreadNotifCount = notifications.filter(n => !n.is_read).length;
  const pendingTasksCount = personalTasks.filter(t => !t.is_completed).length;
  const pendingOfficialCount = officialTasks.filter(t => !t.is_completed).length;
  const totalPendingTasks = pendingTasksCount + pendingOfficialCount;
  const registeredCoursesCount = (gradesData.grades || []).filter(g =>
    (g.enrollment_status === 'active' || !g.enrollment_status) &&
    (activeSemester !== null ? Number(g.semester) >= activeSemester : true)
  ).length;

  const menuItems = [
    {
      id: 'course-registration',
      label: t('sidebar.course_registration'),
      desc: isAr ? 'تسجيل وتعديل المواد الدراسية الخاصة بالترم' : 'Enroll and modify your semester academic courses',
      icon: <BookOpen className="size-5" />,
      path: '/student/registration',
      badge: registeredCoursesCount > 0 ? `${registeredCoursesCount} ${isAr ? 'مواد' : 'Courses'}` : null
    },
    {
      id: 'grades',
      label: t('sidebar.courses_grades'),
      desc: isAr ? 'عرض النتائج ودرجات المواد والتقديرات الأكاديمية' : 'View semester grading results, course marks and academic GPA',
      icon: <TrendingUp className="size-5" />,
      path: '/student/grades',
      badge: gradesData.summary?.overallPercentage ? `${gradesData.summary.overallPercentage}%` : null
    },
    {
      id: 'quizzes',
      label: t('sidebar.quizzes'),
      desc: isAr ? 'الاختبارات الإلكترونية المستمرة والتقييمات' : 'Online assessment quizzes and scoring tests',
      icon: <FileText className="size-5" />,
      path: '/student/quizzes',
      badge: null
    },
    {
      id: 'roadmap',
      label: t('sidebar.roadmap'),
      desc: isAr ? 'خطة تخرجك الدراسي والتقدم التعليمي لسنواتك' : 'Your graduation curriculum roadmap and year progress',
      icon: <Map className="size-5" />,
      path: '/student/roadmap',
      badge: isAr ? `مستوى ${student?.level || 1}` : `Level ${student?.level || 1}`
    },
    {
      id: 'personal-tasks',
      label: t('sidebar.personal_tasks'),
      desc: isAr ? 'قائمة مهامك اليومية وجدول المذاكرة الخاص بك' : 'Daily checklist tasks and personalized study schedules',
      icon: <CheckSquare className="size-5" />,
      path: '/student/personal-tasks',
      badge: totalPendingTasks > 0 ? `${totalPendingTasks} ${isAr ? 'معلقة' : 'Pending'}` : null
    },
    {
      id: 'settings',
      label: t('sidebar.settings'),
      desc: isAr ? 'تعديل الملف الشخصي والمظهر وخيارات الحساب' : 'Edit profile details, UI themes and account options',
      icon: <Settings className="size-5" />,
      path: '/student/settings',
      badge: null
    },
  ];

  if (student && (student.role === 'assistant' || student.role === 'admin')) {
    menuItems.push({
      id: 'admin-panel',
      label: t('sidebar.admin_panel'),
      desc: isAr ? 'لوحة التحكم والتحليل وإدارة شؤون الطلاب' : 'Dashboard control center and student manager portal',
      icon: <ShieldCheck className="size-5" />,
      path: '/admin',
      badge: isAr ? 'إدارة' : 'Admin'
    });
  }

  // Set page direction
  const pageDirection = isAr ? 'rtl' : 'ltr';

  return (
    <div className="min-h-screen bg-background text-foreground font-sans" dir={pageDirection}>

      <Sidebar onLogout={handleLogout} />

      <main className="md:ps-72 min-h-screen flex flex-col pb-28 md:pb-10">
        <PageContainer>

          <PageHeader
            title={t('sidebar.menu')}
            description={isAr ? 'كل أدوات البوابة الأكاديمية في مكان واحد' : 'Every portal tool in one place'}
          />

          {/* Student Identity Card */}
          <SectionCard bodyClassName="p-5">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-start">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-xl font-semibold text-primary">
                  {student?.name ? student.name.charAt(0).toUpperCase() : <User className="size-6" />}
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <h2 className={cn('text-lg font-semibold tracking-tight text-foreground', isAr && 'font-arabic')}>
                      {student?.name}
                    </h2>
                    <StatusBadge variant="success">
                      {isAr ? 'طالب نشط' : 'Active Student'}
                    </StatusBadge>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground sm:justify-start">
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="size-4 text-muted-foreground" />
                      {student?.department_name || student?.department_code || (isAr ? 'القسم العام' : 'General Department')}
                    </span>
                    <span className="hidden size-1 rounded-full bg-border sm:inline-block" />
                    <span className="flex items-center gap-1.5">
                      <Layers className="size-4 text-muted-foreground" />
                      {isAr ? `المستوى ${student?.level || 1}` : `Level ${student?.level || 1}`}
                    </span>
                    <span className="hidden size-1 rounded-full bg-border sm:inline-block" />
                    <span className="flex items-center gap-1.5">
                      <Users className="size-4 text-muted-foreground" />
                      {isAr ? `شعبة ${student?.section || '—'}` : `Section ${student?.section || '—'}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 rounded-lg border bg-muted/40 px-4 py-2.5 text-center sm:text-end">
                <p className="text-xs text-muted-foreground">
                  {isAr ? 'كود الطالب' : 'Student ID'}
                </p>
                <p className="mt-0.5 text-base font-semibold tracking-wide text-foreground">
                  {student?.id}
                </p>
              </div>
            </div>
          </SectionCard>

          {/* Menu navigation grid */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {menuItems.map((item, idx) => (
              <motion.button
                key={item.id}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.04 }}
                onClick={() => navigate(item.path)}
                className="group flex flex-col gap-4 rounded-xl border bg-card p-4 text-start transition-colors hover:border-primary/30 hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted text-muted-foreground transition-colors group-hover:border-primary/20 group-hover:bg-primary/10 group-hover:text-primary">
                    {item.icon}
                  </span>
                  {item.badge && (
                    <StatusBadge variant="neutral">{item.badge}</StatusBadge>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className={cn('text-sm font-semibold text-foreground', isAr && 'font-arabic')}>
                    {item.label}
                  </h3>
                  <p className={cn('text-xs leading-relaxed text-muted-foreground', isAr && 'font-arabic')}>
                    {item.desc}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors group-hover:text-primary">
                  <span>{isAr ? 'انتقال الآن' : 'Go Now'}</span>
                  <ArrowRight className={cn('size-3.5', isAr && 'rotate-180')} />
                </div>
              </motion.button>
            ))}
          </div>

          {/* Quick Actions & Preferences */}
          <SectionCard
            title={isAr ? 'تفضيلات سريعة' : 'Quick preferences'}
            bodyClassName="p-3"
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={toggleLanguage}
                className="group flex items-center justify-between gap-3 rounded-lg border bg-card p-3 text-start transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground transition-colors group-hover:border-primary/20 group-hover:bg-primary/10 group-hover:text-primary">
                    <Languages className="size-4" />
                  </span>
                  <div>
                    <p className={cn('text-xs text-muted-foreground', isAr && 'font-arabic')}>{isAr ? 'اللغة' : 'Language'}</p>
                    <p className="text-sm font-medium text-foreground">{isAr ? 'English' : 'العربية'}</p>
                  </div>
                </div>
                <ArrowRight className={cn('size-4 text-muted-foreground transition-colors group-hover:text-foreground', isAr && 'rotate-180')} />
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                className="group flex items-center justify-between gap-3 rounded-lg border bg-card p-3 text-start transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground transition-colors group-hover:border-primary/20 group-hover:bg-primary/10 group-hover:text-primary">
                    {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
                  </span>
                  <div>
                    <p className={cn('text-xs text-muted-foreground', isAr && 'font-arabic')}>{isAr ? 'المظهر' : 'Theme'}</p>
                    <p className="text-sm font-medium text-foreground">
                      {theme === 'dark' ? (isAr ? 'الوضع المضيء' : 'Light Mode') : (isAr ? 'الوضع المظلم' : 'Dark Mode')}
                    </p>
                  </div>
                </div>
                <ArrowRight className={cn('size-4 text-muted-foreground transition-colors group-hover:text-foreground', isAr && 'rotate-180')} />
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="group flex items-center justify-between gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-start transition-colors hover:bg-destructive/10"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-destructive/20 bg-destructive/10 text-destructive">
                    <LogOut className="size-4" />
                  </span>
                  <div>
                    <p className={cn('text-xs text-destructive/70', isAr && 'font-arabic')}>{isAr ? 'تسجيل الخروج' : 'Account'}</p>
                    <p className="text-sm font-medium text-destructive">{t('sidebar.logout')}</p>
                  </div>
                </div>
                <ArrowRight className={cn('size-4 text-destructive', isAr && 'rotate-180')} />
              </button>
            </div>
          </SectionCard>

        </PageContainer>
      </main>

    </div>
  );
};

export default StudentMenu;
