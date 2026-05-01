import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { 
  Award, Plus, Edit3, Trash2, Eye, EyeOff, 
  FileQuestion, Users, Clock, Target, CheckCircle2, 
  AlertCircle, ChevronRight, X, Save, BookOpen, Settings2
} from 'lucide-react';
import DoctorQuestionManager from './DoctorQuestionManager';

const DoctorQuizManager = ({ courses }) => {
  const { doctorApi } = useDoctorAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [selectedQuizForQuestions, setSelectedQuizForQuestions] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  
  const [formData, setFormData] = useState({
    course_id: '',
    title: '',
    description: '',
    time_limit_minutes: 30,
    passing_score: 50,
    is_official: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await doctorApi('get', '/doctor/quizzes');
      setQuizzes(res.data);
    } catch (err) {
      toast.error('Failed to load quizzes');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.course_id || !formData.title) {
      return toast.error('Course and Title are required');
    }

    setLoading(true);
    try {
      if (editingQuiz) {
        await doctorApi('put', `/doctor/quizzes/${editingQuiz.id}`, formData);
        toast.success('Quiz updated');
      } else {
        await doctorApi('post', '/doctor/quizzes', formData);
        toast.success('Quiz created');
      }
      resetForm();
      fetchQuizzes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this quiz? All associated questions and attempts will be lost.')) return;
    try {
      await doctorApi('delete', `/doctor/quizzes/${id}`);
      toast.success('Quiz deleted');
      if (selectedQuizForQuestions && selectedQuizForQuestions.id === id) {
        setSelectedQuizForQuestions(null);
      }
      fetchQuizzes();
    } catch (err) {
      toast.error('Failed to delete quiz');
    }
  };

  const togglePublish = async (quiz) => {
    try {
      await doctorApi('patch', `/doctor/quizzes/${quiz.id}/publish`, {
        is_published: !quiz.is_published
      });
      toast.success(`Quiz ${!quiz.is_published ? 'published' : 'unpublished'}`);
      fetchQuizzes();
    } catch (err) {
      toast.error('Failed to update publish status');
    }
  };

  const resetForm = () => {
    setEditingQuiz(null);
    setFormData({ course_id: '', title: '', description: '', time_limit_minutes: 30, passing_score: 50, is_official: false });
    setShowFormModal(false);
  };

  const startEdit = (q) => {
    setEditingQuiz(q);
    setFormData({
      course_id: q.course_id,
      title: q.title,
      description: q.description || '',
      time_limit_minutes: q.time_limit_minutes,
      passing_score: q.passing_score,
      is_official: q.is_official
    });
    setShowFormModal(true);
  };

  if (selectedQuizForQuestions) {
    return (
      <DoctorQuestionManager 
        quiz={selectedQuizForQuestions} 
        onBack={() => setSelectedQuizForQuestions(null)} 
      />
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
            <Award className="w-8 h-8 text-doctor-primary" />
            Quiz Management
          </h2>
          <p className="text-doctor-text-muted font-medium">Create assessments, manage questions, and track student results.</p>
        </div>
        <button 
          onClick={() => setShowFormModal(true)}
          className="bg-doctor-primary hover:bg-doctor-primary/90 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-doctor-primary/20 flex items-center gap-3 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Create New Quiz</span>
        </button>
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {quizzes.length === 0 ? (
          <div className="col-span-full bg-doctor-card border border-white/5 rounded-[2.5rem] p-20 text-center">
            <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                <Award className="w-10 h-10 text-white/20" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">No Quizzes Created</h3>
            <p className="text-doctor-text-muted mb-8">You haven't created any assessments yet. Start by creating your first quiz.</p>
            <button 
              onClick={() => setShowFormModal(true)}
              className="bg-white/5 hover:bg-white/10 text-white font-bold px-8 py-4 rounded-2xl transition-all inline-flex items-center gap-2"
            >
                <Plus className="w-5 h-5" />
                Create First Quiz
            </button>
          </div>
        ) : (
          quizzes.map(quiz => (
            <div 
              key={quiz.id} 
              className={`group relative bg-doctor-card border transition-all rounded-[2.2rem] overflow-hidden hover:shadow-2xl hover:shadow-doctor-primary/10 ${quiz.is_published ? 'border-emerald-500/20' : 'border-white/5 opacity-90 hover:opacity-100'}`}
            >
              {/* Top Banner/Status */}
              <div className={`h-2 w-full ${quiz.is_published ? 'bg-emerald-500/40' : 'bg-white/5'}`}></div>
              
              <div className="p-7 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-doctor-primary bg-doctor-primary/10 px-3 py-1 rounded-full border border-doctor-primary/20">
                        {quiz.course_name}
                      </span>
                      {quiz.is_official && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 bg-rose-400/10 px-3 py-1 rounded-full border border-rose-400/20">
                          Official Exam
                        </span>
                      )}
                    </div>
                    <h4 className="text-xl font-bold text-white truncate leading-tight group-hover:text-doctor-primary transition-colors">{quiz.title}</h4>
                  </div>
                  
                  <div className="flex items-center gap-1.5 shrink-0">
                    {quiz.is_published ? (
                      <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-xl border border-emerald-400/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Live</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-doctor-text-muted bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-widest">Draft</span>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-sm text-doctor-text-muted line-clamp-2 font-medium min-h-[40px]">
                  {quiz.description || "No description provided for this assessment."}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-3 border border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-doctor-primary/10 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-doctor-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-doctor-text-muted uppercase">Duration</p>
                      <p className="text-sm font-bold text-white">{quiz.time_limit_minutes}m</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-3 border border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Target className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-doctor-text-muted uppercase">Passing</p>
                      <p className="text-sm font-bold text-white">{quiz.passing_score}%</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-3">
                  <button 
                    onClick={() => setSelectedQuizForQuestions(quiz)}
                    className="flex-1 bg-white/5 hover:bg-doctor-primary/10 text-white hover:text-doctor-primary font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 border border-white/5 hover:border-doctor-primary/30 active:scale-95"
                  >
                    <FileQuestion className="w-4 h-4" />
                    <span>Manage Questions</span>
                  </button>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => togglePublish(quiz)} 
                      title={quiz.is_published ? "Unpublish" : "Publish"}
                      className={`p-3.5 rounded-2xl border transition-all active:scale-90 ${quiz.is_published ? 'bg-amber-400/10 border-amber-400/20 text-amber-400 hover:bg-amber-400/20' : 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400 hover:bg-emerald-400/20'}`}
                    >
                      {quiz.is_published ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <button 
                      onClick={() => startEdit(quiz)}
                      className="p-3.5 bg-white/5 border border-white/5 rounded-2xl text-doctor-text-muted hover:text-white hover:border-white/20 transition-all active:scale-90"
                    >
                      <Settings2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(quiz.id)}
                      className="p-3.5 bg-white/5 border border-white/5 rounded-2xl text-rose-400 hover:bg-rose-400/10 hover:border-rose-400/30 transition-all active:scale-90"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Creation/Editing Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-doctor-card border border-white/10 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-slideUp">
             <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <h3 className="text-xl font-black text-white">{editingQuiz ? 'Edit Quiz Settings' : 'Create New Assessment'}</h3>
                <button onClick={resetForm} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-doctor-text-muted transition-colors">
                   <X className="w-6 h-6" />
                </button>
             </div>
             
             <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto hidden-scrollbar">
                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-xs font-black text-doctor-text-muted uppercase tracking-widest ml-1">Assigned Course</label>
                      <select
                        required
                        value={formData.course_id}
                        onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-doctor-primary/50 transition-all font-medium appearance-none"
                      >
                         <option value="" disabled className="bg-doctor-sidebar">Select target course</option>
                         {courses.map(c => (
                           <option key={c.id} value={c.id} className="bg-doctor-sidebar">{c.name}</option>
                         ))}
                      </select>
                   </div>

                   <div className="space-y-2">
                      <label className="text-xs font-black text-doctor-text-muted uppercase tracking-widest ml-1">Quiz Title</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. Midterm Practice Exam"
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-doctor-primary/50 transition-all font-medium"
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-xs font-black text-doctor-text-muted uppercase tracking-widest ml-1">Instructions / Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Provide details for your students..."
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-doctor-primary/50 transition-all font-medium min-h-[100px] resize-none"
                      />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-xs font-black text-doctor-text-muted uppercase tracking-widest ml-1">Duration (min)</label>
                         <div className="relative">
                            <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-doctor-text-muted" />
                            <input
                              type="number"
                              min="1"
                              required
                              value={formData.time_limit_minutes}
                              onChange={(e) => setFormData({ ...formData, time_limit_minutes: parseInt(e.target.value) })}
                              className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:border-doctor-primary/50 transition-all font-medium"
                            />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-black text-doctor-text-muted uppercase tracking-widest ml-1">Pass Score (%)</label>
                         <div className="relative">
                            <Target className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-doctor-text-muted" />
                            <input
                              type="number"
                              min="1"
                              max="100"
                              required
                              value={formData.passing_score}
                              onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) })}
                              className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:border-doctor-primary/50 transition-all font-medium"
                            />
                         </div>
                      </div>
                   </div>

                   <div className="pt-2">
                      <label className="flex items-center gap-4 group cursor-pointer bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-rose-400/20 transition-all">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.is_official}
                            onChange={(e) => setFormData({ ...formData, is_official: e.target.checked })}
                            className="peer sr-only"
                          />
                          <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">Official Exam Mode</p>
                          <p className="text-[10px] text-doctor-text-muted uppercase font-black">Requires specific grading rules</p>
                        </div>
                        <AlertCircle className="w-4 h-4 text-doctor-text-muted ml-auto" />
                      </label>
                   </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-doctor-primary hover:bg-doctor-primary/90 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-doctor-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>{editingQuiz ? 'Update Settings' : 'Create Quiz'}</span>
                    </>
                  )}
                </button>
             </form>
          </div>
        </div>
      )}

      <style>{`
        .hidden-scrollbar::-webkit-scrollbar { display: none; }
        .hidden-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default DoctorQuizManager;
