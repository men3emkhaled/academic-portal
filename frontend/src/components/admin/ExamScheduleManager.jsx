import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Calendar, Plus, Trash2, Edit3, Clock, 
  LayoutDashboard, FileText, X, Activity, 
  ChevronRight, MapPin, Settings, Info
} from 'lucide-react';

const ExamScheduleManager = ({ departments, selectedDepartmentId }) => {
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
      toast.error('Failed to load exams');
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
      toast.error('Please select a department');
      return;
    }
    setLoading(true);
    try {
      if (editingExam) {
        await api.put(`/exams/admin/${editingExam.id}`, formData);
        toast.success('Exam schedule updated');
      } else {
        await api.post('/exams/admin', formData);
        toast.success('New exam added');
      }
      setShowAddModal(false);
      setEditingExam(null);
      setFormData({ course_name: '', exam_type: 'Final', exam_date: '', start_time: '', end_time: '', department_id: selectedDepartmentId || '' });
      fetchExams();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save exam');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exam schedule?')) return;
    try {
      await api.delete(`/exams/admin/${id}`);
      toast.success('Exam deleted');
      fetchExams();
    } catch (error) {
      toast.error('Delete failed');
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
    <div className="mt-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-inner">
            <FileText className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Exam Schedule
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold mt-1">Add and manage exams for all departments</p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingExam(null);
            setFormData({ course_name: '', exam_type: 'Final', exam_date: '', start_time: '', end_time: '', department_id: selectedDepartmentId || '' });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-8 rounded-xl shadow-md hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-5 h-5" /> Add New Exam
        </button>
      </div>

      <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-sm relative">
        {/* Top Glow Indicator */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-30"></div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/[0.01]">
                <th className="py-6 px-8 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Course & Department</th>
                <th className="py-6 px-8 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center">Type</th>
                <th className="py-6 px-8 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Schedule</th>
                <th className="py-6 px-8 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <tr>
                    <td colSpan="4" className="text-center py-24">
                        <div className="flex flex-col items-center gap-4">
                            <Activity className="w-10 h-10 text-emerald-500 animate-spin" />
                            <p className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Loading exams...</p>
                        </div>
                    </td>
                </tr>
              ) : exams.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-24">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-pulse">
                        <Calendar className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                    </div>
                    <p className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">No exams scheduled.</p>
                  </td>
                </tr>
              ) : (
                exams.map((exam) => (
                  <tr key={exam.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-8 px-8">
                      <div className="flex flex-col gap-2">
                        <p className="text-gray-900 dark:text-white font-black text-lg leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{exam.course_name}</p>
                        <div className="flex items-center gap-2">
                           <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest">
                              <LayoutDashboard className="w-3.5 h-3.5 text-emerald-500" /> {exam.department_name || 'All Departments'}
                           </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-8 px-8 text-center">
                      <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                        exam.exam_type === 'Practical' ? 'bg-orange-500/10 border-orange-500/20 text-orange-600' : 'bg-rose-500/10 border-rose-500/20 text-rose-600'
                      }`}>
                        {exam.exam_type}
                      </span>
                    </td>
                    <td className="py-8 px-8">
                      <div className="flex flex-col gap-2">
                         <p className="text-gray-900 dark:text-white font-black text-sm uppercase tracking-tight flex items-center gap-2">
                           <Calendar className="w-4 h-4 text-emerald-500" />
                           {new Date(exam.exam_date).toLocaleDateString('en-GB', { weekday: 'long' })},{' '}
                           {new Date(exam.exam_date).toLocaleDateString('en-GB')}
                         </p>
                         <div className="flex items-center gap-2 text-[11px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">
                           <Clock className="w-3.5 h-3.5" />
                           <span className="bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-gray-200 dark:border-white/10">{exam.start_time.substring(0, 5)} - {exam.end_time.substring(0, 5)}</span>
                         </div>
                      </div>
                    </td>
                    <td className="py-8 px-8 text-right">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => openEditModal(exam)} className="w-11 h-11 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                          <Edit3 className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(exam.id)} className="w-11 h-11 flex items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-500 hover:bg-rose-600 hover:text-white transition-all shadow-sm">
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

      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-10 w-full max-w-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            {/* Modal Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-5 mb-10 pb-6 border-b border-gray-100 dark:border-white/10">
                    <div className="w-14 h-14 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        {editingExam ? <Edit3 className="w-7 h-7" /> : <Plus className="w-7 h-7" />}
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{editingExam ? 'Edit Exam' : 'Add New Exam'}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-bold mt-1">Enter exam details below</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Course Name <span className="text-rose-500">*</span></label>
                    <input type="text" required value={formData.course_name} onChange={(e) => setFormData({...formData, course_name: e.target.value})} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all shadow-inner" placeholder="e.g. Database Systems" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Exam Type</label>
                      <div className="relative">
                        <select value={formData.exam_type} onChange={(e) => setFormData({...formData, exam_type: e.target.value})} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all shadow-inner appearance-none">
                            <option value="Final">Final Exam (فاينل)</option>
                            <option value="Practical">Practical (عملي)</option>
                        </select>
                        <div className="absolute right-5 top-5 pointer-events-none text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Select Department <span className="text-rose-500">*</span></label>
                      <div className="relative">
                        <select value={formData.department_id} required onChange={(e) => setFormData({...formData, department_id: e.target.value})} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all shadow-inner appearance-none">
                            <option value="">-- Select Dept --</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                        <div className="absolute right-5 top-5 pointer-events-none text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Exam Date <span className="text-rose-500">*</span></label>
                      <input type="date" required value={formData.exam_date} onChange={(e) => setFormData({...formData, exam_date: e.target.value})} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all shadow-inner" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Start Time <span className="text-rose-500">*</span></label>
                      <input type="time" required value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all shadow-inner" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">End Time <span className="text-rose-500">*</span></label>
                      <input type="time" required value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all shadow-inner" />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6 border-t border-gray-100 dark:border-white/10">
                    <button type="submit" disabled={loading} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4.5 rounded-2xl shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50">
                        {loading ? <Activity className="w-6 h-6 animate-spin mx-auto" /> : (editingExam ? 'Update Exam' : 'Save Exam')}
                    </button>
                    <button type="button" onClick={() => setShowAddModal(false)} className="px-10 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-bold py-4.5 rounded-2xl transition-all">Cancel</button>
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
