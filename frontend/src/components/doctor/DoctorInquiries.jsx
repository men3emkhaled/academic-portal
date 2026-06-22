import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { 
  MessageSquare, Send, Search, Clock, 
  User, Reply, Inbox
} from 'lucide-react';

const DoctorInquiries = () => {
    const { t } = useTranslation();
    const { doctorApi } = useDoctorAuth();
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);

    const fetchInquiries = async () => {
        try {
            const res = await doctorApi('get', '/doctor/inquiries');
            setInquiries(res.data);
        } catch (err) {
            toast.error(t('doctor.inquiries.failed_load'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInquiries();
    }, []);

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedInquiry) return;

        setSubmittingReply(true);
        try {
            await doctorApi('post', `/doctor/inquiries/${selectedInquiry.id}/reply`, { reply: replyText });
            toast.success(t('doctor.inquiries.reply_published'));
            setReplyText('');
            setInquiries(prev => prev.map(inq => 
                inq.id === selectedInquiry.id 
                ? { ...inq, doctor_reply: replyText, status: 'replied', replied_at: new Date().toISOString() } 
                : inq
            ));
            setSelectedInquiry(prev => ({ ...prev, doctor_reply: replyText, status: 'replied', replied_at: new Date().toISOString() }));
        } catch (err) {
            toast.error(t('doctor.inquiries.failed_reply'));
        } finally {
            setSubmittingReply(false);
        }
    };

    const filteredInquiries = inquiries.filter(inq => {
        const matchesSearch = 
            (inq.student_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (inq.subject && inq.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (inq.content || '').toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesFilter = 
            filter === 'all' || 
            (filter === 'pending' && inq.status === 'pending') ||
            (filter === 'replied' && inq.status === 'replied') ||
            (filter === 'question' && inq.type === 'question') ||
            (filter === 'complaint' && inq.type === 'complaint');
            
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[600px] gap-4">
                <div className="w-12 h-12 border-4 border-[#059669]/20 border-t-[#059669] rounded-full animate-spin"></div>
                <p className="text-sm text-gray-400">{t('common.loading')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 py-2">
            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-5 h-5 text-[#059669]" />
                        <span className="text-xs text-gray-400 font-medium">{t('doctor.inquiries.communication_portal')}</span>
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">{t('doctor.inquiries.academic_support')}</h1>
                    <p className="text-sm text-gray-500">{t('doctor.inquiries.subtitle')}</p>
                </div>
                <div className="bg-[#059669]/5 border border-[#059669]/10 px-4 py-3 rounded-xl flex items-center gap-3">
                    <Inbox className="w-5 h-5 text-[#059669]" />
                    <div>
                        <p className="text-xs text-[#059669] font-medium">{t('doctor.inquiries.open_tickets')}</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{inquiries.filter(i => i.status === 'pending').length}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                {/* Inbox List */}
                <div className="xl:col-span-5 space-y-4">
                    <div className="bg-white/50 dark:bg-white/[0.01] border border-gray-200 dark:border-white/5 p-4 rounded-xl space-y-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                                type="text"
                                placeholder={t('doctor.inquiries.search_placeholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm text-gray-900 dark:text-white outline-none"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['all', 'pending', 'replied', 'question', 'complaint'].map(f => (
                                <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                                    filter === f ? 'bg-[#059669] text-white border-[#059669]' : 'bg-white dark:bg-white/5 text-gray-500 border-gray-200 dark:border-white/5 hover:border-[#059669]/30'
                                }`}>
                                    {t('doctor.inquiries.' + f)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3 max-h-[700px] overflow-y-auto">
                        {filteredInquiries.length === 0 ? (
                            <div className="text-center py-16 bg-white/30 dark:bg-white/[0.01] border border-dashed border-gray-200 dark:border-white/5 rounded-xl">
                                <p className="text-sm text-gray-500">{t('doctor.inquiries.inbox_clear')}</p>
                            </div>
                        ) : (
                            filteredInquiries.map(inq => (
                                <button
                                    key={inq.id}
                                    onClick={() => setSelectedInquiry(inq)}
                                    className={`w-full text-start p-4 rounded-xl border transition-all ${
                                        selectedInquiry?.id === inq.id 
                                            ? 'bg-[#059669] border-[#059669] text-white' 
                                            : 'bg-white dark:bg-white/[0.02] border-gray-200 dark:border-white/5 hover:border-[#059669]/30'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden">
                                            <img 
                                                src={inq.avatar_url || `https://ui-avatars.com/api/?name=${inq.student_name}&background=059669&color=fff&size=80`} 
                                                alt={inq.student_name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className={`text-sm font-medium truncate ${selectedInquiry?.id === inq.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{inq.student_name}</h4>
                                            <p className={`text-xs ${selectedInquiry?.id === inq.id ? 'text-white/70' : 'text-gray-400'}`}>{inq.course_name}</p>
                                        </div>
                                    </div>
                                    <h5 className={`text-sm font-medium mb-1 truncate ${selectedInquiry?.id === inq.id ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                        {inq.subject || t('doctor.inquiries.academic_support_request')}
                                    </h5>
                                    <p className={`text-xs line-clamp-2 ${selectedInquiry?.id === inq.id ? 'text-white/70' : 'text-gray-500'}`}>
                                        {inq.content}
                                    </p>
                                    <div className="flex items-center justify-between mt-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                                            selectedInquiry?.id === inq.id 
                                                ? 'bg-white/10 text-white border-white/10' 
                                                : inq.type === 'complaint' ? 'bg-rose-500/10 text-rose-500 border-rose-500/10' : 'bg-blue-500/10 text-blue-500 border-blue-500/10'
                                        }`}>
                                            {inq.type === 'question' ? t('doctor.inquiries.question') : t('doctor.inquiries.complaint')}
                                        </span>
                                        <span className={`text-xs ${selectedInquiry?.id === inq.id ? 'text-white/50' : 'text-gray-400'}`}>
                                            {new Date(inq.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Detail Column */}
                <div className="xl:col-span-7">
                    {selectedInquiry ? (
                        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                            {/* Header */}
                            <div className="p-5 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl overflow-hidden">
                                        <img 
                                            src={selectedInquiry.avatar_url || `https://ui-avatars.com/api/?name=${selectedInquiry.student_name}&background=059669&color=fff`} 
                                            alt={selectedInquiry.student_name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-gray-900 dark:text-white font-semibold text-lg">{selectedInquiry.student_name}</h3>
                                        <p className="text-xs text-gray-400">
                                            {selectedInquiry.type} — {selectedInquiry.course_name}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                    selectedInquiry.status === 'replied' 
                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                }`}>
                                    {selectedInquiry.status === 'replied' ? t('doctor.inquiries.resolved') : t('doctor.inquiries.pending_action')}
                                </span>
                            </div>

                            {/* Content */}
                            <div className="p-5 space-y-6 min-h-[300px]">
                                <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-xl p-5">
                                    <h4 className="text-gray-900 dark:text-white font-medium mb-2">{selectedInquiry.subject || t('doctor.inquiries.student_request')}</h4>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{selectedInquiry.content}</p>
                                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                                        <Clock className="w-3 h-3" />
                                        {new Date(selectedInquiry.created_at).toLocaleString()}
                                    </div>
                                </div>

                                {selectedInquiry.doctor_reply ? (
                                    <div className="bg-[#059669]/5 border border-[#059669]/20 rounded-xl p-5">
                                        <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{selectedInquiry.doctor_reply}"</p>
                                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                                            <Clock className="w-3 h-3" />
                                            {t('doctor.inquiries.replied_prefix')} {new Date(selectedInquiry.replied_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleReply} className="space-y-4">
                                        <textarea 
                                            rows="4"
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder={t('doctor.inquiries.reply_placeholder')}
                                            className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white text-sm outline-none resize-none"
                                        ></textarea>
                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={submittingReply || !replyText.trim()}
                                                className="bg-[#059669] hover:bg-[#047857] text-white font-medium py-2.5 px-6 rounded-xl text-sm transition-all disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {submittingReply ? (
                                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                                ) : (
                                                    <Send className="w-4 h-4" />
                                                )}
                                                {t('doctor.inquiries.publish_response')}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white/20 dark:bg-white/[0.01] border border-dashed border-gray-200 dark:border-white/5 rounded-xl flex flex-col items-center justify-center p-16 text-center min-h-[400px]">
                            <MessageSquare className="w-10 h-10 text-gray-300 dark:text-white/5 mb-4" />
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('doctor.inquiries.resolution_hub')}</h4>
                            <p className="text-sm text-gray-500">{t('doctor.inquiries.resolution_hub_desc')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorInquiries;
