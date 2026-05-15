import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Send, Search, Filter, Clock, 
  User, CheckCircle2, AlertCircle, HelpCircle, ShieldAlert,
  ChevronRight, Reply, Inbox, Sparkles, FilterX,
  MessageCircle, CornerDownRight, Check
} from 'lucide-react';

const DoctorInquiries = () => {
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
            toast.success('Reply published');
            setReplyText('');
            setInquiries(prev => prev.map(inq => 
                inq.id === selectedInquiry.id 
                ? { ...inq, doctor_reply: replyText, status: 'replied', replied_at: new Date().toISOString() } 
                : inq
            ));
            setSelectedInquiry(prev => ({ ...prev, doctor_reply: replyText, status: 'replied', replied_at: new Date().toISOString() }));
        } catch (err) {
            toast.error('Failed to send response');
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 10, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[600px] gap-6">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
                  <Sparkles className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-violet-500 animate-pulse" />
                </div>
                <p className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse">Syncing Support Hub...</p>
            </div>
        );
    }

    return (
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={containerVariants}
          className="space-y-10 py-2"
        >
            {/* Header Area */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Communication Portal</span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-3">Academic Support</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-semibold max-w-xl leading-relaxed">
                        Respond to student inquiries, resolve issues, and provide academic guidance.
                    </p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="bg-emerald-500/5 dark:bg-emerald-500/[0.03] border border-emerald-500/10 dark:border-emerald-500/10 px-6 py-4 rounded-[1.5rem] flex items-center gap-4 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                          <Inbox className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1.5">Open Tickets</p>
                            <p className="text-gray-900 dark:text-white text-xl font-black leading-none">{inquiries.filter(i => i.status === 'pending').length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                {/* Inbox List Column */}
                <div className="xl:col-span-5 space-y-6">
                    {/* Search & Filter Component */}
                    <div className="bg-white/50 dark:bg-white/[0.01] border border-gray-200 dark:border-white/5 p-6 rounded-[2.5rem] space-y-5 backdrop-blur-sm">
                        <div className="relative group">
                            <Search className="absolute start-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                            <input 
                                type="text"
                                placeholder="Find ticket by student or topic..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-[1.2rem] py-4 ps-14 pe-6 text-sm text-gray-900 dark:text-white focus:ring-4 focus:ring-violet-500/5 transition-all font-semibold outline-none"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['all', 'pending', 'replied', 'question', 'complaint'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                        filter === f 
                                            ? 'bg-violet-600 text-white border-violet-600 shadow-xl shadow-violet-500/20' 
                                            : 'bg-white dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/5 hover:border-violet-500/30'
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tickets Container */}
                    <div className="space-y-4 max-h-[700px] overflow-y-auto pe-2 hidden-scrollbar">
                        <AnimatePresence mode="popLayout">
                          {filteredInquiries.length === 0 ? (
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-24 bg-white/30 dark:bg-white/[0.01] border border-dashed border-gray-200 dark:border-white/5 rounded-[3rem]"
                              >
                                  <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                    <FilterX className="w-10 h-10 text-gray-300 dark:text-white/10" />
                                  </div>
                                  <p className="text-gray-500 dark:text-gray-500 font-black text-xs uppercase tracking-widest">Inbox is clear</p>
                              </motion.div>
                          ) : (
                              filteredInquiries.map(inq => (
                                  <motion.button
                                      key={inq.id}
                                      variants={itemVariants}
                                      layout
                                      onClick={() => setSelectedInquiry(inq)}
                                      className={`w-full text-start p-6 rounded-[2rem] border transition-all relative group overflow-hidden ${
                                          selectedInquiry?.id === inq.id 
                                              ? 'bg-violet-600 border-violet-600 shadow-2xl shadow-violet-500/20' 
                                              : 'bg-white dark:bg-white/[0.02] border-gray-200 dark:border-white/5 hover:border-violet-500/20'
                                      }`}
                                  >
                                      {inq.status === 'pending' && selectedInquiry?.id !== inq.id && (
                                          <div className="absolute top-0 end-0 w-12 h-12">
                                              <div className="absolute top-2 right-2 w-3 h-3 bg-rose-500 rounded-full animate-ping"></div>
                                              <div className="absolute top-2 end-2 w-3 h-3 bg-rose-500 rounded-full"></div>
                                          </div>
                                      )}

                                      <div className="flex items-center gap-4 mb-4">
                                          <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center overflow-hidden border ${selectedInquiry?.id === inq.id ? 'border-white/20' : 'border-gray-100 dark:border-white/5'}`}>
                                              <img 
                                                  src={inq.avatar_url || `https://ui-avatars.com/api/?name=${inq.student_name}&background=random&color=fff&size=100`} 
                                                  alt={inq.student_name}
                                                  className="w-full h-full object-cover"
                                              />
                                          </div>
                                          <div className="min-w-0 flex-1">
                                              <h4 className={`font-black text-sm truncate ${selectedInquiry?.id === inq.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{inq.student_name}</h4>
                                              <p className={`text-[9px] font-black uppercase tracking-[0.2em] mt-0.5 ${selectedInquiry?.id === inq.id ? 'text-white/60' : 'text-gray-400'}`}>{inq.course_name}</p>
                                          </div>
                                      </div>
                                      
                                      <h5 className={`font-bold text-xs mb-2 truncate ${selectedInquiry?.id === inq.id ? 'text-white/90' : 'text-gray-700 dark:text-gray-300'}`}>
                                        {inq.subject || 'Academic Support Request'}
                                      </h5>
                                      <p className={`text-[11px] line-clamp-2 leading-relaxed ${selectedInquiry?.id === inq.id ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {inq.content}
                                      </p>
                                      
                                      <div className="flex items-center justify-between mt-5">
                                          <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.15em] border ${
                                              selectedInquiry?.id === inq.id 
                                                ? 'bg-white/10 text-white border-white/10' 
                                                : inq.type === 'complaint' ? 'bg-rose-500/10 text-rose-500 border-rose-500/10' : 'bg-blue-500/10 text-blue-500 border-blue-500/10'
                                          }`}>
                                              {inq.type}
                                          </div>
                                          <span className={`text-[9px] font-black uppercase tracking-widest ${selectedInquiry?.id === inq.id ? 'text-white/40' : 'text-gray-400'}`}>
                                            {new Date(inq.created_at).toLocaleDateString()}
                                          </span>
                                      </div>
                                  </motion.button>
                              ))
                          )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Resolution Detail Column */}
                <div className="xl:col-span-7 h-full">
                    <AnimatePresence mode="wait">
                      {selectedInquiry ? (
                          <motion.div 
                            key={selectedInquiry.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col h-full backdrop-blur-sm"
                          >
                              {/* Detail Header */}
                              <div className="p-10 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                  <div className="flex items-center gap-5">
                                      <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-violet-500 to-indigo-600 p-[2px] shadow-xl shadow-violet-500/20">
                                          <div className="w-full h-full rounded-[1.4rem] bg-white dark:bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
                                              <img 
                                                  src={selectedInquiry.avatar_url || `https://ui-avatars.com/api/?name=${selectedInquiry.student_name}&background=random&color=fff`} 
                                                  alt={selectedInquiry.student_name}
                                                  className="w-full h-full object-cover"
                                              />
                                          </div>
                                      </div>
                                      <div>
                                          <h3 className="text-gray-900 dark:text-white font-black text-2xl tracking-tight leading-none mb-2">{selectedInquiry.student_name}</h3>
                                          <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">
                                              {selectedInquiry.type} <span className="mx-2 text-gray-200 dark:text-white/10">|</span> {selectedInquiry.course_name}
                                          </p>
                                      </div>
                                  </div>
                                  <div className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                      selectedInquiry.status === 'replied' 
                                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  }`}>
                                      {selectedInquiry.status === 'replied' ? 'Resolved' : 'Pending Action'}
                                  </div>
                              </div>

                              {/* Content Section (Chat-like) */}
                              <div className="flex-1 p-10 overflow-y-auto space-y-10 min-h-[400px]">
                                  {/* Student Message */}
                                  <div className="flex gap-4 max-w-[85%]">
                                      <div className="flex-1 space-y-3">
                                          <div className="flex items-center gap-3 ms-2 mb-1">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inquiry Content</span>
                                            <div className="h-px bg-gray-100 dark:bg-white/5 flex-1"></div>
                                          </div>
                                          <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8 relative">
                                              <div className="absolute -start-2 top-8 w-4 h-4 bg-gray-50 dark:bg-white/[0.03] border-s border-t border-gray-100 dark:border-white/5 rotate-[-45deg]"></div>
                                              <h4 className="text-gray-900 dark:text-white font-black text-lg mb-4">{selectedInquiry.subject || 'Student Request'}</h4>
                                              <p className="text-gray-700 dark:text-gray-300 font-semibold leading-relaxed text-sm">{selectedInquiry.content}</p>
                                              <div className="mt-8 flex items-center gap-3 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                                  <Clock className="w-3.5 h-3.5" />
                                                  {new Date(selectedInquiry.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                              </div>
                                          </div>
                                      </div>
                                  </div>

                                  {/* Doctor Response */}
                                  {selectedInquiry.doctor_reply ? (
                                      <div className="flex flex-row-reverse gap-4 ml-auto max-w-[85%]">
                                          <div className="flex-1 space-y-3">
                                              <div className="flex flex-row-reverse items-center gap-3 me-2 mb-1">
                                                <span className="text-[10px] font-black text-violet-500 uppercase tracking-widest">Professional Feedback</span>
                                                <div className="h-px bg-violet-100 dark:bg-violet-500/10 flex-1"></div>
                                              </div>
                                              <div className="bg-violet-600 text-white shadow-2xl shadow-violet-500/20 rounded-[2.5rem] p-8 relative">
                                                  <div className="absolute -end-2 top-8 w-4 h-4 bg-violet-600 rotate-[-45deg]"></div>
                                                  <p className="text-white/95 font-semibold italic leading-relaxed text-sm">
                                                    "{selectedInquiry.doctor_reply}"
                                                  </p>
                                                  <div className="mt-8 flex items-center justify-end gap-3 text-white/50 text-[10px] font-black uppercase tracking-[0.2em]">
                                                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                                                      Replied {new Date(selectedInquiry.replied_at).toLocaleDateString()}
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                  ) : (
                                      <form onSubmit={handleReply} className="pt-6">
                                          <div className="bg-gray-50 dark:bg-white/[0.01] border border-gray-200 dark:border-white/5 rounded-[2.5rem] p-8 space-y-6">
                                              <div className="flex items-center gap-3 ms-2">
                                                  <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
                                                    <Reply className="w-4 h-4 text-violet-500" />
                                                  </div>
                                                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Compose Resolution</span>
                                              </div>
                                              <textarea 
                                                  rows="5"
                                                  value={replyText}
                                                  onChange={(e) => setReplyText(e.target.value)}
                                                  placeholder="Provide your academic guidance or resolution here..."
                                                  className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-[1.8rem] p-6 text-gray-900 dark:text-white text-sm focus:ring-4 focus:ring-violet-500/5 transition-all outline-none resize-none font-semibold"
                                              ></textarea>
                                              <div className="flex justify-end">
                                                  <motion.button
                                                      whileHover={{ scale: 1.02 }}
                                                      whileTap={{ scale: 0.98 }}
                                                      type="submit"
                                                      disabled={submittingReply || !replyText.trim()}
                                                      className="bg-gray-900 dark:bg-white text-white dark:text-black font-black py-4.5 px-10 rounded-2xl text-xs uppercase tracking-[0.2em] shadow-2xl transition-all disabled:opacity-50 flex items-center gap-3"
                                                  >
                                                      {submittingReply ? (
                                                          <div className="w-5 h-5 border-3 border-gray-400 border-t-white dark:border-gray-200 dark:border-t-black rounded-full animate-spin"></div>
                                                      ) : (
                                                          <Send className="w-4 h-4" />
                                                      )}
                                                      Publish Response
                                                  </motion.button>
                                              </div>
                                          </div>
                                      </form>
                                  )}
                              </div>
                          </motion.div>
                      ) : (
                          <motion.div 
                            key="placeholder"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full bg-white/20 dark:bg-white/[0.01] border border-dashed border-gray-200 dark:border-white/5 rounded-[3.5rem] flex flex-col items-center justify-center p-20 text-center"
                          >
                              <div className="w-24 h-24 rounded-[2.5rem] bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-8">
                                  <MessageCircle className="w-12 h-12 text-gray-300 dark:text-white/5" />
                              </div>
                              <h4 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">Resolution Hub</h4>
                              <p className="text-gray-500 dark:text-gray-500 text-sm max-w-xs font-semibold">Select a student inquiry from your inbox to start the resolution process.</p>
                          </motion.div>
                      )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default DoctorInquiries;
