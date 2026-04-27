import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  Bell, Send, Users, User, Building2,
  Link as LinkIcon, Image as ImageIcon, Edit3,
  Trash2, History, Mail, Globe, CheckCircle,
  Clock, Activity, ChevronRight, X, AlertCircle, Calendar
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
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [linkData, setLinkData] = useState({ text: '', url: '' });
  const [imageData, setImageData] = useState({ alt: '', url: '' });
  const [targetField, setTargetField] = useState('all');

  const insertMarkdown = (fieldId, markdown) => {
    const textarea = document.getElementById(fieldId);
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
    const { text, url } = linkData;
    if (!url) {
      toast.error('Please enter a URL');
      return;
    }
    let displayText = text.trim();
    if (displayText === '') {
      let shortUrl = url.replace(/^https?:\/\//, '');
      displayText = shortUrl.length > 40 ? shortUrl.substring(0, 37) + '...' : shortUrl;
    } else if (displayText.length > 40) {
      displayText = displayText.substring(0, 37) + '...';
    }
    const markdown = `[${displayText}](${url})`;
    const fieldId = `notificationContent_${targetField}`;
    insertMarkdown(fieldId, markdown);
    setShowLinkModal(false);
    setLinkData({ text: '', url: '' });
  };

  const handleInsertImage = () => {
    const { alt, url } = imageData;
    if (!url) {
      toast.error('Please enter an image URL');
      return;
    }
    const altText = alt.trim() === '' ? 'image' : alt;
    const markdown = `![${altText}](${url})`;
    const fieldId = `notificationContent_${targetField}`;
    insertMarkdown(fieldId, markdown);
    setShowImageModal(false);
    setImageData({ alt: '', url: '' });
  };

  const openLinkModal = (field) => {
    setTargetField(field);
    setLinkData({ text: '', url: '' });
    setShowLinkModal(true);
  };

  const openImageModal = (field) => {
    setTargetField(field);
    setImageData({ alt: '', url: '' });
    setShowImageModal(true);
  };

  const renderContent = (content) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        const textBefore = content.substring(lastIndex, match.index).trim();
        if (textBefore) {
          parts.push(<span key={`text-${lastIndex}`} className="inline">{textBefore} </span>);
        }
      }
      parts.push(
        <a
          key={`link-${match.index}`}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition-all font-bold text-[10px] uppercase tracking-wider mx-1"
        >
          <LinkIcon className="w-3 h-3" /> {match[1]}
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < content.length) {
      const textAfter = content.substring(lastIndex).trim();
      if (textAfter) {
        parts.push(<span key={`text-${lastIndex}`} className="inline"> {textAfter}</span>);
      }
    }
    return parts.length > 0 ? parts : content;
  };

  const handleSendToAll = async (e) => {
    e.preventDefault();
    if (!notificationForm.title || !notificationForm.content) {
      toast.error('Title and content are required');
      return;
    }
    setSending(true);
    try {
      await api.post('/notifications/admin/send-to-all', {
        title: notificationForm.title,
        content: notificationForm.content,
      });
      toast.success('Broadcast distributed to all nodes');
      setNotificationForm({ studentId: '', department_id: '', title: '', content: '' });
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to initiate broadcast');
    } finally {
      setSending(false);
    }
  };

  const handleSendToStudent = async (e) => {
    e.preventDefault();
    if (!notificationForm.studentId || !notificationForm.title || !notificationForm.content) {
      toast.error('Identifier, title, and content required');
      return;
    }
    setSending(true);
    try {
      await api.post('/notifications/admin/send-to-student', {
        studentId: notificationForm.studentId,
        title: notificationForm.title,
        content: notificationForm.content,
      });
      toast.success(`Encrypted packet sent to student ${notificationForm.studentId}`);
      setNotificationForm({ studentId: '', department_id: '', title: '', content: '' });
      fetchNotifications();
    } catch (error) {
      toast.error('Direct link failure');
    } finally {
      setSending(false);
    }
  };

  const handleSendToDepartment = async (e) => {
    e.preventDefault();
    if (!notificationForm.department_id || !notificationForm.title || !notificationForm.content) {
      toast.error('Unit, title, and content required');
      return;
    }
    setSending(true);
    try {
      const res = await api.post('/notifications/admin/send-to-department', {
        department_id: notificationForm.department_id,
        title: notificationForm.title,
        content: notificationForm.content,
      });
      toast.success(res.data.message || `Unit broadcast successful`);
      setNotificationForm({ studentId: '', department_id: '', title: '', content: '' });
      fetchNotifications();
    } catch (error) {
      toast.error('Unit broadcast failure');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="animate-fadeIn pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-2 h-10 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Comm Center
            </h2>
            <p className="text-gray-500 dark:text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Multi-Channel Notification Matrix</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-8">

          {/* Send to All */}
          <div className="admin-card relative overflow-hidden group border-blue-500/10 transition-colors">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-[80px] rounded-full transition-all"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/20 dark:border-blue-500/30 transition-colors">
                  <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Global Broadcast</h3>
                  <p className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase tracking-widest transition-colors">Target: All registered nodes</p>
                </div>
              </div>

              <form onSubmit={handleSendToAll} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4">Subject Vector</label>
                  <input type="text" placeholder="Global system alert..." value={notificationForm.title} onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })} className="admin-input" required />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4">Payload Content</label>
                  <textarea id="notificationContent_all" rows="3" value={notificationForm.content} onChange={(e) => setNotificationForm({ ...notificationForm, content: e.target.value })} className="admin-input scrollbar-hide" required />
                  <div className="flex gap-2 mt-2">
                    <button type="button" onClick={() => openLinkModal('all')} className="px-3 py-1.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-lg text-[10px] font-black uppercase text-gray-500 dark:text-slate-400 hover:bg-blue-500/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex items-center gap-2 tracking-widest transition-colors">
                      <LinkIcon className="w-3 h-3" /> Link
                    </button>
                    <button type="button" onClick={() => openImageModal('all')} className="px-3 py-1.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-lg text-[10px] font-black uppercase text-gray-500 dark:text-slate-400 hover:bg-blue-500/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex items-center gap-2 tracking-widest transition-colors">
                      <ImageIcon className="w-3 h-3" /> Image
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={sending} className="w-full admin-btn-primary h-[55px] flex items-center justify-center gap-3">
                  {sending ? <Activity className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> DISTRIBUTE PACKET</>}
                </button>
              </form>
            </div>
          </div>

          {/* Send to Department */}
          <div className="admin-card relative overflow-hidden group border-purple-500/10 transition-colors">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 blur-[80px] rounded-full transition-all"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-500/10 dark:bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/20 dark:border-purple-500/30 transition-colors">
                  <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Unit Sector Ping</h3>
                  <p className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase tracking-widest transition-colors">Target: Specific department sub-grid</p>
                </div>
              </div>

              <form onSubmit={handleSendToDepartment} className="space-y-5">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4">Unit</label>
                    <select value={notificationForm.department_id || ''} onChange={(e) => setNotificationForm({ ...notificationForm, department_id: e.target.value })} className="admin-input appearance-none transition-colors" required>
                      <option value="" className="bg-white dark:bg-slate-900">Dept</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id} className="bg-white dark:bg-slate-900">{dept.code}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4">Subject Vector</label>
                    <input type="text" placeholder="Dept specific ping..." value={notificationForm.title} onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })} className="admin-input transition-colors" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4">Payload Content</label>
                  <textarea id="notificationContent_department" rows="3" value={notificationForm.content} onChange={(e) => setNotificationForm({ ...notificationForm, content: e.target.value })} className="admin-input scrollbar-hide transition-colors" required />
                  <div className="flex gap-2 mt-2">
                    <button type="button" onClick={() => openLinkModal('department')} className="px-3 py-1.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-lg text-[10px] font-black uppercase text-gray-500 dark:text-slate-400 hover:bg-purple-500/20 hover:text-purple-600 dark:hover:text-purple-400 transition-all flex items-center gap-2 tracking-widest transition-colors">
                      <LinkIcon className="w-3 h-3" /> Link
                    </button>
                    <button type="button" onClick={() => openImageModal('department')} className="px-3 py-1.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-lg text-[10px] font-black uppercase text-gray-500 dark:text-slate-400 hover:bg-purple-500/20 hover:text-purple-600 dark:hover:text-purple-400 transition-all flex items-center gap-2 tracking-widest transition-colors">
                      <ImageIcon className="w-3 h-3" /> Image
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={sending} className="w-full admin-btn-primary h-[55px] bg-gradient-to-r from-purple-600 to-indigo-600 border-none transition-colors shadow-lg shadow-purple-600/20">
                  {sending ? <Activity className="w-5 h-5 animate-spin mx-auto" /> : 'INITIATE UNIT PING'}
                </button>
              </form>
            </div>
          </div>

          {/* Send to Specific Student */}
          <div className="admin-card relative overflow-hidden group border-cyan-500/10 transition-colors">
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 blur-[80px] rounded-full transition-all"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-cyan-500/10 dark:bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500/20 dark:border-cyan-500/30 transition-colors">
                  <User className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Direct Link</h3>
                  <p className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase tracking-widest transition-colors">Target: Individual student node</p>
                </div>
              </div>

              <form onSubmit={handleSendToStudent} className="space-y-5">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4">ID</label>
                    <input type="text" placeholder="####" value={notificationForm.studentId || ''} onChange={(e) => setNotificationForm({ ...notificationForm, studentId: e.target.value })} className="admin-input transition-colors" required />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4">Subject Vector</label>
                    <input type="text" placeholder="Personal encrypted msg..." value={notificationForm.title} onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })} className="admin-input transition-colors" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4">Payload Content</label>
                  <textarea id="notificationContent_student" rows="3" value={notificationForm.content} onChange={(e) => setNotificationForm({ ...notificationForm, content: e.target.value })} className="admin-input scrollbar-hide transition-colors" required />
                  <div className="flex gap-2 mt-2">
                    <button type="button" onClick={() => openLinkModal('student')} className="px-3 py-1.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-lg text-[10px] font-black uppercase text-gray-500 dark:text-slate-400 hover:bg-cyan-500/20 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all flex items-center gap-2 tracking-widest transition-colors">
                      <LinkIcon className="w-3 h-3" /> Link
                    </button>
                    <button type="button" onClick={() => openImageModal('student')} className="px-3 py-1.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-lg text-[10px] font-black uppercase text-gray-500 dark:text-slate-400 hover:bg-cyan-500/20 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all flex items-center gap-2 tracking-widest transition-colors">
                      <ImageIcon className="w-3 h-3" /> Image
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={sending} className="w-full admin-btn-primary h-[55px] bg-gradient-to-r from-cyan-600 to-teal-600 border-none transition-colors shadow-lg shadow-cyan-600/20">
                  {sending ? <Activity className="w-5 h-5 animate-spin mx-auto" /> : 'OPEN DIRECT CHANNEL'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* History Log */}
        <div className="bg-white dark:bg-[#111111]/40 border border-gray-200 dark:border-white/5 rounded-[2.5rem] flex flex-col h-[1050px] sticky top-10 shadow-sm dark:shadow-2xl transition-colors">
          <div className="p-8 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] flex justify-between items-center transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.1em] flex items-center gap-2 transition-colors">
                <History className="w-4 h-4 text-gray-400 dark:text-slate-500" /> Transmission History
              </h3>
            </div>
            <span className="text-[10px] font-black text-gray-500 dark:text-slate-500 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-xl border border-gray-200 dark:border-white/5 uppercase tracking-widest transition-colors">{notifications.length} Packets</span>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 grayscale opacity-20 transition-all">
                <Mail className="w-20 h-20 mb-4 text-gray-400 dark:text-white" />
                <p className="text-sm font-black uppercase tracking-[0.3em] text-gray-500 dark:text-white">No transmission data</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className="group relative bg-gray-50/50 dark:bg-[#151515]/50 border border-gray-100 dark:border-white/5 rounded-3xl p-6 hover:bg-white dark:hover:bg-white/[0.04] hover:border-blue-500/20 dark:hover:border-white/10 transition-all duration-300">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-3">
                        <h4 className="font-black text-gray-900 dark:text-white tracking-tight truncate transition-colors">{notif.title}</h4>
                        <div className="flex gap-2">
                          {notif.student_name ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-[9px] font-black uppercase tracking-tight transition-colors">
                              <User className="w-2.5 h-2.5" /> ID: {notif.student_id || 'U'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-tight transition-colors">
                              <Globe className="w-2.5 h-2.5" /> GLOBAL
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight border transition-colors ${notif.is_read ? 'bg-gray-200 dark:bg-slate-500/10 border-gray-300 dark:border-slate-500/20 text-gray-500 dark:text-slate-500' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                            }`}>
                            {notif.is_read ? 'STAGED' : 'LIVE'}
                          </span>
                        </div>
                      </div>

                      <div className="text-gray-600 dark:text-slate-400 text-sm font-medium leading-relaxed bg-gray-100 dark:bg-white/[0.02] p-4 rounded-2xl border border-gray-200 dark:border-white/5 break-words transition-colors">
                        {renderContent(notif.content)}
                      </div>

                      <div className="flex items-center gap-4 mt-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest transition-colors">
                        <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(notif.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <button
                        onClick={() => { setEditingNotification(notif); setEditNotifForm({ title: notif.title, content: notif.content, is_read: notif.is_read }); setShowEditModal(true); }}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 hover:bg-yellow-500 hover:text-white dark:hover:text-black transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNotification(notif.id)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-500 hover:bg-red-600 dark:hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Link Modal */}
      {showLinkModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowLinkModal(false)}>
          <div className="admin-modal-panel max-w-md relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-500/10 blur-[60px] rounded-full"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-500/10 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/20 dark:border-blue-500/30 transition-colors">
                  <LinkIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Insert Hyperlink</h3>
                  <p className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase tracking-widest">External Reference Node</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4">Display Label</label>
                  <input type="text" value={linkData.text} onChange={(e) => setLinkData({ ...linkData, text: e.target.value })} className="admin-input" placeholder="e.g. Documentation Portal" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4">Target URL *</label>
                  <input type="url" value={linkData.url} onChange={(e) => setLinkData({ ...linkData, url: e.target.value })} className="admin-input" placeholder="https://..." required />
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={handleInsertLink} className="flex-1 admin-btn-primary h-[55px]">ENCODE LINK</button>
                  <button onClick={() => setShowLinkModal(false)} className="px-8 admin-btn-secondary h-[55px]">ABORT</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="admin-modal-backdrop" onClick={() => setShowImageModal(false)}>
          <div className="admin-modal-panel max-w-md relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-500/10 blur-[60px] rounded-full"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-500/10 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/20 dark:border-blue-500/30 transition-colors">
                  <ImageIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Insert Visual Node</h3>
                  <p className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase tracking-widest">Image Matrix Reference</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4">ALT Description</label>
                  <input type="text" value={imageData.alt} onChange={(e) => setImageData({ ...imageData, alt: e.target.value })} className="admin-input" placeholder="Component identity..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4">Source URL *</label>
                  <input type="url" value={imageData.url} onChange={(e) => setImageData({ ...imageData, url: e.target.value })} className="admin-input" placeholder="https://image-host.net/..." required />
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={handleInsertImage} className="flex-1 admin-btn-primary h-[55px]">INJECT IMAGE</button>
                  <button onClick={() => setShowImageModal(false)} className="px-8 admin-btn-secondary h-[55px]">ABORT</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Notification Modal */}
      {showEditModal && editingNotification && (
        <div className="admin-modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="admin-modal-panel max-w-2xl relative overflow-hidden transition-colors shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-yellow-500/5 blur-[100px] rounded-full"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-2xl flex items-center justify-center border border-yellow-500/20 dark:border-yellow-500/30 transition-colors">
                  <Edit3 className="w-7 h-7 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Recalibrate Packet</h3>
                  <p className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Metadata Registry Interface</p>
                </div>
              </div>

              <form onSubmit={handleUpdateNotification} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4">Modified Vector</label>
                  <input type="text" placeholder="Title" value={editNotifForm.title} onChange={(e) => setEditNotifForm({ ...editNotifForm, title: e.target.value })} className="admin-input" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4">Data Content</label>
                  <textarea placeholder="Content" rows="4" value={editNotifForm.content} onChange={(e) => setEditNotifForm({ ...editNotifForm, content: e.target.value })} className="admin-input scrollbar-hide" required />
                </div>
                <label className="flex items-center gap-3 cursor-pointer group w-fit">
                  <div className={`w-10 h-6 rounded-full p-1 transition-all duration-300 ${editNotifForm.is_read ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-gray-200 dark:bg-slate-800'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${editNotifForm.is_read ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </div>
                  <span className="text-xs font-black uppercase text-gray-500 dark:text-slate-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors tracking-widest">Acknowledge (Stage Only)</span>
                  <input type="checkbox" checked={editNotifForm.is_read} onChange={(e) => setEditNotifForm({ ...editNotifForm, is_read: e.target.checked })} className="hidden" />
                </label>
                <div className="flex gap-4 pt-6">
                  <button type="submit" className="flex-1 admin-btn-primary h-[65px] font-black uppercase tracking-widest">APPLY OVERWRITE</button>
                  <button type="button" onClick={() => setShowEditModal(false)} className="px-10 py-5 admin-btn-secondary h-[65px] font-bold uppercase">ABORT</button>
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