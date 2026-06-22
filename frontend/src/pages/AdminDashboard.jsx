import React, { useState, useEffect, lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
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

const MobileAlertCenter = lazy(() => import('../components/admin/MobileAlertCenter'));
const EventsManager = lazy(() => import('../components/admin/EventsManager'));
const ProgressManager = lazy(() => import('../components/admin/ProgressManager'));
const LogsDashboard = lazy(() => import('../components/admin/LogsDashboard'));
const LinkedEmailsManager = lazy(() => import('../components/admin/LinkedEmailsManager'));
const ExamScheduleManager = lazy(() => import('../components/admin/ExamScheduleManager'));
const OfficialTaskManager = lazy(() => import('../components/admin/OfficialTaskManager'));
const TeachingAssistantManager = lazy(() => import('../components/admin/TeachingAssistantManager'));

import {
  Users, BookOpen, FileText, Map as RoadmapIcon,
  Calendar, Bell, LayoutDashboard, Settings,
  CheckCircle, Database, LogOut, Lock, UserCheck,
  TrendingUp, Award, Activity, ShieldCheck, ChevronRight,
  Smartphone, Heart, ScrollText, Mail, ClipboardList, Sun, Moon, CheckSquare, Menu, X,
  Terminal, Shield, Zap, Loader2
} from 'lucide-react';

import AdminSidebar from '../components/admin/AdminSidebar';

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
    { id: 'assistants', label: t('admin.sidebar.tabs.assistants'), icon: <Users className="w-4 h-4" />, reqPerm: 'admin' },
    { id: 'students', label: t('admin.sidebar.tabs.students'), icon: <Users className="w-4 h-4" />, reqPerm: 'admin' },
    { id: 'records', label: t('admin.sidebar.tabs.records'), icon: <Database className="w-4 h-4" />, reqPerm: 'admin' },
    { id: 'timetable', label: t('admin.sidebar.tabs.timetable'), icon: <Calendar className="w-4 h-4" />, reqPerm: 'manage_timetable' },
    { id: 'exams', label: t('admin.sidebar.tabs.exams'), icon: <ClipboardList className="w-4 h-4" />, reqPerm: 'manage_timetable' },
    { id: 'notifications', label: t('admin.sidebar.tabs.notifications'), icon: <Bell className="w-4 h-4" />, reqPerm: 'manage_notifications' },
    { id: 'mobile_center', label: t('admin.sidebar.tabs.mobile_center'), icon: <Smartphone className="w-4 h-4" />, reqPerm: 'manage_notifications' },
    { id: 'departments', label: t('admin.sidebar.tabs.departments'), icon: <LayoutDashboard className="w-4 h-4" />, reqPerm: 'admin' },
    { id: 'quizzes', label: t('admin.sidebar.tabs.quizzes'), icon: <Award className="w-4 h-4" />, reqPerm: 'manage_quizzes' },

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
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [verifyingPassword, setVerifyingPassword] = useState(false);

  const handleUpgradeSemester = async () => {
    setTransitioning(true);
    try {
      await api.post('/admin/upgrade-semester');
      toast.success(t('admin.dashboard.upgrade_success'));
      fetchStudents();
      fetchCourses();
      fetchDepartments();
      fetchNotifications();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.message;
      toast.error(t('admin.dashboard.upgrade_failed') + msg);
    } finally {
      setTransitioning(false);
    }
  };

  const handleUpgradeClick = () => {
    setPasswordInput('');
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;

    setVerifyingPassword(true);
    try {
      await api.post('/admin/login', {
        username: 'admin',
        password: passwordInput
      });
      setShowPasswordModal(false);
      setPasswordInput('');
      const confirmMessage = t('admin.dashboard.upgrade_warning');
      if (!window.confirm(confirmMessage)) return;
      await handleUpgradeSemester();
    } catch (error) {
      toast.error(t('admin.dashboard.root_password_required'));
    } finally {
      setVerifyingPassword(false);
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
    if (activeTab === 'grades' || activeTab === 'courses' || activeTab === 'records') fetchCourses();
    if (activeTab === 'notifications' || activeTab === 'mobile_center') fetchNotifications();
    if (activeTab === 'overview') { fetchStudents(); fetchCourses(); }
  }, [token, activeTab]);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/admin/students');
      setStudents(res.data?.data ?? res.data);
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
      await api.put(`/notifications/admin/${editingNotification.id}`, editNotifForm);
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
      await api.delete(`/notifications/admin/${id}`);
      toast.success(t('common.success'));
      fetchNotifications();
    } catch (error) {
      toast.error(t('admin.messages.delete_notif_failed'));
    }
  };

  const handleResetPassword = async (id) => {
    if (!window.confirm(t('admin.messages.reset_pass_confirm'))) return;
    try {
      await api.put(`/admin/students/${id}/reset-password`);
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'courses': return <Suspense fallback={<div className="p-10 text-gray-400">{t('common.loading')}</div>}><CoursesManager departments={departments} refreshCourses={fetchCourses} /></Suspense>;
      case 'grades': return <Suspense fallback={<div className="p-10 text-gray-400">{t('common.loading')}</div>}><GradesUploader courses={courses} departments={departments} /></Suspense>;
      case 'resources': return <Suspense fallback={<div className="p-10 text-gray-400">{t('common.loading')}</div>}><ResourceManager /></Suspense>;
      case 'roadmap': return <Suspense fallback={<div className="p-10 text-gray-400">{t('common.loading')}</div>}><RoadmapManager /></Suspense>;
      case 'doctors': return <Suspense fallback={<div className="p-10 text-gray-400">{t('common.loading')}</div>}><DoctorManager /></Suspense>;
      case 'assistants': return <Suspense fallback={<div className="p-10 text-gray-400">{t('common.loading')}</div>}><TeachingAssistantManager /></Suspense>;
      case 'students': return (
        <Suspense fallback={<div className="p-10 text-gray-400">{t('common.loading')}</div>}>
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
      case 'records': return <Suspense fallback={<div className="p-10 text-gray-400">{t('common.loading')}</div>}><StudentCoursesGradesManager students={students} refreshStudents={fetchStudents} /></Suspense>;
      case 'timetable': return <Suspense fallback={<div className="p-10 text-gray-400">{t('common.loading')}</div>}><TimetableManager /></Suspense>;
      case 'notifications': return (
        <Suspense fallback={<div className="p-10 text-gray-400">{t('common.loading')}</div>}>
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
        <Suspense fallback={<div className="p-10 text-gray-400">{t('common.loading')}</div>}>
          <MobileAlertCenter
            notifications={notifications}
            fetchNotifications={fetchNotifications}
            sending={sending}
            setSending={setSending}
            departments={departments}
          />
        </Suspense>
      );
      case 'departments': return <Suspense fallback={<div className="p-10 text-gray-400">{t('common.loading')}</div>}><DepartmentManager /></Suspense>;
      case 'quizzes': return <Suspense fallback={<div className="p-10 text-gray-400">{t('common.loading')}</div>}><QuizManager /></Suspense>;

      case 'events': return <Suspense fallback={<div className="p-10 text-gray-400">{t('common.loading')}</div>}><EventsManager /></Suspense>;
      case 'progress': return <Suspense fallback={<div className="p-10 text-gray-400">{t('common.loading')}</div>}><ProgressManager /></Suspense>;
      case 'tasks': return <Suspense fallback={<div className="p-10 text-gray-400">{t('common.loading')}</div>}><OfficialTaskManager /></Suspense>;
      case 'emails': return <Suspense fallback={<div className="p-10 text-gray-400">{t('common.loading')}</div>}><LinkedEmailsManager /></Suspense>;
      case 'logs': return <Suspense fallback={<div className="p-10 text-gray-400">{t('common.loading')}</div>}><LogsDashboard /></Suspense>;
      case 'exams': return <Suspense fallback={<div className="p-10 text-gray-400">{t('common.loading')}</div>}><ExamScheduleManager /></Suspense>;
      default: return (
        <div className="p-6 lg:p-10 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: t('admin.stats.system_load'), value: '12%', icon: Activity },
              { label: t('admin.stats.active_users'), value: students.length + 42, icon: Users },
              { label: t('admin.stats.database'), value: t('admin.stats.syncing'), icon: Database },
              { label: t('admin.stats.protocol'), value: 'v4.0.2', icon: Shield },
            ].map((stat, i) => (
              <div
                key={stat.label || i}
                className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <stat.icon className="w-5 h-5 text-[#059669]" />
                  <p className="text-xs text-gray-400">{stat.label}</p>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#080808] border border-gray-100 dark:border-white/5 rounded-xl p-5">
              <h4 className="text-lg font-semibold mb-1">{t('admin.overview.control_tower')}</h4>
              <p className="text-xs text-gray-400 mb-4">{t('admin.overview.central_node')}</p>
              <div className="space-y-1">
                {ALL_TABS.slice(1, 5).map(tab => (
                  <button key={tab.id} onClick={() => handleTabChange(tab.id)} className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 hover:border-[#059669]/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">{tab.icon}</span>
                      <span className="text-xs text-gray-600 dark:text-gray-300">{tab.label}</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-gray-300 rtl:rotate-180" />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-[#080808] border border-gray-100 dark:border-white/5 rounded-xl p-5">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{t('quizzes.quick_stats')}</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-lg p-4">
                  <p className="text-[10px] text-gray-400 mb-1">{t('admin.sidebar.tabs.students')}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{students.length}</p>
                </div>
                <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-lg p-4">
                  <p className="text-[10px] text-gray-400 mb-1">{t('admin.sidebar.tabs.courses')}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{courses.length}</p>
                </div>
                <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-lg p-4">
                  <p className="text-[10px] text-gray-400 mb-1">{t('admin.sidebar.tabs.departments')}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{departments.length}</p>
                </div>
                <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-lg p-4">
                  <p className="text-[10px] text-gray-400 mb-1">{t('admin.sidebar.tabs.notifications')}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{notifications.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  const availableTabs = ALL_TABS.filter(tab => isSuperAdmin || (tab.reqPerm !== 'admin' && userPermissions.includes(tab.reqPerm)));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c14]" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <AdminSidebar activeTab={activeTab} setActiveTab={handleTabChange} onLogout={logout} admin={decodedToken} availableTabs={availableTabs} />

      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none" />

      <div className="lg:ps-[22rem] min-h-screen relative z-10">
        <main className="pt-8 lg:pt-12 pb-12 overflow-x-hidden">
          <div
            key={activeTab}
            className="flex-1 lg:ps-8 flex flex-col min-w-0 relative w-full"
          >
            {activeTab === 'overview' ? (
              <div className="p-6 lg:p-10 space-y-8 max-w-[1500px] mx-auto w-full">
                {/* Hero */}
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t('admin.overview.control_tower')}
                  </h1>
                  <p className="text-sm text-gray-400">{t('admin.overview.central_node')}</p>
                </div>

                {/* Bento Grid Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: t('admin.stats.system_load'), value: '12%', icon: Activity },
                    { label: t('admin.stats.active_users'), value: students.length + 42, icon: Users },
                    { label: t('admin.stats.database'), value: t('admin.stats.syncing'), icon: Database },
                    { label: t('admin.stats.protocol'), value: 'v4.0.2', icon: Shield },
                  ].map((stat, i) => (
                    <div
                      key={stat.label || i}
                      className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-xl p-5 space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <stat.icon className="w-5 h-5 text-[#059669]" />
                        <p className="text-xs text-gray-400">{stat.label}</p>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Quick Access Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-8 bg-[#059669] rounded-xl p-6 text-white flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">{t('admin.sidebar.tabs.students')}</h3>
                      <p className="text-sm text-white/70 mt-1">{t('admin.overview.central_node')}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-4xl font-bold">{students.length}</span>
                      <button
                        onClick={() => handleTabChange('students')}
                        className="w-10 h-10 bg-white text-[#059669] rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <ChevronRight className={`w-5 h-5 ${i18n.language === 'ar' ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-4 bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-xl p-5">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{t('quizzes.quick_stats')}</h4>
                    <div className="space-y-2">
                      {[
                        { label: t('admin.sidebar.tabs.courses'), value: courses.length, icon: BookOpen },
                        { label: t('admin.sidebar.tabs.departments'), value: departments.length, icon: LayoutDashboard },
                        { label: t('admin.sidebar.tabs.notifications'), value: notifications.length, icon: Bell },
                      ].map((s, i) => (
                        <div key={s.label || i} className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-2">
                            <s.icon className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-500">{s.label}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Upgrade Semester */}
                <div className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-xl p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <h4 className="text-lg font-semibold">
                        {t('admin.dashboard.upgrade_btn')}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl">
                        {t('admin.dashboard.upgrade_desc')}
                      </p>
                    </div>
                    
                    <button
                      onClick={handleUpgradeClick}
                      disabled={transitioning}
                      className="px-6 py-3 bg-[#059669] hover:bg-[#047857] text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:pointer-events-none shrink-0"
                    >
                      {transitioning ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{t('admin.dashboard.upgrading')}</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          <span>{t('admin.dashboard.upgrade_btn')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : renderTabContent()}
          </div>
        </main>
      </div>
      {showPasswordModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            onClick={() => setShowPasswordModal(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div
            className="bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-white/5 rounded-xl p-6 w-full max-w-md relative z-10"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-white/5">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('admin.dashboard.upgrade_btn')}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {t('admin.dashboard.root_password_required')}
                </p>
              </div>
              <button onClick={() => setShowPasswordModal(false)} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  {t('admin.dashboard.password_label')}
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#059669]/30"
                  placeholder="••••••••"
                  autoFocus
                  required
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                <button
                  type="submit"
                  disabled={verifyingPassword}
                  className="flex-1 bg-[#059669] hover:bg-[#047857] text-white font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {verifyingPassword ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>{t('admin.dashboard.verify_upgrade')}</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-6 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-medium py-2.5 rounded-lg text-sm transition-colors"
                >
                  {t('admin.dashboard.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminDashboard;