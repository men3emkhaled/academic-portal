import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useStudentAuth } from '../context/StudentAuthContext';
import studentApi from '../services/studentApi';
import toast from 'react-hot-toast';
import { 
  BookOpen, FileText, Upload, Trash2, Check, X,
  Search, Paperclip, MessageSquare, AlertCircle, FileCode,
  Download, Clock, CheckCircle2, ShieldAlert, ArrowDown, ExternalLink, Image,
  ThumbsUp, Bookmark, Send, XCircle
} from 'lucide-react';

const MaterialHubTab = ({ courseId }) => {
  const { t, i18n } = useTranslation();
  const { student } = useStudentAuth();
  const isAr = i18n.language === 'ar';

  const [posts, setPosts] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedBatch, setSelectedBatch] = useState(student?.batch || 2025);
  const [availableHubBatches, setAvailableHubBatches] = useState([]);

  // Upload Form State
  const [caption, setCaption] = useState('');
  const [type, setType] = useState('lecture'); // lecture, exam
  const [uploadBatch, setUploadBatch] = useState(student?.batch || 2025);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Edit Batch/Caption State
  const [editingPostId, setEditingPostId] = useState(null);
  const [editBatch, setEditBatch] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Rejection State
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const isReviewer = student?.role === 'admin' || (student?.permissions || []).includes('manage_resources');

  const fetchPosts = useCallback(async (batchVal) => {
    const batch = batchVal !== undefined ? batchVal : selectedBatch;
    try {
      const res = await studentApi.get(`/material-hub/${courseId}?batch=${batch}`);
      setPosts(res.data);
    } catch (err) {
      console.error('Error fetching material hub posts:', err);
      toast.error(t('materialHub.load_failed'));
    } finally {
      setLoading(false);
    }
  }, [courseId, isAr, selectedBatch]);

  const fetchAvailableHubBatches = useCallback(async () => {
    try {
      const res = await studentApi.get(`/material-hub/${courseId}?batch=all`);
      const batches = [...new Set(res.data.map(p => p.batch).filter(Boolean))]
        .sort((a, b) => b - a);
      setAvailableHubBatches(batches);
    } catch (err) {
      console.error('Error fetching available batches:', err);
    }
  }, [courseId]);

  useEffect(() => {
    fetchPosts();
    fetchAvailableHubBatches();
  }, [fetchPosts, fetchAvailableHubBatches]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast.error(t('materialHub.file_too_large'));
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error(t('materialHub.select_file'));
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('courseId', courseId);
    formData.append('type', type);
    formData.append('caption', caption);
    formData.append('batch', uploadBatch);
    formData.append('file', file);

    try {
      await studentApi.post('/material-hub', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(
        isReviewer
          ? t('materialHub.post_success')
          : t('materialHub.sent_for_review')
      );
      setCaption('');
      setFile(null);
      const fileInput = document.getElementById('materialFileInput');
      if (fileInput) fileInput.value = '';
      fetchPosts();
    } catch (err) {
      console.error('Error posting material:', err);
      toast.error(err.response?.data?.message || t('materialHub.upload_failed'));
    } finally {
      setUploading(false);
    }
  };

  const handleEditPost = (post) => {
    setEditingPostId(post.id);
    setEditBatch(post.batch || student?.batch || 2025);
    setEditCaption(post.caption || '');
  };

  const handleSaveEdit = async (postId) => {
    setSavingEdit(true);
    try {
      await studentApi.put(`/material-hub/${postId}`, {
        batch: editBatch,
        caption: editCaption
      });
      toast.success(t('materialHub.save_success'));
      setEditingPostId(null);
      fetchPosts();
    } catch (err) {
      toast.error(t('materialHub.save_failed'));
    } finally {
      setSavingEdit(false);
    }
  };

  const handleReviewPost = async (id, status, reason = '') => {
    setSubmittingReview(true);
    try {
      await studentApi.patch(`/material-hub/${id}/review`, {
        status,
        rejectReason: reason
      });
      toast.success(
        status === 'approved'
          ? t('materialHub.approved_msg')
          : t('materialHub.rejected_msg')
      );
      setRejectingId(null);
      setRejectReason('');
      fetchPosts();
    } catch (err) {
      console.error('Error reviewing post:', err);
      toast.error(t('materialHub.review_error'));
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm(t('materialHub.delete_confirm'))) return;
    try {
      await studentApi.delete(`/material-hub/${id}`);
      toast.success(t('materialHub.delete_success'));
      fetchPosts();
    } catch (err) {
      console.error('Error deleting post:', err);
      toast.error(t('materialHub.delete_failed'));
    }
  };

  // ── Upvote ──────────────────────────────────────────────────────────────
  const handleToggleUpvote = async (postId) => {
    let originalPost = null;
    
    // Optimistic Update
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      originalPost = { ...p };
      const nextHasUpvoted = !p.has_upvoted;
      const delta = nextHasUpvoted ? 1 : -1;
      return {
        ...p,
        has_upvoted: nextHasUpvoted,
        upvotes_count: Math.max(0, (p.upvotes_count || 0) + delta)
      };
    }));

    try {
      const res = await studentApi.post(`/material-hub/${postId}/upvote`);
      // Sync exact state from response
      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p;
        return {
          ...p,
          has_upvoted: res.data.upvoted,
        };
      }));
    } catch (err) {
      // Revert on failure
      if (originalPost) {
        setPosts(prev => prev.map(p => p.id === postId ? originalPost : p));
      }
      toast.error(t('materialHub.upvote_failed'));
    }
  };

  // ── Bookmark ─────────────────────────────────────────────────────────────
  const handleToggleBookmark = async (postId) => {
    let originalPost = null;
    let nextBookmarked = false;

    // Optimistic Update
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      originalPost = { ...p };
      nextBookmarked = !p.has_bookmarked;
      return { ...p, has_bookmarked: nextBookmarked };
    }));

    const toastId = `bookmark-${postId}`;
    toast.success(nextBookmarked
      ? t('materialHub.bookmark_added')
      : t('materialHub.bookmark_removed'), {
        id: toastId
      });

    try {
      await studentApi.post(`/material-hub/${postId}/bookmark`);
    } catch (err) {
      // Revert on failure
      if (originalPost) {
        setPosts(prev => prev.map(p => p.id === postId ? originalPost : p));
      }
      toast.error(t('materialHub.bookmark_failed'), {
        id: toastId
      });
    }
  };

  // ── Comments ──────────────────────────────────────────────────────────────
  const [openCommentsId, setOpenCommentsId] = useState(null);
  const [commentsMap, setCommentsMap] = useState({});
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const handleToggleComments = async (postId) => {
    if (openCommentsId === postId) { setOpenCommentsId(null); return; }
    setOpenCommentsId(postId);
    if (commentsMap[postId]) return;
    setCommentsLoading(true);
    try {
      const res = await studentApi.get(`/material-hub/${postId}/comments`);
      setCommentsMap(prev => ({ ...prev, [postId]: res.data }));
    } catch (err) {
      toast.error(t('materialHub.comments_load_failed'));
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleAddComment = async (postId) => {
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await studentApi.post(`/material-hub/${postId}/comments`, { content: commentText });
      setCommentsMap(prev => ({ ...prev, [postId]: [...(prev[postId] || []), res.data] }));
      setPosts(prev => prev.map(p =>
        p.id !== postId ? p : { ...p, comments_count: (p.comments_count || 0) + 1 }
      ));
      setCommentText('');
    } catch (err) {
      toast.error(t('materialHub.comment_add_failed'));
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await studentApi.delete(`/material-hub/comments/${commentId}`);
      setCommentsMap(prev => ({
        ...prev,
        [postId]: (prev[postId] || []).filter(c => c.id !== commentId)
      }));
      setPosts(prev => prev.map(p =>
        p.id !== postId ? p : { ...p, comments_count: Math.max(0, (p.comments_count || 1) - 1) }
      ));
    } catch (err) {
      toast.error(t('materialHub.comment_delete_failed'));
    }
  };

  // Helper to get beautiful icon based on extension
  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) {
      return Image;
    }
    if (['pdf'].includes(ext)) {
      return FileText;
    }
    return BookOpen;
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Filter & Search posts
  const filteredPosts = posts.filter(post => {
    let matchesType = true;
    if (filterType === 'bookmarks') {
      matchesType = post.has_bookmarked === true;
    } else if (filterType !== 'all') {
      matchesType = post.type === filterType;
    }
    const matchesSearch =
      (post.caption && post.caption.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.file_name && post.file_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.student_name && post.student_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });



  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 text-start">
      
      {/* 🚀 Top Action Card: Upload Form */}
      <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl md:rounded-[2.5rem] overflow-hidden">
        {/* Header - always visible */}
        <button
          type="button"
          onClick={() => setShowUploadForm(v => !v)}
          className="w-full flex items-center justify-between p-5 md:p-8 gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 md:w-12 md:h-12 bg-[#2cfc7d]/10 text-[#2cfc7d] rounded-xl md:rounded-2xl flex items-center justify-center border border-[#2cfc7d]/10 shrink-0">
              <Upload className="w-4 h-4 md:w-6 md:h-6" />
            </div>
            <h3 className="text-sm md:text-xl font-black tracking-tight text-gray-900 dark:text-white uppercase">
              {t('materialHub.share_title')}
            </h3>
          </div>
          <div className={`w-8 h-8 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 transition-transform duration-300 ${showUploadForm ? 'rotate-180' : ''}`}>
            <ArrowDown className="w-4 h-4" />
          </div>
        </button>

        {/* Collapsible form body */}
        {showUploadForm && (
        <div className="px-5 pb-5 md:px-8 md:pb-8 space-y-5">
        <form onSubmit={handleCreatePost} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Category Toggle */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ms-4">
                {t('materialHub.category_label')}
              </label>
              <div className="flex p-1.5 bg-white dark:bg-black/40 rounded-[2rem] border border-gray-100 dark:border-white/5">
                <button type="button" onClick={() => setType('lecture')}
                  className={`flex-1 py-3.5 rounded-[1.6rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                    type === 'lecture' ? 'bg-[#10b981] dark:bg-[#2cfc7d] text-white dark:text-black shadow-md' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}>
                  {t('materialHub.category_lectures')}
                </button>
                <button type="button" onClick={() => setType('exam')}
                  className={`flex-1 py-3.5 rounded-[1.6rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                    type === 'exam' ? 'bg-[#10b981] dark:bg-[#2cfc7d] text-white dark:text-black shadow-md' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}>
                  {t('materialHub.category_exams')}
                </button>
              </div>
            </div>

            {/* Academic Year Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ms-4">
                {t('materialHub.target_year')}
              </label>
              <div className="flex p-1.5 bg-white dark:bg-black/40 rounded-[2rem] border border-gray-100 dark:border-white/5 gap-1">
                {(availableHubBatches.length > 0 ? availableHubBatches : [student?.batch || 2025]).map(b => (
                  <button key={b} type="button" onClick={() => setUploadBatch(b)}
                    className={`flex-1 py-3.5 rounded-[1.6rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                      uploadBatch === b ? 'bg-[#10b981] dark:bg-[#2cfc7d] text-white dark:text-black shadow-md' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}>
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Description/Caption */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ms-4">
                {t('materialHub.caption')}
              </label>
              <input
                type="text"
                placeholder={t('materialHub.caption_placeholder')}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full bg-white dark:bg-black/40 border border-gray-100 dark:border-white/5 rounded-[2rem] px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#2cfc7d] text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* File input and submit */}
          <div className="flex flex-col gap-3">
            <label className="relative flex items-center gap-4 cursor-pointer bg-white dark:bg-black/20 border border-gray-100 dark:border-white/5 border-dashed rounded-2xl md:rounded-[2.5rem] p-4 md:p-6 hover:border-[#2cfc7d]/40 hover:bg-[#2cfc7d]/5 transition-all group/label shadow-inner overflow-hidden">
              <Paperclip className="w-6 h-6 text-gray-300 group-hover/label:text-[#2cfc7d] shrink-0 transition-all duration-300" />
              <span className="text-gray-500 dark:text-gray-400 font-black text-[10px] uppercase tracking-widest flex-1 truncate">
                {file ? (
                  <span className="text-[#10b981] dark:text-[#2cfc7d]">{file.name} ({formatBytes(file.size)})</span>
                ) : (
                  t('materialHub.attach_file_hint')
                )}
              </span>
              <input id="materialFileInput" type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            </label>

            <button type="submit" disabled={uploading || !file}
              className="w-full bg-[#10b981] dark:bg-[#2cfc7d] text-white dark:text-black font-black py-4 md:py-5 px-8 rounded-2xl md:rounded-[2rem] shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
              {uploading
                ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                : <><Upload className="w-4 h-4 md:w-5 md:h-5" /><span className="text-[10px] uppercase tracking-widest">{t('materialHub.submit_btn')}</span></>}
            </button>
          </div>
        </form>
        </div>
        )}
      </div>

      {/* 🔍 Filter, Batch & Search Options */}
      <div className="flex flex-col gap-3">
        {/* Search bar - full width on mobile, beside filters on desktop */}
        <div className="relative">
          <Search className="absolute inset-inline-start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text"
            placeholder={t('materialHub.search_placeholder')}
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-2xl md:rounded-[2rem] ps-11 pe-5 py-3 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:border-[#2cfc7d]"
          />
        </div>

        {/* Filter type - scrollable on mobile */}
        <div className="flex overflow-x-auto no-scrollbar bg-white dark:bg-white/5 p-1 rounded-2xl md:rounded-[1.8rem] border border-gray-100 dark:border-white/5 gap-1">
          {[
            { id: 'all', label: t('materialHub.filter_all') },
            { id: 'lecture', label: t('materialHub.filter_lectures') },
            { id: 'exam', label: t('materialHub.filter_exams') },
            { id: 'bookmarks', label: t('materialHub.filter_saved') }
          ].map(btn => (
            <button key={btn.id} onClick={() => setFilterType(btn.id)}
              className={`flex-none px-5 py-2 md:px-6 md:py-2.5 rounded-xl md:rounded-[1.4rem] text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                filterType === btn.id ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}>
              {btn.label}
            </button>
          ))}
        </div>
      </div>

        {availableHubBatches.length > 0 && (
          <div className="flex items-center gap-1 bg-white dark:bg-white/5 p-1.5 rounded-2xl md:rounded-[1.8rem] border border-gray-100 dark:border-white/5 self-start">
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-3 shrink-0">
              {t('materialHub.academic_year')}
            </span>
            {availableHubBatches.map(b => {
              const isSel = selectedBatch === b;
              return (
                <button key={b}
                  onClick={() => {
                    setSelectedBatch(b);
                    fetchPosts(b);
                  }}
                  className={`px-4 py-1.5 md:px-5 md:py-2 rounded-xl md:rounded-[1.2rem] text-[9px] md:text-[10px] font-black tracking-widest transition-all ${
                    isSel ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}>
                  {b}
                </button>
              );
            })}
          </div>
        )}

      {/* 📄 Material feed */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-24">
          <div className="w-10 h-10 border-2 border-gray-200 dark:border-white/10 border-t-[#2cfc7d] rounded-full animate-spin"></div>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-300 dark:text-white/10 italic font-black uppercase tracking-widest text-center">
          <BookOpen className="w-14 h-14 mb-4 opacity-25" />
          {filterType === 'bookmarks' ? t('materialHub.no_saved_materials') : t('materialHub.no_materials')}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPosts.map(post => {
            const FileIcon = getFileIcon(post.file_name);
            const isOwner = post.student_id === student?.id;
            const isPending = post.status === 'pending';
            const isRejected = post.status === 'rejected';

            return (
              <div 
                key={post.id} 
                className={`p-6 sm:p-8 bg-white dark:bg-[#0d0d14] border rounded-[2.5rem] space-y-4 hover:shadow-xl transition-all relative overflow-hidden ${
                  isPending 
                    ? 'border-amber-500/30 bg-amber-500/[0.01]' 
                    : isRejected 
                    ? 'border-rose-500/20 bg-rose-500/[0.01]' 
                    : 'border-gray-100 dark:border-white/5'
                }`}
              >
                {/* Pending overlay glow */}
                {isPending && (
                  <div className="absolute inset-y-0 inset-inline-start-0 w-1 bg-amber-500" />
                )}
                {isRejected && (
                  <div className="absolute inset-y-0 inset-inline-start-0 w-1 bg-rose-500" />
                )}

                {/* Header: Student Info & Date */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center border border-gray-100 dark:border-white/5 overflow-hidden">
                      {post.student_avatar_url ? (
                        <img src={post.student_avatar_url} alt={post.student_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[#2cfc7d] font-black text-sm uppercase">
                          {post.student_name ? post.student_name.substring(0, 2) : 'ST'}
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-black text-gray-900 dark:text-white tracking-tight text-base flex items-center gap-2">
                        {post.student_name || t('materialHub.student_label')}
                        
                        {/* Owner Badge */}
                        {isOwner && (
                          <span className="text-[8px] font-black uppercase bg-[#2cfc7d]/10 text-[#2cfc7d] border border-[#2cfc7d]/10 px-2 py-0.5 rounded-full">
                            {t('materialHub.you_label')}
                          </span>
                        )}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(post.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Badges / Actions */}
                  <div className="flex flex-wrap items-center gap-2 justify-end">
                    {/* Academic Year Badge */}
                    {post.batch && (
                      <span className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border text-indigo-400 border-indigo-400/20 bg-indigo-400/5">
                        {t('materialHub.year_label')} {post.batch}
                      </span>
                    )}

                    {/* Category Type Badge */}
                    <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                      post.type === 'lecture'
                        ? 'text-blue-500 border-blue-500/20 bg-blue-500/5'
                        : 'text-purple-500 border-purple-500/20 bg-purple-500/5'
                    }`}>
                      {post.type === 'lecture' ? t('materialHub.badge_lecture') : t('materialHub.badge_exam')}
                    </span>

                    {/* Status Badge */}
                    {isPending && (
                      <span className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border text-amber-500 border-amber-500/20 bg-amber-500/5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 animate-pulse" />
                        {t('materialHub.status_pending')}
                      </span>
                    )}
                    {isRejected && (
                      <span className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border text-rose-500 border-rose-500/20 bg-rose-500/5 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        {t('materialHub.status_rejected')}
                      </span>
                    )}

                    {/* Edit button for owner or reviewer */}
                    {(isOwner || isReviewer) && editingPostId !== post.id && (
                      <button
                        onClick={() => handleEditPost(post)}
                        className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center justify-center text-gray-400 hover:text-indigo-400 hover:border-indigo-400/30 transition-all"
                        title={t('materialHub.edit_title')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Caption */}
                {editingPostId === post.id ? (
                  <div className="flex flex-col sm:flex-row gap-3 ps-16 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 shrink-0">{t('materialHub.edit_year_label')}</span>
                      <div className="flex gap-1.5 bg-gray-50 dark:bg-white/5 p-1 rounded-2xl">
                        {availableHubBatches.map(b => (
                          <button key={b} type="button" onClick={() => setEditBatch(b)}
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                              editBatch === b ? 'bg-indigo-500 text-white shadow-sm' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}>{b}</button>
                        ))}
                      </div>
                    </div>
                    <input
                      type="text"
                      value={editCaption}
                      onChange={e => setEditCaption(e.target.value)}
                      placeholder={t('materialHub.caption_edit_placeholder')}
                      className="flex-1 bg-white dark:bg-black/30 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-2 text-sm font-bold focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
                    />
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => handleSaveEdit(post.id)} disabled={savingEdit}
                        className="flex items-center gap-1.5 px-5 py-2 rounded-2xl bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                        {savingEdit ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        {t('materialHub.save_btn')}
                      </button>
                      <button onClick={() => setEditingPostId(null)}
                        className="px-4 py-2 rounded-2xl bg-gray-100 dark:bg-white/10 text-gray-500 text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  post.caption && (
                    <p className="text-gray-600 dark:text-white/70 font-semibold text-sm leading-relaxed ps-16">
                      {post.caption}
                    </p>
                  )
                )}

                {/* Attachment File Card */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-3xl ms-0 sm:ms-16">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-white dark:bg-black rounded-2xl flex items-center justify-center border border-gray-100 dark:border-white/10 text-[#2cfc7d] shadow-sm shrink-0">
                      <FileIcon className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-900 dark:text-white font-black text-sm truncate leading-none mb-1.5">{post.file_name}</p>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none">{formatBytes(post.file_size)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <a
                      href={post.file_url}
                      download={post.file_name}
                      target="_blank"
                      rel="noreferrer"
                      className="w-10 h-10 rounded-full bg-white dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-[#2cfc7d] hover:bg-[#2cfc7d]/10 border border-gray-100 dark:border-white/5 transition-all shadow-sm shrink-0"
                      title={t('materialHub.download_title')}
                    >
                      <Download className="w-4 h-4" />
                    </a>

                    {/* Delete post (owner or reviewer) */}
                    {(isOwner || isReviewer) && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="w-10 h-10 rounded-full bg-white dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 border border-gray-100 dark:border-white/5 transition-all shadow-sm shrink-0"
                        title={t('materialHub.delete_title')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* ── Action Bar: Upvote · Bookmark · Comments ── */}
                <div className="flex items-center gap-5 pt-2 ps-0 sm:ps-16">
                  {/* Upvote */}
                  <button
                    onClick={() => handleToggleUpvote(post.id)}
                    className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${
                      post.has_upvoted
                        ? 'text-[#2cfc7d]'
                        : 'text-gray-400 hover:text-[#2cfc7d]'
                    }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${post.has_upvoted ? 'fill-[#2cfc7d] stroke-[#2cfc7d]' : ''}`} />
                    <span>{post.upvotes_count > 0 ? post.upvotes_count : t('materialHub.helpful_btn')}</span>
                  </button>

                  {/* Comments toggle */}
                  <button
                    onClick={() => handleToggleComments(post.id)}
                    className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${
                      openCommentsId === post.id
                        ? 'text-blue-400'
                        : 'text-gray-400 hover:text-blue-400'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.comments_count > 0 ? post.comments_count : t('materialHub.comment_btn')}</span>
                  </button>

                  {/* Bookmark */}
                  <button
                    onClick={() => handleToggleBookmark(post.id)}
                    className={`ms-auto flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${
                      post.has_bookmarked
                        ? 'text-amber-400'
                        : 'text-gray-400 hover:text-amber-400'
                    }`}
                    title={post.has_bookmarked ? t('materialHub.remove_bookmark') : t('materialHub.save_bookmark')}
                  >
                    <Bookmark className={`w-4 h-4 ${post.has_bookmarked ? 'fill-amber-400 stroke-amber-400' : ''}`} />
                  </button>
                </div>

                {/* ── Comments Section ── */}
                {openCommentsId === post.id && (
                  <div className="ms-0 sm:ms-16 space-y-3 animate-in slide-in-from-top-2 duration-300">
                    <div className="h-px bg-gray-100 dark:bg-white/5" />

                    {/* Comments list */}
                    {commentsLoading && !commentsMap[post.id] ? (
                      <div className="flex justify-center py-4">
                        <div className="w-5 h-5 border-2 border-gray-200 dark:border-white/10 border-t-[#2cfc7d] rounded-full animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {(commentsMap[post.id] || []).length === 0 ? (
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest text-center py-3">
                            {t('materialHub.no_comments')}
                          </p>
                        ) : (
                          (commentsMap[post.id] || []).map(comment => (
                            <div key={comment.id} className="flex items-start gap-3 group/comment">
                              <div className="w-7 h-7 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center border border-gray-100 dark:border-white/5 overflow-hidden shrink-0">
                                {comment.student_avatar_url ? (
                                  <img src={comment.student_avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-[9px] font-black text-[#2cfc7d] uppercase">
                                    {comment.student_name?.substring(0, 2) || 'ST'}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 bg-gray-50 dark:bg-white/[0.03] rounded-2xl px-4 py-2.5 border border-gray-100 dark:border-white/5">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{comment.student_name || 'Student'}</span>
                                  {(comment.student_id === student?.id || isReviewer) && (
                                    <button
                                      onClick={() => handleDeleteComment(post.id, comment.id)}
                                      className="opacity-0 group-hover/comment:opacity-100 text-gray-300 hover:text-rose-400 transition-all"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                                <p className="text-sm text-gray-700 dark:text-white/80 font-medium leading-snug">{comment.content}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Comment input */}
                    <div className="flex items-center gap-3 pt-1">
                      <div className="w-7 h-7 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center border border-gray-100 dark:border-white/5 shrink-0">
                        <span className="text-[9px] font-black text-[#2cfc7d] uppercase">
                          {student?.name?.substring(0, 2) || 'ST'}
                        </span>
                      </div>
                      <div className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-2">
                        <input
                          type="text"
                          placeholder={t('materialHub.comment_placeholder')}
                          value={commentText}
                          onChange={e => setCommentText(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleAddComment(post.id)}
                          className="flex-1 bg-transparent text-sm font-medium text-gray-700 dark:text-white/80 outline-none placeholder:text-gray-300 dark:placeholder:text-white/20"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          disabled={submittingComment || !commentText.trim()}
                          className="text-[#2cfc7d] hover:scale-110 active:scale-90 transition-all disabled:opacity-30 shrink-0"
                        >
                          {submittingComment
                            ? <div className="w-4 h-4 border-2 border-[#2cfc7d] border-t-transparent rounded-full animate-spin" />
                            : <Send className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rejection Details Info Box */}
                {isRejected && post.reject_reason && (
                  <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl ms-0 sm:ms-16 text-xs text-rose-500 font-bold flex items-start gap-3">
                    <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                      <span className="block font-black uppercase tracking-wider text-[10px] opacity-70 mb-1">{t('materialHub.rejection_reason')}</span>
                      <span>{post.reject_reason}</span>
                    </div>
                  </div>
                )}

                {/* Moderation Controls (only for pending posts and reviewers) */}
                {isReviewer && isPending && (
                  <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5 ms-0 sm:ms-16 animate-in slide-in-from-top-4 duration-300">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#2cfc7d] flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {t('materialHub.moderation_required')}
                    </span>

                    <div className="flex items-center gap-3 justify-end">
                      {rejectingId === post.id ? (
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <input
                            type="text"
                            placeholder={t('materialHub.rejection_placeholder')}
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="bg-white dark:bg-black/40 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-2 text-xs font-bold focus:outline-none focus:border-rose-500 w-full sm:w-60"
                          />
                          <button
                            onClick={() => handleReviewPost(post.id, 'rejected', rejectReason)}
                            disabled={submittingReview}
                            className="p-2.5 rounded-full bg-rose-500 text-white hover:scale-105 active:scale-95 transition-all shrink-0"
                            title={t('materialHub.confirm_reject_title')}
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </button>
                          <button
                            onClick={() => {
                              setRejectingId(null);
                              setRejectReason('');
                            }}
                            className="p-2.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 hover:scale-105 active:scale-95 transition-all shrink-0"
                            title={t('materialHub.cancel_title')}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleReviewPost(post.id, 'approved')}
                            disabled={submittingReview}
                            className="flex items-center gap-2 bg-[#10b981] dark:bg-[#2cfc7d] hover:bg-emerald-600 text-white dark:text-black px-6 py-2.5 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            {t('materialHub.approve_btn')}
                          </button>

                          <button
                            onClick={() => setRejectingId(post.id)}
                            className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-6 py-2.5 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md"
                          >
                            <XCircle className="w-4 h-4" />
                            {t('materialHub.reject_btn')}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MaterialHubTab;
