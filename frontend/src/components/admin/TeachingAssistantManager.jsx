import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
  Plus, Edit3, Trash2, X, Mail, 
  Search, UserCircle, Phone
} from 'lucide-react';

const TeachingAssistantManager = () => {
  const { t, i18n } = useTranslation();
  const [tas, setTAs] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedTA, setSelectedTA] = useState(null);
  const [taCourses, setTACourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', department_id: ''
  });

  useEffect(() => { fetchTAs(); fetchCourses(); }, []);

  const fetchTAs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/teaching-assistants');
      setTAs(res.data);
    } catch (error) {
      toast.error(t('admin.messages.load_tas_failed'));
    } finally { setLoading(false); }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data);
    } catch (error) { console.error(error); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (modalType === 'edit') {
        await api.put(`/admin/teaching-assistants/${selectedTA.id}`, formData);
      } else {
        await api.post('/admin/teaching-assistants', formData);
      }
      toast.success(t('common.success'));
      setModalType(null);
      fetchTAs();
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.messages.operation_failed'));
    } finally { setLoading(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(t('admin.assistants.delete_confirm'))) return;
    try {
      await api.delete(`/admin/teaching-assistants/${id}`);
      toast.success(t('common.success'));
      fetchTAs();
    } catch (error) {
      toast.error(t('admin.messages.delete_ta_failed'));
    }
  };

  const openEditModal = (ta) => {
    setSelectedTA(ta);
    setFormData({
      name: ta.name || '', email: ta.email || '', password: '',
      phone: ta.phone || '', department_id: ta.department_id || ''
    });
    setModalType('edit');
  };

  const openCoursesModal = async (ta) => {
    setSelectedTA(ta);
    try {
      const res = await api.get(`/admin/teaching-assistants/${ta.id}/courses`);
      setTACourses(res.data || []);
    } catch (error) { toast.error(t('admin.messages.load_tas_failed')); }
    setModalType('courses');
  };

  const removeCourse = async (taId, courseId) => {
    try {
      await api.delete(`/admin/teaching-assistants/${taId}/courses/${courseId}`);
      toast.success(t('common.success'));
      setTACourses(prev => prev.filter(c => c.id !== courseId));
    } catch (error) { toast.error(t('admin.messages.operation_failed')); }
  };

  const addCourse = async (e) => {
    e.preventDefault();
    const courseId = e.target.courseId.value;
    if (!courseId) return;
    try {
      await api.post(`/admin/teaching-assistants/${selectedTA.id}/courses`, { courseId });
      toast.success(t('common.success'));
      const res = await api.get(`/admin/teaching-assistants/${selectedTA.id}/courses`);
      setTACourses(res.data || []);
      e.target.reset();
    } catch (error) { toast.error(t('admin.messages.operation_failed')); }
  };

  const filteredTAs = tas.filter(ta =>
    ta.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ta.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderModal = (visible, onClose, title, icon, children) =>
    visible && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div onClick={onClose} className="absolute inset-0 bg-black/40" />
        <div className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-gray-700 rounded-xl w-full max-w-md relative z-10 p-6" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#059669]/10 rounded-lg flex items-center justify-center text-[#059669]">{icon}</div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          {children}
        </div>
      </div>
    );

  return (
    <div className="space-y-6 pb-10 max-w-[1400px] mx-auto w-full px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.assistants.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{tas.length} {t('admin.assistants.active_count')}</p>
        </div>
        <button onClick={() => { setSelectedTA(null); setFormData({ name: '', email: '', password: '', phone: '', department_id: '' }); setModalType('add'); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" />{t('admin.assistants.add_ta')}
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('admin.assistants.search_placeholder')}
          className="w-full bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTAs.length === 0 ? (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
            <UserCircle className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-400">{t('admin.assistants.no_tas')}</p>
          </div>
        ) : (
          filteredTAs.map((ta) => (
            <div key={ta.id} className="bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <UserCircle className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{ta.name}</h3>
                    <p className="text-xs text-gray-400">{ta.email}</p>
                  </div>
                </div>
              </div>
              {ta.phone && <p className="text-xs text-gray-400 mb-2"><Phone className="w-3 h-3 inline mr-1" />{ta.phone}</p>}
              <div className="flex gap-1.5 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button onClick={() => openEditModal(ta)} className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors">
                  <Edit3 className="w-3.5 h-3.5 inline mr-1" />{t('common.edit')}
                </button>
                <button onClick={() => openCoursesModal(ta)} className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-[#059669] hover:bg-[#059669]/10 rounded-lg transition-colors">
                  {t('admin.assistants.courses')}
                </button>
                <button onClick={() => handleDelete(ta.id, ta.name)} className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {(modalType === 'add' || modalType === 'edit') && renderModal(
        modalType === 'add' || modalType === 'edit',
        () => setModalType(null),
        modalType === 'edit' ? t('admin.assistants.edit_ta') : t('admin.assistants.add_ta'),
        modalType === 'edit' ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />,
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">{t('admin.assistants.name')} *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">{t('admin.assistants.email')} *</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">{t('admin.assistants.password')}</label>
            <input type="text" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">{t('admin.assistants.phone')}</label>
            <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none" />
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="submit" disabled={loading} className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
              {loading ? '...' : (modalType === 'edit' ? t('common.save') : t('admin.assistants.add_ta'))}
            </button>
            <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors">
              {t('common.cancel')}
            </button>
          </div>
        </form>
      )}

      {/* Courses Modal */}
      {modalType === 'courses' && selectedTA && renderModal(
        true, () => setModalType(null), t('admin.assistants.courses'),
        <Mail className="w-5 h-5" />,
        <>
          <form onSubmit={addCourse} className="flex gap-2 mb-4">
            <select name="courseId" className="flex-1 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none">
              <option value="">{t('admin.assistants.select_course')}</option>
              {courses.filter(c => !taCourses.find(dc => dc.id === c.id)).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button type="submit" className="px-3 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </form>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {taCourses.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">{t('admin.assistants.no_courses_assigned')}</p>
            ) : (
              taCourses.map(c => (
                <div key={c.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-900 dark:text-white">{c.name}</span>
                  <button onClick={() => removeCourse(selectedTA.id, c.id)} className="text-red-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TeachingAssistantManager;
