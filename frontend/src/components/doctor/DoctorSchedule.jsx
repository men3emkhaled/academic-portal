import React, { useState, useMemo, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { 
  Calendar, Clock, MapPin, Plus, Edit2, Trash2, 
  ChevronLeft, ChevronRight, X, Save, Layers, Building2 
} from 'lucide-react';

const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

const DoctorSchedule = ({ timetable, onRefresh, courses }) => {
  const { doctorApi } = useDoctorAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterDept, setFilterDept] = useState('all');
  const [departments, setDepartments] = useState([]);

  const [formData, setFormData] = useState({
    course_name: '',
    section: '',
    day_of_week: 'Saturday',
    start_time: '08:00',
    end_time: '09:30',
    location: '',
    type: 'Lecture',
    department_id: ''
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await doctorApi('get', '/departments');
      setDepartments(res.data || []);
    } catch (err) {
      console.error('Failed to load departments');
    }
  };

  const groupedSchedule = useMemo(() => {
    const grouped = {};
    DAYS.forEach(day => {
      grouped[day] = (timetable || []).filter(item => {
          const isDayMatch = item.day_of_week === day;
          const isDeptMatch = filterDept === 'all' || item.department_id?.toString() === filterDept;
          return isDayMatch && isDeptMatch;
      });
    });
    return grouped;
  }, [timetable, filterDept]);

  const handleOpenModal = (entry = null) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        course_name: entry.course_name,
        section: entry.section,
        day_of_week: entry.day_of_week,
        start_time: entry.start_time.slice(0, 5),
        end_time: entry.end_time.slice(0, 5),
        location: entry.location,
        type: entry.type,
        department_id: entry.department_id || ''
      });
    } else {
      setEditingEntry(null);
      setFormData({
        course_name: '',
        section: '',
        day_of_week: 'Saturday',
        start_time: '08:00',
        end_time: '09:30',
        location: '',
        type: 'Lecture',
        department_id: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingEntry) {
        await doctorApi('put', `/doctor/timetable/${editingEntry.id}`, formData);
        toast.success('Schedule updated');
      } else {
        await doctorApi('post', '/doctor/timetable', formData);
        toast.success('Entry added to schedule');
      }
      setShowModal(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error('Failed to save schedule entry');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this from your schedule?')) return;
    try {
      await doctorApi('delete', `/doctor/timetable/${id}`);
      toast.success('Entry removed');
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error('Failed to delete entry');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-24 lg:pb-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">My Academic Schedule</h2>
          <p className="text-doctor-text-muted font-medium">Manage your lectures, labs, and office hours across all departments.</p>
        </div>
        <div className="flex flex-wrap gap-4">
           <select 
             value={filterDept}
             onChange={(e) => setFilterDept(e.target.value)}
             className="bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-doctor-primary/50 transition-all font-bold text-sm"
           >
              <option value="all" className="bg-doctor-sidebar text-white">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id.toString()} className="bg-doctor-sidebar text-white">{d.name}</option>
              ))}
           </select>
            <button 
                onClick={() => handleOpenModal()}
                className="bg-doctor-primary hover:bg-doctor-primary/90 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-doctor-primary/20 flex items-center gap-3 transition-all active:scale-95"
            >
                <Plus className="w-5 h-5" />
                <span>Add New Session</span>
            </button>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-7 gap-4">
        {DAYS.map((day) => (
          <div key={day} className="flex flex-col gap-4">
            <div className="bg-doctor-sidebar/50 border border-white/5 py-4 px-6 rounded-2xl">
              <h3 className="text-white font-black text-center uppercase tracking-widest text-xs">{day.slice(0, 3)}</h3>
            </div>
            
            <div className="space-y-3 min-h-[100px]">
              {groupedSchedule[day].length > 0 ? (
                groupedSchedule[day].map((entry) => (
                  <div 
                    key={entry.id} 
                    className="group bg-doctor-card border border-white/5 p-5 rounded-[1.5rem] hover:border-doctor-primary/40 transition-all relative overflow-hidden"
                  >
                    {/* Decorator */}
                    <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${entry.type === 'Lecture' ? 'bg-doctor-primary' : 'bg-emerald-500'}`}></div>
                    
                    <div className="flex justify-between items-start mb-3">
                       <span className="text-[10px] font-black uppercase tracking-tighter text-doctor-text-muted">
                          {entry.start_time.slice(0, 5)} - {entry.end_time.slice(0, 5)}
                       </span>
                       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenModal(entry)} className="p-1.5 rounded-lg hover:bg-white/10 text-doctor-text-muted hover:text-white">
                             <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(entry.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-doctor-text-muted hover:text-red-400">
                             <Trash2 className="w-3.5 h-3.5" />
                          </button>
                       </div>
                    </div>
                    
                    <h4 className="text-white font-bold text-sm leading-tight mb-3 line-clamp-2">{entry.course_name}</h4>
                    
                    <div className="space-y-2">
                       <div className="flex items-center gap-2 text-doctor-text-muted">
                          <Building2 className="w-3 h-3 text-doctor-primary" />
                          <span className="text-[9px] font-black uppercase truncate">{entry.department_name || 'General'}</span>
                       </div>
                       <div className="flex items-center gap-2 text-doctor-text-muted">
                          <MapPin className="w-3 h-3" />
                          <span className="text-[10px] font-bold">{entry.location}</span>
                       </div>
                       <div className="flex items-center gap-2 text-doctor-text-muted">
                          <Layers className="w-3 h-3" />
                          <span className="text-[10px] font-bold">Sec {entry.section}</span>
                       </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-24 border border-dashed border-white/5 rounded-[1.5rem] flex items-center justify-center">
                  <span className="text-[10px] font-black uppercase text-white/5 tracking-widest">Free</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-doctor-card border border-white/10 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-slideUp">
             <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <h3 className="text-xl font-black text-white">{editingEntry ? 'Edit Session' : 'New Schedule Session'}</h3>
                <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-doctor-text-muted transition-colors">
                   <X className="w-6 h-6" />
                </button>
             </div>
             
             <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[70vh] hidden-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                   <div className="col-span-2 space-y-2">
                      <label className="text-xs font-black text-doctor-text-muted uppercase tracking-widest ml-1">Select Department</label>
                      <select 
                        required
                        value={formData.department_id}
                        onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-doctor-primary/50 transition-all font-medium appearance-none"
                      >
                         <option value="" disabled className="bg-doctor-sidebar">Choose Department</option>
                         {departments.map(d => (
                           <option key={d.id} value={d.id} className="bg-doctor-sidebar">{d.name}</option>
                         ))}
                      </select>
                   </div>

                   <div className="col-span-2 space-y-2">
                      <label className="text-xs font-black text-doctor-text-muted uppercase tracking-widest ml-1">Course Name</label>
                      <input 
                        required
                        type="text"
                        placeholder="e.g. Introduction to Programming"
                        value={formData.course_name}
                        onChange={(e) => setFormData({...formData, course_name: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-doctor-primary/50 transition-all font-medium"
                      />
                      <p className="text-[10px] text-doctor-text-muted ml-1">You can also pick from your assigned courses below</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                         {courses.map(c => (
                            <button 
                              key={c.id}
                              type="button"
                              onClick={() => setFormData({...formData, course_name: c.name, department_id: c.department_id})}
                              className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all ${formData.course_name === c.name ? 'bg-doctor-primary/20 border-doctor-primary text-doctor-primary' : 'bg-white/5 border-white/5 text-doctor-text-muted hover:border-white/10'}`}
                            >
                               {c.name}
                            </button>
                         ))}
                      </div>
                   </div>
                   
                   <div className="space-y-2">
                      <label className="text-xs font-black text-doctor-text-muted uppercase tracking-widest ml-1">Section</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. 1"
                        value={formData.section}
                        onChange={(e) => setFormData({...formData, section: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-doctor-primary/50 transition-all font-medium"
                      />
                   </div>
                   
                   <div className="space-y-2">
                      <label className="text-xs font-black text-doctor-text-muted uppercase tracking-widest ml-1">Type</label>
                      <select 
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-doctor-primary/50 transition-all font-medium"
                      >
                         <option value="Lecture" className="bg-doctor-sidebar">Lecture</option>
                         <option value="Section" className="bg-doctor-sidebar">Section</option>
                         <option value="Lab" className="bg-doctor-sidebar">Lab</option>
                         <option value="Office Hours" className="bg-doctor-sidebar">Office Hours</option>
                      </select>
                   </div>

                   <div className="space-y-2">
                      <label className="text-xs font-black text-doctor-text-muted uppercase tracking-widest ml-1">Day</label>
                      <select 
                        value={formData.day_of_week}
                        onChange={(e) => setFormData({...formData, day_of_week: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-doctor-primary/50 transition-all font-medium"
                      >
                         {DAYS.map(day => <option key={day} value={day} className="bg-doctor-sidebar">{day}</option>)}
                      </select>
                   </div>

                   <div className="space-y-2">
                      <label className="text-xs font-black text-doctor-text-muted uppercase tracking-widest ml-1">Location</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Hall 4"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-doctor-primary/50 transition-all font-medium"
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-xs font-black text-doctor-text-muted uppercase tracking-widest ml-1">Start Time</label>
                      <input 
                        type="time" 
                        required
                        value={formData.start_time}
                        onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-doctor-primary/50 transition-all font-medium"
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-xs font-black text-doctor-text-muted uppercase tracking-widest ml-1">End Time</label>
                      <input 
                        type="time" 
                        required
                        value={formData.end_time}
                        onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-doctor-primary/50 transition-all font-medium"
                      />
                   </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-doctor-primary hover:bg-doctor-primary/90 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-doctor-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>{editingEntry ? 'Update Session' : 'Add to Schedule'}</span>
                    </>
                  )}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSchedule;
