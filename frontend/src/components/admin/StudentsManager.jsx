import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
  Users, UserPlus, Trash2, Key, Edit3, 
  Upload, FileSpreadsheet, ChevronRight, CheckCircle,
  Activity, Shield, GraduationCap, Layers, ShieldCheck,
  Search, Info, UserCircle, Settings, UploadCloud, X
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
  const { t } = useTranslation();
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
      toast.error(t('admin.messages.upload_file_req'));
      return;
    }
    const formData = new FormData();
    formData.append('file', studentsFile);
    setUploading(true);
    try {
      const res = await api.post('/admin/upload-students', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(`${t('common.success')}: ${res.data.count}`);
      setStudentsFile(null);
      const fileInput = document.getElementById('studentsFileInput');
      if (fileInput) fileInput.value = '';
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.messages.upload_failed'));
    } finally {
      setUploading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newStudent.id || !newStudent.name) {
      toast.error(t('admin.messages.id_name_req'));
      return;
    }
    setAdding(true);
    try {
      await onAddStudent(newStudent);
      toast.success(t('common.success'));
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
      toast.error(error.response?.data?.message || t('admin.messages.add_student_failed'));
    } finally {
      setAdding(false);
    }
  };

  const filteredStudents = students.filter(s => 
    (s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id?.toString().includes(searchTerm))
  );

  return (
    <div className="space-y-8 lg:space-y-10 animate-in fade-in duration-700">
      {/* Header Bento Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex items-center gap-6 bg-white/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 p-8 rounded-[2.5rem] shadow-sm">
          <div className="w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-inner group transition-transform duration-500 hover:scale-110">
            <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {t('admin.students.title')}
            </h2>
            <p className="text-gray-500 dark:text-slate-500 text-sm font-bold mt-1 uppercase tracking-widest">{t('admin.students.description')}</p>
          </div>
        </div>
        
        <div className="bg-emerald-500 text-white p-8 rounded-[2.5rem] shadow-lg shadow-emerald-500/20 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-inline-end-0 top-0 w-32 h-32 bg-white/10 hidden rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-black/10 px-3 py-1 rounded-full">{t('admin.students.total_students')}</span>
          </div>
          <div className="mt-4 relative z-10">
            <p className="text-4xl font-black">{students.length}</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">{t('admin.students.active_nodes')}</p>
          </div>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 inset-inline-start-0 flex items-center inset-inline-start-5 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
          </div>
          <input 
            type="text"
            placeholder={t('admin.students.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl lg:rounded-[2rem] ps-14 pe-6 py-4.5 text-sm font-black text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-[color,background-color,border-color,transform,opacity] shadow-inner"
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-black font-black py-4.5 px-10 rounded-2xl lg:rounded-[2rem] shadow-xl hover:scale-105 active:scale-95 transition-[color,background-color,border-color,transform,opacity] whitespace-nowrap group"
        >
          <UserPlus className="w-5 h-5 group-hover:rotate-12 transition-transform" /> 
          <span className="uppercase tracking-widest text-xs">{t('admin.students.add_student')}</span>
        </button>
      </div>

      {/* Import Section */}
      <div className="bg-white/50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-[3rem] p-8 lg:p-10 shadow-sm relative overflow-hidden group">
        <div className="absolute -inset-inline-end-20 -top-20 w-80 h-80 bg-emerald-500/5 rounded-full hidden pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center border border-gray-100 dark:border-white/10 shadow-sm">
              <UploadCloud className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{t('admin.students.import_title')}</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-1">{t('admin.students.import_description')}</p>
            </div>
          </div>
          
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
                <Info className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                <p className="text-[11px] font-bold text-emerald-800/80 dark:text-emerald-400/80 leading-relaxed uppercase tracking-wider">
                    {t('admin.students.import_hint')}
                </p>
            </div>
          </div>

          <form onSubmit={handleUploadStudents} className="flex flex-col md:flex-row items-stretch gap-6">
            <label className="relative flex-1 flex flex-col items-center justify-center gap-4 cursor-pointer bg-white/30 dark:bg-white/[0.01] border-2 border-gray-100 dark:border-white/5 border-dashed rounded-[2.5rem] p-10 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-[color,background-color,border-color,transform,opacity] group/label shadow-inner overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover/label:opacity-100 transition-opacity"></div>
              <FileSpreadsheet className="w-10 h-10 text-gray-300 group-hover/label:text-emerald-500 group-hover/label:scale-110 transition-[color,background-color,border-color,transform,opacity] duration-500 relative z-10" />
              <span className="text-gray-500 dark:text-gray-400 font-black text-center text-xs uppercase tracking-[0.2em] relative z-10">
                {studentsFile ? (
                    <span className="text-emerald-600 dark:text-emerald-400">{studentsFile.name}</span>
                ) : t('admin.students.click_to_upload')}
              </span>
              <input id="studentsFileInput" type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setStudentsFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
            </label>
            <button type="submit" disabled={uploading || !studentsFile} className="bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 px-12 rounded-[2rem] shadow-lg shadow-emerald-500/20 transition-[color,background-color,border-color,transform,opacity] hover:scale-105 active:scale-95 disabled:opacity-50 h-auto md:min-w-[220px] flex flex-col items-center justify-center gap-2 group/btn">
              {uploading ? (
                <Activity className="w-8 h-8 animate-spin" />
              ) : (
                <>
                  <Upload className="w-6 h-6 group-hover/btn:-translate-y-1 transition-transform" />
                  <span className="text-[10px] uppercase tracking-widest">{t('admin.students.upload_button')}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Premium Table Section */}
      <div className="bg-white/50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-sm relative">
        <div className="p-8 border-b border-gray-100 dark:border-white/5 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl flex items-center justify-center shadow-sm">
                    <Users className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{t('admin.students.saved_students')}</h3>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{filteredStudents.length} {t('admin.students.results_found')}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
               <span className="px-4 py-2 rounded-full bg-emerald-500/10 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest border border-emerald-500/20">{filteredStudents.length} / {students.length} {t('admin.students.total_students')}</span>
            </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/[0.01]">
                <th className="py-6 px-8 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] text-start">{t('admin.students.name_id')}</th>
                <th className="py-6 px-8 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] text-start">{t('admin.students.level_section')}</th>
                <th className="py-6 px-8 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] text-start">{t('admin.students.status')}</th>
                <th className="py-6 px-8 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] text-inline-end">{t('admin.students.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.03]">
              <>
              {filteredStudents.length === 0 ? (
                <tr>
                    <td colSpan="4" className="text-center py-24">
                        <div className="flex flex-col items-center gap-4 opacity-40">
                            <Users className="w-16 h-16 text-gray-300 dark:text-gray-700" />
                            <p className="text-gray-500 font-black uppercase tracking-widest text-xs">{t('admin.students.no_students')}</p>
                        </div>
                    </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => (
                  <tr 
                    key={s.id}
                    
                    
                    
                    className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-white dark:bg-black rounded-2xl flex items-center justify-center border border-gray-100 dark:border-white/10 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-[color,background-color,border-color,transform,opacity] duration-500 overflow-hidden relative">
                          <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          {s.avatar_url ? (
                            <img src={s.avatar_url} alt={s.name} className="w-full h-full object-cover" />
                          ) : (
                            <UserCircle className="w-8 h-8 text-gray-200 dark:text-gray-800" />
                          )}
                        </div>
                        <div>
                          <p className="text-gray-900 dark:text-white font-black tracking-tight text-lg group-hover:text-emerald-500 transition-colors">{s.name}</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.3em] mt-1 group-hover:tracking-[0.4em] transition-[color,background-color,border-color,transform,opacity]">{s.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <div className="flex flex-wrap gap-2">
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest">
                          <Layers className="w-3.5 h-3.5" /> {t('admin.students.level')} {s.level}
                        </span>
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-widest">
                          <Activity className="w-3.5 h-3.5" /> {t('admin.students.section')} {s.section || '—'}
                        </span>
                        {s.department_name && (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-500/5 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-600 dark:text-gray-300 text-[10px] font-black uppercase tracking-widest">
                                <GraduationCap className="w-3.5 h-3.5" /> {s.department_name}
                            </span>
                        )}
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t('admin.students.protected')}</span>
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <div className="flex items-center justify-inline-end gap-3">
                        <button 
                            onClick={() => handleResetPassword(s.id)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-400 hover:text-blue-500 hover:border-blue-500/30 hover:scale-110 active:scale-95 transition-[color,background-color,border-color,transform,opacity] shadow-sm"
                            title={t('admin.students.reset_password')}
                        >
                            <Key className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleEditStudentInfo(s)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-400 hover:text-emerald-500 hover:border-emerald-500/30 hover:scale-110 active:scale-95 transition-[color,background-color,border-color,transform,opacity] shadow-sm"
                            title={t('admin.students.edit_details')}
                        >
                            <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleManageRole(s)}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-[color,background-color,border-color,transform,opacity] hover:scale-110 active:scale-95 shadow-sm ${
                                s.role && s.role !== 'student' 
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' 
                                : 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                            title={t('admin.students.change_role')}
                        >
                            <Shield className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleDeleteStudent(s.id, s.name)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-400 hover:text-rose-500 hover:border-rose-500/30 hover:scale-110 active:scale-95 transition-[color,background-color,border-color,transform,opacity] shadow-sm"
                            title={t('admin.students.delete')}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              </>
            </tbody>
          </table>
        </div>
      </div>

      {/* Premium Add Student Modal */}
      <>
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-10">
          <div 
            
            
            
            onClick={() => setShowAddModal(false)}
            className="absolute inset-0 bg-gray-950/40 dark:bg-black/80" 
          />
          <div 
            
            
            
            className="bg-white dark:bg-[#080808] border border-gray-100 dark:border-white/5 rounded-[3rem] p-8 lg:p-12 w-full max-w-2xl shadow-2xl relative overflow-hidden z-10" 
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Glows */}
            <div className="absolute top-0 inset-inline-end-0 w-64 h-64 bg-emerald-500/10 hidden rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-inner">
                    <UserPlus className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t('admin.students.add_modal_title')}</h3>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">{t('admin.students.init_node')}</p>
                  </div>
                </div>
                <button onClick={() => setShowAddModal(false)} className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.students.student_id')} *</label>
                        <input type="text" value={newStudent.id} onChange={(e) => setNewStudent({ ...newStudent, id: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 font-black focus:ring-4 focus:ring-emerald-500/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner placeholder-gray-400/50" placeholder="e.g. 2024001" required />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.students.full_name')} *</label>
                        <input type="text" value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 font-black focus:ring-4 focus:ring-emerald-500/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner placeholder-gray-400/50" placeholder={t('admin.students.full_name')} required />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.students.password')}</label>
                    <input type="text" value={newStudent.password} onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 font-black focus:ring-4 focus:ring-emerald-500/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner placeholder-gray-400/50" placeholder="Leave empty for default" />
                    <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest opacity-60 ml-1">{t('admin.students.password_hint')}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.students.level')}</label>
                        <input type="number" value={newStudent.level} onChange={(e) => setNewStudent({ ...newStudent, level: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 font-black focus:ring-4 focus:ring-emerald-500/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner" min="1" max="4" />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.students.section')}</label>
                        <input type="text" value={newStudent.section} onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 font-black focus:ring-4 focus:ring-emerald-500/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner placeholder-gray-400/50" placeholder="e.g. 1" />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.students.select_dept')}</label>
                    <div className="relative">
                        <select
                            value={newStudent.department_id}
                            onChange={(e) => setNewStudent({ ...newStudent, department_id: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 font-black focus:ring-4 focus:ring-emerald-500/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner appearance-none uppercase tracking-widest text-[11px]"
                        >
                            <option value="">{t('admin.students.no_dept')}</option>
                            {departments.map(d => (
                                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                            ))}
                        </select>
                        <div className="absolute inset-inline-end-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <ChevronRight className="w-5 h-5 rotate-90" />
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-10 border-t border-gray-100 dark:border-white/5">
                  <button type="submit" disabled={adding} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-emerald-500/20 transition-[color,background-color,border-color,transform,opacity] hover:scale-[1.02] active:scale-95 disabled:opacity-50">
                    {adding ? <Activity className="w-6 h-6 animate-spin mx-auto" /> : (
                      <span className="uppercase tracking-widest text-xs">{t('admin.students.save_student')}</span>
                    )}
                  </button>
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-12 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-black py-5 rounded-[2rem] transition-[color,background-color,border-color,transform,opacity] uppercase tracking-widest text-xs">
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      </>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(16, 185, 129, 0.1); 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.2); }
      `}</style>
    </div>
  );
};

export default StudentsManager;