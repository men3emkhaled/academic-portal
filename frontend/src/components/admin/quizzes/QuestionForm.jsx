import React from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle, X, Activity, Image as ImageIcon, ChevronDown, CheckCircle2, Type, Save } from 'lucide-react';

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
    <div className="fixed inset-0 bg-gray-950/40 dark:bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-500" onClick={resetQuestionForm}>
      <div className="bg-white dark:bg-[#080808] border border-gray-100 dark:border-white/5 rounded-[3.5rem] p-10 lg:p-12 w-full max-w-4xl shadow-2xl relative overflow-hidden animate-in zoom-in duration-500 max-h-[95vh] overflow-y-auto no-scrollbar" onClick={e => e.stopPropagation()}>
        
        {/* Modal Background Glow */}
        <div className="absolute top-0 inset-inline-end-0 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 text-start">
            <div className="flex items-center justify-between mb-12 pb-8 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-[1.5rem] flex items-center justify-center border border-primary/20 shadow-inner text-primary dark:text-primary">
                        <HelpCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                            {editingQuestion ? t('admin.quizzes.questions.form.edit_title') : t('admin.quizzes.questions.form.add_title')}
                        </h3>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1.5 italic">{t('admin.quizzes.registry_stream')}</p>
                    </div>
                </div>
                <button onClick={resetQuestionForm} className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-rose-600 transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-12">
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.quizzes.questions.form.question_text')} *</label>
                    <textarea placeholder={t('admin.quizzes.questions.form.question_placeholder')} value={questionForm.question_text} onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-[2rem] p-8 text-gray-900 dark:text-white text-xl font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner resize-none min-h-[160px] uppercase leading-relaxed" required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.quizzes.questions.form.image_url')}</label>
                        <div className="relative">
                            <input type="text" placeholder="https://..." value={questionForm.image_url} onChange={(e) => setQuestionForm({ ...questionForm, image_url: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-5 text-gray-900 dark:text-white font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner inset-inline-start-14" />
                            <ImageIcon className="absolute inset-inline-start-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.quizzes.questions.form.question_type')}</label>
                        <div className="relative">
                            <select value={questionForm.question_type} onChange={(e) => setQuestionForm({ ...questionForm, question_type: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-5 text-gray-900 dark:text-white font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner appearance-none uppercase tracking-widest text-[11px]">
                                <option value="mcq">{t('admin.quizzes.questions.form.types.mcq')}</option>
                                <option value="true_false">{t('admin.quizzes.questions.form.types.true_false')}</option>
                                <option value="written">{t('admin.quizzes.questions.form.types.written')}</option>
                            </select>
                            <ChevronDown className="absolute inset-inline-end-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none" />
                        </div>
                    </div>
                </div>

                {questionForm.question_type === 'mcq' && (
                    <div className="p-10 bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[3rem] space-y-10 shadow-inner animate-in slide-in-from-top-4 duration-500">
                         <div className="flex items-center gap-4">
                            <Type className="w-5 h-5 text-primary" />
                            <h4 className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">{t('admin.quizzes.questions.form.answer_options')}</h4>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {questionForm.options.map((opt, idx) => {
                                const letter = String.fromCharCode(65 + idx);
                                return (
                                    <div key={idx} className="relative group">
                                        <input
                                            type="text"
                                            value={opt}
                                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                                            className="w-full bg-white dark:bg-black text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-5 font-bold focus:border-primary outline-none transition-all pl-16 shadow-sm uppercase tracking-tight"
                                            placeholder={t('admin.quizzes.questions.form.option_placeholder', { letter })}
                                            required
                                        />
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-gray-100 dark:bg-white/5 rounded-xl text-[10px] font-black text-primary border border-gray-100 dark:border-white/5">{letter}</span>
                                    </div>
                                );
                            })}
                         </div>
                         <div className="pt-6 space-y-6">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.quizzes.questions.form.correct_answer')}</label>
                            <div className="flex flex-wrap gap-4">
                                {['A', 'B', 'C', 'D'].map(letter => (
                                    <button
                                        key={letter}
                                        type="button"
                                        onClick={() => setQuestionForm({ ...questionForm, correct_answer: letter })}
                                        className={`px-10 py-4.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                            questionForm.correct_answer === letter 
                                            ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-105' 
                                            : 'bg-white dark:bg-black text-gray-400 border-gray-100 dark:border-white/10 hover:border-primary/40'
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
                    <div className="grid grid-cols-2 gap-8 p-10 bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[3rem] shadow-inner animate-in slide-in-from-top-4 duration-500">
                        <button
                            type="button"
                            onClick={() => setQuestionForm({ ...questionForm, correct_answer: 'true' })}
                            className={`py-6 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest border transition-all ${
                                questionForm.correct_answer === 'true' 
                                ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-105' 
                                : 'bg-white dark:bg-black text-gray-400 border-gray-100 dark:border-white/10 hover:border-primary/40'
                            }`}
                        >
                            {t('admin.quizzes.questions.form.true')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setQuestionForm({ ...questionForm, correct_answer: 'false' })}
                            className={`py-6 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest border transition-all ${
                                questionForm.correct_answer === 'false' 
                                ? 'bg-rose-500 text-white border-rose-500 shadow-xl shadow-rose-500/20 scale-105' 
                                : 'bg-white dark:bg-black text-gray-400 border-gray-100 dark:border-white/10 hover:border-rose-500/40'
                            }`}
                        >
                            {t('admin.quizzes.questions.form.false')}
                        </button>
                    </div>
                )}

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.quizzes.questions.form.points')}</label>
                        <input type="number" value={questionForm.points} onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) || 1 })} className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-5 text-gray-900 dark:text-white font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner" min="1" required />
                    </div>
                    <div className="md:col-span-2 space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.quizzes.questions.form.explanation')}</label>
                        <input type="text" placeholder={t('admin.quizzes.questions.form.explanation_placeholder')} value={questionForm.explanation} onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-5 text-gray-900 dark:text-white font-bold focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner uppercase tracking-tight" />
                    </div>
                </div>

                <div className="flex gap-6 pt-10 border-t border-gray-100 dark:border-white/5">
                    <button type="submit" disabled={loading} className="flex-1 bg-primary text-white font-black py-6 rounded-[2.5rem] shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4">
                        {loading ? <Activity className="w-6 h-6 animate-spin" /> : (
                            <>
                                <Save className="w-6 h-6" />
                                <span className="uppercase tracking-widest text-[11px]">{editingQuestion ? t('common.save') : t('admin.quizzes.questions.add_success')}</span>
                            </>
                        )}
                    </button>
                    <button type="button" onClick={resetQuestionForm} className="px-16 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-black py-6 rounded-[2.5rem] transition-all uppercase tracking-widest text-[11px]">{t('common.cancel')}</button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default QuestionForm;
