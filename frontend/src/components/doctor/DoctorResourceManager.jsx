import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import { supabase } from '../../services/supabase';
import toast from 'react-hot-toast';
import { FolderOpen, Plus, Edit3, Trash2, Video, FileText, Mic, PlayCircle, Link as LinkIcon, Download, ExternalLink, Activity } from 'lucide-react';

const DoctorResourceManager = ({ courses }) => {
  const { doctorApi } = useDoctorAuth();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [resources, setResources] = useState([]);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({ type: 'video', title: '', url: '' });
  const [loading, setLoading] = useState(false);
  const [recordingFile, setRecordingFile] = useState(null);

  useEffect(() => {
    if (selectedCourseId) {
      fetchResources();
    } else {
      setResources([]);
    }
  }, [selectedCourseId]);

  const fetchResources = async () => {
    try {
      const res = await doctorApi('get', `/doctor/resources/${selectedCourseId}`);
      setResources(res.data);
    } catch (err) {
      toast.error('Failed to load resources');
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
        toast.success('Resource updated successfully');
      } else {
        await doctorApi('post', '/doctor/resources', payload);
        toast.success('Resource added successfully');
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
    setFormData({ type: 'video', title: '', url: '' });
    setRecordingFile(null);
  };

  const startEdit = (r) => {
    setEditingResource(r);
    setFormData({ type: r.type, title: r.title, url: r.url });
    setRecordingFile(null);
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'video': return <Video className="w-5 h-5 text-red-500" />;
      case 'pdf': return <FileText className="w-5 h-5 text-orange-500" />;
      case 'recording': return <Mic className="w-5 h-5 text-emerald-500" />;
      case 'playlist': return <PlayCircle className="w-5 h-5 text-purple-500" />;
      default: return <LinkIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-[2rem]">
          <h3 className="text-xl font-black mb-4">Select Course</h3>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-4 text-gray-900 dark:text-white"
          >
            <option value="">-- Choose a course --</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {selectedCourseId && (
          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-[2rem]">
            <h3 className="text-xl font-black mb-6">{editingResource ? 'Edit Resource' : 'Add New Resource'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => {
                      setFormData({ ...formData, type: e.target.value });
                      setRecordingFile(null);
                    }}
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3"
                  >
                    <option value="video">Video Link</option>
                    <option value="pdf">PDF Document</option>
                    <option value="recording">Audio Recording</option>
                    <option value="playlist">Playlist</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3"
                  />
                </div>
              </div>

              {formData.type === 'recording' ? (
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Audio File</label>
                  <input
                    type="file"
                    accept="audio/*,video/*"
                    onChange={(e) => setRecordingFile(e.target.files[0])}
                    className="w-full text-sm"
                    required={!editingResource}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">URL</label>
                  <input
                    type="url"
                    required
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3"
                  />
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-violet-500 hover:bg-violet-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                >
                  {loading ? 'Processing...' : (editingResource ? 'Update' : 'Save')}
                </button>
                {editingResource && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-900 dark:text-white font-bold py-3 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[2rem] p-6 h-[600px] overflow-y-auto">
        <h3 className="text-xl font-black mb-6 flex items-center gap-2">
          <FolderOpen className="text-violet-500" /> Uploaded Resources
        </h3>
        
        {!selectedCourseId ? (
          <p className="text-gray-500 text-center mt-20">Select a course to view resources</p>
        ) : resources.length === 0 ? (
          <p className="text-gray-500 text-center mt-20">No resources found for this course</p>
        ) : (
          <div className="space-y-4">
            {resources.map(r => (
              <div key={r.id} className="bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
                    {getTypeIcon(r.type)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{r.title}</h4>
                    <a href={r.url} target="_blank" rel="noreferrer" className="text-xs text-violet-500 hover:underline flex items-center gap-1 mt-1">
                      {r.type === 'recording' ? <Download className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
                      Open Link
                    </a>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(r)} className="p-2 text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-500/10 rounded-lg">
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(r.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorResourceManager;
