import React from 'react';
import { Bell, CheckCircle2, Clock, Inbox, Trash2, CheckCircle } from 'lucide-react';

const DoctorNotifications = ({ 
  notifications, 
  onMarkRead, 
  onMarkAllRead,
  loading 
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 border border-white/10 p-6 rounded-[2.5rem] backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-doctor-primary/20 flex items-center justify-center text-doctor-primary shadow-lg shadow-doctor-primary/10">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Notifications</h1>
            <p className="text-doctor-text-muted text-sm font-medium">Manage your alerts and activity</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {notifications.some(n => !n.is_read) && (
            <button 
              onClick={onMarkAllRead}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-doctor-primary/10 text-doctor-primary border border-doctor-primary/20 hover:bg-doctor-primary/20 transition-all text-xs font-black uppercase tracking-widest"
            >
              <CheckCircle className="w-4 h-4" />
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-xl overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-doctor-primary/20 border-t-doctor-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-doctor-text-muted font-bold text-sm uppercase tracking-widest">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Inbox className="w-10 h-10 text-white/10" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No notifications yet</h3>
            <p className="text-doctor-text-muted text-sm max-w-xs mx-auto">
              When you receive alerts about student submissions or inquiries, they will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map((n) => (
              <div 
                key={n.id}
                onClick={() => !n.is_read && onMarkRead(n.id)}
                className={`p-6 flex gap-5 hover:bg-white/[0.02] transition-all cursor-pointer group relative ${!n.is_read ? 'bg-doctor-primary/5' : ''}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                  !n.is_read ? 'bg-doctor-primary/20 text-doctor-primary' : 'bg-white/5 text-doctor-text-muted'
                }`}>
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <h4 className={`text-base font-bold truncate pr-4 ${!n.is_read ? 'text-white' : 'text-doctor-text-muted'}`}>
                      {n.title}
                    </h4>
                    <div className="flex items-center gap-2 text-doctor-text-muted">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {new Date(n.created_at).toLocaleString([], { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-doctor-text-muted leading-relaxed">
                    {n.content}
                  </p>
                </div>

                {!n.is_read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-doctor-primary shadow-[2px_0_10px_rgba(139,92,246,0.5)]"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default DoctorNotifications;
