import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Calendar, MapPin, Tag, Plus, Trash2, Edit3, 
  Search, Clock, LayoutGrid, List as ListIcon, 
  ChevronRight, X, AlertCircle, Save, Info,
  CheckCircle2, Sparkles, Activity, Image as ImageIcon,
  MoreVertical, Filter, Globe, Users, Bell
} from 'lucide-react';

const EventsManager = () => {
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
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await api.put(`/events/${editingEvent.id}`, formData);
        toast.success('Event updated successfully');
      } else {
        await api.post('/events', formData);
        toast.success('New event added successfully');
      }
      fetchEvents();
      closeModal();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success('Event deleted');
      fetchEvents();
    } catch (error) {
      toast.error('Failed to delete event');
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
    <div className="animate-in fade-in duration-700 pb-10">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-rose-500/10 dark:bg-rose-500/20 rounded-3xl flex items-center justify-center border border-rose-500/20 shadow-inner relative group">
            <Calendar className="w-8 h-8 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white dark:border-[#111] animate-pulse"></div>
          </div>
          <div>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
              Event Hub
            </h2>
            <div className="flex items-center gap-3 mt-1.5">
                <span className="text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-[0.2em]">Campus Activities</span>
                <div className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                <span className="text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-widest">{events.length} Events Total</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all placeholder:text-gray-400"
            />
          </div>
          <button 
            onClick={() => openModal()}
            className="px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-rose-500/20 transition-all active:scale-95 flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Event
          </button>
        </div>
      </div>

      {/* Categories Scroller */}
      <div className="flex items-center gap-3 mb-10 overflow-x-auto no-scrollbar pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${
              activeCategory === cat 
              ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-500/20' 
              : 'bg-white/50 dark:bg-white/[0.02] text-gray-500 border-gray-200 dark:border-white/5 hover:border-rose-500/30'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Content View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-48 opacity-50">
           <div className="w-16 h-16 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin mb-8"></div>
           <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Loading Events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white/50 dark:bg-white/[0.02] border-2 border-dashed border-gray-200 dark:border-white/10 rounded-[3rem] py-48 text-center flex flex-col items-center group transition-all duration-500">
            <div className="w-24 h-24 bg-rose-500/5 dark:bg-rose-500/10 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <Sparkles className="w-12 h-12 text-rose-400 opacity-50" />
            </div>
            <h4 className="text-xl font-black uppercase tracking-[0.3em] text-gray-900 dark:text-white">No Events Found</h4>
            <p className="text-sm font-bold mt-4 tracking-widest text-gray-500">Try adjusting your search or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredEvents.map(event => {
            const dateInfo = formatDate(event.event_date);
            return (
              <div 
                key={event.id} 
                className="group relative bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-rose-500/40 hover:shadow-2xl hover:shadow-rose-500/5"
              >
                {/* Visual Accent */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 transition-all duration-500 ${event.is_published ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-800'}`}></div>
                
                <div className="p-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-3">
                      <div className="bg-rose-500/10 p-3 rounded-2xl border border-rose-500/20">
                        <Tag className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      </div>
                      <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">{event.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className={`px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${
                         event.is_published ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-400'
                       }`}>
                         {event.is_published ? 'Published' : 'Draft'}
                       </span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight mb-6 group-hover:text-rose-600 transition-colors min-h-[4rem] line-clamp-2">{event.title}</h3>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 group/info hover:bg-white dark:hover:bg-white/5 transition-all">
                       <div className="w-12 h-12 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-white/10 flex flex-col items-center justify-center text-rose-600 dark:text-rose-400 shadow-inner">
                          <span className="text-[10px] font-black leading-none uppercase">{dateInfo.month}</span>
                          <span className="text-xl font-black leading-none mt-1">{dateInfo.day}</span>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Time & Date</p>
                          <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{dateInfo.time} • {dateInfo.full}</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 group/info hover:bg-white dark:hover:bg-white/5 transition-all">
                       <div className="w-12 h-12 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-white/10 flex items-center justify-center text-indigo-500 shadow-inner">
                          <MapPin className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Location</p>
                          <p className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate max-w-[180px]">{event.location || 'Online / TBA'}</p>
                       </div>
                    </div>
                  </div>

                  {event.description && (
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed mb-8 line-clamp-3 italic">
                      {event.description}
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-50 dark:border-white/5">
                    <button 
                      onClick={() => openModal(event)}
                      className="flex-1 py-3.5 bg-gray-100 dark:bg-white/5 hover:bg-rose-600 hover:text-white dark:text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Event
                    </button>
                    <button 
                      onClick={() => handleDelete(event.id)}
                      className="w-12 h-12 bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white rounded-2xl transition-all flex items-center justify-center shadow-inner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cinematic Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 dark:bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
           <div 
             className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.4)] rounded-[3rem] w-full max-w-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500"
             onClick={e => e.stopPropagation()}
           >
              {/* Modal Header */}
              <div className="p-10 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] flex justify-between items-center">
                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center border border-rose-500/20">
                        <Activity className="w-6 h-6 text-rose-600" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{editingEvent ? 'Edit Event' : 'Add New Event'}</h2>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Event Information Details</p>
                    </div>
                 </div>
                 <button onClick={closeModal} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 rounded-2xl hover:text-rose-600 transition-all shadow-sm">
                    <X className="w-6 h-6" />
                 </button>
              </div>

              {/* Modal Body */}
              <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                 <form id="event-form" onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-3">
                       <label className="block text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] ml-5">Event Title</label>
                       <div className="relative">
                          <Edit3 className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                          <input 
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-[1.5rem] py-5 pl-16 pr-8 text-gray-900 dark:text-white text-lg font-black focus:ring-2 focus:ring-rose-500/50 outline-none transition-all shadow-inner"
                            placeholder="Enter event name..."
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="block text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] ml-5">Date & Time</label>
                          <div className="relative">
                             <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                             <input 
                               type="datetime-local"
                               required
                               value={formData.event_date}
                               onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                               className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-[1.5rem] py-5 pl-16 pr-8 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-rose-500/50 outline-none transition-all shadow-inner"
                             />
                          </div>
                       </div>
                       <div className="space-y-3">
                          <label className="block text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] ml-5">Location</label>
                          <div className="relative">
                             <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                             <input 
                               type="text"
                               value={formData.location}
                               onChange={(e) => setFormData({...formData, location: e.target.value})}
                               className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-[1.5rem] py-5 pl-16 pr-8 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-rose-500/50 outline-none transition-all shadow-inner"
                               placeholder="e.g. Main Hall / Zoom"
                             />
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="block text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] ml-5">Category</label>
                          <div className="relative">
                             <Tag className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                             <select 
                               value={formData.category}
                               onChange={(e) => setFormData({...formData, category: e.target.value})}
                               className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-[1.5rem] py-5 pl-16 pr-8 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-rose-500/50 outline-none transition-all shadow-inner appearance-none"
                             >
                               {categories.filter(c => c !== 'All').map(cat => (
                                 <option key={cat} value={cat}>{cat}</option>
                               ))}
                             </select>
                          </div>
                       </div>
                       <div className="flex flex-col justify-end">
                           <div className="flex items-center gap-4 bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 p-5 rounded-[1.5rem] shadow-inner">
                              <div className="relative flex items-center">
                                    <input 
                                      type="checkbox"
                                      className="sr-only"
                                      id="publish-switch"
                                      checked={formData.is_published}
                                      onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                                    />
                                    <label htmlFor="publish-switch" className={`w-14 h-7 rounded-full transition-colors cursor-pointer flex items-center px-1 ${formData.is_published ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${formData.is_published ? 'translate-x-7' : 'translate-x-0'}`}></div>
                                    </label>
                              </div>
                              <span className="text-gray-900 dark:text-white font-black text-[10px] uppercase tracking-widest">Published on Website</span>
                           </div>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="block text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] ml-5">Description</label>
                       <textarea 
                         rows="4"
                         value={formData.description}
                         onChange={(e) => setFormData({...formData, description: e.target.value})}
                         className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-[1.5rem] p-8 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-rose-500/50 outline-none transition-all shadow-inner resize-none"
                         placeholder="Describe event details..."
                       ></textarea>
                    </div>
                 </form>
              </div>

              {/* Modal Footer */}
              <div className="p-10 border-t border-gray-100 dark:border-white/10 flex justify-end gap-5 bg-gray-50/50 dark:bg-white/[0.02]">
                 <button onClick={closeModal} className="px-10 py-5 rounded-2xl font-black text-gray-500 hover:text-gray-900 transition-all uppercase text-[10px] tracking-[0.2em]">Cancel</button>
                 <button 
                   type="submit" 
                   form="event-form"
                   className="flex items-center gap-3 bg-rose-600 hover:bg-rose-700 text-white px-12 py-5 rounded-2xl font-black transition-all shadow-xl shadow-rose-500/20 active:scale-95 uppercase text-[10px] tracking-[0.3em]"
                 >
                   <Save className="w-5 h-5" />
                   {editingEvent ? 'Save Changes' : 'Add Event'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default EventsManager;
