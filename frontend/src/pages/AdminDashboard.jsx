import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
// Lazy load admin components for performance
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
  Smartphone, Heart, ScrollText, Mail, ClipboardList, Sun, Moon, CheckSquare, Menu, X
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const AdminDashboard = () => {
  const { token, login, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const parseJwt = (t) => {
    try {
      return JSON.parse(atob(t.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  const decodedToken = token ? parseJwt(token) : null;
  const isSuperAdmin = decodedToken?.role === 'admin';
  const userPermissions = decodedToken?.permissions || [];

  const ALL_TABS = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" />, reqPerm: 'admin' },
    { id: 'courses', label: 'Courses', icon: <BookOpen className="w-4 h-4" />, reqPerm: 'manage_courses' },
    { id: 'grades', label: 'Grades', icon: <TrendingUp className="w-4 h-4" />, reqPerm: 'manage_grades' },
    { id: 'resources', label: 'Resources', icon: <FileText className="w-4 h-4" />, reqPerm: 'manage_resources' },
    { id: 'roadmap', label: 'Roadmap', icon: <RoadmapIcon className="w-4 h-4" />, reqPerm: 'manage_roadmap' },
    { id: 'doctors', label: 'Doctors', icon: <UserCheck className="w-4 h-4" />, reqPerm: 'admin' },
    { id: 'students', label: 'Students', icon: <Users className="w-4 h-4" />, reqPerm: 'admin' },
    { id: 'student-courses', label: 'Records', icon: <Database className="w-4 h-4" />, reqPerm: 'admin' },
    { id: 'timetable', label: 'Timetable', icon: <Calendar className="w-4 h-4" />, reqPerm: 'manage_timetable' },
    { id: 'exams', label: 'Exams', icon: <ClipboardList className="w-4 h-4" />, reqPerm: 'manage_timetable' },
    { id: 'notifications', label: 'Alerts', icon: <Bell className="w-4 h-4" />, reqPerm: 'manage_notifications' },
    { id: 'mobile-center', label: 'Mobile Center', icon: <Smartphone className="w-4 h-4" />, reqPerm: 'manage_notifications' },
    { id: 'departments', label: 'Units', icon: <LayoutDashboard className="w-4 h-4" />, reqPerm: 'admin' },
    { id: 'quizzes', label: 'Quizzes', icon: <Award className="w-4 h-4" />, reqPerm: 'manage_quizzes' },
    { id: 'reviews', label: 'Reviews', icon: <CheckCircle className="w-4 h-4" />, reqPerm: 'manage_quizzes' },
    { id: 'events', label: 'University', icon: <Heart className="w-4 h-4" />, reqPerm: 'manage_events' },
    { id: 'progress', label: 'Progress', icon: <CheckCircle className="w-4 h-4" />, reqPerm: 'manage_progress' },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-4 h-4" />, reqPerm: 'manage_courses' },
    { id: 'emails', label: 'Emails', icon: <Mail className="w-4 h-4" />, reqPerm: 'admin' },
    { id: 'logs', label: 'Logs', icon: <ScrollText className="w-4 h-4" />, reqPerm: 'admin' },
  ];

  const initialTab = () => {
    if (isSuperAdmin) return 'overview';
    const firstAvailable = ALL_TABS.find(tab => tab.reqPerm !== 'admin' && userPermissions.includes(tab.reqPerm));
    return firstAvailable ? firstAvailable.id : 'overview';
  };

  const [activeTab, setActiveTab] = useState(initialTab());
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialDataLoading, setInitialDataLoading] = useState(false);
  const [studentsFile, setStudentsFile] = useState(null);
  const [uploadingStudents, setUploadingStudents] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState({ username: '', password: '' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Timetable states
  const [timetableFile, setTimetableFile] = useState(null);
  const [uploadingTimetable, setUploadingTimetable] = useState(false);
  const [allTimetables, setAllTimetables] = useState([]);
  const [selectedTimetableDept, setSelectedTimetableDept] = useState('');
  const [editingEntry, setEditingEntry] = useState(null);
  const [editEntryForm, setEditEntryForm] = useState({
    section: '',
    day_of_week: '',
    start_time: '',
    end_time: '',
    course_name: '',
    location: '',
    instructor: '',
    type: '',
    is_quiz: false,
    is_hidden: false,
    department_id: ''
  });
  const [showEditEntryModal, setShowEditEntryModal] = useState(false);

  // Notifications states
  const [notifications, setNotifications] = useState([]);
  const [sending, setSending] = useState(false);
  const [notificationForm, setNotificationForm] = useState({ studentId: '', title: '', content: '' });
  const [editingNotification, setEditingNotification] = useState(null);
  const [editNotifForm, setEditNotifForm] = useState({ title: '', content: '', is_read: false });
  const [showEditModal, setShowEditModal] = useState(false);

  // Student management states (for student-courses tab)
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentCourses, setStudentCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [studentGrades, setStudentGrades] = useState([]);
  const [stats, setStats] = useState({ courses: 0, students: 0, departments: 0, unread_notifications: 0 });
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [selectedCourseToAdd, setSelectedCourseToAdd] = useState('');
  const [editingGrade, setEditingGrade] = useState(null);
  const [editGradeForm, setEditGradeForm] = useState({ examType: 'midterm', score: '', status: 'completed' });
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [editStudentForm, setEditStudentForm] = useState({ name: '', level: '', section: '', department_id: '' });

  // Role & Permissions states
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedStudentForRole, setSelectedStudentForRole] = useState(null);
  const [roleForm, setRoleForm] = useState({ role: 'student', permissions: [] });

  // ------------------- Fetch Data -------------------
  useEffect(() => {
    if (!token) return;
    api.get('/admin/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error("Stats error", err));
      
    // Fetch lookup tables in background without blocking UI
    fetchCourses();
    fetchDepartments();
  }, [token]);

  useEffect(() => {
    if (activeTab === 'notifications') fetchNotifications();
    if (activeTab === 'students' || activeTab === 'student-courses') fetchStudents();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'timetable') {
      fetchTimetableByDepartment(selectedTimetableDept);
    }
  }, [selectedTimetableDept, activeTab]);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data);
    } catch (error) {
      toast.error('Error loading courses');
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/admin/students');
      setStudents(res.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchTimetableByDepartment = async (deptId) => {
    try {
      const url = deptId ? `/timetable/admin/all?department_id=${deptId}` : '/timetable/admin/all';
      const res = await api.get(url);
      setAllTimetables(res.data);
    } catch (error) {
      console.error('Error fetching timetables:', error);
    }
  };

  const fetchAllTimetables = () => fetchTimetableByDepartment(selectedTimetableDept);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/admin/all');
      setNotifications(res.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
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

  // Student management functions
  const fetchStudentCourses = async (studentId) => {
    try {
      const res = await api.get(`/admin/students/${studentId}/courses`);
      setStudentCourses(res.data);
    } catch (error) {
      toast.error('Failed to load student courses');
    }
  };

  const fetchAvailableCourses = async (studentId) => {
    try {
      const res = await api.get(`/admin/students/${studentId}/available-courses`);
      setAvailableCourses(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStudentGrades = async (studentId) => {
    try {
      const res = await api.get(`/grades/student/${studentId}`);
      setStudentGrades(res.data.grades || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectStudent = (studentId) => {
    const student = students.find(s => s.id === studentId);
    setSelectedStudent(student);
    if (student) {
      fetchStudentCourses(student.id);
      fetchAvailableCourses(student.id);
      fetchStudentGrades(student.id);
    }
  };

  const handleResetPassword = async (studentId) => {
    const newPassword = prompt('Enter new password for student (min 4 characters):');
    if (!newPassword || newPassword.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }
    try {
      await api.put(`/admin/students/${studentId}/reset-password`, { newPassword });
      toast.success(`Password for ${studentId} reset successfully`);
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    }
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to delete student "${studentName}" (${studentId})? This action cannot be undone.`)) return;
    try {
      await api.delete(`/admin/students/${studentId}`);
      toast.success(`Student ${studentId} deleted`);
      fetchStudents();
      if (selectedStudent?.id === studentId) setSelectedStudent(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete student');
    }
  };

  const handleEditStudentInfo = (student) => {
    setSelectedStudent(student);
    setEditStudentForm({
      name: student.name,
      level: student.level,
      section: student.section || '',
      department_id: student.department_id || ''
    });
    setShowEditStudentModal(true);
  };

  const handleUpdateStudentInfo = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: editStudentForm.name,
        level: editStudentForm.level,
        section: editStudentForm.section,
        department_id: editStudentForm.department_id || null
      };
      await api.put(`/admin/students/${selectedStudent.id}`, payload);
      toast.success('Student information updated');
      setShowEditStudentModal(false);
      fetchStudents();
      setSelectedStudent({ ...selectedStudent, ...editStudentForm });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const handleManageRole = (student) => {
    setSelectedStudentForRole(student);
    setRoleForm({
      role: student.role || 'student',
      permissions: student.permissions || []
    });
    setShowRoleModal(true);
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/students/${selectedStudentForRole.id}/role`, roleForm);
      toast.success('Role and permissions updated successfully');
      setShowRoleModal(false);
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role. Admin access required.');
    }
  };

  const handleAddStudent = async (studentData) => {
    const payload = {
      id: studentData.id,
      name: studentData.name,
      password: studentData.password || '123456',
      level: parseInt(studentData.level) || 1,
      section: studentData.section || null,
      department_id: studentData.department_id || null
    };
    await api.post('/admin/students', payload);
  };

  const handleAddCourseToStudent = async () => {
    if (!selectedCourseToAdd) return toast.error('Please select a course');
    try {
      await api.post(`/admin/students/${selectedStudent.id}/courses/${selectedCourseToAdd}`);
      toast.success('Course added successfully');
      setShowAddCourseModal(false);
      setSelectedCourseToAdd('');
      fetchStudentCourses(selectedStudent.id);
      fetchAvailableCourses(selectedStudent.id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add course');
    }
  };

  const handleRemoveCourseFromStudent = async (courseId, courseName) => {
    if (!window.confirm(`Remove "${courseName}" from student ${selectedStudent.name}? This will also delete all grades for this course.`)) return;
    try {
      await api.delete(`/admin/students/${selectedStudent.id}/courses/${courseId}`);
      toast.success('Course removed successfully');
      fetchStudentCourses(selectedStudent.id);
      fetchAvailableCourses(selectedStudent.id);
      fetchStudentGrades(selectedStudent.id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove course');
    }
  };

  const handleEditStudentGrade = (grade) => {
    setEditingGrade(grade);
    setEditGradeForm({
      examType: 'midterm',
      score: grade.midterm_score || '',
      status: grade.midterm_status || 'pending'
    });
    setShowGradeModal(true);
  };

  const handleUpdateStudentGrade = async (e) => {
    e.preventDefault();
    try {
      await api.put('/grades/admin/update-single', {
        studentId: selectedStudent.id,
        courseName: editingGrade.course_name,
        examType: editGradeForm.examType,
        score: editGradeForm.score ? parseFloat(editGradeForm.score) : null,
        status: editGradeForm.status
      });
      toast.success('Grade updated successfully');
      setShowGradeModal(false);
      fetchStudentGrades(selectedStudent.id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  // Timetable functions
  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setEditEntryForm({
      section: entry.section,
      day_of_week: entry.day_of_week,
      start_time: entry.start_time?.substring(0, 5) || '',
      end_time: entry.end_time?.substring(0, 5) || '',
      course_name: entry.course_name,
      location: entry.location || '',
      instructor: entry.instructor || '',
      type: entry.type || 'Lecture',
      is_quiz: entry.is_quiz || false,
      is_hidden: entry.is_hidden || false,
      department_id: entry.department_id || ''
    });
    setShowEditEntryModal(true);
  };

  const handleUpdateEntry = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/timetable/admin/${editingEntry.id}`, editEntryForm);
      toast.success('Entry updated');
      setShowEditEntryModal(false);
      fetchAllTimetables();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Delete this timetable entry?')) return;
    try {
      await api.delete(`/timetable/admin/${id}`);
      toast.success('Entry deleted');
      fetchAllTimetables();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handleDeleteSection = async (section, departmentId) => {
    if (!window.confirm(`Delete entire timetable for Section ${section} in this department?`)) return;
    try {
      await api.delete(`/timetable/admin/section/${section}?department_id=${departmentId}`);
      toast.success(`Section ${section} timetable deleted`);
      fetchTimetableByDepartment(selectedTimetableDept);
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  // Notifications functions
  const handleUpdateNotification = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/notifications/admin/${editingNotification.id}`, editNotifForm);
      toast.success('Notification updated');
      setShowEditModal(false);
      fetchNotifications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
      await api.delete(`/notifications/admin/${id}`);
      toast.success('Notification deleted');
      fetchNotifications();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  // Admin Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/admin/login', loginCredentials);
      login(res.data.token);
      toast.success('Login successful');
    } catch (error) {
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-[#050505] relative overflow-hidden transition-colors duration-300">

        <div className="w-full max-w-md bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-10 shadow-xl dark:shadow-2xl animate-fadeInUp relative z-10">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20 dark:border-emerald-500/30">
              <ShieldCheck className="w-10 h-10 text-emerald-500 dark:text-emerald-400" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center mb-2 tracking-tight">Admin Portal</h2>
          <p className="text-gray-500 dark:text-slate-400 text-center mb-8 text-sm uppercase tracking-widest font-medium">Secure Access Node</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-gray-700 dark:text-slate-300 ml-4 text-xs font-bold uppercase tracking-widest">Username</label>
              <div className="relative">
                <LayoutDashboard className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={loginCredentials.username}
                  onChange={(e) => setLoginCredentials({ ...loginCredentials, username: e.target.value })}
                  className="w-full bg-gray-100 dark:bg-slate-900/50 border border-gray-200 dark:border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:border-emerald-500/50 focus:outline-none transition-all"
                  placeholder="Admin identifier"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-gray-700 dark:text-slate-300 ml-4 text-xs font-bold uppercase tracking-widest">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 dark:text-slate-500" />
                <input
                  type="password"
                  value={loginCredentials.password}
                  onChange={(e) => setLoginCredentials({ ...loginCredentials, password: e.target.value })}
                  className="w-full bg-gray-100 dark:bg-slate-900/50 border border-gray-200 dark:border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:border-emerald-500/50 focus:outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 text-white dark:text-black font-bold py-4 rounded-2xl transition-all hover:scale-[1.02] hover:shadow-[0_10px_20px_rgba(16,185,129,0.2)] dark:hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100 mt-4 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white dark:border-black/20 border-t-transparent dark:border-t-black rounded-full animate-spin" />
              ) : (
                <>Sign In <ChevronRight className="w-5 h-5" /></>
              )}
            </button>
          </form>
          <div className="mt-6 flex justify-center">
            <button onClick={toggleTheme} className="p-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-emerald-500 transition-all">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-slate-100 transition-colors duration-300">

      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-[#0a0a0a] border-b border-gray-200/60 dark:border-white/5">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo & Admin Info */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-black tracking-tight text-gray-900 dark:text-white">Admin Portal</h1>
                <p className="text-xs text-gray-500 dark:text-slate-500 font-medium -mt-0.5">
                  {isSuperAdmin ? 'Root Admin' : 'Assistant Node'}
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-0.5 bg-gray-100/80 dark:bg-white/[0.03] p-1 rounded-xl border border-gray-200/50 dark:border-white/5 overflow-x-auto no-scrollbar max-w-[50vw]">
              {ALL_TABS.map(tab => {
                const hasAccess = isSuperAdmin || (tab.reqPerm !== 'admin' && userPermissions.includes(tab.reqPerm));
                if (!hasAccess) return null;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    title={tab.label}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <span className={isActive ? 'text-emerald-500' : ''}>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:text-emerald-500 transition-all"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={logout}
                className="hidden sm:flex items-center gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 text-gray-600 dark:text-gray-400"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200/50 dark:border-white/5 bg-white dark:bg-[#0a0a0a] pb-4 px-4 max-h-[60vh] overflow-y-auto">
            <div className="pt-3 space-y-1">
              {ALL_TABS.map(tab => {
                const hasAccess = isSuperAdmin || (tab.reqPerm !== 'admin' && userPermissions.includes(tab.reqPerm));
                if (!hasAccess) return null;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <div className="max-w-[1600px] mx-auto p-4 md:p-8 relative z-10">


        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-xl rounded-3xl p-6 md:p-10 min-h-[600px] relative">

          
          {activeTab === 'overview' && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Overview</h2>
                <p className="text-gray-500 dark:text-slate-400 font-medium text-sm">Key metrics and system status</p>
              </div>
              <div className="grid gap-6 md:grid-cols-4 animate-fadeIn">
                <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 p-6 rounded-[2rem] hover:border-emerald-500/30 transition-all duration-500 group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500/20 transition-all">
                      <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-300/70 transition-all">Courses</p>
                  </div>
                  <div className="flex items-end justify-between">
                    <p className="text-4xl font-black text-gray-900 dark:text-white">{stats.courses}</p>
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-lg">
                      <Activity className="w-3 h-3" /> LIVE
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 p-6 rounded-[2rem] hover:border-blue-500/30 transition-all duration-500 group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:bg-blue-500/20 transition-all">
                      <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-300/70 transition-all">Students</p>
                  </div>
                  <div className="flex items-end justify-between">
                    <p className="text-4xl font-black text-gray-900 dark:text-white">{stats.students}</p>
                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-bold bg-blue-500/10 px-2 py-1 rounded-lg">
                      <CheckCircle className="w-3 h-3" /> SECURE
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 p-6 rounded-[2rem] hover:border-purple-500/30 transition-all duration-500 group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center group-hover:bg-purple-500/20 transition-all">
                      <LayoutDashboard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500 group-hover:text-purple-600 dark:group-hover:text-purple-300/70 transition-all">Departments</p>
                  </div>
                  <div className="flex items-end justify-between">
                    <p className="text-4xl font-black text-gray-900 dark:text-white">{stats.departments}</p>
                    <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 text-xs font-bold bg-purple-500/10 px-2 py-1 rounded-lg">
                      <Award className="w-3 h-3" /> STABLE
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 p-6 rounded-[2rem] hover:border-red-500/30 transition-all duration-500 group relative overflow-hidden">
                  {stats.unread_notifications > 0 && (
                    <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                  )}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center group-hover:bg-red-500/20 transition-all">
                      <Bell className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500 group-hover:text-red-600 dark:group-hover:text-red-300/70 transition-all">Alerts</p>
                  </div>
                  <div className="flex items-end justify-between">
                    <p className="text-4xl font-black text-gray-900 dark:text-white">{stats.unread_notifications}</p>
                    <button
                      onClick={() => {
                        const hasAccess = isSuperAdmin || userPermissions.includes('manage_materials');
                        if (hasAccess) {
                          setActiveTab('notifications');
                        } else {
                          toast.error('You do not have permission to access this module');
                        }
                      }}
                      className="text-xs font-black text-white dark:text-black bg-red-500 dark:bg-red-400 hover:bg-red-600 dark:hover:bg-red-300 px-3 py-1.5 rounded-xl transition-all active:scale-95 shadow-sm dark:shadow-[0_0_15px_rgba(248,113,113,0.3)]"
                    >
                      VIEW ALL
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div></div>}>
          {activeTab === 'courses' && <CoursesManager departments={departments} />}
          {activeTab === 'grades' && <GradesUploader courses={courses} departments={departments} />}
          {activeTab === 'resources' && <ResourceManager />}
          {activeTab === 'roadmap' && <RoadmapManager />}
          {activeTab === 'doctors' && <DoctorManager />}
          {activeTab === 'students' && (
            <StudentsManager
              students={students}
              fetchStudents={fetchStudents}
              uploadingStudents={uploadingStudents}
              setUploadingStudents={setUploadingStudents}
              studentsFile={studentsFile}
              setStudentsFile={setStudentsFile}
              handleResetPassword={handleResetPassword}
              handleDeleteStudent={handleDeleteStudent}
              handleEditStudentInfo={handleEditStudentInfo}
              handleManageRole={handleManageRole}
              departments={departments}
              onAddStudent={handleAddStudent}
            />
          )}
          {activeTab === 'student-courses' && (
            <StudentCoursesGradesManager
              students={students}
              selectedStudent={selectedStudent}
              setSelectedStudent={setSelectedStudent}
              studentCourses={studentCourses}
              availableCourses={availableCourses}
              studentGrades={studentGrades}
              showAddCourseModal={showAddCourseModal}
              setShowAddCourseModal={setShowAddCourseModal}
              selectedCourseToAdd={selectedCourseToAdd}
              setSelectedCourseToAdd={setSelectedCourseToAdd}
              editingGrade={editingGrade}
              setEditingGrade={setEditingGrade}
              editGradeForm={editGradeForm}
              setEditGradeForm={setEditGradeForm}
              showGradeModal={showGradeModal}
              setShowGradeModal={setShowGradeModal}
              handleSelectStudent={handleSelectStudent}
              handleRemoveCourseFromStudent={handleRemoveCourseFromStudent}
              handleAddCourseToStudent={handleAddCourseToStudent}
              handleEditStudentGrade={handleEditStudentGrade}
              handleUpdateStudentGrade={handleUpdateStudentGrade}
            />
          )}
          {activeTab === 'timetable' && (
            <TimetableManager
              allTimetables={allTimetables}
              fetchAllTimetables={fetchAllTimetables}
              timetableFile={timetableFile}
              setTimetableFile={setTimetableFile}
              uploadingTimetable={uploadingTimetable}
              setUploadingTimetable={setUploadingTimetable}
              handleEditEntry={handleEditEntry}
              handleDeleteEntry={handleDeleteEntry}
              handleDeleteSection={handleDeleteSection}
              departments={departments}
              selectedDepartmentId={selectedTimetableDept}
              setSelectedDepartmentId={setSelectedTimetableDept}
              fetchTimetableByDepartment={fetchTimetableByDepartment}
            />
          )}
          {activeTab === 'exams' && <ExamScheduleManager departments={departments} selectedDepartmentId={selectedTimetableDept} />}
          {activeTab === 'notifications' && (
            <NotificationsManager
              notifications={notifications.filter(n => !n.is_mobile_only)}
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
          )}
          {activeTab === 'mobile-center' && (
            <MobileAlertCenter
              notifications={notifications}
              fetchNotifications={fetchNotifications}
              sending={sending}
              setSending={setSending}
              departments={departments}
            />
          )}
          {activeTab === 'departments' && <DepartmentManager />}
          {activeTab === 'quizzes' && <QuizManager courses={courses} />}
          {activeTab === 'reviews' && <PendingReviews />}
          {activeTab === 'events' && <EventsManager />}
          {activeTab === 'progress' && <ProgressManager courses={courses} />}
          {activeTab === 'tasks' && <OfficialTaskManager courses={courses} departments={departments} />}
          {activeTab === 'emails' && <LinkedEmailsManager />}
          {activeTab === 'logs' && <LogsDashboard />}
          </Suspense>
        </div>
      </div>

      {/* Edit Student Modal */}
      {showEditStudentModal && selectedStudent && (
        <div className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl relative overflow-hidden animate-fadeInUp transition-colors duration-300">


            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20 dark:border-emerald-500/30">
                  <UserCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Edit Student</h3>
                  <p className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">{selectedStudent.id}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateStudentInfo} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-gray-600 dark:text-slate-300 ml-4 text-[10px] font-bold uppercase tracking-widest">Full Name</label>
                  <input type="text" value={editStudentForm.name} onChange={(e) => setEditStudentForm({ ...editStudentForm, name: e.target.value })} className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-white/5 rounded-2xl px-6 py-3.5 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-gray-600 dark:text-slate-300 ml-4 text-[10px] font-bold uppercase tracking-widest">Level</label>
                    <input type="number" value={editStudentForm.level} onChange={(e) => setEditStudentForm({ ...editStudentForm, level: e.target.value })} className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-white/5 rounded-2xl px-6 py-3.5 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium" required />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-gray-600 dark:text-slate-300 ml-4 text-[10px] font-bold uppercase tracking-widest">Section</label>
                    <input type="text" value={editStudentForm.section} onChange={(e) => setEditStudentForm({ ...editStudentForm, section: e.target.value })} className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-white/5 rounded-2xl px-6 py-3.5 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-gray-600 dark:text-slate-300 ml-4 text-[10px] font-bold uppercase tracking-widest">Department</label>
                  <select
                    value={editStudentForm.department_id || ''}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, department_id: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-white/5 rounded-2xl px-6 py-3.5 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium appearance-none"
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 bg-emerald-500 text-white dark:text-black font-black py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-emerald-500/20">SAVE CHANGES</button>
                  <button type="button" onClick={() => setShowEditStudentModal(false)} className="px-8 py-4 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-600 dark:text-slate-300 font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-all">CANCEL</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Manage Role & Permissions Modal */}
      {showRoleModal && selectedStudentForRole && (
        <div className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl relative overflow-hidden animate-fadeInUp transition-colors duration-300">


            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-2xl flex items-center justify-center border border-yellow-500/20 dark:border-yellow-500/30">
                  <ShieldCheck className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Manage Roles</h3>
                  <p className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">{selectedStudentForRole.name}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateRole} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-gray-600 dark:text-slate-300 ml-4 text-[10px] font-bold uppercase tracking-widest">User Role</label>
                  <select
                    value={roleForm.role}
                    onChange={(e) => setRoleForm({ ...roleForm, role: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-white/5 rounded-2xl px-6 py-3.5 text-gray-900 dark:text-white focus:outline-none focus:border-yellow-500/50 transition-all font-medium appearance-none"
                  >
                    <option value="student">Student (Standard)</option>
                    <option value="assistant">Assistant (Limited Admin)</option>
                    <option value="admin">Admin (Full Access)</option>
                  </select>
                </div>

                {roleForm.role === 'assistant' && (
                  <div className="space-y-4 bg-gray-50 dark:bg-white/[0.02] p-5 rounded-2xl border border-gray-200 dark:border-white/5">
                    <label className="block text-gray-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-widest mb-2">Module Permissions</label>

                    {/* Select All / Deselect All */}
                    <div className="flex gap-2 mb-3">
                      <button type="button" onClick={() => setRoleForm({ ...roleForm, permissions: ['manage_courses', 'manage_grades', 'manage_resources', 'manage_roadmap', 'manage_timetable', 'manage_notifications', 'manage_quizzes', 'manage_events', 'manage_progress'] })}
                        className="text-[10px] font-bold px-3 py-1.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/20 rounded-lg hover:bg-yellow-500/20 transition-all">Select All</button>
                      <button type="button" onClick={() => setRoleForm({ ...roleForm, permissions: [] })}
                        className="text-[10px] font-bold px-3 py-1.5 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-all">Deselect All</button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { id: 'manage_courses', label: '📚 Courses', desc: 'Add/edit/delete courses' },
                        { id: 'manage_grades', label: '📊 Grades', desc: 'Upload & manage grades' },
                        { id: 'manage_quizzes', label: '🏆 Quizzes & Reviews', desc: 'Create quizzes & grade answers' },
                        { id: 'manage_resources', label: '📄 Resources', desc: 'Upload study materials' },
                        { id: 'manage_roadmap', label: '🗺️ Roadmap', desc: 'Manage career tracks' },
                        { id: 'manage_timetable', label: '📅 Timetable', desc: 'Upload & edit schedules' },
                        { id: 'manage_notifications', label: '🔔 Alerts & Mobile', desc: 'Send notifications' },
                        { id: 'manage_events', label: '🎓 University Events', desc: 'Manage events' },
                        { id: 'manage_progress', label: '✅ Progress', desc: 'Track course progress' },
                      ].map(perm => (
                        <label key={perm.id} htmlFor={perm.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${roleForm.permissions.includes(perm.id)
                              ? 'bg-yellow-500/10 border-yellow-500/30 shadow-sm'
                              : 'bg-white dark:bg-white/[0.02] border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/15'
                            }`}>
                          <input type="checkbox" id={perm.id}
                            checked={roleForm.permissions.includes(perm.id)}
                            onChange={(e) => {
                              const newPerms = e.target.checked
                                ? [...roleForm.permissions, perm.id]
                                : roleForm.permissions.filter(p => p !== perm.id);
                              setRoleForm({ ...roleForm, permissions: newPerms });
                            }}
                            className="w-4 h-4 rounded border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-slate-900 text-yellow-500 focus:ring-yellow-500/20 cursor-pointer flex-shrink-0" />
                          <div>
                            <p className="text-gray-900 dark:text-white text-sm font-bold">{perm.label}</p>
                            <p className="text-gray-500 dark:text-slate-500 text-[10px] font-medium">{perm.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 bg-yellow-500 text-white dark:text-black font-black py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-yellow-500/20 uppercase">Save Permissions</button>
                  <button type="button" onClick={() => setShowRoleModal(false)} className="px-8 py-4 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-600 dark:text-slate-300 font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-all uppercase">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Timetable Entry Modal */}
      {showEditEntryModal && editingEntry && (
        <div className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-10 w-full max-w-xl shadow-2xl relative overflow-hidden animate-fadeInUp transition-colors duration-300">


            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20 dark:border-emerald-500/30">
                  <Calendar className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Edit Timetable Entry</h3>
                  <p className="text-gray-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">{editingEntry.course_name}</p>
                </div>
              </div>

              <form onSubmit={handleUpdateEntry} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-gray-600 dark:text-slate-300 ml-4 text-[10px] font-bold uppercase tracking-widest">Section</label>
                    <input type="text" placeholder="Section" value={editEntryForm.section} onChange={(e) => setEditEntryForm({ ...editEntryForm, section: e.target.value })} className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-white/5 rounded-2xl px-6 py-3.5 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium" required />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-gray-600 dark:text-slate-300 ml-4 text-[10px] font-bold uppercase tracking-widest">Day</label>
                    <input type="text" placeholder="Day (e.g., Monday)" value={editEntryForm.day_of_week} onChange={(e) => setEditEntryForm({ ...editEntryForm, day_of_week: e.target.value })} className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-white/5 rounded-2xl px-6 py-3.5 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-gray-600 dark:text-slate-300 ml-4 text-[10px] font-bold uppercase tracking-widest">Start Time</label>
                    <input type="time" placeholder="Start Time" value={editEntryForm.start_time} onChange={(e) => setEditEntryForm({ ...editEntryForm, start_time: e.target.value })} className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-white/5 rounded-2xl px-6 py-3.5 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium" required />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-gray-600 dark:text-slate-300 ml-4 text-[10px] font-bold uppercase tracking-widest">End Time</label>
                    <input type="time" placeholder="End Time" value={editEntryForm.end_time} onChange={(e) => setEditEntryForm({ ...editEntryForm, end_time: e.target.value })} className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-white/5 rounded-2xl px-6 py-3.5 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-600 dark:text-slate-300 ml-4 text-[10px] font-bold uppercase tracking-widest">Course Name</label>
                  <input type="text" placeholder="Course Name" value={editEntryForm.course_name} onChange={(e) => setEditEntryForm({ ...editEntryForm, course_name: e.target.value })} className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-white/5 rounded-2xl px-6 py-3.5 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-gray-600 dark:text-slate-300 ml-4 text-[10px] font-bold uppercase tracking-widest">Location</label>
                    <input type="text" placeholder="Location" value={editEntryForm.location} onChange={(e) => setEditEntryForm({ ...editEntryForm, location: e.target.value })} className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-white/5 rounded-2xl px-6 py-3.5 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-gray-600 dark:text-slate-300 ml-4 text-[10px] font-bold uppercase tracking-widest">Instructor</label>
                    <input type="text" placeholder="Instructor" value={editEntryForm.instructor} onChange={(e) => setEditEntryForm({ ...editEntryForm, instructor: e.target.value })} className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-white/5 rounded-2xl px-6 py-3.5 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium" />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-6">
                  <div className="space-y-2 flex-1">
                    <label className="block text-gray-600 dark:text-slate-300 ml-4 text-[10px] font-bold uppercase tracking-widest">Session Type</label>
                    <select value={editEntryForm.type} onChange={(e) => setEditEntryForm({ ...editEntryForm, type: e.target.value })} className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-white/5 rounded-2xl px-6 py-3.5 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium appearance-none">
                      <option value="Lecture">Lecture</option>
                      <option value="Lab">Lab</option>
                      <option value="Tutorial">Tutorial</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-3 pt-6">
                    <input type="checkbox" id="isQuiz" checked={editEntryForm.is_quiz} onChange={(e) => setEditEntryForm({ ...editEntryForm, is_quiz: e.target.checked })} className="w-6 h-6 rounded-lg border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-slate-900 text-emerald-500 focus:ring-emerald-500/20 cursor-pointer" />
                    <label htmlFor="isQuiz" className="text-gray-700 dark:text-slate-300 font-bold text-sm cursor-pointer whitespace-nowrap">📝 Quiz Event?</label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 bg-emerald-500 text-white dark:text-black font-black py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-emerald-500/20 uppercase">Update Entry</button>
                  <button type="button" onClick={() => setShowEditEntryModal(false)} className="px-8 py-4 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-600 dark:text-slate-300 font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-all uppercase">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;