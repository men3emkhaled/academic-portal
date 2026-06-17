import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, Clock, Reply, Inbox,
  MessageCircle, Check, CheckCircle2
} from 'lucide-react';
import {
  PageHeader, SectionCard, StatCard, StatusBadge,
  EmptyState, LoadingState, SearchInput, SegmentedTabs, Spinner
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'replied', label: 'Replied' },
  { value: 'question', label: 'Questions' },
  { value: 'complaint', label: 'Complaints' },
];

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

    const pendingCount = inquiries.filter(i => i.status === 'pending').length;

    if (loading) {
        return <LoadingState label="Loading support inbox..." />;
    }

    return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="space-y-6"
        >
            {/* Header */}
            <PageHeader
                icon={MessageSquare}
                title="Academic Support"
                description="Respond to student inquiries, resolve issues, and provide academic guidance."
                actions={
                    <StatCard
                        label="Open Tickets"
                        value={pendingCount}
                        icon={Inbox}
                        accent
                        className="min-w-[180px]"
                    />
                }
            />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 items-start">
                {/* Inbox List Column */}
                <div className="xl:col-span-5">
                    <SectionCard
                        title="Inbox"
                        description={`${filteredInquiries.length} ticket${filteredInquiries.length === 1 ? '' : 's'}`}
                        bodyClassName="p-0"
                    >
                        {/* Search & Filter */}
                        <div className="space-y-3 border-b border-border p-4">
                            <SearchInput
                                className="w-full"
                                placeholder="Find ticket by student or topic..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <SegmentedTabs
                                size="sm"
                                value={filter}
                                onChange={setFilter}
                                options={FILTER_OPTIONS}
                                className="flex-wrap"
                            />
                        </div>

                        {/* Tickets */}
                        <div className="max-h-[640px] overflow-y-auto p-2">
                            {filteredInquiries.length === 0 ? (
                                <div className="p-4">
                                    <EmptyState
                                        icon={Inbox}
                                        title="Inbox is clear"
                                        description="No tickets match your current search or filter."
                                    />
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <AnimatePresence mode="popLayout">
                                        {filteredInquiries.map(inq => {
                                            const isSelected = selectedInquiry?.id === inq.id;
                                            return (
                                                <motion.button
                                                    key={inq.id}
                                                    layout
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.12 }}
                                                    onClick={() => setSelectedInquiry(inq)}
                                                    className={`w-full text-start rounded-lg border p-3 transition-colors ${
                                                        isSelected
                                                            ? 'border-primary/30 bg-primary/5'
                                                            : 'border-transparent hover:bg-muted/50'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Avatar size="default" className="shrink-0">
                                                            <AvatarImage src={inq.avatar_url} alt={inq.student_name} />
                                                            <AvatarFallback>
                                                                {(inq.student_name || 'S').charAt(0).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <h4 className="truncate text-sm font-medium text-foreground">
                                                                    {inq.student_name}
                                                                </h4>
                                                                {inq.status === 'pending' && (
                                                                    <span className="size-2 shrink-0 rounded-full bg-primary" />
                                                                )}
                                                            </div>
                                                            <p className="truncate text-xs text-muted-foreground">
                                                                {inq.course_name}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <h5 className="mt-2.5 truncate text-sm font-medium text-foreground">
                                                        {inq.subject || 'Academic Support Request'}
                                                    </h5>
                                                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                                        {inq.content}
                                                    </p>

                                                    <div className="mt-3 flex items-center justify-between gap-2">
                                                        <StatusBadge variant={inq.type === 'complaint' ? 'warning' : 'neutral'}>
                                                            {inq.type}
                                                        </StatusBadge>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(inq.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </SectionCard>
                </div>

                {/* Conversation Column */}
                <div className="xl:col-span-7">
                    <AnimatePresence mode="wait">
                        {selectedInquiry ? (
                            <motion.div
                                key={selectedInquiry.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.12 }}
                            >
                                <SectionCard
                                    bodyClassName="p-0"
                                    header={
                                        <header className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center md:justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar size="lg" className="shrink-0">
                                                    <AvatarImage src={selectedInquiry.avatar_url} alt={selectedInquiry.student_name} />
                                                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                                        {(selectedInquiry.student_name || 'S').charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <h3 className="truncate text-base font-semibold text-foreground">
                                                        {selectedInquiry.student_name}
                                                    </h3>
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        <span className="capitalize">{selectedInquiry.type}</span>
                                                        <span className="mx-1.5 text-border">|</span>
                                                        {selectedInquiry.course_name}
                                                    </p>
                                                </div>
                                            </div>
                                            <StatusBadge
                                                variant={selectedInquiry.status === 'replied' ? 'success' : 'warning'}
                                                icon={selectedInquiry.status === 'replied' ? CheckCircle2 : Clock}
                                            >
                                                {selectedInquiry.status === 'replied' ? 'Resolved' : 'Pending'}
                                            </StatusBadge>
                                        </header>
                                    }
                                >
                                    {/* Conversation thread */}
                                    <div className="min-h-[360px] space-y-6 p-4 md:p-6">
                                        {/* Student message */}
                                        <div className="flex flex-col items-start gap-1.5">
                                            <span className="ms-1 text-xs font-medium text-muted-foreground">
                                                {selectedInquiry.student_name}
                                            </span>
                                            <div className="max-w-[85%] rounded-lg rounded-ss-sm border border-border bg-muted/50 p-4">
                                                {selectedInquiry.subject && (
                                                    <h4 className="mb-2 text-sm font-semibold text-foreground">
                                                        {selectedInquiry.subject}
                                                    </h4>
                                                )}
                                                <p className="text-sm leading-relaxed text-foreground">
                                                    {selectedInquiry.content}
                                                </p>
                                                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Clock className="size-3.5" />
                                                    {new Date(selectedInquiry.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Doctor reply */}
                                        {selectedInquiry.doctor_reply && (
                                            <div className="flex flex-col items-end gap-1.5">
                                                <span className="me-1 text-xs font-medium text-primary">You</span>
                                                <div className="max-w-[85%] rounded-lg rounded-se-sm border border-primary/20 bg-primary/10 p-4">
                                                    <p className="text-sm leading-relaxed text-foreground">
                                                        {selectedInquiry.doctor_reply}
                                                    </p>
                                                    <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
                                                        <Check className="size-3.5 text-primary" />
                                                        Replied {new Date(selectedInquiry.replied_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Reply composer */}
                                    {!selectedInquiry.doctor_reply && (
                                        <form onSubmit={handleReply} className="border-t border-border p-4 md:p-6">
                                            <div className="mb-3 flex items-center gap-2">
                                                <Reply className="size-4 text-muted-foreground" />
                                                <span className="text-sm font-medium text-foreground">Compose reply</span>
                                            </div>
                                            <Textarea
                                                rows={5}
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                placeholder="Provide your academic guidance or resolution here..."
                                                className="resize-none"
                                            />
                                            <div className="mt-3 flex justify-end">
                                                <Button
                                                    type="submit"
                                                    disabled={submittingReply || !replyText.trim()}
                                                >
                                                    {submittingReply ? (
                                                        <Spinner className="size-4" />
                                                    ) : (
                                                        <Send className="size-4" />
                                                    )}
                                                    <span>Publish Response</span>
                                                </Button>
                                            </div>
                                        </form>
                                    )}
                                </SectionCard>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="placeholder"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.12 }}
                            >
                                <EmptyState
                                    icon={MessageCircle}
                                    title="Resolution Hub"
                                    description="Select a student inquiry from your inbox to start the resolution process."
                                    className="min-h-[400px]"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default DoctorInquiries;
