import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, Plus, Trash2, Edit3, Clock, 
  LayoutDashboard, FileText, X, Activity, 
  ChevronRight, MapPin, Settings, Info, Zap,
  Search, BookOpen, GraduationCap, CheckCircle
} from 'lucide-react';

const ExamScheduleManager = ({ departments, selectedDepartmentId }) => {
  const { t } = useTranslation();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [formData, setFormData] = useState({
    course_name: '',
    exam_type: 'Final',
    exam_date: '',
    start_time: '',
    end_time: '',
    department_id: selectedDepartmentId || ''
  });

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await api.get('/exams/admin', { params: { department_id: selectedDepartmentId } });
      setExams(res.data);
    } catch (error) {
      toast.error(t('admin.messages.load_exams_failed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
    if (selectedDepartmentId) {
      setFormData(prev => ({ ...prev, department_id: selectedDepartmentId }));
    }
  }, [selectedDepartmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.department_id) {
      toast.error(t('admin.messages.select_dept_req'));
      return;
    }
    setLoading(true);
    try {
      if (editingExam) {
        await api.put(`/exams/admin/${editingExam.id}`, formData);
        toast.success(t('common.success'));
      } else {
        await api.post('/exams/admin', formData);
        toast.success(t('common.success'));
      }
      setShowAddModal(false);
      setEditingExam(null);
      setFormData({ course_name: '', exam_type: 'Final', exam_date: '', start_time: '', end_time: '', department_id: selectedDepartmentId || '' });
      fetchExams();
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.messages.save_exam_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.exams.delete_confirm'))) return;
    try {
      await api.delete(`/exams/admin/${id}`);
      toast.success(t('common.success'));
      fetchExams();
    } catch (error) {
      toast.error(t('admin.messages.delete_failed'));
    }
  };

  const openEditModal = (exam) => {
    setEditingExam(exam);
    setFormData({
      course_name: exam.course_name,
      exam_type: exam.exam_type,
      exam_date: exam.exam_date.split('T')[0],
      start_time: exam.start_time.substring(0, 5),
      end_time: exam.end_time.substring(0, 5),
      department_id: exam.department_id
    });
    setShowAddModal(true);
  };

  return (
    <div className="space-y-8 lg:space-y-10 animate-in fade-in duration-700">
      {/* Header Bento Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-start">
        <div className="lg:col-span-2 flex items-center gap-6 bg-white/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 p-8 rounded-[2.5rem] shadow-sm">
          <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner group transition-transform duration-500 hover:scale-110">
            <FileText className="w-8 h-8 text-primary dark:text-primary" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {t('admin.exams.title')}
            </h2>
            <p className="text-gray-500 dark:text-slate-500 text-sm font-bold mt-1 uppercase tracking-widest">{t('admin.exams.description')}</p>
          </div>
        </div>
        
        <div className="bg-primary text-white p-8 rounded-[2.5rem] shadow-lg shadow-primary/20 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-inline-end-0 top-0 w-32 h-32 bg-white/10 hidden rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-black/10 px-3 py-1 rounded-full">{t('admin.exams.proctor_node')}</span>
          </div>
          <div className="mt-4 relative z-10">
            <p className="text-4xl font-black">{exams.length}</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">{t('admin.exams.active_batches')}</p>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            setEditingExam(null);
            setFormData({ course_name: '', exam_type: 'Final', exam_date: '', start_time: '', end_time: '', department_id: selectedDepartmentId || '' });
            setShowAddModal(true);
          }}
          className="flex items-center justify-center gap-3 bg-black dark:bg-white text-white dark:text-black font-black py-4.5 px-10 rounded-2xl lg:rounded-[2rem] shadow-xl hover:scale-105 active:scale-95 transition-[color,background-color,border-color,transform,opacity] whitespace-nowrap group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" /> 
          <span className="uppercase tracking-widest text-xs">{t('admin.exams.add_button')}</span>
        </button>
      </div>

      <div className="bg-white/50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-sm relative">
        {/* Top Glow Indicator */}
        <div className="absolute top-0 inset-inline-start-0 w-full h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-30"></div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/[0.01]">
                <th className="py-6 px-8 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] text-start">{t('admin.exams.course_dept')}</th>
                <th className="py-6 px-8 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] text-center">{t('admin.exams.type')}</th>
                <th className="py-6 px-8 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] text-start">{t('admin.exams.schedule')}</th>
                <th className="py-6 px-8 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] text-end">{t('admin.exams.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <tr>
                    <td colSpan="4" className="text-center py-32">
                        <div className="flex flex-col items-center gap-4">
                            <Activity className="w-12 h-12 text-primary animate-spin" />
                            <p className="text-[10px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-[0.3em]">{t('admin.exams.loading')}</p>
                        </div>
                    </td>
                </tr>
              ) : exams.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-32">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner grayscale opacity-30">
                        <Calendar className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-[11px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-[0.3em]">{t('admin.exams.no_exams')}</p>
                  </td>
                </tr>
              ) : (
                exams.map((exam) => (
                  <tr 
                    key={exam.id}
                    className="group hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-700"
                  >
                    <td className="py-8 px-8">
                      <div className="flex flex-col gap-3 text-start">
                        <p className="text-gray-900 dark:text-white font-black text-xl tracking-tight leading-tight group-hover:text-white transition-colors uppercase">{exam.course_name}</p>
                        <div className="flex items-center gap-2">
                           <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest transition-colors group-hover:bg-white/20 group-hover:text-white">
                              <LayoutDashboard className="w-4 h-4 text-primary group-hover:text-white" /> {exam.department_name || t('admin.exams.global_context')}
                           </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-8 px-8 text-center">
                      <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-inner transition-all ${
                        exam.exam_type === 'Practical' ? 'bg-orange-500/10 border-orange-500/20 text-orange-600' : 'bg-primary/10 border-primary/20 text-primary'
                      } group-hover:bg-white group-hover:text-black group-hover:border-white`}>
                        {t(`admin.exams.types.${exam.exam_type}`)}
                      </span>
                    </td>
                    <td className="py-8 px-8">
                      <div className="flex flex-col gap-3 text-start">
                         <p className="text-gray-900 dark:text-white font-black text-sm uppercase tracking-widest flex items-center gap-2.5 group-hover:text-white transition-colors">
                           <Calendar className="w-5 h-5 text-primary group-hover:text-white" />
                           {new Date(exam.exam_date).toLocaleDateString('en-GB', { weekday: 'long' })},{' '}
                           <span className="text-primary dark:text-primary group-hover:text-white">{new Date(exam.exam_date).toLocaleDateString('en-GB')}</span>
                         </p>
                         <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-slate-500 font-black uppercase tracking-widest opacity-60 group-hover:opacity-100 group-hover:text-white transition-all">
                           <Clock className="w-4 h-4" />
                           <span className="bg-white dark:bg-black/40 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm group-hover:bg-white/20 transition-colors">{exam.start_time.substring(0, 5)} — {exam.end_time.substring(0, 5)}</span>
                         </div>
                      </div>
                    </td>
                    <td className="py-8 px-8 text-end">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                        <button onClick={() => openEditModal(exam)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 border border-white/20 text-white dark:text-black transition-all">
                          <Edit3 className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(exam.id)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                          <Trash2 className="w-5 h-5" />
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

      {/* Cinematic Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div 
            onClick={() => setShowAddModal(false)}
            className="absolute inset-0 bg-gray-950/40 dark:bg-black/80 backdrop-blur-sm" 
          />
          <div 
            className="bg-white dark:bg-[#080808] border border-gray-100 dark:border-white/5 rounded-[3rem] p-8 lg:p-12 w-full max-w-2xl shadow-2xl relative overflow-hidden z-10" 
            onClick={e => e.stopPropagation()}
          >
             {/* Modal Background Glow */}
             <div className="absolute top-0 inset-inline-end-0 w-80 h-80 bg-primary/10 hidden rounded-full pointer-events-none"></div>

             <div className="relative z-10">
                <div className="flex items-center justify-between mb-10 pb-8 border-b border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/20 text-primary shadow-inner">
                          {editingExam ? <Edit3 className="w-7 h-7" /> : <Plus className="w-7 h-7" />}
                      </div>
                      <div className="text-start">
                          <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                              {editingExam ? t('admin.exams.modals.edit_exam') : t('admin.exams.modals.add_exam')}
                          </h3>
                          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1 italic">{t('admin.exams.temporal_alignment')}</p>
                      </div>
                    </div>
                    <button onClick={() => setShowAddModal(false)} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-400 rounded-2xl hover:text-rose-600 transition-all shadow-sm">
                      <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-3 text-start">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.exams.modals.course_name')} *</label>
                        <div className="relative group/name">
                            <BookOpen className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/name:text-primary transition-colors" />
                            <input type="text" required value={formData.course_name} onChange={(e) => setFormData({...formData, course_name: e.target.value})} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl ps-14 pe-6 py-4.5 font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner uppercase tracking-widest text-sm" placeholder={t('admin.exams.modals.placeholder_course')} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-start">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.exams.modals.exam_type')}</label>
                            <div className="relative group/type">
                                <Zap className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/type:text-primary transition-colors" />
                                <select value={formData.exam_type} onChange={(e) => setFormData({...formData, exam_type: e.target.value})} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl ps-14 pe-6 py-4.5 font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none uppercase tracking-widest text-[11px] shadow-inner">
                                    <option value="Final">{t('admin.exams.types.Final')}</option>
                                    <option value="Practical">{t('admin.exams.types.Practical')}</option>
                                </select>
                                <ChevronRight className="absolute inset-inline-end-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 rotate-90" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.exams.modals.dept_label')} *</label>
                            <div className="relative group/dept">
                                <GraduationCap className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/dept:text-primary transition-colors" />
                                <select value={formData.department_id} required onChange={(e) => setFormData({...formData, department_id: e.target.value})} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl ps-14 pe-6 py-4.5 font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none uppercase tracking-widest text-[11px] shadow-inner">
                                    <option value="">{t('admin.exams.modals.placeholder_dept')}</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                                <ChevronRight className="absolute inset-inline-end-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 rotate-90" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-start">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.exams.modals.exam_date')} *</label>
                            <div className="relative group/date">
                                <Calendar className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/date:text-primary transition-colors" />
                                <input type="date" required value={formData.exam_date} onChange={(e) => setFormData({...formData, exam_date: e.target.value})} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl ps-14 pe-6 py-4.5 font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.exams.modals.start_time')} *</label>
                            <div className="relative group/start">
                                <Clock className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/start:text-primary transition-colors" />
                                <input type="time" required value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl ps-14 pe-6 py-4.5 font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.exams.modals.end_time')} *</label>
                            <div className="relative group/end">
                                <Clock className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/end:text-primary transition-colors" />
                                <input type="time" required value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl ps-14 pe-6 py-4.5 font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner" />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-6 pt-10 border-t border-gray-100 dark:border-white/5">
                        <button type="submit" disabled={loading} className="flex-1 bg-primary hover:bg-primary text-white font-black py-5 rounded-[2.5rem] shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 group/save">
                            {loading ? <Activity className="w-6 h-6 animate-spin" /> : <><CheckCircle className="w-6 h-6 group-hover/save:scale-110 transition-transform" /> <span className="uppercase tracking-widest text-xs">{editingExam ? t('common.save') : t('admin.exams.modals.add_exam')}</span></>}
                        </button>
                        <button type="button" onClick={() => setShowAddModal(false)} className="px-14 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-black py-5 rounded-[2.5rem] transition-all uppercase tracking-widest text-xs">{t('common.cancel')}</button>
                    </div>
                </form>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamScheduleManager;
