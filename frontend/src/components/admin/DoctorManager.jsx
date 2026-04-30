import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit3, Trash2, X, BookOpen, GraduationCap } from 'lucide-react';

const DoctorManager = () => {
  const [doctors, setDoctors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalType, setModalType] = useState(null); // 'add', 'edit', 'courses'
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorCourses, setDoctorCourses] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: ''
  });

  useEffect(() => {
    fetchDoctors();
    fetchCourses();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/doctors');
      setDoctors(res.data);
    } catch (error) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data);
    } catch (error) {
      console.error('Failed to load courses');
    }
  };

  const handleOpenModal = (type, doctor = null) => {
    setModalType(type);
    setSelectedDoctor(doctor);
    
    if (type === 'add') {
      setFormData({ name: '', email: '', password: '', department: '' });
    } else if (type === 'edit') {
      setFormData({
        name: doctor.name,
        email: doctor.email,
        password: '', // Leave blank unless changing
        department: doctor.department || ''
      });
    } else if (type === 'courses') {
      fetchDoctorCourses(doctor.id);
    }
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedDoctor(null);
    setDoctorCourses([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'add') {
        if (!formData.password) return toast.error('Password is required');
        await api.post('/admin/doctors', formData);
        toast.success('Doctor added successfully');
      } else if (modalType === 'edit') {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await api.put(`/admin/doctors/${selectedDoctor.id}`, payload);
        toast.success('Doctor updated successfully');
      }
      handleCloseModal();
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor? All related courses will be unassigned.')) return;
    try {
      await api.delete(`/admin/doctors/${id}`);
      toast.success('Doctor deleted');
      fetchDoctors();
    } catch (error) {
      toast.error('Failed to delete doctor');
    }
  };

  // --- Course Assignment Methods ---
  const fetchDoctorCourses = async (doctorId) => {
    try {
      const res = await api.get(`/admin/doctors/${doctorId}/courses`);
      setDoctorCourses(res.data.map(c => c.id));
    } catch (error) {
      toast.error('Failed to load doctor courses');
    }
  };

  const handleToggleCourse = async (courseId) => {
    const isAssigned = doctorCourses.includes(courseId);
    try {
      if (isAssigned) {
        await api.delete(`/admin/doctors/${selectedDoctor.id}/courses/${courseId}`);
        setDoctorCourses(prev => prev.filter(id => id !== courseId));
        toast.success('Course removed');
      } else {
        await api.post(`/admin/doctors/${selectedDoctor.id}/courses/${courseId}`);
        setDoctorCourses(prev => [...prev, courseId]);
        toast.success('Course assigned');
      }
      // Update the count in the main list
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to toggle course');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="text-blue-500 w-6 h-6" /> Doctor Management
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage faculty accounts and course assignments</p>
        </div>
        <button
          onClick={() => handleOpenModal('add')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/30"
        >
          <Plus className="w-5 h-5" /> Add Doctor
        </button>
      </div>

      <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : doctors.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p>No doctors found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-black/20 text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-bold">Name</th>
                  <th className="p-4 font-bold">Email</th>
                  <th className="p-4 font-bold text-center">Department</th>
                  <th className="p-4 font-bold text-center">Assigned Courses</th>
                  <th className="p-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {doctors.map(doctor => (
                  <tr key={doctor.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-medium text-gray-900 dark:text-white">{doctor.name}</td>
                    <td className="p-4 text-gray-500">{doctor.email}</td>
                    <td className="p-4 text-center">
                      <span className="bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 px-2 py-1 rounded text-xs font-bold">
                        {doctor.department || '-'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleOpenModal('courses', doctor)}
                        className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 px-3 py-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1 mx-auto hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                      >
                        <BookOpen className="w-3 h-3" /> {doctor.courses_count} Courses
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleOpenModal('edit', doctor)} className="p-2 text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-500/10 rounded-lg">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(doctor.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(modalType === 'add' || modalType === 'edit') && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111111] rounded-2xl w-full max-w-md p-6 relative border border-gray-200 dark:border-white/10">
            <button onClick={handleCloseModal} className="absolute right-4 top-4 p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-black mb-6 text-gray-900 dark:text-white">
              {modalType === 'add' ? 'Add New Doctor' : 'Edit Doctor'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Email (Login ID)</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Password</label>
                <input
                  type="password"
                  required={modalType === 'add'}
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  placeholder={modalType === 'edit' ? "Leave blank to keep unchanged" : ""}
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={e => setFormData({...formData, department: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white"
                />
              </div>
              
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl mt-4">
                {modalType === 'add' ? 'Create Doctor' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Courses Assignment Modal */}
      {modalType === 'courses' && selectedDoctor && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111111] rounded-2xl w-full max-w-2xl p-6 relative border border-gray-200 dark:border-white/10 max-h-[90vh] flex flex-col">
            <button onClick={handleCloseModal} className="absolute right-4 top-4 p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-black mb-1 text-gray-900 dark:text-white">
              Assign Courses
            </h3>
            <p className="text-gray-500 text-sm mb-6">Dr. {selectedDoctor.name}</p>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-2">
              {courses.map(course => (
                <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{course.name}</h4>
                    <p className="text-xs text-gray-500">Semester: {course.semester} | Dept: {course.department_id}</p>
                  </div>
                  <button
                    onClick={() => handleToggleCourse(course.id)}
                    className={`px-4 py-2 rounded-lg font-bold text-xs transition-colors ${
                      doctorCourses.includes(course.id)
                        ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30'
                        : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30'
                    }`}
                  >
                    {doctorCourses.includes(course.id) ? 'Remove' : 'Assign'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorManager;
