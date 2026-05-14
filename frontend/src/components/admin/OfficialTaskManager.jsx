import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
  CheckSquare, Plus, Trash2, Edit, ExternalLink, 
  BookOpen, Calendar, Link as LinkIcon, Search, Filter, Layers,
  Activity, Clock, FileText, ChevronRight, X, Save, Sparkles,
  Database, Briefcase, Zap, GraduationCap
} from 'lucide-react';

const OfficialTaskManager = ({ courses = [], departments = [] }) => {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');

  const [formData, setFormData] = useState({
    course_id: '',
    department_id: '',
    title: '',
    description: '',
    drive_link: '',
    deadline: ''
  });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await api.get('/official-tasks/admin');
      setTasks(response.data || []);
    } catch (error) {
      toast.error(t('admin.messages.load_tasks_failed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.course_id || !formData.title || !formData.drive_link) {
      toast.error(t('admin.messages.fields_req'));
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        department_id: formData.department_id || null
      };

      if (editingTask) {
        await api.put(`/official-tasks/admin/${editingTask.id}`, dataToSend);
        toast.success(t('common.success'));
      } else {
        await api.post('/official-tasks/admin', dataToSend);
        toast.success(t('common.success'));
      }
      closeForm();
      fetchTasks();
    } catch (error) {
      toast.error(t('admin.messages.operation_failed'));
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      course_id: task.course_id,
      department_id: task.department_id || '',
      title: task.title,
      description: task.description || '',
      drive_link: task.drive_link,
      deadline: task.deadline ? task.deadline.split('T')[0] : ''
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTask(null);
    setFormData({ course_id: '', department_id: '', title: '', description: '', drive_link: '', deadline: '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirm_delete'))) return;
    try {
      await api.delete(`/official-tasks/admin/${id}`);
      toast.success(t('common.success'));
      fetchTasks();
    } catch (error) {
      toast.error(t('admin.messages.delete_failed'));
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         task.course_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourseId ? task.course_id === parseInt(selectedCourseId) : true;
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="space-y-8 lg:space-y-10 animate-in fade-in duration-700 pb-10">
      {/* Header Bento Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex items-center gap-6 bg-white/50 dark:bg-white/[0.02] backdrop-blur-md border border-gray-100 dark:border-white/5 p-8 rounded-[2.5rem] shadow-sm">
          <div className="w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-inner group transition-transform duration-500 hover:scale-110">
            <CheckSquare className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {t('admin.tasks.title')}
            </h2>
            <p className="text-gray-500 dark:text-slate-500 text-sm font-bold mt-1 uppercase tracking-widest">{t('admin.tasks.description')}</p>
          </div>
        </div>
        
        <div className="bg-emerald-500 text-white p-8 rounded-[2.5rem] shadow-lg shadow-emerald-500/20 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-inline-end-0 top-0 w-32 h-32 bg-white/10 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-black/10 px-3 py-1 rounded-full">{t('admin.tasks.task_node')}</span>
          </div>
          <div className="mt-4 relative z-10">
            <p className="text-4xl font-black">{tasks.length}</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">{t('admin.tasks.active_tasks', { count: tasks.length })}</p>
          </div>
        </div>
      </div>

      {/* Actions & Filters Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch gap-6">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="relative flex-1 group">
                <Search className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder={t('admin.tasks.search_placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-2xl ps-14 pe-6 py-4.5 font-black focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-inner"
                />
            </div>
            <div className="relative md:w-72">
                <Filter className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <select 
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-2xl ps-14 pe-10 py-4.5 font-black focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all appearance-none uppercase tracking-widest text-[11px]"
                >
                    <option value="">{t('admin.tasks.filter_all_courses')}</option>
                    {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
                </select>
                <ChevronRight className="absolute inset-inline-end-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 rotate-90" />
            </div>
        </div>
        
        <button
          onClick={() => { setShowForm(true); setEditingTask(null); }}
          className="flex items-center justify-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-black font-black py-4.5 px-10 rounded-2xl lg:rounded-[2rem] shadow-xl hover:scale-105 active:scale-95 transition-all whitespace-nowrap group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" /> 
          <span className="uppercase tracking-widest text-xs">{t('admin.tasks.add_button')}</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
      {loading ? (
        <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-48 opacity-50"
        >
           <Activity className="w-16 h-16 text-emerald-500 animate-spin mb-8" />
           <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500">{t('admin.tasks.loading')}</p>
        </motion.div>
      ) : filteredTasks.length === 0 ? (
        <motion.div 
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/50 dark:bg-white/[0.01] border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[3rem] py-48 text-center flex flex-col items-center group transition-all duration-500"
        >
            <div className="w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <Sparkles className="w-12 h-12 text-emerald-400/30" />
            </div>
            <h4 className="text-xl font-black uppercase tracking-[0.3em] text-gray-900 dark:text-white">{t('admin.tasks.no_tasks')}</h4>
            <p className="text-[10px] font-black mt-4 uppercase tracking-widest text-gray-400">{t('admin.tasks.no_tasks_hint')}</p>
        </motion.div>
      ) : (
        <motion.div 
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
        >
          {filteredTasks.map((task, idx) => (
            <motion.div 
              key={task.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group relative bg-white dark:bg-white/[0.01] backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-10 transition-all duration-500 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/10"
            >
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex flex-wrap gap-2.5">
                  <span className="bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest border border-emerald-500/10 shadow-inner group-hover:border-emerald-500/30 transition-colors">
                    {task.course_name}
                  </span>
                  {task.department_name && (
                    <span className="bg-blue-500/5 text-blue-600 dark:text-blue-400 text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest border border-blue-500/10 shadow-inner">
                      {task.department_name}
                    </span>
                  )}
                </div>
                <div className="flex gap-2.5 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                  <button 
                    onClick={() => handleEdit(task)} 
                    className="w-10 h-10 flex items-center justify-center bg-blue-500/5 text-blue-500 border border-blue-500/10 hover:bg-blue-500 hover:text-white rounded-xl transition-all shadow-sm"
                  >
                    <Edit className="w-4.5 h-4.5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(task.id)} 
                    className="w-10 h-10 flex items-center justify-center bg-rose-500/5 text-rose-500 border border-rose-500/10 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-tight mb-6 group-hover:text-emerald-500 transition-colors min-h-[4.5rem] line-clamp-2">{task.title}</h3>
              
              {task.description && (
                <p className="text-sm font-bold text-gray-400 dark:text-slate-500 line-clamp-2 mb-8 leading-relaxed italic">
                  {task.description}
                </p>
              )}

              <div className="space-y-4 pt-8 border-t border-gray-100 dark:border-white/5 relative z-10">
                <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  {task.deadline ? t('admin.tasks.deadline', { date: new Date(task.deadline).toLocaleDateString() }) : t('admin.tasks.open_deadline')}
                </div>
                <a 
                  href={task.drive_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-4 p-5 bg-gray-50/50 dark:bg-white/[0.02] rounded-[1.5rem] border border-gray-100 dark:border-white/10 hover:border-emerald-500/40 hover:bg-white dark:hover:bg-white/5 transition-all group/link shadow-inner"
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-11 h-11 bg-white dark:bg-black border border-gray-100 dark:border-white/10 rounded-xl flex items-center justify-center shadow-sm group-hover/link:border-emerald-500/30 transition-colors">
                        <LinkIcon className="w-5 h-5 text-emerald-500" />
                    </div>
                    <span className="text-[11px] font-black text-gray-700 dark:text-slate-300 uppercase tracking-widest truncate">{t('admin.tasks.drive_link')}</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-300 dark:text-slate-700 group-hover/link:text-emerald-500 transition-colors" />
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
      </AnimatePresence>

      {/* Cinematic Form Modal */}
      <AnimatePresence>
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeForm} className="absolute inset-0 bg-gray-950/40 dark:bg-black/80 backdrop-blur-md" />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white dark:bg-[#080808] border border-gray-100 dark:border-white/5 rounded-[3.5rem] p-8 lg:p-12 w-full max-w-3xl shadow-2xl relative overflow-hidden z-10" onClick={e => e.stopPropagation()}>
             {/* Modal Background Glow */}
             <div className="absolute top-0 inset-inline-end-0 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>

             <div className="relative z-10">
                <div className="flex items-center justify-between mb-10 pb-8 border-b border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-[1.5rem] flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                          {editingTask ? <Edit className="w-8 h-8" /> : <Plus className="w-8 h-8" />}
                      </div>
                      <div>
                          <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{editingTask ? t('admin.tasks.modals.edit_task') : t('admin.tasks.modals.new_task')}</h3>
                          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">{t('admin.tasks.entry_protocol')}</p>
                      </div>
                    </div>
                    <button onClick={closeForm} className="w-12 h-12 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center transition-colors">
                      <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <form id="task-form" onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.tasks.modals.target_course')} *</label>
                          <div className="relative">
                             <BookOpen className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                             <select
                                value={formData.course_id}
                                onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-2xl ps-14 pe-8 py-5 text-gray-900 dark:text-white font-black focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-inner appearance-none uppercase tracking-widest text-[11px]"
                                required
                             >
                               <option value="">{t('admin.tasks.modals.select_course')}</option>
                               {courses.map(course => (
                                 <option key={course.id} value={course.id}>{course.name}</option>
                               ))}
                             </select>
                             <ChevronRight className="absolute inset-inline-end-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 rotate-90" />
                          </div>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.tasks.modals.target_dept')}</label>
                          <div className="relative">
                             <GraduationCap className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                             <select
                                value={formData.department_id}
                                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-2xl ps-14 pe-8 py-5 text-gray-900 dark:text-white font-black focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-inner appearance-none uppercase tracking-widest text-[11px]"
                             >
                               <option value="">{t('admin.tasks.modals.all_depts')}</option>
                               {departments.map(dept => (
                                 <option key={dept.id} value={dept.id}>{dept.name}</option>
                               ))}
                             </select>
                             <ChevronRight className="absolute inset-inline-end-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 rotate-90" />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.tasks.modals.task_title')} *</label>
                       <div className="relative">
                          <Edit className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            placeholder={t('admin.tasks.modals.placeholder_title')}
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-2xl ps-14 pe-6 py-5 text-gray-900 dark:text-white text-lg font-black focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-inner"
                            required
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.tasks.modals.resource_link')} *</label>
                          <div className="relative">
                             <LinkIcon className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                             <input
                                type="url"
                                placeholder={t('admin.tasks.placeholder_url')}
                                value={formData.drive_link}
                                onChange={(e) => setFormData({ ...formData, drive_link: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-2xl ps-14 pe-6 py-5 text-gray-900 dark:text-white font-black focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-inner"
                                required
                             />
                          </div>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.tasks.modals.deadline_label')}</label>
                          <div className="relative">
                             <Calendar className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                             <input
                                type="date"
                                value={formData.deadline}
                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-2xl ps-14 pe-6 py-5 text-gray-900 dark:text-white font-black focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-inner"
                             />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.tasks.modals.additional_info')}</label>
                       <textarea
                         placeholder={t('admin.tasks.modals.placeholder_desc')}
                         rows="3"
                         value={formData.description}
                         onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                         className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-[2rem] p-8 text-gray-900 dark:text-white font-bold focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-inner resize-none min-h-[120px]"
                       />
                    </div>

                    <div className="flex gap-6 pt-10 border-t border-gray-100 dark:border-white/5">
                        <button type="submit" disabled={loading} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-5 rounded-[2.5rem] shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                            <Save className="w-6 h-6" />
                            <span className="uppercase tracking-widest text-xs">{editingTask ? t('common.save') : t('admin.tasks.add_button')}</span>
                        </button>
                        <button type="button" onClick={closeForm} className="px-14 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-black py-5 rounded-[2.5rem] transition-all uppercase tracking-widest text-xs">{t('common.cancel')}</button>
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

export default OfficialTaskManager;
