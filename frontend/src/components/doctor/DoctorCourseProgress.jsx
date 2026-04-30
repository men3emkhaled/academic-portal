import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { ListChecks, Plus, Edit3, Trash2, CheckCircle2, Circle, GripVertical } from 'lucide-react';

const DoctorCourseProgress = ({ courses }) => {
  const { doctorApi } = useDoctorAuth();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [progressItems, setProgressItems] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ title: '', order_index: 0 });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedCourseId) {
      fetchProgress();
    } else {
      setProgressItems([]);
    }
  }, [selectedCourseId]);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const res = await doctorApi('get', `/doctor/course-progress/${selectedCourseId}`);
      setProgressItems(res.data);
    } catch (err) {
      toast.error('Failed to load course progress');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error('Title is required');

    setIsSaving(true);
    try {
      if (editingItem) {
        await doctorApi('put', `/doctor/course-progress/${editingItem.id}`, formData);
        toast.success('Item updated');
      } else {
        await doctorApi('post', '/doctor/course-progress', {
          ...formData,
          courseId: selectedCourseId,
          order_index: progressItems.length
        });
        toast.success('Item added');
      }
      resetForm();
      fetchProgress();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save item');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await doctorApi('patch', `/doctor/course-progress/${id}/toggle`, {
        is_completed: !currentStatus
      });
      // Optimistic update
      setProgressItems(prev => prev.map(item => 
        item.id === id ? { ...item, is_completed: !currentStatus } : item
      ));
    } catch (err) {
      toast.error('Failed to update status');
      fetchProgress(); // Revert on failure
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item from syllabus?')) return;
    try {
      await doctorApi('delete', `/doctor/course-progress/${id}`);
      toast.success('Item deleted');
      fetchProgress();
    } catch (err) {
      toast.error('Failed to delete item');
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setShowForm(false);
    setFormData({ title: '', order_index: 0 });
  };

  const startEdit = (item) => {
    setEditingItem(item);
    setFormData({ title: item.title, order_index: item.order_index });
    setShowForm(true);
  };

  const completedCount = progressItems.filter(i => i.is_completed).length;
  const progressPct = progressItems.length > 0 
    ? Math.round((completedCount / progressItems.length) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <ListChecks className="w-6 h-6 text-teal-500" /> Syllabus Progress
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-500 mt-1">
            Manage course chapters and track completion status
          </p>
        </div>
      </div>

      {/* Course Selector + Add Button */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="flex-1 bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-xl p-3.5 text-gray-900 dark:text-white font-medium focus:border-teal-500/50 focus:outline-none transition-colors"
        >
          <option value="">-- Select a Course --</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {selectedCourseId && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-5 rounded-xl transition-all hover:shadow-lg hover:shadow-teal-500/20 active:scale-95 text-sm"
          >
            <Plus className="w-4 h-4" /> Add Topic
          </button>
        )}
      </div>

      {/* Progress Bar Overview */}
      {selectedCourseId && progressItems.length > 0 && !loading && (
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-700 dark:text-slate-300">Overall Completion</span>
            <span className="text-sm font-black text-teal-500">{progressPct}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-1000"
              style={{ width: `${progressPct}%` }}
            ></div>
          </div>
          <p className="text-xs font-medium text-gray-500 mt-3 text-center">
            {completedCount} of {progressItems.length} topics completed
          </p>
        </div>
      )}

      {/* Form */}
      {showForm && selectedCourseId && (
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 p-6 rounded-2xl animate-fadeIn">
          <h3 className="text-lg font-black mb-5 flex items-center gap-2 text-gray-900 dark:text-white">
            {editingItem ? <Edit3 className="text-teal-500 w-5 h-5" /> : <Plus className="text-teal-500 w-5 h-5" />}
            {editingItem ? 'Edit Topic' : 'Add New Topic'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-slate-500 mb-2 uppercase tracking-wider">Topic Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Chapter 1: Introduction to Data Structures"
                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white focus:border-teal-500/50 focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-teal-500/20 active:scale-[0.98]"
              >
                {isSaving ? 'Saving...' : (editingItem ? 'Update Topic' : 'Add Topic')}
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

      {/* List */}
      {!selectedCourseId ? (
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl p-12 text-center">
          <ListChecks className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-slate-500 font-medium">Select a course to view syllabus</p>
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl p-5 animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-white/10 rounded w-1/3 mb-2"></div>
            </div>
          ))}
        </div>
      ) : progressItems.length === 0 ? (
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl p-12 text-center">
          <ListChecks className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-slate-500 font-medium">No topics added to syllabus yet</p>
          <p className="text-xs text-gray-400 dark:text-slate-600 mt-1">Click "Add Topic" to build your course timeline</p>
        </div>
      ) : (
        <div className="space-y-3">
          {progressItems.map((item, index) => (
            <div
              key={item.id}
              className={`group bg-white dark:bg-white/[0.03] border rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 ${
                item.is_completed
                  ? 'border-teal-200/60 dark:border-teal-500/20'
                  : 'border-gray-200/60 dark:border-white/5'
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => handleToggle(item.id, item.is_completed)}
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  item.is_completed
                    ? 'bg-teal-100 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-500 dark:hover:bg-white/10'
                }`}
              >
                {item.is_completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
              </button>

              {/* Title */}
              <div className="flex-1 min-w-0">
                <span className={`text-sm md:text-base font-semibold transition-all ${
                  item.is_completed 
                    ? 'text-teal-900 dark:text-teal-100' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {item.title}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => startEdit(item)}
                  className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorCourseProgress;
