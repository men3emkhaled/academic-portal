import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, Edit, Trash2, ExternalLink, BookOpen, 
  Plus, Calendar, ArrowLeft, CheckCircle2, Circle,
  Layout, Zap, Activity, ShieldAlert, X, Loader2, ArrowRight
} from 'lucide-react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useStudentData } from '../context/StudentDataContext';
import { useNavigate } from 'react-router-dom';
import studentApi from '../services/studentApi';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { useTranslation } from 'react-i18next';

const StudentPersonalTasks = () => {
  const { student, logout } = useStudentAuth();
  const { t, i18n } = useTranslation();
  const { tasks, setTasks, loadingTasks, fetchTasks, officialTasks, setOfficialTasks, fetchOfficialTasks, loadingOfficialTasks } = useStudentData();
  const navigate = useNavigate();
  const isAr = i18n.language === 'ar';
  
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const loading = loadingTasks || loadingOfficialTasks;

  const handleLogout = () => {
    logout();
    navigate('/student/login');
    toast.success(`${t('sidebar.logout')} ${t('auth.success')}`);
  };

  useEffect(() => {
    if (!student) navigate('/student/login');
  }, [student, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error(t('tasks.title_required'));
    
    setSubmitting(true);
    try {
      if (editingTask) {
        await studentApi.put(`/student/personal-tasks/${editingTask.id}`, {
          title: formData.title,
          description: formData.description,
          is_completed: editingTask.is_completed,
          order_index: editingTask.order_index
        });
        toast.success(t('tasks.updated'));
      } else {
        await studentApi.post('/student/personal-tasks', {
          title: formData.title,
          description: formData.description
        });
        toast.success(t('tasks.added'));
      }
      resetForm();
      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || t('common.error_save'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (taskId, currentStatus) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, is_completed: !currentStatus } : t));
    try {
      await studentApi.patch(`/student/personal-tasks/${taskId}/toggle`, { is_completed: !currentStatus });
      toast.success(currentStatus ? t('tasks.marked_pending') : t('tasks.completed_toast'));
    } catch (error) {
      fetchTasks();
      toast.error(t('common.error_save'));
    }
  };

  const handleToggleOfficial = async (taskId, currentStatus) => {
    setOfficialTasks(officialTasks.map(t => t.id === taskId ? { ...t, is_completed: !currentStatus } : t));
    try {
      await studentApi.patch(`/official-tasks/${taskId}/toggle`, { is_completed: !currentStatus });
      toast.success(!currentStatus ? t('tasks.official_completed') : t('tasks.marked_pending'));
    } catch (error) {
      fetchOfficialTasks();
      toast.error(t('common.error_save'));
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm(t('tasks.delete_confirm'))) return;
    try {
      await studentApi.delete(`/student/personal-tasks/${taskId}`);
      setTasks(tasks.filter(t => t.id !== taskId));
      toast.success(t('tasks.deleted'));
    } catch (error) {
      toast.error(t('common.error_save'));
    }
  };

  const editTask = (task) => {
    setEditingTask(task);
    setFormData({ title: task.title, description: task.description || '' });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingTask(null);
    setFormData({ title: '', description: '' });
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-white dark:bg-[#0c0c14]">
        <div className="w-12 h-12 border-2 border-gray-200 dark:border-white/10 border-t-[#2cfc7d] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c14] text-gray-900 dark:text-white font-sans transition-colors duration-500 overflow-x-hidden relative" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] inset-inline-end-[-5%] w-[50vw] h-[50vw] bg-[#8b5cf6]/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] inset-inline-start-[-5%] w-[40vw] h-[40vw] bg-[#2cfc7d]/3 blur-[100px] rounded-full"></div>
      </div>

      <Sidebar onLogout={handleLogout} />

      <main className="md:ps-72 min-h-screen relative z-10 flex flex-col">
        
        {/* HERO SECTION */}
        <section className="px-6 lg:px-10 pt-16 pb-12 max-w-[1500px] mx-auto w-full space-y-12 text-start">
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            <div className="space-y-4 text-start">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2cfc7d]"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30">{t('sidebar.personal_tasks')}</span>
              </div>
              <h1 className={`text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-[0.95] tracking-tighter uppercase text-gray-900 dark:text-white ${isAr ? 'font-arabic' : ''}`}>
                {t('mavi.command')}
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
               
               <button 
                onClick={() => { setShowForm(true); setEditingTask(null); setFormData({ title: '', description: '' }); }}
                className="bg-gray-900 dark:bg-[#2cfc7d] text-white dark:text-black px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-3"
               >
                 <Plus className="w-5 h-5" />
                 {t('tasks.add_task')}
               </button>
            </div>
          </div>

          {(tasks.length === 0 && officialTasks.length === 0) ? (
            <div className="py-24 bg-white dark:bg-[#151520] border border-gray-100 dark:border-white/5 rounded-[4rem] text-center shadow-xl flex flex-col items-center justify-center max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="w-32 h-32 rounded-[2.5rem] bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center mb-8">
                <Layout className="w-16 h-16 text-gray-200 dark:text-white/10" />
              </div>
              <h4 className="font-black text-4xl text-gray-900 dark:text-white mb-4 uppercase tracking-tighter">{t('tasks.no_tasks')}</h4>
              <p className="text-gray-400 dark:text-white/30 font-black uppercase tracking-widest text-xs">{t('tasks.no_tasks_desc')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pb-24">

              {/* OFFICIAL TASKS */}
              <div className="space-y-8">
                <div className="flex items-center gap-4 bg-white dark:bg-[#151520] border border-gray-100 dark:border-white/5 p-8 rounded-[2.5rem] shadow-sm text-start relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="w-14 h-14 rounded-[1.2rem] bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/10">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-black text-2xl text-gray-900 dark:text-white uppercase tracking-tighter leading-none">{t('tasks.official')}</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-1 opacity-50 italic">{t('mavi.central_assignments')}</p>
                  </div>
                </div>

                {officialTasks.length === 0 ? (
                  <div className="p-12 text-center text-gray-300 dark:text-white/10 italic font-black uppercase tracking-widest bg-white dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 rounded-[2.5rem]">{t('tasks.no_official')}</div>
                ) : (
                  <div className="space-y-4">
                    {officialTasks.map((task) => (
                      <div key={`official-${task.id}`} className={`group relative bg-white dark:bg-[#151520] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8 flex items-start gap-8 transition-all duration-700 shadow-sm hover:shadow-2xl hover:-translate-y-1 ${task.is_completed ? 'opacity-40 grayscale' : ''} text-start`}>
                        <button
                          onClick={() => handleToggleOfficial(task.id, task.is_completed)}
                          className={`relative z-10 shrink-0 w-12 h-12 rounded-[1.2rem] flex items-center justify-center transition-all duration-500 ${
                            task.is_completed
                              ? 'bg-blue-500 text-white shadow-xl shadow-blue-500/20 scale-90'
                              : 'bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-300 hover:scale-110'
                          }`}
                        >
                          {task.is_completed ? <CheckCircle2 className="w-7 h-7 stroke-[3px]" /> : <Circle className="w-7 h-7" />}
                        </button>

                        <div className="flex-1 min-w-0 space-y-4">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="bg-blue-500/10 text-blue-500 border border-blue-500/10 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{task.course_name}</span>
                            {task.deadline && (
                              <span className="flex items-center gap-2 text-[9px] text-gray-400 font-black uppercase tracking-widest"><Calendar className="w-3.5 h-3.5"/> {new Date(task.deadline).toLocaleDateString()}</span>
                            )}
                          </div>
                          <h4 className={`text-xl font-black uppercase tracking-tight transition-all duration-700 ${task.is_completed ? 'line-through' : 'text-gray-900 dark:text-white'}`}>
                            {task.title}
                          </h4>
                        </div>

                        {task.drive_link && (
                          <a href={task.drive_link} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:bg-blue-500 hover:text-white transition-all shadow-sm">
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PERSONAL TASKS */}
              <div className="space-y-8">
                <div className="flex items-center gap-4 bg-white dark:bg-[#151520] border border-gray-100 dark:border-white/5 p-8 rounded-[2.5rem] shadow-sm text-start relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#10b981]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="w-14 h-14 rounded-[1.2rem] bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10">
                    <Activity className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-black text-2xl text-gray-900 dark:text-white uppercase tracking-tighter leading-none">{t('tasks.personal')}</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-1 opacity-50 italic">{t('mavi.user_space')}</p>
                  </div>
                </div>

                {tasks.length === 0 ? (
                  <div className="p-12 text-center text-gray-300 dark:text-white/10 italic font-black uppercase tracking-widest bg-white dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 rounded-[2.5rem]">{t('tasks.no_personal')}</div>
                ) : (
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <div key={`personal-${task.id}`} className={`group relative bg-white dark:bg-[#151520] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8 flex items-start gap-8 transition-all duration-700 shadow-sm hover:shadow-2xl hover:-translate-y-1 ${task.is_completed ? 'opacity-40 grayscale' : ''} text-start`}>
                        <button
                          onClick={() => handleToggle(task.id, task.is_completed)}
                          className={`relative z-10 shrink-0 w-12 h-12 rounded-[1.2rem] flex items-center justify-center transition-all duration-500 ${
                            task.is_completed
                              ? 'bg-[#10b981] dark:bg-[#2cfc7d] text-white dark:text-black shadow-xl shadow-emerald-500/20 scale-90'
                              : 'bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-300 hover:scale-110'
                          }`}
                        >
                          {task.is_completed ? <CheckCircle2 className="w-7 h-7 stroke-[3px]" /> : <Circle className="w-7 h-7" />}
                        </button>

                        <div className="flex-1 min-w-0 space-y-2">
                          <h4 className={`text-xl font-black uppercase tracking-tight transition-all duration-700 ${task.is_completed ? 'line-through' : 'text-gray-900 dark:text-white'}`}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-gray-500 dark:text-white/30 font-medium leading-relaxed italic">"{task.description}"</p>
                          )}
                        </div>

                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-500">
                          <button onClick={() => editTask(task)} className="w-12 h-12 rounded-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-400 hover:bg-amber-500 hover:text-white transition-all shadow-sm flex items-center justify-center"><Edit className="w-5 h-5" /></button>
                          <button onClick={() => handleDelete(task.id)} className="w-12 h-12 rounded-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm flex items-center justify-center"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ADD/EDIT MODAL */}
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-gray-900/40 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-500" onClick={resetForm}></div>

              <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-[#151520] border border-gray-100 dark:border-white/10 rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-12 duration-700 overflow-hidden">
                <div className="p-12 space-y-12">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-start">
                      <div className="w-16 h-16 rounded-[1.8rem] bg-[#10b981]/10 dark:bg-[#2cfc7d]/10 flex items-center justify-center border border-[#10b981]/10 dark:border-[#2cfc7d]/10">
                        {editingTask ? <Edit className="w-8 h-8 text-[#10b981] dark:text-[#2cfc7d]" /> : <Plus className="w-8 h-8 text-[#10b981] dark:text-[#2cfc7d]" />}
                      </div>
                      <div>
                        <h3 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">
                          {editingTask ? t('tasks.edit_task') : t('tasks.new_task')}
                        </h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mt-2 opacity-50 italic">{t('mavi.system_override')}</p>
                      </div>
                    </div>
                    <button onClick={resetForm} className="w-12 h-12 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="text-start space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ms-6">{t('mavi.terminal_entry')}</label>
                      <input
                        type="text"
                        placeholder={t('tasks.placeholder_title')}
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-black/40 text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-[2.5rem] px-10 py-6 text-xl font-black focus:border-[#10b981] dark:focus:border-[#2cfc7d] outline-none transition-all shadow-inner uppercase tracking-tighter"
                        required
                        autoFocus
                      />
                    </div>
                    <div className="text-start space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ms-6">{t('mavi.metadata')}</label>
                      <textarea
                        placeholder={t('tasks.placeholder_desc')}
                        rows="4"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-black/40 text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-[3rem] px-10 py-8 text-lg font-bold focus:border-[#10b981] dark:focus:border-[#2cfc7d] outline-none transition-all shadow-inner resize-none custom-scrollbar"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <button type="submit" disabled={submitting} className="flex-[2] py-6 bg-gray-900 dark:bg-[#2cfc7d] text-white dark:text-black font-black text-xs uppercase tracking-[0.5em] rounded-[2.5rem] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                        {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : editingTask ? t('common.save') : t('tasks.create')}
                        {!submitting && <ArrowRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
        .font-arabic { font-family: 'Cairo', sans-serif !important; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(44, 252, 125, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default StudentPersonalTasks;