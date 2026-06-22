import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTAAuth } from '../../context/TAAuthContext';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderOpen, Plus, Edit3, Trash2, Video, FileText, 
  Mic, PlayCircle, Link as LinkIcon, Download, 
  ExternalLink, Upload, X, Save, Search, Filter, BookOpen, Clock,
  MoreVertical, Share2, Clipboard, FileCheck, Sparkles, ChevronDown
} from 'lucide-react';

const TAResourceManager = ({ courses }) => {
  const { taApi } = useTAAuth();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [resources, setResources] = useState([]);
  const [editingResource, setEditingResource] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ type: 'video', title: '', url: '', batch: 2025 });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [recordingFile, setRecordingFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    if (selectedCourseId) {
      fetchResources();
    } else {
      setResources([]);
    }
  }, [selectedCourseId]);

  const fetchResources = async () => {
    setFetchLoading(true);
    try {
      const res = await taApi('get', `/ta/resources/${selectedCourseId}`);
      setResources(res.data);
    } catch (err) {
      toast.error(t('doctor.resources.failed_load'));
    } finally {
      setFetchLoading(false);
    }
  };

  const convertToEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('/embed/')) return url;
    const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:[&?]|$)/);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
    return url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) return toast.error(t('doctor.resources.select_course_first'));
    if (!formData.title.trim()) return toast.error(t('doctor.resources.title_required'));

    setLoading(true);
    try {
      let finalUrl = formData.url;

      if (formData.type === 'video') {
        finalUrl = convertToEmbedUrl(formData.url);
      } else if (formData.type === 'recording' && recordingFile) {
        const fileName = `${Date.now()}-${recordingFile.name}`;
        const { data, error } = await supabase.storage
          .from('course-recordings')
          .upload(fileName, recordingFile, { cacheControl: '3600', upsert: false });

        if (error) throw error;
        const { data: publicUrlData } = supabase.storage
          .from('course-recordings')
          .getPublicUrl(fileName);
        finalUrl = publicUrlData.publicUrl;
      }

      const payload = { ...formData, url: finalUrl, courseId: selectedCourseId };

      if (editingResource) {
        await taApi('put', `/ta/resources/${editingResource.id}`, payload);
        toast.success(t('doctor.resources.material_updated'));
      } else {
        await taApi('post', '/ta/resources', payload);
        toast.success(t('doctor.resources.material_published'));
      }
      resetForm();
      fetchResources();
    } catch (err) {
      toast.error(err.response?.data?.message || t('doctor.resources.failed_save'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('doctor.resources.delete_confirm'))) return;
    try {
      await taApi('delete', `/ta/resources/${id}`);
      toast.success(t('doctor.resources.material_deleted'));
      fetchResources();
    } catch (err) {
      toast.error(t('doctor.resources.failed_delete'));
    }
  };

  const resetForm = () => {
    setEditingResource(null);
    setShowForm(false);
    setFormData({ type: 'video', title: '', url: '', batch: 2025 });
    setRecordingFile(null);
  };

  const startEdit = (r) => {
    setEditingResource(r);
    setShowForm(true);
    setFormData({ type: r.type, title: r.title, url: r.url, batch: r.batch || 2025 });
    setRecordingFile(null);
  };

  const getTypeConfig = (type) => {
    switch(type) {
      case 'video': return { icon: Video, color: 'text-rose-500', bg: 'bg-rose-500/10', glow: 'shadow-rose-500/20', label: t('doctor.resources.lecture') };
      case 'pdf': return { icon: FileText, color: 'text-amber-500', bg: 'bg-amber-500/10', glow: 'shadow-amber-500/20', label: t('doctor.resources.document') };
      case 'recording': return { icon: Mic, color: 'text-emerald-500', bg: 'bg-emerald-500/10', glow: 'shadow-emerald-500/20', label: t('doctor.resources.audio') };
      case 'playlist': return { icon: PlayCircle, color: 'text-[#059669]', bg: 'bg-[#059669]/10', glow: 'shadow-[#059669]/20', label: t('doctor.resources.playlist') };
      default: return { icon: LinkIcon, color: 'text-blue-500', bg: 'bg-blue-500/10', glow: 'shadow-blue-500/20', label: t('doctor.resources.reference') };
    }
  };

  const filteredResources = resources.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedResources = filteredResources.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {});

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 py-4"
    >
      {/* Header & Search */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#059669]/10 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-[#059669] dark:text-[#34d399]" />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{t('doctor.resources.knowledge_base')}</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-3">{t('doctor.resources.library_hub')}</h2>
          <p className="text-gray-500 dark:text-gray-400 font-semibold max-w-2xl leading-relaxed">
            {t('doctor.resources.subtitle')}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="relative group w-full sm:w-72">
              <Search className="absolute start-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#059669] transition-colors" />
              <input 
                type="text"
                placeholder={t('doctor.resources.find_resources')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-[1.5rem] py-4 ps-14 pe-6 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#059669]/5 transition-all font-semibold"
              />
           </div>
           {selectedCourseId && (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowForm(true)}
                className="bg-gray-900 dark:bg-white text-white dark:text-black font-black px-8 py-4 rounded-2xl flex items-center gap-3 shadow-xl transition-all"
              >
                <Plus className="w-5 h-5" />
                 <span className="text-xs uppercase tracking-widest">{t('doctor.resources.new_publication')}</span>
              </motion.button>
           )}
        </div>
      </div>

      {/* Course Selection Carousel-style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {courses.map((course, idx) => (
              <motion.button
                key={course.id}
                variants={itemVariants}
                onClick={() => setSelectedCourseId(course.id)}
                className={`relative p-6 rounded-[2rem] border transition-all text-start group overflow-hidden ${
                    selectedCourseId === course.id 
                    ? 'bg-[#059669] border-[#059669] text-white shadow-2xl shadow-[#059669]/30' 
                    : 'bg-white/40 dark:bg-white/[0.02] border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20'
                }`}
              >
                  <div className="flex items-center gap-4 relative z-10">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${selectedCourseId === course.id ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400 group-hover:scale-110'}`}>
                          <BookOpen className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                          <h4 className={`font-black text-sm truncate ${selectedCourseId === course.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{course.name}</h4>
                          <p className={`text-[9px] font-black uppercase tracking-[0.2em] mt-1 ${selectedCourseId === course.id ? 'text-white/60' : 'text-gray-400'}`}>{course.code}</p>
                      </div>
                  </div>
              </motion.button>
          ))}
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {!selectedCourseId ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/40 dark:bg-white/[0.02] border border-gray-200/50 dark:border-white/5 rounded-[3rem] p-24 text-center backdrop-blur-sm"
            >
                <div className="w-24 h-24 rounded-[2.5rem] bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-8">
                    <FolderOpen className="w-10 h-10 text-gray-300 dark:text-white/10" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">{t('doctor.resources.select_course')}</h3>
                <p className="text-gray-500 dark:text-gray-500 max-w-sm mx-auto font-semibold">{t('doctor.resources.select_course_desc')}</p>
            </motion.div>
        ) : fetchLoading ? (
            <motion.div key="loading" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1,2,3,4].map(i => (
                    <div key={i} className="bg-white/40 dark:bg-white/[0.02] border border-gray-200/50 dark:border-white/5 rounded-[2.5rem] p-8 animate-pulse">
                        <div className="flex items-center gap-5 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5"></div>
                            <div className="flex-1 space-y-3">
                                <div className="h-4 bg-gray-100 dark:bg-white/5 rounded-full w-3/4"></div>
                                <div className="h-3 bg-gray-100 dark:bg-white/5 rounded-full w-1/4"></div>
                            </div>
                        </div>
                        <div className="h-14 bg-gray-100 dark:bg-white/5 rounded-[1.5rem] w-full"></div>
                    </div>
                ))}
            </motion.div>
        ) : resources.length === 0 ? (
            <motion.div 
              key="no-content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/40 dark:bg-white/[0.02] border border-gray-200/50 dark:border-white/5 rounded-[3rem] p-24 text-center backdrop-blur-sm"
            >
                <div className="w-24 h-24 rounded-[2.5rem] bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-8">
                    <Upload className="w-10 h-10 text-gray-300 dark:text-white/10" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">{t('doctor.resources.library_empty')}</h3>
                <p className="text-gray-500 dark:text-gray-500 mb-10 font-semibold">{t('doctor.resources.library_empty_desc')}</p>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowForm(true)}
                  className="bg-[#059669] text-white font-black px-10 py-5 rounded-[1.5rem] transition-all inline-flex items-center gap-3 shadow-2xl shadow-[#059669]/20"
                >
                    <Plus className="w-6 h-6" />
                    <span className="text-xs uppercase tracking-widest">{t('doctor.resources.new_publication')}</span>
                </motion.button>
            </motion.div>
        ) : (
            <div className="space-y-16">
                {Object.entries(groupedResources).map(([type, items]) => {
                    const config = getTypeConfig(type);
                    const Icon = config.icon;
                    return (
                        <motion.section 
                          key={type}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-8"
                        >
                            <div className="flex items-center gap-5 ms-4">
                                <div className={`w-12 h-12 rounded-2xl ${config.bg} flex items-center justify-center border border-gray-100 dark:border-transparent`}>
                                    <Icon className={`w-6 h-6 ${config.color}`} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{config.label}s</h3>
                                    <div className="flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{items.length} {t('doctor.resources.units_available')}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {items.map((resource, idx) => (
                                    <motion.div 
                                        key={resource.id}
                                        whileHover={{ y: -5 }}
                                        className="bg-white/40 dark:bg-white/[0.02] border border-gray-200/50 dark:border-white/5 p-8 rounded-[2.5rem] hover:border-[#059669]/30 transition-all group relative overflow-hidden backdrop-blur-sm"
                                    >
                                        <div className={`absolute top-0 end-0 w-32 h-32 bg-${config.color.split('-')[1]}-500/5 hidden rounded-full translate-x-1/3 -translate-y-1/3`}></div>
                                        
                                        <div className="flex items-start justify-between gap-6 mb-8 relative z-10">
                                            <div className="min-w-0">
                                                <h4 className="text-gray-900 dark:text-white font-black text-xl leading-tight truncate mb-2 group-hover:text-[#059669] dark:group-hover:text-[#34d399] transition-colors">{resource.title}</h4>
                                                <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                    <div className="flex items-center gap-1.5">
                                                      <Clock className="w-3.5 h-3.5" />
                                                      {new Date(resource.created_at).toLocaleDateString()}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                      <FileCheck className="w-3.5 h-3.5" />
                                                      {config.label}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#059669]/10 text-[#059669] border border-[#059669]/20">
                                                      <span>{t('doctor.resources.batch')} {resource.batch || 2025}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                <button onClick={() => startEdit(resource)} className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center justify-center text-amber-500 hover:bg-amber-500/10 transition-colors">
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(resource.id)} className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center justify-center text-rose-500 hover:bg-rose-500/10 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 relative z-10">
                                            <a 
                                              href={resource.url} 
                                              target="_blank" 
                                              rel="noreferrer"
                                              className={`flex-1 flex items-center justify-center gap-3 py-4.5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all ${config.bg} ${config.color} hover:brightness-110 active:scale-[0.98] border border-transparent hover:border-${config.color.split('-')[1]}-500/20`}
                                            >
                                                {resource.type === 'recording' ? <Download className="w-5 h-5" /> : <ExternalLink className="w-5 h-5" />}
                                                <span>{resource.type === 'recording' ? t('doctor.resources.download') : t('doctor.resources.view_library')}</span>
                                            </a>
                                            <button 
                                              onClick={() => {
                                                  navigator.clipboard.writeText(resource.url);
                                                  toast.success(t('doctor.resources.link_copied'));
                                              }}
                                              className="w-14 h-14 rounded-[1.5rem] bg-gray-50 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-[#059669] transition-all active:scale-95"
                                            >
                                                <Share2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.section>
                    );
                })}
            </div>
        )}
      </AnimatePresence>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm"
          >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 10 }}
                className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 w-full max-w-xl rounded-[3.5rem] p-12 relative shadow-2xl overflow-hidden"
              >
                  <button onClick={resetForm} className="absolute top-10 end-10 w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all border border-transparent hover:border-gray-200 dark:hover:border-white/10">
                      <X className="w-6 h-6" />
                  </button>
                  
                  <div className="mb-10">
                    <div className="w-14 h-14 rounded-2xl bg-[#059669]/10 flex items-center justify-center mb-6">
                      <Sparkles className="w-7 h-7 text-[#059669] dark:text-[#34d399]" />
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">{editingResource ? t('admin.resources.modals.edit_resource') : t('doctor.resources.new_publication')}</h3>
                    <p className="text-gray-500 dark:text-gray-400 font-semibold leading-relaxed">{t('doctor.resources.publication_desc')}</p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="p-8 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-3">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ms-1">{t('doctor.resources.type_label')}</label>
                              <div className="relative">
                                <select
                                    value={formData.type}
                                    onChange={(e) => { setFormData({ ...formData, type: e.target.value }); setRecordingFile(null); }}
                                    className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl py-5 px-8 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-[#059669]/5 transition-all font-bold appearance-none cursor-pointer"
                                >
                                    <option value="video" className="bg-white dark:bg-black">{t('doctor.resources.option_video')}</option>
                                    <option value="pdf" className="bg-white dark:bg-black">{t('doctor.resources.option_pdf')}</option>
                                    <option value="recording" className="bg-white dark:bg-black">{t('doctor.resources.option_audio')}</option>
                                    <option value="playlist" className="bg-white dark:bg-black">{t('doctor.resources.option_playlist')}</option>
                                </select>
                                <ChevronDown className="absolute end-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                              </div>
                          </div>
                          <div className="space-y-3">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ms-1">{t('doctor.resources.target_batch')}</label>
                              <div className="relative">
                                <select
                                    value={formData.batch}
                                    onChange={(e) => setFormData({ ...formData, batch: parseInt(e.target.value, 10) })}
                                    className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl py-5 px-8 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-[#059669]/5 transition-all font-bold appearance-none cursor-pointer"
                                >
                                    {[2026, 2025, 2024, 2023].map(yr => (
                                        <option key={yr} value={yr} className="bg-white dark:bg-black">{t('doctor.resources.batch')} {yr}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute end-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                              </div>
                          </div>
                          <div className="space-y-3">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ms-1">{t('doctor.resources.title_label')}</label>
                              <input
                                  type="text"
                                  required
                                  value={formData.title}
                                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                  placeholder={t('doctor.resources.title_placeholder')}
                                  className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl py-5 px-8 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-[#059669]/5 transition-all font-bold"
                              />
                          </div>
                      </div>

                      {formData.type === 'recording' ? (
                          <div className="space-y-3">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ms-1">{t('doctor.resources.upload_file')}</label>
                              <div className="relative">
                                  <input
                                      type="file"
                                      accept="audio/*,video/*"
                                      onChange={(e) => setRecordingFile(e.target.files[0])}
                                      className="hidden"
                                      id="audio-upload"
                                      required={!editingResource}
                                  />
                                  <label 
                                      htmlFor="audio-upload"
                                      className="w-full bg-gray-50 dark:bg-white/[0.01] border-2 border-dashed border-gray-200 dark:border-white/10 rounded-[2rem] py-12 px-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#059669]/50 hover:bg-[#059669]/[0.02] transition-all group"
                                  >
                                      <div className="w-16 h-16 rounded-[1.5rem] bg-[#059669]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                          <Upload className="w-8 h-8 text-[#059669] dark:text-[#34d399]" />
                                      </div>
                                      <span className="text-sm font-black text-gray-900 dark:text-white mb-2">
                                          {recordingFile ? recordingFile.name : t('doctor.resources.choose_audio')}
                                      </span>
                                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('doctor.resources.supports_audio')}</span>
                                  </label>
                              </div>
                          </div>
                      ) : (
                          <div className="space-y-3">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ms-1">{t('doctor.resources.external_url')}</label>
                              <div className="relative">
                                  <LinkIcon className="absolute start-6 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                                  <input
                                      type="url"
                                      required
                                      value={formData.url}
                                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                      placeholder={t('doctor.resources.url_placeholder')}
                                      className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl py-5 ps-16 pe-8 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-[#059669]/5 transition-all font-bold"
                                  />
                              </div>
                          </div>
                      )}

                      <div className="pt-4 px-8">
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gray-900 dark:bg-white text-white dark:text-black font-black py-6 rounded-[2.5rem] shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-4 group"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-4 border-gray-400 border-t-gray-900 dark:border-gray-200 dark:border-t-black rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span className="text-xs uppercase tracking-[0.2em]">{editingResource ? t('doctor.resources.update_publication') : t('doctor.resources.publish_to_library')}</span>
                                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </>
                            )}
                        </motion.button>
                      </div>
                  </form>
              </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TAResourceManager;
