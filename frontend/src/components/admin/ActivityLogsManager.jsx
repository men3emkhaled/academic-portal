import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Activity, Search, Filter, RefreshCw, Trash2, ChevronLeft, ChevronRight, Clock, User, Shield, Database, BarChart3, AlertTriangle, Fingerprint, Globe, Calendar, ArrowUpRight } from 'lucide-react';

const MODULE_COLORS = {
  'Auth': { bg: 'bg-yellow-500/10', text: 'text-yellow-600', border: 'border-yellow-500/20' },
  'Students': { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20' },
  'Courses': { bg: 'bg-[#059669]/10', text: 'text-[#059669]', border: 'border-[#059669]/20' },
  'Grades': { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20' },
  'Timetable': { bg: 'bg-cyan-500/10', text: 'text-cyan-600', border: 'border-cyan-500/20' },
  'Notifications': { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/20' },
  'Quizzes': { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-500/20' },
  'Resources': { bg: 'bg-teal-500/10', text: 'text-teal-600', border: 'border-teal-500/20' },
  'Roadmap': { bg: 'bg-[#059669]/10', text: 'text-[#059669]', border: 'border-[#059669]/20' },
  'Departments': { bg: 'bg-pink-500/10', text: 'text-pink-600', border: 'border-pink-500/20' },
  'Events': { bg: 'bg-rose-500/10', text: 'text-rose-600', border: 'border-rose-500/20' },
  'Progress': { bg: 'bg-lime-500/10', text: 'text-lime-600', border: 'border-lime-500/20' },
  'Student Courses': { bg: 'bg-sky-500/10', text: 'text-sky-600', border: 'border-sky-500/20' },
};

const METHOD_COLORS = {
  'POST': 'bg-green-500/10 text-green-600 border-green-500/20',
  'PUT': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  'DELETE': 'bg-red-500/10 text-red-600 border-red-500/20',
  'PATCH': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  'GET': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
};

const getModuleColor = (mod) => MODULE_COLORS[mod] || { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500', border: 'border-gray-200 dark:border-gray-700' };

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
    } catch (error) { toast.error(t('admin.messages.load_logs_failed')); }
    finally { setLoading(false); }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try { const res = await api.get('/admin-logs/stats'); setStats(res.data.stats); }
    catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchLogs(); fetchStats(); }, [fetchLogs, fetchStats]);

  const handleCleanup = async () => {
    if (!window.confirm(t('common.confirm_delete'))) return;
    try { const res = await api.delete('/admin-logs/cleanup?days=90'); toast.success(res.data.message); fetchLogs(); fetchStats(); }
    catch { toast.error(t('admin.messages.cleanup_failed')); }
  };

  return (
    <div className="space-y-6 p-5">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex gap-2">
          <button onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              showFilters ? 'bg-[#059669] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}>
            <Filter className="w-3.5 h-3.5" />{t('admin.logs.filters.title')}
          </button>
          <button onClick={() => { fetchLogs(); fetchStats(); }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />{t('admin.logs.sync')}
          </button>
          <button onClick={handleCleanup}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />{t('admin.logs.purge')}
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: t('admin.logs.stats.total'), value: stats.total_actions, icon: Database, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
            { label: t('admin.logs.stats.today'), value: stats.today_actions, icon: Clock, color: 'text-[#059669]', bg: 'bg-[#059669]/10' },
            { label: t('admin.logs.stats.weekly'), value: stats.week_actions, icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-500/10' },
            { label: t('admin.logs.stats.admins'), value: stats.unique_admins, icon: Shield, color: 'text-[#059669]', bg: 'bg-[#059669]/10' },
          ].map((s, i) => (
            <div key={i} className="bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center ${s.color} mb-2`}><s.icon className="w-4 h-4" /></div>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{s.label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{s.value || 0}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <input type="text" placeholder={t('admin.logs.filters.admin')} value={filters.admin_id}
              onChange={e => setFilters({ ...filters, admin_id: e.target.value })}
              className="w-full bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none" />
            <select value={filters.module} onChange={e => setFilters({ ...filters, module: e.target.value })}
              className="w-full bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none">
              <option value="">{t('admin.logs.filters.all_modules')}</option>
              {Object.keys(MODULE_COLORS).map(m => <option key={m} value={m}>{t(`admin.logs.modules.${m}`, m)}</option>)}
            </select>
            <input type="text" placeholder={t('admin.logs.filters.placeholder_action')} value={filters.action}
              onChange={e => setFilters({ ...filters, action: e.target.value })}
              className="w-full bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none" />
            <input type="date" value={filters.date_from} onChange={e => setFilters({ ...filters, date_from: e.target.value })}
              className="w-full bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none" />
            <input type="date" value={filters.date_to} onChange={e => setFilters({ ...filters, date_to: e.target.value })}
              className="w-full bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => fetchLogs(1)} className="px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-medium rounded-lg transition-colors">{t('admin.logs.filters.execute')}</button>
            <button onClick={() => setFilters({ admin_id: '', module: '', action: '', date_from: '', date_to: '' })}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">{t('admin.logs.filters.reset')}</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('admin.logs.registry')}</h3>
          <span className="text-xs text-gray-400">{t('admin.logs.scan_results', { count: logs.length, total: pagination.total })}</span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-sm text-gray-400">{t('admin.tasks.loading')}</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-400">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-30" />
            {t('admin.tasks.no_tasks')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 text-start">{t('admin.logs.table.method')}</th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 text-start">{t('admin.logs.table.module')}</th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 text-start">{t('admin.logs.table.operation')}</th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 text-start">{t('admin.logs.table.admin')}</th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 text-start">{t('admin.logs.table.temporal')}</th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 text-end"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {logs.map(log => {
                  const mc = getModuleColor(log.module);
                  const isExpanded = selectedLog?.id === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr onClick={() => setSelectedLog(isExpanded ? null : log)}
                        className={`cursor-pointer transition-colors ${isExpanded ? 'bg-[#059669]/5 dark:bg-[#059669]/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'}`}>
                        <td className="py-3 px-4"><span className={`text-[10px] px-1.5 py-0.5 rounded border ${METHOD_COLORS[log.method] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>{t(`admin.logs.http_methods.${log.method}`, log.method)}</span></td>
                        <td className="py-3 px-4"><span className={`text-[10px] px-1.5 py-0.5 rounded border ${mc.bg} ${mc.text} ${mc.border}`}>{t(`admin.logs.modules.${log.module}`, log.module)}</span></td>
                        <td className="py-3 px-4"><p className="text-sm text-gray-900 dark:text-white truncate max-w-[200px]">{log.action}</p></td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"><User className="w-3.5 h-3.5 text-gray-400" /></div>
                            <div><p className="text-xs font-medium text-gray-900 dark:text-white">{log.admin_name}</p><p className="text-[10px] text-[#059669]">{log.admin_role}</p></div>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap"><span className="text-xs text-gray-500">{new Date(log.created_at).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}</span></td>
                        <td className="py-3 px-4 text-end">
                          <div className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${isExpanded ? 'bg-[#059669] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan="6" className="px-4 pb-4 pt-2 bg-[#059669]/5 dark:bg-[#059669]/10">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-gray-800/50 border border-[#059669]/20 rounded-lg p-4 text-sm">
                              <div>
                                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Fingerprint className="w-3 h-3 text-[#059669]" />{t('admin.logs.table.details.admin_id')}</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">#{log.admin_id}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Globe className="w-3 h-3 text-[#059669]" />{t('admin.logs.table.details.source_address')}</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{log.ip_address || t('admin.logs.table.details.internal')}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Activity className="w-3 h-3 text-[#059669]" />{t('admin.logs.table.details.signal_status')}</p>
                                <p className={`text-sm font-medium ${log.status_code < 400 ? 'text-green-600' : 'text-rose-600'}`}>{log.status_code || '200'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar className="w-3 h-3 text-[#059669]" />{t('admin.logs.table.details.full_timestamp')}</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{new Date(log.created_at).toLocaleString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}</p>
                              </div>
                              <div className="md:col-span-4">
                                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><ArrowUpRight className="w-3 h-3 text-[#059669]" />{t('admin.logs.table.details.resource_mapping')}</p>
                                <code className="text-xs text-[#059669] bg-[#059669]/5 px-2 py-1 rounded border border-[#059669]/10 break-all">{log.endpoint}</code>
                              </div>
                              {log.details && Object.keys(log.details).length > 0 && (
                                <div className="md:col-span-4">
                                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">{t('admin.logs.table.details.payload_matrix')}</p>
                                  <pre className="text-xs bg-gray-900 text-green-400 rounded-lg p-3 overflow-x-auto">{JSON.stringify(log.details, null, 2)}</pre>
                                </div>
                              )}
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <button onClick={() => fetchLogs(pagination.page - 1)} disabled={pagination.page <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 disabled:opacity-30 transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" />{t('common.previous')}
            </button>
            <span className="text-xs text-gray-500">{pagination.page} / {pagination.totalPages}</span>
            <button onClick={() => fetchLogs(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 disabled:opacity-30 transition-colors">
              {t('common.next')}<ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogsManager;
