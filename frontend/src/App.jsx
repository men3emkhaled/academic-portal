import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

// Protected Route wrapper for student pages
const ProtectedStudentRoute = ({ children }) => {
  const token = localStorage.getItem('studentToken');
  if (!token) {
    return <Navigate to="/student/login" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <StudentAuthProvider>
        <Router>
          <div className="min-h-screen bg-dark">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/course/:id" element={<CourseDetails />} />
                <Route path="/grades" element={<Grades />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/roadmap" element={<RoadmapList />} />
                <Route path="/roadmap/:id" element={<RoadmapDetail />} />
                
                {/* Admin Route */}
                <Route path="/admin" element={<AdminDashboard />} />
                
                {/* Student Routes */}
                <Route path="/student/login" element={<StudentLogin />} />
                <Route path="/student/dashboard" element={
                  <ProtectedStudentRoute><StudentDashboard /></ProtectedStudentRoute>
                } />
                <Route path="/student/grades" element={
                  <ProtectedStudentRoute><StudentGrades /></ProtectedStudentRoute>
                } />
                <Route path="/student/timetable" element={
                  <ProtectedStudentRoute><StudentTimetable /></ProtectedStudentRoute>
                } />
                <Route path="/student/roadmap" element={
                  <ProtectedStudentRoute><StudentRoadmap /></ProtectedStudentRoute>
                } />
                <Route path="/student/materials" element={
                  <ProtectedStudentRoute><StudentMaterials /></ProtectedStudentRoute>
                } />
                <Route path="/student/notifications" element={
                  <ProtectedStudentRoute><StudentNotifications /></ProtectedStudentRoute>
                } />
                <Route path="/student/settings" element={
                  <ProtectedStudentRoute><StudentSettings /></ProtectedStudentRoute>
                } />
              </Routes>
            </main>
            <Toaster position="bottom-right" />
          </div>
        </Router>
      </StudentAuthProvider>
    </AuthProvider>
  );
}

export default App;