import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Calendar, Plus, Trash2, Edit3, Clock, LayoutDashboard, FileText, X, Activity } from 'lucide-react';

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
    try {
      if (editingExam) {
        await api.put(`/exams/admin/${editingExam.id}`, formData);
        toast.success('Exam updated successfully');
      } else {
        await api.post('/exams/admin', formData);
        toast.success('Exam added successfully');
      }
      setShowAddModal(false);
      setEditingExam(null);
      setFormData({ course_name: '', exam_type: 'Final', exam_date: '', start_time: '', end_time: '', department_id: selectedDepartmentId || '' });
      fetchExams();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this exam schedule?')) return;
    try {
      await api.delete(`/exams/admin/${id}`);
      toast.success('Deleted successfully');
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
    <div className="mt-8 animate-fadeIn pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-2 h-10 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3 transition-colors">
              <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              Practical & Final Exams
            </h3>
            <p className="text-gray-500 dark:text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-1 transition-colors">Manage global exam schedules</p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingExam(null);
            setFormData({ course_name: '', exam_type: 'Final', exam_date: '', start_time: '', end_time: '', department_id: selectedDepartmentId || '' });
            setShowAddModal(true);
          }}
          className="admin-btn-primary px-8 py-3.5 flex items-center gap-2 shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-5 h-5" /> Initialize Exam
        </button>
      </div>

      <div className="bg-white dark:bg-[#111111]/40 border border-gray-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl transition-colors relative">
        
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-white/[0.01] transition-colors">
                <th className="py-6 px-8 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] transition-colors">Course & Dept</th>
                <th className="py-6 px-6 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] transition-colors">Exam Type</th>
                <th className="py-6 px-6 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] transition-colors">Date & Time</th>
                <th className="py-6 px-8 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] text-right transition-colors">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.03]">
              {loading ? (
                <tr>
                    <td colSpan="4" className="text-center py-20">
                        <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Synchronizing Matrix...</p>
                    </td>
                </tr>
              ) : exams.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-24 grayscale opacity-10">
                    <Calendar className="w-16 h-16 text-gray-400 dark:text-white mx-auto mb-4" />
                    <p className="text-sm font-black uppercase tracking-[0.3em] text-gray-500 dark:text-white">No exams scheduled.</p>
                  </td>
                </tr>
              ) : (
                exams.map((exam) => (
                  <tr key={exam.id} className="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-8 px-8">
                      <p className="text-gray-900 dark:text-white font-black text-base transition-colors leading-tight">{exam.course_name}</p>
                      <div className="flex items-center gap-2 mt-3">
                         <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-white/5 text-gray-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest transition-colors shadow-sm">
                            <LayoutDashboard className="w-3 h-3 text-emerald-500" /> {exam.department_name || 'N/A'}
                         </span>
                      </div>
                    </td>
                    <td className="py-8 px-6">
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-colors shadow-sm ${
                        exam.exam_type === 'Practical' ? 'bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400' : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                      }`}>
                        {exam.exam_type} UNIT
                      </span>
                    </td>
                    <td className="py-8 px-6">
                      <div className="space-y-1.5">
                         <p className="text-gray-900 dark:text-white font-black text-xs uppercase tracking-tight transition-colors">
                           {new Date(exam.exam_date).toLocaleDateString('en-GB', { weekday: 'long' })},{' '}
                           {new Date(exam.exam_date).toLocaleDateString('en-GB')}
                         </p>
                         <div className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest transition-colors">
                           <Clock className="w-3 h-3 text-emerald-500" />
                           <span className="bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-lg border border-gray-200 dark:border-white/5 transition-colors">{exam.start_time.substring(0, 5)} - {exam.end_time.substring(0, 5)}</span>
                         </div>
                      </div>
                    </td>
                    <td className="py-8 px-8 text-right">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => openEditModal(exam)} className="w-11 h-11 flex items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/5 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(exam.id)} className="w-11 h-11 flex items-center justify-center rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm">
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

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-12 w-full max-w-2xl shadow-2xl relative overflow-hidden transition-colors">
            
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 transition-colors">
                            {editingExam ? <Edit3 className="w-7 h-7" /> : <Plus className="w-7 h-7" />}
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">{editingExam ? 'Recalibrate Schedule' : 'Initialize Exam Node'}</h3>
                            <p className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 transition-colors">Technical Assessment Registry</p>
                        </div>
                    </div>
                    <button onClick={() => setShowAddModal(false)} className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white rounded-2xl transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-2">
                    <label className="block text-gray-500 dark:text-slate-300 ml-4 text-[10px] font-black uppercase tracking-widest transition-colors">Course Payload *</label>
                    <input type="text" required value={formData.course_name} onChange={(e) => setFormData({...formData, course_name: e.target.value})} className="admin-input w-full" placeholder="e.g. Mathematics 1" />
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="block text-gray-500 dark:text-slate-300 ml-4 text-[10px] font-black uppercase tracking-widest transition-colors">Protocol Type</label>
                      <select value={formData.exam_type} onChange={(e) => setFormData({...formData, exam_type: e.target.value})} className="admin-input w-full appearance-none transition-colors">
                        <option value="Final" className="bg-white dark:bg-slate-900">Final Exam (فاينل)</option>
                        <option value="Practical" className="bg-white dark:bg-slate-900">Practical (عملي)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-gray-500 dark:text-slate-300 ml-4 text-[10px] font-black uppercase tracking-widest transition-colors">Deployment Dept *</label>
                      <select value={formData.department_id} required onChange={(e) => setFormData({...formData, department_id: e.target.value})} className="admin-input w-full appearance-none transition-colors">
                        <option value="" className="bg-white dark:bg-slate-900">-- Select Dept --</option>
                        {departments.map(d => <option key={d.id} value={d.id} className="bg-white dark:bg-slate-900">{d.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="block text-gray-500 dark:text-slate-300 ml-4 text-[10px] font-black uppercase tracking-widest transition-colors">Window Date</label>
                      <input type="date" required value={formData.exam_date} onChange={(e) => setFormData({...formData, exam_date: e.target.value})} className="admin-input w-full" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-gray-500 dark:text-slate-300 ml-4 text-[10px] font-black uppercase tracking-widest transition-colors">Trigger Time</label>
                      <input type="time" required value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} className="admin-input w-full" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-gray-500 dark:text-slate-300 ml-4 text-[10px] font-black uppercase tracking-widest transition-colors">Termination</label>
                      <input type="time" required value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} className="admin-input w-full" />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-6">
                    <button type="submit" className="flex-1 bg-emerald-500 text-white dark:text-black font-black py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-emerald-500/20 uppercase text-xs tracking-widest">
                        {editingExam ? 'Apply Overwrite' : 'Commit Registry'}
                    </button>
                    <button type="button" onClick={() => setShowAddModal(false)} className="px-10 py-4 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-500 dark:text-slate-300 font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-all uppercase text-xs tracking-widest">Abort</button>
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
