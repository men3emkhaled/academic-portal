import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { supabase } from '../../services/supabase'; 
import toast from 'react-hot-toast';
import { 
  FolderOpen, Plus, Edit3, Trash2, Video, 
  FileText, Mic, Link as LinkIcon, PlayCircle, 
  Layers, Download, ExternalLink, Activity,
  ChevronRight, BookOpen, Clock, FileType
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
      toast.error('Failed to load courses');
    }
  };

  const fetchResources = async () => {
    const selectedCourse = uniqueCourses.find(c => c.name === selectedCourseName);
    if (!selectedCourse) return;
    try {
      const res = await api.get(`/resources/course/${selectedCourse.id}`);
      setResources(res.data);
    } catch (err) {
      toast.error('Failed to load resources');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Identity required');
      return;
    }
    if (formData.type === 'recording' && !recordingFile && !editingResource) {
      toast.error('Source matrix missing');
      return;
    }
    if (formData.type !== 'recording' && !formData.url.trim()) {
      toast.error('Link vector required');
      return;
    }
    if (!selectedCourseName) {
      toast.error('Target course not selected');
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
        toast.success('Resource matrix updated');
      } else {
        await api.post('/resources', payload);
        toast.success('New resource deployed');
      }
      resetForm();
      fetchResources();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transaction failure');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Decommission this resource?')) return;
    try {
      await api.delete(`/resources/${id}`);
      toast.success('Purged successfully');
      fetchResources();
    } catch (err) {
      toast.error('Purge failure');
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
  };

  const resetForm = () => {
    setEditingResource(null);
    setFormData({ type: 'video', title: '', url: '' });
    setRecordingFile(null);
  };

  const getTypeIcon = (type) => {
      switch(type) {
          case 'video': return <Video className="w-4 h-4 text-red-500 dark:text-red-400" />;
          case 'pdf': return <FileText className="w-4 h-4 text-orange-500 dark:text-orange-400" />;
          case 'summary': return <Layers className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
          case 'playlist': return <PlayCircle className="w-4 h-4 text-purple-500 dark:text-purple-400" />;
          case 'recording': return <Mic className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />;
          default: return <LinkIcon className="w-4 h-4 text-gray-500 dark:text-slate-400" />;
      }
  };

  return (
    <div className="animate-fadeIn pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-2 h-10 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              <FolderOpen className="w-6 h-6 text-blue-500 dark:text-blue-400" /> Resource Vault
            </h2>
            <p className="text-gray-500 dark:text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Course Material Management & Distribution</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-8">
            {/* Control Node: Selection */}
            <div className="admin-card relative overflow-hidden group transition-colors">
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/20 dark:border-blue-500/30">
                            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Active Linkage</h3>
                            <p className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase tracking-widest">Connect resources to course grid</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4">Target Course</label>
                        <select
                            value={selectedCourseName}
                            onChange={(e) => setSelectedCourseName(e.target.value)}
                            className="admin-input appearance-none"
                        >
                            <option value="">-- Catalog Selection --</option>
                            {uniqueCourses.map(c => (
                                <option key={c.name} value={c.name}>{c.name}</option>
                            ))}
                        </select>
                        <div className="flex items-start gap-2 bg-gray-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                            <Activity className="w-4 h-4 text-blue-500/50 flex-shrink-0 mt-0.5" />
                            <p className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase leading-relaxed tracking-wider">
                                Resources are synchronized across all department sectors for identical course hashes.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Node: Add/Edit */}
            {selectedCourseName && (
                <div className="admin-card relative overflow-hidden animate-fadeInUp transition-colors">
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/20 dark:border-emerald-500/30">
                                {editingResource ? <Edit3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> : <Plus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                                    {editingResource ? 'Recalibrate Meta' : 'Inject New Data'}
                                </h3>
                                <p className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase tracking-widest">Resource Definition Protocol</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4">Vector Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => {
                                            setFormData({ ...formData, type: e.target.value });
                                            setRecordingFile(null);
                                        }}
                                        className="admin-input appearance-none"
                                    >
                                        <option value="video">VIDEO_LINK</option>
                                        <option value="pdf">DOCUMENT_PDF</option>
                                        <option value="summary">TEXT_SUMMARY</option>
                                        <option value="playlist">MEDIA_PLAYLIST</option>
                                        <option value="recording">AUDIO_RECORDING</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4">Descriptive Title</label>
                                    <input
                                        type="text"
                                        placeholder="Identification tag..."
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="admin-input"
                                        required
                                    />
                                </div>
                            </div>

                            {formData.type === 'recording' ? (
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4">Source Transmission File</label>
                                    <label className={`relative flex flex-col items-center justify-center gap-3 cursor-pointer bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-white/5 border-dashed rounded-3xl p-8 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <Mic className="w-10 h-10 text-gray-400 dark:text-slate-700 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                                        <span className="text-gray-500 dark:text-slate-400 font-black uppercase text-xs tracking-widest text-center">
                                            {recordingFile ? recordingFile.name : (editingResource ? 'CURRENT_FILE_ACTIVE' : 'CHOOSE_AUDIO_VECTOR')}
                                        </span>
                                        <input type="file" accept="audio/*,video/*" onChange={(e) => setRecordingFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" required={!editingResource} />
                                    </label>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4">Source URL / Pointer</label>
                                    <div className="relative">
                                        <input
                                            type="url"
                                            placeholder={formData.type === 'video' ? 'YouTube link node...' : 'Target URL path...'}
                                            value={formData.url}
                                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                            className="admin-input pl-12"
                                            required
                                        />
                                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-700" />
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4 pt-4">
                                <button type="submit" className="flex-1 admin-btn-primary h-[60px] font-black uppercase tracking-widest" disabled={loading}>
                                    {loading ? <Activity className="w-6 h-6 animate-spin mx-auto" /> : (editingResource ? 'APPLY_RECALIBRATION' : 'DEPLOY_RESOURCE')}
                                </button>
                                {editingResource && (
                                    <button type="button" onClick={resetForm} className="px-10 admin-btn-secondary h-[60px] font-bold uppercase">ABORT</button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>

        {/* Existing Vault Registry */}
        <div className="bg-white dark:bg-[#111111]/40 border border-gray-200 dark:border-white/5 rounded-[2.5rem] flex flex-col min-h-[600px] h-fit transition-colors shadow-sm dark:shadow-2xl">
            <div className="p-8 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.1em]">Vault Registry</h3>
                </div>
                <span className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest">{resources.length} units</span>
            </div>

            <div className="p-8 space-y-4 overflow-y-auto max-h-[800px] custom-scrollbar">
                {!selectedCourseName ? (
                    <div className="flex flex-col items-center justify-center py-40 grayscale opacity-20 border border-gray-200 dark:border-white/5 border-dashed rounded-[2rem]">
                        <FileType className="w-20 h-20 mb-6" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Node selection required</p>
                    </div>
                ) : resources.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-40 grayscale opacity-20">
                        <LinkIcon className="w-16 h-16 mb-6" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No deployed assets</p>
                    </div>
                ) : (
                    resources.map(r => (
                        <div key={r.id} className="group relative bg-gray-50/50 dark:bg-[#151515]/50 border border-gray-200 dark:border-white/5 rounded-3xl p-6 hover:bg-white dark:hover:bg-white/[0.02] hover:border-blue-500/20 transition-all duration-300 transition-colors">
                             <div className="flex justify-between items-center gap-4">
                                <div className="flex items-center gap-5 min-w-0">
                                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-blue-500/10 group-hover:border-blue-500/30">
                                        {getTypeIcon(r.type)}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-gray-900 dark:text-white font-black tracking-tight truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase text-sm mb-1">{r.title}</h4>
                                        <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">
                                            <span className="flex items-center gap-1.5"><FileType className="w-3 h-3" /> {r.type}</span>
                                            {r.type !== 'recording' ? (
                                                <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-600 dark:text-blue-500/70 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                                                    <ExternalLink className="w-3 h-3" /> LINK_SOURCE
                                                </a>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500/70 tracking-tighter">
                                                    <Download className="w-3 h-3" /> AUDIO_STREAM_ACTIVE
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button onClick={() => startEdit(r)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 text-yellow-600 dark:text-yellow-500 hover:bg-yellow-600 dark:hover:bg-yellow-500 hover:text-white dark:hover:text-black transition-all transform hover:scale-105">
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(r.id)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 dark:bg-red-400/10 text-red-600 dark:text-red-500 hover:bg-red-600 dark:hover:bg-red-500 hover:text-white transition-all transform hover:scale-105">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                             </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceManager;