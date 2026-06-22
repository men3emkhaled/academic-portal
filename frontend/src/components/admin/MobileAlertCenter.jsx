import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Send, Users, User, Building2, History, Globe, Clock, Calendar, Trash2, Bell, Smartphone } from 'lucide-react';

const MobileAlertCenter = ({ notifications = [], fetchNotifications, sending, setSending, departments = [] }) => {
  const { t } = useTranslation();
  const [alertForm, setAlertForm] = useState({ studentId: '', department_id: '', title: '', content: '' });
  const mobileHistory = (notifications || []).filter(n => n.is_mobile_only);

  const handleSendPush = async (type) => {
    if (!alertForm.title || !alertForm.content) { toast.error(t('admin.mobile_center.messages.req_fields')); return; }
    setSending(true);
    try {
      let endpoint = '';
      let payload = { title: alertForm.title, content: alertForm.content, isMobileOnly: true };
      if (type === 'all') endpoint = '/notifications/admin/send-to-all';
      else if (type === 'dept') {
        if (!alertForm.department_id) { toast.error(t('admin.mobile_center.messages.req_dept')); setSending(false); return; }
        endpoint = '/notifications/admin/send-to-department';
        payload.department_id = alertForm.department_id;
      } else if (type === 'student') {
        if (!alertForm.studentId) { toast.error(t('admin.mobile_center.messages.req_student')); setSending(false); return; }
        endpoint = '/notifications/admin/send-to-student';
        payload.studentId = alertForm.studentId;
      }
      await api.post(endpoint, payload);
      toast.success(t('admin.mobile_center.messages.success_sent'));
      setAlertForm({ studentId: '', department_id: '', title: '', content: '' });
      fetchNotifications();
    } catch (error) { toast.error(t('admin.mobile_center.messages.error_sent')); }
    finally { setSending(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.mobile_center.delete_confirm'))) return;
    try {
      await api.delete(`/notifications/admin/${id}`);
      toast.success(t('admin.mobile_center.messages.success_deleted'));
      fetchNotifications();
    } catch (error) { toast.error(t('admin.mobile_center.messages.error_deleted')); }
  };

  return (
    <div className="space-y-6 pb-10 max-w-[1200px] mx-auto w-full px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.mobile_center.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('admin.mobile_center.description')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Composition Panel */}
        <div className="bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <Smartphone className="w-5 h-5 text-[#059669]" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('admin.mobile_center.create_title')}</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">{t('admin.mobile_center.field_title')} *</label>
              <input type="text" value={alertForm.title} onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">{t('admin.mobile_center.field_message')} *</label>
              <textarea rows="4" value={alertForm.content} onChange={(e) => setAlertForm({ ...alertForm, content: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none resize-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500">{t('admin.mobile_center.send_to_dept')}</label>
                <select value={alertForm.department_id || ''} onChange={(e) => setAlertForm({ ...alertForm, department_id: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none">
                  <option value="">{t('admin.mobile_center.placeholder_dept')}</option>
                  {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.code}</option>)}
                </select>
                <button onClick={() => handleSendPush('dept')} disabled={sending}
                  className="w-full py-2 bg-[#059669]/10 hover:bg-[#059669] text-[#059669] hover:text-white border border-[#059669]/20 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2">
                  <Building2 className="w-3.5 h-3.5" />{t('admin.mobile_center.send_to_dept')}
                </button>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500">{t('admin.mobile_center.send_to_student')}</label>
                <input type="text" value={alertForm.studentId || ''} onChange={(e) => setAlertForm({ ...alertForm, studentId: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none" />
                <button onClick={() => handleSendPush('student')} disabled={sending}
                  className="w-full py-2 bg-cyan-600/10 hover:bg-cyan-600 text-cyan-600 hover:text-white border border-cyan-500/20 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2">
                  <User className="w-3.5 h-3.5" />{t('admin.mobile_center.send_to_student')}
                </button>
              </div>
            </div>

            <button onClick={() => handleSendPush('all')} disabled={sending}
              className="w-full py-2.5 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {sending ? '...' : <><Globe className="w-4 h-4" />{t('admin.mobile_center.send_all')}</>}
            </button>
          </div>
        </div>

        {/* History Log */}
        <div className="bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-xl flex flex-col max-h-[600px]">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-[#059669]" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('admin.mobile_center.history_title')}</h3>
            </div>
            <span className="text-xs text-gray-400">{t('admin.mobile_center.sent_count', { count: mobileHistory.length })}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {mobileHistory.length === 0 ? (
              <div className="text-center py-16 text-sm text-gray-400">{t('admin.mobile_center.no_history')}</div>
            ) : (
              mobileHistory.map((notif) => (
                <div key={notif.id} className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-[#059669]/30 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#059669]"></div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{notif.title}</h4>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{notif.content}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(notif.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(notif.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileAlertCenter;
