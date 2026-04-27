import React, { useState, useEffect } from 'react';
import { CheckSquare, Edit, Trash2 } from 'lucide-react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useStudentData } from '../context/StudentDataContext';
import { useNavigate } from 'react-router-dom';
import studentApi from '../services/studentApi';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';

const StudentPersonalTasks = () => {
  const { student, logout } = useStudentAuth();
  const { tasks, setTasks, loadingTasks, fetchTasks } = useStudentData();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '' });

  const loading = loadingTasks;

  const handleLogout = () => {
    logout();
    navigate('/student/login');
    toast.success('Logged out successfully');
  };

  useEffect(() => {
    if (!student) {
      navigate('/student/login');
    }
  }, [student, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    try {
      if (editingTask) {
        await studentApi.put(`/student/personal-tasks/${editingTask.id}`, {
          title: formData.title,
          description: formData.description,
          is_completed: editingTask.is_completed,
          order_index: editingTask.order_index
        });
        toast.success('Task updated');
      } else {
        await studentApi.post('/student/personal-tasks', {
          title: formData.title,
          description: formData.description
        });
        toast.success('Task added');
      }
      resetForm();
      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleToggle = async (taskId, currentStatus) => {
    try {
      await studentApi.patch(`/student/personal-tasks/${taskId}/toggle`, {
        is_completed: !currentStatus
      });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, is_completed: !currentStatus } : t));
      toast.success(currentStatus ? 'Marked as incomplete' : 'Completed!');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await studentApi.delete(`/student/personal-tasks/${taskId}`);
      setTasks(tasks.filter(t => t.id !== taskId));
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const editTask = (task) => {
    setEditingTask(task);
    setFormData({ title: task.title, description: task.description || '' });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingTask(null);
    setFormData({ title: '', description: '' });
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-[#050505] transition-colors duration-500 overflow-hidden relative">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative flex items-center justify-center w-20 h-20 mb-6">
            <div className="absolute inset-0 border-4 border-emerald-500/20 dark:border-emerald-500/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center animate-pulse">
                <span className="text-xl font-black text-emerald-500">Z</span>
            </div>
          </div>
          <p className="text-gray-900 dark:text-white font-black text-[10px] uppercase tracking-[0.4em] mb-1 animate-pulse">ZNU PORTAL</p>
          <p className="text-gray-500 dark:text-gray-400 font-bold text-xs tracking-wide">جاري تحميل الجلسة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark text-gray-900 dark:text-white font-body transition-colors duration-300">
      <Sidebar onLogout={handleLogout} />
      <div className="md:ml-64 pb-24 md:pb-8">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-headline text-4xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-white/70 leading-tight pb-2 mb-2">
              <span className="flex items-center gap-3"><CheckSquare className="w-8 h-8 text-primary" /> My Tasks</span>
            </h1>
            <button
              onClick={() => { setShowForm(true); setEditingTask(null); setFormData({ title: '', description: '' }); }}
              className="bg-primary text-white dark:text-dark px-5 py-3 rounded-xl font-headline font-bold shadow-[0_4px_15px_rgba(46,204,113,0.3)] dark:shadow-none hover:shadow-[0_8px_20px_rgba(46,204,113,0.4)] dark:hover:shadow-[0_0_20px_rgba(142,255,113,0.4)] hover:scale-105 active:scale-95 transition-all duration-300"
            >
              + Add Task
            </button>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-16 bg-white/50 dark:bg-dark-glass/50 backdrop-blur-md rounded-[2rem] border border-dashed border-gray-300 dark:border-white/10 shadow-sm dark:shadow-inner">
              <p className="text-gray-500 dark:text-gray-400">No personal tasks yet. Create your first task!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`relative overflow-hidden group bg-white dark:bg-dark-card border border-gray-200 dark:border-white/5 rounded-[1.5rem] p-5 flex items-center gap-5 hover:border-primary/40 dark:hover:border-primary/40 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(46,204,113,0.1)] dark:hover:shadow-[0_10px_30px_rgba(142,255,113,0.1)] shadow-sm dark:shadow-none transition-all duration-300 ${
                    task.is_completed ? 'opacity-60 grayscale-[0.5]' : ''
                  }`}
                >
                  <button
                    onClick={() => handleToggle(task.id, task.is_completed)}
                    className="flex items-center justify-center hover:scale-110 active:scale-95 hover:shadow-[0_0_15px_rgba(46,204,113,0.5)] dark:hover:shadow-[0_0_15px_rgba(142,255,113,0.5)] rounded-full transition-all"
                  >
                    {task.is_completed ? (
                      <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                      </svg>
                    )}
                  </button>
                  <div className="flex-1">
                    <h4 className={`font-headline font-bold text-gray-900 dark:text-white ${task.is_completed ? 'line-through decoration-primary/40' : ''}`}>
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{task.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editTask(task)} className="text-yellow-500 dark:text-yellow-400 text-lg hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(234,179,8,0.5)] dark:hover:drop-shadow-[0_0_8px_rgba(250,204,21,0.5)] transition-all"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(task.id)} className="text-red-500 dark:text-red-400 text-lg hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] dark:hover:drop-shadow-[0_0_8px_rgba(248,113,113,0.5)] transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showForm && (
            <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm text-gray-900 dark:text-white font-body flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-dark-card border border-primary/20 dark:border-primary/30 shadow-2xl relative overflow-hidden rounded-2xl p-6 w-full max-w-md">
                <h3 className="text-xl font-bold text-primary mb-4">
                  {editingTask ? 'Edit Task' : 'New Task'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Task title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-dark text-gray-900 dark:text-white border border-gray-200 dark:border-white/20 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/50 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    required
                  />
                  <textarea
                    placeholder="Description (optional)"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-dark text-gray-900 dark:text-white border border-gray-200 dark:border-white/20 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/50 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="flex-1 bg-primary text-white dark:text-dark font-bold py-3 rounded-xl shadow-[0_4px_15px_rgba(46,204,113,0.3)] dark:shadow-none hover:shadow-[0_0_15px_rgba(46,204,113,0.4)] dark:hover:shadow-[0_0_15px_rgba(142,255,113,0.4)] transition-all">
                      Save
                    </button>
                    <button type="button" onClick={resetForm} className="px-5 py-3 bg-gray-100 dark:bg-transparent border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-inner rounded-xl hover:bg-gray-200 dark:hover:bg-white/5 transition-all text-gray-700 dark:text-white font-bold">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .font-headline { font-family: 'Manrope', 'Inter', sans-serif; }
        .bg-dark-glass { background: rgba(17, 17, 17, 0.7); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
      `}</style>
    </div>
  );
};

export default StudentPersonalTasks;