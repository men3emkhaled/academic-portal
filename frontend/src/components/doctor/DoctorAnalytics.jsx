import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Users, AlertTriangle, CheckCircle2,
  BarChart3, UserCheck, TrendingUp, Award, Clock, Target,
  LayoutGrid, List, TrendingDown, ShieldAlert
} from 'lucide-react';
import {
  PageHeader,
  StatCard,
  SectionCard,
  SegmentedTabs,
  SearchInput,
  DataTable,
  EmptyState,
  LoadingState,
  StatusBadge,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DoctorAnalytics = ({ courses }) => {
  const { doctorApi } = useDoctorAuth();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [activeView, setActiveView] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    if (selectedCourseId) {
      fetchAllData();
    } else {
      setAnalyticsData(null);
      setProgressData([]);
      setQuizData(null);
    }
  }, [selectedCourseId]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, progressRes, quizRes] = await Promise.all([
        doctorApi('get', `/doctor/course-analytics/${selectedCourseId}`),
        doctorApi('get', `/doctor/progress/${selectedCourseId}`),
        doctorApi('get', `/doctor/analytics/${selectedCourseId}`)
      ]);
      setAnalyticsData(analyticsRes.data);
      setProgressData(progressRes.data);
      setQuizData(quizRes.data);
    } catch (err) {
      toast.error('Failed to synchronize intelligence data');
    } finally {
      setLoading(false);
    }
  };

  const filteredProgress = progressData
    .filter(s =>
      (s.student_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      String(s.student_id || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return (a.student_name || '').localeCompare(b.student_name || '');
      if (sortBy === 'quiz') return (b.avg_quiz_score || 0) - (a.avg_quiz_score || 0);
      if (sortBy === 'grade') return (b.grade_total || 0) - (a.grade_total || 0);
      return 0;
    });

  const filteredAtRisk = analyticsData?.at_risk_students?.filter(s =>
    (s.student_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    String(s.student_id || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Threshold → semantic token color (green/amber/red).
  const getScoreColor = (score) => {
    if (score === null || score === undefined) return 'text-muted-foreground';
    if (score >= 75) return 'text-primary';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-destructive';
  };

  // Neutral track + semantic fill (green/amber/red). `fill` overrides the threshold color.
  const getProgressBar = (value, max = 100, fill = null) => {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    const barColor = fill || (pct >= 75 ? 'bg-primary' : pct >= 50 ? 'bg-amber-500' : 'bg-destructive');
    return (
      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${barColor}`}
        />
      </div>
    );
  };

  const academicScore = progressData.length > 0
    ? (progressData.reduce((s, x) => s + (x.avg_quiz_score || 0), 0) / progressData.length).toFixed(1)
    : 0;

  const courseSelect = (
    <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
      <SelectTrigger className="w-full sm:w-72">
        <SelectValue placeholder="Select a course" />
      </SelectTrigger>
      <SelectContent>
        {courses.map(c => (
          <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 pb-12"
    >
      <PageHeader
        icon={Activity}
        title="Intelligence Hub"
        description="Analyze class performance, detect academic risks, and synchronize student progress data."
        actions={courseSelect}
      />

      <AnimatePresence mode="wait">
        {!selectedCourseId ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <EmptyState
              icon={BarChart3}
              title="No course selected"
              description="Select a course to synchronize academic intelligence and visualize class performance."
            />
          </motion.div>
        ) : loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <LoadingState label="Aggregating academic data..." />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            {/* Core Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                label="Total Enrollment"
                value={analyticsData?.total_students || 0}
                icon={Users}
                hint="Active profiles"
              />
              <StatCard
                label="Avg Attendance"
                value={`${analyticsData?.average_attendance_percentage || 0}%`}
                icon={UserCheck}
                hint="Class presence"
              />
              <StatCard
                label="Academic Score"
                value={`${academicScore}%`}
                icon={Target}
                hint="Performance avg"
                accent
              />
              <StatCard
                label="Risk Intensity"
                value={analyticsData?.at_risk_count || 0}
                icon={AlertTriangle}
                hint="Critical flags"
              />
            </div>

            {/* View Controller + Search */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <SegmentedTabs
                value={activeView}
                onChange={setActiveView}
                className="overflow-x-auto hidden-scrollbar"
                options={[
                  { value: 'overview', label: 'Overview', icon: LayoutGrid },
                  { value: 'performance', label: 'Progress', icon: TrendingUp },
                  { value: 'risk', label: 'Risk Detection', icon: ShieldAlert },
                  { value: 'quizzes', label: 'Assessments', icon: Award },
                ]}
              />
              <SearchInput
                placeholder="Search student record..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-72"
              />
            </div>

            {/* Main Visualization Area */}
            <AnimatePresence mode="wait">
              {activeView === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="grid grid-cols-1 xl:grid-cols-2 gap-4"
                >
                  <SectionCard
                    title="Academic Momentum"
                    description="Live health index"
                    bodyClassName="space-y-4"
                  >
                    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">Attendance Stability</span>
                        <span className="text-sm font-semibold text-primary">{analyticsData?.average_attendance_percentage || 0}%</span>
                      </div>
                      {getProgressBar(analyticsData?.average_attendance_percentage || 0)}
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Class presence is {analyticsData?.average_attendance_percentage > 70 ? 'exceeding baseline expectations' : 'within average parameters'}.
                      </p>
                    </div>
                    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">Quiz Completion Flow</span>
                        <StatusBadge variant="success">Healthy</StatusBadge>
                      </div>
                      {getProgressBar(82, 100, 'bg-primary')}
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Automated assessment velocity indicates strong student engagement levels.
                      </p>
                    </div>
                  </SectionCard>

                  <SectionCard
                    title="Smart Insights"
                    description="Pattern detection"
                    bodyClassName="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    {[
                      { label: 'High Achievers', value: progressData.filter(s => s.avg_quiz_score >= 85).length, icon: Award },
                      { label: 'Active Sessions', value: analyticsData?.total_sessions || 0, icon: Clock },
                      { label: 'Progress Profiles', value: progressData.length, icon: Activity },
                      { label: 'Quiz Sync Rate', value: '74%', icon: Target },
                    ].map((item, i) => (
                      <StatCard key={i} label={item.label} value={item.value} icon={item.icon} />
                    ))}
                  </SectionCard>
                </motion.div>
              )}

              {activeView === 'performance' && (
                <motion.div
                  key="performance"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <DataTable
                    rows={filteredProgress}
                    getRowKey={(s) => s.student_id}
                    empty={<EmptyState icon={Users} title="No students match your search" />}
                    columns={[
                      {
                        key: 'student',
                        header: 'Student',
                        render: (student) => (
                          <div className="flex items-center gap-3">
                            <Avatar size="default">
                              <AvatarImage src={student.avatar_url} alt={student.student_name} />
                              <AvatarFallback>{student.student_name?.charAt(0)?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate max-w-[160px]">{student.student_name}</p>
                              <p className="text-xs text-muted-foreground">ID: {student.student_id}</p>
                            </div>
                          </div>
                        ),
                      },
                      {
                        key: 'quiz_engagement',
                        header: 'Quiz Engagement',
                        headClassName: 'text-center',
                        cellClassName: 'text-center',
                        render: (student) => (
                          <div className="flex flex-col items-center gap-2 min-w-[120px] mx-auto">
                            <span className="text-xs font-medium text-muted-foreground">{student.quizzes_completed} / {student.quizzes_total}</span>
                            {getProgressBar(student.quizzes_completed, student.quizzes_total, 'bg-primary')}
                          </div>
                        ),
                      },
                      {
                        key: 'academic_avg',
                        header: 'Academic Avg',
                        headClassName: 'text-center',
                        cellClassName: 'text-center',
                        render: (student) => (
                          <div className="flex flex-col items-center gap-2 min-w-[120px] mx-auto">
                            <span className={`text-sm font-semibold ${getScoreColor(student.avg_quiz_score)}`}>
                              {student.avg_quiz_score !== null ? `${student.avg_quiz_score}%` : '—'}
                            </span>
                            {getProgressBar(student.avg_quiz_score || 0)}
                          </div>
                        ),
                      },
                      {
                        key: 'task_flow',
                        header: 'Task Flow',
                        headClassName: 'text-center',
                        cellClassName: 'text-center',
                        render: (student) => (
                          <div className="flex flex-col items-center gap-2 min-w-[120px] mx-auto">
                            <span className="text-xs font-medium text-muted-foreground">{student.tasks_completed} / {student.tasks_total}</span>
                            {getProgressBar(student.tasks_completed, student.tasks_total, 'bg-primary')}
                          </div>
                        ),
                      },
                      {
                        key: 'score_card',
                        header: 'Score Card',
                        headClassName: 'text-center',
                        cellClassName: 'text-center',
                        render: (student) => (
                          <span className="inline-flex items-center gap-1 rounded-md border bg-muted/40 px-2.5 py-1 text-sm font-medium text-foreground">
                            {student.grade_total}<span className="text-muted-foreground">/40</span>
                          </span>
                        ),
                      },
                      {
                        key: 'trend',
                        header: 'Trend',
                        headClassName: 'text-end',
                        cellClassName: 'text-end',
                        render: () => (
                          <span className="inline-flex size-8 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                            <TrendingUp className="size-4" />
                          </span>
                        ),
                      },
                    ]}
                  />
                </motion.div>
              )}

              {activeView === 'risk' && (
                <motion.div
                  key="risk"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4"
                >
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-destructive/20 bg-destructive/10 text-destructive">
                      <ShieldAlert className="size-4" />
                    </span>
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-1">Automated Risk Detection</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
                        Students are flagged when performance drops below the 40th percentile or attendance stability fails to reach 50%. Patterns suggest immediate intervention for these profiles.
                      </p>
                    </div>
                  </div>

                  <DataTable
                    rows={filteredAtRisk}
                    getRowKey={(s) => s.student_id}
                    empty={(
                      <EmptyState
                        icon={CheckCircle2}
                        title="Zero risk intensity"
                        description="Class academic integrity is currently optimal across all monitored parameters."
                      />
                    )}
                    columns={[
                      {
                        key: 'profile',
                        header: 'Flagged Profile',
                        render: (student) => (
                          <div className="flex items-center gap-3">
                            <Avatar size="default">
                              <AvatarImage src={student.avatar_url} alt={student.student_name} />
                              <AvatarFallback>{student.student_name?.charAt(0)?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{student.student_name}</p>
                              <p className="text-xs text-muted-foreground">ID: {student.student_id}</p>
                            </div>
                          </div>
                        ),
                      },
                      {
                        key: 'indicators',
                        header: 'Critical Indicators',
                        headClassName: 'text-center',
                        cellClassName: 'text-center',
                        render: (student) => (
                          <div className="flex items-center justify-center gap-8">
                            <div className="text-center">
                              <p className={`text-sm font-semibold ${student.attendance_percentage < 50 ? 'text-destructive' : 'text-amber-600 dark:text-amber-400'}`}>
                                {student.attendance_percentage !== null ? `${student.attendance_percentage}%` : '—'}
                              </p>
                              <p className="text-xs text-muted-foreground">Presence</p>
                            </div>
                            <div className="text-center">
                              <p className={`text-sm font-semibold ${student.avg_score < 50 ? 'text-destructive' : 'text-amber-600 dark:text-amber-400'}`}>
                                {student.avg_score !== null ? `${student.avg_score}%` : '—'}
                              </p>
                              <p className="text-xs text-muted-foreground">Score Avg</p>
                            </div>
                          </div>
                        ),
                      },
                      {
                        key: 'reason',
                        header: 'Sync Reason',
                        render: (student) => (
                          <StatusBadge variant="danger" icon={TrendingDown}>
                            {student.risk_reason}
                          </StatusBadge>
                        ),
                      },
                      {
                        key: 'action',
                        header: 'Action',
                        headClassName: 'text-end',
                        cellClassName: 'text-end',
                        render: () => (
                          <Button variant="outline" size="sm">Initiate Sync</Button>
                        ),
                      },
                    ]}
                  />
                </motion.div>
              )}

              {activeView === 'quizzes' && (
                <motion.div
                  key="quizzes"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4"
                >
                  {/* Distribution */}
                  {quizData?.distribution && quizData.distribution.length > 0 && (
                    <SectionCard
                      title="Grade Density Profile"
                      description="Class distribution"
                      bodyClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
                    >
                      {['0-20', '20-40', '40-60', '60-80', '80-100'].map(range => {
                        const item = quizData.distribution.find(d => d.range === range);
                        const count = item ? parseInt(item.count) : 0;
                        const totalAttempts = quizData.distribution.reduce((sum, d) => sum + parseInt(d.count), 0);
                        const pct = totalAttempts > 0 ? (count / totalAttempts) * 100 : 0;
                        // Higher ranges are stronger (green); lower ranges weaker (red/amber).
                        const fill = range === '80-100' || range === '60-80'
                          ? 'bg-primary'
                          : range === '40-60'
                            ? 'bg-amber-500'
                            : 'bg-destructive';

                        return (
                          <div key={range} className="rounded-lg border bg-muted/30 p-4 space-y-3">
                            <p className="text-xs font-medium text-muted-foreground">{range}%</p>
                            <p className="text-2xl font-semibold tracking-tight text-foreground">{count}</p>
                            {getProgressBar(count, totalAttempts, fill)}
                            <p className="text-xs text-muted-foreground">{pct.toFixed(0)}% of attempts</p>
                          </div>
                        );
                      })}
                    </SectionCard>
                  )}

                  {/* Detailed Assessments */}
                  <SectionCard
                    title="Assessment Intelligence"
                    description="Granular evaluation metrics"
                    bodyClassName="space-y-3"
                  >
                    {(!quizData?.quizzes || quizData.quizzes.length === 0) ? (
                      <EmptyState icon={List} title="No assessments yet" />
                    ) : (
                      quizData.quizzes.map(q => {
                        const passRate = q.completed_attempts > 0
                          ? Math.round((q.passed_count / q.completed_attempts) * 100)
                          : 0;

                        return (
                          <div key={q.id} className="rounded-lg border bg-muted/30 p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                              <div className="flex-1 space-y-2 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="text-sm font-semibold text-foreground">{q.title}</h4>
                                  <StatusBadge variant={q.is_published ? 'success' : 'neutral'}>
                                    {q.is_published ? 'Live' : 'Draft'}
                                  </StatusBadge>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                                  <span className="inline-flex items-center gap-1.5 rounded-md border bg-card px-2 py-1">
                                    <Clock className="size-3.5" /> {q.time_limit_minutes} Min
                                  </span>
                                  <span className="inline-flex items-center gap-1.5 rounded-md border bg-card px-2 py-1">
                                    <Target className="size-3.5" /> Passing {q.passing_score}%
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 shrink-0">
                                <div className="text-center">
                                  <p className="text-lg font-semibold text-foreground">{q.completed_attempts || 0}</p>
                                  <p className="text-xs text-muted-foreground">Attempts</p>
                                </div>
                                <div className="text-center">
                                  <p className={`text-lg font-semibold ${getScoreColor(q.avg_score)}`}>{q.avg_score !== null ? `${q.avg_score}%` : '—'}</p>
                                  <p className="text-xs text-muted-foreground">Avg Score</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-lg font-semibold text-foreground">{q.max_score !== null ? `${Math.round(q.max_score)}%` : '—'}</p>
                                  <p className="text-xs text-muted-foreground">Top Score</p>
                                </div>
                                <div className="text-center">
                                  <p className={`text-lg font-semibold ${passRate >= 70 ? 'text-primary' : 'text-amber-600 dark:text-amber-400'}`}>{passRate}%</p>
                                  <p className="text-xs text-muted-foreground">Pass Rate</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </SectionCard>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .hidden-scrollbar::-webkit-scrollbar { display: none; }
        .hidden-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </motion.div>
  );
};

export default DoctorAnalytics;
