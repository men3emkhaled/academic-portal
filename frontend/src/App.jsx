import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { StudentAuthProvider } from './context/StudentAuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CourseDetails from './pages/CourseDetails';
import Grades from './pages/Grades';
import AdminDashboard from './pages/AdminDashboard';
import Contact from './pages/Contact';
import RoadmapList from './pages/RoadmapList';
import RoadmapDetail from './pages/RoadmapDetail';
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

  if (!token) {
    return null;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <StudentAuthProvider>
        <Router>
          <Routes>
            {/* ===== Public Routes with Navbar ===== */}
            <Route path="/" element={<><Navbar /><Home /></>} />
            <Route path="/course/:id" element={<><Navbar /><CourseDetails /></>} />
            <Route path="/grades" element={<><Navbar /><Grades /></>} />
            <Route path="/contact" element={<><Navbar /><Contact /></>} />
            <Route path="/roadmap" element={<><Navbar /><RoadmapList /></>} />
            <Route path="/roadmap/:id" element={<><Navbar /><RoadmapDetail /></>} />
            
            {/* ===== Admin Route (no Navbar) ===== */}
            <Route path="/admin" element={<AdminDashboard />} />
            
            {/* ===== Student Routes (no Navbar - Sidebar inside) ===== */}
            <Route path="/student/login" element={<StudentLogin />} />
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