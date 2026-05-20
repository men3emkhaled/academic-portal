import React, { useState, useEffect, useMemo, useRef } from 'react';
import api from '../../services/api';
import { supabase } from '../../services/supabase'; 
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
  FolderOpen, Plus, Edit3, Trash2, Video, 
  FileText, Mic, Link as LinkIcon, PlayCircle, 
  Layers, Download, ExternalLink, Activity,
  ChevronRight, BookOpen, FileType, 
  ShieldCheck, Zap, Sparkles, Box, CheckCircle2, Database, Save, X,
  ChevronDown, ArrowRight, Tag
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

const FakeWaveform = () => (
  <div className="flex items-center justify-center gap-1 h-8 sm:h-12 w-full">
    {[...Array(24)].map((_, i) => (
      <div key={i} className="w-1 bg-[#8b5cf6]/30 rounded-full animate-pulse"
        style={{
          height: `${Math.random() * 80 + 20}%`,
          animationDelay: `${Math.random() * 1}s`,
          animationDuration: `${Math.random() * 0.5 + 0.5}s`
        }}>
      </div>
    ))}
  </div>
);

const ResourceManager = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  
  const [allCourses, setAllCourses] = useState([]);
  const [selectedCourseName, setSelectedCourseName] = useState('');
  const [resources, setResources] = useState([]);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({ type: 'video', title: '', url: '' });
  const [loading, setLoading] = useState(false);
  const [recordingFile, setRecordingFile] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('video');
  const [showForm, setShowForm] = useState(false);
  
  const dropdownRef = useRef(null);

  const uniqueCourses = useMemo(() => {
    const map = new Map();
    allCourses.forEach(course => {
      if (!map.has(course.name)) {
        map.set(course.name, course.id);
      }
    });
    return Array.from(map.entries()).map(([name, id]) => ({ name, id }));
  }, [allCourses]);

  const tabs = [
    { id: 'video', label: t('admin.resources.types.video'), icon: <Video className="w-4 h-4" /> },
    { id: 'recording', label: t('admin.resources.types.recording'), icon: <Mic className="w-4 h-4" /> },
    { id: 'pdf', label: t('admin.resources.types.pdf'), icon: <FileText className="w-4 h-4" /> },
    { id: 'summary', label: t('admin.resources.types.summary'), icon: <BookOpen className="w-4 h-4" /> },
    { id: 'playlist', label: t('admin.resources.types.playlist'), icon: <PlayCircle className="w-4 h-4" /> }
  ];

  const filteredResources = useMemo(() => {
    return resources.filter(r => r.type === activeTab);
  }, [resources, activeTab]);

  const getTabCount = (tabId) => {
    return resources.filter(r => r.type === tabId).length;
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseName) {
      fetchResources();
    }
  }, [selectedCourseName]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingResource(null);
    setFormData({ type: 'video', title: '', url: '' });
    setRecordingFile(null);
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'video': return <Video className="w-7 h-7 text-[#8b5cf6] dark:text-[#d4a3ff]" />;
      case 'pdf': return <FileText className="w-7 h-7 text-[#8b5cf6] dark:text-[#d4a3ff]" />;
      case 'summary': return <Layers className="w-7 h-7 text-[#8b5cf6] dark:text-[#d4a3ff]" />;
      case 'playlist': return <PlayCircle className="w-7 h-7 text-[#8b5cf6] dark:text-[#d4a3ff]" />;
      case 'recording': return <Mic className="w-7 h-7 text-[#8b5cf6] dark:text-[#d4a3ff]" />;
      default: return <LinkIcon className="w-7 h-7 text-[#8b5cf6] dark:text-[#d4a3ff]" />;
    }
  };

  return (
    <div className="space-y-8 sm:space-y-16 lg:space-y-24 animate-in fade-in duration-700 pb-20 max-w-[1500px] mx-auto w-full text-start relative z-10 px-4 sm:px-0">
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] inset-inline-end-[-5%] w-[50vw] h-[50vw] bg-[#8b5cf6]/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] inset-inline-start-[-5%] w-[40vw] h-[40vw] bg-[#2cfc7d]/3 blur-[100px] rounded-full"></div>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-10 relative z-10">
        <div className="space-y-2 sm:space-y-4 max-w-2xl text-start">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2cfc7d]"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30">{t('admin.sidebar.tabs.resources')}</span>
          </div>
          <h1 className={`text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-[0.95] tracking-tighter uppercase text-gray-900 dark:text-white ${isAr ? 'font-arabic' : ''}`}>
            {t('admin.resources.title')}
          </h1>
        </div>

        <div className="bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white p-6 sm:p-8 rounded-[2.5rem] shadow-lg shadow-purple-600/20 flex flex-col justify-between relative overflow-hidden group min-w-[280px] w-full lg:w-auto">
          <div className="absolute inset-inline-end-0 top-0 w-32 h-32 bg-white/10 hidden rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-black/10 px-3 py-1 rounded-full">{t('admin.resources.archive_active')}</span>
          </div>
          <div className="mt-4 relative z-10 text-start">
            <p className="text-5xl sm:text-6xl font-black tracking-tighter">{resources.length}</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">{t('admin.resources.stored_units')}</p>
          </div>
        </div>
      </div>

      {/* Actions Bar - Compact Flex Row on Mobile for absolute visual cleanliness! */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 relative z-20">
        <button
          onClick={() => {
            if (!selectedCourseName) {
              toast.error(t('admin.messages.select_course_req'));
              return;
            }
            setShowForm(true);
          }}
          className="group bg-black dark:bg-white text-white dark:text-black rounded-[2.5rem] p-6 sm:p-10 flex items-center justify-between gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl relative overflow-hidden text-start w-full"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="flex items-center gap-4 sm:gap-6 relative z-10">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 dark:bg-black/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-90 transition-all duration-700">
              <Plus className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div className="text-start">
               <span className="block text-lg sm:text-2xl font-black uppercase tracking-tighter leading-none">{t('admin.resources.modals.new_resource')}</span>
               <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-1 sm:mt-1.5 block">{t('admin.resources.node_definition')}</span>
            </div>
          </div>
          <ChevronRight className={`w-6 h-6 sm:w-8 sm:h-8 opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all ${isAr ? 'rotate-180 group-hover:-translate-x-2' : ''}`} />
        </button>

        {/* Course Selector card with tighter padding on Mobile */}
        <div className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-6 sm:p-10 flex flex-col justify-center shadow-sm group relative z-30" ref={dropdownRef}>
           <div className="absolute inset-0 bg-[#2cfc7d] opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none rounded-[2.5rem]" />
           <div className="space-y-2 sm:space-y-3 relative z-10 w-full text-start">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#2cfc7d]">{t('admin.resources.select_course')}</p>
              
              <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between bg-gray-50 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-white/[0.04] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-[1.5rem] sm:rounded-[1.75rem] px-5 py-4 sm:px-8 sm:py-5.5 font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner uppercase tracking-widest text-xs sm:text-base"
                >
                    <span className="truncate">
                        {selectedCourseName ? selectedCourseName : `-- ${t('admin.resources.select_course')} --`}
                    </span>
                    <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-primary transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-3 bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/10 rounded-[1.5rem] sm:rounded-[1.75rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-300 max-h-[260px] overflow-y-auto custom-scrollbar">
                        {uniqueCourses.length === 0 ? (
                            <div className="px-6 py-4 sm:px-8 sm:py-5 text-xs sm:text-sm font-black uppercase text-gray-400 tracking-wider text-center">{t('admin.messages.load_courses_failed')}</div>
                        ) : (
                            uniqueCourses.map(c => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedCourseName(c.name);
                                        setIsDropdownOpen(false);
                                    }}
                                    className={`w-full text-start px-6 py-4 sm:px-8 sm:py-5 transition-all text-xs sm:text-base font-black uppercase tracking-wide flex items-center justify-between border-b border-gray-50 dark:border-white/[0.02] last:border-none ${selectedCourseName === c.name ? 'bg-[#8b5cf6] text-white' : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'}`}
                                >
                                    <span>{c.name}</span>
                                    <ArrowRight className={`w-4 h-4 sm:w-5 sm:h-5 ${isAr ? 'rotate-180' : ''} ${selectedCourseName === c.name ? 'opacity-100' : 'opacity-0'}`} />
                                </button>
                            ))
                        )}
                    </div>
                )}
              </div>
           </div>
        </div>
      </div>

      {/* Grid List Section */}
      <div className="space-y-6 sm:space-y-8 relative z-10">
         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
            <div className="flex items-center gap-2 text-start">
              <div className="w-1.5 h-1.5 rounded-full bg-[#2cfc7d]"></div>
              <h2 className={`text-2xl sm:text-3xl font-black uppercase tracking-tight ${isAr ? 'font-arabic' : ''}`}>
                 {t('admin.resources.saved_registry')}
              </h2>
            </div>
            
            {/* Custom Tabbed Navigation like student view with smooth mobile swiping! */}
            {selectedCourseName && (
              <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
                {tabs.map(tab => {
                  const count = getTabCount(tab.id);
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 py-3 px-5 sm:px-6 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                        isActive 
                          ? 'bg-black dark:bg-white text-white dark:text-black shadow-md' 
                          : 'text-gray-400 bg-white/60 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:text-gray-900 dark:hover:text-white shadow-sm'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                      {count > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] ${isActive ? 'bg-white/20 dark:bg-black/10' : 'bg-gray-200 dark:bg-white/10'}`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
         </div>

         {/* Cinematic Resource Cards Grid (3 Columns) */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {!selectedCourseName ? (
              <div className="col-span-full py-28 sm:py-40 text-center border-2 border-dashed border-gray-100 dark:border-white/10 rounded-[3rem] opacity-30 px-6">
                <BookOpen className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 text-gray-400 animate-pulse" />
                <h4 className="text-sm sm:text-xl font-black uppercase tracking-widest text-gray-500 leading-tight mb-2">{t('admin.resources.course_hint')}</h4>
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">{t('admin.resources.awaiting_auth')}</p>
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="col-span-full py-28 sm:py-40 text-center border-2 border-dashed border-gray-100 dark:border-white/10 rounded-[3rem] opacity-30 px-6">
                <Sparkles className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 text-gray-400" />
                <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-xs">{t('admin.resources.no_resources')}</p>
              </div>
            ) : (
              filteredResources.map((item) => (
                <div 
                    key={item.id}
                    className="group relative bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-6 sm:p-10 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-700 shadow-sm flex flex-col justify-between min-h-[340px] sm:min-h-[380px] overflow-hidden text-start"
                >
                    {/* Background Decor */}
                    <div className="absolute top-[-10%] inset-inline-end-[-5%] w-32 h-32 bg-[#8b5cf6]/10 blur-3xl rounded-full group-hover:bg-white/20 transition-all duration-700" />
                    
                    <div className="space-y-6 sm:space-y-8 relative z-10 w-full">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#8b5cf6]/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-all duration-500">
                                {getTypeIcon(item.type)}
                            </div>
                            <div className="flex gap-2">
                               <button onClick={(e) => { e.stopPropagation(); startEdit(item); }} className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-gray-100 dark:border-white/10 flex items-center justify-center hover:bg-[#8b5cf6] hover:border-[#8b5cf6] hover:text-white transition-all shadow-sm">
                                 <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                               </button>
                               <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-gray-100 dark:border-white/10 flex items-center justify-center hover:bg-rose-500 hover:border-rose-500 hover:text-white transition-all shadow-sm">
                                 <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                               </button>
                             </div>
                        </div>

                        <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 group-hover:opacity-100 transition-opacity">
                                {item.type.toUpperCase()}
                            </span>
                            <h3 className="text-xl sm:text-2xl font-black tracking-tighter uppercase leading-[1.1] line-clamp-3">
                                {item.title}
                            </h3>
                        </div>

                        {/* Card Embedded Previews */}
                        {activeTab === 'video' && (
                          <div className="aspect-video relative overflow-hidden bg-black w-full rounded-2xl border border-gray-100 dark:border-white/5">
                              <iframe src={convertToEmbedUrl(item.url)} title={item.title} className="w-full h-full border-none pointer-events-none" />
                              <div className="absolute inset-0 bg-black/10"></div>
                          </div>
                        )}

                        {activeTab === 'recording' && (
                          <div className="py-2">
                            <FakeWaveform />
                          </div>
                        )}
                    </div>

                    <div className="pt-6 sm:pt-8 border-t border-gray-100 dark:border-white/5 flex items-center justify-between relative z-10 group-hover:border-white/20 transition-all">
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-[#2cfc7d] shadow-[0_0_12px_rgba(44,252,125,0.5)] group-hover:bg-white group-hover:shadow-[0_0_12px_rgba(255,255,255,0.5)] transition-all"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                              {activeTab === 'recording' ? t('admin.resources.modals.download') : t('admin.resources.modals.open_link')}
                            </span>
                        </a>
                        <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all ${isAr ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                    </div>
                </div>
              ))
            )}
         </div>
      </div>

      {/* Cinematic Modal Form (Optimized for Mobile viewports!) */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div 
            onClick={resetForm}
            className="absolute inset-0 bg-gray-950/40 dark:bg-black/80 backdrop-blur-sm" 
          />
          <div 
            className="bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-white/5 rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-12 w-full max-w-4xl shadow-2xl relative overflow-hidden z-10 text-start my-8" 
            onClick={e => e.stopPropagation()}
          >
             {/* Modal Background Glow */}
             <div className="absolute top-0 inset-inline-end-0 w-80 h-80 bg-purple-500/10 hidden rounded-full pointer-events-none"></div>

             <div className="relative z-10">
                <div className="flex items-center justify-between mb-6 sm:mb-10 pb-4 sm:pb-8 border-b border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-4 sm:gap-5">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#8b5cf6]/10 dark:bg-[#8b5cf6]/20 rounded-2xl flex items-center justify-center border border-[#8b5cf6]/20 text-[#8b5cf6] dark:text-[#d4a3ff]">
                          {editingResource ? <Edit3 className="w-5 h-5 sm:w-7 sm:h-7" /> : <Plus className="w-5 h-5 sm:w-7 sm:h-7" />}
                      </div>
                      <div>
                          <h3 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                              {editingResource ? t('admin.resources.modals.edit_resource') : t('admin.resources.modals.new_resource')}
                          </h3>
                          <p className="text-gray-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest mt-0.5 sm:mt-1">{t('admin.resources.node_definition')}</p>
                      </div>
                    </div>
                    <button onClick={resetForm} className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center transition-colors">
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                        {/* Basic Info */}
                        <div className="space-y-4 sm:space-y-6">
                            <h5 className="text-[10px] font-black text-[#8b5cf6] dark:text-[#d4a3ff] uppercase tracking-[0.3em] mb-4 sm:mb-6 flex items-center gap-3">
                                <Tag className="w-4 h-4" /> {t('admin.resources.modals.resource_type')}
                            </h5>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.resources.modals.resource_type')}</label>
                                <div className="relative">
                                    <select
                                        value={formData.type}
                                        onChange={(e) => {
                                            setFormData({ ...formData, type: e.target.value });
                                            setRecordingFile(null);
                                        }}
                                        className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-5 py-4 font-black focus:ring-4 focus:ring-[#8b5cf6]/10 outline-none transition-all shadow-inner appearance-none uppercase tracking-widest text-[11px]"
                                    >
                                        <option value="video">{t('admin.resources.types.video')}</option>
                                        <option value="pdf">{t('admin.resources.types.pdf')}</option>
                                        <option value="summary">{t('admin.resources.types.summary')}</option>
                                        <option value="playlist">{t('admin.resources.types.playlist')}</option>
                                        <option value="recording">{t('admin.resources.types.recording')}</option>
                                    </select>
                                    <ChevronRight className="absolute inset-inline-end-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 rotate-90" />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.resources.modals.resource_title')} *</label>
                                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-5 py-4 font-black focus:ring-4 focus:ring-[#8b5cf6]/10 outline-none transition-all shadow-inner text-sm" placeholder={t('admin.resources.placeholder_title')} required />
                            </div>
                        </div>

                        {/* File Upload / Link URL */}
                        <div className="space-y-4 sm:space-y-6">
                            <h5 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4 sm:mb-6 flex items-center gap-3">
                                <LinkIcon className="w-4 h-4" /> {formData.type === 'recording' ? t('admin.resources.modals.upload_file') : t('admin.resources.modals.resource_url')}
                            </h5>
                            
                            {formData.type === 'recording' ? (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.resources.modals.upload_file')}</label>
                                    <label className={`relative flex flex-col items-center justify-center gap-3 sm:gap-4 cursor-pointer bg-gray-50 dark:bg-white/[0.01] border-2 border-gray-100 dark:border-white/5 border-dashed rounded-[1.5rem] p-5 sm:p-6 hover:border-primary/50 hover:bg-primary/5 transition-all group/upload ${loading ? 'opacity-50 pointer-events-none' : ''} shadow-inner`}>
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-white/5 rounded-xl flex items-center justify-center shadow-sm group-hover/upload:scale-105 transition-all border border-gray-100 dark:border-white/5">
                                            <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-[#8b5cf6]" />
                                        </div>
                                        <div className="text-center">
                                            <span className="text-gray-900 dark:text-white font-black text-[11px] sm:text-xs block mb-1 uppercase tracking-wider break-all px-2">
                                                {recordingFile ? recordingFile.name : (editingResource ? t('admin.resources.archive_locked') : t('admin.resources.modals.upload_hint'))}
                                            </span>
                                            <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest italic">{t('admin.resources.binary_protocol')}</span>
                                        </div>
                                        <input type="file" accept="audio/*,video/*" onChange={(e) => setRecordingFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" required={!editingResource} />
                                    </label>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.resources.modals.resource_url')} *</label>
                                    <input 
                                        type="url" 
                                        value={formData.url} 
                                        onChange={e => setFormData({ ...formData, url: e.target.value })} 
                                        className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-5 py-4 font-black focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-inner text-sm" 
                                        placeholder={formData.type === 'video' ? 'https://youtube.com/...' : 'https://example.com/file.pdf'} 
                                        required 
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-6 sm:pt-10 border-t border-gray-100 dark:border-white/5">
                        <button type="submit" disabled={loading} className="w-full sm:flex-1 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-black py-4 sm:py-5 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                            <span className="uppercase tracking-widest text-xs sm:text-sm">
                                {loading ? t('admin.courses.saving') : (editingResource ? t('common.save') : t('admin.resources.modals.new_resource'))}
                            </span>
                        </button>
                        <button type="button" onClick={resetForm} className="w-full sm:px-14 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-black py-4 sm:py-5 rounded-[2rem] sm:rounded-[2.5rem] transition-all uppercase tracking-widest text-xs sm:text-sm">
                            {t('common.cancel')}
                        </button>
                    </div>
                </form>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceManager;