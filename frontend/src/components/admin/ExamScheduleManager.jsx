import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Calendar, Plus, Trash2, Edit3, Clock, LayoutDashboard, FileText } from 'lucide-react';

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
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            Practical & Final Exams
          </h3>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Manage global exam schedules</p>
        </div>
        <button
          onClick={() => {
            setEditingExam(null);
            setFormData({ course_name: '', exam_type: 'Final', exam_date: '', start_time: '', end_time: '', department_id: selectedDepartmentId || '' });
            setShowAddModal(true);
          }}
          className="admin-btn-primary px-6 py-3 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Exam
        </button>
      </div>

      <div className="bg-[#111111]/40 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.01]">
                <th className="py-5 px-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Course & Dept</th>
                <th className="py-5 px-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Exam Type</th>
                <th className="py-5 px-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Date & Time</th>
                <th className="py-5 px-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {loading ? (
                <tr><td colSpan="4" className="text-center py-10 text-slate-500">Loading...</td></tr>
              ) : exams.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-16">
                    <Calendar className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                    <p className="text-slate-600 font-bold uppercase tracking-widest">No exams scheduled.</p>
                  </td>
                </tr>
              ) : (
                exams.map((exam) => (
                  <tr key={exam.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-6 px-6">
                      <p className="text-white font-black text-sm">{exam.course_name}</p>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-xl bg-slate-900 border border-white/5 text-slate-400 text-[9px] font-black uppercase tracking-tight">
                        <LayoutDashboard className="w-3 h-3" /> {exam.department_name || 'N/A'}
                      </span>
                    </td>
                    <td className="py-6 px-6">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                        exam.exam_type === 'Practical' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                      }`}>
                        {exam.exam_type}
                      </span>
                    </td>
                    <td className="py-6 px-6">
                      <p className="text-white font-black text-xs">
                        {new Date(exam.exam_date).toLocaleDateString('en-GB', { weekday: 'short' })},{' '}
                        {new Date(exam.exam_date).toLocaleDateString('en-GB')}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase mt-1">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        <span>{exam.start_time.substring(0, 5)} - {exam.end_time.substring(0, 5)}</span>
                      </div>
                    </td>
                    <td className="py-6 px-8 text-right flex justify-end gap-2">
                      <button onClick={() => openEditModal(exam)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(exam.id)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#111111] border border-white/10 rounded-[2.5rem] p-10 w-full max-w-xl shadow-2xl relative overflow-hidden animate-fadeInUp">
            <h3 className="text-2xl font-black text-white mb-6">{editingExam ? 'Edit Exam' : 'Add Exam'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 ml-2 text-[10px] font-bold uppercase tracking-widest mb-1">Course Name</label>
                <input type="text" required value={formData.course_name} onChange={(e) => setFormData({...formData, course_name: e.target.value})} className="admin-input w-full" placeholder="e.g. Mathematics 1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 ml-2 text-[10px] font-bold uppercase tracking-widest mb-1">Exam Type</label>
                  <select value={formData.exam_type} onChange={(e) => setFormData({...formData, exam_type: e.target.value})} className="admin-input w-full appearance-none">
                    <option value="Final">Final Exam (فاينل)</option>
                    <option value="Practical">Practical (عملي)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 ml-2 text-[10px] font-bold uppercase tracking-widest mb-1">Department</label>
                  <select value={formData.department_id} required onChange={(e) => setFormData({...formData, department_id: e.target.value})} className="admin-input w-full appearance-none">
                    <option value="">Select Dept</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 ml-2 text-[10px] font-bold uppercase tracking-widest mb-1">Date</label>
                  <input type="date" required value={formData.exam_date} onChange={(e) => setFormData({...formData, exam_date: e.target.value})} className="admin-input w-full" />
                </div>
                <div>
                  <label className="block text-slate-300 ml-2 text-[10px] font-bold uppercase tracking-widest mb-1">Start Time</label>
                  <input type="time" required value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} className="admin-input w-full" />
                </div>
                <div>
                  <label className="block text-slate-300 ml-2 text-[10px] font-bold uppercase tracking-widest mb-1">End Time</label>
                  <input type="time" required value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} className="admin-input w-full" />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-emerald-500 text-black font-black py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all uppercase">Save</button>
                <button type="button" onClick={() => setShowAddModal(false)} className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-slate-300 font-bold hover:bg-white/10 transition-all uppercase">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamScheduleManager;
