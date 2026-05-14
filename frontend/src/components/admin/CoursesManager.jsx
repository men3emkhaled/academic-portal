import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
  BookOpen, Plus, Edit3, Trash2, 
  Layers, CheckCircle, Activity,
  ChevronRight, Tag, AlignLeft, LayoutDashboard, Clock, X
} from 'lucide-react';

const CoursesManager = ({ departments }) => {
  const { t } = useTranslation();
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
      const res = await api.get('/courses');
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
    if (!window.confirm(t('admin.courses.delete_confirm', { name }))) return;
    try {
      await api.delete(`/courses/${id}`);
      toast.success(t('common.success'));
      fetchCourses();
    } catch (error) {
      toast.error(t('admin.messages.delete_failed'));
    }
  };

  const editCourse = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      code: course.code,
      semester: course.semester,
      credits: course.credits,
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

  return (
    <div className="space-y-8 lg:space-y-10 animate-in fade-in duration-700">
      {/* Header Bento Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex items-center gap-6 bg-white/50 dark:bg-white/[0.02] backdrop-blur-md border border-gray-100 dark:border-white/5 p-8 rounded-[2.5rem] shadow-sm">
          <div className="w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-inner group transition-transform duration-500 hover:scale-110">
            <BookOpen className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {t('admin.courses.title')}
            </h2>
            <p className="text-gray-500 dark:text-slate-500 text-sm font-bold mt-1 uppercase tracking-widest">{t('admin.courses.description')}</p>
          </div>
        </div>
        
        <div className="bg-emerald-500 text-white p-8 rounded-[2.5rem] shadow-lg shadow-emerald-500/20 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-inline-end-0 top-0 w-32 h-32 bg-white/10 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-black/10 px-3 py-1 rounded-full">{t('admin.courses.course_nodes')}</span>
          </div>
          <div className="mt-4 relative z-10">
            <p className="text-4xl font-black">{courses.length}</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">{t('admin.courses.validated_modules')}</p>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex justify-inline-end">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-black font-black py-4.5 px-10 rounded-2xl lg:rounded-[2rem] shadow-xl hover:scale-105 active:scale-95 transition-all whitespace-nowrap group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" /> 
          <span className="uppercase tracking-widest text-xs">{t('admin.courses.add_course')}</span>
        </button>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
        {courses.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full py-24 text-center border-2 border-gray-100 dark:border-white/5 border-dashed rounded-[3rem] bg-gray-50/30 dark:bg-white/[0.01]"
          >
            <BookOpen className="w-16 h-16 mx-auto mb-6 text-gray-200 dark:text-gray-800" />
            <p className="text-gray-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] text-sm">{t('admin.courses.no_courses')}</p>
            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-2">{t('admin.courses.add_hint')}</p>
          </motion.div>
        ) : (
          courses.map((course, idx) => (
            <motion.div 
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative bg-white dark:bg-white/[0.01] backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 hover:border-emerald-500/20 transition-all duration-500 overflow-hidden"
            >
                {/* Status Indicator */}
                <div className="absolute top-0 inset-inline-start-0 w-1.5 h-full bg-emerald-500/20 group-hover:bg-emerald-500 transition-colors"></div>
                
                <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 dark:bg-black/50 rounded-2xl flex items-center justify-center border border-gray-100 dark:border-white/10 text-gray-400 group-hover:text-emerald-500 group-hover:bg-emerald-500/10 transition-all duration-500">
                            <Layers className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-[0.2em] bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-white/10 group-hover:border-emerald-500/30 transition-colors">
                            {course.code}
                        </span>
                    </div>
                    <div className="flex gap-2.5">
                        <button onClick={() => editCourse(course)} className="w-10 h-10 rounded-xl bg-blue-500/5 text-blue-500 border border-blue-500/10 hover:bg-blue-500 hover:text-white transition-all shadow-sm flex items-center justify-center"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(course.id, course.name)} className="w-10 h-10 rounded-xl bg-rose-500/5 text-rose-500 border border-rose-500/10 hover:bg-rose-500 hover:text-white transition-all shadow-sm flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
                    </div>
                </div>

                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-snug mb-6 group-hover:text-emerald-500 transition-colors line-clamp-2 min-h-[3.5rem]">{course.name}</h3>
                
                <div className="flex flex-wrap gap-2.5 mb-8">
                    <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest">
                      <Clock className="w-3.5 h-3.5" /> {t('admin.courses.semester')} {course.semester}
                    </span>
                    <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                      <BookOpen className="w-3.5 h-3.5" /> {course.credits} {t('admin.courses.credits')}
                    </span>
                    {course.department_name && (
                        <span className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-500/5 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-500 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest truncate max-w-[150px]">
                          <LayoutDashboard className="w-3.5 h-3.5" /> {course.department_name}
                        </span>
                    )}
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-white/5 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('admin.courses.active_course')}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-700 group-hover:translate-x-1 transition-transform rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                </div>
            </motion.div>
          ))
        )}
        </AnimatePresence>
      </div>

      {/* Cinematic Modal */}
      <AnimatePresence>
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetForm}
            className="absolute inset-0 bg-gray-950/40 dark:bg-black/80 backdrop-blur-md" 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-[#080808] border border-gray-100 dark:border-white/5 rounded-[3rem] p-8 lg:p-12 w-full max-w-4xl shadow-2xl relative overflow-hidden z-10" 
            onClick={e => e.stopPropagation()}
          >
             {/* Modal Background Glow */}
             <div className="absolute top-0 inset-inline-end-0 w-80 h-80 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>

             <div className="relative z-10">
                <div className="flex items-center justify-between mb-10 pb-8 border-b border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                          {editingCourse ? <Edit3 className="w-7 h-7" /> : <Plus className="w-7 h-7" />}
                      </div>
                      <div>
                          <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                              {editingCourse ? t('admin.courses.edit_course') : t('admin.courses.add_new_course')}
                          </h3>
                          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">{t('admin.courses.form_hint')}</p>
                      </div>
                    </div>
                    <button onClick={resetForm} className="w-12 h-12 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center transition-colors">
                      <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Basic Info */}
                        <div className="space-y-6">
                            <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                <Tag className="w-4 h-4" /> {t('admin.courses.basic_info')}
                            </h5>
                            
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.courses.course_name')} *</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 font-black focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-inner" placeholder="e.g. Neural Networks 101" required />
                            </div>
                            
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.courses.course_code')} *</label>
                                <input type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 font-black focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-inner uppercase" placeholder="e.g. AI-402" required />
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-6">
                            <h5 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                <Layers className="w-4 h-4" /> {t('admin.courses.details')}
                            </h5>
                            
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.courses.semester')}</label>
                                    <input type="number" value={formData.semester} onChange={e => setFormData({ ...formData, semester: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 font-black focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-inner" min="1" max="12" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.courses.credit_hours')}</label>
                                    <input type="number" value={formData.credits} onChange={e => setFormData({ ...formData, credits: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 font-black focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-inner" min="1" max="10" />
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.doctors.department')}</label>
                                <div className="relative">
                                    <select value={formData.department_id} onChange={e => setFormData({ ...formData, department_id: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 font-black focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-inner appearance-none uppercase tracking-widest text-[11px]">
                                        <option value="">{t('admin.students.no_dept')}</option>
                                        {departments.map(d => (
                                            <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                                        ))}
                                    </select>
                                    <ChevronRight className="absolute inset-inline-end-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 rotate-90" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <AlignLeft className="w-4 h-4" /> {t('admin.courses.description_label')}
                        </label>
                        <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-[2rem] px-6 py-5 font-black focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-inner resize-none min-h-[120px]" placeholder={t('admin.courses.description_placeholder')} />
                    </div>

                    <div className="flex gap-6 pt-10 border-t border-gray-100 dark:border-white/5">
                        <button type="submit" disabled={loading} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-5 rounded-[2.5rem] shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                            <CheckCircle className="w-6 h-6" />
                            <span className="uppercase tracking-widest text-xs">
                                {loading ? t('admin.courses.saving') : (editingCourse ? t('common.save') : t('admin.courses.add_course'))}
                            </span>
                        </button>
                        <button type="button" onClick={resetForm} className="px-14 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-black py-5 rounded-[2.5rem] transition-all uppercase tracking-widest text-xs">
                            {t('common.cancel')}
                        </button>
                    </div>
                </form>
             </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default CoursesManager;