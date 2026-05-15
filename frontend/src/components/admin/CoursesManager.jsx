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
    <div className="space-y-16 lg:space-y-24 animate-in fade-in duration-700 pb-20 max-w-[1500px] mx-auto w-full">
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
        <div className="space-y-4 max-w-2xl text-start">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30">{t('admin.sidebar.tabs.courses')}</span>
          </div>
          <h1 className={`text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-[0.95] tracking-tighter uppercase text-gray-900 dark:text-white ${i18n.language === 'ar' ? 'font-arabic' : ''}`}>
            {t('admin.courses.title')}
          </h1>
        </div>

        <div className="bg-primary text-white p-8 rounded-[2.5rem] shadow-lg shadow-primary/20 flex flex-col justify-between relative overflow-hidden group min-w-[280px]">
          <div className="absolute inset-inline-end-0 top-0 w-32 h-32 bg-white/10 hidden rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-black/10 px-3 py-1 rounded-full">{t('admin.courses.course_nodes')}</span>
          </div>
          <div className="mt-4 relative z-10">
            <p className="text-6xl font-black tracking-tighter">{courses.length}</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">{t('admin.courses.validated_modules')}</p>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <button
          onClick={() => setShowForm(true)}
          className="group bg-black dark:bg-white text-white dark:text-black rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-6 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-white/10 dark:bg-black/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-90 transition-all duration-700">
              <Plus className="w-8 h-8" />
            </div>
            <div className="text-start">
               <span className="block text-2xl font-black uppercase tracking-tighter">{t('admin.courses.add_course')}</span>
               <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{t('admin.courses.form_hint')}</span>
            </div>
          </div>
          <ChevronRight className={`w-8 h-8 opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all ${i18n.language === 'ar' ? 'rotate-180 group-hover:-translate-x-2' : ''}`} />
        </button>

        <div className="bg-white dark:bg-[#151520] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-10 flex items-center justify-between shadow-sm group overflow-hidden relative">
           <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-5 transition-opacity" />
           <div className="space-y-2 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{t('admin.courses.validated_modules')}</p>
              <h4 className="text-4xl font-black tracking-tighter uppercase">{t('admin.stats.active_users')}</h4>
           </div>
           <div className="w-20 h-20 rounded-full border-4 border-primary/10 flex items-center justify-center relative z-10 group-hover:rotate-180 transition-transform duration-1000">
              <Activity className="w-8 h-8 text-primary" />
           </div>
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.length === 0 ? (
          <div className="col-span-full py-40 text-center border-2 border-dashed border-gray-100 dark:border-white/10 rounded-[3rem] opacity-30 grayscale">
            <BookOpen className="w-20 h-20 mx-auto mb-6 text-gray-400" />
            <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-xs">{t('admin.courses.no_courses')}</p>
          </div>
        ) : (
          courses.map((course) => (
            <div 
                key={course.id}
                className="group relative bg-white dark:bg-[#151520] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-10 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-700 shadow-sm flex flex-col justify-between min-h-[400px] overflow-hidden"
            >
                {/* Background Decor */}
                <div className="absolute top-[-10%] inset-inline-end-[-5%] w-32 h-32 bg-primary/10 blur-3xl rounded-full group-hover:bg-white/20 transition-all duration-700" />
                
                <div className="space-y-8 relative z-10">
                    <div className="flex justify-between items-start">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-white/20 transition-all duration-500">
                            <Tag className="w-7 h-7" />
                        </div>
                        <div className="flex gap-2">
                           <button onClick={(e) => { e.stopPropagation(); editCourse(course); }} className="w-10 h-10 rounded-xl border border-gray-100 dark:border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-all shadow-sm">
                             <Edit3 className="w-4 h-4" />
                           </button>
                           <button onClick={(e) => { e.stopPropagation(); handleDelete(course.id, course.name); }} className="w-10 h-10 rounded-xl border border-gray-100 dark:border-white/10 flex items-center justify-center hover:bg-rose-500 hover:border-rose-500 hover:text-white transition-all shadow-sm">
                             <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 group-hover:opacity-100 transition-opacity">
                            {course.code}
                        </span>
                        <h3 className="text-2xl font-black tracking-tighter uppercase leading-[1.1] line-clamp-3">
                            {course.name}
                        </h3>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-4">
                        <span className="px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-[10px] font-black uppercase tracking-widest group-hover:bg-white/10 transition-colors">
                           {t('admin.courses.semester')} {course.semester}
                        </span>
                        <span className="px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-[10px] font-black uppercase tracking-widest group-hover:bg-white/10 transition-colors">
                           {course.credits} {t('admin.courses.credits')}
                        </span>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100 dark:border-white/5 flex items-center justify-between relative z-10 group-hover:border-white/20 transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_12px_rgba(46,204,113,0.5)] group-hover:bg-white group-hover:shadow-[0_0_12px_rgba(255,255,255,0.5)] transition-all"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{t('admin.courses.active_course')}</span>
                    </div>
                    <ChevronRight className={`w-5 h-5 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all ${i18n.language === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                </div>
            </div>
          ))
        )}
      </div>

      {/* Cinematic Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div 
            
            
            
            onClick={resetForm}
            className="absolute inset-0 bg-gray-950/40 dark:bg-black/80" 
          />
          <div 
            
            
            
            className="bg-white dark:bg-[#080808] border border-gray-100 dark:border-white/5 rounded-[3rem] p-8 lg:p-12 w-full max-w-4xl shadow-2xl relative overflow-hidden z-10" 
            onClick={e => e.stopPropagation()}
          >
             {/* Modal Background Glow */}
             <div className="absolute top-0 inset-inline-end-0 w-80 h-80 bg-primary/10 hidden rounded-full pointer-events-none"></div>

             <div className="relative z-10">
                <div className="flex items-center justify-between mb-10 pb-8 border-b border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/20 text-primary dark:text-primary">
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
                            <h5 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                <Tag className="w-4 h-4" /> {t('admin.courses.basic_info')}
                            </h5>
                            
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.courses.course_name')} *</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 font-black focus:ring-4 focus:ring-primary/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner" placeholder="e.g. Neural Networks 101" required />
                            </div>
                            
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.courses.course_code')} *</label>
                                <input type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 font-black focus:ring-4 focus:ring-primary/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner uppercase" placeholder="e.g. AI-402" required />
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
                                    <input type="number" value={formData.semester} onChange={e => setFormData({ ...formData, semester: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 font-black focus:ring-4 focus:ring-blue-500/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner" min="1" max="12" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.courses.credit_hours')}</label>
                                    <input type="number" value={formData.credits} onChange={e => setFormData({ ...formData, credits: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 font-black focus:ring-4 focus:ring-blue-500/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner" min="1" max="10" />
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.doctors.department')}</label>
                                <div className="relative">
                                    <select value={formData.department_id} onChange={e => setFormData({ ...formData, department_id: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 font-black focus:ring-4 focus:ring-blue-500/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner appearance-none uppercase tracking-widest text-[11px]">
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
                        <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-[2rem] px-6 py-5 font-black focus:ring-4 focus:ring-primary/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner resize-none min-h-[120px]" placeholder={t('admin.courses.description_placeholder')} />
                    </div>

                    <div className="flex gap-6 pt-10 border-t border-gray-100 dark:border-white/5">
                        <button type="submit" disabled={loading} className="flex-1 bg-primary hover:bg-primary text-white font-black py-5 rounded-[2.5rem] shadow-xl shadow-primary/20 transition-[color,background-color,border-color,transform,opacity] hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                            <CheckCircle className="w-6 h-6" />
                            <span className="uppercase tracking-widest text-xs">
                                {loading ? t('admin.courses.saving') : (editingCourse ? t('common.save') : t('admin.courses.add_course'))}
                            </span>
                        </button>
                        <button type="button" onClick={resetForm} className="px-14 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-black py-5 rounded-[2.5rem] transition-[color,background-color,border-color,transform,opacity] uppercase tracking-widest text-xs">
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