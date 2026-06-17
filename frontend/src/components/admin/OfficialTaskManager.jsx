import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckSquare, Plus, Trash2, Edit3,
  Link as LinkIcon, ExternalLink, Clock, Layers,
} from 'lucide-react';
import {
  PageContainer,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  EmptyState,
  SearchInput,
  Toolbar,
  DataTable,
  FormField,
  Modal,
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

const OfficialTaskManager = ({ courses = [], departments = [] }) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');

  const [formData, setFormData] = useState({
    course_id: '',
    department_id: '',
    title: '',
    description: '',
    drive_link: '',
    deadline: ''
  });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await api.get('/official-tasks/admin');
      setTasks(response.data || []);
    } catch (error) {
      toast.error(t('admin.messages.load_tasks_failed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.course_id || !formData.title || !formData.drive_link) {
      toast.error(t('admin.messages.fields_req'));
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        department_id: formData.department_id || null
      };

      if (editingTask) {
        await api.put(`/official-tasks/admin/${editingTask.id}`, dataToSend);
        toast.success(t('common.success'));
      } else {
        await api.post('/official-tasks/admin', dataToSend);
        toast.success(t('common.success'));
      }
      closeForm();
      fetchTasks();
    } catch (error) {
      toast.error(t('admin.messages.operation_failed'));
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      course_id: task.course_id,
      department_id: task.department_id || '',
      title: task.title,
      description: task.description || '',
      drive_link: task.drive_link,
      deadline: task.deadline ? task.deadline.split('T')[0] : ''
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTask(null);
    setFormData({ course_id: '', department_id: '', title: '', description: '', drive_link: '', deadline: '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirm_delete'))) return;
    try {
      await api.delete(`/official-tasks/admin/${id}`);
      toast.success(t('common.success'));
      fetchTasks();
    } catch (error) {
      toast.error(t('admin.messages.delete_failed'));
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.course_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourseId ? task.course_id === parseInt(selectedCourseId) : true;
    return matchesSearch && matchesCourse;
  });

  const columns = [
    {
      key: 'title',
      header: t('admin.tasks.modals.task_title'),
      cellClassName: 'font-medium text-foreground',
      render: (row) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
            <CheckSquare className="size-4" />
          </span>
          <span className="truncate">{row.title}</span>
        </div>
      ),
    },
    {
      key: 'course',
      header: t('admin.tasks.modals.target_course'),
      render: (row) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge variant="accent">{row.course_name}</StatusBadge>
          {row.department_name && (
            <StatusBadge variant="neutral">{row.department_name}</StatusBadge>
          )}
        </div>
      ),
    },
    {
      key: 'deadline',
      header: t('admin.tasks.modals.deadline_label'),
      headClassName: 'hidden sm:table-cell',
      cellClassName: 'hidden sm:table-cell',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" />
          {row.deadline
            ? new Date(row.deadline).toLocaleDateString()
            : t('admin.tasks.open_deadline')}
        </span>
      ),
    },
    {
      key: 'link',
      header: t('admin.tasks.drive_link'),
      headClassName: 'hidden md:table-cell',
      cellClassName: 'hidden md:table-cell',
      render: (row) => (
        <a
          href={row.drive_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <LinkIcon className="size-3.5" />
          <span>{t('admin.tasks.drive_link')}</span>
          <ExternalLink className="size-3.5" />
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
            onClick={() => handleEdit(row)}
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

  const emptyContent = (
    <EmptyState
      icon={CheckSquare}
      title={t('admin.tasks.no_tasks')}
      description={t('admin.tasks.no_tasks_hint')}
      action={
        <Button onClick={() => { setEditingTask(null); setShowForm(true); }}>
          <Plus className="size-4" />
          {t('admin.tasks.add_button')}
        </Button>
      }
    />
  );

  return (
    <PageContainer>
      <PageHeader
        icon={CheckSquare}
        title={t('admin.tasks.title')}
        description={t('admin.tasks.description')}
        actions={
          <Button onClick={() => { setEditingTask(null); setShowForm(true); }}>
            <Plus className="size-4" />
            {t('admin.tasks.add_button')}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label={t('admin.tasks.active_tasks', { count: tasks.length })}
          value={tasks.length}
          icon={Layers}
          hint={t('admin.tasks.task_node')}
          accent
        />
      </div>

      <SectionCard
        header={
          <header className="border-b px-4 py-3">
            <Toolbar>
              <SearchInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('admin.tasks.search_placeholder')}
              />
              <Select
                value={selectedCourseId || 'all'}
                onValueChange={(value) => setSelectedCourseId(value === 'all' ? '' : value)}
              >
                <SelectTrigger className="w-full sm:w-72" dir={isAr ? 'rtl' : 'ltr'}>
                  <SelectValue placeholder={t('admin.tasks.filter_all_courses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('admin.tasks.filter_all_courses')}</SelectItem>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={String(course.id)}>{course.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Toolbar>
          </header>
        }
        bodyClassName="p-0 sm:p-3"
      >
        <DataTable
          columns={columns}
          rows={filteredTasks}
          getRowKey={(row) => row.id}
          loading={loading}
          empty={emptyContent}
          className="border-0 sm:border"
        />
      </SectionCard>

      {/* Create / edit modal */}
      <Modal
        open={showForm}
        onOpenChange={(open) => { if (!open) closeForm(); }}
        size="lg"
        title={editingTask ? t('admin.tasks.modals.edit_task') : t('admin.tasks.modals.new_task')}
        description={t('admin.tasks.entry_protocol')}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={closeForm} disabled={loading}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" form="task-form" disabled={loading}>
              {editingTask ? t('common.save') : t('admin.tasks.add_button')}
            </Button>
          </>
        }
      >
        <AnimatePresence mode="wait">
          <motion.form
            key={editingTask ? `edit-${editingTask.id}` : 'create'}
            id="task-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <FormField label={t('admin.tasks.modals.target_course')} required>
              <Select
                value={formData.course_id ? String(formData.course_id) : ''}
                onValueChange={(value) => setFormData({ ...formData, course_id: value })}
              >
                <SelectTrigger className="w-full" dir={isAr ? 'rtl' : 'ltr'}>
                  <SelectValue placeholder={t('admin.tasks.modals.select_course')} />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={String(course.id)}>{course.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label={t('admin.tasks.modals.target_dept')}>
              <Select
                value={formData.department_id ? String(formData.department_id) : 'all'}
                onValueChange={(value) => setFormData({ ...formData, department_id: value === 'all' ? '' : value })}
              >
                <SelectTrigger className="w-full" dir={isAr ? 'rtl' : 'ltr'}>
                  <SelectValue placeholder={t('admin.tasks.modals.all_depts')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('admin.tasks.modals.all_depts')}</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={String(dept.id)}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              label={t('admin.tasks.modals.task_title')}
              htmlFor="task-title"
              required
              className="sm:col-span-2"
            >
              <Input
                id="task-title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={t('admin.tasks.modals.placeholder_title')}
                required
              />
            </FormField>

            <FormField
              label={t('admin.tasks.modals.resource_link')}
              htmlFor="task-link"
              required
            >
              <Input
                id="task-link"
                type="url"
                value={formData.drive_link}
                onChange={(e) => setFormData({ ...formData, drive_link: e.target.value })}
                placeholder={t('admin.tasks.placeholder_url')}
                required
              />
            </FormField>

            <FormField label={t('admin.tasks.modals.deadline_label')} htmlFor="task-deadline">
              <Input
                id="task-deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </FormField>

            <FormField
              label={t('admin.tasks.modals.additional_info')}
              htmlFor="task-desc"
              className="sm:col-span-2"
            >
              <Textarea
                id="task-desc"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('admin.tasks.modals.placeholder_desc')}
              />
            </FormField>
          </motion.form>
        </AnimatePresence>
      </Modal>
    </PageContainer>
  );
};

export default OfficialTaskManager;
