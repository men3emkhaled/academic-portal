import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { User, Clock, Calendar, BarChart3, Trophy, ChevronRight, Activity, Image as ImageIcon, Save, CheckCircle2, XCircle } from 'lucide-react';

const AttemptsLog = ({ attempts, selectedQuiz }) => {
  const { t } = useTranslation();
  const [selectedAttemptId, setSelectedAttemptId] = useState(null);
  const [attemptDetail, setAttemptDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [grading, setGrading] = useState({});

  const fetchDetail = async (attemptId) => {
    setLoadingDetail(true);
    setSelectedAttemptId(attemptId);
    try {
      const res = await api.get(`/admin/attempts/${attemptId}/details`);
      setAttemptDetail(res.data);
    } catch (error) {
      toast.error(t('admin.messages.load_logs_failed'));
    } finally {
      setLoadingDetail(false);
    }
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
      await api.patch(`/admin/quizzes/answers/${answerId}/grade`, { points_earned: numericPoints });
      toast.success(t('admin.quizzes.attempt_details.grade_confirmed'));
      setAttemptDetail(prev => ({
        ...prev,
        answers: prev.answers.map(a =>
          a.question_id === answerId ? { ...a, points_earned: numericPoints, needs_review: false } : a
        )
      }));
      setGrading(prev => ({ ...prev, [answerId]: undefined }));
    } catch (error) {
      toast.error(t('admin.quizzes.update_failed'));
    }
  };

  const isPassed = (att) => att.percentage >= (selectedQuiz?.passing_score || 50);

  return (
    <div className="space-y-4">
      {/* Attempts Table */}
      <div className="bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <th className="py-3 px-4 text-xs font-medium text-gray-500 text-start">{t('admin.quizzes.attempts.student_col')}</th>
                <th className="py-3 px-4 text-xs font-medium text-gray-500 text-start">{t('admin.quizzes.attempts.date_col')}</th>
                <th className="py-3 px-4 text-xs font-medium text-gray-500 text-start">{t('admin.quizzes.attempts.score_col')}</th>
                <th className="py-3 px-4 text-xs font-medium text-gray-500 text-end">{t('admin.quizzes.attempts.status_col')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {attempts.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-sm text-gray-400">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    {t('admin.quizzes.attempts.no_attempts')}
                  </td>
                </tr>
              ) : (
                attempts.map((att) => (
                  <tr key={att.id}
                    onClick={() => fetchDetail(att.id)}
                    className={`cursor-pointer transition-colors ${
                      selectedAttemptId === att.id ? 'bg-[#059669]/5 dark:bg-[#059669]/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'
                    }`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                          {att.avatar_url ? (
                            <img src={att.avatar_url} alt={att.student_name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{att.student_name}</p>
                          <p className="text-xs text-gray-400">ID: {att.student_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                        <Calendar className="w-4 h-4 text-[#059669]" />
                        {new Date(att.started_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(att.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{att.score !== null ? att.score : '--'}</span>
                          <span className="text-[10px] text-gray-400">{t('admin.quizzes.attempts.raw_points')}</span>
                        </div>
                        <div className="w-24 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${isPassed(att) ? 'bg-[#059669]' : 'bg-rose-500'}`} style={{ width: `${att.percentage || 0}%` }}></div>
                        </div>
                        <span className={`text-xs font-medium ${isPassed(att) ? 'text-[#059669]' : 'text-rose-500'}`}>
                          {att.percentage !== null ? `${att.percentage}%` : '??'}
                        </span>
                        {isPassed(att) && <Trophy className="w-3.5 h-3.5 text-amber-500" />}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-end">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                          att.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                          att.status === 'timed_out' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                          'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        }`}>
                          {att.status.toUpperCase()}
                        </span>
                        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${selectedAttemptId === att.id ? 'rotate-90' : ''}`} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedAttemptId && (
        <div className="bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden animate-in slide-in-from-top-4 duration-300">
          {loadingDetail ? (
            <div className="text-center py-12 text-sm text-gray-400">
              <Activity className="w-8 h-8 mx-auto mb-2 animate-spin opacity-30" />
              {t('common.loading')}
            </div>
          ) : attemptDetail ? (
            <>
              {/* Attempt Header */}
              <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#059669]/10 flex items-center justify-center overflow-hidden">
                      <User className="w-6 h-6 text-[#059669]" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">{attemptDetail.attempt.student_name}</h3>
                      <p className="text-xs text-gray-400">
                        {t('admin.quizzes.attempt_details.quiz_col')}: {attemptDetail.attempt.quiz_title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{t('admin.quizzes.attempt_details.score_col')}</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{attemptDetail.attempt.percentage}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{t('admin.quizzes.attempts.raw_points')}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {attemptDetail.attempt.score} / {attemptDetail.attempt.total_points}
                      </p>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded border ${
                      attemptDetail.attempt.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                      attemptDetail.attempt.status === 'timed_out' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                      'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    }`}>
                      {attemptDetail.attempt.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-4 mt-3 text-xs text-gray-400">
                  <span>{t('admin.quizzes.attempt_details.started_col')}: {new Date(attemptDetail.attempt.started_at).toLocaleString()}</span>
                  {attemptDetail.attempt.completed_at && (
                    <span>{t('admin.quizzes.attempt_details.completed_col')}: {new Date(attemptDetail.attempt.completed_at).toLocaleString()}</span>
                  )}
                </div>
              </div>

              {/* Answers */}
              <div className="p-5 space-y-4">
                {attemptDetail.answers.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-400">{t('admin.quizzes.attempt_details.no_answers')}</div>
                ) : (
                  attemptDetail.answers.map((ans, idx) => {
                    const needsReview = ans.needs_review && ans.question_type === 'written';
                    const isCorrect = ans.is_correct === true || ans.is_correct === 'true';
                    const isMcqOrTf = ans.question_type === 'mcq' || ans.question_type === 'true_false';
                    return (
                      <div key={ans.question_id} className="bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                        <div className="flex items-start gap-3 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                          <span className="w-8 h-8 rounded-lg bg-[#059669]/10 flex items-center justify-center text-xs font-semibold text-[#059669] shrink-0">{idx + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-400 mb-1">{t('admin.quizzes.attempt_details.answered')}</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{ans.question_text}</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-medium whitespace-nowrap border ${
                            needsReview ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                            isCorrect ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                            isMcqOrTf ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                            'bg-[#059669]/10 text-[#059669] border-[#059669]/20'
                          }`}>
                            {needsReview ? t('admin.quizzes.attempt_details.waiting_grade') :
                             isCorrect ? t('admin.quizzes.attempt_details.correct') :
                             isMcqOrTf ? t('admin.quizzes.attempt_details.incorrect') :
                             `${ans.points_earned || 0}/${ans.points}`}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">{t('admin.quizzes.attempt_details.your_answer')}</p>
                            <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3 min-h-[60px]">
                              {ans.student_answer ? (
                                <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{ans.student_answer}</p>
                              ) : (
                                <p className="text-xs text-gray-400 italic">{t('admin.quizzes.attempt_details.no_answer_text')}</p>
                              )}
                            </div>
                          </div>

                          {isMcqOrTf ? (
                            <div>
                              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">{t('admin.quizzes.attempt_details.correct_answer')}</p>
                              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 min-h-[60px]">
                                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{ans.correct_answer}</p>
                                {ans.question_type === 'mcq' && ans.options && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    {ans.options[ans.correct_answer?.charCodeAt(0) - 65] || ''}
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                <ImageIcon className="w-3 h-3" /> Image
                              </p>
                              <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                                {ans.written_answer_url ? (
                                  <img src={ans.written_answer_url} alt="Answer"
                                    className="w-full h-full object-cover cursor-pointer"
                                    onClick={() => window.open(ans.written_answer_url, '_blank')}
                                    onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                                ) : (
                                  <p className="text-xs text-gray-400">{t('admin.quizzes.attempt_details.no_visual')}</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-4 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            {needsReview ? (
                              <>
                                <div className="relative">
                                  <input type="number" min="0" max={ans.points} step="0.5" placeholder="0"
                                    value={grading[ans.question_id] ?? ''}
                                    onChange={(e) => handleGradeChange(ans.question_id, e.target.value)}
                                    className="w-24 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none" />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">/ {ans.points}</span>
                                </div>
                                <button onClick={() => handleSubmitGrade(ans.question_id, ans.points)}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors">
                                  <Save className="w-4 h-4" /> {t('admin.quizzes.attempt_details.grade_btn')}
                                </button>
                              </>
                            ) : (
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="font-medium text-gray-900 dark:text-white">{t('admin.quizzes.attempt_details.points_col')}:</span>
                                <span className={`font-semibold ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {ans.points_earned || 0} / {ans.points}
                                </span>
                                {isCorrect ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                ) : isMcqOrTf ? (
                                  <XCircle className="w-4 h-4 text-rose-500" />
                                ) : null}
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400">#{ans.question_id}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default AttemptsLog;
