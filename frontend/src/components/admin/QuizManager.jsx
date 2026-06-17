import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  ClipboardList, Plus, Edit3, Trash2, Eye,
  EyeOff, Clock, Target, RotateCcw, FileText,
  LayoutDashboard, BarChart3, CheckSquare,
  Shield, ChevronRight, Database
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  PageContainer,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  EmptyState,
  LoadingState,
  SegmentedTabs,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import QuizForm from './quizzes/QuizForm';
import QuestionBank from './quizzes/QuestionBank';
import QuestionForm from './quizzes/QuestionForm';
import AttemptsLog from './quizzes/AttemptsLog';
import PendingReviews from './quizzes/PendingReviews';

const QuizManager = ({ courses }) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('questions'); // 'questions', 'attempts', 'reviews'

  // Quiz form
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [quizForm, setQuizForm] = useState({
    course_id: '',
    title: '',
    description: '',
    time_limit_minutes: 30,
    passing_score: 50,
    max_attempts: 1,
    start_date: '',
    end_date: '',
    is_official: false
  });

  // Question form
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    question_type: 'mcq',
    options: ['', '', '', ''],
    correct_answer: 'A',
    points: 1,
    explanation: '',
    image_url: ''
  });

  // Fetch all quizzes
  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/quizzes');
      setQuizzes(res.data);
    } catch (error) {
      toast.error(t('admin.quizzes.load_failed') || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (quizId) => {
    try {
      const res = await api.get(`/admin/quizzes/${quizId}/questions`);
      setQuestions(res.data);
    } catch (error) {
      toast.error(t('admin.quizzes.questions.load_failed') || 'Failed to load questions');
    }
  };

  const fetchAttempts = async (quizId) => {
    try {
      const res = await api.get(`/admin/quizzes/${quizId}/attempts`);
      setAttempts(res.data);
    } catch (error) {
      toast.error(t('admin.quizzes.attempts.load_failed') || 'Failed to load attempts');
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (selectedQuiz) {
      fetchQuestions(selectedQuiz.id);
      fetchAttempts(selectedQuiz.id);
    }
  }, [selectedQuiz]);

  // ---------- Quiz CRUD ----------
  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...quizForm,
        max_attempts: parseInt(quizForm.max_attempts) || 1,
        start_date: quizForm.start_date || null,
        end_date: quizForm.end_date || null
      };
      if (editingQuiz) {
        await api.put(`/admin/quizzes/${editingQuiz.id}`, payload);
        toast.success(t('admin.quizzes.update_success') || 'Quiz details updated');
      } else {
        await api.post('/admin/quizzes', payload);
        toast.success(t('admin.quizzes.create_success') || 'New quiz created successfully');
      }
      resetQuizForm();
      fetchQuizzes();
    } catch (error) {
      toast.error(error.response?.data?.message || t('common.error') || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quiz) => {
    if (!window.confirm(t('admin.quizzes.delete_confirm', { title: quiz.title }))) return;
    try {
      await api.delete(`/admin/quizzes/${quiz.id}`);
      toast.success(t('admin.quizzes.delete_success') || 'Quiz deleted successfully');
      if (selectedQuiz?.id === quiz.id) setSelectedQuiz(null);
      fetchQuizzes();
    } catch (error) {
      toast.error(t('admin.quizzes.delete_failed') || 'Failed to delete quiz');
    }
  };

  const editQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setQuizForm({
      course_id: quiz.course_id,
      title: quiz.title,
      description: quiz.description || '',
      time_limit_minutes: quiz.time_limit_minutes,
      passing_score: quiz.passing_score,
      max_attempts: quiz.max_attempts || 1,
      start_date: quiz.start_date ? quiz.start_date.slice(0, 16) : '',
      end_date: quiz.end_date ? quiz.end_date.slice(0, 16) : '',
      is_official: quiz.is_official || false
    });
    setShowQuizForm(true);
  };

  const resetQuizForm = () => {
    setShowQuizForm(false);
    setEditingQuiz(null);
    setQuizForm({
      course_id: '',
      title: '',
      description: '',
      time_limit_minutes: 30,
      passing_score: 50,
      max_attempts: 1,
      start_date: '',
      end_date: '',
      is_official: false
    });
  };

  const handleTogglePublish = async (quiz, e) => {
    e.stopPropagation();
    try {
      const newStatus = !quiz.is_published;
      await api.patch(`/admin/quizzes/${quiz.id}/publish`, { is_published: newStatus });
      toast.success(newStatus ? t('admin.quizzes.publish_success') : t('admin.quizzes.draft_success'));
      fetchQuizzes();
    } catch (error) {
      toast.error(t('admin.quizzes.update_failed'));
    }
  };

  // ---------- Question CRUD ----------
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!selectedQuiz) return toast.error(t('admin.quizzes.questions.select_quiz_error') || 'Select a quiz first');
    setLoading(true);
    try {
      const payload = {
        ...questionForm,
        options: questionForm.question_type === 'mcq' ? questionForm.options : null,
        correct_answer: questionForm.question_type === 'written' ? '' : questionForm.correct_answer,
        points: parseInt(questionForm.points) || 1
      };
      if (editingQuestion) {
        await api.put(`/admin/quizzes/${selectedQuiz.id}/questions/${editingQuestion.id}`, payload);
        toast.success(t('admin.quizzes.questions.update_success') || 'Question updated');
      } else {
        await api.post(`/admin/quizzes/${selectedQuiz.id}/questions`, payload);
        toast.success(t('admin.quizzes.questions.add_success') || 'Question added to quiz');
      }
      resetQuestionForm();
      fetchQuestions(selectedQuiz.id);
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.quizzes.questions.save_failed') || 'Failed to save question');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (question) => {
    if (!window.confirm(t('admin.quizzes.questions.delete_confirm') || `Delete this question?`)) return;
    try {
      await api.delete(`/admin/quizzes/${selectedQuiz.id}/questions/${question.id}`);
      toast.success(t('admin.quizzes.questions.delete_success') || 'Question removed');
      fetchQuestions(selectedQuiz.id);
    } catch (error) {
      toast.error(t('admin.quizzes.questions.delete_failed') || 'Failed to delete question');
    }
  };

  const editQuestion = (q) => {
    setEditingQuestion(q);
    setQuestionForm({
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.options || ['', '', '', ''],
      correct_answer: q.correct_answer || (q.question_type === 'mcq' ? 'A' : ''),
      points: q.points,
      explanation: q.explanation || '',
      image_url: q.image_url || ''
    });
    setShowQuestionForm(true);
  };

  const resetQuestionForm = () => {
    setShowQuestionForm(false);
    setEditingQuestion(null);
    setQuestionForm({
      question_text: '',
      question_type: 'mcq',
      options: ['', '', '', ''],
      correct_answer: 'A',
      points: 1,
      explanation: '',
      image_url: ''
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...questionForm.options];
    newOptions[index] = value;
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  const subTabs = [
    { value: 'questions', label: t('admin.quizzes.questions_tab', { count: questions.length }), icon: FileText },
    { value: 'attempts', label: t('admin.quizzes.attempts_tab', { count: attempts.length }), icon: BarChart3 },
    { value: 'reviews', label: t('admin.quizzes.reviews_tab'), icon: CheckSquare },
  ];

  return (
    <PageContainer size="wide">
      <PageHeader
        icon={ClipboardList}
        title={t('admin.quizzes.title')}
        description={t('admin.sidebar.tabs.quizzes')}
        actions={
          <Button onClick={() => setShowQuizForm(true)}>
            <Plus />
            {t('admin.quizzes.add_btn')}
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label={t('admin.quizzes.active_registry')}
          value={quizzes.length}
          icon={Database}
          hint={t('admin.quizzes.authorized_entities')}
          accent
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left: Quiz list (master) */}
        <div className="xl:col-span-4">
          <SectionCard
            title={t('admin.quizzes.all_quizzes_tab')}
            description={t('admin.quizzes.registry_stream')}
            bodyClassName="p-2"
          >
            <button
              type="button"
              onClick={() => setSelectedQuiz(null)}
              aria-current={!selectedQuiz ? 'true' : undefined}
              className={cn(
                'group w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-md text-sm transition-colors text-start',
                !selectedQuiz
                  ? 'bg-muted text-foreground font-medium'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <LayoutDashboard className={cn('size-4 shrink-0', !selectedQuiz ? 'text-primary' : 'text-muted-foreground')} />
                <span className="truncate">{t('admin.quizzes.all_quizzes_tab')}</span>
              </span>
              <ChevronRight className={cn('size-4 shrink-0 opacity-40', isAr && 'rotate-180')} />
            </button>

            <div className="my-1.5 h-px bg-border" />

            {loading && quizzes.length === 0 ? (
              <LoadingState className="min-h-[200px]" />
            ) : quizzes.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title={t('admin.quizzes.no_quizzes')}
                description={t('admin.quizzes.registry_stream')}
                className="my-2"
              />
            ) : (
              <div className="space-y-1 max-h-[760px] overflow-y-auto">
                {quizzes.map((quiz) => {
                  const isSelected = selectedQuiz?.id === quiz.id;
                  return (
                    <div
                      key={quiz.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => { setSelectedQuiz(quiz); setActiveSubTab('questions'); }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedQuiz(quiz);
                          setActiveSubTab('questions');
                        }
                      }}
                      className={cn(
                        'group relative flex items-start justify-between gap-2 rounded-md border p-3 text-start transition-colors cursor-pointer',
                        isSelected
                          ? 'border-primary/30 bg-primary/5'
                          : 'border-transparent hover:bg-muted/50'
                      )}
                    >
                      {isSelected && (
                        <span className="absolute inset-y-2 start-0 w-0.5 rounded-full bg-primary" />
                      )}
                      <div className="min-w-0 ps-1.5">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span
                            className={cn(
                              'size-1.5 rounded-full shrink-0',
                              quiz.is_published ? 'bg-primary' : 'bg-muted-foreground/40'
                            )}
                          />
                          <h3 className="text-sm font-medium text-foreground truncate">{quiz.title}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mb-2">{quiz.course_name}</p>
                        <div className="flex flex-wrap gap-1.5">
                          <StatusBadge variant="neutral" icon={Clock}>{quiz.time_limit_minutes}m</StatusBadge>
                          <StatusBadge variant="success" icon={Target}>{quiz.passing_score}%</StatusBadge>
                        </div>
                      </div>

                      <div
                        className={cn(
                          'flex flex-col gap-1 shrink-0 transition-opacity',
                          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'
                        )}
                      >
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => handleTogglePublish(quiz, e)}
                          aria-label={quiz.is_published ? t('admin.quizzes.published') : t('admin.quizzes.draft')}
                          title={quiz.is_published ? t('admin.quizzes.published') : t('admin.quizzes.draft')}
                          className={quiz.is_published ? 'text-primary hover:text-primary' : undefined}
                        >
                          {quiz.is_published ? <Eye /> : <EyeOff />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => { e.stopPropagation(); editQuiz(quiz); }}
                          aria-label={t('admin.quizzes.form.edit_title')}
                          title={t('admin.quizzes.form.edit_title')}
                        >
                          <Edit3 />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon-sm"
                          onClick={(e) => { e.stopPropagation(); handleDeleteQuiz(quiz); }}
                          aria-label={t('common.delete')}
                          title={t('common.delete')}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right: Workspace (detail) */}
        <div className="xl:col-span-8">
          {selectedQuiz ? (
            <SectionCard
              bodyClassName="p-0"
              header={
                <div className="border-b bg-muted/30 px-4 py-4 sm:px-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold text-foreground truncate">{selectedQuiz.title}</h2>
                        <StatusBadge variant={selectedQuiz.is_published ? 'success' : 'neutral'}>
                          {selectedQuiz.is_published ? t('admin.quizzes.published') : t('admin.quizzes.draft')}
                        </StatusBadge>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <LayoutDashboard className="size-3.5 text-primary" />
                          {selectedQuiz.course_name}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <RotateCcw className="size-3.5 text-primary" />
                          {t('admin.quizzes.attempts_label', { count: selectedQuiz.max_attempts || 1 })}
                        </span>
                        {selectedQuiz.is_official && (
                          <span className="inline-flex items-center gap-1.5 text-destructive">
                            <Shield className="size-3.5" />
                            {t('admin.quizzes.official_mode')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 overflow-x-auto">
                    <SegmentedTabs
                      value={activeSubTab}
                      onChange={setActiveSubTab}
                      options={subTabs}
                    />
                  </div>
                </div>
              }
            >
              <div className="p-4 sm:p-5 min-h-[480px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSubTab}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                  >
                    {activeSubTab === 'questions' && (
                      <QuestionBank
                        questions={questions}
                        setShowQuestionForm={setShowQuestionForm}
                        editQuestion={editQuestion}
                        handleDeleteQuestion={handleDeleteQuestion}
                      />
                    )}

                    {activeSubTab === 'attempts' && (
                      <AttemptsLog attempts={attempts} selectedQuiz={selectedQuiz} />
                    )}

                    {activeSubTab === 'reviews' && (
                      <PendingReviews quizId={selectedQuiz.id} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </SectionCard>
          ) : (
            <SectionCard bodyClassName="p-4 sm:p-5">
              <EmptyState
                icon={ClipboardList}
                title={t('admin.quizzes.workspace_idle_title')}
                description={t('admin.quizzes.workspace_idle_desc')}
                className="min-h-[440px] border-none"
              />
            </SectionCard>
          )}
        </div>
      </div>

      {/* QUIZ FORM MODAL */}
      {showQuizForm && (
        <QuizForm
          quizForm={quizForm}
          setQuizForm={setQuizForm}
          loading={loading}
          editingQuiz={editingQuiz}
          handleSaveQuiz={handleSaveQuiz}
          resetQuizForm={resetQuizForm}
          courses={courses}
        />
      )}

      {/* QUESTION FORM MODAL */}
      {showQuestionForm && selectedQuiz && (
        <QuestionForm
          questionForm={questionForm}
          setQuestionForm={setQuestionForm}
          loading={loading}
          editingQuestion={editingQuestion}
          handleSaveQuestion={handleSaveQuestion}
          resetQuestionForm={resetQuestionForm}
          handleOptionChange={handleOptionChange}
        />
      )}
    </PageContainer>
  );
};

export default QuizManager;
