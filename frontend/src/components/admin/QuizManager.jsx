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
    <div className="space-y-16 lg:space-y-24 animate-in fade-in duration-700 pb-20 max-w-[1500px] mx-auto w-full">
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10 text-start">
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2cfc7d]"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30">{t('admin.sidebar.tabs.quizzes')}</span>
          </div>
          <h1 className="text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-[0.95] tracking-tighter uppercase text-gray-900 dark:text-white">
            {t('admin.quizzes.title')}
          </h1>
        </div>

        <div className="flex gap-4 flex-wrap">
           <div className="bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white p-8 rounded-[2.5rem] shadow-lg shadow-purple-600/20 flex flex-col justify-between relative overflow-hidden group min-w-[240px]">
              <div className="absolute inset-inline-end-0 top-0 w-24 h-24 bg-white/10 hidden rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="flex justify-between items-start relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-black/10 px-3 py-1 rounded-full">{t('admin.quizzes.active_registry')}</span>
              </div>
              <div className="mt-4 relative z-10 text-start">
                <p className="text-5xl font-black tracking-tighter">{quizzes.length}</p>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">{t('admin.quizzes.authorized_entities')}</p>
              </div>
           </div>

           <button
             onClick={() => setShowQuizForm(true)}
             className="group bg-black dark:bg-white text-white dark:text-black rounded-[2.5rem] p-8 flex flex-col justify-between items-start gap-10 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl relative overflow-hidden min-w-[200px]"
           >
             <div className="absolute inset-0 bg-[#8b5cf6] opacity-0 group-hover:opacity-10 transition-opacity" />
             <div className="w-14 h-14 bg-white/10 dark:bg-black/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-90 transition-all duration-700 relative z-10">
                <Plus className="w-8 h-8" />
             </div>
             <div className="relative z-10 text-start">
                <span className="block text-xl font-black uppercase tracking-tighter leading-none text-white dark:text-black">{t('admin.quizzes.add_btn')}</span>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 italic mt-2 block">{t('admin.quizzes.identity_registration')}</span>
             </div>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Left Sidebar: Quiz List */}
        <div className="xl:col-span-4 space-y-6 max-h-[900px] overflow-y-auto pr-4 custom-scrollbar">
          <button 
            onClick={() => setSelectedQuiz(null)}
            className={`w-full text-start p-8 rounded-[2.5rem] border transition-all duration-500 flex items-center justify-between group ${
                !selectedQuiz
                ? 'bg-black dark:bg-white text-white dark:text-black border-black shadow-2xl'
                : 'bg-white dark:bg-white/[0.02] text-gray-500 border-gray-100 dark:border-white/5 hover:border-[#8b5cf6]/30 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-5">
               <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${!selectedQuiz ? 'bg-white/10 dark:bg-black/10' : 'bg-gray-50 dark:bg-black/40 text-gray-400 group-hover:text-[#8b5cf6]'}`}>
                  <LayoutDashboard className="w-6 h-6" />
               </div>
               <span className="font-black text-sm uppercase tracking-widest">{t('admin.quizzes.all_quizzes_tab')}</span>
            </div>
            <ChevronRight className={`w-5 h-5 opacity-20 group-hover:opacity-100 transition-all rtl:rotate-180`} />
          </button>

          <div className="flex items-center gap-4 px-6 opacity-20">
             <div className="h-px bg-gray-400 flex-1"></div>
             <span className="text-[9px] font-black uppercase tracking-[0.4em]">{t('admin.quizzes.registry_stream')}</span>
             <div className="h-px bg-gray-400 flex-1"></div>
          </div>

          {quizzes.length === 0 ? (
              <div className="bg-white/50 dark:bg-black/20 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[3rem] py-32 text-center opacity-20 shadow-inner">
                  <ClipboardList className="w-16 h-16 mx-auto mb-6 text-gray-400" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{t('admin.quizzes.no_quizzes')}</p>
              </div>
          ) : (
            quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className={`group relative p-8 rounded-[3rem] border transition-all duration-700 cursor-pointer text-start ${
                  selectedQuiz?.id === quiz.id
                    ? 'bg-[#8b5cf6] text-white border-[#8b5cf6] shadow-2xl shadow-purple-500/20'
                    : 'bg-white dark:bg-[#0d0d14] border-gray-100 dark:border-white/5 hover:border-[#8b5cf6]/40 hover:bg-[#8b5cf6]/[0.02] shadow-sm'
                }`}
                onClick={() => { setSelectedQuiz(quiz); setActiveSubTab('questions'); }}
              >
                <div className="flex justify-between items-start gap-6 relative z-10">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                       <div className={`w-2 h-2 rounded-full flex-shrink-0 ${quiz.is_published ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-gray-300 dark:bg-white/10'}`}></div>
                       <h3 className="font-black tracking-tighter text-2xl uppercase leading-none truncate transition-colors">{quiz.title}</h3>
                    </div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-6 truncate ${selectedQuiz?.id === quiz.id ? 'text-white/60' : 'text-gray-400'}`}>{quiz.course_name}</p>
                    
                    <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border transition-colors ${selectedQuiz?.id === quiz.id ? 'bg-white/10 border-white/20 text-white' : 'bg-[#8b5cf6]/5 border-[#8b5cf6]/10 text-[#8b5cf6]'}`}>
                            <Clock className="w-3 h-3" /> {quiz.time_limit_minutes}m
                        </span>
                        <span className={`inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border transition-colors ${selectedQuiz?.id === quiz.id ? 'bg-white/10 border-white/20 text-white' : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500'}`}>
                            <Target className="w-3 h-3" /> {quiz.passing_score}%
                        </span>
                    </div>
                  </div>

                  <div className={`flex flex-col gap-2 transition-all duration-500 ${selectedQuiz?.id === quiz.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <button
                      onClick={(e) => handleTogglePublish(quiz, e)}
                      className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all shadow-sm ${
                          quiz.is_published 
                          ? (selectedQuiz?.id === quiz.id ? 'bg-white/20 text-white border border-white/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10') 
                          : 'bg-black/5 dark:bg-white/5 text-gray-400'
                      }`}
                    >
                      {quiz.is_published ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); editQuiz(quiz); }}
                      className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all shadow-sm ${selectedQuiz?.id === quiz.id ? 'bg-white/10 text-white border border-white/10' : 'bg-amber-500/10 text-amber-500 border border-amber-500/10'}`}
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteQuiz(quiz); }}
                      className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all shadow-sm ${selectedQuiz?.id === quiz.id ? 'bg-rose-500/20 text-white border border-rose-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/10'}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Content: Workspace */}
        <div className="xl:col-span-8 text-start">
          {selectedQuiz ? (
            <div className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[3.5rem] overflow-hidden shadow-sm animate-in fade-in slide-in-from-right-8 duration-700 h-full flex flex-col">
              {/* Workspace Header */}
              <div className="p-12 border-b border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.01]">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10 text-start">
                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center gap-6">
                            <h3 className="text-[clamp(1.5rem,3vw,3rem)] font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">{selectedQuiz.title}</h3>
                            <span className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all shadow-sm ${
                                selectedQuiz.is_published 
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 dark:text-emerald-500' 
                                : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-400'
                            }`}>
                                {selectedQuiz.is_published ? t('admin.quizzes.published') : t('admin.quizzes.draft')}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-8">
                             <div className="flex items-center gap-3 text-xs font-black text-gray-400 dark:text-white/40 uppercase tracking-widest italic">
                                <LayoutDashboard className="w-5 h-5 text-[#8b5cf6]" /> {selectedQuiz.course_name}
                             </div>
                             <div className="flex items-center gap-3 text-xs font-black text-gray-400 dark:text-white/40 uppercase tracking-widest italic">
                                <RotateCcw className="w-5 h-5 text-[#8b5cf6]" /> {t('admin.quizzes.attempts_label', { count: selectedQuiz.max_attempts || 1 })}
                             </div>
                             {selectedQuiz.is_official && (
                               <div className="flex items-center gap-3 text-xs font-black text-rose-600 dark:text-rose-500 uppercase tracking-widest italic">
                                  <Shield className="w-5 h-5" /> {t('admin.quizzes.official_mode')}
                                </div>
                             )}
                        </div>
                    </div>
                </div>

                {/* Sub-tabs Matrix */}
                <div className="flex flex-wrap gap-4 mt-12">
                    {[
                      { id: 'questions', label: t('admin.quizzes.questions_tab', { count: questions.length }), icon: FileText },
                      { id: 'attempts', label: t('admin.quizzes.attempts_tab', { count: attempts.length }), icon: BarChart3 },
                      { id: 'reviews', label: t('admin.quizzes.reviews_tab'), icon: CheckSquare }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id)}
                        className={`group flex items-center gap-4 px-10 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden ${
                            activeSubTab === tab.id 
                            ? 'bg-black dark:bg-white text-white dark:text-black shadow-2xl scale-[1.02]' 
                            : 'bg-white dark:bg-[#0d0d14] text-gray-500 border border-gray-100 dark:border-white/5 hover:border-[#8b5cf6]/30'
                        }`}
                      >
                          <div className={`transition-colors ${activeSubTab === tab.id ? 'text-white dark:text-black' : 'text-gray-400 group-hover:text-[#8b5cf6]'}`}>
                             <tab.icon className="w-5 h-5" />
                          </div>
                          {tab.label}
                      </button>
                    ))}
                </div>
              </div>

              {/* Workspace Body */}
              <div className="p-12 min-h-[700px] text-start">
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
            <div className="bg-white dark:bg-[#0d0d14] border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[4rem] py-60 text-center flex flex-col items-center group transition-all duration-700 h-full justify-center shadow-inner">
                <div className="w-32 h-32 bg-[#8b5cf6]/5 dark:bg-[#8b5cf6]/10 rounded-full flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-700 relative">
                    <div className="absolute inset-0 bg-[#8b5cf6] blur-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    <ClipboardList className="w-16 h-16 text-[#8b5cf6] opacity-40 relative z-10" />
                </div>
                <h4 className="text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white leading-none mb-6">{t('admin.quizzes.workspace_idle_title')}</h4>
                <p className="text-xs font-black mt-2 tracking-[0.3em] text-gray-400 uppercase max-w-sm italic opacity-40">{t('admin.quizzes.workspace_idle_desc')}</p>
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