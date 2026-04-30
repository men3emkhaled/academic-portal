import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import { FolderOpen, Plus, Edit3, Trash2, Video, FileText, Mic, PlayCircle, Link as LinkIcon, Download, ExternalLink, Upload } from 'lucide-react';

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
      case 'video': return { icon: Video, color: 'red', label: 'Video' };
      case 'pdf': return { icon: FileText, color: 'orange', label: 'PDF' };
      case 'recording': return { icon: Mic, color: 'emerald', label: 'Recording' };
      case 'playlist': return { icon: PlayCircle, color: 'purple', label: 'Playlist' };
      default: return { icon: LinkIcon, color: 'blue', label: 'Link' };
    }
  };

  // Group resources by type
  const groupedResources = resources.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-blue-500" /> Course Materials
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-500 mt-1">Upload videos, PDFs, recordings, and links</p>
        </div>
      </div>

      {/* Course Selector + Add Button */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="flex-1 bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-xl p-3.5 text-gray-900 dark:text-white font-medium focus:border-blue-500/50 focus:outline-none transition-colors"
        >
          <option value="">-- Select a Course --</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {selectedCourseId && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-5 rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 text-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Resource
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && selectedCourseId && (
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 p-6 rounded-2xl animate-fadeIn">
          <h3 className="text-lg font-black mb-5 flex items-center gap-2 text-gray-900 dark:text-white">
            {editingResource ? <Edit3 className="text-blue-500 w-5 h-5" /> : <Upload className="text-blue-500 w-5 h-5" />}
            {editingResource ? 'Edit Resource' : 'Add New Resource'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-500 mb-2 uppercase tracking-wider">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => { setFormData({ ...formData, type: e.target.value }); setRecordingFile(null); }}
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white focus:border-blue-500/50 focus:outline-none transition-colors"
                >
                  <option value="video">📹 Video Link</option>
                  <option value="pdf">📄 PDF Document</option>
                  <option value="recording">🎙️ Audio Recording</option>
                  <option value="playlist">▶️ Playlist</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-500 mb-2 uppercase tracking-wider">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Lecture 5 - Sorting Algorithms"
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white focus:border-blue-500/50 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {formData.type === 'recording' ? (
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-500 mb-2 uppercase tracking-wider">Audio File</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="audio/*,video/*"
                    onChange={(e) => setRecordingFile(e.target.files[0])}
                    className="w-full text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer text-gray-500"
                    required={!editingResource}
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-500 mb-2 uppercase tracking-wider">URL *</label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white focus:border-blue-500/50 focus:outline-none transition-colors"
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98]"
              >
                {loading ? 'Uploading...' : (editingResource ? 'Update' : 'Save Resource')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Resources List */}
      {!selectedCourseId ? (
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl p-12 text-center">
          <FolderOpen className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-slate-500 font-medium">Select a course to view materials</p>
        </div>
      ) : fetchLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-white/10 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl p-12 text-center">
          <Upload className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-slate-500 font-medium">No materials uploaded yet</p>
          <p className="text-xs text-gray-400 dark:text-slate-600 mt-1">Click "Add Resource" to get started</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedResources).map(([type, items]) => {
            const config = getTypeConfig(type);
            const Icon = config.icon;
            return (
              <div key={type}>
                <h4 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                  <Icon className={`w-4 h-4 text-${config.color}-500`} />
                  {config.label}s ({items.length})
                </h4>
                <div className="space-y-2">
                  {items.map(r => (
                    <div
                      key={r.id}
                      className="group bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-xl p-4 flex items-center justify-between hover:border-gray-300 dark:hover:border-white/10 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 bg-${config.color}-500/10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-4 h-4 text-${config.color}-500`} />
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{r.title}</h5>
                          <a href={r.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 mt-0.5 transition-colors">
                            {r.type === 'recording' ? <Download className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
                            Open
                          </a>
                        </div>
                      </div>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(r)} className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors" title="Edit">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(r.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DoctorResourceManager;
