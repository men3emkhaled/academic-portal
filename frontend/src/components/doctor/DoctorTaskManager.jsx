import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { ClipboardList, Plus, Edit3, Trash2, Calendar, Link as LinkIcon, ExternalLink, AlertTriangle } from 'lucide-react';

const DoctorTaskManager = ({ courses }) => {
  const { doctorApi } = useDoctorAuth();
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    course_id: '',
    title: '',
    description: '',
    deadline: '',
    drive_link: '',
    requires_submission: false
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  
  // Submissions Modal State
  const [selectedTaskForSubmissions, setSelectedTaskForSubmissions] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [gradingData, setGradingData] = useState({ grade: '', feedback: '' });
  const [gradingStudentId, setGradingStudentId] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setFetchLoading(true);
    try {
      const res = await doctorApi('get', '/doctor/tasks');
      setTasks(res.data);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.course_id || !formData.title) {
      return toast.error('Course and Title are required');
    }

    setLoading(true);
    try {
      if (editingTask) {
        await doctorApi('put', `/doctor/tasks/${editingTask.id}`, formData);
        toast.success('Task updated successfully');
      } else {
        await doctorApi('post', '/doctor/tasks', formData);
        toast.success('Task created successfully');
      }
      resetForm();
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await doctorApi('delete', `/doctor/tasks/${id}`);
      toast.success('Task deleted');
      fetchTasks();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const resetForm = () => {
    setEditingTask(null);
    setShowForm(false);
    setFormData({ course_id: '', title: '', description: '', deadline: '', drive_link: '', requires_submission: false });
  };

  const startEdit = (t) => {
    setEditingTask(t);
    setShowForm(true);
    setFormData({
      course_id: t.course_id,
      title: t.title,
      description: t.description || '',
      deadline: t.deadline ? t.deadline.split('T')[0] : '',
      drive_link: t.drive_link || '',
      requires_submission: t.requires_submission || false
    });
  };

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const viewSubmissions = async (task) => {
    setSelectedTaskForSubmissions(task);
    setSubmissionsLoading(true);
    try {
      const res = await doctorApi('get', `/doctor/tasks/${task.id}/submissions`);
      setSubmissions(res.data);
    } catch (err) {
      toast.error('Failed to load submissions');
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleGradeSubmit = async (studentId) => {
    if (!gradingData.grade) return toast.error('Grade is required');
    try {
      await doctorApi('post', `/doctor/tasks/${selectedTaskForSubmissions.id}/submissions/${studentId}/grade`, gradingData);
      toast.success('Grade submitted successfully');
      setGradingStudentId(null);
      setGradingData({ grade: '', feedback: '' });
      // Refresh submissions
      const res = await doctorApi('get', `/doctor/tasks/${selectedTaskForSubmissions.id}/submissions`);
      setSubmissions(res.data);
    } catch (err) {
      toast.error('Failed to submit grade');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-emerald-500" /> Course Tasks
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-500 mt-1">Create and manage assignments for your students</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-5 rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95 text-sm"
          >
            <Plus className="w-4 h-4" /> New Task
          </button>
        )}
      </div>

      {/* Form (slides in) */}
      {showForm && (
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 p-6 rounded-2xl animate-fadeIn">
          <h3 className="text-lg font-black mb-5 flex items-center gap-2 text-gray-900 dark:text-white">
            {editingTask ? <Edit3 className="text-emerald-500 w-5 h-5" /> : <Plus className="text-emerald-500 w-5 h-5" />}
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-500 mb-2 uppercase tracking-wider">Course *</label>
                <select
                  required
                  value={formData.course_id}
                  onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white focus:border-emerald-500/50 focus:outline-none transition-colors"
                >
                  <option value="">-- Select Course --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-500 mb-2 uppercase tracking-wider">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Assignment #3 - Data Structures"
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white focus:border-emerald-500/50 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-slate-500 mb-2 uppercase tracking-wider">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the task requirements..."
                rows={3}
                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white focus:border-emerald-500/50 focus:outline-none transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-500 mb-2 uppercase tracking-wider">Deadline</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white focus:border-emerald-500/50 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-500 mb-2 uppercase tracking-wider">Drive / Reference Link</label>
                <input
                  type="url"
                  value={formData.drive_link}
                  onChange={(e) => setFormData({ ...formData, drive_link: e.target.value })}
                  placeholder="https://drive.google.com/..."
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white focus:border-emerald-500/50 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="requires_submission"
                checked={formData.requires_submission}
                onChange={(e) => setFormData({ ...formData, requires_submission: e.target.checked })}
                className="w-4 h-4 text-emerald-500 rounded border-gray-300 focus:ring-emerald-500 dark:border-white/10 dark:bg-black/20"
              />
              <label htmlFor="requires_submission" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Requires students to submit a project link/file
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98]"
              >
                {loading ? 'Saving...' : (editingTask ? 'Update Task' : 'Create Task')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-3">
        {fetchLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-1/4 mb-3"></div>
                <div className="h-5 bg-gray-200 dark:bg-white/10 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl p-12 text-center">
            <ClipboardList className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-slate-500 font-medium">No tasks yet</p>
            <p className="text-xs text-gray-400 dark:text-slate-600 mt-1">Create your first task to get started</p>
          </div>
        ) : (
          tasks.map(t => (
            <div
              key={t.id}
              className={`bg-white dark:bg-white/[0.03] border rounded-2xl p-5 transition-all duration-300 hover:shadow-md ${
                isOverdue(t.deadline)
                  ? 'border-red-200/60 dark:border-red-500/15'
                  : 'border-gray-200/60 dark:border-white/5'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Tags Row */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                      {t.course_name}
                    </span>
                    {t.requires_submission && (
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-lg">
                        Requires Submission
                      </span>
                    )}
                    {isOverdue(t.deadline) && (
                      <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Overdue
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h4 className="font-bold text-base md:text-lg text-gray-900 dark:text-white mb-1">{t.title}</h4>
                  {t.description && (
                    <p className="text-sm text-gray-500 dark:text-slate-400 line-clamp-2 mb-3">{t.description}</p>
                  )}

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-slate-500">
                    {t.deadline && (
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(t.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                    {t.drive_link && (
                      <a
                        href={t.drive_link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 font-medium text-blue-500 hover:text-blue-600 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Reference Link
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 shrink-0">
                  {t.requires_submission && (
                    <button
                      onClick={() => viewSubmissions(t)}
                      className="p-2.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-xl transition-colors text-sm font-bold flex items-center gap-2"
                    >
                      <ClipboardList className="w-4 h-4" /> Submissions
                    </button>
                  )}
                  <button
                    onClick={() => startEdit(t)}
                    className="p-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200/60 dark:border-white/5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200/60 dark:border-white/5 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Submissions Modal */}
      {selectedTaskForSubmissions && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">Submissions</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{selectedTaskForSubmissions.title}</p>
              </div>
              <button 
                onClick={() => setSelectedTaskForSubmissions(null)}
                className="p-2 bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 rounded-xl transition-colors text-gray-500 dark:text-slate-400"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {submissionsLoading ? (
                <div className="text-center py-10 text-gray-500">Loading submissions...</div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No submissions yet for this task.</div>
              ) : (
                <div className="space-y-4">
                  {submissions.map(sub => (
                    <div key={sub.student_id} className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-5">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 dark:text-white text-lg">{sub.student_name}</h4>
                          <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">
                            Submitted on: {new Date(sub.completed_at).toLocaleString()}
                          </p>
                          
                          {sub.submission_url && (
                            <a 
                              href={sub.submission_url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" /> View Submission Work
                            </a>
                          )}
                          
                          {(sub.grade || sub.feedback) && gradingStudentId !== sub.student_id && (
                            <div className="mt-4 p-4 bg-white dark:bg-black/20 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Current Grade:</span>
                                <span className="font-black text-gray-900 dark:text-white">{sub.grade}</span>
                              </div>
                              {sub.feedback && (
                                <div>
                                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 block mb-1">Feedback:</span>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">{sub.feedback}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="w-full md:w-72 shrink-0">
                          {gradingStudentId === sub.student_id ? (
                            <div className="bg-white dark:bg-black/20 p-4 rounded-xl border border-blue-200 dark:border-blue-500/30">
                              <h5 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Evaluate Submission</h5>
                              <input 
                                type="text"
                                placeholder="Grade (e.g. 10/10, A, Pass)"
                                value={gradingData.grade}
                                onChange={(e) => setGradingData({...gradingData, grade: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-2.5 text-sm mb-3 text-gray-900 dark:text-white focus:border-blue-500/50 focus:outline-none"
                              />
                              <textarea 
                                placeholder="Feedback (Optional)"
                                value={gradingData.feedback}
                                onChange={(e) => setGradingData({...gradingData, feedback: e.target.value})}
                                rows={2}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-2.5 text-sm mb-3 text-gray-900 dark:text-white focus:border-blue-500/50 focus:outline-none resize-none"
                              />
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleGradeSubmit(sub.student_id)}
                                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold py-2 rounded-lg transition-colors"
                                >
                                  Save Grade
                                </button>
                                <button 
                                  onClick={() => setGradingStudentId(null)}
                                  className="px-3 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-700 dark:text-white text-sm font-bold rounded-lg transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button 
                              onClick={() => {
                                setGradingStudentId(sub.student_id);
                                setGradingData({ grade: sub.grade || '', feedback: sub.feedback || '' });
                              }}
                              className="w-full py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                            >
                              {sub.grade ? 'Edit Grade' : 'Grade Submission'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorTaskManager;
