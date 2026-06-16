import React from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { HelpCircle, Plus, Edit3, Trash2, CheckCircle2, ImageIcon } from 'lucide-react';
import { PageHeader, SectionCard, EmptyState, StatusBadge } from '@/components/common';
import { Button } from '@/components/ui/button';

const QuestionBank = ({ questions, setShowQuestionForm, editQuestion, handleDeleteQuestion }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={HelpCircle}
        title={t('admin.quizzes.questions_tab', { count: questions.length })}
        description={t('admin.quizzes.registry_stream')}
        actions={
          <Button onClick={() => setShowQuestionForm(true)}>
            <Plus className="size-4" />
            {t('admin.quizzes.questions.add_success')}
          </Button>
        }
      />

      {questions.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title={t('admin.quizzes.no_quizzes')}
          description={t('admin.quizzes.workspace_idle_desc')}
          action={
            <Button variant="secondary" onClick={() => setShowQuestionForm(true)}>
              <Plus className="size-4" />
              {t('admin.quizzes.questions.add_success')}
            </Button>
          }
        />
      ) : (
        <SectionCard bodyClassName="p-0">
          <ul className="divide-y divide-border">
            <AnimatePresence initial={false}>
              {questions.map((q, idx) => (
                <motion.li
                  key={q.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="group/row px-4 py-3 text-start transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border bg-muted text-xs font-medium text-muted-foreground">
                      {idx + 1}
                    </span>

                    <div className="min-w-0 flex-1 space-y-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge variant="neutral">
                              {q.question_type.toUpperCase()}
                            </StatusBadge>
                            <span className="text-xs text-muted-foreground">
                              {t('admin.quizzes.questions.points_label', { count: q.points })}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-foreground leading-relaxed">
                            {q.question_text}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover/row:opacity-100 focus-within:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => editQuestion(q)}
                          >
                            <Edit3 className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDeleteQuestion(q)}
                            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>

                      {q.image_url && (
                        <div className="relative overflow-hidden rounded-lg border">
                          <img
                            src={q.image_url}
                            alt="Question visual"
                            className="h-44 w-full object-cover"
                          />
                          <div className="absolute top-2 inset-inline-end-2">
                            <StatusBadge variant="neutral" icon={ImageIcon} className="bg-card/90">
                              {t('admin.quizzes.authorized_entities')}
                            </StatusBadge>
                          </div>
                        </div>
                      )}

                      {q.question_type === 'mcq' && q.options && (
                        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                          {q.options.map((opt, i) => {
                            const letter = String.fromCharCode(65 + i);
                            const isCorrect = q.correct_answer === letter;
                            return (
                              <div
                                key={i}
                                className={`flex items-center gap-2.5 rounded-md border px-3 py-2 text-sm ${
                                  isCorrect
                                    ? 'border-primary/20 bg-primary/10 text-primary'
                                    : 'border-border bg-muted/40 text-muted-foreground'
                                }`}
                              >
                                <span
                                  className={`flex size-5 shrink-0 items-center justify-center rounded text-xs font-medium ${
                                    isCorrect
                                      ? 'bg-primary text-primary-foreground'
                                      : 'bg-muted text-muted-foreground'
                                  }`}
                                >
                                  {letter}
                                </span>
                                <span className="truncate">{opt}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {q.question_type === 'true_false' && (
                        <div className="flex gap-2">
                          {['true', 'false'].map((val) => {
                            const isCorrect = q.correct_answer === val;
                            return (
                              <div
                                key={val}
                                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium ${
                                  isCorrect
                                    ? 'border-primary/20 bg-primary/10 text-primary'
                                    : 'border-border bg-muted/40 text-muted-foreground'
                                }`}
                              >
                                {isCorrect && <CheckCircle2 className="size-4" />}
                                {val.toUpperCase()}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {q.explanation && (
                        <div className="flex gap-2.5 rounded-md border bg-muted/40 px-3 py-2.5">
                          <HelpCircle className="size-4 shrink-0 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </SectionCard>
      )}
    </div>
  );
};

export default QuestionBank;
