import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
  Plus, Edit3, Trash2, X, BookOpen, GraduationCap, 
  Mail, Shield, Building2, ChevronRight, Activity, 
  Search, UserCircle, Settings, Layers, Zap, CheckCircle, Users, Box
} from 'lucide-react';

const DoctorManager = () => {
  const { t, i18n } = useTranslation();
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
    <div className="space-y-16 lg:space-y-24 animate-in fade-in duration-700 pb-20 max-w-[1500px] mx-auto w-full">
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10 text-start">
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30">{t('admin.sidebar.tabs.doctors')}</span>
          </div>
          <h1 className={`text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-[0.95] tracking-tighter uppercase text-gray-900 dark:text-white ${i18n.language === 'ar' ? 'font-arabic' : ''}`}>
            {t('admin.doctors.title')}
          </h1>
        </div>

        <div className="bg-primary text-white p-8 rounded-[2.5rem] shadow-lg shadow-primary/20 flex flex-col justify-between relative overflow-hidden group min-w-[280px]">
          <div className="absolute inset-inline-end-0 top-0 w-32 h-32 bg-white/10 hidden rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-black/10 px-3 py-1 rounded-full">{t('admin.doctors.faculty_grid')}</span>
          </div>
          <div className="mt-4 relative z-10 text-start">
            <p className="text-6xl font-black tracking-tighter">{doctors.length}</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">{t('admin.doctors.authorized_entities')}</p>
          </div>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 relative group">
           <Search className="absolute inset-inline-start-8 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-primary transition-colors" />
           <input 
             type="text"
             placeholder={t('common.search')}
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[2.5rem] ps-20 pe-10 py-8 text-gray-900 dark:text-white font-black text-xl tracking-tighter uppercase focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm"
           />
        </div>
        
        <button
          onClick={() => handleOpenModal('add')}
          className="group bg-black dark:bg-white text-white dark:text-black rounded-[2.5rem] p-8 flex items-center justify-between gap-6 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-6 relative z-10 text-start">
            <div className="w-14 h-14 bg-white/10 dark:bg-black/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-90 transition-all duration-700">
              <Plus className="w-7 h-7" />
            </div>
            <div>
               <span className="block text-xl font-black uppercase tracking-tighter leading-none">{t('admin.doctors.add_instructor')}</span>
               <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 italic">{t('admin.doctors.identity_registration')}</span>
            </div>
          </div>
          <ChevronRight className={`w-6 h-6 opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all ${i18n.language === 'ar' ? 'rotate-180 group-hover:-translate-x-2' : ''}`} />
        </button>
      </div>

      {/* Main Content: Table Matrix */}
      <div className="bg-white dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-sm relative group">
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
              {loading ? (
                 <tr>
                    <td colSpan="5" className="py-40 text-center">
                        <Activity className="w-16 h-16 text-primary animate-spin mx-auto opacity-20" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-6">{t('admin.doctors.scanning')}</p>
                    </td>
                 </tr>
              ) : filteredDoctors.length === 0 ? (
                <tr>
                    <td colSpan="5" className="text-center py-40">
                        <div className="flex flex-col items-center gap-6 opacity-20 grayscale">
                            <GraduationCap className="w-24 h-24 text-gray-400" />
                            <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-xs">{t('admin.doctors.no_doctors')}</p>
                        </div>
                    </td>
                </tr>
              ) : (
                filteredDoctors.map((doctor) => (
                  <tr 
                    key={doctor.id}
                    className="group/row hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-700"
                  >
                    <td className="py-8 px-10">
                      <div className="flex items-center gap-6 text-start">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center font-black text-2xl group-hover/row:bg-white/20 group-hover/row:text-white transition-all duration-700">
                          {doctor.name?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                            <h4 className="font-black tracking-tighter text-2xl uppercase leading-none group-hover/row:text-white transition-colors">{doctor.name}</h4>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 group-hover/row:opacity-60 transition-opacity mt-2">{t('admin.doctors.identifier_protocol')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-8 px-10">
                        <div className="flex items-center gap-3 font-black text-[11px] tracking-widest opacity-60 group-hover/row:opacity-100 transition-opacity">
                            <Mail className="w-4 h-4" />
                            {doctor.email}
                        </div>
                    </td>
                    <td className="py-8 px-10 text-center">
                      <span className="px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-[10px] font-black uppercase tracking-widest group-hover/row:bg-white/20 transition-colors">
                        {doctor.department || 'CORE_FACULTY'}
                      </span>
                    </td>
                    <td className="py-8 px-10 text-center">
                      <button 
                        onClick={() => handleOpenModal('courses', doctor)}
                        className="bg-primary/10 text-primary border border-primary/20 px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.05] active:scale-95 group-hover/row:bg-white group-hover/row:text-black group-hover/row:border-white"
                      >
                        {t('admin.doctors.courses_count', { count: doctor.courses_count })}
                      </button>
                    </td>
                    <td className="py-8 px-10">
                      <div className="flex justify-inline-end gap-3 opacity-0 group-hover/row:opacity-100 transition-all scale-90 group-hover/row:scale-100">
                        <button onClick={() => handleOpenModal('edit', doctor)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 border border-white/20 text-white dark:text-black transition-all">
                          <Edit3 className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(doctor.id)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Cinematic Modal */}
      <>
      {(modalType === 'add' || modalType === 'edit') && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div onClick={handleCloseModal} className="absolute inset-0 bg-gray-950/40 dark:bg-black/80 backdrop-blur-sm" />
          <div 
            className="bg-white dark:bg-[#080808] border border-gray-100 dark:border-white/5 rounded-[3.5rem] p-10 lg:p-12 w-full max-w-xl shadow-2xl relative overflow-hidden z-10" 
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Background Glow */}
            <div className="absolute top-0 inset-inline-end-0 w-80 h-80 bg-primary/5 hidden rounded-full pointer-events-none"></div>

            <div className="flex items-center justify-between mb-12 pb-8 border-b border-gray-100 dark:border-white/5 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner text-primary group-hover:scale-110 transition-transform duration-500">
                    <UserCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                        {modalType === 'add' ? t('admin.doctors.add_new_instructor') : t('admin.doctors.edit_instructor')}
                    </h3>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">{t('admin.doctors.identity_registration')}</p>
                  </div>
                </div>
                <button onClick={handleCloseModal} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-500 rounded-2xl hover:text-rose-600 transition-[color,background-color,border-color,transform,opacity] shadow-sm">
                  <X className="w-6 h-6" />
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.doctors.full_name')} *</label>
                <div className="relative group/name">
                    <UserCircle className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/name:text-primary transition-colors" />
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl ps-14 pe-6 py-5 font-black focus:ring-4 focus:ring-primary/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner uppercase tracking-widest text-sm"
                        placeholder="John Doe"
                    />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.doctors.email_label')} *</label>
                <div className="relative group/email">
                    <Mail className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/email:text-primary transition-colors" />
                    <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl ps-14 pe-6 py-5 font-black focus:ring-4 focus:ring-primary/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner font-mono text-xs tracking-wider"
                        placeholder="doctor@academy.edu"
                    />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.doctors.password')}</label>
                <div className="relative group/pass">
                    <Shield className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/pass:text-primary transition-colors" />
                    <input
                        type="password"
                        required={modalType === 'add'}
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        placeholder={modalType === 'edit' ? t('admin.doctors.password_hint') : "••••••••"}
                        className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl ps-14 pe-6 py-5 font-black focus:ring-4 focus:ring-primary/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner placeholder:text-[9px] placeholder:font-black uppercase placeholder:tracking-[0.2em]"
                    />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.doctors.department')}</label>
                <div className="relative group/dept">
                    <Building2 className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/dept:text-primary transition-colors" />
                    <input
                        type="text"
                        value={formData.department}
                        onChange={e => setFormData({...formData, department: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl ps-14 pe-6 py-5 font-black focus:ring-4 focus:ring-primary/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner uppercase tracking-widest text-[11px]"
                        placeholder="e.g. Computer Science"
                    />
                </div>
              </div>
              
              <div className="flex gap-6 pt-12 border-t border-gray-100 dark:border-white/5">
                <button type="submit" className="flex-1 bg-primary hover:bg-primary text-white font-black py-5 rounded-[2.5rem] shadow-xl shadow-primary/20 transition-[color,background-color,border-color,transform,opacity] hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 group/save">
                    <CheckCircle className="w-6 h-6 group-hover/save:scale-110 transition-transform" />
                    <span className="uppercase tracking-widest text-xs">
                        {modalType === 'add' ? t('admin.doctors.create_instructor') : t('admin.doctors.save_changes')}
                    </span>
                </button>
                <button type="button" onClick={handleCloseModal} className="px-12 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-black py-5 rounded-[2.5rem] transition-[color,background-color,border-color,transform,opacity] uppercase tracking-widest text-xs">
                    {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </>

      {/* Courses Assignment Cinematic Modal */}
      <>
      {modalType === 'courses' && selectedDoctor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div onClick={handleCloseModal} className="absolute inset-0 bg-gray-950/40 dark:bg-black/80 backdrop-blur-sm" />
          <div 
            className="bg-white dark:bg-[#080808] border border-gray-100 dark:border-white/5 rounded-[3.5rem] p-10 lg:p-12 w-full max-w-2xl shadow-2xl relative overflow-hidden z-10 max-h-[85vh] flex flex-col" 
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Background Glow */}
            <div className="absolute top-0 inset-inline-end-0 w-80 h-80 bg-primary/10 hidden rounded-full pointer-events-none"></div>

            <div className="flex items-center justify-between mb-10 pb-8 border-b border-gray-100 dark:border-white/5 shrink-0 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-[1.5rem] flex items-center justify-center border border-primary/20 shadow-inner text-primary group-hover:scale-110 transition-transform duration-500">
                    <Layers className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">{t('admin.doctors.assign_courses')}</h3>
                    <p className="text-primary text-[10px] font-black uppercase tracking-widest mt-1 italic">{t('admin.doctors.instructor_prefix')} {selectedDoctor.name}</p>
                  </div>
                </div>
                <button onClick={handleCloseModal} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-500 rounded-2xl hover:text-primary transition-[color,background-color,border-color,transform,opacity] shadow-sm">
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
                  <div key={course.id} className="group flex items-center justify-between p-8 bg-gray-50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-[2.5rem] hover:border-primary/30 hover:bg-primary/[0.02] transition-[color,background-color,border-color,transform,opacity] duration-500 hover:shadow-xl hover:shadow-primary/5">
                    <div className="flex items-center gap-6 min-w-0">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-[color,background-color,border-color,transform,opacity] duration-700 shadow-inner group-hover:scale-110 ${
                          doctorCourses.includes(course.id) 
                          ? 'bg-primary text-white border-primary shadow-primary/20' 
                          : 'bg-white dark:bg-black/40 border-gray-100 dark:border-white/10 text-gray-400'
                      }`}>
                          <BookOpen className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                          <h4 className="font-black text-gray-900 dark:text-white tracking-tight uppercase text-lg group-hover:text-primary transition-colors truncate">{course.name}</h4>
                          <div className="flex items-center gap-3 mt-1.5 text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest italic">
                              <span>{t('admin.doctors.semester')}: {course.semester}</span>
                              <div className="w-1 h-1 bg-gray-200 dark:bg-slate-800 rounded-full"></div>
                              <span>{t('admin.doctors.dept_code')}: {course.department_id}</span>
                          </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleCourse(course.id)}
                      className={`px-10 py-4.5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-[color,background-color,border-color,transform,opacity] hover:scale-[1.02] active:scale-95 shadow-xl shrink-0 ${
                        doctorCourses.includes(course.id)
                          ? 'bg-rose-500 text-white shadow-rose-500/20 border border-rose-600'
                          : 'bg-primary text-white shadow-primary/20 border border-primary'
                      }`}
                    >
                      {doctorCourses.includes(course.id) ? t('admin.doctors.remove') : t('admin.doctors.assign')}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      </>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(46, 204, 113, 0.1); 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(46, 204, 113, 0.2); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default DoctorManager;
