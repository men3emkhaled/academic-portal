import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  Bell, Send, Users, User, Building2,
  Link as LinkIcon, Image as ImageIcon, Edit3,
  Trash2, History, Mail, Globe, CheckCircle,
  Clock, Activity, ChevronRight, X, AlertCircle, Calendar,
  GraduationCap, MessageSquare, Layout, Info, Zap, Settings,
  Hash, ExternalLink, Image as ImageLucide
} from 'lucide-react';

const NotificationsManager = ({
  notifications,
  fetchNotifications,
  sending,
  setSending,
  notificationForm,
  setNotificationForm,
  handleUpdateNotification,
  handleDeleteNotification,
  showEditModal,
  setShowEditModal,
  editingNotification,
  setEditingNotification,
  editNotifForm,
  setEditNotifForm,
  departments = []
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('all-students');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [linkData, setLinkData] = useState({ text: '', url: '' });
  const [imageData, setImageData] = useState({ alt: '', url: '' });

  const tabs = [
    { id: 'all-students', label: t('admin.notifications.tabs.all_students'), icon: Globe },
    { id: 'all-doctors', label: t('admin.notifications.tabs.all_doctors'), icon: GraduationCap },
    { id: 'department', label: t('admin.notifications.tabs.department'), icon: Building2 },
    { id: 'student', label: t('admin.notifications.tabs.student'), icon: User },
    { id: 'doctor', label: t('admin.notifications.tabs.doctor'), icon: User },
  ];

  const insertMarkdown = (markdown) => {
    const textareaId = `notification_content`;
    const textarea = document.getElementById(textareaId);
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const newText = before + markdown + after;

    setNotificationForm(prev => ({ ...prev, content: newText }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + markdown.length, start + markdown.length);
    }, 50);
  };

  const handleInsertLink = () => {
    if (!linkData.url) { toast.error(t('admin.messages.url_req')); return; }
    const markdown = `[${linkData.text || linkData.url}](${linkData.url})`;
    insertMarkdown(markdown);
    setShowLinkModal(false);
    setLinkData({ text: '', url: '' });
  };

  const handleInsertImage = () => {
    if (!imageData.url) { toast.error(t('admin.messages.img_url_req')); return; }
    const markdown = `![${imageData.alt || 'image'}](${imageData.url})`;
    insertMarkdown(markdown);
    setShowImageModal(false);
    setImageData({ alt: '', url: '' });
  };

  const renderContent = (content) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`}>{content.substring(lastIndex, match.index)}</span>);
      }
      parts.push(
        <a key={`link-${match.index}`} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline inline-flex items-center gap-1">
          {match[1]} <ExternalLink className="w-3 h-3" />
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }
    if (lastIndex < content.length) {
      parts.push(<span key={`text-${lastIndex}`}>{content.substring(lastIndex)}</span>);
    }
    return parts.length > 0 ? parts : content;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!notificationForm.title || !notificationForm.content) {
      toast.error(t('admin.messages.title_msg_req'));
      return;
    }

    setSending(true);
    try {
      let endpoint = '';
      let payload = { title: notificationForm.title, content: notificationForm.content };

      if (activeTab === 'all-students') endpoint = '/notifications/admin/send-to-all';
      else if (activeTab === 'all-doctors') endpoint = '/notifications/admin/send-to-all-doctors';
      else if (activeTab === 'department') {
        if (!notificationForm.department_id) { toast.error(t('admin.messages.select_dept_req')); setSending(false); return; }
        endpoint = '/notifications/admin/send-to-department';
        payload.department_id = notificationForm.department_id;
      } else if (activeTab === 'student') {
        if (!notificationForm.studentId) { toast.error(t('admin.messages.student_id_req')); setSending(false); return; }
        endpoint = '/notifications/admin/send-to-student';
        payload.studentId = notificationForm.studentId;
      } else if (activeTab === 'doctor') {
        if (!notificationForm.doctorId) { toast.error(t('admin.messages.doctor_id_req')); setSending(false); return; }
        endpoint = '/notifications/admin/send-to-doctor';
        payload.doctorId = notificationForm.doctorId;
      }

      await api.post(endpoint, payload);
      toast.success(t('common.success'));
      setNotificationForm({ studentId: '', doctorId: '', department_id: '', title: '', content: '' });
      fetchNotifications();
    } catch (error) {
      toast.error(t('admin.messages.notif_send_failed'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8 sm:space-y-12 lg:space-y-16 animate-in fade-in duration-700 text-start px-4 sm:px-0 relative z-10">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] inset-inline-end-[-5%] w-[50vw] h-[50vw] bg-[#8b5cf6]/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] inset-inline-start-[-5%] w-[40vw] h-[40vw] bg-[#2cfc7d]/3 blur-[100px] rounded-full"></div>
      </div>

      {/* Header Bento Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 relative z-10">
        <div className="lg:col-span-2 flex items-center gap-4 sm:gap-6 bg-white/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#8b5cf6]/10 dark:bg-[#8b5cf6]/20 rounded-xl sm:rounded-2xl flex items-center justify-center border border-[#8b5cf6]/20 shadow-inner group transition-transform duration-500 hover:scale-110">
            <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-[#8b5cf6]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {t('admin.notifications.title')}
            </h2>
            <p className="text-gray-500 dark:text-slate-500 text-[10px] sm:text-sm font-bold mt-1 uppercase tracking-widest">{t('admin.notifications.description')}</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-lg shadow-purple-600/20 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-inline-end-0 top-0 w-32 h-32 bg-white/10 hidden rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-black/10 px-3 py-1 rounded-full">{t('admin.notifications.composition.relay_status')}</span>
          </div>
          <div className="mt-4 relative z-10">
            <p className="text-4xl sm:text-5xl font-black tracking-tighter">{notifications.length}</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">{t('admin.notifications.composition.transmitted_packets')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-10 relative z-10">
        {/* Composition Panel */}
        <div className="xl:col-span-5 space-y-6 sm:space-y-8">
          <div className="bg-white/50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-8 lg:p-10 shadow-sm relative overflow-hidden group">
            <div className="absolute -inset-inline-end-20 -top-20 w-80 h-80 bg-[#8b5cf6]/5 rounded-full hidden pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>

            <div className="relative z-10 space-y-8">
                {/* Tabs */}
                <div className="flex flex-wrap gap-2 p-1.5 bg-gray-50/50 dark:bg-black/40 border border-gray-100 dark:border-white/5 rounded-2xl shadow-inner overflow-x-auto no-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 shrink-0 ${
                                activeTab === tab.id
                                    ? 'bg-[#8b5cf6] text-white shadow-lg shadow-purple-500/25'
                                    : 'text-gray-400 dark:text-slate-500 hover:bg-[#8b5cf6]/10 hover:text-[#8b5cf6]'
                            }`}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSend} className="space-y-6">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.notifications.composition.title_label')} *</label>
                            <div className="relative">
                                <MessageSquare className="absolute inset-inline-start-4 top-[18px] w-5 h-5 text-gray-400" />
                                <textarea 
                                    rows={1}
                                    placeholder={t('admin.notifications.composition.title_placeholder')} 
                                    value={notificationForm.title} 
                                    onChange={(e) => {
                                        setNotificationForm({ ...notificationForm, title: e.target.value });
                                        e.target.style.height = 'auto';
                                        e.target.style.height = `${e.target.scrollHeight}px`;
                                    }} 
                                    className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-xl ps-12 pe-4 py-4 text-sm font-black focus:ring-4 focus:ring-[#8b5cf6]/10 focus:border-[#8b5cf6]/40 outline-none transition-all shadow-inner resize-none overflow-hidden min-h-[56px] flex items-center" 
                                    required 
                                />
                            </div>
                        </div>

                        {activeTab === 'department' && (
                            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ms-1">{t('admin.notifications.composition.dept_label')} *</label>
                                <div className="relative">
                                    <Building2 className="absolute inset-inline-start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <select value={notificationForm.department_id || ''} onChange={(e) => setNotificationForm({ ...notificationForm, department_id: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-xl ps-12 pe-10 py-4 font-black focus:ring-4 focus:ring-[#8b5cf6]/10 focus:border-[#8b5cf6]/40 outline-none transition-all appearance-none uppercase tracking-widest text-xs h-[56px]" required>
                                        <option value="" className="dark:bg-[#0c0c0e]">{t('admin.notifications.composition.dept_placeholder')}</option>
                                        {departments.map((dept) => <option key={dept.id} value={dept.id} className="dark:bg-[#0c0c0e]">{dept.name} ({dept.code})</option>)}
                                    </select>
                                    <ChevronRight className="absolute inset-inline-end-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 rotate-90" />
                                </div>
                            </div>
                        )}

                        {activeTab === 'student' && (
                            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ms-1">{t('admin.notifications.composition.student_id_label')} *</label>
                                <div className="relative">
                                    <Hash className="absolute inset-inline-start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input type="text" placeholder={t('admin.notifications.composition.student_id_placeholder') || "e.g. 2024001"} value={notificationForm.studentId || ''} onChange={(e) => setNotificationForm({ ...notificationForm, studentId: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-xl ps-12 pe-4 py-4 text-sm font-black focus:ring-4 focus:ring-[#8b5cf6]/10 focus:border-[#8b5cf6]/40 outline-none transition-all shadow-inner h-[56px]" required />
                                </div>
                            </div>
                        )}

                        {activeTab === 'doctor' && (
                            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ms-1">{t('admin.notifications.composition.doctor_id_label')} *</label>
                                <div className="relative">
                                    <Hash className="absolute inset-inline-start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input type="text" placeholder={t('admin.notifications.composition.doctor_id_placeholder') || "e.g. DOC001"} value={notificationForm.doctorId || ''} onChange={(e) => setNotificationForm({ ...notificationForm, doctorId: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-xl ps-12 pe-4 py-4 text-sm font-black focus:ring-4 focus:ring-[#8b5cf6]/10 focus:border-[#8b5cf6]/40 outline-none transition-all shadow-inner h-[56px]" required />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('admin.notifications.composition.message_label')} *</label>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setShowLinkModal(true)} className="p-2.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-gray-400 hover:text-[#8b5cf6] hover:border-[#8b5cf6]/30 transition-all shadow-sm"><LinkIcon className="w-4 h-4" /></button>
                                <button type="button" onClick={() => setShowImageModal(true)} className="p-2.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-gray-400 hover:text-[#8b5cf6] hover:border-[#8b5cf6]/30 transition-all shadow-sm"><ImageIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <textarea id="notification_content" placeholder={t('admin.notifications.composition.message_placeholder')} rows="6" value={notificationForm.content} onChange={(e) => setNotificationForm({ ...notificationForm, content: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-5 py-4 font-bold focus:ring-4 focus:ring-[#8b5cf6]/10 focus:border-[#8b5cf6]/40 outline-none transition-all shadow-inner resize-none min-h-[160px]" required />
                    </div>

                    <button type="submit" disabled={sending} className="w-full py-4.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-purple-600/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group">
                        {sending ? (
                            <div className="flex items-center gap-2">
                                <Activity className="w-5 h-5 animate-spin" />
                                <span>{t('admin.notifications.composition.distributing')}</span>
                            </div>
                        ) : (
                            <>
                                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" /> 
                                <span>{t('admin.notifications.composition.send_button')}</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
          </div>
        </div>

        {/* History Panel */}
        <div className="xl:col-span-7 bg-white/50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-[2.5rem] sm:rounded-[3rem] flex flex-col h-[750px] shadow-sm relative overflow-hidden group">
            <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.01] flex justify-between items-center relative z-10 shrink-0">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-white/5 rounded-xl sm:rounded-2xl flex items-center justify-center border border-gray-100 dark:border-white/10 shadow-sm">
                        <History className="w-5 h-5 sm:w-6 sm:h-6 text-[#8b5cf6]" />
                    </div>
                    <div>
                        <h3 className="text-base sm:text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">{t('admin.notifications.history.title')}</h3>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{t('admin.notifications.history.messages_count', { count: notifications.length })}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 sm:space-y-8 custom-scrollbar relative z-10">
                <>
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 opacity-30 grayscale group-hover:opacity-40 transition-all">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 shadow-inner">
                            <Mail className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">{t('admin.notifications.history.no_history')}</p>
                    </div>
                ) : (
                notifications.map((notif, idx) => (
                    <div 
                        key={notif.id}
                        className="group/item relative bg-white dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-[2rem] p-6 sm:p-8 hover:border-[#8b5cf6]/20 hover:bg-[#8b5cf6]/[0.01] transition-all hover:shadow-xl"
                    >
                        <div className="flex justify-between items-start gap-4 sm:gap-6">
                            <div className="flex-1 min-w-0 space-y-3 sm:space-y-4">
                                <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                                    <h4 className="font-black text-gray-900 dark:text-white text-base sm:text-lg tracking-tight truncate max-w-[200px] sm:max-w-[300px] group-hover/item:text-[#8b5cf6] transition-colors">{notif.title}</h4>
                                    <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                                        {notif.doctor_name ? (
                                            <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[8px] sm:text-[9px] font-black uppercase tracking-widest">{t('admin.notifications.history.doctor_prefix')}{notif.doctor_id}</span>
                                        ) : notif.student_name ? (
                                            <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 text-[8px] sm:text-[9px] font-black uppercase tracking-widest">{t('admin.notifications.history.student_prefix')}{notif.student_id}</span>
                                        ) : notif.department_name ? (
                                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] sm:text-[9px] font-black uppercase tracking-widest">{notif.department_name}</span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[#8b5cf6] text-[8px] sm:text-[9px] font-black uppercase tracking-widest">{t('admin.notifications.history.global')}</span>
                                        )}
                                        <span className={`px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-widest border transition-colors ${notif.is_read ? 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600'}`}>
                                            {notif.is_read ? t('admin.notifications.history.read') : t('admin.notifications.history.unread')}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed font-bold bg-gray-50/50 dark:bg-white/[0.01] p-4 sm:p-6 rounded-2xl border border-gray-100 dark:border-white/5 group-hover/item:border-[#8b5cf6]/10 transition-colors">
                                    {renderContent(notif.content)}
                                </div>
                                <div className="flex items-center gap-6 pt-1">
                                    <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <Clock className="w-3.5 h-3.5 text-[#8b5cf6]/40" />
                                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <Calendar className="w-3.5 h-3.5 text-[#8b5cf6]/40" />
                                        {new Date(notif.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 opacity-0 group-hover/item:opacity-100 transition-all scale-90 group-hover/item:scale-100">
                                <button onClick={() => { setEditingNotification(notif); setEditNotifForm({ title: notif.title, content: notif.content, is_read: notif.is_read }); setShowEditModal(true); }} className="w-8.5 h-8.5 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all shadow-sm"><Edit3 className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteNotification(notif.id)} className="w-8.5 h-8.5 flex items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all shadow-sm"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>
                ))
                )}
                </>
            </div>
        </div>
      </div>

      {/* Modals Container */}
      <>
        {/* Link Modal */}
        {showLinkModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
                <div onClick={() => setShowLinkModal(false)} className="absolute inset-0 bg-gray-950/40 dark:bg-black/80 backdrop-blur-sm transition-opacity duration-300" />
                <div className="bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-white/5 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 w-full max-w-md shadow-2xl relative overflow-hidden z-10 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#8b5cf6]/10 rounded-xl flex items-center justify-center border border-[#8b5cf6]/20 text-[#8b5cf6]"><LinkIcon className="w-5 h-5" /></div>
                            <h3 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t('admin.notifications.modals.insert_link')}</h3>
                        </div>
                        <button onClick={() => setShowLinkModal(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center transition-colors">
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                    <div className="space-y-5 text-start">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.notifications.modals.link_text')}</label>
                            <input type="text" value={linkData.text} onChange={(e) => setLinkData({ ...linkData, text: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-black outline-none focus:ring-4 focus:ring-[#8b5cf6]/10 focus:border-[#8b5cf6]/40 transition-all shadow-inner" placeholder={t('admin.notifications.modals.link_placeholder')} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.notifications.modals.url')} *</label>
                            <input type="url" value={linkData.url} onChange={(e) => setLinkData({ ...linkData, url: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-black outline-none focus:ring-4 focus:ring-[#8b5cf6]/10 focus:border-[#8b5cf6]/40 transition-all shadow-inner" placeholder="https://..." required />
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button onClick={handleInsertLink} className="flex-1 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-black py-4.5 rounded-xl transition-all shadow-lg shadow-purple-500/20 uppercase tracking-widest text-[10px]">{t('admin.notifications.modals.insert_link_btn')}</button>
                            <button onClick={() => setShowLinkModal(false)} className="px-8 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-black py-4.5 rounded-xl transition-all uppercase tracking-widest text-[10px]">{t('common.cancel')}</button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Image Modal */}
        {showImageModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
                <div onClick={() => setShowImageModal(false)} className="absolute inset-0 bg-gray-950/40 dark:bg-black/80 backdrop-blur-sm transition-opacity duration-300" />
                <div className="bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-white/5 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 w-full max-w-md shadow-2xl relative overflow-hidden z-10 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#8b5cf6]/10 rounded-xl flex items-center justify-center border border-[#8b5cf6]/20 text-[#8b5cf6]"><ImageLucide className="w-5 h-5" /></div>
                            <h3 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t('admin.notifications.modals.insert_image')}</h3>
                        </div>
                        <button onClick={() => setShowImageModal(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center transition-colors">
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                    <div className="space-y-5 text-start">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.notifications.modals.alt_text')}</label>
                            <input type="text" value={imageData.alt} onChange={(e) => setImageData({ ...imageData, alt: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-black outline-none focus:ring-4 focus:ring-[#8b5cf6]/10 focus:border-[#8b5cf6]/40 transition-all shadow-inner" placeholder={t('admin.notifications.modals.img_placeholder')} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.notifications.modals.image_url')} *</label>
                            <input type="url" value={imageData.url} onChange={(e) => setImageData({ ...imageData, url: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-black outline-none focus:ring-4 focus:ring-[#8b5cf6]/10 focus:border-[#8b5cf6]/40 transition-all shadow-inner" placeholder="https://..." required />
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button onClick={handleInsertImage} className="flex-1 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-black py-4.5 rounded-xl transition-all shadow-lg shadow-purple-500/20 uppercase tracking-widest text-[10px]">{t('admin.notifications.modals.insert_image_btn')}</button>
                            <button onClick={() => setShowImageModal(false)} className="px-8 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-black py-4.5 rounded-xl transition-all uppercase tracking-widest text-[10px]">{t('common.cancel')}</button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingNotification && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
                <div onClick={() => setShowEditModal(false)} className="absolute inset-0 bg-gray-950/40 dark:bg-black/80 backdrop-blur-sm transition-opacity duration-300" />
                <div className="bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-white/5 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 w-full max-w-lg shadow-2xl relative overflow-hidden z-10 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#8b5cf6]/10 rounded-xl flex items-center justify-center border border-[#8b5cf6]/20 text-[#8b5cf6] shadow-inner"><Edit3 className="w-6 h-6" /></div>
                            <div>
                                <h3 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t('admin.notifications.modals.edit_notification')}</h3>
                                <p className="text-gray-400 text-[9px] font-black uppercase tracking-widest mt-1">{t('admin.notifications.modals.update_relay_params')}</p>
                            </div>
                        </div>
                        <button onClick={() => setShowEditModal(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center transition-colors">
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                    <form onSubmit={handleUpdateNotification} className="space-y-5 text-start">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.notifications.composition.title_label')} *</label>
                            <input type="text" value={editNotifForm.title} onChange={(e) => setEditNotifForm({ ...editNotifForm, title: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-black focus:ring-4 focus:ring-[#8b5cf6]/10 focus:border-[#8b5cf6]/40 outline-none transition-all shadow-inner" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.notifications.composition.message_label')} *</label>
                            <textarea rows="5" value={editNotifForm.content} onChange={(e) => setEditNotifForm({ ...editNotifForm, content: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:ring-4 focus:ring-[#8b5cf6]/10 focus:border-[#8b5cf6]/40 outline-none transition-all shadow-inner resize-none min-h-[120px]" required />
                        </div>
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={() => setEditNotifForm({ ...editNotifForm, is_read: !editNotifForm.is_read })} className={`flex items-center gap-2.5 px-4 py-3.5 rounded-xl border transition-all ${editNotifForm.is_read ? 'bg-[#8b5cf6]/10 border-[#8b5cf6]/30 text-[#8b5cf6]' : 'bg-gray-100/50 dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-400'}`}>
                                {editNotifForm.is_read ? <CheckCircle className="w-4 h-4" /> : <div className="w-4 h-4 border-2 border-gray-300 dark:border-slate-600 rounded-full" />}
                                <span className="text-[9px] font-black uppercase tracking-[0.2em]">{t('admin.notifications.modals.mark_as_read')}</span>
                            </button>
                        </div>
                        <div className="flex gap-4 pt-6 border-t border-gray-100 dark:border-white/5">
                            <button type="submit" className="flex-1 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-black py-4 rounded-xl shadow-lg shadow-purple-500/20 transition-all uppercase tracking-widest text-[10px]">{t('common.save')}</button>
                            <button type="button" onClick={() => setShowEditModal(false)} className="px-8 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-black py-4 rounded-xl transition-all uppercase tracking-widest text-[10px]">{t('common.cancel')}</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
      </>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(139, 92, 246, 0.15); 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(139, 92, 246, 0.3); }
      `}</style>
    </div>
  );
};

export default NotificationsManager;