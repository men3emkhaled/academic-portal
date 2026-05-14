import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  Activity, Search, Filter, RefreshCw, Trash2,
  ChevronLeft, ChevronRight, Clock, User, Shield,
  Database, BarChart3, Users, AlertTriangle, X,
  Terminal, Eye, ArrowUpRight, Calendar, Globe, Fingerprint
} from 'lucide-react';

const MODULE_COLORS = {
  'Auth': { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-500/20' },
  'Students': { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20' },
  'Courses': { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20' },
  'Grades': { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/20' },
  'Timetable': { bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-500/20' },
  'Notifications': { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', border: 'border-red-500/20' },
  'Quizzes': { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500/20' },
  'Resources': { bg: 'bg-teal-500/10', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-500/20' },
  'Roadmap': { bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500/20' },
  'Departments': { bg: 'bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-500/20' },
  'Events': { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/20' },
  'Progress': { bg: 'bg-lime-500/10', text: 'text-lime-600 dark:text-lime-400', border: 'border-lime-500/20' },
  'Student Courses': { bg: 'bg-sky-500/10', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-500/20' },
};

const METHOD_COLORS = {
  'POST': 'bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/20',
  'PUT': 'bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
  'DELETE': 'bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/20',
  'PATCH': 'bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/20',
  'GET': 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/20',
};

const getModuleColor = (mod) => MODULE_COLORS[mod] || { bg: 'bg-gray-100 dark:bg-white/5', text: 'text-gray-500 dark:text-slate-400', border: 'border-gray-200 dark:border-white/10' };

const ActivityLogsManager = () => {
  const { t, i18n } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 30, totalPages: 0 });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ admin_id: '', module: '', action: '', date_from: '', date_to: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 30 });
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
      const res = await api.get(`/admin-logs?${params}`);
      setLogs(res.data.logs || []);
      setPagination(res.data.pagination || { total: 0, page: 1, limit: 30, totalPages: 0 });
    } catch (error) {
      toast.error(t('admin.messages.load_logs_failed'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/admin-logs/stats');
      setStats(res.data.stats);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchLogs(); fetchStats(); }, [fetchLogs, fetchStats]);

  const handleCleanup = async () => {
    if (!window.confirm(t('common.confirm_delete'))) return;
    try {
      const res = await api.delete('/admin-logs/cleanup?days=90');
      toast.success(res.data.message);
      fetchLogs();
      fetchStats();
    } catch { toast.error(t('admin.messages.cleanup_failed')); }
  };

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' ' + date.toLocaleTimeString(i18n.language === 'ar' ? 'ar-EG' : 'en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const timeAgo = (d) => {
    const diff = (Date.now() - new Date(d)) / 1000;
    if (diff < 60) return t('common.just_now', 'Just now');
    if (diff < 3600) return `${Math.floor(diff / 60)}m ${t('common.ago', 'ago')}`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ${t('common.ago', 'ago')}`;
    return `${Math.floor(diff / 86400)}d ${t('common.ago', 'ago')}`;
  };

  return (
    <div className="p-8 space-y-12">
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  showFilters 
                    ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20' 
                    : 'bg-white dark:bg-white/5 text-gray-500 border-gray-100 dark:border-white/10 hover:border-amber-500/30'
                }`}
              >
                <Filter className="w-3.5 h-3.5" /> {t('admin.logs.filters.title')}
              </button>
              <button 
                onClick={() => { fetchLogs(); fetchStats(); }}
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:border-amber-500/30 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> {t('admin.logs.sync')}
              </button>
          </div>
          <button 
            onClick={handleCleanup}
            className="flex items-center gap-2 px-6 py-3 bg-rose-500/5 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-500/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" /> {t('admin.logs.purge')}
          </button>
      </div>

      {/* Stats Bento Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: t('admin.logs.stats.total'), value: stats.total_actions, icon: <Database className="w-5 h-5" />, color: 'emerald' },
            { label: t('admin.logs.stats.today'), value: stats.today_actions, icon: <Clock className="w-5 h-5" />, color: 'amber' },
            { label: t('admin.logs.stats.weekly'), value: stats.week_actions, icon: <BarChart3 className="w-5 h-5" />, color: 'blue' },
            { label: t('admin.logs.stats.admins'), value: stats.unique_admins, icon: <Shield className="w-5 h-5" />, color: 'purple' },
          ].map((s, i) => (
            <div key={i} className="group relative bg-white dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-[2rem] p-8 overflow-hidden hover:border-amber-500/30 transition-all duration-500 shadow-sm">
                <div className={`absolute -inset-inline-end-4 -bottom-4 w-24 h-24 text-${s.color}-500/5 group-hover:scale-125 transition-transform duration-500`}>
                    {s.icon}
                </div>
                <div className={`w-10 h-10 bg-${s.color}-500/10 rounded-xl flex items-center justify-center text-${s.color}-600 dark:text-${s.color}-400 mb-6 border border-${s.color}-500/20`}>
                    {s.icon}
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">{s.label}</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{s.value || 0}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters Interface */}
      {showFilters && (
        <div className="bg-white/50 dark:bg-black/40 border border-gray-100 dark:border-white/10 rounded-[2.5rem] p-10 space-y-8 animate-in slide-in-from-top-4 duration-500">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-amber-600 ms-5">{t('admin.logs.filters.admin')}</label>
                 <div className="relative">
                    <User className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Search ID..." value={filters.admin_id}
                      onChange={e => setFilters({ ...filters, admin_id: e.target.value })}
                      className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl py-4 ps-14 pe-6 text-sm font-bold focus:ring-2 focus:ring-amber-500/50 outline-none transition-all" />
                 </div>
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-amber-600 ms-5">{t('admin.logs.filters.module')}</label>
                 <select value={filters.module} onChange={e => setFilters({ ...filters, module: e.target.value })}
                   className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-amber-500/50 outline-none appearance-none transition-all">
                   <option value="">{t('admin.logs.filters.all_modules')}</option>
                   {Object.keys(MODULE_COLORS).map(m => <option key={m} value={m}>{m}</option>)}
                 </select>
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-amber-600 ms-5">{t('admin.logs.filters.action')}</label>
                 <input type="text" placeholder={t('admin.logs.filters.placeholder_action')} value={filters.action}
                   onChange={e => setFilters({ ...filters, action: e.target.value })}
                   className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-amber-500/50 outline-none transition-all" />
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-amber-600 ms-5">{t('admin.logs.filters.date_from')}</label>
                 <input type="date" value={filters.date_from}
                   onChange={e => setFilters({ ...filters, date_from: e.target.value })}
                   className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-amber-500/50 outline-none transition-all" />
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-amber-600 ms-5">{t('admin.logs.filters.date_to')}</label>
                 <input type="date" value={filters.date_to}
                   onChange={e => setFilters({ ...filters, date_to: e.target.value })}
                   className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-amber-500/50 outline-none transition-all" />
              </div>
           </div>
           <div className="flex gap-4 pt-4">
              <button onClick={() => fetchLogs(1)} className="px-10 py-4 bg-amber-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-amber-500/20">
                {t('admin.logs.filters.execute')}
              </button>
              <button onClick={() => setFilters({ admin_id: '', module: '', action: '', date_from: '', date_to: '' })}
                className="px-10 py-4 bg-white dark:bg-white/5 text-gray-500 font-black rounded-2xl text-[10px] uppercase tracking-widest border border-gray-100 dark:border-white/10 hover:border-amber-500/30 transition-all">
                {t('admin.logs.filters.reset')}
              </button>
           </div>
        </div>
      )}

      {/* Main Table View */}
      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-500">
        <div className="px-10 py-8 border-b border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01] flex justify-between items-center">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                    <Terminal className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{t('admin.logs.registry')}</h3>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {t('admin.logs.scan_results', { count: logs.length, total: pagination.total })}
            </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-50">
             <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-6"></div>
             <p className="text-[10px] font-black uppercase tracking-widest">{t('admin.tasks.loading')}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <AlertTriangle className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-black text-sm uppercase tracking-widest">{t('admin.tasks.no_tasks')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-inline-start border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-transparent border-b border-gray-50 dark:border-white/5">
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('admin.logs.table.method')}</th>
                  <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('admin.logs.table.module')}</th>
                  <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('admin.logs.table.operation')}</th>
                  <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('admin.logs.table.admin')}</th>
                  <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">{t('admin.logs.table.temporal')}</th>
                  <th className="px-10 py-6 text-inline-end"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                {logs.map(log => {
                  const mc = getModuleColor(log.module);
                  const isExpanded = selectedLog?.id === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr 
                        onClick={() => setSelectedLog(isExpanded ? null : log)}
                        className={`group cursor-pointer transition-all ${isExpanded ? 'bg-amber-500/5 dark:bg-amber-500/10' : 'hover:bg-gray-50 dark:hover:bg-white/[0.02]'}`}
                      >
                        <td className="px-10 py-6">
                           <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg border ${METHOD_COLORS[log.method] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                             {log.method}
                           </span>
                        </td>
                        <td className="px-6 py-6">
                           <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg border ${mc.bg} ${mc.text} ${mc.border} whitespace-nowrap`}>
                             {log.module}
                           </span>
                        </td>
                        <td className="px-6 py-6">
                           <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{log.action}</p>
                        </td>
                        <td className="px-6 py-6">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center border border-gray-200 dark:border-white/10 group-hover:border-amber-500/30 transition-colors">
                                 <User className="w-4 h-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
                              </div>
                              <div>
                                 <p className="text-xs font-black text-gray-700 dark:text-gray-300">{log.admin_name}</p>
                                 <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest">{log.admin_role}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                           <div className="flex flex-col">
                              <span className="text-xs font-bold text-gray-900 dark:text-white">{timeAgo(log.created_at)}</span>
                              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                           </div>
                        </td>
                        <td className="px-10 py-6 text-inline-end">
                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isExpanded ? 'bg-amber-500 text-white rotate-180' : 'bg-gray-100 dark:bg-white/5 text-gray-400 group-hover:text-amber-500'}`}>
                              <ChevronRight className="w-4 h-4" />
                           </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan="6" className="px-10 pb-10 pt-4 bg-amber-500/5 dark:bg-amber-500/10">
                             <div className="grid grid-cols-1 md:grid-cols-4 gap-8 bg-white dark:bg-black/60 border border-amber-500/20 rounded-[2rem] p-8 animate-in zoom-in-95 duration-300">
                                <div className="space-y-4">
                                   <div>
                                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2"><Fingerprint className="w-3 h-3 text-amber-500" /> {t('admin.logs.table.details.admin_id')}</p>
                                      <p className="text-sm font-black text-gray-900 dark:text-white">#{log.admin_id}</p>
                                   </div>
                                   <div>
                                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2"><Globe className="w-3 h-3 text-amber-500" /> {t('admin.logs.table.details.source_address')}</p>
                                      <p className="text-sm font-black text-gray-900 dark:text-white">{log.ip_address || 'Internal'}</p>
                                   </div>
                                </div>
                                <div className="space-y-4">
                                   <div>
                                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2"><Activity className="w-3 h-3 text-emerald-500" /> {t('admin.logs.table.details.signal_status')}</p>
                                      <p className={`text-sm font-black ${log.status_code < 400 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {log.status_code || '200 OK'} • {t('admin.logs.table.details.authorized')}
                                      </p>
                                   </div>
                                   <div>
                                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2"><Calendar className="w-3 h-3 text-amber-500" /> {t('admin.logs.table.details.full_timestamp')}</p>
                                      <p className="text-sm font-black text-gray-900 dark:text-white">{formatDate(log.created_at)}</p>
                                   </div>
                                </div>
                                <div className="md:col-span-2 space-y-4">
                                   <div>
                                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2"><ArrowUpRight className="w-3 h-3 text-amber-500" /> {t('admin.logs.table.details.resource_mapping')}</p>
                                      <code className="text-[10px] font-mono font-black text-amber-600 bg-amber-500/5 dark:bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/10 block break-all">
                                        {log.endpoint}
                                      </code>
                                   </div>
                                   {log.details && Object.keys(log.details).length > 0 && (
                                      <div>
                                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('admin.logs.table.details.payload_matrix')}</p>
                                         <div className="max-h-48 overflow-y-auto no-scrollbar bg-black dark:bg-black/40 rounded-xl p-4 border border-white/5">
                                            <pre className="text-[10px] font-mono text-emerald-400 leading-relaxed whitespace-pre-wrap">
                                               {JSON.stringify(log.details, null, 2)}
                                            </pre>
                                         </div>
                                      </div>
                                   )}
                                </div>
                             </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
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
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:border-amber-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> {t('common.previous')}
            </button>
            <div className="flex items-center gap-4">
               <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <span className="text-xs font-black text-amber-600">{t('admin.logs.registry')} {pagination.page} / {pagination.totalPages}</span>
               </div>
            </div>
            <button 
              onClick={() => fetchLogs(pagination.page + 1)} 
              disabled={pagination.page >= pagination.totalPages}
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:border-amber-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {t('common.next')} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogsManager;
