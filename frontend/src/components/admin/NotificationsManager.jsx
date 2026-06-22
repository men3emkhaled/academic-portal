import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Bell, Send, Users, User, Building2, Globe, Link as LinkIcon, Image as ImageIcon, Edit3, Trash2, History, Mail, CheckCircle, Clock, Calendar, X, ExternalLink } from 'lucide-react';

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
    { id: 'all-doctors', label: t('admin.notifications.tabs.all_doctors'), icon: Users },
    { id: 'department', label: t('admin.notifications.tabs.department'), icon: Building2 },
    { id: 'student', label: t('admin.notifications.tabs.student'), icon: User },
    { id: 'doctor', label: t('admin.notifications.tabs.doctor'), icon: User },
  ];

  const insertMarkdown = (markdown) => {
    const textarea = document.getElementById('notification_content');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const newText = text.substring(0, start) + markdown + text.substring(end);
    setNotificationForm(prev => ({ ...prev, content: newText }));
    setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + markdown.length, start + markdown.length); }, 50);
  };

  const handleInsertLink = () => {
    if (!linkData.url) { toast.error(t('admin.messages.url_req')); return; }
    insertMarkdown(`[${linkData.text || linkData.url}](${linkData.url})`);
    setShowLinkModal(false);
    setLinkData({ text: '', url: '' });
  };

  const handleInsertImage = () => {
    if (!imageData.url) { toast.error(t('admin.messages.img_url_req')); return; }
    insertMarkdown(`![${imageData.alt || 'image'}](${imageData.url})`);
    setShowImageModal(false);
    setImageData({ alt: '', url: '' });
  };

  const renderContent = (content) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = linkRegex.exec(content)) !== null) {
      if (match.index > lastIndex) parts.push(<span key={`t-${lastIndex}`}>{content.substring(lastIndex, match.index)}</span>);
      parts.push(<a key={`l-${match.index}`} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-[#059669] dark:text-[#34d399] font-medium hover:underline inline-flex items-center gap-1">{match[1]} <ExternalLink className="w-3 h-3" /></a>);
      lastIndex = linkRegex.lastIndex;
    }
    if (lastIndex < content.length) parts.push(<span key={`t-${lastIndex}`}>{content.substring(lastIndex)}</span>);
    return parts.length > 0 ? parts : content;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!notificationForm.title || !notificationForm.content) { toast.error(t('admin.messages.title_msg_req')); return; }
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
    } catch (error) { toast.error(t('admin.messages.notif_send_failed')); }
    finally { setSending(false); }
  };

  return (
    <div className="space-y-6 pb-10 max-w-[1200px] mx-auto w-full px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.notifications.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('admin.notifications.description')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Composition Panel */}
        <div className="xl:col-span-5 bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-xl p-5">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tabs.map(tab => (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === tab.id ? 'bg-[#059669] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}>
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">{t('admin.notifications.composition.title_label')} *</label>
              <input type="text" value={notificationForm.title} onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none" required />
            </div>

            {activeTab === 'department' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">{t('admin.notifications.composition.dept_label')} *</label>
                <select value={notificationForm.department_id || ''} onChange={(e) => setNotificationForm({ ...notificationForm, department_id: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none" required>
                  <option value="">{t('admin.notifications.composition.dept_placeholder')}</option>
                  {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                </select>
              </div>
            )}
            {activeTab === 'student' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">{t('admin.notifications.composition.student_id_label')} *</label>
                <input type="text" value={notificationForm.studentId || ''} onChange={(e) => setNotificationForm({ ...notificationForm, studentId: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none" required />
              </div>
            )}
            {activeTab === 'doctor' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">{t('admin.notifications.composition.doctor_id_label')} *</label>
                <input type="text" value={notificationForm.doctorId || ''} onChange={(e) => setNotificationForm({ ...notificationForm, doctorId: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none" required />
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-500">{t('admin.notifications.composition.message_label')} *</label>
                <div className="flex gap-1">
                  <button type="button" onClick={() => setShowLinkModal(true)}
                    className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-[#059669]"><LinkIcon className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => setShowImageModal(true)}
                    className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-[#059669]"><ImageIcon className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <textarea id="notification_content" rows="5" value={notificationForm.content} onChange={(e) => setNotificationForm({ ...notificationForm, content: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none resize-none min-h-[120px]" required />
            </div>

            <button type="submit" disabled={sending}
              className="w-full py-2.5 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {sending ? <span className="animate-spin">...</span> : <><Send className="w-4 h-4" />{t('admin.notifications.composition.send_button')}</>}
            </button>
          </form>
        </div>

        {/* History Panel */}
        <div className="xl:col-span-7 bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-xl flex flex-col max-h-[700px]">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
            <History className="w-5 h-5 text-[#059669]" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('admin.notifications.history.title')}</h3>
            <span className="text-xs text-gray-400 ml-auto">{t('admin.notifications.history.messages_count', { count: notifications.length })}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-16 text-sm text-gray-400">{t('admin.notifications.history.no_history')}</div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-[#059669]/30 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{notif.title}</h4>
                        {notif.doctor_name ? (
                          <span className="px-1.5 py-0.5 rounded text-xs bg-rose-50 dark:bg-rose-500/10 text-rose-600">{t('admin.notifications.history.doctor_prefix')}{notif.doctor_id}</span>
                        ) : notif.student_name ? (
                          <span className="px-1.5 py-0.5 rounded text-xs bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600">{t('admin.notifications.history.student_prefix')}{notif.student_id}</span>
                        ) : notif.department_name ? (
                          <span className="px-1.5 py-0.5 rounded text-xs bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600">{notif.department_name}</span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-xs bg-[#059669]/10 text-[#059669]">{t('admin.notifications.history.global')}</span>
                        )}
                        <span className={`px-1.5 py-0.5 rounded text-xs ${notif.is_read ? 'bg-gray-100 dark:bg-gray-800 text-gray-500' : 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600'}`}>
                          {notif.is_read ? t('admin.notifications.history.read') : t('admin.notifications.history.unread')}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{renderContent(notif.content)}</div>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(notif.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => { setEditingNotification(notif); setEditNotifForm({ title: notif.title, content: notif.content, is_read: notif.is_read }); setShowEditModal(true); }}
                        className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteNotification(notif.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                        <Trash2 className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowLinkModal(false)} className="absolute inset-0 bg-black/40" />
          <div className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-gray-700 rounded-xl w-full max-w-sm relative z-10 p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('admin.notifications.modals.insert_link')}</h3>
              <button onClick={() => setShowLinkModal(false)} className="w-7 h-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">{t('admin.notifications.modals.link_text')}</label>
                <input type="text" value={linkData.text} onChange={(e) => setLinkData({ ...linkData, text: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">{t('admin.notifications.modals.url')} *</label>
                <input type="url" value={linkData.url} onChange={(e) => setLinkData({ ...linkData, url: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none" required />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleInsertLink} className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors">{t('admin.notifications.modals.insert_link_btn')}</button>
                <button onClick={() => setShowLinkModal(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors">{t('common.cancel')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowImageModal(false)} className="absolute inset-0 bg-black/40" />
          <div className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-gray-700 rounded-xl w-full max-w-sm relative z-10 p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('admin.notifications.modals.insert_image')}</h3>
              <button onClick={() => setShowImageModal(false)} className="w-7 h-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">{t('admin.notifications.modals.alt_text')}</label>
                <input type="text" value={imageData.alt} onChange={(e) => setImageData({ ...imageData, alt: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">{t('admin.notifications.modals.image_url')} *</label>
                <input type="url" value={imageData.url} onChange={(e) => setImageData({ ...imageData, url: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none" required />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleInsertImage} className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors">{t('admin.notifications.modals.insert_image_btn')}</button>
                <button onClick={() => setShowImageModal(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors">{t('common.cancel')}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowEditModal(false)} className="absolute inset-0 bg-black/40" />
          <div className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-gray-700 rounded-xl w-full max-w-md relative z-10 p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('admin.notifications.modals.edit_notification')}</h3>
              <button onClick={() => setShowEditModal(false)} className="w-7 h-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <form onSubmit={handleUpdateNotification} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">{t('admin.notifications.composition.title_label')} *</label>
                <input type="text" value={editNotifForm.title} onChange={(e) => setEditNotifForm({ ...editNotifForm, title: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">{t('admin.notifications.composition.message_label')} *</label>
                <textarea rows="4" value={editNotifForm.content} onChange={(e) => setEditNotifForm({ ...editNotifForm, content: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none resize-none" required />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editNotifForm.is_read} onChange={() => setEditNotifForm({ ...editNotifForm, is_read: !editNotifForm.is_read })}
                  className="rounded text-[#059669] focus:ring-[#059669]" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t('admin.notifications.modals.mark_as_read')}</span>
              </label>
              <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <button type="submit" className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors">{t('common.save')}</button>
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors">{t('common.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsManager;
