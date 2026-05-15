import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit3, X, Activity, Shield, Calendar, Clock, Target, RotateCcw, Info } from 'lucide-react';

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
    <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/80 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300" onClick={resetQuizForm}>
      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-10 w-full max-w-4xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 max-h-[95vh] overflow-y-auto no-scrollbar" onClick={e => e.stopPropagation()}>
        
        {/* Decorative background glow */}
        <div className="absolute -left-24 -top-24 w-80 h-80 bg-indigo-500/5 rounded-full hidden pointer-events-none"></div>

        <div className="relative z-10">
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-100 dark:border-white/10">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-inner text-indigo-600 dark:text-indigo-400">
                        {editingQuiz ? <Edit3 className="w-8 h-8" /> : <Plus className="w-8 h-8" />}
                    </div>
                     <div>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                            {editingQuiz ? t('admin.quizzes.form.edit_title') : t('admin.quizzes.form.add_title')}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-bold mt-1 uppercase tracking-widest">{t('admin.quizzes.form.subtitle')}</p>
                    </div>
                </div>
                <button onClick={resetQuizForm} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-rose-600 transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <form onSubmit={handleSaveQuiz} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Basic Info */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Info className="w-4 h-4 text-indigo-500" />
                            <h5 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">{t('admin.quizzes.form.basic_info')}</h5>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">{t('admin.quizzes.form.select_course')} <span className="text-rose-500">*</span></label>
                            <select
                                value={quizForm.course_id}
                                onChange={(e) => setQuizForm({ ...quizForm, course_id: e.target.value })}
                                className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-[color,background-color,border-color,transform,opacity] appearance-none shadow-inner"
                                required
                            >
                                <option value="">{t('admin.quizzes.form.select_placeholder')}</option>
                                {courses.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} (S{c.semester})</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">{t('admin.quizzes.form.quiz_title')} <span className="text-rose-500">*</span></label>
                            <input
                                type="text"
                                placeholder={t('admin.quizzes.form.quiz_title_placeholder')}
                                value={quizForm.title}
                                onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                                className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner"
                                required
                            />
                        </div>
                    </div>

                    {/* Settings */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Target className="w-4 h-4 text-indigo-500" />
                            <h5 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">{t('admin.quizzes.form.settings')}</h5>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">{t('admin.quizzes.form.time_limit_label')} <span className="text-rose-500">*</span></label>
                                <div className="relative">
                                    <input type="number" value={quizForm.time_limit_minutes} onChange={(e) => setQuizForm({ ...quizForm, time_limit_minutes: e.target.value })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold outline-none pr-12 shadow-inner" required />
                                    <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">{t('admin.quizzes.form.passing_grade_label')} <span className="text-rose-500">*</span></label>
                                <div className="relative">
                                    <input type="number" value={quizForm.passing_score} onChange={(e) => setQuizForm({ ...quizForm, passing_score: e.target.value })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold outline-none pr-12 shadow-inner" required />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-gray-400">%</span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">{t('admin.quizzes.form.max_attempts')}</label>
                                <div className="relative">
                                    <input type="number" value={quizForm.max_attempts} onChange={(e) => setQuizForm({ ...quizForm, max_attempts: e.target.value })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold outline-none pr-12 shadow-inner" />
                                    <RotateCcw className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                            <div className="space-y-2 flex flex-col justify-end">
                                <label className="flex items-center gap-3 cursor-pointer group w-fit pb-4">
                                    <div className={`w-10 h-6 rounded-full p-1 transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-300 ${quizForm.is_official ? 'bg-rose-500 shadow-lg shadow-rose-500/20' : 'bg-gray-200 dark:bg-gray-800'}`}>
                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${quizForm.is_official ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Shield className="w-4 h-4 text-rose-500" />
                                      <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest group-hover:text-rose-500 transition-colors">{t('admin.quizzes.form.official_mode_toggle')}</span>
                                    </div>
                                    <input type="checkbox" className="sr-only" checked={quizForm.is_official} onChange={(e) => setQuizForm({ ...quizForm, is_official: e.target.checked })} />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-8 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-[2rem] shadow-inner">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-indigo-500" /> {t('admin.quizzes.form.start_date')}
                        </label>
                        <input type="datetime-local" value={quizForm.start_date} onChange={(e) => setQuizForm({ ...quizForm, start_date: e.target.value })} className="w-full bg-white dark:bg-black text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-[color,background-color,border-color,transform,opacity]" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-rose-500" /> {t('admin.quizzes.form.end_date')}
                        </label>
                        <input type="datetime-local" value={quizForm.end_date} onChange={(e) => setQuizForm({ ...quizForm, end_date: e.target.value })} className="w-full bg-white dark:bg-black text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-rose-500/50 outline-none transition-[color,background-color,border-color,transform,opacity]" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-widest">{t('admin.quizzes.form.description_label')}</label>
                    <textarea placeholder={t('admin.quizzes.form.description_placeholder')} value={quizForm.description} onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner resize-none" rows="3" />
                </div>

                <div className="flex gap-4 pt-6 border-t border-gray-100 dark:border-white/10">
                    <button type="submit" disabled={loading} className="flex-1 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-500/20 transition-[color,background-color,border-color,transform,opacity] flex items-center justify-center gap-3">
                        {loading ? <Activity className="w-6 h-6 animate-spin" /> : (editingQuiz ? t('admin.quizzes.form.save_btn') : t('admin.quizzes.form.create_btn'))}
                    </button>
                    <button type="button" onClick={resetQuizForm} className="px-12 py-5 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-bold uppercase tracking-widest rounded-2xl transition-[color,background-color,border-color,transform,opacity]">{t('admin.quizzes.form.cancel_btn')}</button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default QuizForm;
