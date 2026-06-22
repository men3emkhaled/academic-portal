import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
  Plus, Edit3, Trash2, X, Mail, 
  Search, UserCircle, CheckCircle
} from 'lucide-react';

const DoctorManager = () => {
  const { t, i18n } = useTranslation();
  const [doctors, setDoctors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorCourses, setDoctorCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', department: ''
  });

  useEffect(() => {
    fetchDoctors();
    fetchCourses();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/doctors');
      setDoctors(res.data);
    } catch (error) {
      toast.error(t('admin.messages.load_doctors_failed'));
    } finally { setLoading(false); }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (modalType === 'edit') {
        await api.put(`/admin/doctors/${selectedDoctor.id}`, formData);
      } else {
        await api.post('/admin/doctors', formData);
      }
      toast.success(t('common.success'));
      setModalType(null);
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.messages.operation_failed'));
    } finally { setLoading(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(t('admin.doctors.delete_confirm', { name }))) return;
    try {
      await api.delete(`/admin/doctors/${id}`);
      toast.success(t('common.success'));
      fetchDoctors();
    } catch (error) {
      toast.error(t('admin.messages.delete_doctor_failed'));
    }
  };

  const openEditModal = (doctor) => {
    setSelectedDoctor(doctor);
    setFormData({
      name: doctor.name || '',
      email: doctor.email || '',
      password: '',
      department: doctor.department || ''
    });
    setModalType('edit');
  };

  const openCoursesModal = async (doctor) => {
    setSelectedDoctor(doctor);
    try {
      const res = await api.get(`/admin/doctors/${doctor.id}/courses`);
      setDoctorCourses(res.data || []);
    } catch (error) {
      toast.error(t('admin.doctors.load_courses_failed'));
    }
    setModalType('courses');
  };

  const removeCourseFromDoctor = async (doctorId, courseId) => {
    try {
      await api.delete(`/admin/doctors/${doctorId}/courses/${courseId}`);
      toast.success(t('common.success'));
      setDoctorCourses(prev => prev.filter(c => c.id !== courseId));
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.doctors.remove_course_failed'));
    }
  };

  const addCourseToDoctor = async (e) => {
    e.preventDefault();
    const form = e.target;
    const courseId = form.courseId.value;
    if (!courseId) return;
    try {
      await api.post(`/admin/doctors/${selectedDoctor.id}/courses`, { courseId });
      toast.success(t('common.success'));
      const res = await api.get(`/admin/doctors/${selectedDoctor.id}/courses`);
      setDoctorCourses(res.data || []);
      form.reset();
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.doctors.add_course_failed'));
    }
  };

  const filteredDoctors = doctors.filter(d =>
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-10 max-w-[1400px] mx-auto w-full px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.doctors.title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {doctors.length} {t('admin.doctors.active_count')}
          </p>
        </div>
        <button onClick={() => { setSelectedDoctor(null); setFormData({ name: '', email: '', password: '', department: '' }); setModalType('add'); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          {t('admin.doctors.add_doctor')}
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('admin.doctors.search_placeholder')}
          className="w-full bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDoctors.length === 0 ? (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
            <UserCircle className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-400">{t('admin.doctors.no_doctors')}</p>
          </div>
        ) : (
          filteredDoctors.map((doctor) => (
            <div key={doctor.id} className="bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <UserCircle className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{doctor.name}</h3>
                    <p className="text-xs text-gray-400">{doctor.email}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-500">{doctor.department || '—'}</span>
              </div>
              <div className="flex gap-1.5 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button onClick={() => openEditModal(doctor)} className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors">
                  <Edit3 className="w-3.5 h-3.5 inline mr-1" />{t('common.edit')}
                </button>
                <button onClick={() => openCoursesModal(doctor)} className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-[#059669] hover:bg-[#059669]/10 rounded-lg transition-colors">
                  {t('admin.doctors.courses')}
                </button>
                <button onClick={() => handleDelete(doctor.id, doctor.name)} className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {(modalType === 'add' || modalType === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setModalType(null)} className="absolute inset-0 bg-black/40" />
          <div className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-gray-700 rounded-xl w-full max-w-md relative z-10 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#059669]/10 rounded-lg flex items-center justify-center text-[#059669]">
                  {modalType === 'edit' ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {modalType === 'edit' ? t('admin.doctors.edit_doctor') : t('admin.doctors.add_doctor')}
                </h3>
              </div>
              <button onClick={() => setModalType(null)} className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">{t('admin.doctors.name')} *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">{t('admin.doctors.email')} *</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">{t('admin.doctors.password')}</label>
                <input type="text" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none" placeholder={modalType === 'edit' ? t('admin.doctors.password_edit') : ''} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">{t('admin.doctors.department')}</label>
                <input type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none" />
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="submit" disabled={loading} className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                  {loading ? '...' : (modalType === 'edit' ? t('common.save') : t('admin.doctors.add_doctor'))}
                </button>
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors">
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Courses Modal */}
      {modalType === 'courses' && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setModalType(null)} className="absolute inset-0 bg-black/40" />
          <div className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-gray-700 rounded-xl w-full max-w-lg relative z-10 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#059669]/10 rounded-lg flex items-center justify-center text-[#059669]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t('admin.doctors.courses')}</h3>
                  <p className="text-xs text-gray-400">{selectedDoctor.name}</p>
                </div>
              </div>
              <button onClick={() => setModalType(null)} className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <form onSubmit={addCourseToDoctor} className="flex gap-2 mb-4">
              <select name="courseId" className="flex-1 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none">
                <option value="">{t('admin.doctors.select_course')}</option>
                {courses.filter(c => !doctorCourses.find(dc => dc.id === c.id)).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button type="submit" className="px-3 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {doctorCourses.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">{t('admin.doctors.no_courses_assigned')}</p>
              ) : (
                doctorCourses.map(c => (
                  <div key={c.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-sm text-gray-900 dark:text-white">{c.name}</span>
                    <button onClick={() => removeCourseFromDoctor(selectedDoctor.id, c.id)} className="text-red-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorManager;
