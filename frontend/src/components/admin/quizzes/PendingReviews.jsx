import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { 
  CheckSquare, User, ClipboardList, Timer, 
  Activity, Award, Edit3, Image as ImageIcon, 
  ExternalLink, Hash, Database,
  CheckCircle2, CheckCircle, Trophy, MessageCircle, Save
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
      toast.error(t('admin.quizzes.reviews_tab') + ' Error');
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
      toast.error('Details Sync Error');
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
      toast.error('Value Required');
      return;
    }
    const numericPoints = parseFloat(points);
    if (isNaN(numericPoints) || numericPoints < 0 || numericPoints > maxPoints) {
      toast.error('Invalid Range');
      return;
    }
    try {
      await api.patch(`/admin/quizzes/answers/${answerId}/grade`, {
        points_earned: numericPoints
      });
      toast.success(t('admin.quizzes.update_success'));
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
        toast.success(t('admin.quizzes.publish_success'));
        setSelectedAttempt(null);
        fetchPendingAttempts();
      }
    } catch (error) {
      toast.error(t('admin.quizzes.update_failed'));
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
    <div className="animate-in fade-in duration-700 pb-10 text-start">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-48 opacity-50">
           <Activity className="w-16 h-16 text-[#8b5cf6] animate-spin mb-8" />
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 dark:text-slate-500">{t('admin.quizzes.registry_stream')}</p>
        </div>
      ) : filteredAttempts.length === 0 ? (
        <div className="bg-white dark:bg-[#0d0d14] border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[3.5rem] py-48 text-center flex flex-col items-center group shadow-inner">
            <div className="w-24 h-24 bg-[#8b5cf6]/5 dark:bg-[#8b5cf6]/10 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-700">
                <CheckCircle2 className="w-12 h-12 text-[#8b5cf6] opacity-40" />
            </div>
            <h4 className="text-2xl font-black uppercase tracking-[0.3em] text-gray-900 dark:text-white leading-none">{t('admin.quizzes.workspace_idle_title')}</h4>
            <p className="text-[10px] font-black mt-6 tracking-widest text-gray-400 uppercase italic opacity-60">{t('admin.quizzes.workspace_idle_desc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
          <div className="xl:col-span-1 space-y-6 max-h-[850px] overflow-y-auto pr-3 no-scrollbar">
            <div className="flex items-center justify-between mb-6 px-6 py-4 bg-amber-500/5 border border-amber-500/10 rounded-[1.5rem]">
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-3">
                    <Timer className="w-4 h-4" /> {t('admin.quizzes.official_mode')}
                </span>
                <span className="px-4 py-1.5 rounded-xl bg-amber-500 text-white text-[10px] font-black shadow-lg shadow-amber-500/20">{filteredAttempts.length}</span>
            </div>
            {filteredAttempts.map((attempt) => (
              <div
                key={attempt.attempt_id}
                onClick={() => handleSelectAttempt(attempt)}
                className={`group relative p-8 rounded-[3rem] border transition-all duration-500 cursor-pointer ${
                  selectedAttempt?.attempt_id === attempt.attempt_id
                    ? 'bg-[#8b5cf6] text-white border-[#8b5cf6] shadow-2xl shadow-purple-500/20 scale-[1.02]'
                    : 'bg-white dark:bg-[#0d0d14] border-gray-100 dark:border-white/5 hover:border-[#8b5cf6]/40'
                }`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 rounded-[1.25rem] bg-gray-100 dark:bg-black border border-gray-100 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                      {attempt.avatar_url ? (
                        <img src={attempt.avatar_url} alt={attempt.student_name} className="w-full h-full object-cover" />
                      ) : (
                        <User className={`w-7 h-7 ${selectedAttempt?.attempt_id === attempt.attempt_id ? 'text-white/50' : 'text-gray-300 dark:text-slate-500'}`} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black tracking-tighter text-base uppercase leading-none truncate transition-colors">{attempt.student_name}</h4>
                      <p className={`text-[9px] font-black tracking-[0.3em] uppercase mt-2 italic ${selectedAttempt?.attempt_id === attempt.attempt_id ? 'text-white/60' : 'text-gray-400 dark:text-slate-400'}`}>ID: {attempt.student_id}</p>
                    </div>
                  </div>
                </div>
                <div className={`p-5 rounded-[1.5rem] border transition-all mb-6 ${
                    selectedAttempt?.attempt_id === attempt.attempt_id ? 'bg-white/10 border-white/10' : 'bg-gray-50 dark:bg-white/[0.01] border-gray-100 dark:border-white/5'
                }`}>
                    <p className="text-[10px] font-black uppercase tracking-widest truncate leading-none">{attempt.quiz_title}</p>
                </div>
                <div className={`flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] ${selectedAttempt?.attempt_id === attempt.attempt_id ? 'text-white/50' : 'text-gray-400 dark:text-slate-400'}`}>
                  <span className="flex items-center gap-2"><Activity className="w-3.5 h-3.5" /> STAGED</span>
                  <span>{formatDate(attempt.completed_at)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="xl:col-span-3">
            {!selectedAttempt ? (
              <div className="bg-white dark:bg-[#0d0d14] border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[4rem] py-60 text-center flex flex-col items-center group transition-all duration-700 h-full justify-center shadow-inner">
                  <div className="w-32 h-32 bg-[#8b5cf6]/5 dark:bg-[#8b5cf6]/10 rounded-full flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-700 relative">
                    <div className="absolute inset-0 bg-[#8b5cf6] blur-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    <ClipboardList className="w-16 h-16 text-[#8b5cf6] opacity-40 relative z-10" />
                  </div>
                  <h4 className="text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none mb-6">{t('admin.quizzes.workspace_idle_title')}</h4>
                  <p className="text-xs font-black mt-2 tracking-[0.3em] text-gray-400 uppercase max-w-sm italic opacity-40">{t('admin.quizzes.workspace_idle_desc')}</p>
              </div>
            ) : detailsLoading ? (
               <div className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[4rem] py-60 flex flex-col items-center justify-center h-full shadow-inner animate-pulse">
                  <Activity className="w-16 h-16 text-[#8b5cf6] animate-spin mb-8" />
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">{t('admin.quizzes.registry_stream')}</p>
               </div>
            ) : (
              <div className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[4rem] overflow-hidden shadow-sm animate-in fade-in slide-in-from-right-12 duration-700">
                <div className="p-12 border-b border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.01]">
                  <div className="flex items-center gap-10">
                        <div className="w-24 h-24 rounded-[2.5rem] bg-[#8b5cf6]/5 border-2 border-[#8b5cf6]/20 flex items-center justify-center overflow-hidden shadow-inner scale-110">
                            {selectedAttempt.avatar_url ? (
                              <img src={selectedAttempt.avatar_url} alt={selectedAttempt.student_name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-12 h-12 text-[#8b5cf6] opacity-30" />
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-6 mb-4">
                                <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">{selectedAttempt.student_name}</h3>
                                <span className="px-5 py-2 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm">{t('admin.quizzes.official_mode')}</span>
                            </div>
                            <div className="flex items-center gap-8">
                                <div className="flex items-center gap-3 text-xs font-black text-gray-400 dark:text-slate-400 uppercase tracking-[0.2em] italic">
                                    <Hash className="w-5 h-5 text-[#8b5cf6] opacity-40" /> ID_{selectedAttempt.student_id}
                                </div>
                                <div className="w-2 h-2 bg-[#8b5cf6]/20 rounded-full"></div>
                                <div className="flex items-center gap-3 text-xs font-black text-[#8b5cf6] uppercase tracking-[0.2em] italic leading-none">
                                    <MessageCircle className="w-5 h-5" /> {selectedAttempt.quiz_title}
                                </div>
                            </div>
                        </div>
                  </div>
                </div>

                <div className="p-12 space-y-16 max-h-[900px] overflow-y-auto custom-scrollbar">
                  {reviewAnswers.length === 0 ? (
                    <div className="text-center py-40 opacity-20">
                        <Database className="w-20 h-20 mx-auto mb-8 text-gray-400" />
                        <p className="text-xl font-black uppercase tracking-widest text-gray-400">{t('admin.quizzes.no_quizzes')}</p>
                    </div>
                  ) : (
                    reviewAnswers.map((ans, idx) => (
                      <div key={ans.answer_id} className="group relative bg-white dark:bg-[#0c0c14]/40 border border-gray-100 dark:border-white/5 rounded-[3.5rem] p-12 hover:border-[#8b5cf6]/40 transition-all duration-700 shadow-sm hover:shadow-2xl text-start">
                           <div className="flex items-start gap-8 mb-12 pb-10 border-b border-gray-100 dark:border-white/5">
                                <span className="w-14 h-14 rounded-[1.5rem] bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-center justify-center text-base font-black text-[#8b5cf6] shadow-inner shrink-0">{idx + 1}</span>
                                <div className="flex-1">
                                    <h5 className="text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-[0.3em] mb-3">{t('admin.quizzes.authorized_entities')}</h5>
                                    <p className="text-gray-900 dark:text-white font-black text-2xl tracking-tight leading-relaxed uppercase">{ans.question_text}</p>
                                </div>
                                <span className="px-6 py-2.5 rounded-2xl bg-[#8b5cf6]/5 text-[#8b5cf6] border border-[#8b5cf6]/20 text-[10px] font-black uppercase tracking-widest shadow-sm">
                                    {ans.points} PTS
                                </span>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                                <div className="space-y-6">
                                    <h5 className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-[0.3em] flex items-center gap-3">
                                        <Edit3 className="w-5 h-5" /> {t('admin.quizzes.identity_registration')}
                                    </h5>
                                    <div className="p-10 rounded-[2.5rem] bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 min-h-[220px] shadow-inner group-hover:bg-[#8b5cf6]/5 transition-colors duration-700 text-start">
                                        {ans.student_answer ? (
                                            <p className="text-gray-700 dark:text-slate-300 font-bold leading-relaxed whitespace-pre-wrap text-base uppercase tracking-tight italic">"{ans.student_answer}"</p>
                                        ) : (
                                            <p className="text-rose-500/50 italic text-[10px] uppercase tracking-[0.3em] font-black">{t('admin.quizzes.registry_stream')}: NO DATA</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h5 className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-[0.3em] flex items-center gap-3">
                                        <ImageIcon className="w-5 h-5" /> VISUAL_EVIDENCE
                                    </h5>
                                    {ans.written_answer_url ? (
                                        <div className="relative group/img rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-white/10 shadow-2xl aspect-video cursor-pointer">
                                            <img
                                                src={getDirectImageUrl(`${process.env.REACT_APP_API_URL || ''}${ans.written_answer_url}`)}
                                                alt="Answer evidence"
                                                className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-1000"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://via.placeholder.com/600x400/000/333?text=STREAM_LOST';
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-[#8b5cf6]/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                <button 
                                                    onClick={() => window.open(`${process.env.REACT_APP_API_URL || ''}${ans.written_answer_url}`, '_blank')}
                                                    className="bg-white text-black px-10 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-3 hover:scale-110 active:scale-95 transition-all"
                                                >
                                                    <ExternalLink className="w-4 h-4" /> OPEN_NODE
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full aspect-video rounded-[2.5rem] bg-gray-50 dark:bg-black/20 border-2 border-dashed border-gray-100 dark:border-white/5 flex flex-col items-center justify-center opacity-30 group-hover:opacity-100 transition-all duration-700">
                                            <ImageIcon className="w-16 h-16 text-gray-400 mb-4" />
                                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">NO_VISUAL_REF</p>
                                        </div>
                                    )}
                                </div>
                           </div>

                           <div className="pt-10 border-t border-gray-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-8">
                              {ans.graded ? (
                                <div className="flex items-center gap-6 px-10 py-5 rounded-[2rem] bg-[#8b5cf6] text-white shadow-2xl shadow-purple-500/30 animate-in zoom-in duration-500 scale-105">
                                  <Trophy className="w-6 h-6 animate-bounce" />
                                  <span className="text-xs font-black uppercase tracking-[0.2em]">{ans.points_earned} / {ans.points} POINTS_AUTHORIZED</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-6">
                                  <div className="relative group/input">
                                      <input
                                        type="number"
                                        min="0"
                                        max={ans.points}
                                        step="0.5"
                                        placeholder="0.00"
                                        value={grading[ans.answer_id] ?? ''}
                                        onChange={(e) => handleGradeChange(ans.answer_id, e.target.value)}
                                        className="w-44 bg-gray-50 dark:bg-black border border-gray-100 dark:border-white/10 rounded-2xl px-8 py-5 text-gray-900 dark:text-white text-2xl font-black focus:ring-4 focus:ring-[#8b5cf6]/10 outline-none transition-all shadow-inner"
                                      />
                                      <Award className="absolute inset-inline-end-6 top-1/2 -translate-y-1/2 w-6 h-6 text-[#8b5cf6] group-focus-within/input:scale-125 transition-transform" />
                                  </div>
                                  <button
                                    onClick={() => handleSubmitGrade(ans.answer_id, ans.points)}
                                    className="group px-12 py-5 bg-black dark:bg-white text-white dark:text-black rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4 relative overflow-hidden"
                                  >
                                    <div className="absolute inset-0 bg-[#8b5cf6] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <Save className="w-5 h-5 relative z-10" /> 
                                    <span className="relative z-10">AUTHORIZE_GRADE</span>
                                  </button>
                                </div>
                              )}
                              
                              <div className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-3 opacity-40">
                                 <Database className="w-4 h-4" /> NODE_REF: {ans.answer_id}
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