import React from 'react';
import { HelpCircle, Plus, Edit3, Trash2, CheckCircle2, Circle, Type, FileText, ImageIcon } from 'lucide-react';

const QuestionBank = ({ questions, setShowQuestionForm, editQuestion, handleDeleteQuestion }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
              <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Question List</span>
          </div>
          <button
              onClick={() => setShowQuestionForm(true)}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-md shadow-indigo-500/10"
          >
              <Plus className="w-3.5 h-3.5" /> Add Question
          </button>
      </div>

      {questions.length === 0 ? (
          <div className="bg-gray-50/50 dark:bg-black/20 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-[2.5rem] py-32 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                <HelpCircle className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-sm font-black uppercase tracking-widest text-gray-500">No questions added yet</p>
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {questions.map((q, idx) => (
            <div key={q.id} className="group relative bg-white/80 dark:bg-black/40 border border-gray-100 dark:border-white/10 rounded-[2.5rem] p-8 hover:border-indigo-500/40 transition-all duration-300 shadow-sm hover:shadow-xl">
               <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xs font-black text-indigo-600 dark:text-indigo-400 shadow-inner">{idx + 1}</span>
                      <div className="flex flex-col">
                        <span className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[8px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">{q.question_type.replace('_', ' ')}</span>
                        <span className="text-[10px] font-black text-indigo-600/60 dark:text-indigo-400/60 uppercase">Points: {q.points}</span>
                      </div>
                  </div>
                  <div className="flex gap-2">
                      <button onClick={() => editQuestion(q)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white transition-all shadow-sm"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteQuestion(q)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm"><Trash2 className="w-4 h-4" /></button>
                  </div>
               </div>

               <h4 className="text-gray-900 dark:text-white font-black text-lg tracking-tight mb-8 leading-relaxed">{q.question_text}</h4>
               
               {q.image_url && (
                  <div className="mb-8 rounded-3xl overflow-hidden border border-gray-100 dark:border-white/10 group-hover:border-indigo-500/20 transition-all shadow-sm relative">
                      <img src={q.image_url} alt="Question visual" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                        <ImageIcon className="w-3.5 h-3.5 text-white" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Image Matrix</span>
                      </div>
                  </div>
               )}

               {q.question_type === 'mcq' && q.options && (
                  <div className="grid grid-cols-1 gap-3">
                      {q.options.map((opt, i) => {
                          const letter = String.fromCharCode(65 + i);
                          const isCorrect = q.correct_answer === letter;
                          return (
                              <div key={i} className={`flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all ${
                                  isCorrect 
                                  ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-800 dark:text-emerald-400 shadow-inner' 
                                  : 'bg-gray-50/50 dark:bg-black/20 border-gray-100 dark:border-white/5 text-gray-500 dark:text-gray-400'
                              }`}>
                                  {isCorrect ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-gray-200 dark:text-gray-800" />}
                                  <span className="text-sm font-bold tracking-tight">{opt}</span>
                              </div>
                          );
                      })}
                  </div>
               )}

               {q.question_type === 'true_false' && (
                  <div className="flex gap-4">
                      {['true', 'false'].map(val => {
                          const isCorrect = q.correct_answer === val;
                          return (
                            <div key={val} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl border font-black text-xs uppercase tracking-widest transition-all ${
                                isCorrect 
                                ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-800 dark:text-emerald-400 shadow-inner' 
                                : 'bg-gray-50/50 dark:bg-black/20 border-gray-100 dark:border-white/5 text-gray-400'
                            }`}>
                                {isCorrect && <CheckCircle2 className="w-4 h-4" />}
                                {val}
                            </div>
                          );
                      })}
                  </div>
               )}

               {q.explanation && (
                  <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 flex gap-4">
                      <div className="w-8 h-8 bg-amber-500/10 rounded-xl flex items-center justify-center flex-shrink-0 text-amber-600">
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-medium italic text-gray-500 dark:text-gray-400 leading-relaxed">{q.explanation}</p>
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
