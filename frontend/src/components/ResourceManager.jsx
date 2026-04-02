import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

// دالة تحويل رابط يوتيوب إلى صيغة embed
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
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [resources, setResources] = useState([]);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({ type: 'video', title: '', url: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) fetchResources();
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data);
    } catch (err) {
      toast.error('Failed to load courses');
    }
  };

  const fetchResources = async () => {
    try {
      const res = await api.get(`/resources/course/${selectedCourse}`);
      setResources(res.data);
    } catch (err) {
      toast.error('Failed to load resources');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.url.trim()) {
      toast.error('Title and URL are required');
      return;
    }
    setLoading(true);
    try {
      let finalUrl = formData.url;
      // إذا كان النوع فيديو، حوّله إلى embed
      if (formData.type === 'video') {
        finalUrl = convertToEmbedUrl(formData.url);
      }
      const payload = { ...formData, url: finalUrl, courseId: selectedCourse };
      if (editingResource) {
        await api.put(`/resources/${editingResource.id}`, payload);
        toast.success('Resource updated');
      } else {
        await api.post('/resources', payload);
        toast.success('Resource added');
      }
      resetForm();
      fetchResources();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving resource');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      await api.delete(`/resources/${id}`);
      toast.success('Deleted');
      fetchResources();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const startEdit = (resource) => {
    setEditingResource(resource);
    setFormData({
      type: resource.type,
      title: resource.title,
      url: resource.url,
    });
  };

  const resetForm = () => {
    setEditingResource(null);
    setFormData({ type: 'video', title: '', url: '' });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-neon mb-4">Manage Resources</h2>
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Select Course</label>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white"
        >
          <option value="">-- Choose a course --</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.name} (Semester {c.semester})</option>
          ))}
        </select>
      </div>

      {selectedCourse && (
        <>
          <form onSubmit={handleSubmit} className="space-y-4 mb-8 p-4 bg-dark/30 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="bg-dark border border-white/20 rounded-xl px-4 py-2 text-white"
              >
                <option value="video">🎬 Video</option>
                <option value="pdf">📄 PDF</option>
                <option value="summary">📝 Summary</option>
              </select>
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-dark border border-white/20 rounded-xl px-4 py-2 text-white"
                required
              />
              <input
                type="url"
                placeholder={formData.type === 'video' ? 'YouTube URL (any format)' : 'File URL'}
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="md:col-span-2 bg-dark border border-white/20 rounded-xl px-4 py-2 text-white"
                required
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="neon-button" disabled={loading}>
                {editingResource ? 'Update' : 'Add'} Resource
              </button>
              {editingResource && (
                <button type="button" onClick={resetForm} className="px-4 py-2 border border-white/20 rounded-xl">
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Existing Resources</h3>
            {resources.length === 0 && <p className="text-gray-400">No resources yet.</p>}
            <ul className="space-y-2">
              {resources.map(r => (
                <li key={r.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/5 p-3 rounded-xl gap-2">
                  <div>
                    <span className="font-bold text-neon">{r.title}</span>
                    <span className="text-sm text-gray-400 ml-2">({r.type})</span>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 ml-2 text-sm">🔗</a>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(r)} className="text-yellow-400">Edit</button>
                    <button onClick={() => handleDelete(r.id)} className="text-red-400">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default ResourceManager;