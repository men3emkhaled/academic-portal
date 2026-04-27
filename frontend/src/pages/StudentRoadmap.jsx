import React, { useState, useEffect } from 'react';
import { Target, Star } from 'lucide-react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useStudentData } from '../context/StudentDataContext';
import { useNavigate } from 'react-router-dom';
import studentApi from '../services/studentApi';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';

const StudentRoadmap = () => {
  const { student, logout } = useStudentAuth();
  const { roadmapTracks, loadingRoadmap } = useStudentData();
  const navigate = useNavigate();
  const tracks = roadmapTracks || [];
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!student) {
      navigate('/student/login');
      return;
    }
  }, [student, navigate]);

  useEffect(() => {
    if (!loadingRoadmap && tracks.length > 0 && !selectedTrack) {
      setSelectedTrack(tracks[0]);
      fetchTrackProgress(tracks[0].id);
    }
  }, [loadingRoadmap, tracks, selectedTrack]);

  const fetchTrackProgress = async (trackId) => {
    setLoading(true);
    try {
      const response = await studentApi.get(`/roadmap/progress/${trackId}`);
      const data = response.data;
      setTasks(data.tasks || []);
      setProgress({
        percentage: data.percentage,
        total_tasks: data.total_tasks,
        completed_tasks: data.completed_tasks,
      });
    } catch (error) {
      console.error('Error fetching progress:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskId, currentStatus) => {
    if (updating) return;
    console.log('Toggling task:', taskId, 'Current status:', currentStatus);
    setUpdating(true);
    const newStatus = !currentStatus;

    // تحديث وهمي للمهمة المحددة فقط
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.task_id === taskId ? { ...task, is_completed: newStatus } : task
      )
    );
    setProgress(prev => {
      const newCompleted = prev.completed_tasks + (newStatus ? 1 : -1);
      const newPercentage = Math.round((newCompleted / prev.total_tasks) * 100);
      return { ...prev, completed_tasks: newCompleted, percentage: newPercentage };
    });

    try {
      await studentApi.post('/roadmap/toggle-task', { taskId, isCompleted: newStatus });
      toast.success(newStatus ? 'Task completed! 🎉' : 'Task marked as incomplete');
    } catch (error) {
      console.error('Error toggling task:', error);
      // إعادة تحميل الحالة الحقيقية من الخادم في حالة الخطأ
      fetchTrackProgress(selectedTrack.id);
      toast.error('Failed to update task');
    } finally {
      setUpdating(false);
    }
  };

  const handleTrackChange = (trackId) => {
    const track = tracks.find(t => t.id === parseInt(trackId));
    setSelectedTrack(track);
    fetchTrackProgress(trackId);
  };

  const handleLogout = () => {
    logout();
    navigate('/student/login');
    toast.success('Logged out successfully');
  };

  if ((loading || loadingRoadmap) && tracks.length === 0) {
    return (
      <div className="min-h-screen bg-dark text-white font-body">
        <Sidebar onLogout={handleLogout} />
        <div className="md:ml-64 flex justify-center items-center h-screen">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-white font-body">
      <Sidebar activePage="roadmap" onLogout={handleLogout} />

      <div className="md:ml-64 pb-24 md:pb-8">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-headline text-4xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 leading-tight pb-2 mb-2">
              Career Roadmap
            </h1>
          </div>

          {tracks.length === 0 ? (
            <div className="text-center py-16 bg-dark-glass/50 backdrop-blur-md rounded-[2rem] border border-dashed border-white/10 shadow-inner">
              <p className="text-gray-400">No roadmap tracks available yet.</p>
            </div>
          ) : (
            <>
              <div className="bg-dark-card rounded-[2rem] border border-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 mb-10 shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all duration-500"><div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none"></div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Target className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-primary/70 text-[10px] font-bold uppercase tracking-widest">Active Track</p>
                    <h2 className="font-headline font-extrabold text-xl text-white">
                      {selectedTrack?.name || 'Select a track'}
                    </h2>
                  </div>
                </div>
                <div className="relative group"><div className="absolute inset-y-0 right-3 flex items-center pointer-events-none"><span className="text-gray-400">⌵</span></div><select
                  value={selectedTrack?.id || ''}
                  onChange={(e) => handleTrackChange(e.target.value)}
                  className="px-4 py-3 bg-dark-glass hover:bg-white/5 text-white text-sm font-bold rounded-xl border border-white/10 shadow-inner focus:ring-2 focus:ring-primary/40 focus:outline-none cursor-pointer transition-all duration-300 w-full md:w-auto appearance-none"
                >
                  {tracks.map(track => (
                    <option key={track.id} value={track.id}>
                      {track.name} {track.is_primary ? '⭐' : ''}
                    </option>
                  ))}
                </select></div>
              </div>

              {selectedTrack && (
                <>
                  <div className="relative overflow-hidden bg-dark-glass rounded-[2rem] p-8 mb-10 shadow-[0_12px_40px_rgba(142,255,113,0.15)] border border-primary/30 backdrop-blur-xl group hover:shadow-[0_20px_50px_rgba(142,255,113,0.2)] hover:border-primary/50 transition-all duration-500">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
                    <div className="relative z-10 space-y-4">
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-primary/70 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Your Progress</p>
                          <h3 className="font-headline font-black text-4xl text-primary">{progress?.percentage || 0}%</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-white text-sm font-semibold">
                            {progress?.completed_tasks || 0} of {progress?.total_tasks || 0} Done
                          </p>
                        </div>
                      </div>
                      <div className="h-3 w-full bg-dark border border-white/10 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="h-full bg-primary rounded-full shadow-[0_0_12px_rgba(142,255,113,0.5)] transition-all duration-500"
                          style={{ width: `${progress?.percentage || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="font-headline font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 whitespace-nowrap">Milestones & Tasks</h3>
                      <div className="hidden sm:block h-[1px] flex-grow bg-gradient-to-r from-white/10 to-transparent"></div>
                    </div>

                    {tasks.length === 0 ? (
                      <div className="text-center py-12 bg-dark-glass/50 backdrop-blur-md rounded-[2rem] border border-dashed border-white/10 shadow-inner">
                        <p className="text-gray-400">No tasks defined for this track yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {tasks.map((task, idx) => (
                          <div
                            key={task.task_id}
                            className={`relative overflow-hidden group bg-dark-card border border-white/5 rounded-[1.5rem] p-6 flex items-start gap-5 hover:border-primary/40 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(142,255,113,0.1)] transition-all duration-300 ${
                              task.is_completed ? 'opacity-70' : ''
                            }`}
                          >
                            <button
                              onClick={() => toggleTask(task.task_id, task.is_completed)}
                              disabled={updating}
                              className="flex items-center justify-center hover:scale-110 active:scale-95 hover:shadow-[0_0_15px_rgba(142,255,113,0.5)] rounded-full transition-all mt-1"
                            >
                              {task.is_completed ? (
                                <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                              ) : (
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                                </svg>
                              )}
                            </button>
                            <div className="flex-1">
                              <h4 className={`font-headline font-bold text-white ${task.is_completed ? 'line-through decoration-primary/40' : ''}`}>
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className="text-sm text-gray-400 mt-0.5">{task.description}</p>
                              )}
                            </div>
                            <span className="text-xs text-gray-400/50">#{idx + 1}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
      <style>{`
        .font-headline { font-family: 'Manrope', 'Inter', sans-serif; }
        .bg-dark-glass { background: rgba(17, 17, 17, 0.7); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
      `}</style>
    </div>
  );
};

export default StudentRoadmap;