import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { CheckSquare, Plus, Edit3, Trash2, Calendar, AlertCircle } from 'lucide-react';

const DoctorTaskManager = ({ courses }) => {
  const { doctorApi } = useDoctorAuth();
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    course_id: '',
    title: '',
    description: '',
    due_date: '',
    priority: 'medium'
  });
  const [loading, setLoading] = useState(false);

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
    if (!window.confirm('Delete this task?')) return;
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
    setFormData({ course_id: '', title: '', description: '', due_date: '', priority: 'medium' });
  };

  const startEdit = (t) => {
    setEditingTask(t);
    setFormData({
      course_id: t.course_id,
      title: t.title,
      description: t.description || '',
      due_date: t.due_date ? t.due_date.split('T')[0] : '',
      priority: t.priority || 'medium'
    });
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'text-red-500 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20';
      case 'low': return 'text-green-500 bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20';
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-500/10 border-gray-200 dark:border-gray-500/20';
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="xl:col-span-1 space-y-6">
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-[2rem]">
          <h3 className="text-xl font-black mb-6 flex items-center gap-2">
            {editingTask ? <Edit3 className="text-violet-500" /> : <Plus className="text-violet-500" />}
            {editingTask ? 'Edit Task' : 'New Task'}
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
                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Due Date</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-violet-500 hover:bg-violet-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : (editingTask ? 'Update' : 'Save')}
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
          <CheckSquare className="text-violet-500" /> Active Tasks
        </h3>
        
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-50">
              <CheckSquare className="w-16 h-16 mb-4 text-gray-400" />
              <p>No tasks assigned yet</p>
            </div>
          ) : (
            tasks.map(t => (
              <div key={t.id} className="bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-violet-500 bg-violet-500/10 px-2 py-1 rounded-md">
                      {t.course_name}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md border ${getPriorityColor(t.priority)}`}>
                      {t.priority}
                    </span>
                  </div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{t.title}</h4>
                  {t.description && <p className="text-sm text-gray-500 line-clamp-2 mb-3">{t.description}</p>}
                  
                  {t.due_date && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      Due: {new Date(t.due_date).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 shrink-0">
                  <button onClick={() => startEdit(t)} className="p-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-500/10 rounded-xl transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="p-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors">
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

export default DoctorTaskManager;
