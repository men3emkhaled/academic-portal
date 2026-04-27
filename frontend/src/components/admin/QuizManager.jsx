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
    end_date: ''
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
      end_date: quiz.end_date ? quiz.end_date.slice(0, 16) : ''
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
      end_date: ''
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
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <ClipboardList className="w-6 h-6 text-indigo-400" /> Assessment Matrix
            </h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Quiz Engine & Evaluation Protocol</p>
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
              <div className="admin-card text-center py-20 grayscale opacity-20 border-dashed">
                  <ClipboardList className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Registry empty</p>
              </div>
          ) : (
            quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className={`group relative p-6 rounded-[2rem] border transition-all duration-500 ${
                  selectedQuiz?.id === quiz.id
                    ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_20px_40px_rgba(99,102,241,0.1)]'
                    : 'bg-[#111111]/40 border-white/5 hover:border-white/20 hover:bg-white/[0.04]'
                }`}
                onClick={() => setSelectedQuiz(quiz)}
              >
                <div className="flex justify-between items-start gap-4 cursor-pointer">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-white tracking-tight truncate">{quiz.title}</h3>
                      <div className={`w-2 h-2 rounded-full ${quiz.is_published ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`}></div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4 truncate">{quiz.course_name}</p>
                    
                    <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded-lg border border-indigo-400/20">
                            <Clock className="w-2.5 h-2.5" /> {quiz.time_limit_minutes}M
                        </span>
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg border border-emerald-400/20">
                            <Target className="w-2.5 h-2.5" /> {quiz.passing_score}%
                        </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={(e) => handleTogglePublish(quiz, e)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition ${
                          quiz.is_published ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-500'
                      }`}
                      title={quiz.is_published ? 'Sync: Live' : 'Sync: Staging'}
                    >
                      {quiz.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); editQuiz(quiz); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-yellow-400 hover:bg-yellow-400 hover:text-black transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
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
            <div className="bg-[#111111]/40 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-sm animate-fadeIn">
              {/* Workspace Header */}
              <div className="p-10 border-b border-white/5 bg-white/[0.02]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-4 mb-3">
                            <h3 className="text-3xl font-black text-white tracking-tight">{selectedQuiz.title}</h3>
                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                                selectedQuiz.is_published ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-500/10 border-slate-500/20 text-slate-500'
                            }`}>
                                {selectedQuiz.is_published ? 'PROD_SYNC' : 'STAGING_DRAFT'}
                            </span>
                        </div>
                        <div className="flex items-center gap-6 text-slate-500">
                             <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                                <LayoutDashboard className="w-4 h-4" /> {selectedQuiz.course_name}
                             </span>
                             <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                                <RotateCcw className="w-4 h-4" /> {selectedQuiz.max_attempts || 1} Attempt limit
                             </span>
                        </div>
                    </div>
                </div>

                {/* Sub-tabs */}
                <div className="flex gap-2 mt-10 p-1.5 bg-black/40 rounded-2xl w-fit border border-white/5">
                    <button
                        onClick={() => setActiveSubTab('questions')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeSubTab === 'questions' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white'
                        }`}
                    >
                        <FileText className="w-3.5 h-3.5" /> Logic Probes ({questions.length})
                    </button>
                    <button
                        onClick={() => setActiveSubTab('attempts')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeSubTab === 'attempts' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white'
                        }`}
                    >
                        <BarChart3 className="w-3.5 h-3.5" /> Node Sync Logs ({attempts.length})
                    </button>
                </div>
              </div>

              {/* Workspace Body */}
              <div className="p-10">
                {activeSubTab === 'questions' && (
                  <div className="space-y-8 animate-fadeIn">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Probe Configuration</span>
                        </div>
                        <button
                            onClick={() => setShowQuestionForm(true)}
                            className="px-6 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all flex items-center gap-2"
                        >
                            <Plus className="w-3.5 h-3.5" /> Inject Probe
                        </button>
                    </div>

                    {questions.length === 0 ? (
                        <div className="text-center py-24 grayscale opacity-10">
                            <HelpCircle className="w-24 h-24 mx-auto mb-6" />
                            <p className="text-sm font-black uppercase tracking-[0.4em]">Grid underpopulated</p>
                        </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {questions.map((q, idx) => (
                          <div key={q.id} className="group relative bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 hover:bg-white/[0.04] hover:border-indigo-500/30 transition-all duration-300">
                             <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] font-black text-indigo-400">{idx + 1}</span>
                                    <span className="px-3 py-1 rounded-lg bg-slate-900 border border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-500">{q.question_type}</span>
                                    <span className="text-[10px] font-black text-slate-500 uppercase">Weight: {q.points}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => editQuestion(q)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 text-yellow-400 hover:bg-yellow-400 hover:text-black transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => handleDeleteQuestion(q)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-400/10 text-red-400 hover:bg-red-400 hover:text-white transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                             </div>

                             <h4 className="text-white font-black text-lg tracking-tight mb-6 leading-relaxed">{q.question_text}</h4>
                             
                             {q.image_url && (
                                <div className="mb-6 rounded-2xl overflow-hidden border border-white/10 group-hover:border-indigo-500/30 transition-all">
                                    <img src={q.image_url} alt="Probe identity" className="w-full h-40 object-cover" />
                                </div>
                             )}

                             {q.question_type === 'mcq' && q.options && (
                                <div className="grid grid-cols-1 gap-3">
                                    {q.options.map((opt, i) => {
                                        const letter = String.fromCharCode(65 + i);
                                        const isCorrect = q.correct_answer === letter;
                                        return (
                                            <div key={i} className={`flex items-center gap-4 px-5 py-3 rounded-2xl border transition-all ${
                                                isCorrect ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-black/20 border-white/5 text-slate-500'
                                            }`}>
                                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black border ${
                                                    isCorrect ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/5'
                                                }`}>{letter}</span>
                                                <span className="text-sm font-bold tracking-tight">{opt}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                             )}

                             {q.explanation && (
                                <div className="mt-8 pt-6 border-t border-white/5 flex gap-3">
                                    <HelpCircle className="w-4 h-4 text-slate-700 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs font-medium italic text-slate-500 leading-relaxed">{q.explanation}</p>
                                </div>
                             )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeSubTab === 'attempts' && (
                  <div className="overflow-x-auto animate-fadeIn">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/[0.01]">
                          <th className="py-5 px-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Node Principal</th>
                          <th className="py-5 px-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Temporal Delta</th>
                          <th className="py-5 px-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Vector Score</th>
                          <th className="py-5 px-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.03]">
                        {attempts.length === 0 ? (
                           <tr>
                                <td colSpan="4" className="text-center py-24 grayscale opacity-10">
                                    <BarChart3 className="w-20 h-20 mx-auto mb-4" />
                                    <p className="text-sm font-black uppercase tracking-[0.3em]">No sync logs detected</p>
                                </td>
                           </tr>
                        ) : (
                          attempts.map((att) => (
                            <tr key={att.id} className="group hover:bg-white/[0.02] transition-colors">
                              <td className="py-6 px-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-white font-black tracking-tight">{att.student_name}</p>
                                        <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">ID: {att.student_id}</p>
                                    </div>
                                </div>
                              </td>
                              <td className="py-6 px-6">
                                <div className="flex flex-col gap-1.5">
                                     <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2"><Clock className="w-3 h-3" /> {new Date(att.started_at).toLocaleTimeString()}</span>
                                     <span className="text-[10px] font-bold text-slate-600 uppercase flex items-center gap-2"><Calendar className="w-3 h-3" /> {new Date(att.started_at).toLocaleDateString()}</span>
                                </div>
                              </td>
                              <td className="py-6 px-6">
                                <div className="flex items-center gap-4">
                                    <span className="text-lg font-black text-white">{att.score !== null ? att.score : '--'}</span>
                                    <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-1000 ${
                                            att.percentage >= (selectedQuiz.passing_score || 50) ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                                        }`} style={{ width: `${att.percentage || 0}%` }}></div>
                                    </div>
                                    <span className={`text-xs font-black uppercase tracking-widest ${
                                        att.percentage >= (selectedQuiz.passing_score || 50) ? 'text-emerald-400' : 'text-red-400'
                                    }`}>{att.percentage !== null ? `${att.percentage}%` : '??'}</span>
                                </div>
                              </td>
                              <td className="py-6 px-8 text-right">
                                <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                                  att.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                  att.status === 'timed_out' ? 'bg-red-500/10 border-red-500/20 text-red-300' :
                                  'bg-yellow-500/10 border-yellow-500/20 text-yellow-300'
                                }`}>
                                  {att.status.replace('_', ' ')}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#111111]/40 border border-white/5 border-dashed rounded-[2.5rem] py-40 text-center grayscale opacity-20 flex flex-col items-center">
                <Shield className="w-24 h-24 mb-6" />
                <h4 className="text-lg font-black uppercase tracking-[0.5em]">Command Node Idle</h4>
                <p className="text-xs font-bold mt-4 tracking-widest">Select an assessment node to initialize workspace.</p>
            </div>
          )}
        </div>
      </div>

      {/* QUIZ FORM MODAL */}
      {showQuizForm && (
        <div className="admin-modal-backdrop" onClick={resetQuizForm}>
          <div className="bg-[#111111] border border-white/10 rounded-[2.5rem] p-12 w-full max-w-4xl shadow-2xl relative overflow-hidden animate-fadeInUp max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/10 blur-[100px] rounded-full"></div>
            
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30 text-indigo-400">
                            {editingQuiz ? <Edit3 className="w-8 h-8" /> : <Plus className="w-8 h-8" />}
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white tracking-tight">
                                {editingQuiz ? 'Recalibrate Quiz' : 'Initialize Matrix'}
                            </h3>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Core Assessment Node Identity</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSaveQuiz} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-white/[0.02] border border-white/5 rounded-[2rem]">
                        <div className="space-y-6">
                            <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Identity Matrix</h5>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Deployment Course *</label>
                                <select
                                    value={quizForm.course_id}
                                    onChange={(e) => setQuizForm({ ...quizForm, course_id: e.target.value })}
                                    className="admin-input appearance-none"
                                    required
                                >
                                    <option value="">-- Catalog Select --</option>
                                    {courses.map(c => (
                                        <option key={c.id} value={c.id}>{c.name} (S{c.semester})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Vector Title *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Logic Foundations IV"
                                    value={quizForm.title}
                                    onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                                    className="admin-input"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Constraints</h5>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Time Min *</label>
                                    <input type="number" value={quizForm.time_limit_minutes} onChange={(e) => setQuizForm({ ...quizForm, time_limit_minutes: e.target.value })} className="admin-input" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Pass % *</label>
                                    <input type="number" value={quizForm.passing_score} onChange={(e) => setQuizForm({ ...quizForm, passing_score: e.target.value })} className="admin-input" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Attempt Recurrence</label>
                                <input type="number" value={quizForm.max_attempts} onChange={(e) => setQuizForm({ ...quizForm, max_attempts: e.target.value })} className="admin-input" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Window Start</label>
                            <input type="datetime-local" value={quizForm.start_date} onChange={(e) => setQuizForm({ ...quizForm, start_date: e.target.value })} className="admin-input" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Window Termination</label>
                            <input type="datetime-local" value={quizForm.end_date} onChange={(e) => setQuizForm({ ...quizForm, end_date: e.target.value })} className="admin-input" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Deployment Rationale</label>
                        <textarea placeholder="Brief summary for students..." value={quizForm.description} onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })} className="admin-input scrollbar-hide" rows="3" />
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button type="submit" disabled={loading} className="flex-1 admin-btn-primary h-[70px] font-black uppercase tracking-widest">
                            {loading ? <Activity className="w-6 h-6 animate-spin mx-auto" /> : (editingQuiz ? 'APPLY RECALIBRATION' : 'DEPLOY PROTOCOL')}
                        </button>
                        <button type="button" onClick={resetQuizForm} className="px-12 admin-btn-secondary h-[70px] font-bold uppercase">ABORT</button>
                    </div>
                </form>
            </div>
          </div>
        </div>
      )}

      {/* QUESTION FORM MODAL */}
      {showQuestionForm && selectedQuiz && (
        <div className="admin-modal-backdrop" onClick={resetQuestionForm}>
          <div className="bg-[#111111] border border-white/10 rounded-[2.5rem] p-12 w-full max-w-4xl shadow-2xl relative overflow-hidden animate-fadeInUp max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/10 blur-[100px] rounded-full"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-5 mb-10">
                    <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30 text-indigo-400">
                        <HelpCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-white tracking-tight">
                            {editingQuestion ? 'Edit Probe' : 'New Probe Injection'}
                        </h3>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Logical Assessment Component</p>
                    </div>
                </div>

                <form onSubmit={handleSaveQuestion} className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Probe Payload *</label>
                        <textarea placeholder="Target question data..." value={questionForm.question_text} onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })} className="admin-input scrollbar-hide" rows="4" required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Visual Identity (URL)</label>
                            <div className="relative">
                                <input type="text" placeholder="https://..." value={questionForm.image_url} onChange={(e) => setQuestionForm({ ...questionForm, image_url: e.target.value })} className="admin-input pl-12" />
                                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Logic Type</label>
                            <select value={questionForm.question_type} onChange={(e) => setQuestionForm({ ...questionForm, question_type: e.target.value })} className="admin-input appearance-none">
                                <option value="mcq">MULTIPLE_CHOICE (MCQ)</option>
                                <option value="true_false">BOOLEAN (T/F)</option>
                                <option value="written">WRITTEN_PROTOCOL</option>
                            </select>
                        </div>
                    </div>

                    {questionForm.question_type === 'mcq' && (
                        <div className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4 animate-fadeIn">
                             <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Response Grid</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {questionForm.options.map((opt, idx) => {
                                    const letter = String.fromCharCode(65 + idx);
                                    return (
                                        <div key={idx} className="relative group">
                                            <input
                                                type="text"
                                                value={opt}
                                                onChange={(e) => handleOptionChange(idx, e.target.value)}
                                                className="admin-input pl-12"
                                                placeholder={`Option ${letter}`}
                                                required
                                            />
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-indigo-400/50 group-hover:text-indigo-400 transition-colors">{letter}</span>
                                        </div>
                                    );
                                })}
                             </div>
                             <div className="pt-4 space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Correct Signal</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['A', 'B', 'C', 'D'].map(letter => (
                                        <button
                                            key={letter}
                                            type="button"
                                            onClick={() => setQuestionForm({ ...questionForm, correct_answer: letter })}
                                            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                questionForm.correct_answer === letter ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-white/5 text-slate-500 border-white/5'
                                            }`}
                                        >
                                            Node {letter}
                                        </button>
                                    ))}
                                </div>
                             </div>
                        </div>
                    )}

                    {questionForm.question_type === 'true_false' && (
                        <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                            <button
                                type="button"
                                onClick={() => setQuestionForm({ ...questionForm, correct_answer: 'true' })}
                                className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                    questionForm.correct_answer === 'true' ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-white/5 text-slate-500 border-white/5'
                                }`}
                            >
                                SIGNAL_POSITIVE
                            </button>
                            <button
                                type="button"
                                onClick={() => setQuestionForm({ ...questionForm, correct_answer: 'false' })}
                                className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                    questionForm.correct_answer === 'false' ? 'bg-red-500 text-white border-red-500' : 'bg-white/5 text-slate-500 border-white/5'
                                }`}
                            >
                                SIGNAL_NEGATIVE
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Probe Weight</label>
                            <input type="number" value={questionForm.points} onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) || 1 })} className="admin-input" min="1" required />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Resolution Explanation</label>
                            <input type="text" placeholder="Why is this signal correct?" value={questionForm.explanation} onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })} className="admin-input" />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button type="submit" disabled={loading} className="flex-1 admin-btn-primary h-[70px] font-black uppercase tracking-widest">
                            {loading ? <Activity className="w-6 h-6 animate-spin mx-auto" /> : (editingQuestion ? 'APPLY OVERWRITE' : 'COMMIT INJECTION')}
                        </button>
                        <button type="button" onClick={resetQuestionForm} className="px-12 admin-btn-secondary h-[70px] font-bold uppercase">ABORT</button>
                    </div>
                </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizManager;