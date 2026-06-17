import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useStudentAuth } from '../context/StudentAuthContext';
import studentApi from '../services/studentApi';
import toast from 'react-hot-toast';
import {
  BookOpen, FileText, Upload, Trash2, Check, X, XCircle,
  Paperclip, MessageSquare, ShieldAlert,
  Download, Clock, CheckCircle2, Image,
  ThumbsUp, Bookmark, Send, Pencil
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  SectionCard,
  SegmentedTabs,
  SearchInput,
  StatusBadge,
  EmptyState,
  LoadingState,
  Spinner,
} from '@/components/common';

const MaterialHubTab = ({ courseId }) => {
  const { t, i18n } = useTranslation();
  const { student } = useStudentAuth();
  const isAr = i18n.language === 'ar';

  const [posts, setPosts] = useState([]);
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
      toast.error(isAr ? 'فشل تحميل المواد الدراسية' : 'Failed to load materials');
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
        toast.error(isAr ? 'حجم الملف كبير جداً. الحد الأقصى 50 ميجابايت' : 'File is too large. Max is 50MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error(isAr ? 'برجاء اختيار ملف للرفع' : 'Please select a file to upload');
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
          ? (isAr ? 'تم نشر المادة الدراسية بنجاح' : 'Material posted successfully')
          : (isAr ? 'تم إرسال الملف للمراجعة وسيظهر بعد موافقة الإدارة' : 'Sent for review. It will appear after approval.')
      );
      setCaption('');
      setFile(null);
      const fileInput = document.getElementById('materialFileInput');
      if (fileInput) fileInput.value = '';
      fetchPosts();
    } catch (err) {
      console.error('Error posting material:', err);
      toast.error(err.response?.data?.message || (isAr ? 'فشل في رفع الملف' : 'Failed to upload file'));
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
      toast.success(isAr ? 'تم الحفظ بنجاح' : 'Saved successfully');
      setEditingPostId(null);
      fetchPosts();
    } catch (err) {
      toast.error(isAr ? 'فشل الحفظ' : 'Failed to save');
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
          ? (isAr ? 'تمت الموافقة على الملف ونشره' : 'File approved and published')
          : (isAr ? 'تم رفض الملف وإشعار الطالب' : 'File rejected')
      );
      setRejectingId(null);
      setRejectReason('');
      fetchPosts();
    } catch (err) {
      console.error('Error reviewing post:', err);
      toast.error(isAr ? 'حدث خطأ أثناء المراجعة' : 'Error during review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm(isAr ? 'هل أنت متأكد من رغبتك في حذف هذا المنشور؟' : 'Are you sure you want to delete this post?')) return;
    try {
      await studentApi.delete(`/material-hub/${id}`);
      toast.success(isAr ? 'تم حذف المنشور بنجاح' : 'Post deleted successfully');
      fetchPosts();
    } catch (err) {
      console.error('Error deleting post:', err);
      toast.error(isAr ? 'فشل حذف المنشور' : 'Failed to delete post');
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
      toast.error(isAr ? 'تعذّر التصويت' : 'Could not upvote');
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
      ? (isAr ? '✦ تمت الإضافة للمفضلة' : '✦ Added to saved')
      : (isAr ? 'تمت الإزالة من المفضلة' : 'Removed from saved'), {
        id: toastId
      });

    try {
      await studentApi.post(`/material-hub/${postId}/bookmark`);
    } catch (err) {
      // Revert on failure
      if (originalPost) {
        setPosts(prev => prev.map(p => p.id === postId ? originalPost : p));
      }
      toast.error(isAr ? 'تعذّر حفظ المنشور' : 'Could not bookmark', {
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
      toast.error(isAr ? 'فشل تحميل التعليقات' : 'Failed to load comments');
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
      toast.error(isAr ? 'فشل إضافة التعليق' : 'Failed to add comment');
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
      toast.error(isAr ? 'فشل حذف التعليق' : 'Failed to delete comment');
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

  // Batch options for the upload / edit selectors. Falls back to the student's
  // own batch when the hub has no posts yet so the selector is never empty.
  const batchOptions = availableHubBatches.length > 0
    ? availableHubBatches
    : [student?.batch || 2025];

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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 text-start">

      {/* Upload Form */}
      <SectionCard
        title={isAr ? 'مشاركة مادة دراسية' : 'Share Course Material'}
        description={isAr ? 'ارفع محاضرة أو امتحان لزملائك في الدفعة' : 'Upload a lecture or exam for your batch peers'}
      >
        <form onSubmit={handleCreatePost} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {isAr ? 'القسم / التصنيف' : 'Category'}
              </label>
              <SegmentedTabs
                value={type}
                onChange={setType}
                className="flex w-full"
                options={[
                  { value: 'lecture', label: isAr ? 'محاضرات' : 'Lectures' },
                  { value: 'exam', label: isAr ? 'امتحانات' : 'Exams' },
                ]}
              />
            </div>

            {/* Academic Year Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {isAr ? 'العام الأكاديمي المستهدف' : 'Target Academic Year'}
              </label>
              <SegmentedTabs
                value={uploadBatch}
                onChange={setUploadBatch}
                className="flex w-full flex-wrap"
                options={batchOptions.map(b => ({ value: b, label: String(b) }))}
              />
            </div>

            {/* Description/Caption */}
            <div className="space-y-1.5">
              <label htmlFor="materialCaption" className="text-xs font-medium text-muted-foreground">
                {isAr ? 'وصف أو تعليق' : 'Caption / Description'}
              </label>
              <Input
                id="materialCaption"
                type="text"
                placeholder={isAr ? 'اكتب تفاصيل...' : 'e.g. Summary, Sheet 2...'}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>
          </div>

          {/* File input and submit */}
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <label className="flex-1 flex flex-col items-center justify-center gap-2 cursor-pointer bg-muted/30 border border-dashed border-border rounded-lg p-6 hover:border-primary/40 hover:bg-muted/50 transition-colors">
              <Paperclip className="size-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground text-center">
                {file ? (
                  <span className="text-primary break-all px-2 font-medium">{file.name} ({formatBytes(file.size)})</span>
                ) : (
                  isAr ? 'اضغط لاختيار ملف (PDF, Slides, Zip, Images)' : 'Click to attach file (PDF, Slides, Zip, Images)'
                )}
              </span>
              <input id="materialFileInput" type="file" onChange={handleFileChange} className="absolute opacity-0 w-0 h-0" />
            </label>

            <Button type="submit" disabled={uploading || !file} className="sm:w-auto sm:self-stretch sm:h-auto px-6">
              {uploading
                ? <Spinner className="text-current" />
                : <><Upload className="size-4" /><span>{isAr ? 'إرسال' : 'Submit'}</span></>}
            </Button>
          </div>
        </form>
      </SectionCard>

      {/* Filter, Batch & Search Options */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
          {/* Filter type */}
          <SegmentedTabs
            value={filterType}
            onChange={setFilterType}
            options={[
              { value: 'all', label: isAr ? 'الكل' : 'All' },
              { value: 'lecture', label: isAr ? 'المحاضرات' : 'Lectures' },
              { value: 'exam', label: isAr ? 'الامتحانات' : 'Exams' },
              { value: 'bookmarks', label: isAr ? 'المحفوظات' : 'Saved' },
            ]}
          />

          {/* Search bar */}
          <SearchInput
            placeholder={isAr ? 'البحث في المواد الدراسية...' : 'Search shared materials...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sm:w-72"
          />
        </div>

        {/* Academic Year filter row */}
        {availableHubBatches.length > 0 && (
          <div className="flex items-center gap-2 self-start">
            <span className="text-xs text-muted-foreground shrink-0">
              {isAr ? 'العام:' : 'Academic Year:'}
            </span>
            <SegmentedTabs
              value={selectedBatch}
              onChange={(b) => {
                setSelectedBatch(b);
                fetchPosts(b);
              }}
              size="sm"
              options={availableHubBatches.map(b => ({ value: b, label: String(b) }))}
            />
          </div>
        )}
      </div>

      {/* Material feed */}
      {loading ? (
        <LoadingState />
      ) : filteredPosts.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={
            filterType === 'bookmarks'
              ? (isAr ? 'مفيش مواد محفوظة لحد دلوقتي' : 'No saved materials yet')
              : (isAr ? 'مفيش مواد دراسية مرفوعة هنا بعد' : 'No materials uploaded here yet')
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredPosts.map(post => {
            const FileIcon = getFileIcon(post.file_name);
            const isOwner = post.student_id === student?.id;
            const isPending = post.status === 'pending';
            const isRejected = post.status === 'rejected';

            return (
              <div
                key={post.id}
                className={cn(
                  'relative overflow-hidden rounded-xl border bg-card text-card-foreground p-4 sm:p-5 space-y-4',
                  isPending
                    ? 'border-amber-500/30'
                    : isRejected
                      ? 'border-destructive/30'
                      : 'border-border'
                )}
              >
                {/* Status side-bar */}
                {isPending && (
                  <div className="absolute inset-y-0 start-0 w-0.5 bg-amber-500" />
                )}
                {isRejected && (
                  <div className="absolute inset-y-0 start-0 w-0.5 bg-destructive" />
                )}

                {/* Header: Student Info & Date */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="size-10 bg-muted rounded-lg flex items-center justify-center border border-border overflow-hidden shrink-0">
                      {post.student_avatar_url ? (
                        <img src={post.student_avatar_url} alt={post.student_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-primary font-semibold text-sm uppercase">
                          {post.student_name ? post.student_name.substring(0, 2) : 'ST'}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-medium text-foreground text-sm flex items-center gap-2">
                        {post.student_name || (isAr ? 'طالب' : 'Student')}

                        {/* Owner Badge */}
                        {isOwner && (
                          <StatusBadge variant="success">{isAr ? 'أنت' : 'You'}</StatusBadge>
                        )}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <Clock className="size-3.5" />
                        {new Date(post.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Badges / Actions */}
                  <div className="flex flex-wrap items-center gap-2 justify-end">
                    {/* Academic Year Badge */}
                    {post.batch && (
                      <StatusBadge variant="neutral">
                        {isAr ? 'عام' : 'Year'} {post.batch}
                      </StatusBadge>
                    )}

                    {/* Category Type Badge */}
                    <StatusBadge variant="neutral">
                      {post.type === 'lecture' ? (isAr ? 'محاضرة' : 'Lecture') : (isAr ? 'امتحان' : 'Exam')}
                    </StatusBadge>

                    {/* Status Badge */}
                    {isPending && (
                      <StatusBadge variant="warning" icon={Clock}>
                        {isAr ? 'قيد المراجعة' : 'Pending'}
                      </StatusBadge>
                    )}
                    {isRejected && (
                      <StatusBadge variant="danger" icon={ShieldAlert}>
                        {isAr ? 'مرفوض' : 'Rejected'}
                      </StatusBadge>
                    )}

                    {/* Edit button for owner or reviewer */}
                    {(isOwner || isReviewer) && editingPostId !== post.id && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleEditPost(post)}
                        className="text-muted-foreground"
                        title={isAr ? 'تعديل العام الدراسي والوصف' : 'Edit academic year & caption'}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Caption */}
                {editingPostId === post.id ? (
                  <div className="flex flex-col sm:flex-row gap-3 ps-13 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xs text-muted-foreground shrink-0">{isAr ? 'العام:' : 'Year:'}</span>
                      <SegmentedTabs
                        value={editBatch}
                        onChange={setEditBatch}
                        size="sm"
                        className="flex-wrap"
                        options={batchOptions.map(b => ({ value: b, label: String(b) }))}
                      />
                    </div>
                    <Input
                      type="text"
                      value={editCaption}
                      onChange={e => setEditCaption(e.target.value)}
                      placeholder={isAr ? 'وصف...' : 'Caption...'}
                      className="flex-1"
                    />
                    <div className="flex gap-2 shrink-0">
                      <Button onClick={() => handleSaveEdit(post.id)} disabled={savingEdit} size="sm">
                        {savingEdit ? <Spinner className="text-current" /> : <Check className="size-3.5" />}
                        {isAr ? 'حفظ' : 'Save'}
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => setEditingPostId(null)} title={isAr ? 'إلغاء' : 'Cancel'}>
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  post.caption && (
                    <p className="text-foreground text-sm leading-relaxed ps-13">
                      {post.caption}
                    </p>
                  )
                )}

                {/* Attachment File Card */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-muted/40 border border-border rounded-lg ms-0 sm:ms-13">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="size-10 bg-card rounded-lg flex items-center justify-center border border-border text-primary shrink-0">
                      <FileIcon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-foreground font-medium text-sm truncate mb-0.5">{post.file_name}</p>
                      <p className="text-xs text-muted-foreground">{formatBytes(post.file_size)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Button
                      asChild
                      variant="outline"
                      size="icon-sm"
                      title={isAr ? 'تحميل الملف' : 'Download File'}
                    >
                      <a
                        href={post.file_url}
                        download={post.file_name}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Download className="size-4" />
                      </a>
                    </Button>

                    {/* Delete post (owner or reviewer) */}
                    {(isOwner || isReviewer) && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDeletePost(post.id)}
                        className="text-muted-foreground hover:text-destructive"
                        title={isAr ? 'حذف المنشور' : 'Delete Post'}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* ── Action Bar: Upvote · Bookmark · Comments ── */}
                <div className="flex items-center gap-2 pt-1 ps-0 sm:ps-13">
                  {/* Upvote */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleUpvote(post.id)}
                    className={cn(
                      'gap-1.5',
                      post.has_upvoted ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                    )}
                  >
                    <ThumbsUp className={cn('size-4', post.has_upvoted && 'fill-current')} />
                    <span>{post.upvotes_count > 0 ? post.upvotes_count : (isAr ? 'مفيد' : 'Helpful')}</span>
                  </Button>

                  {/* Comments toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleComments(post.id)}
                    className={cn(
                      'gap-1.5',
                      openCommentsId === post.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <MessageSquare className="size-4" />
                    <span>{post.comments_count > 0 ? post.comments_count : (isAr ? 'تعليق' : 'Comment')}</span>
                  </Button>

                  {/* Bookmark */}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleToggleBookmark(post.id)}
                    className={cn(
                      'ms-auto',
                      post.has_bookmarked ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                    )}
                    title={post.has_bookmarked ? (isAr ? 'إزالة من المحفوظات' : 'Remove from saved') : (isAr ? 'حفظ في المفضلة' : 'Save')}
                  >
                    <Bookmark className={cn('size-4', post.has_bookmarked && 'fill-current')} />
                  </Button>
                </div>

                {/* ── Comments Section ── */}
                {openCommentsId === post.id && (
                  <div className="ms-0 sm:ms-13 space-y-3 animate-in slide-in-from-top-2 duration-300">
                    <div className="h-px bg-border" />

                    {/* Comments list */}
                    {commentsLoading && !commentsMap[post.id] ? (
                      <div className="flex justify-center py-4">
                        <Spinner className="size-5 text-primary" />
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {(commentsMap[post.id] || []).length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-3">
                            {isAr ? 'لا توجد تعليقات بعد — كن أول من يعلّق!' : 'No comments yet — be the first!'}
                          </p>
                        ) : (
                          (commentsMap[post.id] || []).map(comment => (
                            <div key={comment.id} className="flex items-start gap-3 group/comment">
                              <div className="size-7 bg-muted rounded-lg flex items-center justify-center border border-border overflow-hidden shrink-0">
                                {comment.student_avatar_url ? (
                                  <img src={comment.student_avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-[10px] font-medium text-primary uppercase">
                                    {comment.student_name?.substring(0, 2) || 'ST'}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 bg-muted/40 rounded-lg px-3 py-2 border border-border">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-muted-foreground">{comment.student_name || 'Student'}</span>
                                  {(comment.student_id === student?.id || isReviewer) && (
                                    <button
                                      onClick={() => handleDeleteComment(post.id, comment.id)}
                                      aria-label={isAr ? 'حذف التعليق' : 'Delete comment'}
                                      className="opacity-0 group-hover/comment:opacity-100 text-muted-foreground hover:text-destructive transition-colors"
                                    >
                                      <X className="size-3" />
                                    </button>
                                  )}
                                </div>
                                <p className="text-sm text-foreground leading-snug">{comment.content}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Comment input */}
                    <div className="flex items-center gap-3 pt-1">
                      <div className="size-7 bg-muted rounded-lg flex items-center justify-center border border-border shrink-0">
                        <span className="text-[10px] font-medium text-primary uppercase">
                          {student?.name?.substring(0, 2) || 'ST'}
                        </span>
                      </div>
                      <div className="flex-1 flex items-center gap-2 bg-muted/40 border border-border rounded-lg px-3 py-1.5">
                        <input
                          type="text"
                          aria-label={isAr ? 'اكتب تعليقك' : 'Write a comment'}
                          placeholder={isAr ? 'اكتب تعليقك...' : 'Write a comment...'}
                          value={commentText}
                          onChange={e => setCommentText(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleAddComment(post.id)}
                          className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          disabled={submittingComment || !commentText.trim()}
                          aria-label={isAr ? 'إرسال التعليق' : 'Send comment'}
                          className="text-primary transition-colors disabled:opacity-30 shrink-0"
                        >
                          {submittingComment
                            ? <Spinner className="size-4 text-primary" />
                            : <Send className="size-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rejection Details Info Box */}
                {isRejected && post.reject_reason && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg ms-0 sm:ms-13 text-sm text-destructive flex items-start gap-2.5">
                    <ShieldAlert className="size-4 mt-0.5 shrink-0" />
                    <div>
                      <span className="block font-medium text-xs opacity-80 mb-0.5">{isAr ? 'سبب الرفض:' : 'Rejection Reason:'}</span>
                      <span>{post.reject_reason}</span>
                    </div>
                  </div>
                )}

                {/* Moderation Controls (only for pending posts and reviewers) */}
                {isReviewer && isPending && (
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pt-3 border-t border-border ms-0 sm:ms-13 animate-in slide-in-from-top-2 duration-300">
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <Clock className="size-4" />
                      {isAr ? 'مطلوب اتخاذ قرار للموافقة على المنشور' : 'Action Required to Moderate Post'}
                    </span>

                    <div className="flex items-center gap-2 justify-end">
                      {rejectingId === post.id ? (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <Input
                            type="text"
                            placeholder={isAr ? 'اكتب سبب الرفض...' : 'Enter rejection reason...'}
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="w-full sm:w-60"
                          />
                          <Button
                            variant="destructive"
                            size="icon-sm"
                            onClick={() => handleReviewPost(post.id, 'rejected', rejectReason)}
                            disabled={submittingReview}
                            title={isAr ? 'تأكيد الرفض' : 'Confirm Reject'}
                          >
                            <Check className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              setRejectingId(null);
                              setRejectReason('');
                            }}
                            title={isAr ? 'إلغاء' : 'Cancel'}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Button
                            onClick={() => handleReviewPost(post.id, 'approved')}
                            disabled={submittingReview}
                            size="sm"
                          >
                            <CheckCircle2 className="size-4" />
                            {isAr ? 'موافقة وقبول' : 'Approve & Publish'}
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setRejectingId(post.id)}
                          >
                            <XCircle className="size-4" />
                            {isAr ? 'رفض' : 'Reject'}
                          </Button>
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
