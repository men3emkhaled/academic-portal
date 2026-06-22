import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ClipboardList, Plus, Edit3, Trash2, Eye, EyeOff, Clock, Target, FileText, BarChart3, X } from 'lucide-react';
import QuizForm from './quizzes/QuizForm';
import QuestionBank from './quizzes/QuestionBank';
import QuestionForm from './quizzes/QuestionForm';
import AttemptsLog from './quizzes/AttemptsLog';

const QuizManager = ({ courses }) => {
  const { t } = useTranslation();
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('questions');
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [quizForm, setQuizForm] = useState({
    course_id: '', title: '', description: '', time_limit_minutes: 30, passing_score: 50, max_attempts: 1, start_date: '', end_date: '', is_official: false
  });
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    question_text: '', question_type: 'mcq', options: ['', '', '', ''], correct_answer: 'A', points: 1, explanation: '', image_url: ''
  });

  const fetchQuizzes = async () => {
    setLoading(true);
    try { const res = await api.get('/admin/quizzes'); setQuizzes(res.data); }
    catch (error) { toast.error(t('admin.quizzes.load_failed')); }
    finally { setLoading(false); }
  };

  const fetchQuestions = async (quizId) => {
    try { const res = await api.get(`/admin/quizzes/${quizId}/questions`); setQuestions(res.data); }
    catch (error) { toast.error(t('admin.quizzes.questions.load_failed')); }
  };

  const fetchAttempts = async (quizId) => {
    try { const res = await api.get(`/admin/quizzes/${quizId}/attempts`); setAttempts(res.data); }
    catch (error) { toast.error(t('admin.quizzes.attempts.load_failed')); }
  };

  useEffect(() => { fetchQuizzes(); }, []);
  useEffect(() => { if (selectedQuiz) { fetchQuestions(selectedQuiz.id); fetchAttempts(selectedQuiz.id); } }, [selectedQuiz]);

  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...quizForm, max_attempts: parseInt(quizForm.max_attempts) || 1, start_date: quizForm.start_date || null, end_date: quizForm.end_date || null };
      if (editingQuiz) await api.put(`/admin/quizzes/${editingQuiz.id}`, payload);
      else await api.post('/admin/quizzes', payload);
      toast.success(t('common.success'));
      resetQuizForm();
      fetchQuizzes();
    } catch (error) { toast.error(error.response?.data?.message || t('common.error')); }
    finally { setLoading(false); }
  };

  const handleDeleteQuiz = async (quiz) => {
    if (!window.confirm(t('admin.quizzes.delete_confirm', { title: quiz.title }))) return;
    try {
      await api.delete(`/admin/quizzes/${quiz.id}`);
      toast.success(t('common.success'));
      if (selectedQuiz?.id === quiz.id) setSelectedQuiz(null);
      fetchQuizzes();
    } catch (error) { toast.error(t('admin.quizzes.delete_failed')); }
  };

  const editQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setQuizForm({
      course_id: quiz.course_id, title: quiz.title, description: quiz.description || '',
      time_limit_minutes: quiz.time_limit_minutes, passing_score: quiz.passing_score, max_attempts: quiz.max_attempts || 1,
      start_date: quiz.start_date ? quiz.start_date.slice(0, 16) : '', end_date: quiz.end_date ? quiz.end_date.slice(0, 16) : '', is_official: quiz.is_official || false
    });
    setShowQuizForm(true);
  };

  const resetQuizForm = () => {
    setShowQuizForm(false);
    setEditingQuiz(null);
    setQuizForm({ course_id: '', title: '', description: '', time_limit_minutes: 30, passing_score: 50, max_attempts: 1, start_date: '', end_date: '', is_official: false });
  };

  const handleTogglePublish = async (quiz, e) => {
    e.stopPropagation();
    try {
      const newStatus = !quiz.is_published;
      await api.patch(`/admin/quizzes/${quiz.id}/publish`, { is_published: newStatus });
      toast.success(t('common.success'));
      fetchQuizzes();
    } catch (error) { toast.error(t('admin.quizzes.update_failed')); }
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!selectedQuiz) return toast.error(t('admin.quizzes.questions.select_quiz_error'));
    setLoading(true);
    try {
      const payload = {
        ...questionForm,
        options: questionForm.question_type === 'mcq' ? questionForm.options : null,
        correct_answer: questionForm.question_type === 'written' ? '' : questionForm.correct_answer,
        points: parseInt(questionForm.points) || 1
      };
      if (editingQuestion) await api.put(`/admin/quizzes/${selectedQuiz.id}/questions/${editingQuestion.id}`, payload);
      else await api.post(`/admin/quizzes/${selectedQuiz.id}/questions`, payload);
      toast.success(t('common.success'));
      resetQuestionForm();
      fetchQuestions(selectedQuiz.id);
    } catch (error) { toast.error(error.response?.data?.message || t('admin.quizzes.questions.save_failed')); }
    finally { setLoading(false); }
  };

  const handleDeleteQuestion = async (question) => {
    if (!window.confirm(t('admin.quizzes.questions.delete_confirm'))) return;
    try {
      await api.delete(`/admin/quizzes/${selectedQuiz.id}/questions/${question.id}`);
      toast.success(t('common.success'));
      fetchQuestions(selectedQuiz.id);
    } catch (error) { toast.error(t('admin.quizzes.questions.delete_failed')); }
  };

  const editQuestion = (q) => {
    setEditingQuestion(q);
    setQuestionForm({
      question_text: q.question_text, question_type: q.question_type, options: q.options || ['', '', '', ''],
      correct_answer: q.correct_answer || (q.question_type === 'mcq' ? 'A' : ''), points: q.points, explanation: q.explanation || '', image_url: q.image_url || ''
    });
    setShowQuestionForm(true);
  };

  const resetQuestionForm = () => {
    setShowQuestionForm(false);
    setEditingQuestion(null);
    setQuestionForm({ question_text: '', question_type: 'mcq', options: ['', '', '', ''], correct_answer: 'A', points: 1, explanation: '', image_url: '' });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...questionForm.options];
    newOptions[index] = value;
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  return (
    <div className="space-y-6 pb-10 max-w-[1200px] mx-auto w-full px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.quizzes.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('admin.quizzes.authorized_entities')}: {quizzes.length}</p>
        </div>
        <button onClick={() => setShowQuizForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" />{t('admin.quizzes.add_btn')}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left: Quiz List */}
        <div className="xl:col-span-4 space-y-2 max-h-[700px] overflow-y-auto">
          {quizzes.length === 0 ? (
            <div className="text-center py-12 text-sm text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">{t('admin.quizzes.no_quizzes')}</div>
          ) : (
            quizzes.map((quiz) => (
              <div key={quiz.id} onClick={() => { setSelectedQuiz(quiz); setActiveSubTab('questions'); }}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedQuiz?.id === quiz.id
                    ? 'bg-[#059669] text-white border-[#059669]'
                    : 'bg-white dark:bg-[#0d0d14] border-gray-200 dark:border-gray-700 hover:border-[#059669]/30 text-gray-900 dark:text-white'
                }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className={`w-2 h-2 rounded-full ${quiz.is_published ? 'bg-emerald-400' : 'bg-gray-400'}`}></div>
                      <h3 className="text-sm font-semibold truncate">{quiz.title}</h3>
                    </div>
                    <p className="text-xs opacity-70">{quiz.course_name}</p>
                    <div className="flex gap-2 mt-1.5">
                      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-white/10"><Clock className="w-3 h-3" />{quiz.time_limit_minutes}m</span>
                      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-white/10"><Target className="w-3 h-3" />{quiz.passing_score}%</span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={(e) => handleTogglePublish(quiz, e)}
                      className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10">
                      {quiz.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); editQuiz(quiz); }}
                      className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteQuiz(quiz); }}
                      className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Workspace */}
        <div className="xl:col-span-8">
          {selectedQuiz ? (
            <div className="bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-xl">
              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedQuiz.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    selectedQuiz.is_published ? 'bg-[#059669]/10 text-[#059669]' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                  }`}>
                    {selectedQuiz.is_published ? t('admin.quizzes.published') : t('admin.quizzes.draft')}
                  </span>
                  {selectedQuiz.is_official && <span className="px-2 py-0.5 rounded text-xs bg-rose-50 dark:bg-rose-500/10 text-rose-600">{t('admin.quizzes.official_mode')}</span>}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>{selectedQuiz.course_name}</span>
                  <span>{t('admin.quizzes.attempts_label', { count: selectedQuiz.max_attempts || 1 })}</span>
                </div>
                {/* Sub-tabs */}
                <div className="flex gap-2 mt-3">
                  {[
                    { id: 'questions', label: t('admin.quizzes.questions_tab', { count: questions.length }), icon: FileText },
                    { id: 'attempts', label: t('admin.quizzes.attempts_tab', { count: attempts.length }), icon: BarChart3 }
                  ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveSubTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        activeSubTab === tab.id ? 'bg-[#059669] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}>
                      <tab.icon className="w-3.5 h-3.5" />{tab.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-5 min-h-[400px]">
                {activeSubTab === 'questions' && (
                  <QuestionBank questions={questions} setShowQuestionForm={setShowQuestionForm} editQuestion={editQuestion} handleDeleteQuestion={handleDeleteQuestion} />
                )}
                {activeSubTab === 'attempts' && <AttemptsLog attempts={attempts} selectedQuiz={selectedQuiz} />}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-sm text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
              {t('admin.quizzes.workspace_idle_title')}
            </div>
          )}
        </div>
      </div>

      {/* Quiz Form Modal */}
      {showQuizForm && (
        <QuizForm quizForm={quizForm} setQuizForm={setQuizForm} loading={loading} editingQuiz={editingQuiz} handleSaveQuiz={handleSaveQuiz} resetQuizForm={resetQuizForm} courses={courses} />
      )}

      {/* Question Form Modal */}
      {showQuestionForm && selectedQuiz && (
        <QuestionForm questionForm={questionForm} setQuestionForm={setQuestionForm} loading={loading} editingQuestion={editingQuestion} handleSaveQuestion={handleSaveQuestion} resetQuestionForm={resetQuestionForm} handleOptionChange={handleOptionChange} />
      )}
    </div>
  );
};

export default QuizManager;
