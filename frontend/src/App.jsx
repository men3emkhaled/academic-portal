import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { StudentAuthProvider, useStudentAuth } from './context/StudentAuthContext';
import { StudentDataContextProvider } from './context/StudentDataContext';
import AdminDashboard from './pages/AdminDashboard';
import StudentLogin from './pages/StudentLogin';
import StudentDashboard from './pages/StudentDashboard';
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

// مكون حماية المسارات للطلاب
const ProtectedStudentRoute = ({ children }) => {
  const { token, loading } = useStudentAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !token) {
      navigate('/student/login', { replace: true });
    }
  }, [token, loading, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-dark">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-dark">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">جاري تحميل الجلسة...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/student/login" replace />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/student/login" element={<StudentLoginRedirect />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/student/dashboard" element={<ProtectedStudentRoute><StudentDashboard /></ProtectedStudentRoute>} />
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
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StudentAuthProvider>
          <StudentDataContextProvider>
            <Router>
              <AppContent />
              <Toaster position="bottom-right" />
            </Router>
          </StudentDataContextProvider>
        </StudentAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;