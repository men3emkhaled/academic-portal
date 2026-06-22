import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit3, X, Target, Clock, RotateCcw, Shield, Calendar, CheckCircle } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={resetQuizForm} className="absolute inset-0 bg-black/40" />
      <div className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#059669]/10 rounded-lg flex items-center justify-center text-[#059669]">
              {editingQuiz ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingQuiz ? t('admin.quizzes.form.edit_title') : t('admin.quizzes.form.add_title')}
              </h3>
              <p className="text-xs text-gray-400">{t('admin.quizzes.identity_registration')}</p>
            </div>
          </div>
          <button onClick={resetQuizForm} className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSaveQuiz} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">{t('admin.quizzes.modals.target_course')} *</label>
                <select
                  value={quizForm.course_id}
                  onChange={(e) => setQuizForm({ ...quizForm, course_id: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none"
                  required
                >
                  <option value="">{t('admin.quizzes.modals.select_course')}</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name} (S{c.semester})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">{t('admin.quizzes.modals.task_title')} *</label>
                <input
                  type="text"
                  placeholder={t('admin.quizzes.modals.placeholder_title')}
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">{t('admin.quizzes.form.description_label')}</label>
                <textarea
                  placeholder={t('admin.quizzes.modals.placeholder_desc')}
                  value={quizForm.description}
                  onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none resize-none min-h-[80px]"
                  rows="3"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">{t('admin.quizzes.form.time_limit_label')} *</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={quizForm.time_limit_minutes}
                      onChange={(e) => setQuizForm({ ...quizForm, time_limit_minutes: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none"
                      required
                    />
                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">{t('admin.quizzes.form.passing_grade_label')} *</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={quizForm.passing_score}
                      onChange={(e) => setQuizForm({ ...quizForm, passing_score: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none"
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">{t('admin.quizzes.form.max_attempts')}</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={quizForm.max_attempts}
                      onChange={(e) => setQuizForm({ ...quizForm, max_attempts: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none"
                    />
                    <RotateCcw className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1.5 flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer group w-fit">
                    <div className={`w-10 h-6 rounded-full p-1 transition-all ${quizForm.is_official ? 'bg-rose-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-all shadow-sm ${quizForm.is_official ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-rose-500" />
                      <span className="text-xs text-gray-500 group-hover:text-rose-500 transition-colors">{t('admin.quizzes.official_mode')}</span>
                    </div>
                    <input type="checkbox" className="sr-only" checked={quizForm.is_official} onChange={(e) => setQuizForm({ ...quizForm, is_official: e.target.checked })} />
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#059669]" /> {t('admin.quizzes.form.start_date')}
                  </label>
                  <input
                    type="datetime-local"
                    value={quizForm.start_date}
                    onChange={(e) => setQuizForm({ ...quizForm, start_date: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-rose-500" /> {t('admin.quizzes.form.end_date')}
                  </label>
                  <input
                    type="datetime-local"
                    value={quizForm.end_date}
                    onChange={(e) => setQuizForm({ ...quizForm, end_date: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="submit" disabled={loading} className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {loading ? t('common.loading') : (editingQuiz ? t('common.save') : t('admin.quizzes.add_btn'))}
            </button>
            <button type="button" onClick={resetQuizForm} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors">
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuizForm;
