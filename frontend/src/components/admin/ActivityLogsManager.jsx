import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity, Filter, RefreshCw, Trash2,
  ChevronLeft, ChevronRight, Clock, User, Shield,
  Database, BarChart3, AlertTriangle,
  Calendar, Globe, Fingerprint, ArrowUpRight,
} from 'lucide-react';

import {
  StatCard,
  Toolbar,
  SearchInput,
  SectionCard,
  DataTable,
  Modal,
  FormField,
  StatusBadge,
  EmptyState,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Known modules (drives the module filter dropdown). Colour is collapsed to a
// single neutral/accent token system via getModuleVariant below.
const MODULES = [
  'Auth', 'Students', 'Courses', 'Grades', 'Timetable', 'Notifications',
  'Quizzes', 'Resources', 'Roadmap', 'Departments', 'Events', 'Progress',
  'Student Courses',
];

// HTTP method -> semantic StatusBadge variant.
// success(green)=create, warning(amber)=mutate, danger(red)=delete, neutral=read.
const METHOD_VARIANT = {
  POST: 'success',
  PUT: 'warning',
  PATCH: 'warning',
  DELETE: 'danger',
  GET: 'neutral',
};

const getMethodVariant = (method) => METHOD_VARIANT[method] || 'neutral';

const ActivityLogsManager = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
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

  const statCards = stats ? [
    { label: t('admin.logs.stats.total'), value: stats.total_actions || 0, icon: Database, accent: true },
    { label: t('admin.logs.stats.today'), value: stats.today_actions || 0, icon: Clock },
    { label: t('admin.logs.stats.weekly'), value: stats.week_actions || 0, icon: BarChart3 },
    { label: t('admin.logs.stats.admins'), value: stats.unique_admins || 0, icon: Shield },
  ] : [];

  const columns = [
    {
      key: 'method',
      header: t('admin.logs.table.method'),
      headClassName: 'w-24',
      render: (log) => (
        <StatusBadge variant={getMethodVariant(log.method)}>{log.method}</StatusBadge>
      ),
    },
    {
      key: 'module',
      header: t('admin.logs.table.module'),
      render: (log) => (
        <StatusBadge variant="neutral" className="whitespace-nowrap">{log.module}</StatusBadge>
      ),
    },
    {
      key: 'action',
      header: t('admin.logs.table.operation'),
      render: (log) => (
        <p className="max-w-[220px] truncate text-sm font-medium text-foreground">{log.action}</p>
      ),
    },
    {
      key: 'admin',
      header: t('admin.logs.table.admin'),
      render: (log) => (
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full border bg-muted text-muted-foreground">
            <User className="size-3.5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{log.admin_name}</p>
            <p className="truncate text-xs text-muted-foreground">{log.admin_role}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'temporal',
      header: t('admin.logs.table.temporal'),
      render: (log) => (
        <div className="flex flex-col whitespace-nowrap">
          <span className="text-sm text-foreground">{timeAgo(log.created_at)}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      ),
    },
    {
      key: 'view',
      header: '',
      headClassName: 'w-10',
      cellClassName: 'text-end',
      render: () => (
        <ChevronRight className={`inline size-4 text-muted-foreground ${isAr ? 'rotate-180' : ''}`} />
      ),
    },
  ];

  const detailItems = selectedLog ? [
    { icon: Fingerprint, label: t('admin.logs.table.details.admin_id'), value: `#${selectedLog.admin_id}` },
    { icon: Globe, label: t('admin.logs.table.details.source_address'), value: selectedLog.ip_address || 'Internal' },
    { icon: Calendar, label: t('admin.logs.table.details.full_timestamp'), value: formatDate(selectedLog.created_at) },
  ] : [];

  return (
    <div className="space-y-6 p-4 sm:p-6 text-start">
      {/* Toolbar: search + filter toggle + refresh / purge */}
      <Toolbar>
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <SearchInput
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            placeholder={t('admin.logs.filters.placeholder_action')}
            onKeyDown={(e) => { if (e.key === 'Enter') fetchLogs(1); }}
          />
          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="size-3.5" />
              {t('admin.logs.filters.title')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { fetchLogs(); fetchStats(); }}
            >
              <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
              {t('admin.logs.sync')}
            </Button>
          </div>
        </div>
        <Button variant="destructive" size="sm" onClick={handleCleanup}>
          <Trash2 className="size-3.5" />
          {t('admin.logs.purge')}
        </Button>
      </Toolbar>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {statCards.map((s, i) => (
            <StatCard key={i} label={s.label} value={s.value} icon={s.icon} accent={s.accent} />
          ))}
        </div>
      )}

      {/* Filters panel */}
      <AnimatePresence initial={false}>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <SectionCard title={t('admin.logs.filters.title')}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <FormField label={t('admin.logs.filters.admin')} htmlFor="logs-admin-id">
                  <Input
                    id="logs-admin-id"
                    type="text"
                    placeholder={t('admin.logs.filters.admin')}
                    value={filters.admin_id}
                    onChange={(e) => setFilters({ ...filters, admin_id: e.target.value })}
                  />
                </FormField>
                <FormField label={t('admin.logs.filters.module')}>
                  <Select
                    value={filters.module || 'all'}
                    onValueChange={(v) => setFilters({ ...filters, module: v === 'all' ? '' : v })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('admin.logs.filters.all_modules')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('admin.logs.filters.all_modules')}</SelectItem>
                      {MODULES.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label={t('admin.logs.filters.action')} htmlFor="logs-action">
                  <Input
                    id="logs-action"
                    type="text"
                    placeholder={t('admin.logs.filters.placeholder_action')}
                    value={filters.action}
                    onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                  />
                </FormField>
                <FormField label={t('admin.logs.filters.date_from')} htmlFor="logs-date-from">
                  <Input
                    id="logs-date-from"
                    type="date"
                    value={filters.date_from}
                    onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                  />
                </FormField>
                <FormField label={t('admin.logs.filters.date_to')} htmlFor="logs-date-to">
                  <Input
                    id="logs-date-to"
                    type="date"
                    value={filters.date_to}
                    onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                  />
                </FormField>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => fetchLogs(1)}>
                  {t('admin.logs.filters.execute')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilters({ admin_id: '', module: '', action: '', date_from: '', date_to: '' })}
                >
                  {t('admin.logs.filters.reset')}
                </Button>
              </div>
            </SectionCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Registry */}
      <SectionCard
        title={t('admin.logs.registry')}
        actions={
          <span className="text-xs text-muted-foreground">
            {t('admin.logs.scan_results', { count: logs.length, total: pagination.total })}
          </span>
        }
        bodyClassName="p-0"
      >
        <DataTable
          columns={columns}
          rows={logs}
          getRowKey={(log) => log.id}
          loading={loading}
          onRowClick={(log) => setSelectedLog(log)}
          className="rounded-none border-0"
          empty={
            <EmptyState
              icon={AlertTriangle}
              title={t('admin.tasks.no_tasks')}
            />
          }
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 border-t px-4 py-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchLogs(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className={`size-4 ${isAr ? 'rotate-180' : ''}`} />
              {t('common.previous')}
            </Button>
            <span className="text-xs font-medium text-muted-foreground">
              {pagination.page} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchLogs(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              {t('common.next')}
              <ChevronRight className={`size-4 ${isAr ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        )}
      </SectionCard>

      {/* Detail modal */}
      <Modal
        open={!!selectedLog}
        onOpenChange={(open) => { if (!open) setSelectedLog(null); }}
        size="lg"
        title={selectedLog?.action}
        description={selectedLog ? `${selectedLog.module} • ${selectedLog.admin_name}` : undefined}
      >
        {selectedLog && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge variant={getMethodVariant(selectedLog.method)}>{selectedLog.method}</StatusBadge>
              <StatusBadge variant="neutral">{selectedLog.module}</StatusBadge>
              <StatusBadge variant={selectedLog.status_code && selectedLog.status_code >= 400 ? 'danger' : 'success'} icon={Activity}>
                {selectedLog.status_code || '200 OK'} • {t('admin.logs.table.details.authorized')}
              </StatusBadge>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {detailItems.map((item, i) => (
                <div key={i}>
                  <p className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <item.icon className="size-3.5" /> {item.label}
                  </p>
                  <p className="text-sm font-medium text-foreground break-all">{item.value}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <ArrowUpRight className="size-3.5" /> {t('admin.logs.table.details.resource_mapping')}
              </p>
              <code className="block break-all rounded-md border bg-muted px-3 py-2 font-mono text-xs text-foreground">
                {selectedLog.endpoint}
              </code>
            </div>

            {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
              <div>
                <p className="mb-1 text-xs text-muted-foreground">{t('admin.logs.table.details.payload_matrix')}</p>
                <div className="max-h-64 overflow-y-auto rounded-md border bg-muted p-3">
                  <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ActivityLogsManager;
