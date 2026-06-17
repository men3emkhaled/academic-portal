import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  RefreshCw, Users, Shield, Globe,
  ChevronLeft, ChevronRight, Fingerprint, Database,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  PageContainer,
  PageHeader,
  Toolbar,
  DataTable,
  StatusBadge,
  EmptyState,
} from '@/components/common';
import { cn } from '@/lib/utils';

const StudentLogins = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
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

  const columns = [
    {
      key: 'identity',
      header: t('admin.logs.table.identity'),
      render: (log) => (
        <div className="flex items-center gap-3">
          <Avatar>
            {log.avatar_url ? (
              <AvatarImage src={log.avatar_url} alt={log.student_name} />
            ) : null}
            <AvatarFallback>
              <Users className="size-4" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{log.student_name}</p>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Fingerprint className="size-3 shrink-0" />
              <span className="truncate">{log.student_id}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'auth',
      header: t('admin.logs.table.auth'),
      render: (log) => (
        <StatusBadge
          variant={log.method === 'Google' ? 'neutral' : 'accent'}
          icon={log.method === 'Google' ? Globe : Shield}
        >
          {log.method}
        </StatusBadge>
      ),
    },
    {
      key: 'node',
      header: t('admin.logs.table.node'),
      render: (log) => (
        <div className="flex flex-col">
          <span className="text-sm text-foreground">{log.ip_address || '127.0.0.1'}</span>
          <span className="mt-0.5 text-xs text-muted-foreground">{t('admin.logs.table.details.ipv4_endpoint')}</span>
        </div>
      ),
    },
    {
      key: 'temporal',
      header: t('admin.logs.table.temporal'),
      render: (log) => (
        <div className="flex flex-col">
          <span className="text-sm text-foreground">{timeAgo(log.created_at)}</span>
          <span className="mt-0.5 text-xs text-muted-foreground">{formatDate(log.created_at)}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: t('admin.logs.table.status'),
      headClassName: 'text-end',
      cellClassName: 'text-end',
      render: () => (
        <StatusBadge variant="success">
          {t('admin.logs.table.details.secure')}
        </StatusBadge>
      ),
    },
  ];

  return (
    <PageContainer className="text-start">
      <PageHeader
        icon={Database}
        title={t('admin.logs.access_registry')}
        actions={
          <Button variant="outline" onClick={() => fetchLogs()} disabled={loading}>
            <RefreshCw className={cn('size-4', loading && 'animate-spin')} />
            {t('admin.logs.sync_access')}
          </Button>
        }
      />

      <Toolbar>
        <p className="text-sm text-muted-foreground">
          {t('admin.logs.access_points', { count: logs.length, total: pagination.total })}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary" />
          <span>{t('admin.logs.real_time')}</span>
        </div>
      </Toolbar>

      <DataTable
        columns={columns}
        rows={logs}
        getRowKey={(log) => log.id}
        loading={loading}
        empty={<EmptyState icon={Database} title={t('admin.logs.registry_void')} />}
      />

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLogs(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            {isAr ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            {t('common.previous')}
          </Button>
          <span className="text-sm text-muted-foreground">
            {pagination.page} / {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLogs(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            {t('common.next')}
            {isAr ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
          </Button>
        </div>
      )}
    </PageContainer>
  );
};

export default StudentLogins;
