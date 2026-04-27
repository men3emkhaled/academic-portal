import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  Activity, Search, Filter, RefreshCw, Trash2,
  ChevronLeft, ChevronRight, Clock, User, Shield,
  Database, BarChart3, Users, AlertTriangle
} from 'lucide-react';

const MODULE_COLORS = {
  'Auth': { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  'Students': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  'Courses': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  'Grades': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  'Timetable': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  'Notifications': { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  'Quizzes': { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  'Resources': { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20' },
  'Roadmap': { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
  'Departments': { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
  'Events': { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  'Progress': { bg: 'bg-lime-500/10', text: 'text-lime-400', border: 'border-lime-500/20' },
  'Student Courses': { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20' },
};

const METHOD_COLORS = {
  'POST': 'bg-green-500/20 text-green-400',
  'PUT': 'bg-yellow-500/20 text-yellow-400',
  'DELETE': 'bg-red-500/20 text-red-400',
  'PATCH': 'bg-orange-500/20 text-orange-400',
  'GET': 'bg-blue-500/20 text-blue-400',
};

const getModuleColor = (mod) => MODULE_COLORS[mod] || { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' };

const ActivityLogsManager = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 30, totalPages: 0 });
  const [stats, setStats] = useState(null);
  const [topAdmins, setTopAdmins] = useState([]);
  const [moduleStats, setModuleStats] = useState([]);
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
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/admin-logs/stats');
      setStats(res.data.stats);
      setTopAdmins(res.data.topAdmins || []);
      setModuleStats(res.data.moduleStats || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchLogs(); fetchStats(); }, [fetchLogs, fetchStats]);

  const handleCleanup = async () => {
    if (!window.confirm('Delete all logs older than 90 days?')) return;
    try {
      const res = await api.delete('/admin-logs/cleanup?days=90');
      toast.success(res.data.message);
      fetchLogs();
      fetchStats();
    } catch { toast.error('Cleanup failed'); }
  };

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const timeAgo = (d) => {
    const diff = (Date.now() - new Date(d)) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
            <Activity className="w-7 h-7 text-amber-400" /> Activity Logs
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">Track all admin operations across the system</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${showFilters ? 'bg-amber-500 text-black' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'}`}>
            <Filter className="w-4 h-4" /> Filters
          </button>
          <button onClick={() => { fetchLogs(); fetchStats(); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-300 text-sm font-bold hover:bg-white/10 transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button onClick={handleCleanup}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-bold hover:bg-red-500/20 transition-all">
            <Trash2 className="w-4 h-4" /> Cleanup
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Actions', value: stats.total_actions, icon: <Database className="w-5 h-5" />, color: 'emerald' },
            { label: 'Today', value: stats.today_actions, icon: <Clock className="w-5 h-5" />, color: 'amber' },
            { label: 'This Week', value: stats.week_actions, icon: <BarChart3 className="w-5 h-5" />, color: 'blue' },
            { label: 'Active Admins', value: stats.unique_admins, icon: <Users className="w-5 h-5" />, color: 'purple' },
          ].map((s, i) => (
            <div key={i} className={`bg-white/[0.03] border border-white/5 rounded-2xl p-5 hover:border-${s.color}-500/30 transition-all`}>
              <div className={`flex items-center gap-2 mb-3 text-${s.color}-400`}>
                {s.icon}
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{s.label}</span>
              </div>
              <p className="text-3xl font-black text-white">{s.value || 0}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">Admin</label>
              <input type="text" placeholder="Admin ID..." value={filters.admin_id}
                onChange={e => setFilters({ ...filters, admin_id: e.target.value })}
                className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm focus:border-amber-500/50 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">Module</label>
              <select value={filters.module} onChange={e => setFilters({ ...filters, module: e.target.value })}
                className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm focus:border-amber-500/50 focus:outline-none appearance-none">
                <option value="">All Modules</option>
                {Object.keys(MODULE_COLORS).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">Action</label>
              <input type="text" placeholder="Search action..." value={filters.action}
                onChange={e => setFilters({ ...filters, action: e.target.value })}
                className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm focus:border-amber-500/50 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">From</label>
              <input type="date" value={filters.date_from}
                onChange={e => setFilters({ ...filters, date_from: e.target.value })}
                className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm focus:border-amber-500/50 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">To</label>
              <input type="date" value={filters.date_to}
                onChange={e => setFilters({ ...filters, date_to: e.target.value })}
                className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-2.5 text-white text-sm focus:border-amber-500/50 focus:outline-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => fetchLogs(1)} className="px-5 py-2.5 bg-amber-500 text-black font-bold rounded-xl text-sm hover:scale-[1.02] active:scale-95 transition-all">
              <Search className="w-4 h-4 inline mr-1" /> Apply
            </button>
            <button onClick={() => { setFilters({ admin_id: '', module: '', action: '', date_from: '', date_to: '' }); }}
              className="px-5 py-2.5 bg-white/5 border border-white/10 text-slate-300 font-bold rounded-xl text-sm hover:bg-white/10 transition-all">
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Top Admins & Module Stats */}
      {(topAdmins.length > 0 || moduleStats.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6">
          {topAdmins.length > 0 && (
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" /> Top Admins
              </h3>
              <div className="space-y-2">
                {topAdmins.slice(0, 5).map((a, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/[0.02] rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center text-amber-400 text-xs font-black">{i + 1}</div>
                      <div>
                        <p className="text-white text-sm font-bold">{a.admin_name}</p>
                        <p className="text-slate-500 text-[10px] font-bold uppercase">{a.admin_role}</p>
                      </div>
                    </div>
                    <span className="text-amber-400 font-black text-lg">{a.total_actions}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {moduleStats.length > 0 && (
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" /> Module Activity
              </h3>
              <div className="space-y-2">
                {moduleStats.slice(0, 7).map((m, i) => {
                  const mc = getModuleColor(m.module);
                  const max = moduleStats[0]?.total_actions || 1;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className={`text-xs font-bold ${mc.text} w-28 truncate`}>{m.module}</span>
                      <div className="flex-1 h-6 bg-white/[0.03] rounded-lg overflow-hidden">
                        <div className={`h-full ${mc.bg} rounded-lg flex items-center px-2 transition-all duration-700`}
                          style={{ width: `${Math.max((m.total_actions / max) * 100, 8)}%` }}>
                          <span className="text-[10px] font-black text-white">{m.total_actions}</span>
                        </div>
                      </div>
                      <span className="text-emerald-400 text-[10px] font-bold w-12 text-right">+{m.today || 0} today</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
          <p className="text-slate-400 text-sm font-bold">
            Showing <span className="text-white">{logs.length}</span> of <span className="text-white">{pagination.total}</span> entries
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <AlertTriangle className="w-10 h-10 mb-3 text-slate-600" />
            <p className="font-bold">No activity logs found</p>
            <p className="text-sm mt-1">Admin actions will appear here automatically</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {logs.map(log => {
              const mc = getModuleColor(log.module);
              return (
                <div key={log.id}
                  onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                  className="px-6 py-4 hover:bg-white/[0.02] cursor-pointer transition-all">
                  <div className="flex items-center gap-4">
                    {/* Method Badge */}
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${METHOD_COLORS[log.method] || 'bg-slate-500/20 text-slate-400'}`}>
                      {log.method}
                    </span>

                    {/* Module Badge */}
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${mc.bg} ${mc.text} border ${mc.border}`}>
                      {log.module}
                    </span>

                    {/* Action */}
                    <p className="text-white text-sm font-bold flex-1 truncate">{log.action}</p>

                    {/* Admin Info */}
                    <div className="hidden md:flex items-center gap-2 text-slate-400">
                      <User className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold">{log.admin_name}</span>
                      {log.admin_role !== 'admin' && (
                        <span className="text-[9px] bg-yellow-500/10 text-yellow-400 px-1.5 py-0.5 rounded-md font-bold uppercase">{log.admin_role}</span>
                      )}
                    </div>

                    {/* Time */}
                    <span className="text-slate-500 text-xs font-bold whitespace-nowrap hidden lg:block">{timeAgo(log.created_at)}</span>
                  </div>

                  {/* Expanded Details */}
                  {selectedLog?.id === log.id && (
                    <div className="mt-4 bg-black/30 rounded-xl p-4 space-y-3 animate-fadeIn border border-white/5">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="text-slate-500 font-bold uppercase block mb-1">Admin ID</span>
                          <span className="text-white font-bold">{log.admin_id}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-bold uppercase block mb-1">Status</span>
                          <span className={`font-bold ${log.status_code < 400 ? 'text-emerald-400' : 'text-red-400'}`}>{log.status_code || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-bold uppercase block mb-1">IP</span>
                          <span className="text-white font-bold">{log.ip_address || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-bold uppercase block mb-1">Time</span>
                          <span className="text-white font-bold">{formatDate(log.created_at)}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500 text-xs font-bold uppercase block mb-1">Endpoint</span>
                        <code className="text-amber-400 text-xs font-mono bg-white/[0.03] px-3 py-1.5 rounded-lg block">{log.endpoint}</code>
                      </div>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div>
                          <span className="text-slate-500 text-xs font-bold uppercase block mb-1">Details</span>
                          <pre className="text-slate-300 text-xs font-mono bg-white/[0.03] px-3 py-2 rounded-lg overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
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

export default ActivityLogsManager;
