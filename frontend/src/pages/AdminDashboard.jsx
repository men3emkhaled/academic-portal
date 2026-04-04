import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import ResourceManager from '../components/ResourceManager';
import RoadmapManager from '../components/RoadmapManager';

const AdminDashboard = () => {
  const { token, login } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState({ username: '', password: '' });
  
  // Upload states
  const [gradesFile, setGradesFile] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('midterm');
  const [uploadingGrades, setUploadingGrades] = useState(false);
  const [studentsFile, setStudentsFile] = useState(null);
  const [uploadingStudents, setUploadingStudents] = useState(false);
  const [timetableFile, setTimetableFile] = useState(null);
  const [selectedSection, setSelectedSection] = useState('');
  const [uploadingTimetable, setUploadingTimetable] = useState(false);
  
  // Edit states
  const [editingCourse, setEditingCourse] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    semester: 1,
    description: '',
    max_score: 15,
  });
  const [editingGrade, setEditingGrade] = useState(null);
  const [gradeFormData, setGradeFormData] = useState({
    studentId: '',
    courseName: '',
    examType: 'midterm',
    score: '',
    status: 'completed'
  });

  // Stats
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalResources: 0
  });

  useEffect(() => {
    if (!token) return;
    fetchCourses();
    fetchStudents();
    fetchStats();
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/admin/login', loginCredentials);
      login(response.data.token);
      toast.success('Login successful');
    } catch (error) {
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data);
    } catch (error) {
      toast.error('Error loading courses');
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/admin/students-with-passwords');
      setStudents(response.data);
      setStats(prev => ({ ...prev, totalStudents: response.data.length }));
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const coursesRes = await api.get('/courses');
      setStats(prev => ({ ...prev, totalCourses: coursesRes.data.length }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // ============= Grades Upload =============
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
      const response = await api.post('/grades/admin/upload-advanced', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`✅ Uploaded ${response.data.count} grades`);
      setGradesFile(null);
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
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error uploading students');
    } finally {
      setUploadingStudents(false);
    }
  };

  // ============= Timetable Upload =============
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

  // ============= Single Grade Update =============
  const handleUpdateSingleGrade = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/admin/students/update-grade', gradeFormData);
      toast.success('Grade updated successfully');
      setEditingGrade(null);
      setGradeFormData({
        studentId: '',
        courseName: '',
        examType: 'midterm',
        score: '',
        status: 'completed'
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating grade');
    } finally {
      setLoading(false);
    }
  };

  // ============= Reset Student Password =============
  const handleResetPassword = async (studentId) => {
    if (!window.confirm(`Reset password for student ${studentId} to "123456"?`)) return;
    try {
      await api.put(`/admin/students/${studentId}/reset-password`, { newPassword: '123456' });
      toast.success(`Password reset for ${studentId}`);
      fetchStudents();
    } catch (error) {
      toast.error('Failed to reset password');
    }
  };

  // ============= Update Student Section =============
  const handleUpdateSection = async (studentId, section) => {
    try {
      await api.put(`/admin/students/${studentId}/section`, { section });
      toast.success(`Section updated for ${studentId}`);
      fetchStudents();
    } catch (error) {
      toast.error('Failed to update section');
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-gray-400 text-sm mb-2">Total Students</h3>
          <p className="text-3xl font-bold text-primary">{stats.totalStudents}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-gray-400 text-sm mb-2">Total Courses</h3>
          <p className="text-3xl font-bold text-primary">{stats.totalCourses}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-gray-400 text-sm mb-2">Resources</h3>
          <p className="text-3xl font-bold text-primary">{stats.totalResources}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-10 border-b border-white/10 pb-2">
        {['dashboard', 'courses', 'grades', 'students', 'timetable', 'resources', 'roadmap'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 md:px-6 md:py-2.5 font-medium rounded-t-xl transition-all duration-200 text-sm md:text-base ${
              activeTab === tab
                ? 'text-primary border-b-2 border-primary bg-white/5'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            {tab === 'dashboard' && '📊 Dashboard'}
            {tab === 'courses' && '📚 Courses'}
            {tab === 'grades' && '📊 Upload Grades'}
            {tab === 'students' && '👥 Students'}
            {tab === 'timetable' && '📅 Timetable'}
            {tab === 'resources' && '📎 Resources'}
            {tab === 'roadmap' && '🗺️ Roadmap'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-8">
        
        {/* ============= Dashboard Tab ============= */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 className="text-xl font-semibold text-primary mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button onClick={() => setActiveTab('students')} className="p-4 bg-primary/10 rounded-xl border border-primary/30 hover:bg-primary/20 transition-all">
                <span className="text-2xl block mb-2">👥</span>
                <span className="text-white">Manage Students</span>
              </button>
              <button onClick={() => setActiveTab('courses')} className="p-4 bg-primary/10 rounded-xl border border-primary/30 hover:bg-primary/20 transition-all">
                <span className="text-2xl block mb-2">📚</span>
                <span className="text-white">Manage Courses</span>
              </button>
              <button onClick={() => setActiveTab('grades')} className="p-4 bg-primary/10 rounded-xl border border-primary/30 hover:bg-primary/20 transition-all">
                <span className="text-2xl block mb-2">📊</span>
                <span className="text-white">Upload Grades</span>
              </button>
              <button onClick={() => setActiveTab('timetable')} className="p-4 bg-primary/10 rounded-xl border border-primary/30 hover:bg-primary/20 transition-all">
                <span className="text-2xl block mb-2">📅</span>
                <span className="text-white">Upload Timetable</span>
              </button>
            </div>
          </div>
        )}

        {/* ============= Courses Tab ============= */}
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
                <input name="max_score" type="number" placeholder="Max Score" className="bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white" />
                <textarea name="description" placeholder="Description" className="md:col-span-2 bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white" rows="3" required />
                <div className="md:col-span-2">
                  <button type="submit" className="bg-primary text-dark font-semibold py-2.5 px-6 rounded-xl">Add Course</button>
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
                        <td className="py-3 px-4 text-gray-300">{course.max_score || 15}</td>
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

        {/* ============= Grades Upload Tab ============= */}
        {activeTab === 'grades' && (
          <div>
            <h2 className="text-xl font-semibold text-primary mb-4">📊 Upload Grades (Excel)</h2>
            <p className="text-gray-400 text-sm mb-4">Columns: Student ID, Student Name, Score</p>
            
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Select Course</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full md:w-80 bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white"
              >
                <option value="">-- Choose a course --</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.name}</option>
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
                <option value="midterm">Midterm Exam</option>
                <option value="practical">Practical Exam</option>
                <option value="oral">Oral Exam</option>
              </select>
            </div>
            
            <form onSubmit={handleUploadGrades} className="space-y-5">
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="relative cursor-pointer bg-dark/50 border border-white/20 rounded-xl px-5 py-2 text-white hover:border-primary">
                  📁 Choose File
                  <input id="gradesFileInput" type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setGradesFile(e.target.files[0])} className="absolute inset-0 opacity-0" />
                </label>
                {gradesFile && <span className="text-sm text-gray-300">{gradesFile.name}</span>}
              </div>
              <button type="submit" disabled={uploadingGrades} className="bg-primary text-dark font-semibold py-2.5 px-6 rounded-xl disabled:opacity-50">
                {uploadingGrades ? 'Uploading...' : 'Upload Grades'}
              </button>
            </form>
          </div>
        )}

        {/* ============= Students Management Tab ============= */}
        {activeTab === 'students' && (
          <div>
            <h2 className="text-xl font-semibold text-primary mb-4">👥 Students Management</h2>
            
            {/* Upload Section */}
            <div className="mb-8 p-4 bg-white/5 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-3">Upload Students (Excel)</h3>
              <p className="text-gray-400 text-sm mb-3">Columns: Student ID, Student Name, Password (optional), Level (optional), Section (optional)</p>
              <form onSubmit={handleUploadStudents} className="flex flex-col sm:flex-row gap-4 items-start">
                <label className="relative cursor-pointer bg-dark/50 border border-white/20 rounded-xl px-5 py-2 text-white hover:border-primary">
                  📁 Choose File
                  <input id="studentsFileInput" type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setStudentsFile(e.target.files[0])} className="absolute inset-0 opacity-0" />
                </label>
                {studentsFile && <span className="text-sm text-gray-300">{studentsFile.name}</span>}
                <button type="submit" disabled={uploadingStudents} className="bg-primary text-dark font-semibold py-2 px-6 rounded-xl disabled:opacity-50">
                  {uploadingStudents ? 'Uploading...' : 'Upload'}
                </button>
              </form>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              <h3 className="text-lg font-semibold text-white mb-3">All Students</h3>
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-primary">ID</th>
                    <th className="text-left py-3 px-4 text-primary">Name</th>
                    <th className="text-left py-3 px-4 text-primary">Level</th>
                    <th className="text-left py-3 px-4 text-primary">Section</th>
                    <th className="text-left py-3 px-4 text-primary">Password</th>
                    <th className="text-left py-3 px-4 text-primary">Changed</th>
                    <th className="text-left py-3 px-4 text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 text-white">{student.id}</td>
                      <td className="py-3 px-4 text-white">{student.name}</td>
                      <td className="py-3 px-4 text-gray-300">{student.level}</td>
                      <td className="py-3 px-4">
                        <select
                          value={student.section || ''}
                          onChange={(e) => handleUpdateSection(student.id, e.target.value)}
                          className="bg-dark/50 border border-white/20 rounded-lg px-2 py-1 text-white text-sm"
                        >
                          <option value="">None</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </select>
                       </td>
                      <td className="py-3 px-4 text-gray-300">{student.password_display || '123456'}</td>
                      <td className="py-3 px-4">
                        {student.password_changed ? (
                          <span className="text-yellow-400 text-sm">✓ Changed</span>
                        ) : (
                          <span className="text-gray-500 text-sm">Default</span>
                        )}
                       </td>
                      <td className="py-3 px-4 space-x-2">
                        <button
                          onClick={() => handleResetPassword(student.id)}
                          className="text-blue-400 text-sm hover:text-blue-300"
                        >
                          Reset PW
                        </button>
                        <button
                          onClick={() => {
                            setEditingGrade(student);
                            setGradeFormData({
                              studentId: student.id,
                              courseName: courses[0]?.name || '',
                              examType: 'midterm',
                              score: '',
                              status: 'completed'
                            });
                          }}
                          className="text-green-400 text-sm hover:text-green-300"
                        >
                          Edit Grade
                        </button>
                       </td>
                     </tr>
                  ))}
                </tbody>
               </table>
            </div>
          </div>
        )}

        {/* ============= Timetable Upload Tab ============= */}
        {activeTab === 'timetable' && (
          <div>
            <h2 className="text-xl font-semibold text-primary mb-4">📅 Upload Timetable</h2>
            <p className="text-gray-400 text-sm mb-4">Columns: Day, Start Time, End Time, Course Name, Location, Instructor, Type</p>
            
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Select Section</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full md:w-64 bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white"
              >
                <option value="">-- Choose section --</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="D">Section D</option>
              </select>
            </div>
            
            <form onSubmit={handleUploadTimetable} className="space-y-5">
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="relative cursor-pointer bg-dark/50 border border-white/20 rounded-xl px-5 py-2 text-white hover:border-primary">
                  📁 Choose Excel File
                  <input id="timetableFileInput" type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setTimetableFile(e.target.files[0])} className="absolute inset-0 opacity-0" />
                </label>
                {timetableFile && <span className="text-sm text-gray-300">{timetableFile.name}</span>}
              </div>
              <button type="submit" disabled={uploadingTimetable} className="bg-primary text-dark font-semibold py-2.5 px-6 rounded-xl disabled:opacity-50">
                {uploadingTimetable ? 'Uploading...' : 'Upload Timetable'}
              </button>
            </form>
          </div>
        )}

        {/* ============= Resources Tab ============= */}
        {activeTab === 'resources' && <ResourceManager />}
        
        {/* ============= Roadmap Tab ============= */}
        {activeTab === 'roadmap' && <RoadmapManager />}
      </div>

      {/* Edit Course Modal */}
      {editingCourse && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setEditingCourse(null)}>
          <div className="bg-charcoal border border-primary/30 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-primary mb-5">Edit Course</h2>
            <form onSubmit={handleUpdateCourse} className="space-y-4">
              <input type="text" value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white" required />
              <select value={editFormData.semester} onChange={(e) => setEditFormData({ ...editFormData, semester: parseInt(e.target.value) })} className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white">
                <option value={1}>Semester 1</option>
                <option value={2}>Semester 2</option>
              </select>
              <input type="number" value={editFormData.max_score} onChange={(e) => setEditFormData({ ...editFormData, max_score: parseInt(e.target.value) })} className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white" required />
              <textarea value={editFormData.description} onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })} className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white" rows="3" required />
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-primary text-dark font-semibold py-2 rounded-xl">Save</button>
                <button type="button" onClick={() => setEditingCourse(null)} className="px-4 py-2 border border-white/20 rounded-xl">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Grade Modal */}
      {editingGrade && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setEditingGrade(null)}>
          <div className="bg-charcoal border border-primary/30 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-primary mb-5">Edit Grade</h2>
            <p className="text-gray-400 mb-4">Student: {editingGrade.id} - {editingGrade.name}</p>
            <form onSubmit={handleUpdateSingleGrade} className="space-y-4">
              <select
                value={gradeFormData.courseName}
                onChange={(e) => setGradeFormData({ ...gradeFormData, courseName: e.target.value })}
                className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white"
                required
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.name}>{course.name}</option>
                ))}
              </select>
              
              <select
                value={gradeFormData.examType}
                onChange={(e) => setGradeFormData({ ...gradeFormData, examType: e.target.value })}
                className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white"
                required
              >
                <option value="midterm">Midterm Exam</option>
                <option value="practical">Practical Exam</option>
                <option value="oral">Oral Exam</option>
              </select>
              
              <input
                type="number"
                placeholder="Score"
                value={gradeFormData.score}
                onChange={(e) => setGradeFormData({ ...gradeFormData, score: e.target.value })}
                className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white"
              />
              
              <select
                value={gradeFormData.status}
                onChange={(e) => setGradeFormData({ ...gradeFormData, status: e.target.value })}
                className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white"
              >
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
              
              <div className="flex gap-3">
                <button type="submit" disabled={loading} className="flex-1 bg-primary text-dark font-semibold py-2 rounded-xl">Save Grade</button>
                <button type="button" onClick={() => setEditingGrade(null)} className="px-4 py-2 border border-white/20 rounded-xl">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;