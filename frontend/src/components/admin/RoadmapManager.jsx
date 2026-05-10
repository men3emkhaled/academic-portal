import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Map, Plus, Edit3, Trash2, Star, 
  CheckCircle2, ListOrdered, Activity, 
  ChevronRight, LayoutDashboard, Database,
  AlertCircle, Shield, Target, GraduationCap,
  ArrowRight, Settings, Layout
} from 'lucide-react';

const RoadmapManager = () => {
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

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/roadmap/tracks');
      setTracks(res.data);
      if (res.data.length > 0 && !selectedTrack) {
        setSelectedTrack(res.data[0]);
        fetchTasks(res.data[0].id);
      }
    } catch (error) {
      toast.error('Failed to load learning paths');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (trackId) => {
    setLoading(true);
    try {
      const res = await api.get(`/roadmap/tracks/${trackId}/tasks`);
      setTasks(res.data);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingTrack) {
        await api.put(`/roadmap/tracks/${editingTrack.id}`, trackForm);
        toast.success('Path updated successfully');
      } else {
        await api.post('/roadmap/tracks', trackForm);
        toast.success('New learning path added');
      }
      resetTrackForm();
      fetchTracks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save path');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrack = async (track) => {
    if (!window.confirm(`Are you sure you want to delete the path "${track.name}"? This will delete all tasks inside it.`)) return;
    setLoading(true);
    try {
      await api.delete(`/roadmap/tracks/${track.id}`);
      toast.success('Path deleted successfully');
      if (selectedTrack?.id === track.id) {
        setSelectedTrack(null);
        setTasks([]);
      }
      fetchTracks();
    } catch (error) {
      toast.error('Failed to delete path');
    } finally {
      setLoading(false);
    }
  };

  const editTrack = (track) => {
    setEditingTrack(track);
    setTrackForm({
      name: track.name,
      description: track.description || '',
      is_primary: track.is_primary || false,
    });
    setShowTrackForm(true);
  };

  const resetTrackForm = () => {
    setShowTrackForm(false);
    setEditingTrack(null);
    setTrackForm({ name: '', description: '', is_primary: false });
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!selectedTrack) {
      toast.error('Please select a path first');
      return;
    }
    setLoading(true);
    try {
      if (editingTask) {
        await api.put(`/roadmap/tasks/${editingTask.id}`, taskForm);
        toast.success('Task updated successfully');
      } else {
        await api.post(`/roadmap/tracks/${selectedTrack.id}/tasks`, taskForm);
        toast.success('New task added');
      }
      resetTaskForm();
      fetchTasks(selectedTrack.id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (task) => {
    if (!window.confirm(`Are you sure you want to delete the task "${task.title}"?`)) return;
    setLoading(true);
    try {
      await api.delete(`/roadmap/tasks/${task.id}`);
      toast.success('Task deleted successfully');
      fetchTasks(selectedTrack.id);
    } catch (error) {
      toast.error('Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  const editTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      order_index: task.order_index || 0,
    });
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
    <div className="animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-inner">
            <Map className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Learning Paths
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold mt-1">Manage student learning paths and goals</p>
          </div>
        </div>
        <button
          onClick={() => setShowTrackForm(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 px-6 rounded-xl shadow-md hover:shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-5 h-5" /> Add New Path
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Track Grid Section */}
        <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[70px] pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-inner">
                        <GraduationCap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Available Tracks</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-0.5">Choose a path to edit its tasks</p>
                    </div>
                </div>

                {loading && tracks.length === 0 ? (
                    <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 py-10 px-4">
                        <Activity className="w-5 h-5 animate-spin" />
                        <span className="text-sm font-bold uppercase tracking-widest">Loading tracks...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {tracks.map((track) => (
                            <div
                                key={track.id}
                                className={`group/track relative p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer overflow-hidden ${
                                    selectedTrack?.id === track.id
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-500/20'
                                        : 'bg-gray-50/50 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:bg-white dark:hover:bg-white/[0.04]'
                                }`}
                                onClick={() => selectTrack(track)}
                            >
                                {/* Active Indicator Glow */}
                                {selectedTrack?.id === track.id && (
                                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-[40px] pointer-events-none"></div>
                                )}

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className={`font-black tracking-tight truncate text-base uppercase ${selectedTrack?.id === track.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{track.name}</h4>
                                            {track.is_primary && <Star className={`w-4 h-4 ${selectedTrack?.id === track.id ? 'text-white fill-white' : 'text-yellow-500 fill-yellow-500'}`} />}
                                        </div>
                                    </div>
                                    <div className={`flex gap-1 transition-all ${selectedTrack?.id === track.id ? 'opacity-100' : 'opacity-0 group-hover/track:opacity-100'}`}>
                                        <button onClick={(e) => { e.stopPropagation(); editTrack(track); }} className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${selectedTrack?.id === track.id ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-white dark:bg-white/5 text-amber-600 dark:text-amber-500 hover:bg-amber-500 hover:text-white shadow-sm'}`}><Edit3 className="w-4 h-4" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteTrack(track); }} className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${selectedTrack?.id === track.id ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-red-50 dark:bg-rose-500/10 text-red-600 dark:text-rose-500 hover:bg-red-600 hover:text-white shadow-sm'}`}><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <p className={`text-xs font-bold leading-relaxed line-clamp-2 ${selectedTrack?.id === track.id ? 'text-indigo-100' : 'text-gray-500 dark:text-gray-400'}`}>{track.description || 'No description set for this path.'}</p>
                            </div>
                        ))}
                        {tracks.length === 0 && (
                            <div className="col-span-full border-2 border-dashed border-gray-200 dark:border-white/5 rounded-[2rem] py-16 text-center">
                                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                                <p className="text-sm font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em]">No tracks found</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* Selected Track Workspace */}
        {selectedTrack && (
            <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-sm relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[70px] pointer-events-none"></div>

                <div className="p-8 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01] flex flex-wrap justify-between items-center gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl flex items-center justify-center shadow-inner">
                            <ListOrdered className="w-6 h-6 text-indigo-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                                Tasks for <span className="text-indigo-600 dark:text-indigo-400">{selectedTrack.name}</span>
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold mt-0.5 truncate max-w-[400px]">{selectedTrack.description || 'No description'}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowTaskForm(true)} 
                        className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                    >
                        <Plus className="w-4.5 h-4.5" /> Add New Task
                    </button>
                </div>

                <div className="p-8 relative z-10">
                    {tasks.length === 0 ? (
                        <div className="text-center py-24">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <Target className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                            </div>
                            <p className="text-sm font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em]">No tasks found for this path</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {tasks.map((task, index) => (
                                <div key={task.id} className="group/task relative bg-gray-50/50 dark:bg-black/30 border border-gray-200 dark:border-white/5 rounded-[2rem] p-6 hover:bg-white dark:hover:bg-white/[0.03] hover:border-indigo-500/30 transition-all duration-300 shadow-sm hover:shadow-lg">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-4 mb-3">
                                                <div className="shrink-0 w-10 h-10 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-white/10 flex items-center justify-center text-sm font-black text-indigo-600 dark:text-indigo-400 shadow-inner group-hover/task:bg-indigo-600 group-hover/task:text-white transition-all">
                                                    {task.order_index}
                                                </div>
                                                <h4 className="font-black text-gray-900 dark:text-white tracking-tight truncate text-lg group-hover/task:text-indigo-600 dark:group-hover/task:text-indigo-400 transition-colors">{task.title}</h4>
                                            </div>
                                            {task.description && <p className="text-xs text-gray-500 dark:text-gray-400 font-bold leading-relaxed line-clamp-2 ml-14">{task.description}</p>}
                                        </div>
                                        <div className="flex gap-2 shrink-0 opacity-100 md:opacity-0 md:group-hover/task:opacity-100 transition-all">
                                            <button onClick={() => editTask(task)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-white/5 text-amber-600 dark:text-amber-500 hover:bg-amber-500 hover:text-white transition-all shadow-sm"><Edit3 className="w-4.5 h-4.5" /></button>
                                            <button onClick={() => handleDeleteTask(task)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 dark:bg-rose-500/10 text-red-600 dark:text-rose-500 hover:bg-red-600 hover:text-white transition-all shadow-sm"><Trash2 className="w-4.5 h-4.5" /></button>
                                        </div>
                                    </div>
                                    
                                    <div className="absolute top-1/2 -right-4 -translate-y-1/2 opacity-0 group-hover/task:opacity-100 group-hover/task:right-6 transition-all duration-300 pointer-events-none">
                                        <ArrowRight className="w-5 h-5 text-indigo-500/30" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>

      {/* TRACK FORM MODAL */}
      {showTrackForm && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={resetTrackForm}>
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-10 w-full max-w-xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            {/* Modal Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-5 mb-10 pb-6 border-b border-gray-100 dark:border-white/10">
                    <div className="w-14 h-14 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                        {editingTrack ? <Edit3 className="w-7 h-7" /> : <Plus className="w-7 h-7" />}
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                            {editingTrack ? 'Edit Path' : 'Add New Path'}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-bold mt-1">Enter path details below</p>
                    </div>
                </div>

                <form onSubmit={handleSaveTrack} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Path Name <span className="text-rose-500">*</span></label>
                        <input type="text" placeholder="e.g. Frontend Web Development" value={trackForm.name} onChange={(e) => setTrackForm({ ...trackForm, name: e.target.value })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-inner" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Description</label>
                        <textarea placeholder="Tell students what this path covers..." rows="3" value={trackForm.description} onChange={(e) => setTrackForm({ ...trackForm, description: e.target.value })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-inner resize-none scrollbar-hide" />
                    </div>
                    
                    <label className="flex items-center gap-4 cursor-pointer group w-fit p-4 bg-gray-50/50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-all">
                        <div className={`w-12 h-7 rounded-full p-1 transition-all duration-300 ${trackForm.is_primary ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                            <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-sm ${trackForm.is_primary ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </div>
                        <span className="flex items-center gap-2 text-sm font-black text-gray-700 dark:text-gray-300">
                            <Star className={`w-4 h-4 ${trackForm.is_primary ? 'text-amber-500 fill-amber-500' : 'text-gray-400'}`} /> Set as Featured Path
                        </span>
                        <input type="checkbox" checked={trackForm.is_primary} onChange={(e) => setTrackForm({ ...trackForm, is_primary: e.target.checked })} className="hidden" /> 
                    </label>

                    <div className="flex gap-4 pt-6 border-t border-gray-100 dark:border-white/10">
                        <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50">
                            {loading ? <Activity className="w-6 h-6 animate-spin mx-auto" /> : 'Save Path'}
                        </button>
                        <button type="button" onClick={resetTrackForm} className="px-10 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-bold py-4 rounded-2xl transition-all">Cancel</button>
                    </div>
                </form>
            </div>
          </div>
        </div>
      )}

      {/* TASK FORM MODAL */}
      {showTaskForm && selectedTrack && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={resetTaskForm}>
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-10 w-full max-w-xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            {/* Modal Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-5 mb-10 pb-6 border-b border-gray-100 dark:border-white/10">
                    <div className="w-14 h-14 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                        <Target className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                            {editingTask ? 'Edit Task' : 'Add New Task'}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-bold mt-1">For path: {selectedTrack.name}</p>
                    </div>
                </div>

                <form onSubmit={handleSaveTask} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Task Title <span className="text-rose-500">*</span></label>
                        <input type="text" placeholder="e.g. Master HTML & CSS Basics" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all shadow-inner" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-1 space-y-2">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Order</label>
                            <input type="number" placeholder="1" value={taskForm.order_index} onChange={(e) => setTaskForm({ ...taskForm, order_index: parseInt(e.target.value) || 0 })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all shadow-inner" />
                        </div>
                        <div className="md:col-span-3 space-y-2">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Description</label>
                            <input type="text" placeholder="What should students do?" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all shadow-inner" />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6 border-t border-gray-100 dark:border-white/10">
                        <button type="submit" disabled={loading} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50">
                            {loading ? <Activity className="w-6 h-6 animate-spin mx-auto" /> : 'Save Task'}
                        </button>
                        <button type="button" onClick={resetTaskForm} className="px-10 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-bold py-4 rounded-2xl transition-all">Cancel</button>
                    </div>
                </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapManager;