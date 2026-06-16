import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen, Plus, Edit3, Trash2, Video, FileText,
  Mic, PlayCircle, Link as LinkIcon, Download,
  ExternalLink, Upload, Share2, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  SectionCard, DataTable, Modal, FormField, EmptyState, LoadingState,
  SearchInput, Toolbar, StatusBadge,
} from '@/components/common';

const TYPE_CONFIG = {
  video: { icon: Video, label: 'Lecture' },
  pdf: { icon: FileText, label: 'Document' },
  recording: { icon: Mic, label: 'Audio' },
  playlist: { icon: PlayCircle, label: 'Playlist' },
  default: { icon: LinkIcon, label: 'Reference' },
};

const getTypeConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.default;

const DoctorResourceManager = ({ courses }) => {
  const { doctorApi } = useDoctorAuth();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [resources, setResources] = useState([]);
  const [editingResource, setEditingResource] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ type: 'video', title: '', url: '', batch: 2025 });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [recordingFile, setRecordingFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (selectedCourseId) {
      fetchResources();
    } else {
      setResources([]);
    }
  }, [selectedCourseId]);

  const fetchResources = async () => {
    setFetchLoading(true);
    try {
      const res = await doctorApi('get', `/doctor/resources/${selectedCourseId}`);
      setResources(res.data);
    } catch (err) {
      toast.error('Failed to load library');
    } finally {
      setFetchLoading(false);
    }
  };

  const convertToEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('/embed/')) return url;
    const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:[&?]|$)/);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
    return url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) return toast.error('Select a course first');
    if (!formData.title.trim()) return toast.error('Title is required');

    setLoading(true);
    try {
      let finalUrl = formData.url;

      if (formData.type === 'video') {
        finalUrl = convertToEmbedUrl(formData.url);
      } else if (formData.type === 'recording' && recordingFile) {
        const fileName = `${Date.now()}-${recordingFile.name}`;
        const { data, error } = await supabase.storage
          .from('course-recordings')
          .upload(fileName, recordingFile, { cacheControl: '3600', upsert: false });

        if (error) throw error;
        const { data: publicUrlData } = supabase.storage
          .from('course-recordings')
          .getPublicUrl(fileName);
        finalUrl = publicUrlData.publicUrl;
      }

      const payload = { ...formData, url: finalUrl, courseId: selectedCourseId };

      if (editingResource) {
        await doctorApi('put', `/doctor/resources/${editingResource.id}`, payload);
        toast.success('Material updated');
      } else {
        await doctorApi('post', '/doctor/resources', payload);
        toast.success('Material published');
      }
      resetForm();
      fetchResources();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save resource');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this material?')) return;
    try {
      await doctorApi('delete', `/doctor/resources/${id}`);
      toast.success('Material deleted');
      fetchResources();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const resetForm = () => {
    setEditingResource(null);
    setShowForm(false);
    setFormData({ type: 'video', title: '', url: '', batch: 2025 });
    setRecordingFile(null);
  };

  const startEdit = (r) => {
    setEditingResource(r);
    setShowForm(true);
    setFormData({ type: r.type, title: r.title, url: r.url, batch: r.batch || 2025 });
    setRecordingFile(null);
  };

  const filteredResources = resources.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  const columns = [
    {
      key: 'title',
      header: 'Material',
      render: (r) => {
        const { icon: Icon, label } = getTypeConfig(r.type);
        return (
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
              <Icon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{r.title}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'batch',
      header: 'Batch',
      render: (r) => <StatusBadge variant="neutral">Batch {r.batch || 2025}</StatusBadge>,
    },
    {
      key: 'created_at',
      header: 'Published',
      headClassName: 'hidden md:table-cell',
      cellClassName: 'hidden md:table-cell text-xs text-muted-foreground',
      render: (r) => new Date(r.created_at).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: '',
      headClassName: 'text-end',
      cellClassName: 'text-end',
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            asChild
            className="text-muted-foreground hover:text-foreground"
            title={r.type === 'recording' ? 'Download' : 'View'}
          >
            <a href={r.url} target="_blank" rel="noreferrer">
              {r.type === 'recording' ? <Download className="size-4" /> : <ExternalLink className="size-4" />}
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
            title="Copy link"
            onClick={() => {
              navigator.clipboard.writeText(r.url);
              toast.success('Link copied to clipboard');
            }}
          >
            <Share2 className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
            title="Edit"
            onClick={() => startEdit(r)}
          >
            <Edit3 className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive"
            title="Delete"
            onClick={() => handleDelete(r.id)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
            <FolderOpen className="size-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Library Hub</h2>
            <p className="text-sm text-muted-foreground">
              Distribute lectures, documents, and materials to your students.
            </p>
          </div>
        </div>
        {selectedCourseId && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="size-4" />
            <span>Publish</span>
          </Button>
        )}
      </div>

      {/* Course Selection */}
      <SectionCard title="Course" description="Select a course to manage its materials.">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((course) => {
            const isActive = selectedCourseId === course.id;
            return (
              <button
                key={course.id}
                onClick={() => setSelectedCourseId(course.id)}
                className={`flex items-center gap-3 rounded-lg border p-3 text-start transition-colors
                  ${isActive
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-border bg-card hover:bg-muted/50'}
                `}
              >
                <span className={`flex size-9 shrink-0 items-center justify-center rounded-md border
                  ${isActive ? 'border-primary/20 bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}
                >
                  <BookOpen className="size-4" />
                </span>
                <div className="min-w-0">
                  <h4 className={`truncate text-sm font-medium ${isActive ? 'text-foreground' : 'text-foreground'}`}>{course.name}</h4>
                  <p className="text-xs text-muted-foreground">{course.code}</p>
                </div>
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {!selectedCourseId ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <EmptyState
              icon={FolderOpen}
              title="Select a Course"
              description="Choose a course from the list above to start organizing its academic resources."
            />
          </motion.div>
        ) : (
          <motion.div
            key={selectedCourseId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <SectionCard
              title={selectedCourse ? selectedCourse.name : 'Materials'}
              description={`${filteredResources.length} ${filteredResources.length === 1 ? 'item' : 'items'}`}
              bodyClassName="space-y-4"
            >
              <Toolbar>
                <SearchInput
                  placeholder="Find resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="size-4" />
                  <span>Publish</span>
                </Button>
              </Toolbar>

              {fetchLoading ? (
                <LoadingState />
              ) : (
                <DataTable
                  columns={columns}
                  rows={filteredResources}
                  getRowKey={(r) => r.id}
                  empty={
                    <EmptyState
                      icon={Upload}
                      title={searchQuery ? 'No matching materials' : 'Library is Empty'}
                      description={
                        searchQuery
                          ? 'Try a different search term.'
                          : 'Ready to share knowledge? Upload your first lecture or document.'
                      }
                      action={
                        !searchQuery ? (
                          <Button onClick={() => setShowForm(true)}>
                            <Plus className="size-4" />
                            <span>Enroll Material</span>
                          </Button>
                        ) : null
                      }
                    />
                  }
                />
              )}
            </SectionCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Modal */}
      <Modal
        open={showForm}
        onOpenChange={(o) => { if (!o) resetForm(); }}
        title={editingResource ? 'Edit Material' : 'New Publication'}
        description="Publish new teaching materials or references to the course library."
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit" form="resource-form" disabled={loading}>
              {loading
                ? (editingResource ? 'Updating...' : 'Publishing...')
                : (editingResource ? 'Update Publication' : 'Publish to Library')}
            </Button>
          </div>
        }
      >
        <form id="resource-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Type" htmlFor="resource-type">
              <Select
                value={formData.type}
                onValueChange={(value) => { setFormData({ ...formData, type: value }); setRecordingFile(null); }}
              >
                <SelectTrigger id="resource-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Lecture Video</SelectItem>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="recording">Audio Clip</SelectItem>
                  <SelectItem value="playlist">Study Playlist</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Target Batch" htmlFor="resource-batch">
              <Select
                value={String(formData.batch)}
                onValueChange={(value) => setFormData({ ...formData, batch: parseInt(value, 10) })}
              >
                <SelectTrigger id="resource-batch" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2026, 2025, 2024, 2023].map((yr) => (
                    <SelectItem key={yr} value={String(yr)}>Batch {yr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <FormField label="Title" htmlFor="resource-title" required>
            <Input
              id="resource-title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Chapter 1 Intro"
            />
          </FormField>

          {formData.type === 'recording' ? (
            <FormField label="Upload File" hint="Supports MP3, WAV, AAC">
              <div>
                <input
                  type="file"
                  accept="audio/*,video/*"
                  onChange={(e) => setRecordingFile(e.target.files[0])}
                  className="hidden"
                  id="audio-upload"
                  required={!editingResource}
                />
                <label
                  htmlFor="audio-upload"
                  className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-8 px-4 text-center transition-colors hover:bg-muted/50"
                >
                  <span className="flex size-10 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                    <Upload className="size-5" />
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {recordingFile ? recordingFile.name : 'Choose Audio File'}
                  </span>
                </label>
              </div>
            </FormField>
          ) : (
            <FormField label="External Resource URL" htmlFor="resource-url" required>
              <div className="relative">
                <LinkIcon className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="resource-url"
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://cloud-storage.com/resource"
                  className="ps-9"
                />
              </div>
            </FormField>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default DoctorResourceManager;
