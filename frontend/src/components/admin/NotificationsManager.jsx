import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  Bell, Send, Users, User, Building2,
  Link as LinkIcon, Image as ImageIcon, Edit3,
  Trash2, History, Mail, Globe, CheckCircle,
  Clock, Activity, ChevronRight, X, AlertCircle, Calendar,
  GraduationCap, MessageSquare, Layout, Info, Zap
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
  const [activeTab, setActiveTab] = useState('all-students');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [linkData, setLinkData] = useState({ text: '', url: '' });
  const [imageData, setImageData] = useState({ alt: '', url: '' });

  const tabs = [
    { id: 'all-students', label: 'All Students', icon: Globe },
    { id: 'all-doctors', label: 'All Instructors', icon: GraduationCap },
    { id: 'department', label: 'Department', icon: Building2 },
    { id: 'student', label: 'Specific Student', icon: User },
    { id: 'doctor', label: 'Specific Instructor', icon: User },
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
    if (!linkData.url) { toast.error('URL is required'); return; }
    const markdown = `[${linkData.text || linkData.url}](${linkData.url})`;
    insertMarkdown(markdown);
    setShowLinkModal(false);
    setLinkData({ text: '', url: '' });
  };

  const handleInsertImage = () => {
    if (!imageData.url) { toast.error('Image URL is required'); return; }
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
        <a key={`link-${match.index}`} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
          {match[1]}
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
      toast.error('Title and message are required');
      return;
    }

    setSending(true);
    try {
      let endpoint = '';
      let payload = { title: notificationForm.title, content: notificationForm.content };

      if (activeTab === 'all-students') endpoint = '/notifications/admin/send-to-all';
      else if (activeTab === 'all-doctors') endpoint = '/notifications/admin/send-to-all-doctors';
      else if (activeTab === 'department') {
        if (!notificationForm.department_id) { toast.error('Select a department'); setSending(false); return; }
        endpoint = '/notifications/admin/send-to-department';
        payload.department_id = notificationForm.department_id;
      } else if (activeTab === 'student') {
        if (!notificationForm.studentId) { toast.error('Enter student ID'); setSending(false); return; }
        endpoint = '/notifications/admin/send-to-student';
        payload.studentId = notificationForm.studentId;
      } else if (activeTab === 'doctor') {
        if (!notificationForm.doctorId) { toast.error('Enter doctor ID'); setSending(false); return; }
        endpoint = '/notifications/admin/send-to-doctor';
        payload.doctorId = notificationForm.doctorId;
      }

      await api.post(endpoint, payload);
      toast.success('Notification sent successfully');
      setNotificationForm({ studentId: '', doctorId: '', department_id: '', title: '', content: '' });
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-inner">
            <Bell className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              App Notifications
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold mt-1">Send announcements to the student and doctor apps</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* Composition Panel */}
        <div className="space-y-8">
          <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-[60px] pointer-events-none"></div>

            <div className="relative z-10 space-y-8">
                {/* Tabs */}
                <div className="flex flex-wrap gap-2 p-1.5 bg-gray-50/50 dark:bg-black/40 border border-gray-100 dark:border-white/5 rounded-2xl shadow-inner overflow-x-auto no-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 shrink-0 ${
                                activeTab === tab.id
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-indigo-500/10 hover:text-indigo-600'
                            }`}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSend} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Title <span className="text-rose-500">*</span></label>
                            <input type="text" placeholder="Notification Title" value={notificationForm.title} onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-inner" required />
                        </div>

                        {activeTab === 'department' && (
                            <div className="md:col-span-2 space-y-2 animate-in slide-in-from-top-2">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Select Dept <span className="text-rose-500">*</span></label>
                                <select value={notificationForm.department_id || ''} onChange={(e) => setNotificationForm({ ...notificationForm, department_id: e.target.value })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all appearance-none" required>
                                    <option value="">Choose Department</option>
                                    {departments.map((dept) => <option key={dept.id} value={dept.id}>{dept.name} ({dept.code})</option>)}
                                </select>
                            </div>
                        )}

                        {activeTab === 'student' && (
                            <div className="md:col-span-2 space-y-2 animate-in slide-in-from-top-2">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Student ID <span className="text-rose-500">*</span></label>
                                <input type="text" placeholder="e.g. 2024001" value={notificationForm.studentId || ''} onChange={(e) => setNotificationForm({ ...notificationForm, studentId: e.target.value })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-inner" required />
                            </div>
                        )}

                        {activeTab === 'doctor' && (
                            <div className="md:col-span-2 space-y-2 animate-in slide-in-from-top-2">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Instructor ID <span className="text-rose-500">*</span></label>
                                <input type="text" placeholder="e.g. DOC001" value={notificationForm.doctorId || ''} onChange={(e) => setNotificationForm({ ...notificationForm, doctorId: e.target.value })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-inner" required />
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Message <span className="text-rose-500">*</span></label>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setShowLinkModal(true)} className="p-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-500 hover:text-indigo-600 transition-colors shadow-sm"><LinkIcon className="w-4 h-4" /></button>
                                <button type="button" onClick={() => setShowImageModal(true)} className="p-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-500 hover:text-indigo-600 transition-colors shadow-sm"><ImageIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <textarea id="notification_content" placeholder="Type your message here..." rows="6" value={notificationForm.content} onChange={(e) => setNotificationForm({ ...notificationForm, content: e.target.value })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-inner resize-none" required />
                    </div>

                    <button type="submit" disabled={sending} className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-500/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3">
                        {sending ? (
                            <div className="flex items-center gap-3">
                                <Activity className="w-6 h-6 animate-spin" />
                                <span>DISTRIBUTING...</span>
                            </div>
                        ) : (
                            <>
                                <Send className="w-6 h-6" /> 
                                <span>Send Notification</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
          </div>
        </div>

        {/* History Panel */}
        <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2.5rem] flex flex-col h-[850px] shadow-sm relative overflow-hidden group">
            <div className="p-8 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.01] flex justify-between items-center relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center border border-gray-200 dark:border-white/10">
                        <History className="w-5 h-5 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Notification History</h3>
                </div>
                <span className="text-[10px] font-black text-gray-500 bg-white dark:bg-black px-4 py-2 rounded-xl border border-gray-100 dark:border-white/5 uppercase tracking-[0.2em] shadow-inner">{notifications.length} MESSAGES</span>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar relative z-10">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 opacity-30 grayscale group-hover:opacity-40 transition-all">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <Mail className="w-12 h-12 text-gray-400" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">No notifications sent</p>
                    </div>
                ) : (
                notifications.map((notif) => (
                    <div key={notif.id} className="group/item relative bg-white dark:bg-black/40 border border-gray-100 dark:border-white/10 rounded-3xl p-6 hover:border-indigo-500/40 transition-all hover:shadow-lg">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 min-w-0 space-y-3">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h4 className="font-black text-gray-900 dark:text-white text-base tracking-tight truncate max-w-[250px]">{notif.title}</h4>
                                    <div className="flex gap-2">
                                        {notif.doctor_name ? (
                                            <span className="px-2 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 text-[8px] font-black uppercase tracking-tight">DR: {notif.doctor_id}</span>
                                        ) : notif.student_name ? (
                                            <span className="px-2 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 text-[8px] font-black uppercase tracking-tight">ID: {notif.student_id}</span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 text-[8px] font-black uppercase tracking-tight">GLOBAL</span>
                                        )}
                                        <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tight border ${notif.is_read ? 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600'}`}>
                                            {notif.is_read ? 'Read' : 'Unread'}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-medium bg-gray-50/50 dark:bg-white/[0.02] p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                                    {renderContent(notif.content)}
                                </div>
                                <div className="flex items-center gap-6 pt-2">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <Clock className="w-3.5 h-3.5 text-indigo-500/50" />
                                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <Calendar className="w-3.5 h-3.5 text-indigo-500/50" />
                                        {new Date(notif.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 opacity-0 group-hover/item:opacity-100 transition-all">
                                <button onClick={() => { setEditingNotification(notif); setEditNotifForm({ title: notif.title, content: notif.content, is_read: notif.is_read }); setShowEditModal(true); }} className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 hover:bg-blue-600 hover:text-white shadow-sm"><Edit3 className="w-4.5 h-4.5" /></button>
                                <button onClick={() => handleDeleteNotification(notif.id)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white shadow-sm"><Trash2 className="w-4.5 h-4.5" /></button>
                            </div>
                        </div>
                    </div>
                ))
                )}
            </div>
        </div>
      </div>

      {/* Insert Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] p-4" onClick={() => setShowLinkModal(false)}>
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="relative z-10">
                <div className="flex items-center gap-5 mb-8 pb-4 border-b border-gray-100 dark:border-white/10">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 text-indigo-600"><LinkIcon className="w-6 h-6" /></div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Insert Link</h3>
                </div>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Link Text</label>
                        <input type="text" value={linkData.text} onChange={(e) => setLinkData({ ...linkData, text: e.target.value })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold outline-none" placeholder="e.g. Click Here" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">URL <span className="text-rose-500">*</span></label>
                        <input type="url" value={linkData.url} onChange={(e) => setLinkData({ ...linkData, url: e.target.value })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold outline-none" placeholder="https://..." />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button onClick={handleInsertLink} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl transition-all shadow-md">Insert Link</button>
                        <button onClick={() => setShowLinkModal(false)} className="px-8 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-bold py-4 rounded-2xl transition-all">Cancel</button>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Insert Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] p-4" onClick={() => setShowImageModal(false)}>
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="relative z-10">
                <div className="flex items-center gap-5 mb-8 pb-4 border-b border-gray-100 dark:border-white/10">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 text-indigo-600"><ImageIcon className="w-6 h-6" /></div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Insert Image</h3>
                </div>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Alt Text</label>
                        <input type="text" value={imageData.alt} onChange={(e) => setImageData({ ...imageData, alt: e.target.value })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold outline-none" placeholder="e.g. Event Poster" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Image URL <span className="text-rose-500">*</span></label>
                        <input type="url" value={imageData.url} onChange={(e) => setImageData({ ...imageData, url: e.target.value })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold outline-none" placeholder="https://..." />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button onClick={handleInsertImage} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl transition-all shadow-md">Insert Image</button>
                        <button onClick={() => setShowImageModal(false)} className="px-8 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-bold py-4 rounded-2xl transition-all">Cancel</button>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Notification Modal */}
      {showEditModal && editingNotification && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-10 w-full max-w-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="relative z-10">
                <div className="flex items-center gap-5 mb-10 pb-6 border-b border-gray-100 dark:border-white/10">
                    <div className="w-14 h-14 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-2xl flex items-center justify-center border border-yellow-500/20 text-yellow-600"><Edit3 className="w-7 h-7" /></div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Edit Notification</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-bold mt-1">Update notification details</p>
                    </div>
                </div>
                <form onSubmit={handleUpdateNotification} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Title <span className="text-rose-500">*</span></label>
                        <input type="text" value={editNotifForm.title} onChange={(e) => setEditNotifForm({ ...editNotifForm, title: e.target.value })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-yellow-500/50 outline-none transition-all shadow-inner" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Message <span className="text-rose-500">*</span></label>
                        <textarea rows="5" value={editNotifForm.content} onChange={(e) => setEditNotifForm({ ...editNotifForm, content: e.target.value })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-yellow-500/50 outline-none transition-all shadow-inner resize-none" required />
                    </div>
                    <div className="flex items-center gap-4 py-2">
                        <button type="button" onClick={() => setEditNotifForm({ ...editNotifForm, is_read: !editNotifForm.is_read })} className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all ${editNotifForm.is_read ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-600 shadow-inner shadow-emerald-500/10' : 'bg-gray-100/50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500'}`}>
                            {editNotifForm.is_read ? <CheckCircle className="w-4 h-4" /> : <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />}
                            <span className="text-xs font-black uppercase tracking-widest">Mark as Read</span>
                        </button>
                    </div>
                    <div className="flex gap-4 pt-6 border-t border-gray-100 dark:border-white/10">
                        <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4.5 rounded-2xl shadow-md transition-all">Save Changes</button>
                        <button type="button" onClick={() => setShowEditModal(false)} className="px-10 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-bold py-4.5 rounded-2xl transition-all">Cancel</button>
                    </div>
                </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsManager;