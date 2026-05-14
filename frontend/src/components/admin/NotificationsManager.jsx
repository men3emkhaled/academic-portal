import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="space-y-8 lg:space-y-10 animate-in fade-in duration-700">
      {/* Header Bento Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex items-center gap-6 bg-white/50 dark:bg-white/[0.02] backdrop-blur-md border border-gray-100 dark:border-white/5 p-8 rounded-[2.5rem] shadow-sm">
          <div className="w-16 h-16 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-inner group transition-transform duration-500 hover:scale-110">
            <Bell className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {t('admin.notifications.title')}
            </h2>
            <p className="text-gray-500 dark:text-slate-500 text-sm font-bold mt-1 uppercase tracking-widest">{t('admin.notifications.description')}</p>
          </div>
        </div>
        
        <div className="bg-indigo-600 text-white p-8 rounded-[2.5rem] shadow-lg shadow-indigo-600/20 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-inline-end-0 top-0 w-32 h-32 bg-white/10 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-black/10 px-3 py-1 rounded-full">{t('admin.notifications.composition.relay_status')}</span>
          </div>
          <div className="mt-4 relative z-10">
            <p className="text-4xl font-black">{notifications.length}</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">{t('admin.notifications.composition.transmitted_packets')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* Composition Panel */}
        <div className="space-y-8">
          <div className="bg-white/50 dark:bg-white/[0.01] backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-[3rem] p-8 lg:p-10 shadow-sm relative overflow-hidden group">
            <div className="absolute -inset-inline-end-20 -top-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>

            <div className="relative z-10 space-y-10">
                {/* Tabs */}
                <div className="flex flex-wrap gap-2.5 p-2 bg-gray-50/50 dark:bg-black/40 border border-gray-100 dark:border-white/5 rounded-[1.5rem] shadow-inner overflow-x-auto no-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 shrink-0 ${
                                activeTab === tab.id
                                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30'
                                    : 'text-gray-400 dark:text-slate-500 hover:bg-indigo-500/10 hover:text-indigo-600'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSend} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-2 space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.notifications.composition.title_label')} *</label>
                            <div className="relative">
                                <MessageSquare className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type="text" placeholder={t('admin.notifications.composition.title_placeholder')} value={notificationForm.title} onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl ps-14 pe-6 py-4.5 font-black focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-inner" required />
                            </div>
                        </div>

                        {activeTab === 'department' && (
                            <div className="md:col-span-2 space-y-3 animate-in slide-in-from-top-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ms-1">{t('admin.notifications.composition.dept_label')} *</label>
                                <div className="relative">
                                    <Building2 className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <select value={notificationForm.department_id || ''} onChange={(e) => setNotificationForm({ ...notificationForm, department_id: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl ps-14 pe-6 py-4.5 font-black focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all appearance-none uppercase tracking-widest text-[11px]" required>
                                        <option value="">{t('admin.notifications.composition.dept_placeholder')}</option>
                                        {departments.map((dept) => <option key={dept.id} value={dept.id}>{dept.name} ({dept.code})</option>)}
                                    </select>
                                    <ChevronRight className="absolute inset-inline-end-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 rotate-90" />
                                </div>
                            </div>
                        )}

                        {activeTab === 'student' && (
                            <div className="md:col-span-2 space-y-3 animate-in slide-in-from-top-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ms-1">{t('admin.notifications.composition.student_id_label')} *</label>
                                <div className="relative">
                                    <Hash className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input type="text" placeholder={t('admin.notifications.composition.student_id_placeholder') || "e.g. 2024001"} value={notificationForm.studentId || ''} onChange={(e) => setNotificationForm({ ...notificationForm, studentId: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl ps-14 pe-6 py-4.5 font-black focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-inner" required />
                                </div>
                            </div>
                        )}

                        {activeTab === 'doctor' && (
                            <div className="md:col-span-2 space-y-3 animate-in slide-in-from-top-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ms-1">{t('admin.notifications.composition.doctor_id_label')} *</label>
                                <div className="relative">
                                    <Hash className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input type="text" placeholder={t('admin.notifications.composition.doctor_id_placeholder') || "e.g. DOC001"} value={notificationForm.doctorId || ''} onChange={(e) => setNotificationForm({ ...notificationForm, doctorId: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl ps-14 pe-6 py-4.5 font-black focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-inner" required />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('admin.notifications.composition.message_label')} *</label>
                            <div className="flex gap-2.5">
                                <button type="button" onClick={() => setShowLinkModal(true)} className="p-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-gray-400 hover:text-indigo-600 hover:border-indigo-500/30 transition-all shadow-sm"><LinkIcon className="w-4 h-4" /></button>
                                <button type="button" onClick={() => setShowImageModal(true)} className="p-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl text-gray-400 hover:text-indigo-600 hover:border-indigo-500/30 transition-all shadow-sm"><ImageIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <textarea id="notification_content" placeholder={t('admin.notifications.composition.message_placeholder')} rows="8" value={notificationForm.content} onChange={(e) => setNotificationForm({ ...notificationForm, content: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-[2rem] px-6 py-5 font-black focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-inner resize-none min-h-[200px]" required />
                    </div>

                    <button type="submit" disabled={sending} className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-widest rounded-[2rem] shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group">
                        {sending ? (
                            <div className="flex items-center gap-3">
                                <Activity className="w-6 h-6 animate-spin" />
                                <span>{t('admin.notifications.composition.distributing')}</span>
                            </div>
                        ) : (
                            <>
                                <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
                                <span>{t('admin.notifications.composition.send_button')}</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
          </div>
        </div>

        {/* History Panel */}
        <div className="bg-white/50 dark:bg-white/[0.01] backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-[3rem] flex flex-col h-[850px] shadow-sm relative overflow-hidden group">
            <div className="p-8 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.01] flex justify-between items-center relative z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center border border-gray-100 dark:border-white/10 shadow-sm">
                        <History className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">{t('admin.notifications.history.title')}</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{t('admin.notifications.history.messages_count', { count: notifications.length })}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar relative z-10">
                <AnimatePresence>
                {notifications.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-32 opacity-30 grayscale group-hover:opacity-40 transition-all"
                    >
                        <div className="w-24 h-24 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <Mail className="w-12 h-12 text-gray-400" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">{t('admin.notifications.history.no_history')}</p>
                    </motion.div>
                ) : (
                notifications.map((notif, idx) => (
                    <motion.div 
                        key={notif.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group/item relative bg-white dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8 hover:border-indigo-500/20 hover:bg-indigo-500/[0.02] transition-all hover:shadow-xl"
                    >
                        <div className="flex justify-between items-start gap-6">
                            <div className="flex-1 min-w-0 space-y-4">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h4 className="font-black text-gray-900 dark:text-white text-lg tracking-tight truncate max-w-[300px] group-hover/item:text-indigo-500 transition-colors">{notif.title}</h4>
                                    <div className="flex gap-2">
                                        {notif.doctor_name ? (
                                            <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[9px] font-black uppercase tracking-widest">{t('admin.notifications.history.doctor_prefix')}{notif.doctor_id}</span>
                                        ) : notif.student_name ? (
                                            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 text-[9px] font-black uppercase tracking-widest">{t('admin.notifications.history.student_prefix')}{notif.student_id}</span>
                                        ) : (
                                            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-[9px] font-black uppercase tracking-widest">{t('admin.notifications.history.global')}</span>
                                        )}
                                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-colors ${notif.is_read ? 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600'}`}>
                                            {notif.is_read ? t('admin.notifications.history.read') : t('admin.notifications.history.unread')}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed font-bold bg-gray-50/50 dark:bg-white/[0.01] p-6 rounded-[1.5rem] border border-gray-100 dark:border-white/5 group-hover/item:border-indigo-500/10 transition-colors">
                                    {renderContent(notif.content)}
                                </div>
                                <div className="flex items-center gap-8 pt-2">
                                    <div className="flex items-center gap-2.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <Clock className="w-4 h-4 text-indigo-500/40" />
                                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="flex items-center gap-2.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <Calendar className="w-4 h-4 text-indigo-500/40" />
                                        {new Date(notif.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 opacity-0 group-hover/item:opacity-100 transition-all scale-90 group-hover/item:scale-100">
                                <button onClick={() => { setEditingNotification(notif); setEditNotifForm({ title: notif.title, content: notif.content, is_read: notif.is_read }); setShowEditModal(true); }} className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all shadow-sm"><Edit3 className="w-4.5 h-4.5" /></button>
                                <button onClick={() => handleDeleteNotification(notif.id)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all shadow-sm"><Trash2 className="w-4.5 h-4.5" /></button>
                            </div>
                        </div>
                    </motion.div>
                ))
                )}
                </AnimatePresence>
            </div>
        </div>
      </div>

      {/* Modals Container */}
      <AnimatePresence>
        {/* Link Modal */}
        {showLinkModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLinkModal(false)} className="absolute inset-0 bg-gray-950/40 dark:bg-black/80 backdrop-blur-md" />
                <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white dark:bg-[#080808] border border-gray-100 dark:border-white/5 rounded-[3rem] p-10 w-full max-w-md shadow-2xl relative overflow-hidden z-10" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-5 mb-10 pb-6 border-b border-gray-100 dark:border-white/5">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 text-indigo-600"><LinkIcon className="w-6 h-6" /></div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t('admin.notifications.modals.insert_link')}</h3>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.notifications.modals.link_text')}</label>
                            <input type="text" value={linkData.text} onChange={(e) => setLinkData({ ...linkData, text: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 font-black outline-none" placeholder={t('admin.notifications.modals.link_placeholder')} />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.notifications.modals.url')} *</label>
                            <input type="url" value={linkData.url} onChange={(e) => setLinkData({ ...linkData, url: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 font-black outline-none" placeholder="https://..." required />
                        </div>
                        <div className="flex gap-4 pt-6">
                            <button onClick={handleInsertLink} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-[2rem] transition-all shadow-xl shadow-indigo-500/20 uppercase tracking-widest text-[10px]">{t('admin.notifications.modals.insert_link_btn')}</button>
                            <button onClick={() => setShowLinkModal(false)} className="px-10 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-black py-4 rounded-[2rem] transition-all uppercase tracking-widest text-[10px]">{t('common.cancel')}</button>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}

        {/* Image Modal */}
        {showImageModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowImageModal(false)} className="absolute inset-0 bg-gray-950/40 dark:bg-black/80 backdrop-blur-md" />
                <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white dark:bg-[#080808] border border-gray-100 dark:border-white/5 rounded-[3rem] p-10 w-full max-w-md shadow-2xl relative overflow-hidden z-10" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-5 mb-10 pb-6 border-b border-gray-100 dark:border-white/5">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 text-indigo-600"><ImageLucide className="w-6 h-6" /></div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t('admin.notifications.modals.insert_image')}</h3>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.notifications.modals.alt_text')}</label>
                            <input type="text" value={imageData.alt} onChange={(e) => setImageData({ ...imageData, alt: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 font-black outline-none" placeholder={t('admin.notifications.modals.img_placeholder')} />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.notifications.modals.image_url')} *</label>
                            <input type="url" value={imageData.url} onChange={(e) => setImageData({ ...imageData, url: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 font-black outline-none" placeholder="https://..." required />
                        </div>
                        <div className="flex gap-4 pt-6">
                            <button onClick={handleInsertImage} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-[2rem] transition-all shadow-xl shadow-indigo-500/20 uppercase tracking-widest text-[10px]">{t('admin.notifications.modals.insert_image_btn')}</button>
                            <button onClick={() => setShowImageModal(false)} className="px-10 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-black py-4 rounded-[2rem] transition-all uppercase tracking-widest text-[10px]">{t('common.cancel')}</button>
                        </div>
                    </div>
                </motion.div>
            </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingNotification && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEditModal(false)} className="absolute inset-0 bg-gray-950/40 dark:bg-black/80 backdrop-blur-md" />
                <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white dark:bg-[#080808] border border-gray-100 dark:border-white/5 rounded-[3rem] p-10 lg:p-12 w-full max-w-2xl shadow-2xl relative overflow-hidden z-10" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-6 mb-10 pb-8 border-b border-gray-100 dark:border-white/5">
                        <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center border border-yellow-500/20 text-yellow-600 shadow-inner"><Edit3 className="w-8 h-8" /></div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t('admin.notifications.modals.edit_notification')}</h3>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">{t('admin.notifications.modals.update_relay_params')}</p>
                        </div>
                    </div>
                    <form onSubmit={handleUpdateNotification} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.notifications.composition.title_label')} *</label>
                            <input type="text" value={editNotifForm.title} onChange={(e) => setEditNotifForm({ ...editNotifForm, title: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 font-black focus:ring-4 focus:ring-yellow-500/10 outline-none transition-all shadow-inner" required />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.notifications.composition.message_label')} *</label>
                            <textarea rows="6" value={editNotifForm.content} onChange={(e) => setEditNotifForm({ ...editNotifForm, content: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-[2rem] px-6 py-5 font-black focus:ring-4 focus:ring-yellow-500/10 outline-none transition-all shadow-inner resize-none" required />
                        </div>
                        <div className="flex items-center gap-4">
                            <button type="button" onClick={() => setEditNotifForm({ ...editNotifForm, is_read: !editNotifForm.is_read })} className={`flex items-center gap-3 px-8 py-4 rounded-2xl border transition-all ${editNotifForm.is_read ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' : 'bg-gray-100/50 dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-400'}`}>
                                {editNotifForm.is_read ? <CheckCircle className="w-5 h-5" /> : <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />}
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('admin.notifications.modals.mark_as_read')}</span>
                            </button>
                        </div>
                        <div className="flex gap-6 pt-10 border-t border-gray-100 dark:border-white/5">
                            <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-[2.5rem] shadow-xl shadow-indigo-500/20 transition-all uppercase tracking-widest text-xs">{t('common.save')}</button>
                            <button type="button" onClick={() => setShowEditModal(false)} className="px-14 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-black py-5 rounded-[2.5rem] transition-all uppercase tracking-widest text-xs">{t('common.cancel')}</button>
                        </div>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(99, 102, 241, 0.1); 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.2); }
      `}</style>
    </div>
  );
};

export default NotificationsManager;