import React, { useState, useEffect, useCallback } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { Megaphone, Plus, Trash2, Calendar, BookOpen, Loader2 } from 'lucide-react';

const DoctorAnnouncements = ({ courses }) => {
  const { doctorApi } = useDoctorAuth();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });

  const fetchAnnouncements = useCallback(async () => {
    if (!selectedCourseId) return;
    setLoading(true);
    try {
      const res = await doctorApi('get', `/doctor/announcements/${selectedCourseId}`);
      setAnnouncements(res.data);
    } catch (err) {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  }, [selectedCourseId, doctorApi]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) return toast.error('Please select a course');
    if (!newAnnouncement.title || !newAnnouncement.content) return toast.error('Please fill all fields');

    setCreating(true);
    try {
      await doctorApi('post', '/doctor/announcements', {
        courseId: selectedCourseId,
        ...newAnnouncement
      });
      toast.success('Announcement posted successfully');
      setNewAnnouncement({ title: '', content: '' });
      fetchAnnouncements();
    } catch (err) {
      toast.error('Failed to post announcement');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await doctorApi('delete', `/doctor/announcements/${id}`);
      toast.success('Announcement deleted');
      fetchAnnouncements();
    } catch (err) {
      toast.error('Failed to delete announcement');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-amber-500" /> Course Announcements
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-500 mt-1">
            Send notifications and updates to students enrolled in your courses
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl p-6">
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Select Course</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white font-medium focus:border-amber-500/50 focus:outline-none transition-colors"
              >
                <option value="">-- Choose a Course --</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Announcement Title</label>
              <input
                type="text"
                placeholder="e.g., Lecture Cancelled, Assignment Update"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white font-medium focus:border-amber-500/50 focus:outline-none transition-colors"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Announcement Content</label>
            <textarea
              placeholder="Write your message here..."
              rows="4"
              value={newAnnouncement.content}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
              className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white font-medium focus:border-amber-500/50 focus:outline-none transition-colors resize-none"
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl transition-all hover:shadow-lg hover:shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Post Announcement
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" /> Recent Announcements
        </h3>
        {!selectedCourseId ? (
          <div className="bg-gray-50 dark:bg-white/[0.02] border border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-slate-500 font-medium">Select a course to view its announcements</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-gray-50 dark:bg-white/[0.02] border border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-12 text-center">
            <p className="text-gray-500 dark:text-slate-500 font-medium">No announcements found for this course.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl p-5 hover:border-amber-500/30 transition-all group">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white">{ann.title}</h4>
                  <button
                    onClick={() => handleDeleteAnnouncement(ann.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-gray-600 dark:text-slate-400 text-sm mb-4 whitespace-pre-wrap">{ann.content}</p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <Calendar className="w-3 h-3" />
                  {new Date(ann.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAnnouncements;
