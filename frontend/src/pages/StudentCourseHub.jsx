import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import studentApi from '../services/studentApi';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { 
  Megaphone, QrCode, FileText, CheckCircle2, Circle, 
  ArrowLeft, Calendar, User, ExternalLink, Download, 
  Loader2, Clock, BookOpen, AlertCircle
} from 'lucide-react';

const StudentCourseHub = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('announcements');

  const fetchHubData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentApi.get(`/student/course/${courseId}/hub`);
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load course hub');
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
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { course, qrToken, announcements, resources, tasks } = data;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-slate-100 transition-colors duration-300">
      <Sidebar activePage="dashboard" />
      
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
        {/* Navigation */}
        <button 
          onClick={() => navigate('/student/dashboard')}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        {/* Course Header */}
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-[2.5rem] p-8 md:p-10 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full -mr-20 -mt-20"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
                Course Details
              </span>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-2 italic uppercase">
                {course.name}
              </h1>
              <p className="text-gray-500 dark:text-slate-400 font-bold tracking-widest uppercase text-xs">
                Course Code: {course.code || 'N/A'}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-white/5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Materials</p>
                <p className="text-xl font-black text-gray-900 dark:text-white">{resources.length}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-white/5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tasks</p>
                <p className="text-xl font-black text-gray-900 dark:text-white">{tasks.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content (Left) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Tabs */}
            <div className="flex gap-2 p-1.5 bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl w-fit">
              {[
                { id: 'announcements', label: 'Announcements', icon: Megaphone },
                { id: 'materials', label: 'Materials', icon: FileText },
                { id: 'tasks', label: 'Tasks', icon: CheckCircle2 }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab.id 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {activeTab === 'announcements' && (
                <div className="space-y-4 animate-fadeIn">
                  {announcements.length === 0 ? (
                    <EmptyState icon={Megaphone} text="No announcements yet." />
                  ) : (
                    announcements.map(ann => (
                      <div key={ann.id} className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-3xl p-6 hover:border-primary/20 transition-all">
                        <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest mb-3">
                          <User className="w-3 h-3" />
                          {ann.doctor_name}
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">{ann.title}</h3>
                        <p className="text-gray-600 dark:text-slate-400 text-sm mb-4 whitespace-pre-wrap leading-relaxed">{ann.content}</p>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          <Clock className="w-3 h-3" />
                          {new Date(ann.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'materials' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                  {resources.length === 0 ? (
                    <div className="col-span-full"><EmptyState icon={FileText} text="No materials uploaded." /></div>
                  ) : (
                    resources.map(res => (
                      <div key={res.id} className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl p-5 group flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white mb-1">{res.title}</h4>
                          <p className="text-xs text-gray-500 dark:text-slate-400 mb-4 line-clamp-2">{res.description || 'No description'}</p>
                        </div>
                        <a 
                          href={res.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 py-2.5 bg-gray-50 dark:bg-white/5 hover:bg-primary/10 hover:text-primary rounded-xl text-xs font-bold transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download File
                        </a>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'tasks' && (
                <div className="space-y-3 animate-fadeIn">
                  {tasks.length === 0 ? (
                    <EmptyState icon={CheckCircle2} text="No tasks assigned." />
                  ) : (
                    tasks.map(task => (
                      <div key={task.id} className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl p-5 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => handleToggleTask(task.id, task.is_completed)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                              task.is_completed 
                                ? 'bg-primary text-white' 
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10'
                            }`}
                          >
                            {task.is_completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                          </button>
                          <div>
                            <h4 className={`font-bold text-sm ${task.is_completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                              {task.title}
                            </h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Due: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                              </span>
                            </div>
                          </div>
                        </div>
                        {task.drive_link && (
                          <a 
                            href={task.drive_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-primary transition-colors"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar (Right) - Attendance QR */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 p-8 rounded-[2.5rem] shadow-xl text-center sticky top-8 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
              <QrCode className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-headline font-black text-2xl text-gray-900 dark:text-white mb-2 italic">Attendance</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-8">Show this to your instructor</p>
              
              <div className="bg-white p-6 rounded-[2rem] mx-auto w-fit shadow-inner border border-gray-100">
                <QRCodeSVG 
                  value={qrToken} 
                  size={180}
                  level="H"
                  fgColor="#111827"
                  bgColor="#FFFFFF"
                />
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-teal-600 bg-teal-50 dark:bg-teal-500/10 dark:text-teal-400 py-3 rounded-xl border border-teal-100 dark:border-teal-500/20">
                  <CheckCircle2 className="w-4 h-4" />
                  Status: Active Token
                </div>
                <p className="text-[10px] font-medium text-gray-400 px-4 leading-relaxed">
                  The attendance token is unique to you and this course.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

const EmptyState = ({ icon: Icon, text }) => (
  <div className="bg-white/50 dark:bg-white/[0.01] border border-dashed border-gray-200 dark:border-white/10 rounded-[2rem] p-12 text-center">
    <Icon className="w-10 h-10 text-gray-300 dark:text-slate-700 mx-auto mb-3" />
    <p className="text-gray-500 dark:text-slate-500 font-medium">{text}</p>
  </div>
);

export default StudentCourseHub;
