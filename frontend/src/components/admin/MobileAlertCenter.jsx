import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Users, User, Building2,
  History, Clock, Calendar, Trash2, AlertCircle,
  MessageSquare, Bell, Smartphone
} from 'lucide-react';
import {
  PageContainer,
  PageHeader,
  SectionCard,
  FormField,
  SegmentedTabs,
  StatusBadge,
  EmptyState,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const MobileAlertCenter = ({
  notifications = [],
  fetchNotifications,
  sending,
  setSending,
  departments = []
}) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [alertForm, setAlertForm] = useState({ studentId: '', department_id: '', title: '', content: '' });
  const [target, setTarget] = useState('all');

  // Filter for mobile-only notifications
  const mobileHistory = (notifications || []).filter(n => n.is_mobile_only);

  const handleSendPush = async (type) => {
    if (!alertForm.title || !alertForm.content) {
      toast.error(t('admin.mobile_center.messages.req_fields'));
      return;
    }

    setSending(true);
    try {
      let endpoint = '';
      let payload = {
        title: alertForm.title,
        content: alertForm.content,
        isMobileOnly: true
      };

      if (type === 'all') {
        endpoint = '/notifications/admin/send-to-all';
      } else if (type === 'dept') {
        if (!alertForm.department_id) { toast.error(t('admin.mobile_center.messages.req_dept')); setSending(false); return; }
        endpoint = '/notifications/admin/send-to-department';
        payload.department_id = alertForm.department_id;
      } else if (type === 'student') {
        if (!alertForm.studentId) { toast.error(t('admin.mobile_center.messages.req_student')); setSending(false); return; }
        endpoint = '/notifications/admin/send-to-student';
        payload.studentId = alertForm.studentId;
      }

      await api.post(endpoint, payload);
      toast.success(t('admin.mobile_center.messages.success_sent'));
      setAlertForm({ studentId: '', department_id: '', title: '', content: '' });
      fetchNotifications();
    } catch (error) {
      toast.error(t('admin.mobile_center.messages.error_sent'));
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.mobile_center.delete_confirm'))) return;
    try {
      await api.delete(`/notifications/admin/${id}`);
      toast.success(t('admin.mobile_center.messages.success_deleted'));
      fetchNotifications();
    } catch (error) {
      toast.error(t('admin.mobile_center.messages.error_deleted'));
    }
  };

  const targetOptions = [
    { value: 'all', label: t('admin.mobile_center.send_all'), icon: Users },
    { value: 'dept', label: t('admin.mobile_center.send_to_dept'), icon: Building2 },
    { value: 'student', label: t('admin.mobile_center.send_to_student'), icon: User },
  ];

  const sendLabel =
    target === 'dept'
      ? t('admin.mobile_center.send_to_dept')
      : target === 'student'
        ? t('admin.mobile_center.send_to_student')
        : t('admin.mobile_center.send_all');

  return (
    <PageContainer>
      <PageHeader
        icon={Smartphone}
        title={t('admin.mobile_center.title')}
        description={t('admin.mobile_center.description')}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Composition Panel */}
        <div className="space-y-6">
          <SectionCard
            title={t('admin.mobile_center.create_title')}
            header={
              <header className="flex items-center gap-2 border-b px-4 py-3">
                <MessageSquare className="size-4 text-primary" />
                <h2 className={cn('truncate text-sm font-medium text-foreground', isAr && 'font-arabic')}>
                  {t('admin.mobile_center.create_title')}
                </h2>
              </header>
            }
            bodyClassName="space-y-5"
          >
            <FormField label={t('admin.mobile_center.field_title')} htmlFor="alertTitle" required>
              <Input
                id="alertTitle"
                type="text"
                placeholder={t('admin.mobile_center.placeholder_title')}
                value={alertForm.title}
                onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })}
              />
            </FormField>

            <FormField label={t('admin.mobile_center.field_message')} htmlFor="alertContent" required>
              <Textarea
                id="alertContent"
                rows={4}
                placeholder={t('admin.mobile_center.placeholder_message')}
                value={alertForm.content}
                onChange={(e) => setAlertForm({ ...alertForm, content: e.target.value })}
                className="min-h-[120px] resize-none"
              />
            </FormField>

            <div className="space-y-3 border-t pt-5">
              <FormField label={t('admin.mobile_center.send_to')}>
                <SegmentedTabs
                  value={target}
                  onChange={setTarget}
                  options={targetOptions}
                  size="sm"
                  className="flex-wrap"
                />
              </FormField>

              <AnimatePresence mode="wait" initial={false}>
                {target === 'dept' && (
                  <motion.div
                    key="dept"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                  >
                    <FormField label={t('admin.mobile_center.send_to_dept')}>
                      <Select
                        value={alertForm.department_id || ''}
                        onValueChange={(value) => setAlertForm({ ...alertForm, department_id: value })}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t('admin.mobile_center.placeholder_dept')} />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={String(dept.id)}>
                              {dept.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                  </motion.div>
                )}

                {target === 'student' && (
                  <motion.div
                    key="student"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                  >
                    <FormField label={t('admin.mobile_center.send_to_student')} htmlFor="alertStudentId">
                      <Input
                        id="alertStudentId"
                        type="text"
                        placeholder={t('admin.mobile_center.placeholder_student_id')}
                        value={alertForm.studentId || ''}
                        onChange={(e) => setAlertForm({ ...alertForm, studentId: e.target.value })}
                      />
                    </FormField>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                onClick={() => handleSendPush(target)}
                disabled={sending}
                size="lg"
                className="w-full"
              >
                <Send className="size-4" />
                <span className={isAr ? 'font-arabic' : undefined}>
                  {sending ? t('admin.mobile_center.sending') : sendLabel}
                </span>
              </Button>
            </div>
          </SectionCard>

          {/* Note */}
          <SectionCard bodyClassName="flex items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border bg-primary/10 text-primary">
              <AlertCircle className="size-4" />
            </span>
            <div className="min-w-0 space-y-0.5">
              <h4 className={cn('text-sm font-medium text-foreground', isAr && 'font-arabic')}>
                {t('admin.mobile_center.note_title')}
              </h4>
              <p className="text-xs leading-relaxed text-muted-foreground">{t('admin.mobile_center.note_content')}</p>
            </div>
          </SectionCard>
        </div>

        {/* History Log */}
        <SectionCard
          header={
            <header className="flex items-center justify-between gap-3 border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <History className="size-4 text-muted-foreground" />
                <h2 className={cn('truncate text-sm font-medium text-foreground', isAr && 'font-arabic')}>
                  {t('admin.mobile_center.history_title')}
                </h2>
              </div>
              <StatusBadge variant="neutral">
                {t('admin.mobile_center.sent_count', { count: mobileHistory.length })}
              </StatusBadge>
            </header>
          }
          bodyClassName="p-0"
        >
          {mobileHistory.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={Bell}
                title={t('admin.mobile_center.no_history')}
              />
            </div>
          ) : (
            <div className="max-h-[640px] divide-y overflow-y-auto">
              <AnimatePresence initial={false}>
                {mobileHistory.map((notif) => (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="group/item flex items-start justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                        <h4 className={cn('truncate text-sm font-medium text-foreground', isAr && 'font-arabic')}>
                          {notif.title}
                        </h4>
                      </div>
                      <p className="ps-3.5 text-sm leading-relaxed text-muted-foreground">{notif.content}</p>
                      <div className="flex flex-wrap items-center gap-3 ps-3.5 pt-0.5">
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3" />
                          {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="size-3" />
                          {new Date(notif.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(notif.id)}
                      aria-label={t('admin.mobile_center.delete_confirm')}
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </SectionCard>
      </div>
    </PageContainer>
  );
};

export default MobileAlertCenter;
