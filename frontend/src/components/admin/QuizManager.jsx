import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  ClipboardList, Plus, Edit3, Trash2, Eye, 
  EyeOff, Clock, Target, RotateCcw, FileText, 
  LayoutDashboard, BarChart3, HelpCircle, 
  CheckCircle2, Image as ImageIcon, ChevronRight,
  Activity, Shield, Calendar, AlertCircle, X, User,
  CheckSquare, Filter, Search, Award, ExternalLink, Hash, Database
} from 'lucide-react';
import QuizForm from './quizzes/QuizForm';
import QuestionBank from './quizzes/QuestionBank';
import QuestionForm from './quizzes/QuestionForm';
import AttemptsLog from './quizzes/AttemptsLog';
import PendingReviews from './quizzes/PendingReviews';

const QuizManager = ({ courses }) => {
  const { t } = useTranslation();
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

  return (
    <div className="animate-in fade-in duration-700 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-inner">
            <ClipboardList className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {t('admin.quizzes.title')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold mt-1">{t('admin.quizzes.description')}</p>
          </div>
        </div>
        <div className="flex gap-3">
            <button
                onClick={() => setShowQuizForm(true)}
                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
            >
                <Plus className="w-4 h-4" /> {t('admin.quizzes.add_btn')}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Left Sidebar: Quiz List */}
        <div className="xl:col-span-1 space-y-4 max-h-[850px] overflow-y-auto pr-2 no-scrollbar">
          <button 
            onClick={() => setSelectedQuiz(null)}
            className={`w-full text-left p-6 rounded-[2rem] border transition-all duration-300 flex items-center gap-4 ${
                !selectedQuiz
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-xl'
                : 'bg-white/50 dark:bg-[#111]/50 text-gray-500 border-gray-200 dark:border-white/10 hover:bg-indigo-500/10'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-black text-sm uppercase tracking-widest">{t('admin.quizzes.all_quizzes_tab')}</span>
          </button>

          <div className="h-px bg-gray-200 dark:bg-white/5 my-4 mx-4"></div>

          {quizzes.length === 0 ? (
              <div className="bg-white/50 dark:bg-black/20 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-[2rem] py-20 text-center opacity-40">
                  <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{t('admin.quizzes.no_quizzes')}</p>
              </div>
          ) : (
            quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className={`group relative p-6 rounded-[2rem] border transition-all duration-500 cursor-pointer ${
                  selectedQuiz?.id === quiz.id
                    ? 'bg-indigo-500/10 border-indigo-500 shadow-lg'
                    : 'bg-white/80 dark:bg-[#111]/80 border-gray-100 dark:border-white/10 hover:border-indigo-500/30 hover:bg-indigo-500/5'
                }`}
                onClick={() => { setSelectedQuiz(quiz); setActiveSubTab('questions'); }}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-black tracking-tight truncate transition-colors text-sm ${selectedQuiz?.id === quiz.id ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-900 dark:text-white group-hover:text-indigo-600'}`}>{quiz.title}</h3>
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${quiz.is_published ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-500 font-bold uppercase tracking-widest mb-4 truncate">{quiz.course_name}</p>
                    
                    <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-400/20">
                            <Clock className="w-2.5 h-2.5" /> {t('admin.quizzes.time_limit', { count: quiz.time_limit_minutes })}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-400/20">
                            <Target className="w-2.5 h-2.5" /> {t('admin.quizzes.passing_score', { count: quiz.passing_score })}
                        </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={(e) => handleTogglePublish(quiz, e)}
                      className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${
                          quiz.is_published ? 'bg-emerald-500/20 text-emerald-600' : 'bg-gray-100 dark:bg-black text-gray-400'
                      }`}
                    >
                      {quiz.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); editQuiz(quiz); }}
                      className="w-8 h-8 flex items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteQuiz(quiz); }}
                      className="w-8 h-8 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Content: Workspace */}
        <div className="xl:col-span-3">
          {selectedQuiz ? (
            <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Workspace Header */}
              <div className="p-10 border-b border-gray-100 dark:border-white/10 bg-gray-50/30 dark:bg-white/[0.01]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{selectedQuiz.title}</h3>
                            <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                selectedQuiz.is_published 
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-inner' 
                                : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-400'
                            }`}>
                                {selectedQuiz.is_published ? t('admin.quizzes.published') : t('admin.quizzes.draft')}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-6">
                             <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                <LayoutDashboard className="w-4 h-4 text-indigo-500/50" /> {selectedQuiz.course_name}
                             </div>
                             <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                <RotateCcw className="w-4 h-4 text-indigo-500/50" /> {t('admin.quizzes.attempts_label', { count: selectedQuiz.max_attempts || 1 })}
                             </div>
                             {selectedQuiz.is_official && (
                               <div className="flex items-center gap-2 text-xs font-black text-rose-600 dark:text-rose-500 uppercase tracking-widest">
                                  <Shield className="w-4 h-4" /> {t('admin.quizzes.official_mode')}
                               </div>
                             )}
                        </div>
                    </div>
                </div>

                {/* Sub-tabs */}
                <div className="flex flex-wrap gap-2 mt-10 p-1.5 bg-gray-100/50 dark:bg-black/40 rounded-2xl w-fit border border-gray-200 dark:border-white/10">
                    <button
                        onClick={() => setActiveSubTab('questions')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeSubTab === 'questions' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-500 hover:text-indigo-600'
                        }`}
                    >
                        <FileText className="w-3.5 h-3.5" /> {t('admin.quizzes.questions_tab', { count: questions.length })}
                    </button>
                    <button
                        onClick={() => setActiveSubTab('attempts')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeSubTab === 'attempts' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-500 hover:text-indigo-600'
                        }`}
                    >
                        <BarChart3 className="w-3.5 h-3.5" /> {t('admin.quizzes.attempts_tab', { count: attempts.length })}
                    </button>
                    <button
                        onClick={() => setActiveSubTab('reviews')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeSubTab === 'reviews' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-gray-500 hover:text-emerald-600'
                        }`}
                    >
                        <CheckSquare className="w-3.5 h-3.5" /> {t('admin.quizzes.reviews_tab')}
                    </button>
                </div>
              </div>

              {/* Workspace Body */}
              <div className="p-10 min-h-[600px]">
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
              </div>
            </div>
          ) : (
            <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border-2 border-dashed border-gray-200 dark:border-white/10 rounded-[3rem] py-48 text-center flex flex-col items-center group transition-all duration-500">
                <div className="w-24 h-24 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                    <ClipboardList className="w-12 h-12 text-indigo-400 opacity-50" />
                </div>
                <h4 className="text-xl font-black uppercase tracking-[0.3em] text-gray-900 dark:text-white">{t('admin.quizzes.workspace_idle_title')}</h4>
                <p className="text-sm font-bold mt-4 tracking-widest text-gray-500 max-w-xs">{t('admin.quizzes.workspace_idle_desc')}</p>
            </div>
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
    </div>
  );
};

export default QuizManager;