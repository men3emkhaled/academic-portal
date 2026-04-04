import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import ResourceManager from '../components/ResourceManager';
import RoadmapManager from '../components/RoadmapManager';

const AdminDashboard = () => {
  const { token, login } = useAuth();
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingGrades, setUploadingGrades] = useState(false);
  const [uploadingStudents, setUploadingStudents] = useState(false);
  const [studentsFile, setStudentsFile] = useState(null);
  const [loginCredentials, setLoginCredentials] = useState({ username: '', password: '' });
  const [editingCourse, setEditingCourse] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    semester: 1,
    description: '',
    max_score: 15,
  });

  // Grades upload states
  const [gradesFile, setGradesFile] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('midterm');

  // Timetable upload states
  const [timetableFile, setTimetableFile] = useState(null);
  const [selectedSection, setSelectedSection] = useState('');
  const [uploadingTimetable, setUploadingTimetable] = useState(false);

  // Notifications states
  const [notifications, setNotifications] = useState([]);
  const [sending, setSending] = useState(false);
  const [notificationForm, setNotificationForm] = useState({ studentId: '', title: '', content: '' });
  const [editingNotification, setEditingNotification] = useState(null);
  const [editNotifForm, setEditNotifForm] = useState({ title: '', content: '', is_read: false });
  const [showEditModal, setShowEditModal] = useState(false);

  // ------------------- Fetch Data -------------------
  useEffect(() => {
    if (!token) return;
    fetchCourses();
    fetchStudents();
    if (activeTab === 'notifications') fetchNotifications();
  }, [token, activeTab]);

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
      const res = await api.get('/admin/students-with-passwords');
      setStudents(res.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/admin/all');
      setNotifications(res.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // ------------------- Admin Login -------------------
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

  // ------------------- Grades Upload -------------------
  const handleUploadGrades = async (e) => {
    e.preventDefault();
    if (!gradesFile || !selectedCourseId) {
      toast.error('Please select a file and a course');
      return;
    }
    const formData = new FormData();
    formData.append('file', gradesFile);
    formData.append('courseId', selectedCourseId);
    formData.append('examType', selectedExamType);
    setUploadingGrades(true);
    try {
      const res = await api.post('/grades/admin/upload-advanced', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(`✅ Uploaded ${res.data.count} grades`);
      setGradesFile(null);
      setSelectedCourseId('');
      document.getElementById('gradesFileInput').value = '';
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error uploading grades');
    } finally {
      setUploadingGrades(false);
    }
  };

  // ------------------- Students Upload (Excel) -------------------
  const handleUploadStudents = async (e) => {
    e.preventDefault();
    if (!studentsFile) {
      toast.error('Please select a file');
      return;
    }
    const formData = new FormData();
    formData.append('file', studentsFile);
    setUploadingStudents(true);
    try {
      const res = await api.post('/admin/upload-students', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(`✅ Uploaded ${res.data.count} students`);
      setStudentsFile(null);
      document.getElementById('studentsFileInput').value = '';
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error uploading students');
    } finally {
      setUploadingStudents(false);
    }
  };

  // ------------------- Student: Reset Password -------------------
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

  // ------------------- Student: Delete -------------------
  const handleDeleteStudent = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to delete student "${studentName}" (${studentId})? This action cannot be undone.`)) return;
    try {
      await api.delete(`/admin/students/${studentId}`);
      toast.success(`Student ${studentId} deleted`);
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete student');
    }
  };

  // ------------------- Timetable Upload -------------------
  const handleUploadTimetable = async (e) => {
    e.preventDefault();
    if (!timetableFile || !selectedSection) {
      toast.error('Please select a file and a section');
      return;
    }
    const formData = new FormData();
    formData.append('file', timetableFile);
    formData.append('section', selectedSection);
    setUploadingTimetable(true);
    try {
      const res = await api.post('/timetable/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(`✅ Uploaded timetable for Section ${selectedSection}`);
      setTimetableFile(null);
      setSelectedSection('');
      document.getElementById('timetableFileInput').value = '';
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error uploading timetable');
    } finally {
      setUploadingTimetable(false);
    }
  };

  // ------------------- Notifications -------------------
  const handleSendToAll = async (e) => {
    e.preventDefault();
    if (!notificationForm.title || !notificationForm.content) {
      toast.error('Title and content are required');
      return;
    }
    setSending(true);
    try {
      await api.post('/notifications/admin/send-to-all', {
        title: notificationForm.title,
        content: notificationForm.content,
      });
      toast.success('Notification sent to all students!');
      setNotificationForm({ studentId: '', title: '', content: '' });
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to send');
    } finally {
      setSending(false);
    }
  };

  const handleSendToStudent = async (e) => {
    e.preventDefault();
    if (!notificationForm.studentId || !notificationForm.title || !notificationForm.content) {
      toast.error('Student ID, title, and content are required');
      return;
    }
    setSending(true);
    try {
      await api.post('/notifications/admin/send-to-student', {
        studentId: notificationForm.studentId,
        title: notificationForm.title,
        content: notificationForm.content,
      });
      toast.success(`Notification sent to student ${notificationForm.studentId}`);
      setNotificationForm({ studentId: '', title: '', content: '' });
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to send');
    } finally {
      setSending(false);
    }
  };

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

  // ------------------- Course Management -------------------
  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await api.delete(`/courses/${id}`);
      toast.success('Course deleted');
      fetchCourses();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handleEditClick = (course) => {
    setEditingCourse(course);
    setEditFormData({
      name: course.name,
      semester: course.semester,
      description: course.description || '',
      max_score: course.max_score || 15,
    });
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/courses/${editingCourse.id}`, editFormData);
      toast.success('Course updated');
      setEditingCourse(null);
      fetchCourses();
    } catch (error) {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      semester: parseInt(formData.get('semester')),
      description: formData.get('description'),
      max_score: parseInt(formData.get('max_score')) || 15,
    };
    try {
      await api.post('/courses', data);
      toast.success('Course added');
      fetchCourses();
      e.target.reset();
    } catch (error) {
      toast.error('Error adding course');
    }
  };

  // ------------------- Login Screen -------------------
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/5 backdrop-blur-sm border border-primary/30 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-primary text-center mb-6">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-gray-300 mb-2 text-sm">Username</label>
              <input
                type="text"
                value={loginCredentials.username}
                onChange={(e) => setLoginCredentials({ ...loginCredentials, username: e.target.value })}
                className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 text-sm">Password</label>
              <input
                type="password"
                value={loginCredentials.password}
                onChange={(e) => setLoginCredentials({ ...loginCredentials, password: e.target.value })}
                className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-primary text-dark font-semibold py-3 rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50">
              {loading ? 'Logging in...' : 'Login →'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ------------------- Main Dashboard -------------------
  return (
    <div className="min-h-screen bg-dark p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold text-primary mb-6 tracking-tight">Admin Dashboard</h1>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-white/10 pb-2 overflow-x-auto">
          {['courses', 'grades', 'resources', 'roadmap', 'students', 'timetable', 'notifications'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 md:px-6 md:py-2.5 font-medium rounded-t-xl transition-all text-sm md:text-base whitespace-nowrap ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary bg-white/5'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              {tab === 'courses' && '📚 Courses'}
              {tab === 'grades' && '📊 Upload Grades'}
              {tab === 'resources' && '📎 Resources'}
              {tab === 'roadmap' && '🗺️ Roadmap'}
              {tab === 'students' && '👥 Students'}
              {tab === 'timetable' && '📅 Timetable'}
              {tab === 'notifications' && '🔔 Notifications'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-6 overflow-x-auto">
          {/* ---------- Courses Tab ---------- */}
          {activeTab === 'courses' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-primary mb-4">➕ Add New Course</h2>
                <form onSubmit={handleAddCourse} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="name" placeholder="Course Name" className="bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white" required />
                  <select name="semester" className="bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white" required>
                    <option value={1}>Semester 1</option>
                    <option value={2}>Semester 2</option>
                  </select>
                  <input name="max_score" type="number" placeholder="Max Score (default: 40)" className="bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white" />
                  <textarea name="description" placeholder="Description" className="md:col-span-2 bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white" rows="3" required />
                  <div className="md:col-span-2">
                    <button type="submit" className="bg-primary text-dark font-semibold py-2 px-6 rounded-xl transition hover:scale-105">Add Course</button>
                  </div>
                </form>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-primary mb-4">📋 Existing Courses</h2>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-primary">Name</th>
                        <th className="text-left py-3 px-4 text-primary">Semester</th>
                        <th className="text-left py-3 px-4 text-primary">Max Score</th>
                        <th className="text-left py-3 px-4 text-primary">Actions</th>
                       </tr>
                    </thead>
                    <tbody>
                      {courses.map((course) => (
                        <tr key={course.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-4 text-white">{course.name}</td>
                          <td className="py-3 px-4 text-gray-300">{course.semester}</td>
                          <td className="py-3 px-4 text-gray-300">{course.max_score || 40}</td>
                          <td className="py-3 px-4 space-x-3">
                            <button onClick={() => handleEditClick(course)} className="text-yellow-400">Edit</button>
                            <button onClick={() => handleDeleteCourse(course.id)} className="text-red-400">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ---------- Upload Grades Tab ---------- */}
          {activeTab === 'grades' && (
            <div>
              <h2 className="text-xl font-semibold text-primary mb-4">📊 Upload Grades</h2>
              <p className="text-gray-400 text-sm mb-4">Excel file columns: <span className="text-primary">Student ID, Student Name, Score</span></p>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Select Course</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full md:w-80 bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white"
                >
                  <option value="">-- Choose a course --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} (Max: {c.max_score || 40})</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Exam Type</label>
                <select
                  value={selectedExamType}
                  onChange={(e) => setSelectedExamType(e.target.value)}
                  className="w-full md:w-80 bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white"
                >
                  <option value="midterm">📝 Midterm Exam</option>
                  <option value="practical">🔧 Practical Exam</option>
                  <option value="oral">🎤 Oral Exam</option>
                </select>
              </div>
              <form onSubmit={handleUploadGrades} className="space-y-5">
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="relative cursor-pointer bg-dark/50 border border-white/20 rounded-xl px-5 py-2 text-white hover:border-primary transition">
                    📁 Choose File
                    <input id="gradesFileInput" type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setGradesFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </label>
                  {gradesFile && <span className="text-sm text-gray-300">📄 {gradesFile.name}</span>}
                </div>
                <button type="submit" disabled={uploadingGrades || !selectedCourseId || !gradesFile} className="bg-primary text-dark font-semibold py-2 px-6 rounded-xl transition hover:scale-105 disabled:opacity-50">
                  {uploadingGrades ? '⏳ Uploading...' : '⬆️ Upload Grades'}
                </button>
              </form>
            </div>
          )}

          {/* ---------- Resources Tab ---------- */}
          {activeTab === 'resources' && <ResourceManager />}

          {/* ---------- Roadmap Tab ---------- */}
          {activeTab === 'roadmap' && <RoadmapManager />}

          {/* ---------- Students Tab ---------- */}
          {activeTab === 'students' && (
            <div>
              <h2 className="text-xl font-semibold text-primary mb-4">👥 Manage Students</h2>
              {/* Upload Excel */}
              <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-2">Upload Students (Excel)</h3>
                <p className="text-gray-400 text-sm mb-4">Columns: Student ID, Student Name, Password (optional), Level (optional), Section (1-6)</p>
                <form onSubmit={handleUploadStudents} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <label className="relative cursor-pointer bg-dark/50 border border-white/20 rounded-xl px-5 py-2 text-white hover:border-primary transition">
                      📁 Choose File
                      <input id="studentsFileInput" type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setStudentsFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </label>
                    {studentsFile && <span className="text-sm text-gray-300">📄 {studentsFile.name}</span>}
                  </div>
                  <button type="submit" disabled={uploadingStudents || !studentsFile} className="bg-primary text-dark font-semibold py-2 px-6 rounded-xl transition hover:scale-105 disabled:opacity-50">
                    {uploadingStudents ? '⏳ Uploading...' : '⬆️ Upload Students'}
                  </button>
                </form>
              </div>

              {/* Students Table with Actions */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="text-left py-3 px-4 text-primary">ID</th>
                      <th className="text-left py-3 px-4 text-primary">Name</th>
                      <th className="text-left py-3 px-4 text-primary">Level</th>
                      <th className="text-left py-3 px-4 text-primary">Section</th>
                      <th className="text-left py-3 px-4 text-primary">Password</th>
                      <th className="text-left py-3 px-4 text-primary">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-8 text-gray-400">No students found.</td></tr>
                    ) : (
                      students.map((s) => (
                        <tr key={s.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-2 px-4 text-white">{s.id}</td>
                          <td className="py-2 px-4 text-white">{s.name}</td>
                          <td className="py-2 px-4 text-gray-300">{s.level}</td>
                          <td className="py-2 px-4 text-gray-300">{s.section || '—'}</td>
                          <td className="py-2 px-4 font-mono text-sm text-yellow-300">{s.password}</td>
                          <td className="py-2 px-4 space-x-3">
                            <button onClick={() => handleResetPassword(s.id)} className="text-blue-400 hover:text-blue-300 text-sm">🔑 Reset Pwd</button>
                            <button onClick={() => handleDeleteStudent(s.id, s.name)} className="text-red-400 hover:text-red-300 text-sm">🗑️ Delete</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---------- Timetable Tab ---------- */}
          {activeTab === 'timetable' && (
            <div>
              <h2 className="text-xl font-semibold text-primary mb-4">📅 Upload Timetable</h2>
              <p className="text-gray-400 text-sm mb-4">Excel columns: Day, Start Time, End Time, Course Name, Location, Instructor, Type</p>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Select Section (1-6)</label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full md:w-64 bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white"
                >
                  <option value="">-- Choose section --</option>
                  {[1,2,3,4,5,6].map(sec => <option key={sec} value={sec}>Section {sec}</option>)}
                </select>
              </div>
              <form onSubmit={handleUploadTimetable} className="space-y-5">
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="relative cursor-pointer bg-dark/50 border border-white/20 rounded-xl px-5 py-2 text-white hover:border-primary transition">
                    📁 Choose Excel File
                    <input id="timetableFileInput" type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setTimetableFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </label>
                  {timetableFile && <span className="text-sm text-gray-300">📄 {timetableFile.name}</span>}
                </div>
                <button type="submit" disabled={uploadingTimetable || !selectedSection || !timetableFile} className="bg-primary text-dark font-semibold py-2 px-6 rounded-xl transition hover:scale-105 disabled:opacity-50">
                  {uploadingTimetable ? '⏳ Uploading...' : '⬆️ Upload Timetable'}
                </button>
              </form>
            </div>
          )}

          {/* ---------- Notifications Tab (Full Control) ---------- */}
          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-xl font-semibold text-primary mb-4">🔔 Full Notification Control</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LEFT: Send Forms */}
                <div className="space-y-6">
                  <div className="p-5 bg-white/5 rounded-xl border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">📢 Send to All Students</h3>
                    <form onSubmit={handleSendToAll} className="space-y-4">
                      <input type="text" placeholder="Title" value={notificationForm.title} onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })} className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white" required />
                      <textarea placeholder="Message" rows="3" value={notificationForm.content} onChange={(e) => setNotificationForm({ ...notificationForm, content: e.target.value })} className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white" required />
                      <button type="submit" disabled={sending} className="bg-primary text-dark font-semibold py-2 px-6 rounded-xl transition hover:scale-105 disabled:opacity-50">{sending ? 'Sending...' : 'Send to All →'}</button>
                    </form>
                  </div>

                  <div className="p-5 bg-white/5 rounded-xl border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">👤 Send to Specific Student</h3>
                    <form onSubmit={handleSendToStudent} className="space-y-4">
                      <input type="text" placeholder="Student ID" value={notificationForm.studentId} onChange={(e) => setNotificationForm({ ...notificationForm, studentId: e.target.value })} className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white" required />
                      <input type="text" placeholder="Title" value={notificationForm.title} onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })} className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white" required />
                      <textarea placeholder="Message" rows="3" value={notificationForm.content} onChange={(e) => setNotificationForm({ ...notificationForm, content: e.target.value })} className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white" required />
                      <button type="submit" disabled={sending} className="bg-primary text-dark font-semibold py-2 px-6 rounded-xl transition hover:scale-105 disabled:opacity-50">{sending ? 'Sending...' : 'Send to Student →'}</button>
                    </form>
                  </div>
                </div>

                {/* RIGHT: Notifications List with Edit/Delete */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">📜 All Notifications</h3>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {notifications.length === 0 ? (
                      <p className="text-gray-400 text-center py-8">No notifications sent yet.</p>
                    ) : (
                      notifications.map((notif) => (
                        <div key={notif.id} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-primary/30 transition-all">
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-semibold text-primary">{notif.title}</h4>
                                {notif.student_name ? (
                                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">To: {notif.student_name}</span>
                                ) : (
                                  <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">To: All Students</span>
                                )}
                                {notif.is_read ? (
                                  <span className="text-xs bg-gray-500/20 text-gray-300 px-2 py-0.5 rounded-full">Read</span>
                                ) : (
                                  <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full">Unread</span>
                                )}
                              </div>
                              <p className="text-gray-300 text-sm mt-2">{notif.content}</p>
                              <p className="text-xs text-gray-500 mt-2">{new Date(notif.created_at).toLocaleString()}</p>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => { setEditingNotification(notif); setEditNotifForm({ title: notif.title, content: notif.content, is_read: notif.is_read }); setShowEditModal(true); }} className="text-yellow-400 hover:text-yellow-300 transition" title="Edit">✏️</button>
                              <button onClick={() => handleDeleteNotification(notif.id)} className="text-red-400 hover:text-red-300 transition" title="Delete">🗑️</button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Edit Notification Modal */}
              {showEditModal && editingNotification && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                  <div className="bg-dark-card border border-primary/30 rounded-2xl p-6 w-full max-w-md">
                    <h3 className="text-xl font-bold text-primary mb-4">Edit Notification</h3>
                    <form onSubmit={handleUpdateNotification} className="space-y-4">
                      <input type="text" placeholder="Title" value={editNotifForm.title} onChange={(e) => setEditNotifForm({ ...editNotifForm, title: e.target.value })} className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white" required />
                      <textarea placeholder="Content" rows="4" value={editNotifForm.content} onChange={(e) => setEditNotifForm({ ...editNotifForm, content: e.target.value })} className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white" required />
                      <label className="flex items-center gap-2 text-white">
                        <input type="checkbox" checked={editNotifForm.is_read} onChange={(e) => setEditNotifForm({ ...editNotifForm, is_read: e.target.checked })} />
                        Mark as read
                      </label>
                      <div className="flex gap-3 pt-2">
                        <button type="submit" className="flex-1 bg-primary text-dark font-semibold py-2 rounded-xl">Save Changes</button>
                        <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-white/20 rounded-xl">Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Course Modal */}
      {editingCourse && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setEditingCourse(null)}>
          <div className="bg-charcoal border border-primary/30 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-primary mb-5">Edit Course</h2>
            <form onSubmit={handleUpdateCourse} className="space-y-4">
              <input type="text" placeholder="Course Name" value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white" required />
              <select value={editFormData.semester} onChange={(e) => setEditFormData({ ...editFormData, semester: parseInt(e.target.value) })} className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white">
                <option value={1}>Semester 1</option>
                <option value={2}>Semester 2</option>
              </select>
              <input type="number" placeholder="Max Score" value={editFormData.max_score} onChange={(e) => setEditFormData({ ...editFormData, max_score: parseInt(e.target.value) })} className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white" required />
              <textarea placeholder="Description" value={editFormData.description} onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })} className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white" rows="3" required />
              <div className="flex gap-3">
                <button type="submit" disabled={loading} className="flex-1 bg-primary text-dark font-semibold py-2 rounded-xl">{loading ? 'Saving...' : 'Save Changes'}</button>
                <button type="button" onClick={() => setEditingCourse(null)} className="px-4 py-2 border border-white/20 rounded-xl">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;