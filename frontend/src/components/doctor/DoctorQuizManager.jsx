import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { Award, Plus, Edit3, Trash2, Eye, EyeOff, FileQuestion, Users } from 'lucide-react';
import DoctorQuestionManager from './DoctorQuestionManager';

const DoctorQuizManager = ({ courses }) => {
  const { doctorApi } = useDoctorAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [selectedQuizForQuestions, setSelectedQuizForQuestions] = useState(null);
  
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
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="xl:col-span-1 space-y-6">
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-[2rem]">
          <h3 className="text-xl font-black mb-6 flex items-center gap-2">
            {editingQuiz ? <Edit3 className="text-violet-500" /> : <Plus className="text-violet-500" />}
            {editingQuiz ? 'Edit Quiz Settings' : 'Create New Quiz'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Course</label>
              <select
                required
                value={formData.course_id}
                onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3"
              >
                <option value="">-- Choose a course --</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Time (mins)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.time_limit_minutes}
                  onChange={(e) => setFormData({ ...formData, time_limit_minutes: parseInt(e.target.value) })}
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Pass Score (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={formData.passing_score}
                  onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) })}
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="is_official"
                checked={formData.is_official}
                onChange={(e) => setFormData({ ...formData, is_official: e.target.checked })}
                className="w-4 h-4 text-violet-600 rounded border-gray-300 focus:ring-violet-500"
              />
              <label htmlFor="is_official" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Mark as Official Exam
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-violet-500 hover:bg-violet-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : (editingQuiz ? 'Update Quiz' : 'Create Quiz')}
              </button>
              {editingQuiz && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-900 dark:text-white font-bold py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="xl:col-span-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[2rem] p-6 h-[700px] flex flex-col">
        <h3 className="text-xl font-black mb-6 flex items-center gap-2">
          <Award className="text-violet-500" /> My Quizzes
        </h3>
        
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {quizzes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-50">
              <Award className="w-16 h-16 mb-4 text-gray-400" />
              <p>No quizzes created yet</p>
            </div>
          ) : (
            quizzes.map(q => (
              <div key={q.id} className={`border rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${q.is_published ? 'bg-white dark:bg-white/5 border-emerald-200 dark:border-emerald-500/20 shadow-sm' : 'bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/5 opacity-80'}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-violet-500 bg-violet-500/10 px-2 py-1 rounded-md">
                      {q.course_name}
                    </span>
                    {q.is_official && (
                      <span className="text-[10px] font-bold uppercase text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-md">
                        Official
                      </span>
                    )}
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md border ${q.is_published ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' : 'text-gray-500 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                      {q.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{q.title}</h4>
                  
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500 font-medium">
                    <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                      ⏱ {q.time_limit_minutes}m
                    </span>
                    <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                      🎯 {q.passing_score}% Pass
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  <button 
                    onClick={() => setSelectedQuizForQuestions(q)} 
                    className="p-2.5 bg-violet-50 dark:bg-violet-500/10 text-violet-600 border border-violet-200 dark:border-violet-500/20 hover:bg-violet-100 dark:hover:bg-violet-500/20 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <FileQuestion className="w-4 h-4" /> 
                    <span className="text-sm font-bold hidden md:inline">Questions</span>
                  </button>
                  <button onClick={() => togglePublish(q)} className={`p-2.5 rounded-xl transition-colors ${q.is_published ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 hover:bg-emerald-100'}`}>
                    {q.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => startEdit(q)} className="p-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-500/10 rounded-xl transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(q.id)} className="p-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorQuizManager;
