import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ClipboardList, Plus, Edit3, Trash2, Users, ExternalLink,
    Calendar, CheckCircle2, Clock, ChevronLeft, Save,
    X, AlertCircle, FileText, Search, Filter, BookOpen, Send,
    Layout, Zap, Target, BarChart3, Microscope, UploadCloud, ShieldCheck
} from 'lucide-react';

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
                            className="w-14 h-14 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-violet-500 transition-all shadow-sm"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </motion.button>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{selectedTaskForSubmissions.title}</h2>
                                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-500 uppercase tracking-widest">Submissions</span>
                            </div>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                <Users className="w-4 h-4" /> Grading Mode
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 bg-white dark:bg-[#080808] p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="text-right border-r border-gray-100 dark:border-white/10 pr-6">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{submissions.length}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Graded</p>
                            <p className="text-2xl font-black text-emerald-500">{submissions.filter(s => s.grade).length}</p>
                        </div>
                    </div>
                </div>

                {/* Submissions Table/List */}
                <div className="bg-white dark:bg-[#080808] border border-gray-100 dark:border-white/5 rounded-[3.5rem] p-10 min-h-[600px] shadow-sm overflow-hidden">
                    {submissionsLoading ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-6">
                            <div className="w-16 h-16 border-4 border-violet-600/20 border-t-violet-600 rounded-full animate-spin"></div>
                            <p className="text-gray-400 font-black text-xs uppercase tracking-widest">Gathering Work...</p>
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-40 opacity-30">
                            <Microscope className="w-24 h-24 mb-6" />
                            <p className="text-xl font-black uppercase tracking-widest">No Submissions Found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-separate border-spacing-y-4">
                                <thead>
                                    <tr className="text-gray-400">
                                        <th className="px-6 pb-2 text-[10px] font-black uppercase tracking-widest">Student</th>
                                        <th className="px-6 pb-2 text-[10px] font-black uppercase tracking-widest">Status</th>
                                        <th className="px-6 pb-2 text-[10px] font-black uppercase tracking-widest">Material</th>
                                        <th className="px-6 pb-2 text-[10px] font-black uppercase tracking-widest">Result</th>
                                        <th className="px-6 pb-2 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.map(sub => (
                                        <tr key={sub.student_id} className="group hover:scale-[1.01] transition-all duration-300">
                                            <td className="bg-gray-50 dark:bg-white/[0.01] px-6 py-6 rounded-l-[2rem] border-y border-l border-gray-100 dark:border-white/5 group-hover:border-violet-500/30 group-hover:bg-white dark:group-hover:bg-white/[0.03]">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-violet-600/10 flex items-center justify-center font-black text-violet-600 text-sm border border-violet-600/20 shrink-0 overflow-hidden">
                                                        {sub.avatar_url ? <img src={sub.avatar_url} className="w-full h-full object-cover" /> : sub.student_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-900 dark:text-white font-black text-sm">{sub.student_name}</p>
                                                        <p className="text-[10px] font-bold text-gray-400">ID: {sub.student_id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="bg-gray-50 dark:bg-white/[0.01] px-6 py-6 border-y border-gray-100 dark:border-white/5 group-hover:border-violet-500/30 group-hover:bg-white dark:group-hover:bg-white/[0.03]">
                                                {sub.is_completed ? (
                                                    <span className="inline-flex items-center gap-2 text-emerald-500 bg-emerald-500/5 px-3 py-1.5 rounded-xl border border-emerald-500/10 text-[9px] font-black uppercase tracking-widest">
                                                        <CheckCircle2 className="w-3 h-3" /> Submitted
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-2 text-amber-500 bg-amber-500/5 px-3 py-1.5 rounded-xl border border-amber-500/10 text-[9px] font-black uppercase tracking-widest">
                                                        <Clock className="w-3 h-3" /> Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="bg-gray-50 dark:bg-white/[0.01] px-6 py-6 border-y border-gray-100 dark:border-white/5 group-hover:border-violet-500/30 group-hover:bg-white dark:group-hover:bg-white/[0.03]">
                                                {sub.submission_url ? (
                                                    <a href={sub.submission_url} target="_blank" className="flex items-center gap-2 text-violet-600 hover:text-violet-700 font-black text-[10px] uppercase tracking-widest transition-all">
                                                        <ExternalLink className="w-4 h-4" /> View Work
                                                    </a>
                                                ) : <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No Link</span>}
                                            </td>
                                            <td className="bg-gray-50 dark:bg-white/[0.01] px-6 py-6 border-y border-gray-100 dark:border-white/5 group-hover:border-violet-500/30 group-hover:bg-white dark:group-hover:bg-white/[0.03]">
                                                {sub.grade ? (
                                                    <div className="text-xs font-black text-gray-900 dark:text-white bg-white dark:bg-white/5 px-4 py-2 rounded-xl border border-gray-100 dark:border-white/10 w-fit">
                                                        {sub.grade}
                                                    </div>
                                                ) : <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Wait</span>}
                                            </td>
                                            <td className="bg-gray-50 dark:bg-white/[0.01] px-6 py-6 rounded-r-[2rem] border-y border-r border-gray-100 dark:border-white/5 group-hover:border-violet-500/30 group-hover:bg-white dark:group-hover:bg-white/[0.03] text-right">
                                                <button
                                                    onClick={() => {
                                                        setGradingStudent(sub);
                                                        setGradingData({ grade: sub.grade || '', feedback: sub.feedback || '' });
                                                    }}
                                                    className="bg-violet-600 hover:bg-violet-700 text-white font-black px-6 py-3 rounded-2xl text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-violet-600/10 active:scale-95"
                                                >
                                                    Grade
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
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setGradingStudent(null)} className="absolute inset-0 bg-gray-900/60 backdrop-blur-xl" />
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-md bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-white/10 rounded-[3rem] shadow-2xl overflow-hidden p-10">
                                <div className="flex items-center justify-between mb-10">
                                    <div>
                                        <h4 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Grade Assignment</h4>
                                        <p className="text-[10px] font-black text-violet-500 uppercase tracking-widest mt-1">{gradingStudent.student_name}</p>
                                    </div>
                                    <button onClick={() => setGradingStudent(null)} className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center text-gray-400 transition-all">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleGradeSubmission} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Grade / Score</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 10/10"
                                            value={gradingData.grade}
                                            onChange={(e) => setGradingData({ ...gradingData, grade: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-2xl py-4 px-6 text-gray-900 dark:text-white focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-black"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Feedback</label>
                                        <textarea
                                            placeholder="Good work..."
                                            value={gradingData.feedback}
                                            onChange={(e) => setGradingData({ ...gradingData, feedback: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-2xl py-4 px-6 text-gray-900 dark:text-white focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-semibold min-h-[120px] resize-none"
                                        />
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        className="w-full bg-violet-600 hover:bg-violet-700 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-violet-600/20 flex items-center justify-center gap-3 text-[11px] uppercase tracking-widest"
                                    >
                                        <Save className="w-4 h-4" /> Save Grade
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
            <div className="bg-white dark:bg-[#080808] border border-gray-100 dark:border-white/5 rounded-[3.5rem] p-10 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                    <div className="flex items-center gap-8">
                        <div className="w-20 h-20 rounded-3xl bg-violet-600 flex items-center justify-center shadow-2xl shadow-violet-600/30">
                            <ClipboardList className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Task Hub</h2>
                                <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[9px] font-black text-violet-500 uppercase tracking-widest">Mission Control</span>
                            </div>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                <Zap className="w-4 h-4" /> Assignment Manager
                            </p>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowFormModal(true)}
                        className="bg-violet-600 hover:bg-violet-700 text-white px-10 py-5 rounded-[1.5rem] shadow-xl shadow-violet-600/20 flex items-center gap-3 transition-all text-xs font-black uppercase tracking-widest"
                    >
                        <Plus className="w-5 h-5" /> Add Task
                    </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: 'Active Tasks', value: tasks.length, icon: Target, color: 'text-violet-500', bg: 'bg-violet-500/10' },
                        { label: 'Need Grading', value: tasks.filter(t => t.requires_submission).length, icon: BarChart3, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                        { label: 'Total Courses', value: courses.length, icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
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
                    <div className="lg:col-span-2 bg-white dark:bg-[#080808] border border-gray-100 dark:border-white/5 rounded-[3.5rem] p-20 text-center opacity-30">
                        <Microscope className="w-20 h-20 mx-auto mb-6" />
                        <p className="text-xl font-black uppercase tracking-widest">No Active Tasks</p>
                    </div>
                ) : (
                    tasks.map(task => {
                        const isOverdue = task.deadline && new Date(task.deadline) < new Date();
                        return (
                            <motion.div
                                variants={itemVariants}
                                key={task.id}
                                className="group bg-white dark:bg-[#080808] border border-gray-100 dark:border-white/5 rounded-[3rem] p-10 hover:border-violet-500/30 transition-all hover:bg-gray-50 dark:hover:bg-white/[0.01] hover:shadow-2xl hover:shadow-violet-500/5 relative overflow-hidden"
                            >
                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-4 py-1.5 rounded-xl bg-violet-500/5 border border-violet-500/10 text-[9px] font-black text-violet-500 uppercase tracking-widest">
                                            {task.course_name}
                                        </span>
                                        {task.requires_submission && (
                                            <span className="px-4 py-1.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                                                <UploadCloud className="w-3 h-3" /> Allow Uploads
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                        <button onClick={() => startEdit(task)} className="w-10 h-10 bg-white dark:bg-white/5 hover:bg-violet-500 hover:text-white border border-gray-100 dark:border-white/10 rounded-xl flex items-center justify-center text-gray-400 transition-all">
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(task.id)} className="w-10 h-10 bg-white dark:bg-white/5 hover:bg-rose-500 hover:text-white border border-gray-100 dark:border-white/10 rounded-xl flex items-center justify-center text-rose-400 transition-all">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <h4 className="text-2xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight leading-tight group-hover:text-violet-600 transition-colors">
                                    {task.title}
                                </h4>

                                <div className="flex flex-wrap gap-6 mb-10 pb-10 border-b border-gray-100 dark:border-white/5">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-4 h-4 text-violet-500" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            Due: {task.deadline ? new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No Date'}
                                        </span>
                                    </div>
                                    {task.drive_link && (
                                        <a href={task.drive_link} target="_blank" className="flex items-center gap-3 text-gray-400 hover:text-violet-500 transition-all">
                                            <ExternalLink className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Link</span>
                                        </a>
                                    )}
                                </div>

                                <p className="text-sm text-gray-400 font-semibold mb-10 line-clamp-2 h-10 leading-relaxed">
                                    {task.description || 'No detailed instructions provided.'}
                                </p>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => openSubmissions(task)}
                                    className="w-full bg-gray-50 dark:bg-white/[0.03] hover:bg-violet-600 border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white hover:text-white font-black py-5 rounded-[1.5rem] transition-all flex items-center justify-center gap-3 text-[11px] uppercase tracking-widest"
                                >
                                    <Users className="w-4 h-4" /> Submissions
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
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={resetForm} className="absolute inset-0 bg-gray-900/60 backdrop-blur-xl" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-white/10 rounded-[3rem] shadow-2xl overflow-hidden">
                            <div className="p-10">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center shadow-2xl shadow-violet-600/20">
                                            <Edit3 className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                                                {editingTask ? 'Edit Task' : 'Add New Task'}
                                            </h3>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Assignment Details</p>
                                        </div>
                                    </div>
                                    <button onClick={resetForm} className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center text-gray-400 transition-all">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8 max-h-[65vh] overflow-y-auto hidden-scrollbar pr-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Course</label>
                                            <select
                                                required
                                                value={formData.course_id}
                                                onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                                                className="w-full bg-gray-50 dark:bg-white/[0.05] border border-gray-100 dark:border-white/10 rounded-[1.5rem] py-5 px-6 text-gray-900 dark:text-white focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-black [color-scheme:dark]"
                                            >
                                                <option value="" disabled className="dark:bg-[#0A0A0A]">Select Course</option>
                                                {courses.map(c => <option key={c.id} value={c.id} className="dark:bg-[#0A0A0A]">{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Due Date</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500" />
                                                <input
                                                    type="datetime-local"
                                                    value={formData.deadline}
                                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                                    className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-[1.5rem] py-5 pl-14 pr-6 text-gray-900 dark:text-white focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-black [color-scheme:dark]"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Task Title</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Final Research Project"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-[1.5rem] py-5 px-6 text-gray-900 dark:text-white focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-black"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Instructions</label>
                                        <textarea
                                            placeholder="Describe the requirements..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-[1.5rem] py-5 px-6 text-gray-900 dark:text-white focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-semibold min-h-[120px] resize-none"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Link (Optional)</label>
                                        <div className="relative">
                                            <ExternalLink className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500" />
                                            <input
                                                type="url"
                                                placeholder="Drive or Docs link"
                                                value={formData.drive_link}
                                                onChange={(e) => setFormData({ ...formData, drive_link: e.target.value })}
                                                className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-[1.5rem] py-5 pl-14 pr-6 text-gray-900 dark:text-white focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-black"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 p-6 rounded-[2rem] flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center shadow-sm">
                                                <UploadCloud className="w-6 h-6 text-emerald-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Allow Uploads</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Enable file submission</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.requires_submission}
                                                onChange={(e) => setFormData({ ...formData, requires_submission: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-violet-600 shadow-sm"></div>
                                        </label>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-violet-600/20 flex items-center justify-center gap-3 text-xs uppercase tracking-widest disabled:opacity-50"
                                        >
                                            {loading ? <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin"></div> : <><Save className="w-4 h-4" /> {editingTask ? 'Update Task' : 'Publish Task'}</>}
                                        </motion.button>
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="px-10 bg-gray-100 dark:bg-white/5 text-gray-400 font-black py-5 rounded-[1.5rem] hover:bg-rose-500/10 hover:text-rose-500 transition-all text-xs uppercase tracking-widest"
                                        >
                                            Cancel
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
