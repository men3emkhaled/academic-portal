import React, { useState, useEffect } from 'react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import studentApi from '../services/studentApi';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';

const StudentRoadmap = () => {
  const { student, logout } = useStudentAuth();
  const navigate = useNavigate();
  const [tracks, setTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!student) {
      navigate('/student/login');
      return;
    }
    fetchTracks();
  }, [student, navigate]);

  const fetchTracks = async () => {
    try {
      console.log('📤 Fetching tracks from: /roadmap/tracks');
      const response = await api.get('/roadmap/tracks');
      console.log('✅ Tracks response:', response.data);
      setTracks(response.data);
      if (response.data.length > 0) {
        setSelectedTrack(response.data[0]);
        fetchTrackDetails(response.data[0].id);
      }
    } catch (error) {
      console.error('❌ Error fetching tracks:', error);
      toast.error('Failed to load roadmap');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrackDetails = async (trackId) => {
    setLoading(true);
    try {
      console.log(`📤 Fetching tasks for track ${trackId}`);
      const tasksResponse = await api.get(`/roadmap/tracks/${trackId}/tasks`);
      console.log('✅ Tasks response:', tasksResponse.data);
      setTasks(tasksResponse.data);
      
      const progressResponse = await studentApi.get(`/roadmap/progress/${trackId}`);
      console.log('✅ Progress response:', progressResponse.data);
      setProgress(progressResponse.data);
    } catch (error) {
      console.error('❌ Error fetching track details:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskId, currentStatus) => {
    setUpdating(true);
    try {
      await studentApi.post('/roadmap/toggle-task', {
        taskId,
        isCompleted: !currentStatus
      });
      
      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { ...task, is_completed: !currentStatus }
          : task
      ));
      
      const newProgress = { ...progress };
      if (!currentStatus) {
        newProgress.completed_tasks += 1;
      } else {
        newProgress.completed_tasks -= 1;
      }
      newProgress.percentage = Math.round((newProgress.completed_tasks / newProgress.total_tasks) * 100);
      setProgress(newProgress);
      
      toast.success(currentStatus ? 'Task marked as incomplete' : 'Task completed! 🎉');
    } catch (error) {
      console.error('Error toggling task:', error);
      toast.error('Failed to update task');
    } finally {
      setUpdating(false);
    }
  };

  const handleTrackChange = (trackId) => {
    const track = tracks.find(t => t.id === parseInt(trackId));
    setSelectedTrack(track);
    fetchTrackDetails(trackId);
  };

  const handleLogout = () => {
    logout();
    navigate('/student/login');
    toast.success('Logged out successfully');
  };

  if (loading && tracks.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-dark">
      <Sidebar activePage="roadmap" onLogout={handleLogout} />
      
      <div className="flex-1 ml-0 md:ml-64 pb-20 md:pb-8 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-primary mb-2">🗺️ Career Roadmap</h1>
            <p className="text-gray-400 text-sm md:text-base">Track your progress and mark completed milestones</p>
          </div>

          {tracks.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-xl">
              <p className="text-gray-400">No roadmap tracks available yet.</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-gray-300 mb-2 text-sm">Select Career Track</label>
                <select
                  value={selectedTrack?.id || ''}
                  onChange={(e) => handleTrackChange(e.target.value)}
                  className="w-full md:w-64 bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary"
                >
                  {tracks.map(track => (
                    <option key={track.id} value={track.id}>
                      {track.name} {track.is_primary ? '⭐' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {selectedTrack && (
                <>
                  <div className="bg-gradient-to-r from-primary/20 to-transparent rounded-2xl p-6 mb-6 border border-primary/30">
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-2">{selectedTrack.name}</h2>
                    <p className="text-gray-300 text-sm md:text-base">{selectedTrack.description}</p>
                    
                    {progress && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Your Progress</span>
                          <span className="text-primary">{progress.percentage}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {progress.completed_tasks} of {progress.total_tasks} tasks completed
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-white mb-4">Milestones & Tasks</h3>
                    {tasks.length === 0 ? (
                      <div className="text-center py-12 bg-white/5 rounded-xl">
                        <p className="text-gray-400">No tasks defined for this track yet.</p>
                      </div>
                    ) : (
                      tasks.map((task, idx) => (
                        <div
                          key={task.id}
                          className={`bg-white/5 rounded-xl p-4 border transition-all duration-200 ${
                            task.is_completed 
                              ? 'border-green-500/30 bg-green-500/5' 
                              : 'border-white/10 hover:border-primary/30'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <button
                              onClick={() => toggleTask(task.id, task.is_completed)}
                              disabled={updating}
                              className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                task.is_completed
                                  ? 'bg-green-500 border-green-500'
                                  : 'border-gray-500 hover:border-primary'
                              }`}
                            >
                              {task.is_completed && (
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                            
                            <div className="flex-1">
                              <h4 className={`font-semibold ${task.is_completed ? 'text-green-400 line-through' : 'text-white'}`}>
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className="text-sm text-gray-400 mt-1">{task.description}</p>
                              )}
                            </div>
                            
                            <span className="text-xs text-gray-500">#{idx + 1}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentRoadmap;