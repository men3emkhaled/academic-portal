import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  BookOpen, Plus, Edit3, Trash2, 
  Layers, CheckCircle, Activity,
  ChevronRight, Tag, AlignLeft, LayoutDashboard, Clock
} from 'lucide-react';

const CoursesManager = ({ departments }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    semester: '1',
    credits: '3',
    department_id: '',
    description: ''
  });

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/courses');
      setCourses(res.data);
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingCourse) {
        await api.put(`/courses/${editingCourse.id}`, formData);
        toast.success('Course updated successfully');
      } else {
        await api.post('/courses', formData);
        toast.success('Course added successfully');
      }
      resetForm();
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the course "${name}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/courses/${id}`);
      toast.success('Course deleted successfully');
      fetchCourses();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const editCourse = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      code: course.code,
      semester: course.semester,
      credits: course.credits,
      department_id: course.department_id || '',
      description: course.description || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingCourse(null);
    setFormData({
      name: '',
      code: '',
      semester: '1',
      credits: '3',
      department_id: '',
      description: ''
    });
  };

  return (
    <div className="animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-inner">
            <BookOpen className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Courses
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold mt-1">Manage academic courses and materials</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3.5 px-6 rounded-xl shadow-md hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-5 h-5" /> Add Course
        </button>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-gray-200 dark:border-white/5 border-dashed rounded-[2.5rem] bg-gray-50/50 dark:bg-black/20">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400 font-bold text-lg">No courses found.</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Click "Add Course" to get started.</p>
          </div>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="group relative bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2rem] p-6 hover:shadow-xl hover:-translate-y-1 hover:border-emerald-500/30 transition-all duration-300 overflow-hidden">
                {/* Background Glow */}
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[30px] group-hover:bg-emerald-500/10 dark:group-hover:bg-emerald-500/20 transition-all pointer-events-none"></div>

                <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-black/50 rounded-xl flex items-center justify-center border border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-400 shadow-inner group-hover:text-emerald-500 group-hover:bg-emerald-500/10 transition-colors">
                            <Layers className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/5">
                            {course.code}
                        </span>
                    </div>
                    <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                        <button onClick={() => editCourse(course)} className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500 hover:text-white transition-all shadow-sm"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(course.id, course.name)} className="p-2.5 rounded-xl bg-red-50 dark:bg-rose-500/10 text-red-600 dark:text-rose-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 className="w-4 h-4" /></button>
                    </div>
                </div>

                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-tight mb-5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors relative z-10 line-clamp-2 min-h-[3.5rem]">{course.name}</h3>
                
                <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-[11px] font-bold">
                      <Clock className="w-3 h-3" /> Semester {course.semester}
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
                      <BookOpen className="w-3 h-3" /> {course.credits} Credits
                    </span>
                    {course.department_name && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-[11px] font-bold truncate max-w-[150px]">
                          <LayoutDashboard className="w-3 h-3" /> {course.department_name}
                        </span>
                    )}
                </div>

                <div className="pt-5 border-t border-gray-100 dark:border-white/10 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Active Course</span>
                    </div>
                </div>
            </div>
          ))
        )}
      </div>

      {/* Cinematic Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={resetForm}>
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8 md:p-10 w-full max-w-3xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
             
             {/* Modal Background Glow */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none"></div>

             <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100 dark:border-white/10">
                    <div className="w-14 h-14 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                        {editingCourse ? <Edit3 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                            {editingCourse ? 'Edit Course' : 'Add New Course'}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-bold mt-1">Enter course details below</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-5">
                            <h5 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Tag className="w-4 h-4" /> Basic Info</h5>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Course Name <span className="text-rose-500">*</span></label>
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3.5 font-semibold focus:ring-2 focus:ring-emerald-500/50 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all shadow-inner" placeholder="e.g. Introduction to Programming" required />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Course Code <span className="text-rose-500">*</span></label>
                                <input type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3.5 font-semibold focus:ring-2 focus:ring-emerald-500/50 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all shadow-inner uppercase" placeholder="e.g. CS-101" required />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-5">
                            <h5 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Layers className="w-4 h-4" /> Details</h5>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Semester</label>
                                    <input type="number" value={formData.semester} onChange={e => setFormData({ ...formData, semester: e.target.value })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3.5 font-semibold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-inner" min="1" max="12" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Credit Hours</label>
                                    <input type="number" value={formData.credits} onChange={e => setFormData({ ...formData, credits: e.target.value })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3.5 font-semibold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-inner" min="1" max="10" />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Department</label>
                                <div className="relative">
                                    <select value={formData.department_id} onChange={e => setFormData({ ...formData, department_id: e.target.value })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3.5 font-semibold focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-inner appearance-none">
                                        <option value="">-- No Department --</option>
                                        {departments.map(d => (
                                            <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-4 pointer-events-none text-gray-400">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 pt-2">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 flex items-center gap-2"><AlignLeft className="w-4 h-4" /> Course Description</label>
                        <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-emerald-500/50 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all shadow-inner resize-none scrollbar-hide" rows="3" placeholder="Briefly describe what this course is about..." />
                    </div>

                    <div className="flex gap-4 pt-6 border-t border-gray-100 dark:border-white/10">
                        <button type="submit" disabled={loading} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50">
                            {loading ? 'Saving...' : (editingCourse ? 'Update Course' : 'Add Course')}
                        </button>
                        <button type="button" onClick={resetForm} className="px-8 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white font-bold py-4 rounded-2xl transition-all">
                            Cancel
                        </button>
                    </div>
                </form>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesManager;