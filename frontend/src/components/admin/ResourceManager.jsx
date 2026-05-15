import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { supabase } from '../../services/supabase'; 
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
  FolderOpen, Plus, Edit3, Trash2, Video, 
  FileText, Mic, Link as LinkIcon, PlayCircle, 
  Layers, Download, ExternalLink, Activity,
  ChevronRight, BookOpen, FileType, 
  ShieldCheck, Zap, Sparkles, Box, CheckCircle2, Database, Save, X
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
          case 'video': return <Video className="w-6 h-6 text-primary" />;
          case 'pdf': return <FileText className="w-6 h-6 text-primary" />;
          case 'summary': return <Layers className="w-6 h-6 text-primary" />;
          case 'playlist': return <PlayCircle className="w-6 h-6 text-primary" />;
          case 'recording': return <Mic className="w-6 h-6 text-primary" />;
          default: return <LinkIcon className="w-6 h-6 text-primary" />;
      }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-10 text-start">
      {/* Header Bento Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex items-center gap-8 bg-white dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 p-10 rounded-[3rem] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
          <div className="w-20 h-20 bg-primary/10 dark:bg-primary/20 rounded-[1.75rem] flex items-center justify-center border border-primary/20 shadow-inner group-hover:scale-110 transition-transform duration-500 relative z-10">
            <FolderOpen className="w-10 h-10 text-primary" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">
              {t('admin.resources.title')}
            </h2>
            <p className="text-gray-400 text-[11px] font-black mt-3 uppercase tracking-widest italic opacity-60">{t('admin.resources.description')}</p>
          </div>
        </div>
        
        <div className="bg-primary text-white p-10 rounded-[3rem] shadow-2xl shadow-primary/20 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-12 h-12 rounded-[1.25rem] bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20">
              <Database className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-black/10 px-4 py-1.5 rounded-full backdrop-blur-md">{t('admin.resources.archive_active')}</span>
          </div>
          <div className="mt-8 relative z-10">
            <p className="text-5xl font-black tracking-tighter leading-none">{resources.length}</p>
            <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-60 mt-3">{t('admin.resources.stored_units')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        {/* Left Column: Management & Selection */}
        <div className="xl:col-span-5 space-y-10">
            {/* Course Selector */}
            <div className="bg-white dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-[3.5rem] p-10 lg:p-12 shadow-sm relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="flex items-center gap-6 mb-10">
                        <div className="w-14 h-14 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/20 text-primary shadow-inner">
                            <BookOpen className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">{t('admin.resources.select_course')}</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1.5 italic">{t('admin.resources.locus_protocol')}</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="relative group/select">
                            <Box className="absolute inset-inline-start-6 top-1/2 -translate-y-1/2 w-6 h-6 text-primary/40 group-focus-within/select:text-primary transition-colors" />
                            <select
                                value={selectedCourseName}
                                onChange={(e) => setSelectedCourseName(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-[1.75rem] ps-16 pe-8 py-6 font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner appearance-none uppercase tracking-widest text-xs"
                            >
                                <option value="">-- {t('admin.resources.select_course')} --</option>
                                {uniqueCourses.map(c => (
                                    <option key={c.name} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                            <ChevronRight className="absolute inset-inline-end-8 top-1/2 -translate-y-1/2 w-6 h-6 text-primary rotate-90 pointer-events-none" />
                        </div>
                        
                        <div className="flex items-start gap-6 bg-primary/5 dark:bg-primary/[0.02] p-8 rounded-[2.5rem] border border-primary/10 group/info transition-all duration-500 hover:bg-primary/10">
                            <ShieldCheck className="w-8 h-8 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                            <p className="text-[11px] text-gray-400 font-bold leading-relaxed uppercase tracking-[0.2em] italic">
                                {t('admin.resources.global_propagation')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Form */}
            {selectedCourseName && (
                <div className="bg-white dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-[3.5rem] p-10 lg:p-12 shadow-sm relative overflow-hidden group animate-in slide-in-from-bottom-12 duration-700">
                    <div className="relative z-10">
                        <div className="flex items-center gap-6 mb-12 pb-8 border-b border-gray-100 dark:border-white/5">
                            <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-[1.25rem] flex items-center justify-center border border-primary/20 text-primary shadow-inner group-hover:scale-110 transition-transform duration-500">
                                {editingResource ? <Edit3 className="w-8 h-8" /> : <Plus className="w-8 h-8" />}
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase leading-none">
                                    {editingResource ? t('admin.resources.modals.edit_resource') : t('admin.resources.modals.new_resource')}
                                </h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 italic">{t('admin.resources.node_definition')}</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-10">
                            <div className="grid grid-cols-1 gap-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.resources.modals.resource_type')}</label>
                                    <div className="relative group/type">
                                        <Layers className="absolute inset-inline-start-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary group-focus-within/type:scale-125 transition-transform" />
                                        <select
                                            value={formData.type}
                                            onChange={(e) => {
                                                setFormData({ ...formData, type: e.target.value });
                                                setRecordingFile(null);
                                            }}
                                            className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-[1.5rem] ps-16 pe-8 py-5 font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner appearance-none uppercase tracking-widest text-xs"
                                        >
                                            <option value="video">{t('admin.resources.types.video')}</option>
                                            <option value="pdf">{t('admin.resources.types.pdf')}</option>
                                            <option value="summary">{t('admin.resources.types.summary')}</option>
                                            <option value="playlist">{t('admin.resources.types.playlist')}</option>
                                            <option value="recording">{t('admin.resources.types.recording')}</option>
                                        </select>
                                        <ChevronRight className="absolute inset-inline-end-8 top-1/2 -translate-y-1/2 w-6 h-6 text-primary rotate-90 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.resources.modals.resource_title')}</label>
                                    <div className="relative group/title">
                                        <Zap className="absolute inset-inline-start-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary group-focus-within/title:scale-125 transition-transform" />
                                        <input
                                            type="text"
                                            placeholder={t('admin.resources.placeholder_title')}
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-[1.5rem] ps-16 pe-6 py-5 font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner uppercase tracking-widest text-xs"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {formData.type === 'recording' ? (
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.resources.modals.upload_file')}</label>
                                    <label className={`relative flex flex-col items-center justify-center gap-8 cursor-pointer bg-gray-50 dark:bg-white/[0.01] border-2 border-gray-100 dark:border-white/5 border-dashed rounded-[3rem] p-12 hover:border-primary/50 hover:bg-primary/5 transition-all group/upload ${loading ? 'opacity-50 pointer-events-none' : ''} shadow-inner`}>
                                        <div className="w-20 h-20 bg-white dark:bg-white/5 rounded-[1.75rem] flex items-center justify-center shadow-sm group-hover/upload:scale-110 group-hover/upload:bg-primary/10 transition-all border border-gray-100 dark:border-white/5">
                                            <Mic className="w-10 h-10 text-primary" />
                                        </div>
                                        <div className="text-center">
                                            <span className="text-gray-900 dark:text-white font-black text-sm block mb-3 uppercase tracking-[0.2em]">
                                                {recordingFile ? recordingFile.name : (editingResource ? t('admin.resources.archive_locked') : t('admin.resources.modals.upload_hint'))}
                                            </span>
                                            <span className="text-[9px] text-gray-400 font-black uppercase tracking-[0.3em] italic">{t('admin.resources.binary_protocol')}</span>
                                        </div>
                                        <input type="file" accept="audio/*,video/*" onChange={(e) => setRecordingFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" required={!editingResource} />
                                    </label>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.resources.modals.resource_url')}</label>
                                    <div className="relative group/url">
                                        <LinkIcon className="absolute inset-inline-start-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary group-focus-within/url:scale-125 transition-transform" />
                                        <input
                                            type="url"
                                            placeholder={formData.type === 'video' ? 'https://youtube.com/...' : 'https://example.com/file.pdf'}
                                            value={formData.url}
                                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-[1.5rem] ps-16 pe-6 py-5 font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner text-xs font-mono tracking-wider"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-6 pt-12 border-t border-gray-100 dark:border-white/5">
                                <button type="submit" disabled={loading} className="flex-1 bg-primary text-white font-black py-6 rounded-[2.5rem] shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4">
                                    {loading ? <Activity className="w-7 h-7 animate-spin" /> : <><Save className="w-7 h-7" /> <span className="uppercase tracking-[0.2em] text-[11px]">{t('common.save')}</span></>}
                                </button>
                                {editingResource && (
                                    <button type="button" onClick={resetForm} className="px-16 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-black py-6 rounded-[2.5rem] transition-all uppercase tracking-widest text-[11px]">{t('common.cancel')}</button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>

        {/* Right Column: Resource Listing */}
        <div className="xl:col-span-7">
            <div className="bg-white dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-[4rem] flex flex-col h-full shadow-sm relative overflow-hidden group">
                <div className="p-10 lg:p-12 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01] flex flex-wrap justify-between items-center gap-8 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[1.5rem] flex items-center justify-center shadow-sm relative">
                            <FileType className="w-9 h-9 text-primary" />
                            <div className="absolute -top-2 -right-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-[10px] font-black text-white border-4 border-white dark:border-[#080808]">{resources.length}</div>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">{t('admin.resources.saved_registry')}</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 italic opacity-60">{t('admin.resources.propagation_stream')}</p>
                        </div>
                    </div>
                </div>

                <div className="p-10 lg:p-12 space-y-8 flex-1 overflow-y-auto custom-scrollbar relative z-10">
                    {!selectedCourseName ? (
                        <div className="flex flex-col items-center justify-center h-full py-48 text-center opacity-30">
                            <BookOpen className="w-24 h-24 text-gray-300 mb-10 animate-pulse" />
                            <h4 className="text-2xl font-black uppercase tracking-[0.3em] text-gray-400 leading-none">{t('admin.resources.course_hint')}</h4>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 mt-6">{t('admin.resources.awaiting_auth')}</p>
                        </div>
                    ) : resources.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-48 text-center bg-gray-50/50 dark:bg-white/[0.01] border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[4rem] opacity-40">
                            <Sparkles className="w-20 h-20 text-gray-300 mb-10" />
                            <h4 className="text-2xl font-black uppercase tracking-[0.3em] text-gray-400 leading-none">{t('admin.resources.no_resources')}</h4>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 mt-6">{t('admin.resources.registry_void')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-8">
                            {resources.map((r) => (
                                <div 
                                    key={r.id} 
                                    className="group/item relative bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[3rem] p-10 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-700"
                                >
                                     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 relative z-10">
                                        <div className="flex items-center gap-8 min-w-0">
                                            <div className="w-20 h-20 rounded-[2rem] bg-gray-50 dark:bg-black border border-gray-100 dark:border-white/10 flex items-center justify-center shadow-inner group-hover/item:scale-110 group-hover/item:border-primary/40 transition-all duration-700 shrink-0">
                                                {getTypeIcon(r.type)}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-gray-900 dark:text-white font-black tracking-tighter truncate group-hover/item:text-primary transition-colors text-2xl mb-3 uppercase leading-none">{r.title}</h4>
                                                <div className="flex flex-wrap items-center gap-6">
                                                    <span className="text-[10px] font-black text-primary border border-primary/30 px-4 py-1.5 rounded-full uppercase tracking-widest bg-primary/5">{r.type.toUpperCase()}</span>
                                                    <div className="w-1.5 h-1.5 bg-primary/20 rounded-full"></div>
                                                    {r.type !== 'recording' ? (
                                                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors italic leading-none">
                                                            <ExternalLink className="w-4.5 h-4.5" /> {t('admin.resources.modals.open_link')}
                                                        </a>
                                                    ) : (
                                                        <span className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-primary group-hover/item:animate-pulse leading-none italic">
                                                            <Download className="w-4.5 h-4.5" /> {t('admin.resources.modals.download')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 shrink-0 self-end md:self-auto">
                                            <button onClick={() => startEdit(r)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-primary/5 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all shadow-sm">
                                                <Edit3 className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDelete(r.id)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-rose-500/5 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                     </div>
                                     
                                     <div className="absolute inset-inline-end-12 bottom-10 opacity-0 group-hover/item:opacity-5 transition-all duration-1000 pointer-events-none scale-150 rotate-12">
                                        <FileType className="w-32 h-32 text-primary" />
                                     </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceManager;