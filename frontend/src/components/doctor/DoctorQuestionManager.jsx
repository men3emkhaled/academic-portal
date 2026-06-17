import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Edit3, Trash2, ListChecks, Save,
  CheckCircle2, UploadCloud, Eye, HelpCircle
} from 'lucide-react';
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
import {
  PageHeader,
  SectionCard,
  FormField,
  EmptyState,
  StatusBadge,
  Spinner,
} from '@/components/common';

const DoctorQuestionManager = ({ quiz, onBack }) => {
    const { t } = useTranslation();
    const { doctorApi } = useDoctorAuth();
    const [questions, setQuestions] = useState([]);
    const [editingQuestion, setEditingQuestion] = useState(null);

    const [formData, setFormData] = useState({
        question_text: '',
        question_type: 'multiple_choice',
        options: ['', '', '', ''],
        correct_answer: '0',
        points: 1,
        explanation: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchQuestions();
    }, [quiz.id]);

    const fetchQuestions = async () => {
        try {
            const res = await doctorApi('get', `/doctor/quizzes/${quiz.id}/questions`);
            setQuestions(res.data);
        } catch (err) {
            toast.error(t('doctor.questions.load_failed'));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.question_text.trim()) return toast.error(t('doctor.questions.text_required'));

        setLoading(true);
        try {
            let imageUrl = null;
            if (imageFile) {
                const fileName = `${Date.now()}-${imageFile.name}`;
                const { error } = await supabase.storage
                    .from('quiz-images')
                    .upload(fileName, imageFile);
                if (error) throw error;
                const { data } = supabase.storage.from('quiz-images').getPublicUrl(fileName);
                imageUrl = data.publicUrl;
            }

            const payload = { ...formData };
            if (imageUrl) payload.image_url = imageUrl;

            if (payload.question_type === 'true_false') {
                payload.options = ['True', 'False'];
                if (payload.correct_answer !== 'True' && payload.correct_answer !== 'False') {
                    payload.correct_answer = 'True';
                }
            } else if (payload.question_type === 'written') {
                payload.options = [];
                payload.correct_answer = '';
            }

            if (editingQuestion) {
                if (!imageUrl) payload.image_url = editingQuestion.image_url;
                await doctorApi('put', `/doctor/quizzes/${quiz.id}/questions/${editingQuestion.id}`, payload);
                toast.success(t('doctor.questions.update_success'));
            } else {
                await doctorApi('post', `/doctor/quizzes/${quiz.id}/questions`, payload);
                toast.success(t('doctor.questions.add_success'));
            }

            resetForm();
            fetchQuestions();
        } catch (err) {
            toast.error(err.response?.data?.message || t('doctor.questions.save_failed'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('doctor.questions.delete_confirm'))) return;
        try {
            await doctorApi('delete', `/doctor/quizzes/${quiz.id}/questions/${id}`);
            toast.success(t('doctor.questions.delete_success'));
            fetchQuestions();
        } catch (err) {
            toast.error(t('doctor.questions.delete_failed'));
        }
    };

    const resetForm = () => {
        setEditingQuestion(null);
        setFormData({
            question_text: '',
            question_type: 'multiple_choice',
            options: ['', '', '', ''],
            correct_answer: '0',
            points: 1,
            explanation: ''
        });
        setImageFile(null);
    };

    const startEdit = (q) => {
        setEditingQuestion(q);
        setFormData({
            question_text: q.question_text,
            question_type: q.question_type,
            options: q.options || ['', '', '', ''],
            correct_answer: q.correct_answer || '0',
            points: q.points,
            explanation: q.explanation || ''
        });
        setImageFile(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...formData.options];
        newOptions[index] = value;
        setFormData({ ...formData, options: newOptions });
    };

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <PageHeader
                icon={ListChecks}
                title={quiz.title}
                description={t('doctor.questions.edit_mode')}
                actions={
                    <>
                        <StatusBadge variant="accent">{t('doctor.questions.title_suffix')}</StatusBadge>
                        <Button variant="outline" size="sm" onClick={onBack}>
                            <ArrowLeft className="size-4" />
                            <span>{t('common.back', 'Back')}</span>
                        </Button>
                    </>
                }
            />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                {/* Form Column */}
                <div className="xl:col-span-4">
                    <div className="xl:sticky xl:top-6">
                        <SectionCard
                            title={editingQuestion ? t('doctor.questions.edit_question') : t('doctor.questions.add_question')}
                            actions={
                                <span className="flex size-7 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                                    {editingQuestion ? <Edit3 className="size-4" /> : <Plus className="size-4" />}
                                </span>
                            }
                            bodyClassName="p-5"
                        >
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField label={t('doctor.questions.type_label')} htmlFor="question_type">
                                        <Select
                                            value={formData.question_type}
                                            onValueChange={(value) => setFormData({ ...formData, question_type: value })}
                                        >
                                            <SelectTrigger id="question_type" className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="multiple_choice">MCQ</SelectItem>
                                                <SelectItem value="true_false">True / False</SelectItem>
                                                <SelectItem value="written">Written</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormField>

                                    <FormField label={t('doctor.questions.points_label')} htmlFor="points">
                                        <Input
                                            id="points"
                                            type="number"
                                            min="1"
                                            value={formData.points}
                                            onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                                            required
                                        />
                                    </FormField>
                                </div>

                                <FormField label={t('doctor.questions.text_label')} htmlFor="question_text">
                                    <Textarea
                                        id="question_text"
                                        value={formData.question_text}
                                        onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                                        className="min-h-28 resize-none"
                                        placeholder={t('doctor.questions.text_placeholder')}
                                        required
                                    />
                                </FormField>

                                <FormField label={t('doctor.questions.image_label')}>
                                    <div className={`group relative flex min-h-24 w-full flex-col items-center justify-center rounded-lg border border-dashed transition-colors ${imageFile ? 'border-primary/40 bg-primary/5' : 'border-border bg-muted/30 hover:border-primary/40'}`}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setImageFile(e.target.files[0])}
                                            className="absolute inset-0 size-full cursor-pointer opacity-0"
                                        />
                                        {imageFile ? (
                                            <div className="flex items-center gap-2 px-4 text-primary">
                                                <CheckCircle2 className="size-4" />
                                                <span className="max-w-[180px] truncate text-sm font-medium">{imageFile.name}</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                                                <UploadCloud className="size-5 transition-colors group-hover:text-primary" />
                                                <span className="text-xs">{t('doctor.questions.upload_hint')}</span>
                                            </div>
                                        )}
                                    </div>
                                </FormField>

                                {formData.question_type === 'multiple_choice' && (
                                    <FormField label={t('doctor.questions.options_label')}>
                                        <div className="space-y-2">
                                            {formData.options.map((opt, i) => (
                                                <div key={i} className={`flex items-center gap-3 rounded-lg border p-2.5 transition-colors ${formData.correct_answer === String(i) ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'}`}>
                                                    <input
                                                        type="radio"
                                                        name="correct_answer"
                                                        checked={formData.correct_answer === String(i)}
                                                        onChange={() => setFormData({ ...formData, correct_answer: String(i) })}
                                                        className="size-4 accent-primary cursor-pointer"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={opt}
                                                        onChange={(e) => handleOptionChange(i, e.target.value)}
                                                        placeholder={`${t('doctor.questions.option_placeholder')} ${i + 1}`}
                                                        className="flex-1 border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                                                        required
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </FormField>
                                )}

                                {formData.question_type === 'true_false' && (
                                    <FormField label={t('doctor.questions.options_label')}>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['True', 'False'].map((val) => (
                                                <button
                                                    key={val}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, correct_answer: val })}
                                                    className={`rounded-lg border py-2.5 text-sm font-medium transition-colors ${formData.correct_answer === val ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
                                                >
                                                    {val}
                                                </button>
                                            ))}
                                        </div>
                                    </FormField>
                                )}

                                <div className="flex gap-2 pt-2">
                                    <Button type="submit" disabled={loading} className="flex-1">
                                        {loading ? (
                                            <Spinner className="text-primary-foreground" />
                                        ) : (
                                            <>
                                                <Save className="size-4" />
                                                <span>{t('doctor.questions.save_btn')}</span>
                                            </>
                                        )}
                                    </Button>
                                    {editingQuestion && (
                                        <Button type="button" variant="outline" onClick={resetForm}>
                                            {t('common.cancel')}
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </SectionCard>
                    </div>
                </div>

                {/* List Column */}
                <div className="xl:col-span-8">
                    <SectionCard
                        title={t('doctor.questions.list_title')}
                        description={`${questions.length} ${t('doctor.questions.items_suffix')}`}
                        actions={
                            <StatusBadge variant="success" icon={CheckCircle2}>
                                {t('doctor.questions.auto_save')}
                            </StatusBadge>
                        }
                        bodyClassName="p-4"
                    >
                        {questions.length === 0 ? (
                            <EmptyState
                                icon={HelpCircle}
                                title={t('doctor.questions.no_found')}
                            />
                        ) : (
                            <div className="space-y-3">
                                <AnimatePresence initial={false}>
                                    {questions.map((q, idx) => (
                                        <motion.div
                                            key={q.id}
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.15 }}
                                            className="group rounded-lg border bg-card p-4 transition-colors hover:bg-muted/30"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex min-w-0 flex-1 items-start gap-3">
                                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted text-sm font-medium text-muted-foreground">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="mb-2 flex flex-wrap gap-1.5">
                                                            <StatusBadge variant="neutral">
                                                                {q.question_type.replace('_', ' ')}
                                                            </StatusBadge>
                                                            <StatusBadge variant="accent">
                                                                {q.points} {t('doctor.questions.points_suffix')}
                                                            </StatusBadge>
                                                        </div>
                                                        <h4 className="mb-3 text-sm font-medium leading-relaxed text-foreground">
                                                            {q.question_text}
                                                        </h4>

                                                        {q.image_url && (
                                                            <div className="group/img relative mb-3 inline-block">
                                                                <img src={q.image_url} alt="Question" className="max-h-48 rounded-lg border object-cover" />
                                                                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 opacity-0 transition-opacity group-hover/img:opacity-100">
                                                                    <Eye className="size-6 text-white" />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {q.question_type === 'multiple_choice' && (
                                                            <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                                                                {q.options?.map((opt, i) => (
                                                                    <div key={i} className={`rounded-md border p-2.5 text-sm transition-colors ${q.correct_answer === String(i) ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border bg-muted/30 text-muted-foreground'}`}>
                                                                        <span className="me-2 opacity-50">{String.fromCharCode(65 + i)}.</span>{opt}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {q.question_type === 'true_false' && (
                                                            <div className="mt-3">
                                                                <StatusBadge variant="success" icon={CheckCircle2}>
                                                                    {t('doctor.questions.correct_answer')}: {q.correct_answer}
                                                                </StatusBadge>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex shrink-0 flex-col gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <Button variant="ghost" size="icon-sm" onClick={() => startEdit(q)} aria-label={t('doctor.questions.edit_question')}>
                                                        <Edit3 className="size-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(q.id)} className="text-muted-foreground hover:text-destructive" aria-label="Delete">
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </SectionCard>
                </div>
            </div>
        </div>
    );
};

export default DoctorQuestionManager;
