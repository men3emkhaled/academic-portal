import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import PullToRefresh from './components/PullToRefresh';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './context/AuthContext';
import { StudentAuthProvider, useStudentAuth } from './context/StudentAuthContext';
import { StudentDataContextProvider } from './context/StudentDataContext';
import { DoctorAuthProvider } from './context/DoctorAuthContext';
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
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';

// ✅ استيراد صفحات الاختبارات
import StudentQuizzes from './pages/StudentQuizzes';
import QuizPage from './pages/QuizPage';
import QuizResultPage from './pages/QuizResultPage';

// ✅ مسارات الدكتور
import DoctorLogin from './pages/DoctorLogin';
import DoctorDashboard from './pages/DoctorDashboard';

// مكون حماية المسارات للطلاب
const ProtectedStudentRoute = ({ children }) => {
  const { token, loading } = useStudentAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !token) {
      navigate('/student/login', { replace: true });
    }
  }, [token, loading, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-dark transition-colors duration-500 overflow-hidden relative">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative flex items-center justify-center w-20 h-20 mb-6">
            <div className="absolute inset-0 border-4 border-emerald-500/20 dark:border-emerald-500/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center animate-pulse">
                <span className="text-xl font-black text-emerald-500">Z</span>
            </div>
          </div>
          <p className="text-gray-900 dark:text-white font-black text-[10px] uppercase tracking-[0.4em] mb-1 animate-pulse">ZNU PORTAL</p>
          <p className="text-gray-500 dark:text-gray-400 font-bold text-xs tracking-wide">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  return token ? children : null;
};

// مكون إعادة توجيه الطالب المسجل دخوله
const StudentLoginRedirect = () => {
  const { token, loading } = useStudentAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && token) {
      navigate('/student/dashboard', { replace: true });
    }
  }, [token, loading, navigate]);

  if (loading) return null;
  return <StudentLogin />;
};

// المكون الرئيسي للتطبيق (بعد تحميل حالة المصادقة)
function AppContent() {
  const { loading } = useStudentAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-dark transition-colors duration-500 overflow-hidden relative">
        {/* Decorative Ambient Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative flex items-center justify-center w-24 h-24 mb-8">
            <div className="absolute inset-0 border-4 border-emerald-500/20 dark:border-emerald-500/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center animate-pulse">
                <span className="text-2xl font-black text-emerald-500">Z</span>
            </div>
          </div>
          <p className="text-gray-900 dark:text-white font-black text-xs uppercase tracking-[0.4em] mb-2 animate-pulse">ZNU PORTAL</p>
          <p className="text-gray-500 dark:text-gray-400 font-bold text-sm tracking-wide">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/student/login" replace />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/doctor/login" element={<DoctorLogin />} />
      <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
      <Route path="/student/login" element={<StudentLoginRedirect />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/student/dashboard" element={<ProtectedStudentRoute><StudentDashboard /></ProtectedStudentRoute>} />
      <Route path="/student/course/:courseId" element={<ProtectedStudentRoute><StudentCourseHub /></ProtectedStudentRoute>} />
      <Route path="/student/grades" element={<ProtectedStudentRoute><StudentGrades /></ProtectedStudentRoute>} />
      <Route path="/student/quizzes" element={<ProtectedStudentRoute><StudentQuizzes /></ProtectedStudentRoute>} />
      <Route path="/student/timetable" element={<ProtectedStudentRoute><StudentTimetable /></ProtectedStudentRoute>} />
      <Route path="/student/roadmap" element={<ProtectedStudentRoute><StudentRoadmap /></ProtectedStudentRoute>} />
      <Route path="/student/materials" element={<ProtectedStudentRoute><StudentMaterials /></ProtectedStudentRoute>} />
      <Route path="/student/notifications" element={<ProtectedStudentRoute><StudentNotifications /></ProtectedStudentRoute>} />
      <Route path="/student/settings" element={<ProtectedStudentRoute><StudentSettings /></ProtectedStudentRoute>} />
      <Route path="/student/personal-tasks" element={<ProtectedStudentRoute><StudentPersonalTasks /></ProtectedStudentRoute>} />

      {/* ✅ مسارات الاختبارات */}
      <Route path="/student/quizzes/:quizId/take" element={<ProtectedStudentRoute><QuizPage /></ProtectedStudentRoute>} />
      <Route path="/student/quizzes/:quizId/result/:attemptId" element={<ProtectedStudentRoute><QuizResultPage /></ProtectedStudentRoute>} />
      
      {/* مسار وهمي لتفادي تحذيرات React Router عند تفعيل مدير كلمات المرور في iOS */}
      <Route path="/student/login-dummy" element={null} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StudentAuthProvider>
          <StudentDataContextProvider>
            <DoctorAuthProvider>
              <Router>
                <PullToRefresh>
                  <AppContent />
                </PullToRefresh>
                <Toaster position="bottom-right" />
              </Router>
            </DoctorAuthProvider>
          </StudentDataContextProvider>
        </StudentAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;