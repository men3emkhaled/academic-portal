import React, { useState, useEffect, useRef } from 'react';
import { Target, CheckCircle2, Circle, Trophy, ChevronDown, Map, Rocket } from 'lucide-react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useStudentData } from '../context/StudentDataContext';
import { useNavigate } from 'react-router-dom';
import studentApi from '../services/studentApi';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { useTranslation } from 'react-i18next';

const StudentRoadmap = () => {
  const { t, i18n } = useTranslation();
  const { student, logout } = useStudentAuth();
  const { roadmapTracks, loadingRoadmap } = useStudentData();
  const navigate = useNavigate();
  const tracks = roadmapTracks || [];
  
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!student) navigate('/student/login');
  }, [student, navigate]);

  useEffect(() => {
    if (!loadingRoadmap && tracks.length > 0 && !selectedTrack) {
      setSelectedTrack(tracks[0]);
      fetchTrackProgress(tracks[0].id);
    }
  }, [loadingRoadmap, tracks, selectedTrack]);

  // Handle clicking outside the custom dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      toast.error(t('roadmap.fetch_error'));
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskId, currentStatus) => {
    if (updating) return;
    setUpdating(true);
    const newStatus = !currentStatus;

    // Optimistic UI update
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
      toast.success(newStatus ? t('roadmap.task_done') : t('roadmap.task_undone'));
    } catch (error) {
      console.error('Error toggling task:', error);
      // Revert on failure
      fetchTrackProgress(selectedTrack.id);
      toast.error(t('roadmap.update_error'));
    } finally {
      setUpdating(false);
    }
  };

  const handleTrackChange = (track) => {
    setSelectedTrack(track);
    setIsDropdownOpen(false);
    fetchTrackProgress(track.id);
  };

  const handleLogout = () => {
    logout();
    navigate('/student/login');
    toast.success(t('sidebar.logout') + ' ' + t('auth.success'));
  };

  if ((loading || loadingRoadmap) && tracks.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-500 overflow-hidden relative">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400 font-bold text-xs tracking-wide">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Circular Gauge Component
  const CircularGauge = ({ percentage }) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    return (
      <div className="relative flex items-center justify-center">
        <svg viewBox="0 0 160 160" className={`transform w-36 h-36 sm:w-40 sm:h-40 overflow-visible ${i18n.language === 'ar' ? 'rotate-90 scale-x-[-1]' : '-rotate-90'}`}>
          <circle cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-200 dark:text-white/5" />
          <circle cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            strokeLinecap="round" className="text-primary transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">{percentage}%</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{t('roadmap.done')}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white font-sans transition-colors duration-500 relative overflow-hidden">
      {/* Background Ambient Orbs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 dark:bg-primary/10 blur-[150px] rounded-full mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 dark:bg-blue-500/10 blur-[150px] rounded-full mix-blend-multiply dark:mix-blend-screen"></div>
      </div>

      <Sidebar activePage="roadmap" onLogout={handleLogout} />

      <div className="md:ps-96 pb-24 md:pb-12 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
          
          {/* HERO SECTION */}
          <div className="relative rounded-[2rem] sm:rounded-[2.5rem] bg-white dark:bg-[#111] p-6 sm:p-12 shadow-md dark:shadow-2xl border border-gray-200 dark:border-transparent transition-colors duration-500 flex flex-col lg:flex-row items-center justify-between gap-10 text-start">
            {/* Background Container for Orbs to prevent spilling */}
            <div className="absolute inset-0 overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] pointer-events-none">
              <div className="absolute top-[-50%] right-[-10%] w-[60%] h-[150%] bg-primary/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen"></div>
              <div className="absolute bottom-[-50%] left-[-10%] w-[50%] h-[150%] bg-blue-500/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen"></div>
            </div>
            
            <div className="relative z-20 flex-1 w-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-2xl border border-primary/20 dark:border-primary/30 shadow-[0_0_20px_rgba(46,204,113,0.15)] dark:shadow-[0_0_30px_rgba(46,204,113,0.3)]">
                  <Map className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-xl font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest">{t('roadmap.title')}</h1>
              </div>

              {/* Custom Dropdown Selector */}
              <div className="relative w-full max-w-lg" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between bg-gray-50 dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/15 backdrop-blur-md border border-gray-200 dark:border-white/20 rounded-2xl py-5 px-6 transition-all duration-300 group text-start"
                >
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{t('roadmap.active_track')}</p>
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                      {selectedTrack ? selectedTrack.name : t('roadmap.select_track')}
                    </h2>
                  </div>
                  <ChevronDown className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-gray-900 dark:text-white' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-4 bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
                      {tracks.length === 0 ? (
                        <p className="p-4 text-center text-gray-500">{t('roadmap.no_tracks')}</p>
                      ) : (
                        tracks.map(track => (
                          <button
                            key={track.id}
                            onClick={() => handleTrackChange(track)}
                            className={`w-full text-left px-4 py-3 rounded-xl transition-colors flex items-center gap-3 text-start ${selectedTrack?.id === track.id ? 'bg-primary/10 text-primary font-bold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                          >
                            <Target className={`w-5 h-5 ${selectedTrack?.id === track.id ? 'text-primary' : 'text-gray-400'}`} />
                            {track.name} {track.is_primary && <span className="text-amber-500 text-xs font-bold uppercase ms-auto">{t('roadmap.primary')}</span>}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Gauge Area */}
            {progress && (
              <div className="relative z-10 flex flex-col items-center bg-gray-50/50 dark:bg-white/5 p-6 rounded-3xl border border-gray-200/50 dark:border-white/10 backdrop-blur-md">
                <CircularGauge percentage={progress.percentage || 0} />
                <div className="mt-4 text-center">
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                    <span className="text-gray-900 dark:text-white">{progress.completed_tasks}</span> {t('roadmap.of')} {progress.total_tasks} {t('roadmap.tasks')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* INTERACTIVE TIMELINE */}
          {selectedTrack && (
            <div className="relative pt-6">
              <div className="flex items-center gap-3 mb-12 text-start">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <Rocket className="w-6 h-6 text-primary" /> {t('roadmap.milestones')}
                </h3>
              </div>

              {tasks.length === 0 ? (
                <div className="text-center py-20 bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-[2rem] border-2 border-dashed border-gray-300 dark:border-white/10 shadow-sm">
                  <p className="text-gray-500 dark:text-gray-400 text-xl font-bold">{t('roadmap.no_tasks_desc')}</p>
                </div>
              ) : (
                <div className="relative ps-6 sm:ps-12">
                  {/* The Vertical Timeline Line */}
                  <div className="absolute top-0 bottom-0 w-1 bg-gray-200 dark:bg-white/10 rounded-full start-[15px] sm:start-[31px]">
                    {/* Animated Fill Line */}
                    <div 
                      className="absolute top-0 left-0 w-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(46,204,113,0.5)]"
                      style={{ height: `${progress?.percentage || 0}%` }}
                    />
                  </div>

                  <div className="space-y-10 relative">
                    {tasks.map((task, idx) => {
                      const isCompleted = task.is_completed;
                      
                      return (
                        <div key={task.task_id} className="relative group">
                          {/* Timeline Node Dot */}
                          <div className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-4 flex items-center justify-center transition-colors duration-500 z-10 -start-[35px] sm:-start-[51px]">
                            {isCompleted && <CheckCircle2 className="w-4 h-4 text-white dark:text-dark" />}
                          </div>

                          {/* Task Card */}
                          <div className={`relative overflow-hidden bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border ${isCompleted ? 'border-primary/30 shadow-[0_8px_30px_rgba(46,204,113,0.1)]' : 'border-gray-200 dark:border-white/10 shadow-sm'} rounded-[2rem] p-6 sm:p-8 flex items-center gap-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-2xl text-start`}>
                            
                            {/* Success Glow */}
                            <div className={`absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent transition-opacity duration-500 pointer-events-none ${isCompleted ? 'opacity-100' : 'opacity-0'}`}></div>

                            {/* Custom Animated Checkbox */}
                            <button
                              onClick={() => toggleTask(task.task_id, isCompleted)}
                              disabled={updating}
                              className={`relative z-10 shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
                                isCompleted 
                                  ? 'bg-primary border-primary text-white shadow-[0_0_20px_rgba(46,204,113,0.4)]' 
                                  : 'bg-transparent border-gray-300 dark:border-gray-600 text-transparent hover:border-primary/50'
                              }`}
                            >
                              <CheckCircle2 className={`w-6 h-6 transition-all duration-300 ${isCompleted ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
                            </button>

                            {/* Task Content */}
                            <div className="flex-1 relative z-10 min-w-0">
                              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 block">{t('roadmap.milestone')} {idx + 1}</span>
                              <h4 className={`text-lg sm:text-xl font-black transition-colors duration-300 ${isCompleted ? 'text-gray-400 dark:text-gray-500 line-through decoration-primary/40' : 'text-gray-900 dark:text-white'}`}>
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className={`text-sm mt-2 transition-colors duration-300 ${isCompleted ? 'text-gray-400/70 dark:text-gray-600' : 'text-gray-600 dark:text-gray-400'}`}>
                                  {task.description}
                                </p>
                              )}
                            </div>

                            {/* Visual Trophy for completed tasks on Desktop */}
                            <div className={`hidden sm:flex items-center justify-center w-12 h-12 rounded-full transition-all duration-500 absolute end-8 ${isCompleted ? 'bg-amber-500/10 text-amber-500 scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                              <Trophy className="w-6 h-6" />
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.3); border-radius: 4px; }
      `}</style>
    </div>
  );
};

export default StudentRoadmap;