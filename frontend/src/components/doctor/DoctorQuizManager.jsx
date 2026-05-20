import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Edit3, Trash2, ListChecks, Timer, Zap,
    BarChart3, ShieldCheck, Clock, Target, X, Microscope, Layout, FileText, Save
} from 'lucide-react';
import DoctorQuestionManager from './DoctorQuestionManager';

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

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-16 h-16 border-4 border-violet-600/20 border-t-violet-600 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="max-w-[1600px] mx-auto pb-20 px-4">
            {!selectedQuiz ? (
                <div className="space-y-12">
                    {/* Header Section */}
                    <div className="bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-white/5 rounded-[3.5rem] p-10 shadow-sm">
                        <div className="flex items-center gap-8 mb-12">
                            <div className="w-20 h-20 rounded-3xl bg-violet-600 flex items-center justify-center shadow-2xl shadow-violet-600/30">
                                <BarChart3 className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{t('doctor.quizzes.title')}</h2>
                                    <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[9px] font-black text-violet-500 uppercase tracking-widest">{t('doctor.quizzes.management')}</span>
                                </div>
                                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Layout className="w-4 h-4" /> {t('doctor.quizzes.assessment_center')}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: t('doctor.quizzes.total'), value: quizzes.length, icon: FileText, color: 'text-violet-500', bg: 'bg-violet-500/10' },
                                { label: t('doctor.quizzes.drafts'), value: quizzes.filter(q => !q.is_published).length, icon: Edit3, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                                { label: t('doctor.quizzes.live'), value: quizzes.filter(q => q.is_published).length, icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
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

                    {/* Quiz Grid */}
                    <div className="bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-white/5 rounded-[3.5rem] p-10 shadow-sm">
                        <div className="flex items-center justify-between mb-12">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-600/20">
                                    <ListChecks className="w-5 h-5 text-white" />
                                </div>
                                {t('doctor.quizzes.list')}
                            </h3>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowFormModal(true)}
                                className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-4 rounded-2xl flex items-center gap-3 shadow-xl shadow-violet-600/20 transition-all text-xs font-black uppercase tracking-widest"
                            >
                                <Plus className="w-4 h-4" /> {t('doctor.quizzes.create')}
                            </motion.button>
                        </div>

                        {quizzes.length === 0 ? (
                            <div className="text-center py-20 opacity-30">
                                <Microscope className="w-20 h-20 mx-auto mb-6" />
                                <p className="text-xl font-black uppercase tracking-widest">{t('doctor.quizzes.no_found')}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
                                {quizzes.map((quiz) => (
                                    <motion.div
                                        layout
                                        key={quiz.id}
                                        className="group bg-gray-50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-[3rem] p-8 hover:border-violet-500/30 transition-all hover:bg-white dark:hover:bg-white/[0.02] hover:shadow-2xl hover:shadow-violet-500/5 relative overflow-hidden"
                                    >
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="px-4 py-2 rounded-xl bg-violet-500/5 border border-violet-500/10 text-[9px] font-black text-violet-500 uppercase tracking-widest">
                                                {courses.find(c => c.id === quiz.course_id)?.name || 'Course'}
                                            </div>
                                            {quiz.is_official && (
                                                <div className="px-4 py-2 rounded-xl bg-rose-500/5 border border-rose-500/10 text-[9px] font-black text-rose-500 uppercase tracking-widest">
                                                    {t('doctor.quizzes.official')}
                                                </div>
                                            )}
                                        </div>

                                        <h4 className="text-2xl font-black text-gray-900 dark:text-white mb-4 line-clamp-1 uppercase tracking-tight">
                                            {quiz.title}
                                        </h4>
                                        <p className="text-sm text-gray-400 font-semibold mb-8 line-clamp-2 h-10">
                                            {quiz.description || t('doctor.quizzes.standard_desc')}
                                        </p>

                                        <div className="grid grid-cols-2 gap-4 mb-10">
                                            <div className="p-5 rounded-3xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Clock className="w-4 h-4 text-violet-500" />
                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('common.time')}</span>
                                                </div>
                                                <p className="text-xl font-black text-gray-900 dark:text-white uppercase">
                                                    {quiz.time_limit_minutes} <span className="text-xs font-bold text-gray-400">{t('quizzes.mins')}</span>
                                                </p>
                                            </div>
                                            <div className="p-5 rounded-3xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Target className="w-4 h-4 text-emerald-500" />
                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('quizzes.pass')}</span>
                                                </div>
                                                <p className="text-xl font-black text-gray-900 dark:text-white uppercase">
                                                    {quiz.passing_score}<span className="text-xs font-bold text-gray-400">%</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setSelectedQuiz(quiz)}
                                                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-violet-600/10 transition-all text-[11px] uppercase tracking-widest flex items-center justify-center gap-3"
                                            >
                                                <ListChecks className="w-4 h-4" /> {t('doctor.quizzes.questions_btn')}
                                            </button>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button onClick={() => startEdit(quiz)} className="w-12 h-12 bg-white dark:bg-white/5 hover:bg-violet-500 hover:text-white border border-gray-100 dark:border-white/10 rounded-xl flex items-center justify-center text-gray-400 transition-all">
                                                    <Edit3 className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleDelete(quiz.id)} className="w-12 h-12 bg-white dark:bg-white/5 hover:bg-rose-500 hover:text-white border border-gray-100 dark:border-white/10 rounded-xl flex items-center justify-center text-rose-400 transition-all">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <DoctorQuestionManager quiz={selectedQuiz} onBack={() => setSelectedQuiz(null)} />
            )}

            {/* Form Modal */}
            <AnimatePresence>
                {showFormModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={resetForm}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-4xl bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-white/10 rounded-[3rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-10">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center shadow-2xl shadow-violet-600/20">
                                            <Edit3 className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                                                {editingQuiz ? t('doctor.quizzes.edit') : t('doctor.quizzes.create')}
                                            </h3>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{t('doctor.quizzes.settings')}</p>
                                        </div>
                                    </div>
                                    <button onClick={resetForm} className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center text-gray-400 transition-all">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('doctor.quizzes.course_label')}</label>
                                            <select
                                                value={formData.course_id}
                                                onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                                                className="w-full bg-gray-50 dark:bg-white/[0.05] border border-gray-100 dark:border-white/10 rounded-[1.5rem] py-5 px-6 text-gray-900 dark:text-white focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-black [color-scheme:dark]"
                                                required
                                            >
                                                <option value="" className="dark:bg-[#0A0A0A]">{t('doctor.quizzes.course_label')}</option>
                                                {courses.map(c => <option key={c.id} value={c.id} className="dark:bg-[#0A0A0A]">{c.name}</option>)}
                                            </select>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('doctor.quizzes.quiz_title_label')}</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                placeholder="e.g. Midterm Exam"
                                                className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-[1.5rem] py-5 px-6 text-gray-900 dark:text-white focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-black"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('doctor.quizzes.time_limit_label')}</label>
                                            <div className="relative">
                                                <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500" />
                                                <input
                                                    type="number"
                                                    required
                                                    value={formData.time_limit_minutes}
                                                    onChange={(e) => setFormData({ ...formData, time_limit_minutes: parseInt(e.target.value) })}
                                                    className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-[1.5rem] py-5 pl-14 pr-6 text-gray-900 dark:text-white focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-black"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('doctor.quizzes.passing_score_label')}</label>
                                            <div className="relative">
                                                <Target className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                                <input
                                                    type="number"
                                                    required
                                                    value={formData.passing_score}
                                                    onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) })}
                                                    className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-[1.5rem] py-5 pl-14 pr-6 text-gray-900 dark:text-white focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-black"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('doctor.quizzes.desc_label')}</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder={t('doctor.quizzes.desc_placeholder')}
                                            className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-[1.5rem] py-5 px-6 text-gray-900 dark:text-white focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-semibold min-h-[120px] resize-none"
                                        />
                                    </div>

                                    <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 p-6 rounded-[2rem] flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center shadow-sm">
                                                <ShieldCheck className="w-6 h-6 text-rose-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('doctor.quizzes.official_exam')}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('doctor.quizzes.official_desc')}</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_official}
                                                onChange={(e) => setFormData({ ...formData, is_official: e.target.checked })}
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
                                            className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-violet-600/20 flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
                                        >
                                            <Save className="w-4 h-4" /> {editingQuiz ? t('doctor.quizzes.update_btn') : t('doctor.quizzes.create_btn')}
                                        </motion.button>
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="px-10 bg-gray-100 dark:bg-white/5 text-gray-400 font-black py-5 rounded-[1.5rem] hover:bg-rose-500/10 hover:text-rose-500 transition-all text-xs uppercase tracking-widest"
                                        >
                                            {t('common.cancel')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DoctorQuizManager;
