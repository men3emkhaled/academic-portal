import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  BookOpen, Plus, Edit3, Trash2, 
  Layers, CheckCircle, Activity,
  ChevronRight, Building2, Tag, FileText
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
        toast.success('New course initialized');
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
    if (!window.confirm(`Delete course "${name}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/courses/${id}`);
      toast.success('Course purged successfully');
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
    <div className="animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-2 h-10 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-emerald-500 dark:text-emerald-400" /> Course Registry
            </h2>
            <p className="text-gray-500 dark:text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Academic Curriculum Management</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="admin-btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Initialize Course
        </button>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.length === 0 ? (
          <div className="col-span-full py-20 text-center grayscale opacity-20 border border-gray-200 dark:border-white/5 border-dashed rounded-[2.5rem]">
            <BookOpen className="w-16 h-16 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-slate-500 font-bold uppercase tracking-widest">No course records detected.</p>
          </div>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="group relative bg-white dark:bg-[#111111]/40 border border-gray-200 dark:border-white/5 rounded-[2.5rem] p-8 hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:border-emerald-500/30 transition-all duration-500 shadow-sm dark:shadow-2xl overflow-hidden transition-colors">
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                            <Layers className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-lg border border-gray-200 dark:border-white/5">
                            {course.code}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => editCourse(course)} className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white transition-all"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(course.id, course.name)} className="p-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-500 hover:bg-red-600 dark:hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                </div>

                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-tight mb-4 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{course.name}</h3>
                
                <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-tight">Sem {course.semester}</span>
                    <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-tight">{course.credits} Credits</span>
                    {course.department_name && (
                        <span className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-white/5 text-gray-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-tight truncate">{course.department_name}</span>
                    )}
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest">Active Curriculum</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 dark:text-slate-700 group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-all translate-x-0 group-hover:translate-x-1" />
                </div>
            </div>
          ))
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="admin-modal-backdrop" onClick={resetForm}>
          <div className="admin-modal-panel max-w-4xl" onClick={e => e.stopPropagation()}>
             
             <div className="relative z-10">
                <div className="flex items-center gap-5 mb-12">
                    <div className="w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        <Plus className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                            {editingCourse ? 'Update Module' : 'Initialize Module'}
                        </h3>
                        <p className="text-gray-500 dark:text-slate-500 text-xs font-bold uppercase tracking-widest">Technical Specifications Registry</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h5 className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.3em] mb-4">Core Identity</h5>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4">Full Module Title *</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="admin-input" placeholder="e.g. Advanced AI Systems" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4">System Code *</label>
                                <input type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} className="admin-input" placeholder="CS-401" required />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h5 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] mb-4">Architecture</h5>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4">Semester Slot</label>
                                    <input type="number" value={formData.semester} onChange={e => setFormData({ ...formData, semester: e.target.value })} className="admin-input" min="1" max="12" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4">Credit Units</label>
                                    <input type="number" value={formData.credits} onChange={e => setFormData({ ...formData, credits: e.target.value })} className="admin-input" min="1" max="10" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4">Department Node</label>
                                <select value={formData.department_id} onChange={e => setFormData({ ...formData, department_id: e.target.value })} className="admin-input appearance-none">
                                    <option value="">-- No Assignment --</option>
                                    {departments.map(d => (
                                        <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4">Strategic Curriculum Description</label>
                        <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="admin-input scrollbar-hide" rows="4" placeholder="Brief overview of module objectives and learning outcomes..." />
                    </div>

                    <div className="flex gap-4 pt-8">
                        <button type="submit" disabled={loading} className="flex-1 admin-btn-primary h-[75px] font-black uppercase tracking-widest">
                            {loading ? 'SYNCHRONIZING...' : (editingCourse ? 'COMMIT UPDATES' : 'INITIALIZE MODULE')}
                        </button>
                        <button type="button" onClick={resetForm} className="px-12 admin-btn-secondary h-[75px] font-bold uppercase">ABORT</button>
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