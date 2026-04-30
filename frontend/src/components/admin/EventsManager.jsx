import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Calendar, MapPin, Tag, Plus, Trash2, Edit3, 
  Search, Clock, LayoutGrid, List as ListIcon, 
  ChevronRight, X, AlertCircle, Save, Info,
  CheckCircle2
} from 'lucide-react';

const EventsManager = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    location: '',
    category: 'Activity',
    is_published: true
  });

  const categories = ['Activity', 'Workshop', 'Social', 'Academic', 'Sports', 'Ceremony'];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events/all');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
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
        toast.success('Event created successfully');
      }
      fetchEvents();
      closeModal();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success('Event deleted');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const openModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      // Format date for datetime-local input
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

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3 transition-colors">
            <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-500" />
            University Life Events
          </h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm font-medium mt-1 transition-colors">Manage organizational activities and campus events</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 dark:bg-slate-800/50 p-1 rounded-xl border border-gray-200 dark:border-slate-700/50 transition-colors shadow-sm">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
          
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-black transition-all shadow-lg active:scale-95"
          >
            <Plus className="w-5 h-5" />
            New Event
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group shadow-sm rounded-2xl overflow-hidden transition-all">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" />
        <input 
          type="text"
          placeholder="Search events by title or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium transition-colors"
        />
      </div>

      {/* Events View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900/50 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-slate-800 transition-colors">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-6"></div>
           <p className="text-gray-500 dark:text-slate-500 font-black uppercase tracking-widest text-[10px]">Synchronizing University Data...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900/50 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-slate-800 grayscale opacity-20 transition-colors">
           <Calendar className="w-16 h-16 text-gray-400 dark:text-slate-700 mb-4" />
           <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-slate-400">No events found</h3>
           <p className="text-xs font-medium text-gray-500 dark:text-slate-500 mt-2">The registry is currently empty.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map(event => (
            <div key={event.id} className="bg-white dark:bg-slate-900/80 border border-gray-100 dark:border-slate-700/50 rounded-[2rem] p-8 transition-all hover:border-blue-500/50 hover:translate-y-[-6px] group shadow-sm dark:shadow-2xl transition-colors relative overflow-hidden">
               
               <div className="flex justify-between items-start mb-6 relative z-10">
                  <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors ${
                    event.is_published ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-500' : 'bg-gray-100 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-400 dark:text-slate-400'
                  }`}>
                    {event.is_published ? 'Published' : 'Draft'}
                  </span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                     <button onClick={() => openModal(event)} className="w-9 h-9 flex items-center justify-center bg-gray-100 dark:bg-slate-800 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500 text-blue-600 dark:text-blue-400 rounded-xl transition-all shadow-sm">
                        <Edit3 className="w-4 h-4" />
                     </button>
                     <button onClick={() => handleDelete(event.id)} className="w-9 h-9 flex items-center justify-center bg-red-500/10 hover:bg-red-500 hover:text-white text-red-600 dark:text-red-400 rounded-xl transition-all shadow-sm">
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
               </div>
               
               <h3 className="text-xl font-black text-gray-900 dark:text-white line-clamp-2 min-h-[3.5rem] transition-colors leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400">{event.title}</h3>
               
               <div className="space-y-3 mt-6 pt-6 border-t border-gray-50 dark:border-white/5 transition-colors">
                  <div className="flex items-center gap-3 text-gray-500 dark:text-slate-400 text-xs font-bold transition-colors">
                     <Clock className="w-4 h-4 text-blue-500" />
                     {new Date(event.event_date).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-3 text-gray-500 dark:text-slate-400 text-xs font-bold transition-colors">
                     <MapPin className="w-4 h-4 text-purple-500" />
                     {event.location || 'Online / TBA'}
                  </div>
                  <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest transition-colors">
                     <Tag className="w-4 h-4" />
                     {event.category}
                  </div>
               </div>
               
               {event.description && (
                 <p className="text-gray-500 dark:text-slate-500 text-sm mt-6 line-clamp-3 leading-relaxed transition-colors font-medium italic">
                   {event.description}
                 </p>
               )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900/50 rounded-[2rem] border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm dark:shadow-xl transition-colors">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/30 transition-colors">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] transition-colors">Title</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] transition-colors">Date & Time</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] transition-colors">Category</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] transition-colors text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] text-right transition-colors">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filteredEvents.map(event => (
                <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/20 transition-colors group">
                  <td className="px-8 py-5 font-black text-gray-900 dark:text-white max-w-xs truncate transition-colors uppercase text-sm">{event.title}</td>
                  <td className="px-8 py-5 text-gray-500 dark:text-slate-400 text-xs font-bold transition-colors">{new Date(event.event_date).toLocaleDateString()}</td>
                  <td className="px-8 py-5">
                    <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-500/20 transition-colors">
                      {event.category}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center">
                        <div className={`w-3 h-3 rounded-full ${event.is_published ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-gray-300 dark:bg-slate-700'}`}></div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openModal(event)} className="w-9 h-9 flex items-center justify-center bg-gray-100 dark:bg-slate-800 hover:bg-blue-500 hover:text-white text-blue-600 dark:text-blue-400 rounded-xl transition-all shadow-sm">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(event.id)} className="w-9 h-9 flex items-center justify-center bg-red-500/10 hover:bg-red-500 hover:text-white text-red-600 dark:text-red-400 rounded-xl transition-all shadow-sm">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 dark:bg-black/80 animate-fadeIn">
           <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-2xl rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transition-colors relative">
              
              {/* Modal Header */}
              <div className="p-10 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50 transition-colors relative z-10">
                 <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white transition-colors">{editingEvent ? 'Recalibrate Event' : 'Initialize New Event'}</h2>
                    <p className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 transition-colors">University Organizational Logic</p>
                 </div>
                 <button onClick={closeModal} className="w-12 h-12 flex items-center justify-center bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white rounded-2xl transition-all">
                    <X className="w-6 h-6" />
                 </button>
              </div>

              {/* Modal Body */}
              <div className="p-10 overflow-y-auto custom-scrollbar relative z-10">
                 <form id="event-form" onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                       <label className="block text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest ml-4 transition-colors">Event Title *</label>
                       <input 
                         type="text"
                         required
                         value={formData.title}
                         onChange={(e) => setFormData({...formData, title: e.target.value})}
                         className="admin-input"
                         placeholder="e.g. Annual Student Organization Fair"
                       />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="block text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest ml-4 transition-colors">Event Date & Time *</label>
                          <input 
                            type="datetime-local"
                            required
                            value={formData.event_date}
                            onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                            className="admin-input"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="block text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest ml-4 transition-colors">Location Node</label>
                          <input 
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                            className="admin-input"
                            placeholder="e.g. Main Auditorium / Zoom"
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="block text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest ml-4 transition-colors">Classification</label>
                          <select 
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            className="admin-input appearance-none"
                          >
                            {categories.map(cat => (
                              <option key={cat} value={cat} className="bg-white dark:bg-slate-900">{cat}</option>
                            ))}
                          </select>
                       </div>
                       <div className="flex items-center gap-4 bg-gray-50 dark:bg-white/[0.02] p-6 rounded-[1.5rem] border border-gray-100 dark:border-white/5 transition-colors">
                          <div className="relative flex items-center">
                                <input 
                                  type="checkbox"
                                  className="sr-only"
                                  id="publish-switch"
                                  checked={formData.is_published}
                                  onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                                />
                                <label htmlFor="publish-switch" className={`w-14 h-7 rounded-full transition-colors cursor-pointer flex items-center px-1 ${formData.is_published ? 'bg-blue-500' : 'bg-gray-300 dark:bg-slate-700'}`}>
                                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${formData.is_published ? 'translate-x-7' : 'translate-x-0'}`}></div>
                                </label>
                          </div>
                          <span className="text-gray-900 dark:text-slate-300 font-black text-xs uppercase tracking-widest transition-colors">PROD_SYNC ACTIVE</span>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="block text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest ml-4 transition-colors">Event Rationale</label>
                       <textarea 
                         rows="4"
                         value={formData.description}
                         onChange={(e) => setFormData({...formData, description: e.target.value})}
                         className="admin-input scrollbar-hide resize-none"
                         placeholder="Detailed description of event objectives and participants..."
                       ></textarea>
                    </div>
                 </form>
              </div>

              {/* Modal Footer */}
              <div className="p-10 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-4 bg-gray-50 dark:bg-slate-900/50 transition-colors relative z-10">
                 <button onClick={closeModal} className="px-8 py-3 rounded-2xl font-black text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-all uppercase text-xs tracking-widest">Abort</button>
                 <button 
                   type="submit" 
                   form="event-form"
                   className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-black transition-all shadow-lg shadow-blue-500/20 active:scale-95 uppercase text-xs tracking-[0.2em]"
                 >
                   <Save className="w-5 h-5" />
                   {editingEvent ? 'Deploy Updates' : 'Inject Event'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default EventsManager;
