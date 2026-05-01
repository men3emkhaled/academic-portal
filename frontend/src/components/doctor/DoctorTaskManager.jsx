import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { 
  ClipboardList, Plus, Edit3, Trash2, Users, ExternalLink, 
  Calendar, CheckCircle2, Clock, ChevronLeft, Save, 
  X, AlertCircle, FileText, Search, Filter, BookOpen, Send
} from 'lucide-react';

const DoctorTaskManager = ({ courses }) => {
  const { doctorApi } = useDoctorAuth();
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTaskForSubmissions, setSelectedTaskForSubmissions] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  
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
    setShowFormModal(false);
  };

  const startEdit = (t) => {
    setEditingTask(t);
    const deadlineStr = t.deadline ? new Date(t.deadline).toISOString().slice(0, 16) : '';
    setFormData({
      course_id: t.course_id,
      title: t.title,
      description: t.description || '',
      deadline: deadlineStr,
      drive_link: t.drive_link || '',
      requires_submission: t.requires_submission || false
    });
    setShowFormModal(true);
  };

  const openSubmissions = (task) => {
    setSelectedTaskForSubmissions(task);
    fetchSubmissions(task.id);
  };

  if (selectedTaskForSubmissions) {
    return (
      <div className="space-y-8 animate-fadeIn pb-24 lg:pb-0">
        <div className="flex items-center justify-between">
            <button 
                onClick={() => { setSelectedTaskForSubmissions(null); setGradingStudent(null); }}
                className="flex items-center gap-2 text-sm font-black text-doctor-text-muted hover:text-white transition-colors group"
            >
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-doctor-primary/10 transition-all">
                    <ChevronLeft className="w-4 h-4" />
                </div>
                <span>Back to Tasks</span>
            </button>
        </div>

        <div className="bg-doctor-card border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/20">
          <div className="p-8 md:p-10 border-b border-white/5 bg-white/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
                  Submissions Tracking
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-doctor-primary bg-doctor-primary/10 px-3 py-1 rounded-full border border-doctor-primary/20">
                  {selectedTaskForSubmissions.course_name}
                </span>
              </div>
              <h3 className="text-3xl font-black text-white tracking-tight">{selectedTaskForSubmissions.title}</h3>
            </div>
            <div className="flex items-center gap-6 bg-white/5 p-6 rounded-3xl border border-white/5">
                <div className="text-right border-r border-white/10 pr-6">
                    <p className="text-[10px] font-black text-doctor-text-muted uppercase tracking-widest mb-1">Total</p>
                    <p className="text-2xl font-black text-white">{submissions.length}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-doctor-text-muted uppercase tracking-widest mb-1">Graded</p>
                    <p className="text-2xl font-black text-emerald-400">{submissions.filter(s => s.grade).length}</p>
                </div>
            </div>
          </div>

          <div className="p-4 md:p-8 overflow-x-auto">
            {submissionsLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-doctor-primary/20 border-t-doctor-primary rounded-full animate-spin"></div>
                <p className="text-doctor-text-muted font-bold text-sm">Gathering submissions...</p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Users className="w-10 h-10 text-white/10" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Submissions Yet</h3>
                <p className="text-doctor-text-muted">Students haven't submitted their work for this task yet.</p>
              </div>
            ) : (
                <table className="w-full text-left border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-doctor-text-muted">
                      <th className="px-6 pb-2 text-[10px] font-black uppercase tracking-widest">Student Info</th>
                      <th className="px-6 pb-2 text-[10px] font-black uppercase tracking-widest">Status</th>
                      <th className="px-6 pb-2 text-[10px] font-black uppercase tracking-widest">Material</th>
                      <th className="px-6 pb-2 text-[10px] font-black uppercase tracking-widest">Grade</th>
                      <th className="px-6 pb-2 text-[10px] font-black uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map(sub => (
                      <tr key={sub.student_id} className="group hover:scale-[1.01] transition-all">
                        <td className="bg-white/[0.02] px-6 py-5 rounded-l-[1.8rem] border-y border-l border-white/[0.03] group-hover:border-doctor-primary/30 group-hover:bg-doctor-primary/5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-doctor-primary/10 flex items-center justify-center font-black text-doctor-primary text-xs border border-white/10 shrink-0">
                                    {sub.avatar_url ? (
                                        <img src={sub.avatar_url} alt={sub.student_name} className="w-full h-full object-cover" />
                                    ) : (
                                        sub.student_name.charAt(0)
                                    )}
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm leading-none mb-1">{sub.student_name}</p>
                                    <p className="text-[10px] font-medium text-doctor-text-muted">ID: {sub.student_id}</p>
                                </div>
                            </div>
                        </td>
                        <td className="bg-white/[0.02] px-6 py-5 border-y border-white/[0.03] group-hover:border-doctor-primary/30 group-hover:bg-doctor-primary/5">
                          {sub.is_completed ? (
                            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-xl border border-emerald-400/20 w-fit">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-black uppercase">Completed</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-xl border border-amber-400/20 w-fit">
                              <Clock className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-black uppercase">Pending</span>
                            </div>
                          )}
                        </td>
                        <td className="bg-white/[0.02] px-6 py-5 border-y border-white/[0.03] group-hover:border-doctor-primary/30 group-hover:bg-doctor-primary/5">
                          {sub.submission_url ? (
                            <a 
                              href={sub.submission_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-doctor-primary hover:text-white font-bold text-sm flex items-center gap-2 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>View Work</span>
                            </a>
                          ) : (
                            <span className="text-xs text-doctor-text-muted font-medium italic opacity-40">No submission</span>
                          )}
                        </td>
                        <td className="bg-white/[0.02] px-6 py-5 border-y border-white/[0.03] group-hover:border-doctor-primary/30 group-hover:bg-doctor-primary/5">
                          {sub.grade ? (
                            <div className="text-sm font-black text-white bg-white/10 px-4 py-2 rounded-xl border border-white/10 w-fit shadow-inner">
                              {sub.grade}
                            </div>
                          ) : (
                            <span className="text-[10px] font-black text-doctor-text-muted uppercase">Ungraded</span>
                          )}
                        </td>
                        <td className="bg-white/[0.02] px-6 py-5 rounded-r-[1.8rem] border-y border-r border-white/[0.03] group-hover:border-doctor-primary/30 group-hover:bg-doctor-primary/5 text-right">
                          <button 
                            onClick={() => {
                              setGradingStudent(sub);
                              setGradingData({ grade: sub.grade || '', feedback: sub.feedback || '' });
                            }}
                            className="bg-doctor-primary hover:bg-doctor-primary/90 text-white font-black px-5 py-2.5 rounded-xl text-xs transition-all active:scale-95 shadow-lg shadow-doctor-primary/10"
                          >
                            Grade Now
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            )}
          </div>
        </div>

        {/* Grading Modal */}
        {gradingStudent && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="bg-doctor-card border border-white/10 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-slideUp">
              <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-black text-white">Assessment Grade</h4>
                  <p className="text-xs text-doctor-text-muted font-medium mt-1">Student: <span className="text-doctor-primary">{gradingStudent.student_name}</span></p>
                </div>
                <button onClick={() => setGradingStudent(null)} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-doctor-text-muted">
                    <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleGradeSubmission} className="p-8 space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-doctor-text-muted uppercase tracking-widest ml-1">Grade / Score</label>
                      <input 
                        type="text"
                        placeholder="e.g. 10/10 or Excellent"
                        value={gradingData.grade}
                        onChange={(e) => setGradingData({ ...gradingData, grade: e.target.value })}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-doctor-primary/50 transition-all font-bold"
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-doctor-text-muted uppercase tracking-widest ml-1">Instructor Feedback</label>
                      <textarea 
                        placeholder="Share your thoughts on the submission..."
                        value={gradingData.feedback}
                        onChange={(e) => setGradingData({ ...gradingData, feedback: e.target.value })}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-doctor-primary/50 transition-all font-medium min-h-[140px] resize-none"
                      />
                    </div>
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-doctor-primary hover:bg-doctor-primary/90 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-doctor-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  <Save className="w-5 h-5" />
                  <span>Submit Assessment</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-24 lg:pb-0">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-doctor-primary" />
            Official Tasks
          </h2>
          <p className="text-doctor-text-muted font-medium">Assign projects, homework, and research tasks to your students.</p>
        </div>
        <button 
          onClick={() => setShowFormModal(true)}
          className="bg-doctor-primary hover:bg-doctor-primary/90 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-doctor-primary/20 flex items-center gap-3 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Post New Task</span>
        </button>
      </div>

      {/* Tasks List */}
      <div className="grid grid-cols-1 gap-4">
        {tasks.length === 0 ? (
          <div className="bg-doctor-card border border-white/5 rounded-[2.5rem] p-20 text-center">
            <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                <ClipboardList className="w-10 h-10 text-white/20" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">No Active Tasks</h3>
            <p className="text-doctor-text-muted mb-8">You haven't posted any tasks yet. Keep your students busy with an assignment!</p>
            <button 
              onClick={() => setShowFormModal(true)}
              className="bg-white/5 hover:bg-white/10 text-white font-bold px-8 py-4 rounded-2xl transition-all inline-flex items-center gap-2"
            >
                <Plus className="w-5 h-5" />
                Create First Task
            </button>
          </div>
        ) : (
          tasks.map(task => {
              const isOverdue = task.deadline && new Date(task.deadline) < new Date();
              return (
                <div key={task.id} className="group relative bg-doctor-card border border-white/5 rounded-[2.2rem] p-8 hover:border-doctor-primary/30 transition-all duration-300 overflow-hidden">
                    {/* Progress Bar/Status Decorator */}
                    <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${isOverdue ? 'bg-rose-500' : 'bg-doctor-primary'} opacity-50`}></div>
                    
                    <div className="flex flex-col xl:flex-row gap-8">
                        <div className="flex-1 space-y-4">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-doctor-primary bg-doctor-primary/10 px-3 py-1 rounded-full border border-doctor-primary/20">
                                    {task.course_name}
                                </span>
                                {task.requires_submission && (
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20 flex items-center gap-1.5">
                                        <Send className="w-3 h-3" />
                                        Submissions Enabled
                                    </span>
                                )}
                                {isOverdue && (
                                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 bg-rose-400/10 px-3 py-1 rounded-full border border-rose-400/20">
                                        Deadline Passed
                                    </span>
                                )}
                            </div>
                            
                            <h4 className="text-2xl font-black text-white leading-tight group-hover:text-doctor-primary transition-colors">{task.title}</h4>
                            
                            <div className="flex flex-wrap gap-6">
                                <div className="flex items-center gap-2 text-doctor-text-muted">
                                    <Calendar className="w-4 h-4 text-doctor-primary" />
                                    <span className="text-xs font-bold uppercase tracking-wider">
                                        {task.deadline ? new Date(task.deadline).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No Deadline Set'}
                                    </span>
                                </div>
                                {task.drive_link && (
                                    <a 
                                        href={task.drive_link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-doctor-secondary hover:text-white transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Reference Link</span>
                                    </a>
                                )}
                            </div>

                            {task.description && (
                                <p className="text-sm text-doctor-text-muted font-medium line-clamp-2 italic leading-relaxed pt-2 border-t border-white/5">
                                    "{task.description}"
                                </p>
                            )}
                        </div>

                        <div className="flex flex-row xl:flex-col justify-end gap-3 shrink-0">
                            <button 
                                onClick={() => openSubmissions(task)} 
                                className="flex-1 xl:flex-none px-6 py-4 bg-doctor-primary/10 hover:bg-doctor-primary text-doctor-primary hover:text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95 border border-doctor-primary/20"
                            >
                                <Users className="w-5 h-5" />
                                <span>Submissions</span>
                            </button>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => startEdit(task)} 
                                    className="p-4 bg-white/5 hover:bg-white/10 text-amber-400 border border-white/5 rounded-2xl transition-all active:scale-90"
                                    title="Edit Task"
                                >
                                    <Edit3 className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => handleDelete(task.id)} 
                                    className="p-4 bg-white/5 hover:bg-rose-500/10 text-rose-400 border border-white/5 rounded-2xl transition-all active:scale-90"
                                    title="Delete Task"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
              );
          })
        )}
      </div>

      {/* Task Creation Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="bg-doctor-card border border-white/10 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-slideUp">
                <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <h3 className="text-xl font-black text-white">{editingTask ? 'Edit Official Task' : 'Create New Task'}</h3>
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
                                className="w-full bg-doctor-text/5 border border-doctor-text/5 rounded-2xl py-4 px-6 text-doctor-text focus:outline-none focus:border-doctor-primary/50 transition-all font-medium appearance-none"
                            >
                                <option value="" disabled className="bg-doctor-sidebar">Target Course</option>
                                {courses.map(c => (
                                    <option key={c.id} value={c.id} className="bg-doctor-sidebar">{c.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-xs font-black text-doctor-text-muted uppercase tracking-widest ml-1">Task Title</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Final Project Phase 1"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-doctor-text/5 border border-doctor-text/5 rounded-2xl py-4 px-6 text-doctor-text focus:outline-none focus:border-doctor-primary/50 transition-all font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-doctor-text-muted uppercase tracking-widest ml-1">Task Instructions</label>
                            <textarea
                                placeholder="Describe the requirements and expectations..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-doctor-text/5 border border-doctor-text/5 rounded-2xl py-4 px-6 text-doctor-text focus:outline-none focus:border-doctor-primary/50 transition-all font-medium min-h-[120px] resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-doctor-text-muted uppercase tracking-widest ml-1">Due Date & Time</label>
                                <div className="relative">
                                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-doctor-text-muted" />
                                    <input
                                        type="datetime-local"
                                        value={formData.deadline}
                                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                        className="w-full bg-doctor-text/5 border border-doctor-text/5 rounded-2xl py-4 pl-14 pr-6 text-doctor-text focus:outline-none focus:border-doctor-primary/50 transition-all font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-doctor-text-muted uppercase tracking-widest ml-1">External Link</label>
                                <div className="relative">
                                    <ExternalLink className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-doctor-text-muted" />
                                    <input
                                        type="url"
                                        placeholder="Drive/Docs link"
                                        value={formData.drive_link}
                                        onChange={(e) => setFormData({ ...formData, drive_link: e.target.value })}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:border-doctor-primary/50 transition-all font-medium"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="pt-2">
                            <label className="flex items-center gap-4 group cursor-pointer bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-doctor-primary/20 transition-all">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.requires_submission}
                                        onChange={(e) => setFormData({ ...formData, requires_submission: e.target.checked })}
                                        className="peer sr-only"
                                    />
                                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-doctor-primary"></div>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white group-hover:text-doctor-primary transition-colors">Collect Submissions</p>
                                    <p className="text-[10px] text-doctor-text-muted uppercase font-black">Enable file/link upload for students</p>
                                </div>
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
                                <span>{editingTask ? 'Update Task' : 'Publish Task'}</span>
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

export default DoctorTaskManager;
