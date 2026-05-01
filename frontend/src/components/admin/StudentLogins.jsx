import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { RefreshCw, Users, Shield, Smartphone, Globe, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

const StudentLogins = () => {
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
      toast.error('Failed to load student login logs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const timeAgo = (d) => {
    const diff = (Date.now() - new Date(d)) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm transition-colors gap-4">
        <div>
          <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2 transition-colors">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Student Login Activity
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-500 font-bold mt-1 transition-colors">Track when and how students authenticate</p>
        </div>
        <button onClick={() => fetchLogs()} className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-600 dark:text-slate-300 text-sm font-black hover:bg-gray-200 dark:hover:bg-white/10 transition-all shadow-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Registry
        </button>
      </div>

      <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-[2rem] overflow-hidden shadow-sm transition-colors">
        <div className="px-8 py-5 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.01] flex justify-between items-center transition-colors">
          <p className="text-gray-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest transition-colors">
            Showing <span className="text-gray-900 dark:text-white transition-colors">{logs.length}</span> of <span className="text-gray-900 dark:text-white transition-colors">{pagination.total}</span> logins
          </p>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
            <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Scanning Activity Logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 grayscale opacity-20 transition-all">
            <AlertTriangle className="w-16 h-16 mb-4 text-gray-400 dark:text-white" />
            <p className="text-sm font-black uppercase tracking-[0.3em] text-gray-500 dark:text-white">No student logins detected</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {logs.map(log => (
              <div key={log.id} className="px-8 py-5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm overflow-hidden ${log.method === 'Google' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/10' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/10'}`}>
                    {log.avatar_url ? (
                      <img src={log.avatar_url} alt={log.student_name} className="w-full h-full object-cover" />
                    ) : (
                      log.method === 'Google' ? <Globe className="w-6 h-6" /> : <Shield className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-white text-base font-black tracking-tight transition-colors">{log.student_name}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[11px] text-gray-400 dark:text-slate-500 font-mono font-bold transition-colors">{log.student_id}</span>
                      <span className={`text-[9px] px-2.5 py-0.5 rounded-lg font-black uppercase tracking-widest border transition-colors ${
                        log.method === 'Google' ? 'bg-red-500/5 text-red-600 dark:text-red-400 border-red-500/10' : 'bg-blue-500/5 text-blue-600 dark:text-blue-400 border-blue-500/10'
                      }`}>{log.method} AUTH</span>
                    </div>
                  </div>
                </div>
                <div className="text-left sm:text-right flex flex-col gap-1 w-full sm:w-auto">
                  <div className="flex items-center sm:justify-end gap-2">
                    <RefreshCw className="w-3 h-3 text-emerald-500" />
                    <p className="text-gray-900 dark:text-slate-300 text-sm font-black transition-colors">{timeAgo(log.created_at)}</p>
                  </div>
                  <p className="text-gray-400 dark:text-slate-500 text-[11px] font-bold uppercase tracking-tight transition-colors">{formatDate(log.created_at)}</p>
                  <p className="text-gray-300 dark:text-slate-700 text-[10px] font-mono font-bold transition-colors">{log.ip_address}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="px-8 py-6 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 dark:bg-white/[0.01] transition-colors">
            <button onClick={() => fetchLogs(pagination.page - 1)} disabled={pagination.page <= 1}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-600 dark:text-slate-300 text-xs font-black uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-white/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed shadow-sm">
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Protocol Staging</span>
              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-1.5 rounded-full border border-gray-200 dark:border-white/10 shadow-sm transition-colors">
                <span className="text-gray-900 dark:text-white font-black text-xs transition-colors">{pagination.page}</span>
                <span className="text-gray-300 dark:text-slate-700">/</span>
                <span className="text-gray-500 dark:text-slate-500 font-black text-xs transition-colors">{pagination.totalPages}</span>
              </div>
            </div>
            <button onClick={() => fetchLogs(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-600 dark:text-slate-300 text-xs font-black uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-white/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed shadow-sm">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentLogins;
