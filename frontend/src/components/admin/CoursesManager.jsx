import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen, Plus, Edit3, Trash2,
  Layers, Tag, AlignLeft
} from 'lucide-react';
import {
  PageHeader,
  StatCard,
  SectionCard,
  StatusBadge,
  EmptyState,
  LoadingState,
  Modal,
  FormField,
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

const CoursesManager = ({ departments }) => {
  const { t, i18n } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    semester: '1',
    credits: '3',
    department_id: '',
    description: ''
  });

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/courses?clear=true');
      setCourses(res.data);
    } catch (error) {
      toast.error(t('admin.messages.load_courses_failed'));
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingCourse) {
        await api.put(`/courses/${editingCourse.id}`, formData);
        toast.success(t('common.success'));
      } else {
        await api.post('/courses', formData);
        toast.success(t('common.success'));
      }
      resetForm();
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.messages.operation_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(t('admin.messages.delete_course_confirm', { name }))) return;
    try {
      await api.delete(`/courses/${id}`);
      toast.success(t('common.success'));
      fetchCourses();
    } catch (error) {
      toast.error(t('admin.messages.delete_course_failed'));
    }
  };

  const editCourse = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      code: course.code,
      semester: course.semester?.toString() || '1',
      credits: course.credits?.toString() || '3',
      department_id: course.department_id || '',
      description: course.description || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingCourse(null);
    setFormData({
      name: '',
      code: '',
      semester: '1',
      credits: '3',
      department_id: '',
      description: ''
    });
  };

  const isAr = i18n.language === 'ar';

  // Build a map: department_name → semester → courses[]
  const deptMap = new Map();
  courses.forEach(course => {
    const deptKey = course.department_name || t('admin.students.no_dept');
    const sem = course.semester ?? 1;
    if (!deptMap.has(deptKey)) deptMap.set(deptKey, new Map());
    const semMap = deptMap.get(deptKey);
    if (!semMap.has(sem)) semMap.set(sem, []);
    semMap.get(sem).push(course);
  });

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6 px-4 sm:px-0 text-start">
      <PageHeader
        icon={BookOpen}
        title={t('admin.courses.title')}
        description={t('admin.courses.form_hint')}
        actions={
          <Button onClick={() => setShowForm(true)} className={isAr ? 'font-arabic' : undefined}>
            <Plus className="size-4" />
            {t('admin.courses.add_course')}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label={t('admin.courses.course_nodes')}
          value={courses.length}
          icon={Layers}
          hint={t('admin.courses.validated_modules')}
          accent
        />
        <StatCard
          label={t('admin.courses.validated_modules')}
          value={deptMap.size}
          icon={Tag}
          hint={t('admin.doctors.department')}
        />
      </div>

      {/* Courses grouped by department → semester */}
      {loading && courses.length === 0 ? (
        <LoadingState />
      ) : courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={t('admin.courses.no_courses')}
          action={
            <Button variant="secondary" onClick={() => setShowForm(true)}>
              <Plus className="size-4" />
              {t('admin.courses.add_course')}
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {[...deptMap.entries()].map(([deptName, semMap]) => {
            const moduleCount = [...semMap.values()].flat().length;
            return (
              <SectionCard
                key={deptName}
                title={deptName}
                description={t('admin.doctors.department')}
                actions={
                  <StatusBadge variant="neutral">
                    {moduleCount} {t('admin.courses.course_nodes')}
                  </StatusBadge>
                }
                bodyClassName="p-0"
              >
                {[...semMap.entries()].sort(([a], [b]) => a - b).map(([sem, semCourses], idx) => (
                  <div key={sem} className={idx > 0 ? 'border-t border-border' : undefined}>
                    <div className="flex items-center justify-between gap-3 bg-muted/40 px-4 py-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {t('admin.courses.semester')} {sem}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {semCourses.length}
                      </span>
                    </div>

                    <div className="divide-y divide-border">
                      {semCourses.map((course) => (
                        <div
                          key={course.id}
                          className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/50"
                        >
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                            <Tag className="size-4" />
                          </span>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">
                              {course.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {course.code || '—'}
                            </p>
                          </div>

                          <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
                            <StatusBadge variant="neutral">
                              {t('admin.courses.semester')} {course.semester}
                            </StatusBadge>
                            <StatusBadge variant="neutral">
                              {course.credit_hours || course.credits || 3} {t('admin.courses.credit_hours')}
                            </StatusBadge>
                          </div>

                          <div className="flex shrink-0 items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => editCourse(course)}
                              aria-label={t('admin.courses.edit_course')}
                            >
                              <Edit3 className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleDelete(course.id, course.name)}
                              aria-label={t('common.delete')}
                              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </SectionCard>
            );
          })}
        </div>
      )}

      {/* Create / edit modal */}
      <Modal
        open={showForm}
        onOpenChange={(open) => { if (!open) resetForm(); }}
        size="lg"
        title={editingCourse ? t('admin.courses.edit_course') : t('admin.courses.add_new_course')}
        description={t('admin.courses.form_hint')}
      >
        <AnimatePresence mode="wait">
          <motion.form
            key={editingCourse ? `edit-${editingCourse.id}` : 'create'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label={t('admin.courses.course_name')} htmlFor="course-name" required>
                <Input
                  id="course-name"
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Neural Networks 101"
                  required
                />
              </FormField>

              <FormField label={t('admin.courses.course_code')} htmlFor="course-code" required>
                <Input
                  id="course-code"
                  type="text"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. AI-402"
                  required
                />
              </FormField>

              <FormField label={t('admin.courses.semester')} htmlFor="course-semester">
                <Input
                  id="course-semester"
                  type="number"
                  value={formData.semester}
                  onChange={e => setFormData({ ...formData, semester: e.target.value })}
                  min="1"
                  max="12"
                />
              </FormField>

              <FormField label={t('admin.courses.credit_hours')} htmlFor="course-credits">
                <Input
                  id="course-credits"
                  type="number"
                  value={formData.credits}
                  onChange={e => setFormData({ ...formData, credits: e.target.value })}
                  min="1"
                  max="10"
                />
              </FormField>

              <FormField label={t('admin.doctors.department')} className="sm:col-span-2">
                <Select
                  value={formData.department_id ? String(formData.department_id) : undefined}
                  onValueChange={value => setFormData({ ...formData, department_id: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('admin.students.no_dept')} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(d => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {d.name} ({d.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <FormField
              label={
                <span className="inline-flex items-center gap-2">
                  <AlignLeft className="size-4" />
                  {t('admin.courses.description_label')}
                </span>
              }
              htmlFor="course-description"
            >
              <Textarea
                id="course-description"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('admin.courses.description_placeholder')}
                className="min-h-[100px] resize-none"
              />
            </FormField>

            <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
              <Button type="button" variant="ghost" onClick={resetForm} className="sm:order-1">
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={loading} className="sm:order-2">
                {loading ? t('admin.courses.saving') : (editingCourse ? t('common.save') : t('admin.courses.add_course'))}
              </Button>
            </div>
          </motion.form>
        </AnimatePresence>
      </Modal>
    </div>
  );
};

export default CoursesManager;
