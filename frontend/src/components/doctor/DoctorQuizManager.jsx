import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { 
  Award, Plus, Edit3, Trash2, Eye, EyeOff, 
  FileQuestion, Users, Clock, Target, CheckCircle2, 
  AlertCircle, ChevronRight, X, Save, BookOpen, Settings2,
  FileText, ArrowRight, Layers, Layout, Info
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
    <div className="max-w-[1600px] mx-auto animate-fadeIn duration-700">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#8b5cf6] via-[#7c3aed] to-[#6d28d9] p-8 md:p-12 mb-8 shadow-2xl shadow-purple-500/20">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-96 h-96 bg-purple-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
              <Award className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase leading-none">Assessment</h1>
              <div className="flex items-center gap-3 mt-3">
                <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/90 text-[10px] font-black uppercase tracking-widest">Quiz Engine v2.0</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setShowFormModal(true)}
            className="group flex items-center gap-3 bg-white text-purple-600 px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/10"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            Create New Quiz
          </button>
        </div>
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {quizzes.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/[0.03] rounded-[3rem] p-24 text-center shadow-sm">
            <div className="w-32 h-32 rounded-[2.5rem] bg-gray-50 dark:bg-white/[0.02] flex items-center justify-center mx-auto mb-8 border border-gray-100 dark:border-white/5">
              <FileText className="w-12 h-12 text-gray-300 dark:text-white/10" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4">No Assessments Active</h3>
            <p className="text-sm text-gray-500 dark:text-slate-500 max-w-sm mx-auto font-medium mb-10">You haven't initiated any quizzes yet. Create your first assessment to begin tracking student performance.</p>
            <button 
              onClick={() => setShowFormModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-black px-10 py-5 rounded-2xl shadow-xl shadow-purple-600/20 flex items-center gap-3 transition-all active:scale-95 mx-auto uppercase text-xs tracking-widest"
            >
              <Plus className="w-5 h-5" />
              Start First Quiz
            </button>
          </div>
        ) : (
          quizzes.map(quiz => (
            <div 
              key={quiz.id} 
              className={`group relative bg-white dark:bg-[#0a0a0a] border transition-all duration-500 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-purple-500/10 ${
                quiz.is_published ? 'border-emerald-500/20' : 'border-gray-100 dark:border-white/5'
              }`}
            >
              {/* Status Header */}
              <div className="p-8 pb-0">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-400/10 px-3 py-1.5 rounded-xl border border-purple-100 dark:border-purple-400/20">
                      {quiz.course_name}
                    </span>
                    {quiz.is_official && (
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500 bg-rose-50 dark:text-rose-400 dark:bg-rose-400/10 px-3 py-1.5 rounded-xl border border-rose-100 dark:border-rose-400/20">
                        Official Exam
                      </span>
                    )}
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${
                    quiz.is_published ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-50 border-gray-100 text-gray-400'
                  }`}>
                    {quiz.is_published && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>}
                    {quiz.is_published ? 'Live' : 'Draft'}
                  </div>
                </div>
                
                <h4 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight group-hover:text-purple-600 transition-colors line-clamp-1">{quiz.title}</h4>
                <p className="text-sm text-gray-500 dark:text-slate-500 mt-3 line-clamp-2 font-medium h-10">
                  {quiz.description || "No specific instructions provided for this assessment."}
                </p>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-50 dark:bg-white/[0.02] rounded-2xl p-5 border border-gray-100 dark:border-white/5 group-hover:border-purple-500/20 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-4 h-4 text-purple-500" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Duration</p>
                    </div>
                    <p className="text-lg font-black text-gray-900 dark:text-white leading-none">{quiz.time_limit_minutes} <span className="text-xs font-bold text-gray-400 uppercase">min</span></p>
                  </div>
                  <div className="bg-gray-50 dark:bg-white/[0.02] rounded-2xl p-5 border border-gray-100 dark:border-white/5 group-hover:border-emerald-500/20 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="w-4 h-4 text-emerald-500" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Passing</p>
                    </div>
                    <p className="text-lg font-black text-gray-900 dark:text-white leading-none">{quiz.passing_score} <span className="text-xs font-bold text-gray-400 uppercase">%</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedQuizForQuestions(quiz)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-purple-600/10 active:scale-95 text-[11px] uppercase tracking-widest"
                  >
                    <Layers className="w-4 h-4" />
                    Manage Questions
                  </button>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => togglePublish(quiz)} 
                      className={`p-4 rounded-2xl border transition-all active:scale-90 ${
                        quiz.is_published ? 'bg-amber-50 border-amber-100 text-amber-500' : 'bg-emerald-50 border-emerald-100 text-emerald-500'
                      }`}
                    >
                      {quiz.is_published ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <button 
                      onClick={() => startEdit(quiz)}
                      className="p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl text-gray-400 hover:text-purple-600 transition-all active:scale-90"
                    >
                      <Settings2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(quiz.id)}
                      className="p-4 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl text-rose-400 hover:bg-rose-50 transition-all active:scale-90"
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

      {/* Spacious Premium Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-slideUp flex flex-col max-h-[90vh]">
             {/* Modal Header */}
             <div className="p-8 md:p-10 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/20">
                    <Layout className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{editingQuiz ? 'Edit Config' : 'Initialize Quiz'}</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Configure assessment parameters</p>
                  </div>
                </div>
                <button onClick={resetForm} className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center text-gray-400 transition-all duration-300">
                   <X className="w-6 h-6" />
                </button>
             </div>
             
             {/* Modal Form */}
             <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 md:p-10 space-y-10 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   {/* Left Column */}
                   <div className="space-y-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Target Course</label>
                         <div className="relative group">
                            <select
                              required
                              value={formData.course_id}
                              onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                              className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-2xl py-5 px-6 text-gray-900 dark:text-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500/50 outline-none transition-all font-bold appearance-none cursor-pointer"
                            >
                               <option value="" disabled>Select target course</option>
                               {courses.map(c => (
                                 <option key={c.id} value={c.id}>{c.name}</option>
                               ))}
                            </select>
                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rotate-90 pointer-events-none" />
                         </div>
                      </div>

                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Quiz Identifier</label>
                         <input
                           type="text"
                           required
                           value={formData.title}
                           onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                           placeholder="e.g. Midterm Practice Exam"
                           className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-2xl py-5 px-6 text-gray-900 dark:text-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500/50 outline-none transition-all font-bold"
                         />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Time Limit (min)</label>
                            <div className="relative">
                               <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500" />
                               <input
                                 type="number"
                                 min="1"
                                 required
                                 value={formData.time_limit_minutes}
                                 onChange={(e) => setFormData({ ...formData, time_limit_minutes: parseInt(e.target.value) })}
                                 className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-2xl py-5 pl-14 pr-6 text-gray-900 dark:text-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500/50 outline-none transition-all font-bold"
                               />
                            </div>
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Pass Score (%)</label>
                            <div className="relative">
                               <Target className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                               <input
                                 type="number"
                                 min="1"
                                 max="100"
                                 required
                                 value={formData.passing_score}
                                 onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) })}
                                 className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-2xl py-5 pl-14 pr-6 text-gray-900 dark:text-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500/50 outline-none transition-all font-bold"
                               />
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Right Column */}
                   <div className="space-y-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Description & Rules</label>
                         <textarea
                           value={formData.description}
                           onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                           placeholder="Provide details for your students..."
                           className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-3xl py-6 px-6 text-gray-900 dark:text-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500/50 outline-none transition-all font-medium min-h-[220px] resize-none"
                         />
                      </div>

                      <div className="pt-2">
                         <label className={`flex items-center gap-5 p-6 rounded-3xl border-2 transition-all cursor-pointer ${
                           formData.is_official 
                             ? 'bg-rose-500/5 border-rose-500/30' 
                             : 'bg-gray-50 dark:bg-white/[0.03] border-transparent hover:border-gray-200 dark:hover:border-white/10'
                         }`}>
                           <div className="relative flex items-center">
                             <input
                               type="checkbox"
                               checked={formData.is_official}
                               onChange={(e) => setFormData({ ...formData, is_official: e.target.checked })}
                               className="peer sr-only"
                             />
                             <div className="w-14 h-8 bg-gray-200 dark:bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-rose-500 shadow-inner"></div>
                           </div>
                           <div>
                             <p className={`text-sm font-black uppercase tracking-tight ${formData.is_official ? 'text-rose-600' : 'text-gray-900 dark:text-white'}`}>Official Exam</p>
                             <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-0.5">Strict Grading Rules</p>
                           </div>
                           <AlertCircle className={`w-5 h-5 ml-auto ${formData.is_official ? 'text-rose-500' : 'text-gray-300'}`} />
                         </label>
                      </div>
                   </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-6 rounded-[2.5rem] shadow-2xl shadow-purple-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4 text-xs uppercase tracking-[0.2em]"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Save className="w-6 h-6" />
                        <span>{editingQuiz ? 'Confirm Updates' : 'Initialize Quiz Engine'}</span>
                      </>
                    )}
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(139, 92, 246, 0.2); 
          border-radius: 10px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
          background: rgba(139, 92, 246, 0.4); 
        }
      `}</style>
    </div>
  );
};

export default DoctorQuizManager;
