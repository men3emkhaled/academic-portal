import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { 
  CheckSquare, User, ClipboardList, Timer, 
  Activity, Award, Edit3, Image as ImageIcon, 
  ExternalLink, ChevronRight, Hash, Database,
  AlertCircle, CheckCircle2, Search, Filter
} from 'lucide-react';

const getDirectImageUrl = (url) => {
  if (!url) return '';
  if (url.includes('ibb.co') && !url.includes('i.ibb.co')) {
    const match = url.match(/ibb\.co\/([a-zA-Z0-9]+)$/);
    if (match) {
      return `https://i.ibb.co/${match[1]}/image.jpg`;
    }
  }
  return url;
};

const PendingReviews = () => {
  const [pendingAttempts, setPendingAttempts] = useState([]);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [reviewAnswers, setReviewAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [grading, setGrading] = useState({});

  const fetchPendingAttempts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/quizzes/pending-reviews');
      setPendingAttempts(res.data);
    } catch (error) {
      toast.error('Failed to load pending reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttemptDetails = async (attemptId) => {
    setDetailsLoading(true);
    try {
      const res = await api.get(`/admin/quizzes/attempts/${attemptId}/review`);
      setReviewAnswers(res.data);
    } catch (error) {
      toast.error('Failed to load attempt details');
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingAttempts();
  }, []);

  const handleSelectAttempt = (attempt) => {
    setSelectedAttempt(attempt);
    fetchAttemptDetails(attempt.attempt_id);
  };

  const handleGradeChange = (answerId, value) => {
    setGrading(prev => ({ ...prev, [answerId]: value }));
  };

  const handleSubmitGrade = async (answerId, maxPoints) => {
    const points = grading[answerId];
    if (points === undefined || points === '') {
      toast.error('Please enter a score');
      return;
    }
    const numericPoints = parseFloat(points);
    if (isNaN(numericPoints) || numericPoints < 0 || numericPoints > maxPoints) {
      toast.error(`Score must be between 0 and ${maxPoints}`);
      return;
    }
    try {
      await api.patch(`/admin/quizzes/answers/${answerId}/grade`, {
        points_earned: numericPoints
      });
      toast.success('Logical block validated');
      setReviewAnswers(prev =>
        prev.map(ans =>
          ans.answer_id === answerId ? { ...ans, points_earned: numericPoints, graded: true } : ans
        )
      );
      setGrading(prev => ({ ...prev, [answerId]: undefined }));
      
      const updatedAnswers = reviewAnswers.map(ans =>
         ans.answer_id === answerId ? { ...ans, graded: true } : ans
      );
      
      const allGraded = updatedAnswers.every(ans => ans.graded);
      if (allGraded) {
        toast.success('Full attempt reconciled');
        setSelectedAttempt(null);
        fetchPendingAttempts();
      }
    } catch (error) {
      toast.error('Validation failure');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="animate-fadeIn pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-2 h-10 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              <CheckSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" /> Review Board
            </h2>
            <p className="text-gray-500 dark:text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Manual Assessment Reconciliation</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40">
           <Activity className="w-10 h-10 text-emerald-600 dark:text-emerald-400 animate-spin mb-4" />
           <p className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest">Scanning Registry...</p>
        </div>
      ) : pendingAttempts.length === 0 ? (
        <div className="bg-white dark:bg-[#111111]/40 border border-gray-200 dark:border-white/5 border-dashed rounded-[2.5rem] py-40 text-center grayscale opacity-20 flex flex-col items-center transition-colors shadow-sm">
            <CheckCircle2 className="w-24 h-24 mb-6 text-gray-400 dark:text-white" />
            <h4 className="text-lg font-black uppercase tracking-[0.5em] text-gray-900 dark:text-white">Ledger Reconciled</h4>
            <p className="text-xs font-bold mt-4 tracking-widest text-gray-500 dark:text-slate-400">All student nodes have been processed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-1 space-y-4 max-h-[850px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex items-center justify-between mb-2 ml-4">
                <span className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Timer className="w-3.5 h-3.5" /> High Priority Queue
                </span>
                <span className="px-2 py-1 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-black border border-orange-500/20">{pendingAttempts.length} Nodes</span>
            </div>
            {pendingAttempts.map((attempt) => (
              <div
                key={attempt.attempt_id}
                onClick={() => handleSelectAttempt(attempt)}
                className={`group relative p-6 rounded-[2rem] border transition-all duration-500 cursor-pointer ${
                  selectedAttempt?.attempt_id === attempt.attempt_id
                    ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_20px_40px_rgba(16,185,129,0.1)]'
                    : 'bg-white dark:bg-[#111111]/40 border-gray-200 dark:border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="min-w-0">
                    <h4 className={`font-black tracking-tight truncate transition-colors ${selectedAttempt?.attempt_id === attempt.attempt_id ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-900 dark:text-white group-hover:text-emerald-600'}`}>{attempt.student_name}</h4>
                    <p className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase tracking-widest">ID: {attempt.student_id}</p>
                  </div>
                  <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[10px] font-black text-orange-600 dark:text-orange-400">
                    {attempt.pending_count}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-white/5 mb-4 group-hover:border-emerald-500/30 transition-all">
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest truncate">{attempt.quiz_title}</p>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><Activity className="w-3 h-3" /> STAGED</span>
                  <span>{formatDate(attempt.completed_at)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="xl:col-span-3">
            {!selectedAttempt ? (
              <div className="bg-white dark:bg-[#111111]/40 border border-gray-200 dark:border-white/5 border-dashed rounded-[2.5rem] py-60 text-center grayscale opacity-20 flex flex-col items-center transition-colors shadow-sm">
                  <ClipboardList className="w-24 h-24 mb-6 text-gray-400 dark:text-white" />
                  <h4 className="text-lg font-black uppercase tracking-[0.5em] text-gray-900 dark:text-white">Workspace Idle</h4>
                  <p className="text-xs font-bold mt-4 tracking-widest text-gray-500 dark:text-slate-300">Select an attempt from the queue to start manual validation.</p>
              </div>
            ) : detailsLoading ? (
               <div className="bg-white dark:bg-[#111111]/40 border border-gray-200 dark:border-white/5 rounded-[2.5rem] py-60 flex flex-col items-center justify-center transition-colors shadow-sm">
                  <Activity className="w-12 h-12 text-emerald-600 dark:text-emerald-400 animate-spin mb-4" />
                  <p className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest">Hydrating Module Data...</p>
               </div>
            ) : (
              <div className="bg-white dark:bg-[#111111]/40 border border-gray-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-sm animate-fadeIn transition-colors">
                <div className="p-10 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] transition-colors">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 transition-colors">
                            <User className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{selectedAttempt.student_name}</h3>
                            <div className="flex items-center gap-4 mt-1">
                                <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Hash className="w-4 h-4 text-gray-300 dark:text-slate-700" /> {selectedAttempt.student_id}
                                </span>
                                <span className="w-1 h-1 bg-gray-200 dark:bg-slate-800 rounded-full"></span>
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">{selectedAttempt.quiz_title}</span>
                            </div>
                        </div>
                    </div>
                  </div>
                </div>

                <div className="p-10 space-y-10 max-h-[800px] overflow-y-auto custom-scrollbar">
                  {reviewAnswers.length === 0 ? (
                    <div className="text-center py-20 grayscale opacity-20 transition-all">
                        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-white" />
                        <p className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-slate-500">No valid data packets found</p>
                    </div>
                  ) : (
                    reviewAnswers.map((ans, idx) => (
                      <div key={ans.answer_id} className="relative group bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8 hover:bg-gray-100 dark:hover:bg-white/[0.03] transition-all duration-500">
                           <div className="flex items-center gap-4 mb-8">
                                <span className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[10px] font-black text-emerald-600 dark:text-emerald-400 transition-colors">{idx + 1}</span>
                                <div className="h-[1px] flex-1 bg-gray-200 dark:bg-white/5 transition-colors"></div>
                                <span className="px-3 py-1 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[9px] font-black uppercase tracking-tight border border-orange-500/20 transition-colors">
                                    MAX_CREDIT: {ans.points}
                                </span>
                           </div>

                           <div className="mb-10">
                                <h5 className="text-[10px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-widest mb-3 transition-colors">Probe Stimulus</h5>
                                <p className="text-gray-900 dark:text-white font-black text-lg tracking-tight leading-relaxed transition-colors">{ans.question_text || 'Undefined Question'}</p>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                <div className="space-y-4">
                                    <h5 className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2 transition-colors">
                                        <Edit3 className="w-3.5 h-3.5" /> Logical response
                                    </h5>
                                    <div className="p-6 rounded-3xl bg-white dark:bg-black/40 border border-gray-100 dark:border-white/5 min-h-[120px] group-hover:border-emerald-500/20 transition-all shadow-inner">
                                        {ans.student_answer ? (
                                            <p className="text-gray-700 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-wrap text-sm transition-colors">{ans.student_answer}</p>
                                        ) : (
                                            <p className="text-red-500/50 italic text-xs uppercase tracking-widest font-black transition-colors">Null Input Exception</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h5 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2 transition-colors">
                                        <ImageIcon className="w-3.5 h-3.5" /> Visual evidence
                                    </h5>
                                    {ans.written_answer_url ? (
                                        <div className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-white/5 group/img hover:border-indigo-500/30 transition-all shadow-sm">
                                            <img
                                                src={getDirectImageUrl(`${process.env.REACT_APP_API_URL || ''}${ans.written_answer_url}`)}
                                                alt="Manual input evidence"
                                                className="w-full h-40 object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://via.placeholder.com/400x200/111/444?text=Signal+Interrupted';
                                                }}
                                            />
                                            <button 
                                                onClick={() => window.open(`${process.env.REACT_APP_API_URL || ''}${ans.written_answer_url}`, '_blank')}
                                                className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                                            >
                                                <ExternalLink className="w-6 h-6 text-white" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-full h-40 rounded-3xl bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-white/5 border-dashed flex flex-col items-center justify-center grayscale opacity-10 transition-colors">
                                            <ImageIcon className="w-10 h-10 text-gray-300 dark:text-slate-700" />
                                            <p className="text-[10px] font-black uppercase mt-2 text-gray-400 dark:text-slate-800">No visual matrix</p>
                                        </div>
                                    )}
                                </div>
                           </div>

                           <div className="pt-8 border-t border-gray-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-6 transition-colors">
                              {ans.graded ? (
                                <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 transition-colors shadow-sm">
                                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                  <span className="text-xs font-black uppercase tracking-widest">Validated: {ans.points_earned} / {ans.points} Units</span>
                                </div>
                              ) : (
                                <div className="flex-1 flex items-center gap-3">
                                  <div className="relative">
                                      <input
                                        type="number"
                                        min="0"
                                        max={ans.points}
                                        step="0.5"
                                        placeholder={`0-${ans.points}`}
                                        value={grading[ans.answer_id] ?? ''}
                                        onChange={(e) => handleGradeChange(ans.answer_id, e.target.value)}
                                        className="w-32 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white text-sm font-black focus:border-emerald-500 transition-all appearance-none shadow-sm"
                                      />
                                      <Award className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-slate-700 font-black" />
                                  </div>
                                  <button
                                    onClick={() => handleSubmitGrade(ans.answer_id, ans.points)}
                                    className="px-8 py-4 bg-emerald-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
                                  >
                                    Commit Validation
                                  </button>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-slate-600 text-[9px] font-black uppercase tracking-widest border border-gray-200 dark:border-white/5 transition-colors">
                                 <Database className="w-3 h-3 text-gray-300 dark:text-slate-700" /> Answer_Ref: {ans.answer_id}
                              </div>
                           </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingReviews;