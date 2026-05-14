import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { supabase } from '../../services/supabase'; 
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
  FolderOpen, Plus, Edit3, Trash2, Video, 
  FileText, Mic, Link as LinkIcon, PlayCircle, 
  Layers, Download, ExternalLink, Activity,
  ChevronRight, BookOpen, Clock, FileType, 
  ShieldCheck, ArrowRight, Zap, Sparkles, Box, Search, X, CheckCircle2
} from 'lucide-react';

const convertToEmbedUrl = (url) => {
  if (!url) return '';
  if (url.includes('/embed/')) return url;
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:[&?]|$)/);
  if (match) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return url;
};

const ResourceManager = () => {
  const { t } = useTranslation();
  const [allCourses, setAllCourses] = useState([]);
  const [selectedCourseName, setSelectedCourseName] = useState('');
  const [resources, setResources] = useState([]);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({ type: 'video', title: '', url: '' });
  const [loading, setLoading] = useState(false);
  const [recordingFile, setRecordingFile] = useState(null);

  const uniqueCourses = useMemo(() => {
    const map = new Map();
    allCourses.forEach(course => {
      if (!map.has(course.name)) {
        map.set(course.name, course.id);
      }
    });
    return Array.from(map.entries()).map(([name, id]) => ({ name, id }));
  }, [allCourses]);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseName) {
      fetchResources();
    }
  }, [selectedCourseName]);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setAllCourses(res.data);
    } catch (err) {
      toast.error(t('admin.messages.load_courses_failed'));
    }
  };

  const fetchResources = async () => {
    const selectedCourse = uniqueCourses.find(c => c.name === selectedCourseName);
    if (!selectedCourse) return;
    try {
      const res = await api.get(`/resources/course/${selectedCourse.id}`);
      setResources(res.data);
    } catch (err) {
      toast.error(t('admin.messages.load_resources_failed'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error(t('admin.messages.title_req'));
      return;
    }
    if (formData.type === 'recording' && !recordingFile && !editingResource) {
      toast.error(t('admin.messages.file_req'));
      return;
    }
    if (formData.type !== 'recording' && !formData.url.trim()) {
      toast.error(t('admin.messages.url_req'));
      return;
    }
    if (!selectedCourseName) {
      toast.error(t('admin.messages.select_course_req'));
      return;
    }
    setLoading(true);
    try {
      let finalUrl = formData.url;

      if (formData.type === 'video') {
        finalUrl = convertToEmbedUrl(formData.url);
      } else if (formData.type === 'recording') {
        if (recordingFile) {
          const fileName = `${Date.now()}-${recordingFile.name}`;
          const { data, error } = await supabase.storage
            .from('course-recordings')
            .upload(fileName, recordingFile, {
              cacheControl: '3600',
              upsert: false
            });

          if (error) throw error;

          const { data: publicUrlData } = supabase.storage
            .from('course-recordings')
            .getPublicUrl(fileName);
          finalUrl = publicUrlData.publicUrl;
        } else {
          finalUrl = formData.url;
        }
      }

      const selectedCourse = uniqueCourses.find(c => c.name === selectedCourseName);
      const payload = { ...formData, url: finalUrl, courseId: selectedCourse.id };

      if (editingResource) {
        await api.put(`/resources/${editingResource.id}`, payload);
        toast.success(t('common.success'));
      } else {
        await api.post('/resources', payload);
        toast.success(t('common.success'));
      }
      resetForm();
      fetchResources();
    } catch (err) {
      toast.error(err.response?.data?.message || t('admin.messages.save_resource_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirm_delete'))) return;
    try {
      await api.delete(`/resources/${id}`);
      toast.success(t('common.success'));
      fetchResources();
    } catch (err) {
      toast.error(t('admin.messages.delete_resource_failed'));
    }
  };

  const startEdit = (resource) => {
    setEditingResource(resource);
    setFormData({
      type: resource.type,
      title: resource.title,
      url: resource.url,
    });
    setRecordingFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingResource(null);
    setFormData({ type: 'video', title: '', url: '' });
    setRecordingFile(null);
  };

  const getTypeIcon = (type) => {
      switch(type) {
          case 'video': return <Video className="w-6 h-6 text-rose-500" />;
          case 'pdf': return <FileText className="w-6 h-6 text-orange-500" />;
          case 'summary': return <Layers className="w-6 h-6 text-sky-500" />;
          case 'playlist': return <PlayCircle className="w-6 h-6 text-violet-500" />;
          case 'recording': return <Mic className="w-6 h-6 text-emerald-500" />;
          default: return <LinkIcon className="w-6 h-6 text-gray-500" />;
      }
  };

  return (
    <div className="space-y-8 lg:space-y-10 animate-in fade-in duration-700 pb-10">
      {/* Header Bento Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex items-center gap-6 bg-white/50 dark:bg-white/[0.02] backdrop-blur-md border border-gray-100 dark:border-white/5 p-8 rounded-[2.5rem] shadow-sm">
          <div className="w-16 h-16 bg-sky-500/10 dark:bg-sky-500/20 rounded-2xl flex items-center justify-center border border-sky-500/20 shadow-inner group transition-transform duration-500 hover:scale-110">
            <FolderOpen className="w-8 h-8 text-sky-600 dark:text-sky-400" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {t('admin.resources.title')}
            </h2>
            <p className="text-gray-500 dark:text-slate-500 text-sm font-bold mt-1 uppercase tracking-widest">{t('admin.resources.description')}</p>
          </div>
        </div>
        
        <div className="bg-sky-600 text-white p-8 rounded-[2.5rem] shadow-lg shadow-sky-600/20 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-inline-end-0 top-0 w-32 h-32 bg-white/10 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-black/10 px-3 py-1 rounded-full">{t('admin.resources.archive_active')}</span>
          </div>
          <div className="mt-4 relative z-10">
            <p className="text-4xl font-black">{resources.length}</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">{t('admin.resources.stored_units')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Left Column: Management & Selection */}
        <div className="xl:col-span-5 space-y-8">
            {/* Course Selector */}
            <div className="bg-white/50 dark:bg-white/[0.01] backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-[3rem] p-8 lg:p-10 shadow-sm relative overflow-hidden group">
                <div className="absolute -inset-inline-end-20 -top-20 w-64 h-64 bg-sky-500/5 blur-[80px] rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-sky-500/10 dark:bg-sky-500/20 rounded-2xl flex items-center justify-center border border-sky-500/20 text-sky-600 dark:text-sky-400 shadow-inner">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight uppercase">{t('admin.resources.select_course')}</h3>
                            <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-1">{t('admin.resources.locus_protocol')}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="relative group/select">
                            <Box className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/select:text-sky-500 transition-colors" />
                            <select
                                value={selectedCourseName}
                                onChange={(e) => setSelectedCourseName(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-[1.5rem] ps-14 pe-8 py-5 font-black focus:ring-4 focus:ring-sky-500/10 outline-none transition-all shadow-inner appearance-none uppercase tracking-widest text-xs"
                            >
                                <option value="">-- {t('admin.resources.select_course')} --</option>
                                {uniqueCourses.map(c => (
                                    <option key={c.name} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                            <ChevronRight className="absolute inset-inline-end-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rotate-90 pointer-events-none" />
                        </div>
                        
                        <div className="flex items-start gap-4 bg-sky-500/5 dark:bg-sky-500/[0.02] p-6 rounded-[2rem] border border-sky-500/10 dark:border-white/5 group/info transition-all duration-500">
                            <ShieldCheck className="w-6 h-6 text-sky-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                            <p className="text-[11px] text-sky-800 dark:text-sky-400/80 font-bold leading-relaxed uppercase tracking-widest italic">
                                {t('admin.resources.global_propagation')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Form */}
            <AnimatePresence mode="wait">
            {selectedCourseName && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="bg-white/50 dark:bg-white/[0.01] backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-[3rem] p-8 lg:p-10 shadow-sm relative overflow-hidden group"
                >
                    <div className="absolute -inset-inline-start-20 -bottom-20 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-100 dark:border-white/5">
                            <div className="w-14 h-14 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                {editingResource ? <Edit3 className="w-7 h-7" /> : <Plus className="w-7 h-7" />}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                                    {editingResource ? t('admin.resources.modals.edit_resource') : t('admin.resources.modals.new_resource')}
                                </h3>
                                <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-1">{t('admin.resources.node_definition')}</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.resources.modals.resource_type')}</label>
                                    <div className="relative group/type">
                                        <Layers className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/type:text-emerald-500 transition-colors" />
                                        <select
                                            value={formData.type}
                                            onChange={(e) => {
                                                setFormData({ ...formData, type: e.target.value });
                                                setRecordingFile(null);
                                            }}
                                            className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl ps-14 pe-8 py-5 font-black focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-inner appearance-none uppercase tracking-widest text-xs"
                                        >
                                            <option value="video">{t('admin.resources.types.video')}</option>
                                            <option value="pdf">{t('admin.resources.types.pdf')}</option>
                                            <option value="summary">{t('admin.resources.types.summary')}</option>
                                            <option value="playlist">{t('admin.resources.types.playlist')}</option>
                                            <option value="recording">{t('admin.resources.types.recording')}</option>
                                        </select>
                                        <ChevronRight className="absolute inset-inline-end-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rotate-90 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.resources.modals.resource_title')}</label>
                                    <div className="relative group/title">
                                        <Zap className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/title:text-emerald-500 transition-colors" />
                                        <input
                                            type="text"
                                            placeholder={t('admin.resources.placeholder_title')}
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl ps-14 pe-6 py-5 font-black focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-inner uppercase tracking-widest text-xs"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {formData.type === 'recording' ? (
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.resources.modals.upload_file')}</label>
                                    <label className={`relative flex flex-col items-center justify-center gap-6 cursor-pointer bg-gray-50 dark:bg-white/[0.01] border-2 border-gray-100 dark:border-white/5 border-dashed rounded-[2.5rem] p-10 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group/upload ${loading ? 'opacity-50 pointer-events-none' : ''} shadow-inner`}>
                                        <div className="w-16 h-16 bg-white dark:bg-white/5 rounded-[1.5rem] flex items-center justify-center shadow-sm group-hover/upload:scale-110 group-hover/upload:bg-emerald-500/10 transition-all border border-gray-100 dark:border-white/5">
                                            <Mic className="w-8 h-8 text-gray-400 group-hover/upload:text-emerald-500 transition-colors" />
                                        </div>
                                        <div className="text-center">
                                            <span className="text-gray-900 dark:text-white font-black text-xs block mb-2 uppercase tracking-widest">
                                                {recordingFile ? recordingFile.name : (editingResource ? t('admin.resources.archive_locked') : t('admin.resources.modals.upload_hint'))}
                                            </span>
                                            <span className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] italic">{t('admin.resources.binary_protocol')}</span>
                                        </div>
                                        <input type="file" accept="audio/*,video/*" onChange={(e) => setRecordingFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" required={!editingResource} />
                                    </label>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.resources.modals.resource_url')}</label>
                                    <div className="relative group/url">
                                        <LinkIcon className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/url:text-emerald-500 transition-colors" />
                                        <input
                                            type="url"
                                            placeholder={formData.type === 'video' ? 'https://youtube.com/...' : 'https://example.com/file.pdf'}
                                            value={formData.url}
                                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl ps-14 pe-6 py-5 font-black focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-inner text-xs font-mono tracking-wider"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-6 pt-10 border-t border-gray-100 dark:border-white/5">
                                <button type="submit" disabled={loading} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-5 rounded-[2.5rem] shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                                    {loading ? <Activity className="w-6 h-6 animate-spin" /> : <><CheckCircle2 className="w-6 h-6" /> <span className="uppercase tracking-widest text-xs">{editingResource ? t('common.save') : t('common.save')}</span></>}
                                </button>
                                {editingResource && (
                                    <button type="button" onClick={resetForm} className="px-14 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-black py-5 rounded-[2.5rem] transition-all uppercase tracking-widest text-xs">{t('common.cancel')}</button>
                                )}
                            </div>
                        </form>
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
        </div>

        {/* Right Column: Resource Listing */}
        <div className="xl:col-span-7">
            <div className="bg-white/50 dark:bg-white/[0.01] backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-[3rem] flex flex-col h-full shadow-sm relative overflow-hidden group">
                <div className="absolute -inset-inline-start-20 -bottom-20 w-96 h-96 bg-sky-500/5 rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>

                <div className="p-8 lg:p-10 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01] flex flex-wrap justify-between items-center gap-6 relative z-10">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl flex items-center justify-center shadow-sm relative">
                            <FileType className="w-7 h-7 text-sky-500" />
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-sky-600 rounded-full flex items-center justify-center text-[10px] font-black text-white border-2 border-white dark:border-[#080808]">{resources.length}</div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">{t('admin.resources.saved_registry')}</h3>
                            <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-1">{t('admin.resources.propagation_stream')}</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 lg:p-10 space-y-6 flex-1 overflow-y-auto no-scrollbar relative z-10">
                    <AnimatePresence mode="popLayout">
                    {!selectedCourseName ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center h-full py-48 text-center"
                        >
                            <BookOpen className="w-20 h-20 text-gray-200 dark:text-gray-800 mb-8 animate-pulse" />
                            <h4 className="text-xl font-black uppercase tracking-[0.3em] text-gray-400 dark:text-slate-600">{t('admin.resources.course_hint')}</h4>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 dark:text-slate-700 mt-4">{t('admin.resources.awaiting_auth')}</p>
                        </motion.div>
                    ) : resources.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center h-full py-48 text-center bg-white/30 dark:bg-white/[0.01] border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[3rem]"
                        >
                            <Sparkles className="w-16 h-16 text-gray-200 dark:text-gray-800 mb-8" />
                            <h4 className="text-xl font-black uppercase tracking-[0.3em] text-gray-400 dark:text-slate-600">{t('admin.resources.no_resources')}</h4>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 dark:text-slate-700 mt-4">{t('admin.resources.registry_void')}</p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {resources.map((r, idx) => (
                                <motion.div 
                                    key={r.id} 
                                    layout
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group/item relative bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8 hover:border-sky-500/30 hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-500"
                                >
                                     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                                        <div className="flex items-center gap-6 min-w-0">
                                            <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-white/5 flex items-center justify-center shadow-inner group-hover/item:scale-110 group-hover/item:border-sky-500/30 transition-all duration-700 shrink-0">
                                                {getTypeIcon(r.type)}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-gray-900 dark:text-white font-black tracking-tight truncate group-hover/item:text-sky-600 dark:group-hover/item:text-sky-400 transition-colors text-xl mb-2 uppercase">{r.title}</h4>
                                                <div className="flex flex-wrap items-center gap-4">
                                                    <span className="text-[9px] font-black text-sky-500 border border-sky-500/20 px-3 py-1 rounded-full uppercase tracking-widest bg-sky-500/5">{r.type}</span>
                                                    <div className="w-1 h-1 bg-gray-200 dark:bg-slate-800 rounded-full"></div>
                                                    {r.type !== 'recording' ? (
                                                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-sky-500 transition-colors">
                                                            <ExternalLink className="w-3.5 h-3.5" /> {t('admin.resources.modals.open_link')}
                                                        </a>
                                                    ) : (
                                                        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 group-hover/item:animate-pulse">
                                                            <Download className="w-3.5 h-3.5" /> {t('admin.resources.modals.download')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 shrink-0 self-end md:self-auto">
                                            <button onClick={() => startEdit(r)} className="w-11 h-11 flex items-center justify-center rounded-xl bg-blue-500/5 text-blue-500 border border-blue-500/10 hover:bg-blue-500 hover:text-white transition-all shadow-sm">
                                                <Edit3 className="w-4.5 h-4.5" />
                                            </button>
                                            <button onClick={() => handleDelete(r.id)} className="w-11 h-11 flex items-center justify-center rounded-xl bg-rose-500/5 text-rose-500 border border-rose-500/10 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                                                <Trash2 className="w-4.5 h-4.5" />
                                            </button>
                                        </div>
                                     </div>
                                     
                                     <div className="absolute inset-inline-end-10 bottom-8 opacity-0 group-hover/item:opacity-5 transition-opacity duration-1000 pointer-events-none">
                                        <FileType className="w-24 h-24 text-sky-500" />
                                     </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceManager;