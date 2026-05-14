import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
  Plus, Edit3, Trash2, X, BookOpen, GraduationCap, 
  Mail, Shield, Building2, ChevronRight, Activity, 
  Search, UserCircle, Settings, Layers, Zap, CheckCircle, Users, Box
} from 'lucide-react';

const DoctorManager = () => {
  const { t } = useTranslation();
  const [doctors, setDoctors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalType, setModalType] = useState(null); // 'add', 'edit', 'courses'
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorCourses, setDoctorCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

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
      toast.error(t('admin.messages.load_doctors_failed'));
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data);
    } catch (error) {
      console.error(t('admin.messages.load_courses_failed'));
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
        password: '', 
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
        if (!formData.password) return toast.error(t('admin.messages.password_req'));
        await api.post('/admin/doctors', formData);
        toast.success(t('common.success'));
      } else if (modalType === 'edit') {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await api.put(`/admin/doctors/${selectedDoctor.id}`, payload);
        toast.success(t('common.success'));
      }
      handleCloseModal();
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.messages.operation_failed'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.doctors.delete_confirm'))) return;
    try {
      await api.delete(`/admin/doctors/${id}`);
      toast.success(t('common.success'));
      fetchDoctors();
    } catch (error) {
      toast.error(t('admin.messages.delete_doctor_failed'));
    }
  };

  const fetchDoctorCourses = async (doctorId) => {
    try {
      const res = await api.get(`/admin/doctors/${doctorId}/courses`);
      setDoctorCourses(res.data.map(c => c.id));
    } catch (error) {
      toast.error(t('admin.messages.load_doctor_courses_failed'));
    }
  };

  const handleToggleCourse = async (courseId) => {
    const isAssigned = doctorCourses.includes(courseId);
    try {
      if (isAssigned) {
        await api.delete(`/admin/doctors/${selectedDoctor.id}/courses/${courseId}`);
        setDoctorCourses(prev => prev.filter(id => id !== courseId));
        toast.success(t('admin.doctors.remove'));
      } else {
        await api.post(`/admin/doctors/${selectedDoctor.id}/courses/${courseId}`);
        setDoctorCourses(prev => [...prev, courseId]);
        toast.success(t('admin.doctors.assign'));
      }
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.messages.toggle_course_failed'));
    }
  };

  const filteredDoctors = doctors.filter(d => 
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 lg:space-y-10 animate-in fade-in duration-700 pb-10">
      {/* Header Bento Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex items-center gap-6 bg-white/50 dark:bg-white/[0.02] backdrop-blur-md border border-gray-100 dark:border-white/5 p-8 rounded-[2.5rem] shadow-sm">
          <div className="w-16 h-16 bg-blue-500/10 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-inner group transition-transform duration-500 hover:scale-110">
            <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {t('admin.doctors.title')}
            </h2>
            <p className="text-gray-500 dark:text-slate-500 text-sm font-bold mt-1 uppercase tracking-widest">{t('admin.doctors.description')}</p>
          </div>
        </div>
        
        <div className="bg-blue-600 text-white p-8 rounded-[2.5rem] shadow-lg shadow-blue-600/20 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-inline-end-0 top-0 w-32 h-32 bg-white/10 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-black/10 px-3 py-1 rounded-full">{t('admin.doctors.faculty_grid')}</span>
          </div>
          <div className="mt-4 relative z-10">
            <p className="text-4xl font-black">{doctors.length}</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">{t('admin.doctors.authorized_entities')}</p>
          </div>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch gap-6">
        <div className="relative flex-1 group">
          <Search className="absolute inset-inline-start-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text"
            placeholder={t('common.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-[2rem] ps-16 pe-8 py-5 text-gray-900 dark:text-white font-black focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-inner uppercase tracking-widest text-[11px]"
          />
        </div>
        <button
          onClick={() => handleOpenModal('add')}
          className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-black py-4.5 px-10 rounded-[2rem] shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all whitespace-nowrap group/add"
        >
          <Plus className="w-5 h-5 group-hover/add:rotate-90 transition-transform duration-500" /> 
          <span className="uppercase tracking-widest text-xs">{t('admin.doctors.add_instructor')}</span>
        </button>
      </div>

      {/* Main Content: Table View */}
      <div className="bg-white/50 dark:bg-white/[0.01] backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-sm relative group">
        <div className="absolute -inset-inline-end-20 -bottom-20 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>

        <div className="overflow-x-auto custom-scrollbar relative z-10">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/[0.01]">
                <th className="py-8 px-10 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.3em] text-start">{t('admin.doctors.name')}</th>
                <th className="py-8 px-10 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.3em] text-start">{t('admin.doctors.email')}</th>
                <th className="py-8 px-10 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.3em] text-center">{t('admin.doctors.department')}</th>
                <th className="py-8 px-10 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.3em] text-center">{t('admin.doctors.assigned_courses')}</th>
                <th className="py-8 px-10 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.3em] text-inline-end">{t('admin.doctors.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.03]">
              <AnimatePresence mode="popLayout">
              {loading ? (
                 <tr>
                    <td colSpan="5" className="py-32 text-center">
                        <Activity className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-6">{t('admin.doctors.scanning')}</p>
                    </td>
                 </tr>
              ) : filteredDoctors.length === 0 ? (
                <tr>
                    <td colSpan="5" className="text-center py-32">
                        <div className="flex flex-col items-center gap-6 opacity-30 grayscale">
                            <GraduationCap className="w-20 h-20 text-gray-400" />
                            <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-xs">{t('admin.doctors.no_doctors')}</p>
                        </div>
                    </td>
                </tr>
              ) : (
                filteredDoctors.map((doctor, idx) => (
                  <motion.tr 
                    key={doctor.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="group/row hover:bg-white dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-8 px-10">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-blue-500/5 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/10 text-blue-600 dark:text-blue-400 font-black text-xl shadow-inner group-hover/row:bg-blue-600 group-hover/row:text-white transition-all duration-500">
                          {doctor.name?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <h4 className="text-gray-900 dark:text-white font-black tracking-tight text-lg group-hover/row:text-blue-600 transition-colors">{t('admin.doctors.instructor_prefix')} {doctor.name}</h4>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1 italic">{t('admin.doctors.identifier_protocol')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-8 px-10">
                        <div className="flex items-center gap-3 text-gray-500 dark:text-slate-400 font-black text-xs tracking-wider">
                            <Mail className="w-4 h-4 text-blue-500/40" />
                            {doctor.email}
                        </div>
                    </td>
                    <td className="py-8 px-10 text-center">
                      <span className="px-4 py-1.5 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-slate-400 text-[9px] font-black uppercase tracking-widest italic group-hover/row:border-blue-500/20 transition-all">
                        {doctor.department || t('admin.doctors.general_core')}
                      </span>
                    </td>
                    <td className="py-8 px-10 text-center">
                      <button 
                        onClick={() => handleOpenModal('courses', doctor)}
                        className="bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.05] active:scale-95 flex items-center justify-center gap-3 mx-auto group/badge"
                      >
                        <BookOpen className="w-4 h-4 group-hover/badge:rotate-12 transition-transform" /> 
                        {t('admin.doctors.courses_count', { count: doctor.courses_count })}
                      </button>
                    </td>
                    <td className="py-8 px-10">
                      <div className="flex justify-inline-end gap-3 opacity-0 group-hover/row:opacity-100 transition-all scale-90 group-hover/row:scale-100">
                        <button onClick={() => handleOpenModal('edit', doctor)} className="w-11 h-11 flex items-center justify-center rounded-xl bg-amber-500/5 text-amber-500 border border-amber-500/10 hover:bg-amber-500 hover:text-white transition-all shadow-sm">
                          <Edit3 className="w-4.5 h-4.5" />
                        </button>
                        <button onClick={() => handleDelete(doctor.id)} className="w-11 h-11 flex items-center justify-center rounded-xl bg-rose-500/5 text-rose-500 border border-rose-500/10 hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Cinematic Modal */}
      <AnimatePresence>
      {(modalType === 'add' || modalType === 'edit') && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="absolute inset-0 bg-gray-950/40 dark:bg-black/80 backdrop-blur-md" />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-[#080808] border border-gray-100 dark:border-white/5 rounded-[3.5rem] p-10 lg:p-12 w-full max-w-xl shadow-2xl relative overflow-hidden z-10" 
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Background Glow */}
            <div className="absolute top-0 inset-inline-end-0 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="flex items-center justify-between mb-12 pb-8 border-b border-gray-100 dark:border-white/5 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-blue-500/10 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-inner text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-500">
                    <UserCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                        {modalType === 'add' ? t('admin.doctors.add_new_instructor') : t('admin.doctors.edit_instructor')}
                    </h3>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">{t('admin.doctors.identity_registration')}</p>
                  </div>
                </div>
                <button onClick={handleCloseModal} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-500 rounded-2xl hover:text-rose-600 transition-all shadow-sm">
                  <X className="w-6 h-6" />
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.doctors.full_name')} *</label>
                <div className="relative group/name">
                    <UserCircle className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/name:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl ps-14 pe-6 py-5 font-black focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-inner uppercase tracking-widest text-sm"
                        placeholder="John Doe"
                    />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.doctors.email_label')} *</label>
                <div className="relative group/email">
                    <Mail className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/email:text-blue-500 transition-colors" />
                    <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl ps-14 pe-6 py-5 font-black focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-inner font-mono text-xs tracking-wider"
                        placeholder="doctor@academy.edu"
                    />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.doctors.password')}</label>
                <div className="relative group/pass">
                    <Shield className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/pass:text-blue-500 transition-colors" />
                    <input
                        type="password"
                        required={modalType === 'add'}
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        placeholder={modalType === 'edit' ? t('admin.doctors.password_hint') : "••••••••"}
                        className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl ps-14 pe-6 py-5 font-black focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-inner placeholder:text-[9px] placeholder:font-black uppercase placeholder:tracking-[0.2em]"
                    />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.doctors.department')}</label>
                <div className="relative group/dept">
                    <Building2 className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/dept:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        value={formData.department}
                        onChange={e => setFormData({...formData, department: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl ps-14 pe-6 py-5 font-black focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-inner uppercase tracking-widest text-[11px]"
                        placeholder="e.g. Computer Science"
                    />
                </div>
              </div>
              
              <div className="flex gap-6 pt-12 border-t border-gray-100 dark:border-white/5">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-[2.5rem] shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 group/save">
                    <CheckCircle className="w-6 h-6 group-hover/save:scale-110 transition-transform" />
                    <span className="uppercase tracking-widest text-xs">
                        {modalType === 'add' ? t('admin.doctors.create_instructor') : t('admin.doctors.save_changes')}
                    </span>
                </button>
                <button type="button" onClick={handleCloseModal} className="px-12 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-black py-5 rounded-[2.5rem] transition-all uppercase tracking-widest text-xs">
                    {t('common.cancel')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Courses Assignment Cinematic Modal */}
      <AnimatePresence>
      {modalType === 'courses' && selectedDoctor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="absolute inset-0 bg-gray-950/40 dark:bg-black/80 backdrop-blur-md" />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-[#080808] border border-gray-100 dark:border-white/5 rounded-[3.5rem] p-10 lg:p-12 w-full max-w-2xl shadow-2xl relative overflow-hidden z-10 max-h-[85vh] flex flex-col" 
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Background Glow */}
            <div className="absolute top-0 inset-inline-end-0 w-80 h-80 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="flex items-center justify-between mb-10 pb-8 border-b border-gray-100 dark:border-white/5 shrink-0 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-[1.5rem] flex items-center justify-center border border-emerald-500/20 shadow-inner text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-500">
                    <Layers className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">{t('admin.doctors.assign_courses')}</h3>
                    <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-1 italic">{t('admin.doctors.instructor_prefix')} {selectedDoctor.name}</p>
                  </div>
                </div>
                <button onClick={handleCloseModal} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-500 rounded-2xl hover:text-emerald-600 transition-all shadow-sm">
                  <X className="w-6 h-6" />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pe-4 space-y-6 custom-scrollbar relative z-10">
              {courses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-32 opacity-30 grayscale text-center">
                    <Box className="w-16 h-16 text-gray-400 mb-6" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">{t('admin.doctors.void_registry')}</p>
                  </div>
              ) : (
                courses.map(course => (
                  <div key={course.id} className="group flex items-center justify-between p-8 bg-gray-50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-[2.5rem] hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] transition-all duration-500 hover:shadow-xl hover:shadow-emerald-500/5">
                    <div className="flex items-center gap-6 min-w-0">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-700 shadow-inner group-hover:scale-110 ${
                          doctorCourses.includes(course.id) 
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/20' 
                          : 'bg-white dark:bg-black/40 border-gray-100 dark:border-white/10 text-gray-400'
                      }`}>
                          <BookOpen className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                          <h4 className="font-black text-gray-900 dark:text-white tracking-tight uppercase text-lg group-hover:text-emerald-500 transition-colors truncate">{course.name}</h4>
                          <div className="flex items-center gap-3 mt-1.5 text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest italic">
                              <span>{t('admin.doctors.semester')}: {course.semester}</span>
                              <div className="w-1 h-1 bg-gray-200 dark:bg-slate-800 rounded-full"></div>
                              <span>{t('admin.doctors.dept_code')}: {course.department_id}</span>
                          </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleCourse(course.id)}
                      className={`px-10 py-4.5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 shadow-xl shrink-0 ${
                        doctorCourses.includes(course.id)
                          ? 'bg-rose-500 text-white shadow-rose-500/20 border border-rose-600'
                          : 'bg-emerald-500 text-white shadow-emerald-500/20 border border-emerald-600'
                      }`}
                    >
                      {doctorCourses.includes(course.id) ? t('admin.doctors.remove') : t('admin.doctors.assign')}
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(59, 130, 246, 0.1); 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.2); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default DoctorManager;
