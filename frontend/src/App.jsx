import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { StudentAuthProvider } from './context/StudentAuthContext';
import AdminDashboard from './pages/AdminDashboard';
import StudentLogin from './pages/StudentLogin';
import StudentDashboard from './pages/StudentDashboard';
import StudentTimetable from './pages/StudentTimetable';
import StudentGrades from './pages/StudentGrades';
import StudentRoadmap from './pages/StudentRoadmap';
import StudentMaterials from './pages/StudentMaterials';
import StudentNotifications from './pages/StudentNotifications';
import StudentSettings from './pages/StudentSettings';

const ProtectedStudentRoute = ({ children }) => {
  const token = localStorage.getItem('studentToken');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/student/login', { replace: true });
    }
  }, [token, navigate]);

  if (!token) return null;
  return children;
};

const StudentLoginRedirect = () => {
  const token = localStorage.getItem('studentToken');
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate('/student/dashboard', { replace: true });
    }
  }, [token, navigate]);

  return <StudentLogin />;
};

function App() {
  return (
    <AuthProvider>
      <StudentAuthProvider>
        <Router>
          <Routes>
            {/* الصفحة الرئيسية تحول لتسجيل دخول الطالب */}
            <Route path="/" element={<Navigate to="/student/login" replace />} />
            
            {/* Admin Route */}
            <Route path="/admin" element={<AdminDashboard />} />
            
            {/* Student Routes */}
            <Route path="/student/login" element={<StudentLoginRedirect />} />
            <Route path="/student/dashboard" element={<ProtectedStudentRoute><StudentDashboard /></ProtectedStudentRoute>} />
            <Route path="/student/grades" element={<ProtectedStudentRoute><StudentGrades /></ProtectedStudentRoute>} />
            <Route path="/student/timetable" element={<ProtectedStudentRoute><StudentTimetable /></ProtectedStudentRoute>} />
            <Route path="/student/roadmap" element={<ProtectedStudentRoute><StudentRoadmap /></ProtectedStudentRoute>} />
            <Route path="/student/materials" element={<ProtectedStudentRoute><StudentMaterials /></ProtectedStudentRoute>} />
            <Route path="/student/notifications" element={<ProtectedStudentRoute><StudentNotifications /></ProtectedStudentRoute>} />
            <Route path="/student/settings" element={<ProtectedStudentRoute><StudentSettings /></ProtectedStudentRoute>} />
          </Routes>
          <Toaster position="bottom-right" />
        </Router>
      </StudentAuthProvider>
    </AuthProvider>
  );
}

export default App;