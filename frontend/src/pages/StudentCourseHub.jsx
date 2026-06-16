import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import MaterialHubTab from '../components/MaterialHubTab';
import studentApi from '../services/studentApi';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import {
  Megaphone, QrCode, ListChecks, CheckCircle2, Circle,
  ArrowLeft, Calendar, ExternalLink, Users,
  Loader2, BookOpen, Check,
  Zap, Award, MessageSquare, Send,
  HelpCircle, ArrowRight, ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { useStudentData } from '../context/StudentDataContext';
import {
  PageContainer,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  EmptyState,
  LoadingState,
  SegmentedTabs,
  FormField,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const fade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
  transition: { duration: 0.2 },
};

const StudentCourseHub = () => {
  const { t, i18n } = useTranslation();
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [questionBank, setQuestionBank] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('announcements');
  const [submissionUrls, setSubmissionUrls] = useState({});
  const { gradesData } = useStudentData();
  const courses = gradesData?.grades || [];

  // Inquiry Form State
  const [inquiryType, setInquiryType] = useState('question');
  const [inquirySubject, setInquirySubject] = useState('');
  const [inquiryContent, setInquiryContent] = useState('');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  const fetchHubData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentApi.get(`/student/course/${courseId}/hub`);
      setData(res.data);

      const inqRes = await studentApi.get('/student/my-inquiries');
      setInquiries(inqRes.data.filter(i => String(i.course_id) === String(courseId)));

      const qbRes = await studentApi.get(`/student/course/${courseId}/question-bank`);
      setQuestionBank(qbRes.data || []);
    } catch (err) {
      toast.error(t('hub.messages.load_failed'));
      navigate('/student/dashboard');
    } finally {
      setLoading(false);
    }
  }, [courseId, navigate, t]);

  useEffect(() => {
    fetchHubData();
  }, [fetchHubData]);

  const handleToggleTask = async (taskId, currentStatus, requiresSubmission = false) => {
    try {
      const payload = { is_completed: !currentStatus };
      if (!currentStatus && requiresSubmission) {
        const url = submissionUrls[taskId];
        if (!url) return toast.error(t('messages.enter_submission_link'));
        payload.submission_url = url;
      }

      await studentApi.patch(`/official-tasks/${taskId}/toggle`, payload);
      if (!currentStatus) toast.success(t('hub.messages.submit_success'));
      fetchHubData();
    } catch (error) {
      toast.error(t('hub.messages.submit_failed'));
    }
  };

  const handleSubmitInquiry = async (e) => {
    e.preventDefault();
    if (!inquiryContent.trim()) return toast.error(t('hub.messages.message_req'));

    setSubmittingInquiry(true);
    try {
      await studentApi.post('/student/inquiries', {
        course_id: courseId,
        type: inquiryType,
        subject: inquirySubject,
        content: inquiryContent
      });
      toast.success(t('hub.messages.send_success'));
      setInquirySubject('');
      setInquiryContent('');

      // Refresh inquiries
      const inqRes = await studentApi.get('/student/my-inquiries');
      setInquiries(inqRes.data.filter(i => String(i.course_id) === String(courseId)));
    } catch (err) {
      toast.error(t('hub.messages.send_failed'));
    } finally {
      setSubmittingInquiry(false);
    }
  };

  const isAr = i18n.language === 'ar';

  const course = data?.course || {};
  const qrToken = data?.qrToken || '';
  const announcements = data?.announcements || [];
  const progress = data?.progress || [];
  const tasks = data?.tasks || [];
  const attendance = data?.attendance || [];
  const attendedCount = attendance.filter(a => a.is_present).length;
  const progressPct = progress.length > 0
    ? Math.round((progress.filter(p => p.is_completed).length / progress.length) * 100)
    : 0;

  const tabs = [
    { value: 'announcements', label: t('hub.tabs.news'), icon: Megaphone, count: announcements.length },
    { value: 'progress', label: t('hub.tabs.progress'), icon: ListChecks },
    { value: 'tasks', label: t('hub.tabs.tasks'), icon: CheckCircle2, count: tasks.length },
    { value: 'attendance', label: t('hub.tabs.presence'), icon: Users },
    { value: 'materials', label: t('hub.tabs.materials', { defaultValue: 'Material Hub' }), icon: BookOpen },
    { value: 'questions', label: isAr ? 'بنك الأسئلة' : 'Question Bank', icon: HelpCircle, count: questionBank.length },
    { value: 'inquiries', label: t('hub.tabs.support'), icon: MessageSquare, count: inquiries.length },
  ];

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans" dir={isAr ? 'rtl' : 'ltr'}>
        <Sidebar />
        <main className="md:ps-72 min-h-screen">
          <LoadingState />
        </main>
      </div>
    );
  }

  // Title-as-dropdown course switcher
  const courseSwitcher = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'group flex items-center gap-2 truncate text-xl font-semibold tracking-tight text-foreground transition-colors hover:text-primary focus:outline-none',
            isAr ? 'font-arabic' : ''
          )}
        >
          <span className="truncate">{course.name}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-aria-expanded:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isAr ? 'end' : 'start'} className="max-h-96 w-72 overflow-y-auto">
        <DropdownMenuLabel>{isAr ? 'اختر مادة أخرى' : 'Switch Course'}</DropdownMenuLabel>
        {courses.map((c) => {
          const isActive = String(c.course_id) === String(courseId);
          return (
            <DropdownMenuItem
              key={c.course_id}
              onSelect={() => navigate(`/student/course/${c.course_id}`)}
              className={cn('justify-between', isActive && 'text-primary')}
            >
              <span className="flex min-w-0 items-center gap-2">
                <BookOpen className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{c.course_name}</span>
              </span>
              {isActive && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      <Sidebar />

      <main className="md:ps-72 min-h-screen">
        <PageContainer>
          {/* Back link */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/student/dashboard')}
            className="-ms-1 w-fit text-muted-foreground"
          >
            <ArrowLeft className={cn('size-4', isAr && 'rotate-180')} />
            {t('hub.back', { defaultValue: isAr ? 'العودة للرئيسية' : 'Back to Dashboard' })}
          </Button>

          {/* Header with course switcher + meta */}
          <PageHeader
            icon={BookOpen}
            title={courseSwitcher}
            description={
              <span className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5">
                  <Zap className="size-3.5 text-primary" />
                  {course.code || 'CORE-ID'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  {new Date().getFullYear()} {t('hub.session')}
                </span>
              </span>
            }
          />

          {/* Stat row */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label={t('hub.progress.title')}
              value={`${progressPct}%`}
              icon={ListChecks}
              accent
            />
            <StatCard
              label={t('hub.tasks.title')}
              value={tasks.length}
              icon={CheckCircle2}
            />
            <StatCard
              label={t('hub.attendance.title')}
              value={attendedCount}
              icon={Users}
            />
            <StatCard
              label={t('hub.tabs.news')}
              value={announcements.length}
              icon={Megaphone}
            />
          </div>

          {/* Tab bar */}
          <div className="overflow-x-auto pb-1">
            <SegmentedTabs
              value={activeTab}
              onChange={setActiveTab}
              options={tabs}
              className="flex-nowrap"
            />
          </div>

          {/* Content */}
          <div className={cn(
            'grid grid-cols-1 gap-6',
            activeTab === 'attendance' && 'lg:grid-cols-12'
          )}>
            <div className={activeTab === 'attendance' ? 'lg:col-span-8' : ''}>
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} {...fade}>

                  {activeTab === 'announcements' && (
                    <SectionCard title={t('hub.tabs.news')}>
                      {announcements.length === 0 ? (
                        <EmptyState
                          icon={Megaphone}
                          title={t('hub.announcements.no_news')}
                        />
                      ) : (
                        <div className="space-y-6">
                          {announcements.map(ann => (
                            <div
                              key={ann.id}
                              className="relative ps-5 border-s-2 border-border"
                            >
                              <span className="absolute top-1.5 -start-[5px] size-2 rounded-full bg-primary" />
                              <span className="text-xs font-medium text-muted-foreground">
                                {new Date(ann.created_at).toLocaleDateString()}
                              </span>
                              <h3 className="mt-1 text-sm font-semibold text-foreground">{ann.title}</h3>
                              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{ann.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </SectionCard>
                  )}

                  {activeTab === 'progress' && (
                    <div className="space-y-6">
                      <SectionCard>
                        <div className="flex items-end justify-between gap-4">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">{t('hub.progress.title')}</p>
                            <span className="mt-1 block text-3xl font-semibold tracking-tight text-primary">
                              {progressPct}%
                            </span>
                          </div>
                          <span className="flex size-10 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                            <Award className="size-5" />
                          </span>
                        </div>
                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-700"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </SectionCard>

                      <SectionCard title={t('hub.progress.title')} bodyClassName="p-0">
                        {progress.length === 0 ? (
                          <div className="p-4">
                            <EmptyState icon={ListChecks} title={t('hub.progress.title')} />
                          </div>
                        ) : (
                          <ul className="divide-y divide-border">
                            {progress.map((item, idx) => (
                              <li key={item.id} className="flex items-center gap-3 px-4 py-2.5">
                                <span
                                  className={cn(
                                    'flex size-8 shrink-0 items-center justify-center rounded-md border text-xs font-medium',
                                    item.is_completed
                                      ? 'border-primary/20 bg-primary/10 text-primary'
                                      : 'bg-muted text-muted-foreground'
                                  )}
                                >
                                  {item.is_completed ? <Check className="size-4" /> : (idx + 1).toString().padStart(2, '0')}
                                </span>
                                <div className="min-w-0">
                                  <h4 className={cn(
                                    'truncate text-sm font-medium',
                                    item.is_completed ? 'text-primary' : 'text-foreground'
                                  )}>
                                    {item.title}
                                  </h4>
                                  <p className="text-xs text-muted-foreground">
                                    {item.is_completed
                                      ? t('hub.progress.completed_topic')
                                      : (isAr ? 'وحدة قادمة' : 'Upcoming module')}
                                  </p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </SectionCard>
                    </div>
                  )}

                  {activeTab === 'tasks' && (
                    <SectionCard title={t('hub.tasks.title')} bodyClassName="p-0">
                      {tasks.length === 0 ? (
                        <div className="p-4">
                          <EmptyState icon={CheckCircle2} title={t('hub.tasks.title')} />
                        </div>
                      ) : (
                        <ul className="divide-y divide-border">
                          {tasks.map(task => (
                            <li key={task.id} className="space-y-3 px-4 py-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                  <span className={cn(
                                    'flex size-9 shrink-0 items-center justify-center rounded-md border',
                                    task.is_completed
                                      ? 'border-primary/20 bg-primary/10 text-primary'
                                      : 'bg-muted text-muted-foreground'
                                  )}>
                                    {task.is_completed ? <CheckCircle2 className="size-5" /> : <Circle className="size-5" />}
                                  </span>
                                  <div className="min-w-0">
                                    <h3 className={cn(
                                      'truncate text-sm font-medium',
                                      task.is_completed ? 'text-muted-foreground line-through' : 'text-foreground'
                                    )}>
                                      {task.title}
                                    </h3>
                                    <span className="text-xs text-muted-foreground">
                                      {t('hub.tasks.due', { date: new Date(task.deadline).toLocaleDateString() })}
                                    </span>
                                  </div>
                                </div>
                                {task.drive_link && (
                                  <Button asChild variant="ghost" size="icon-sm" className="text-muted-foreground">
                                    <a href={task.drive_link} target="_blank" rel="noreferrer" aria-label={t('hub.tabs.materials', { defaultValue: 'Material Hub' })}>
                                      <ExternalLink className="size-4" />
                                    </a>
                                  </Button>
                                )}
                              </div>

                              {task.requires_submission && !task.is_completed && (
                                <div className="flex flex-col gap-2 border-t border-border pt-3 sm:flex-row">
                                  <Input
                                    type="url"
                                    placeholder={t('hub.tasks.submit_link_placeholder')}
                                    value={submissionUrls[task.id] || ''}
                                    onChange={(e) => setSubmissionUrls({ ...submissionUrls, [task.id]: e.target.value })}
                                    className="flex-1"
                                  />
                                  <Button onClick={() => handleToggleTask(task.id, false, true)}>
                                    {t('hub.tasks.submit_btn')}
                                  </Button>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </SectionCard>
                  )}

                  {activeTab === 'attendance' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-3">
                        <StatCard
                          label={t('hub.attendance.present')}
                          value={attendedCount}
                          icon={CheckCircle2}
                          accent
                        />
                        <div className="rounded-xl border bg-card p-4">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-xs font-medium text-muted-foreground">{t('hub.attendance.absent')}</span>
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-destructive/20 bg-destructive/10 text-destructive">
                              <Users className="size-4" />
                            </span>
                          </div>
                          <div className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                            {attendance.length - attendedCount}
                          </div>
                        </div>
                      </div>

                      <SectionCard title={t('hub.attendance.title')} bodyClassName="p-0">
                        {attendance.length === 0 ? (
                          <div className="p-4">
                            <EmptyState icon={Users} title={t('hub.attendance.title')} />
                          </div>
                        ) : (
                          <ul className="divide-y divide-border">
                            {attendance.map(record => (
                              <li key={record.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                                <div className="flex items-center gap-3">
                                  <span className={cn(
                                    'size-2 shrink-0 rounded-full',
                                    record.is_present ? 'bg-primary' : 'bg-destructive'
                                  )} />
                                  <div>
                                    <p className="text-sm font-medium text-foreground">
                                      {new Date(record.date).toLocaleDateString()}
                                    </p>
                                    <span className="text-xs text-muted-foreground">
                                      {record.is_present
                                        ? (isAr ? 'حضور موثّق' : 'Verified entry')
                                        : (isAr ? 'غياب مسجّل' : 'Missed session')}
                                    </span>
                                  </div>
                                </div>
                                <StatusBadge variant={record.is_present ? 'success' : 'danger'}>
                                  {record.is_present
                                    ? t('hub.attendance.present')
                                    : t('hub.attendance.absent')}
                                </StatusBadge>
                              </li>
                            ))}
                          </ul>
                        )}
                      </SectionCard>
                    </div>
                  )}

                  {activeTab === 'materials' && (
                    <MaterialHubTab courseId={courseId} />
                  )}

                  {activeTab === 'questions' && (
                    <QuestionBankTab questions={questionBank} isAr={isAr} t={t} />
                  )}

                  {activeTab === 'inquiries' && (
                    <div className="space-y-6">
                      <SectionCard title={t('hub.tabs.support')}>
                        <form onSubmit={handleSubmitInquiry} className="space-y-4">
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <FormField label={t('hub.support.type')}>
                              <SegmentedTabs
                                value={inquiryType}
                                onChange={setInquiryType}
                                options={[
                                  { value: 'question', label: t('hub.support.question') },
                                  { value: 'complaint', label: t('hub.support.complaint') },
                                ]}
                                className="w-full"
                              />
                            </FormField>
                            <FormField label={t('hub.support.subject')} htmlFor="inquiry-subject">
                              <Input
                                id="inquiry-subject"
                                type="text"
                                value={inquirySubject}
                                onChange={(e) => setInquirySubject(e.target.value)}
                              />
                            </FormField>
                          </div>
                          <FormField label={t('hub.support.message')} htmlFor="inquiry-content">
                            <Textarea
                              id="inquiry-content"
                              rows={4}
                              value={inquiryContent}
                              onChange={(e) => setInquiryContent(e.target.value)}
                            />
                          </FormField>
                          <Button type="submit" disabled={submittingInquiry} className="w-full sm:w-auto">
                            {submittingInquiry ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <>
                                <Send className="size-4" />
                                {t('hub.support.send')}
                              </>
                            )}
                          </Button>
                        </form>
                      </SectionCard>

                      {inquiries.length > 0 && (
                        <div className="space-y-3">
                          {inquiries.map(inq => (
                            <SectionCard key={inq.id}>
                              <div className="flex items-center justify-between gap-3">
                                <StatusBadge variant={inq.status === 'replied' ? 'success' : 'warning'}>
                                  {inq.status}
                                </StatusBadge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(inq.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <h4 className="mt-3 text-sm font-semibold text-foreground">{inq.subject}</h4>
                              <p className="mt-1 text-sm italic text-muted-foreground">"{inq.content}"</p>
                              {inq.doctor_reply && (
                                <div className="mt-4 rounded-lg border-s-2 border-primary bg-muted/50 p-3">
                                  <p className="text-xs font-medium text-primary">
                                    {isAr ? 'رد المحاضر' : 'Instructor reply'}
                                  </p>
                                  <p className="mt-1 text-sm text-foreground">{inq.doctor_reply}</p>
                                </div>
                              )}
                            </SectionCard>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>

            {/* QR pass card (attendance only) */}
            {activeTab === 'attendance' && (
              <div className="lg:col-span-4">
                <SectionCard title={t('hub.qr.title')} description={t('hub.qr.desc')}>
                  <div className="flex flex-col items-center gap-4 text-center">
                    <span className="flex size-10 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                      <QrCode className="size-5" />
                    </span>
                    <div className="rounded-lg border bg-white p-4">
                      <QRCodeSVG value={qrToken} size={176} level="H" fgColor="#0c0c14" bgColor="#FFFFFF" />
                    </div>
                    <StatusBadge variant="success" icon={ShieldCheck}>
                      {t('hub.qr.secure_active')}
                    </StatusBadge>
                  </div>
                </SectionCard>
              </div>
            )}
          </div>
        </PageContainer>
      </main>
    </div>
  );
};

const QuestionBankTab = ({ questions, isAr, t }) => {
  const [selectedQuiz, setSelectedQuiz] = React.useState('all');
  const [viewMode, setViewMode] = React.useState('card'); // 'card' or 'list'
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [userAnswers, setUserAnswers] = React.useState({});
  const [revealed, setRevealed] = React.useState({});

  // Filter questions based on selected quiz
  const quizzes = React.useMemo(() => {
    const list = questions.map(q => q.quiz_title).filter(Boolean);
    return ['all', ...new Set(list)];
  }, [questions]);

  const filteredQuestions = React.useMemo(() => {
    if (selectedQuiz === 'all') return questions;
    return questions.filter(q => q.quiz_title === selectedQuiz);
  }, [questions, selectedQuiz]);

  // Reset current index if questions change
  React.useEffect(() => {
    setCurrentIndex(0);
  }, [selectedQuiz]);

  if (questions.length === 0) {
    return (
      <EmptyState
        icon={HelpCircle}
        title={isAr ? 'لا توجد أسئلة مضافة في بنك الأسئلة حالياً' : 'No questions in the Question Bank yet'}
      />
    );
  }

  const handleSelectOption = (questionId, option) => {
    if (userAnswers[questionId]) return; // prevent re-answering
    setUserAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleToggleReveal = (questionId) => {
    setRevealed(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const currentQuestion = filteredQuestions[currentIndex];
  const totalQuestions = filteredQuestions.length;
  const attemptedCount = filteredQuestions.filter(q => userAnswers[q.id] !== undefined).length;
  const correctCount = filteredQuestions.filter(q => userAnswers[q.id] === q.correct_answer).length;
  const scorePercentage = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

  const renderQuestionCard = (q, indexShow = null) => {
    const selectedOpt = userAnswers[q.id];
    const isAnswered = selectedOpt !== undefined;
    const isCorrect = selectedOpt === q.correct_answer;
    const isRevealed = revealed[q.id];

    return (
      <SectionCard key={q.id} className="mb-4">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-primary">
                {indexShow !== null
                  ? `${isAr ? 'سؤال' : 'Question'} ${(indexShow + 1).toString().padStart(2, '0')}`
                  : `${isAr ? 'سؤال' : 'Question'} ${(currentIndex + 1).toString().padStart(2, '0')} / ${totalQuestions}`}
              </span>
              {q.quiz_title && (
                <StatusBadge variant="neutral">{q.quiz_title}</StatusBadge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {q.question_type === 'true_false'
                ? (isAr ? 'صح / خطأ' : 'True / False')
                : (isAr ? 'اختياري' : 'MCQ')}
            </span>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold leading-snug text-foreground">
              {q.question_text}
            </h3>
            {q.image_url && (
              <div className="flex max-h-72 justify-center overflow-hidden rounded-lg border bg-muted">
                <img src={q.image_url} alt="Question Context" className="max-h-72 object-contain" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2">
            {(q.options || []).map((opt, oIdx) => {
              const isSelected = selectedOpt === opt;
              const isCorrectOption = opt === q.correct_answer;

              let optClass = 'border-border bg-muted/40 text-foreground hover:bg-muted';
              if (isAnswered) {
                if (isCorrectOption) {
                  optClass = 'border-primary/30 bg-primary/10 text-primary font-medium';
                } else if (isSelected) {
                  optClass = 'border-destructive/30 bg-destructive/10 text-destructive font-medium';
                } else {
                  optClass = 'border-border bg-muted/40 text-muted-foreground opacity-60';
                }
              } else if (isRevealed && isCorrectOption) {
                optClass = 'border-primary/40 bg-primary/10 text-primary font-medium';
              }

              return (
                <button
                  key={oIdx}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(q.id, opt)}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-lg border px-4 py-2.5 text-start text-sm transition-colors',
                    optClass
                  )}
                >
                  <span>{opt}</span>
                  {isAnswered && isCorrectOption && (
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                      <Check className="size-3" />
                    </span>
                  )}
                  {isAnswered && isSelected && !isCorrectOption && (
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-destructive text-[10px] text-white">✗</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleToggleReveal(q.id)}
              className="text-muted-foreground"
            >
              <HelpCircle className="size-4" />
              {isRevealed || isAnswered
                ? (isAr ? 'إخفاء الإجابة والتفسير' : 'Hide Answer & Explanation')
                : (isAr ? 'عرض الإجابة الصحيحة' : 'Show Correct Answer')}
            </Button>

            {isAnswered && (
              <StatusBadge variant={isCorrect ? 'success' : 'danger'}>
                {isCorrect
                  ? (isAr ? 'إجابة صحيحة' : 'Correct')
                  : (isAr ? 'إجابة خاطئة' : 'Incorrect')}
              </StatusBadge>
            )}
          </div>

          {(isRevealed || isAnswered) && (
            <div className="rounded-lg border-s-2 border-primary bg-muted/50 p-3">
              <p className="text-xs font-medium text-primary">
                {isAr ? 'الإجابة الصحيحة والتوضيح' : 'Correct answer & explanation'}
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {q.correct_answer}
              </p>
              {q.explanation ? (
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {q.explanation}
                </p>
              ) : (
                <p className="mt-1 text-xs italic leading-relaxed text-muted-foreground">
                  {isAr ? 'لا يوجد تفسير إضافي متاح.' : 'No additional explanation available.'}
                </p>
              )}
            </div>
          )}
        </div>
      </SectionCard>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats header */}
      <SectionCard
        title={isAr ? 'بنك أسئلة المادة' : 'Course Question Bank'}
        description={
          isAr
            ? 'تدرب على كافة الأسئلة الاختيارية المنشورة لتعزيز فهمك للمادة'
            : 'Practice all published MCQ & True/False questions to master this course'
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <SegmentedTabs
              size="sm"
              value={viewMode}
              onChange={setViewMode}
              options={[
                { value: 'card', label: isAr ? 'سؤال سؤال' : 'Flashcard' },
                { value: 'list', label: isAr ? 'قائمة كاملة' : 'Full List' },
              ]}
            />
            <Select value={selectedQuiz} onValueChange={setSelectedQuiz}>
              <SelectTrigger size="sm" className="w-auto min-w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {quizzes.map((q, idx) => (
                  <SelectItem key={q || idx} value={q}>
                    {q === 'all' ? (isAr ? 'كل الاختبارات' : 'All Quizzes') : q}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      >
        {/* Practice Analytics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border bg-muted/40 p-3 text-center">
            <span className="text-xs text-muted-foreground">{isAr ? 'إجمالي الأسئلة' : 'Total Questions'}</span>
            <p className="mt-1 text-xl font-semibold text-foreground">{totalQuestions}</p>
          </div>
          <div className="rounded-lg border bg-muted/40 p-3 text-center">
            <span className="text-xs text-muted-foreground">{isAr ? 'تمت الإجابة' : 'Answered'}</span>
            <p className="mt-1 text-xl font-semibold text-foreground">{attemptedCount}</p>
          </div>
          <div className="rounded-lg border bg-muted/40 p-3 text-center">
            <span className="text-xs text-muted-foreground">{isAr ? 'نسبة الدقة' : 'Accuracy Rate'}</span>
            <p className="mt-1 text-xl font-semibold text-primary">{scorePercentage}%</p>
          </div>
        </div>
      </SectionCard>

      {/* Question content */}
      {totalQuestions === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title={isAr ? 'لا توجد أسئلة تطابق الفلتر المختار.' : 'No questions matching the selected filter.'}
        />
      ) : viewMode === 'card' ? (
        <div className="space-y-4">
          {renderQuestionCard(currentQuestion)}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
            <Button
              variant="outline"
              size="sm"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(prev => prev - 1)}
            >
              <ArrowLeft className={cn('size-4', isAr && 'rotate-180')} />
              {isAr ? 'السابق' : 'Previous'}
            </Button>

            <span className="text-xs font-medium text-muted-foreground">
              {currentIndex + 1} / {totalQuestions}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={currentIndex === totalQuestions - 1}
              onClick={() => setCurrentIndex(prev => prev + 1)}
            >
              {isAr ? 'التالي' : 'Next'}
              <ArrowRight className={cn('size-4', isAr && 'rotate-180')} />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => renderQuestionCard(q, idx))}
        </div>
      )}
    </div>
  );
};

export default StudentCourseHub;
