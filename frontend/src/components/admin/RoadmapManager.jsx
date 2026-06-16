import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Map, Plus, Edit3, Trash2, Star,
  ListOrdered, Box, Target, Layers,
} from 'lucide-react';
import {
  PageHeader,
  SectionCard,
  StatCard,
  EmptyState,
  LoadingState,
  Modal,
  FormField,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const RoadmapManager = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [tracks, setTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTrackForm, setShowTrackForm] = useState(false);
  const [editingTrack, setEditingTrack] = useState(null);
  const [trackForm, setTrackForm] = useState({ name: '', description: '', is_primary: false });
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', order_index: 0 });

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/roadmap/tracks');
      setTracks(res.data);
      if (res.data.length > 0 && !selectedTrack) {
        setSelectedTrack(res.data[0]);
        fetchTasks(res.data[0].id);
      }
    } catch (error) {
      toast.error(t('admin.roadmap.messages.load_paths_failed'));
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (trackId) => {
    setLoading(true);
    try {
      const res = await api.get(`/roadmap/tracks/${trackId}/tasks`);
      setTasks(res.data);
    } catch (error) {
      toast.error(t('admin.roadmap.messages.load_tasks_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingTrack) {
        await api.put(`/roadmap/tracks/${editingTrack.id}`, trackForm);
        toast.success(t('common.success'));
      } else {
        await api.post('/roadmap/tracks', trackForm);
        toast.success(t('common.success'));
      }
      resetTrackForm();
      fetchTracks();
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.roadmap.messages.save_path_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrack = async (track) => {
    if (!window.confirm(t('common.confirm_delete'))) return;
    setLoading(true);
    try {
      await api.delete(`/roadmap/tracks/${track.id}`);
      toast.success(t('common.success'));
      if (selectedTrack?.id === track.id) {
        setSelectedTrack(null);
        setTasks([]);
      }
      fetchTracks();
    } catch (error) {
      toast.error(t('admin.roadmap.messages.delete_path_failed'));
    } finally {
      setLoading(false);
    }
  };

  const editTrack = (track) => {
    setEditingTrack(track);
    setTrackForm({
      name: track.name,
      description: track.description || '',
      is_primary: track.is_primary || false,
    });
    setShowTrackForm(true);
  };

  const resetTrackForm = () => {
    setShowTrackForm(false);
    setEditingTrack(null);
    setTrackForm({ name: '', description: '', is_primary: false });
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!selectedTrack) {
      toast.error(t('admin.roadmap.messages.select_path_req'));
      return;
    }
    setLoading(true);
    try {
      if (editingTask) {
        await api.put(`/roadmap/tasks/${editingTask.id}`, taskForm);
        toast.success(t('common.success'));
      } else {
        await api.post(`/roadmap/tracks/${selectedTrack.id}/tasks`, taskForm);
        toast.success(t('common.success'));
      }
      resetTaskForm();
      fetchTasks(selectedTrack.id);
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.roadmap.messages.save_task_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (task) => {
    if (!window.confirm(t('common.confirm_delete'))) return;
    setLoading(true);
    try {
      await api.delete(`/roadmap/tasks/${task.id}`);
      toast.success(t('common.success'));
      fetchTasks(selectedTrack.id);
    } catch (error) {
      toast.error(t('admin.roadmap.messages.delete_task_failed'));
    } finally {
      setLoading(false);
    }
  };

  const editTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      order_index: task.order_index || 0,
    });
    setShowTaskForm(true);
  };

  const resetTaskForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
    setTaskForm({ title: '', description: '', order_index: 0 });
  };

  const selectTrack = (track) => {
    setSelectedTrack(track);
    fetchTasks(track.id);
  };

  return (
    <div className="space-y-6 text-start" dir={isAr ? 'rtl' : 'ltr'}>
      <PageHeader
        icon={Map}
        title={t('admin.roadmap.title')}
        description={t('admin.roadmap.description')}
        actions={
          <Button onClick={() => setShowTrackForm(true)}>
            <Plus className="size-4" />
            {t('admin.roadmap.modals.new_path')}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t('admin.roadmap.active_tracks')}
          value={tracks.length}
          icon={Layers}
          accent
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* Master list: tracks */}
        <div className="xl:col-span-4">
          <SectionCard
            title={t('admin.roadmap.available_tracks')}
            actions={
              <Button variant="ghost" size="icon-sm" onClick={() => setShowTrackForm(true)} aria-label={t('admin.roadmap.modals.new_path')}>
                <Plus className="size-4" />
              </Button>
            }
            bodyClassName="p-2"
          >
            {loading && tracks.length === 0 ? (
              <LoadingState className="min-h-[12rem]" />
            ) : tracks.length === 0 ? (
              <EmptyState
                icon={Box}
                title={t('admin.roadmap.no_tracks')}
                className="border-0"
              />
            ) : (
              <div className="space-y-1">
                {tracks.map((track) => {
                  const isActive = selectedTrack?.id === track.id;
                  return (
                    <div
                      key={track.id}
                      onClick={() => selectTrack(track)}
                      role="button"
                      tabIndex={0}
                      aria-current={isActive ? 'true' : undefined}
                      className={cn(
                        'group relative flex cursor-pointer items-start justify-between gap-2 rounded-lg px-3 py-2.5 transition-colors',
                        isActive ? 'bg-muted' : 'hover:bg-muted/50'
                      )}
                    >
                      {isActive && (
                        <span className="absolute inset-y-1.5 start-0 w-0.5 rounded-full bg-primary" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className={cn('truncate text-sm', isActive ? 'font-medium text-foreground' : 'text-foreground')}>
                            {track.name}
                          </h4>
                          {track.is_primary && (
                            <Star className="size-3.5 shrink-0 fill-amber-500 text-amber-500" />
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {track.description || t('admin.roadmap.no_desc')}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => { e.stopPropagation(); editTrack(track); }}
                          aria-label={t('common.edit')}
                        >
                          <Edit3 className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => { e.stopPropagation(); handleDeleteTrack(track); }}
                          aria-label={t('common.delete')}
                          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Detail: ordered tasks */}
        <div className="xl:col-span-8">
          {selectedTrack ? (
            <SectionCard
              title={t('admin.roadmap.tasks_for', { name: selectedTrack.name })}
              description={t('admin.roadmap.sequence_alignment')}
              actions={
                <Button size="sm" onClick={() => setShowTaskForm(true)}>
                  <Plus className="size-3.5" />
                  {t('admin.roadmap.add_task')}
                </Button>
              }
              bodyClassName="p-2"
            >
              {loading && tasks.length === 0 ? (
                <LoadingState className="min-h-[12rem]" />
              ) : tasks.length === 0 ? (
                <EmptyState
                  icon={Target}
                  title={t('admin.roadmap.no_tasks')}
                  className="border-0"
                  action={
                    <Button size="sm" variant="outline" onClick={() => setShowTaskForm(true)}>
                      <Plus className="size-3.5" />
                      {t('admin.roadmap.add_task')}
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-1">
                  <AnimatePresence initial={false}>
                    {tasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="group flex items-start justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-xs font-medium text-primary">
                            {task.order_index}
                          </span>
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate text-sm font-medium text-foreground">{task.title}</h4>
                            {task.description && (
                              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => editTask(task)}
                            aria-label={t('common.edit')}
                          >
                            <Edit3 className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDeleteTask(task)}
                            aria-label={t('common.delete')}
                            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </SectionCard>
          ) : (
            <SectionCard bodyClassName="p-0">
              <EmptyState
                icon={Map}
                title={t('admin.roadmap.select_path_hint')}
                description={t('admin.roadmap.awaiting_auth')}
                className="border-0"
              />
            </SectionCard>
          )}
        </div>
      </div>

      {/* TRACK FORM MODAL */}
      <Modal
        open={showTrackForm}
        onOpenChange={(open) => { if (!open) resetTrackForm(); }}
        title={editingTrack ? t('admin.roadmap.modals.edit_path') : t('admin.roadmap.modals.new_path')}
        description={t('admin.roadmap.locus_protocol')}
        size="lg"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={resetTrackForm}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" form="track-form" disabled={loading}>
              {t('common.save')}
            </Button>
          </>
        }
      >
        <form id="track-form" onSubmit={handleSaveTrack} className="space-y-4">
          <FormField label={t('admin.roadmap.modals.path_name')} htmlFor="track-name" required>
            <Input
              id="track-name"
              type="text"
              value={trackForm.name}
              onChange={(e) => setTrackForm({ ...trackForm, name: e.target.value })}
              required
            />
          </FormField>

          <FormField label={t('admin.roadmap.modals.path_desc')} htmlFor="track-desc">
            <Textarea
              id="track-desc"
              rows={3}
              value={trackForm.description}
              onChange={(e) => setTrackForm({ ...trackForm, description: e.target.value })}
            />
          </FormField>

          <label
            htmlFor="track-primary"
            className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2.5"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Star className={cn('size-4', trackForm.is_primary ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground')} />
              {t('admin.roadmap.modals.featured')}
            </span>
            <Switch
              id="track-primary"
              checked={trackForm.is_primary}
              onCheckedChange={(checked) => setTrackForm({ ...trackForm, is_primary: checked })}
            />
          </label>
        </form>
      </Modal>

      {/* TASK FORM MODAL */}
      <Modal
        open={showTaskForm && !!selectedTrack}
        onOpenChange={(open) => { if (!open) resetTaskForm(); }}
        title={editingTask ? t('admin.roadmap.modals.edit_task') : t('admin.roadmap.modals.new_task')}
        description={t('admin.roadmap.node_sequence')}
        size="lg"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={resetTaskForm}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" form="task-form" disabled={loading}>
              {t('common.save')}
            </Button>
          </>
        }
      >
        <form id="task-form" onSubmit={handleSaveTask} className="space-y-4">
          <FormField label={t('admin.roadmap.modals.task_title')} htmlFor="task-title" required>
            <Input
              id="task-title"
              type="text"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              required
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <FormField label={t('admin.roadmap.modals.task_order')} htmlFor="task-order" className="md:col-span-1">
              <Input
                id="task-order"
                type="number"
                value={taskForm.order_index}
                onChange={(e) => setTaskForm({ ...taskForm, order_index: parseInt(e.target.value) || 0 })}
              />
            </FormField>

            <FormField label={t('admin.roadmap.modals.task_desc')} htmlFor="task-desc" className="md:col-span-3">
              <Input
                id="task-desc"
                type="text"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              />
            </FormField>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RoadmapManager;
