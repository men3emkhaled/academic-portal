import React from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle, ImageIcon, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Modal, FormField } from '@/components/common';
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

const QuestionForm = ({
  questionForm,
  setQuestionForm,
  loading,
  editingQuestion,
  handleSaveQuestion,
  resetQuestionForm,
  handleOptionChange
}) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  return (
    <Modal
      open
      onOpenChange={(next) => { if (!next) resetQuestionForm(); }}
      size="xl"
      title={
        <span className="flex items-center gap-2.5">
          <span className="inline-flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <HelpCircle className="size-4" />
          </span>
          {editingQuestion
            ? t('admin.quizzes.questions.form.edit_title')
            : t('admin.quizzes.questions.form.add_title')}
        </span>
      }
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" onClick={resetQuestionForm}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="question-form" disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {editingQuestion ? t('common.save') : t('admin.quizzes.questions.add_success')}
          </Button>
        </div>
      }
    >
      <form id="question-form" onSubmit={handleSaveQuestion} className="space-y-5">
        <FormField label={t('admin.quizzes.questions.form.question_text')} required htmlFor="question_text">
          <Textarea
            id="question_text"
            placeholder={t('admin.quizzes.questions.form.question_placeholder')}
            value={questionForm.question_text}
            onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
            className="min-h-28"
            required
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField label={t('admin.quizzes.questions.form.image_url')} htmlFor="image_url">
            <div className="relative">
              <ImageIcon className="pointer-events-none absolute inset-inline-start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="image_url"
                type="text"
                placeholder="https://..."
                value={questionForm.image_url}
                onChange={(e) => setQuestionForm({ ...questionForm, image_url: e.target.value })}
                className="ps-9"
              />
            </div>
          </FormField>

          <FormField label={t('admin.quizzes.questions.form.question_type')}>
            <Select
              value={questionForm.question_type}
              onValueChange={(value) => setQuestionForm({ ...questionForm, question_type: value })}
            >
              <SelectTrigger className="h-8 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mcq">{t('admin.quizzes.questions.form.types.mcq')}</SelectItem>
                <SelectItem value="true_false">{t('admin.quizzes.questions.form.types.true_false')}</SelectItem>
                <SelectItem value="written">{t('admin.quizzes.questions.form.types.written')}</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>

        {questionForm.question_type === 'mcq' && (
          <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
            <h4 className={cn('text-sm font-medium text-foreground', isAr && 'font-arabic')}>
              {t('admin.quizzes.questions.form.answer_options')}
            </h4>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {questionForm.options.map((opt, idx) => {
                const letter = String.fromCharCode(65 + idx);
                return (
                  <div key={idx} className="relative">
                    <span className="pointer-events-none absolute inset-inline-start-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                      {letter}
                    </span>
                    <Input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      className="ps-8"
                      placeholder={t('admin.quizzes.questions.form.option_placeholder', { letter })}
                      required
                    />
                  </div>
                );
              })}
            </div>
            <FormField label={t('admin.quizzes.questions.form.correct_answer')} className="pt-1">
              <div className="flex flex-wrap gap-2">
                {['A', 'B', 'C', 'D'].map((letter) => (
                  <Button
                    key={letter}
                    type="button"
                    size="sm"
                    variant={questionForm.correct_answer === letter ? 'default' : 'outline'}
                    onClick={() => setQuestionForm({ ...questionForm, correct_answer: letter })}
                    className="w-12"
                  >
                    {letter}
                  </Button>
                ))}
              </div>
            </FormField>
          </div>
        )}

        {questionForm.question_type === 'true_false' && (
          <FormField label={t('admin.quizzes.questions.form.correct_answer')}>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={questionForm.correct_answer === 'true' ? 'default' : 'outline'}
                onClick={() => setQuestionForm({ ...questionForm, correct_answer: 'true' })}
              >
                {t('admin.quizzes.questions.form.true')}
              </Button>
              <Button
                type="button"
                variant={questionForm.correct_answer === 'false' ? 'destructive' : 'outline'}
                onClick={() => setQuestionForm({ ...questionForm, correct_answer: 'false' })}
              >
                {t('admin.quizzes.questions.form.false')}
              </Button>
            </div>
          </FormField>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormField label={t('admin.quizzes.questions.form.points')} htmlFor="points">
            <Input
              id="points"
              type="number"
              value={questionForm.points}
              onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) || 1 })}
              min="1"
              required
            />
          </FormField>
          <FormField
            label={t('admin.quizzes.questions.form.explanation')}
            htmlFor="explanation"
            className="md:col-span-2"
          >
            <Input
              id="explanation"
              type="text"
              placeholder={t('admin.quizzes.questions.form.explanation_placeholder')}
              value={questionForm.explanation}
              onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
            />
          </FormField>
        </div>
      </form>
    </Modal>
  );
};

export default QuestionForm;
