import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ClipboardList, Plus, Edit3, Trash2, Users, ExternalLink,
    Calendar, CheckCircle2, Clock, ChevronLeft, Save,
    X, AlertCircle, FileText, Search, Filter, BookOpen, Send,
    Layout, Zap, Target, BarChart3, Microscope, UploadCloud, ShieldCheck
} from 'lucide-react';

const DoctorTaskManager = ({ courses }) => {
    const { t } = useTranslation();
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
            toast.error(t('doctor.tasks.failed_load'));
        }
    };

    const fetchSubmissions = async (taskId) => {
        setSubmissionsLoading(true);
        try {
            const res = await doctorApi('get', `/doctor/tasks/${taskId}/submissions`);
            setSubmissions(res.data);
        } catch (err) {
            toast.error(t('doctor.tasks.failed_load_submissions'));
        } finally {
            setSubmissionsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.course_id || !formData.title) {
            return toast.error(t('doctor.tasks.course_and_title_required'));
        }

        setLoading(true);
        try {
            if (editingTask) {
                await doctorApi('put', `/doctor/tasks/${editingTask.id}`, formData);
                toast.success(t('doctor.tasks.task_updated'));
            } else {
                await doctorApi('post', '/doctor/tasks', formData);
                toast.success(t('doctor.tasks.task_created'));
            }
            resetForm();
            fetchTasks();
        } catch (err) {
            toast.error(err.response?.data?.message || t('doctor.tasks.failed_save'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('doctor.tasks.delete_confirm'))) return;
        try {
            await doctorApi('delete', `/doctor/tasks/${id}`);
            toast.success(t('doctor.tasks.task_deleted'));
            if (selectedTaskForSubmissions && selectedTaskForSubmissions.id === id) {
                setSelectedTaskForSubmissions(null);
            }
            fetchTasks();
        } catch (err) {
            toast.error(t('doctor.tasks.failed_delete'));
        }
    };

    const handleGradeSubmission = async (e) => {
        e.preventDefault();
        if (!gradingStudent || !selectedTaskForSubmissions) return;

        try {
            await doctorApi('post', `/doctor/tasks/${selectedTaskForSubmissions.id}/submissions/${gradingStudent.student_id}/grade`, gradingData);
            toast.success(t('doctor.tasks.grade_submitted'));
            setGradingStudent(null);
            fetchSubmissions(selectedTaskForSubmissions.id);
        } catch (err) {
            toast.error(t('doctor.tasks.failed_grade'));
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
    };

    if (selectedTaskForSubmissions) {
        return (
            <div className="max-w-[1600px] mx-auto pb-20 space-y-10 px-4">
                {/* Context Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <motion.button
                            whileHover={{ scale: 1.1, x: -5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => { setSelectedTaskForSubmissions(null); setGradingStudent(null); }}
                            className="w-14 h-14 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-[#059669] transition-all shadow-sm"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </motion.button>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{selectedTaskForSubmissions.title}</h2>
                                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-500 uppercase tracking-widest">{t('doctor.tasks.submissions_title')}</span>
                            </div>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                <Users className="w-4 h-4" /> {t('doctor.tasks.grading_mode')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 bg-white dark:bg-[#0c0c0e] p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="text-right border-r border-gray-100 dark:border-white/10 pr-6">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('doctor.tasks.total')}</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{submissions.length}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('doctor.tasks.graded')}</p>
                            <p className="text-2xl font-black text-emerald-500">{submissions.filter(s => s.grade).length}</p>
                        </div>
                    </div>
                </div>

                {/* Submissions Table/List */}
                <div className="bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-white/5 rounded-[3.5rem] p-10 min-h-[600px] shadow-sm overflow-hidden">
                    {submissionsLoading ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-6">
                            <div className="w-16 h-16 border-4 border-[#059669]/20 border-t-[#059669] rounded-full animate-spin"></div>
                            <p className="text-gray-400 font-black text-xs uppercase tracking-widest">{t('doctor.tasks.gathering_work')}</p>
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-40 opacity-30">
                            <Microscope className="w-24 h-24 mb-6" />
                            <p className="text-xl font-black uppercase tracking-widest">{t('doctor.tasks.no_submissions')}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-separate border-spacing-y-4">
                                <thead>
                                    <tr className="text-gray-400">
                                        <th className="px-6 pb-2 text-[10px] font-black uppercase tracking-widest">{t('doctor.tasks.student_col')}</th>
                                        <th className="px-6 pb-2 text-[10px] font-black uppercase tracking-widest">{t('doctor.tasks.status_col')}</th>
                                        <th className="px-6 pb-2 text-[10px] font-black uppercase tracking-widest">{t('doctor.tasks.material_col')}</th>
                                        <th className="px-6 pb-2 text-[10px] font-black uppercase tracking-widest">{t('doctor.tasks.result_col')}</th>
                                        <th className="px-6 pb-2 text-[10px] font-black uppercase tracking-widest text-right">{t('doctor.tasks.actions_col')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.map(sub => (
                                        <tr key={sub.student_id} className="group hover:scale-[1.01] transition-all duration-300">
                                            <td className="bg-gray-50 dark:bg-white/[0.01] px-6 py-6 rounded-l-[2rem] border-y border-l border-gray-100 dark:border-white/5 group-hover:border-[#059669]/30 group-hover:bg-white dark:group-hover:bg-white/[0.03]">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-[#059669]/10 flex items-center justify-center font-black text-[#059669] text-sm border border-[#059669]/20 shrink-0 overflow-hidden">
                                                        {sub.avatar_url ? <img src={sub.avatar_url} className="w-full h-full object-cover" /> : sub.student_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-900 dark:text-white font-black text-sm">{sub.student_name}</p>
                                                        <p className="text-[10px] font-bold text-gray-400">ID: {sub.student_id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="bg-gray-50 dark:bg-white/[0.01] px-6 py-6 border-y border-gray-100 dark:border-white/5 group-hover:border-[#059669]/30 group-hover:bg-white dark:group-hover:bg-white/[0.03]">
                                                {sub.is_completed ? (
                                                    <span className="inline-flex items-center gap-2 text-emerald-500 bg-emerald-500/5 px-3 py-1.5 rounded-xl border border-emerald-500/10 text-[9px] font-black uppercase tracking-widest">
                                                        <CheckCircle2 className="w-3 h-3" /> {t('doctor.tasks.submitted')}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-2 text-amber-500 bg-amber-500/5 px-3 py-1.5 rounded-xl border border-amber-500/10 text-[9px] font-black uppercase tracking-widest">
                                                        <Clock className="w-3 h-3" /> {t('doctor.tasks.pending')}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="bg-gray-50 dark:bg-white/[0.01] px-6 py-6 border-y border-gray-100 dark:border-white/5 group-hover:border-[#059669]/30 group-hover:bg-white dark:group-hover:bg-white/[0.03]">
                                                {sub.submission_url ? (
                                                    <a href={sub.submission_url} target="_blank" className="flex items-center gap-2 text-[#059669] hover:text-[#047857] font-black text-[10px] uppercase tracking-widest transition-all">
                                                        <ExternalLink className="w-4 h-4" /> {t('doctor.tasks.view_work')}
                                                    </a>
                                                ) : <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{t('doctor.tasks.no_link')}</span>}
                                            </td>
                                            <td className="bg-gray-50 dark:bg-white/[0.01] px-6 py-6 border-y border-gray-100 dark:border-white/5 group-hover:border-[#059669]/30 group-hover:bg-white dark:group-hover:bg-white/[0.03]">
                                                {sub.grade ? (
                                                    <div className="text-xs font-black text-gray-900 dark:text-white bg-white dark:bg-white/5 px-4 py-2 rounded-xl border border-gray-100 dark:border-white/10 w-fit">
                                                        {sub.grade}
                                                    </div>
                                                ) : <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{t('doctor.tasks.wait')}</span>}
                                            </td>
                                            <td className="bg-gray-50 dark:bg-white/[0.01] px-6 py-6 rounded-r-[2rem] border-y border-r border-gray-100 dark:border-white/5 group-hover:border-[#059669]/30 group-hover:bg-white dark:group-hover:bg-white/[0.03] text-right">
                                                <button
                                                    onClick={() => {
                                                        setGradingStudent(sub);
                                                        setGradingData({ grade: sub.grade || '', feedback: sub.feedback || '' });
                                                    }}
                                                    className="bg-[#059669] hover:bg-[#047857] text-white font-black px-6 py-3 rounded-2xl text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-[#059669]/10 active:scale-95"
                                                >
                                                    {t('doctor.tasks.grade_btn')}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Grading Modal */}
                <AnimatePresence>
                    {gradingStudent && (
                        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setGradingStudent(null)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-white/10 rounded-[3rem] shadow-2xl overflow-hidden p-10">
                                <div className="flex items-center justify-between mb-10">
                                    <div>
                                        <h4 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{t('doctor.tasks.grade_assignment')}</h4>
                                        <p className="text-[10px] font-black text-[#059669] uppercase tracking-widest mt-1">{gradingStudent.student_name}</p>
                                    </div>
                                    <button onClick={() => setGradingStudent(null)} className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center text-gray-400 transition-all">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleGradeSubmission} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('doctor.tasks.grade_score')}</label>
                                        <input
                                            type="text"
                                            placeholder={t('doctor.tasks.score_placeholder')}
                                            value={gradingData.grade}
                                            onChange={(e) => setGradingData({ ...gradingData, grade: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-2xl py-4 px-6 text-gray-900 dark:text-white focus:ring-4 focus:ring-[#059669]/10 outline-none transition-all font-black"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('doctor.tasks.feedback')}</label>
                                        <textarea
                                            placeholder={t('doctor.tasks.feedback_placeholder')}
                                            value={gradingData.feedback}
                                            onChange={(e) => setGradingData({ ...gradingData, feedback: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-2xl py-4 px-6 text-gray-900 dark:text-white focus:ring-4 focus:ring-[#059669]/10 outline-none transition-all font-semibold min-h-[120px] resize-none"
                                        />
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        className="w-full bg-[#059669] hover:bg-[#047857] text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-[#059669]/20 flex items-center justify-center gap-3 text-[11px] uppercase tracking-widest"
                                    >
                                        <Save className="w-4 h-4" /> {t('doctor.tasks.save_grade')}
                                    </motion.button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto pb-20 space-y-10 px-4">
            {/* Header Hub */}
            <div className="bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-white/5 rounded-[3.5rem] p-10 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                    <div className="flex items-center gap-8">
                        <div className="w-20 h-20 rounded-3xl bg-[#059669] flex items-center justify-center shadow-2xl shadow-[#059669]/30">
                            <ClipboardList className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{t('doctor.tasks.task_hub')}</h2>
                                <span className="px-3 py-1 rounded-full bg-[#059669]/10 border border-[#059669]/20 text-[9px] font-black text-[#059669] uppercase tracking-widest">{t('doctor.tasks.mission_control')}</span>
                            </div>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                <Zap className="w-4 h-4" /> {t('doctor.tasks.assignment_manager')}
                            </p>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowFormModal(true)}
                        className="bg-[#059669] hover:bg-[#047857] text-white px-10 py-5 rounded-[1.5rem] shadow-xl shadow-[#059669]/20 flex items-center gap-3 transition-all text-xs font-black uppercase tracking-widest"
                    >
                        <Plus className="w-5 h-5" /> {t('doctor.tasks.add_task')}
                    </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: t('doctor.tasks.active_tasks'), value: tasks.length, icon: Target, color: 'text-[#059669]', bg: 'bg-[#059669]/10' },
                        { label: t('doctor.tasks.need_grading'), value: tasks.filter(t => t.requires_submission).length, icon: BarChart3, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                        { label: t('doctor.tasks.total_courses'), value: courses.length, icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 p-6 rounded-[2rem] flex items-center gap-5">
                            <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center shadow-sm ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tasks Bento Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
                {tasks.length === 0 ? (
                    <div className="lg:col-span-2 bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-white/5 rounded-[3.5rem] p-20 text-center opacity-30">
                        <Microscope className="w-20 h-20 mx-auto mb-6" />
                        <p className="text-xl font-black uppercase tracking-widest">{t('doctor.tasks.no_active_tasks')}</p>
                    </div>
                ) : (
                    tasks.map(task => {
                        const isOverdue = task.deadline && new Date(task.deadline) < new Date();
                        return (
                            <motion.div
                                variants={itemVariants}
                                key={task.id}
                                className="group bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-white/5 rounded-[3rem] p-10 hover:border-[#059669]/30 transition-all hover:bg-gray-50 dark:hover:bg-white/[0.01] hover:shadow-2xl hover:shadow-[#059669]/5 relative overflow-hidden"
                            >
                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-4 py-1.5 rounded-xl bg-[#059669]/5 border border-[#059669]/10 text-[9px] font-black text-[#059669] uppercase tracking-widest">
                                            {task.course_name}
                                        </span>
                                        {task.requires_submission && (
                                            <span className="px-4 py-1.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                                                <UploadCloud className="w-3 h-3" /> {t('doctor.tasks.allow_uploads')}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button onClick={() => startEdit(task)} className="w-10 h-10 bg-white dark:bg-white/5 hover:bg-[#059669] hover:text-white border border-gray-100 dark:border-white/10 rounded-xl flex items-center justify-center text-gray-400 transition-all">
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(task.id)} className="w-10 h-10 bg-white dark:bg-white/5 hover:bg-rose-500 hover:text-white border border-gray-100 dark:border-white/10 rounded-xl flex items-center justify-center text-rose-400 transition-all">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <h4 className="text-2xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight leading-tight group-hover:text-[#059669] transition-colors">
                                    {task.title}
                                </h4>

                                <div className="flex flex-wrap gap-6 mb-10 pb-10 border-b border-gray-100 dark:border-white/5">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-4 h-4 text-[#059669]" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            {task.deadline ? t('doctor.tasks.due', { date: new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }) : t('doctor.tasks.no_date')}
                                        </span>
                                    </div>
                                    {task.drive_link && (
                                        <a href={task.drive_link} target="_blank" className="flex items-center gap-3 text-gray-400 hover:text-[#059669] transition-all">
                                            <ExternalLink className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{t('doctor.tasks.link')}</span>
                                        </a>
                                    )}
                                </div>

                                <p className="text-sm text-gray-400 font-semibold mb-10 line-clamp-2 h-10 leading-relaxed">
                                    {task.description || t('doctor.tasks.no_instructions')}
                                </p>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => openSubmissions(task)}
                                    className="w-full bg-gray-50 dark:bg-white/[0.03] hover:bg-[#059669] border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white hover:text-white font-black py-5 rounded-[1.5rem] transition-all flex items-center justify-center gap-3 text-[11px] uppercase tracking-widest"
                                >
                                    <Users className="w-4 h-4" /> {t('doctor.tasks.submissions')}
                                </motion.button>
                            </motion.div>
                        );
                    })
                )}
            </motion.div>

            {/* Task Form Modal */}
            <AnimatePresence>
                {showFormModal && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={resetForm} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-white/10 rounded-[3rem] shadow-2xl overflow-hidden">
                            <div className="p-10">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-2xl bg-[#059669] flex items-center justify-center shadow-2xl shadow-[#059669]/20">
                                            <Edit3 className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                                                {editingTask ? t('doctor.tasks.edit_task') : t('doctor.tasks.add_new_task')}
                                            </h3>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{t('doctor.tasks.assignment_details')}</p>
                                        </div>
                                    </div>
                                    <button onClick={resetForm} className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center text-gray-400 transition-all">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8 max-h-[65vh] overflow-y-auto hidden-scrollbar pr-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('doctor.tasks.course_label')}</label>
                                            <select
                                                required
                                                value={formData.course_id}
                                                onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                                                className="w-full bg-gray-50 dark:bg-white/[0.05] border border-gray-100 dark:border-white/10 rounded-[1.5rem] py-5 px-6 text-gray-900 dark:text-white focus:ring-4 focus:ring-[#059669]/10 outline-none transition-all font-black [color-scheme:dark]"
                                            >
                                                <option value="" disabled className="dark:bg-[#0A0A0A]">{t('doctor.tasks.select_course')}</option>
                                                {courses.map(c => <option key={c.id} value={c.id} className="dark:bg-[#0A0A0A]">{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('doctor.tasks.due_date')}</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#059669]" />
                                                <input
                                                    type="datetime-local"
                                                    value={formData.deadline}
                                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                                    className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-[1.5rem] py-5 pl-14 pr-6 text-gray-900 dark:text-white focus:ring-4 focus:ring-[#059669]/10 outline-none transition-all font-black [color-scheme:dark]"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('doctor.tasks.task_title')}</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder={t('doctor.tasks.title_placeholder')}
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-[1.5rem] py-5 px-6 text-gray-900 dark:text-white focus:ring-4 focus:ring-[#059669]/10 outline-none transition-all font-black"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('doctor.tasks.instructions')}</label>
                                        <textarea
                                            placeholder={t('doctor.tasks.instructions_placeholder')}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-[1.5rem] py-5 px-6 text-gray-900 dark:text-white focus:ring-4 focus:ring-[#059669]/10 outline-none transition-all font-semibold min-h-[120px] resize-none"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('doctor.tasks.link_optional')}</label>
                                        <div className="relative">
                                            <ExternalLink className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#059669]" />
                                            <input
                                                type="url"
                                                placeholder={t('doctor.tasks.link_placeholder')}
                                                value={formData.drive_link}
                                                onChange={(e) => setFormData({ ...formData, drive_link: e.target.value })}
                                                className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-[1.5rem] py-5 pl-14 pr-6 text-gray-900 dark:text-white focus:ring-4 focus:ring-[#059669]/10 outline-none transition-all font-black"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 p-6 rounded-[2rem] flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center shadow-sm">
                                                <UploadCloud className="w-6 h-6 text-emerald-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('doctor.tasks.allow_uploads_label')}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('doctor.tasks.enable_submission')}</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.requires_submission}
                                                onChange={(e) => setFormData({ ...formData, requires_submission: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#059669] shadow-sm"></div>
                                        </label>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 bg-[#059669] hover:bg-[#047857] text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-[#059669]/20 flex items-center justify-center gap-3 text-xs uppercase tracking-widest disabled:opacity-50"
                                        >
                                            {loading ? <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin"></div> : <><Save className="w-4 h-4" /> {editingTask ? t('doctor.tasks.update_task') : t('doctor.tasks.publish_task')}</>}
                                        </motion.button>
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="px-10 bg-gray-100 dark:bg-white/5 text-gray-400 font-black py-5 rounded-[1.5rem] hover:bg-rose-500/10 hover:text-rose-500 transition-all text-xs uppercase tracking-widest"
                                        >
                                            {t('doctor.tasks.cancel')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
        .hidden-scrollbar::-webkit-scrollbar { display: none; }
        .hidden-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
        </div>
    );
};

export default DoctorTaskManager;
