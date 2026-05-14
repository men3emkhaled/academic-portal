import React, { useState, useEffect } from 'react';
import { CheckSquare, Edit, Trash2, ExternalLink, BookOpen, Plus, Calendar } from 'lucide-react';
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
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '' });

  const loading = loadingTasks || loadingOfficialTasks;

  const handleLogout = () => {
    logout();
    navigate('/student/login');
    toast.success(`${t('sidebar.logout')} ${t('auth.success')}`);
  };

  useEffect(() => {
    if (!student) {
      navigate('/student/login');
    }
  }, [student, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error(t('tasks.title_required'));
      return;
    }
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
    }
  };

  const handleToggle = async (taskId, currentStatus) => {
    // Optimistic UI update
    setTasks(tasks.map(t => t.id === taskId ? { ...t, is_completed: !currentStatus } : t));
    try {
      await studentApi.patch(`/student/personal-tasks/${taskId}/toggle`, {
        is_completed: !currentStatus
      });
      toast.success(currentStatus ? t('tasks.marked_pending') : t('tasks.completed_toast'));
    } catch (error) {
      // Revert on error
      fetchTasks();
      toast.error(t('common.error_save'));
    }
  };

  const handleToggleOfficial = async (taskId, currentStatus) => {
    // Optimistic UI update
    setOfficialTasks(officialTasks.map(t => t.id === taskId ? { ...t, is_completed: !currentStatus } : t));
    try {
      await studentApi.patch(`/official-tasks/${taskId}/toggle`, {
        is_completed: !currentStatus
      });
      toast.success(!currentStatus ? t('tasks.official_completed') : t('tasks.marked_pending'));
    } catch (error) {
      // Revert on error
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
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-500 overflow-hidden relative">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400 font-bold text-xs tracking-wide">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white font-sans transition-colors duration-500 relative overflow-hidden">
      {/* Background Ambient Orbs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 dark:bg-blue-500/10 blur-[150px] rounded-full mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/5 dark:bg-primary/10 blur-[150px] rounded-full mix-blend-multiply dark:mix-blend-screen"></div>
      </div>

      <Sidebar activePage="tasks" onLogout={handleLogout} />

      <div className="md:ps-96 pb-24 md:pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-2">
            <div className="flex items-center gap-4 text-start">
              <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-2xl border border-primary/20 shadow-sm">
                <CheckSquare className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">{t('tasks.title')}</h1>
                <p className="text-gray-500 dark:text-gray-400 font-semibold mt-1">{t('tasks.desc')}</p>
              </div>
            </div>

            <button
              onClick={() => { setShowForm(true); setEditingTask(null); setFormData({ title: '', description: '' }); }}
              className="group relative inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white dark:text-dark font-black px-6 py-4 rounded-2xl shadow-[0_4px_20px_rgba(46,204,113,0.3)] hover:shadow-[0_8px_30px_rgba(46,204,113,0.4)] transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" /> {t('tasks.add_task')}
            </button>
          </div>

          {(tasks.length === 0 && officialTasks.length === 0) ? (
            <div className="py-24 bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-[2.5rem] border-2 border-dashed border-gray-300 dark:border-white/10 text-center shadow-sm flex flex-col items-center justify-center max-w-3xl mx-auto mt-12">
              <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center mb-6">
                <CheckSquare className="w-12 h-12 text-gray-300 dark:text-gray-600" />
              </div>
              <h4 className="font-black text-2xl text-gray-900 dark:text-white mb-2">{t('tasks.no_tasks')}</h4>
              <p className="text-gray-500 dark:text-gray-400 font-medium">{t('tasks.no_tasks_desc')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Official Course Tasks Column */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6 bg-white/80 dark:bg-[#111]/80 backdrop-blur-md border border-gray-200 dark:border-white/10 px-6 py-4 rounded-[1.5rem] shadow-sm text-start">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-gray-900 dark:text-white leading-tight">{t('tasks.official')}</h3>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{t('tasks.assigned', { count: officialTasks.length })}</p>
                  </div>
                </div>

                {officialTasks.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 border border-dashed border-gray-300 dark:border-gray-700 rounded-3xl">{t('tasks.no_official')}</div>
                ) : (
                  <div className="space-y-4">
                    {officialTasks.map((task) => {
                      const isCompleted = task.is_completed;
                      return (
                        <div key={`official-${task.id}`} className={`group relative overflow-hidden bg-white/90 dark:bg-[#111]/90 backdrop-blur-xl border ${isCompleted ? 'border-blue-500/20 shadow-[0_8px_30px_rgba(59,130,246,0.1)]' : 'border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md'} rounded-[2rem] p-6 flex items-start gap-5 transition-all duration-300 ${isCompleted ? 'opacity-80' : ''} text-start`}>

                          {/* Success Glow */}
                          <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent transition-opacity duration-500 pointer-events-none ${isCompleted ? 'opacity-100' : 'opacity-0'}`}></div>

                          {/* Custom Checkbox */}
                          <button
                            onClick={() => handleToggleOfficial(task.id, isCompleted)}
                            className={`relative z-10 shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
                              isCompleted
                                ? 'bg-blue-500 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                                : 'bg-gray-50 dark:bg-dark border-gray-300 dark:border-gray-600 text-transparent hover:border-blue-500/50'
                            }`}
                          >
                            <svg className={`w-5 h-5 transition-all duration-300 ${isCompleted ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </button>

                          <div className="flex-1 relative z-10 min-w-0 pt-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest">{task.course_name}</span>
                              {task.deadline && (
                                <span className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase tracking-widest"><Calendar className="w-3 h-3"/> {new Date(task.deadline).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                              )}
                            </div>
                            <h4 className={`text-lg font-black transition-colors duration-300 ${isCompleted ? 'text-gray-400 line-through decoration-blue-500/40' : 'text-gray-900 dark:text-white'}`}>
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className={`text-sm mt-1.5 transition-colors duration-300 ${isCompleted ? 'text-gray-400/70' : 'text-gray-600 dark:text-gray-400'}`}>
                                {task.description}
                              </p>
                            )}
                          </div>

                          {task.drive_link && (
                            <a href={task.drive_link} target="_blank" rel="noopener noreferrer" className="relative z-10 w-10 h-10 shrink-0 flex items-center justify-center bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all" title={t('materials.view_doc')}>
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Personal Tasks Column */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6 bg-white/80 dark:bg-[#111]/80 backdrop-blur-md border border-gray-200 dark:border-white/10 px-6 py-4 rounded-[1.5rem] shadow-sm text-start">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <CheckSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-gray-900 dark:text-white leading-tight">{t('tasks.personal')}</h3>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{t('tasks.created', { count: tasks.length })}</p>
                  </div>
                </div>

                {tasks.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 border border-dashed border-gray-300 dark:border-gray-700 rounded-3xl">{t('tasks.no_personal')}</div>
                ) : (
                  <div className="space-y-4">
                    {tasks.map((task) => {
                      const isCompleted = task.is_completed;
                      return (
                        <div key={`personal-${task.id}`} className={`group relative overflow-hidden bg-white/90 dark:bg-[#111]/90 backdrop-blur-xl border ${isCompleted ? 'border-primary/20 shadow-[0_8px_30px_rgba(46,204,113,0.1)]' : 'border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md'} rounded-[2rem] p-6 flex items-start gap-5 transition-all duration-300 ${isCompleted ? 'opacity-80' : ''} text-start`}>

                          {/* Success Glow */}
                          <div className={`absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent transition-opacity duration-500 pointer-events-none ${isCompleted ? 'opacity-100' : 'opacity-0'}`}></div>

                          {/* Custom Checkbox */}
                          <button
                            onClick={() => handleToggle(task.id, isCompleted)}
                            className={`relative z-10 shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
                              isCompleted
                                ? 'bg-primary border-primary text-white shadow-[0_0_15px_rgba(46,204,113,0.4)]'
                                : 'bg-gray-50 dark:bg-dark border-gray-300 dark:border-gray-600 text-transparent hover:border-primary/50'
                            }`}
                          >
                            <svg className={`w-5 h-5 transition-all duration-300 ${isCompleted ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </button>

                          <div className="flex-1 relative z-10 min-w-0 pt-1">
                            <h4 className={`text-lg font-black transition-colors duration-300 ${isCompleted ? 'text-gray-400 line-through decoration-primary/40' : 'text-gray-900 dark:text-white'}`}>
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className={`text-sm mt-1.5 transition-colors duration-300 ${isCompleted ? 'text-gray-400/70' : 'text-gray-600 dark:text-gray-400'}`}>
                                {task.description}
                              </p>
                            )}
                          </div>

                          <div className="relative z-10 flex flex-col sm:flex-row gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => editTask(task)} className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(task.id)} className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Premium Glassmorphic Add/Edit Task Modal */}
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
              {/* Blur Backdrop */}
              <div className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-xl animate-in fade-in duration-300" onClick={resetForm}></div>

              {/* Modal Container */}
              <div className="relative z-10 w-full max-w-lg bg-white/95 dark:bg-[#111]/95 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.2)] animate-in slide-in-from-bottom-8 duration-300 overflow-hidden">
                {/* Decorative Top Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-2 bg-primary blur-[20px]"></div>

                <div className="p-8 sm:p-10">
                  <div className="flex items-center gap-4 mb-8 text-start">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      {editingTask ? <Edit className="w-6 h-6 text-primary" /> : <Plus className="w-6 h-6 text-primary" />}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                        {editingTask ? t('tasks.edit_task') : t('tasks.new_task')}
                      </h3>
                      <p className="text-sm font-bold text-gray-500 dark:text-gray-400">{t('tasks.modal_desc')}</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="text-start">
                      <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 ms-1">{t('tasks.form_title')}</label>
                      <input
                        type="text"
                        placeholder={t('tasks.placeholder_title')}
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-bold focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all shadow-inner"
                        required
                        autoFocus
                      />
                    </div>
                    <div className="text-start">
                      <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 ms-1">{t('tasks.form_desc')}</label>
                      <textarea
                        placeholder={t('tasks.placeholder_desc')}
                        rows="3"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-medium focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all shadow-inner resize-none custom-scrollbar"
                      />
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-white/10">
                      <button type="button" onClick={resetForm} className="flex-1 py-4 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all text-gray-700 dark:text-gray-300 font-bold">
                        {t('common.cancel')}
                      </button>
                      <button type="submit" className="flex-[2] bg-primary text-white dark:text-dark font-black py-4 rounded-2xl shadow-[0_4px_15px_rgba(46,204,113,0.3)] hover:shadow-[0_8px_25px_rgba(46,204,113,0.5)] transition-all hover:scale-[1.02] active:scale-95">
                        {editingTask ? t('common.save') : t('tasks.create')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.3); border-radius: 4px; }
      `}</style>
    </div>
  );
};

export default StudentPersonalTasks;