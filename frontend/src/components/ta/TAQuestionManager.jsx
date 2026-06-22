import React, { useState, useEffect } from 'react';
import { useTAAuth } from '../../context/TAAuthContext';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Plus, Edit3, Trash2, ListChecks, Type, Image as ImageIcon, 
  ChevronRight, Save, X, HelpCircle, Target, Sparkles, Zap, Layout,
  CheckCircle2, AlertCircle, FileText, UploadCloud, Eye, Microscope
} from 'lucide-react';

const TAQuestionManager = ({ quiz, onBack }) => {
    const { t } = useTranslation();
    const { taApi } = useTAAuth();
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
            const res = await taApi('get', `/ta/quizzes/${quiz.id}/questions`);
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
                await taApi('put', `/ta/quizzes/${quiz.id}/questions/${editingQuestion.id}`, payload);
                toast.success(t('doctor.questions.update_success'));
            } else {
                await taApi('post', `/ta/quizzes/${quiz.id}/questions`, payload);
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
            await taApi('delete', `/ta/quizzes/${quiz.id}/questions/${id}`);
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { x: -20, opacity: 0 },
        visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
    };

    return (
        <div className="max-w-[1600px] mx-auto pb-20 space-y-10 px-4">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <motion.button 
                        whileHover={{ scale: 1.1, x: -5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onBack} 
                        className="w-14 h-14 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-[#059669] transition-all shadow-sm"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </motion.button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{quiz.title}</h2>
                            <span className="px-3 py-1 rounded-full bg-[#059669]/10 border border-[#059669]/20 text-[9px] font-black text-[#059669] uppercase tracking-widest">{t('doctor.questions.title_suffix')}</span>
                        </div>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                            <Layout className="w-4 h-4" /> {t('doctor.questions.edit_mode')}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Form Column */}
                <div className="xl:col-span-4 space-y-8">
                    <div className="sticky top-10">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-white/5 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Zap className="w-24 h-24 text-[#059669]" />
                            </div>

                            <h3 className="text-2xl font-black mb-10 flex items-center gap-4 text-gray-900 dark:text-white uppercase tracking-tight">
                                <div className="w-10 h-10 rounded-xl bg-[#059669] flex items-center justify-center shadow-lg shadow-[#059669]/20">
                                    {editingQuestion ? <Edit3 className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                                </div>
                                {editingQuestion ? t('doctor.questions.edit_question') : t('doctor.questions.add_question')}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('doctor.questions.type_label')}</label>
                                        <select
                                            value={formData.question_type}
                                            onChange={(e) => setFormData({ ...formData, question_type: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-white/[0.05] border border-gray-100 dark:border-white/10 rounded-2xl py-4 px-5 text-sm font-black appearance-none cursor-pointer outline-none focus:ring-4 focus:ring-[#059669]/10 dark:text-white [color-scheme:dark]"
                                        >
                                            <option value="multiple_choice" className="dark:bg-[#0A0A0A]">{t('doctor.questions.type_mcq')}</option>
                                            <option value="true_false" className="dark:bg-[#0A0A0A]">{t('doctor.questions.type_true_false')}</option>
                                            <option value="written" className="dark:bg-[#0A0A0A]">{t('doctor.questions.type_written')}</option>
                                        </select>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('doctor.questions.points_label')}</label>
                                        <div className="relative">
                                            <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                            <input
                                                type="number"
                                                min="1"
                                                value={formData.points}
                                                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                                                className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-2xl py-4 pl-12 pr-5 text-sm font-black outline-none focus:ring-4 focus:ring-[#059669]/10 dark:text-white"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('doctor.questions.text_label')}</label>
                                    <textarea
                                        value={formData.question_text}
                                        onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-3xl py-5 px-6 text-sm font-semibold min-h-[120px] resize-none outline-none focus:ring-4 focus:ring-[#059669]/10 dark:text-white"
                                        placeholder={t('doctor.questions.text_placeholder')}
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('doctor.questions.image_label')}</label>
                                    <div className="relative group">
                                        <div className={`flex flex-col items-center justify-center w-full min-h-[100px] border-2 border-dashed rounded-[2rem] transition-all cursor-pointer ${imageFile ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/10 hover:border-[#059669]/30'}`}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setImageFile(e.target.files[0])}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            {imageFile ? (
                                                <div className="flex items-center gap-3 text-emerald-500">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                    <span className="text-xs font-black uppercase tracking-widest truncate max-w-[150px]">{imageFile.name}</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 text-gray-400">
                                                    <UploadCloud className="w-6 h-6 group-hover:text-[#059669] transition-colors" />
                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">{t('doctor.questions.upload_hint')}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {formData.question_type === 'multiple_choice' && (
                                    <div className="space-y-4 pt-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('doctor.questions.options_label')}</label>
                                        <div className="space-y-3">
                                            {formData.options.map((opt, i) => (
                                                <div key={i} className={`flex items-center gap-4 p-3 rounded-2xl border transition-all ${formData.correct_answer === String(i) ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/5'}`}>
                                                    <input
                                                        type="radio"
                                                        name="correct_answer"
                                                        checked={formData.correct_answer === String(i)}
                                                        onChange={() => setFormData({ ...formData, correct_answer: String(i) })}
                                                        className="w-5 h-5 accent-emerald-500 cursor-pointer"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={opt}
                                                        onChange={(e) => handleOptionChange(i, e.target.value)}
                                                        placeholder={`${t('doctor.questions.option_placeholder')} ${i + 1}`}
                                                        className="flex-1 bg-transparent border-none outline-none text-sm font-bold placeholder-gray-300 dark:text-white"
                                                        required
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {formData.question_type === 'true_false' && (
                                    <div className="grid grid-cols-2 gap-4 pt-4">
                                        {['True', 'False'].map((val) => (
                                            <button
                                                key={val}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, correct_answer: val })}
                                                className={`py-4 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all ${formData.correct_answer === val ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-400 hover:border-gray-300'}`}
                                            >
                                                {val === 'True' ? t('doctor.questions.option_true') : t('doctor.questions.option_false')}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-4 pt-10">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-[#059669] hover:bg-[#047857] text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-[#059669]/20 disabled:opacity-50 flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
                                    >
                                        {loading ? <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin"></div> : <><Save className="w-4 h-4" /> {t('doctor.questions.save_btn')}</>}
                                    </motion.button>
                                    {editingQuestion && (
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="px-8 bg-gray-100 dark:bg-white/5 hover:bg-rose-500/10 hover:text-rose-500 text-gray-400 font-black py-5 rounded-[1.5rem] transition-all text-xs uppercase tracking-widest"
                                        >
                                            {t('common.cancel')}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </div>

                {/* List Column */}
                <div className="xl:col-span-8">
                    <div className="bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-white/5 rounded-[3.5rem] p-10 min-h-[900px] flex flex-col shadow-sm">
                        <div className="flex items-center justify-between mb-12">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                    <ListChecks className="w-5 h-5 text-white" />
                                </div>
                                {t('doctor.questions.list_title')} <span className="text-gray-300 font-bold">/ {questions.length} {t('doctor.questions.items_suffix')}</span>
                            </h3>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('doctor.questions.auto_save')}</span>
                            </div>
                        </div>

                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="flex-1 space-y-6 pr-2 overflow-y-auto hidden-scrollbar"
                        >
                            {questions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full opacity-30 py-32">
                                    <Microscope className="w-24 h-24 mb-6 text-gray-400" />
                                    <p className="text-xl font-black uppercase tracking-widest">{t('doctor.questions.no_found')}</p>
                                </div>
                            ) : (
                                questions.map((q, idx) => (
                                    <motion.div 
                                        variants={itemVariants}
                                        key={q.id} 
                                        className="group bg-gray-50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8 transition-all hover:border-[#059669]/30 hover:bg-white dark:hover:bg-white/[0.02] hover:shadow-2xl hover:shadow-[#059669]/5"
                                    >
                                        <div className="flex justify-between items-start gap-8">
                                            <div className="flex items-start gap-6 flex-1 min-w-0">
                                                <div className="bg-white dark:bg-white/5 text-[#059669] dark:text-[#34d399] font-black w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-gray-100 dark:border-white/10 shadow-sm text-lg">
                                                    {idx + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 bg-white dark:bg-white/5 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-white/10">
                                                            {q.question_type === 'multiple_choice' ? t('doctor.questions.type_mcq') : q.question_type === 'true_false' ? t('doctor.questions.type_true_false') : t('doctor.questions.type_written')}
                                                        </span>
                                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 bg-emerald-500/5 px-3 py-1.5 rounded-xl border border-emerald-500/10">
                                                            {q.points} {t('doctor.questions.points_suffix')}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-xl font-bold text-gray-900 dark:text-white leading-relaxed mb-6">
                                                        {q.question_text}
                                                    </h4>
                                                    
                                                    {q.image_url && (
                                                        <div className="mb-6 relative group/img inline-block">
                                                            <img src={q.image_url} alt={t('doctor.questions.image_alt')} className="rounded-3xl max-h-48 object-cover border-4 border-white dark:border-white/5 shadow-2xl transition-transform group-hover/img:scale-105" />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity rounded-3xl flex items-center justify-center">
                                                                <Eye className="text-white w-8 h-8" />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {q.question_type === 'multiple_choice' && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                                            {q.options?.map((opt, i) => (
                                                                <div key={i} className={`p-4 rounded-2xl text-xs font-bold border transition-all ${q.correct_answer === String(i) ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/10' : 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-400'}`}>
                                                                    <span className="opacity-40 mr-2">{String.fromCharCode(65 + i)} .</span> {opt}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {q.question_type === 'true_false' && (
                                                        <div className="mt-4">
                                                            <span className="inline-flex items-center gap-3 bg-emerald-500 text-white font-black text-[10px] px-5 py-2.5 rounded-2xl shadow-lg shadow-emerald-500/20 uppercase tracking-widest">
                                                                <CheckCircle2 className="w-4 h-4" /> {t('doctor.questions.correct_answer')}: {q.correct_answer === 'True' ? t('doctor.questions.option_true') : t('doctor.questions.option_false')}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all -translate-y-2 group-hover:translate-y-0">
                                                <button onClick={() => startEdit(q)} className="w-12 h-12 bg-white dark:bg-white/5 hover:bg-[#059669] hover:text-white border border-gray-100 dark:border-white/10 rounded-xl flex items-center justify-center text-gray-400 transition-all shadow-xl shadow-black/5">
                                                    <Edit3 className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleDelete(q.id)} className="w-12 h-12 bg-white dark:bg-white/5 hover:bg-rose-500 hover:text-white border border-gray-100 dark:border-white/10 rounded-xl flex items-center justify-center text-rose-400 transition-all shadow-xl shadow-black/5">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>

            <style>{`
                .hidden-scrollbar::-webkit-scrollbar { display: none; }
                .hidden-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default TAQuestionManager;
