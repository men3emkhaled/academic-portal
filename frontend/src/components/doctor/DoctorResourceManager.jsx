import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import { 
  FolderOpen, Plus, Edit3, Trash2, Video, FileText, 
  Mic, PlayCircle, Link as LinkIcon, Download, 
  ExternalLink, Upload, X, Save, Search, Filter, BookOpen, Clock
} from 'lucide-react';

const DoctorResourceManager = ({ courses }) => {
  const { doctorApi } = useDoctorAuth();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [resources, setResources] = useState([]);
  const [editingResource, setEditingResource] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ type: 'video', title: '', url: '' });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [recordingFile, setRecordingFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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
      const res = await doctorApi('get', `/doctor/resources/${selectedCourseId}`);
      setResources(res.data);
    } catch (err) {
      toast.error('Failed to load resources');
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
    if (!selectedCourseId) return toast.error('Please select a course first');
    if (!formData.title.trim()) return toast.error('Title is required');

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
        await doctorApi('put', `/doctor/resources/${editingResource.id}`, payload);
        toast.success('Resource updated');
      } else {
        await doctorApi('post', '/doctor/resources', payload);
        toast.success('Resource added');
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
    if (!window.confirm('Delete this resource?')) return;
    try {
      await doctorApi('delete', `/doctor/resources/${id}`);
      toast.success('Resource deleted');
      fetchResources();
    } catch (err) {
      toast.error('Failed to delete resource');
    }
  };

  const resetForm = () => {
    setEditingResource(null);
    setShowForm(false);
    setFormData({ type: 'video', title: '', url: '' });
    setRecordingFile(null);
  };

  const startEdit = (r) => {
    setEditingResource(r);
    setShowForm(true);
    setFormData({ type: r.type, title: r.title, url: r.url });
    setRecordingFile(null);
  };

  const getTypeConfig = (type) => {
    switch(type) {
      case 'video': return { icon: Video, color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20', label: 'Video' };
      case 'pdf': return { icon: FileText, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', label: 'PDF' };
      case 'recording': return { icon: Mic, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', label: 'Recording' };
      case 'playlist': return { icon: PlayCircle, color: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-400/20', label: 'Playlist' };
      default: return { icon: LinkIcon, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', label: 'Link' };
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

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
            <FolderOpen className="w-8 h-8 text-doctor-primary" />
            Course Materials
          </h2>
          <p className="text-doctor-text-muted font-medium">Upload and organize learning resources for your students.</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-doctor-text-muted group-focus-within:text-doctor-primary transition-colors" />
              <input 
                type="text"
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-gray-200 dark:border-white/10 rounded-2xl py-3.5 pl-11 pr-6 text-gray-900 text-sm focus:outline-none focus:border-doctor-primary/40 transition-all w-64"
              />
           </div>
           {selectedCourseId && (
              <button 
                onClick={() => setShowForm(true)}
                className="bg-doctor-primary hover:bg-doctor-primary/90 text-white font-black px-6 py-3.5 rounded-2xl shadow-lg shadow-doctor-primary/20 flex items-center gap-3 transition-all active:scale-95"
              >
                <Plus className="w-5 h-5" />
                <span>Add New</span>
              </button>
           )}
        </div>
      </div>

      {/* Course Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {courses.map(course => (
              <button
                key={course.id}
                onClick={() => setSelectedCourseId(course.id)}
                className={`relative p-5 rounded-[1.8rem] border transition-all text-left group overflow-hidden ${
                    selectedCourseId === course.id 
                    ? 'bg-doctor-primary/10 border-doctor-primary shadow-xl shadow-doctor-primary/10' 
                    : 'bg-doctor-card border-white/5 hover:border-white/20'
                }`}
              >
                  {/* Decoration */}
                  <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-3xl transition-opacity ${selectedCourseId === course.id ? 'bg-doctor-primary/20 opacity-100' : 'bg-white/5 opacity-0 group-hover:opacity-100'}`}></div>
                  
                  <div className="flex items-center gap-4 relative z-10">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${selectedCourseId === course.id ? 'bg-doctor-primary text-white' : 'bg-white/5 text-doctor-text-muted group-hover:scale-110'}`}>
                          <BookOpen className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                          <h4 className={`font-bold truncate ${selectedCourseId === course.id ? 'text-white' : 'text-doctor-text-muted group-hover:text-doctor-text'}`}>{course.name}</h4>
                          <p className="text-[10px] font-black uppercase tracking-widest text-doctor-text-muted opacity-60 mt-1">{course.code}</p>
                      </div>
                  </div>
              </button>
          ))}
      </div>

      {/* Modal for Adding/Editing */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="bg-doctor-card border border-white/10 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-slideUp">
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <h3 className="text-xl font-black text-doctor-text">{editingResource ? 'Edit Resource' : 'Upload New Resource'}</h3>
                    <button onClick={resetForm} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-doctor-text-muted transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-doctor-text-muted uppercase tracking-widest ml-1">Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => { setFormData({ ...formData, type: e.target.value }); setRecordingFile(null); }}
                                    className="w-full bg-doctor-text/5 border border-doctor-text/5 rounded-2xl py-4 px-6 text-doctor-text focus:outline-none focus:border-doctor-primary/50 transition-all font-medium appearance-none"
                                >
                                    <option value="video" className="bg-doctor-sidebar">📹 Video</option>
                                    <option value="pdf" className="bg-doctor-sidebar">📄 PDF Document</option>
                                    <option value="recording" className="bg-doctor-sidebar">🎙️ Audio Recording</option>
                                    <option value="playlist" className="bg-doctor-sidebar">▶️ Playlist</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-doctor-text-muted uppercase tracking-widest ml-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Chapter 1 Intro"
                                    className="w-full bg-doctor-text/5 border border-doctor-text/5 rounded-2xl py-4 px-6 text-doctor-text focus:outline-none focus:border-doctor-primary/50 transition-all font-medium"
                                />
                            </div>
                        </div>

                        {formData.type === 'recording' ? (
                            <div className="space-y-2">
                                <label className="text-xs font-black text-doctor-text-muted uppercase tracking-widest ml-1">Audio File</label>
                                <div className="relative group">
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
                                        className="w-full bg-white/5 border border-dashed border-white/20 rounded-2xl py-8 px-6 flex flex-col items-center justify-center cursor-pointer hover:border-doctor-primary/50 hover:bg-doctor-primary/5 transition-all group"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-doctor-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <Upload className="w-6 h-6 text-doctor-primary" />
                                        </div>
                                        <span className="text-sm font-bold text-doctor-text mb-1">
                                            {recordingFile ? recordingFile.name : 'Select or drop audio file'}
                                        </span>
                                        <span className="text-[10px] font-black text-doctor-text-muted uppercase">MP3, WAV, or AAC</span>
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-xs font-black text-doctor-text-muted uppercase tracking-widest ml-1">Resource URL</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-doctor-text-muted" />
                                    <input
                                        type="url"
                                        required
                                        value={formData.url}
                                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                        placeholder="https://youtube.com/..."
                                        className="w-full bg-doctor-text/5 border border-doctor-text/5 rounded-2xl py-4 pl-14 pr-6 text-doctor-text focus:outline-none focus:border-doctor-primary/50 transition-all font-medium"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-doctor-primary hover:bg-doctor-primary/90 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-doctor-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                <span>{editingResource ? 'Update Resource' : 'Publish Resource'}</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="min-h-[400px]">
          {!selectedCourseId ? (
              <div className="bg-doctor-card border border-white/5 rounded-[2.5rem] p-20 text-center animate-fadeIn">
                  <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                      <FolderOpen className="w-10 h-10 text-white/20" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">Select a Course</h3>
                  <p className="text-doctor-text-muted max-w-xs mx-auto">Choose a course above to manage its learning materials and resources.</p>
              </div>
          ) : fetchLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1,2,3,4].map(i => (
                      <div key={i} className="bg-doctor-card border border-white/5 rounded-[1.8rem] p-6 animate-pulse">
                          <div className="flex items-center gap-4 mb-4">
                              <div className="w-12 h-12 rounded-2xl bg-white/5"></div>
                              <div className="flex-1 space-y-2">
                                  <div className="h-4 bg-white/5 rounded w-3/4"></div>
                                  <div className="h-3 bg-white/5 rounded w-1/4"></div>
                              </div>
                          </div>
                          <div className="h-10 bg-white/5 rounded-xl w-full"></div>
                      </div>
                  ))}
              </div>
          ) : resources.length === 0 ? (
              <div className="bg-doctor-card border border-white/5 rounded-[2.5rem] p-20 text-center animate-fadeIn">
                  <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                      <Upload className="w-10 h-10 text-white/20" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">No Materials Yet</h3>
                  <p className="text-doctor-text-muted mb-8">Start by uploading your first lecture material or helpful link.</p>
                  <button 
                    onClick={() => setShowForm(true)}
                    className="bg-white/5 hover:bg-white/10 text-white font-bold px-8 py-4 rounded-2xl transition-all inline-flex items-center gap-2"
                  >
                      <Plus className="w-5 h-5" />
                      Add Material
                  </button>
              </div>
          ) : (
              <div className="space-y-12">
                  {Object.entries(groupedResources).map(([type, items]) => {
                      const config = getTypeConfig(type);
                      const Icon = config.icon;
                      return (
                          <section key={type} className="animate-fadeIn">
                              <div className="flex items-center gap-4 mb-6 ml-2">
                                  <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
                                      <Icon className={`w-5 h-5 ${config.color}`} />
                                  </div>
                                  <div>
                                      <h3 className="text-lg font-black text-white">{config.label}s</h3>
                                      <p className="text-[10px] font-black text-doctor-text-muted uppercase tracking-widest">{items.length} files available</p>
                                  </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {items.map(resource => (
                                      <div 
                                          key={resource.id}
                                          className="bg-doctor-card border border-white/5 p-6 rounded-[1.8rem] hover:border-doctor-primary/30 transition-all group relative overflow-hidden"
                                      >
                                          <div className={`absolute top-0 left-0 bottom-0 w-1 ${config.bg.replace('/10', '')} opacity-40`}></div>
                                          
                                          <div className="flex items-start justify-between gap-4 mb-6">
                                              <div className="min-w-0">
                                                  <h4 className="text-white font-bold text-lg leading-tight truncate mb-1 group-hover:text-doctor-primary transition-colors">{resource.title}</h4>
                                                  <p className="text-xs text-doctor-text-muted font-medium flex items-center gap-2">
                                                      <Clock className="w-3 h-3" />
                                                      {new Date(resource.created_at).toLocaleDateString()}
                                                  </p>
                                              </div>
                                              
                                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                  <button onClick={() => startEdit(resource)} className="p-2 rounded-xl hover:bg-white/10 text-amber-400">
                                                      <Edit3 className="w-4 h-4" />
                                                  </button>
                                                  <button onClick={() => handleDelete(resource.id)} className="p-2 rounded-xl hover:bg-red-500/10 text-red-400">
                                                      <Trash2 className="w-4 h-4" />
                                                  </button>
                                              </div>
                                          </div>

                                          <div className="flex items-center gap-3 mt-auto">
                                              <a 
                                                href={resource.url} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all ${config.bg} ${config.color} hover:brightness-125 active:scale-95`}
                                              >
                                                  {resource.type === 'recording' ? <Download className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                                                  <span>{resource.type === 'recording' ? 'Download Recording' : 'View Material'}</span>
                                              </a>
                                              <button 
                                                onClick={() => {
                                                    navigator.clipboard.writeText(resource.url);
                                                    toast.success('Link copied!');
                                                }}
                                                className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-doctor-text-muted hover:text-white hover:bg-white/10 transition-all active:scale-95"
                                              >
                                                  <LinkIcon className="w-5 h-5" />
                                              </button>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </section>
                      );
                  })}
              </div>
          )}
      </div>

      <style>{`
        .hidden-scrollbar::-webkit-scrollbar { display: none; }
        .hidden-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default DoctorResourceManager;
