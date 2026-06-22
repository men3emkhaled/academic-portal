import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTAAuth } from '../../context/TAAuthContext';
import toast from 'react-hot-toast';
import { Megaphone, Plus, Trash2, Calendar, BookOpen, Loader2 } from 'lucide-react';

const TAAnnouncements = ({ courses }) => {
  const { t } = useTranslation();
  const { taApi } = useTAAuth();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });

  const fetchAnnouncements = useCallback(async () => {
    if (!selectedCourseId) return;
    setLoading(true);
    try {
      const res = await taApi('get', `/ta/announcements/${selectedCourseId}`);
      setAnnouncements(res.data);
    } catch (err) {
      toast.error(t('doctor.announcements.failed_load'));
    } finally {
      setLoading(false);
    }
  }, [selectedCourseId, taApi]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) return toast.error(t('doctor.announcements.select_course_error'));
    if (!newAnnouncement.title || !newAnnouncement.content) return toast.error(t('doctor.announcements.fill_fields'));

    setCreating(true);
    try {
      await taApi('post', '/ta/announcements', {
        courseId: selectedCourseId,
        ...newAnnouncement
      });
      toast.success(t('doctor.announcements.posted_success'));
      setNewAnnouncement({ title: '', content: '' });
      fetchAnnouncements();
    } catch (err) {
      toast.error(t('doctor.announcements.failed_post'));
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm(t('doctor.announcements.delete_confirm'))) return;
    try {
      await taApi('delete', `/ta/announcements/${id}`);
      toast.success(t('doctor.announcements.deleted_success'));
      fetchAnnouncements();
    } catch (err) {
      toast.error(t('doctor.announcements.failed_delete'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-500" /> {t('doctor.announcements.title')}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {t('doctor.announcements.subtitle')}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-xl p-5">
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500">{t('doctor.announcements.select_course')}</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white text-sm outline-none"
              >
                <option value="">{t('doctor.announcements.choose_course')}</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500">{t('doctor.announcements.announcement_title')}</label>
              <input
                type="text"
                placeholder={t('doctor.announcements.title_placeholder')}
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white text-sm outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500">{t('doctor.announcements.content_label')}</label>
            <textarea
              placeholder={t('doctor.announcements.content_placeholder')}
              rows="4"
              value={newAnnouncement.content}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
              className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white text-sm outline-none resize-none"
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {t('doctor.announcements.post_announcement')}
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" /> {t('doctor.announcements.recent_announcements')}
        </h3>
        {!selectedCourseId ? (
          <div className="bg-gray-50 dark:bg-white/[0.02] border border-dashed border-gray-200 dark:border-white/10 rounded-xl p-10 text-center">
            <BookOpen className="w-10 h-10 text-gray-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">{t('doctor.announcements.select_course_view')}</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-gray-50 dark:bg-white/[0.02] border border-dashed border-gray-200 dark:border-white/10 rounded-xl p-10 text-center">
            <p className="text-gray-500 text-sm">{t('doctor.announcements.no_announcements')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {announcements.map((ann) => (
              <div key={ann.id} className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-xl p-4 hover:border-amber-500/30 transition-all group">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{ann.title}</h4>
                  <button
                    onClick={() => handleDeleteAnnouncement(ann.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-3 whitespace-pre-wrap">{ann.content}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
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

export default TAAnnouncements;
