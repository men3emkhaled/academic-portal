import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { RefreshCw, Users, Fingerprint, AlertTriangle, ChevronLeft, ChevronRight, Globe, Shield } from 'lucide-react';

const StudentLogins = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 30, totalPages: 0 });
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/student-logs?page=${page}&limit=30`);
      setLogs(res.data.logs || []);
      setPagination(res.data.pagination || { total: 0, page: 1, limit: 30, totalPages: 0 });
    } catch (error) { toast.error(t('admin.messages.load_logs_failed')); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <div className="space-y-4 p-5">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('admin.logs.access_registry')}</h3>
        <button onClick={() => fetchLogs()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />{t('admin.logs.sync_access')}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <span className="text-xs text-gray-400">{t('admin.logs.access_points', { count: logs.length, total: pagination.total })}</span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-sm text-gray-400">{t('admin.tasks.loading')}</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-400">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-30" />
            {t('admin.logs.registry_void')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 text-start">{t('admin.logs.table.identity')}</th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 text-start">{t('admin.logs.table.auth')}</th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 text-start">{t('admin.logs.table.node')}</th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 text-start">{t('admin.logs.table.temporal')}</th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 text-end">{t('admin.logs.table.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#059669]/10 flex items-center justify-center text-[#059669]"><Users className="w-4 h-4" /></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{log.student_name}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1"><Fingerprint className="w-3 h-3" />{log.student_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border flex items-center gap-1 w-fit ${
                        log.method === 'Google' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : 'bg-[#059669]/10 text-[#059669] border-[#059669]/20'
                      }`}>
                        {log.method === 'Google' ? <Globe className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                        {t(`admin.logs.auth_methods.${log.method}`, log.method)}
                      </span>
                    </td>
                    <td className="py-3 px-4"><span className="text-xs text-gray-500">{log.ip_address || '127.0.0.1'}</span></td>
                    <td className="py-3 px-4 whitespace-nowrap"><span className="text-xs text-gray-500">{new Date(log.created_at).toLocaleString()}</span></td>
                    <td className="py-3 px-4 text-end">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-[#059669]/10 text-[#059669]">
                        <div className="w-1.5 h-1.5 bg-[#059669] rounded-full"></div>
                        {t('admin.logs.table.details.secure')}
                      </span>
                    </td>
                  </tr>
                ))}
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

export default StudentLogins;
