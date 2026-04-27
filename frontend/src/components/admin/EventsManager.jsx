import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Calendar, MapPin, Tag, Plus, Trash2, Edit3, 
  Search, Clock, LayoutGrid, List as ListIcon, 
  ChevronRight, X, AlertCircle, Save, Info
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
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-500" />
            University Life Events
          </h2>
          <p className="text-slate-400 text-sm mt-1">Manage organizational activities and campus events</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
          
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95"
          >
            <Plus className="w-5 h-5" />
            New Event
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
        <input 
          type="text"
          placeholder="Search events by title or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 icon-search border border-slate-700/50 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
        />
      </div>

      {/* Events View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
           <p className="text-slate-500 font-medium">Loading university events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
           <Calendar className="w-16 h-16 text-slate-700 mb-4" />
           <h3 className="text-lg font-bold text-slate-400">No events found</h3>
           <p className="text-slate-500 text-sm mt-1">Try searching for something else or create a new event.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <div key={event.id} className="bg-slate-900/80 border border-slate-700/50 rounded-3xl p-6 transition-all hover:border-blue-500/50 hover:translate-y-[-4px] group shadow-xl">
               <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    event.is_published ? 'bg-green-500/10 text-green-500' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {event.is_published ? 'Published' : 'Draft'}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => openModal(event)} className="p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg transition-colors">
                        <Edit3 className="w-4 h-4" />
                     </button>
                     <button onClick={() => handleDelete(event.id)} className="p-2 bg-slate-800 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
               </div>
               
               <h3 className="text-xl font-black text-white line-clamp-2 min-h-[3.5rem]">{event.title}</h3>
               
               <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                     <Clock className="w-4 h-4 text-blue-500" />
                     {new Date(event.event_date).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                     <MapPin className="w-4 h-4 text-purple-500" />
                     {event.location || 'Online / TBA'}
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs text-blue-500 font-bold">
                     <Tag className="w-4 h-4" />
                     {event.category}
                  </div>
               </div>
               
               {event.description && (
                 <p className="text-slate-500 text-sm mt-4 line-clamp-3 leading-relaxed">
                   {event.description}
                 </p>
               )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/50 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/30">
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Title</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredEvents.map(event => (
                <tr key={event.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 font-bold text-white max-w-xs truncate">{event.title}</td>
                  <td className="px-6 py-4 text-slate-400 text-sm">{new Date(event.event_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                      {event.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`w-2.5 h-2.5 rounded-full ${event.is_published ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-slate-600'}`}></div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openModal(event)} className="p-2 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(event.id)} className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
           <div className="bg-slate-900 border border-slate-700 shadow-2xl rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col scale-in">
              {/* Modal Header */}
              <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                 <div>
                    <h2 className="text-2xl font-black text-white">{editingEvent ? 'Edit Event' : 'Create New Event'}</h2>
                    <p className="text-slate-400 text-sm">Fill in the details for the university event</p>
                 </div>
                 <button onClick={closeModal} className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all">
                    <X className="w-6 h-6" />
                 </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 overflow-y-auto custom-scrollbar">
                 <form id="event-form" onSubmit={handleSubmit} className="space-y-6">
                    <div>
                       <label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Event Title</label>
                       <input 
                         type="text"
                         required
                         value={formData.title}
                         onChange={(e) => setFormData({...formData, title: e.target.value})}
                         className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold placeholder:text-slate-600"
                         placeholder="e.g. Annual Student Organization Fair"
                       />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                          <label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Event Date & Time</label>
                          <input 
                            type="datetime-local"
                            required
                            value={formData.event_date}
                            onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold"
                          />
                       </div>
                       <div>
                          <label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Location</label>
                          <input 
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold placeholder:text-slate-600"
                            placeholder="e.g. Main Auditorium / Zoom"
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                          <label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Category</label>
                          <select 
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold"
                          >
                            {categories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                       </div>
                       <div className="flex items-end pb-2">
                          <label className="flex items-center gap-3 cursor-pointer group">
                             <div className="relative">
                                <input 
                                  type="checkbox"
                                  className="sr-only"
                                  checked={formData.is_published}
                                  onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                                />
                                <div className={`w-12 h-6 rounded-full transition-colors ${formData.is_published ? 'bg-blue-600' : 'bg-slate-700'}`}></div>
                                <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.is_published ? 'translate-x-6' : 'translate-x-0'}`}></div>
                             </div>
                             <span className="text-slate-300 font-bold text-sm">Publish Immediately</span>
                          </label>
                       </div>
                    </div>

                    <div>
                       <label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Description</label>
                       <textarea 
                         rows="4"
                         value={formData.description}
                         onChange={(e) => setFormData({...formData, description: e.target.value})}
                         className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold placeholder:text-slate-600 resize-none"
                         placeholder="Details about the event, organizers, etc."
                       ></textarea>
                    </div>
                 </form>
              </div>

              {/* Modal Footer */}
              <div className="p-8 border-t border-slate-800 flex justify-end gap-4 bg-slate-900">
                 <button onClick={closeModal} className="px-6 py-3 rounded-2xl font-bold text-slate-400 hover:text-white transition-all">Cancel</button>
                 <button 
                   type="submit" 
                   form="event-form"
                   className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-black transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                 >
                   <Save className="w-5 h-5" />
                   {editingEvent ? 'Update Event' : 'Create Event'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default EventsManager;
