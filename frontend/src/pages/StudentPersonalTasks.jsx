import React, { useState, useEffect } from 'react';
import {
  CheckSquare, Edit, Trash2, ExternalLink, BookOpen,
  Plus, Calendar, CheckCircle2, Circle, Activity, Loader2
} from 'lucide-react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useStudentData } from '../context/StudentDataContext';
import { useNavigate } from 'react-router-dom';
import studentApi from '../services/studentApi';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  PageContainer,
  PageHeader,
  SectionCard,
  StatusBadge,
  EmptyState,
  LoadingState,
  FormField,
  Modal,
} from '@/components/common';
import { cn } from '@/lib/utils';

const StudentPersonalTasks = () => {
  const { student, logout } = useStudentAuth();
  const { t, i18n } = useTranslation();
  const { tasks, setTasks, loadingTasks, fetchTasks, officialTasks, setOfficialTasks, fetchOfficialTasks, loadingOfficialTasks } = useStudentData();
  const navigate = useNavigate();
  const isAr = i18n.language === 'ar';

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const loading = loadingTasks || loadingOfficialTasks;

  const handleLogout = () => {
    logout();
    navigate('/student/login');
    toast.success(`${t('sidebar.logout')} ${t('auth.success')}`);
  };

  useEffect(() => {
    if (!student) navigate('/student/login');
  }, [student, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error(t('tasks.title_required'));

    setSubmitting(true);
    try {
      if (editingTask) {
        await studentApi.put(`/student/personal-tasks/${editingTask.id}`, {
          title: formData.title,
          description: formData.description,
          is_completed: editingTask.is_completed,
          order_index: editingTask.order_index
        });
        toast.success(t('tasks.updated'));
      } else {
        await studentApi.post('/student/personal-tasks', {
          title: formData.title,
          description: formData.description
        });
        toast.success(t('tasks.added'));
      }
      resetForm();
      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || t('common.error_save'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (taskId, currentStatus) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, is_completed: !currentStatus } : t));
    try {
      await studentApi.patch(`/student/personal-tasks/${taskId}/toggle`, { is_completed: !currentStatus });
      toast.success(currentStatus ? t('tasks.marked_pending') : t('tasks.completed_toast'));
    } catch (error) {
      fetchTasks();
      toast.error(t('common.error_save'));
    }
  };

  const handleToggleOfficial = async (taskId, currentStatus) => {
    setOfficialTasks(officialTasks.map(t => t.id === taskId ? { ...t, is_completed: !currentStatus } : t));
    try {
      await studentApi.patch(`/official-tasks/${taskId}/toggle`, { is_completed: !currentStatus });
      toast.success(!currentStatus ? t('tasks.official_completed') : t('tasks.marked_pending'));
    } catch (error) {
      fetchOfficialTasks();
      toast.error(t('common.error_save'));
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm(t('tasks.delete_confirm'))) return;
    try {
      await studentApi.delete(`/student/personal-tasks/${taskId}`);
      setTasks(tasks.filter(t => t.id !== taskId));
      toast.success(t('tasks.deleted'));
    } catch (error) {
      toast.error(t('common.error_save'));
    }
  };

  const editTask = (task) => {
    setEditingTask(task);
    setFormData({ title: task.title, description: task.description || '' });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingTask(null);
    setFormData({ title: '', description: '' });
  };

  const openCreate = () => {
    setEditingTask(null);
    setFormData({ title: '', description: '' });
    setShowForm(true);
  };

  return (
    <div
      className="min-h-screen bg-background text-foreground font-sans"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <Sidebar onLogout={handleLogout} />

      <main className="md:ps-72 min-h-screen flex flex-col">
        <PageContainer>
          <PageHeader
            icon={CheckSquare}
            title={t('sidebar.personal_tasks')}
            description={t('tasks.no_tasks_desc')}
            actions={
              <Button onClick={openCreate}>
                <Plus className="size-4" />
                {t('tasks.add_task')}
              </Button>
            }
          />

          {loading ? (
            <LoadingState />
          ) : (tasks.length === 0 && officialTasks.length === 0) ? (
            <EmptyState
              icon={CheckSquare}
              title={t('tasks.no_tasks')}
              description={t('tasks.no_tasks_desc')}
              action={
                <Button variant="outline" onClick={openCreate}>
                  <Plus className="size-4" />
                  {t('tasks.add_task')}
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

              {/* OFFICIAL TASKS */}
              <SectionCard
                title={t('tasks.official')}
                description={t('mavi.central_assignments')}
                bodyClassName="p-0"
              >
                {officialTasks.length === 0 ? (
                  <div className="p-4">
                    <EmptyState icon={BookOpen} title={t('tasks.no_official')} />
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {officialTasks.map((task) => (
                      <li
                        key={`official-${task.id}`}
                        className={cn(
                          'flex items-start gap-3 px-4 py-3 text-start',
                          task.is_completed && 'opacity-60'
                        )}
                      >
                        <button
                          onClick={() => handleToggleOfficial(task.id, task.is_completed)}
                          aria-pressed={task.is_completed}
                          className={cn(
                            'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                            task.is_completed
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                          )}
                        >
                          {task.is_completed ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />}
                        </button>

                        <div className="min-w-0 flex-1 space-y-1.5">
                          <h4
                            className={cn(
                              'text-sm font-medium text-foreground',
                              task.is_completed && 'line-through text-muted-foreground'
                            )}
                          >
                            {task.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2">
                            {task.course_name && (
                              <StatusBadge variant="neutral" icon={BookOpen}>{task.course_name}</StatusBadge>
                            )}
                            {task.deadline && (
                              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="size-3" />
                                {new Date(task.deadline).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {task.drive_link && (
                          <Button
                            asChild
                            variant="ghost"
                            size="icon-sm"
                            className="shrink-0 text-muted-foreground"
                          >
                            <a href={task.drive_link} target="_blank" rel="noopener noreferrer" aria-label={t('tasks.official')}>
                              <ExternalLink className="size-4" />
                            </a>
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>

              {/* PERSONAL TASKS */}
              <SectionCard
                title={t('tasks.personal')}
                description={t('mavi.user_space')}
                bodyClassName="p-0"
              >
                {tasks.length === 0 ? (
                  <div className="p-4">
                    <EmptyState icon={Activity} title={t('tasks.no_personal')} />
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {tasks.map((task) => (
                      <li
                        key={`personal-${task.id}`}
                        className={cn(
                          'group flex items-start gap-3 px-4 py-3 text-start transition-colors hover:bg-muted/50',
                          task.is_completed && 'opacity-60'
                        )}
                      >
                        <button
                          onClick={() => handleToggle(task.id, task.is_completed)}
                          aria-pressed={task.is_completed}
                          className={cn(
                            'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                            task.is_completed
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                          )}
                        >
                          {task.is_completed ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />}
                        </button>

                        <div className="min-w-0 flex-1 space-y-1">
                          <h4
                            className={cn(
                              'text-sm font-medium text-foreground',
                              task.is_completed && 'line-through text-muted-foreground'
                            )}
                          >
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                          )}
                        </div>

                        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => editTask(task)}
                            aria-label={t('tasks.edit_task')}
                            className="text-muted-foreground"
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDelete(task.id)}
                            aria-label={t('common.delete', 'Delete')}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>
            </div>
          )}
        </PageContainer>
      </main>

      {/* ADD/EDIT MODAL */}
      <Modal
        open={showForm}
        onOpenChange={(open) => { if (!open) resetForm(); }}
        title={editingTask ? t('tasks.edit_task') : t('tasks.new_task')}
        size="md"
        footer={
          <Button type="submit" form="task-form" disabled={submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {editingTask ? t('common.save') : t('tasks.create')}
          </Button>
        }
      >
        <form id="task-form" onSubmit={handleSubmit} className="space-y-4">
          <FormField label={t('tasks.placeholder_title')} htmlFor="task-title" required>
            <Input
              id="task-title"
              type="text"
              placeholder={t('tasks.placeholder_title')}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              autoFocus
            />
          </FormField>
          <FormField label={t('tasks.placeholder_desc')} htmlFor="task-desc">
            <Textarea
              id="task-desc"
              placeholder={t('tasks.placeholder_desc')}
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
};

export default StudentPersonalTasks;
