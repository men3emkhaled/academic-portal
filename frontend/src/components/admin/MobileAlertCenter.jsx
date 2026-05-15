import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
  Send, Users, User, Building2, 
  History, Globe, Activity, Smartphone,
  Clock, Calendar, Trash2, AlertCircle,
  MessageSquare, ChevronRight, Bell, Zap
} from 'lucide-react';

const MobileAlertCenter = ({ 
  notifications = [], 
  fetchNotifications, 
  sending, 
  setSending, 
  departments = [] 
}) => {
  const { t } = useTranslation();
  const [alertForm, setAlertForm] = useState({ studentId: '', department_id: '', title: '', content: '' });

  // Filter for mobile-only notifications
  const mobileHistory = (notifications || []).filter(n => n.is_mobile_only);

  const handleSendPush = async (type) => {
    if (!alertForm.title || !alertForm.content) {
      toast.error(t('admin.mobile_center.messages.req_fields'));
      return;
    }

    setSending(true);
    try {
      let endpoint = '';
      let payload = { 
        title: alertForm.title, 
        content: alertForm.content, 
        isMobileOnly: true 
      };

      if (type === 'all') {
        endpoint = '/notifications/admin/send-to-all';
      } else if (type === 'dept') {
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
    } catch (error) {
      toast.error(t('admin.mobile_center.messages.error_sent'));
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.mobile_center.delete_confirm'))) return;
    try {
      await api.delete(`/notifications/admin/${id}`);
      toast.success(t('admin.mobile_center.messages.success_deleted'));
      fetchNotifications();
    } catch (error) {
      toast.error(t('admin.mobile_center.messages.error_deleted'));
    }
  };

  return (
    <div className="animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
            <Smartphone className="w-7 h-7 text-primary dark:text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {t('admin.mobile_center.title')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold mt-1 uppercase tracking-widest">{t('admin.mobile_center.description')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Composition Panel */}
        <div className="space-y-8">
          <div className="bg-white/80 dark:bg-[#111]/80 border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full hidden pointer-events-none"></div>

            <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/20 text-primary dark:text-primary">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">{t('admin.mobile_center.create_title')}</h3>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('admin.mobile_center.field_title')} <span className="text-rose-500">*</span></label>
                        <input 
                            type="text" 
                            placeholder={t('admin.mobile_center.placeholder_title')} 
                            value={alertForm.title} 
                            onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })} 
                            className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-black focus:ring-4 focus:ring-primary/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner" 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('admin.mobile_center.field_message')} <span className="text-rose-500">*</span></label>
                        <textarea 
                            placeholder={t('admin.mobile_center.placeholder_message')} 
                            rows="4" 
                            value={alertForm.content} 
                            onChange={(e) => setAlertForm({ ...alertForm, content: e.target.value })} 
                            className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-black focus:ring-4 focus:ring-primary/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner resize-none min-h-[120px]" 
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-gray-100 dark:border-white/10">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('admin.mobile_center.send_to_dept')}</label>
                        <div className="relative">
                            <select 
                                value={alertForm.department_id || ''} 
                                onChange={(e) => setAlertForm({ ...alertForm, department_id: e.target.value })} 
                                className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3.5 font-black focus:ring-4 focus:ring-indigo-500/10 outline-none transition-[color,background-color,border-color,transform,opacity] appearance-none uppercase tracking-widest text-[11px]"
                            >
                                <option value="">{t('admin.mobile_center.placeholder_dept')}</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>{dept.code}</option>
                                ))}
                            </select>
                            <ChevronRight className="absolute inset-inline-end-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 rotate-90" />
                        </div>
                        <button 
                            onClick={() => handleSendPush('dept')} 
                            disabled={sending}
                            className="w-full py-3.5 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-500/20 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-[color,background-color,border-color,transform,opacity] flex items-center justify-center gap-2 shadow-sm"
                        >
                            <Building2 className="w-4 h-4" /> {t('admin.mobile_center.send_to_dept')}
                        </button>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('admin.mobile_center.send_to_student')}</label>
                        <input 
                            type="text" 
                            placeholder={t('admin.mobile_center.placeholder_student_id')} 
                            value={alertForm.studentId || ''} 
                            onChange={(e) => setAlertForm({ ...alertForm, studentId: e.target.value })} 
                            className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3.5 font-black focus:ring-4 focus:ring-cyan-500/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner" 
                        />
                        <button 
                            onClick={() => handleSendPush('student')} 
                            disabled={sending}
                            className="w-full py-3.5 bg-cyan-600/10 hover:bg-cyan-600 text-cyan-600 hover:text-white border border-cyan-500/20 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-[color,background-color,border-color,transform,opacity] flex items-center justify-center gap-2 shadow-sm"
                        >
                            <User className="w-4 h-4" /> {t('admin.mobile_center.send_to_student')}
                        </button>
                    </div>
                </div>

                <button 
                    onClick={() => handleSendPush('all')} 
                    disabled={sending}
                    className="w-full py-5 bg-primary hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-[color,background-color,border-color,transform,opacity] flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                    {sending ? (
                        <div className="flex items-center gap-3">
                            <Activity className="w-6 h-6 animate-spin" />
                            <span>{t('admin.mobile_center.sending')}</span>
                        </div>
                    ) : (
                        <>
                            <Globe className="w-6 h-6 group-hover:rotate-12 transition-transform duration-500" /> 
                            <span>{t('admin.mobile_center.send_all')}</span>
                            <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
                        </>
                    )}
                </button>
            </div>
          </div>

          <div className="p-8 bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20 rounded-[2.5rem] flex items-start gap-5 group transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-300 shadow-sm">
              <div className="w-12 h-12 bg-white dark:bg-black rounded-2xl flex items-center justify-center flex-shrink-0 border border-primary/20 shadow-md group-hover:scale-110 transition-transform">
                  <AlertCircle className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-1">
                  <h4 className="text-gray-900 dark:text-white font-black text-sm uppercase tracking-tight">{t('admin.mobile_center.note_title')}</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-[10px] leading-relaxed font-black uppercase tracking-wider">{t('admin.mobile_center.note_content')}</p>
              </div>
          </div>
        </div>

        {/* History Log */}
        <div className="bg-white/80 dark:bg-[#111]/80 border border-gray-200 dark:border-white/10 rounded-[2.5rem] flex flex-col h-[800px] shadow-sm relative overflow-hidden group">
            <div className="p-8 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.01] flex justify-between items-center relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center border border-gray-200 dark:border-white/10 shadow-inner">
                        <History className="w-5 h-5 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('admin.mobile_center.history_title')}</h3>
                </div>
                <span className="text-[10px] font-black text-gray-500 bg-white dark:bg-black px-4 py-2 rounded-xl border border-gray-100 dark:border-white/5 uppercase tracking-[0.2em] shadow-inner">
                    {t('admin.mobile_center.sent_count', { count: mobileHistory.length })}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar relative z-10">
                {mobileHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 opacity-30 grayscale group-hover:opacity-40 transition-[color,background-color,border-color,transform,opacity]">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <Bell className="w-12 h-12 text-gray-400" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">{t('admin.mobile_center.no_history')}</p>
                    </div>
                ) : (
                mobileHistory.map((notif) => (
                    <div key={notif.id} className="group/item relative bg-white dark:bg-black/40 border border-gray-100 dark:border-white/10 rounded-[2.5rem] p-8 hover:border-primary/40 transition-[color,background-color,border-color,transform,opacity] hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 duration-500">
                        <div className="flex justify-between items-start gap-4 relative z-10">
                            <div className="flex-1 min-w-0 space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_15px_rgba(46,204,113,0.8)] animate-pulse"></div>
                                    <h4 className="font-black text-gray-900 dark:text-white text-lg tracking-tight truncate uppercase">{notif.title}</h4>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-bold pl-7 italic">{notif.content}</p>
                                <div className="flex items-center gap-6 pl-7 pt-2">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-white/5">
                                        <Clock className="w-3.5 h-3.5 text-primary" />
                                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-white/5">
                                        <Calendar className="w-3.5 h-3.5 text-primary" />
                                        {new Date(notif.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleDelete(notif.id)}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 opacity-0 group-hover/item:opacity-100 transition-[color,background-color,border-color,transform,opacity] hover:bg-rose-600 hover:text-white shadow-sm"
                            >
                                <Trash2 className="w-4.5 h-4.5" />
                            </button>
                        </div>
                        {/* Background Decoration */}
                        <Zap className="absolute inset-inline-end-10 top-1/2 -translate-y-1/2 w-20 h-20 text-primary/5 rotate-12 pointer-events-none group-hover/item:scale-150 transition-transform duration-1000" />
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
