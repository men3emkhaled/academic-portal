import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import studentApi from '../services/studentApi';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { 
  Megaphone, QrCode, ListChecks, CheckCircle2, Circle, 
  ArrowLeft, Calendar, User, ExternalLink, Users,
  Loader2, Clock, BookOpen, X, Check, XCircle
} from 'lucide-react';

const StudentCourseHub = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('announcements');
  const [showQr, setShowQr] = useState(false);

  const fetchHubData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentApi.get(`/student/course/${courseId}/hub`);
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load course data');
      navigate('/student/dashboard');
    } finally {
      setLoading(false);
    }
  }, [courseId, navigate]);

  useEffect(() => {
    fetchHubData();
  }, [fetchHubData]);

  const handleToggleTask = async (taskId, currentStatus) => {
    try {
      await studentApi.patch(`/official-tasks/${taskId}/toggle`, {
        is_completed: !currentStatus
      });
      fetchHubData();
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-[#050505]">
        <Sidebar activePage="dashboard" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading course...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { course, qrToken, announcements, progress = [], tasks, attendance = [] } = data;

  const attendedCount = attendance.filter(a => a.is_present).length;

  const tabs = [
    { id: 'announcements', label: 'News', icon: Megaphone, count: announcements.length },
    { id: 'progress', label: 'Progress', icon: ListChecks, count: progress.filter(p => p.is_completed).length + '/' + progress.length },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle2, count: tasks.length },
    { id: 'attendance', label: 'Attendance', icon: Users, count: `${attendedCount}/${attendance.length}` }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-slate-100 transition-colors duration-300">
      <Sidebar activePage="dashboard" />
      
      <main className="flex-1 overflow-y-auto pb-24 lg:pb-8">
        {/* Top Bar - with safe area for iPhone PWA */}
        <div className="sticky top-0 z-20 bg-gray-50/80 dark:bg-[#050505]/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/5" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-10 pb-3">
            <button 
              onClick={() => navigate('/student/dashboard')}
              className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </button>
            
            {/* Mobile QR Button */}
            <button 
              onClick={() => setShowQr(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold active:scale-95 transition-transform"
            >
              <QrCode className="w-4 h-4" />
              QR Code
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-10 pt-6">
          {/* Course Header - Compact on mobile */}
          <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl lg:rounded-3xl p-5 sm:p-6 lg:p-8 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 blur-[60px] rounded-full -mr-10 -mt-10 pointer-events-none"></div>
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full mb-3">
                  Course Details
                </span>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-gray-900 dark:text-white leading-tight">
                  {course.name}
                </h1>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-center px-3 py-2 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-100 dark:border-white/5">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Progress</p>
                  <p className="text-lg font-black text-gray-900 dark:text-white">{progress.filter(p => p.is_completed).length}/{progress.length}</p>
                </div>
                <div className="text-center px-3 py-2 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-100 dark:border-white/5">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Tasks</p>
                  <p className="text-lg font-black text-gray-900 dark:text-white">{tasks.length}</p>
                </div>
                <div className="text-center px-3 py-2 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-100 dark:border-white/5">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Attendance</p>
                  <p className="text-lg font-black text-gray-900 dark:text-white">{attendedCount}/{attendance.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-5">
              {/* Tabs - Scrollable on mobile */}
              <div className="flex gap-1.5 p-1 bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-xl overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-1 justify-center ${
                      activeTab === tab.id 
                        ? 'bg-primary text-white shadow-md shadow-primary/20' 
                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                    {tab.count > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                        activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-white/10 text-gray-500'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="min-h-[300px]">
                {activeTab === 'announcements' && (
                  <div className="space-y-3 animate-fadeIn">
                    {announcements.length === 0 ? (
                      <EmptyState icon={Megaphone} text="No announcements yet" sub="Your instructor hasn't posted any updates." />
                    ) : (
                      announcements.map(ann => (
                        <div key={ann.id} className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl p-4 sm:p-5 hover:border-primary/20 transition-all">
                          <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest mb-2">
                            <User className="w-3 h-3" />
                            {ann.doctor_name}
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1.5">{ann.title}</h3>
                          <p className="text-gray-600 dark:text-slate-400 text-sm mb-3 whitespace-pre-wrap leading-relaxed">{ann.content}</p>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <Clock className="w-3 h-3" />
                            {new Date(ann.created_at).toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'progress' && (
                  <div className="space-y-2 animate-fadeIn">
                    {progress.length === 0 ? (
                      <EmptyState icon={ListChecks} text="No syllabus yet" sub="Your instructor hasn't added course topics." />
                    ) : (
                      <>
                        {/* Progress Bar */}
                        <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl p-4 mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-500">Course Progress</span>
                            <span className="text-xs font-black text-primary">
                              {Math.round((progress.filter(p => p.is_completed).length / progress.length) * 100)}%
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${(progress.filter(p => p.is_completed).length / progress.length) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        {progress.map((item, idx) => (
                          <div key={item.id} className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                            item.is_completed 
                              ? 'bg-primary/5 border-primary/20 dark:bg-primary/5 dark:border-primary/20' 
                              : 'bg-white dark:bg-white/[0.03] border-gray-200/60 dark:border-white/5'
                          }`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black ${
                              item.is_completed 
                                ? 'bg-primary text-white' 
                                : 'bg-gray-100 dark:bg-white/10 text-gray-400'
                            }`}>
                              {item.is_completed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                            </div>
                            <span className={`text-sm font-semibold flex-1 ${
                              item.is_completed ? 'text-primary' : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {item.title}
                            </span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}

                {activeTab === 'tasks' && (
                  <div className="space-y-2.5 animate-fadeIn">
                    {tasks.length === 0 ? (
                      <EmptyState icon={CheckCircle2} text="No tasks assigned" sub="Official tasks will show up here." />
                    ) : (
                      tasks.map(task => (
                        <div key={task.id} className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-xl p-4 flex items-center justify-between gap-3 group">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <button 
                              onClick={() => handleToggleTask(task.id, task.is_completed)}
                              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0 active:scale-90 ${
                                task.is_completed 
                                  ? 'bg-primary text-white' 
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10'
                              }`}
                            >
                              {task.is_completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                            </button>
                            <div className="min-w-0">
                              <h4 className={`font-bold text-sm truncate ${task.is_completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                {task.title}
                              </h4>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                                <Calendar className="w-2.5 h-2.5" />
                                {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                              </span>
                            </div>
                          </div>
                          {task.drive_link && (
                            <a 
                              href={task.drive_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-2 text-gray-400 hover:text-primary transition-colors flex-shrink-0"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'attendance' && (
                  <div className="space-y-3 animate-fadeIn">
                    {attendance.length === 0 ? (
                      <EmptyState icon={Users} text="No attendance records" sub="Your instructor hasn't started any sessions yet." />
                    ) : (
                      <>
                        <div className="flex gap-4 mb-4">
                          <div className="flex-1 bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 rounded-2xl p-4 flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-1">Present</p>
                              <p className="text-2xl font-black text-teal-700 dark:text-teal-300">{attendedCount}</p>
                            </div>
                            <Check className="w-8 h-8 text-teal-500 opacity-50" />
                          </div>
                          <div className="flex-1 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-4 flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest mb-1">Absent</p>
                              <p className="text-2xl font-black text-red-700 dark:text-red-300">{attendance.length - attendedCount}</p>
                            </div>
                            <XCircle className="w-8 h-8 text-red-500 opacity-50" />
                          </div>
                        </div>

                        {attendance.map((record) => (
                          <div 
                            key={record.id} 
                            className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                              record.is_present 
                                ? 'bg-white dark:bg-white/[0.02] border-gray-200 dark:border-white/5' 
                                : 'bg-red-50/50 dark:bg-red-500/5 border-red-100 dark:border-red-500/10'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                record.is_present 
                                  ? 'bg-teal-100 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400' 
                                  : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                              }`}>
                                {record.is_present ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                              </div>
                              <div>
                                <p className={`font-bold ${record.is_present ? 'text-gray-900 dark:text-white' : 'text-red-700 dark:text-red-400'}`}>
                                  {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {record.is_present ? 'You were marked present' : 'Missed session'}
                                </p>
                              </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                              record.is_present 
                                ? 'bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400' 
                                : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                            }`}>
                              {record.is_present ? 'Present' : 'Absent'}
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* QR Sidebar - Desktop only */}
            <div className="hidden lg:block lg:col-span-4">
              <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 p-6 rounded-2xl shadow-sm text-center sticky top-20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                <QrCode className="w-6 h-6 text-primary mx-auto mb-3 mt-2" />
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Attendance QR</h3>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">Show this to your instructor</p>
                
                <div className="bg-white p-5 rounded-2xl mx-auto w-fit shadow-inner border border-gray-100">
                  <QRCodeSVG 
                    value={qrToken} 
                    size={160}
                    level="H"
                    fgColor="#111827"
                    bgColor="#FFFFFF"
                  />
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-teal-600 bg-teal-50 dark:bg-teal-500/10 dark:text-teal-400 py-2.5 rounded-lg border border-teal-100 dark:border-teal-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Active Token
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile QR Modal */}
      {showQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setShowQr(false)}>
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 p-6 rounded-3xl shadow-2xl max-w-xs w-full text-center relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowQr(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 bg-gray-100 dark:bg-white/10 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
            
            <QrCode className="w-7 h-7 text-primary mx-auto mb-3" />
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Attendance QR</h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-5">Show this to your instructor</p>
            
            <div className="bg-white p-5 rounded-2xl mx-auto w-fit shadow-inner border border-gray-100">
              <QRCodeSVG 
                value={qrToken} 
                size={180}
                level="H"
                fgColor="#111827"
                bgColor="#FFFFFF"
              />
            </div>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs font-bold text-teal-600 bg-teal-50 dark:bg-teal-500/10 dark:text-teal-400 py-2.5 rounded-lg border border-teal-100 dark:border-teal-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active Token
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

const EmptyState = ({ icon: Icon, text, sub }) => (
  <div className="bg-white/50 dark:bg-white/[0.01] border border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-10 sm:p-12 text-center">
    <Icon className="w-8 h-8 text-gray-300 dark:text-slate-700 mx-auto mb-2" />
    <p className="text-gray-500 dark:text-slate-500 font-bold text-sm">{text}</p>
    {sub && <p className="text-gray-400 dark:text-slate-600 text-xs mt-1">{sub}</p>}
  </div>
);

export default StudentCourseHub;
