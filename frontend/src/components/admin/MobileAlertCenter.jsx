import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Send, Users, User, Building2, 
  History, Globe, Activity, Smartphone,
  Clock, Calendar, Trash2, AlertCircle,
  MessageSquare, ChevronRight, Bell, Zap
} from 'lucide-react';

const MobileAlertCenter = ({ 
  notifications, 
  fetchNotifications, 
  sending, 
  setSending, 
  departments = [] 
}) => {
  const [alertForm, setAlertForm] = useState({ studentId: '', department_id: '', title: '', content: '' });

  // Filter for mobile-only notifications
  const mobileHistory = notifications.filter(n => n.is_mobile_only);

  const handleSendPush = async (type) => {
    if (!alertForm.title || !alertForm.content) {
      toast.error('Title and message are required');
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
        if (!alertForm.department_id) { toast.error('Please select a department'); setSending(false); return; }
        endpoint = '/notifications/admin/send-to-department';
        payload.department_id = alertForm.department_id;
      } else if (type === 'student') {
        if (!alertForm.studentId) { toast.error('Please enter a student ID'); setSending(false); return; }
        endpoint = '/notifications/admin/send-to-student';
        payload.studentId = alertForm.studentId;
      }

      await api.post(endpoint, payload);
      toast.success('Notification Sent Successfully');
      setAlertForm({ studentId: '', department_id: '', title: '', content: '' });
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this notification from history?')) return;
    try {
      await api.delete(`/notifications/admin/${id}`);
      toast.success('Notification record removed');
      fetchNotifications();
    } catch (error) {
      toast.error('Deletion failed');
    }
  };

  return (
    <div className="animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-inner">
            <Smartphone className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Mobile Notifications
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold mt-1">Send push notifications to Android devices</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Composition Panel */}
        <div className="space-y-8">
          <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none"></div>

            <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Create Notification</h3>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Title <span className="text-rose-500">*</span></label>
                        <input 
                            type="text" 
                            placeholder="e.g. Schedule Update" 
                            value={alertForm.title} 
                            onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })} 
                            className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all shadow-inner" 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Message <span className="text-rose-500">*</span></label>
                        <textarea 
                            placeholder="Type your message here..." 
                            rows="4" 
                            value={alertForm.content} 
                            onChange={(e) => setAlertForm({ ...alertForm, content: e.target.value })} 
                            className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all shadow-inner resize-none" 
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-gray-100 dark:border-white/10">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Send to Department</label>
                        <div className="relative">
                            <select 
                                value={alertForm.department_id || ''} 
                                onChange={(e) => setAlertForm({ ...alertForm, department_id: e.target.value })} 
                                className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3.5 font-semibold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all appearance-none"
                            >
                                <option value="">Select Dept</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>{dept.code}</option>
                                ))}
                            </select>
                        </div>
                        <button 
                            onClick={() => handleSendPush('dept')} 
                            disabled={sending}
                            className="w-full py-3.5 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-500/20 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                            <Building2 className="w-4 h-4" /> Send to Dept
                        </button>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Send to Student</label>
                        <input 
                            type="text" 
                            placeholder="Student ID" 
                            value={alertForm.studentId || ''} 
                            onChange={(e) => setAlertForm({ ...alertForm, studentId: e.target.value })} 
                            className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3.5 font-semibold focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all shadow-inner" 
                        />
                        <button 
                            onClick={() => handleSendPush('student')} 
                            disabled={sending}
                            className="w-full py-3.5 bg-cyan-600/10 hover:bg-cyan-600 text-cyan-600 hover:text-white border border-cyan-500/20 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                            <User className="w-4 h-4" /> Send to Student
                        </button>
                    </div>
                </div>

                <button 
                    onClick={() => handleSendPush('all')} 
                    disabled={sending}
                    className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-500/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 relative overflow-hidden"
                >
                    {sending ? (
                        <div className="flex items-center gap-3">
                            <Activity className="w-6 h-6 animate-spin" />
                            <span>SENDING SIGNAL...</span>
                        </div>
                    ) : (
                        <>
                            <Globe className="w-6 h-6" /> 
                            <span>Send to All Students</span>
                            <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
                        </>
                    )}
                </button>
            </div>
          </div>

          <div className="p-8 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 dark:border-emerald-500/20 rounded-[2rem] flex items-start gap-5 group transition-all duration-300">
              <div className="w-12 h-12 bg-white dark:bg-black rounded-2xl flex items-center justify-center flex-shrink-0 border border-emerald-500/20 shadow-md">
                  <AlertCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="space-y-1">
                  <h4 className="text-gray-900 dark:text-white font-black text-sm uppercase tracking-tight">Important Note</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed font-semibold">These notifications appear on the student's phone screen only (Android). They will not be saved inside the app notifications list.</p>
              </div>
          </div>
        </div>

        {/* History Log */}
        <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2.5rem] flex flex-col h-[800px] shadow-sm relative overflow-hidden group">
            <div className="p-8 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.01] flex justify-between items-center relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center border border-gray-200 dark:border-white/10">
                        <History className="w-5 h-5 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Notification History</h3>
                </div>
                <span className="text-[10px] font-black text-gray-500 bg-white dark:bg-black px-4 py-2 rounded-xl border border-gray-100 dark:border-white/5 uppercase tracking-[0.2em] shadow-inner">{mobileHistory.length} SENT</span>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar relative z-10">
                {mobileHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 opacity-30 grayscale group-hover:opacity-40 transition-all">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <Bell className="w-12 h-12 text-gray-400" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">No notifications sent</p>
                    </div>
                ) : (
                mobileHistory.map((notif) => (
                    <div key={notif.id} className="group/item relative bg-white dark:bg-black/40 border border-gray-100 dark:border-white/10 rounded-3xl p-6 hover:border-emerald-500/40 transition-all hover:shadow-lg hover:-translate-y-1">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 min-w-0 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                    <h4 className="font-black text-gray-900 dark:text-white text-base tracking-tight truncate">{notif.title}</h4>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-medium pl-5 border-l-2 border-gray-100 dark:border-white/5">{notif.content}</p>
                                <div className="flex items-center gap-6 pl-5 pt-2">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <Clock className="w-3.5 h-3.5 text-emerald-500/50" />
                                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <Calendar className="w-3.5 h-3.5 text-emerald-500/50" />
                                        {new Date(notif.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleDelete(notif.id)}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 opacity-0 group-hover/item:opacity-100 transition-all hover:bg-rose-600 hover:text-white shadow-sm"
                            >
                                <Trash2 className="w-4.5 h-4.5" />
                            </button>
                        </div>
                        {/* Background Decoration */}
                        <Zap className="absolute -right-4 -bottom-4 w-20 h-20 text-emerald-500/5 rotate-12 pointer-events-none" />
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
