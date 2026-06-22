import React from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle, X, ImageIcon, ChevronDown, Type, CheckCircle } from 'lucide-react';

const QuestionForm = ({
  questionForm,
  setQuestionForm,
  loading,
  editingQuestion,
  handleSaveQuestion,
  resetQuestionForm,
  handleOptionChange
}) => {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={resetQuestionForm} className="absolute inset-0 bg-black/40" />
      <div className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#059669]/10 rounded-lg flex items-center justify-center text-[#059669]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingQuestion ? t('admin.quizzes.questions.form.edit_title') : t('admin.quizzes.questions.form.add_title')}
              </h3>
              <p className="text-xs text-gray-400">{t('admin.quizzes.registry_stream')}</p>
            </div>
          </div>
          <button onClick={resetQuestionForm} className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSaveQuestion} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">{t('admin.quizzes.questions.form.question_text')} *</label>
            <textarea
              placeholder={t('admin.quizzes.questions.form.question_placeholder')}
              value={questionForm.question_text}
              onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none resize-none min-h-[100px]"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">{t('admin.quizzes.questions.form.image_url')}</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="https://..."
                  value={questionForm.image_url}
                  onChange={(e) => setQuestionForm({ ...questionForm, image_url: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none pl-9"
                />
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">{t('admin.quizzes.questions.form.question_type')}</label>
              <div className="relative">
                <select
                  value={questionForm.question_type}
                  onChange={(e) => setQuestionForm({ ...questionForm, question_type: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none appearance-none"
                >
                  <option value="mcq">{t('admin.quizzes.questions.form.types.mcq')}</option>
                  <option value="true_false">{t('admin.quizzes.questions.form.types.true_false')}</option>
                  <option value="written">{t('admin.quizzes.questions.form.types.written')}</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {questionForm.question_type === 'mcq' && (
            <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-[#059669]" />
                <span className="text-xs font-medium text-gray-900 dark:text-white">{t('admin.quizzes.questions.form.answer_options')}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {questionForm.options.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  return (
                    <div key={idx} className="relative">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        className="w-full bg-white dark:bg-[#0d0d14] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none pl-10"
                        placeholder={t('admin.quizzes.questions.form.option_placeholder', { letter })}
                        required
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded text-[10px] font-medium text-[#059669]">{letter}</span>
                    </div>
                  );
                })}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">{t('admin.quizzes.questions.form.correct_answer')}</label>
                <div className="flex flex-wrap gap-2">
                  {['A', 'B', 'C', 'D'].map(letter => (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => setQuestionForm({ ...questionForm, correct_answer: letter })}
                      className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all ${
                        questionForm.correct_answer === letter
                          ? 'bg-[#059669] text-white border-[#059669]'
                          : 'bg-white dark:bg-black text-gray-400 border-gray-200 dark:border-gray-700 hover:border-[#059669]/40'
                      }`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {questionForm.question_type === 'true_false' && (
            <div className="grid grid-cols-2 gap-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
              <button
                type="button"
                onClick={() => setQuestionForm({ ...questionForm, correct_answer: 'true' })}
                className={`py-3 rounded-lg text-xs font-medium border transition-all ${
                  questionForm.correct_answer === 'true'
                    ? 'bg-[#059669] text-white border-[#059669]'
                    : 'bg-white dark:bg-black text-gray-400 border-gray-200 dark:border-gray-700 hover:border-[#059669]/40'
                }`}
              >
                {t('admin.quizzes.questions.form.true')}
              </button>
              <button
                type="button"
                onClick={() => setQuestionForm({ ...questionForm, correct_answer: 'false' })}
                className={`py-3 rounded-lg text-xs font-medium border transition-all ${
                  questionForm.correct_answer === 'false'
                    ? 'bg-rose-500 text-white border-rose-500'
                    : 'bg-white dark:bg-black text-gray-400 border-gray-200 dark:border-gray-700 hover:border-rose-500/40'
                }`}
              >
                {t('admin.quizzes.questions.form.false')}
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">{t('admin.quizzes.questions.form.points')}</label>
              <input
                type="number"
                value={questionForm.points}
                onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) || 1 })}
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none"
                min="1"
                required
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-gray-500">{t('admin.quizzes.questions.form.explanation')}</label>
              <input
                type="text"
                placeholder={t('admin.quizzes.questions.form.explanation_placeholder')}
                value={questionForm.explanation}
                onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="submit" disabled={loading} className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {loading ? t('common.loading') : (editingQuestion ? t('common.save') : t('admin.quizzes.questions.add_success'))}
            </button>
            <button type="button" onClick={resetQuestionForm} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors">
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionForm;
