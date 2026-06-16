import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  Bell, Send, User, Building2,
  Link as LinkIcon, Image as ImageIcon, Edit3,
  Trash2, History, Mail, Globe,
  Clock, Calendar,
  GraduationCap, Hash, ExternalLink, Image as ImageLucide
} from 'lucide-react';
import {
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  EmptyState,
  FormField,
  Modal,
  SegmentedTabs,
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
import { Switch } from '@/components/ui/switch';

const NotificationsManager = ({
  notifications,
  fetchNotifications,
  sending,
  setSending,
  notificationForm,
  setNotificationForm,
  handleUpdateNotification,
  handleDeleteNotification,
  showEditModal,
  setShowEditModal,
  editingNotification,
  setEditingNotification,
  editNotifForm,
  setEditNotifForm,
  departments = []
}) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [activeTab, setActiveTab] = useState('all-students');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [linkData, setLinkData] = useState({ text: '', url: '' });
  const [imageData, setImageData] = useState({ alt: '', url: '' });

  const tabs = [
    { value: 'all-students', label: t('admin.notifications.tabs.all_students'), icon: Globe },
    { value: 'all-doctors', label: t('admin.notifications.tabs.all_doctors'), icon: GraduationCap },
    { value: 'department', label: t('admin.notifications.tabs.department'), icon: Building2 },
    { value: 'student', label: t('admin.notifications.tabs.student'), icon: User },
    { value: 'doctor', label: t('admin.notifications.tabs.doctor'), icon: User },
  ];

  const insertMarkdown = (markdown) => {
    const textareaId = `notification_content`;
    const textarea = document.getElementById(textareaId);
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const newText = before + markdown + after;

    setNotificationForm(prev => ({ ...prev, content: newText }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + markdown.length, start + markdown.length);
    }, 50);
  };

  const handleInsertLink = () => {
    if (!linkData.url) { toast.error(t('admin.messages.url_req')); return; }
    const markdown = `[${linkData.text || linkData.url}](${linkData.url})`;
    insertMarkdown(markdown);
    setShowLinkModal(false);
    setLinkData({ text: '', url: '' });
  };

  const handleInsertImage = () => {
    if (!imageData.url) { toast.error(t('admin.messages.img_url_req')); return; }
    const markdown = `![${imageData.alt || 'image'}](${imageData.url})`;
    insertMarkdown(markdown);
    setShowImageModal(false);
    setImageData({ alt: '', url: '' });
  };

  const renderContent = (content) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`}>{content.substring(lastIndex, match.index)}</span>);
      }
      parts.push(
        <a key={`link-${match.index}`} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
          {match[1]} <ExternalLink className="size-3" />
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }
    if (lastIndex < content.length) {
      parts.push(<span key={`text-${lastIndex}`}>{content.substring(lastIndex)}</span>);
    }
    return parts.length > 0 ? parts : content;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!notificationForm.title || !notificationForm.content) {
      toast.error(t('admin.messages.title_msg_req'));
      return;
    }

    setSending(true);
    try {
      let endpoint = '';
      let payload = { title: notificationForm.title, content: notificationForm.content };

      if (activeTab === 'all-students') endpoint = '/notifications/admin/send-to-all';
      else if (activeTab === 'all-doctors') endpoint = '/notifications/admin/send-to-all-doctors';
      else if (activeTab === 'department') {
        if (!notificationForm.department_id) { toast.error(t('admin.messages.select_dept_req')); setSending(false); return; }
        endpoint = '/notifications/admin/send-to-department';
        payload.department_id = notificationForm.department_id;
      } else if (activeTab === 'student') {
        if (!notificationForm.studentId) { toast.error(t('admin.messages.student_id_req')); setSending(false); return; }
        endpoint = '/notifications/admin/send-to-student';
        payload.studentId = notificationForm.studentId;
      } else if (activeTab === 'doctor') {
        if (!notificationForm.doctorId) { toast.error(t('admin.messages.doctor_id_req')); setSending(false); return; }
        endpoint = '/notifications/admin/send-to-doctor';
        payload.doctorId = notificationForm.doctorId;
      }

      await api.post(endpoint, payload);
      toast.success(t('common.success'));
      setNotificationForm({ studentId: '', doctorId: '', department_id: '', title: '', content: '' });
      fetchNotifications();
    } catch (error) {
      toast.error(t('admin.messages.notif_send_failed'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 text-start">
      {/* Header */}
      <PageHeader
        icon={Bell}
        title={t('admin.notifications.title')}
        description={t('admin.notifications.description')}
        actions={
          <StatCard
            label={t('admin.notifications.composition.transmitted_packets')}
            value={notifications.length}
            icon={Bell}
            accent
            className="min-w-[180px]"
          />
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Composition Panel */}
        <div className="xl:col-span-5">
          <SectionCard title={t('admin.notifications.title')} bodyClassName="space-y-5">
            {/* Target segments */}
            <SegmentedTabs
              value={activeTab}
              onChange={setActiveTab}
              options={tabs}
              size="sm"
              className="flex w-full flex-wrap"
            />

            <form onSubmit={handleSend} className="space-y-4">
              <FormField
                label={t('admin.notifications.composition.title_label')}
                htmlFor="notification_title"
                required
              >
                <Textarea
                  id="notification_title"
                  rows={1}
                  placeholder={t('admin.notifications.composition.title_placeholder')}
                  value={notificationForm.title}
                  onChange={(e) => {
                    setNotificationForm({ ...notificationForm, title: e.target.value });
                    e.target.style.height = 'auto';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                  className="min-h-9 resize-none overflow-hidden"
                  required
                />
              </FormField>

              {activeTab === 'department' && (
                <FormField
                  label={t('admin.notifications.composition.dept_label')}
                  required
                >
                  <Select
                    value={notificationForm.department_id || ''}
                    onValueChange={(value) => setNotificationForm({ ...notificationForm, department_id: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('admin.notifications.composition.dept_placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={String(dept.id)}>
                          {dept.name} ({dept.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              )}

              {activeTab === 'student' && (
                <FormField
                  label={t('admin.notifications.composition.student_id_label')}
                  htmlFor="notification_student_id"
                  required
                >
                  <div className="relative">
                    <Hash className="pointer-events-none absolute inset-inline-start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="notification_student_id"
                      type="text"
                      placeholder={t('admin.notifications.composition.student_id_placeholder') || 'e.g. 2024001'}
                      value={notificationForm.studentId || ''}
                      onChange={(e) => setNotificationForm({ ...notificationForm, studentId: e.target.value })}
                      className="ps-8"
                      required
                    />
                  </div>
                </FormField>
              )}

              {activeTab === 'doctor' && (
                <FormField
                  label={t('admin.notifications.composition.doctor_id_label')}
                  htmlFor="notification_doctor_id"
                  required
                >
                  <div className="relative">
                    <Hash className="pointer-events-none absolute inset-inline-start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="notification_doctor_id"
                      type="text"
                      placeholder={t('admin.notifications.composition.doctor_id_placeholder') || 'e.g. DOC001'}
                      value={notificationForm.doctorId || ''}
                      onChange={(e) => setNotificationForm({ ...notificationForm, doctorId: e.target.value })}
                      className="ps-8"
                      required
                    />
                  </div>
                </FormField>
              )}

              <FormField
                label={t('admin.notifications.composition.message_label')}
                htmlFor="notification_content"
                required
              >
                <div className="mb-2 flex items-center justify-end gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setShowLinkModal(true)}
                    aria-label={t('admin.notifications.modals.insert_link')}
                  >
                    <LinkIcon className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setShowImageModal(true)}
                    aria-label={t('admin.notifications.modals.insert_image')}
                  >
                    <ImageIcon className="size-4" />
                  </Button>
                </div>
                <Textarea
                  id="notification_content"
                  placeholder={t('admin.notifications.composition.message_placeholder')}
                  rows="6"
                  value={notificationForm.content}
                  onChange={(e) => setNotificationForm({ ...notificationForm, content: e.target.value })}
                  className="min-h-40 resize-none"
                  required
                />
              </FormField>

              <Button type="submit" disabled={sending} className="w-full" size="lg">
                <Send className="size-4" />
                {sending
                  ? t('admin.notifications.composition.distributing')
                  : t('admin.notifications.composition.send_button')}
              </Button>
            </form>
          </SectionCard>
        </div>

        {/* History Panel */}
        <div className="xl:col-span-7">
          <SectionCard
            title={t('admin.notifications.history.title')}
            description={t('admin.notifications.history.messages_count', { count: notifications.length })}
            bodyClassName="p-0"
          >
            <div className="custom-scrollbar max-h-[700px] divide-y divide-border overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4">
                  <EmptyState
                    icon={Mail}
                    title={t('admin.notifications.history.no_history')}
                  />
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="group/item flex items-start justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="truncate text-sm font-medium text-foreground">{notif.title}</h4>
                        {notif.doctor_name ? (
                          <StatusBadge variant="neutral">
                            {t('admin.notifications.history.doctor_prefix')}{notif.doctor_id}
                          </StatusBadge>
                        ) : notif.student_name ? (
                          <StatusBadge variant="neutral">
                            {t('admin.notifications.history.student_prefix')}{notif.student_id}
                          </StatusBadge>
                        ) : notif.department_name ? (
                          <StatusBadge variant="neutral">{notif.department_name}</StatusBadge>
                        ) : (
                          <StatusBadge variant="accent">{t('admin.notifications.history.global')}</StatusBadge>
                        )}
                        <StatusBadge variant={notif.is_read ? 'neutral' : 'warning'}>
                          {notif.is_read ? t('admin.notifications.history.read') : t('admin.notifications.history.unread')}
                        </StatusBadge>
                      </div>
                      <div className="rounded-lg border bg-muted/40 p-3 text-sm leading-relaxed text-muted-foreground">
                        {renderContent(notif.content)}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="size-3.5" />
                          {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="size-3.5" />
                          {new Date(notif.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col gap-1 opacity-0 transition-opacity group-hover/item:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          setEditingNotification(notif);
                          setEditNotifForm({ title: notif.title, content: notif.content, is_read: notif.is_read });
                          setShowEditModal(true);
                        }}
                        aria-label={t('common.edit')}
                      >
                        <Edit3 className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDeleteNotification(notif.id)}
                        aria-label={t('common.delete')}
                        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Link Modal */}
      <Modal
        open={showLinkModal}
        onOpenChange={setShowLinkModal}
        title={t('admin.notifications.modals.insert_link')}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowLinkModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleInsertLink}>
              {t('admin.notifications.modals.insert_link_btn')}
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-start">
          <FormField label={t('admin.notifications.modals.link_text')} htmlFor="link_text">
            <Input
              id="link_text"
              type="text"
              value={linkData.text}
              onChange={(e) => setLinkData({ ...linkData, text: e.target.value })}
              placeholder={t('admin.notifications.modals.link_placeholder')}
            />
          </FormField>
          <FormField label={t('admin.notifications.modals.url')} htmlFor="link_url" required>
            <Input
              id="link_url"
              type="url"
              value={linkData.url}
              onChange={(e) => setLinkData({ ...linkData, url: e.target.value })}
              placeholder="https://..."
              required
            />
          </FormField>
        </div>
      </Modal>

      {/* Image Modal */}
      <Modal
        open={showImageModal}
        onOpenChange={setShowImageModal}
        title={t('admin.notifications.modals.insert_image')}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowImageModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleInsertImage}>
              {t('admin.notifications.modals.insert_image_btn')}
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-start">
          <FormField label={t('admin.notifications.modals.alt_text')} htmlFor="image_alt">
            <Input
              id="image_alt"
              type="text"
              value={imageData.alt}
              onChange={(e) => setImageData({ ...imageData, alt: e.target.value })}
              placeholder={t('admin.notifications.modals.img_placeholder')}
            />
          </FormField>
          <FormField label={t('admin.notifications.modals.image_url')} htmlFor="image_url" required>
            <Input
              id="image_url"
              type="url"
              value={imageData.url}
              onChange={(e) => setImageData({ ...imageData, url: e.target.value })}
              placeholder="https://..."
              required
            />
          </FormField>
        </div>
      </Modal>

      {/* Edit Modal */}
      {editingNotification && (
        <Modal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          title={t('admin.notifications.modals.edit_notification')}
          description={t('admin.notifications.modals.update_relay_params')}
          size="md"
          footer={
            <>
              <Button variant="secondary" type="button" onClick={() => setShowEditModal(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" form="edit-notification-form">
                {t('common.save')}
              </Button>
            </>
          }
        >
          <form id="edit-notification-form" onSubmit={handleUpdateNotification} className="space-y-4 text-start">
            <FormField
              label={t('admin.notifications.composition.title_label')}
              htmlFor="edit_notif_title"
              required
            >
              <Input
                id="edit_notif_title"
                type="text"
                value={editNotifForm.title}
                onChange={(e) => setEditNotifForm({ ...editNotifForm, title: e.target.value })}
                required
              />
            </FormField>
            <FormField
              label={t('admin.notifications.composition.message_label')}
              htmlFor="edit_notif_content"
              required
            >
              <Textarea
                id="edit_notif_content"
                rows="5"
                value={editNotifForm.content}
                onChange={(e) => setEditNotifForm({ ...editNotifForm, content: e.target.value })}
                className="min-h-32 resize-none"
                required
              />
            </FormField>
            <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2.5">
              <label htmlFor="edit_notif_read" className={`text-sm font-medium text-foreground ${isAr ? 'font-arabic' : ''}`}>
                {t('admin.notifications.modals.mark_as_read')}
              </label>
              <Switch
                id="edit_notif_read"
                checked={editNotifForm.is_read}
                onCheckedChange={(checked) => setEditNotifForm({ ...editNotifForm, is_read: checked })}
              />
            </div>
          </form>
        </Modal>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: hsl(var(--muted-foreground) / 0.35); }
      `}</style>
    </div>
  );
};

export default NotificationsManager;
