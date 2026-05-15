import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit3, X, Activity, Shield, Calendar, Clock, Target, RotateCcw, Info, Save } from 'lucide-react';

const QuizForm = ({
  quizForm,
  setQuizForm,
  loading,
  editingQuiz,
  handleSaveQuiz,
  resetQuizForm,
  courses
}) => {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-gray-950/40 dark:bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-500" onClick={resetQuizForm}>
      <div className="bg-white dark:bg-[#080808] border border-gray-100 dark:border-white/5 rounded-[3.5rem] p-10 lg:p-12 w-full max-w-4xl shadow-2xl relative overflow-hidden animate-in zoom-in duration-500 max-h-[95vh] overflow-y-auto no-scrollbar" onClick={e => e.stopPropagation()}>
        
        {/* Modal Background Glow */}
        <div className="absolute top-0 inset-inline-end-0 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 text-start">
            <div className="flex items-center justify-between mb-12 pb-8 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-[1.5rem] flex items-center justify-center border border-primary/20 shadow-inner text-primary dark:text-primary">
                        {editingQuiz ? <Edit3 className="w-8 h-8" /> : <Plus className="w-8 h-8" />}
                    </div>
                     <div>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                            {editingQuiz ? t('admin.quizzes.form.edit_title') : t('admin.quizzes.form.add_title')}
                        </h3>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1 italic">{t('admin.quizzes.identity_registration')}</p>
                    </div>
                </div>
                <button onClick={resetQuizForm} className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-rose-600 transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <form onSubmit={handleSaveQuiz} className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Basic Info */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Info className="w-4 h-4 text-primary" />
                            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{t('admin.quizzes.form.basic_info')}</h5>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.quizzes.modals.target_course')} *</label>
                            <select
                                value={quizForm.course_id}
                                onChange={(e) => setQuizForm({ ...quizForm, course_id: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-5 text-gray-900 dark:text-white font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner appearance-none uppercase tracking-widest text-[11px]"
                                required
                            >
                                <option value="">{t('admin.quizzes.modals.select_course')}</option>
                                {courses.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} (S{c.semester})</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.quizzes.modals.task_title')} *</label>
                            <input
                                type="text"
                                placeholder={t('admin.quizzes.modals.placeholder_title')}
                                value={quizForm.title}
                                onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-5 text-gray-900 dark:text-white text-lg font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner uppercase"
                                required
                            />
                        </div>
                    </div>

                    {/* Settings */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Target className="w-4 h-4 text-primary" />
                            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{t('admin.quizzes.form.settings')}</h5>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.quizzes.form.time_limit_label')} *</label>
                                <div className="relative">
                                    <input type="number" value={quizForm.time_limit_minutes} onChange={(e) => setQuizForm({ ...quizForm, time_limit_minutes: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-5 text-gray-900 dark:text-white font-black outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner" required />
                                    <Clock className="absolute inset-inline-end-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.quizzes.form.passing_grade_label')} *</label>
                                <div className="relative">
                                    <input type="number" value={quizForm.passing_score} onChange={(e) => setQuizForm({ ...quizForm, passing_score: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-5 text-gray-900 dark:text-white font-black outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner" required />
                                    <span className="absolute inset-inline-end-5 top-1/2 -translate-y-1/2 font-black text-primary">%</span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.quizzes.form.max_attempts')}</label>
                                <div className="relative">
                                    <input type="number" value={quizForm.max_attempts} onChange={(e) => setQuizForm({ ...quizForm, max_attempts: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-5 text-gray-900 dark:text-white font-black outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner" />
                                    <RotateCcw className="absolute inset-inline-end-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                </div>
                            </div>
                            <div className="space-y-3 flex flex-col justify-end">
                                <label className="flex items-center gap-4 cursor-pointer group w-fit pb-4">
                                    <div className={`w-12 h-7 rounded-full p-1.5 transition-all duration-500 ${quizForm.is_official ? 'bg-rose-500 shadow-lg shadow-rose-500/30' : 'bg-gray-200 dark:bg-white/10'}`}>
                                        <div className={`w-4 h-4 bg-white rounded-full transition-all duration-500 shadow-sm ${quizForm.is_official ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Shield className="w-4 h-4 text-rose-500" />
                                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] group-hover:text-rose-500 transition-colors">{t('admin.quizzes.official_mode')}</span>
                                    </div>
                                    <input type="checkbox" className="sr-only" checked={quizForm.is_official} onChange={(e) => setQuizForm({ ...quizForm, is_official: e.target.checked })} />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 p-10 bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[2.5rem] shadow-inner relative overflow-hidden group">
                    {/* Inner shadow effect */}
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    
                    <div className="space-y-3 relative z-10">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-primary" /> {t('admin.quizzes.form.start_date')}
                        </label>
                        <input type="datetime-local" value={quizForm.start_date} onChange={(e) => setQuizForm({ ...quizForm, start_date: e.target.value })} className="w-full bg-white dark:bg-black text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-5 font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm" />
                    </div>
                    <div className="space-y-3 relative z-10">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-rose-500" /> {t('admin.quizzes.form.end_date')}
                        </label>
                        <input type="datetime-local" value={quizForm.end_date} onChange={(e) => setQuizForm({ ...quizForm, end_date: e.target.value })} className="w-full bg-white dark:bg-black text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-5 font-black focus:ring-4 focus:ring-rose-500/10 outline-none transition-all shadow-sm" />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.quizzes.form.description_label')}</label>
                    <textarea placeholder={t('admin.quizzes.modals.placeholder_desc')} value={quizForm.description} onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-[2rem] p-8 text-gray-900 dark:text-white font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner resize-none min-h-[140px]" rows="3" />
                </div>

                <div className="flex gap-6 pt-10 border-t border-gray-100 dark:border-white/5">
                    <button type="submit" disabled={loading} className="flex-1 bg-primary text-white font-black py-5 rounded-[2.5rem] shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                        {loading ? <Activity className="w-6 h-6 animate-spin" /> : (
                            <>
                                <Save className="w-6 h-6" />
                                <span className="uppercase tracking-widest text-xs">{editingQuiz ? t('common.save') : t('admin.quizzes.add_btn')}</span>
                            </>
                        )}
                    </button>
                    <button type="button" onClick={resetQuizForm} className="px-14 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-black py-5 rounded-[2.5rem] transition-all uppercase tracking-widest text-xs">{t('common.cancel')}</button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default QuizForm;
