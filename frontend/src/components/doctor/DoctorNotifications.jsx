import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Bell, CheckCircle, Clock, Inbox,
  MessageSquare, FileText, AlertTriangle
} from 'lucide-react';

const DoctorNotifications = ({ 
  notifications, 
  onMarkRead, 
  onMarkAllRead,
  loading 
}) => {
  const { t } = useTranslation();
  const getIcon = (content, title) => {
    const text = (content + title).toLowerCase();
    if (text.includes('inquiry') || text.includes('question') || text.includes('message')) return MessageSquare;
    if (text.includes('submission') || text.includes('assignment') || text.includes('quiz')) return FileText;
    if (text.includes('urgent') || text.includes('alert') || text.includes('warning')) return AlertTriangle;
    return Bell;
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-5 h-5 text-[#059669]" />
            <span className="text-xs text-gray-400 font-medium">{t('doctor.notifications.system_monitoring')}</span>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('doctor.notifications.activity_center')}</h2>
          <p className="text-sm text-gray-500">{t('doctor.notifications.subtitle')}</p>
        </div>

        {notifications.some(n => !n.is_read) && (
          <button onClick={onMarkAllRead} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#059669] text-white text-sm font-medium transition-all hover:bg-[#047857]">
            <CheckCircle className="w-4 h-4" />
            {t('doctor.notifications.archive_all')}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-10 h-10 border-4 border-[#059669]/20 border-t-[#059669] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 text-sm">{t('doctor.notifications.syncing_stream')}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-xl">
            <Inbox className="w-10 h-10 text-gray-300 dark:text-white/10 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{t('doctor.notifications.sync_complete')}</h3>
            <p className="text-sm text-gray-400">{t('doctor.notifications.sync_complete_desc')}</p>
          </div>
        ) : (
          notifications.map((n) => {
            const Icon = getIcon(n.content, n.title);
            return (
              <div
                key={n.id}
                onClick={() => !n.is_read && onMarkRead(n.id)}
                className={`rounded-xl p-4 transition-all cursor-pointer border ${
                  !n.is_read 
                  ? 'bg-white dark:bg-white/[0.04] border-gray-200 dark:border-[#059669]/30 shadow-sm' 
                  : 'bg-white/50 dark:bg-white/[0.01] border-gray-100 dark:border-white/5 hover:border-[#059669]/20'
                }`}
              >
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    !n.is_read ? 'bg-[#059669]/10 text-[#059669]' : 'bg-gray-100 dark:bg-white/5 text-gray-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-medium truncate ${!n.is_read ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                          {n.title}
                        </h4>
                        {!n.is_read && (
                          <span className="px-2 py-0.5 rounded-full bg-[#059669]/10 text-[#059669] text-[10px] font-medium">{t('doctor.notifications.new_alert')}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 shrink-0">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">
                          {new Date(n.created_at).toLocaleString([], { 
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <p className={`text-sm ${!n.is_read ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400'}`}>
                      {n.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DoctorNotifications;
