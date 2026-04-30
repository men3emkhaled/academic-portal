import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { 
  ClipboardList, Plus, Edit3, Trash2, Users, ExternalLink, 
  Calendar, CheckCircle2, Clock, ChevronLeft, Save
} from 'lucide-react';

const DoctorTaskManager = ({ courses }) => {
  const { doctorApi } = useDoctorAuth();
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTaskForSubmissions, setSelectedTaskForSubmissions] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    course_id: '',
    title: '',
    description: '',
    deadline: '',
    drive_link: '',
    requires_submission: false
  });

  const [gradingData, setGradingData] = useState({
    grade: '',
    feedback: ''
  });
  const [gradingStudent, setGradingStudent] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await doctorApi('get', '/doctor/tasks');
      setTasks(res.data);
    } catch (err) {
      toast.error('Failed to load tasks');
    }
  };

  const fetchSubmissions = async (taskId) => {
    setSubmissionsLoading(true);
    try {
      const res = await doctorApi('get', `/doctor/tasks/${taskId}/submissions`);
      setSubmissions(res.data);
    } catch (err) {
      toast.error('Failed to load submissions');
    } finally {
      setSubmissionsLoading(false);
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
        toast.success('Task updated');
      } else {
        await doctorApi('post', '/doctor/tasks', formData);
        toast.success('Task created');
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
    if (!window.confirm('Delete this task? All student progress for this task will be lost.')) return;
    try {
      await doctorApi('delete', `/doctor/tasks/${id}`);
      toast.success('Task deleted');
      if (selectedTaskForSubmissions && selectedTaskForSubmissions.id === id) {
        setSelectedTaskForSubmissions(null);
      }
      fetchTasks();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    if (!gradingStudent || !selectedTaskForSubmissions) return;

    try {
      await doctorApi('post', `/doctor/tasks/${selectedTaskForSubmissions.id}/submissions/${gradingStudent.student_id}/grade`, gradingData);
      toast.success('Grade submitted');
      setGradingStudent(null);
      fetchSubmissions(selectedTaskForSubmissions.id);
    } catch (err) {
      toast.error('Failed to submit grade');
    }
  };

  const resetForm = () => {
    setEditingTask(null);
    setFormData({
      course_id: '',
      title: '',
      description: '',
      deadline: '',
      drive_link: '',
      requires_submission: false
    });
  };

  const startEdit = (t) => {
    setEditingTask(t);
    // Format date for datetime-local input
    const deadlineStr = t.deadline ? new Date(t.deadline).toISOString().slice(0, 16) : '';
    setFormData({
      course_id: t.course_id,
      title: t.title,
      description: t.description || '',
      deadline: deadlineStr,
      drive_link: t.drive_link || '',
      requires_submission: t.requires_submission || false
    });
  };

  const openSubmissions = (task) => {
    setSelectedTaskForSubmissions(task);
    fetchSubmissions(task.id);
  };

  if (selectedTaskForSubmissions) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <button 
          onClick={() => { setSelectedTaskForSubmissions(null); setGradingStudent(null); }}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-violet-500 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Tasks
        </button>

        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[2rem] overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-200 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                  Submissions
                </span>
                <span className="text-xs font-bold text-violet-500 bg-violet-500/10 px-2.5 py-1 rounded-lg">
                  {selectedTaskForSubmissions.course_name}
                </span>
              </div>
              <h3 className="text-2xl font-black">{selectedTaskForSubmissions.title}</h3>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-500">Total Submissions</p>
              <p className="text-2xl font-black text-violet-500">{submissions.length}</p>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {submissionsLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-12 opacity-50">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="font-bold">No submissions yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-white/10">
                      <th className="pb-4 text-xs font-bold text-gray-500 uppercase">Student</th>
                      <th className="pb-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                      <th className="pb-4 text-xs font-bold text-gray-500 uppercase">Submission</th>
                      <th className="pb-4 text-xs font-bold text-gray-500 uppercase">Grade</th>
                      <th className="pb-4 text-xs font-bold text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                    {submissions.map(sub => (
                      <tr key={sub.student_id} className="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-4">
                          <p className="font-bold">{sub.student_name}</p>
                          <p className="text-xs text-gray-500">{sub.student_id}</p>
                        </td>
                        <td className="py-4">
                          {sub.is_completed ? (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                              <Clock className="w-3.5 h-3.5" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="py-4">
                          {sub.submission_url ? (
                            <a 
                              href={sub.submission_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm font-bold text-violet-500 hover:underline flex items-center gap-1"
                            >
                              View Work <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400 italic">No link</span>
                          )}
                        </td>
                        <td className="py-4">
                          {sub.grade ? (
                            <span className="text-sm font-black text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10 px-2 py-1 rounded-md">
                              {sub.grade}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">Not graded</span>
                          )}
                        </td>
                        <td className="py-4">
                          <button 
                            onClick={() => {
                              setGradingStudent(sub);
                              setGradingData({ grade: sub.grade || '', feedback: sub.feedback || '' });
                            }}
                            className="text-xs font-bold text-violet-500 hover:text-violet-600 px-3 py-1.5 bg-violet-500/10 rounded-lg transition-colors"
                          >
                            Grade
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Grading Modal/Panel */}
        {gradingStudent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#111111] border border-white/10 rounded-[2rem] w-full max-w-md p-8 shadow-2xl animate-scaleUp">
              <h4 className="text-xl font-black mb-1">Grade Submission</h4>
              <p className="text-sm text-gray-500 mb-6">Grading <span className="font-bold text-violet-500">{gradingStudent.student_name}</span></p>
              
              <form onSubmit={handleGradeSubmission} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Grade / Points</label>
                  <input 
                    type="text"
                    placeholder="e.g. 10/10 or A+"
                    value={gradingData.grade}
                    onChange={(e) => setGradingData({ ...gradingData, grade: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Feedback</label>
                  <textarea 
                    placeholder="Provide feedback to student..."
                    value={gradingData.feedback}
                    onChange={(e) => setGradingData({ ...gradingData, feedback: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 min-h-[100px]"
                  />
                </div>
                <div className="flex gap-4 pt-2">
                  <button 
                    type="submit"
                    className="flex-1 bg-violet-500 hover:bg-violet-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Save Grade
                  </button>
                  <button 
                    type="button"
                    onClick={() => setGradingStudent(null)}
                    className="flex-1 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-bold py-3 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fadeIn">
      <div className="xl:col-span-1 space-y-6">
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-[2rem]">
          <h3 className="text-xl font-black mb-6 flex items-center gap-2">
            {editingTask ? <Edit3 className="text-violet-500 w-5 h-5" /> : <Plus className="text-violet-500 w-5 h-5" />}
            {editingTask ? 'Edit Task' : 'Add New Task'}
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
                <option value="">-- Select Course --</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Task Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Midterm Project"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Instructions</label>
              <textarea
                placeholder="Describe what students need to do..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 min-h-[100px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Deadline</label>
              <input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Resource Link (Optional)</label>
              <input
                type="url"
                placeholder="Google Drive, PDF, etc."
                value={formData.drive_link}
                onChange={(e) => setFormData({ ...formData, drive_link: e.target.value })}
                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3"
              />
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="requires_submission"
                checked={formData.requires_submission}
                onChange={(e) => setFormData({ ...formData, requires_submission: e.target.checked })}
                className="w-4 h-4 text-violet-600 rounded border-gray-300 focus:ring-violet-500"
              />
              <label htmlFor="requires_submission" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Requires File Submission
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-violet-500 hover:bg-violet-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : (editingTask ? 'Update Task' : 'Create Task')}
              </button>
              {editingTask && (
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
          <ClipboardList className="text-violet-500 w-6 h-6" /> Official Tasks
        </h3>
        
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-50">
              <ClipboardList className="w-16 h-16 mb-4 text-gray-400" />
              <p>No tasks created yet</p>
            </div>
          ) : (
            tasks.map(t => (
              <div key={t.id} className="group bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-5 hover:border-violet-300 dark:hover:border-violet-500/20 hover:shadow-md transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-violet-500 bg-violet-500/10 px-2.5 py-1 rounded-lg">
                        {t.course_name}
                      </span>
                      {t.requires_submission && (
                        <span className="text-[10px] font-bold uppercase text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md">
                          Submission Req.
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-lg truncate mb-1">{t.title}</h4>
                    
                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> 
                        {t.deadline ? new Date(t.deadline).toLocaleString() : 'No Deadline'}
                      </span>
                      {t.drive_link && (
                        <a 
                          href={t.drive_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-blue-500 hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Link
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button 
                      onClick={() => openSubmissions(t)} 
                      className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-xl transition-colors flex items-center gap-2"
                      title="View Submissions"
                    >
                      <Users className="w-4 h-4" /> 
                      <span className="text-sm font-bold hidden md:inline">Submissions</span>
                    </button>
                    <button 
                      onClick={() => startEdit(t)} 
                      className="p-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-500/10 rounded-xl transition-colors"
                      title="Edit Task"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(t.id)} 
                      className="p-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {t.description && (
                  <p className="mt-4 text-sm text-gray-500 dark:text-slate-400 line-clamp-2 italic">
                    {t.description}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorTaskManager;
