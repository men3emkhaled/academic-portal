import React from 'react';
import { HelpCircle, Plus, Edit3, Trash2 } from 'lucide-react';

const QuestionBank = ({ questions, setShowQuestionForm, editQuestion, handleDeleteQuestion }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest">Probe Configuration</span>
          </div>
          <button
              onClick={() => setShowQuestionForm(true)}
              className="px-6 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all flex items-center gap-2"
          >
              <Plus className="w-3.5 h-3.5" /> Inject Probe
          </button>
      </div>

      {questions.length === 0 ? (
          <div className="text-center py-24 grayscale opacity-10">
              <HelpCircle className="w-24 h-24 mx-auto mb-6 text-gray-400 dark:text-white" />
              <p className="text-sm font-black uppercase tracking-[0.4em] text-gray-500 dark:text-white">Grid underpopulated</p>
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {questions.map((q, idx) => (
            <div key={q.id} className="group relative bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[2rem] p-8 hover:bg-white dark:hover:bg-white/[0.04] hover:border-indigo-500/30 transition-all duration-300 shadow-sm transition-colors">
               <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] font-black text-indigo-600 dark:text-indigo-400 transition-colors">{idx + 1}</span>
                      <span className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-white/5 text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-slate-500 transition-colors">{q.question_type}</span>
                      <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase">Weight: {q.points}</span>
                  </div>
                  <div className="flex gap-2">
                      <button onClick={() => editQuestion(q)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500 hover:text-white dark:hover:text-black transition-all shadow-sm transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDeleteQuestion(q)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
               </div>

               <h4 className="text-gray-900 dark:text-white font-black text-lg tracking-tight mb-6 leading-relaxed transition-colors">{q.question_text}</h4>
               
               {q.image_url && (
                  <div className="mb-6 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10 group-hover:border-indigo-500/30 transition-all shadow-sm">
                      <img src={q.image_url} alt="Probe identity" className="w-full h-40 object-cover" />
                  </div>
               )}

               {q.question_type === 'mcq' && q.options && (
                  <div className="grid grid-cols-1 gap-3">
                      {q.options.map((opt, i) => {
                          const letter = String.fromCharCode(65 + i);
                          const isCorrect = q.correct_answer === letter;
                          return (
                              <div key={i} className={`flex items-center gap-4 px-5 py-3 rounded-2xl border transition-all shadow-sm transition-colors ${
                                  isCorrect ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400' : 'bg-white dark:bg-black/20 border-gray-100 dark:border-white/5 text-gray-500 dark:text-slate-500'
                              }`}>
                                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black border transition-colors ${
                                      isCorrect ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/5 text-gray-500'
                                  }`}>{letter}</span>
                                  <span className="text-sm font-bold tracking-tight">{opt}</span>
                              </div>
                          );
                      })}
                  </div>
               )}

               {q.explanation && (
                  <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 flex gap-3 transition-colors">
                      <HelpCircle className="w-4 h-4 text-gray-300 dark:text-slate-700 flex-shrink-0 mt-0.5" />
                      <p className="text-xs font-medium italic text-gray-500 dark:text-slate-500 leading-relaxed transition-colors">{q.explanation}</p>
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
