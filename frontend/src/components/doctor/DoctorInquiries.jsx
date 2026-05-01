import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { 
  MessageSquare, Send, Search, Filter, Clock, 
  User, CheckCircle2, AlertCircle, HelpCircle, ShieldAlert,
  ChevronRight, Reply, Inbox
} from 'lucide-react';

const DoctorInquiries = () => {
    const { doctorApi } = useDoctorAuth();
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all'); // all, pending, replied, question, complaint
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);

    const fetchInquiries = async () => {
        try {
            const res = await doctorApi('get', '/doctor/inquiries');
            setInquiries(res.data);
        } catch (err) {
            toast.error('Failed to load inquiries');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInquiries();
    }, [doctorApi]);

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedInquiry) return;

        setSubmittingReply(true);
        try {
            await doctorApi('post', `/doctor/inquiries/${selectedInquiry.id}/reply`, { reply: replyText });
            toast.success('Reply sent successfully');
            setReplyText('');
            // Update local state
            setInquiries(prev => prev.map(inq => 
                inq.id === selectedInquiry.id 
                ? { ...inq, doctor_reply: replyText, status: 'replied', replied_at: new Date().toISOString() } 
                : inq
            ));
            setSelectedInquiry(prev => ({ ...prev, doctor_reply: replyText, status: 'replied', replied_at: new Date().toISOString() }));
        } catch (err) {
            toast.error('Failed to send reply');
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
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-doctor-primary/30 border-t-doctor-primary rounded-full animate-spin"></div>
                    <p className="text-doctor-text-muted font-bold animate-pulse">LOADING INQUIRIES...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Support Center</h1>
                    <p className="text-doctor-text-muted font-medium mt-1">Manage student questions and complaints across your courses.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-2xl flex items-center gap-3">
                        <Inbox className="w-5 h-5 text-emerald-500" />
                        <div>
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1">New</p>
                            <p className="text-white font-bold leading-none">{inquiries.filter(i => i.status === 'pending').length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* List Column */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Search & Filter */}
                    <div className="bg-doctor-card border border-white/5 p-4 rounded-[2rem] space-y-4 shadow-xl">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-doctor-text-muted" />
                            <input 
                                type="text"
                                placeholder="Search by student, subject or content..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:border-doctor-primary/50 focus:outline-none transition-all"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['all', 'pending', 'replied', 'question', 'complaint'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                        filter === f 
                                            ? 'bg-doctor-primary text-white border-doctor-primary shadow-lg shadow-doctor-primary/20' 
                                            : 'bg-white/5 text-doctor-text-muted border-white/5 hover:border-white/10'
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Inquiries List */}
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredInquiries.length === 0 ? (
                            <div className="text-center py-20 bg-doctor-card border border-white/5 rounded-[2rem]">
                                <Inbox className="w-12 h-12 text-white/5 mx-auto mb-4" />
                                <p className="text-doctor-text-muted font-bold">No inquiries found matching your criteria.</p>
                            </div>
                        ) : (
                            filteredInquiries.map(inq => (
                                <button
                                    key={inq.id}
                                    onClick={() => setSelectedInquiry(inq)}
                                    className={`w-full text-left p-5 rounded-3xl border transition-all group ${
                                        selectedInquiry?.id === inq.id 
                                            ? 'bg-doctor-primary/10 border-doctor-primary/30' 
                                            : 'bg-doctor-card border-white/5 hover:border-white/10'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden">
                                                <img 
                                                    src={`https://ui-avatars.com/api/?name=${inq.student_name}&background=random&color=fff`} 
                                                    alt={inq.student_name}
                                                    className="w-full h-full object-cover opacity-80"
                                                />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold text-[14px] leading-tight">{inq.student_name}</h4>
                                                <p className="text-[10px] text-doctor-text-muted font-bold uppercase tracking-widest mt-0.5">{inq.course_name}</p>
                                            </div>
                                        </div>
                                        {inq.status === 'pending' && <div className="w-2 h-2 rounded-full bg-doctor-primary shadow-[0_0_8px_#8b5cf6]"></div>}
                                    </div>
                                    <h5 className="text-white font-bold text-sm mb-1 truncate">{inq.subject || 'No Subject'}</h5>
                                    <p className="text-doctor-text-muted text-xs line-clamp-2 leading-relaxed">{inq.content}</p>
                                    
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                                                inq.type === 'complaint' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            }`}>
                                                {inq.type}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-bold text-doctor-text-muted uppercase tracking-widest">{new Date(inq.created_at).toLocaleDateString()}</span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Detail Column */}
                <div className="lg:col-span-7">
                    {selectedInquiry ? (
                        <div className="bg-doctor-card border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-full animate-slideInRight">
                            <div className="p-8 border-b border-white/5">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-doctor-primary to-doctor-secondary p-[2px]">
                                            <div className="w-full h-full rounded-[14px] bg-doctor-card flex items-center justify-center overflow-hidden">
                                                <img 
                                                    src={`https://ui-avatars.com/api/?name=${selectedInquiry.student_name}&background=random&color=fff`} 
                                                    alt={selectedInquiry.student_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-white font-black text-xl leading-none">{selectedInquiry.student_name}</h3>
                                            <p className="text-doctor-text-muted font-bold text-xs uppercase tracking-[0.15em] mt-2">
                                                {selectedInquiry.type} • {selectedInquiry.course_name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                        selectedInquiry.status === 'replied' 
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    }`}>
                                        {selectedInquiry.status}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                                        <div className="flex items-center gap-2 text-doctor-primary mb-3">
                                            {selectedInquiry.type === 'complaint' ? <ShieldAlert className="w-4 h-4" /> : <HelpCircle className="w-4 h-4" />}
                                            <span className="text-[10px] font-black uppercase tracking-widest">Message Subject</span>
                                        </div>
                                        <h4 className="text-white font-bold text-lg mb-4">{selectedInquiry.subject || 'No Subject Provided'}</h4>
                                        <div className="h-px bg-white/5 mb-4 w-12"></div>
                                        <p className="text-white font-medium leading-relaxed opacity-90">{selectedInquiry.content}</p>
                                        <div className="mt-6 flex items-center gap-2 text-doctor-text-muted text-[10px] font-bold uppercase tracking-widest">
                                            <Clock className="w-3 h-3" />
                                            Received on {new Date(selectedInquiry.created_at).toLocaleString()}
                                        </div>
                                    </div>

                                    {selectedInquiry.doctor_reply ? (
                                        <div className="bg-doctor-primary/5 rounded-3xl p-6 border border-doctor-primary/10 relative">
                                            <div className="absolute -top-3 right-8 bg-doctor-primary text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-doctor-primary/20 flex items-center gap-2">
                                                <Reply className="w-3 h-3" /> Your Reply
                                            </div>
                                            <p className="text-white/90 font-medium italic leading-relaxed">"{selectedInquiry.doctor_reply}"</p>
                                            <div className="mt-4 flex items-center gap-2 text-doctor-primary text-[10px] font-bold uppercase tracking-widest">
                                                <Clock className="w-3 h-3" />
                                                Replied on {new Date(selectedInquiry.replied_at).toLocaleString()}
                                            </div>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleReply} className="space-y-4 pt-4">
                                            <div className="flex items-center gap-3 ml-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-doctor-primary"></div>
                                                <span className="text-[10px] font-black text-doctor-text-muted uppercase tracking-widest">Post a reply</span>
                                            </div>
                                            <div className="relative">
                                                <textarea 
                                                    rows="5"
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder="Type your response here to help the student..."
                                                    className="w-full bg-white/5 border border-white/5 rounded-[2rem] p-6 text-white text-sm focus:border-doctor-primary/50 focus:outline-none transition-all resize-none shadow-inner"
                                                ></textarea>
                                            </div>
                                            <div className="flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={submittingReply || !replyText.trim()}
                                                    className="bg-doctor-primary hover:bg-doctor-primary/90 text-white font-black py-4 px-10 rounded-2xl text-[13px] uppercase tracking-wider shadow-xl shadow-doctor-primary/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3 disabled:opacity-50 disabled:translate-y-0"
                                                >
                                                    {submittingReply ? (
                                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    ) : (
                                                        <Send className="w-5 h-5" />
                                                    )}
                                                    Send Reply
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full bg-doctor-card/30 border border-white/5 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center p-20 text-center">
                            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                                <MessageSquare className="w-10 h-10 text-white/10" />
                            </div>
                            <h4 className="text-white font-bold text-lg mb-2">Select an inquiry</h4>
                            <p className="text-doctor-text-muted text-sm max-w-xs">Click on any message from the list on the left to view details and respond.</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out forwards;
                }
                .animate-slideInRight {
                    animation: slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(139, 92, 246, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(139, 92, 246, 0.4);
                }
            `}</style>
        </div>
    );
};

export default DoctorInquiries;
