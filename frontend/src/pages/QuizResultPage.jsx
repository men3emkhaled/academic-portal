import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import studentApi from '../services/studentApi';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  Clock,
  Target,
  FileQuestion,
  Activity,
  CheckCircle2,
  XCircle,
  BookOpen,
  ArrowLeft,
  RotateCcw,
  Share2,
} from 'lucide-react';
import {
  PageContainer,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  SegmentedTabs,
  EmptyState,
  LoadingState,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

const QuizResultPage = () => {
  const { quizId, attemptId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [result, setResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('review');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resultRes, leaderboardRes] = await Promise.all([
          studentApi.get(`/quizzes/attempts/${attemptId}/result`),
          studentApi.get(`/quizzes/${quizId}/leaderboard`).catch(() => ({ data: [] }))
        ]);
        setResult(resultRes.data);
        setLeaderboard(leaderboardRes.data);
      } catch (error) {
        toast.error(t('common.error'));
        navigate('/student/quizzes', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [quizId, attemptId, navigate]);

  const handleRetry = () => {
    navigate(`/student/quizzes/${quizId}/take`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background" dir={isAr ? 'rtl' : 'ltr'}>
        <LoadingState label={t('quizzes.loading')} className="min-h-screen" />
      </div>
    );
  }

  if (!result || !result.answers || result.answers.length === 0) {
    return (
      <div className="min-h-screen bg-background" dir={isAr ? 'rtl' : 'ltr'}>
        <PageContainer size="narrow" className="min-h-screen flex items-center justify-center">
          <EmptyState
            icon={AlertCircle}
            title={t('quizzes.no_completed')}
            action={
              <Button variant="outline" onClick={() => navigate('/student/quizzes')}>
                {t('quizzes.back_to_list')}
              </Button>
            }
          />
        </PageContainer>
      </div>
    );
  }

  const { score, total_points, percentage, answers, time_spent, rank, quiz, student_id, status } = result;
  const isPendingReview = status === 'pending_review';
  const maxAttempts = quiz?.max_attempts || 1;
  const attemptsCount = quiz?.attempts_count || 1;
  const canRetry = !isPendingReview && attemptsCount < maxAttempts;

  // Score ring geometry (green primary stroke)
  const ringRadius = 52;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringPct = Math.max(0, Math.min(100, Number(percentage) || 0));
  const ringOffset = ringCircumference - (ringPct / 100) * ringCircumference;

  return (
    <div className="min-h-screen bg-background text-foreground" dir={isAr ? 'rtl' : 'ltr'}>
      <PageContainer size="narrow">
        <PageHeader
          title={isPendingReview ? t('quizzes.under_review') : t('quizzes.completed_title')}
          description={quiz?.title}
          icon={isPendingReview ? Clock : CheckCircle2}
        />

        {/* Score / pending hero */}
        {isPendingReview ? (
          <SectionCard bodyClassName="flex flex-col items-center gap-3 py-8 text-center">
            <span className="flex size-12 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="size-6" />
            </span>
            <p className="text-sm text-foreground">{t('quizzes.review_msg')}</p>
            <p className="text-xs text-muted-foreground">{t('quizzes.review_submsg')}</p>
          </SectionCard>
        ) : (
          <SectionCard bodyClassName="flex flex-col items-center gap-5 py-8 sm:flex-row sm:justify-center sm:gap-8">
            <div className="relative flex size-40 items-center justify-center">
              <svg className="size-40 -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
                <circle
                  cx="60"
                  cy="60"
                  r={ringRadius}
                  fill="none"
                  strokeWidth="8"
                  className="stroke-muted"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={ringRadius}
                  fill="none"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className="stroke-primary transition-[stroke-dashoffset] duration-700 ease-out"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-semibold tracking-tight text-primary">{percentage}%</span>
                <span className="text-xs text-muted-foreground">{t('quizzes.accuracy')}</span>
              </div>
            </div>
            <div className="text-center sm:text-start">
              <p className="text-xs font-medium text-muted-foreground">{t('quizzes.score')}</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                <span className="text-primary">{score}</span>
                <span className="text-muted-foreground"> / {total_points}</span>
              </p>
            </div>
          </SectionCard>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard label={t('quizzes.time_spent')} value={time_spent || '00:00'} icon={Clock} />
          <StatCard
            label={t('quizzes.rank')}
            value={isPendingReview ? '—' : `#${rank || '-'}`}
            icon={Target}
            accent={!isPendingReview}
          />
        </div>

        {/* Tabs */}
        {!isPendingReview && (
          <SegmentedTabs
            value={activeTab}
            onChange={setActiveTab}
            options={[
              { value: 'review', label: t('quizzes.review_answers_tab'), icon: FileQuestion },
              { value: 'leaderboard', label: t('quizzes.leaderboard_tab'), icon: Activity },
            ]}
          />
        )}

        {/* Pending review list */}
        {isPendingReview ? (
          <SectionCard title={t('quizzes.submitted_review')} bodyClassName="space-y-3">
            {answers.map((ans, idx) => {
              if (!ans || !ans.question_id) return null;
              const hasText = ans.student_answer && ans.student_answer.trim() !== '';
              const hasImage = ans.written_answer_url && ans.written_answer_url.trim() !== '';

              return (
                <div key={ans.question_id} className="rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-card text-xs font-medium text-muted-foreground">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{ans.question_text}</p>

                      {hasText && (
                        <div className="mt-3 rounded-md border bg-card p-3">
                          <p className="mb-1 text-xs text-muted-foreground">{t('quizzes.your_answer')}</p>
                          <p className="whitespace-pre-wrap text-sm text-foreground">{ans.student_answer}</p>
                        </div>
                      )}

                      {hasImage && (
                        <div className="mt-3">
                          <img
                            src={getDirectImageUrl(`${process.env.REACT_APP_API_URL || ''}${ans.written_answer_url}`)}
                            alt="Your answer"
                            className="max-h-64 cursor-pointer rounded-md border"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/400x200/1a1a1a/8eff71?text=Image+Not+Available';
                            }}
                            onClick={() => window.open(`${process.env.REACT_APP_API_URL || ''}${ans.written_answer_url}`, '_blank')}
                          />
                        </div>
                      )}

                      {!hasText && !hasImage && (
                        <p className="mt-2 text-sm font-medium text-destructive">{t('quizzes.no_answer')}</p>
                      )}

                      <div className="mt-3">
                        <StatusBadge variant="warning" icon={Clock}>
                          {t('quizzes.waiting_review')}
                        </StatusBadge>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </SectionCard>
        ) : activeTab === 'review' ? (
          <div className="space-y-3">
            {answers.map((ans, idx) => {
              if (!ans || !ans.question_id) return null;
              const isCorrect = ans.is_correct;
              const studentAnswer = ans.student_answer;
              const correctAnswer = ans.correct_answer;

              return (
                <div key={ans.question_id} className="overflow-hidden rounded-xl border bg-card">
                  <div className="flex items-start gap-3 border-b px-4 py-3">
                    <span
                      className={cn(
                        'flex size-7 shrink-0 items-center justify-center rounded-md border text-xs font-medium',
                        isCorrect
                          ? 'border-primary/20 bg-primary/10 text-primary'
                          : 'border-destructive/20 bg-destructive/10 text-destructive'
                      )}
                    >
                      {idx + 1}
                    </span>
                    <p className="min-w-0 flex-1 pt-0.5 text-sm font-medium text-foreground">
                      {ans.question_text || 'Question text not available'}
                    </p>
                    <StatusBadge variant={isCorrect ? 'success' : 'danger'} icon={isCorrect ? CheckCircle2 : XCircle}>
                      {isCorrect ? t('quizzes.correct') : t('quizzes.your_answer')}
                    </StatusBadge>
                  </div>

                  <div className="space-y-3 p-4">
                    {ans.image_url && (
                      <img
                        src={getDirectImageUrl(ans.image_url)}
                        alt="Question illustration"
                        className="max-h-48 rounded-md border"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/400x200/1a1a1a/8eff71?text=Image+Not+Available';
                        }}
                      />
                    )}

                    {ans.question_type === 'written' ? (
                      <div className="space-y-2">
                        {ans.written_answer_url && (
                          <img
                            src={getDirectImageUrl(`${process.env.REACT_APP_API_URL || ''}${ans.written_answer_url}`)}
                            alt="Your written answer"
                            className="max-h-64 cursor-pointer rounded-md border"
                            onClick={() => window.open(`${process.env.REACT_APP_API_URL || ''}${ans.written_answer_url}`, '_blank')}
                          />
                        )}
                        <p className="text-sm text-muted-foreground">
                          {t('quizzes.score')}:{' '}
                          <span className="font-medium text-foreground">{ans.points_earned ?? 0}</span> / {ans.points ?? 0}
                        </p>
                      </div>
                    ) : ans.question_type === 'true_false' ? (
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        <div
                          className={cn(
                            'flex items-center gap-3 rounded-md border p-3',
                            isCorrect
                              ? 'border-primary/30 bg-primary/5'
                              : 'border-destructive/30 bg-destructive/5'
                          )}
                        >
                          <span className={isCorrect ? 'text-primary' : 'text-destructive'}>
                            {isCorrect ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                          </span>
                          <div>
                            <p className="text-xs text-muted-foreground">{t('quizzes.your_answer')}</p>
                            <p className={cn('text-sm font-medium', isCorrect ? 'text-primary' : 'text-destructive')}>
                              {studentAnswer === 'true' ? 'True' : 'False'}
                            </p>
                          </div>
                        </div>
                        {!isCorrect && (
                          <div className="flex items-center gap-3 rounded-md border border-primary/30 bg-primary/5 p-3">
                            <span className="text-primary">
                              <CheckCircle2 className="size-4" />
                            </span>
                            <div>
                              <p className="text-xs text-muted-foreground">{t('quizzes.correct_answer')}</p>
                              <p className="text-sm font-medium text-primary">
                                {correctAnswer === 'true' ? 'True' : 'False'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {ans.options?.map((opt, i) => {
                          const letter = String.fromCharCode(65 + i);
                          const isStudentChoice = studentAnswer === letter;
                          const isCorrectChoice = correctAnswer === letter;

                          return (
                            <div
                              key={opt || i}
                              className={cn(
                                'flex items-center gap-3 rounded-md border p-3',
                                isCorrectChoice
                                  ? 'border-primary/30 bg-primary/5'
                                  : isStudentChoice
                                    ? 'border-destructive/30 bg-destructive/5'
                                    : 'border-border bg-muted/30'
                              )}
                            >
                              <span
                                className={cn(
                                  'text-sm font-medium',
                                  isCorrectChoice
                                    ? 'text-primary'
                                    : isStudentChoice
                                      ? 'text-destructive'
                                      : 'text-muted-foreground'
                                )}
                              >
                                {letter}.
                              </span>
                              <span
                                className={cn(
                                  'text-sm',
                                  isCorrectChoice
                                    ? 'font-medium text-primary'
                                    : isStudentChoice
                                      ? 'font-medium text-destructive'
                                      : 'text-foreground'
                                )}
                              >
                                {opt}
                              </span>
                              {isStudentChoice && !isCorrectChoice && (
                                <span className="ms-auto text-xs text-muted-foreground">({t('quizzes.your_answer')})</span>
                              )}
                              {isCorrectChoice && (
                                <span className="ms-auto inline-flex items-center gap-1 text-xs font-medium text-primary">
                                  <CheckCircle2 className="size-3" /> {t('quizzes.correct')}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {ans.explanation && (
                      <div className="rounded-md border bg-muted/30 p-3">
                        <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                          <BookOpen className="size-3.5" /> {t('quizzes.explanation')}
                        </p>
                        <p className="text-sm text-muted-foreground">{ans.explanation}</p>
                      </div>
                    )}

                    <p className="text-sm text-muted-foreground">
                      {t('quizzes.score')}:{' '}
                      <span className="font-medium text-foreground">{ans.points_earned ?? 0}</span> / {ans.points ?? 0}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <SectionCard bodyClassName="p-0">
            {leaderboard.length === 0 ? (
              <div className="p-4">
                <EmptyState icon={Activity} title={t('quizzes.no_leaderboard')} />
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-12 gap-2 border-b px-4 py-2.5 text-xs font-medium text-muted-foreground">
                  <div className="col-span-2">{t('quizzes.rank')}</div>
                  <div className="col-span-5">{t('common.student')}</div>
                  <div className="col-span-3 text-end">{t('quizzes.score')}</div>
                  <div className="col-span-2 text-end">{t('common.time')}</div>
                </div>
                {leaderboard.map((entry) => {
                  const isMe = entry.student_id === student_id;
                  return (
                    <div
                      key={entry.student_id}
                      className={cn(
                        'grid grid-cols-12 items-center gap-2 border-b px-4 py-2.5 text-sm last:border-b-0',
                        isMe ? 'bg-primary/5' : 'hover:bg-muted/50'
                      )}
                    >
                      <div className="col-span-2 font-medium text-foreground">#{entry.rank}</div>
                      <div className="col-span-5 truncate text-foreground">{entry.student_name}</div>
                      <div className="col-span-3 text-end font-medium text-primary">
                        {entry.score} / {entry.total_points} ({entry.percentage}%)
                      </div>
                      <div className="col-span-2 text-end text-muted-foreground">
                        {entry.time_spent || '—'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button onClick={() => navigate('/student/quizzes')} className="w-full sm:w-auto">
            <ArrowLeft className="size-4" />
            {t('quizzes.back_to_list')}
          </Button>
          {canRetry && (
            <Button variant="outline" onClick={handleRetry} className="w-full sm:w-auto">
              <RotateCcw className="size-4" />
              {t('quizzes.retry')} ({attemptsCount}/{maxAttempts})
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={() => toast.success(t('common.copied'))}
            className="w-full text-muted-foreground sm:ms-auto sm:w-auto"
          >
            <Share2 className="size-4" />
            {t('quizzes.share')}
          </Button>
        </div>
      </PageContainer>
    </div>
  );
};

export default QuizResultPage;
