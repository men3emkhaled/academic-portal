import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Edit3, Trash2, ListChecks, Type, Image as ImageIcon } from 'lucide-react';

const DoctorQuestionManager = ({ quiz, onBack }) => {
  const { doctorApi } = useDoctorAuth();
  const [questions, setQuestions] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  
  const [formData, setFormData] = useState({
    question_text: '',
    question_type: 'multiple_choice',
    options: ['', '', '', ''],
    correct_answer: '0',
    points: 1,
    explanation: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [quiz.id]);

  const fetchQuestions = async () => {
    try {
      const res = await doctorApi('get', `/doctor/quizzes/${quiz.id}/questions`);
      setQuestions(res.data);
    } catch (err) {
      toast.error('Failed to load questions');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question_text.trim()) return toast.error('Question text is required');

    setLoading(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        const fileName = `${Date.now()}-${imageFile.name}`;
        const { error } = await supabase.storage
          .from('quiz-images')
          .upload(fileName, imageFile);
        if (error) throw error;
        const { data } = supabase.storage.from('quiz-images').getPublicUrl(fileName);
        imageUrl = data.publicUrl;
      }

      const payload = { ...formData };
      if (imageUrl) payload.image_url = imageUrl;
      
      // Clean up options based on type
      if (payload.question_type === 'true_false') {
        payload.options = ['True', 'False'];
        if (payload.correct_answer !== 'True' && payload.correct_answer !== 'False') {
           payload.correct_answer = 'True';
        }
      } else if (payload.question_type === 'written') {
        payload.options = [];
        payload.correct_answer = '';
      }

      if (editingQuestion) {
        if (!imageUrl) payload.image_url = editingQuestion.image_url;
        await doctorApi('put', `/doctor/quizzes/${quiz.id}/questions/${editingQuestion.id}`, payload);
        toast.success('Question updated');
      } else {
        await doctorApi('post', `/doctor/quizzes/${quiz.id}/questions`, payload);
        toast.success('Question added');
      }
      
      resetForm();
      fetchQuestions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save question');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await doctorApi('delete', `/doctor/quizzes/${quiz.id}/questions/${id}`);
      toast.success('Question deleted');
      fetchQuestions();
    } catch (err) {
      toast.error('Failed to delete question');
    }
  };

  const resetForm = () => {
    setEditingQuestion(null);
    setFormData({
      question_text: '',
      question_type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_answer: '0',
      points: 1,
      explanation: ''
    });
    setImageFile(null);
  };

  const startEdit = (q) => {
    setEditingQuestion(q);
    setFormData({
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.options || ['', '', '', ''],
      correct_answer: q.correct_answer || '0',
      points: q.points,
      explanation: q.explanation || ''
    });
    setImageFile(null);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-black">{quiz.title} - Questions</h2>
          <p className="text-sm text-gray-500 font-medium">Manage questions for this quiz</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-[2rem]">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              {editingQuestion ? <Edit3 className="text-violet-500" /> : <Plus className="text-violet-500" />}
              {editingQuestion ? 'Edit Question' : 'Add Question'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Type</label>
                <select
                  value={formData.question_type}
                  onChange={(e) => setFormData({ ...formData, question_type: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3"
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True / False</option>
                  <option value="written">Written (Manual Review)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Points</label>
                <input
                  type="number"
                  min="1"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Question Text</label>
                <textarea
                  value={formData.question_text}
                  onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 min-h-[100px]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" /> Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full text-sm"
                />
                {editingQuestion?.image_url && !imageFile && (
                  <p className="text-xs text-violet-500 mt-1">Current image will be kept if no new image is selected.</p>
                )}
              </div>

              {formData.question_type === 'multiple_choice' && (
                <div className="space-y-3 bg-gray-50 dark:bg-black/10 p-4 rounded-2xl border border-gray-200 dark:border-white/5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Options & Correct Answer</label>
                  {formData.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="correct_answer"
                        checked={formData.correct_answer === String(i)}
                        onChange={() => setFormData({ ...formData, correct_answer: String(i) })}
                        className="text-violet-500 focus:ring-violet-500"
                        title="Mark as correct answer"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(i, e.target.value)}
                        placeholder={`Option ${i + 1}`}
                        className="flex-1 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-2.5 text-sm"
                        required
                      />
                    </div>
                  ))}
                </div>
              )}

              {formData.question_type === 'true_false' && (
                <div className="space-y-3 bg-gray-50 dark:bg-black/10 p-4 rounded-2xl border border-gray-200 dark:border-white/5">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Correct Answer</label>
                  <select
                    value={formData.correct_answer}
                    onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                    className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3"
                  >
                    <option value="True">True</option>
                    <option value="False">False</option>
                  </select>
                </div>
              )}

              {formData.question_type === 'written' && (
                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-4 rounded-2xl">
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-medium flex items-start gap-2">
                    <Type className="w-4 h-4 shrink-0" />
                    Students will upload an image or type their answer. You will need to review and grade this question manually.
                  </p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-violet-500 hover:bg-violet-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Question'}
                </button>
                {editingQuestion && (
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

        <div className="xl:col-span-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[2rem] p-6 h-[800px] flex flex-col">
          <h3 className="text-xl font-black mb-6 flex items-center gap-2">
            <ListChecks className="text-violet-500" /> Question List ({questions.length})
          </h3>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full opacity-50">
                <ListChecks className="w-16 h-16 mb-4 text-gray-400" />
                <p>No questions added yet</p>
              </div>
            ) : (
              questions.map((q, idx) => (
                <div key={q.id} className="bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-2xl p-5">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 font-black w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase text-gray-500 bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded">
                            {q.question_type.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] font-bold uppercase text-emerald-600 bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 rounded">
                            {q.points} Points
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm md:text-base">{q.question_text}</h4>
                        {q.image_url && (
                          <img src={q.image_url} alt="Question" className="mt-3 rounded-lg max-h-32 object-contain border border-gray-200 dark:border-white/10" />
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => startEdit(q)} className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-500/10 rounded-lg">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(q.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {q.question_type === 'multiple_choice' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 ml-11">
                      {q.options?.map((opt, i) => (
                        <div key={i} className={`p-2 rounded-lg text-sm border ${q.correct_answer === String(i) ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold' : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300'}`}>
                          {String.fromCharCode(65 + i)}. {opt}
                        </div>
                      ))}
                    </div>
                  )}

                  {q.question_type === 'true_false' && (
                    <div className="flex gap-2 mt-4 ml-11">
                      <span className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-bold text-sm px-3 py-1.5 rounded-lg">
                        Correct: {q.correct_answer}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorQuestionManager;
