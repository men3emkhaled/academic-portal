import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import studentApi from '../services/studentApi';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { 
  Megaphone, QrCode, ListChecks, CheckCircle2, Circle, 
  ArrowLeft, Calendar, User, ExternalLink, Users,
  Loader2, Clock, BookOpen, X, Check, XCircle,
  Lock, Zap, Award, MessageSquare, AlertCircle, Send,
  HelpCircle, ShieldAlert
} from 'lucide-react';

const StudentCourseHub = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('announcements');
  const [showQr, setShowQr] = useState(false);
  const [submissionUrls, setSubmissionUrls] = useState({});
  
  // Inquiry Form State
  const [inquiryType, setInquiryType] = useState('question');
  const [inquirySubject, setInquirySubject] = useState('');
  const [inquiryContent, setInquiryContent] = useState('');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  const fetchHubData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentApi.get(`/student/course/${courseId}/hub`);
      setData(res.data);
      
      const inqRes = await studentApi.get('/student/my-inquiries');
      setInquiries(inqRes.data.filter(i => String(i.course_id) === String(courseId)));
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

  const handleToggleTask = async (taskId, currentStatus, requiresSubmission = false) => {
    try {
      const payload = { is_completed: !currentStatus };
      if (!currentStatus && requiresSubmission) {
        const url = submissionUrls[taskId];
        if (!url) return toast.error('Please enter a submission link');
        payload.submission_url = url;
      }
      
      await studentApi.patch(`/official-tasks/${taskId}/toggle`, payload);
      if (!currentStatus) toast.success('Task submitted successfully');
      fetchHubData();
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const handleSubmitInquiry = async (e) => {
    e.preventDefault();
    if (!inquiryContent.trim()) return toast.error('Please enter your message');
    
    setSubmittingInquiry(true);
    try {
      await studentApi.post('/student/inquiries', {
        course_id: courseId,
        type: inquiryType,
        subject: inquirySubject,
        content: inquiryContent
      });
      toast.success('Your message has been sent to the instructor');
      setInquirySubject('');
      setInquiryContent('');
      
      // Refresh inquiries
      const inqRes = await studentApi.get('/student/my-inquiries');
      setInquiries(inqRes.data.filter(i => String(i.course_id) === String(courseId)));
    } catch (err) {
      toast.error('Failed to send inquiry');
    } finally {
      setSubmittingInquiry(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-dark-card">
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
    { id: 'progress', label: 'Progress', icon: ListChecks },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle2, count: tasks.length },
    { id: 'attendance', label: 'Presence', icon: Users },
    { id: 'inquiries', label: 'Support', icon: MessageSquare, count: inquiries.length }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark text-gray-900 dark:text-white font-body transition-colors duration-300">
      <Sidebar activePage="dashboard" />
      
      <main className="md:ml-64 pb-24 md:pb-8 min-h-screen">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-gray-50/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
          <div className="max-w-6xl mx-auto flex items-center justify-between px-6 pb-3">
            <button 
              onClick={() => navigate('/student/dashboard')}
              className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-primary transition-all group uppercase tracking-widest"
            >
              <div className="w-8 h-8 rounded-full bg-white dark:bg-dark-card border border-gray-200 dark:border-white/5 flex items-center justify-center group-hover:border-primary/30 group-hover:shadow-sm">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </div>
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </button>
            
            <button 
              onClick={() => setShowQr(true)}
              className="lg:hidden flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full text-xs font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
            >
              <QrCode className="w-4 h-4" />
              QR Access
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-8">
          {/* Course Hero Header */}
          <div className="relative overflow-hidden bg-white dark:bg-dark-card border border-gray-200 dark:border-white/5 rounded-[2.5rem] p-6 sm:p-10 mb-10 group shadow-sm hover:shadow-xl transition-all duration-500">
            <div className="absolute -right-24 -top-24 w-80 h-80 bg-primary/10 blur-[100px] rounded-full group-hover:scale-125 transition-transform duration-700"></div>
            <div className="absolute -left-24 -bottom-24 w-60 h-60 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner group-hover:rotate-3 transition-transform duration-500 flex-shrink-0">
                    <BookOpen className="w-8 h-8 sm:w-12 sm:h-12" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="px-3 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-primary/20">
                        Active Course
                      </span>
                      {course.code && (
                        <span className="px-3 py-1 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-[9px] font-bold uppercase tracking-wider rounded-full border border-gray-200 dark:border-white/5">
                          {course.code}
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 leading-tight mb-3">
                      {course.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                        <User className="w-4 h-4 text-primary/70" />
                        <span className="font-semibold text-gray-700 dark:text-gray-300">{course.doctor_name || 'Faculty Member'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                        <Calendar className="w-4 h-4 text-primary/70" />
                        <span className="font-semibold">{new Date().getFullYear()} Session</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:flex items-center gap-3 flex-shrink-0">
                   <div className="px-4 py-4 bg-gray-50 dark:bg-dark-glass/30 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col items-center gap-1.5 min-w-[90px] sm:min-w-[110px] hover:border-primary/30 transition-colors">
                      <ListChecks className="w-4 h-4 text-primary/60" />
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Progress</p>
                      <p className="text-lg font-black text-gray-900 dark:text-white leading-none mt-1">
                        {progress.length > 0 ? Math.round((progress.filter(p => p.is_completed).length / progress.length) * 100) : 0}%
                      </p>
                   </div>
                   <div className="px-4 py-4 bg-gray-50 dark:bg-dark-glass/30 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col items-center gap-1.5 min-w-[90px] sm:min-w-[110px] hover:border-emerald-500/30 transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500/60" />
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Tasks</p>
                      <p className="text-lg font-black text-gray-900 dark:text-white leading-none mt-1">{tasks.length}</p>
                   </div>
                   <div className="px-4 py-4 bg-gray-50 dark:bg-dark-glass/30 rounded-2xl border border-gray-100 dark:border-white/5 flex flex-col items-center gap-1.5 min-w-[90px] sm:min-w-[110px] hover:border-blue-500/30 transition-colors">
                      <Users className="w-4 h-4 text-blue-500/60" />
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Presence</p>
                      <p className="text-lg font-black text-gray-900 dark:text-white leading-none mt-1">{attendedCount}</p>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-8 space-y-6">
              {/* Tab Navigation */}
              <div className="flex gap-2 p-1.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-white/5 rounded-2xl overflow-x-auto no-scrollbar shadow-sm">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-black transition-all whitespace-nowrap flex-1 justify-center uppercase tracking-wider ${
                      activeTab === tab.id 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'animate-bounce' : ''}`} />
                    <span className="hidden md:inline">{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ml-1 ${
                        activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-white/10 text-gray-400'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Panels */}
              <div className="min-h-[400px]">
                {activeTab === 'announcements' && (
                  <div className="space-y-4 animate-fadeIn">
                    {announcements.length === 0 ? (
                      <EmptyState icon={Megaphone} text="No recent announcements" sub="Stay tuned for updates from your instructor." />
                    ) : (
                      announcements.map(ann => (
                        <div key={ann.id} className="relative overflow-hidden bg-white dark:bg-dark-card border border-gray-200 dark:border-white/5 rounded-3xl p-6 hover:border-primary/20 transition-all group shadow-sm hover:shadow-md">
                          <div className={`absolute top-0 left-0 w-1.5 h-full bg-primary/20 group-hover:bg-primary transition-colors`}></div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                <User className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="text-xs font-black text-primary uppercase tracking-[0.15em]">{ann.doctor_name}</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(ann.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400">
                               <Clock className="w-4 h-4" />
                            </div>
                          </div>
                          <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-2 leading-snug group-hover:text-primary transition-colors">{ann.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-0 whitespace-pre-wrap">{ann.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'progress' && (
                  <div className="space-y-4 animate-fadeIn">
                    {progress.length === 0 ? (
                      <EmptyState icon={ListChecks} text="No progress data" sub="Syllabus items will appear here once added." />
                    ) : (
                      <>
                        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-white/5 rounded-3xl p-6 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Curriculum Progress</h3>
                                <p className="text-xs font-bold text-gray-400 mt-0.5">Track your path through the course topics</p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-black text-primary">
                                  {Math.round((progress.filter(p => p.is_completed).length / progress.length) * 100)}%
                                </span>
                            </div>
                          </div>
                          <div className="w-full h-3 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden p-0.5 border border-gray-100 dark:border-white/5 shadow-inner">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${(progress.filter(p => p.is_completed).length / progress.length) * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {progress.map((item, idx) => (
                            <div key={item.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:translate-x-1 ${
                              item.is_completed 
                                ? 'bg-emerald-50/30 border-emerald-200/50 dark:bg-emerald-500/5 dark:border-emerald-500/20' 
                                : 'bg-white dark:bg-dark-card border-gray-200/60 dark:border-white/5 shadow-sm'
                            }`}>
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black shadow-sm ${
                                item.is_completed 
                                  ? 'bg-emerald-500 text-white' 
                                  : 'bg-gray-100 dark:bg-white/10 text-gray-400'
                              }`}>
                                {item.is_completed ? <CheckCircle2 className="w-5 h-5" /> : (idx + 1).toString().padStart(2, '0')}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className={`text-sm font-bold block truncate ${
                                  item.is_completed ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                  {item.title}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                  {item.is_completed ? 'Completed topic' : 'Upcoming lesson'}
                                </span>
                              </div>
                              {item.is_completed && <Award className="w-5 h-5 text-emerald-500 opacity-40" />}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeTab === 'tasks' && (
                  <div className="space-y-4 animate-fadeIn">
                    {tasks.length === 0 ? (
                      <EmptyState icon={CheckCircle2} text="Zero pending tasks" sub="You're all caught up! No official tasks assigned." />
                    ) : (
                      tasks.map(task => (
                        <div key={task.id} className="relative overflow-hidden bg-white dark:bg-dark-card border border-gray-200 dark:border-white/5 rounded-3xl p-6 flex flex-col gap-5 group shadow-sm hover:shadow-md transition-all">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 min-w-0 flex-1">
                              {!task.requires_submission ? (
                                <button 
                                  onClick={() => handleToggleTask(task.id, task.is_completed)}
                                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 active:scale-90 border-2 ${
                                    task.is_completed 
                                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                                      : 'bg-gray-50 border-gray-200 text-gray-300 hover:border-primary/40 dark:bg-white/5 dark:border-white/10'
                                  }`}
                                >
                                  {task.is_completed ? <Check className="w-6 h-6 stroke-[3px]" /> : <Circle className="w-5 h-5" />}
                                </button>
                              ) : (
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 ${
                                  task.is_completed 
                                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                                    : 'bg-blue-50 border-blue-200 text-blue-400 dark:bg-blue-500/5 dark:border-blue-500/20'
                                }`}>
                                  <Zap className="w-6 h-6" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <h4 className={`font-extrabold text-base truncate mb-1 ${task.is_completed ? 'line-through text-gray-400 opacity-60' : 'text-gray-900 dark:text-white'}`}>
                                  {task.title}
                                </h4>
                                <div className="flex flex-wrap items-center gap-3">
                                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Due: {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'Indefinite'}
                                  </span>
                                  {task.requires_submission && (
                                    <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider border border-blue-200/50 dark:border-blue-500/20">
                                      Assignment
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {task.drive_link && (
                              <a 
                                href={task.drive_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-primary transition-all group-hover:scale-110"
                              >
                                <ExternalLink className="w-5 h-5" />
                              </a>
                            )}
                          </div>
                          
                          {task.requires_submission && (
                            <div className="mt-1 pl-0 sm:pl-16">
                              {!task.is_completed ? (
                                <div className="flex flex-col sm:flex-row gap-3">
                                  <div className="relative flex-1">
                                    <input 
                                      type="url"
                                      placeholder="Paste Google Drive / OneDrive link here..."
                                      value={submissionUrls[task.id] || ''}
                                      onChange={(e) => setSubmissionUrls({...submissionUrls, [task.id]: e.target.value})}
                                      className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm text-gray-900 dark:text-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all"
                                    />
                                  </div>
                                  <button 
                                    onClick={() => handleToggleTask(task.id, false, true)}
                                    className="bg-primary hover:bg-primary/90 text-white font-black py-3.5 px-8 rounded-2xl text-[13px] uppercase tracking-wider shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
                                  >
                                    <Check className="w-4 h-4" />
                                    Submit Work
                                  </button>
                                </div>
                              ) : (
                                <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-5 border border-gray-100 dark:border-white/5 space-y-4">
                                  {task.submission_url && (
                                    <div className="flex flex-col gap-1">
                                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Submitted Evidence</span>
                                      <a href={task.submission_url} target="_blank" rel="noreferrer" className="text-sm text-blue-500 hover:underline font-semibold break-all flex items-center gap-2">
                                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                        {task.submission_url}
                                      </a>
                                    </div>
                                  )}
                                  {(task.grade || task.feedback) && (
                                    <div className="pt-4 border-t border-gray-200 dark:border-white/10 grid grid-cols-1 sm:grid-cols-4 gap-4">
                                      {task.grade && (
                                        <div className="sm:col-span-1">
                                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Score</span>
                                          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{task.grade}</span>
                                        </div>
                                      )}
                                      {task.feedback && (
                                        <div className="sm:col-span-3">
                                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Instructor Review</span>
                                          <p className="text-sm text-gray-700 dark:text-gray-300 italic font-medium leading-relaxed">"{task.feedback}"</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'attendance' && (
                  <div className="space-y-5 animate-fadeIn">
                    {attendance.length === 0 ? (
                      <EmptyState icon={Users} text="No attendance records" sub="Sessions logged by your instructor will appear here." />
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-white/5 rounded-3xl p-6 flex items-center justify-between shadow-sm hover:border-emerald-500/30 transition-all group">
                            <div>
                              <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1.5">Present Days</p>
                              <p className="text-3xl font-black text-gray-900 dark:text-white leading-none">{attendedCount}</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Check className="w-6 h-6 text-emerald-500" />
                            </div>
                          </div>
                          <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-white/5 rounded-3xl p-6 flex items-center justify-between shadow-sm hover:border-rose-500/30 transition-all group">
                            <div>
                              <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-1.5">Absent Days</p>
                              <p className="text-3xl font-black text-gray-900 dark:text-white leading-none">{attendance.length - attendedCount}</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <X className="w-6 h-6 text-rose-500" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
                          <div className="p-4 bg-gray-50 dark:bg-white/[0.02] border-b border-gray-200 dark:border-white/5">
                             <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Historical Attendance Record</h4>
                          </div>
                          <div className="divide-y divide-gray-100 dark:divide-white/5">
                            {attendance.map((record) => (
                              <div 
                                key={record.id} 
                                className="flex items-center justify-between p-5 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
                              >
                                <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                                    record.is_present 
                                      ? 'bg-emerald-500 text-white' 
                                      : 'bg-rose-500 text-white'
                                  }`}>
                                    {record.is_present ? <Check className="w-5 h-5 stroke-[3px]" /> : <X className="w-5 h-5 stroke-[3px]" />}
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900 dark:text-white text-[15px]">
                                      {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                    </p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                                      {record.is_present ? 'Verified Attendance' : 'Session missed'}
                                    </p>
                                  </div>
                                </div>
                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                  record.is_present 
                                    ? 'bg-emerald-100/50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                                    : 'bg-rose-100/50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                                }`}>
                                  {record.is_present ? 'Present' : 'Absent'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeTab === 'inquiries' && (
                  <div className="space-y-8 animate-fadeIn">
                    {/* New Inquiry Form */}
                    <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                          <MessageSquare className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-gray-900 dark:text-white">Ask or Complain</h3>
                          <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Direct channel to your instructor</p>
                        </div>
                      </div>

                      <form onSubmit={handleSubmitInquiry} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Type of Message</label>
                            <div className="flex p-1.5 bg-gray-50 dark:bg-black/20 rounded-[1.5rem] border border-gray-200 dark:border-white/5">
                              <button
                                type="button"
                                onClick={() => setInquiryType('question')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${
                                  inquiryType === 'question' ? 'bg-white dark:bg-white/10 text-primary shadow-sm' : 'text-gray-400'
                                }`}
                              >
                                <HelpCircle className="w-4 h-4" />
                                Question
                              </button>
                              <button
                                type="button"
                                onClick={() => setInquiryType('complaint')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${
                                  inquiryType === 'complaint' ? 'bg-white dark:bg-white/10 text-rose-500 shadow-sm' : 'text-gray-400'
                                }`}
                              >
                                <ShieldAlert className="w-4 h-4" />
                                Complaint
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Subject</label>
                            <input 
                              type="text"
                              value={inquirySubject}
                              onChange={(e) => setInquirySubject(e.target.value)}
                              placeholder="e.g. Lab requirements, Grade appeal..."
                              className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-[1.5rem] px-6 py-3.5 text-sm text-gray-900 dark:text-white focus:border-primary/50 focus:outline-none transition-all"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Message Details</label>
                          <textarea 
                            rows="4"
                            value={inquiryContent}
                            onChange={(e) => setInquiryContent(e.target.value)}
                            placeholder="Type your message here..."
                            className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-[1.5rem] px-6 py-4 text-sm text-gray-900 dark:text-white focus:border-primary/50 focus:outline-none transition-all resize-none"
                          ></textarea>
                        </div>
                        <div className="flex justify-end">
                          <button 
                            type="submit"
                            disabled={submittingInquiry}
                            className="bg-primary hover:bg-primary/90 text-white font-black py-4 px-10 rounded-2xl text-[13px] uppercase tracking-wider shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center gap-3 disabled:opacity-50 disabled:translate-y-0"
                          >
                            {submittingInquiry ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            Send Message
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Previous Inquiries */}
                    <div className="space-y-4">
                       <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest ml-4">Message History</h4>
                       {inquiries.length === 0 ? (
                         <div className="bg-white/30 dark:bg-white/[0.01] border border-dashed border-gray-200 dark:border-white/5 rounded-[2.5rem] p-12 text-center">
                            <p className="text-gray-400 font-bold">No previous messages.</p>
                         </div>
                       ) : (
                         inquiries.map(inq => (
                           <div key={inq.id} className="bg-white dark:bg-dark-card border border-gray-200 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                    inq.type === 'complaint' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                  }`}>
                                    {inq.type}
                                  </span>
                                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                    inq.status === 'replied' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                  }`}>
                                    {inq.status}
                                  </span>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400">{new Date(inq.created_at).toLocaleDateString()}</span>
                              </div>
                              <div>
                                <h5 className="font-bold text-gray-900 dark:text-white mb-1">{inq.subject || 'No Subject'}</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{inq.content}</p>
                              </div>
                              
                              {inq.doctor_reply && (
                                <div className="mt-4 p-5 bg-primary/5 border border-primary/10 rounded-2xl relative">
                                  <div className="absolute -top-3 left-6 px-3 py-1 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-lg">Instructor Reply</div>
                                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium italic">"{inq.doctor_reply}"</p>
                                  <p className="text-[10px] font-bold text-primary mt-2">{new Date(inq.replied_at).toLocaleDateString()}</p>
                                </div>
                              )}
                           </div>
                         ))
                       )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="hidden lg:block lg:col-span-4 space-y-6">
              {/* QR Identity Pass */}
              <div className="sticky top-24">
                <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-white/5 rounded-[2.5rem] p-8 text-center relative overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-emerald-500"></div>
                  
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6 border border-primary/20">
                    <QrCode className="w-8 h-8" />
                  </div>
                  
                  <h3 className="font-headline font-black text-xl text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Identity Pass</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-8">Scan to verify presence</p>
                  
                  <div className="bg-white p-3 rounded-3xl mx-auto w-fit shadow-xl dark:shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-gray-100 dark:border-transparent hover:scale-105 transition-transform duration-500 cursor-pointer">
                    <QRCodeSVG 
                      value={qrToken} 
                      size={180}
                      level="H"
                      fgColor="#111827"
                      bgColor="#FFFFFF"
                    />
                  </div>

                  <div className="mt-8 flex flex-col gap-3">
                    <div className="flex items-center justify-center gap-2 text-[11px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 py-3 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
                      <Lock className="w-4 h-4" />
                      SECURE TOKEN ACTIVE
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-white/5 rounded-2xl text-left border border-gray-100 dark:border-white/5">
                       <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                       <p className="text-xs font-bold text-gray-700 dark:text-gray-300 leading-relaxed">This token updates automatically. Do not share your credentials.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile QR Pass Modal */}
      {showQr && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-dark/90 backdrop-blur-md lg:hidden" onClick={() => setShowQr(false)}>
          <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-white/10 p-8 rounded-[3rem] shadow-2xl max-w-sm w-full text-center relative animate-fadeIn" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowQr(false)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 bg-gray-100 dark:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6 border border-primary/20">
              <QrCode className="w-8 h-8" />
            </div>
            
            <h3 className="font-headline font-black text-xl text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Identity Pass</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-8">Attendance Verification Code</p>
            
            <div className="bg-white p-4 rounded-3xl mx-auto w-fit shadow-2xl border border-gray-100 dark:border-transparent">
              <QRCodeSVG 
                value={qrToken} 
                size={220}
                level="H"
                fgColor="#111827"
                bgColor="#FFFFFF"
              />
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-[11px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 py-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 shadow-lg shadow-emerald-500/10">
              <Lock className="w-4 h-4" />
              SECURE ACCESS GRANTED
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .font-headline { font-family: 'Manrope', 'Inter', sans-serif; }
      `}</style>
    </div>
  );
};

const EmptyState = ({ icon: Icon, text, sub }) => (
  <div className="bg-white/50 dark:bg-white/[0.01] border border-dashed border-gray-200 dark:border-white/10 rounded-[2.5rem] p-12 sm:p-16 text-center group">
    <div className="w-20 h-20 rounded-[2rem] bg-gray-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-500 group-hover:rotate-6 shadow-inner">
      <Icon className="w-10 h-10 text-gray-300 dark:text-slate-700" />
    </div>
    <p className="text-gray-900 dark:text-white font-black text-xl mb-2">{text}</p>
    {sub && <p className="text-gray-400 dark:text-slate-600 text-sm font-medium">{sub}</p>}
  </div>
);

export default StudentCourseHub;
