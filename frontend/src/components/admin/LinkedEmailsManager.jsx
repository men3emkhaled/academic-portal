import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Mail, RefreshCw, User, Fingerprint } from 'lucide-react';
import {
  PageHeader,
  StatCard,
  Toolbar,
  SearchInput,
  DataTable,
  StatusBadge,
  EmptyState,
} from '@/components/common';
import { Button } from '@/components/ui/button';

const LinkedEmailsManager = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [studentsWithEmail, setStudentsWithEmail] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/students');
      const filtered = res.data.filter(s => s.email && s.email.trim() !== '');
      setStudentsWithEmail(filtered);
    } catch (error) {
      toast.error('Failed to load linked accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const filteredStudents = studentsWithEmail.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      key: 'name',
      header: t('common.student'),
      headClassName: 'text-start',
      cellClassName: 'text-start',
      render: (student) => (
        <div className="flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
            <User className="size-4" />
          </span>
          <div className="min-w-0">
            <p className={`truncate text-sm font-medium text-foreground ${isAr ? 'font-arabic' : ''}`}>
              {student.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {t('admin.emails.level', { num: student.level })} · {t('admin.emails.section', { num: student.section })}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'id',
      header: t('admin.emails.student_id'),
      headClassName: 'text-start',
      cellClassName: 'text-start',
      render: (student) => (
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Fingerprint className="size-4 shrink-0" />
          <span className="font-mono text-foreground">{student.id}</span>
        </span>
      ),
    },
    {
      key: 'email',
      header: t('admin.emails.email_label'),
      headClassName: 'text-start',
      cellClassName: 'text-start',
      render: (student) => (
        <span className="inline-flex items-center gap-2 text-sm">
          <Mail className="size-4 shrink-0 text-primary" />
          <span className="truncate text-foreground">{student.email}</span>
        </span>
      ),
    },
    {
      key: 'status',
      header: '',
      headClassName: 'text-end',
      cellClassName: 'text-end',
      render: () => (
        <StatusBadge variant="success">{t('admin.emails.active_account')}</StatusBadge>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-start">
      <PageHeader
        icon={Mail}
        title={t('admin.emails.title')}
        description={t('admin.emails.description')}
        actions={
          <StatCard
            label={t('admin.emails.active_emails', { count: '' })}
            value={studentsWithEmail.length}
            icon={Mail}
            accent
            className="min-w-[10rem]"
          />
        }
      />

      <Toolbar>
        <SearchInput
          placeholder={t('admin.emails.search_placeholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button variant="secondary" onClick={fetchEmails} disabled={loading}>
          <RefreshCw className={loading ? 'animate-spin' : ''} />
          {t('admin.emails.refresh_button')}
        </Button>
      </Toolbar>

      <DataTable
        columns={columns}
        rows={filteredStudents}
        loading={loading}
        getRowKey={(student) => student.id}
        empty={
          <EmptyState
            icon={Mail}
            title={t('admin.emails.no_results')}
            description={t('admin.emails.no_results_hint')}
          />
        }
      />
    </div>
  );
};

export default LinkedEmailsManager;
