import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Plus, MoreVertical, Users, CheckCircle2, 
  Search, Filter, ChevronDown, Archive, Edit3, X, Calendar,
  ArrowRight, Book, Layers, Sparkles
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
  const [availableCourses, setAvailableCourses] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  
  const [formData, setFormData] = useState({ 
    department_id: '', 
    course_id: '', 
    description: '' 
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showAddModal && formData.department_id) {
      fetchCoursesByDepartment(formData.department_id);
    } else {
      setAvailableCourses([]);
    }
  }, [formData.department_id, showAddModal]);

  const fetchDepartments = async () => {
    try {
      const res = await doctorApi('get', '/departments');
      setDepartments(res.data || []);
    } catch (err) {
      console.error('Failed to load departments');
    }
  };

  const fetchCoursesByDepartment = async (deptId) => {
    try {
      const res = await doctorApi('get', `/courses/department/${deptId}`);
      const currentCourseIds = courses.map(c => c.id);
      const filtered = (res.data || []).filter(c => !currentCourseIds.includes(c.id));
      setAvailableCourses(filtered);
    } catch (err) {
      toast.error('Failed to load courses');
    }
  };

  const handleAssignCourse = async (e) => {
    e.preventDefault();
    if (!formData.course_id) return toast.error('Please select a course');
    
    setLoading(true);
    try {
      await doctorApi('post', '/doctor/courses/assign', { courseId: formData.course_id });
      if (formData.description) {
         await doctorApi('put', `/doctor/courses/${formData.course_id}`, { description: formData.description });
      }
      toast.success('Course added successfully');
      setShowAddModal(false);
      setFormData({ department_id: '', course_id: '', description: '' });
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add course');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await doctorApi('put', `/doctor/courses/${showEditModal.id}`, { description: formData.description });
      toast.success('Course updated');
      setShowEditModal(null);
      setFormData({ department_id: '', course_id: '', description: '' });
      onRefresh();
    } catch (err) {
      toast.error('Failed to update course');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleArchive = async (e, courseId, currentStatus) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const nextStatus = currentStatus === true ? false : true;
    try {
      await doctorApi('patch', `/doctor/courses/${courseId}/archive`, { is_archived: nextStatus });
      toast.success(nextStatus ? 'Archived' : 'Activated');
      setOpenMenuId(null);
      if (onRefresh) await onRefresh();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filteredCourses = courses.filter(c => {
    const isTabMatch = activeTab === 'active' ? !c.is_archived : c.is_archived;
    const isSearchMatch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.toLowerCase().includes(searchQuery.toLowerCase());
    const isDeptMatch = deptFilter === 'all' || c.department_id.toString() === deptFilter;
    return isTabMatch && isSearchMatch && isDeptMatch;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 py-6"
    >
      {/* Dynamic Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Book className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Curriculum Management</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-3">Courses Hub</h2>
          <p className="text-gray-500 dark:text-gray-400 font-semibold max-w-2xl leading-relaxed">
            Manage your academic curriculum, monitor class performance, and organize your teaching resources.
          </p>
        </div>
        
        <div className="flex items-center bg-gray-100/50 dark:bg-white/[0.03] p-1.5 rounded-[2rem] border border-gray-200/50 dark:border-white/5 backdrop-blur-md">
          {['active', 'archive'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-10 py-3 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all duration-300 ${activeTab === tab ? 'bg-white dark:bg-white text-gray-900 dark:text-black shadow-xl shadow-gray-200 dark:shadow-none' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          className="w-full lg:w-auto bg-gray-900 dark:bg-white text-white dark:text-black font-black px-10 py-5 rounded-[2rem] flex items-center justify-center gap-4 shadow-2xl transition-all"
        >
          <Plus className="w-6 h-6" />
          <span className="text-xs uppercase tracking-widest">Enroll New Course</span>
        </motion.button>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-64 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-[1.5rem] py-4 pl-14 pr-6 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-violet-500/5 transition-all font-semibold"
            />
          </div>

          <div className="relative w-full sm:w-60">
             <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <select 
               value={deptFilter}
               onChange={(e) => setDeptFilter(e.target.value)}
               className="w-full bg-white/50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-[1.5rem] py-4 pl-14 pr-12 text-gray-900 dark:text-white font-black text-xs uppercase tracking-widest focus:outline-none transition-all appearance-none cursor-pointer"
             >
               <option value="all" className="bg-white dark:bg-black">All Departments</option>
               {departments.map(d => <option key={d.id} value={d.id} className="bg-white dark:bg-black">{d.name}</option>)}
             </select>
             <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredCourses.map((course) => {
            const progress = Math.min(100, Math.max(25, (course.id * 13) % 100));
            
            return (
              <motion.div 
                key={course.id}
                variants={itemVariants}
                layout
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white/40 dark:bg-white/[0.02] border border-gray-200/50 dark:border-white/5 p-8 rounded-[3rem] hover:border-violet-500/30 transition-all group relative overflow-hidden backdrop-blur-sm"
              >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/5 hidden rounded-full -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div className="w-16 h-16 rounded-[1.75rem] bg-gray-100/50 dark:bg-white/5 flex items-center justify-center border border-gray-200/30 dark:border-white/5 group-hover:scale-110 group-hover:bg-violet-500/10 transition-all duration-500">
                     <Layers className="w-8 h-8 text-gray-400 group-hover:text-violet-500 transition-colors" />
                  </div>
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === course.id ? null : course.id);
                      }}
                      className="w-12 h-12 rounded-2xl hover:bg-gray-100/50 dark:hover:bg-white/5 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {/* Action Menu */}
                    <AnimatePresence>
                      {openMenuId === course.id && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.95 }}
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-14 w-60 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-[2rem] shadow-2xl z-[100] overflow-hidden"
                        >
                          <button 
                            onClick={() => {
                              setFormData({ department_id: course.department_id, course_id: course.id, description: course.description || '' });
                              setShowEditModal(course);
                              setOpenMenuId(null);
                            }}
                            className="w-full flex items-center gap-3 px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-left"
                          >
                            <Edit3 className="w-4 h-4 text-violet-500" /> Manage Info
                          </button>
                          <button 
                            onClick={(e) => handleToggleArchive(e, course.id, course.is_archived)}
                            className="w-full flex items-center gap-3 px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-left border-t border-gray-100 dark:border-white/5"
                          >
                            <Archive className={`w-4 h-4 ${course.is_archived ? 'text-emerald-500' : 'text-amber-500'}`} /> 
                            {course.is_archived ? 'Activate' : 'Archive'}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="relative z-10">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1.5 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors truncate">{course.name}</h3>
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">
                    <span className="px-2.5 py-1 bg-gray-100 dark:bg-white/5 rounded-full">{course.code}</span>
                    <span className="w-1 h-1 bg-gray-300 dark:bg-white/20 rounded-full"></span>
                    <span>Sem {course.semester}</span>
                  </div>
                  
                  <p className="text-gray-500 dark:text-gray-500 text-[14px] leading-relaxed mb-8 line-clamp-2 min-h-[3rem] font-medium">
                    {course.description || `Specialized course focusing on the advanced principles of ${course.name.toLowerCase()}.`}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex -space-x-2">
                        {[1,2,3].map(i => (
                          <div key={i} className="w-7 h-7 rounded-full border-2 border-white dark:border-[#0a0a0a] bg-gray-200 dark:bg-white/10 flex items-center justify-center overflow-hidden">
                            <img src={`https://i.pravatar.cc/100?u=${course.id+i}`} alt="student" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                      <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{course.student_count || 0} Students</span>
                    </div>
                    <span className="text-[11px] font-black text-violet-500 uppercase tracking-widest">{progress}% syllabus</span>
                  </div>

                  <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1.5, ease: "circOut" }}
                      className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full"
                    ></motion.div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredCourses.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full py-32 text-center"
          >
             <div className="w-24 h-24 bg-gray-100/50 dark:bg-white/[0.02] rounded-[3rem] flex items-center justify-center mx-auto mb-8 border border-gray-200/50 dark:border-white/5">
                <BookOpen className="w-10 h-10 text-gray-300 dark:text-white/10" />
             </div>
             <p className="text-gray-400 dark:text-gray-500 text-xl font-bold">No academic materials found.</p>
          </motion.div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 w-full max-w-2xl rounded-[3.5rem] p-12 relative shadow-2xl"
            >
              <button 
                onClick={() => { setShowAddModal(false); setShowEditModal(null); setFormData({ department_id: '', course_id: '', description: '' }); }}
                className="absolute top-10 right-10 w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all border border-transparent hover:border-gray-200 dark:hover:border-white/10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="mb-12">
                <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-6">
                  <Sparkles className="w-7 h-7 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
                  {showAddModal ? 'Course Enrollment' : 'Edit Curriculum'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 font-semibold leading-relaxed">
                  {showAddModal ? 'Join a new academic course to begin managing your student materials.' : 'Keep your course description up to date for your students.'}
                </p>
              </div>

              <form onSubmit={showAddModal ? handleAssignCourse : handleUpdateCourse} className="space-y-8">
                {showAddModal && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Department</label>
                      <div className="relative">
                        <select 
                          required
                          value={formData.department_id}
                          onChange={(e) => setFormData({...formData, department_id: e.target.value, course_id: ''})}
                          className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl py-5 px-8 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500/30 transition-all font-bold appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-white dark:bg-black">Select...</option>
                          {departments.map(d => <option key={d.id} value={d.id} className="bg-white dark:bg-black">{d.name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Academic Course</label>
                      <div className="relative">
                        <select 
                          required
                          disabled={!formData.department_id}
                          value={formData.course_id}
                          onChange={(e) => setFormData({...formData, course_id: e.target.value})}
                          className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl py-5 px-8 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500/30 transition-all font-bold appearance-none cursor-pointer disabled:opacity-30"
                        >
                          <option value="" className="bg-white dark:bg-black">Select...</option>
                          {availableCourses.map(c => (
                            <option key={c.id} value={c.id} className="bg-white dark:bg-black">
                              {c.name} ({c.code})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description / Overview</label>
                  <textarea 
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Enter a professional overview of your teaching approach..."
                    className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-3xl py-6 px-8 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500/30 transition-all font-semibold resize-none"
                  />
                </div>

                <div className="pt-4">
                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={loading || (showAddModal && !formData.course_id)}
                    className="w-full bg-gray-900 dark:bg-white text-white dark:text-black font-black py-6 rounded-[2.5rem] shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-4 group"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-4 border-gray-400 border-t-gray-900 dark:border-gray-200 dark:border-t-black rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span className="text-xs uppercase tracking-[0.2em]">{showAddModal ? 'Add to My Courses' : 'Update Curriculum'}</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DoctorCourses;
