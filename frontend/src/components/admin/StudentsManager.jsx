import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Users, UserPlus, Trash2, Key, Edit3, 
  Upload, FileSpreadsheet, ChevronRight, CheckCircle,
  Activity, Shield, GraduationCap, Layers, ShieldCheck,
  Search, Info, UserCircle, Settings, UploadCloud
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
      toast.error('Please select an Excel or CSV file');
      return;
    }
    const formData = new FormData();
    formData.append('file', studentsFile);
    setUploading(true);
    try {
      const res = await api.post('/admin/upload-students', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(`Successfully uploaded ${res.data.count} students`);
      setStudentsFile(null);
      const fileInput = document.getElementById('studentsFileInput');
      if (fileInput) fileInput.value = '';
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload students');
    } finally {
      setUploading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newStudent.id || !newStudent.name) {
      toast.error('ID and Name are required');
      return;
    }
    setAdding(true);
    try {
      await onAddStudent(newStudent);
      toast.success('Student saved successfully');
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
    <div className="animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-500/10 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-inner">
            <Users className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Manage Student Accounts
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold mt-1">Add, edit, and manage student records</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input 
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/80 dark:bg-black/40 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl pl-14 pr-5 py-4 text-sm font-semibold text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-8 rounded-xl shadow-md hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
          >
            <UserPlus className="w-5 h-5" /> Add Student
          </button>
        </div>
      </div>

      {/* Upload Section */}
      <div className="mb-10 bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group">
        {/* Background Glow */}
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[70px] pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-inner">
              <UploadCloud className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Import Multiple Students</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-0.5">Bulk upload via Excel or CSV</p>
            </div>
          </div>
          
          <div className="bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-2xl p-6 mb-8 shadow-sm">
            <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300/80 leading-relaxed">
                    <span className="uppercase text-[11px] tracking-widest block mb-1">Your file should have these columns:</span>
                    ID, Name, Password (optional), Level (1-4), Section (1-6), Department Code (e.g., CS, AI)
                </p>
            </div>
          </div>

          <form onSubmit={handleUploadStudents} className="flex flex-col md:flex-row items-stretch gap-6">
            <label className="relative flex-1 flex flex-col items-center justify-center gap-3 cursor-pointer bg-gray-50/50 dark:bg-black/40 border-2 border-gray-200 dark:border-white/10 border-dashed rounded-[2rem] p-8 hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-all group/label shadow-inner">
              <FileSpreadsheet className="w-8 h-8 text-gray-400 group-hover/label:text-emerald-500 transition-colors" />
              <span className="text-gray-700 dark:text-gray-300 font-bold text-center">
                {studentsFile ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-black">{studentsFile.name}</span>
                ) : 'Click to select Excel / CSV file'}
              </span>
              <input id="studentsFileInput" type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setStudentsFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
            </label>
            <button type="submit" disabled={uploading || !studentsFile} className="bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 px-12 rounded-2xl shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 h-auto md:min-w-[200px] flex items-center justify-center gap-2">
              {uploading ? (
                <Activity className="w-6 h-6 animate-spin" />
              ) : (
                <><Upload className="w-5 h-5" /> Upload File</>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Students List Section */}
      <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-sm relative">
        {/* Top Indicator */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30"></div>

        <div className="p-8 border-b border-gray-100 dark:border-white/10 bg-gray-50/30 dark:bg-white/[0.01] flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl flex items-center justify-center shadow-inner">
                    <Users className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Saved Students</h3>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{filteredStudents.length} results found</p>
                </div>
            </div>
            <span className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest border border-gray-200 dark:border-white/10">{filteredStudents.length} / {students.length} Total</span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/[0.01]">
                <th className="py-6 px-8 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Student Name & ID</th>
                <th className="py-6 px-8 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Level & Section</th>
                <th className="py-6 px-8 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Password Status</th>
                <th className="py-6 px-8 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {filteredStudents.length === 0 ? (
                <tr>
                    <td colSpan="4" className="text-center py-24">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center shadow-inner animate-pulse">
                                <Users className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-500 font-black uppercase tracking-widest">No students found.</p>
                        </div>
                    </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-white dark:bg-black rounded-[1.2rem] flex items-center justify-center border border-gray-200 dark:border-white/10 shadow-inner group-hover:scale-110 group-hover:border-blue-500/30 transition-all duration-300 overflow-hidden">
                          {s.avatar_url ? (
                            <img src={s.avatar_url} alt={s.name} className="w-full h-full object-cover" />
                          ) : (
                            <UserCircle className="w-8 h-8 text-gray-300 dark:text-gray-700" />
                          )}
                        </div>
                        <div>
                          <p className="text-gray-900 dark:text-white font-black tracking-tight text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{s.name}</p>
                          <p className="text-gray-500 dark:text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">{s.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <div className="flex flex-wrap gap-2">
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 text-[11px] font-bold">
                          <Layers className="w-3.5 h-3.5" /> Level {s.level}
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-[11px] font-bold">
                          <Activity className="w-3.5 h-3.5" /> Section {s.section || '—'}
                        </span>
                        {s.department_name && (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-[11px] font-bold">
                                <GraduationCap className="w-3.5 h-3.5" /> {s.department_name}
                            </span>
                        )}
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-2 text-gray-400 dark:text-gray-600">
                        <ShieldCheck className="w-4 h-4 text-emerald-500/70" />
                        <span className="text-[11px] font-black uppercase tracking-widest">Protected</span>
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <div className="flex items-center justify-end gap-2.5">
                        <button 
                            onClick={() => handleResetPassword(s.id)}
                            className="w-11 h-11 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                            title="Reset Password"
                        >
                            <Key className="w-4.5 h-4.5" />
                        </button>
                        <button 
                            onClick={() => handleEditStudentInfo(s)}
                            className="w-11 h-11 flex items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                            title="Edit Details"
                        >
                            <Edit3 className="w-4.5 h-4.5" />
                        </button>
                        <button 
                            onClick={() => handleManageRole(s)}
                            className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all shadow-sm ${
                                s.role && s.role !== 'student' 
                                ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white' 
                                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-600 dark:hover:bg-white/20 hover:text-white'
                            }`}
                            title="Change Role"
                        >
                            {s.role && s.role !== 'student' ? (
                                <ShieldCheck className="w-4.5 h-4.5" />
                            ) : (
                                <Shield className="w-4.5 h-4.5" />
                            )}
                        </button>
                        <button 
                            onClick={() => handleDeleteStudent(s.id, s.name)}
                            className="w-11 h-11 flex items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                            title="Delete"
                        >
                            <Trash2 className="w-4.5 h-4.5" />
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
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-10 w-full max-w-xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            {/* Modal Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-100 dark:border-white/10">
                <div className="w-14 h-14 bg-blue-500/10 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-inner">
                  <UserPlus className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Add Student</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-bold mt-1">Enter student details below</p>
                </div>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Student ID <span className="text-rose-500">*</span></label>
                        <input type="text" value={newStudent.id} onChange={(e) => setNewStudent({ ...newStudent, id: e.target.value })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-blue-500/50 outline-none transition-all shadow-inner" placeholder="e.g. 2023001" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Full Name <span className="text-rose-500">*</span></label>
                        <input type="text" value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-blue-500/50 outline-none transition-all shadow-inner" placeholder="Enter Full Name" required />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Password</label>
                    <input type="text" value={newStudent.password} onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-blue-500/50 outline-none transition-all shadow-inner" placeholder="Default: 123456" />
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">Default password is '123456'</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Level</label>
                        <input type="number" value={newStudent.level} onChange={(e) => setNewStudent({ ...newStudent, level: e.target.value })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-blue-500/50 outline-none transition-all shadow-inner" min="1" max="4" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Section</label>
                        <input type="text" value={newStudent.section} onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-blue-500/50 outline-none transition-all shadow-inner" placeholder="e.g. 1" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">Select Department</label>
                    <div className="relative">
                        <select
                            value={newStudent.department_id}
                            onChange={(e) => setNewStudent({ ...newStudent, department_id: e.target.value })}
                            className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-semibold focus:ring-2 focus:ring-blue-500/50 outline-none transition-all shadow-inner appearance-none"
                        >
                            <option value="">-- No Department Assigned --</option>
                            {departments.map(d => (
                                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                            ))}
                        </select>
                        <div className="absolute right-5 top-5 pointer-events-none text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-gray-100 dark:border-white/10">
                  <button type="submit" disabled={adding} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4.5 rounded-2xl shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50">
                    {adding ? <Activity className="w-6 h-6 animate-spin mx-auto" /> : 'Save Student'}
                  </button>
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-10 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-bold py-4.5 rounded-2xl transition-all">
                    Cancel
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