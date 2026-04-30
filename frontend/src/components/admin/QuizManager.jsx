import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  ClipboardList, Plus, Edit3, Trash2, Eye, 
  EyeOff, Clock, Target, RotateCcw, FileText, 
  LayoutDashboard, BarChart3, HelpCircle, 
  CheckCircle2, Image as ImageIcon, ChevronRight,
  Activity, Shield, Calendar, AlertCircle, X, User
} from 'lucide-react';
import QuizForm from './quizzes/QuizForm';
import QuestionBank from './quizzes/QuestionBank';
import QuestionForm from './quizzes/QuestionForm';
import AttemptsLog from './quizzes/AttemptsLog';


const QuizManager = ({ courses }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('questions');

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
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (quizId) => {
    try {
      const res = await api.get(`/admin/quizzes/${quizId}/questions`);
      setQuestions(res.data);
    } catch (error) {
      toast.error('Failed to load questions');
    }
  };

  const fetchAttempts = async (quizId) => {
    try {
      const res = await api.get(`/admin/quizzes/${quizId}/attempts`);
      setAttempts(res.data);
    } catch (error) {
      toast.error('Failed to load attempts');
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
        toast.success('Evaluation protocol updated');
      } else {
        await api.post('/admin/quizzes', payload);
        toast.success('New assessment node initialized');
      }
      resetQuizForm();
      fetchQuizzes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quiz) => {
    if (!window.confirm(`Decommission quiz "${quiz.title}"? All associated data will be purged.`)) return;
    try {
      await api.delete(`/admin/quizzes/${quiz.id}`);
      toast.success('Assessment purged successfully');
      if (selectedQuiz?.id === quiz.id) setSelectedQuiz(null);
      fetchQuizzes();
    } catch (error) {
      toast.error('Decommission failure');
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
      toast.success(newStatus ? 'Assessment synchronized to production' : 'Assessment moved to staging');
      fetchQuizzes();
    } catch (error) {
      toast.error('Synchronization failure');
    }
  };

  // ---------- Question CRUD ----------
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!selectedQuiz) return toast.error('Select an evaluation node first');
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
        toast.success('Logical probe updated');
      } else {
        await api.post(`/admin/quizzes/${selectedQuiz.id}/questions`, payload);
        toast.success('New probe successfully injected');
      }
      resetQuestionForm();
      fetchQuestions(selectedQuiz.id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Injection failure');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (question) => {
    if (!window.confirm(`Purge selected probe?`)) return;
    try {
      await api.delete(`/admin/quizzes/${selectedQuiz.id}/questions/${question.id}`);
      toast.success('Probe detached successfully');
      fetchQuestions(selectedQuiz.id);
    } catch (error) {
      toast.error('Purge failure');
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

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="animate-fadeIn pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-2 h-10 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              <ClipboardList className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Assessment Matrix
            </h2>
            <p className="text-gray-500 dark:text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Quiz Engine & Evaluation Protocol</p>
          </div>
        </div>
        <button
          onClick={() => setShowQuizForm(true)}
          className="admin-btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Initialize Quiz
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Left Sidebar: Quiz List */}
        <div className="xl:col-span-1 space-y-4 max-h-[1000px] overflow-y-auto pr-2 custom-scrollbar">
          {quizzes.length === 0 ? (
              <div className="bg-white dark:bg-[#111111]/40 border border-gray-200 dark:border-white/5 rounded-2xl text-center py-20 grayscale opacity-20 border-dashed transition-colors shadow-sm">
                  <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-white" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-white">Registry empty</p>
              </div>
          ) : (
            quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className={`group relative p-6 rounded-[2rem] border transition-all duration-500 cursor-pointer ${
                  selectedQuiz?.id === quiz.id
                    ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_20px_40px_rgba(99,102,241,0.1)]'
                    : 'bg-white dark:bg-[#111111]/40 border-gray-200 dark:border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all'
                }`}
                onClick={() => setSelectedQuiz(quiz)}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-black tracking-tight truncate transition-colors ${selectedQuiz?.id === quiz.id ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-900 dark:text-white group-hover:text-indigo-600'}`}>{quiz.title}</h3>
                      <div className={`w-2 h-2 rounded-full ${quiz.is_published ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300 dark:bg-slate-700'}`}></div>
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase tracking-widest mb-4 truncate">{quiz.course_name}</p>
                    
                    <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-400/20 transition-colors">
                            <Clock className="w-2.5 h-2.5" /> {quiz.time_limit_minutes}M
                        </span>
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-400/20 transition-colors">
                            <Target className="w-2.5 h-2.5" /> {quiz.passing_score}%
                        </span>
                        {quiz.is_official && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-1 rounded-lg border border-red-400/20 transition-colors">
                              <Shield className="w-2.5 h-2.5" /> STRICT
                          </span>
                        )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={(e) => handleTogglePublish(quiz, e)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition ${
                          quiz.is_published ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 dark:bg-slate-900 text-gray-400 dark:text-slate-500'
                      }`}
                      title={quiz.is_published ? 'Sync: Live' : 'Sync: Staging'}
                    >
                      {quiz.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); editQuiz(quiz); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500 hover:text-white dark:hover:text-black transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteQuiz(quiz); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Content: Selected Quiz Workspace */}
        <div className="xl:col-span-3">
          {selectedQuiz ? (
            <div className="bg-white dark:bg-[#111111]/40 border border-gray-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl animate-fadeIn transition-colors">
              {/* Workspace Header */}
              <div className="p-10 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] transition-colors">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-4 mb-3">
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{selectedQuiz.title}</h3>
                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors ${
                                selectedQuiz.is_published ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-gray-200 dark:bg-slate-500/10 border-gray-300 dark:border-slate-500/20 text-gray-500 dark:text-slate-500'
                            }`}>
                                {selectedQuiz.is_published ? 'PROD_SYNC' : 'STAGING_DRAFT'}
                            </span>
                        </div>
                             <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                                <LayoutDashboard className="w-4 h-4" /> {selectedQuiz.course_name}
                             </span>
                             <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                                <RotateCcw className="w-4 h-4" /> {selectedQuiz.max_attempts || 1} Attempt limit
                             </span>
                             {selectedQuiz.is_official && (
                               <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-500">
                                  <Shield className="w-4 h-4" /> Official Mode
                               </span>
                             )}
                        </div>
                    </div>

                {/* Sub-tabs */}
                <div className="flex gap-2 mt-10 p-1.5 bg-gray-100 dark:bg-black/40 rounded-2xl w-fit border border-gray-200 dark:border-white/5 transition-colors">
                    <button
                        onClick={() => setActiveSubTab('questions')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeSubTab === 'questions' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-500 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        <FileText className="w-3.5 h-3.5" /> Logic Probes ({questions.length})
                    </button>
                    <button
                        onClick={() => setActiveSubTab('attempts')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeSubTab === 'attempts' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-500 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        <BarChart3 className="w-3.5 h-3.5" /> Node Sync Logs ({attempts.length})
                    </button>
                </div>
              </div>

              {/* Workspace Body */}
              <div className="p-10">
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
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#111111]/40 border border-gray-200 dark:border-white/5 border-dashed rounded-[2.5rem] py-40 text-center grayscale opacity-20 flex flex-col items-center transition-colors shadow-sm">
                <Shield className="w-24 h-24 mb-6 text-gray-400 dark:text-white" />
                <h4 className="text-lg font-black uppercase tracking-[0.5em] text-gray-900 dark:text-white">Command Node Idle</h4>
                <p className="text-xs font-bold mt-4 tracking-widest text-gray-500 dark:text-slate-300">Select an assessment node to initialize workspace.</p>
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