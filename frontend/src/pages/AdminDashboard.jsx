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
  const [gradesFile, setGradesFile] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('midterm');
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
  const [timetableFile, setTimetableFile] = useState(null);
  const [selectedSection, setSelectedSection] = useState('');
  const [uploadingTimetable, setUploadingTimetable] = useState(false);
  
  // ============= Notifications State =============
  const [notifications, setNotifications] = useState([]);
  const [sending, setSending] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    studentId: '',
    title: '',
    content: ''
  });

  useEffect(() => {
    if (!token) return;
    fetchCourses();
    if (activeTab === 'notifications') {
      fetchNotifications();
    }
  }, [token, activeTab]);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data);
    } catch (error) {
      toast.error('Error loading courses');
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications/admin/all');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/admin/login', loginCredentials);
      login(response.data.token);
      toast.success('Login successful');
      fetchCourses();
    } catch (error) {
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  // ============= Grades Upload =============
  const handleUploadGrades = async (e) => {
    e.preventDefault();
    if (!gradesFile) {
      toast.error('Please select a file');
      return;
    }
    if (!selectedCourseId) {
      toast.error('Please select a course');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', gradesFile);
    formData.append('courseId', selectedCourseId);
    formData.append('examType', selectedExamType);
    
    setUploadingGrades(true);
    try {
      const response = await api.post('/grades/admin/upload-advanced', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`✅ Uploaded ${response.data.count} grades`);
      setGradesFile(null);
      setSelectedCourseId('');
      document.getElementById('gradesFileInput').value = '';
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error uploading grades');
    } finally {
      setUploadingGrades(false);
    }
  };

  // ============= Students Upload =============
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
      const response = await api.post('/admin/upload-students', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`✅ Uploaded ${response.data.count} students`);
      setStudentsFile(null);
      document.getElementById('studentsFileInput').value = '';
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error uploading students');
    } finally {
      setUploadingStudents(false);
    }
  };

  // ============= Timetable Upload =============
  const handleUploadTimetable = async (e) => {
    e.preventDefault();
    if (!timetableFile) {
      toast.error('Please select a file');
      return;
    }
    if (!selectedSection) {
      toast.error('Please select a section');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', timetableFile);
    formData.append('section', selectedSection);
    
    setUploadingTimetable(true);
    try {
      const response = await api.post('/timetable/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
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

  // ============= Notifications Send =============
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
        content: notificationForm.content
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
        content: notificationForm.content
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

  // ============= Course Management =============
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

  // ============= Login Screen =============
  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-sm border border-primary/30 rounded-2xl p-8 shadow-2xl">
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
              <button type="submit" disabled={loading} className="w-full bg-primary text-dark font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50">
                {loading ? 'Logging in...' : 'Login →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ============= Main Dashboard =============
  return (
    <div className="animate-fadeIn">
      <h1 className="text-4xl md:text-5xl font-bold text-primary mb-8 tracking-tight">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-10 border-b border-white/10 pb-2">
        {['courses', 'grades', 'resources', 'roadmap', 'students', 'timetable', 'notifications'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 md:px-6 md:py-2.5 font-medium rounded-t-xl transition-all duration-200 text-sm md:text-base ${
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
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-8">
        
        {/* ============= Courses Tab ============= */}
        {activeTab === 'courses' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-primary mb-4">➕ Add New Course</h2>
              <form onSubmit={handleAddCourse} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="name" placeholder="Course Name" className="bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary" required />
                <select name="semester" className="bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary" required>
                  <option value={1}>Semester 1</option>
                  <option value={2}>Semester 2</option>
                </select>
                <input name="max_score" type="number" placeholder="Max Score (default: 40)" className="bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white" />
                <textarea name="description" placeholder="Description" className="md:col-span-2 bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white" rows="3" required />
                <div className="md:col-span-2">
                  <button type="submit" className="bg-primary text-dark font-semibold py-2.5 px-6 rounded-xl transition-all hover:scale-105">Add Course</button>
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
                    {courses.map(course => (
                      <tr key={course.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4 text-white">{course.name}</td>
                        <td className="py-3 px-4 text-gray-300">{course.semester}</td>
                        <td className="py-3 px-4 text-gray-300">{course.max_score || 40}</td>
                        <td className="py-3 px-4 space-x-3">
                          <button onClick={() => handleEditClick(course)} className="text-yellow-400 hover:text-yellow-300">Edit</button>
                          <button onClick={() => handleDeleteCourse(course.id)} className="text-red-400 hover:text-red-300">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============= Grades Upload Tab ============= */}
        {activeTab === 'grades' && (
          <div>
            <h2 className="text-xl font-semibold text-primary mb-4">📊 Upload Grades</h2>
            <p className="text-gray-400 text-sm mb-4">
              Excel file columns: <span className="text-primary">Student ID, Student Name, Score</span>
            </p>
            
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Select Course</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full md:w-80 bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary"
                required
              >
                <option value="">-- Choose a course --</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.name} (Max: {course.max_score || 40})</option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Exam Type</label>
              <select
                value={selectedExamType}
                onChange={(e) => setSelectedExamType(e.target.value)}
                className="w-full md:w-80 bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary"
              >
                <option value="midterm">📝 Midterm Exam</option>
                <option value="practical">🔧 Practical Exam</option>
                <option value="oral">🎤 Oral Exam</option>
              </select>
            </div>
            
            <form onSubmit={handleUploadGrades} className="space-y-5">
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="relative cursor-pointer bg-dark/50 border border-white/20 rounded-xl px-5 py-2 text-white hover:border-primary transition-all">
                  📁 Choose File
                  <input id="gradesFileInput" type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setGradesFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                </label>
                {gradesFile && <span className="text-sm text-gray-300">📄 {gradesFile.name}</span>}
              </div>
              <button type="submit" disabled={uploadingGrades || !selectedCourseId || !gradesFile} className="bg-primary text-dark font-semibold py-2.5 px-6 rounded-xl transition-all hover:scale-105 disabled:opacity-50">
                {uploadingGrades ? '⏳ Uploading...' : '⬆️ Upload Grades'}
              </button>
            </form>
          </div>
        )}

        {/* ============= Resources Tab ============= */}
        {activeTab === 'resources' && <ResourceManager />}
        
        {/* ============= Roadmap Tab ============= */}
        {activeTab === 'roadmap' && <RoadmapManager />}
        
        {/* ============= Students Upload Tab ============= */}
        {activeTab === 'students' && (
          <div>
            <h2 className="text-xl font-semibold text-primary mb-4">👥 Upload Students (Excel)</h2>
            <p className="text-gray-400 text-sm mb-4">
              Excel file columns: <span className="text-primary">Student ID, Student Name, Password (optional), Level (optional), Section (optional)</span>
            </p>
            <form onSubmit={handleUploadStudents} className="space-y-5">
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="relative cursor-pointer bg-dark/50 border border-white/20 rounded-xl px-5 py-2 text-white hover:border-primary transition-all">
                  📁 Choose File
                  <input id="studentsFileInput" type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setStudentsFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                </label>
                {studentsFile && <span className="text-sm text-gray-300">📄 {studentsFile.name}</span>}
              </div>
              <button type="submit" disabled={uploadingStudents || !studentsFile} className="bg-primary text-dark font-semibold py-2.5 px-6 rounded-xl transition-all hover:scale-105 disabled:opacity-50">
                {uploadingStudents ? '⏳ Uploading...' : '⬆️ Upload Students'}
              </button>
            </form>
          </div>
        )}

        {/* ============= Timetable Upload Tab ============= */}
        {activeTab === 'timetable' && (
          <div>
            <h2 className="text-xl font-semibold text-primary mb-4">📅 Upload Timetable</h2>
            <p className="text-gray-400 text-sm mb-4">
              Excel file columns: <span className="text-primary">Day, Start Time, End Time, Course Name, Location, Instructor, Type</span>
            </p>
            
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Select Section</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full md:w-64 bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary"
              >
                <option value="">-- Choose section --</option>
                <option value="1">Section 1</option>
                <option value="2">Section 2</option>
                <option value="3">Section 3</option>
                <option value="4">Section 4</option>
                <option value="5">Section 5</option>
                <option value="6">Section 6</option>
              </select>
            </div>
            
            <form onSubmit={handleUploadTimetable} className="space-y-5">
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="relative cursor-pointer bg-dark/50 border border-white/20 rounded-xl px-5 py-2 text-white hover:border-primary transition-all">
                  📁 Choose Excel File
                  <input id="timetableFileInput" type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setTimetableFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                </label>
                {timetableFile && <span className="text-sm text-gray-300">📄 {timetableFile.name}</span>}
              </div>
              <button type="submit" disabled={uploadingTimetable || !selectedSection || !timetableFile} className="bg-primary text-dark font-semibold py-2.5 px-6 rounded-xl transition-all hover:scale-105 disabled:opacity-50">
                {uploadingTimetable ? '⏳ Uploading...' : '⬆️ Upload Timetable'}
              </button>
            </form>
          </div>
        )}

        {/* ============= NOTIFICATIONS TAB ============= */}
        {activeTab === 'notifications' && (
          <div>
            <h2 className="text-xl font-semibold text-primary mb-4">🔔 Send Notifications</h2>
            
            {/* Send to All Students */}
            <div className="mb-8 p-5 bg-white/5 rounded-xl border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>📢</span> Send to All Students
              </h3>
              <form onSubmit={handleSendToAll} className="space-y-4">
                <input
                  type="text"
                  placeholder="Notification Title"
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                  className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary"
                  required
                />
                <textarea
                  placeholder="Notification Message"
                  rows="3"
                  value={notificationForm.content}
                  onChange={(e) => setNotificationForm({ ...notificationForm, content: e.target.value })}
                  className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary"
                  required
                />
                <button type="submit" disabled={sending} className="bg-primary text-dark font-semibold py-2 px-6 rounded-xl hover:scale-105 transition disabled:opacity-50">
                  {sending ? 'Sending...' : 'Send to All →'}
                </button>
              </form>
            </div>

            {/* Send to Specific Student */}
            <div className="mb-8 p-5 bg-white/5 rounded-xl border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>👤</span> Send to Specific Student
              </h3>
              <form onSubmit={handleSendToStudent} className="space-y-4">
                <input
                  type="text"
                  placeholder="Student ID (e.g., 2021001)"
                  value={notificationForm.studentId}
                  onChange={(e) => setNotificationForm({ ...notificationForm, studentId: e.target.value })}
                  className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary"
                  required
                />
                <input
                  type="text"
                  placeholder="Notification Title"
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                  className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary"
                  required
                />
                <textarea
                  placeholder="Notification Message"
                  rows="3"
                  value={notificationForm.content}
                  onChange={(e) => setNotificationForm({ ...notificationForm, content: e.target.value })}
                  className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary"
                  required
                />
                <button type="submit" disabled={sending} className="bg-primary text-dark font-semibold py-2 px-6 rounded-xl hover:scale-105 transition disabled:opacity-50">
                  {sending ? 'Sending...' : 'Send to Student →'}
                </button>
              </form>
            </div>

            {/* Notifications History */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>📜</span> Sent Notifications
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No notifications sent yet.</p>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-primary">{notif.title}</h4>
                          <p className="text-gray-300 text-sm mt-1">{notif.content}</p>
                          <div className="flex gap-3 mt-2 text-xs text-gray-500">
                            <span>To: {notif.student_name || 'All Students'}</span>
                            <span>{new Date(notif.created_at).toLocaleString()}</span>
                            {notif.is_read && <span className="text-green-400">✓ Read</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Course Modal */}
      {editingCourse && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setEditingCourse(null)}>
          <div className="bg-charcoal border border-primary/30 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-primary mb-5">Edit Course</h2>
            <form onSubmit={handleUpdateCourse} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-1">Course Name</label>
                <input type="text" name="name" value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary" required />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Semester</label>
                <select name="semester" value={editFormData.semester} onChange={(e) => setEditFormData({ ...editFormData, semester: parseInt(e.target.value) })} className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white">
                  <option value={1}>Semester 1</option>
                  <option value={2}>Semester 2</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Max Score</label>
                <input type="number" name="max_score" value={editFormData.max_score} onChange={(e) => setEditFormData({ ...editFormData, max_score: parseInt(e.target.value) })} className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white" required />
              </div>
              <div>
                <label className="block text-gray-300 mb-1">Description</label>
                <textarea name="description" value={editFormData.description} onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })} className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white" rows="3" required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading} className="flex-1 bg-primary text-dark font-semibold py-2 rounded-xl hover:bg-primaryDark transition-all">{loading ? 'Saving...' : 'Save Changes'}</button>
                <button type="button" onClick={() => setEditingCourse(null)} className="px-4 py-2 border border-white/20 rounded-xl hover:bg-white/10">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;