import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  Calendar, Plus, Trash2, Edit3, Clock,
  FileText, LayoutDashboard, BookOpen, GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  PageHeader, SectionCard, StatCard, DataTable,
  StatusBadge, EmptyState, FormField, Modal,
} from '@/components/common';

const ExamScheduleManager = ({ departments, selectedDepartmentId }) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [formData, setFormData] = useState({
    course_name: '',
    exam_type: 'Final',
    exam_date: '',
    start_time: '',
    end_time: '',
    department_id: selectedDepartmentId || ''
  });

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await api.get('/exams/admin', { params: { department_id: selectedDepartmentId } });
      setExams(res.data);
    } catch (error) {
      toast.error(t('admin.messages.load_exams_failed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
    if (selectedDepartmentId) {
      setFormData(prev => ({ ...prev, department_id: selectedDepartmentId }));
    }
  }, [selectedDepartmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.department_id) {
      toast.error(t('admin.messages.select_dept_req'));
      return;
    }
    setLoading(true);
    try {
      if (editingExam) {
        await api.put(`/exams/admin/${editingExam.id}`, formData);
        toast.success(t('common.success'));
      } else {
        await api.post('/exams/admin', formData);
        toast.success(t('common.success'));
      }
      setShowAddModal(false);
      setEditingExam(null);
      setFormData({ course_name: '', exam_type: 'Final', exam_date: '', start_time: '', end_time: '', department_id: selectedDepartmentId || '' });
      fetchExams();
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.messages.save_exam_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.exams.delete_confirm'))) return;
    try {
      await api.delete(`/exams/admin/${id}`);
      toast.success(t('common.success'));
      fetchExams();
    } catch (error) {
      toast.error(t('admin.messages.delete_failed'));
    }
  };

  const openEditModal = (exam) => {
    setEditingExam(exam);
    setFormData({
      course_name: exam.course_name,
      exam_type: exam.exam_type,
      exam_date: exam.exam_date.split('T')[0],
      start_time: exam.start_time.substring(0, 5),
      end_time: exam.end_time.substring(0, 5),
      department_id: exam.department_id
    });
    setShowAddModal(true);
  };

  const openAddModal = () => {
    setEditingExam(null);
    setFormData({ course_name: '', exam_type: 'Final', exam_date: '', start_time: '', end_time: '', department_id: selectedDepartmentId || '' });
    setShowAddModal(true);
  };

  const columns = [
    {
      key: 'course',
      header: t('admin.exams.course_dept'),
      cellClassName: 'align-top',
      render: (exam) => (
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground">{exam.course_name}</p>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <LayoutDashboard className="size-3.5 text-primary" />
            {exam.department_name || t('admin.exams.global_context')}
          </span>
        </div>
      ),
    },
    {
      key: 'type',
      header: t('admin.exams.type'),
      headClassName: 'text-center',
      cellClassName: 'align-top text-center',
      render: (exam) => (
        <StatusBadge variant={exam.exam_type === 'Practical' ? 'warning' : 'accent'}>
          {t(`admin.exams.types.${exam.exam_type}`)}
        </StatusBadge>
      ),
    },
    {
      key: 'schedule',
      header: t('admin.exams.schedule'),
      cellClassName: 'align-top',
      render: (exam) => (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Calendar className="size-4 text-primary" />
            <span>
              {new Date(exam.exam_date).toLocaleDateString(isAr ? 'ar-EG' : 'en-GB', { weekday: 'long' })},{' '}
              {new Date(exam.exam_date).toLocaleDateString(isAr ? 'ar-EG' : 'en-GB')}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
            <Clock className="size-3.5" />
            {exam.start_time.substring(0, 5)} — {exam.end_time.substring(0, 5)}
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: t('admin.exams.actions'),
      headClassName: 'text-end',
      cellClassName: 'align-top text-end',
      render: (exam) => (
        <div className="inline-flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => openEditModal(exam)}
            aria-label={t('admin.exams.modals.edit_exam')}
            className="text-muted-foreground hover:text-primary"
          >
            <Edit3 className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleDelete(exam.id)}
            aria-label={t('admin.exams.actions')}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={cn('space-y-6 text-start', isAr && 'font-arabic')}>
      <PageHeader
        icon={FileText}
        title={t('admin.exams.title')}
        description={t('admin.exams.description')}
        actions={
          <>
            <StatCard
              label={t('admin.exams.active_batches')}
              value={exams.length}
              icon={Calendar}
              accent
              className="min-w-[160px] py-3"
            />
            <Button onClick={openAddModal}>
              <Plus className="size-4" />
              {t('admin.exams.add_button')}
            </Button>
          </>
        }
      />

      <SectionCard
        title={t('admin.exams.title')}
        actions={
          <StatusBadge variant="accent">
            {exams.length} {t('admin.exams.active_batches')}
          </StatusBadge>
        }
        bodyClassName="p-0"
      >
        <DataTable
          columns={columns}
          rows={exams}
          getRowKey={(exam) => exam.id}
          loading={loading}
          className="rounded-none border-0"
          empty={
            <div className="p-4">
              <EmptyState
                icon={Calendar}
                title={t('admin.exams.no_exams')}
              />
            </div>
          }
        />
      </SectionCard>

      <Modal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        title={editingExam ? t('admin.exams.modals.edit_exam') : t('admin.exams.modals.add_exam')}
        size="lg"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" form="exam-form" disabled={loading}>
              {loading ? t('common.loading') : (editingExam ? t('common.save') : t('admin.exams.modals.add_exam'))}
            </Button>
          </>
        }
      >
        <form id="exam-form" onSubmit={handleSubmit} className="space-y-4">
          <FormField label={t('admin.exams.modals.course_name')} htmlFor="exam-course" required>
            <div className="relative">
              <BookOpen className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="exam-course"
                type="text"
                required
                value={formData.course_name}
                onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                placeholder={t('admin.exams.modals.placeholder_course')}
                className="ps-9"
              />
            </div>
          </FormField>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label={t('admin.exams.modals.exam_type')} htmlFor="exam-type">
              <Select
                value={formData.exam_type}
                onValueChange={(v) => setFormData({ ...formData, exam_type: v })}
              >
                <SelectTrigger id="exam-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Final">{t('admin.exams.types.Final')}</SelectItem>
                  <SelectItem value="Practical">{t('admin.exams.types.Practical')}</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label={t('admin.exams.modals.dept_label')} htmlFor="exam-dept" required>
              <Select
                value={formData.department_id ? String(formData.department_id) : ''}
                onValueChange={(v) => setFormData({ ...formData, department_id: v })}
              >
                <SelectTrigger id="exam-dept" className="w-full">
                  <span className="inline-flex items-center gap-2">
                    <GraduationCap className="size-4 text-muted-foreground" />
                    <SelectValue placeholder={t('admin.exams.modals.placeholder_dept')} />
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {departments.map(d => (
                    <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField label={t('admin.exams.modals.exam_date')} htmlFor="exam-date" required>
              <Input
                id="exam-date"
                type="date"
                required
                value={formData.exam_date}
                onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
              />
            </FormField>
            <FormField label={t('admin.exams.modals.start_time')} htmlFor="exam-start" required>
              <Input
                id="exam-start"
                type="time"
                required
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              />
            </FormField>
            <FormField label={t('admin.exams.modals.end_time')} htmlFor="exam-end" required>
              <Input
                id="exam-end"
                type="time"
                required
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </FormField>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExamScheduleManager;
