import React from 'react';
import { useTranslation } from 'react-i18next';
import { Edit3, Plus, Calendar, Clock, Target, RotateCcw, Info, Shield, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Modal, FormField, Spinner } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const QuizForm = ({
  quizForm,
  setQuizForm,
  loading,
  editingQuiz,
  handleSaveQuiz,
  resetQuizForm,
  courses
}) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const footer = (
    <>
      <Button type="button" variant="secondary" onClick={resetQuizForm}>
        {t('common.cancel')}
      </Button>
      <Button type="submit" form="quiz-form" disabled={loading}>
        {loading ? <Spinner className="size-4" /> : <Save className="size-4" />}
        {editingQuiz ? t('common.save') : t('admin.quizzes.add_btn')}
      </Button>
    </>
  );

  return (
    <Modal
      open
      onOpenChange={(o) => { if (!o) resetQuizForm(); }}
      size="xl"
      title={
        <span className={cn('flex items-center gap-2.5', isAr && 'font-arabic')}>
          <span className="inline-flex items-center justify-center size-8 rounded-lg bg-primary/10 text-primary shrink-0">
            {editingQuiz ? <Edit3 className="size-4" /> : <Plus className="size-4" />}
          </span>
          {editingQuiz ? t('admin.quizzes.form.edit_title') : t('admin.quizzes.form.add_title')}
        </span>
      }
      footer={footer}
    >
      <form id="quiz-form" onSubmit={handleSaveQuiz} className="space-y-6 text-start">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Info className="size-4 text-primary" />
              <h5 className={cn('text-xs font-medium', isAr && 'font-arabic')}>
                {t('admin.quizzes.form.basic_info')}
              </h5>
            </div>

            <FormField label={t('admin.quizzes.modals.target_course')} htmlFor="quiz-course" required>
              <Select
                value={quizForm.course_id ? String(quizForm.course_id) : undefined}
                onValueChange={(value) => setQuizForm({ ...quizForm, course_id: value })}
              >
                <SelectTrigger id="quiz-course" className="w-full">
                  <SelectValue placeholder={t('admin.quizzes.modals.select_course')} />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name} (S{c.semester})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label={t('admin.quizzes.modals.task_title')} htmlFor="quiz-title" required>
              <Input
                id="quiz-title"
                type="text"
                placeholder={t('admin.quizzes.modals.placeholder_title')}
                value={quizForm.title}
                onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                required
              />
            </FormField>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="size-4 text-primary" />
              <h5 className={cn('text-xs font-medium', isAr && 'font-arabic')}>
                {t('admin.quizzes.form.settings')}
              </h5>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label={t('admin.quizzes.form.time_limit_label')} htmlFor="quiz-time-limit" required>
                <div className="relative">
                  <Input
                    id="quiz-time-limit"
                    type="number"
                    value={quizForm.time_limit_minutes}
                    onChange={(e) => setQuizForm({ ...quizForm, time_limit_minutes: e.target.value })}
                    className="pe-9"
                    required
                  />
                  <Clock className="absolute inset-inline-end-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                </div>
              </FormField>

              <FormField label={t('admin.quizzes.form.passing_grade_label')} htmlFor="quiz-passing-score" required>
                <div className="relative">
                  <Input
                    id="quiz-passing-score"
                    type="number"
                    value={quizForm.passing_score}
                    onChange={(e) => setQuizForm({ ...quizForm, passing_score: e.target.value })}
                    className="pe-9"
                    required
                  />
                  <span className="absolute inset-inline-end-2.5 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground pointer-events-none">%</span>
                </div>
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3 items-end">
              <FormField label={t('admin.quizzes.form.max_attempts')} htmlFor="quiz-max-attempts">
                <div className="relative">
                  <Input
                    id="quiz-max-attempts"
                    type="number"
                    value={quizForm.max_attempts}
                    onChange={(e) => setQuizForm({ ...quizForm, max_attempts: e.target.value })}
                    className="pe-9"
                  />
                  <RotateCcw className="absolute inset-inline-end-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                </div>
              </FormField>

              <label className="flex items-center gap-2.5 cursor-pointer pb-2 w-fit">
                <Switch
                  checked={quizForm.is_official}
                  onCheckedChange={(checked) => setQuizForm({ ...quizForm, is_official: checked })}
                />
                <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Shield className="size-4 text-muted-foreground" />
                  <span className={cn(isAr && 'font-arabic')}>{t('admin.quizzes.official_mode')}</span>
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg border border-border bg-muted/40">
          <FormField
            htmlFor="quiz-start-date"
            label={
              <span className="inline-flex items-center gap-2">
                <Calendar className="size-4 text-primary" />
                {t('admin.quizzes.form.start_date')}
              </span>
            }
          >
            <Input
              id="quiz-start-date"
              type="datetime-local"
              value={quizForm.start_date}
              onChange={(e) => setQuizForm({ ...quizForm, start_date: e.target.value })}
            />
          </FormField>

          <FormField
            htmlFor="quiz-end-date"
            label={
              <span className="inline-flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" />
                {t('admin.quizzes.form.end_date')}
              </span>
            }
          >
            <Input
              id="quiz-end-date"
              type="datetime-local"
              value={quizForm.end_date}
              onChange={(e) => setQuizForm({ ...quizForm, end_date: e.target.value })}
            />
          </FormField>
        </div>

        {/* Description */}
        <FormField label={t('admin.quizzes.form.description_label')} htmlFor="quiz-description">
          <Textarea
            id="quiz-description"
            placeholder={t('admin.quizzes.modals.placeholder_desc')}
            value={quizForm.description}
            onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
            rows={3}
            className="min-h-28 resize-none"
          />
        </FormField>
      </form>
    </Modal>
  );
};

export default QuizForm;
