import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle, Circle, Plus, Trash2, Edit3, X,
  ChevronDown, ChevronUp, ListChecks,
  Activity, BookOpen, Save, LayoutGrid, Check
} from 'lucide-react';
import {
  PageHeader,
  SectionCard,
  StatCard,
  EmptyState,
  LoadingState,
  Spinner,
  SegmentedTabs,
  FormField,
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

const ProgressManager = ({ courses = [] }) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [progressItems, setProgressItems] = useState([]);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [allProgress, setAllProgress] = useState([]);
  const [viewMode, setViewMode] = useState('overview'); // 'overview' | 'manage'

  useEffect(() => {
    fetchAllProgress();
  }, []);

  const fetchAllProgress = async () => {
    try {
      const res = await api.get('/progress/admin/all');
      setAllProgress(res.data);
    } catch (error) {
      console.error('Error fetching all progress:', error);
    }
  };

  const fetchCourseProgress = async (courseId) => {
    if (!courseId) return;
    setLoading(true);
    try {
      const res = await api.get(`/progress/admin/course/${courseId}`);
      setProgressItems(res.data);
    } catch (error) {
      toast.error(t('admin.progress.messages.load_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = (courseId) => {
    setSelectedCourseId(courseId);
    if (courseId) {
      fetchCourseProgress(courseId);
      setViewMode('manage');
    } else {
      setProgressItems([]);
      setViewMode('overview');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemTitle.trim() || !selectedCourseId) return;

    setAdding(true);
    try {
      await api.post('/progress/admin', {
        course_id: parseInt(selectedCourseId),
        title: newItemTitle.trim(),
        is_completed: true
      });
      toast.success(t('admin.progress.messages.added'));
      setNewItemTitle('');
      fetchCourseProgress(selectedCourseId);
      fetchAllProgress();
    } catch (error) {
      toast.error(t('admin.progress.messages.add_failed'));
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/progress/admin/${id}/toggle`);
      if (selectedCourseId) {
        fetchCourseProgress(selectedCourseId);
      }
      fetchAllProgress();
    } catch (error) {
      toast.error(t('admin.progress.messages.update_failed'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.progress.messages.delete_confirm'))) return;
    try {
      await api.delete(`/progress/admin/${id}`);
      toast.success(t('admin.progress.messages.deleted'));
      if (selectedCourseId) {
        fetchCourseProgress(selectedCourseId);
      }
      fetchAllProgress();
    } catch (error) {
      toast.error(t('admin.progress.messages.delete_failed'));
    }
  };

  const handleEditSave = async (id) => {
    if (!editTitle.trim()) return;
    try {
      await api.put(`/progress/admin/${id}`, { title: editTitle.trim() });
      toast.success(t('admin.progress.messages.updated'));
      setEditingId(null);
      setEditTitle('');
      if (selectedCourseId) {
        fetchCourseProgress(selectedCourseId);
      }
      fetchAllProgress();
    } catch (error) {
      toast.error(t('admin.progress.messages.save_failed'));
    }
  };

  const groupedProgress = {};
  allProgress.forEach(item => {
    const key = item.course_name;
    if (!groupedProgress[key]) {
      groupedProgress[key] = {
        course_name: item.course_name,
        semester: item.semester,
        department_name: item.department_name,
        items: []
      };
    }
    groupedProgress[key].items.push(item);
  });

  const selectedCourse = courses.find(c => c.id === parseInt(selectedCourseId));
  const groupedEntries = Object.entries(groupedProgress);
  const completedAll = allProgress.filter(i => i.is_completed).length;

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        icon={Activity}
        title={t('admin.progress.title')}
        description={t('admin.progress.audit_trail')}
        actions={
          <SegmentedTabs
            value={viewMode}
            onChange={(v) => {
              setViewMode(v);
              if (v === 'overview') {
                setSelectedCourseId('');
                setProgressItems([]);
              }
            }}
            options={[
              { value: 'overview', label: t('admin.progress.overview_analytics'), icon: LayoutGrid },
              { value: 'manage', label: t('admin.progress.add_part'), icon: ListChecks },
            ]}
          />
        }
      />

      {/* Rollup metrics */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard
          label={t('admin.progress.total_parts', { count: allProgress.length })}
          value={allProgress.length}
          icon={ListChecks}
          accent
        />
        <StatCard
          label={t('admin.progress.status_authenticated')}
          value={completedAll}
          icon={CheckCircle}
        />
        <StatCard
          label={t('admin.progress.signals_tracked', { count: groupedEntries.length })}
          value={groupedEntries.length}
          icon={BookOpen}
        />
      </div>

      {/* Course selector */}
      <SectionCard
        title={t('admin.progress.select_node')}
        bodyClassName="p-4"
      >
        <FormField label={t('admin.progress.select_node')} htmlFor="progress-course-select">
          <Select value={selectedCourseId || undefined} onValueChange={handleCourseSelect}>
            <SelectTrigger id="progress-course-select" className="w-full">
              <SelectValue placeholder={t('admin.progress.overview_analytics')} />
            </SelectTrigger>
            <SelectContent>
              {courses.map(c => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name} ({t('admin.records.semester_label', { count: c.semester })}){c.department_name ? ` • ${c.department_name}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </SectionCard>

      {/* Manage Mode */}
      {viewMode === 'manage' && selectedCourseId && (
        <SectionCard
          title={selectedCourse?.name || t('admin.progress.add_part')}
          description={selectedCourse ? t('admin.records.semester_label', { count: selectedCourse.semester }) : undefined}
          bodyClassName="p-0"
        >
          {/* Add row */}
          <form onSubmit={handleAddItem} className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Input
              type="text"
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              placeholder={t('admin.progress.placeholder_part')}
              className="flex-1"
              required
            />
            <Button type="submit" disabled={adding || !newItemTitle.trim()}>
              {adding ? <Spinner className="size-4" /> : <Plus className="size-4" />}
              {t('admin.progress.add_part')}
            </Button>
          </form>

          {loading ? (
            <LoadingState label={t('admin.progress.hydrating')} />
          ) : progressItems.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={ListChecks}
                title={t('admin.progress.zero_items')}
              />
            </div>
          ) : (
            <ul className="divide-y divide-border">
              <AnimatePresence initial={false}>
                {progressItems.map((item, index) => (
                  <motion.li
                    key={item.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="group flex items-center gap-3 px-4 py-2.5"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggle(item.id)}
                      aria-pressed={item.is_completed}
                      className={cnToggle(item.is_completed)}
                      title={item.is_completed ? t('admin.progress.status_authenticated') : t('admin.progress.status_pending')}
                    >
                      {item.is_completed ? <CheckCircle className="size-4" /> : <Circle className="size-4" />}
                    </button>

                    <span className="w-6 shrink-0 text-end text-xs tabular-nums text-muted-foreground">
                      {index + 1}
                    </span>

                    {editingId === item.id ? (
                      <div className="flex flex-1 items-center gap-2">
                        <Input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="flex-1"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') { e.preventDefault(); handleEditSave(item.id); }
                            if (e.key === 'Escape') { setEditingId(null); }
                          }}
                        />
                        <Button size="sm" onClick={() => handleEditSave(item.id)}>
                          <Save className="size-4" />
                          {t('common.save')}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setEditingId(null)}
                          aria-label={t('common.close')}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('admin.students.status')}: {item.is_completed ? t('admin.progress.status_authenticated') : t('admin.progress.status_pending')}
                        </p>
                      </div>
                    )}

                    {editingId !== item.id && (
                      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => { setEditingId(item.id); setEditTitle(item.title); }}
                          aria-label={item.title}
                        >
                          <Edit3 className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(item.id)}
                          aria-label={item.title}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    )}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </SectionCard>
      )}

      {/* Overview Mode */}
      {viewMode === 'overview' && (
        groupedEntries.length === 0 ? (
          <EmptyState
            icon={LayoutGrid}
            title={t('admin.progress.system_standby')}
            description={t('admin.progress.standby_hint')}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {groupedEntries.map(([courseName, data]) => {
              const completed = data.items.filter(i => i.is_completed).length;
              const total = data.items.length;
              const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
              const isExpanded = expandedCourse === courseName;

              return (
                <SectionCard
                  key={courseName}
                  bodyClassName="p-4 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                        <BookOpen className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-foreground">{courseName}</h3>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{t('admin.records.semester_label', { count: data.semester })}</span>
                          {data.department_name && (
                            <>
                              <span className="size-1 rounded-full bg-border" />
                              <span className="truncate">{data.department_name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-end">
                      <p className="text-xl font-semibold tabular-nums text-primary">{pct}%</p>
                      <p className="text-xs text-muted-foreground">{t('admin.progress.efficiency')}</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {t('admin.progress.active_signals', { completed, total })}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setExpandedCourse(isExpanded ? null : courseName)}
                      aria-expanded={isExpanded}
                      aria-label={courseName}
                    >
                      {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </Button>
                  </div>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        key="items"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-1 border-t border-border pt-3">
                          {data.items.map((item, idx) => (
                            <div key={item.id} className="group/item flex items-center gap-2.5 rounded-md px-1 py-1.5">
                              <button
                                type="button"
                                onClick={() => handleToggle(item.id)}
                                aria-pressed={item.is_completed}
                                className={cnToggle(item.is_completed, true)}
                                title={item.is_completed ? t('admin.progress.status_authenticated') : t('admin.progress.status_pending')}
                              >
                                {item.is_completed ? <Check className="size-3" /> : <Circle className="size-3" />}
                              </button>
                              <span className="w-5 shrink-0 text-end text-xs tabular-nums text-muted-foreground">{idx + 1}.</span>
                              <span className={`min-w-0 flex-1 truncate text-sm ${item.is_completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {item.title}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleDelete(item.id)}
                                aria-label={item.title}
                                className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover/item:opacity-100 focus-visible:opacity-100"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          ))}

                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 w-full"
                            onClick={() => {
                              const course = courses.find(c => c.name === courseName);
                              if (course) handleCourseSelect(String(course.id));
                            }}
                          >
                            <Plus className="size-4" />
                            {t('admin.progress.add_part')}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </SectionCard>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};

// Toggle pill: green when completed, neutral outline when pending. `sm` for the dense overview rows.
function cnToggle(completed, sm = false) {
  const base = sm
    ? 'flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors'
    : 'flex size-8 shrink-0 items-center justify-center rounded-md border transition-colors';
  return completed
    ? `${base} border-primary bg-primary text-primary-foreground`
    : `${base} border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50`;
}

export default ProgressManager;
