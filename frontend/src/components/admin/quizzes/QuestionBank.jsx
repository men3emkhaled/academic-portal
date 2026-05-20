import React from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle, Plus, Edit3, Trash2, CheckCircle2, ImageIcon } from 'lucide-react';

const QuestionBank = ({ questions, setShowQuestionForm, editQuestion, handleDeleteQuestion }) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-10 border-b border-gray-100 dark:border-white/5 text-start">
          <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-[#8b5cf6] rounded-full animate-pulse shadow-[0_0_12px_rgba(139,92,246,0.5)]"></div>
              <div className="text-start">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-none">{t('admin.quizzes.questions_tab', { count: questions.length })}</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1.5">{t('admin.quizzes.registry_stream')}</p>
              </div>
          </div>
          <button
              onClick={() => setShowQuestionForm(true)}
              className="group px-10 py-4.5 bg-black dark:bg-white text-white dark:text-black rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl hover:scale-105 active:scale-95"
          >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" /> 
              {t('admin.quizzes.questions.add_success')}
          </button>
      </div>

      {questions.length === 0 ? (
          <div className="bg-gray-50 dark:bg-[#0d0d14] border-2 border-dashed border-gray-200 dark:border-white/5 rounded-[3rem] py-40 text-center flex flex-col items-center group shadow-inner">
              <div className="w-24 h-24 bg-white dark:bg-white/5 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-700">
                <HelpCircle className="w-12 h-12 text-gray-300 dark:text-slate-600" />
              </div>
              <h4 className="text-xl font-black uppercase tracking-[0.3em] text-gray-900 dark:text-white">{t('admin.quizzes.no_quizzes')}</h4>
              <p className="text-[10px] font-black mt-4 uppercase tracking-widest text-gray-400 italic opacity-60">{t('admin.quizzes.workspace_idle_desc')}</p>
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-start">
          {questions.map((q, idx) => (
            <div key={q.id} className="group relative bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-10 hover:border-[#8b5cf6]/30 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-purple-500/5 text-start">
               <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="flex items-center gap-4">
                      <span className="w-12 h-12 rounded-[1.25rem] bg-[#8b5cf6]/5 border border-[#8b5cf6]/20 flex items-center justify-center text-sm font-black text-[#8b5cf6] dark:text-[#d4a3ff] shadow-inner">{idx + 1}</span>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-[#8b5cf6]/60 dark:text-[#8b5cf6]/60 uppercase tracking-widest mb-1">{t('admin.quizzes.questions.points_label', { count: q.points })}</span>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest opacity-60 italic">{q.question_type.toUpperCase()}</span>
                      </div>
                  </div>
                  <div className="flex gap-2.5 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                      <button onClick={() => editQuestion(q)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-amber-500/5 text-amber-500 border border-amber-500/10 hover:bg-amber-500 hover:text-white transition-all shadow-sm"><Edit3 className="w-4.5 h-4.5" /></button>
                      <button onClick={() => handleDeleteQuestion(q)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-500/5 text-rose-500 border border-rose-500/10 hover:bg-rose-500 hover:text-white transition-all shadow-sm"><Trash2 className="w-4.5 h-4.5" /></button>
                  </div>
               </div>

               <h4 className="text-gray-900 dark:text-white font-black text-xl tracking-tight mb-8 leading-relaxed uppercase">{q.question_text}</h4>
               
               {q.image_url && (
                  <div className="mb-8 rounded-[2rem] overflow-hidden border border-gray-100 dark:border-white/10 group-hover:border-[#8b5cf6]/20 transition-all duration-700 shadow-sm relative">
                      <img src={q.image_url} alt="Question visual" className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-1000" />
                      <div className="absolute top-6 inset-inline-end-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3 shadow-xl">
                        <ImageIcon className="w-4 h-4 text-[#8b5cf6]" />
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">{t('admin.quizzes.authorized_entities')}</span>
                      </div>
                  </div>
               )}

               {q.question_type === 'mcq' && q.options && (
                  <div className="grid grid-cols-1 gap-4">
                      {q.options.map((opt, i) => {
                          const letter = String.fromCharCode(65 + i);
                          const isCorrect = q.correct_answer === letter;
                          return (
                              <div key={i} className={`flex items-center gap-5 px-8 py-5 rounded-[1.5rem] border transition-all duration-500 ${
                                  isCorrect 
                                  ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-inner' 
                                  : 'bg-gray-50/50 dark:bg-white/[0.02] border-gray-100 dark:border-white/5 text-gray-500 dark:text-slate-400'
                              }`}>
                                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-slate-400'}`}>
                                    {letter}
                                  </div>
                                  <span className="text-sm font-bold tracking-tight uppercase">{opt}</span>
                              </div>
                          );
                      })}
                  </div>
               )}

               {q.question_type === 'true_false' && (
                  <div className="flex gap-6">
                      {['true', 'false'].map(val => {
                          const isCorrect = q.correct_answer === val;
                          return (
                            <div key={val} className={`flex-1 flex items-center justify-center gap-4 py-5 rounded-[1.5rem] border font-black text-[10px] uppercase tracking-widest transition-all duration-500 ${
                                isCorrect 
                                ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-inner' 
                                : 'bg-gray-50/50 dark:bg-white/[0.02] border-gray-100 dark:border-white/5 text-gray-400'
                            }`}>
                                {isCorrect && <CheckCircle2 className="w-4.5 h-4.5" />}
                                {val.toUpperCase()}
                            </div>
                          );
                      })}
                  </div>
               )}

               {q.explanation && (
                  <div className="mt-10 pt-8 border-t border-gray-100 dark:border-white/5 flex gap-5 italic relative z-10">
                      <div className="w-10 h-10 bg-[#8b5cf6]/10 rounded-[1.25rem] flex items-center justify-center flex-shrink-0 text-[#8b5cf6] border border-[#8b5cf6]/20">
                        <HelpCircle className="w-5 h-5" />
                      </div>
                      <p className="text-[11px] font-bold text-gray-400 dark:text-slate-400 leading-relaxed">{q.explanation}</p>
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
