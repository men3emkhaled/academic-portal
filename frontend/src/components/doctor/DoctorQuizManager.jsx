import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Edit3, Trash2, ListChecks, Zap,
    Clock, Target, ShieldCheck, FileText, Save, Microscope, Award
} from 'lucide-react';
import DoctorQuestionManager from './DoctorQuestionManager';
import {
    PageContainer,
    PageHeader,
    SectionCard,
    StatCard,
    StatusBadge,
    EmptyState,
    LoadingState,
    FormField,
    Modal,
} from '@/components/common';
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

const DoctorQuizManager = () => {
    const { doctorApi } = useDoctorAuth();
    const { t } = useTranslation();
    const [quizzes, setQuizzes] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [selectedQuiz, setSelectedQuiz] = useState(null);

    const [formData, setFormData] = useState({
        course_id: '',
        title: '',
        description: '',
        time_limit_minutes: 30,
        passing_score: 50,
        is_published: false,
        is_official: false
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [quizzesRes, coursesRes] = await Promise.all([
                doctorApi('get', '/doctor/quizzes'),
                doctorApi('get', '/doctor/courses')
            ]);
            setQuizzes(quizzesRes.data);
            setCourses(coursesRes.data);
        } catch (err) {
            toast.error(t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingQuiz) {
                await doctorApi('put', `/doctor/quizzes/${editingQuiz.id}`, formData);
                toast.success(t('doctor.quizzes.deleted_success').replace('deleted', 'updated')); // Temporary or add key
            } else {
                await doctorApi('post', '/doctor/quizzes', formData);
                toast.success(t('doctor.quizzes.create_btn') + ' ' + t('common.success'));
            }
            resetForm();
            fetchData();
        } catch (err) {
            toast.error(t('common.error'));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('doctor.quizzes.delete_confirm'))) return;
        try {
            await doctorApi('delete', `/doctor/quizzes/${id}`);
            toast.success(t('doctor.quizzes.deleted_success'));
            fetchData();
        } catch (err) {
            toast.error(t('common.error'));
        }
    };

    const resetForm = () => {
        setFormData({
            course_id: '',
            title: '',
            description: '',
            time_limit_minutes: 30,
            passing_score: 50,
            is_published: false,
            is_official: false
        });
        setEditingQuiz(null);
        setShowFormModal(false);
    };

    const startEdit = (quiz) => {
        setEditingQuiz(quiz);
        setFormData({
            course_id: quiz.course_id,
            title: quiz.title,
            description: quiz.description || '',
            time_limit_minutes: quiz.time_limit_minutes,
            passing_score: quiz.passing_score,
            is_published: quiz.is_published,
            is_official: quiz.is_official
        });
        setShowFormModal(true);
    };

    if (loading) return <LoadingState />;

    // Drill-in to the question manager keeps the original behavior.
    if (selectedQuiz) {
        return (
            <PageContainer size="wide">
                <DoctorQuestionManager quiz={selectedQuiz} onBack={() => setSelectedQuiz(null)} />
            </PageContainer>
        );
    }

    return (
        <PageContainer size="wide">
            <PageHeader
                icon={Award}
                title={t('doctor.quizzes.title')}
                description={t('doctor.quizzes.assessment_center')}
                actions={
                    <Button onClick={() => setShowFormModal(true)}>
                        <Plus className="size-4" />
                        {t('doctor.quizzes.create')}
                    </Button>
                }
            />

            {/* Metrics */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <StatCard label={t('doctor.quizzes.total')} value={quizzes.length} icon={FileText} accent />
                <StatCard label={t('doctor.quizzes.drafts')} value={quizzes.filter(q => !q.is_published).length} icon={Edit3} />
                <StatCard label={t('doctor.quizzes.live')} value={quizzes.filter(q => q.is_published).length} icon={Zap} />
            </div>

            {/* Quiz Grid */}
            <SectionCard title={t('doctor.quizzes.list')} bodyClassName="p-4">
                {quizzes.length === 0 ? (
                    <EmptyState
                        icon={Microscope}
                        title={t('doctor.quizzes.no_found')}
                        action={
                            <Button variant="outline" size="sm" onClick={() => setShowFormModal(true)}>
                                <Plus className="size-4" />
                                {t('doctor.quizzes.create')}
                            </Button>
                        }
                    />
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                        <AnimatePresence>
                            {quizzes.map((quiz) => (
                                <motion.div
                                    layout
                                    key={quiz.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="group flex flex-col rounded-xl border bg-card p-4 transition-colors hover:bg-muted/30"
                                >
                                    <div className="mb-3 flex items-start justify-between gap-2">
                                        <StatusBadge variant="neutral">
                                            {courses.find(c => c.id === quiz.course_id)?.name || 'Course'}
                                        </StatusBadge>
                                        {quiz.is_official && (
                                            <StatusBadge variant="warning" icon={ShieldCheck}>
                                                {t('doctor.quizzes.official')}
                                            </StatusBadge>
                                        )}
                                    </div>

                                    <h4 className="line-clamp-1 text-sm font-semibold text-foreground">
                                        {quiz.title}
                                    </h4>
                                    <p className="mt-1 line-clamp-2 h-10 text-sm text-muted-foreground">
                                        {quiz.description || t('doctor.quizzes.standard_desc')}
                                    </p>

                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        <div className="rounded-lg border bg-background p-3">
                                            <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Clock className="size-3.5" />
                                                <span>{t('common.time')}</span>
                                            </div>
                                            <p className="text-lg font-semibold text-foreground">
                                                {quiz.time_limit_minutes}
                                                <span className="ms-1 text-xs font-normal text-muted-foreground">{t('quizzes.mins')}</span>
                                            </p>
                                        </div>
                                        <div className="rounded-lg border bg-background p-3">
                                            <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Target className="size-3.5" />
                                                <span>{t('quizzes.pass')}</span>
                                            </div>
                                            <p className="text-lg font-semibold text-foreground">
                                                {quiz.passing_score}
                                                <span className="ms-0.5 text-xs font-normal text-muted-foreground">%</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center gap-2">
                                        <Button
                                            onClick={() => setSelectedQuiz(quiz)}
                                            className="flex-1"
                                            size="sm"
                                        >
                                            <ListChecks className="size-4" />
                                            {t('doctor.quizzes.questions_btn')}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon-sm"
                                            onClick={() => startEdit(quiz)}
                                            aria-label={t('doctor.quizzes.edit')}
                                        >
                                            <Edit3 className="size-4" />
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="icon-sm"
                                            onClick={() => handleDelete(quiz.id)}
                                            aria-label={t('common.delete', 'Delete')}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </SectionCard>

            {/* Form Modal */}
            <Modal
                open={showFormModal}
                onOpenChange={(open) => (open ? setShowFormModal(true) : resetForm())}
                size="lg"
                title={editingQuiz ? t('doctor.quizzes.edit') : t('doctor.quizzes.create')}
                description={t('doctor.quizzes.settings')}
                footer={
                    <>
                        <Button type="button" variant="ghost" onClick={resetForm}>
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" form="quiz-form">
                            <Save className="size-4" />
                            {editingQuiz ? t('doctor.quizzes.update_btn') : t('doctor.quizzes.create_btn')}
                        </Button>
                    </>
                }
            >
                <form id="quiz-form" onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField label={t('doctor.quizzes.course_label')} required>
                            <Select
                                value={formData.course_id ? String(formData.course_id) : ''}
                                onValueChange={(value) => setFormData({ ...formData, course_id: value })}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={t('doctor.quizzes.course_label')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map((c) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label={t('doctor.quizzes.quiz_title_label')} htmlFor="quiz-title" required>
                            <Input
                                id="quiz-title"
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Midterm Exam"
                            />
                        </FormField>

                        <FormField label={t('doctor.quizzes.time_limit_label')} htmlFor="quiz-time" required>
                            <Input
                                id="quiz-time"
                                type="number"
                                required
                                value={formData.time_limit_minutes}
                                onChange={(e) => setFormData({ ...formData, time_limit_minutes: parseInt(e.target.value) })}
                            />
                        </FormField>

                        <FormField label={t('doctor.quizzes.passing_score_label')} htmlFor="quiz-pass" required>
                            <Input
                                id="quiz-pass"
                                type="number"
                                required
                                value={formData.passing_score}
                                onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) })}
                            />
                        </FormField>
                    </div>

                    <FormField label={t('doctor.quizzes.desc_label')} htmlFor="quiz-desc">
                        <Textarea
                            id="quiz-desc"
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder={t('doctor.quizzes.desc_placeholder')}
                            className="resize-none"
                        />
                    </FormField>

                    <div className="flex items-center justify-between gap-4 rounded-xl border bg-muted/30 p-4">
                        <div className="flex items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-card text-muted-foreground">
                                <ShieldCheck className="size-4" />
                            </span>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground">{t('doctor.quizzes.official_exam')}</p>
                                <p className="text-xs text-muted-foreground">{t('doctor.quizzes.official_desc')}</p>
                            </div>
                        </div>
                        <Switch
                            checked={formData.is_official}
                            onCheckedChange={(checked) => setFormData({ ...formData, is_official: checked })}
                            aria-label={t('doctor.quizzes.official_exam')}
                        />
                    </div>
                </form>
            </Modal>
        </PageContainer>
    );
};

export default DoctorQuizManager;
