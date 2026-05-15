import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { 
  CheckSquare, User, ClipboardList, Timer, 
  Activity, Award, Edit3, Image as ImageIcon, 
  ExternalLink, ChevronRight, Hash, Database,
  AlertCircle, CheckCircle2, Search, Filter,
  CheckCircle, X, Trophy, MessageCircle
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

const PendingReviews = ({ quizId = null }) => {
  const { t } = useTranslation();
  const [allPendingAttempts, setAllPendingAttempts] = useState([]);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [reviewAnswers, setReviewAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [grading, setGrading] = useState({});

  const fetchPendingAttempts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/quizzes/pending-reviews');
      setAllPendingAttempts(res.data);
    } catch (error) {
      toast.error(t('admin.quizzes.reviews.load_failed') || 'Failed to load reviews');
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
      toast.error(t('admin.quizzes.reviews.details_failed') || 'Failed to load attempt details');
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
      toast.error(t('admin.quizzes.reviews.enter_score_error') || 'Enter a score');
      return;
    }
    const numericPoints = parseFloat(points);
    if (isNaN(numericPoints) || numericPoints < 0 || numericPoints > maxPoints) {
      toast.error(t('admin.quizzes.reviews.score_range_error', { max: maxPoints }) || `Score must be between 0 and ${maxPoints}`);
      return;
    }
    try {
      await api.patch(`/admin/quizzes/answers/${answerId}/grade`, {
        points_earned: numericPoints
      });
      toast.success(t('admin.quizzes.reviews.grade_success') || 'Grade submitted');
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
        toast.success(t('admin.quizzes.reviews.all_graded_success') || 'All answers graded for this attempt');
        setSelectedAttempt(null);
        fetchPendingAttempts();
      }
    } catch (error) {
      toast.error(t('admin.quizzes.reviews.grade_failed') || 'Failed to submit grade');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
  };

  const filteredAttempts = quizId 
    ? allPendingAttempts.filter(a => a.quiz_id === parseInt(quizId))
    : allPendingAttempts;

  return (
    <div className="animate-in fade-in duration-700 pb-10">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-48 opacity-50">
           <Activity className="w-12 h-12 text-emerald-600 animate-spin mb-6" />
           <p className="text-xs font-black uppercase tracking-widest text-gray-500">{t('admin.quizzes.reviews.scanning')}</p>
        </div>
      ) : filteredAttempts.length === 0 ? (
        <div className="bg-white/80 dark:bg-black/20 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-[3rem] py-48 text-center flex flex-col items-center group transition-[color,background-color,border-color,transform,opacity] duration-500">
            <div className="w-24 h-24 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 opacity-50" />
            </div>
            <h4 className="text-xl font-black uppercase tracking-[0.3em] text-gray-900 dark:text-white">{t('admin.quizzes.reviews.all_clear_title')}</h4>
            <p className="text-sm font-bold mt-4 tracking-widest text-gray-500">{t('admin.quizzes.reviews.all_clear_desc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
          <div className="xl:col-span-1 space-y-4 max-h-[800px] overflow-y-auto pr-3 no-scrollbar">
            <div className="flex items-center justify-between mb-4 px-4 py-2 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                    <Timer className="w-3.5 h-3.5" /> {t('admin.quizzes.reviews.high_priority')}
                </span>
                <span className="px-3 py-1 rounded-lg bg-amber-600 text-white text-[10px] font-black shadow-lg shadow-amber-500/20">{filteredAttempts.length}</span>
            </div>
            {filteredAttempts.map((attempt) => (
              <div
                key={attempt.attempt_id}
                onClick={() => handleSelectAttempt(attempt)}
                className={`group relative p-6 rounded-[2.5rem] border transition-[color,background-color,border-color,transform,opacity] duration-500 cursor-pointer ${
                  selectedAttempt?.attempt_id === attempt.attempt_id
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-xl'
                    : 'bg-white/80 dark:bg-[#111]/80 border-gray-100 dark:border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-black border border-gray-200 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                      {attempt.avatar_url ? (
                        <img src={attempt.avatar_url} alt={attempt.student_name} className="w-full h-full object-cover" />
                      ) : (
                        <User className={`w-6 h-6 ${selectedAttempt?.attempt_id === attempt.attempt_id ? 'text-white/50' : 'text-gray-300'}`} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className={`font-black tracking-tight text-sm truncate ${selectedAttempt?.attempt_id === attempt.attempt_id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{attempt.student_name}</h4>
                      <p className={`text-[10px] font-black tracking-widest uppercase mt-0.5 ${selectedAttempt?.attempt_id === attempt.attempt_id ? 'text-white/60' : 'text-gray-400'}`}>ID: {attempt.student_id}</p>
                    </div>
                  </div>
                  <span className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black border transition-[color,background-color,border-color,transform,opacity] ${
                      selectedAttempt?.attempt_id === attempt.attempt_id ? 'bg-white/20 border-white/20 text-white' : 'bg-amber-500/10 border-amber-500/20 text-amber-600'
                  }`}>
                    {attempt.pending_count}
                  </span>
                </div>
                <div className={`p-4 rounded-2xl border transition-[color,background-color,border-color,transform,opacity] mb-4 ${
                    selectedAttempt?.attempt_id === attempt.attempt_id ? 'bg-black/10 border-white/10' : 'bg-gray-50 dark:bg-black/40 border-gray-100 dark:border-white/5'
                }`}>
                    <p className={`text-[9px] font-black uppercase tracking-[0.15em] truncate ${selectedAttempt?.attempt_id === attempt.attempt_id ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>{attempt.quiz_title}</p>
                </div>
                <div className={`flex items-center justify-between text-[10px] font-black uppercase tracking-widest ${selectedAttempt?.attempt_id === attempt.attempt_id ? 'text-white/50' : 'text-gray-400 dark:text-gray-600'}`}>
                  <span className="flex items-center gap-1.5"><Activity className="w-3 h-3" /> STAGED</span>
                  <span>{formatDate(attempt.completed_at)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="xl:col-span-3">
            {!selectedAttempt ? (
              <div className="bg-white/80 dark:bg-[#111]/80 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-[3rem] py-56 text-center flex flex-col items-center group transition-[color,background-color,border-color,transform,opacity] duration-500 shadow-sm">
                  <div className="w-24 h-24 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                    <ClipboardList className="w-12 h-12 text-emerald-400 opacity-50" />
                  </div>
                  <h4 className="text-xl font-black uppercase tracking-[0.3em] text-gray-900 dark:text-white">{t('admin.quizzes.reviews.workspace_idle_title')}</h4>
                  <p className="text-sm font-bold mt-4 tracking-widest text-gray-500 max-w-xs">{t('admin.quizzes.reviews.workspace_idle_desc')}</p>
              </div>
            ) : detailsLoading ? (
               <div className="bg-white/80 dark:bg-[#111]/80 border border-gray-200 dark:border-white/10 rounded-[3rem] py-60 flex flex-col items-center justify-center shadow-sm">
                  <Activity className="w-12 h-12 text-emerald-600 animate-spin mb-6" />
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('admin.quizzes.reviews.hydrating')}</p>
               </div>
            ) : (
              <div className="bg-white/80 dark:bg-[#111]/80 border border-gray-200 dark:border-white/10 rounded-[3rem] overflow-hidden shadow-sm animate-in fade-in slide-in-from-right-6 duration-500">
                <div className="p-10 border-b border-gray-100 dark:border-white/10 bg-gray-50/30 dark:bg-white/[0.01]">
                  <div className="flex items-center gap-8">
                        <div className="w-20 h-20 rounded-[2rem] bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center overflow-hidden shadow-inner">
                            {selectedAttempt.avatar_url ? (
                              <img src={selectedAttempt.avatar_url} alt={selectedAttempt.student_name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-10 h-10 text-emerald-600/50" />
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{selectedAttempt.student_name}</h3>
                                <span className="px-3 py-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest">{t('admin.quizzes.reviews.awaiting_grade')}</span>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                    <Hash className="w-4 h-4 text-gray-300" /> {selectedAttempt.student_id}
                                </div>
                                <div className="w-1.5 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                                <div className="flex items-center gap-2 text-xs font-black text-emerald-600 uppercase tracking-widest">
                                    <MessageCircle className="w-4 h-4" /> {selectedAttempt.quiz_title}
                                </div>
                            </div>
                        </div>
                  </div>
                </div>

                <div className="p-10 space-y-12 max-h-[850px] overflow-y-auto no-scrollbar">
                  {reviewAnswers.length === 0 ? (
                    <div className="text-center py-32 opacity-30 grayscale">
                        <AlertCircle className="w-16 h-16 mx-auto mb-6 text-gray-400" />
                        <p className="text-sm font-black uppercase tracking-widest text-gray-500">{t('admin.quizzes.reviews.no_answers')}</p>
                    </div>
                  ) : (
                    reviewAnswers.map((ans, idx) => (
                      <div key={ans.answer_id} className="group relative bg-white/50 dark:bg-black/20 border border-gray-100 dark:border-white/10 rounded-[3rem] p-10 hover:border-emerald-500/40 transition-[color,background-color,border-color,transform,opacity] duration-500 shadow-sm hover:shadow-xl">
                           <div className="flex items-center gap-5 mb-10 pb-6 border-b border-gray-100 dark:border-white/10">
                                <span className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs font-black text-emerald-600 shadow-inner">{idx + 1}</span>
                                <div className="flex-1">
                                    <h5 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('admin.quizzes.reviews.question_text_label')}</h5>
                                    <p className="text-gray-900 dark:text-white font-black text-xl tracking-tight leading-relaxed mt-1">{ans.question_text}</p>
                                </div>
                                <span className="px-4 py-2 rounded-xl bg-indigo-500/5 text-indigo-600 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest">
                                    {t('admin.quizzes.reviews.points_label', { count: ans.points })}
                                </span>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                                <div className="space-y-4">
                                    <h5 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                                        <Edit3 className="w-4 h-4" /> {t('admin.quizzes.reviews.written_answer')}
                                    </h5>
                                    <div className="p-8 rounded-[2rem] bg-gray-50/50 dark:bg-black/40 border border-gray-100 dark:border-white/5 min-h-[160px] shadow-inner">
                                        {ans.student_answer ? (
                                            <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed whitespace-pre-wrap text-sm">{ans.student_answer}</p>
                                        ) : (
                                            <p className="text-rose-500/50 italic text-xs uppercase tracking-widest font-black">{t('admin.quizzes.reviews.no_response')}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4" /> {t('admin.quizzes.reviews.student_photo')}
                                    </h5>
                                    {ans.written_answer_url ? (
                                        <div className="relative group/img rounded-[2rem] overflow-hidden border border-gray-200 dark:border-white/10 shadow-lg aspect-video">
                                            <img
                                                src={getDirectImageUrl(`${process.env.REACT_APP_API_URL || ''}${ans.written_answer_url}`)}
                                                alt="Answer evidence"
                                                className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://via.placeholder.com/600x400/111/444?text=Signal+Lost';
                                                }}
                                            />
                                            <button 
                                                onClick={() => window.open(`${process.env.REACT_APP_API_URL || ''}${ans.written_answer_url}`, '_blank')}
                                                className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-[color,background-color,border-color,transform,opacity]"
                                            >
                                                <div className="bg-white text-indigo-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2">
                                                    <ExternalLink className="w-4 h-4" /> {t('admin.quizzes.reviews.view_image_btn')}
                                                </div>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-full aspect-video rounded-[2rem] bg-gray-50 dark:bg-black/40 border-2 border-dashed border-gray-200 dark:border-white/5 flex flex-col items-center justify-center opacity-40">
                                            <ImageIcon className="w-12 h-12 text-gray-300 mb-2" />
                                            <p className="text-[10px] font-black uppercase text-gray-400">{t('admin.quizzes.reviews.no_image')}</p>
                                        </div>
                                    )}
                                </div>
                           </div>

                           <div className="pt-8 border-t border-gray-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-6">
                              {ans.graded ? (
                                <div className="flex items-center gap-4 px-8 py-4 rounded-[1.5rem] bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 animate-in zoom-in-95">
                                  <Trophy className="w-5 h-5" />
                                  <span className="text-sm font-black uppercase tracking-widest">{t('admin.quizzes.reviews.graded_label', { earned: ans.points_earned, total: ans.points })}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-4">
                                  <div className="relative group">
                                      <input
                                        type="number"
                                        min="0"
                                        max={ans.points}
                                        step="0.5"
                                        placeholder={t('admin.quizzes.reviews.score_placeholder', { max: ans.points })}
                                        value={grading[ans.answer_id] ?? ''}
                                        onChange={(e) => handleGradeChange(ans.answer_id, e.target.value)}
                                        className="w-40 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-2xl px-6 py-4.5 text-gray-900 dark:text-white text-lg font-black focus:ring-2 focus:ring-emerald-500/50 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner"
                                      />
                                      <Award className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 pointer-events-none" />
                                  </div>
                                  <button
                                    onClick={() => handleSubmitGrade(ans.answer_id, ans.points)}
                                    className="px-10 py-4.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-[color,background-color,border-color,transform,opacity] flex items-center gap-3"
                                  >
                                    <CheckCircle className="w-5 h-5" /> {t('admin.quizzes.reviews.submit_grade_btn')}
                                  </button>
                                </div>
                              )}
                              
                              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                 <Database className="w-3.5 h-3.5 text-gray-300" /> {t('admin.quizzes.reviews.reference_label', { id: ans.answer_id })}
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