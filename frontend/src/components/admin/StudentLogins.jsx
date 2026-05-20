import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
  RefreshCw, Users, Shield, Smartphone, Globe, 
  AlertTriangle, ChevronLeft, ChevronRight,
  Fingerprint, Clock, Calendar, Database,
  ArrowUpRight, Info
} from 'lucide-react';

const StudentLogins = () => {
  const { t, i18n } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 30, totalPages: 0 });
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/student-logs?page=${page}&limit=30`);
      setLogs(res.data.logs || []);
      setPagination(res.data.pagination || { total: 0, page: 1, limit: 30, totalPages: 0 });
    } catch (error) {
      toast.error(t('admin.messages.load_access_logs_failed'));
    } finally {
      setLoading(false);
    }
  }, []);

  const useEffectFetch = useCallback(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => { useEffectFetch(); }, [useEffectFetch]);

  const timeAgo = (d) => {
    const diff = (Date.now() - new Date(d)) / 1000;
    if (diff < 60) return t('common.just_now', 'Just now');
    if (diff < 3600) return `${Math.floor(diff / 60)}m ${t('common.ago', 'ago')}`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ${t('common.ago', 'ago')}`;
    return `${Math.floor(diff / 86400)}d ${t('common.ago', 'ago')}`;
  };

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' ' + date.toLocaleTimeString(i18n.language === 'ar' ? 'ar-EG' : 'en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-700 text-start">
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#8b5cf6]/10 rounded-xl flex items-center justify-center border border-[#8b5cf6]/20">
                  <Database className="w-5 h-5 text-[#8b5cf6]" />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{t('admin.logs.access_registry')}</h3>
          </div>
          <button 
            onClick={() => fetchLogs()} 
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:border-[#8b5cf6]/30 transition-[color,background-color,border-color,transform,opacity]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> {t('admin.logs.sync_access')}
          </button>
      </div>

      {/* Main Table View */}
      <div className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/10 rounded-[3rem] overflow-hidden shadow-2xl transition-[color,background-color,border-color,transform,opacity] duration-500">
        <div className="px-10 py-8 border-b border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01] flex justify-between items-center">
            <p className="text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">
              {t('admin.logs.access_points', { count: logs.length, total: pagination.total })}
            </p>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#8b5cf6] rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-widest">{t('admin.logs.real_time')}</span>
            </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-50">
             <div className="w-12 h-12 border-4 border-[#8b5cf6]/20 border-t-[#8b5cf6] rounded-full animate-spin mb-6"></div>
             <p className="text-[10px] font-black uppercase tracking-widest">{t('admin.tasks.loading')}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400 text-center">
            <AlertTriangle className="w-12 h-12 mb-4 opacity-20 mx-auto" />
            <p className="font-black text-sm uppercase tracking-widest">{t('admin.logs.registry_void')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-inline-start border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-transparent border-b border-gray-50 dark:border-white/5">
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-400 text-start">{t('admin.logs.table.identity')}</th>
                  <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-400 text-start">{t('admin.logs.table.auth')}</th>
                  <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-400 text-start">{t('admin.logs.table.node')}</th>
                  <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-400 text-start">{t('admin.logs.table.temporal')}</th>
                  <th className="px-10 py-6 text-inline-end text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-400 text-end">{t('admin.logs.table.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                {logs.map(log => (
                  <tr key={log.id} className="group hover:bg-[#8b5cf6]/5 transition-[color,background-color,border-color,transform,opacity]">
                    <td className="px-10 py-6 text-start">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-center justify-center overflow-hidden shadow-inner group-hover:bg-[#8b5cf6] group-hover:text-white transition-[color,background-color,border-color,transform,opacity] duration-500">
                             {log.avatar_url ? (
                               <img src={log.avatar_url} alt={log.student_name} className="w-full h-full object-cover" />
                             ) : (
                               <Users className="w-6 h-6" />
                             )}
                          </div>
                          <div>
                             <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-[#8b5cf6] transition-colors">{log.student_name}</p>
                             <div className="flex items-center gap-2 mt-1">
                                <Fingerprint className="w-3 h-3 text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">{log.student_id}</span>
                             </div>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-6 text-start">
                       <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg border flex items-center gap-2 w-fit ${
                          log.method === 'Google' 
                            ? 'bg-rose-500/5 text-rose-600 border-rose-500/20' 
                            : 'bg-[#8b5cf6]/5 text-[#8b5cf6] border-[#8b5cf6]/20'
                       }`}>
                         {log.method === 'Google' ? <Globe className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                         {log.method} AUTH
                       </span>
                    </td>
                    <td className="px-6 py-6 text-start">
                       <div className="flex flex-col">
                          <span className="text-xs font-black text-gray-900 dark:text-gray-300">{log.ip_address || '127.0.0.1'}</span>
                          <span className="text-[9px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest mt-1">{t('admin.logs.table.details.ipv4_endpoint')}</span>
                       </div>
                    </td>
                    <td className="px-6 py-6 text-start">
                       <div className="flex flex-col">
                          <span className="text-xs font-black text-gray-900 dark:text-white">{timeAgo(log.created_at)}</span>
                          <span className="text-[9px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest mt-1">{formatDate(log.created_at)}</span>
                       </div>
                    </td>
                    <td className="px-10 py-6 text-inline-end text-end">
                       <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 rounded-lg">
                          <div className="w-1.5 h-1.5 bg-[#8b5cf6] rounded-full"></div>
                          <span className="text-[9px] font-black text-[#8b5cf6] uppercase tracking-widest">{t('admin.logs.table.details.secure')}</span>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Console */}
        {pagination.totalPages > 1 && (
          <div className="px-10 py-8 border-t border-gray-50 dark:border-white/5 flex items-center justify-between bg-gray-50/30 dark:bg-white/[0.01]">
            <button 
              onClick={() => fetchLogs(pagination.page - 1)} 
              disabled={pagination.page <= 1}
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:border-[#8b5cf6]/30 transition-[color,background-color,border-color,transform,opacity] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> {t('common.previous')}
            </button>
            <div className="flex items-center gap-4">
               <div className="px-4 py-2 bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 rounded-xl">
                  <span className="text-xs font-black text-[#8b5cf6]">{t('admin.logs.access_registry')} {pagination.page} / {pagination.totalPages}</span>
               </div>
            </div>
            <button 
              onClick={() => fetchLogs(pagination.page + 1)} 
              disabled={pagination.page >= pagination.totalPages}
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:border-[#8b5cf6]/30 transition-[color,background-color,border-color,transform,opacity] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {t('common.next')} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentLogins;
