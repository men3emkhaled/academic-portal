import React from 'react';
import { Plus, Edit3, X, Activity, Shield } from 'lucide-react';

const QuizForm = ({
  quizForm,
  setQuizForm,
  loading,
  editingQuiz,
  handleSaveQuiz,
  resetQuizForm,
  courses
}) => {
  return (
    <div className="admin-modal-backdrop" onClick={resetQuizForm}>
      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-12 w-full max-w-4xl shadow-2xl relative overflow-hidden animate-fadeInUp max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/5 dark:bg-indigo-500/10 blur-[100px] rounded-full transition-colors"></div>
        
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/20 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 transition-colors">
                        {editingQuiz ? <Edit3 className="w-8 h-8" /> : <Plus className="w-8 h-8" />}
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">
                            {editingQuiz ? 'Recalibrate Quiz' : 'Initialize Matrix'}
                        </h3>
                        <p className="text-gray-500 dark:text-slate-500 text-xs font-bold uppercase tracking-widest transition-colors">Core Assessment Node Identity</p>
                    </div>
                </div>
                <button onClick={resetQuizForm} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <form onSubmit={handleSaveQuiz} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-[2rem] transition-colors shadow-sm">
                    <div className="space-y-6">
                        <h5 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] mb-4 transition-colors">Identity Matrix</h5>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4 transition-colors">Deployment Course *</label>
                            <select
                                value={quizForm.course_id}
                                onChange={(e) => setQuizForm({ ...quizForm, course_id: e.target.value })}
                                className="admin-input appearance-none"
                                required
                            >
                                <option value="" className="bg-white dark:bg-slate-900">-- Catalog Select --</option>
                                {courses.map(c => (
                                    <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900">{c.name} (S{c.semester})</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4 transition-colors">Vector Title *</label>
                            <input
                                type="text"
                                placeholder="e.g. Logic Foundations IV"
                                value={quizForm.title}
                                onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                                className="admin-input"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h5 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] mb-4 transition-colors">Constraints</h5>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4 transition-colors">Time Min *</label>
                                <input type="number" value={quizForm.time_limit_minutes} onChange={(e) => setQuizForm({ ...quizForm, time_limit_minutes: e.target.value })} className="admin-input" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4 transition-colors">Pass % *</label>
                                <input type="number" value={quizForm.passing_score} onChange={(e) => setQuizForm({ ...quizForm, passing_score: e.target.value })} className="admin-input" required />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4 transition-colors">Attempt Recurrence</label>
                                <input type="number" value={quizForm.max_attempts} onChange={(e) => setQuizForm({ ...quizForm, max_attempts: e.target.value })} className="admin-input" />
                            </div>
                            <div className="space-y-2 flex flex-col justify-end pb-2">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className="relative">
                                        <input type="checkbox" className="sr-only" checked={quizForm.is_official} onChange={(e) => setQuizForm({ ...quizForm, is_official: e.target.checked })} />
                                        <div className={`block w-10 h-6 rounded-full transition-colors ${quizForm.is_official ? 'bg-red-500' : 'bg-gray-300 dark:bg-slate-700'}`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${quizForm.is_official ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Shield className="w-4 h-4 text-red-500" />
                                      <span className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest transition-colors">Strict / Official Mode</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4 transition-colors">Window Start</label>
                        <input type="datetime-local" value={quizForm.start_date} onChange={(e) => setQuizForm({ ...quizForm, start_date: e.target.value })} className="admin-input" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4 transition-colors">Window Termination</label>
                        <input type="datetime-local" value={quizForm.end_date} onChange={(e) => setQuizForm({ ...quizForm, end_date: e.target.value })} className="admin-input" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4 transition-colors">Deployment Rationale</label>
                    <textarea placeholder="Brief summary for students..." value={quizForm.description} onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })} className="admin-input scrollbar-hide" rows="3" />
                </div>

                <div className="flex gap-4 pt-6">
                    <button type="submit" disabled={loading} className="flex-1 admin-btn-primary h-[70px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20">
                        {loading ? <Activity className="w-6 h-6 animate-spin mx-auto" /> : (editingQuiz ? 'APPLY RECALIBRATION' : 'DEPLOY PROTOCOL')}
                    </button>
                    <button type="button" onClick={resetQuizForm} className="px-12 admin-btn-secondary h-[70px] font-bold uppercase transition-colors">ABORT</button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default QuizForm;
