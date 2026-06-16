import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { PieChart, TrendingUp, Users, Award, Target, Zap, BarChart3, Clock } from 'lucide-react';
import {
  PageHeader,
  StatCard,
  SectionCard,
  DataTable,
  EmptyState,
  LoadingState,
  StatusBadge,
} from '@/components/common';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ALL_RANGES = ['0-20', '20-40', '40-60', '60-80', '80-100'];

// Semantic score color: green (good) / amber (mid) / red (low) — meaning only.
const scoreColor = (score, good = 70, mid = 50) => {
  if (score === null || score === undefined) return 'text-muted-foreground';
  if (score >= good) return 'text-primary';
  if (score >= mid) return 'text-amber-600 dark:text-amber-400';
  return 'text-destructive';
};

const DoctorQuizAnalytics = ({ courses }) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  const { doctorApi } = useDoctorAuth();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedCourseId) {
      fetchAnalytics();
    } else {
      setAnalytics(null);
    }
  }, [selectedCourseId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await doctorApi('get', `/doctor/analytics/${selectedCourseId}`);
      setAnalytics(res.data);
    } catch (err) {
      toast.error(t('doctor.quiz_analytics.load_failed'));
    } finally {
      setLoading(false);
    }
  };

  const totalAttempts = analytics?.distribution
    ? analytics.distribution.reduce((sum, d) => sum + parseInt(d.count), 0)
    : 0;

  const quizColumns = [
    {
      key: 'quiz',
      header: t('doctor.quiz_analytics.per_quiz'),
      render: (q) => (
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium text-foreground">{q.title}</span>
            <StatusBadge variant={q.is_published ? 'success' : 'neutral'}>
              {q.is_published ? t('doctor.quiz_analytics.live') : t('doctor.quiz_analytics.draft')}
            </StatusBadge>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" />
              {q.time_limit_minutes}{t('doctor.quiz_analytics.time_limit')}
            </span>
            <span className="inline-flex items-center gap-1">
              <Target className="size-3" />
              {t('doctor.quiz_analytics.pass_score')}: {q.passing_score}%
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'completed',
      header: t('doctor.quiz_analytics.completed'),
      headClassName: 'text-end',
      cellClassName: 'text-end',
      render: (q) => (
        <span className="font-medium text-foreground tabular-nums">{q.completed_attempts || 0}</span>
      ),
    },
    {
      key: 'average',
      header: t('doctor.quiz_analytics.average'),
      headClassName: 'text-end',
      cellClassName: 'text-end',
      render: (q) => (
        <span className={`font-medium tabular-nums ${scoreColor(q.avg_score || 0)}`}>
          {q.avg_score !== null ? `${q.avg_score}%` : '—'}
        </span>
      ),
    },
    {
      key: 'highest',
      header: t('doctor.quiz_analytics.highest'),
      headClassName: 'text-end',
      cellClassName: 'text-end',
      render: (q) => (
        <span className="font-medium text-foreground tabular-nums">
          {q.max_score !== null ? `${Math.round(q.max_score)}%` : '—'}
        </span>
      ),
    },
    {
      key: 'pass_rate',
      header: t('doctor.quiz_analytics.pass_rate'),
      headClassName: 'text-end',
      cellClassName: 'text-end',
      render: (q) => {
        const passRate = q.completed_attempts > 0
          ? Math.round((q.passed_count / q.completed_attempts) * 100)
          : 0;
        return (
          <span className={`font-medium tabular-nums ${scoreColor(passRate, 70, 40)}`}>
            {q.completed_attempts > 0 ? `${passRate}%` : '—'}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={PieChart}
        title={t('doctor.quiz_analytics.title')}
        description={t('doctor.quiz_analytics.description')}
      />

      {/* Course Selector */}
      <div className="w-full sm:max-w-md">
        <Select value={selectedCourseId} onValueChange={setSelectedCourseId} dir={dir}>
          <SelectTrigger className="w-full" dir={dir}>
            <SelectValue placeholder={t('doctor.quiz_analytics.select_course')} />
          </SelectTrigger>
          <SelectContent dir={dir}>
            {courses.map((c) => (
              <SelectItem key={c.id} value={String(c.id)} className={isAr ? 'font-arabic' : ''}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState />
      ) : !selectedCourseId ? (
        <EmptyState
          icon={BarChart3}
          title={t('doctor.quiz_analytics.select_hint')}
        />
      ) : !analytics ? null : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard
              label={t('doctor.quiz_analytics.total_quizzes')}
              value={analytics.summary?.total_quizzes || 0}
              icon={Award}
            />
            <StatCard
              label={t('doctor.quiz_analytics.students_attempted')}
              value={analytics.summary?.students_attempted || 0}
              icon={Users}
            />
            <StatCard
              label={t('doctor.quiz_analytics.overall_avg')}
              value={`${analytics.summary?.overall_avg || '—'}%`}
              icon={TrendingUp}
              accent
            />
            <StatCard
              label={t('doctor.quiz_analytics.published')}
              value={analytics.summary?.published_quizzes || 0}
              icon={Zap}
            />
          </div>

          {/* Score Distribution */}
          {analytics.distribution && analytics.distribution.length > 0 && (
            <SectionCard title={t('doctor.quiz_analytics.score_distribution')}>
              <div className="space-y-3">
                {ALL_RANGES.map((range) => {
                  const item = analytics.distribution.find((d) => d.range === range);
                  const count = item ? parseInt(item.count) : 0;
                  const pct = totalAttempts > 0 ? (count / totalAttempts) * 100 : 0;

                  return (
                    <div key={range} className="flex items-center gap-4">
                      <span className="w-16 text-end text-xs font-medium text-muted-foreground tabular-nums">
                        {range}%
                      </span>
                      <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-muted">
                        <div
                          className="flex h-full items-center justify-end rounded-md bg-primary pe-2 transition-all duration-700"
                          style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                        >
                          {count > 0 && (
                            <span className="text-[10px] font-medium text-primary-foreground tabular-nums">
                              {count}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="w-12 text-xs text-muted-foreground tabular-nums">
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          )}

          {/* Per-Quiz Breakdown */}
          {analytics.quizzes && analytics.quizzes.length > 0 && (
            <DataTable
              columns={quizColumns}
              rows={analytics.quizzes}
              getRowKey={(q) => q.id}
            />
          )}

          {/* Empty state */}
          {analytics.quizzes && analytics.quizzes.length === 0 && (
            <EmptyState
              icon={Award}
              title={t('doctor.quiz_analytics.no_quizzes')}
              description={t('doctor.quiz_analytics.create_hint')}
            />
          )}
        </>
      )}
    </div>
  );
};

export default DoctorQuizAnalytics;
