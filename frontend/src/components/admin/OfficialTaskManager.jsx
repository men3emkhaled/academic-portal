import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  CheckSquare, Plus, Trash2, Edit, ExternalLink, 
  BookOpen, Calendar, Link as LinkIcon, Search, Filter, Layers,
  Activity, Clock, FileText, ChevronRight, X, Save, Sparkles,
  Database, Briefcase
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
      toast.error('Failed to load task registry');
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
      toast.error('Required fields are missing');
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        department_id: formData.department_id || null
      };

      if (editingTask) {
        await api.put(`/official-tasks/admin/${editingTask.id}`, dataToSend);
        toast.success('Task details updated');
      } else {
        await api.post('/official-tasks/admin', dataToSend);
        toast.success('New task added to registry');
      }
      closeForm();
      fetchTasks();
    } catch (error) {
      toast.error('Operation failed');
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

  const closeForm = () => {
    setShowForm(false);
    setEditingTask(null);
    setFormData({ course_id: '', department_id: '', title: '', description: '', drive_link: '', deadline: '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/official-tasks/admin/${id}`);
      toast.success('Task removed');
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
    <div className="animate-in fade-in duration-700 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-3xl flex items-center justify-center border border-emerald-500/20 shadow-inner group">
            <CheckSquare className="w-8 h-8 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
              Official Tasks
            </h2>
            <div className="flex items-center gap-3 mt-1.5">
                <span className="text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-[0.2em]">Curriculum Assignments</span>
                <div className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">{tasks.length} Active Tasks</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => { setShowForm(true); setEditingTask(null); }}
          className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search tasks or courses..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
          />
        </div>
        <div className="relative md:w-72 group">
          <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
          <select 
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full bg-white/50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl py-4 pl-14 pr-10 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none"
          >
            <option value="">All Courses</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-48 opacity-50">
           <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-8"></div>
           <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Scanning Tasks...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white/50 dark:bg-white/[0.02] border-2 border-dashed border-gray-200 dark:border-white/10 rounded-[3rem] py-48 text-center flex flex-col items-center group transition-all duration-500">
            <div className="w-24 h-24 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <Sparkles className="w-12 h-12 text-emerald-400 opacity-50" />
            </div>
            <h4 className="text-xl font-black uppercase tracking-[0.3em] text-gray-900 dark:text-white">No Tasks Found</h4>
            <p className="text-sm font-bold mt-4 tracking-widest text-gray-500">Start by creating a task for your students.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredTasks.map(task => (
            <div 
              key={task.id} 
              className="group relative bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-[2.5rem] p-10 transition-all duration-500 hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/5"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-wrap gap-2">
                  <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border border-emerald-500/20">
                    {task.course_name}
                  </span>
                  {task.department_name && (
                    <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border border-indigo-500/20">
                      {task.department_name}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                    onClick={() => handleEdit(task)} 
                    className="w-9 h-9 flex items-center justify-center bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-400 hover:text-emerald-600 rounded-xl transition-all shadow-sm"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(task.id)} 
                    className="w-9 h-9 flex items-center justify-center bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight mb-4 group-hover:text-emerald-600 transition-colors min-h-[4rem] line-clamp-2">{task.title}</h3>
              
              {task.description && (
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 line-clamp-2 mb-8 italic leading-relaxed">
                  {task.description}
                </p>
              )}

              <div className="space-y-4 pt-6 border-t border-gray-50 dark:border-white/5">
                <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  {task.deadline ? `Deadline: ${new Date(task.deadline).toLocaleDateString()}` : 'Open Deadline'}
                </div>
                <a 
                  href={task.drive_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-4 p-4 bg-gray-50/50 dark:bg-white/[0.02] rounded-2xl border border-gray-100 dark:border-white/5 hover:border-emerald-500/50 hover:bg-white dark:hover:bg-white/5 transition-all group/link"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl flex items-center justify-center shadow-inner">
                        <LinkIcon className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">Drive Asset Link</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover/link:text-emerald-500 transition-colors" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cinematic Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 dark:bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
           <div 
             className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.4)] rounded-[3rem] w-full max-w-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500"
             onClick={e => e.stopPropagation()}
           >
              {/* Modal Header */}
              <div className="p-10 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] flex justify-between items-center">
                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                        <Activity className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{editingTask ? 'Edit Task' : 'New Task'}</h2>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Curriculum Assignment Details</p>
                    </div>
                 </div>
                 <button onClick={closeForm} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 rounded-2xl hover:text-emerald-600 transition-all shadow-sm">
                    <X className="w-6 h-6" />
                 </button>
              </div>

              {/* Modal Body */}
              <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                 <form id="task-form" onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] ml-5">Target Course</label>
                          <div className="relative">
                             <BookOpen className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                             <select
                               value={formData.course_id}
                               onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                               className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-[1.5rem] py-5 pl-16 pr-8 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all shadow-inner appearance-none"
                               required
                             >
                               <option value="">Select course</option>
                               {courses.map(course => (
                                 <option key={course.id} value={course.id}>{course.name}</option>
                               ))}
                             </select>
                          </div>
                       </div>
                       <div className="space-y-3">
                          <label className="block text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] ml-5">Target Department</label>
                          <div className="relative">
                             <Layers className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                             <select
                               value={formData.department_id}
                               onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                               className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-[1.5rem] py-5 pl-16 pr-8 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-inner appearance-none"
                             >
                               <option value="">All Departments</option>
                               {departments.map(dept => (
                                 <option key={dept.id} value={dept.id}>{dept.name}</option>
                               ))}
                             </select>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] ml-5">Task Title</label>
                       <div className="relative">
                          <Edit className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                          <input
                            type="text"
                            placeholder="e.g. Laboratory Sheet #02"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-[1.5rem] py-5 pl-16 pr-8 text-gray-900 dark:text-white text-lg font-black focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all shadow-inner"
                            required
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] ml-5">Resource Link</label>
                          <div className="relative">
                             <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                             <input
                               type="url"
                               placeholder="Google Drive / URL"
                               value={formData.drive_link}
                               onChange={(e) => setFormData({ ...formData, drive_link: e.target.value })}
                               className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-[1.5rem] py-5 pl-16 pr-8 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all shadow-inner"
                               required
                             />
                          </div>
                       </div>
                       <div className="space-y-3">
                          <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] ml-5">Deadline</label>
                          <div className="relative">
                             <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                             <input
                               type="date"
                               value={formData.deadline}
                               onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                               className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-[1.5rem] py-5 pl-16 pr-8 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all shadow-inner"
                             />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] ml-5">Additional Info</label>
                       <textarea
                         placeholder="Optional instructions or details..."
                         rows="3"
                         value={formData.description}
                         onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                         className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-[1.5rem] p-8 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all shadow-inner resize-none"
                       />
                    </div>
                 </form>
              </div>

              {/* Modal Footer */}
              <div className="p-10 border-t border-gray-100 dark:border-white/10 flex justify-end gap-5 bg-gray-50/50 dark:bg-white/[0.02]">
                 <button onClick={closeForm} className="px-10 py-5 rounded-2xl font-black text-gray-500 hover:text-gray-900 transition-all uppercase text-[10px] tracking-[0.2em]">Cancel</button>
                 <button 
                   type="submit" 
                   form="task-form"
                   className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-5 rounded-2xl font-black transition-all shadow-xl shadow-emerald-500/20 active:scale-95 uppercase text-[10px] tracking-[0.3em]"
                 >
                   <Save className="w-5 h-5" />
                   {editingTask ? 'Save Changes' : 'Add Task'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default OfficialTaskManager;
