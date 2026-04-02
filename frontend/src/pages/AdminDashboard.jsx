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
  const [loading, setLoading] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState({ username: '', password: '' });
  const [editingCourse, setEditingCourse] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    semester: 1,
    description: '',
    max_score: 15,
  });

  useEffect(() => {
    if (!token) return;
    fetchCourses();
  }, [token]);

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

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data);
    } catch (error) {
      toast.error('Error loading courses');
    }
  };

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
    setLoading(true);
    try {
      const response = await api.post('/grades/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`Uploaded ${response.data.count} grades successfully`);
      setGradesFile(null);
      setSelectedCourseId('');
      document.getElementById('gradesFileInput').value = '';
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error uploading grades');
    } finally {
      setLoading(false);
    }
  };

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

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-charcoal border border-neon rounded-2xl p-8 shadow-2xl">
            <h2 className="text-3xl font-bold neon-text text-center mb-6">Admin Login</h2>
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-gray-300 mb-2 text-sm">Username</label>
                <input
                  type="text"
                  value={loginCredentials.username}
                  onChange={(e) => setLoginCredentials({ ...loginCredentials, username: e.target.value })}
                  className="w-full bg-dark border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2 text-sm">Password</label>
                <input
                  type="password"
                  value={loginCredentials.password}
                  onChange={(e) => setLoginCredentials({ ...loginCredentials, password: e.target.value })}
                  className="w-full bg-dark border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon transition-colors"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="neon-button w-full disabled:opacity-50">
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <h1 className="text-4xl md:text-5xl font-bold neon-text mb-8 tracking-tight">Admin Dashboard</h1>

      {/* Responsive Tabs */}
      <div className="flex flex-wrap gap-2 mb-10 border-b border-white/10 pb-2">
        {['courses', 'grades', 'resources', 'roadmap'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 md:px-6 md:py-2.5 font-medium rounded-t-xl transition-all duration-200 text-sm md:text-base ${
              activeTab === tab
                ? 'text-neon border-b-2 border-neon bg-white/5'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            {tab === 'courses' && 'Manage Courses'}
            {tab === 'grades' && 'Upload Grades'}
            {tab === 'resources' && 'Manage Resources'}
            {tab === 'roadmap' && 'Manage Roadmap'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-8">
        {activeTab === 'courses' && (
          <div className="space-y-8">
            {/* Add Course Form */}
            <div>
              <h2 className="text-xl font-semibold text-neon mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-neon rounded-full"></span> Add New Course
              </h2>
              <form
                onSubmit={async (e) => {
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
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <input
                  name="name"
                  placeholder="Course Name"
                  className="bg-dark border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-neon"
                  required
                />
                <select
                  name="semester"
                  className="bg-dark border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-neon"
                  required
                >
                  <option value={1}>Semester 1</option>
                  <option value={2}>Semester 2</option>
                </select>
                <input
                  name="max_score"
                  type="number"
                  placeholder="Max Score (e.g., 15)"
                  className="bg-dark border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-neon"
                  required
                />
                <textarea
                  name="description"
                  placeholder="Description"
                  className="md:col-span-2 bg-dark border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-neon"
                  rows="3"
                  required
                />
                <div className="md:col-span-2">
                  <button type="submit" className="neon-button w-full md:w-auto">Add Course</button>
                </div>
              </form>
            </div>

            {/* Courses List */}
            <div>
              <h2 className="text-xl font-semibold text-neon mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-neon rounded-full"></span> Existing Courses
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Name</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Semester</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Max Score</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map(course => (
                      <tr key={course.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">{course.name}</td>
                        <td className="py-3 px-4">{course.semester}</td>
                        <td className="py-3 px-4">{course.max_score || 15}</td>
                        <td className="py-3 px-4 space-x-3">
                          <button onClick={() => handleEditClick(course)} className="text-yellow-400 hover:text-yellow-300 text-sm">Edit</button>
                          <button onClick={() => handleDeleteCourse(course.id)} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'grades' && (
          <div>
            <h2 className="text-xl font-semibold text-neon mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-neon rounded-full"></span> Upload Grades (Excel)
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              Excel file columns: <span className="text-neon">Student ID, Student Name, Midterm Score</span><br />
              Use <span className="text-neon">-</span> for missing grades.
            </p>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Select Course</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full bg-dark border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-neon"
                required
              >
                <option value="">-- Choose a course --</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.name} (Max: {course.max_score || 15})</option>
                ))}
              </select>
            </div>
            <form onSubmit={handleUploadGrades} className="space-y-5">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <label className="relative cursor-pointer bg-dark border border-white/20 rounded-xl px-5 py-2 text-white hover:border-neon transition-colors">
                  Choose File
                  <input
                    id="gradesFileInput"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => setGradesFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </label>
                {gradesFile && <span className="text-sm text-gray-300">{gradesFile.name}</span>}
              </div>
              <button type="submit" disabled={loading} className="neon-button w-full sm:w-auto disabled:opacity-50">
                {loading ? 'Uploading...' : 'Upload Grades'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'resources' && <ResourceManager />}
        {activeTab === 'roadmap' && <RoadmapManager />}
      </div>

      {/* Edit Course Modal */}
      {editingCourse && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setEditingCourse(null)}
        >
          <div
            className="bg-charcoal border border-neon rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold neon-text mb-5">Edit Course</h2>
            <form onSubmit={handleUpdateCourse} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-1 text-sm">Course Name</label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditFormChange}
                  className="w-full bg-dark border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-neon"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1 text-sm">Semester</label>
                <select
                  name="semester"
                  value={editFormData.semester}
                  onChange={handleEditFormChange}
                  className="w-full bg-dark border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-neon"
                >
                  <option value={1}>Semester 1</option>
                  <option value={2}>Semester 2</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-1 text-sm">Max Score</label>
                <input
                  type="number"
                  name="max_score"
                  value={editFormData.max_score}
                  onChange={handleEditFormChange}
                  className="w-full bg-dark border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-neon"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1 text-sm">Description</label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditFormChange}
                  className="w-full bg-dark border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-neon"
                  rows="3"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading} className="neon-button flex-1">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2 border border-white/20 rounded-xl hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;