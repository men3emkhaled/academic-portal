import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { 
  BookOpen, Plus, MoreVertical, Users, CheckCircle2, 
  Search, Filter, ChevronDown, Archive, Edit3, X 
} from 'lucide-react';

const DoctorCourses = ({ courses, onRefresh }) => {
  const { doctorApi } = useDoctorAuth();
  const [activeTab, setActiveTab] = useState('active'); // active, archive
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [departments, setDepartments] = useState([]);
  
  const [formData, setFormData] = useState({ name: '', code: '', department_id: '', description: '' });
  const [loading, setLoading] = useState(false);

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

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await doctorApi('post', '/doctor/courses', formData);
      toast.success('Course created successfully');
      setShowAddModal(false);
      setFormData({ name: '', code: '', department_id: '', description: '' });
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await doctorApi('put', `/doctor/courses/${showEditModal.id}`, formData);
      toast.success('Course updated');
      setShowEditModal(null);
      onRefresh();
    } catch (err) {
      toast.error('Failed to update course');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleArchive = async (courseId, currentStatus) => {
    try {
      await doctorApi('patch', `/doctor/courses/${courseId}/archive`, { is_archived: !currentStatus });
      toast.success(currentStatus ? 'Course unarchived' : 'Course archived');
      onRefresh();
    } catch (err) {
      toast.error('Failed to update course status');
    }
  };

  const filteredCourses = courses.filter(c => {
    const isTabMatch = activeTab === 'active' ? !c.is_archived : c.is_archived;
    const isSearchMatch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.toLowerCase().includes(searchQuery.toLowerCase());
    const isDeptMatch = deptFilter === 'all' || c.department_id.toString() === deptFilter;
    return isTabMatch && isSearchMatch && isDeptMatch;
  });

  const getAccentColor = (id) => {
    const colors = ['violet', 'emerald', 'amber', 'blue', 'rose'];
    return colors[id % colors.length];
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">Courses</h2>
          <p className="text-doctor-text-muted font-medium">Manage your curriculum, track student progress, and organize materials.</p>
        </div>
        
        <div className="flex items-center bg-doctor-card border border-white/5 p-1.5 rounded-2xl">
          <button 
            onClick={() => setActiveTab('active')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'active' ? 'bg-doctor-primary text-white shadow-lg shadow-doctor-primary/20' : 'text-doctor-text-muted hover:text-white'}`}
          >
            Active
          </button>
          <button 
            onClick={() => setActiveTab('archive')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'archive' ? 'bg-doctor-primary text-white shadow-lg shadow-doctor-primary/20' : 'text-doctor-text-muted hover:text-white'}`}
          >
            Archived
          </button>
          <button className="px-6 py-2.5 rounded-xl font-bold text-sm text-doctor-text-muted hover:text-white transition-all cursor-not-allowed">
            Drafts
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
         <button 
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto bg-doctor-primary hover:bg-doctor-primary/90 text-white font-bold px-8 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-doctor-primary/20 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Course</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
             <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-doctor-text-muted" />
             <select 
               value={deptFilter}
               onChange={(e) => setDeptFilter(e.target.value)}
               className="w-full bg-doctor-card border border-white/5 rounded-2xl py-3.5 pl-12 pr-10 text-white font-bold text-sm focus:outline-none focus:border-doctor-primary/50 transition-all appearance-none cursor-pointer"
             >
               <option value="all">All Departments</option>
               {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
             </select>
             <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-doctor-text-muted pointer-events-none" />
          </div>

           <div className="relative flex-1 sm:w-64">
             <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-doctor-text-muted" />
             <select 
               value={sortBy}
               onChange={(e) => setSortBy(e.target.value)}
               className="w-full bg-doctor-card border border-white/5 rounded-2xl py-3.5 pl-12 pr-10 text-white font-bold text-sm focus:outline-none focus:border-doctor-primary/50 transition-all appearance-none cursor-pointer"
             >
               <option value="recent">Sort by: Most Recent</option>
               <option value="name">Sort by: Name</option>
               <option value="students">Sort by: Students</option>
             </select>
             <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-doctor-text-muted pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.map((course) => {
          const accent = getAccentColor(course.id);
          const progress = Math.min(100, Math.max(25, (course.id * 13) % 100)); // Mock progress for UI
          
          return (
            <div 
              key={course.id}
              className="bg-doctor-card border border-white/5 p-8 rounded-[2.5rem] hover:border-doctor-primary/30 transition-all group relative overflow-hidden"
            >
              {/* Top Accent Gradient */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-${accent}-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none`}></div>
              
              <div className="flex items-start justify-between mb-8 relative z-10">
                <div className={`w-14 h-14 rounded-2xl bg-${accent}-500/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                   <BookOpen className={`w-7 h-7 text-${accent}-500`} />
                </div>
                <div className="relative group/menu">
                  <button className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-doctor-text-muted hover:text-white transition-all">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {/* Action Menu */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-doctor-sidebar border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-20 overflow-hidden">
                    <button 
                      onClick={() => {
                        setFormData({ name: course.name, code: course.code, department_id: course.department_id, description: course.description || '' });
                        setShowEditModal(course);
                      }}
                      className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-bold text-white hover:bg-white/5 transition-all text-left"
                    >
                      <Edit3 className="w-4 h-4 text-doctor-primary" /> Edit Description
                    </button>
                    <button 
                      onClick={() => handleToggleArchive(course.id, course.is_archived)}
                      className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-bold text-white hover:bg-white/5 transition-all text-left"
                    >
                      <Archive className={`w-4 h-4 ${course.is_archived ? 'text-emerald-400' : 'text-amber-400'}`} /> 
                      {course.is_archived ? 'Activate Course' : 'Archive Course'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-doctor-primary transition-colors truncate">{course.name}</h3>
                <p className="text-doctor-text-muted text-[15px] leading-relaxed mb-8 line-clamp-2 min-h-[3rem]">
                  {course.description || `Comprehensive study of ${course.name.toLowerCase()} principles and core concepts.`}
                </p>

                <div className="flex items-center justify-between mb-3 text-sm">
                  <div className="flex items-center gap-2 text-doctor-text-muted font-bold">
                    <Users className="w-4 h-4" />
                    <span>{course.student_count || 0} Students</span>
                  </div>
                  <span className={`font-black text-${accent}-500 tracking-wider`}>{progress}%</span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-${accent}-500 rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredCourses.length === 0 && (
          <div className="col-span-full py-24 text-center">
             <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-white/10" />
             </div>
             <p className="text-doctor-text-muted text-xl font-bold">No courses found in this category.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-6 animate-fadeIn">
          <div className="bg-doctor-sidebar border border-white/10 w-full max-w-xl rounded-[3rem] p-10 relative shadow-2xl">
            <button 
              onClick={() => { setShowAddModal(false); setShowEditModal(null); }}
              className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-doctor-text-muted hover:text-white transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-3xl font-black text-white mb-2">
              {showAddModal ? 'Create New Course' : 'Edit Course'}
            </h3>
            <p className="text-doctor-text-muted font-medium mb-8">
              {showAddModal ? 'Define the course parameters and starting information.' : 'Update the course details and description.'}
            </p>

            <form onSubmit={showAddModal ? handleCreateCourse : handleUpdateCourse} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-doctor-text-muted uppercase tracking-widest ml-1">Course Name</label>
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Advanced Anatomy"
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white placeholder-doctor-text-muted focus:outline-none focus:border-doctor-primary/50 transition-all font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-doctor-text-muted uppercase tracking-widest ml-1">Course Code</label>
                  <input 
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    placeholder="e.g. CS101"
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white placeholder-doctor-text-muted focus:outline-none focus:border-doctor-primary/50 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-doctor-text-muted uppercase tracking-widest ml-1">Department</label>
                <select 
                  required
                  value={formData.department_id}
                  onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-doctor-primary/50 transition-all font-medium appearance-none"
                >
                  <option value="" className="bg-doctor-sidebar">Select Department</option>
                  {departments.map(d => <option key={d.id} value={d.id} className="bg-doctor-sidebar">{d.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-doctor-text-muted uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter a brief course overview..."
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-white placeholder-doctor-text-muted focus:outline-none focus:border-doctor-primary/50 transition-all font-medium resize-none"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-doctor-primary hover:bg-doctor-primary/90 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-doctor-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 mt-4 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <CheckCircle2 className="w-6 h-6" />
                    <span>{showAddModal ? 'Create Course' : 'Save Changes'}</span>
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

export default DoctorCourses;
