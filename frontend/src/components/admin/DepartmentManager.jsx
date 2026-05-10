import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  LayoutDashboard, Building2, Tag, FileText, 
  Plus, Edit3, Trash2, Activity, ChevronRight,
  Shield, Map, X, Database, Layers, Landmark,
  Search, Filter, Save, Sparkles
} from 'lucide-react';

const DepartmentManager = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/departments');
      setDepartments(res.data);
    } catch (error) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingDept) {
        await api.put(`/departments/${editingDept.id}`, formData);
        toast.success('Department updated successfully');
      } else {
        await api.post('/departments', formData);
        toast.success('New department added successfully');
      }
      resetForm();
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete department "${name}"? Courses linked to this department will be disconnected.`)) return;
    try {
      await api.delete(`/departments/${id}`);
      toast.success('Department deleted successfully');
      fetchDepartments();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const editDepartment = (dept) => {
    setEditingDept(dept);
    setFormData({ name: dept.name, code: dept.code, description: dept.description || '' });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingDept(null);
    setFormData({ name: '', code: '', description: '' });
  };

  const filteredDepts = departments.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-700 pb-10">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-purple-500/10 dark:bg-purple-500/20 rounded-3xl flex items-center justify-center border border-purple-500/20 shadow-inner relative group">
            <Landmark className="w-8 h-8 text-purple-600 dark:text-purple-400 group-hover:rotate-12 transition-transform" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full border-2 border-white dark:border-[#111]"></div>
          </div>
          <div>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">
              Departments
            </h2>
            <div className="flex items-center gap-3 mt-1.5">
                <span className="text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-[0.2em]">University Structure</span>
                <div className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                <span className="text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-widest">{departments.length} Departments Total</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-gray-400"
            />
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-purple-500/20 transition-all active:scale-95 flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Department
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-48 opacity-50">
           <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-8"></div>
           <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Loading Structure...</p>
        </div>
      ) : filteredDepts.length === 0 ? (
        <div className="bg-white/50 dark:bg-white/[0.02] border-2 border-dashed border-gray-200 dark:border-white/10 rounded-[3rem] py-48 text-center flex flex-col items-center group transition-all duration-500 shadow-sm">
            <div className="w-24 h-24 bg-purple-500/5 dark:bg-purple-500/10 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <Layers className="w-12 h-12 text-purple-400 opacity-50" />
            </div>
            <h4 className="text-xl font-black uppercase tracking-[0.3em] text-gray-900 dark:text-white">No Departments</h4>
            <p className="text-sm font-bold mt-4 tracking-widest text-gray-500">Start by adding a new department or faculty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredDepts.map(dept => (
            <div 
              key={dept.id} 
              className="group relative bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-[2.5rem] p-10 transition-all duration-500 hover:border-purple-500/40 hover:shadow-2xl hover:shadow-purple-500/5"
            >
              {/* Abstract Icon */}
              <div className="absolute top-10 right-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                 <Building2 className="w-32 h-32 text-purple-900 dark:text-white" />
              </div>

              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xl font-black shadow-inner">
                   {dept.code}
                </div>
                <div className="flex items-center gap-2">
                   <button 
                     onClick={() => editDepartment(dept)}
                     className="w-10 h-10 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-xl transition-all flex items-center justify-center"
                   >
                     <Edit3 className="w-4 h-4" />
                   </button>
                   <button 
                     onClick={() => handleDelete(dept.id, dept.name)}
                     className="w-10 h-10 bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all flex items-center justify-center"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </div>

              <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight mb-4 group-hover:text-purple-600 transition-colors">{dept.name}</h3>
              
              <div className="h-px bg-gray-100 dark:bg-white/5 w-12 mb-6 group-hover:w-24 transition-all duration-500"></div>

              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed min-h-[4rem] line-clamp-3 italic">
                {dept.description || 'No description provided for this department.'}
              </p>

              <div className="mt-8 pt-8 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <Database className="w-3.5 h-3.5" /> ID: #{dept.id}
                 </div>
                 <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                    <Activity className="w-3.5 h-3.5" /> Active
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cinematic Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 dark:bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
           <div 
             className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.4)] rounded-[3rem] w-full max-w-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500"
             onClick={e => e.stopPropagation()}
           >
              {/* Modal Header */}
              <div className="p-10 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] flex justify-between items-center">
                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20">
                        <Sparkles className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{editingDept ? 'Edit Department' : 'Add Department'}</h2>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Department Registry Details</p>
                    </div>
                 </div>
                 <button onClick={resetForm} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 rounded-2xl hover:text-purple-600 transition-all shadow-sm">
                    <X className="w-6 h-6" />
                 </button>
              </div>

              {/* Modal Body */}
              <div className="p-10 space-y-8">
                 <form id="dept-form" onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       <div className="space-y-3">
                          <label className="block text-[10px] font-black text-purple-600 uppercase tracking-[0.2em] ml-5">Short Code</label>
                          <input 
                            type="text"
                            required
                            placeholder="e.g. AI"
                            value={formData.code}
                            onChange={(e) => setFormData({...formData, code: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-[1.5rem] py-5 px-8 text-gray-900 dark:text-white text-lg font-black focus:ring-2 focus:ring-purple-500/50 outline-none transition-all shadow-inner"
                          />
                       </div>
                       <div className="md:col-span-2 space-y-3">
                          <label className="block text-[10px] font-black text-purple-600 uppercase tracking-[0.2em] ml-5">Full Name</label>
                          <input 
                            type="text"
                            required
                            placeholder="e.g. Computer Science"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-[1.5rem] py-5 px-8 text-gray-900 dark:text-white text-lg font-black focus:ring-2 focus:ring-purple-500/50 outline-none transition-all shadow-inner"
                          />
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="block text-[10px] font-black text-purple-600 uppercase tracking-[0.2em] ml-5">Description</label>
                       <textarea 
                         rows="4"
                         value={formData.description}
                         onChange={(e) => setFormData({...formData, description: e.target.value})}
                         className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-[1.5rem] p-8 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500/50 outline-none transition-all shadow-inner resize-none"
                         placeholder="Describe department goals..."
                       ></textarea>
                    </div>
                 </form>
              </div>

              {/* Modal Footer */}
              <div className="p-10 border-t border-gray-100 dark:border-white/10 flex justify-end gap-5 bg-gray-50/50 dark:bg-white/[0.02]">
                 <button onClick={resetForm} className="px-10 py-5 rounded-2xl font-black text-gray-500 hover:text-gray-900 transition-all uppercase text-[10px] tracking-[0.2em]">Cancel</button>
                 <button 
                   type="submit" 
                   form="dept-form"
                   className="flex items-center gap-3 bg-purple-600 hover:bg-purple-700 text-white px-12 py-5 rounded-2xl font-black transition-all shadow-xl shadow-purple-500/20 active:scale-95 uppercase text-[10px] tracking-[0.3em]"
                 >
                   <Save className="w-5 h-5" />
                   {editingDept ? 'Save Changes' : 'Add Department'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManager;