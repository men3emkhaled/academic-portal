import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { supabase } from '../../services/supabase'; 
import toast from 'react-hot-toast';
import { 
  FolderOpen, Plus, Edit3, Trash2, Video, 
  FileText, Mic, Link as LinkIcon, PlayCircle, 
  Layers, Download, ExternalLink, Activity,
  ChevronRight, BookOpen, Clock, FileType, 
  ShieldCheck, ArrowRight
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
      toast.error('Title is required');
      return;
    }
    if (formData.type === 'recording' && !recordingFile && !editingResource) {
      toast.error('Please select a file to upload');
      return;
    }
    if (formData.type !== 'recording' && !formData.url.trim()) {
      toast.error('URL link is required');
      return;
    }
    if (!selectedCourseName) {
      toast.error('Please select a course first');
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
        toast.success('Resource updated successfully');
      } else {
        await api.post('/resources', payload);
        toast.success('New resource added');
      }
      resetForm();
      fetchResources();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save resource');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await api.delete(`/resources/${id}`);
      toast.success('Resource deleted');
      fetchResources();
    } catch (err) {
      toast.error('Failed to delete resource');
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
          case 'video': return <Video className="w-5 h-5 text-rose-500" />;
          case 'pdf': return <FileText className="w-5 h-5 text-orange-500" />;
          case 'summary': return <Layers className="w-5 h-5 text-sky-500" />;
          case 'playlist': return <PlayCircle className="w-5 h-5 text-violet-500" />;
          case 'recording': return <Mic className="w-5 h-5 text-emerald-500" />;
          default: return <LinkIcon className="w-5 h-5 text-gray-500" />;
      }
  };

  return (
    <div className="animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-sky-500/10 dark:bg-sky-500/20 rounded-2xl flex items-center justify-center border border-sky-500/20 shadow-inner">
            <FolderOpen className="w-7 h-7 text-sky-600 dark:text-sky-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Course Resources
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold mt-1">Upload and manage course materials</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
            {/* Selection Panel */}
            <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group">
                {/* Background Glow */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-sky-500/5 dark:bg-sky-500/10 rounded-full blur-[60px] pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-sky-500/10 dark:bg-sky-500/20 rounded-2xl flex items-center justify-center border border-sky-500/20 shadow-inner">
                            <BookOpen className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Select Course</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-0.5">Choose a course to manage</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Target Course</label>
                        <div className="relative">
                            <select
                                value={selectedCourseName}
                                onChange={(e) => setSelectedCourseName(e.target.value)}
                                className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-sky-500/50 outline-none transition-all shadow-inner appearance-none"
                            >
                                <option value="">-- Choose Course --</option>
                                {uniqueCourses.map(c => (
                                    <option key={c.name} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-5 top-5 pointer-events-none text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                        
                        <div className="flex items-start gap-3 bg-sky-50/50 dark:bg-sky-500/5 p-5 rounded-2xl border border-sky-100 dark:border-sky-500/10 shadow-sm">
                            <ShieldCheck className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-sky-800 dark:text-sky-300/80 font-bold leading-relaxed">
                                Resources added here will be available to all students enrolled in this course across all departments.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Form */}
            {selectedCourseName && (
                <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden animate-in slide-in-from-top-4 duration-500">
                    <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-inner">
                                {editingResource ? <Edit3 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" /> : <Plus className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                                    {editingResource ? 'Edit Resource' : 'Add New Resource'}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-0.5">Enter resource details below</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Resource Type</label>
                                    <div className="relative">
                                        <select
                                            value={formData.type}
                                            onChange={(e) => {
                                                setFormData({ ...formData, type: e.target.value });
                                                setRecordingFile(null);
                                            }}
                                            className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all shadow-inner appearance-none"
                                        >
                                            <option value="video">Video Link</option>
                                            <option value="pdf">PDF Document</option>
                                            <option value="summary">Summary</option>
                                            <option value="playlist">Playlist</option>
                                            <option value="recording">Recording</option>
                                        </select>
                                        <div className="absolute right-5 top-5 pointer-events-none text-gray-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Week 1 Lecture Summary"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all shadow-inner"
                                        required
                                    />
                                </div>
                            </div>

                            {formData.type === 'recording' ? (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Upload File</label>
                                    <label className={`relative flex flex-col items-center justify-center gap-4 cursor-pointer bg-gray-50/50 dark:bg-black/40 border-2 border-gray-200 dark:border-white/10 border-dashed rounded-[2rem] p-8 hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-all group ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                                        <div className="w-14 h-14 bg-white dark:bg-white/5 rounded-full flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-all">
                                            <Mic className="w-7 h-7 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                                        </div>
                                        <div className="text-center">
                                            <span className="text-gray-700 dark:text-gray-300 font-black text-sm block mb-1">
                                                {recordingFile ? recordingFile.name : (editingResource ? 'File Uploaded' : 'Click to select file')}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Max 20MB • MP3, MP4, WAV</span>
                                        </div>
                                        <input type="file" accept="audio/*,video/*" onChange={(e) => setRecordingFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" required={!editingResource} />
                                    </label>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Resource Link (URL)</label>
                                    <div className="relative">
                                        <input
                                            type="url"
                                            placeholder={formData.type === 'video' ? 'https://youtube.com/...' : 'https://example.com/file.pdf'}
                                            value={formData.url}
                                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                            className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl pl-14 pr-5 py-4 font-semibold focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all shadow-inner"
                                            required
                                        />
                                        <LinkIcon className="absolute left-5 top-4.5 w-6 h-6 text-gray-400 dark:text-gray-600" />
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4 pt-4">
                                <button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4.5 rounded-2xl shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50" disabled={loading}>
                                    {loading ? <Activity className="w-6 h-6 animate-spin mx-auto" /> : (editingResource ? 'Update Resource' : 'Add Resource')}
                                </button>
                                {editingResource && (
                                    <button type="button" onClick={resetForm} className="px-10 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-bold py-4.5 rounded-2xl transition-all">Cancel</button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>

        {/* List Panel */}
        <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2.5rem] flex flex-col shadow-sm min-h-[600px] relative overflow-hidden">
            {/* Top Indicator */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-sky-500 to-transparent opacity-30"></div>

            <div className="p-8 border-b border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.01] flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl flex items-center justify-center shadow-inner">
                        <FileType className="w-6 h-6 text-sky-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Saved Resources</h3>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{resources.length} units total</p>
                    </div>
                </div>
            </div>

            <div className="p-8 space-y-4 flex-1 overflow-y-auto custom-scrollbar max-h-[850px]">
                {!selectedCourseName ? (
                    <div className="flex flex-col items-center justify-center h-full py-40">
                        <div className="w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner animate-pulse">
                            <BookOpen className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                        </div>
                        <p className="text-sm font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em] text-center">Please select a course first</p>
                    </div>
                ) : resources.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-40 animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <LinkIcon className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                        </div>
                        <p className="text-sm font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">No resources found</p>
                    </div>
                ) : (
                    resources.map(r => (
                        <div key={r.id} className="group relative bg-gray-50/50 dark:bg-black/30 border border-gray-200 dark:border-white/5 rounded-[2rem] p-6 hover:bg-white dark:hover:bg-white/[0.03] hover:border-sky-500/30 transition-all duration-300 shadow-sm hover:shadow-lg">
                             <div className="flex justify-between items-center gap-4">
                                <div className="flex items-center gap-5 min-w-0">
                                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-white/5 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:border-sky-500/30 transition-all duration-300">
                                        {getTypeIcon(r.type)}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-gray-900 dark:text-white font-black tracking-tight truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors text-lg mb-1">{r.title}</h4>
                                        <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                            <span className="bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded border border-gray-200 dark:border-white/10">{r.type}</span>
                                            {r.type !== 'recording' ? (
                                                <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sky-600 hover:text-sky-500 transition-colors">
                                                    <ExternalLink className="w-3.5 h-3.5" /> Open Link
                                                </a>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-emerald-600">
                                                    <Download className="w-3.5 h-3.5" /> Download File
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 shrink-0">
                                    <button onClick={() => startEdit(r)} className="w-11 h-11 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500 hover:text-white transition-all transform hover:scale-105 shadow-sm">
                                        <Edit3 className="w-4.5 h-4.5" />
                                    </button>
                                    <button onClick={() => handleDelete(r.id)} className="w-11 h-11 flex items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-all transform hover:scale-105 shadow-sm">
                                        <Trash2 className="w-4.5 h-4.5" />
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