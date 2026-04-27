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
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 rounded-2xl p-4">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" /> Student Login Activity
          </h3>
          <p className="text-xs text-slate-500 font-bold mt-1">Track when and how students authenticate</p>
        </div>
        <button onClick={() => fetchLogs()} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-300 text-sm font-bold hover:bg-white/10 transition-all">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
          <p className="text-slate-400 text-sm font-bold">
            Showing <span className="text-white">{logs.length}</span> of <span className="text-white">{pagination.total}</span> logins
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <AlertTriangle className="w-10 h-10 mb-3 text-slate-600" />
            <p className="font-bold">No student logins found</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {logs.map(log => (
              <div key={log.id} className="px-6 py-4 hover:bg-white/[0.02] transition-all flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${log.method === 'Google' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {log.method === 'Google' ? <Globe className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">{log.student_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400 font-mono">{log.student_id}</span>
                      <span className="text-[10px] bg-white/5 text-slate-300 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">{log.method}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-300 text-sm font-bold">{timeAgo(log.created_at)}</p>
                  <p className="text-slate-500 text-xs font-medium mt-1">{formatDate(log.created_at)}</p>
                  <p className="text-slate-600 text-[10px] font-mono mt-0.5">{log.ip_address}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
            <button onClick={() => fetchLogs(pagination.page - 1)} disabled={pagination.page <= 1}
              className="flex items-center gap-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-300 text-sm font-bold hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="text-slate-400 text-sm font-bold">
              Page <span className="text-white">{pagination.page}</span> of <span className="text-white">{pagination.totalPages}</span>
            </span>
            <button onClick={() => fetchLogs(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}
              className="flex items-center gap-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-300 text-sm font-bold hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentLogins;
