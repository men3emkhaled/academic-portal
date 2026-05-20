import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from '../components/Sidebar';
import studentApi from '../services/studentApi';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { 
  Megaphone, QrCode, ListChecks, CheckCircle2, Circle, 
  ArrowLeft, Calendar, User, ExternalLink, Users,
  Loader2, Clock, BookOpen, X, Check, XCircle,
  Lock, Zap, Award, MessageSquare, AlertCircle, Send,
  HelpCircle, ShieldAlert, ArrowRight, MousePointer2, ShieldCheck
} from 'lucide-react';

const StudentCourseHub = () => {
  const { t, i18n } = useTranslation();
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
      toast.error(t('hub.messages.load_failed'));
      navigate('/student/dashboard');
    } finally {
      setLoading(false);
    }
  }, [courseId, navigate, t]);

  useEffect(() => {
    fetchHubData();
  }, [fetchHubData]);

  const handleToggleTask = async (taskId, currentStatus, requiresSubmission = false) => {
    try {
      const payload = { is_completed: !currentStatus };
      if (!currentStatus && requiresSubmission) {
        const url = submissionUrls[taskId];
        if (!url) return toast.error(t('messages.enter_submission_link'));
        payload.submission_url = url;
      }
      
      await studentApi.patch(`/official-tasks/${taskId}/toggle`, payload);
      if (!currentStatus) toast.success(t('hub.messages.submit_success'));
      fetchHubData();
    } catch (error) {
      toast.error(t('hub.messages.submit_failed'));
    }
  };

  const handleSubmitInquiry = async (e) => {
    e.preventDefault();
    if (!inquiryContent.trim()) return toast.error(t('hub.messages.message_req'));
    
    setSubmittingInquiry(true);
    try {
      await studentApi.post('/student/inquiries', {
        course_id: courseId,
        type: inquiryType,
        subject: inquirySubject,
        content: inquiryContent
      });
      toast.success(t('hub.messages.send_success'));
      setInquirySubject('');
      setInquiryContent('');
      
      // Refresh inquiries
      const inqRes = await studentApi.get('/student/my-inquiries');
      setInquiries(inqRes.data.filter(i => String(i.course_id) === String(courseId)));
    } catch (err) {
      toast.error(t('hub.messages.send_failed'));
    } finally {
      setSubmittingInquiry(false);
    }
  };

  const isAr = i18n.language === 'ar';

  const course = data?.course || {};
  const qrToken = data?.qrToken || '';
  const announcements = data?.announcements || [];
  const progress = data?.progress || [];
  const tasks = data?.tasks || [];
  const attendance = data?.attendance || [];
  const attendedCount = attendance.filter(a => a.is_present).length;

  const tabs = [
    { id: 'announcements', label: t('hub.tabs.news'), icon: Megaphone, count: announcements.length },
    { id: 'progress', label: t('hub.tabs.progress'), icon: ListChecks },
    { id: 'tasks', label: t('hub.tabs.tasks'), icon: CheckCircle2, count: tasks.length },
    { id: 'attendance', label: t('hub.tabs.presence'), icon: Users },
    { id: 'inquiries', label: t('hub.tabs.support'), icon: MessageSquare, count: inquiries.length }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c14] text-gray-900 dark:text-white font-sans transition-colors duration-500 overflow-x-hidden relative" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] inset-inline-end-[-5%] w-[50vw] h-[50vw] bg-[#8b5cf6]/3 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] inset-inline-start-[-5%] w-[40vw] h-[40vw] bg-[#2cfc7d]/2 blur-[100px] rounded-full"></div>
      </div>

      <Sidebar />

      <main className="md:ps-72 min-h-screen relative z-10 flex flex-col">
        {loading || !data ? (
          <div className="flex flex-col justify-center items-center flex-1 min-h-[60vh]">
            <div className="w-12 h-12 border-2 border-gray-200 dark:border-white/10 border-t-[#2cfc7d] rounded-full animate-spin"></div>
          </div>
        ) : (
        <>
        {/* HERO SECTION - REPLICA OF DASHBOARD STYLE */}
        <section className="px-6 lg:px-10 pt-16 pb-12 max-w-[1500px] mx-auto w-full space-y-12">
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            <div className="space-y-4 max-w-3xl">
              
              <button 
                onClick={() => navigate('/student/dashboard')}
                className="flex w-fit items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-[#10b981] dark:hover:text-[#2cfc7d] transition-colors group mb-2"
              >
                <ArrowLeft className={`w-3.5 h-3.5 transition-transform ${isAr ? 'rotate-180 group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} />
                {t('hub.back', { defaultValue: isAr ? 'العودة للرئيسية' : 'Back to Dashboard' })}
              </button>

              <h1 className={`text-[clamp(2.5rem,6vw,5rem)] font-black leading-[0.95] tracking-tighter uppercase text-gray-900 dark:text-white ${isAr ? 'font-arabic' : ''}`}>
                {course.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-full text-xs font-black uppercase tracking-widest">
                  <Zap className="w-3.5 h-3.5 text-[#2cfc7d]" />
                  {course.code || 'CORE-ID'}
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-full text-xs font-black uppercase tracking-widest">
                  <Calendar className="w-3.5 h-3.5 text-[#8b5cf6]" />
                  {new Date().getFullYear()} {t('hub.session')}
                </div>
              </div>
            </div>

            <div className="hidden lg:flex flex-col items-center gap-4 bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 p-8 rounded-[3rem] shadow-xl group">
               <div className="bg-white p-3 rounded-2xl shadow-inner border border-gray-100">
                 <QRCodeSVG value={qrToken} size={120} level="H" fgColor="#0c0c14" bgColor="#FFFFFF" />
               </div>
               <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30">{t('hub.qr_access')}</span>
            </div>
          </div>

          {/* QUICK STATS ROW */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
             {[
               { label: t('hub.progress.title'), value: `${progress.length > 0 ? Math.round((progress.filter(p => p.is_completed).length / progress.length) * 100) : 0}%`, color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: ListChecks },
               { label: t('hub.tasks.title'), value: tasks.length, color: 'text-blue-500', bg: 'bg-blue-500/10', icon: CheckCircle2 },
               { label: t('hub.attendance.title'), value: attendedCount, color: 'text-purple-500', bg: 'bg-purple-500/10', icon: Users },
               { label: t('hub.tabs.news'), value: announcements.length, color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Megaphone }
             ].map((stat, i) => (
               <div key={i} className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-white/30 mb-1">{stat.label}</p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white">{stat.value}</p>
               </div>
             ))}
          </div>

          {/* TABS NAVIGATION */}
          <div className="flex flex-wrap gap-3 bg-white dark:bg-white/5 p-2 rounded-[2.5rem] border border-gray-100 dark:border-white/5">
             {tabs.map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`flex-1 min-w-[140px] flex items-center justify-center gap-3 py-4 rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest transition-all ${
                   activeTab === tab.id 
                     ? 'bg-[#10b981] dark:bg-[#2cfc7d] text-white dark:text-black shadow-lg' 
                     : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                 }`}
               >
                 <tab.icon className="w-4 h-4" />
                 {tab.label}
                 {tab.count !== undefined && tab.count > 0 && (
                   <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] ${activeTab === tab.id ? 'bg-black/10 text-black' : 'bg-gray-100 dark:bg-white/10'}`}>
                     {tab.count}
                   </span>
                 )}
               </button>
             ))}
          </div>

          {/* MAIN CONTENT PANELS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-24">
             
             {/* CONTENT AREA */}
             <div className="lg:col-span-8">
                <div className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[3rem] p-10 min-h-[500px]">
                   
                   {activeTab === 'announcements' && (
                     <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {announcements.length === 0 ? (
                           <div className="flex flex-col items-center justify-center h-[300px] text-gray-300 dark:text-white/10 italic font-black uppercase tracking-widest text-center">
                              <Megaphone className="w-12 h-12 mb-4 opacity-20" />
                              {t('hub.announcements.no_news')}
                           </div>
                        ) : (
                          announcements.map(ann => (
                            <div key={ann.id} className="group relative ps-8 border-s-2 border-gray-100 dark:border-white/5 hover:border-[#10b981] dark:hover:border-[#2cfc7d] transition-colors">
                               <div className="absolute top-0 -start-[5px] w-[10px] h-[10px] rounded-full bg-gray-200 dark:bg-white/10 group-hover:bg-[#10b981] dark:group-hover:bg-[#2cfc7d] transition-colors" />
                               <span className="text-[10px] font-black text-[#10b981] dark:text-[#2cfc7d] uppercase tracking-[0.3em]">{new Date(ann.created_at).toLocaleDateString()}</span>
                               <h3 className="text-2xl font-black mt-2 mb-4 group-hover:text-[#10b981] dark:group-hover:text-[#2cfc7d] transition-colors uppercase tracking-tight">{ann.title}</h3>
                               <p className="text-gray-500 dark:text-white/40 leading-relaxed font-medium">{ann.content}</p>
                            </div>
                          ))
                        )}
                     </div>
                   )}

                   {activeTab === 'progress' && (
                     <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-gray-50 dark:bg-black/20 p-10 rounded-[2.5rem] space-y-6">
                           <div className="flex justify-between items-end">
                              <div>
                                 <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 dark:text-white/30 mb-2">{t('hub.progress.title')}</h3>
                                 <span className="text-6xl font-black text-[#10b981] dark:text-[#2cfc7d]">
                                   {Math.round((progress.filter(p => p.is_completed).length / progress.length) * 100)}%
                                 </span>
                              </div>
                              <Award className="w-16 h-16 text-[#8b5cf6] dark:text-[#d4a3ff] opacity-20" />
                           </div>
                           <div className="h-4 bg-white dark:bg-white/5 rounded-full overflow-hidden p-1">
                              <div className="h-full bg-gradient-to-r from-[#10b981] to-[#2cfc7d] rounded-full transition-all duration-1000" style={{ width: `${(progress.filter(p => p.is_completed).length / progress.length) * 100}%` }} />
                           </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                           {progress.map((item, idx) => (
                             <div key={item.id} className="flex items-center gap-6 p-6 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-[1.8rem] hover:scale-[1.02] transition-all">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs ${item.is_completed ? 'bg-[#10b981] dark:bg-[#2cfc7d] text-white dark:text-black shadow-lg shadow-emerald-500/20' : 'bg-gray-100 dark:bg-white/10 text-gray-400'}`}>
                                   {item.is_completed ? <Check className="w-6 h-6 stroke-[3px]" /> : (idx + 1).toString().padStart(2, '0')}
                                </div>
                                <div>
                                   <h4 className={`text-lg font-black uppercase tracking-tight ${item.is_completed ? 'text-[#10b981] dark:text-[#2cfc7d]' : 'text-gray-900 dark:text-white'}`}>{item.title}</h4>
                                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/30">{item.is_completed ? t('hub.progress.completed_topic') : 'UPCOMING MODULE'}</p>
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                   )}

                   {activeTab === 'tasks' && (
                     <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {tasks.map(task => (
                          <div key={task.id} className="bg-gray-50 dark:bg-white/5 p-8 rounded-[2.5rem] space-y-6 group border border-transparent hover:border-[#10b981]/30 transition-all">
                             <div className="flex justify-between items-start">
                                <div className="flex gap-6 items-center">
                                   <div className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center transition-all ${task.is_completed ? 'bg-[#10b981] dark:bg-[#2cfc7d] text-white dark:text-black' : 'bg-white dark:bg-white/10 text-gray-300'}`}>
                                      {task.is_completed ? <CheckCircle2 className="w-8 h-8" /> : <Circle className="w-8 h-8" />}
                                   </div>
                                   <div>
                                      <h3 className={`text-xl font-black uppercase tracking-tight ${task.is_completed ? 'line-through opacity-30' : 'text-gray-900 dark:text-white'}`}>{task.title}</h3>
                                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t('hub.tasks.due', { date: new Date(task.deadline).toLocaleDateString() })}</span>
                                   </div>
                                </div>
                                {task.drive_link && (
                                  <a href={task.drive_link} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-white dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-[#10b981] transition-all">
                                     <ExternalLink className="w-5 h-5" />
                                  </a>
                                )}
                             </div>

                             {task.requires_submission && !task.is_completed && (
                               <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                                 <input 
                                   type="url"
                                   placeholder={t('hub.tasks.submit_link_placeholder')}
                                   value={submissionUrls[task.id] || ''}
                                   onChange={(e) => setSubmissionUrls({...submissionUrls, [task.id]: e.target.value})}
                                   className="flex-1 bg-white dark:bg-black/30 border border-gray-100 dark:border-white/5 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#10b981]"
                                 />
                                 <button 
                                   onClick={() => handleToggleTask(task.id, false, true)}
                                   className="bg-[#10b981] dark:bg-[#2cfc7d] text-white dark:text-black px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all"
                                 >
                                   {t('hub.tasks.submit_btn')}
                                 </button>
                               </div>
                             )}
                          </div>
                        ))}
                     </div>
                   )}

                   {activeTab === 'attendance' && (
                     <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-2 gap-6">
                           <div className="bg-emerald-50 dark:bg-emerald-500/5 p-8 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-500/10">
                              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">{t('hub.attendance.present')}</span>
                              <p className="text-5xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{attendedCount}</p>
                           </div>
                           <div className="bg-rose-50 dark:bg-rose-500/5 p-8 rounded-[2.5rem] border border-rose-100 dark:border-rose-500/10">
                              <span className="text-[9px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">{t('hub.attendance.absent')}</span>
                              <p className="text-5xl font-black text-rose-600 dark:text-rose-400 mt-2">{attendance.length - attendedCount}</p>
                           </div>
                        </div>

                        <div className="space-y-4">
                           {attendance.map(record => (
                             <div key={record.id} className="flex items-center justify-between p-6 bg-gray-50 dark:bg-white/5 rounded-[2rem] border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-all">
                                <div className="flex gap-4 items-center">
                                   <div className={`w-3 h-3 rounded-full ${record.is_present ? 'bg-[#10b981] dark:bg-[#2cfc7d]' : 'bg-rose-500'}`} />
                                   <div>
                                      <p className="font-black text-gray-900 dark:text-white uppercase tracking-tight">{new Date(record.date).toLocaleDateString()}</p>
                                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{record.is_present ? 'VERIFIED ENTRY' : 'MISSED CHANNEL'}</span>
                                   </div>
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border ${record.is_present ? 'text-[#10b981] border-[#10b981]/20' : 'text-rose-500 border-rose-500/20'}`}>
                                   {record.is_present ? 'PRESENT' : 'ABSENT'}
                                </span>
                             </div>
                           ))}
                        </div>
                     </div>
                   )}

                   {activeTab === 'inquiries' && (
                     <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <form onSubmit={handleSubmitInquiry} className="space-y-6">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                 <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ms-4">{t('hub.support.type')}</label>
                                 <div className="flex p-2 bg-gray-50 dark:bg-black/20 rounded-[2rem] border border-gray-100 dark:border-white/5">
                                    <button type="button" onClick={() => setInquiryType('question')} className={`flex-1 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${inquiryType === 'question' ? 'bg-[#10b981] text-white shadow-lg' : 'text-gray-400'}`}>{t('hub.support.question')}</button>
                                    <button type="button" onClick={() => setInquiryType('complaint')} className={`flex-1 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${inquiryType === 'complaint' ? 'bg-rose-500 text-white shadow-lg' : 'text-gray-400'}`}>{t('hub.support.complaint')}</button>
                                 </div>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ms-4">{t('hub.support.subject')}</label>
                                 <input type="text" value={inquirySubject} onChange={(e) => setInquirySubject(e.target.value)} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-[2rem] px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#10b981]" />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ms-4">{t('hub.support.message')}</label>
                              <textarea rows="4" value={inquiryContent} onChange={(e) => setInquiryContent(e.target.value)} className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-[2.5rem] px-8 py-6 text-sm font-bold focus:outline-none focus:border-[#10b981] resize-none" />
                           </div>
                           <button type="submit" disabled={submittingInquiry} className="w-full py-5 bg-[#10b981] dark:bg-[#2cfc7d] text-white dark:text-black rounded-[2rem] font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50">
                              {submittingInquiry ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : t('hub.support.send')}
                           </button>
                        </form>

                        <div className="space-y-4">
                           {inquiries.map(inq => (
                             <div key={inq.id} className="p-8 bg-gray-50 dark:bg-black/20 rounded-[2.5rem] border border-gray-100 dark:border-white/5 space-y-4">
                                <div className="flex justify-between">
                                   <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${inq.status === 'replied' ? 'text-[#10b981] border-[#10b981]/20 bg-[#10b981]/5' : 'text-amber-500 border-amber-500/20 bg-amber-500/5'}`}>{inq.status}</span>
                                   <span className="text-[9px] font-black text-gray-400">{new Date(inq.created_at).toLocaleDateString()}</span>
                                </div>
                                <h4 className="text-lg font-black uppercase tracking-tight">{inq.subject}</h4>
                                <p className="text-sm text-gray-500 dark:text-white/40 font-medium italic">"{inq.content}"</p>
                                {inq.doctor_reply && (
                                  <div className="mt-6 p-6 bg-white dark:bg-white/5 rounded-2xl border-s-4 border-[#10b981]">
                                     <p className="text-xs font-black text-[#10b981] uppercase tracking-widest mb-2">INSTRUCTOR REPLY</p>
                                     <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{inq.doctor_reply}</p>
                                  </div>
                                )}
                             </div>
                           ))}
                        </div>
                     </div>
                   )}
                </div>
             </div>

             {/* SIDEBAR WIDGETS */}
             <div className="lg:col-span-4 space-y-8">
                
                {/* QR PASS CARD */}
                <div className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[3rem] p-10 flex flex-col items-center text-center shadow-xl relative overflow-hidden group">
                   <div className="absolute top-0 inset-inline-end-0 w-32 h-32 bg-[#2cfc7d]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                   
                   <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 mb-8 border border-gray-100 dark:border-white/5">
                      <QrCode className="w-8 h-8" />
                   </div>
                   
                   <h3 className="text-2xl font-black uppercase tracking-tight mb-2">{t('hub.qr.title')}</h3>
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30 mb-10">{t('hub.qr.desc')}</p>
                   
                   <div className="bg-white p-5 rounded-[2.5rem] shadow-2xl border border-gray-100 group-hover:scale-105 transition-transform duration-500">
                      <QRCodeSVG value={qrToken} size={180} level="H" fgColor="#0c0c14" bgColor="#FFFFFF" />
                   </div>

                   <div className="mt-10 w-full flex items-center justify-center gap-2 py-4 bg-[#10b981]/10 dark:bg-[#2cfc7d]/10 text-[#10b981] dark:text-[#2cfc7d] rounded-2xl text-[10px] font-black uppercase tracking-widest border border-[#10b981]/20">
                      <ShieldCheck className="w-4 h-4" />
                      {t('hub.qr.secure_active')}
                   </div>
                </div>


             </div>

          </div>
        </section>
        </>
        )}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
        .font-arabic { font-family: 'Cairo', sans-serif !important; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default StudentCourseHub;
