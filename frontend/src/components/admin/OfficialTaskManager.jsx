import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  CheckSquare, Plus, Trash2, Edit, ExternalLink, 
  BookOpen, Calendar, Link as LinkIcon, Search, Filter, Layers 
} from 'lucide-react';

const OfficialTaskManager = ({ courses = [], departments = [] }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');

  const [formData, setFormData] = useState({
    course_id: '',
    department_id: '',
    title: '',
    description: '',
    drive_link: '',
    deadline: ''
  });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await api.get('/official-tasks/admin');
      setTasks(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.course_id || !formData.title || !formData.drive_link) {
      toast.error('Please fill required fields');
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        department_id: formData.department_id || null
      };

      if (editingTask) {
        await api.put(`/official-tasks/admin/${editingTask.id}`, dataToSend);
        toast.success('Task updated');
      } else {
        await api.post('/official-tasks/admin', dataToSend);
        toast.success('Task created');
      }
      setShowForm(false);
      setEditingTask(null);
      setFormData({ course_id: '', department_id: '', title: '', description: '', drive_link: '', deadline: '' });
      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      course_id: task.course_id,
      department_id: task.department_id || '',
      title: task.title,
      description: task.description || '',
      drive_link: task.drive_link,
      deadline: task.deadline ? task.deadline.split('T')[0] : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/official-tasks/admin/${id}`);
      toast.success('Task deleted');
      fetchTasks();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         task.course_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourseId ? task.course_id === parseInt(selectedCourseId) : true;
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-2 h-10 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              <CheckSquare className="w-6 h-6 text-emerald-500 dark:text-emerald-400" /> Official Tasks
            </h2>
            <p className="text-gray-500 dark:text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Curriculum Assignments & Links</p>
          </div>
        </div>

        <button
          onClick={() => { setShowForm(true); setEditingTask(null); setFormData({ course_id: '', department_id: '', title: '', description: '', drive_link: '', deadline: '' }); }}
          className="admin-btn-primary h-[50px] px-6"
        >
          <Plus className="w-5 h-5" /> CREATE TASK
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search tasks or courses..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-input pl-12 h-[55px]"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select 
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="admin-input pl-12 h-[55px] appearance-none"
          >
            <option value="">All Courses</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="admin-card text-center py-20 border-dashed border-2">
          <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">No tasks found</h3>
          <p className="text-gray-500 dark:text-slate-500 mt-2">Start by creating the first official task for a course.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTasks.map(task => (
            <div key={task.id} className="admin-card group hover:border-emerald-500/30 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-wrap gap-2">
                  <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border border-emerald-500/20">
                    {task.course_name}
                  </span>
                  {task.department_name && (
                    <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border border-blue-500/20">
                      {task.department_name}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(task)} className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-all">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(task.id)} className="p-2 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight">{task.title}</h3>
              {task.description && (
                <p className="text-sm text-gray-500 dark:text-slate-400 line-clamp-2 mb-4">{task.description}</p>
              )}
              <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {task.deadline ? `Due: ${new Date(task.deadline).toLocaleDateString()}` : 'No deadline'}
                </div>
                <a 
                  href={task.drive_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-2 p-3 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group/link"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <LinkIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="text-xs font-bold text-gray-700 dark:text-slate-300 truncate">Drive Asset Link</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover/link:text-emerald-500 transition-colors" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl transition-colors duration-300">
            <div className="p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  {editingTask ? 'Edit Task' : 'Create Task'}
                </h3>
                <p className="text-gray-500 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Official Curriculum Sync</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl transition-colors">
                <Trash2 className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-4">Target Course</label>
                  <div className="relative">
                    <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={formData.course_id}
                      onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                      className="admin-input pl-12 h-[55px] appearance-none"
                      required
                    >
                      <option value="">Select course</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-4">Target Department</label>
                  <div className="relative">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={formData.department_id}
                      onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                      className="admin-input pl-12 h-[55px] appearance-none"
                    >
                      <option value="">All Departments</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-4">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Logic Design Sheet #4"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="admin-input h-[55px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-4">Drive Link</label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={formData.drive_link}
                    onChange={(e) => setFormData({ ...formData, drive_link: e.target.value })}
                    className="admin-input pl-12 h-[55px]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-4">Deadline</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="admin-input h-[55px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-4">Description (Optional)</label>
                <textarea
                  placeholder="Task details or instructions..."
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="admin-input py-4 min-h-[100px]"
                />
              </div>

              <button type="submit" className="w-full admin-btn-primary h-[60px] text-lg mt-4 shadow-[0_10px_30px_rgba(16,185,129,0.3)]">
                {editingTask ? 'UPDATE TASK' : 'CREATE TASK'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficialTaskManager;
