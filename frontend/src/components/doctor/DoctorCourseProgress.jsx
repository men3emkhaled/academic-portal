import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { ListChecks, Plus, Edit3, Trash2, CheckCircle2, Circle, Percent } from 'lucide-react';
import {
  PageHeader,
  SectionCard,
  StatCard,
  EmptyState,
  FormField,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const DoctorCourseProgress = ({ courses }) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  const { doctorApi } = useDoctorAuth();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [progressItems, setProgressItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ title: '', order_index: 0 });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedCourseId) {
      fetchProgress();
    } else {
      setProgressItems([]);
    }
  }, [selectedCourseId]);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const res = await doctorApi('get', `/doctor/course-progress/${selectedCourseId}`);
      setProgressItems(res.data);
    } catch (err) {
      toast.error(t('doctor.progress.load_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error(t('doctor.progress.title_required'));

    setIsSaving(true);
    try {
      if (editingItem) {
        await doctorApi('put', `/doctor/course-progress/${editingItem.id}`, formData);
        toast.success(t('doctor.progress.item_updated'));
      } else {
        await doctorApi('post', '/doctor/course-progress', {
          ...formData,
          courseId: selectedCourseId,
          order_index: progressItems.length
        });
        toast.success(t('doctor.progress.item_added'));
      }
      resetForm();
      fetchProgress();
    } catch (err) {
      toast.error(err.response?.data?.message || t('doctor.progress.save_failed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await doctorApi('patch', `/doctor/course-progress/${id}/toggle`, {
        is_completed: !currentStatus
      });
      // Optimistic update
      setProgressItems(prev => prev.map(item =>
        item.id === id ? { ...item, is_completed: !currentStatus } : item
      ));
    } catch (err) {
      toast.error(t('doctor.progress.update_failed'));
      fetchProgress(); // Revert on failure
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('doctor.progress.delete_confirm'))) return;
    try {
      await doctorApi('delete', `/doctor/course-progress/${id}`);
      toast.success(t('doctor.progress.item_deleted'));
      fetchProgress();
    } catch (err) {
      toast.error(t('doctor.progress.delete_failed'));
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setShowForm(false);
    setFormData({ title: '', order_index: 0 });
  };

  const startEdit = (item) => {
    setEditingItem(item);
    setFormData({ title: item.title, order_index: item.order_index });
    setShowForm(true);
  };

  const completedCount = progressItems.filter(i => i.is_completed).length;
  const progressPct = progressItems.length > 0
    ? Math.round((completedCount / progressItems.length) * 100)
    : 0;

  const showOverview = selectedCourseId && progressItems.length > 0 && !loading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        icon={ListChecks}
        title={t('doctor.progress.title')}
        description={t('doctor.progress.description')}
        actions={
          selectedCourseId && !showForm ? (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="size-4" />
              <span>{t('doctor.progress.add_topic')}</span>
            </Button>
          ) : null
        }
      />

      {/* Course Selector */}
      <SectionCard bodyClassName="p-4">
        <FormField htmlFor="progress-course" label={t('doctor.progress.select_course')}>
          <Select
            value={selectedCourseId}
            onValueChange={setSelectedCourseId}
            dir={dir}
          >
            <SelectTrigger id="progress-course" className="w-full" dir={dir}>
              <SelectValue placeholder={t('doctor.progress.select_course')} />
            </SelectTrigger>
            <SelectContent dir={dir}>
              {courses.map(c => (
                <SelectItem key={c.id} value={String(c.id)} className={isAr ? 'font-arabic' : ''}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </SectionCard>

      {/* Progress Overview */}
      {showOverview && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label={t('doctor.progress.overall_completion')}
            value={`${progressPct}%`}
            icon={Percent}
            accent
            hint={t('doctor.progress.topics_completed', { completed: completedCount, total: progressItems.length })}
          />
          <SectionCard className="sm:col-span-2" bodyClassName="flex h-full flex-col justify-center gap-3 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{t('doctor.progress.overall_completion')}</span>
              <span className="text-sm font-semibold text-primary">{progressPct}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {t('doctor.progress.topics_completed', { completed: completedCount, total: progressItems.length })}
            </p>
          </SectionCard>
        </div>
      )}

      {/* Form */}
      <AnimatePresence initial={false}>
        {showForm && selectedCourseId && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            <SectionCard
              title={editingItem ? t('doctor.progress.edit_topic') : t('doctor.progress.add_new_topic')}
              bodyClassName="p-5"
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField htmlFor="progress-title" label={t('doctor.progress.topic_title')} required>
                  <Input
                    id="progress-title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Chapter 1: Introduction to Data Structures"
                    autoFocus
                  />
                </FormField>

                <div className="flex gap-2 pt-1">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? t('doctor.progress.saving') : (editingItem ? t('doctor.progress.update_topic') : t('doctor.progress.add_topic'))}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    {t('common.cancel')}
                  </Button>
                </div>
              </form>
            </SectionCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {!selectedCourseId ? (
        <EmptyState
          icon={ListChecks}
          title={t('doctor.progress.select_hint')}
        />
      ) : loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl border bg-card p-4">
              <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : progressItems.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title={t('doctor.progress.no_topics')}
          description={t('doctor.progress.no_topics_hint')}
        />
      ) : (
        <div className="space-y-2">
          {progressItems.map((item) => (
            <div
              key={item.id}
              className="group flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50"
            >
              {/* Checkbox */}
              <button
                onClick={() => handleToggle(item.id, item.is_completed)}
                className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                  item.is_completed
                    ? 'border border-primary/20 bg-primary/10 text-primary'
                    : 'border border-border bg-muted text-muted-foreground hover:bg-muted/70'
                }`}
              >
                {item.is_completed ? <CheckCircle2 className="size-5" /> : <Circle className="size-5" />}
              </button>

              {/* Title */}
              <div className="min-w-0 flex-1">
                <span className={`text-sm font-medium ${
                  item.is_completed ? 'text-muted-foreground line-through' : 'text-foreground'
                }`}>
                  {item.title}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => startEdit(item)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Edit3 className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleDelete(item.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorCourseProgress;
