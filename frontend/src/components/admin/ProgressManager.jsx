import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { CheckCircle, Circle, Plus, Trash2, Edit3, X, ChevronDown, ChevronUp, ListChecks } from 'lucide-react';

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
      toast.error('Failed to load progress items');
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
      toast.success('Part added successfully');
      setNewItemTitle('');
      fetchCourseProgress(selectedCourseId);
      fetchAllProgress();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add part');
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
      toast.error('Failed to toggle status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this progress item?')) return;
    try {
      await api.delete(`/progress/admin/${id}`);
      toast.success('Item deleted');
      fetchCourseProgress(selectedCourseId);
      fetchAllProgress();
    } catch (error) {
      toast.error('Failed to delete item');
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
      toast.error('Failed to update item');
    }
  };

  // تجميع الأجزاء حسب المادة (للعرض العام)
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
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Progress Tracking</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Manage completed parts per course</p>
        </div>
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-2xl">
          <ListChecks className="w-5 h-5 text-amber-400" />
          <span className="text-amber-400 font-bold text-sm">{allProgress.length} Total Items</span>
        </div>
      </div>

      {/* Course Selector */}
      <div className="mb-8">
        <label className="block text-slate-300 ml-4 text-[10px] font-bold uppercase tracking-widest mb-2">Select Course</label>
        <select
          value={selectedCourseId}
          onChange={(e) => handleCourseSelect(e.target.value)}
          className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-3.5 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium appearance-none"
        >
          <option value="">-- Overview (All Courses) --</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>
              {c.name} (Sem {c.semester}){c.department_name ? ` — ${c.department_name}` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* ========== MANAGE MODE: Add/Edit items for selected course ========== */}
      {viewMode === 'manage' && selectedCourseId && (
        <>
          {/* Add New Item */}
          <form onSubmit={handleAddItem} className="mb-8">
            <div className="flex gap-3">
              <input
                type="text"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                placeholder="e.g. Chapter 1.1 - Introduction to Arrays"
                className="flex-1 bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                required
              />
              <button
                type="submit"
                disabled={adding || !newItemTitle.trim()}
                className="flex items-center gap-2 bg-emerald-500 text-black font-black px-6 py-3.5 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-emerald-500/20 whitespace-nowrap"
              >
                {adding ? (
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Add Part
              </button>
            </div>
          </form>

          {/* Items List */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : progressItems.length === 0 ? (
            <div className="text-center py-16 bg-white/[0.02] border border-dashed border-white/10 rounded-[2rem]">
              <ListChecks className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg font-bold">No progress items yet</p>
              <p className="text-slate-600 text-sm mt-1">Add the first completed part for "{selectedCourse?.name}"</p>
            </div>
          ) : (
            <div className="space-y-3">
              {progressItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 group ${
                    item.is_completed
                      ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40'
                      : 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40'
                  }`}
                >
                  {/* Toggle Button */}
                  <button
                    onClick={() => handleToggle(item.id)}
                    className="shrink-0 transition-all hover:scale-110"
                    title={item.is_completed ? 'Mark as pending' : 'Mark as completed'}
                  >
                    {item.is_completed ? (
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <Circle className="w-6 h-6 text-amber-400" />
                    )}
                  </button>

                  {/* Number */}
                  <span className="text-xs font-black text-slate-600 bg-white/5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>

                  {/* Title */}
                  {editingId === item.id ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                        autoFocus
                        onKeyDown={(e) => { if (e.key === 'Enter') handleEditSave(item.id); if (e.key === 'Escape') setEditingId(null); }}
                      />
                      <button onClick={() => handleEditSave(item.id)} className="text-emerald-400 hover:text-emerald-300 px-2">Save</button>
                      <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-300 px-2">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span className={`flex-1 font-bold text-sm ${item.is_completed ? 'text-white' : 'text-amber-200'}`}>
                      {item.title}
                    </span>
                  )}

                  {/* Status Badge */}
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg shrink-0 ${
                    item.is_completed
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {item.is_completed ? 'Done' : 'Pending'}
                  </span>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setEditingId(item.id); setEditTitle(item.title); }}
                      className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ========== OVERVIEW MODE: Show all courses with their progress ========== */}
      {viewMode === 'overview' && (
        <div className="space-y-4">
          {Object.keys(groupedProgress).length === 0 ? (
            <div className="text-center py-16 bg-white/[0.02] border border-dashed border-white/10 rounded-[2rem]">
              <ListChecks className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg font-bold">No progress data yet</p>
              <p className="text-slate-600 text-sm mt-1">Select a course above and start adding completed parts</p>
            </div>
          ) : (
            Object.entries(groupedProgress).map(([courseName, data]) => {
              const completed = data.items.filter(i => i.is_completed).length;
              const total = data.items.length;
              const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
              const isExpanded = expandedCourse === courseName;

              return (
                <div key={courseName} className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-emerald-500/20 transition-all">
                  <button
                    onClick={() => setExpandedCourse(isExpanded ? null : courseName)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                        <ListChecks className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-sm">{courseName}</h3>
                        <p className="text-slate-500 text-xs mt-0.5">
                          Sem {data.semester}{data.department_name ? ` • ${data.department_name}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Progress Bar */}
                      <div className="hidden sm:flex items-center gap-3">
                        <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-black text-emerald-400 whitespace-nowrap">{completed}/{total}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-white/5 p-4 space-y-2">
                      {data.items.map((item, idx) => (
                        <div key={item.id} className="flex items-center gap-3 px-3 py-2">
                          {item.is_completed ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-amber-400 shrink-0" />
                          )}
                          <span className="text-xs font-bold text-slate-600">{idx + 1}.</span>
                          <span className={`text-sm ${item.is_completed ? 'text-slate-300' : 'text-amber-300'}`}>
                            {item.title}
                          </span>
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
