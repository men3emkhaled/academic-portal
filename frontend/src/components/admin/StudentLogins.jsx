import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  RefreshCw, Users, Shield, Smartphone, Globe, 
  AlertTriangle, ChevronLeft, ChevronRight,
  Fingerprint, Clock, Calendar, Database,
  ArrowUpRight, Info
} from 'lucide-react';

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
      toast.error('Failed to load student access logs');
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
    <div className="p-8 space-y-10 animate-in fade-in duration-700">
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-600/20">
                  <Database className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Access Registry</h3>
          </div>
          <button 
            onClick={() => fetchLogs()} 
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:border-blue-500/30 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Sync Access
          </button>
      </div>

      {/* Main Table View */}
      <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-500">
        <div className="px-10 py-8 border-b border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01] flex justify-between items-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Access Points: <span className="text-blue-600">{logs.length}</span> / {pagination.total} signals
            </p>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Live Monitoring</span>
            </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-50">
             <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-6"></div>
             <p className="text-[10px] font-black uppercase tracking-widest">Decoding Access Map...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <AlertTriangle className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-black text-sm uppercase tracking-widest">Zero Access Logs</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-transparent border-b border-gray-50 dark:border-white/5">
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Student Identity</th>
                  <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Authentication</th>
                  <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Access Node</th>
                  <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Temporal Signal</th>
                  <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                {logs.map(log => (
                  <tr key={log.id} className="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-all">
                    <td className="px-10 py-6">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center overflow-hidden shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                             {log.avatar_url ? (
                               <img src={log.avatar_url} alt={log.student_name} className="w-full h-full object-cover" />
                             ) : (
                               <Users className="w-6 h-6" />
                             )}
                          </div>
                          <div>
                             <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{log.student_name}</p>
                             <div className="flex items-center gap-2 mt-1">
                                <Fingerprint className="w-3 h-3 text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">{log.student_id}</span>
                             </div>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-6">
                       <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg border flex items-center gap-2 w-fit ${
                          log.method === 'Google' 
                            ? 'bg-rose-500/5 text-rose-600 border-rose-500/20' 
                            : 'bg-blue-500/5 text-blue-600 border-blue-500/20'
                       }`}>
                         {log.method === 'Google' ? <Globe className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                         {log.method} AUTH
                       </span>
                    </td>
                    <td className="px-6 py-6">
                       <div className="flex flex-col">
                          <span className="text-xs font-black text-gray-900 dark:text-gray-300">{log.ip_address || '127.0.0.1'}</span>
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">IPv4 Endpoint</span>
                       </div>
                    </td>
                    <td className="px-6 py-6">
                       <div className="flex flex-col">
                          <span className="text-xs font-black text-gray-900 dark:text-white">{timeAgo(log.created_at)}</span>
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{formatDate(log.created_at)}</span>
                       </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                       <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Secure</span>
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
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:border-blue-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <div className="flex items-center gap-4">
               <div className="px-4 py-2 bg-blue-600/10 border border-blue-600/20 rounded-xl">
                  <span className="text-xs font-black text-blue-600">Signal {pagination.page} / {pagination.totalPages}</span>
               </div>
            </div>
            <button 
              onClick={() => fetchLogs(pagination.page + 1)} 
              disabled={pagination.page >= pagination.totalPages}
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:border-blue-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentLogins;
