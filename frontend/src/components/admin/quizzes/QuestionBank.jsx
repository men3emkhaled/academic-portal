import React from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle, Plus, Edit3, Trash2, CheckCircle2, ImageIcon } from 'lucide-react';

const QuestionBank = ({ questions, setShowQuestionForm, editQuestion, handleDeleteQuestion }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('admin.quizzes.questions_tab', { count: questions.length })}</h3>
          <p className="text-xs text-gray-400">{t('admin.quizzes.registry_stream')}</p>
        </div>
        <button onClick={() => setShowQuestionForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" />{t('admin.quizzes.questions.add_success')}
        </button>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
          <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
          {t('admin.quizzes.no_quizzes')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions.map((q, idx) => (
            <div key={q.id} className="bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-[#059669]/30 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-[#059669]/10 flex items-center justify-center text-xs font-semibold text-[#059669]">{idx + 1}</span>
                  <div>
                    <span className="text-xs text-gray-400">{t('admin.quizzes.questions.points_label', { count: q.points })}</span>
                    <span className="text-xs text-gray-400 ml-2">· {q.question_type.toUpperCase()}</span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => editQuestion(q)} className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDeleteQuestion(q)} className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">{q.question_text}</p>

              {q.image_url && (
                <div className="mb-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <img src={q.image_url} alt="Question" className="w-full h-40 object-cover" />
                </div>
              )}

              {q.question_type === 'mcq' && q.options && (
                <div className="space-y-1.5">
                  {q.options.map((opt, i) => {
                    const letter = String.fromCharCode(65 + i);
                    const isCorrect = q.correct_answer === letter;
                    return (
                      <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs border ${
                        isCorrect ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 text-gray-500'
                      }`}>
                        <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-medium ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                          {letter}
                        </span>
                        <span>{opt}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {q.question_type === 'true_false' && (
                <div className="flex gap-2">
                  {['true', 'false'].map(val => {
                    const isCorrect = q.correct_answer === val;
                    return (
                      <div key={val} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border ${
                        isCorrect ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-600' : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 text-gray-400'
                      }`}>
                        {isCorrect && <CheckCircle2 className="w-3 h-3" />}
                        {val.toUpperCase()}
                      </div>
                    );
                  })}
                </div>
              )}

              {q.explanation && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex gap-2 text-xs text-gray-400">
                  <HelpCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <p>{q.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionBank;
