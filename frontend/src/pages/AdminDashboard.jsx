import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Lazy load admin components
const CoursesManager = lazy(() => import('../components/admin/CoursesManager'));
const GradesUploader = lazy(() => import('../components/admin/GradesUploader'));
const ResourceManager = lazy(() => import('../components/admin/ResourceManager'));
const RoadmapManager = lazy(() => import('../components/admin/RoadmapManager'));
const StudentsManager = lazy(() => import('../components/admin/StudentsManager'));
const StudentCoursesGradesManager = lazy(() => import('../components/admin/StudentCoursesGradesManager'));
const TimetableManager = lazy(() => import('../components/admin/TimetableManager'));
const NotificationsManager = lazy(() => import('../components/admin/NotificationsManager'));
const DepartmentManager = lazy(() => import('../components/admin/DepartmentManager'));
const QuizManager = lazy(() => import('../components/admin/QuizManager'));
const DoctorManager = lazy(() => import('../components/admin/DoctorManager'));
const PendingReviews = lazy(() => import('../components/admin/quizzes/PendingReviews'));
const MobileAlertCenter = lazy(() => import('../components/admin/MobileAlertCenter'));
const EventsManager = lazy(() => import('../components/admin/EventsManager'));
const ProgressManager = lazy(() => import('../components/admin/ProgressManager'));
const LogsDashboard = lazy(() => import('../components/admin/LogsDashboard'));
const LinkedEmailsManager = lazy(() => import('../components/admin/LinkedEmailsManager'));
const ExamScheduleManager = lazy(() => import('../components/admin/ExamScheduleManager'));
const OfficialTaskManager = lazy(() => import('../components/admin/OfficialTaskManager'));

import {
  Users, BookOpen, FileText, Map as RoadmapIcon,
  Calendar, Bell, LayoutDashboard, Settings,
  CheckCircle, Database, LogOut, Lock, UserCheck,
  TrendingUp, Award, Activity, ShieldCheck, ChevronRight,
  Smartphone, Heart, ScrollText, Mail, ClipboardList, Sun, Moon, CheckSquare, Menu, X,
  Terminal, Shield, Zap, Loader2
} from 'lucide-react';

