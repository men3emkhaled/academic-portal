import React from 'react';
import { HelpCircle, X, Activity, Image as ImageIcon, ChevronDown } from 'lucide-react';

const QuestionForm = ({
  questionForm,
  setQuestionForm,
  loading,
  editingQuestion,
  handleSaveQuestion,
  resetQuestionForm,
  handleOptionChange
}) => {
  return (
    <div className="admin-modal-backdrop" onClick={resetQuestionForm}>
      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-12 w-full max-w-4xl shadow-2xl relative overflow-hidden animate-fadeInUp max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
        
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/20 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 transition-colors">
                        <HelpCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">
                            {editingQuestion ? 'Edit Probe' : 'New Probe Injection'}
                        </h3>
                        <p className="text-gray-500 dark:text-slate-500 text-xs font-bold uppercase tracking-widest transition-colors">Logical Assessment Component</p>
                    </div>
                </div>
                <button onClick={resetQuestionForm} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4 transition-colors">Probe Payload *</label>
                    <textarea placeholder="Target question data..." value={questionForm.question_text} onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })} className="admin-input scrollbar-hide" rows="4" required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4 transition-colors">Visual Identity (URL)</label>
                        <div className="relative">
                            <input type="text" placeholder="https://..." value={questionForm.image_url} onChange={(e) => setQuestionForm({ ...questionForm, image_url: e.target.value })} className="admin-input pl-12" />
                            <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-600" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4 transition-colors">Logic Type</label>
                        <div className="relative">
                            <select value={questionForm.question_type} onChange={(e) => setQuestionForm({ ...questionForm, question_type: e.target.value })} className="admin-input appearance-none transition-colors">
                                <option value="mcq" className="bg-white dark:bg-slate-900">MULTIPLE_CHOICE (MCQ)</option>
                                <option value="true_false" className="bg-white dark:bg-slate-900">BOOLEAN (T/F)</option>
                                <option value="written" className="bg-white dark:bg-slate-900">WRITTEN_PROTOCOL</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {questionForm.question_type === 'mcq' && (
                    <div className="p-8 bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-3xl space-y-4 animate-fadeIn transition-colors shadow-sm">
                         <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4 transition-colors">Response Grid</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {questionForm.options.map((opt, idx) => {
                                const letter = String.fromCharCode(65 + idx);
                                return (
                                    <div key={idx} className="relative group">
                                        <input
                                            type="text"
                                            value={opt}
                                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                                            className="admin-input pl-12"
                                            placeholder={`Option ${letter}`}
                                            required
                                        />
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-indigo-600/50 dark:text-indigo-400/50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{letter}</span>
                                    </div>
                                );
                            })}
                         </div>
                         <div className="pt-4 space-y-2">
                            <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4 transition-colors">Correct Signal</label>
                            <div className="grid grid-cols-4 gap-2">
                                {['A', 'B', 'C', 'D'].map(letter => (
                                    <button
                                        key={letter}
                                        type="button"
                                        onClick={() => setQuestionForm({ ...questionForm, correct_answer: letter })}
                                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                            questionForm.correct_answer === letter ? 'bg-emerald-500 text-black border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-slate-500 border-gray-200 dark:border-white/5'
                                        }`}
                                    >
                                        Node {letter}
                                    </button>
                                ))}
                            </div>
                         </div>
                    </div>
                )}

                {questionForm.question_type === 'true_false' && (
                    <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                        <button
                            type="button"
                            onClick={() => setQuestionForm({ ...questionForm, correct_answer: 'true' })}
                            className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                questionForm.correct_answer === 'true' ? 'bg-emerald-500 text-black border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-slate-500 border-gray-200 dark:border-white/5'
                            }`}
                        >
                            SIGNAL_POSITIVE
                        </button>
                        <button
                            type="button"
                            onClick={() => setQuestionForm({ ...questionForm, correct_answer: 'false' })}
                            className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                questionForm.correct_answer === 'false' ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20' : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-slate-500 border-gray-200 dark:border-white/5'
                            }`}
                        >
                            SIGNAL_NEGATIVE
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4 transition-colors">Probe Weight</label>
                        <input type="number" value={questionForm.points} onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) || 1 })} className="admin-input" min="1" required />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4 transition-colors">Resolution Explanation</label>
                        <input type="text" placeholder="Why is this signal correct?" value={questionForm.explanation} onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })} className="admin-input" />
                    </div>
                </div>

                <div className="flex gap-4 pt-6">
                    <button type="submit" disabled={loading} className="flex-1 admin-btn-primary h-[70px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20">
                        {loading ? <Activity className="w-6 h-6 animate-spin mx-auto" /> : (editingQuestion ? 'APPLY OVERWRITE' : 'COMMIT INJECTION')}
                    </button>
                    <button type="button" onClick={resetQuestionForm} className="px-12 admin-btn-secondary h-[70px] font-bold uppercase transition-colors">ABORT</button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default QuestionForm;
