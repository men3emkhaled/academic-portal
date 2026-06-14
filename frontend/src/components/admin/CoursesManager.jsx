import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
  BookOpen, Plus, Edit3, Trash2, 
  Layers, CheckCircle, Activity,
  ChevronRight, Tag, AlignLeft, LayoutDashboard, Clock, X
} from 'lucide-react';

const CoursesManager = ({ departments }) => {
  const { t, i18n } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    semester: '1',
    credits: '3',
    department_id: '',
    description: ''
  });

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/courses?clear=true');
      setCourses(res.data);
    } catch (error) {
      toast.error(t('admin.messages.load_courses_failed'));
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingCourse) {
        await api.put(`/courses/${editingCourse.id}`, formData);
        toast.success(t('common.success'));
      } else {
        await api.post('/courses', formData);
        toast.success(t('common.success'));
      }
      resetForm();
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.messages.operation_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(t('admin.messages.delete_course_confirm', { name }))) return;
    try {
      await api.delete(`/courses/${id}`);
      toast.success(t('common.success'));
      fetchCourses();
    } catch (error) {
      toast.error(t('admin.messages.delete_course_failed'));
    }
  };

  const editCourse = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      code: course.code,
      semester: course.semester?.toString() || '1',
      credits: course.credits?.toString() || '3',
      department_id: course.department_id || '',
      description: course.description || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingCourse(null);
    setFormData({
      name: '',
      code: '',
      semester: '1',
      credits: '3',
      department_id: '',
      description: ''
    });
  };

  const isAr = i18n.language === 'ar';

  return (
    <div className="space-y-8 sm:space-y-16 lg:space-y-24 animate-in fade-in duration-700 pb-20 max-w-[1500px] mx-auto w-full text-start relative z-10 px-4 sm:px-0">
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] inset-inline-end-[-5%] w-[50vw] h-[50vw] bg-[#8b5cf6]/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] inset-inline-start-[-5%] w-[40vw] h-[40vw] bg-[#2cfc7d]/3 blur-[100px] rounded-full"></div>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-10 relative z-10">
        <div className="space-y-2 sm:space-y-4 max-w-2xl text-start">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2cfc7d]"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30">{t('admin.sidebar.tabs.courses')}</span>
          </div>
          <h1 className={`text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-[0.95] tracking-tighter uppercase text-gray-900 dark:text-white ${isAr ? 'font-arabic' : ''}`}>
            {t('admin.courses.title')}
          </h1>
        </div>

        <div className="bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white p-6 sm:p-8 rounded-[2.5rem] shadow-lg shadow-purple-600/20 flex flex-col justify-between relative overflow-hidden group min-w-[280px] w-full lg:w-auto">
          <div className="absolute inset-inline-end-0 top-0 w-32 h-32 bg-white/10 hidden rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-black/10 px-3 py-1 rounded-full">{t('admin.courses.course_nodes')}</span>
          </div>
          <div className="mt-4 relative z-10 text-start">
            <p className="text-5xl sm:text-6xl font-black tracking-tighter">{courses.length}</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">{t('admin.courses.validated_modules')}</p>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 relative z-20">
        <button
          onClick={() => setShowForm(true)}
          className="group bg-black dark:bg-white text-white dark:text-black rounded-[2.5rem] p-6 sm:p-10 flex items-center justify-between gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl relative overflow-hidden text-start w-full"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="flex items-center gap-4 sm:gap-6 relative z-10">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 dark:bg-black/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-90 transition-all duration-700">
              <Plus className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div className="text-start">
               <span className="block text-lg sm:text-2xl font-black uppercase tracking-tighter leading-none">{t('admin.courses.add_course')}</span>
               <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-1 sm:mt-1.5 block">{t('admin.courses.form_hint')}</span>
            </div>
          </div>
          <ChevronRight className={`w-6 h-6 sm:w-8 sm:h-8 opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all ${isAr ? 'rotate-180 group-hover:-translate-x-2' : ''}`} />
        </button>

        <div className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-6 sm:p-10 flex items-center justify-between shadow-sm group overflow-hidden relative">
           <div className="absolute inset-0 bg-[#2cfc7d] opacity-0 group-hover:opacity-5 transition-opacity" />
           <div className="space-y-1 relative z-10 text-start">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#2cfc7d]">{t('admin.courses.validated_modules')}</p>
              <h4 className="text-2xl sm:text-4xl font-black tracking-tighter uppercase">{t('admin.stats.active_users')}</h4>
           </div>
           <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full border border-[#2cfc7d]/20 flex items-center justify-center relative z-10 group-hover:rotate-180 transition-transform duration-1000">
              <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-[#2cfc7d]" />
           </div>
        </div>
      </div>

      {/* Courses Grouped by Department → Semester */}
      {(() => {
        // Build a map: department_name → semester → courses[]
        const deptMap = new Map();
        courses.forEach(course => {
          const deptKey = course.department_name || 'Shared / General';
          const sem = course.semester ?? 1;
          if (!deptMap.has(deptKey)) deptMap.set(deptKey, new Map());
          const semMap = deptMap.get(deptKey);
          if (!semMap.has(sem)) semMap.set(sem, []);
          semMap.get(sem).push(course);
        });

        if (courses.length === 0) {
          return (
            <div className="py-28 sm:py-40 text-center border-2 border-dashed border-gray-100 dark:border-white/10 rounded-[3rem] opacity-30 grayscale relative z-10">
              <BookOpen className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 text-gray-400" />
              <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-xs">{t('admin.courses.no_courses')}</p>
            </div>
          );
        }

        const semColors = {
          1: 'from-violet-500/10 to-violet-500/5 border-violet-500/20 text-violet-500',
          2: 'from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-500',
          3: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-500',
          4: 'from-amber-500/10 to-amber-500/5 border-amber-500/20 text-amber-500',
          5: 'from-rose-500/10 to-rose-500/5 border-rose-500/20 text-rose-500',
          6: 'from-cyan-500/10 to-cyan-500/5 border-cyan-500/20 text-cyan-500',
          7: 'from-pink-500/10 to-pink-500/5 border-pink-500/20 text-pink-500',
          8: 'from-orange-500/10 to-orange-500/5 border-orange-500/20 text-orange-500',
        };

        return (
          <div className="space-y-16 relative z-10">
            {[...deptMap.entries()].map(([deptName, semMap]) => (
              <div key={deptName} className="space-y-10">
                {/* Department Header */}
                <div className="flex items-center gap-4">
                  <div className="w-2 h-10 rounded-full bg-gradient-to-b from-[#8b5cf6] to-[#2cfc7d]" />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30">Department</p>
                    <h2 className={`text-2xl sm:text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white ${isAr ? 'font-arabic' : ''}`}>
                      {deptName}
                    </h2>
                  </div>
                  <div className="ms-auto bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 px-5 py-2.5 rounded-full">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      {[...semMap.values()].flat().length} modules
                    </span>
                  </div>
                </div>

                {/* Semesters within this department */}
                <div className="space-y-8 ps-6 border-s-2 border-gray-100 dark:border-white/5">
                  {[...semMap.entries()].sort(([a],[b]) => a - b).map(([sem, semCourses]) => {
                    const colorClass = semColors[sem] || semColors[1];
                    return (
                      <div key={sem} className="space-y-6">
                        {/* Semester Badge */}
                        <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border bg-gradient-to-r ${colorClass}`}>
                          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Semester {sem}</span>
                          <span className="text-[9px] font-black opacity-60">· {semCourses.length} courses</span>
                        </div>

                        {/* Course Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                          {semCourses.map((course) => (
                            <div
                              key={course.id}
                              className="group relative bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-6 sm:p-10 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-700 shadow-sm flex flex-col justify-between min-h-[300px] sm:min-h-[350px] overflow-hidden text-start"
                            >
                              <div className="absolute top-[-10%] inset-inline-end-[-5%] w-32 h-32 bg-[#8b5cf6]/10 blur-3xl rounded-full group-hover:bg-white/20 transition-all duration-700" />

                              <div className="space-y-6 sm:space-y-8 relative z-10">
                                <div className="flex justify-between items-start">
                                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#8b5cf6]/10 rounded-2xl flex items-center justify-center text-[#8b5cf6] dark:text-[#d4a3ff] group-hover:bg-white/20 transition-all duration-500">
                                    <Tag className="w-6 h-6 sm:w-7 sm:h-7" />
                                  </div>
                                  <div className="flex gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); editCourse(course); }} className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-gray-100 dark:border-white/10 flex items-center justify-center hover:bg-[#8b5cf6] hover:border-[#8b5cf6] hover:text-white transition-all shadow-sm">
                                      <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(course.id, course.name); }} className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-gray-100 dark:border-white/10 flex items-center justify-center hover:bg-rose-500 hover:border-rose-500 hover:text-white transition-all shadow-sm">
                                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </button>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 group-hover:opacity-100 transition-opacity">
                                    {course.code || '—'}
                                  </span>
                                  <h3 className="text-xl sm:text-2xl font-black tracking-tighter uppercase leading-[1.1] line-clamp-3">
                                    {course.name}
                                  </h3>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-2 sm:pt-4">
                                  <span className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-[9px] sm:text-[10px] font-black uppercase tracking-widest group-hover:bg-white/10 transition-colors">
                                    SEM {course.semester}
                                  </span>
                                  <span className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-[9px] sm:text-[10px] font-black uppercase tracking-widest group-hover:bg-white/10 transition-colors">
                                    {course.credit_hours || course.credits || 3} CRD
                                  </span>
                                </div>
                              </div>

                              <div className="pt-6 sm:pt-8 border-t border-gray-100 dark:border-white/5 flex items-center justify-between relative z-10 group-hover:border-white/20 transition-all">
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-[#2cfc7d] shadow-[0_0_12px_rgba(44,252,125,0.5)] group-hover:bg-white group-hover:shadow-[0_0_12px_rgba(255,255,255,0.5)] transition-all" />
                                  <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{t('admin.courses.active_course')}</span>
                                </div>
                                <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all ${isAr ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Cinematic Modal (Using global admin classes!) */}
      {showForm && (
        <div className="admin-modal-backdrop">
          <div 
            onClick={resetForm}
            className="absolute inset-0 bg-gray-950/40 dark:bg-black/80 backdrop-blur-sm pointer-events-auto" 
          />
          <div 
            className="admin-modal-panel max-w-4xl w-full z-10" 
            onClick={e => e.stopPropagation()}
          >
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-6 sm:mb-10 pb-4 sm:pb-8 border-b border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-4 sm:gap-5">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#8b5cf6]/10 dark:bg-[#8b5cf6]/20 rounded-2xl flex items-center justify-center border border-[#8b5cf6]/20 text-[#8b5cf6] dark:text-[#d4a3ff]">
                          {editingCourse ? <Edit3 className="w-5 h-5 sm:w-7 sm:h-7" /> : <Plus className="w-5 h-5 sm:w-7 sm:h-7" />}
                      </div>
                      <div>
                          <h3 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                              {editingCourse ? t('admin.courses.edit_course') : t('admin.courses.add_new_course')}
                          </h3>
                          <p className="text-gray-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mt-0.5 sm:mt-1">{t('admin.courses.form_hint')}</p>
                      </div>
                    </div>
                    <button onClick={resetForm} className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center transition-colors">
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                        {/* Basic Info */}
                        <div className="space-y-4 sm:space-y-6">
                            <h5 className="text-[10px] font-black text-[#8b5cf6] dark:text-[#d4a3ff] uppercase tracking-[0.3em] mb-4 sm:mb-6 flex items-center gap-3">
                                <Tag className="w-4 h-4" /> {t('admin.courses.basic_info')}
                            </h5>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.courses.course_name')} *</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="admin-input" placeholder="e.g. Neural Networks 101" required />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.courses.course_code')} *</label>
                                <input type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} className="admin-input uppercase" placeholder="e.g. AI-402" required />
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-4 sm:space-y-6">
                            <h5 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4 sm:mb-6 flex items-center gap-3">
                                <Layers className="w-4 h-4" /> {t('admin.courses.details')}
                            </h5>
                            
                            <div className="grid grid-cols-2 gap-4 sm:gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.courses.semester')}</label>
                                    <input type="number" value={formData.semester} onChange={e => setFormData({ ...formData, semester: e.target.value })} className="admin-input" min="1" max="12" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.courses.credit_hours')}</label>
                                    <input type="number" value={formData.credits} onChange={e => setFormData({ ...formData, credits: e.target.value })} className="admin-input" min="1" max="10" />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.doctors.department')}</label>
                                <div className="relative">
                                    <select value={formData.department_id} onChange={e => setFormData({ ...formData, department_id: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-5 py-4 font-black focus:ring-4 focus:ring-[#8b5cf6]/10 outline-none transition-all shadow-inner appearance-none uppercase tracking-widest text-[11px]">
                                        <option value="" className="bg-white dark:bg-[#0d0d14] dark:text-white">{t('admin.students.no_dept')}</option>
                                        {departments.map(d => (
                                            <option key={d.id} value={d.id} className="bg-white dark:bg-[#0d0d14] dark:text-white">{d.name} ({d.code})</option>
                                        ))}
                                    </select>
                                    <ChevronRight className="absolute inset-inline-end-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 rotate-90" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <AlignLeft className="w-4 h-4" /> {t('admin.courses.description_label')}
                        </label>
                        <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-[2rem] px-5 py-4 font-black focus:ring-4 focus:ring-[#8b5cf6]/10 outline-none transition-all shadow-inner resize-none min-h-[100px]" placeholder={t('admin.courses.description_placeholder')} />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-6 sm:pt-10 border-t border-gray-100 dark:border-white/5">
                        <button type="submit" disabled={loading} className="admin-btn-primary w-full sm:flex-1">
                            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                            <span>
                                {loading ? t('admin.courses.saving') : (editingCourse ? t('common.save') : t('admin.courses.add_course'))}
                            </span>
                        </button>
                        <button type="button" onClick={resetForm} className="admin-btn-secondary w-full sm:px-14">
                            {t('common.cancel')}
                        </button>
                    </div>
                </form>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesManager;