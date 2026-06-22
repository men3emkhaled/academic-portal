import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
    Plus, Edit3, Trash2, ListChecks, Timer, Zap,
    BarChart3, ShieldCheck, Clock, Target, X, FileText, Save
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
                toast.success(t('doctor.quizzes.updated_success'));
            } else {
                await doctorApi('post', '/doctor/quizzes', formData);
                toast.success(t('doctor.quizzes.created_success'));
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
            <div className="w-12 h-12 border-4 border-[#059669]/20 border-t-[#059669] rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="max-w-[1600px] mx-auto pb-20 px-4">
            {!selectedQuiz ? (
                <div className="space-y-6">
                    {/* Header Section */}
                    <div className="bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-white/5 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-[#059669] flex items-center justify-center">
                                <BarChart3 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('doctor.quizzes.title')}</h2>
                                <p className="text-sm text-gray-400">{t('doctor.quizzes.assessment_center')}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { label: t('doctor.quizzes.total'), value: quizzes.length, icon: FileText, color: 'text-[#059669]' },
                                { label: t('doctor.quizzes.drafts'), value: quizzes.filter(q => !q.is_published).length, icon: Edit3, color: 'text-amber-500' },
                                { label: t('doctor.quizzes.live'), value: quizzes.filter(q => q.is_published).length, icon: Zap, color: 'text-emerald-500' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 p-4 rounded-xl flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg ${stat.color} bg-current/10 flex items-center justify-center`}>
                                        <stat.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">{stat.label}</p>
                                        <p className="text-xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quiz Grid */}
                    <div className="bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-white/5 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                                <ListChecks className="w-5 h-5 text-[#059669]" />
                                {t('doctor.quizzes.list')}
                            </h3>
                            <button
                                onClick={() => setShowFormModal(true)}
                                className="bg-[#059669] hover:bg-[#047857] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all text-sm font-medium"
                            >
                                <Plus className="w-4 h-4" /> {t('doctor.quizzes.create')}
                            </button>
                        </div>

                        {quizzes.length === 0 ? (
                            <div className="text-center py-16 text-gray-400">
                                <p className="text-base font-medium">{t('doctor.quizzes.no_found')}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                                {quizzes.map((quiz) => (
                                    <div
                                        key={quiz.id}
                                        className="bg-gray-50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-xl p-5 hover:border-[#059669]/30 transition-all"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="px-3 py-1 rounded-lg bg-[#059669]/5 border border-[#059669]/10 text-xs text-[#059669] font-medium">
                                                {courses.find(c => c.id === quiz.course_id)?.name || t('doctor.quizzes.course_label')}
                                            </span>
                                            {quiz.is_official && (
                                                <span className="px-3 py-1 rounded-lg bg-rose-500/5 border border-rose-500/10 text-xs text-rose-500 font-medium">
                                                    {t('doctor.quizzes.official')}
                                                </span>
                                            )}
                                        </div>

                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                                            {quiz.title}
                                        </h4>
                                        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                                            {quiz.description || t('doctor.quizzes.standard_desc')}
                                        </p>

                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="p-3 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Clock className="w-3.5 h-3.5 text-[#059669]" />
                                                    <span className="text-xs text-gray-400">{t('common.time')}</span>
                                                </div>
                                                <p className="text-base font-semibold text-gray-900 dark:text-white">
                                                    {quiz.time_limit_minutes} <span className="text-xs font-medium text-gray-400">{t('quizzes.mins')}</span>
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Target className="w-3.5 h-3.5 text-emerald-500" />
                                                    <span className="text-xs text-gray-400">{t('quizzes.pass')}</span>
                                                </div>
                                                <p className="text-base font-semibold text-gray-900 dark:text-white">
                                                    {quiz.passing_score}<span className="text-xs font-medium text-gray-400">%</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setSelectedQuiz(quiz)}
                                                className="flex-1 bg-[#059669] hover:bg-[#047857] text-white font-medium py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
                                            >
                                                <ListChecks className="w-4 h-4" /> {t('doctor.quizzes.questions_btn')}
                                            </button>
                                            <button onClick={() => startEdit(quiz)} className="w-10 h-10 bg-white dark:bg-white/5 hover:bg-[#059669] hover:text-white border border-gray-100 dark:border-white/10 rounded-xl flex items-center justify-center text-gray-400 transition-all">
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(quiz.id)} className="w-10 h-10 bg-white dark:bg-white/5 hover:bg-rose-500 hover:text-white border border-gray-100 dark:border-white/10 rounded-xl flex items-center justify-center text-rose-400 transition-all">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <DoctorQuestionManager quiz={selectedQuiz} onBack={() => setSelectedQuiz(null)} />
            )}

            {/* Form Modal */}
            {showFormModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div onClick={resetForm} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
                    <div className="relative w-full max-w-2xl bg-white dark:bg-[#0A0A0A] border border-gray-100 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-[#059669] flex items-center justify-center">
                                        <Edit3 className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {editingQuiz ? t('doctor.quizzes.edit') : t('doctor.quizzes.create')}
                                        </h3>
                                        <p className="text-xs text-gray-400">{t('doctor.quizzes.settings')}</p>
                                    </div>
                                </div>
                                <button onClick={resetForm} className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center text-gray-400 transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-400 font-medium">{t('doctor.quizzes.course_label')}</label>
                                        <select
                                            value={formData.course_id}
                                            onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-white/[0.05] border border-gray-100 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white outline-none transition-all [color-scheme:dark]"
                                            required
                                        >
                                            <option value="" className="dark:bg-[#0A0A0A]">{t('doctor.quizzes.course_label')}</option>
                                            {courses.map(c => <option key={c.id} value={c.id} className="dark:bg-[#0A0A0A]">{c.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-400 font-medium">{t('doctor.quizzes.quiz_title_label')}</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder={t('doctor.quizzes.quiz_title_label')}
                                            className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-xl py-3 px-4 text-gray-900 dark:text-white outline-none transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-400 font-medium">{t('doctor.quizzes.time_limit_label')}</label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#059669]" />
                                            <input
                                                type="number"
                                                required
                                                value={formData.time_limit_minutes}
                                                onChange={(e) => setFormData({ ...formData, time_limit_minutes: parseInt(e.target.value) })}
                                                className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-400 font-medium">{t('doctor.quizzes.passing_score_label')}</label>
                                        <div className="relative">
                                            <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                            <input
                                                type="number"
                                                required
                                                value={formData.passing_score}
                                                onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) })}
                                                className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400 font-medium">{t('doctor.quizzes.desc_label')}</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder={t('doctor.quizzes.desc_placeholder')}
                                        className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-xl py-3 px-4 text-gray-900 dark:text-white outline-none transition-all min-h-[100px] resize-none"
                                    />
                                </div>

                                <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 p-4 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-white/5 flex items-center justify-center">
                                            <ShieldCheck className="w-5 h-5 text-rose-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{t('doctor.quizzes.official_exam')}</p>
                                            <p className="text-xs text-gray-400">{t('doctor.quizzes.official_desc')}</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_official}
                                            onChange={(e) => setFormData({ ...formData, is_official: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#059669]"></div>
                                    </label>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button type="submit" className="flex-1 bg-[#059669] hover:bg-[#047857] text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 text-sm transition-all">
                                        <Save className="w-4 h-4" /> {editingQuiz ? t('doctor.quizzes.update_btn') : t('doctor.quizzes.create_btn')}
                                    </button>
                                    <button type="button" onClick={resetForm} className="px-8 bg-gray-100 dark:bg-white/5 text-gray-400 font-medium py-3 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-all text-sm">
                                        {t('common.cancel')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorQuizManager;