import AdminSidebar from '../components/admin/AdminSidebar';
import { PageHeader, StatCard, SectionCard, LoadingState } from '@/components/common';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const AdminDashboard = () => {
  const { t, i18n } = useTranslation();
  const { token, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/admin/login', { replace: true });
    }
  }, [token, navigate]);

  const parseJwt = (t) => {
    try {
      return JSON.parse(atob(t.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const decodedToken = token ? parseJwt(token) : null;
  const isSuperAdmin = decodedToken?.role === 'admin';
  const userPermissions = decodedToken?.permissions || [];

  const ALL_TABS = [
    { id: 'overview', label: t('admin.sidebar.tabs.overview'), icon: <LayoutDashboard className="w-4 h-4" />, reqPerm: 'admin' },
    { id: 'courses', label: t('admin.sidebar.tabs.courses'), icon: <BookOpen className="w-4 h-4" />, reqPerm: 'manage_courses' },
    { id: 'grades', label: t('admin.sidebar.tabs.grades'), icon: <TrendingUp className="w-4 h-4" />, reqPerm: 'manage_grades' },
    { id: 'resources', label: t('admin.sidebar.tabs.resources'), icon: <FileText className="w-4 h-4" />, reqPerm: 'manage_resources' },
    { id: 'roadmap', label: t('admin.sidebar.tabs.roadmap'), icon: <RoadmapIcon className="w-4 h-4" />, reqPerm: 'manage_roadmap' },
    { id: 'doctors', label: t('admin.sidebar.tabs.doctors'), icon: <UserCheck className="w-4 h-4" />, reqPerm: 'admin' },
    { id: 'students', label: t('admin.sidebar.tabs.students'), icon: <Users className="w-4 h-4" />, reqPerm: 'admin' },
    { id: 'records', label: t('admin.sidebar.tabs.records'), icon: <Database className="w-4 h-4" />, reqPerm: 'admin' },
    { id: 'timetable', label: t('admin.sidebar.tabs.timetable'), icon: <Calendar className="w-4 h-4" />, reqPerm: 'manage_timetable' },
    { id: 'exams', label: t('admin.sidebar.tabs.exams'), icon: <ClipboardList className="w-4 h-4" />, reqPerm: 'manage_timetable' },
    { id: 'notifications', label: t('admin.sidebar.tabs.notifications'), icon: <Bell className="w-4 h-4" />, reqPerm: 'manage_notifications' },
    { id: 'mobile_center', label: t('admin.sidebar.tabs.mobile_center'), icon: <Smartphone className="w-4 h-4" />, reqPerm: 'manage_notifications' },
    { id: 'departments', label: t('admin.sidebar.tabs.departments'), icon: <LayoutDashboard className="w-4 h-4" />, reqPerm: 'admin' },
    { id: 'quizzes', label: t('admin.sidebar.tabs.quizzes'), icon: <Award className="w-4 h-4" />, reqPerm: 'manage_quizzes' },
    { id: 'reviews', label: t('admin.sidebar.tabs.reviews'), icon: <CheckCircle className="w-4 h-4" />, reqPerm: 'manage_quizzes' },
    { id: 'events', label: t('admin.sidebar.tabs.events'), icon: <Heart className="w-4 h-4" />, reqPerm: 'manage_events' },
    { id: 'progress', label: t('admin.sidebar.tabs.progress'), icon: <Activity className="w-4 h-4" />, reqPerm: 'admin' },
    { id: 'tasks', label: t('admin.sidebar.tabs.tasks'), icon: <CheckSquare className="w-4 h-4" />, reqPerm: 'manage_courses' },
    { id: 'emails', label: t('admin.sidebar.tabs.emails'), icon: <Mail className="w-4 h-4" />, reqPerm: 'admin' },
    { id: 'logs', label: t('admin.sidebar.tabs.logs'), icon: <ScrollText className="w-4 h-4" />, reqPerm: 'admin' },
  ];

  const initialTab = () => {
    if (isSuperAdmin) return 'overview';
    const firstAvailable = ALL_TABS.find(tab => tab.reqPerm !== 'admin' && userPermissions.includes(tab.reqPerm));
    return firstAvailable ? firstAvailable.id : 'overview';
  };

  const [activeTab, setActiveTabState] = useState(initialTab());
  const [direction, setDirection] = useState(0);

  const handleTabChange = (newTab) => {
    if (newTab === activeTab) return;
    const oldIndex = ALL_TABS.findIndex(t => t.id === activeTab);
    const newIndex = ALL_TABS.findIndex(t => t.id === newTab);
    setDirection(newIndex > oldIndex ? 1 : -1);
    setActiveTabState(newTab);
  };
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [sending, setSending] = useState(false);
  const [notificationForm, setNotificationForm] = useState({ title: '', content: '', studentId: '', doctorId: '', department_id: '' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [editNotifForm, setEditNotifForm] = useState({ title: '', content: '', is_read: false });
  const [studentsFile, setStudentsFile] = useState(null);
  const [transitioning, setTransitioning] = useState(false);

  const handleUpgradeSemester = async () => {
    const isAr = i18n.language === 'ar';
    const confirmMessage = isAr
      ? 'تحذير هام جداً!\n\nهل أنت متأكد من ترقية الفصل الدراسي؟ هذا الإجراء سيقوم بـ:\n1. أرشفة جميع المواد الحالية للطلاب كـ "مواد مكتملة".\n2. مسح الجدول الدراسي وجدول الامتحانات الحالي.\n3. ترقية مستوى (ليفل) الطلاب في حال الانتقال لسنة دراسية جديدة (ترم فردي).\n4. فتح التسجيل للطلاب يدوياً للترم الجديد.\n\nهذا الإجراء غير قابل للتراجع. هل تريد الاستمرار؟'
      : 'CRITICAL WARNING!\n\nAre you sure you want to upgrade the semester? This will:\n1. Archive all active student courses as completed.\n2. Delete current timetable and exam schedules.\n3. Upgrade student levels if transitioning to a new academic year.\n4. Students must register manually for the new semester.\n\nThis action cannot be undone. Do you wish to proceed?';

    if (!window.confirm(confirmMessage)) return;

    setTransitioning(true);
    try {
      await api.post('/admin/upgrade-semester');
      toast.success(isAr ? 'تم ترقية الفصل الدراسي بنجاح!' : 'Semester upgraded successfully!');
      fetchStudents();
      fetchCourses();
      fetchDepartments();
      fetchNotifications();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.message;
      toast.error((isAr ? 'فشلت عملية الترقية: ' : 'Upgrade failed: ') + msg);
    } finally {
      setTransitioning(false);
    }
  };

  // Lazy fetch: only load data needed for the active tab
  useEffect(() => {
    if (!token) return;
    // Departments are needed across multiple tabs — always fetch
    fetchDepartments();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    if (activeTab === 'students' || activeTab === 'records') fetchStudents();
    if (activeTab === 'grades' || activeTab === 'courses' || activeTab === 'records' || activeTab === 'quizzes') fetchCourses();
    if (activeTab === 'notifications' || activeTab === 'mobile_center') fetchNotifications();
    if (activeTab === 'overview') { fetchStudents(); fetchCourses(); }
  }, [token, activeTab]);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/admin/students');
      setStudents(res.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/admin/all');
      setNotifications(res.data);
    } catch (error) {
      console.error(t('common.error'), error);
    }
  };

  const handleUpdateNotification = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/notifications/admin/update/${editingNotification.id}`, editNotifForm);
      toast.success(t('common.success'));
      setShowEditModal(false);
      fetchNotifications();
    } catch (error) {
      toast.error(t('admin.messages.update_notif_failed'));
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!window.confirm(t('admin.messages.delete_notif_confirm'))) return;
    try {
      await api.delete(`/notifications/admin/delete/${id}`);
      toast.success(t('common.success'));
      fetchNotifications();
    } catch (error) {
      toast.error(t('admin.messages.delete_notif_failed'));
    }
  };

  const handleResetPassword = async (id) => {
    if (!window.confirm(t('admin.messages.reset_pass_confirm'))) return;
    try {
      await api.post(`/admin/reset-password/${id}`);
      toast.success(t('common.success'));
    } catch (error) {
      toast.error(t('admin.messages.reset_pass_failed'));
    }
  };

  const handleDeleteStudent = async (id, name) => {
    if (!window.confirm(t('admin.messages.delete_student_confirm', { name }))) return;
    try {
      await api.delete(`/admin/students/${id}`);
      toast.success(t('common.success'));
      fetchStudents();
    } catch (error) {
      toast.error(t('admin.messages.delete_student_failed'));
    }
  };

  const handleEditStudentInfo = async (id, studentData) => {
    try {
      await api.put(`/admin/students/${id}`, studentData);
      toast.success(t('common.success'));
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.messages.operation_failed'));
      throw error;
    }
  };

  const handleManageRole = async (id, role, permissions = []) => {
    try {
      await api.put(`/admin/students/${id}/role`, { role, permissions });
      toast.success(t('common.success'));
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.messages.operation_failed'));
      throw error;
    }
  };

  const handleAddStudent = async (studentData) => {
    await api.post('/admin/students', studentData);
    fetchStudents();
  };

  if (!token) return null;

  const isAr = i18n.language === 'ar';

  const overviewStats = [
    { label: t('admin.stats.system_load'), value: '12%', icon: Activity },
    { label: t('admin.stats.active_users'), value: students.length + 42, icon: Users, accent: true },
    { label: t('admin.stats.database'), value: t('admin.stats.syncing'), icon: Database },
    { label: t('admin.stats.protocol'), value: 'v4.0.2', icon: Shield },
  ];

  const quickStats = [
    { label: t('admin.sidebar.tabs.students'), value: students.length, icon: Users },
    { label: t('admin.sidebar.tabs.courses'), value: courses.length, icon: BookOpen },
    { label: t('admin.sidebar.tabs.departments'), value: departments.length, icon: LayoutDashboard },
    { label: t('admin.sidebar.tabs.notifications'), value: notifications.length, icon: Bell },
  ];

  const overviewContent = (
    <div className="space-y-6">
      <PageHeader
        icon={LayoutDashboard}
        title={t('admin.overview.control_tower')}
        description={t('admin.overview.central_node')}
      />

      {/* Stat grid — green accent on the active-users key metric */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            accent={stat.accent}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick access */}
        <SectionCard
          className="lg:col-span-2"
          title={t('admin.overview.control_tower')}
          description={t('admin.overview.central_node')}
          bodyClassName="p-2"
        >
          <div className="space-y-0.5">
            {ALL_TABS.slice(1, 5).map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className="group/item w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              >
                <span className="flex items-center gap-3 min-w-0">
                  <span className="shrink-0 text-muted-foreground group-hover/item:text-foreground">
                    {React.cloneElement(tab.icon, { className: 'size-4' })}
                  </span>
                  <span className={cn('truncate font-medium text-foreground', isAr && 'font-arabic')}>{tab.label}</span>
                </span>
                <ChevronRight className={cn('size-4 shrink-0 text-muted-foreground/60 transition-opacity opacity-0 group-hover/item:opacity-100', isAr && 'rotate-180')} />
              </button>
            ))}
          </div>
        </SectionCard>

        {/* Quick stats */}
        <SectionCard title={t('quizzes.quick_stats')} bodyClassName="p-2">
          <div className="space-y-0.5">
            {quickStats.map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-md text-sm"
              >
                <span className="flex items-center gap-3 min-w-0 text-muted-foreground">
                  <s.icon className="size-4 shrink-0" />
                  <span className={cn('truncate', isAr && 'font-arabic')}>{s.label}</span>
                </span>
                <span className="font-semibold text-foreground tabular-nums">{s.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Semester upgrade */}
      <SectionCard
        title={isAr ? 'ترقية الفصل الدراسي' : 'Upgrade Semester'}
        actions={
          <Button
            onClick={handleUpgradeSemester}
            disabled={transitioning}
          >
            {transitioning ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>{isAr ? 'جاري الترقية...' : 'Upgrading...'}</span>
              </>
            ) : (
              <>
                <Zap className="size-4" />
                <span>{isAr ? 'ترقية الترم الدراسي' : 'Upgrade Semester'}</span>
              </>
            )}
          </Button>
        }
      >
        <p className={cn('text-sm text-muted-foreground max-w-3xl', isAr && 'font-arabic')}>
          {isAr
            ? 'عند الترقية، سيتم زيادة رقم الفصل الدراسي بمقدار ١، ونقل تسجيلات الطلاب الحالية إلى الأرشيف كـ (مواد منتهية). سيتم أيضاً مسح الجدول الدراسي وجدول الامتحانات الحاليين ليقوم الطلاب بالتسجيل يدوياً للترم الجديد. إذا انتقل الترم للفصل الدراسي التالي (فردي)، فسيتم ترقية ليفل الطلاب تلقائياً.'
            : 'Upgrading the semester will increment the active semester, archive currently registered student courses as completed, and clear the timetable/exam schedule. Students will manually enroll for the new semester. If moving to an odd semester, students level will be promoted.'}
        </p>
      </SectionCard>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'courses': return <Suspense fallback={<LoadingState label={t('common.loading')} />}><CoursesManager departments={departments} refreshCourses={fetchCourses} /></Suspense>;
      case 'grades': return <Suspense fallback={<LoadingState label={t('common.loading')} />}><GradesUploader courses={courses} departments={departments} /></Suspense>;
      case 'resources': return <Suspense fallback={<LoadingState label={t('common.loading')} />}><ResourceManager /></Suspense>;
      case 'roadmap': return <Suspense fallback={<LoadingState label={t('common.loading')} />}><RoadmapManager /></Suspense>;
      case 'doctors': return <Suspense fallback={<LoadingState label={t('common.loading')} />}><DoctorManager /></Suspense>;
      case 'students': return (
        <Suspense fallback={<LoadingState label={t('common.loading')} />}>
          <StudentsManager
            students={students}
            fetchStudents={fetchStudents}
            departments={departments}
            onAddStudent={handleAddStudent}
            handleResetPassword={handleResetPassword}
            handleDeleteStudent={handleDeleteStudent}
            handleEditStudentInfo={handleEditStudentInfo}
            handleManageRole={handleManageRole}
            studentsFile={studentsFile}
            setStudentsFile={setStudentsFile}
          />
        </Suspense>
      );
      case 'records': return <Suspense fallback={<LoadingState label={t('common.loading')} />}><StudentCoursesGradesManager students={students} refreshStudents={fetchStudents} /></Suspense>;
      case 'timetable': return <Suspense fallback={<LoadingState label={t('common.loading')} />}><TimetableManager /></Suspense>;
      case 'notifications': return (
        <Suspense fallback={<LoadingState label={t('common.loading')} />}>
          <NotificationsManager
            notifications={notifications}
            fetchNotifications={fetchNotifications}
            sending={sending}
            setSending={setSending}
            notificationForm={notificationForm}
            setNotificationForm={setNotificationForm}
            handleUpdateNotification={handleUpdateNotification}
            handleDeleteNotification={handleDeleteNotification}
            showEditModal={showEditModal}
            setShowEditModal={setShowEditModal}
            editingNotification={editingNotification}
            setEditingNotification={setEditingNotification}
            editNotifForm={editNotifForm}
            setEditNotifForm={setEditNotifForm}
            departments={departments}
          />
        </Suspense>
      );
      case 'mobile_center': return (
        <Suspense fallback={<LoadingState label={t('common.loading')} />}>
          <MobileAlertCenter
            notifications={notifications}
            fetchNotifications={fetchNotifications}
            sending={sending}
            setSending={setSending}
            departments={departments}
          />
        </Suspense>
      );
      case 'departments': return <Suspense fallback={<LoadingState label={t('common.loading')} />}><DepartmentManager /></Suspense>;
      case 'quizzes': return <Suspense fallback={<LoadingState label={t('common.loading')} />}><QuizManager courses={courses} /></Suspense>;
      case 'reviews': return <Suspense fallback={<LoadingState label={t('common.loading')} />}><PendingReviews /></Suspense>;
      case 'events': return <Suspense fallback={<LoadingState label={t('common.loading')} />}><EventsManager /></Suspense>;
      case 'progress': return <Suspense fallback={<LoadingState label={t('common.loading')} />}><ProgressManager /></Suspense>;
      case 'tasks': return <Suspense fallback={<LoadingState label={t('common.loading')} />}><OfficialTaskManager /></Suspense>;
      case 'emails': return <Suspense fallback={<LoadingState label={t('common.loading')} />}><LinkedEmailsManager /></Suspense>;
      case 'logs': return <Suspense fallback={<LoadingState label={t('common.loading')} />}><LogsDashboard /></Suspense>;
      case 'exams': return <Suspense fallback={<LoadingState label={t('common.loading')} />}><ExamScheduleManager /></Suspense>;
      default: return overviewContent;
    }
  };

  const availableTabs = ALL_TABS.filter(tab => isSuperAdmin || (tab.reqPerm !== 'admin' && userPermissions.includes(tab.reqPerm)));

  return (
    <div className="min-h-screen bg-background font-sans" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <AdminSidebar activeTab={activeTab} setActiveTab={handleTabChange} onLogout={logout} admin={decodedToken} availableTabs={availableTabs} />

      <div className="lg:ps-[22rem] min-h-screen">
        <main className="pb-12 overflow-x-hidden">
          <div
            key={activeTab}
            className={`flex-1 lg:ps-8 flex flex-col min-w-0 relative w-full ${direction === 0 ? 'animate-fadeIn' : (direction === 1 ? (i18n.language === 'ar' ? 'animate-slideInLeft' : 'animate-slideInRight') : (i18n.language === 'ar' ? 'animate-slideInRight' : 'animate-slideInLeft'))}`}
          >
            <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
              {activeTab === 'overview' ? overviewContent : renderTabContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;