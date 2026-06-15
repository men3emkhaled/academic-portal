import React, { useState, useEffect, useRef } from 'react';
import { 
  Target, CheckCircle2, Circle, Trophy, 
  ChevronDown, Map, Rocket, Zap,
  TrendingUp, Layers, Info, ArrowRight,
  Star, ClipboardList
} from 'lucide-react';
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
  
  const isAr = i18n.language === 'ar';
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
    toast.success(`${t('sidebar.logout')} ${t('auth.success')}`);
  };

  if ((loading || loadingRoadmap) && tracks.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-white dark:bg-[#0c0c14]">
        <div className="w-12 h-12 border-2 border-gray-200 dark:border-white/10 border-t-[#2cfc7d] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c14] text-gray-900 dark:text-white font-sans transition-colors duration-500 overflow-x-hidden relative" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] inset-inline-end-[-5%] w-[50vw] h-[50vw] bg-[#8b5cf6]/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] inset-inline-start-[-5%] w-[40vw] h-[40vw] bg-[#2cfc7d]/3 blur-[100px] rounded-full"></div>
      </div>

      <Sidebar onLogout={handleLogout} />

      <main className="md:ps-72 min-h-screen relative z-10 flex flex-col">
        
        {/* HERO SECTION */}
        <section className="px-6 lg:px-10 pt-16 pb-12 max-w-[1500px] mx-auto w-full space-y-12 text-start">
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2cfc7d]"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30">{t('roadmap.title')}</span>
              </div>
              <h1 className={`text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-[0.95] tracking-tighter uppercase text-gray-900 dark:text-white ${isAr ? 'font-arabic' : ''}`}>
                {t('mavi.success')} {t('mavi.roadmap')}
              </h1>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
            
            {/* Track Selector Bento Card */}
            <div className="lg:col-span-8 bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[3rem] p-12 flex flex-col justify-between gap-12 group hover:shadow-2xl transition-all duration-700">
               <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                     <h2 className={`text-4xl font-black leading-tight tracking-tight max-w-md ${isAr ? 'font-arabic' : ''}`}>
                       {selectedTrack ? selectedTrack.name : t('roadmap.select_track')}
                     </h2>
                     <div className="relative" ref={dropdownRef}>
                        <button 
                           onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                           className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 py-4 px-8 rounded-2xl flex items-center gap-4 text-xs font-black uppercase tracking-widest hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all"
                        >
                           {t('mavi.switch_track')}
                           <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDropdownOpen && (
                           <div className="absolute top-full inset-inline-end-0 mt-4 w-72 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 rounded-[2rem] shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300 p-2">
                              {tracks.map(track => (
                                 <button
                                    key={track.id}
                                    onClick={() => handleTrackChange(track)}
                                    className={`w-full text-start px-6 py-4 rounded-xl transition-all flex items-center justify-between text-[10px] font-black uppercase tracking-widest ${selectedTrack?.id === track.id ? 'bg-[#10b981] text-white' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}
                                 >
                                    {track.name}
                                    {selectedTrack?.id === track.id && <CheckCircle2 className="w-4 h-4" />}
                                 </button>
                              ))}
                           </div>
                        )}
                     </div>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-black/5 dark:border-white/5 pt-10">
                  <div className="space-y-1">
                     <span className="text-3xl font-black text-[#10b981] dark:text-[#2cfc7d]">{progress?.completed_tasks || 0}</span>
                     <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30">{t('roadmap.done')}</p>
                  </div>
                  <div className="space-y-1">
                     <span className="text-3xl font-black text-gray-900 dark:text-white">{progress?.total_tasks || 0}</span>
                     <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30">{t('roadmap.tasks')}</p>
                  </div>
                  <div className="space-y-1">
                     <span className="text-3xl font-black text-[#8b5cf6]">{Math.max(0, (progress?.total_tasks || 0) - (progress?.completed_tasks || 0))}</span>
                     <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30">{t('mavi.remaining')}</p>
                  </div>
                  <div className="space-y-1">
                     <span className="text-3xl font-black text-gray-900 dark:text-white">#{student?.level}</span>
                     <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30">{t('mavi.hierarchy')}</p>
                  </div>
               </div>
            </div>

            {/* Timeline Insight Card */}
            <div className="lg:col-span-4 bg-[#8b5cf6] rounded-[3rem] p-12 text-white flex flex-col justify-between space-y-8 relative overflow-hidden group">
               <div className="absolute top-[-10%] inset-inline-end-[-10%] w-40 h-40 bg-white/10 blur-[40px] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
               <div className="space-y-4 relative z-10">
                  <Map className="w-10 h-10 mb-4" />
                  <h3 className="text-2xl font-black uppercase italic leading-none">{t('mavi.milestone_logic')}</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">{t('mavi.milestone_desc')}</p>
               </div>
               <div className="flex items-center justify-between relative z-10">
                  <span className="text-[4rem] font-black tracking-tighter leading-none">{progress?.percentage}%</span>
                  <button className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl">
                    <Rocket className={`w-6 h-6 ${isAr ? 'rotate-180' : ''}`} />
                  </button>
               </div>
            </div>

            {/* INTERACTIVE TIMELINE MATRIX */}
            <div className="lg:col-span-12 space-y-12">
               
               <div className="flex items-center justify-between px-2">
                  <div className="flex flex-col">
                    <h2 className={`text-4xl font-black uppercase tracking-tight ${isAr ? 'font-arabic' : ''}`}>
                      {isAr ? 'المهمات' : 'Tasks'}
                    </h2>
                  </div>
                  <div className="bg-[#10b981]/10 dark:bg-[#2cfc7d]/10 px-6 py-2 rounded-2xl text-[#10b981] dark:text-[#2cfc7d] text-xs font-black uppercase tracking-widest">
                     {tasks.length} {t('roadmap.tasks')}
                  </div>
               </div>

               <div className="relative ps-10 md:ps-32">
                  {/* The Vertical Core Line */}
                  <div className="absolute top-0 bottom-0 start-4 md:start-12 w-[3px] bg-gray-100 dark:bg-white/5 rounded-full">
                     <div 
                        className="absolute top-0 start-0 w-full bg-[#10b981] dark:bg-[#2cfc7d] rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(46,204,113,0.5)]"
                        style={{ height: `${progress?.percentage || 0}%` }}
                     />
                  </div>

                  <div className="space-y-12 relative">
                     {tasks.length === 0 ? (
                       <div className="py-32 bg-white dark:bg-[#0d0d14] border border-dashed border-gray-100 dark:border-white/10 rounded-[3rem] text-center opacity-40">
                          <ClipboardList className="w-16 h-16 mx-auto mb-6 opacity-20" />
                          <h3 className="text-xl font-black uppercase tracking-[0.4em]">{t('common.no_data')}</h3>
                       </div>
                     ) : (
                       tasks.map((task, idx) => {
                         const isCompleted = task.is_completed;
                         
                         return (
                           <div key={task.task_id} className="relative group">
                             {/* Node Indicator */}
                             <div 
                                className={`absolute top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full border-4 flex items-center justify-center transition-all duration-500 z-10 start-[-25px] md:start-[-50px] ${isCompleted ? 'bg-[#10b981] border-[#10b981] text-white shadow-[0_0_30px_rgba(46,204,113,0.5)] scale-110 md:scale-125' : 'bg-white dark:bg-[#0c0c14] border-gray-100 dark:border-white/10 text-gray-200 dark:text-white/5'}`}
                             >
                                {isCompleted ? <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" /> : <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-current" />}
                             </div>

                             <div 
                               onClick={() => !updating && toggleTask(task.task_id, isCompleted)}
                               className={`bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[3rem] p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center gap-10 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl shadow-sm relative cursor-pointer group/card ${isCompleted ? 'opacity-60 grayscale-[0.5]' : ''}`}
                             >
                                <div className="flex-1 space-y-4">
                                   <div className="flex items-center gap-3">
                                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30 group-hover:text-white/50 dark:group-hover:text-black/30 transition-colors">{isAr ? 'مهمة' : 'Task'} {idx + 1}</span>
                                      {isCompleted && (
                                         <div className="bg-[#10b981]/10 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-[#10b981]">{t('quizzes.completed')}</div>
                                      )}
                                   </div>
                                    <h4 className={`text-2xl md:text-3xl font-black uppercase tracking-tight ${isAr ? 'font-arabic' : ''}`}>
                                       {task.title}
                                    </h4>
                                    {task.description && (
                                       <p className="text-gray-500 dark:text-white/60 group-hover:text-white/80 dark:group-hover:text-black/70 text-lg font-bold leading-relaxed max-w-2xl mt-4">
                                          {task.description}
                                       </p>
                                    )}
                                 </div>
                                 {updating && (
                                    <div className="absolute inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-[2px] flex items-center justify-center rounded-[3rem] z-30">
                                       <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                    </div>
                                 )}
                              </div>
                           </div>
                         );
                       })
                     )}
                  </div>
               </div>
            </div>

          </div>
        </section>
      </main>


    </div>
  );
};

export default StudentRoadmap;