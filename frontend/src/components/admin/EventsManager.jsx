import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, MapPin, Tag, Plus, Trash2, Edit3, 
  Search, Clock, LayoutGrid, List as ListIcon, 
  ChevronRight, X, AlertCircle, Save, Info,
  CheckCircle2, Sparkles, Activity, Image as ImageIcon,
  MoreVertical, Filter, Globe, Users, Bell, Zap, Box
} from 'lucide-react';

const EventsManager = () => {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
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
        toast.success(t('common.success'));
      } else {
        await api.post('/events', formData);
        toast.success(t('common.success'));
      }
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
      setFormData({
        title: '',
        description: '',
        event_date: '',
        location: '',
        category: 'Activity',
        is_published: true
      });
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleString('en-US', { month: 'short' }),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      full: date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    };
  };

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10 animate-in fade-in duration-700 pb-10 px-4 sm:px-0 relative z-10">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] inset-inline-end-[-5%] w-[50vw] h-[50vw] bg-rose-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] inset-inline-start-[-5%] w-[40vw] h-[40vw] bg-[#8b5cf6]/3 blur-[100px] rounded-full"></div>
      </div>

      {/* Header Bento Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 relative z-10">
        <div className="lg:col-span-2 flex items-center gap-4 sm:gap-6 bg-white/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-rose-500/10 dark:bg-rose-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center border border-rose-500/20 shadow-inner shrink-0 group transition-transform duration-500 hover:scale-110">
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {t('admin.events.title')}
            </h2>
            <p className="text-gray-500 dark:text-slate-500 text-[10px] sm:text-sm font-bold mt-1 uppercase tracking-widest">{t('admin.events.description')}</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-rose-600 to-rose-800 text-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-lg shadow-rose-600/20 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-inline-end-0 top-0 w-32 h-32 bg-white/10 hidden rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-black/10 px-3 py-1 rounded-full">{t('admin.events.stream_status')}</span>
          </div>
          <div className="mt-4 relative z-10">
            <p className="text-4xl sm:text-5xl font-black tracking-tighter">{events.length}</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">{t('admin.events.total_count', { count: events.length })}</p>
          </div>
        </div>
      </div>

      {/* Controls: Search, Filter, Add */}
      <div className="bg-white/50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-[2rem] sm:rounded-[3rem] p-5 sm:p-8 shadow-sm space-y-5 sm:space-y-8 relative z-20">
        <div className="flex flex-col sm:flex-row justify-between items-stretch gap-4">
            <div className="relative flex-1 group">
                <Search className="absolute inset-inline-start-5 sm:inset-inline-start-6 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                <input 
                    type="text"
                    placeholder={t('admin.events.search_placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-[1.5rem] sm:rounded-[2rem] ps-12 sm:ps-16 pe-6 sm:pe-8 py-4 sm:py-5 text-gray-900 dark:text-white font-black focus:ring-4 focus:ring-rose-500/10 outline-none transition-all shadow-inner uppercase tracking-widest text-[11px]"
                />
            </div>
            
            <button 
                onClick={() => openModal()}
                className="flex items-center justify-center gap-3 bg-rose-600 hover:bg-rose-700 text-white font-black py-4 sm:py-4.5 px-8 sm:px-10 rounded-[1.5rem] sm:rounded-[2rem] shadow-xl shadow-rose-600/20 hover:scale-[1.02] active:scale-95 transition-all whitespace-nowrap group/add"
            >
                <Plus className="w-5 h-5 group-hover/add:rotate-180 transition-transform duration-500" /> 
                <span className="uppercase tracking-widest text-xs">{t('admin.events.add_button')}</span>
            </button>
        </div>

        {/* Categories Chips - Scrollable */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-1 -mx-5 px-5 sm:mx-0 sm:px-0">
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 shrink-0">
                <Filter className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
                <span className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('admin.events.protocol')}</span>
            </div>
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest whitespace-nowrap border transition-all duration-500 shrink-0 ${
                    activeCategory === cat 
                    ? 'bg-rose-600 text-white border-rose-500 shadow-xl shadow-rose-500/20' 
                    : 'bg-white/50 dark:bg-white/[0.02] text-gray-500 border-gray-100 dark:border-white/5 hover:border-rose-500/30 hover:text-rose-600'
                    }`}
                >
                    {cat === 'All' ? t('admin.events.categories.all') : t(`admin.events.categories.${cat.toLowerCase()}`)}
                </button>
            ))}
        </div>
      </div>

      {/* Events Grid Layout */}
      <>
      {loading ? (
        <div 
            key="loading"
            
            
            
            className="flex flex-col items-center justify-center py-48 opacity-50"
        >
           <Activity className="w-16 h-16 text-rose-500 animate-spin mb-8" />
           <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500">{t('admin.events.scanning')}</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div 
            key="empty"
            
            
            className="bg-white/50 dark:bg-white/[0.01] border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[3rem] py-48 text-center flex flex-col items-center group transition-[color,background-color,border-color,transform,opacity] duration-500 shadow-sm"
        >
            <div className="w-24 h-24 bg-rose-500/5 dark:bg-rose-500/10 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <Sparkles className="w-12 h-12 text-rose-400/30" />
            </div>
            <h4 className="text-xl font-black uppercase tracking-[0.3em] text-gray-900 dark:text-white">{t('admin.events.no_events')}</h4>
            <p className="text-[10px] font-black mt-4 uppercase tracking-widest text-gray-400">{t('admin.events.no_events_hint')}</p>
        </div>
      ) : (
        <div 
            key="grid"
            
            
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
        >
          {filteredEvents.map((event, idx) => {
            const dateInfo = formatDate(event.event_date);
            return (
              <div 
                key={event.id} 
                
                
                
                className="group relative bg-white dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-[3rem] overflow-hidden transition-[color,background-color,border-color,transform,opacity] duration-500 hover:border-rose-500/30 hover:shadow-2xl hover:shadow-rose-500/10"
              >
                {/* Visual Status Indicator */}
                <div className={`absolute top-0 inset-inline-start-0 inset-inline-end-0 h-1.5 transition-[color,background-color,border-color,transform,opacity] duration-700 ${event.is_published ? 'bg-primary shadow-[0_0_15px_rgba(46,204,113,0.5)]' : 'bg-gray-300 dark:bg-slate-800'}`}></div>
                
                <div className="p-10">
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="bg-rose-500/5 dark:bg-rose-500/10 p-3 rounded-2xl border border-rose-500/10">
                        <Tag className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      </div>
                      <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">{t(`admin.events.categories.${event.category?.toLowerCase() || 'activity'}`)}</span>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border transition-[color,background-color,border-color,transform,opacity] duration-500 ${
                         event.is_published ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-gray-100 dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-400'
                    }`}>
                         {event.is_published ? t('admin.events.published') : t('admin.events.draft')}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight mb-8 group-hover:text-rose-600 transition-colors min-h-[4rem] line-clamp-2 uppercase tracking-tight relative z-10">{event.title}</h3>

                  <div className="space-y-4 mb-8 relative z-10">
                    <div className="flex items-center gap-5 p-5 rounded-[1.5rem] bg-gray-50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 group/info hover:bg-white dark:hover:bg-white/5 transition-[color,background-color,border-color,transform,opacity] duration-500 shadow-inner">
                       <div className="w-14 h-14 rounded-2xl bg-white dark:bg-black border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-rose-600 dark:text-rose-400 shadow-sm group-hover/info:scale-110 transition-transform duration-700">
                          <span className="text-[10px] font-black uppercase">{dateInfo.month}</span>
                          <span className="text-2xl font-black mt-0.5">{dateInfo.day}</span>
                       </div>
                       <div className="min-w-0">
                          <p className="text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 italic">{t('admin.events.chronos_alignment')}</p>
                          <p className="text-xs font-black text-gray-700 dark:text-gray-300 truncate tracking-tight">{dateInfo.time} • {dateInfo.full}</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-5 p-5 rounded-[1.5rem] bg-gray-50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 group/info hover:bg-white dark:hover:bg-white/5 transition-[color,background-color,border-color,transform,opacity] duration-500 shadow-inner">
                       <div className="w-14 h-14 rounded-2xl bg-white dark:bg-black border border-gray-100 dark:border-white/5 flex items-center justify-center text-indigo-500 shadow-sm group-hover/info:scale-110 transition-transform duration-700">
                          <MapPin className="w-6 h-6" />
                       </div>
                       <div className="min-w-0">
                          <p className="text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 italic">{t('admin.events.locus_protocol')}</p>
                          <p className="text-xs font-black text-gray-700 dark:text-gray-300 truncate tracking-tight uppercase">{event.location || t('admin.events.online_protocol')}</p>
                       </div>
                    </div>
                  </div>

                  <p className="text-xs font-bold text-gray-500 dark:text-slate-500 leading-relaxed mb-10 line-clamp-3 italic relative z-10">
                    {event.description || t('admin.events.no_desc')}
                  </p>

                  <div className="flex items-center justify-end gap-3 pt-8 border-t border-gray-100 dark:border-white/5 relative z-10">
                    <button 
                      onClick={() => openModal(event)}
                      className="flex-1 py-4.5 bg-gray-50 dark:bg-white/5 hover:bg-rose-600 hover:text-white dark:text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-[color,background-color,border-color,transform,opacity] flex items-center justify-center gap-2 group/edit"
                    >
                      <Edit3 className="w-4 h-4 group-hover/edit:rotate-12 transition-transform" /> {t('common.edit')}
                    </button>
                    <button 
                      onClick={() => handleDelete(event.id)}
                      className="w-14 h-14 bg-rose-500/5 text-rose-500 border border-rose-500/10 hover:bg-rose-600 hover:text-white rounded-2xl transition-[color,background-color,border-color,transform,opacity] flex items-center justify-center shadow-inner"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Abstract Icon Backdrop */}
                  <div className="absolute inset-inline-end-10 bottom-24 opacity-0 group-hover:opacity-5 transition-opacity duration-1000 pointer-events-none">
                    <Zap className="w-24 h-24 text-rose-500" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </>

      {/* Event Form Modal */}
      <>
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
           <div    onClick={closeModal} className="absolute inset-0 bg-gray-950/40 dark:bg-black/80" />
           <div 
              
              
              
             className="bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-white/5 shadow-2xl rounded-[3.5rem] w-full max-w-3xl overflow-hidden relative z-10"
             onClick={e => e.stopPropagation()}
           >
              {/* Modal Background Glow */}
              <div className="absolute top-0 inset-inline-end-0 w-80 h-80 bg-rose-500/10 hidden rounded-full pointer-events-none"></div>

              {/* Modal Header */}
              <div className="p-10 lg:p-12 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01] flex justify-between items-center relative z-10">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-rose-500/10 dark:bg-rose-500/20 rounded-[1.5rem] flex items-center justify-center border border-rose-500/20 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform duration-500">
                        <Sparkles className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">{editingEvent ? t('admin.events.modals.edit_event') : t('admin.events.modals.new_event')}</h2>
                        <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-1">{t('admin.events.registry_sync')}</p>
                    </div>
                 </div>
                 <button onClick={closeModal} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-500 rounded-2xl hover:text-rose-600 transition-[color,background-color,border-color,transform,opacity] shadow-sm">
                    <X className="w-6 h-6" />
                 </button>
              </div>

              {/* Modal Body */}
              <div className="p-10 lg:p-12 space-y-10 max-h-[60vh] overflow-y-auto no-scrollbar relative z-10">
                 <form id="event-form" onSubmit={handleSubmit} className="space-y-10">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.events.modals.event_title')} *</label>
                       <div className="relative group/title">
                          <Zap className="absolute inset-inline-start-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within/title:text-rose-500 transition-colors" />
                          <input 
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-[1.5rem] py-5 ps-16 pe-8 text-gray-900 dark:text-white text-lg font-black focus:ring-4 focus:ring-rose-500/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner uppercase tracking-widest"
                            placeholder={t('admin.events.modals.placeholder_title')}
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.events.modals.event_date')} *</label>
                          <div className="relative group/date">
                             <Clock className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within/date:text-rose-500 transition-colors" />
                             <input 
                               type="datetime-local"
                               required
                               value={formData.event_date}
                               onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                               className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-[1.5rem] py-5 ps-14 pe-6 text-gray-900 dark:text-white font-black focus:ring-4 focus:ring-rose-500/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner uppercase text-[11px]"
                             />
                          </div>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.events.modals.location')}</label>
                          <div className="relative group/loc">
                             <MapPin className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within/loc:text-rose-500 transition-colors" />
                             <input 
                               type="text"
                               value={formData.location}
                               onChange={(e) => setFormData({...formData, location: e.target.value})}
                               className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-[1.5rem] py-5 ps-14 pe-6 text-gray-900 dark:text-white font-black focus:ring-4 focus:ring-rose-500/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner uppercase tracking-widest text-[11px]"
                               placeholder={t('admin.events.modals.placeholder_location')}
                             />
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.events.modals.category')}</label>
                          <div className="relative group/cat">
                             <Box className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within/cat:text-rose-500 transition-colors" />
                             <select 
                               value={formData.category}
                               onChange={(e) => setFormData({...formData, category: e.target.value})}
                               className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-[1.5rem] py-5 ps-14 pe-8 text-gray-900 dark:text-white font-black focus:ring-4 focus:ring-rose-500/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner appearance-none uppercase tracking-widest text-[11px]"
                             >
                               {categories.filter(c => c !== 'All').map(cat => (
                                 <option key={cat} value={cat}>{t(`admin.events.categories.${cat.toLowerCase()}`)}</option>
                               ))}
                             </select>
                             <ChevronRight className="absolute inset-inline-end-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 rotate-90 pointer-events-none" />
                          </div>
                       </div>
                       <div className="flex flex-col justify-end">
                           <div 
                                onClick={() => setFormData({...formData, is_published: !formData.is_published})}
                                className={`flex items-center gap-4 px-8 py-5 rounded-[1.5rem] border transition-[color,background-color,border-color,transform,opacity] duration-500 cursor-pointer shadow-inner ${
                                    formData.is_published ? 'bg-primary/5 border-primary/20' : 'bg-gray-50 dark:bg-white/[0.01] border-gray-100 dark:border-white/5'
                                }`}
                           >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-[color,background-color,border-color,transform,opacity] duration-500 ${
                                    formData.is_published ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-400'
                                }`}>
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest block text-gray-900 dark:text-white">{t('admin.events.modals.publish')}</span>
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 mt-0.5 italic">{t('admin.events.propagation_protocol')}</span>
                                </div>
                                <div className="ms-auto">
                                    <div className={`w-12 h-6 rounded-full transition-[color,background-color,border-color,transform,opacity] duration-500 relative flex items-center px-1 ${
                                        formData.is_published ? 'bg-primary' : 'bg-gray-200 dark:bg-white/10'
                                    }`}>
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-500 ${
                                            formData.is_published ? 'translate-x-6' : 'translate-x-0'
                                        }`}></div>
                                    </div>
                                </div>
                           </div>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.events.modals.description')}</label>
                       <div className="relative group/desc">
                          <Info className="absolute inset-inline-start-6 top-6 w-5 h-5 text-gray-300 group-focus-within/desc:text-rose-500 transition-colors" />
                          <textarea 
                            rows="4"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-[2.5rem] ps-16 pe-8 py-6 text-gray-900 dark:text-white font-bold focus:ring-4 focus:ring-rose-500/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner resize-none min-h-[140px]"
                            placeholder={t('admin.events.modals.placeholder_desc')}
                          ></textarea>
                       </div>
                    </div>
                 </form>
              </div>

              {/* Modal Footer */}
              <div className="p-10 lg:p-12 border-t border-gray-100 dark:border-white/5 flex justify-end gap-6 bg-gray-50/50 dark:bg-white/[0.01] relative z-10">
                 <button onClick={closeModal} className="px-10 py-5 rounded-[2rem] font-black text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white transition-[color,background-color,border-color,transform,opacity] uppercase text-[10px] tracking-widest">{t('common.cancel')}</button>
                 <button 
                   type="submit" 
                   form="event-form"
                   className="flex items-center gap-3 bg-rose-600 hover:bg-rose-700 text-white px-14 py-5 rounded-[2.5rem] font-black transition-[color,background-color,border-color,transform,opacity] shadow-xl shadow-rose-600/20 active:scale-95 uppercase text-[10px] tracking-widest"
                 >
                   <Save className="w-5 h-5" />
                   {editingEvent ? t('common.save') : t('common.save')}
                 </button>
              </div>
           </div>
        </div>
      )}
      </>
    </div>
  );
};

export default EventsManager;
