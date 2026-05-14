import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, Building2, Tag, FileText, 
  Plus, Edit3, Trash2, Activity, ChevronRight,
  Shield, Map, X, Database, Layers, Landmark,
  Search, Filter, Save, Sparkles, Zap, Box, Info
} from 'lucide-react';

const DepartmentManager = () => {
  const { t } = useTranslation();
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
      toast.error(t('admin.messages.load_depts_failed'));
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
        toast.success(t('common.success'));
      } else {
        await api.post('/departments', formData);
        toast.success(t('common.success'));
      }
      resetForm();
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.messages.operation_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(t('admin.departments.delete_confirm', { name }))) return;
    try {
      await api.delete(`/departments/${id}`);
      toast.success(t('common.success'));
      fetchDepartments();
    } catch (error) {
      toast.error(t('admin.messages.delete_failed'));
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
    <div className="space-y-8 lg:space-y-10 animate-in fade-in duration-700 pb-10">
      {/* Header Bento Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex items-center gap-6 bg-white/50 dark:bg-white/[0.02] backdrop-blur-md border border-gray-100 dark:border-white/5 p-8 rounded-[2.5rem] shadow-sm">
          <div className="w-16 h-16 bg-purple-500/10 dark:bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/20 shadow-inner group transition-transform duration-500 hover:scale-110">
            <Landmark className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {t('admin.departments.title')}
            </h2>
            <p className="text-gray-500 dark:text-slate-500 text-sm font-bold mt-1 uppercase tracking-widest">{t('admin.departments.description')}</p>
          </div>
        </div>
        
        <div className="bg-purple-600 text-white p-8 rounded-[2.5rem] shadow-lg shadow-purple-600/20 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-inline-end-0 top-0 w-32 h-32 bg-white/10 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-black/10 px-3 py-1 rounded-full">{t('admin.departments.structure_nodes')}</span>
          </div>
          <div className="mt-4 relative z-10">
            <p className="text-4xl font-black">{departments.length}</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">{t('admin.departments.total_count', { count: departments.length })}</p>
          </div>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch gap-6">
        <div className="relative flex-1 group">
          <Search className="absolute inset-inline-start-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
          <input 
            type="text"
            placeholder={t('admin.departments.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-[2rem] ps-16 pe-8 py-5 text-gray-900 dark:text-white font-black focus:ring-4 focus:ring-purple-500/10 outline-none transition-all shadow-inner uppercase tracking-widest text-[11px]"
          />
        </div>
        
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 text-white font-black py-4.5 px-10 rounded-[2rem] shadow-xl shadow-purple-600/20 hover:scale-[1.02] active:scale-95 transition-all whitespace-nowrap group/add"
        >
          <Plus className="w-5 h-5 group-hover/add:rotate-180 transition-transform duration-500" /> 
          <span className="uppercase tracking-widest text-xs">{t('admin.departments.add_button')}</span>
        </button>
      </div>

      {/* Main Grid Layout */}
      <AnimatePresence mode="wait">
      {loading ? (
        <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-48 opacity-50"
        >
           <Activity className="w-16 h-16 text-purple-500 animate-spin mb-8" />
           <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500">{t('admin.departments.syncing')}</p>
        </motion.div>
      ) : filteredDepts.length === 0 ? (
        <motion.div 
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/50 dark:bg-white/[0.01] border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[3rem] py-48 text-center flex flex-col items-center group transition-all duration-500 shadow-sm"
        >
            <div className="w-24 h-24 bg-purple-500/5 dark:bg-purple-500/10 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <Layers className="w-12 h-12 text-purple-400/30" />
            </div>
            <h4 className="text-xl font-black uppercase tracking-[0.3em] text-gray-900 dark:text-white">{t('admin.departments.no_departments')}</h4>
            <p className="text-[10px] font-black mt-4 uppercase tracking-widest text-gray-400">{t('admin.departments.no_departments_hint')}</p>
        </motion.div>
      ) : (
        <motion.div 
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
        >
          {filteredDepts.map((dept, idx) => (
            <motion.div 
              key={dept.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group relative bg-white dark:bg-white/[0.01] backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-10 transition-all duration-500 hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/10"
            >
                {/* Visual Identity */}
                <div className="absolute inset-inline-end-10 top-10 opacity-0 group-hover:opacity-5 transition-opacity duration-1000 pointer-events-none">
                    <Building2 className="w-32 h-32 text-purple-500" />
                </div>

                <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="w-16 h-16 bg-purple-500/5 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/10 text-purple-600 dark:text-purple-400 text-xl font-black shadow-inner group-hover:bg-purple-600 group-hover:text-white transition-all duration-700">
                       {dept.code}
                    </div>
                    <div className="flex gap-2.5 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                       <button 
                         onClick={() => editDepartment(dept)}
                         className="w-10 h-10 bg-blue-500/5 text-blue-500 border border-blue-500/10 hover:bg-blue-500 hover:text-white rounded-xl transition-all flex items-center justify-center shadow-sm"
                       >
                         <Edit3 className="w-4.5 h-4.5" />
                       </button>
                       <button 
                         onClick={() => handleDelete(dept.id, dept.name)}
                         className="w-10 h-10 bg-rose-500/5 text-rose-500 border border-rose-500/10 hover:bg-rose-500 hover:text-white rounded-xl transition-all flex items-center justify-center shadow-sm"
                       >
                         <Trash2 className="w-4.5 h-4.5" />
                       </button>
                    </div>
                </div>

                <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight mb-4 group-hover:text-purple-600 transition-colors uppercase tracking-tight relative z-10">{dept.name}</h3>
                
                <div className="h-1 bg-purple-500/20 dark:bg-white/5 w-12 mb-6 group-hover:w-24 group-hover:bg-purple-500 transition-all duration-700 relative z-10"></div>

                <p className="text-xs font-bold text-gray-500 dark:text-slate-500 leading-relaxed min-h-[4.5rem] line-clamp-3 italic relative z-10">
                  {dept.description || t('admin.departments.no_desc')}
                </p>

                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/5 flex items-center justify-between relative z-10">
                   <div className="flex items-center gap-2.5 text-[9px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-widest">
                      <Database className="w-4 h-4 text-purple-500/40" /> ID: #{dept.id}
                   </div>
                   <div className="flex items-center gap-2.5 text-[9px] font-black text-emerald-500 uppercase tracking-widest group-hover:animate-pulse">
                      <Activity className="w-4 h-4" /> {t('admin.departments.active_status')}
                   </div>
                </div>
            </motion.div>
          ))}
        </motion.div>
      )}
      </AnimatePresence>

      {/* Department Form Modal */}
      <AnimatePresence>
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={resetForm} className="absolute inset-0 bg-gray-950/40 dark:bg-black/80 backdrop-blur-md" />
           <motion.div 
             initial={{ opacity: 0, scale: 0.9, y: 20 }} 
             animate={{ opacity: 1, scale: 1, y: 0 }} 
             exit={{ opacity: 0, scale: 0.9, y: 20 }} 
             className="bg-white dark:bg-[#080808] border border-gray-100 dark:border-white/5 shadow-2xl rounded-[3.5rem] w-full max-w-2xl overflow-hidden relative z-10"
             onClick={e => e.stopPropagation()}
           >
              {/* Modal Background Glow */}
              <div className="absolute top-0 inset-inline-end-0 w-80 h-80 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"></div>

              {/* Modal Header */}
              <div className="p-10 lg:p-12 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01] flex justify-between items-center relative z-10">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-purple-500/10 dark:bg-purple-500/20 rounded-[1.5rem] flex items-center justify-center border border-purple-500/20 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-500">
                        <Sparkles className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">{editingDept ? t('admin.departments.modals.edit_dept') : t('admin.departments.modals.new_dept')}</h2>
                        <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-1">{t('admin.departments.registry_alignment')}</p>
                    </div>
                 </div>
                 <button onClick={resetForm} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-500 rounded-2xl hover:text-purple-600 transition-all shadow-sm">
                    <X className="w-6 h-6" />
                 </button>
              </div>

              {/* Modal Body */}
              <div className="p-10 lg:p-12 space-y-8 relative z-10">
                 <form id="dept-form" onSubmit={handleSubmit} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.departments.modals.short_code')} *</label>
                          <div className="relative group/code">
                              <Box className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/code:text-purple-500 transition-colors" />
                              <input 
                                type="text"
                                required
                                placeholder={t('admin.departments.modals.placeholder_code')}
                                value={formData.code}
                                onChange={(e) => setFormData({...formData, code: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-2xl ps-14 pe-6 py-5 text-gray-900 dark:text-white font-black focus:ring-4 focus:ring-purple-500/10 outline-none transition-all shadow-inner uppercase tracking-widest text-sm"
                              />
                          </div>
                       </div>
                       <div className="md:col-span-2 space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.departments.modals.full_name')} *</label>
                          <div className="relative group/name">
                              <Landmark className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/name:text-purple-500 transition-colors" />
                              <input 
                                type="text"
                                required
                                placeholder={t('admin.departments.modals.placeholder_name')}
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-2xl ps-14 pe-6 py-5 text-gray-900 dark:text-white font-black focus:ring-4 focus:ring-purple-500/10 outline-none transition-all shadow-inner uppercase tracking-widest text-sm"
                              />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.departments.modals.description')}</label>
                       <div className="relative group/desc">
                          <Info className="absolute inset-inline-start-6 top-6 w-5 h-5 text-gray-400 group-focus-within/desc:text-purple-500 transition-colors" />
                          <textarea 
                            rows="4"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-[2.5rem] ps-16 pe-8 py-6 text-gray-900 dark:text-white font-bold focus:ring-4 focus:ring-purple-500/10 outline-none transition-all shadow-inner resize-none min-h-[140px]"
                            placeholder={t('admin.departments.modals.placeholder_desc')}
                          ></textarea>
                       </div>
                    </div>
                 </form>
              </div>

              {/* Modal Footer */}
              <div className="p-10 lg:p-12 border-t border-gray-100 dark:border-white/5 flex justify-inline-end gap-6 bg-gray-50/50 dark:bg-white/[0.01] relative z-10">
                 <button onClick={resetForm} className="px-10 py-5 rounded-[2rem] font-black text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white transition-all uppercase text-[10px] tracking-widest">{t('common.cancel')}</button>
                 <button 
                   type="submit" 
                   form="dept-form"
                   disabled={loading}
                   className="flex items-center gap-3 bg-purple-600 hover:bg-purple-700 text-white px-14 py-5 rounded-[2.5rem] font-black transition-all shadow-xl shadow-purple-600/20 active:scale-95 disabled:opacity-50 uppercase text-[10px] tracking-widest"
                 >
                   {loading ? <Activity className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                   {editingDept ? t('common.save') : t('common.save')}
                 </button>
              </div>
           </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default DepartmentManager;