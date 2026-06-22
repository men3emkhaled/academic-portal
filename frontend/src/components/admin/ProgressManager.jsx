import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Circle, Plus, Trash2, Edit3, X, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

const ProgressManager = ({ courses = [] }) => {
  const { t } = useTranslation();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [progressItems, setProgressItems] = useState([]);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [allProgress, setAllProgress] = useState([]);
  const [viewMode, setViewMode] = useState('overview');

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
    if (!courseId) return;
    setLoading(true);
    try {
      const res = await api.get(`/progress/admin/course/${courseId}`);
      setProgressItems(res.data);
    } catch (error) {
      toast.error(t('admin.progress.messages.load_failed'));
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
      toast.success(t('admin.progress.messages.added'));
      setNewItemTitle('');
      fetchCourseProgress(selectedCourseId);
      fetchAllProgress();
    } catch (error) {
      toast.error(t('admin.progress.messages.add_failed'));
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/progress/admin/${id}/toggle`);
      if (selectedCourseId) fetchCourseProgress(selectedCourseId);
      fetchAllProgress();
    } catch (error) {
      toast.error(t('admin.progress.messages.update_failed'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.progress.messages.delete_confirm'))) return;
    try {
      await api.delete(`/progress/admin/${id}`);
      toast.success(t('admin.progress.messages.deleted'));
      if (selectedCourseId) fetchCourseProgress(selectedCourseId);
      fetchAllProgress();
    } catch (error) {
      toast.error(t('admin.progress.messages.delete_failed'));
    }
  };

  const handleEditSave = async (id) => {
    if (!editTitle.trim()) return;
    try {
      await api.put(`/progress/admin/${id}`, { title: editTitle.trim() });
      toast.success(t('admin.progress.messages.updated'));
      setEditingId(null);
      setEditTitle('');
      if (selectedCourseId) fetchCourseProgress(selectedCourseId);
      fetchAllProgress();
    } catch (error) {
      toast.error(t('admin.progress.messages.save_failed'));
    }
  };

  const groupedProgress = {};
  allProgress.forEach(item => {
    const key = item.course_name;
    if (!groupedProgress[key]) {
      groupedProgress[key] = { course_name: item.course_name, semester: item.semester, department_name: item.department_name, items: [] };
    }
    groupedProgress[key].items.push(item);
  });

  return (
    <div className="space-y-6 pb-10 max-w-[1200px] mx-auto w-full px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.progress.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('admin.progress.signals_tracked', { count: allProgress.length })}</p>
        </div>
      </div>

      {/* Course Select */}
      <div className="max-w-md">
        <select value={selectedCourseId} onChange={(e) => handleCourseSelect(e.target.value)}
          className="w-full bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#059669]/30 outline-none">
          <option value="">{t('admin.progress.overview_analytics')}</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>
              {c.name} ({t('admin.records.semester_label', { count: c.semester })}){c.department_name ? ` • ${c.department_name}` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Manage Mode */}
      {viewMode === 'manage' && selectedCourseId && (
        <div className="space-y-4">
          <form onSubmit={handleAddItem} className="flex gap-3">
            <input type="text" value={newItemTitle} onChange={(e) => setNewItemTitle(e.target.value)}
              placeholder={t('admin.progress.placeholder_part')}
              className="flex-1 bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#059669]/30 outline-none" required />
            <button type="submit" disabled={adding || !newItemTitle.trim()}
              className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
              {<Plus className="w-4 h-4" />}{t('admin.progress.add_part')}
            </button>
          </form>

          {loading ? (
            <div className="text-center py-16 text-sm text-gray-400">{t('admin.progress.hydrating')}</div>
          ) : progressItems.length === 0 ? (
            <div className="text-center py-16 text-sm text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
              {t('admin.progress.zero_items')}
            </div>
          ) : (
            <div className="space-y-2">
              {progressItems.map((item, index) => (
                <div key={item.id} className={`flex items-center gap-3 p-4 rounded-lg border ${
                  item.is_completed
                    ? 'bg-[#059669]/5 dark:bg-[#059669]/10 border-[#059669]/20'
                    : 'bg-white dark:bg-[#0d0d14] border-gray-200 dark:border-gray-700'
                }`}>
                  <button onClick={() => handleToggle(item.id)}
                    className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                      item.is_completed ? 'bg-[#059669] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                    }`}>
                    {item.is_completed ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                  </button>
                  <span className="text-xs text-gray-400 font-medium w-6 text-center">{index + 1}.</span>
                  {editingId === item.id ? (
                    <div className="flex-1 flex gap-2">
                      <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none" autoFocus />
                      <button onClick={() => handleEditSave(item.id)} className="px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-medium rounded-lg transition-colors">{t('common.save')}</button>
                      <button onClick={() => setEditingId(null)} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 rounded-lg"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <span className={`flex-1 text-sm ${item.is_completed ? 'text-gray-900 dark:text-white line-through opacity-60' : 'text-gray-900 dark:text-white'}`}>
                      {item.title}
                    </span>
                  )}
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingId(item.id); setEditTitle(item.title); }}
                      className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(item.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                      <Trash2 className="w-3.5 h-3.5" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(groupedProgress).length === 0 ? (
            <div className="col-span-full text-center py-16 text-sm text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
              {t('admin.progress.system_standby')}
            </div>
          ) : (
            Object.entries(groupedProgress).map(([courseName, data]) => {
              const completed = data.items.filter(i => i.is_completed).length;
              const total = data.items.length;
              const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
              const isExpanded = expandedCourse === courseName;

              return (
                <div key={courseName} className="bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#059669]/10 rounded-lg flex items-center justify-center text-[#059669]">
                        <BookOpen className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{courseName}</h3>
                        <p className="text-xs text-gray-400">
                          {t('admin.records.semester_label', { count: data.semester })}
                          {data.department_name && ` • ${data.department_name}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#059669]">{pct}%</p>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full mb-3">
                    <div className="h-full bg-[#059669] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{t('admin.progress.active_signals', { completed, total })}</span>
                    <button onClick={() => setExpandedCourse(isExpanded ? null : courseName)}
                      className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
                      {data.items.map((item, idx) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <button onClick={() => handleToggle(item.id)}
                            className={`w-5 h-5 rounded flex items-center justify-center ${item.is_completed ? 'bg-[#059669] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                            {item.is_completed ? <CheckCircle className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                          </button>
                          <span className="text-xs text-gray-400">{idx + 1}.</span>
                          <span className={`text-sm flex-1 ${item.is_completed ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>{item.title}</span>
                          <button onClick={() => handleDelete(item.id)}
                            className="w-5 h-5 flex items-center justify-center text-gray-300 hover:text-red-500 rounded">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => {
                        const course = courses.find(c => c.name === courseName);
                        if (course) handleCourseSelect(String(course.id));
                      }}
                        className="w-full mt-2 py-2 rounded-lg border border-dashed border-[#059669]/30 text-xs text-[#059669] hover:bg-[#059669]/5 transition-colors">
                        + {t('admin.progress.add_part')}
                      </button>
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
