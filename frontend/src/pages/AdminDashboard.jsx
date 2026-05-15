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
  Terminal, Shield
} from 'lucide-react';

import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';

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
    // { id: 'grades', label: t('admin.sidebar.tabs.grades'), icon: <TrendingUp className="w-4 h-4" />, reqPerm: 'manage_grades' },
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

  const handleEditStudentInfo = (student) => {
    toast.info(t('admin.messages.edit_requested'));
  };

  const handleManageRole = (student) => {
    toast.info(t('admin.messages.role_requested'));
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
      case 'reviews': return <Suspense fallback={<div className="p-10 text-gray-400">{t('common.loading')}</div>}><PendingReviews /></Suspense>;
      case 'events': return <Suspense fallback={<div className="p-10 text-gray-400">{t('common.loading')}</div>}><EventsManager /></Suspense>;
      case 'progress': return <Suspense fallback={<div className="p-10 text-gray-400">{t('common.loading')}</div>}><ProgressManager /></Suspense>;
      case 'tasks': return <Suspense fallback={<div className="p-10 text-gray-400">{t('common.loading')}</div>}><OfficialTaskManager /></Suspense>;
      case 'emails': return <Suspense fallback={<div className="p-10 text-gray-400">{t('common.loading')}</div>}><LinkedEmailsManager /></Suspense>;
      case 'logs': return <Suspense fallback={<div className="p-10 text-gray-400">{t('common.loading')}</div>}><LogsDashboard /></Suspense>;
      case 'exams': return <Suspense fallback={<div className="p-10 text-gray-400">{t('common.loading')}</div>}><ExamScheduleManager /></Suspense>;
      default: return (
        <div className="p-6 lg:p-10 space-y-8 lg:space-y-12 relative z-10 animate-in fade-in duration-500">
          {/* Bento Grid Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8">
            {[
              { label: t('admin.stats.system_load'), value: '12%', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { label: t('admin.stats.active_users'), value: students.length + 42, icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              { label: t('admin.stats.database'), value: t('admin.stats.syncing'), icon: Database, color: 'text-amber-500', bg: 'bg-amber-500/10' },
              { label: t('admin.stats.protocol'), value: 'v4.0.2', icon: Shield, color: 'text-rose-500', bg: 'bg-rose-500/10' },
            ].map((stat, i) => (
              <div
                key={i}
                style={{ animationDelay: `${i * 60}ms` }}
                className="group relative bg-white/80 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden fade-in-up">
                <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6 relative z-10 group-hover:scale-105 transition-transform duration-200 will-change-transform`}>
                  <stat.icon className="w-5 lg:w-6 h-5 lg:h-6" />
                </div>
                <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <p className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
            <div className="bg-white dark:bg-[#080808] border border-gray-100 dark:border-white/5 rounded-[3rem] lg:rounded-[3.5rem] p-8 lg:p-12 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 inset-inline-end-0 w-64 h-64 bg-emerald-500/5 hidden rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-1000" />
              <h4 className="text-2xl font-black mb-2 uppercase tracking-tight relative z-10">{t('admin.overview.control_tower')}</h4>
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-10 relative z-10">{t('admin.overview.central_node')}</p>
              <div className="space-y-3 relative z-10">
                {ALL_TABS.slice(1, 5).map(tab => (
                  <button key={tab.id} onClick={() => handleTabChange(tab.id)} className="w-full flex items-center justify-between p-5 lg:p-6 rounded-[2rem] bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 hover:border-emerald-500/30 transition-[border-color,background-color] duration-200 group/item">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover/item:text-emerald-500 transition-colors duration-200 shadow-sm">
                        {tab.icon}
                      </div>
                      <span className="font-black text-xs uppercase tracking-widest text-gray-600 dark:text-gray-300">{tab.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover/item:translate-x-1 transition-all rtl:rotate-180" />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-[#080808] border border-gray-100 dark:border-white/5 rounded-[3rem] lg:rounded-[3.5rem] p-8 lg:p-12 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 inset-inline-end-0 w-64 h-64 bg-blue-500/5 hidden rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700 will-change-transform" />

              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 transition-transform duration-200 group-hover:scale-105 will-change-transform">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-2xl font-black uppercase tracking-tight">{t('quizzes.quick_stats')}</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('admin.overview.terminal_hint')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-3xl p-6 hover:border-blue-500/20 transition-all">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('admin.sidebar.tabs.students')}</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{students.length}</p>
                </div>
                <div className="bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-3xl p-6 hover:border-emerald-500/20 transition-all">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('admin.sidebar.tabs.courses')}</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{courses.length}</p>
                </div>
                <div className="bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-3xl p-6 hover:border-amber-500/20 transition-all">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('admin.sidebar.tabs.departments')}</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{departments.length}</p>
                </div>
                <div className="bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-3xl p-6 hover:border-rose-500/20 transition-all">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('admin.sidebar.tabs.notifications')}</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{notifications.length}</p>
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
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-500 font-sans relative overflow-hidden" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <AdminSidebar activeTab={activeTab} setActiveTab={handleTabChange} onLogout={logout} admin={decodedToken} availableTabs={availableTabs} />

      <div className="lg:ps-[22rem] min-h-screen">
        <AdminHeader admin={decodedToken} setActiveTab={handleTabChange} hasNotificationsAccess={userPermissions.includes('manage_notifications')} />
        <main className="pt-24 pb-12 overflow-x-hidden">
          <div
            key={activeTab}
            className={`flex-1 lg:ps-8 flex flex-col min-w-0 relative w-full ${direction === 0 ? 'animate-fadeIn' : (direction === 1 ? (i18n.language === 'ar' ? 'animate-slideInLeft' : 'animate-slideInRight') : (i18n.language === 'ar' ? 'animate-slideInRight' : 'animate-slideInLeft'))}`}
          >
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;