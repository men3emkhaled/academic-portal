import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Map, Plus, Edit3, Trash2, Star, 
  CheckCircle2, ListOrdered, Activity, 
  ChevronRight, LayoutDashboard, Database,
  AlertCircle, Shield, Target, GraduationCap
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
      toast.error('Failed to load tracks');
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
        toast.success('Career node recalibrated');
      } else {
        await api.post('/roadmap/tracks', trackForm);
        toast.success('New career path initialized');
      }
      resetTrackForm();
      fetchTracks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failure');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrack = async (track) => {
    if (!window.confirm(`Decommission career track "${track.name}"? ALL associated tasks will be purged.`)) return;
    setLoading(true);
    try {
      await api.delete(`/roadmap/tracks/${track.id}`);
      toast.success('Career node purged');
      if (selectedTrack?.id === track.id) {
        setSelectedTrack(null);
        setTasks([]);
      }
      fetchTracks();
    } catch (error) {
      toast.error('Purge failure');
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
      toast.error('Select a root node first');
      return;
    }
    setLoading(true);
    try {
      if (editingTask) {
        await api.put(`/roadmap/tasks/${editingTask.id}`, taskForm);
        toast.success('Milestone updated');
      } else {
        await api.post(`/roadmap/tracks/${selectedTrack.id}/tasks`, taskForm);
        toast.success('New milestone added');
      }
      resetTaskForm();
      fetchTasks(selectedTrack.id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failure');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (task) => {
    if (!window.confirm(`Purge milestone "${task.title}"?`)) return;
    setLoading(true);
    try {
      await api.delete(`/roadmap/tasks/${task.id}`);
      toast.success('Milestone detached');
      fetchTasks(selectedTrack.id);
    } catch (error) {
      toast.error('Purge failure');
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
    <div className="animate-fadeIn pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-2 h-10 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              <Map className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Roadmap Engine
            </h2>
            <p className="text-gray-500 dark:text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Career Tracks & Milestone Architecture</p>
          </div>
        </div>
        <button
          onClick={() => setShowTrackForm(true)}
          className="admin-btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> New Career Node
        </button>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {/* Track Grid Section */}
        <div className="admin-card relative overflow-hidden group transition-colors">
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/20 dark:border-indigo-500/30">
                        <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Active Learning Tracks</h3>
                        <p className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase tracking-widest">Root node configuration</p>
                    </div>
                </div>

                {loading && tracks.length === 0 ? (
                    <div className="flex items-center gap-3 text-gray-500 dark:text-slate-500 py-10">
                        <Activity className="w-4 h-4 animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Hydrating Nodes...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {tracks.map((track) => (
                            <div
                                key={track.id}
                                className={`group/track relative p-6 rounded-[2rem] border transition-all duration-500 cursor-pointer transition-colors ${
                                    selectedTrack?.id === track.id
                                        ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_20px_40px_rgba(99,102,241,0.1)]'
                                        : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/5 hover:border-indigo-500/30 dark:hover:border-white/20 hover:bg-white dark:hover:bg-white/[0.04]'
                                }`}
                                onClick={() => selectTrack(track)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className={`font-black tracking-tight truncate transition-colors uppercase text-sm ${selectedTrack?.id === track.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white group-hover/track:text-indigo-600 dark:group-hover/track:text-indigo-400'}`}>{track.name}</h4>
                                            {track.is_primary && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                                        </div>
                                    </div>
                                    <div className="flex gap-1.5 opacity-0 group-hover/track:opacity-100 transition-all">
                                        <button onClick={(e) => { e.stopPropagation(); editTrack(track); }} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 dark:bg-white/5 text-yellow-600 dark:text-yellow-500 hover:bg-yellow-600 dark:hover:bg-yellow-500 hover:text-white dark:hover:text-black transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteTrack(track); }} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 dark:bg-red-400/10 text-red-600 dark:text-red-400 hover:bg-red-600 dark:hover:bg-red-400 hover:text-white transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-500 dark:text-slate-500 font-medium leading-relaxed line-clamp-2">{track.description || 'No definition set for this node.'}</p>
                                
                                {selectedTrack?.id === track.id && (
                                    <div className="absolute bottom-4 right-6 text-indigo-500 animate-pulse">
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {tracks.length === 0 && (
                            <div className="col-span-full border border-dashed border-gray-200 dark:border-white/5 rounded-[2rem] py-12 text-center grayscale opacity-20">
                                <AlertCircle className="w-10 h-10 mx-auto mb-2" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Void Registry</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* Selected Track Workspace */}
        {selectedTrack && (
            <div className="bg-white dark:bg-[#111111]/40 border border-gray-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm dark:shadow-2xl animate-fadeIn transition-colors">
                <div className="p-8 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] flex flex-wrap justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                        <div>
                            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.1em] flex items-center gap-2">
                                Task Matrix for <span className="text-indigo-600 dark:text-indigo-400">{selectedTrack.name}</span>
                            </h3>
                            <p className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase tracking-widest mt-0.5 truncate max-w-[300px]">{selectedTrack.description}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowTaskForm(true)} 
                        className="px-6 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Inject Milestone
                    </button>
                </div>

                <div className="p-8">
                    {tasks.length === 0 ? (
                        <div className="text-center py-24 grayscale opacity-10">
                            <ListOrdered className="w-16 h-16 mx-auto mb-4" />
                            <p className="text-sm font-black uppercase tracking-[0.3em]">Milestone void detected</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tasks.map((task) => (
                                <div key={task.id} className="group/task relative bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-3xl p-6 hover:bg-white dark:hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all duration-300 transition-colors">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-200 dark:bg-slate-900 border border-gray-300 dark:border-white/5 flex items-center justify-center text-[10px] font-black text-indigo-600 dark:text-indigo-400 group-hover/task:bg-indigo-500/20 transition-all lowercase">0x{task.order_index < 10 ? '0' : ''}{task.order_index}</span>
                                                <h4 className="font-black text-gray-900 dark:text-white tracking-tight truncate text-sm">{task.title}</h4>
                                            </div>
                                            {task.description && <p className="text-[10px] text-gray-500 dark:text-slate-500 font-medium leading-relaxed line-clamp-2">{task.description}</p>}
                                        </div>
                                        <div className="flex gap-1.5 opacity-0 group-hover/task:opacity-100 transition-all">
                                            <button onClick={() => editTask(task)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 dark:bg-white/5 text-yellow-600 dark:text-yellow-500 hover:bg-yellow-600 dark:hover:bg-yellow-500 hover:text-white dark:hover:text-black transition-all"><Edit3 className="w-4 h-4" /></button>
                                            <button onClick={() => handleDeleteTask(task)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-500/10 dark:bg-red-400/10 text-red-600 dark:text-red-400 hover:bg-red-600 dark:hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    
                                    <div className="absolute top-1/2 -right-4 -translate-y-1/2 opacity-0 group-hover/task:opacity-100 group-hover/task:right-4 transition-all">
                                        <ChevronRight className="w-4 h-4 text-indigo-500/50" />
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
        <div className="admin-modal-backdrop" onClick={resetTrackForm}>
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-12 w-full max-w-lg shadow-2xl relative overflow-hidden animate-fadeInUp transition-colors" onClick={e => e.stopPropagation()}>
            
            <div className="relative z-10">
                <div className="flex items-center gap-5 mb-10">
                    <div className="w-14 h-14 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/20 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400">
                        {editingTrack ? <Edit3 className="w-7 h-7" /> : <Plus className="w-7 h-7" />}
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                            {editingTrack ? 'Calibrate Node' : 'Initialize Axis'}
                        </h3>
                        <p className="text-gray-500 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">Career Pathway Definition Interface</p>
                    </div>
                </div>

                <form onSubmit={handleSaveTrack} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4">Node Identity *</label>
                        <input type="text" placeholder="e.g. Applied Intelligence Engineer" value={trackForm.name} onChange={(e) => setTrackForm({ ...trackForm, name: e.target.value })} className="admin-input" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4">Logical Rationale</label>
                        <textarea placeholder="Sector overview and objectives..." rows="3" value={trackForm.description} onChange={(e) => setTrackForm({ ...trackForm, description: e.target.value })} className="admin-input scrollbar-hide" />
                    </div>
                    
                    <label className="flex items-center gap-3 cursor-pointer group w-fit">
                        <div className={`w-10 h-6 rounded-full p-1 transition-all duration-300 ${trackForm.is_primary ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-slate-800'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${trackForm.is_primary ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </div>
                        <span className="text-[10px] font-black uppercase text-gray-500 dark:text-slate-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors tracking-widest flex items-center gap-2">
                            <Star className={`w-3.5 h-3.5 ${trackForm.is_primary ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 dark:text-slate-600'}`} /> SET_AS_PRIMARY_NODE
                        </span>
                        <input type="checkbox" checked={trackForm.is_primary} onChange={(e) => setTrackForm({ ...trackForm, is_primary: e.target.checked })} className="hidden" /> 
                    </label>

                    <div className="flex gap-4 pt-6">
                        <button type="submit" disabled={loading} className="flex-1 admin-btn-primary h-[65px] font-black uppercase tracking-widest">
                            {loading ? <Activity className="w-6 h-6 animate-spin mx-auto" /> : (editingTrack ? 'COMMIT_OVERWRITE' : 'INITIALIZE_NODE')}
                        </button>
                        <button type="button" onClick={resetTrackForm} className="px-10 admin-btn-secondary h-[65px] font-bold uppercase">ABORT</button>
                    </div>
                </form>
            </div>
          </div>
        </div>
      )}

      {/* TASK FORM MODAL */}
      {showTaskForm && selectedTrack && (
        <div className="admin-modal-backdrop" onClick={resetTaskForm}>
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-12 w-full max-w-lg shadow-2xl relative overflow-hidden animate-fadeInUp transition-colors" onClick={e => e.stopPropagation()}>
            
            <div className="relative z-10">
                <div className="flex items-center gap-5 mb-10">
                    <div className="w-14 h-14 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                        <Target className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                            {editingTask ? 'Reorder Milestone' : 'Inject Milestone'}
                        </h3>
                        <p className="text-gray-500 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">Linked to: {selectedTrack.name}</p>
                    </div>
                </div>

                <form onSubmit={handleSaveTask} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4">Milestone Label *</label>
                        <input type="text" placeholder="e.g. Distributed Consensus IV" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} className="admin-input" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-1 space-y-2">
                            <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4">Sequence</label>
                            <input type="number" placeholder="00" value={taskForm.order_index} onChange={(e) => setTaskForm({ ...taskForm, order_index: parseInt(e.target.value) || 0 })} className="admin-input" />
                        </div>
                        <div className="md:col-span-3 space-y-2">
                            <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4">Operational Rationale</label>
                            <input type="text" placeholder="Technical objectives..." value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} className="admin-input" />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button type="submit" disabled={loading} className="flex-1 admin-btn-primary h-[65px] bg-emerald-500 dark:bg-emerald-600 border-none font-black uppercase tracking-widest">
                            {loading ? <Activity className="w-6 h-6 animate-spin mx-auto" /> : (editingTask ? 'APPLY_REORDER' : 'COMMIT_INJECTION')}
                        </button>
                        <button type="button" onClick={resetTaskForm} className="px-10 admin-btn-secondary h-[65px] font-bold uppercase">ABORT</button>
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