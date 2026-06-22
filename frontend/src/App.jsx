import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// components
import PortalSwitcher from './components/PortalSwitcher';
import PullToRefresh from './components/PullToRefresh';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedStudentRoute from './components/ProtectedStudentRoute';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StudentAuthProvider, useStudentAuth } from './context/StudentAuthContext';
import { StudentDataContextProvider } from './context/StudentDataContext';
import { DoctorAuthProvider } from './context/DoctorAuthContext';
import { TAAuthProvider } from './context/TAAuthContext';
import AdminDashboard from './pages/AdminDashboard';
import StudentLogin from './pages/StudentLogin';
import StudentDashboard from './pages/StudentDashboard';
import StudentCourseHub from './pages/StudentCourseHub';
import StudentTimetable from './pages/StudentTimetable';
import StudentGrades from './pages/StudentGrades';
import StudentRoadmap from './pages/StudentRoadmap';
import StudentMaterials from './pages/StudentMaterials';
import StudentNotifications from './pages/StudentNotifications';
import StudentSettings from './pages/StudentSettings';
import StudentPersonalTasks from './pages/StudentPersonalTasks';
import StudentAttendance from './pages/StudentAttendance';
import StudentCourseRegistration from './pages/StudentCourseRegistration';
import StudentMenu from './pages/StudentMenu';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import LandingPage from './pages/LandingPage';
import ProgramsPage from './pages/ProgramsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ProgramDetailsPage from './pages/ProgramDetailsPage';

// ✅ استيراد صفحات الاختبارات
import StudentQuizzes from './pages/StudentQuizzes';
import QuizPage from './pages/QuizPage';
import QuizResultPage from './pages/QuizResultPage';

// ✅ مسارات الدكتور
import DoctorLogin from './pages/DoctorLogin';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminLogin from './pages/AdminLogin';

// ✅ مساعد Zag AI
import ZagAIChat from './pages/ZagAIChat';

// ✅ TA Portal
import TALogin from './pages/TALogin';
import TADashboard from './pages/TADashboard';

// مكون إعادة توجيه الطالب المسجل دخوله
const StudentLoginRedirect = () => {
  const { token, loading } = useStudentAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && token) {
      navigate('/student/dashboard', { replace: true });
    }
  }, [token, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#010101]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-white/5 animate-pulse" />
          <div className="h-3 w-32 mx-auto bg-white/5 animate-pulse rounded" />
        </div>
      </div>
    );
  }
  return <StudentLogin />;
};

// المكون الرئيسي للتطبيق (بعد تحميل حالة المصادقة)
function AppContent() {
  const { token: adminToken } = useAuth();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { isDarkMode } = useTheme();

  const [direction, setDirection] = useState(0);
  const prevPathRef = React.useRef(location.pathname);

  // Define the logical order of tabs for Student
  const STUDENT_TABS_ORDER = [
    '/student/dashboard',
    '/student/timetable',
    '/student/course',
    '/student/registration',
    '/student/quizzes',
    '/student/grades',
    '/student/roadmap',
    '/student/materials',
    '/student/personal-tasks',
    '/student/notifications',
    '/student/settings',
    '/student/menu'
  ];

  useEffect(() => {
    // Only animate direction for student routes
    if (location.pathname.startsWith('/student/') && prevPathRef.current.startsWith('/student/')) {
      const getIndex = (path) => STUDENT_TABS_ORDER.findIndex(base => path.startsWith(base));
      const oldIndex = getIndex(prevPathRef.current);
      const newIndex = getIndex(location.pathname);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        setDirection(newIndex > oldIndex ? 1 : -1);
      } else {
        setDirection(0); // Default fade
      }
    } else {
      setDirection(0);
    }
    prevPathRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  // Show the portal switcher on login/entry pages only, but hide it if admin is logged in on /admin
  const showSwitcher = [
    '/student/login',
    '/doctor/login',
    '/ta/login',
    '/admin/login',
    '/admin',
  ].some((p) => location.pathname === p || location.pathname.startsWith(p)) && !(location.pathname.startsWith('/admin') && adminToken);

  return (
    <div className={`min-h-screen overflow-x-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#010101]' : 'bg-[#fafafa]'}`}>
      {showSwitcher && <PortalSwitcher />}
      <div
        key={location.pathname}
        className="min-h-screen w-full relative"
      >
        <ErrorBoundary>
          <Routes location={location}>
            <Route path="/" element={<Navigate to="/student/login" replace />} />
            <Route path="/programs" element={<ProgramsPage />} />
            <Route path="/programs/:id" element={<ProgramDetailsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/doctor/login" element={<DoctorLogin />} />
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/ta/login" element={<TALogin />} />
            <Route path="/ta/dashboard" element={<TADashboard />} />
            <Route path="/student/login" element={<StudentLoginRedirect />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/student/dashboard" element={<ProtectedStudentRoute><StudentDashboard /></ProtectedStudentRoute>} />
            <Route path="/student/course/:courseId" element={<ProtectedStudentRoute><StudentCourseHub /></ProtectedStudentRoute>} />
            <Route path="/student/registration" element={<ProtectedStudentRoute><StudentCourseRegistration /></ProtectedStudentRoute>} />
            <Route path="/student/grades" element={<ProtectedStudentRoute><StudentGrades /></ProtectedStudentRoute>} />
            <Route path="/student/quizzes" element={<ProtectedStudentRoute><StudentQuizzes /></ProtectedStudentRoute>} />
            <Route path="/student/timetable" element={<ProtectedStudentRoute><StudentTimetable /></ProtectedStudentRoute>} />
            <Route path="/student/roadmap" element={<ProtectedStudentRoute><StudentRoadmap /></ProtectedStudentRoute>} />
            <Route path="/student/materials" element={<ProtectedStudentRoute><StudentMaterials /></ProtectedStudentRoute>} />
            <Route path="/student/notifications" element={<ProtectedStudentRoute><StudentNotifications /></ProtectedStudentRoute>} />
            <Route path="/student/settings" element={<ProtectedStudentRoute><StudentSettings /></ProtectedStudentRoute>} />
            <Route path="/student/personal-tasks" element={<ProtectedStudentRoute><StudentPersonalTasks /></ProtectedStudentRoute>} />
            <Route path="/student/attendance" element={<ProtectedStudentRoute><StudentAttendance /></ProtectedStudentRoute>} />
            <Route path="/student/menu" element={<ProtectedStudentRoute><StudentMenu /></ProtectedStudentRoute>} />
            <Route path="/student/ai" element={<ProtectedStudentRoute><ZagAIChat /></ProtectedStudentRoute>} />

            {/* ✅ مسارات الاختبارات */}
            <Route path="/student/quizzes/:quizId/take" element={<ProtectedStudentRoute><QuizPage /></ProtectedStudentRoute>} />
            <Route path="/student/quizzes/:quizId/result/:attemptId" element={<ProtectedStudentRoute><QuizResultPage /></ProtectedStudentRoute>} />

            {/* مسار وهمي لتفادي تحذيرات React Router عند تفعيل مدير كلمات المرور في iOS */}
            <Route path="/student/login-dummy" element={null} />
          </Routes>
        </ErrorBoundary>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StudentAuthProvider>
          <StudentDataContextProvider>
            <DoctorAuthProvider>
              <TAAuthProvider>
                <Router>
                  <PullToRefresh>
                    <AppContent />
                  </PullToRefresh>
                  <Toaster position="bottom-right" />
                </Router>
              </TAAuthProvider>
            </DoctorAuthProvider>
          </StudentDataContextProvider>
        </StudentAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;