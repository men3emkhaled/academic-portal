import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, Building2, Plus, Edit3, Trash2, 
  Search, X, CheckCircle
} from 'lucide-react';

const DepartmentManager = () => {
  const { t, i18n } = useTranslation();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchDepartments(); }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/departments');
      setDepartments(res.data);
    } catch (error) {
      toast.error(t('admin.messages.load_depts_failed'));
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingDept) {
        await api.put(`/departments/${editingDept.id}`, formData);
      } else {
        await api.post('/departments', formData);
      }
      toast.success(t('common.success'));
      setShowForm(false);
      setEditingDept(null);
      setFormData({ name: '', code: '', description: '' });
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.messages.operation_failed'));
    } finally { setLoading(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(t('admin.departments.delete_confirm', { name }))) return;
    try {
      await api.delete(`/departments/${id}`);
      toast.success(t('common.success'));
      fetchDepartments();
    } catch (error) {
      toast.error(t('admin.messages.delete_dept_failed'));
    }
  };

  const editDept = (dept) => {
    setEditingDept(dept);
    setFormData({ name: dept.name || '', code: dept.code || '', description: dept.description || '' });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingDept(null);
    setFormData({ name: '', code: '', description: '' });
  };

  const filtered = departments.filter(d =>
    d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-10 max-w-[1200px] mx-auto w-full px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.departments.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{departments.length} {t('admin.departments.active_count')}</p>
        </div>
        <button onClick={() => { setEditingDept(null); setFormData({ name: '', code: '', description: '' }); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" />{t('admin.departments.add_department')}
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('admin.departments.search_placeholder')}
          className="w-full bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
            <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-400">{t('admin.departments.no_departments')}</p>
          </div>
        ) : (
          filtered.map((dept) => (
            <div key={dept.id} className="bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#059669]/10 rounded-lg flex items-center justify-center">
                    <LayoutDashboard className="w-5 h-5 text-[#059669]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{dept.name}</h3>
                    <p className="text-xs text-gray-400">{dept.code || '—'}</p>
                  </div>
                </div>
              </div>
              {dept.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{dept.description}</p>}
              <div className="flex gap-1.5 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button onClick={() => editDept(dept)} className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors">
                  <Edit3 className="w-3.5 h-3.5 inline mr-1" />{t('common.edit')}
                </button>
                <button onClick={() => handleDelete(dept.id, dept.name)} className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={resetForm} className="absolute inset-0 bg-black/40" />
          <div className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-gray-700 rounded-xl w-full max-w-md relative z-10 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#059669]/10 rounded-lg flex items-center justify-center text-[#059669]">
                  {editingDept ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {editingDept ? t('admin.departments.edit_department') : t('admin.departments.add_department')}
                </h3>
              </div>
              <button onClick={resetForm} className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">{t('admin.departments.name')} *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">{t('admin.departments.code')} *</label>
                <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none uppercase" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">{t('admin.departments.description')}</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none resize-none min-h-[60px]" />
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="submit" disabled={loading} className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                  {loading ? '...' : (editingDept ? t('common.save') : t('admin.departments.add_department'))}
                </button>
                <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors">
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManager;
