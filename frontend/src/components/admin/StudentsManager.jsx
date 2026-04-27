import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Users, UserPlus, Trash2, Key, Edit3, 
  Upload, FileSpreadsheet, ChevronRight, CheckCircle,
  Activity, Shield, GraduationCap, Layers, ShieldCheck
} from 'lucide-react';

const StudentsManager = ({
  students,
  fetchStudents,
  uploadingStudents,
  setUploadingStudents,
  studentsFile,
  setStudentsFile,
  handleResetPassword,
  handleDeleteStudent,
  handleEditStudentInfo,
  handleManageRole,
  departments,
  onAddStudent
}) => {
  const [uploading, setUploading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newStudent, setNewStudent] = useState({
    id: '',
    name: '',
    password: '',
    level: '1',
    section: '',
    department_id: ''
  });
  const [adding, setAdding] = useState(false);

  const handleUploadStudents = async (e) => {
    e.preventDefault();
    if (!studentsFile) {
      toast.error('Please select a file');
      return;
    }
    const formData = new FormData();
    formData.append('file', studentsFile);
    setUploading(true);
    try {
      const res = await api.post('/admin/upload-students', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(`Uploaded ${res.data.count} students successfully`);
      setStudentsFile(null);
      document.getElementById('studentsFileInput').value = '';
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error uploading students');
    } finally {
      setUploading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newStudent.id || !newStudent.name) {
      toast.error('Student ID and Name are required');
      return;
    }
    setAdding(true);
    try {
      await onAddStudent(newStudent);
      toast.success('Student added successfully');
      setShowAddModal(false);
      setNewStudent({
        id: '',
        name: '',
        password: '',
        level: '1',
        section: '',
        department_id: ''
      });
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add student');
    } finally {
      setAdding(false);
    }
  };

  const filteredStudents = students.filter(s => 
    (s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id?.toString().includes(searchTerm))
  );

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-2 h-10 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-400" /> Manage Students
            </h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Student Registry & Authentication</p>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 transition-all"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="admin-btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <UserPlus className="w-5 h-5" /> Add Student
          </button>
        </div>
      </div>

      {/* Upload Section */}
      <div className="mb-12 admin-card relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full group-hover:bg-emerald-500/10 transition-all duration-700"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
              <Upload className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">Bulk Upload (Excel)</h3>
          </div>
          
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 mb-6">
            <p className="text-slate-400 text-sm leading-relaxed">
              <span className="text-emerald-400 font-bold uppercase text-[10px] tracking-widest block mb-2">Required Columns:</span>
              Student ID, Student Name, Password (optional), Level (optional), Section (1-6), Department Code (e.g., CS, AI, MED, AV)
            </p>
          </div>

          <form onSubmit={handleUploadStudents} className="flex flex-wrap items-center gap-6">
            <div className="flex-1 min-w-[300px]">
              <label className="relative flex items-center justify-center gap-3 cursor-pointer bg-slate-900/50 border border-white/5 border-dashed rounded-2xl px-6 py-6 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group/label">
                <FileSpreadsheet className="w-6 h-6 text-slate-500 group-hover/label:text-emerald-400 transition-colors" />
                <span className="text-slate-300 font-bold text-sm tracking-tight">
                  {studentsFile ? studentsFile.name : 'Select Excel or CSV File'}
                </span>
                <input id="studentsFileInput" type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setStudentsFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
              </label>
            </div>
            <button type="submit" disabled={uploading || !studentsFile} className="admin-btn-primary flex items-center gap-2 h-[60px] px-10">
              {uploading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <><Upload className="w-5 h-5" /> Import Data</>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Students Table Section */}
      <div className="bg-[#111111]/40 border border-white/5 rounded-[2rem] overflow-hidden shadow-inner backdrop-blur-sm">
        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Database Records</span>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-white/5 px-3 py-1 rounded-lg border border-white/5">{filteredStudents.length} / {students.length} Entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.01]">
                <th className="py-5 px-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Student Details</th>
                <th className="py-5 px-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Academic Info</th>
                <th className="py-5 px-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Security</th>
                <th className="py-5 px-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filteredStudents.length === 0 ? (
                <tr>
                    <td colSpan="4" className="text-center py-20">
                        <div className="flex flex-col items-center gap-3">
                            <Users className="w-12 h-12 text-slate-800" />
                            <p className="text-slate-600 font-bold">No student records found in current node.</p>
                        </div>
                    </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center border border-white/5 text-slate-400 font-black text-xs group-hover:border-blue-500/30 transition-all">
                          {s.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-black tracking-tight">{s.name}</p>
                          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">{s.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-tight">
                          <Layers className="w-3 h-3" /> Lvl {s.level}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-tight">
                          <Activity className="w-3 h-3" /> Sec {s.section || '—'}
                        </span>
                        {s.department_name && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-tight">
                                <GraduationCap className="w-3 h-3" /> {s.department_name}
                            </span>
                        )}
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Key className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Encrypted</span>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={() => handleResetPassword(s.id)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all group/btn"
                            title="Reset Password"
                        >
                            <Key className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        </button>
                        <button 
                            onClick={() => handleEditStudentInfo(s)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all group/btn"
                            title="Edit Info"
                        >
                            <Edit3 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        </button>
                        <button 
                            onClick={() => handleManageRole(s)}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all group/btn ${
                                s.role && s.role !== 'student' 
                                ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-black shadow-[0_0_10px_rgba(245,158,11,0.2)]' 
                                : 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500 hover:text-black'
                            }`}
                            title="Manage Permissions"
                        >
                            {s.role && s.role !== 'student' ? (
                                <ShieldCheck className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            ) : (
                                <Shield className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            )}
                        </button>
                        <button 
                            onClick={() => handleDeleteStudent(s.id, s.name)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all group/btn"
                            title="Delete Student"
                        >
                            <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
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

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="admin-modal-backdrop">
          <div className="bg-[#111111] border border-white/10 rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl relative overflow-hidden animate-fadeInUp">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                  <UserPlus className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">Add New Student</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Manual Registry Entry</p>
                </div>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-slate-300 ml-4 text-[10px] font-bold uppercase tracking-widest">Student ID *</label>
                        <input type="text" value={newStudent.id} onChange={(e) => setNewStudent({ ...newStudent, id: e.target.value })} className="admin-input" placeholder="e.g. 2023001" required />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-slate-300 ml-4 text-[10px] font-bold uppercase tracking-widest">Full Name *</label>
                        <input type="text" value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} className="admin-input" placeholder="Enter Full Name" required />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-slate-300 ml-4 text-[10px] font-bold uppercase tracking-widest">Initial Password</label>
                    <input type="text" value={newStudent.password} onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })} className="admin-input" placeholder="Leave empty for '123456'" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-slate-300 ml-4 text-[10px] font-bold uppercase tracking-widest">Academic Level</label>
                        <input type="number" value={newStudent.level} onChange={(e) => setNewStudent({ ...newStudent, level: e.target.value })} className="admin-input" min="1" />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-slate-300 ml-4 text-[10px] font-bold uppercase tracking-widest">Section</label>
                        <input type="text" value={newStudent.section} onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })} className="admin-input" placeholder="e.g. 1" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-slate-300 ml-4 text-[10px] font-bold uppercase tracking-widest">Department Assignment</label>
                    <select
                        value={newStudent.department_id}
                        onChange={(e) => setNewStudent({ ...newStudent, department_id: e.target.value })}
                        className="admin-input appearance-none"
                    >
                        <option value="">-- No Department Assigned --</option>
                        {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="submit" disabled={adding} className="flex-1 admin-btn-primary h-[60px]">
                    {adding ? 'Processing...' : 'CONFIRM ADDITION'}
                  </button>
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-8 py-4 admin-btn-secondary h-[60px]">
                    CANCEL
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

export default StudentsManager;