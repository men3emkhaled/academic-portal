import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Send, Users, User, Building2, 
  History, Globe, Activity, Smartphone,
  Clock, Calendar, Trash2, AlertCircle
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
      toast.error('Title and content are required for pings');
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
        if (!alertForm.department_id) { toast.error('Select a department'); setSending(false); return; }
        endpoint = '/notifications/admin/send-to-department';
        payload.department_id = alertForm.department_id;
      } else if (type === 'student') {
        if (!alertForm.studentId) { toast.error('Enter a student ID'); setSending(false); return; }
        endpoint = '/notifications/admin/send-to-student';
        payload.studentId = alertForm.studentId;
      }

      await api.post(endpoint, payload);
      toast.success('Mobile Alert Dispatched Successfully');
      setAlertForm({ studentId: '', department_id: '', title: '', content: '' });
      fetchNotifications();
    } catch (error) {
      toast.error('Dispatch Failure: Signal not sent');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/admin/${id}`);
      toast.success('Record Cleared');
      fetchNotifications();
    } catch (error) {
      toast.error('Deletion failed');
    }
  };

  return (
    <div className="animate-fadeIn pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-2 h-10 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <Smartphone className="w-6 h-6 text-emerald-400" /> Mobile Alert Center
            </h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">External Signal Management (Android Only)</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="admin-card border-emerald-500/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] rounded-full"></div>
            
            <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                        <Send className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-black text-white tracking-tight">Dispatch Module</h3>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Alert Header</label>
                        <input 
                            type="text" 
                            placeholder="Push title (lock screen)..." 
                            value={alertForm.title} 
                            onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })} 
                            className="admin-input" 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Body Content</label>
                        <textarea 
                            placeholder="Internal signal message..." 
                            rows="3" 
                            value={alertForm.content} 
                            onChange={(e) => setAlertForm({ ...alertForm, content: e.target.value })} 
                            className="admin-input" 
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Target Unit</label>
                        <select 
                            value={alertForm.department_id || ''} 
                            onChange={(e) => setAlertForm({ ...alertForm, department_id: e.target.value })} 
                            className="admin-input appearance-none"
                        >
                            <option value="">Select Dept</option>
                            {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>{dept.code}</option>
                            ))}
                        </select>
                        <button 
                            onClick={() => handleSendPush('dept')} 
                            disabled={sending}
                            className="w-full mt-2 py-3 bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <Building2 className="w-3.5 h-3.5" /> Dept Dispatch
                        </button>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Target Student</label>
                        <input 
                            type="text" 
                            placeholder="ID####" 
                            value={alertForm.studentId || ''} 
                            onChange={(e) => setAlertForm({ ...alertForm, studentId: e.target.value })} 
                            className="admin-input" 
                        />
                        <button 
                            onClick={() => handleSendPush('student')} 
                            disabled={sending}
                            className="w-full mt-2 py-3 bg-cyan-600/20 text-cyan-400 border border-cyan-500/20 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-cyan-600 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <User className="w-3.5 h-3.5" /> Solo Dispatch
                        </button>
                    </div>
                </div>

                <button 
                    onClick={() => handleSendPush('all')} 
                    disabled={sending}
                    className="w-full py-4 bg-emerald-500 text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-[0_8px_25px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                    {sending ? <Activity className="w-5 h-5 animate-spin" /> : <><Globe className="w-5 h-5" /> GLOBAL ANDROID BROADCAST</>}
                </button>
            </div>
          </div>

          <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                  <h4 className="text-white font-bold text-sm mb-1">Signal Isolation Info</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">Alerts sent from this module will **only** appear on the lock-screen of Android devices. They will not be visible in the student's in-app notification center.</p>
              </div>
          </div>
        </div>

        {/* History Log */}
        <div className="bg-[#111111]/40 border border-white/5 rounded-[2.5rem] flex flex-col h-[700px]">
          <div className="p-8 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
            <h3 className="text-sm font-black text-white uppercase tracking-[0.1em] flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" /> Dispatch Registry
            </h3>
            <span className="text-[10px] font-black text-slate-500 bg-white/5 px-3 py-1 rounded-xl border border-white/5 uppercase tracking-widest">{mobileHistory.length} Alerts</span>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
            {mobileHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 grayscale opacity-20">
                    <Smartphone className="w-16 h-16 mb-4" />
                    <p className="text-sm font-black uppercase tracking-[0.2em]">No signals recorded</p>
                </div>
            ) : (
              mobileHistory.map((notif) => (
                <div key={notif.id} className="group bg-[#151515]/50 border border-white/5 rounded-2xl p-5 hover:border-emerald-500/20 transition-all">
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                        <h4 className="font-bold text-white text-sm truncate">{notif.title}</h4>
                      </div>
                      <p className="text-slate-400 text-xs line-clamp-2 mb-3 px-4 border-l border-white/5">{notif.content}</p>
                      <div className="flex items-center gap-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                         <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                         <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(notif.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button 
                        onClick={() => handleDelete(notif.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                    >
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
