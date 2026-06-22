import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { CheckSquare, Plus, Trash2, Edit3, BookOpen, Calendar, Link as LinkIcon, Search, ExternalLink, X } from 'lucide-react';

const OfficialTaskManager = ({ courses = [], departments = [] }) => {
  const { t, i18n } = useTranslation();
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
      toast.error(t('admin.messages.load_tasks_failed'));
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
      toast.error(t('admin.messages.fields_req'));
      return;
    }
    try {
      const dataToSend = { ...formData, department_id: formData.department_id || null };
      if (editingTask) {
        await api.put(`/official-tasks/admin/${editingTask.id}`, dataToSend);
      } else {
        await api.post('/official-tasks/admin', dataToSend);
      }
      toast.success(t('common.success'));
      closeForm();
      fetchTasks();
    } catch (error) {
      toast.error(t('admin.messages.operation_failed'));
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
    if (!window.confirm(t('common.confirm_delete'))) return;
    try {
      await api.delete(`/official-tasks/admin/${id}`);
      toast.success(t('common.success'));
      fetchTasks();
    } catch (error) {
      toast.error(t('admin.messages.delete_failed'));
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         task.course_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourseId ? task.course_id === parseInt(selectedCourseId) : true;
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="space-y-6 pb-10 max-w-[1200px] mx-auto w-full px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.tasks.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('admin.tasks.active_tasks', { count: tasks.length })}</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingTask(null); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" />{t('admin.tasks.add_button')}
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('admin.tasks.search_placeholder')}
            className="w-full bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#059669]/30 outline-none" />
        </div>
        <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}
          className="sm:w-64 bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#059669]/30 outline-none">
          <option value="">{t('admin.tasks.filter_all_courses')}</option>
          {courses.map(course => (
            <option key={course.id} value={course.id}>{course.name}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 text-sm text-gray-400">{t('admin.tasks.loading')}</div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
          <p className="font-medium">{t('admin.tasks.no_tasks')}</p>
          <p className="text-xs mt-1">{t('admin.tasks.no_tasks_hint')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <div key={task.id} className="bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-[#059669]/30 transition-colors">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded text-xs bg-[#059669]/10 text-[#059669]">{task.course_name}</span>
                  {task.department_name && (
                    <span className="px-2 py-0.5 rounded text-xs bg-blue-50 dark:bg-blue-500/10 text-blue-600">{task.department_name}</span>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => handleEdit(task)} className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(task.id)} className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{task.title}</h3>
              {task.description && (
                <p className="text-xs text-gray-400 line-clamp-2 mb-4">{task.description}</p>
              )}
              <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-800">
                {task.deadline && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#059669]" />
                    {new Date(task.deadline).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-GB')}
                  </div>
                )}
                <a href={task.drive_link} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between gap-2 p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <LinkIcon className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                    <span className="truncate">{t('admin.tasks.drive_link')}</span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-[#059669]" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={closeForm} className="absolute inset-0 bg-black/40" />
          <div className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-gray-700 rounded-xl w-full max-w-lg relative z-10 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#059669]/10 rounded-lg flex items-center justify-center text-[#059669]">
                  {editingTask ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {editingTask ? t('admin.tasks.modals.edit_task') : t('admin.tasks.modals.new_task')}
                </h3>
              </div>
              <button onClick={closeForm} className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <form id="task-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">{t('admin.tasks.modals.target_course')} *</label>
                  <select value={formData.course_id} onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none" required>
                    <option value="">{t('admin.tasks.modals.select_course')}</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">{t('admin.tasks.modals.target_dept')}</label>
                  <select value={formData.department_id} onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none">
                    <option value="">{t('admin.tasks.modals.all_depts')}</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">{t('admin.tasks.modals.task_title')} *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">{t('admin.tasks.modals.resource_link')} *</label>
                  <input type="url" value={formData.drive_link} onChange={(e) => setFormData({ ...formData, drive_link: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">{t('admin.tasks.modals.deadline_label')}</label>
                  <input type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">{t('admin.tasks.modals.additional_info')}</label>
                <textarea rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none resize-none" />
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="submit" disabled={loading} className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                  {editingTask ? t('common.save') : t('admin.tasks.add_button')}
                </button>
                <button type="button" onClick={closeForm} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors">
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficialTaskManager;
