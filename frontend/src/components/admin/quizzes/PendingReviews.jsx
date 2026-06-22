import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import {
  User, ClipboardList, Timer,
  Activity, Edit3, Image as ImageIcon,
  CheckCircle2, Trophy, Save
} from 'lucide-react';

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
      toast.error(t('admin.messages.load_logs_failed'));
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
      toast.error(t('admin.messages.load_logs_failed'));
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
      toast.error(t('admin.messages.fields_req'));
      return;
    }
    const numericPoints = parseFloat(points);
    if (isNaN(numericPoints) || numericPoints < 0 || numericPoints > maxPoints) {
      toast.error(t('admin.messages.operation_failed'));
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
        toast.success(t('admin.quizzes.reviews.all_graded'));
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
    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-12 text-sm text-gray-400">
          <Activity className="w-8 h-8 mx-auto mb-2 animate-spin opacity-30" />
          {t('admin.logs.sync')}
        </div>
      ) : filteredAttempts.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
          <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
          {t('admin.quizzes.reviews.no_pending')}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          {/* Left: Attempt list */}
          <div className="xl:col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
            <div className="flex items-center justify-between mb-2 px-3 py-2 bg-amber-500/5 border border-amber-500/10 rounded-lg">
              <span className="text-xs font-medium text-amber-600 flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5" /> {t('admin.quizzes.reviews.pending_count', { count: filteredAttempts.length })}
              </span>
            </div>
            {filteredAttempts.map((attempt) => (
              <div
                key={attempt.attempt_id}
                onClick={() => handleSelectAttempt(attempt)}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedAttempt?.attempt_id === attempt.attempt_id
                    ? 'bg-[#059669] text-white border-[#059669]'
                    : 'bg-white dark:bg-[#0d0d14] border-gray-200 dark:border-gray-700 hover:border-[#059669]/30 text-gray-900 dark:text-white'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                    {attempt.avatar_url ? (
                      <img src={attempt.avatar_url} alt={attempt.student_name} className="w-full h-full object-cover" />
                    ) : (
                      <User className={`w-4 h-4 ${selectedAttempt?.attempt_id === attempt.attempt_id ? 'text-white/50' : 'text-gray-400'}`} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold truncate">{attempt.student_name}</h4>
                    <p className={`text-[10px] ${selectedAttempt?.attempt_id === attempt.attempt_id ? 'text-white/60' : 'text-gray-400'}`}>ID: {attempt.student_id}</p>
                  </div>
                </div>
                <div className={`px-3 py-2 rounded-md border text-xs ${
                  selectedAttempt?.attempt_id === attempt.attempt_id ? 'bg-white/10 border-white/10' : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700'
                }`}>
                  <p className="truncate font-medium">{attempt.quiz_title}</p>
                </div>
                <p className={`text-[10px] mt-2 ${selectedAttempt?.attempt_id === attempt.attempt_id ? 'text-white/50' : 'text-gray-400'}`}>
                  {formatDate(attempt.completed_at)}
                </p>
              </div>
            ))}
          </div>

          {/* Right: Workspace */}
          <div className="xl:col-span-3">
            {!selectedAttempt ? (
              <div className="text-center py-16 text-sm text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-30" />
                {t('admin.quizzes.reviews.review_workspace')}
              </div>
            ) : detailsLoading ? (
              <div className="text-center py-16 text-sm text-gray-400 bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-xl">
                <Activity className="w-8 h-8 mx-auto mb-2 animate-spin opacity-30" />
                {t('admin.logs.sync')}
              </div>
            ) : (
              <div className="bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                {/* Review header */}
                <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#059669]/10 flex items-center justify-center overflow-hidden">
                      {selectedAttempt.avatar_url ? (
                        <img src={selectedAttempt.avatar_url} alt={selectedAttempt.student_name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-[#059669]" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">{selectedAttempt.student_name}</h3>
                      <p className="text-xs text-gray-400">ID: {selectedAttempt.student_id} · {selectedAttempt.quiz_title}</p>
                    </div>
                    <span className="ml-auto px-3 py-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-md text-[10px] font-medium">{t('admin.quizzes.official_mode')}</span>
                  </div>
                </div>

                {/* Answers */}
                <div className="p-5 space-y-5 max-h-[600px] overflow-y-auto">
                  {reviewAnswers.length === 0 ? (
                    <div className="text-center py-12 text-sm text-gray-400">
                      {t('admin.quizzes.reviews.no_pending')}
                    </div>
                  ) : (
                    reviewAnswers.map((ans, idx) => (
                      <div key={ans.answer_id} className="bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                        <div className="flex items-start gap-3 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                          <span className="w-8 h-8 rounded-lg bg-[#059669]/10 flex items-center justify-center text-xs font-semibold text-[#059669] shrink-0">{idx + 1}</span>
                          <div className="flex-1">
                            <p className="text-xs text-gray-400 mb-1">{t('admin.quizzes.reviews.question_label')}</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{ans.question_text}</p>
                          </div>
                          <span className="px-2.5 py-1 bg-[#059669]/10 text-[#059669] border border-[#059669]/20 rounded-md text-[10px] font-medium whitespace-nowrap">
                            {t('admin.quizzes.reviews.points_label', { points: ans.points })}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                              <Edit3 className="w-3 h-3" /> {t('admin.quizzes.reviews.answer_label')}
                            </p>
                            <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 min-h-[80px]">
                              {ans.student_answer ? (
                                <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap italic">"{ans.student_answer}"</p>
                              ) : (
                                <p className="text-xs text-gray-400 italic">{t('admin.quizzes.reviews.no_answer')}</p>
                              )}
                            </div>
                          </div>

                          <div>
                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" /> Image
                            </p>
                            <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                              {ans.written_answer_url ? (
                                <img
                                  src={ans.written_answer_url}
                                  alt="Answer"
                                  className="w-full h-full object-cover cursor-pointer"
                                  onClick={() => window.open(ans.written_answer_url, '_blank')}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <p className="text-xs text-gray-400">{t('admin.quizzes.reviews.no_visual')}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                          {ans.graded ? (
                            <div className="flex items-center gap-2 px-4 py-2 bg-[#059669] text-white rounded-lg text-xs font-medium">
                              <Trophy className="w-4 h-4" />
                              {t('admin.quizzes.reviews.points_earned', { points: ans.points_earned, total: ans.points })}
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <input
                                  type="number"
                                  min="0"
                                  max={ans.points}
                                  step="0.5"
                                  placeholder="0"
                                  value={grading[ans.answer_id] ?? ''}
                                  onChange={(e) => handleGradeChange(ans.answer_id, e.target.value)}
                                  className="w-24 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">/ {ans.points}</span>
                              </div>
                              <button
                                onClick={() => handleSubmitGrade(ans.answer_id, ans.points)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors"
                              >
                                <Save className="w-4 h-4" /> {t('admin.quizzes.reviews.grade_btn')}
                              </button>
                            </div>
                          )}
                          <span className="text-[10px] text-gray-400">#{ans.answer_id}</span>
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
