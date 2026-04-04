import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const RoadmapManager = () => {
  const [tracks, setTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Track form state
  const [showTrackForm, setShowTrackForm] = useState(false);
  const [editingTrack, setEditingTrack] = useState(null);
  const [trackForm, setTrackForm] = useState({ name: '', description: '', is_primary: false });
  
  // Task form state
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

  // ---------- Track CRUD ----------
  const handleSaveTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingTrack) {
        await api.put(`/roadmap/tracks/${editingTrack.id}`, trackForm);
        toast.success('Track updated');
      } else {
        await api.post('/roadmap/tracks', trackForm);
        toast.success('Track created');
      }
      resetTrackForm();
      fetchTracks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrack = async (track) => {
    if (!window.confirm(`Delete track "${track.name}" and all its tasks?`)) return;
    setLoading(true);
    try {
      await api.delete(`/roadmap/tracks/${track.id}`);
      toast.success('Track deleted');
      if (selectedTrack?.id === track.id) {
        setSelectedTrack(null);
        setTasks([]);
      }
      fetchTracks();
    } catch (error) {
      toast.error('Delete failed');
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

  // ---------- Task CRUD ----------
  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!selectedTrack) {
      toast.error('Select a track first');
      return;
    }
    setLoading(true);
    try {
      if (editingTask) {
        await api.put(`/roadmap/tasks/${editingTask.id}`, taskForm);
        toast.success('Task updated');
      } else {
        await api.post(`/roadmap/tracks/${selectedTrack.id}/tasks`, taskForm);
        toast.success('Task added');
      }
      resetTaskForm();
      fetchTasks(selectedTrack.id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (task) => {
    if (!window.confirm(`Delete task "${task.title}"?`)) return;
    setLoading(true);
    try {
      await api.delete(`/roadmap/tasks/${task.id}`);
      toast.success('Task deleted');
      fetchTasks(selectedTrack.id);
    } catch (error) {
      toast.error('Delete failed');
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
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-primary">Career Tracks & Tasks Management</h2>

      {/* Tracks Section */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Career Tracks</h3>
          <button
            onClick={() => setShowTrackForm(true)}
            className="bg-primary text-dark px-3 py-1 rounded-lg text-sm hover:scale-105 transition"
          >
            + New Track
          </button>
        </div>

        {loading && <p className="text-gray-400">Loading tracks...</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tracks.map((track) => (
            <div
              key={track.id}
              className={`p-3 rounded-lg border cursor-pointer transition ${
                selectedTrack?.id === track.id
                  ? 'bg-primary/20 border-primary'
                  : 'bg-white/5 border-white/10 hover:border-primary/50'
              }`}
              onClick={() => selectTrack(track)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-white">{track.name}</h4>
                  <p className="text-xs text-gray-400 line-clamp-1">{track.description}</p>
                  {track.is_primary && <span className="text-xs text-primary">⭐ Primary</span>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); editTrack(track); }}
                    className="text-yellow-400 text-sm"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteTrack(track); }}
                    className="text-red-400 text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
          {tracks.length === 0 && !loading && (
            <p className="text-gray-400 col-span-full">No tracks yet. Create one.</p>
          )}
        </div>
      </div>

      {/* Tasks Section (visible when track selected) */}
      {selectedTrack && (
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Tasks for <span className="text-primary">{selectedTrack.name}</span>
              </h3>
              <p className="text-xs text-gray-400">{selectedTrack.description}</p>
            </div>
            <button
              onClick={() => setShowTaskForm(true)}
              className="bg-primary text-dark px-3 py-1 rounded-lg text-sm hover:scale-105 transition"
            >
              + New Task
            </button>
          </div>

          {tasks.length === 0 ? (
            <p className="text-gray-400">No tasks yet. Add tasks for this track.</p>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className="bg-dark/50 rounded-lg p-3 border border-white/10 flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Order: {task.order_index}
                      </span>
                      <h4 className="font-semibold text-white">{task.title}</h4>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-400 mt-1">{task.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-3">
                    <button onClick={() => editTask(task)} className="text-yellow-400 text-sm">
                      ✏️
                    </button>
                    <button onClick={() => handleDeleteTask(task)} className="text-red-400 text-sm">
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Track Form Modal */}
      {showTrackForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-primary/30 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-primary mb-4">
              {editingTrack ? 'Edit Track' : 'New Track'}
            </h3>
            <form onSubmit={handleSaveTrack} className="space-y-4">
              <input
                type="text"
                placeholder="Track Name (e.g., AI Engineer)"
                value={trackForm.name}
                onChange={(e) => setTrackForm({ ...trackForm, name: e.target.value })}
                className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white"
                required
              />
              <textarea
                placeholder="Description"
                rows="3"
                value={trackForm.description}
                onChange={(e) => setTrackForm({ ...trackForm, description: e.target.value })}
                className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white"
              />
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={trackForm.is_primary}
                  onChange={(e) => setTrackForm({ ...trackForm, is_primary: e.target.checked })}
                />
                Primary Track (shown first to students)
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-primary text-dark font-semibold py-2 rounded-xl">
                  Save
                </button>
                <button type="button" onClick={resetTrackForm} className="px-4 py-2 border border-white/20 rounded-xl">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Form Modal */}
      {showTaskForm && selectedTrack && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-primary/30 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-primary mb-4">
              {editingTask ? 'Edit Task' : 'New Task'} for {selectedTrack.name}
            </h3>
            <form onSubmit={handleSaveTask} className="space-y-4">
              <input
                type="text"
                placeholder="Task Title (e.g., Python Programming)"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white"
                required
              />
              <textarea
                placeholder="Description"
                rows="2"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white"
              />
              <input
                type="number"
                placeholder="Order (lower number = higher priority)"
                value={taskForm.order_index}
                onChange={(e) => setTaskForm({ ...taskForm, order_index: parseInt(e.target.value) || 0 })}
                className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white"
              />
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-primary text-dark font-semibold py-2 rounded-xl">
                  Save
                </button>
                <button type="button" onClick={resetTaskForm} className="px-4 py-2 border border-white/20 rounded-xl">
                  Cancel
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