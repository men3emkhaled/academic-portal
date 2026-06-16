import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ClipboardList, Plus, Edit3, Trash2, Users, ExternalLink,
    Calendar, CheckCircle2, Clock, ChevronLeft, Save,
    Target, BarChart3, BookOpen, UploadCloud, Inbox, FileX,
} from 'lucide-react';

import {
    StatCard,
    SectionCard,
    DataTable,
    Modal,
    FormField,
    StatusBadge,
    EmptyState,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const DoctorTaskManager = ({ courses }) => {
    const { doctorApi } = useDoctorAuth();
    const [tasks, setTasks] = useState([]);
    const [editingTask, setEditingTask] = useState(null);
    const [selectedTaskForSubmissions, setSelectedTaskForSubmissions] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submissionsLoading, setSubmissionsLoading] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);

    const [formData, setFormData] = useState({
        course_id: '',
        title: '',
        description: '',
        deadline: '',
        drive_link: '',
        requires_submission: false
    });

    const [gradingData, setGradingData] = useState({
        grade: '',
        feedback: ''
    });
    const [gradingStudent, setGradingStudent] = useState(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await doctorApi('get', '/doctor/tasks');
            setTasks(res.data);
        } catch (err) {
            toast.error('Failed to load tasks');
        }
    };

    const fetchSubmissions = async (taskId) => {
        setSubmissionsLoading(true);
        try {
            const res = await doctorApi('get', `/doctor/tasks/${taskId}/submissions`);
            setSubmissions(res.data);
        } catch (err) {
            toast.error('Failed to load submissions');
        } finally {
            setSubmissionsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.course_id || !formData.title) {
            return toast.error('Course and Title are required');
        }

        setLoading(true);
        try {
            if (editingTask) {
                await doctorApi('put', `/doctor/tasks/${editingTask.id}`, formData);
                toast.success('Task updated');
            } else {
                await doctorApi('post', '/doctor/tasks', formData);
                toast.success('Task created');
            }
            resetForm();
            fetchTasks();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save task');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this task? Student work will be lost.')) return;
        try {
            await doctorApi('delete', `/doctor/tasks/${id}`);
            toast.success('Task deleted');
            if (selectedTaskForSubmissions && selectedTaskForSubmissions.id === id) {
                setSelectedTaskForSubmissions(null);
            }
            fetchTasks();
        } catch (err) {
            toast.error('Failed to delete task');
        }
    };

    const handleGradeSubmission = async (e) => {
        e.preventDefault();
        if (!gradingStudent || !selectedTaskForSubmissions) return;

        try {
            await doctorApi('post', `/doctor/tasks/${selectedTaskForSubmissions.id}/submissions/${gradingStudent.student_id}/grade`, gradingData);
            toast.success('Grade submitted');
            setGradingStudent(null);
            fetchSubmissions(selectedTaskForSubmissions.id);
        } catch (err) {
            toast.error('Failed to submit grade');
        }
    };

    const resetForm = () => {
        setEditingTask(null);
        setFormData({
            course_id: '',
            title: '',
            description: '',
            deadline: '',
            drive_link: '',
            requires_submission: false
        });
        setShowFormModal(false);
    };

    const startEdit = (t) => {
        setEditingTask(t);
        const deadlineStr = t.deadline ? new Date(t.deadline).toISOString().slice(0, 16) : '';
        setFormData({
            course_id: t.course_id,
            title: t.title,
            description: t.description || '',
            deadline: deadlineStr,
            drive_link: t.drive_link || '',
            requires_submission: t.requires_submission || false
        });
        setShowFormModal(true);
    };

    const openSubmissions = (task) => {
        setSelectedTaskForSubmissions(task);
        fetchSubmissions(task.id);
    };

    // ===================== Submissions / Grading view =====================
    if (selectedTaskForSubmissions) {
        const gradedCount = submissions.filter(s => s.grade).length;

        const submissionColumns = [
            {
                key: 'student',
                header: 'Student',
                render: (sub) => (
                    <div className="flex items-center gap-3">
                        <Avatar size="sm" className="shrink-0">
                            <AvatarImage src={sub.avatar_url} alt={sub.student_name} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                                {(sub.student_name || '?').charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{sub.student_name}</p>
                            <p className="truncate text-xs text-muted-foreground">ID: {sub.student_id}</p>
                        </div>
                    </div>
                ),
            },
            {
                key: 'status',
                header: 'Status',
                render: (sub) => (
                    sub.is_completed ? (
                        <StatusBadge variant="success" icon={CheckCircle2}>Submitted</StatusBadge>
                    ) : (
                        <StatusBadge variant="warning" icon={Clock}>Pending</StatusBadge>
                    )
                ),
            },
            {
                key: 'material',
                header: 'Material',
                render: (sub) => (
                    sub.submission_url ? (
                        <a
                            href={sub.submission_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                        >
                            <ExternalLink className="size-3.5" /> View Work
                        </a>
                    ) : (
                        <span className="text-sm text-muted-foreground">No Link</span>
                    )
                ),
            },
            {
                key: 'result',
                header: 'Result',
                render: (sub) => (
                    sub.grade ? (
                        <span className="inline-flex items-center rounded-md border bg-muted px-2 py-0.5 text-sm font-medium text-foreground">
                            {sub.grade}
                        </span>
                    ) : (
                        <span className="text-sm text-muted-foreground">Awaiting</span>
                    )
                ),
            },
            {
                key: 'actions',
                header: '',
                headClassName: 'text-end',
                cellClassName: 'text-end',
                render: (sub) => (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setGradingStudent(sub);
                            setGradingData({ grade: sub.grade || '', feedback: sub.feedback || '' });
                        }}
                    >
                        Grade
                    </Button>
                ),
            },
        ];

        return (
            <div className="space-y-6">
                {/* Context Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => { setSelectedTaskForSubmissions(null); setGradingStudent(null); }}
                            aria-label="Back to tasks"
                        >
                            <ChevronLeft className="size-4 rtl:rotate-180" />
                        </Button>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h1 className="truncate text-xl font-semibold tracking-tight text-foreground">
                                    {selectedTaskForSubmissions.title}
                                </h1>
                                <StatusBadge variant="accent">Submissions</StatusBadge>
                            </div>
                            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Users className="size-3.5" /> Grading mode
                            </p>
                        </div>
                    </div>

                    <div className="grid shrink-0 grid-cols-2 gap-3">
                        <StatCard label="Total" value={submissions.length} icon={Users} />
                        <StatCard label="Graded" value={gradedCount} icon={CheckCircle2} accent />
                    </div>
                </div>

                {/* Submissions Table */}
                <SectionCard title="Submissions" bodyClassName="p-0">
                    <DataTable
                        columns={submissionColumns}
                        rows={submissions}
                        getRowKey={(sub) => sub.student_id}
                        loading={submissionsLoading}
                        className="rounded-none border-0"
                        empty={
                            <EmptyState
                                icon={Inbox}
                                title="No submissions found"
                                description="No students have submitted work for this task yet."
                            />
                        }
                    />
                </SectionCard>

                {/* Grading Modal */}
                <Modal
                    open={!!gradingStudent}
                    onOpenChange={(open) => { if (!open) setGradingStudent(null); }}
                    size="sm"
                    title="Grade Assignment"
                    description={gradingStudent?.student_name}
                    footer={
                        <>
                            <Button type="button" variant="ghost" onClick={() => setGradingStudent(null)}>
                                Cancel
                            </Button>
                            <Button type="submit" form="grading-form">
                                <Save className="size-4" /> Save Grade
                            </Button>
                        </>
                    }
                >
                    <form id="grading-form" onSubmit={handleGradeSubmission} className="space-y-4">
                        <FormField label="Grade / Score" htmlFor="grade-score">
                            <Input
                                id="grade-score"
                                type="text"
                                placeholder="e.g. 10/10"
                                value={gradingData.grade}
                                onChange={(e) => setGradingData({ ...gradingData, grade: e.target.value })}
                                autoFocus
                            />
                        </FormField>
                        <FormField label="Feedback" htmlFor="grade-feedback">
                            <Textarea
                                id="grade-feedback"
                                rows={4}
                                placeholder="Good work..."
                                value={gradingData.feedback}
                                onChange={(e) => setGradingData({ ...gradingData, feedback: e.target.value })}
                                className="resize-none"
                            />
                        </FormField>
                    </form>
                </Modal>
            </div>
        );
    }

    // ===================== Task list view =====================
    const stats = [
        { label: 'Active Tasks', value: tasks.length, icon: Target, accent: true },
        { label: 'Need Grading', value: tasks.filter(t => t.requires_submission).length, icon: BarChart3 },
        { label: 'Total Courses', value: courses.length, icon: BookOpen },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border bg-card text-muted-foreground">
                        <ClipboardList className="size-4" />
                    </span>
                    <div className="min-w-0">
                        <h1 className="truncate text-xl font-semibold tracking-tight text-foreground">Task Hub</h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">Assignment manager</p>
                    </div>
                </div>
                <Button onClick={() => setShowFormModal(true)} className="shrink-0">
                    <Plus className="size-4" /> Add Task
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {stats.map((stat) => (
                    <StatCard
                        key={stat.label}
                        label={stat.label}
                        value={stat.value}
                        icon={stat.icon}
                        accent={stat.accent}
                    />
                ))}
            </div>

            {/* Tasks Grid */}
            {tasks.length === 0 ? (
                <EmptyState
                    icon={FileX}
                    title="No active tasks"
                    description="Create your first assignment to get started."
                    action={
                        <Button onClick={() => setShowFormModal(true)}>
                            <Plus className="size-4" /> Add Task
                        </Button>
                    }
                />
            ) : (
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key="task-grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
                    >
                        {tasks.map(task => {
                            const isOverdue = task.deadline && new Date(task.deadline) < new Date();
                            return (
                                <SectionCard key={task.id} bodyClassName="p-4 space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <StatusBadge variant="neutral">{task.course_name}</StatusBadge>
                                            {task.requires_submission && (
                                                <StatusBadge variant="accent" icon={UploadCloud}>Uploads</StatusBadge>
                                            )}
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => startEdit(task)}
                                                aria-label="Edit task"
                                            >
                                                <Edit3 className="size-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => handleDelete(task.id)}
                                                aria-label="Delete task"
                                                className="text-muted-foreground hover:text-destructive"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
                                        {task.title}
                                    </h3>

                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                                        <span className="inline-flex items-center gap-1.5">
                                            <Calendar className={`size-4 shrink-0 ${isOverdue ? 'text-destructive' : ''}`} />
                                            <span className={isOverdue ? 'text-destructive' : ''}>
                                                Due: {task.deadline ? new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No date'}
                                            </span>
                                        </span>
                                        {task.drive_link && (
                                            <a
                                                href={task.drive_link}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 text-primary hover:underline"
                                            >
                                                <ExternalLink className="size-4 shrink-0" /> Link
                                            </a>
                                        )}
                                    </div>

                                    <p className="line-clamp-2 text-sm text-muted-foreground">
                                        {task.description || 'No detailed instructions provided.'}
                                    </p>

                                    <div className="border-t border-border pt-3">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => openSubmissions(task)}
                                        >
                                            <Users className="size-4" /> Submissions
                                        </Button>
                                    </div>
                                </SectionCard>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Task Form Modal */}
            <Modal
                open={showFormModal}
                onOpenChange={(open) => (open ? setShowFormModal(true) : resetForm())}
                size="lg"
                title={editingTask ? 'Edit Task' : 'Add New Task'}
                description="Assignment details"
                footer={
                    <>
                        <Button type="button" variant="ghost" onClick={resetForm}>
                            Cancel
                        </Button>
                        <Button type="submit" form="task-form" disabled={loading}>
                            <Save className="size-4" />
                            {editingTask ? 'Update Task' : 'Publish Task'}
                        </Button>
                    </>
                }
            >
                <form id="task-form" onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField label="Course" required>
                            <Select
                                value={formData.course_id ? String(formData.course_id) : ''}
                                onValueChange={(value) => setFormData({ ...formData, course_id: value })}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select course" />
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

                        <FormField label="Due Date" htmlFor="task-deadline">
                            <Input
                                id="task-deadline"
                                type="datetime-local"
                                value={formData.deadline}
                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                            />
                        </FormField>
                    </div>

                    <FormField label="Task Title" htmlFor="task-title" required>
                        <Input
                            id="task-title"
                            type="text"
                            required
                            placeholder="e.g. Final Research Project"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </FormField>

                    <FormField label="Instructions" htmlFor="task-description">
                        <Textarea
                            id="task-description"
                            rows={4}
                            placeholder="Describe the requirements..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="resize-none"
                        />
                    </FormField>

                    <FormField label="Link (Optional)" htmlFor="task-link">
                        <Input
                            id="task-link"
                            type="url"
                            placeholder="Drive or Docs link"
                            value={formData.drive_link}
                            onChange={(e) => setFormData({ ...formData, drive_link: e.target.value })}
                        />
                    </FormField>

                    <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 p-4">
                        <div className="flex items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-card text-muted-foreground">
                                <UploadCloud className="size-4" />
                            </span>
                            <div>
                                <p className="text-sm font-medium text-foreground">Allow Uploads</p>
                                <p className="text-xs text-muted-foreground">Enable file submission</p>
                            </div>
                        </div>
                        <Switch
                            checked={formData.requires_submission}
                            onCheckedChange={(checked) => setFormData({ ...formData, requires_submission: checked })}
                            aria-label="Allow Uploads"
                        />
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default DoctorTaskManager;
