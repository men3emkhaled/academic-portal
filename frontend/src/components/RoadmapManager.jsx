import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

// دالة لتحويل رابط يوتيوب العادي إلى رابط embed
const convertToEmbedUrl = (url) => {
  if (!url) return '';
  if (url.includes('/embed/')) return url;
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:[&?]|$)/);
  if (match) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return url;
};

const RoadmapManager = () => {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', video_url: '', order_index: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await api.get('/roadmap');
      setItems(res.data);
    } catch (err) {
      toast.error('Failed to load roadmap');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Title and description are required');
      return;
    }
    setLoading(true);
    try {
      // تحويل رابط اليوتيوب قبل الحفظ
      const video_url = convertToEmbedUrl(form.video_url);
      const payload = { ...form, video_url };
      if (editing) {
        await api.put(`/roadmap/${editing.id}`, payload);
        toast.success('Item updated');
      } else {
        await api.post('/roadmap', payload);
        toast.success('Item added');
      }
      resetForm();
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving item');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this roadmap item?')) return;
    try {
      await api.delete(`/roadmap/${id}`);
      toast.success('Deleted');
      fetchItems();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const startEdit = (item) => {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description,
      video_url: item.video_url || '',
      order_index: item.order_index,
    });
  };

  const resetForm = () => {
    setEditing(null);
    setForm({ title: '', description: '', video_url: '', order_index: 0 });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-neon mb-4">Manage Roadmap Items</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input
          type="text"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white"
          required
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white"
          rows="3"
          required
        />
        <input
          type="url"
          placeholder="YouTube URL (any format, will be converted automatically)"
          value={form.video_url}
          onChange={(e) => setForm({ ...form, video_url: e.target.value })}
          className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white"
        />
        <input
          type="number"
          placeholder="Order (lower = higher priority)"
          value={form.order_index}
          onChange={(e) => setForm({ ...form, order_index: parseInt(e.target.value) || 0 })}
          className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white"
        />
        <div className="flex gap-2">
          <button type="submit" className="neon-button" disabled={loading}>
            {editing ? 'Update' : 'Add'} Item
          </button>
          {editing && (
            <button type="button" onClick={resetForm} className="px-4 py-2 border border-white/20 rounded-xl hover:bg-white/5">
              Cancel
            </button>
          )}
        </div>
      </form>
      <div className="space-y-2">
        {items.length === 0 && <p className="text-gray-400">No roadmap items yet. Add one above.</p>}
        {items.map((item) => (
          <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/5 p-3 rounded-xl gap-2">
            <div className="flex-1">
              <h3 className="font-bold text-neon">{item.title}</h3>
              <p className="text-sm text-gray-400 line-clamp-1">{item.description}</p>
              <p className="text-xs text-gray-500">Order: {item.order_index}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(item)} className="text-yellow-400 hover:text-yellow-300">Edit</button>
              <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-300">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoadmapManager;