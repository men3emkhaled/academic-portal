import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Map, Plus, Edit3, Trash2, Star, ListOrdered, X, Target } from 'lucide-react';

const RoadmapManager = () => {
  const { t } = useTranslation();
  const [tracks, setTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTrackForm, setShowTrackForm] = useState(false);
  const [editingTrack, setEditingTrack] = useState(null);
  const [trackForm, setTrackForm] = useState({ name: '', description: '', is_primary: false });
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', order_index: 0 });

  useEffect(() => { fetchTracks(); }, []);

  const fetchTracks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/roadmap/tracks');
      setTracks(res.data);
      if (res.data.length > 0 && !selectedTrack) {
        setSelectedTrack(res.data[0]);
        fetchTasks(res.data[0].id);
      }
    } catch (error) { toast.error(t('admin.roadmap.messages.load_paths_failed')); }
    finally { setLoading(false); }
  };

  const fetchTasks = async (trackId) => {
    setLoading(true);
    try {
      const res = await api.get(`/roadmap/tracks/${trackId}/tasks`);
      setTasks(res.data);
    } catch (error) { toast.error(t('admin.roadmap.messages.load_tasks_failed')); }
    finally { setLoading(false); }
  };

  const handleSaveTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingTrack) await api.put(`/roadmap/tracks/${editingTrack.id}`, trackForm);
      else await api.post('/roadmap/tracks', trackForm);
      toast.success(t('common.success'));
      resetTrackForm();
      fetchTracks();
    } catch (error) { toast.error(error.response?.data?.message || t('admin.roadmap.messages.save_path_failed')); }
    finally { setLoading(false); }
  };

  const handleDeleteTrack = async (track) => {
    if (!window.confirm(t('common.confirm_delete'))) return;
    setLoading(true);
    try {
      await api.delete(`/roadmap/tracks/${track.id}`);
      toast.success(t('common.success'));
      if (selectedTrack?.id === track.id) { setSelectedTrack(null); setTasks([]); }
      fetchTracks();
    } catch (error) { toast.error(t('admin.roadmap.messages.delete_path_failed')); }
    finally { setLoading(false); }
  };

  const editTrack = (track) => {
    setEditingTrack(track);
    setTrackForm({ name: track.name, description: track.description || '', is_primary: track.is_primary || false });
    setShowTrackForm(true);
  };

  const resetTrackForm = () => {
    setShowTrackForm(false);
    setEditingTrack(null);
    setTrackForm({ name: '', description: '', is_primary: false });
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!selectedTrack) { toast.error(t('admin.roadmap.messages.select_path_req')); return; }
    setLoading(true);
    try {
      if (editingTask) await api.put(`/roadmap/tasks/${editingTask.id}`, taskForm);
      else await api.post(`/roadmap/tracks/${selectedTrack.id}/tasks`, taskForm);
      toast.success(t('common.success'));
      resetTaskForm();
      fetchTasks(selectedTrack.id);
    } catch (error) { toast.error(error.response?.data?.message || t('admin.roadmap.messages.save_task_failed')); }
    finally { setLoading(false); }
  };

  const handleDeleteTask = async (task) => {
    if (!window.confirm(t('common.confirm_delete'))) return;
    setLoading(true);
    try {
      await api.delete(`/roadmap/tasks/${task.id}`);
      toast.success(t('common.success'));
      fetchTasks(selectedTrack.id);
    } catch (error) { toast.error(t('admin.roadmap.messages.delete_task_failed')); }
    finally { setLoading(false); }
  };

  const editTask = (task) => {
    setEditingTask(task);
    setTaskForm({ title: task.title, description: task.description || '', order_index: task.order_index || 0 });
    setShowTaskForm(true);
  };

  const resetTaskForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
    setTaskForm({ title: '', description: '', order_index: 0 });
  };

  const selectTrack = (track) => {
    setSelectedTrack(track);
    fetchTasks(track.id);
  };

  return (
    <div className="space-y-6 pb-10 max-w-[1200px] mx-auto w-full px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.roadmap.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('admin.roadmap.active_tracks')}: {tracks.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left: Tracks */}
        <div className="xl:col-span-4 bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('admin.roadmap.available_tracks')}</h3>
            <button onClick={() => setShowTrackForm(true)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#059669] text-white hover:bg-[#047857] transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {tracks.length === 0 ? (
              <div className="text-center py-12 text-sm text-gray-400">{t('admin.roadmap.no_tracks')}</div>
            ) : (
              tracks.map((track) => (
                <div key={track.id} onClick={() => selectTrack(track)} className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedTrack?.id === track.id
                    ? 'bg-[#059669] text-white border-[#059669]'
                    : 'bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-[#059669]/30 text-gray-900 dark:text-white'
                }`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium truncate">{track.name}</span>
                      {track.is_primary && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); editTrack(track); }}
                        className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10">
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteTrack(track); }}
                        className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  {track.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{track.description}</p>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Tasks */}
        <div className="xl:col-span-8 bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-xl p-5">
          {selectedTrack ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {t('admin.roadmap.tasks_for', { name: selectedTrack.name })}
                </h3>
                <button onClick={() => setShowTaskForm(true)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-medium rounded-lg transition-colors">
                  <Plus className="w-3.5 h-3.5" />{t('admin.roadmap.add_task')}
                </button>
              </div>
              {tasks.length === 0 ? (
                <div className="text-center py-16 text-sm text-gray-400">{t('admin.roadmap.no_tasks')}</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-[#059669]/30 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-6 h-6 rounded-md bg-gray-200 dark:bg-gray-700 text-xs font-medium flex items-center justify-center text-gray-500 shrink-0">
                            {task.order_index}
                          </span>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</h4>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => editTask(task)}
                            className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10">
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button onClick={() => handleDeleteTask(task)}
                            className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      {task.description && <p className="text-xs text-gray-400 mt-1.5">{task.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 text-sm text-gray-400">{t('admin.roadmap.select_path_hint')}</div>
          )}
        </div>
      </div>

      {/* Track Form Modal */}
      {showTrackForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={resetTrackForm} className="absolute inset-0 bg-black/40" />
          <div className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-gray-700 rounded-xl w-full max-w-md relative z-10 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {editingTrack ? t('admin.roadmap.modals.edit_path') : t('admin.roadmap.modals.new_path')}
              </h3>
              <button onClick={resetTrackForm} className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSaveTrack} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">{t('admin.roadmap.modals.path_name')} *</label>
                <input type="text" value={trackForm.name} onChange={(e) => setTrackForm({ ...trackForm, name: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">{t('admin.roadmap.modals.path_desc')}</label>
                <textarea rows="3" value={trackForm.description} onChange={(e) => setTrackForm({ ...trackForm, description: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none resize-none" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={trackForm.is_primary} onChange={(e) => setTrackForm({ ...trackForm, is_primary: e.target.checked })}
                  className="rounded text-[#059669] focus:ring-[#059669]" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t('admin.roadmap.modals.featured')}</span>
              </label>
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="submit" disabled={loading} className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                  {t('common.save')}
                </button>
                <button type="button" onClick={resetTrackForm} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors">
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Form Modal */}
      {showTaskForm && selectedTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={resetTaskForm} className="absolute inset-0 bg-black/40" />
          <div className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-gray-700 rounded-xl w-full max-w-md relative z-10 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {editingTask ? t('admin.roadmap.modals.edit_task') : t('admin.roadmap.modals.new_task')}
              </h3>
              <button onClick={resetTaskForm} className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSaveTask} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">{t('admin.roadmap.modals.task_title')} *</label>
                <input type="text" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none" required />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">{t('admin.roadmap.modals.task_order')}</label>
                  <input type="number" value={taskForm.order_index} onChange={(e) => setTaskForm({ ...taskForm, order_index: parseInt(e.target.value) || 0 })}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">{t('admin.roadmap.modals.task_desc')}</label>
                  <input type="text" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="submit" disabled={loading} className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                  {t('common.save')}
                </button>
                <button type="button" onClick={resetTaskForm} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors">
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

export default RoadmapManager;
