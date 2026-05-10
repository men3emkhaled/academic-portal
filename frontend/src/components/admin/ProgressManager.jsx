import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  CheckCircle, Circle, Plus, Trash2, Edit3, X, 
  ChevronDown, ChevronUp, ListChecks, Sparkles,
  Activity, BookOpen, Clock, Save, Search, Filter,
  LayoutGrid, List as ListIcon, MoreVertical
} from 'lucide-react';

const ProgressManager = ({ courses = [] }) => {
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [progressItems, setProgressItems] = useState([]);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [allProgress, setAllProgress] = useState([]);
  const [viewMode, setViewMode] = useState('overview'); // 'overview' | 'manage'

  useEffect(() => {
    fetchAllProgress();
  }, []);

  const fetchAllProgress = async () => {
    try {
      const res = await api.get('/progress/admin/all');
      setAllProgress(res.data);
    } catch (error) {
      console.error('Error fetching all progress:', error);
    }
  };

  const fetchCourseProgress = async (courseId) => {
    setLoading(true);
    try {
      const res = await api.get(`/progress/admin/course/${courseId}`);
      setProgressItems(res.data);
    } catch (error) {
      toast.error('Failed to load progress details');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = (courseId) => {
    setSelectedCourseId(courseId);
    if (courseId) {
      fetchCourseProgress(courseId);
      setViewMode('manage');
    } else {
      setProgressItems([]);
      setViewMode('overview');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemTitle.trim() || !selectedCourseId) return;

    setAdding(true);
    try {
      await api.post('/progress/admin', {
        course_id: parseInt(selectedCourseId),
        title: newItemTitle.trim(),
        is_completed: true
      });
      toast.success('Course part added');
      setNewItemTitle('');
      fetchCourseProgress(selectedCourseId);
      fetchAllProgress();
    } catch (error) {
      toast.error('Failed to add part');
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/progress/admin/${id}/toggle`);
      fetchCourseProgress(selectedCourseId);
      fetchAllProgress();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/progress/admin/${id}`);
      toast.success('Item deleted');
      fetchCourseProgress(selectedCourseId);
      fetchAllProgress();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const handleEditSave = async (id) => {
    if (!editTitle.trim()) return;
    try {
      await api.put(`/progress/admin/${id}`, { title: editTitle.trim() });
      toast.success('Item updated');
      setEditingId(null);
      setEditTitle('');
      fetchCourseProgress(selectedCourseId);
      fetchAllProgress();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const groupedProgress = {};
  allProgress.forEach(item => {
    const key = item.course_name;
    if (!groupedProgress[key]) {
      groupedProgress[key] = {
        course_name: item.course_name,
        semester: item.semester,
        department_name: item.department_name,
        items: []
      };
    }
    groupedProgress[key].items.push(item);
  });

  const selectedCourse = courses.find(c => c.id === parseInt(selectedCourseId));

  return (
    <div className="animate-in fade-in duration-700 pb-10">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-teal-500/10 dark:bg-teal-500/20 rounded-3xl flex items-center justify-center border border-teal-500/20 shadow-inner group">
            <Activity className="w-8 h-8 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
              Progress Hub
            </h2>
            <div className="flex items-center gap-3 mt-1.5">
                <span className="text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-[0.2em]">Course Completion Audit</span>
                <div className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                <span className="text-teal-600 dark:text-teal-400 text-[10px] font-black uppercase tracking-widest">{allProgress.length} Signals Tracked</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-teal-500/10 border border-teal-500/20 px-6 py-3 rounded-2xl">
          <ListChecks className="w-5 h-5 text-teal-600" />
          <span className="text-teal-600 font-black text-xs uppercase tracking-widest">{allProgress.length} Total Parts</span>
        </div>
      </div>

      {/* Course Selection Interface */}
      <div className="mb-12 space-y-3">
        <label className="block text-[10px] font-black text-teal-600 uppercase tracking-[0.2em] ml-6">Select Deployment Node</label>
        <div className="relative group">
          <BookOpen className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
          <select
            value={selectedCourseId}
            onChange={(e) => handleCourseSelect(e.target.value)}
            className="w-full bg-white/50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-[2rem] py-5 pl-16 pr-10 text-gray-900 dark:text-white font-black text-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all appearance-none"
          >
            <option value="">-- Overview & Analytics --</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} (Semester {c.semester}){c.department_name ? ` • ${c.department_name}` : ''}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Manage Mode */}
      {viewMode === 'manage' && selectedCourseId && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <form onSubmit={handleAddItem} className="mb-10 flex gap-4">
            <div className="relative flex-1">
               <input
                 type="text"
                 value={newItemTitle}
                 onChange={(e) => setNewItemTitle(e.target.value)}
                 placeholder="e.g. Chapter 01 - System Fundamentals..."
                 className="w-full bg-white/50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-2xl py-4.5 px-8 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500/50 outline-none transition-all shadow-inner"
                 required
               />
            </div>
            <button
              type="submit"
              disabled={adding || !newItemTitle.trim()}
              className="flex items-center gap-3 bg-teal-600 hover:bg-teal-700 text-white font-black px-10 py-4.5 rounded-2xl shadow-xl shadow-teal-500/20 active:scale-95 transition-all disabled:opacity-50 whitespace-nowrap uppercase text-[10px] tracking-widest"
            >
              {adding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add Part
            </button>
          </form>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 opacity-50">
               <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mb-6"></div>
               <p className="text-[10px] font-black uppercase tracking-widest">Hydrating Signals...</p>
            </div>
          ) : progressItems.length === 0 ? (
            <div className="bg-white/50 dark:bg-white/[0.02] border-2 border-dashed border-gray-200 dark:border-white/10 rounded-[3rem] py-32 text-center flex flex-col items-center transition-all duration-500">
                <Sparkles className="w-12 h-12 text-teal-400 opacity-20 mb-6" />
                <p className="text-sm font-black uppercase tracking-widest text-gray-500">Zero progress items deployed</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {progressItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`group relative flex items-center gap-6 p-6 rounded-[2rem] border backdrop-blur-xl transition-all duration-500 ${
                    item.is_completed
                      ? 'bg-emerald-500/5 dark:bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40 shadow-emerald-500/5'
                      : 'bg-teal-500/5 dark:bg-teal-500/5 border-teal-500/20 hover:border-teal-500/40 shadow-teal-500/5'
                  }`}
                >
                  <button
                    onClick={() => handleToggle(item.id)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                        item.is_completed 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 rotate-[360deg]' 
                        : 'bg-white dark:bg-white/5 border border-teal-500/30 text-teal-400'
                    }`}
                  >
                    {item.is_completed ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                  </button>

                  <div className="w-8 h-8 rounded-lg bg-white/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center text-[10px] font-black text-gray-400">
                    {index + 1}
                  </div>

                  {editingId === item.id ? (
                    <div className="flex-1 flex gap-3">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 bg-white dark:bg-black border border-teal-500/50 rounded-xl px-5 py-2 text-sm font-bold focus:outline-none shadow-inner"
                        autoFocus
                      />
                      <button onClick={() => handleEditSave(item.id)} className="bg-teal-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal-500/20">Save</button>
                      <button onClick={() => setEditingId(null)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-rose-500 transition-colors"><X className="w-5 h-5" /></button>
                    </div>
                  ) : (
                    <div className="flex-1">
                        <span className={`text-base font-black transition-all ${item.is_completed ? 'text-gray-900 dark:text-white' : 'text-teal-700 dark:text-teal-300'}`}>
                          {item.title}
                        </span>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Status: {item.is_completed ? 'Authenticated' : 'Pending Deployment'}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                    <button
                      onClick={() => { setEditingId(item.id); setEditTitle(item.title); }}
                      className="w-10 h-10 flex items-center justify-center bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-400 hover:text-teal-600 rounded-xl transition-all shadow-sm"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="w-10 h-10 flex items-center justify-center bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Overview Mode */}
      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-700">
          {Object.keys(groupedProgress).length === 0 ? (
            <div className="col-span-full bg-white/50 dark:bg-white/[0.02] border-2 border-dashed border-gray-200 dark:border-white/10 rounded-[3rem] py-48 text-center flex flex-col items-center transition-all duration-500">
                <LayoutGrid className="w-16 h-16 text-teal-400 opacity-20 mb-8" />
                <h4 className="text-xl font-black uppercase tracking-widest text-gray-900 dark:text-white">System Standby</h4>
                <p className="text-sm font-bold mt-4 tracking-widest text-gray-500">Select a course to initialize progress tracking.</p>
            </div>
          ) : (
            Object.entries(groupedProgress).map(([courseName, data]) => {
              const completed = data.items.filter(i => i.is_completed).length;
              const total = data.items.length;
              const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
              const isExpanded = expandedCourse === courseName;

              return (
                <div key={courseName} className="group relative bg-white/80 dark:bg-black/20 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-[2.5rem] p-10 transition-all duration-500 hover:border-teal-500/40 hover:shadow-2xl hover:shadow-teal-500/5">
                  <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 bg-teal-500/10 rounded-2xl flex items-center justify-center border border-teal-500/20 text-teal-600 shadow-inner group-hover:scale-110 transition-transform">
                          <BookOpen className="w-7 h-7" />
                       </div>
                       <div>
                          <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight group-hover:text-teal-600 transition-colors">{courseName}</h3>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sem {data.semester}</span>
                             {data.department_name && (
                                <>
                                   <div className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate max-w-[120px]">{data.department_name}</span>
                                </>
                             )}
                          </div>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-3xl font-black text-teal-600 tracking-tighter">{pct}%</p>
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Efficiency</p>
                    </div>
                  </div>

                  {/* Progressive Bar */}
                  <div className="relative w-full h-3 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden mb-10 shadow-inner">
                    <div
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-teal-600 to-emerald-400 rounded-full transition-all duration-1000 group-hover:shadow-[0_0_15px_rgba(20,184,166,0.5)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl">
                        <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">{completed} / {total} Active Signals</span>
                     </div>
                     <button
                       onClick={() => setExpandedCourse(isExpanded ? null : courseName)}
                       className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${isExpanded ? 'bg-teal-600 text-white' : 'bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-400 hover:text-teal-600'}`}
                     >
                       {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                     </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-8 pt-8 border-t border-gray-50 dark:border-white/5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                      {data.items.map((item, idx) => (
                        <div key={item.id} className="flex items-center justify-between group/item">
                          <div className="flex items-center gap-3">
                             <div className={`w-2 h-2 rounded-full ${item.is_completed ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-teal-500/20'}`}></div>
                             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{idx + 1}.</span>
                             <span className={`text-sm font-bold transition-colors ${item.is_completed ? 'text-gray-900 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'}`}>
                               {item.title}
                             </span>
                          </div>
                          {item.is_completed && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default ProgressManager;
