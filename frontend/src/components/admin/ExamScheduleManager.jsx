import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Calendar, Plus, Trash2, Edit3, Clock, X, CheckCircle } from 'lucide-react';

const ExamScheduleManager = ({ departments = [], selectedDepartmentId }) => {
  const { t, i18n } = useTranslation();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [formData, setFormData] = useState({
    course_name: '', exam_type: 'Final', exam_date: '', start_time: '', end_time: '',
    department_id: selectedDepartmentId || ''
  });

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await api.get('/exams/admin', { params: { department_id: selectedDepartmentId } });
      setExams(res.data);
    } catch (error) { toast.error(t('admin.messages.load_exams_failed')); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchExams();
    if (selectedDepartmentId) setFormData(prev => ({ ...prev, department_id: selectedDepartmentId }));
  }, [selectedDepartmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.department_id) { toast.error(t('admin.messages.select_dept_req')); return; }
    setLoading(true);
    try {
      if (editingExam) {
        await api.put(`/exams/admin/${editingExam.id}`, formData);
      } else {
        await api.post('/exams/admin', formData);
      }
      toast.success(t('common.success'));
      setShowAddModal(false);
      setEditingExam(null);
      setFormData({ course_name: '', exam_type: 'Final', exam_date: '', start_time: '', end_time: '', department_id: selectedDepartmentId || '' });
      fetchExams();
    } catch (error) { toast.error(error.response?.data?.message || t('admin.messages.save_exam_failed')); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.exams.delete_confirm'))) return;
    try {
      await api.delete(`/exams/admin/${id}`);
      toast.success(t('common.success'));
      fetchExams();
    } catch (error) { toast.error(t('admin.messages.delete_failed')); }
  };

  const openEditModal = (exam) => {
    setEditingExam(exam);
    setFormData({
      course_name: exam.course_name, exam_type: exam.exam_type,
      exam_date: exam.exam_date.split('T')[0],
      start_time: exam.start_time.substring(0, 5),
      end_time: exam.end_time.substring(0, 5),
      department_id: exam.department_id
    });
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6 pb-10 max-w-[1200px] mx-auto w-full px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.exams.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{exams.length} {t('admin.exams.active_batches')}</p>
        </div>
        <button onClick={() => { setEditingExam(null); setFormData({ course_name: '', exam_type: 'Final', exam_date: '', start_time: '', end_time: '', department_id: selectedDepartmentId || '' }); setShowAddModal(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" />{t('admin.exams.add_button')}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <th className="py-3 px-4 text-xs font-medium text-gray-500 text-start">{t('admin.exams.course_dept')}</th>
                <th className="py-3 px-4 text-xs font-medium text-gray-500 text-center">{t('admin.exams.type')}</th>
                <th className="py-3 px-4 text-xs font-medium text-gray-500 text-start">{t('admin.exams.schedule')}</th>
                <th className="py-3 px-4 text-xs font-medium text-gray-500 text-end">{t('admin.exams.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan="4" className="text-center py-16 text-sm text-gray-400">{t('admin.exams.loading')}</td></tr>
              ) : exams.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-16 text-sm text-gray-400">{t('admin.exams.no_exams')}</td></tr>
              ) : (
                exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{exam.course_name}</p>
                      <p className="text-xs text-gray-400">{exam.department_name || ''}</p>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs ${exam.exam_type === 'Practical' ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600' : 'bg-[#059669]/10 text-[#059669]'}`}>
                        {t(`admin.exams.types.${exam.exam_type}`)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                        <Calendar className="w-4 h-4 text-[#059669]" />
                        {new Date(exam.exam_date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-GB')}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {exam.start_time?.substring(0, 5)} — {exam.end_time?.substring(0, 5)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => openEditModal(exam)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(exam.id)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
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

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-black/40" />
          <div className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-gray-700 rounded-xl w-full max-w-lg relative z-10 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#059669]/10 rounded-lg flex items-center justify-center text-[#059669]">
                  {editingExam ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  {editingExam ? t('admin.exams.modals.edit_exam') : t('admin.exams.modals.add_exam')}
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">{t('admin.exams.modals.course_name')} *</label>
                <input type="text" required value={formData.course_name} onChange={(e) => setFormData({...formData, course_name: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">{t('admin.exams.modals.exam_type')}</label>
                  <select value={formData.exam_type} onChange={(e) => setFormData({...formData, exam_type: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none">
                    <option value="Final">{t('admin.exams.types.Final')}</option>
                    <option value="Practical">{t('admin.exams.types.Practical')}</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">{t('admin.exams.modals.dept_label')} *</label>
                  <select value={formData.department_id} required onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none">
                    <option value="">{t('admin.exams.modals.placeholder_dept')}</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">{t('admin.exams.modals.exam_date')} *</label>
                  <input type="date" required value={formData.exam_date} onChange={(e) => setFormData({...formData, exam_date: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">{t('admin.exams.modals.start_time')} *</label>
                  <input type="time" required value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">{t('admin.exams.modals.end_time')} *</label>
                  <input type="time" required value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="submit" disabled={loading} className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                  {loading ? '...' : <><CheckCircle className="w-4 h-4" />{editingExam ? t('common.save') : t('admin.exams.modals.add_exam')}</>}
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors">
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

export default ExamScheduleManager;
