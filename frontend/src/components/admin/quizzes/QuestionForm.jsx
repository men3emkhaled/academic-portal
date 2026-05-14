import React from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle, X, Activity, Image as ImageIcon, ChevronDown, CheckCircle2, AlertCircle, Type } from 'lucide-react';

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
    <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300" onClick={resetQuestionForm}>
      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-10 w-full max-w-4xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 max-h-[95vh] overflow-y-auto no-scrollbar" onClick={e => e.stopPropagation()}>
        
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-100 dark:border-white/10">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-inner text-indigo-600 dark:text-indigo-400">
                        <HelpCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                            {editingQuestion ? t('admin.quizzes.questions.form.edit_title') : t('admin.quizzes.questions.form.add_title')}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-bold mt-1 uppercase tracking-widest">{t('admin.quizzes.questions.form.subtitle')}</p>
                    </div>
                </div>
                <button onClick={resetQuestionForm} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-rose-600 transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-8">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-widest">{t('admin.quizzes.questions.form.question_text')} <span className="text-rose-500">*</span></label>
                    <textarea placeholder={t('admin.quizzes.questions.form.question_placeholder')} value={questionForm.question_text} onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-5 font-semibold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-inner resize-none" rows="4" required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-widest">{t('admin.quizzes.questions.form.image_url')}</label>
                        <div className="relative">
                            <input type="text" placeholder="https://..." value={questionForm.image_url} onChange={(e) => setQuestionForm({ ...questionForm, image_url: e.target.value })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all pl-12 shadow-inner" />
                            <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-widest">{t('admin.quizzes.questions.form.question_type')}</label>
                        <div className="relative">
                            <select value={questionForm.question_type} onChange={(e) => setQuestionForm({ ...questionForm, question_type: e.target.value })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all appearance-none shadow-inner">
                                <option value="mcq">{t('admin.quizzes.questions.form.types.mcq')}</option>
                                <option value="true_false">{t('admin.quizzes.questions.form.types.true_false')}</option>
                                <option value="written">{t('admin.quizzes.questions.form.types.written')}</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {questionForm.question_type === 'mcq' && (
                    <div className="p-8 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-[2rem] space-y-6 shadow-inner animate-in slide-in-from-top-4 duration-300">
                         <div className="flex items-center gap-3 mb-2">
                            <Type className="w-4 h-4 text-indigo-500" />
                            <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">{t('admin.quizzes.questions.form.answer_options')}</h4>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {questionForm.options.map((opt, idx) => {
                                const letter = String.fromCharCode(65 + idx);
                                return (
                                    <div key={idx} className="relative group">
                                        <input
                                            type="text"
                                            value={opt}
                                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                                            className="w-full bg-white dark:bg-black text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:border-indigo-500 outline-none transition-all pl-14 shadow-sm"
                                            placeholder={t('admin.quizzes.questions.form.option_placeholder', { letter })}
                                            required
                                        />
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-white/5 rounded-xl text-xs font-black text-indigo-500 border border-gray-200 dark:border-white/5">{letter}</span>
                                    </div>
                                );
                            })}
                         </div>
                         <div className="pt-4 space-y-4">
                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('admin.quizzes.questions.form.correct_answer')}</label>
                            <div className="flex flex-wrap gap-4">
                                {['A', 'B', 'C', 'D'].map(letter => (
                                    <button
                                        key={letter}
                                        type="button"
                                        onClick={() => setQuestionForm({ ...questionForm, correct_answer: letter })}
                                        className={`px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${
                                            questionForm.correct_answer === letter 
                                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' 
                                            : 'bg-white dark:bg-black text-gray-400 border-gray-200 dark:border-white/10 hover:border-emerald-500/30'
                                        }`}
                                    >
                                        {t('admin.quizzes.questions.form.option_placeholder', { letter })}
                                    </button>
                                ))}
                            </div>
                         </div>
                    </div>
                )}

                {questionForm.question_type === 'true_false' && (
                    <div className="grid grid-cols-2 gap-6 p-8 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-[2rem] shadow-inner animate-in slide-in-from-top-4 duration-300">
                        <button
                            type="button"
                            onClick={() => setQuestionForm({ ...questionForm, correct_answer: 'true' })}
                            className={`py-5 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${
                                questionForm.correct_answer === 'true' 
                                ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' 
                                : 'bg-white dark:bg-black text-gray-400 border-gray-200 dark:border-white/10 hover:border-emerald-500/30'
                            }`}
                        >
                            {t('admin.quizzes.questions.form.true')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setQuestionForm({ ...questionForm, correct_answer: 'false' })}
                            className={`py-5 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${
                                questionForm.correct_answer === 'false' 
                                ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-500/20' 
                                : 'bg-white dark:bg-black text-gray-400 border-gray-200 dark:border-white/10 hover:border-rose-500/30'
                            }`}
                        >
                            {t('admin.quizzes.questions.form.false')}
                        </button>
                    </div>
                )}

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-widest">{t('admin.quizzes.questions.form.points')}</label>
                        <input type="number" value={questionForm.points} onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) || 1 })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-black focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-inner" min="1" required />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-widest">{t('admin.quizzes.questions.form.explanation')}</label>
                        <input type="text" placeholder={t('admin.quizzes.questions.form.explanation_placeholder')} value={questionForm.explanation} onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-inner" />
                    </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-gray-100 dark:border-white/10">
                    <button type="submit" disabled={loading} className="flex-1 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-3">
                        {loading ? <Activity className="w-6 h-6 animate-spin" /> : (editingQuestion ? t('admin.quizzes.questions.form.save_btn') : t('admin.quizzes.questions.form.add_btn'))}
                    </button>
                    <button type="button" onClick={resetQuestionForm} className="px-12 py-5 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-bold uppercase tracking-widest rounded-2xl transition-all">{t('admin.quizzes.questions.form.cancel_btn')}</button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default QuestionForm;
