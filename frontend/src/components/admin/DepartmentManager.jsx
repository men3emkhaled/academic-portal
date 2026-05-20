import React, { useState, useEffect } from 'react';
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
  const { t, i18n } = useTranslation();
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

  const isAr = i18n.language === 'ar';

  return (
    <div className="space-y-8 sm:space-y-16 lg:space-y-24 animate-in fade-in duration-700 pb-20 max-w-[1500px] mx-auto w-full px-4 sm:px-0 text-start relative z-10">
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] inset-inline-end-[-5%] w-[50vw] h-[50vw] bg-[#8b5cf6]/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] inset-inline-start-[-5%] w-[40vw] h-[40vw] bg-[#2cfc7d]/3 blur-[100px] rounded-full"></div>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-10 relative z-10">
        <div className="space-y-2 sm:space-y-4 max-w-2xl text-start">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2cfc7d]"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30">{t('admin.sidebar.tabs.departments')}</span>
          </div>
          <h1 className={`text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-[0.95] tracking-tighter uppercase text-gray-900 dark:text-white ${isAr ? 'font-arabic' : ''}`}>
            {t('admin.departments.title')}
          </h1>
        </div>

        <div className="bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white p-6 sm:p-8 rounded-[2.5rem] shadow-lg shadow-purple-600/20 flex flex-col justify-between relative overflow-hidden group min-w-[280px] w-full lg:w-auto">
          <div className="absolute inset-inline-end-0 top-0 w-32 h-32 bg-white/10 hidden rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-black/10 px-3 py-1 rounded-full">{t('admin.departments.structure_nodes')}</span>
          </div>
          <div className="mt-4 relative z-10 text-start">
            <p className="text-5xl sm:text-6xl font-black tracking-tighter">{departments.length}</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">{t('admin.departments.total_count', { count: departments.length })}</p>
          </div>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 relative z-20">
        <div className="md:col-span-2 relative group">
          <Search className="absolute inset-inline-start-6 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-[#8b5cf6] transition-colors" />
          <input 
            type="text"
            placeholder={t('admin.departments.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[2rem] ps-14 sm:ps-16 pe-6 sm:pe-8 py-4.5 sm:py-6 text-gray-900 dark:text-white font-black text-sm sm:text-lg tracking-tight uppercase focus:ring-4 focus:ring-[#8b5cf6]/10 outline-none transition-all shadow-inner"
          />
        </div>
        
        <button 
          onClick={() => setShowForm(true)}
          className="group bg-black dark:bg-white text-white dark:text-black rounded-[2.5rem] p-6 sm:p-10 flex items-center justify-between gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl relative overflow-hidden text-start w-full"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="flex items-center gap-4 sm:gap-6 relative z-10 text-start">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 dark:bg-black/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-90 transition-all duration-700">
              <Plus className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
               <span className="block text-lg sm:text-xl font-black uppercase tracking-tighter leading-none">{t('admin.departments.add_button')}</span>
               <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-1 block">{t('admin.departments.registry_alignment')}</span>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 sm:w-6 sm:h-6 opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all ${isAr ? 'rotate-180 group-hover:-translate-x-2' : ''}`} />
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="relative z-10">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 sm:py-48 opacity-50">
           <Activity className="w-12 h-12 sm:w-16 sm:h-16 text-[#8b5cf6] animate-spin mb-6 sm:mb-8" />
           <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] text-gray-500">{t('admin.departments.syncing')}</p>
        </div>
      ) : filteredDepts.length === 0 ? (
        <div className="bg-white/50 dark:bg-white/[0.01] border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[3rem] py-32 sm:py-48 text-center flex flex-col items-center group transition-all duration-500 shadow-sm">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#8b5cf6]/5 dark:bg-[#8b5cf6]/10 rounded-full flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-500">
                <Layers className="w-10 h-10 sm:w-12 sm:h-12 text-[#8b5cf6]/30" />
            </div>
            <h4 className="text-lg sm:text-xl font-black uppercase tracking-[0.3em] text-gray-900 dark:text-white">{t('admin.departments.no_departments')}</h4>
            <p className="text-[9px] sm:text-[10px] font-black mt-3 sm:mt-4 uppercase tracking-widest text-gray-400">{t('admin.departments.no_departments_hint')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
          {filteredDepts.map((dept) => (
            <div 
              key={dept.id} 
              className="group relative bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-6 sm:p-10 transition-all duration-500 hover:border-[#8b5cf6]/30 hover:shadow-2xl hover:shadow-purple-500/10 text-start"
            >
                {/* Visual Identity */}
                <div className="absolute inset-inline-end-10 top-10 opacity-0 group-hover:opacity-5 transition-opacity duration-1000 pointer-events-none">
                    <Building2 className="w-32 h-32 text-[#8b5cf6]" />
                </div>

                <div className="flex justify-between items-start mb-6 sm:mb-8 relative z-10">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#8b5cf6]/5 dark:bg-[#8b5cf6]/10 rounded-2xl flex items-center justify-center border border-[#8b5cf6]/10 text-[#8b5cf6] dark:text-[#d4a3ff] text-base sm:text-xl font-black shadow-inner group-hover:bg-[#8b5cf6] group-hover:text-white transition-all duration-700">
                       {dept.code}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                       <button 
                         onClick={() => editDepartment(dept)}
                         className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-500/5 text-blue-500 border border-blue-500/10 hover:bg-blue-500 hover:text-white rounded-xl transition-all flex items-center justify-center shadow-sm"
                       >
                         <Edit3 className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => handleDelete(dept.id, dept.name)}
                         className="w-9 h-9 sm:w-10 sm:h-10 bg-rose-500/5 text-rose-500 border border-rose-500/10 hover:bg-rose-500 hover:text-white rounded-xl transition-all flex items-center justify-center shadow-sm"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight mb-3 sm:mb-4 group-hover:text-[#2cfc7d] transition-colors uppercase tracking-tight relative z-10">{dept.name}</h3>
                
                <div className="h-1 bg-[#8b5cf6]/20 dark:bg-white/5 w-12 mb-4 sm:mb-6 group-hover:w-24 group-hover:bg-[#2cfc7d] transition-all duration-700 relative z-10"></div>

                <p className="text-xs font-bold text-gray-500 dark:text-slate-500 leading-relaxed min-h-[4.5rem] line-clamp-3 italic relative z-10">
                  {dept.description || t('admin.departments.no_desc')}
                </p>

                <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-100 dark:border-white/5 flex items-center justify-between relative z-10">
                   <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-widest">
                      <Database className="w-3.5 h-3.5 text-[#8b5cf6]/40" /> ID: #{dept.id}
                   </div>
                   <div className="flex items-center gap-2 text-[9px] font-black text-[#2cfc7d] uppercase tracking-widest group-hover:animate-pulse">
                      <Activity className="w-3.5 h-3.5" /> {t('admin.departments.active_status')}
                   </div>
                </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {/* Department Form Modal (Using standardized global classes!) */}
      {showForm && (
        <div className="admin-modal-backdrop">
           <div onClick={resetForm} className="absolute inset-0 bg-gray-950/40 dark:bg-black/80 backdrop-blur-sm pointer-events-auto" />
           <div 
             className="admin-modal-panel max-w-2xl w-full z-10"
             onClick={e => e.stopPropagation()}
           >
              {/* Modal Header */}
              <div className="pb-4 sm:pb-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center relative z-10">
                 <div className="flex items-center gap-4 sm:gap-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#8b5cf6]/10 dark:bg-[#8b5cf6]/20 rounded-2xl flex items-center justify-center border border-[#8b5cf6]/20 text-[#8b5cf6] dark:text-[#d4a3ff] transition-transform duration-500">
                        <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase leading-none">{editingDept ? t('admin.departments.modals.edit_dept') : t('admin.departments.modals.new_dept')}</h2>
                        <p className="text-[9px] sm:text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-1.5 block leading-none">{t('admin.departments.registry_alignment')}</p>
                    </div>
                 </div>
                 <button onClick={resetForm} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-colors">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              {/* Modal Body */}
              <div className="pt-6 sm:pt-10 space-y-6 sm:space-y-8 relative z-10">
                 <form id="dept-form" onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.departments.modals.short_code')} *</label>
                          <div className="relative group/code">
                              <Box className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within/code:text-[#8b5cf6] transition-colors" />
                              <input 
                                type="text"
                                required
                                placeholder={t('admin.departments.modals.placeholder_code')}
                                value={formData.code}
                                onChange={(e) => setFormData({...formData, code: e.target.value})}
                                className="admin-input ps-12 uppercase"
                              />
                          </div>
                       </div>
                       <div className="md:col-span-2 space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.departments.modals.full_name')} *</label>
                          <div className="relative group/name">
                              <Landmark className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within/name:text-[#8b5cf6] transition-colors" />
                              <input 
                                type="text"
                                required
                                placeholder={t('admin.departments.modals.placeholder_name')}
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="admin-input ps-12 uppercase"
                              />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.departments.modals.description')}</label>
                       <div className="relative group/desc">
                          <Info className="absolute inset-inline-start-5 top-5 w-4 h-4 text-gray-400 group-focus-within/desc:text-[#8b5cf6] transition-colors" />
                          <textarea 
                            rows="4"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="w-full bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 rounded-[2rem] ps-12 pe-6 py-4.5 text-gray-900 dark:text-white font-bold focus:ring-4 focus:ring-[#8b5cf6]/10 outline-none transition-all shadow-inner resize-none min-h-[120px]"
                            placeholder={t('admin.departments.modals.placeholder_desc')}
                          ></textarea>
                       </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-inline-end gap-4 pt-6 sm:pt-10 border-t border-gray-100 dark:border-white/5">
                       <button 
                         type="submit" 
                         disabled={loading}
                         className="admin-btn-primary w-full sm:flex-1"
                       >
                         {loading ? <Activity className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                         <span>{editingDept ? t('common.save') : t('common.save')}</span>
                       </button>
                       <button type="button" onClick={resetForm} className="admin-btn-secondary w-full sm:px-10">{t('common.cancel')}</button>
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