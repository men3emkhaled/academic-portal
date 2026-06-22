import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Calendar, MapPin, Tag, Plus, Trash2, Edit3, Search, X } from 'lucide-react';

const EventsManager = () => {
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    category: 'Activity',
    is_published: true
  });

  const categories = ['All', 'Activity', 'Workshop', 'Social', 'Academic', 'Sports', 'Ceremony'];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events/all');
      setEvents(response.data);
    } catch (error) {
      toast.error(t('admin.messages.load_events_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await api.put(`/events/${editingEvent.id}`, formData);
      } else {
        await api.post('/events', formData);
      }
      toast.success(t('common.success'));
      fetchEvents();
      closeModal();
    } catch (error) {
      toast.error(t('admin.messages.operation_failed'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.events.delete_confirm'))) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success(t('common.success'));
      fetchEvents();
    } catch (error) {
      toast.error(t('admin.messages.delete_event_failed'));
    }
  };

  const openModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      const date = new Date(event.event_date);
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setFormData({
        title: event.title,
        description: event.description || '',
        event_date: localDate,
        location: event.location || '',
        category: event.category || 'Activity',
        is_published: event.is_published
      });
    } else {
      setEditingEvent(null);
      setFormData({ title: '', description: '', event_date: '', location: '', category: 'Activity', is_published: true });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
  };

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         e.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || e.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-10 max-w-[1200px] mx-auto w-full px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.events.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('admin.events.event_count', { count: events.length })}</p>
        </div>
        <button onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" />{t('admin.events.add_button')}
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('admin.events.search_placeholder')}
            className="w-full bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#059669]/30 outline-none" />
        </div>
      </div>

      {/* Category Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? 'bg-[#059669] text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}>
            {cat === 'All' ? t('admin.events.categories.all') : t(`admin.events.categories.${cat.toLowerCase()}`)}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 text-sm text-gray-400">{t('admin.events.scanning')}</div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
          <p className="font-medium">{t('admin.events.no_events')}</p>
          <p className="text-xs mt-1">{t('admin.events.no_events_hint')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredEvents.map((event) => {
            const date = new Date(event.event_date);
            return (
              <div key={event.id} className="bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-[#059669]/30 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    event.is_published
                      ? 'bg-[#059669]/10 text-[#059669]'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                  }`}>
                    {event.is_published ? t('admin.events.published') : t('admin.events.draft')}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => openModal(event)} className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(event.id)} className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{event.title}</h3>
                <p className="text-xs text-gray-400 line-clamp-2 mb-4">{event.description || t('admin.events.no_desc')}</p>
                <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#059669]" />
                    {date.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-GB', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })} — {date.toLocaleTimeString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#059669]" />
                    {event.location || t('admin.events.online_protocol')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-[#059669]" />
                    {t(`admin.events.categories.${event.category?.toLowerCase() || 'activity'}`)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={closeModal} className="absolute inset-0 bg-black/40" />
          <div className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-gray-700 rounded-xl w-full max-w-lg relative z-10 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#059669]/10 rounded-lg flex items-center justify-center text-[#059669]">
                  {editingEvent ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {editingEvent ? t('admin.events.modals.edit_event') : t('admin.events.modals.new_event')}
                </h3>
              </div>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <form id="event-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">{t('admin.events.modals.event_title')} *</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">{t('admin.events.modals.event_date')} *</label>
                  <input type="datetime-local" required value={formData.event_date} onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">{t('admin.events.modals.location')}</label>
                  <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">{t('admin.events.modals.category')}</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none">
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{t(`admin.events.categories.${cat.toLowerCase()}`)}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">{t('admin.events.modals.publish')}</label>
                  <label className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 cursor-pointer">
                    <input type="checkbox" checked={formData.is_published} onChange={() => setFormData({...formData, is_published: !formData.is_published})}
                      className="rounded text-[#059669] focus:ring-[#059669]" />
                    <span className="text-sm text-gray-900 dark:text-white">{t('admin.events.modals.publish_hint')}</span>
                  </label>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">{t('admin.events.modals.description')}</label>
                <textarea rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none resize-none" />
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="submit" className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors">
                  {editingEvent ? t('common.save') : t('admin.events.add_button')}
                </button>
                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors">
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsManager;
