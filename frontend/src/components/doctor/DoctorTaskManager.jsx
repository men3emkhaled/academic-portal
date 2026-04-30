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
    drive_link: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

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
    setFormData({ course_id: '', title: '', description: '', deadline: '', drive_link: '' });
  };

  const startEdit = (t) => {
    setEditingTask(t);
    setShowForm(true);
    setFormData({
      course_id: t.course_id,
      title: t.title,
      description: t.description || '',
      deadline: t.deadline ? t.deadline.split('T')[0] : '',
      drive_link: t.drive_link || ''
    });
  };

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
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
                <div className="flex gap-2 shrink-0">
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
    </div>
  );
};

export default DoctorTaskManager;
