import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useStudentAuth } from '../context/StudentAuthContext';
import studentApi from '../services/studentApi';
import toast from 'react-hot-toast';
import { 
  BookOpen, FileText, Upload, Trash2, Check, X,
  Search, Paperclip, MessageSquare, AlertCircle, FileCode,
  Download, Clock, CheckCircle2, ShieldAlert, ArrowDown, ExternalLink, Image
} from 'lucide-react';

const MaterialHubTab = ({ courseId }) => {
  const { t, i18n } = useTranslation();
  const { student } = useStudentAuth();
  const isAr = i18n.language === 'ar';

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, lecture, exam

  // Upload Form State
  const [caption, setCaption] = useState('');
  const [type, setType] = useState('lecture'); // lecture, exam
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Rejection State
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const isReviewer = student?.role === 'admin' || (student?.permissions || []).includes('manage_resources');

  const fetchPosts = useCallback(async () => {
    try {
      const res = await studentApi.get(`/material-hub/${courseId}`);
      setPosts(res.data);
    } catch (err) {
      console.error('Error fetching material hub posts:', err);
      toast.error(isAr ? 'فشل تحميل المواد الدراسية' : 'Failed to load materials');
    } finally {
      setLoading(false);
    }
  }, [courseId, isAr]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

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
    formData.append('file', file);

    try {
      await studentApi.post('/material-hub', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
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
    if (!window.confirm(isAr ? 'هل أنت متأكد من رغبتك في حذف هذا المنشور؟' : 'Are you sure you want to delete this post?')) {
      return;
    }
    try {
      await studentApi.delete(`/material-hub/${id}`);
      toast.success(isAr ? 'تم حذف المنشور بنجاح' : 'Post deleted successfully');
      fetchPosts();
    } catch (err) {
      console.error('Error deleting post:', err);
      toast.error(isAr ? 'فشل حذف المنشور' : 'Failed to delete post');
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
    const matchesType = filterType === 'all' || post.type === filterType;
    const matchesSearch = 
      (post.caption && post.caption.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.file_name && post.file_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.student_name && post.student_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 text-start">
      
      {/* 🚀 Top Action Card: Upload Form */}
      <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8 sm:p-10 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#2cfc7d]/10 text-[#2cfc7d] rounded-2xl flex items-center justify-center border border-[#2cfc7d]/10">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-white uppercase leading-none">
              {isAr ? 'مشاركة مادة دراسية' : 'Share Course Material'}
            </h3>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1 block leading-none">
              {isAr ? 'ارفع محاضرة أو امتحان وساعد زمايلك' : 'Upload lectures or exams to support your peers'}
            </p>
          </div>
        </div>

        <form onSubmit={handleCreatePost} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Toggle */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ms-4">
                {isAr ? 'القسم / التصنيف' : 'Category / Classification'}
              </label>
              <div className="flex p-1.5 bg-white dark:bg-black/40 rounded-[2rem] border border-gray-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setType('lecture')}
                  className={`flex-1 py-3.5 rounded-[1.6rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                    type === 'lecture'
                      ? 'bg-[#10b981] dark:bg-[#2cfc7d] text-white dark:text-black shadow-md'
                      : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {isAr ? 'محاضرات ومراجع' : 'Lectures & Resources'}
                </button>
                <button
                  type="button"
                  onClick={() => setType('exam')}
                  className={`flex-1 py-3.5 rounded-[1.6rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                    type === 'exam'
                      ? 'bg-[#10b981] dark:bg-[#2cfc7d] text-white dark:text-black shadow-md'
                      : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {isAr ? 'امتحانات وأسئلة' : 'Exams & Quizzes'}
                </button>
              </div>
            </div>

            {/* Description/Caption */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ms-4">
                {isAr ? 'وصف أو تعليق' : 'Caption / Description'}
              </label>
              <input
                type="text"
                placeholder={isAr ? 'اكتب تفاصيل (مثلاً: حل شيت 2، ملخص الباب الأول...)' : 'e.g. Solution of sheet 2, Summary...'}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full bg-white dark:bg-black/40 border border-gray-100 dark:border-white/5 rounded-[2rem] px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#2cfc7d] text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* File input and details */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <label className="flex-1 relative flex flex-col items-center justify-center gap-3 cursor-pointer bg-white dark:bg-black/20 border border-gray-100 dark:border-white/5 border-dashed rounded-[2.5rem] p-6 sm:p-8 hover:border-[#2cfc7d]/40 hover:bg-[#2cfc7d]/5 transition-all group/label shadow-inner overflow-hidden">
              <Paperclip className="w-8 h-8 text-gray-300 group-hover/label:text-[#2cfc7d] group-hover/label:scale-110 transition-all duration-300" />
              <span className="text-gray-500 dark:text-gray-400 font-black text-center text-[10px] uppercase tracking-widest">
                {file ? (
                  <span className="text-[#10b981] dark:text-[#2cfc7d] break-all px-4">{file.name} ({formatBytes(file.size)})</span>
                ) : (
                  isAr ? 'اضغط لاختيار ملف (PDF, Slides, Zip, Images)' : 'Click to attach file (PDF, Slides, Zip, Images)'
                )}
              </span>
              <input 
                id="materialFileInput" 
                type="file" 
                onChange={handleFileChange} 
                className="absolute inset-0 opacity-0 cursor-pointer" 
              />
            </label>

            <button
              type="submit"
              disabled={uploading || !file}
              className="bg-[#10b981] dark:bg-[#2cfc7d] text-white dark:text-black font-black py-5 sm:py-8 px-10 rounded-[2rem] shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {uploading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span className="text-[10px] uppercase tracking-widest">{isAr ? 'إرسال للمشاركة' : 'Submit Material'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 🔍 Filter & Search Options */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Filter type */}
        <div className="flex bg-white dark:bg-white/5 p-1 rounded-[1.8rem] border border-gray-100 dark:border-white/5 max-w-md">
          {[
            { id: 'all', label: isAr ? 'الكل' : 'All' },
            { id: 'lecture', label: isAr ? 'المحاضرات' : 'Lectures' },
            { id: 'exam', label: isAr ? 'الامتحانات' : 'Exams' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilterType(btn.id)}
              className={`px-6 py-2.5 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                filterType === btn.id
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm'
                  : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={isAr ? 'البحث في المواد الدراسية...' : 'Search shared materials...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[2rem] ps-12 pe-6 py-3.5 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:border-[#2cfc7d]"
          />
        </div>
      </div>

      {/* 📄 Material feed */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-24">
          <div className="w-10 h-10 border-2 border-gray-200 dark:border-white/10 border-t-[#2cfc7d] rounded-full animate-spin"></div>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-300 dark:text-white/10 italic font-black uppercase tracking-widest text-center">
          <BookOpen className="w-14 h-14 mb-4 opacity-25" />
          {isAr ? 'مفيش مواد دراسية مرفوعة هنا بعد' : 'No materials uploaded here yet'}
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
                        {post.student_name || (isAr ? 'طالب' : 'Student')}
                        
                        {/* Owner Badge */}
                        {isOwner && (
                          <span className="text-[8px] font-black uppercase bg-[#2cfc7d]/10 text-[#2cfc7d] border border-[#2cfc7d]/10 px-2 py-0.5 rounded-full">
                            {isAr ? 'أنت' : 'You'}
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
                  <div className="flex items-center gap-3">
                    {/* Category Type Badge */}
                    <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                      post.type === 'lecture'
                        ? 'text-blue-500 border-blue-500/20 bg-blue-500/5'
                        : 'text-purple-500 border-purple-500/20 bg-purple-500/5'
                    }`}>
                      {post.type === 'lecture' ? (isAr ? 'محاضرة / مرجع' : 'Lecture / Ref') : (isAr ? 'امتحان / أسئلة' : 'Exam / Quiz')}
                    </span>

                    {/* Status Badge */}
                    {isPending && (
                      <span className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border text-amber-500 border-amber-500/20 bg-amber-500/5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 animate-pulse" />
                        {isAr ? 'قيد المراجعة' : 'Pending Review'}
                      </span>
                    )}

                    {isRejected && (
                      <span className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border text-rose-500 border-rose-500/20 bg-rose-500/5 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        {isAr ? 'مرفوض' : 'Rejected'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Caption / Comments */}
                {post.caption && (
                  <p className="text-gray-600 dark:text-white/70 font-semibold text-sm leading-relaxed ps-16">
                    {post.caption}
                  </p>
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
                      title={isAr ? 'تحميل الملف' : 'Download File'}
                    >
                      <Download className="w-4 h-4" />
                    </a>

                    {/* Delete post (owner or reviewer) */}
                    {(isOwner || isReviewer) && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="w-10 h-10 rounded-full bg-white dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 border border-gray-100 dark:border-white/5 transition-all shadow-sm shrink-0"
                        title={isAr ? 'حذف المنشور' : 'Delete Post'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Rejection Details Info Box */}
                {isRejected && post.reject_reason && (
                  <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl ms-0 sm:ms-16 text-xs text-rose-500 font-bold flex items-start gap-3">
                    <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                      <span className="block font-black uppercase tracking-wider text-[10px] opacity-70 mb-1">{isAr ? 'سبب الرفض:' : 'Rejection Reason:'}</span>
                      <span>{post.reject_reason}</span>
                    </div>
                  </div>
                )}

                {/* Moderation Controls (only for pending posts and reviewers) */}
                {isReviewer && isPending && (
                  <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5 ms-0 sm:ms-16 animate-in slide-in-from-top-4 duration-300">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#2cfc7d] flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {isAr ? 'مطلوب اتخاذ قرار للموافقة على المنشور' : 'Action Required to Moderate Post'}
                    </span>

                    <div className="flex items-center gap-3 justify-end">
                      {rejectingId === post.id ? (
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <input
                            type="text"
                            placeholder={isAr ? 'اكتب سبب الرفض...' : 'Enter rejection reason...'}
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="bg-white dark:bg-black/40 border border-gray-100 dark:border-white/5 rounded-2xl px-4 py-2 text-xs font-bold focus:outline-none focus:border-rose-500 w-full sm:w-60"
                          />
                          <button
                            onClick={() => handleReviewPost(post.id, 'rejected', rejectReason)}
                            disabled={submittingReview}
                            className="p-2.5 rounded-full bg-rose-500 text-white hover:scale-105 active:scale-95 transition-all shrink-0"
                            title={isAr ? 'تأكيد الرفض' : 'Confirm Reject'}
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </button>
                          <button
                            onClick={() => {
                              setRejectingId(null);
                              setRejectReason('');
                            }}
                            className="p-2.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 hover:scale-105 active:scale-95 transition-all shrink-0"
                            title={isAr ? 'إلغاء' : 'Cancel'}
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
                            {isAr ? 'موافقة وقبول' : 'Approve & Publish'}
                          </button>

                          <button
                            onClick={() => setRejectingId(post.id)}
                            className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-6 py-2.5 rounded-[1.4rem] text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md"
                          >
                            <XCircle className="w-4 h-4" />
                            {isAr ? 'رفض' : 'Reject'}
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
