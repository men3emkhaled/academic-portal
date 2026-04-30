import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  LayoutDashboard, Building2, Tag, FileText, 
  Plus, Edit3, Trash2, Activity, ChevronRight,
  Shield, Map, X
} from 'lucide-react';

const DepartmentManager = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });

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
        toast.success('New department node initialized');
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
    if (!window.confirm(`Delete department node "${name}"? Courses will have their department link detached.`)) return;
    try {
      await api.delete(`/departments/${id}`);
      toast.success('Node decommissioned successfully');
      fetchDepartments();
    } catch (error) {
      toast.error('Decommissioning failed');
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

  return (
    <div className="animate-fadeIn pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-2 h-10 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3 transition-colors">
              <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" /> Department Units
            </h2>
            <p className="text-gray-500 dark:text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-1 transition-colors">Institutional Structure Mapping</p>
          </div>
        </div>
        <button 
          onClick={() => setShowForm(true)} 
          className="admin-btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> New Department
        </button>
      </div>

      {/* Main Grid: Data Table */}
      <div className="bg-white dark:bg-[#111111]/40 border border-gray-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative transition-colors">
        
        <div className="p-8 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] flex justify-between items-center relative z-10 transition-colors">
            <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.1em] transition-colors">Unit Directory</span>
            </div>
            <span className="text-xs font-bold text-gray-500 dark:text-slate-500 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-lg border border-gray-200 dark:border-white/5 transition-colors">{departments.length} Units Active</span>
        </div>

        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-white/[0.01] transition-colors">
                <th className="py-5 px-8 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] w-32 transition-colors">Identifier</th>
                <th className="py-5 px-6 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] transition-colors">Unit Name</th>
                <th className="py-5 px-6 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] transition-colors">Purpose & Info</th>
                <th className="py-5 px-8 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] text-right transition-colors">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.03]">
              {departments.length === 0 ? (
                <tr>
                    <td colSpan="4" className="text-center py-24 grayscale opacity-10">
                        <Map className="w-16 h-16 text-gray-400 dark:text-white mx-auto mb-4" />
                        <p className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-white">No structural units mapped yet.</p>
                    </td>
                </tr>
              ) : (
                departments.map(dept => (
                  <tr key={dept.id} className="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-6 px-8">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-black uppercase tracking-widest transition-colors">
                        {dept.code}
                      </span>
                    </td>
                    <td className="py-6 px-6">
                      <p className="text-gray-900 dark:text-white font-black tracking-tight leading-tight transition-colors">{dept.name}</p>
                    </td>
                    <td className="py-6 px-6">
                      <p className="text-gray-500 dark:text-slate-500 text-sm italic font-medium max-w-sm truncate transition-colors">
                        {dept.description || 'No system description provided.'}
                      </p>
                    </td>
                    <td className="py-6 px-8">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => editDepartment(dept)} 
                          className="w-11 h-11 flex items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-600 dark:hover:bg-purple-500 hover:text-white transition-all shadow-lg shadow-purple-500/0 hover:shadow-purple-500/20"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(dept.id, dept.name)} 
                          className="w-11 h-11 flex items-center justify-center rounded-2xl bg-red-500/10 text-red-600 dark:text-red-500 hover:bg-red-600 dark:hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/0 hover:shadow-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="admin-modal-backdrop" onClick={resetForm}>
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-10 w-full max-w-2xl shadow-2xl relative overflow-hidden animate-fadeInUp transition-colors" onClick={e => e.stopPropagation()}>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-purple-500/10 dark:bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/20 dark:border-purple-500/30 transition-colors">
                    <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">
                      {editingDept ? 'Update Unit Node' : 'Initialize New Unit'}
                    </h3>
                    <p className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest transition-colors">Metadata Registry Interface</p>
                  </div>
                </div>
                <button onClick={resetForm} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-gray-500 dark:text-slate-300 ml-4 text-[10px] font-bold uppercase tracking-widest transition-colors">Short Code</label>
                    <input
                      type="text"
                      placeholder="e.g. AI"
                      value={formData.code}
                      onChange={e => setFormData({ ...formData, code: e.target.value })}
                      className="admin-input"
                      required
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-gray-500 dark:text-slate-300 ml-4 text-[10px] font-bold uppercase tracking-widest transition-colors">Unit Full Title</label>
                    <input
                      type="text"
                      placeholder="Full Designation"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="admin-input"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-500 dark:text-slate-300 ml-4 text-[10px] font-bold uppercase tracking-widest transition-colors">Purpose Description</label>
                  <textarea
                    placeholder="Describe unit jurisdiction..."
                    rows="4"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="admin-input scrollbar-hide"
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <button type="submit" disabled={loading} className="flex-1 admin-btn-primary h-[65px] font-black uppercase tracking-widest shadow-lg shadow-purple-500/20">
                    {loading ? <Activity className="w-6 h-6 animate-spin mx-auto" /> : (editingDept ? 'PULL UPDATES' : 'COMMIT DEPLOYMENT')}
                  </button>
                  <button type="button" onClick={resetForm} className="px-10 py-5 admin-btn-secondary h-[65px] font-bold uppercase transition-colors">
                    ABORT
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

export default DepartmentManager;