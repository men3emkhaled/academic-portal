import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
  Map, Plus, Edit3, Trash2, Star, 
  CheckCircle2, ListOrdered, Activity, 
  ChevronRight, LayoutDashboard, Database,
  AlertCircle, Shield, Target, GraduationCap,
  ArrowRight, Settings, Layout, Zap, Search,
  X, Save, Sparkles, Box, Info
} from 'lucide-react';

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
        toast.success(t('common.success'));
      } else {
        await api.post('/roadmap/tracks', trackForm);
        toast.success(t('common.success'));
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
    if (!window.confirm(t('common.confirm_delete'))) return;
    setLoading(true);
    try {
      await api.delete(`/roadmap/tracks/${track.id}`);
      toast.success(t('common.success'));
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
        toast.success(t('common.success'));
      } else {
        await api.post(`/roadmap/tracks/${selectedTrack.id}/tasks`, taskForm);
        toast.success(t('common.success'));
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
    if (!window.confirm(t('common.confirm_delete'))) return;
    setLoading(true);
    try {
      await api.delete(`/roadmap/tasks/${task.id}`);
      toast.success(t('common.success'));
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
    <div className="space-y-8 lg:space-y-10 animate-in fade-in duration-700 pb-10">
      {/* Header Bento Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex items-center gap-6 bg-white/50 dark:bg-white/[0.02] backdrop-blur-md border border-gray-100 dark:border-white/5 p-8 rounded-[2.5rem] shadow-sm">
          <div className="w-16 h-16 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-inner group transition-transform duration-500 hover:scale-110">
            <Map className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {t('admin.roadmap.title')}
            </h2>
            <p className="text-gray-500 dark:text-slate-500 text-sm font-bold mt-1 uppercase tracking-widest">{t('admin.roadmap.description')}</p>
          </div>
        </div>
        
        <div className="bg-indigo-600 text-white p-8 rounded-[2.5rem] shadow-lg shadow-indigo-600/20 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-inline-end-0 top-0 w-32 h-32 bg-white/10 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-black/10 px-3 py-1 rounded-full">Roadmap Node</span>
          </div>
          <div className="mt-4 relative z-10">
            <p className="text-4xl font-black">{tracks.length}</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">Active Tracks</p>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* Left Column: Tracks Sidebar */}
        <div className="xl:col-span-4 space-y-8">
            <div className="bg-white/50 dark:bg-white/[0.01] backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-[3rem] p-8 shadow-sm relative overflow-hidden flex flex-col h-full">
                <div className="flex justify-between items-center mb-8 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                            <Box className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight uppercase">{t('admin.roadmap.available_tracks')}</h3>
                    </div>
                    <button onClick={() => setShowTrackForm(true)} className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all">
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4 overflow-y-auto no-scrollbar relative z-10 flex-1 pr-2">
                    {loading && tracks.length === 0 ? (
                        <div className="flex items-center justify-center py-20 opacity-50">
                            <Activity className="w-10 h-10 text-indigo-500 animate-spin" />
                        </div>
                    ) : tracks.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50/50 dark:bg-white/[0.02] border border-dashed border-gray-100 dark:border-white/10 rounded-[2rem]">
                            <Sparkles className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                            <p className="text-[10px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-widest">{t('admin.roadmap.no_tracks')}</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                        {tracks.map((track) => (
                            <motion.div
                                key={track.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={() => selectTrack(track)}
                                className={`group/track relative p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer overflow-hidden ${
                                    selectedTrack?.id === track.id
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-600/20'
                                        : 'bg-white dark:bg-white/[0.02] border-gray-100 dark:border-white/10 hover:border-indigo-500/30 hover:bg-gray-50/50 dark:hover:bg-white/[0.04]'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <h4 className={`font-black tracking-tight truncate text-sm uppercase ${selectedTrack?.id === track.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{track.name}</h4>
                                        {track.is_primary && <Star className={`w-3.5 h-3.5 shrink-0 ${selectedTrack?.id === track.id ? 'text-white fill-white' : 'text-amber-500 fill-amber-500'}`} />}
                                    </div>
                                    <div className={`flex gap-1.5 transition-all opacity-0 group-hover/track:opacity-100`}>
                                        <button onClick={(e) => { e.stopPropagation(); editTrack(track); }} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${selectedTrack?.id === track.id ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-blue-500/10 text-blue-500 border border-blue-500/10 hover:bg-blue-500 hover:text-white shadow-sm'}`}><Edit3 className="w-3.5 h-3.5" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteTrack(track); }} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${selectedTrack?.id === track.id ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-rose-500/10 text-rose-500 border border-rose-500/10 hover:bg-rose-500 hover:text-white shadow-sm'}`}><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>
                                <p className={`text-[10px] font-bold leading-relaxed line-clamp-2 uppercase tracking-widest ${selectedTrack?.id === track.id ? 'text-indigo-100' : 'text-gray-400 dark:text-slate-500'}`}>{track.description || t('admin.roadmap.no_desc')}</p>
                            </motion.div>
                        ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>

        {/* Right Column: Tasks Management */}
        <div className="xl:col-span-8 space-y-8">
            {selectedTrack ? (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/50 dark:bg-white/[0.01] backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-[3rem] p-10 lg:p-12 shadow-sm relative overflow-hidden group"
                >
                    <div className="absolute -inset-inline-start-20 -top-20 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>

                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center border border-gray-100 dark:border-white/10 shadow-sm relative">
                                    <ListOrdered className="w-7 h-7 text-indigo-500" />
                                    <div className="absolute -top-1 -inset-inline-end-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] font-black text-white border-2 border-white dark:border-[#080808]">{tasks.length}</div>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                                        {t('admin.roadmap.tasks_for', { name: selectedTrack.name })}
                                    </h3>
                                    <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-1">Sequence Alignment Active</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowTaskForm(true)} 
                                className="flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-8 rounded-2xl lg:rounded-[2rem] shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all whitespace-nowrap group/add"
                            >
                                <Plus className="w-5 h-5 group-hover/add:rotate-180 transition-transform duration-500" /> 
                                <span className="uppercase tracking-widest text-xs">{t('admin.roadmap.add_task')}</span>
                            </button>
                        </div>

                        <div className="space-y-6">
                            <AnimatePresence mode="popLayout">
                            {tasks.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-32 bg-white/30 dark:bg-white/[0.01] border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[2.5rem]"
                                >
                                    <Target className="w-14 h-14 text-gray-200 dark:text-gray-800 mx-auto mb-6" />
                                    <p className="text-[11px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-[0.3em]">{t('admin.roadmap.no_tasks')}</p>
                                </motion.div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {tasks.map((task, index) => (
                                        <motion.div 
                                            key={task.id} 
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group/task relative bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8 hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500"
                                        >
                                            <div className="flex justify-between items-start gap-5 relative z-10">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <div className="shrink-0 w-10 h-10 rounded-[1.2rem] bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-white/5 flex items-center justify-center text-[11px] font-black text-indigo-600 dark:text-indigo-400 shadow-inner group-hover/task:bg-indigo-600 group-hover/task:text-white transition-all duration-500">
                                                            {task.order_index}
                                                        </div>
                                                        <h4 className="font-black text-gray-900 dark:text-white tracking-tight truncate text-lg group-hover/task:text-indigo-600 dark:group-hover/task:text-indigo-400 transition-colors uppercase">{task.title}</h4>
                                                    </div>
                                                    {task.description && <p className="text-xs font-bold text-gray-400 dark:text-slate-500 leading-relaxed line-clamp-2 ml-14 italic">{task.description}</p>}
                                                </div>
                                                <div className="flex gap-2.5 shrink-0 opacity-0 group-hover/task:opacity-100 transition-all scale-90 group-hover/task:scale-100">
                                                    <button onClick={() => editTask(task)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-500/5 text-blue-500 border border-blue-500/10 hover:bg-blue-500 hover:text-white transition-all shadow-sm"><Edit3 className="w-4.5 h-4.5" /></button>
                                                    <button onClick={() => handleDeleteTask(task)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-500/5 text-rose-500 border border-rose-500/10 hover:bg-rose-500 hover:text-white transition-all shadow-sm"><Trash2 className="w-4.5 h-4.5" /></button>
                                                </div>
                                            </div>
                                            
                                            <div className="absolute inset-inline-end-10 top-1/2 -translate-y-1/2 opacity-0 group-hover/task:opacity-20 transition-all duration-700 pointer-events-none">
                                                <ArrowRight className="w-12 h-12 text-indigo-500" />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center bg-white/50 dark:bg-white/[0.01] backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-[3rem] p-20 text-center opacity-60">
                    <Map className="w-20 h-20 text-gray-200 dark:text-gray-800 mb-8 animate-pulse" />
                    <h4 className="text-xl font-black uppercase tracking-[0.3em] text-gray-400 dark:text-slate-600">Select a Learning Path</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 dark:text-slate-700 mt-4">Awaiting Track Authorization</p>
                </div>
            )}
        </div>
      </div>

      {/* TRACK FORM MODAL */}
      <AnimatePresence>
      {showTrackForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={resetTrackForm} className="absolute inset-0 bg-gray-950/40 dark:bg-black/80 backdrop-blur-md" />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white dark:bg-[#080808] border border-gray-100 dark:border-white/5 rounded-[3.5rem] p-8 lg:p-12 w-full max-w-2xl shadow-2xl relative overflow-hidden z-10" onClick={e => e.stopPropagation()}>
             {/* Modal Background Glow */}
             <div className="absolute top-0 inset-inline-end-0 w-80 h-80 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>

             <div className="relative z-10">
                <div className="flex items-center justify-between mb-10 pb-8 border-b border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-[1.5rem] flex items-center justify-center border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                          {editingTrack ? <Edit3 className="w-8 h-8" /> : <Plus className="w-8 h-8" />}
                      </div>
                      <div>
                          <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                              {editingTrack ? t('admin.roadmap.modals.edit_path') : t('admin.roadmap.modals.new_path')}
                          </h3>
                          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Locus Protocol Definition</p>
                      </div>
                    </div>
                    <button onClick={resetTrackForm} className="w-12 h-12 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center transition-colors">
                      <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSaveTrack} className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.roadmap.modals.path_name')} *</label>
                        <div className="relative">
                            <Box className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input type="text" placeholder="e.g. Frontend Architecture" value={trackForm.name} onChange={(e) => setTrackForm({ ...trackForm, name: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl ps-14 pe-6 py-5 font-black focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-inner" required />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.roadmap.modals.path_desc')}</label>
                        <textarea placeholder="Relay path details to students..." rows="3" value={trackForm.description} onChange={(e) => setTrackForm({ ...trackForm, description: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-[2rem] p-8 font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-inner resize-none min-h-[120px]" />
                    </div>
                    
                    <label className="flex items-center gap-6 cursor-pointer group w-fit p-6 bg-gray-50 dark:bg-white/[0.01] rounded-[2rem] border border-gray-100 dark:border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all shadow-inner">
                        <div className={`w-14 h-8 rounded-full p-1.5 transition-all duration-500 ${trackForm.is_primary ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-white/10'}`}>
                            <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-500 shadow-sm ${trackForm.is_primary ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                        <span className="flex items-center gap-3 text-xs font-black text-gray-700 dark:text-slate-300 uppercase tracking-widest">
                            <Star className={`w-5 h-5 ${trackForm.is_primary ? 'text-amber-500 fill-amber-500' : 'text-gray-400 dark:text-slate-700'}`} /> {t('admin.roadmap.modals.featured')}
                        </span>
                        <input type="checkbox" checked={trackForm.is_primary} onChange={(e) => setTrackForm({ ...trackForm, is_primary: e.target.checked })} className="hidden" /> 
                    </label>

                    <div className="flex gap-6 pt-10 border-t border-gray-100 dark:border-white/5">
                        <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-[2.5rem] shadow-xl shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                            {loading ? <Activity className="w-6 h-6 animate-spin" /> : <><CheckCircle2 className="w-6 h-6" /> <span className="uppercase tracking-widest text-xs">{t('common.save')}</span></>}
                        </button>
                        <button type="button" onClick={resetTrackForm} className="px-14 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-black py-5 rounded-[2.5rem] transition-all uppercase tracking-widest text-xs">{t('common.cancel')}</button>
                    </div>
                </form>
             </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* TASK FORM MODAL */}
      <AnimatePresence>
      {showTaskForm && selectedTrack && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={resetTaskForm} className="absolute inset-0 bg-gray-950/40 dark:bg-black/80 backdrop-blur-md" />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white dark:bg-[#080808] border border-gray-100 dark:border-white/5 rounded-[3.5rem] p-8 lg:p-12 w-full max-w-2xl shadow-2xl relative overflow-hidden z-10" onClick={e => e.stopPropagation()}>
             {/* Modal Background Glow */}
             <div className="absolute top-0 inset-inline-end-0 w-80 h-80 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>

             <div className="relative z-10">
                <div className="flex items-center justify-between mb-10 pb-8 border-b border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-[1.5rem] flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                          <Target className="w-8 h-8" />
                      </div>
                      <div>
                          <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                              {editingTask ? t('admin.roadmap.modals.edit_task') : t('admin.roadmap.modals.new_task')}
                          </h3>
                          <p className="text-emerald-600 text-[10px] font-black uppercase tracking-widest mt-1">Node Sequence Alignment</p>
                      </div>
                    </div>
                    <button onClick={resetTaskForm} className="w-12 h-12 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center transition-colors">
                      <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSaveTask} className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.roadmap.modals.task_title')} *</label>
                        <div className="relative">
                            <Zap className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input type="text" placeholder="e.g. Master React Concurrency" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl ps-14 pe-6 py-5 font-black focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-inner" required />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="md:col-span-1 space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.roadmap.modals.task_order')}</label>
                            <div className="relative">
                                <ListOrdered className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type="number" placeholder="1" value={taskForm.order_index} onChange={(e) => setTaskForm({ ...taskForm, order_index: parseInt(e.target.value) || 0 })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl ps-14 pe-6 py-5 font-black focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-inner" />
                            </div>
                        </div>
                        <div className="md:col-span-3 space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.roadmap.modals.task_desc')}</label>
                            <div className="relative">
                                <Info className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type="text" placeholder="Mission parameters..." value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl ps-14 pe-6 py-5 font-black focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-inner" />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-6 pt-10 border-t border-gray-100 dark:border-white/5">
                        <button type="submit" disabled={loading} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-5 rounded-[2.5rem] shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                            {loading ? <Activity className="w-6 h-6 animate-spin" /> : <><CheckCircle2 className="w-6 h-6" /> <span className="uppercase tracking-widest text-xs">{t('common.save')}</span></>}
                        </button>
                        <button type="button" onClick={resetTaskForm} className="px-14 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-black py-5 rounded-[2.5rem] transition-all uppercase tracking-widest text-xs">{t('common.cancel')}</button>
                    </div>
                </form>
             </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default RoadmapManager;