import React from 'react';
import { useTranslation } from 'react-i18next';
import { User, Clock, Calendar, BarChart3, Trophy } from 'lucide-react';
import { DataTable, StatusBadge, EmptyState } from '@/components/common';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const AttemptsLog = ({ attempts, selectedQuiz }) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const statusVariant = (status) =>
    status === 'completed' ? 'success' : status === 'timed_out' ? 'danger' : 'warning';

  const columns = [
    {
      key: 'student',
      header: t('admin.quizzes.attempts.student_col'),
      render: (att) => (
        <div className="flex items-center gap-3">
          <Avatar>
            {att.avatar_url ? (
              <AvatarImage src={att.avatar_url} alt={att.student_name} />
            ) : null}
            <AvatarFallback>
              <User className="size-4" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className={cn('text-sm font-medium text-foreground truncate', isAr && 'font-arabic')}>
              {att.student_name}
            </p>
            <p className="text-xs text-muted-foreground truncate">ID: {att.student_id}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'date',
      header: t('admin.quizzes.attempts.date_col'),
      render: (att) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-sm text-foreground">
            <Clock className="size-3.5 text-muted-foreground" />
            {new Date(att.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="size-3.5" />
            {new Date(att.started_at).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      key: 'score',
      header: t('admin.quizzes.attempts.score_col'),
      render: (att) => {
        const isPassed = att.percentage >= (selectedQuiz.passing_score || 50);
        return (
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground tabular-nums">
                {att.score !== null ? att.score : '--'}
              </span>
              <span className="text-xs text-muted-foreground">
                {t('admin.quizzes.attempts.raw_points')}
              </span>
            </div>
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
              <div
                className={cn('h-full rounded-full', isPassed ? 'bg-primary' : 'bg-destructive')}
                style={{ width: `${att.percentage || 0}%` }}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  'text-sm font-medium tabular-nums',
                  isPassed ? 'text-primary' : 'text-destructive'
                )}
              >
                {att.percentage !== null ? `${att.percentage}%` : '??'}
              </span>
              {isPassed && <Trophy className="size-3.5 text-amber-500" />}
            </div>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: t('admin.quizzes.attempts.status_col'),
      headClassName: 'text-end',
      cellClassName: 'text-end',
      render: (att) => (
        <StatusBadge variant={statusVariant(att.status)}>{att.status}</StatusBadge>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={attempts}
      getRowKey={(att) => att.id}
      empty={
        <EmptyState
          icon={BarChart3}
          title={t('admin.quizzes.attempts.no_attempts')}
          description={t('admin.quizzes.registry_stream')}
        />
      }
    />
  );
};

export default AttemptsLog;
