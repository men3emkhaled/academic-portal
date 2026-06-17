import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FolderOpen, Plus, Edit3, Trash2, Video,
  FileText, Mic, Link as LinkIcon, PlayCircle,
  Layers, BookOpen, ExternalLink, Download,
} from 'lucide-react';
import {
  PageContainer,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  EmptyState,
  SegmentedTabs,
  DataTable,
  FormField,
  Modal,
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

const convertToEmbedUrl = (url) => {
  if (!url) return '';
  if (url.includes('/embed/')) return url;
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:[&?]|$)/);
  if (match) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return url;
};

const ResourceManager = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [allCourses, setAllCourses] = useState([]);
  const [selectedCourseName, setSelectedCourseName] = useState('');
  const [resources, setResources] = useState([]);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({ type: 'video', title: '', url: '', batch: 2025 });
  const [loading, setLoading] = useState(false);
  const [recordingFile, setRecordingFile] = useState(null);
  const [activeTab, setActiveTab] = useState('video');
  const [showForm, setShowForm] = useState(false);

  const uniqueCourses = useMemo(() => {
    const map = new Map();
    allCourses.forEach(course => {
      if (!map.has(course.name)) {
        map.set(course.name, course.id);
      }
    });
    return Array.from(map.entries()).map(([name, id]) => ({ name, id }));
  }, [allCourses]);

  const tabIcons = {
    video: Video,
    recording: Mic,
    pdf: FileText,
    summary: BookOpen,
    playlist: PlayCircle,
  };

  const filteredResources = useMemo(() => {
    return resources.filter(r => r.type === activeTab);
  }, [resources, activeTab]);

  const getTabCount = (tabId) => {
    return resources.filter(r => r.type === tabId).length;
  };

  const tabOptions = useMemo(() => ([
    { value: 'video', label: t('admin.resources.types.video'), icon: Video, count: getTabCount('video') },
    { value: 'recording', label: t('admin.resources.types.recording'), icon: Mic, count: getTabCount('recording') },
    { value: 'pdf', label: t('admin.resources.types.pdf'), icon: FileText, count: getTabCount('pdf') },
    { value: 'summary', label: t('admin.resources.types.summary'), icon: BookOpen, count: getTabCount('summary') },
    { value: 'playlist', label: t('admin.resources.types.playlist'), icon: PlayCircle, count: getTabCount('playlist') },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ]), [resources, t]);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseName) {
      fetchResources();
    }
  }, [selectedCourseName]);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setAllCourses(res.data);
    } catch (err) {
      toast.error(t('admin.messages.load_courses_failed'));
    }
  };

  const fetchResources = async () => {
    const selectedCourse = uniqueCourses.find(c => c.name === selectedCourseName);
    if (!selectedCourse) return;
    try {
      const res = await api.get(`/resources/course/${selectedCourse.id}`);
      setResources(res.data);
    } catch (err) {
      toast.error(t('admin.messages.load_resources_failed'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error(t('admin.messages.title_req'));
      return;
    }
    if (formData.type === 'recording' && !recordingFile && !editingResource) {
      toast.error(t('admin.messages.file_req'));
      return;
    }
    if (formData.type !== 'recording' && !formData.url.trim()) {
      toast.error(t('admin.messages.url_req'));
      return;
    }
    if (!selectedCourseName) {
      toast.error(t('admin.messages.select_course_req'));
      return;
    }
    setLoading(true);
    try {
      let finalUrl = formData.url;

      if (formData.type === 'video') {
        finalUrl = convertToEmbedUrl(formData.url);
      } else if (formData.type === 'recording') {
        if (recordingFile) {
          const fileName = `${Date.now()}-${recordingFile.name}`;
          const { data, error } = await supabase.storage
            .from('course-recordings')
            .upload(fileName, recordingFile, {
              cacheControl: '3600',
              upsert: false
            });

          if (error) throw error;

          const { data: publicUrlData } = supabase.storage
            .from('course-recordings')
            .getPublicUrl(fileName);
          finalUrl = publicUrlData.publicUrl;
        } else {
          finalUrl = formData.url;
        }
      }

      const selectedCourse = uniqueCourses.find(c => c.name === selectedCourseName);
      const payload = { ...formData, url: finalUrl, courseId: selectedCourse.id };

      if (editingResource) {
        await api.put(`/resources/${editingResource.id}`, payload);
        toast.success(t('common.success'));
      } else {
        await api.post('/resources', payload);
        toast.success(t('common.success'));
      }
      resetForm();
      fetchResources();
    } catch (err) {
      toast.error(err.response?.data?.message || t('admin.messages.save_resource_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirm_delete'))) return;
    try {
      await api.delete(`/resources/${id}`);
      toast.success(t('common.success'));
      fetchResources();
    } catch (err) {
      toast.error(t('admin.messages.delete_resource_failed'));
    }
  };

  const startEdit = (resource) => {
    setEditingResource(resource);
    setFormData({
      type: resource.type,
      title: resource.title,
      url: resource.url,
      batch: resource.batch || 2025
    });
    setRecordingFile(null);
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingResource(null);
    setFormData({ type: 'video', title: '', url: '', batch: 2025 });
    setRecordingFile(null);
  };

  const openNewForm = () => {
    if (!selectedCourseName) {
      toast.error(t('admin.messages.select_course_req'));
      return;
    }
    setShowForm(true);
  };

  const TypeIcon = tabIcons[activeTab] || LinkIcon;

  const columns = [
    {
      key: 'title',
      header: t('admin.resources.modals.resource_title'),
      cellClassName: 'font-medium text-foreground',
      render: (row) => {
        const RowIcon = tabIcons[row.type] || LinkIcon;
        return (
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
              <RowIcon className="size-4" />
            </span>
            <span className="truncate">{row.title}</span>
          </div>
        );
      },
    },
    {
      key: 'batch',
      header: isAr ? 'العام الدراسي' : 'Academic Year',
      headClassName: 'hidden sm:table-cell',
      cellClassName: 'hidden sm:table-cell',
      render: (row) => (
        <StatusBadge variant="neutral">
          {isAr ? `عام ${row.batch || 2025}` : `Year ${row.batch || 2025}`}
        </StatusBadge>
      ),
    },
    {
      key: 'link',
      header: t('admin.resources.modals.resource_url'),
      headClassName: 'hidden md:table-cell',
      cellClassName: 'hidden md:table-cell',
      render: (row) => (
        <a
          href={row.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          {row.type === 'recording' ? <Download className="size-3.5" /> : <ExternalLink className="size-3.5" />}
          <span>{row.type === 'recording' ? t('admin.resources.modals.download') : t('admin.resources.modals.open_link')}</span>
        </a>
      ),
    },
    {
      key: 'actions',
      header: '',
      headClassName: 'w-24',
      cellClassName: 'w-24',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => startEdit(row)}
            aria-label={t('common.edit')}
          >
            <Edit3 className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleDelete(row.id)}
            aria-label={t('common.delete')}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  const emptyContent = !selectedCourseName ? (
    <EmptyState
      icon={BookOpen}
      title={t('admin.resources.course_hint')}
      description={t('admin.resources.awaiting_auth')}
    />
  ) : (
    <EmptyState
      icon={TypeIcon}
      title={t('admin.resources.no_resources')}
      action={
        <Button onClick={openNewForm}>
          <Plus className="size-4" />
          {t('admin.resources.modals.new_resource')}
        </Button>
      }
    />
  );

  return (
    <PageContainer>
      <PageHeader
        icon={FolderOpen}
        title={t('admin.resources.title')}
        description={t('admin.resources.node_definition')}
        actions={
          <Button onClick={openNewForm}>
            <Plus className="size-4" />
            {t('admin.resources.modals.new_resource')}
          </Button>
        }
      />

      {/* Top row: course selector + stored-units metric */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SectionCard
          title={t('admin.resources.select_course')}
          className="sm:col-span-2"
          bodyClassName="p-4"
        >
          <Select value={selectedCourseName} onValueChange={setSelectedCourseName}>
            <SelectTrigger className="w-full sm:w-80" dir={isAr ? 'rtl' : 'ltr'}>
              <SelectValue placeholder={`-- ${t('admin.resources.select_course')} --`} />
            </SelectTrigger>
            <SelectContent>
              {uniqueCourses.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  {t('admin.messages.load_courses_failed')}
                </div>
              ) : (
                uniqueCourses.map(c => (
                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </SectionCard>

        <StatCard
          label={t('admin.resources.stored_units')}
          value={resources.length}
          icon={Layers}
          hint={t('admin.resources.archive_active')}
          accent
        />
      </div>

      {/* Registry */}
      <SectionCard
        title={t('admin.resources.saved_registry')}
        header={
          selectedCourseName ? (
            <header className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-medium text-foreground">
                {t('admin.resources.saved_registry')}
              </h2>
              <div className="-mx-1 overflow-x-auto px-1">
                <SegmentedTabs
                  value={activeTab}
                  onChange={setActiveTab}
                  options={tabOptions}
                  size="sm"
                />
              </div>
            </header>
          ) : (
            <header className="flex items-center justify-between gap-3 border-b px-4 py-3">
              <h2 className="text-sm font-medium text-foreground">
                {t('admin.resources.saved_registry')}
              </h2>
            </header>
          )
        }
        bodyClassName="p-0 sm:p-3"
      >
        {/* Inline video previews for the video tab; dense table for everything else */}
        {selectedCourseName && activeTab === 'video' && filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 p-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredResources.map((item) => (
              <div
                key={item.id}
                className="flex flex-col overflow-hidden rounded-lg border bg-card"
              >
                <div className="relative aspect-video w-full bg-muted">
                  <iframe
                    src={convertToEmbedUrl(item.url)}
                    title={item.title}
                    className="h-full w-full border-none"
                  />
                </div>
                <div className="flex items-start justify-between gap-2 p-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-medium text-foreground">{item.title}</h3>
                    <StatusBadge variant="neutral" className="mt-1.5">
                      {isAr ? `عام ${item.batch || 2025}` : `Year ${item.batch || 2025}`}
                    </StatusBadge>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => startEdit(item)}
                      aria-label={t('common.edit')}
                    >
                      <Edit3 className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(item.id)}
                      aria-label={t('common.delete')}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={selectedCourseName ? filteredResources : []}
            getRowKey={(row) => row.id}
            empty={emptyContent}
            className="border-0 sm:border"
          />
        )}
      </SectionCard>

      {/* Create / edit modal */}
      <Modal
        open={showForm}
        onOpenChange={(open) => { if (!open) resetForm(); }}
        size="lg"
        title={editingResource ? t('admin.resources.modals.edit_resource') : t('admin.resources.modals.new_resource')}
        description={t('admin.resources.node_definition')}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={resetForm} disabled={loading}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" form="resource-form" disabled={loading}>
              {loading ? t('admin.courses.saving') : (editingResource ? t('common.save') : t('admin.resources.modals.new_resource'))}
            </Button>
          </>
        }
      >
        <AnimatePresence mode="wait">
          <motion.form
            key={editingResource ? `edit-${editingResource.id}` : 'create'}
            id="resource-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <FormField label={t('admin.resources.modals.resource_type')}>
              <Select
                value={formData.type}
                onValueChange={(value) => {
                  setFormData({ ...formData, type: value });
                  setRecordingFile(null);
                }}
              >
                <SelectTrigger className="w-full" dir={isAr ? 'rtl' : 'ltr'}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">{t('admin.resources.types.video')}</SelectItem>
                  <SelectItem value="pdf">{t('admin.resources.types.pdf')}</SelectItem>
                  <SelectItem value="summary">{t('admin.resources.types.summary')}</SelectItem>
                  <SelectItem value="playlist">{t('admin.resources.types.playlist')}</SelectItem>
                  <SelectItem value="recording">{t('admin.resources.types.recording')}</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label={isAr ? 'العام الدراسي المستهدف' : 'Target Academic Year'}>
              <Select
                value={String(formData.batch)}
                onValueChange={(value) => setFormData({ ...formData, batch: parseInt(value, 10) })}
              >
                <SelectTrigger className="w-full" dir={isAr ? 'rtl' : 'ltr'}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2026, 2025, 2024, 2023].map(yr => (
                    <SelectItem key={yr} value={String(yr)}>
                      {isAr ? `عام ${yr}` : `Academic Year ${yr}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              label={t('admin.resources.modals.resource_title')}
              htmlFor="resource-title"
              required
              className="sm:col-span-2"
            >
              <Input
                id="resource-title"
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder={t('admin.resources.placeholder_title')}
                required
              />
            </FormField>

            {formData.type === 'recording' ? (
              <FormField
                label={t('admin.resources.modals.upload_file')}
                hint={t('admin.resources.binary_protocol')}
                className="sm:col-span-2"
              >
                <label
                  className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 p-6 transition-colors hover:border-primary/50 hover:bg-muted/50 ${loading ? 'pointer-events-none opacity-50' : ''}`}
                >
                  <span className="flex size-10 items-center justify-center rounded-lg border bg-card text-primary">
                    <Mic className="size-5" />
                  </span>
                  <span className="break-all px-2 text-center text-sm font-medium text-foreground">
                    {recordingFile
                      ? recordingFile.name
                      : (editingResource ? t('admin.resources.archive_locked') : t('admin.resources.modals.upload_hint'))}
                  </span>
                  <input
                    type="file"
                    accept="audio/*,video/*"
                    onChange={(e) => setRecordingFile(e.target.files[0])}
                    className="sr-only"
                    required={!editingResource}
                  />
                </label>
              </FormField>
            ) : (
              <FormField
                label={t('admin.resources.modals.resource_url')}
                htmlFor="resource-url"
                required
                className="sm:col-span-2"
              >
                <Input
                  id="resource-url"
                  type="url"
                  value={formData.url}
                  onChange={e => setFormData({ ...formData, url: e.target.value })}
                  placeholder={formData.type === 'video' ? 'https://youtube.com/...' : 'https://example.com/file.pdf'}
                  required
                />
              </FormField>
            )}
          </motion.form>
        </AnimatePresence>
      </Modal>
    </PageContainer>
  );
};

export default ResourceManager;
