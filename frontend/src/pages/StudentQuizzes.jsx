import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useStudentData } from '../context/StudentDataContext';
import studentApi from '../services/studentApi';
import {
  ClipboardList, Clock, CheckCircle2, FileQuestion,
  PlayCircle, Eye, Target, Award, Layers, Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import {
  PageContainer,
  PageHeader,
  StatCard,
  SectionCard,
  StatusBadge,
  EmptyState,
  SearchInput,
  SegmentedTabs,
  LoadingState,
} from '@/components/common';
import { Button } from '@/components/ui/button';

const StudentQuizzes = () => {
  const { t, i18n } = useTranslation();
  const { student, logout } = useStudentAuth();
  const { quizzes, completedQuizzes, loadingQuizzes } = useStudentData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('available');

  const isAr = i18n.language === 'ar';
  const loading = loadingQuizzes;

  useEffect(() => {
    if (!student) navigate('/student/login');
  }, [student, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/student/login');
    toast.success(`${t('sidebar.logout')} ${t('auth.success')}`);
  };

  const handleStartOrResume = async (quiz) => {
    try {
      await studentApi.post(`/quizzes/${quiz.id}/start`, {});
      navigate(`/student/quizzes/${quiz.id}/take`);
    } catch (error) {
      if (error.response?.status === 403) {
        const data = error.response.data;
        if (data.reason === 'active_attempt_exists' && data.attempt_id) {
          if (window.confirm(`${data.message}\n\n${t('quizzes.resume_confirm')}`)) {
            navigate(`/student/quizzes/${quiz.id}/take?resume=${data.attempt_id}`);
          }
        } else {
          toast.error(data.message || 'Quiz not available');
        }
      } else {
        toast.error(t('quizzes.start_failed'));
      }
    }
  };

  const handleViewResult = (quizId, attemptId) => {
    navigate(`/student/quizzes/${quizId}/result/${attemptId}`);
  };

  const getQuizAvailability = (quiz) => {
    const now = new Date();
    const startDate = quiz.start_date ? new Date(quiz.start_date) : null;
    const endDate = quiz.end_date ? new Date(quiz.end_date) : null;
    const attemptsCount = quiz.attempts_count || 0;
    const maxAttempts = quiz.max_attempts || 1;

    if (!quiz.is_published) return { available: false, key: 'quizzes.status_not_published' };
    if (startDate && now < startDate) return { available: false, key: 'quizzes.status_starts', params: { date: startDate.toLocaleDateString() } };
    if (endDate && now > endDate) return { available: false, key: 'quizzes.status_ended' };
    if (attemptsCount >= maxAttempts) return { available: false, key: 'quizzes.status_no_attempts' };
    return { available: true, key: null };
  };

  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : null;

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          quiz.course_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredCompleted = completedQuizzes.filter(item =>
    item.quiz_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.course_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const averageScore = useMemo(() => {
    if (!completedQuizzes.length) return 0;
    const validPercentages = completedQuizzes
      .map(c => c.percentage)
      .filter(p => typeof p === 'number' && !isNaN(p));
    if (!validPercentages.length) return 0;
    const sum = validPercentages.reduce((acc, curr) => acc + curr, 0);
    return (sum / validPercentages.length).toFixed(1).replace(/\.0$/, '');
  }, [completedQuizzes]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background" dir={isAr ? 'rtl' : 'ltr'}>
        <Sidebar onLogout={handleLogout} />
        <main className="md:ps-72 min-h-screen">
          <LoadingState label={t('common.loading', 'Loading...')} />
        </main>
      </div>
    );
  }

  const tabOptions = [
    { value: 'available', label: t('quizzes.available'), icon: ClipboardList, count: filteredQuizzes.length },
    { value: 'completed', label: t('quizzes.completed'), icon: CheckCircle2, count: filteredCompleted.length },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground" dir={isAr ? 'rtl' : 'ltr'}>
      <Sidebar onLogout={handleLogout} />

      <main className="md:ps-72 min-h-screen flex flex-col">
        <PageContainer>
          <PageHeader
            icon={FileQuestion}
            title={t('quizzes.title')}
            description={t('mavi.quiz_desc')}
          />

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label={t('quizzes.avg_score')}
              value={`${averageScore}%`}
              icon={Award}
              accent
            />
            <StatCard
              label={t('quizzes.done')}
              value={completedQuizzes.length}
              icon={CheckCircle2}
            />
            <StatCard
              label={t('quizzes.pending')}
              value={quizzes.length}
              icon={Layers}
            />
            <StatCard
              label={t('mavi.sync_level')}
              value={`#${student?.level ?? '-'}`}
              icon={Target}
            />
          </div>

          {/* Toolbar: tabs + search */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SegmentedTabs
              value={activeTab}
              onChange={setActiveTab}
              options={tabOptions}
            />
            <SearchInput
              placeholder={t('quizzes.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Quiz grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {(activeTab === 'available' ? filteredQuizzes : filteredCompleted).length === 0 ? (
                <EmptyState
                  icon={ClipboardList}
                  title={t('common.no_data')}
                />
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {activeTab === 'available'
                    ? filteredQuizzes.map((quiz) => {
                        const availability = getQuizAvailability(quiz);
                        return (
                          <div
                            key={quiz.id}
                            className="flex flex-col gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                                <FileQuestion className="size-4" />
                              </span>
                              {availability.available ? (
                                <StatusBadge variant="success" icon={CheckCircle2}>
                                  {t('mavi.ready')}
                                </StatusBadge>
                              ) : (
                                <StatusBadge variant="neutral" icon={Lock}>
                                  {t('mavi.locked')}
                                </StatusBadge>
                              )}
                            </div>

                            <div className="min-w-0 text-start">
                              <p className="truncate text-xs text-muted-foreground">{quiz.course_name}</p>
                              <h3 className={`mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-foreground ${isAr ? 'font-arabic' : ''}`}>
                                {quiz.title}
                              </h3>
                            </div>

                            <div className="grid grid-cols-2 gap-3 border-t pt-3 text-start">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-xs text-muted-foreground">{t('quizzes.mins')}</span>
                                <span className="text-sm font-medium text-foreground">{quiz.time_limit_minutes}m</span>
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-xs text-muted-foreground">{t('quizzes.tries')}</span>
                                <span className="text-sm font-medium text-foreground">
                                  {quiz.attempts_count || 0}/{quiz.max_attempts || 1}
                                </span>
                              </div>
                            </div>

                            <div className="mt-auto">
                              {availability.available ? (
                                <Button
                                  className="w-full"
                                  onClick={() => handleStartOrResume(quiz)}
                                >
                                  <PlayCircle className="size-4" />
                                  {t('quizzes.start_assessment')}
                                </Button>
                              ) : (
                                <div className="flex w-full items-center justify-center gap-2 rounded-md bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">
                                  <Clock className="size-3.5" />
                                  {t(availability.key, availability.params)}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    : filteredCompleted.map((quiz, idx) => (
                        <div
                          key={quiz.attempt_id || idx}
                          className="flex flex-col gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                              <CheckCircle2 className="size-4" />
                            </span>
                            <div className="text-end">
                              <div className="text-xl font-semibold tracking-tight text-primary">{quiz.percentage}%</div>
                            </div>
                          </div>

                          <div className="min-w-0 text-start">
                            <p className="truncate text-xs text-muted-foreground">{formatDate(quiz.completed_at)}</p>
                            <h3 className={`mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-foreground ${isAr ? 'font-arabic' : ''}`}>
                              {quiz.quiz_title}
                            </h3>
                          </div>

                          <div className="mt-auto">
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => handleViewResult(quiz.quiz_id, quiz.attempt_id)}
                            >
                              <Eye className="size-4" />
                              {t('quizzes.review_answers')}
                            </Button>
                          </div>
                        </div>
                      ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </PageContainer>
      </main>
    </div>
  );
};

export default StudentQuizzes;
