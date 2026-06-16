import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import {
  User, ClipboardList, Timer,
  Award, Edit3, Image as ImageIcon,
  ExternalLink, Hash, MessageCircle, Save,
  CheckCircle2, Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  SectionCard,
  EmptyState,
  LoadingState,
  FormField,
  StatusBadge,
} from '@/components/common';

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
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
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

  if (loading) {
    return <LoadingState label={t('admin.quizzes.registry_stream')} />;
  }

  if (filteredAttempts.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title={t('admin.quizzes.workspace_idle_title')}
        description={t('admin.quizzes.workspace_idle_desc')}
      />
    );
  }

  return (
    <div className="text-start">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        {/* Queue list */}
        <div className="xl:col-span-1">
          <SectionCard
            title={t('admin.quizzes.official_mode')}
            actions={<StatusBadge variant="warning" icon={Timer}>{filteredAttempts.length}</StatusBadge>}
            bodyClassName="space-y-1.5 max-h-[850px] overflow-y-auto"
          >
            {filteredAttempts.map((attempt) => {
              const isActive = selectedAttempt?.attempt_id === attempt.attempt_id;
              return (
                <button
                  key={attempt.attempt_id}
                  type="button"
                  onClick={() => handleSelectAttempt(attempt)}
                  aria-current={isActive ? 'true' : undefined}
                  className={cn(
                    'relative w-full rounded-lg border px-3 py-2.5 text-start transition-colors',
                    isActive
                      ? 'border-primary/40 bg-primary/5'
                      : 'border-border bg-card hover:bg-muted/50'
                  )}
                >
                  {isActive && (
                    <span className="absolute inset-y-2 start-0 w-0.5 rounded-full bg-primary" />
                  )}
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                      {attempt.avatar_url ? (
                        <img src={attempt.avatar_url} alt={attempt.student_name} className="h-full w-full object-cover" />
                      ) : (
                        <User className="size-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{attempt.student_name}</p>
                      <p className="truncate text-xs text-muted-foreground">ID: {attempt.student_id}</p>
                    </div>
                  </div>
                  <p className="mt-2 truncate text-xs font-medium text-foreground">{attempt.quiz_title}</p>
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t('admin.quizzes.reviews_tab')}</span>
                    <span>{formatDate(attempt.completed_at)}</span>
                  </div>
                </button>
              );
            })}
          </SectionCard>
        </div>

        {/* Review detail */}
        <div className="xl:col-span-3">
          {!selectedAttempt ? (
            <EmptyState
              icon={ClipboardList}
              title={t('admin.quizzes.workspace_idle_title')}
              description={t('admin.quizzes.workspace_idle_desc')}
              className="h-full"
            />
          ) : detailsLoading ? (
            <SectionCard>
              <LoadingState label={t('admin.quizzes.registry_stream')} />
            </SectionCard>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedAttempt.attempt_id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <SectionCard
                  bodyClassName="p-0"
                  header={
                    <header className="flex flex-wrap items-center gap-4 border-b border-border bg-muted/30 px-4 py-4">
                      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                        {selectedAttempt.avatar_url ? (
                          <img src={selectedAttempt.avatar_url} alt={selectedAttempt.student_name} className="h-full w-full object-cover" />
                        ) : (
                          <User className="size-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold text-foreground">{selectedAttempt.student_name}</h3>
                          <StatusBadge variant="warning" icon={Timer}>{t('admin.quizzes.official_mode')}</StatusBadge>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Hash className="size-3.5" /> {selectedAttempt.student_id}
                          </span>
                          <span className="flex items-center gap-1.5 text-foreground">
                            <MessageCircle className="size-3.5 text-primary" /> {selectedAttempt.quiz_title}
                          </span>
                        </div>
                      </div>
                    </header>
                  }
                >
                  <div className="max-h-[900px] space-y-4 overflow-y-auto p-4">
                    {reviewAnswers.length === 0 ? (
                      <EmptyState
                        icon={MessageCircle}
                        title={t('admin.quizzes.no_quizzes')}
                      />
                    ) : (
                      reviewAnswers.map((ans, idx) => (
                        <div
                          key={ans.answer_id}
                          className="rounded-lg border border-border bg-card p-4 text-start"
                        >
                          {/* Question header */}
                          <div className="flex items-start gap-3 border-b border-border pb-4">
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-xs font-semibold text-primary">
                              {idx + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-muted-foreground">{t('admin.quizzes.authorized_entities')}</p>
                              <p className="mt-1 text-sm font-medium leading-relaxed text-foreground">{ans.question_text}</p>
                            </div>
                            <StatusBadge variant="accent" icon={Award}>
                              {ans.points} {t('admin.quizzes.points', 'pts')}
                            </StatusBadge>
                          </div>

                          {/* Answer + evidence */}
                          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <Edit3 className="size-3.5" /> {t('admin.quizzes.identity_registration')}
                              </p>
                              <div className="min-h-[160px] rounded-lg border border-border bg-muted/50 p-4 text-start">
                                {ans.student_answer ? (
                                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{ans.student_answer}</p>
                                ) : (
                                  <p className="text-sm text-muted-foreground">—</p>
                                )}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <ImageIcon className="size-3.5" /> {t('admin.quizzes.visual_evidence', 'Attachment')}
                              </p>
                              {ans.written_answer_url ? (
                                <div className="group/img relative aspect-video overflow-hidden rounded-lg border border-border">
                                  <img
                                    src={getDirectImageUrl(`${process.env.REACT_APP_API_URL || ''}${ans.written_answer_url}`)}
                                    alt="Answer evidence"
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'https://via.placeholder.com/600x400/000/333?text=STREAM_LOST';
                                    }}
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 transition-opacity group-hover/img:opacity-100">
                                    <Button
                                      type="button"
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => window.open(`${process.env.REACT_APP_API_URL || ''}${ans.written_answer_url}`, '_blank')}
                                    >
                                      <ExternalLink className="size-3.5" />
                                      {t('common.open', 'Open')}
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground">
                                  <ImageIcon className="size-6" />
                                  <p className="text-xs">{t('admin.quizzes.no_visual_ref', '—')}</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Grading row */}
                          <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-border pt-4">
                            {ans.graded ? (
                              <StatusBadge variant="success" icon={Trophy}>
                                {ans.points_earned} / {ans.points} {t('admin.quizzes.points', 'pts')}
                              </StatusBadge>
                            ) : (
                              <div className="flex items-end gap-2">
                                <FormField
                                  label={t('admin.quizzes.grade', 'Grade')}
                                  htmlFor={`grade-${ans.answer_id}`}
                                  className="w-32"
                                >
                                  <Input
                                    id={`grade-${ans.answer_id}`}
                                    type="number"
                                    min="0"
                                    max={ans.points}
                                    step="0.5"
                                    placeholder="0.00"
                                    value={grading[ans.answer_id] ?? ''}
                                    onChange={(e) => handleGradeChange(ans.answer_id, e.target.value)}
                                  />
                                </FormField>
                                <Button
                                  type="button"
                                  onClick={() => handleSubmitGrade(ans.answer_id, ans.points)}
                                >
                                  <Save className="size-3.5" />
                                  {t('common.save', 'Save')}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </SectionCard>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingReviews;
