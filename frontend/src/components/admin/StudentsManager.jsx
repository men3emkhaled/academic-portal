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
  const { t, i18n } = useTranslation();
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
    <div className="space-y-16 lg:space-y-24 animate-in fade-in duration-700 pb-20 max-w-[1500px] mx-auto w-full">
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
        <div className="space-y-4 max-w-2xl text-start">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30">{t('admin.sidebar.tabs.students')}</span>
          </div>
          <h1 className={`text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-[0.95] tracking-tighter uppercase text-gray-900 dark:text-white ${i18n.language === 'ar' ? 'font-arabic' : ''}`}>
            {t('admin.students.title')}
          </h1>
        </div>

        <div className="bg-primary text-white p-8 rounded-[2.5rem] shadow-lg shadow-primary/20 flex flex-col justify-between relative overflow-hidden group min-w-[280px]">
          <div className="absolute inset-inline-end-0 top-0 w-32 h-32 bg-white/10 hidden rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-black/10 px-3 py-1 rounded-full">{t('admin.students.total_students')}</span>
          </div>
          <div className="mt-4 relative z-10">
            <p className="text-6xl font-black tracking-tighter">{students.length}</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">{t('admin.students.active_nodes')}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Actions & Import */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Quick Actions & Search */}
        <div className="lg:col-span-4 space-y-6">
          <div className="relative group">
            <Search className="absolute inset-inline-start-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder={t('admin.students.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-[#151520] border border-gray-100 dark:border-white/5 rounded-[2rem] ps-16 pe-8 py-6 text-gray-900 dark:text-white font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner uppercase tracking-widest text-[11px]"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="w-full group bg-black dark:bg-white text-white dark:text-black rounded-[2.5rem] p-10 flex flex-col items-center justify-center gap-6 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-16 h-16 bg-white/10 dark:bg-black/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 relative z-10">
              <UserPlus className="w-8 h-8" />
            </div>
            <div className="text-center relative z-10">
               <span className="block text-2xl font-black uppercase tracking-tighter">{t('admin.students.add_student')}</span>
               <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{t('admin.students.init_node')}</span>
            </div>
          </button>
        </div>

        {/* Right: Import Matrix */}
        <div className="lg:col-span-8 bg-white dark:bg-[#151520] border border-gray-100 dark:border-white/5 rounded-[3.5rem] p-10 lg:p-12 shadow-sm relative overflow-hidden group flex flex-col justify-between">
           <div className="absolute inset-inline-end-0 top-0 w-96 h-96 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />
           
           <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/10 text-primary">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">{t('admin.students.import_title')}</h3>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] mt-1">{t('admin.students.import_description')}</p>
                </div>
              </div>

              <form onSubmit={handleUploadStudents} className="flex flex-col md:flex-row items-stretch gap-6">
                <label className="relative flex-1 flex flex-col items-center justify-center gap-4 cursor-pointer bg-gray-50 dark:bg-black/40 border-2 border-gray-100 dark:border-white/10 border-dashed rounded-[2.5rem] p-12 hover:border-primary/40 hover:bg-primary/5 transition-all group/label shadow-inner overflow-hidden">
                  <FileSpreadsheet className="w-12 h-12 text-gray-300 group-hover/label:text-primary group-hover/label:scale-110 transition-all duration-500 relative z-10" />
                  <span className="text-gray-500 dark:text-gray-400 font-black text-center text-[10px] uppercase tracking-[0.2em] relative z-10">
                    {studentsFile ? (
                        <span className="text-primary dark:text-primary">{studentsFile.name}</span>
                    ) : t('admin.students.click_to_upload')}
                  </span>
                  <input id="studentsFileInput" type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setStudentsFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                </label>
                <button type="submit" disabled={uploading || !studentsFile} className="bg-primary hover:bg-primary text-white font-black py-8 px-12 rounded-[2.5rem] shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 h-auto flex flex-col items-center justify-center gap-3 group/btn">
                  {uploading ? (
                    <Activity className="w-8 h-8 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 group-hover/btn:-translate-y-1 transition-transform" />
                      <span className="text-[10px] uppercase tracking-[0.3em]">{t('admin.students.upload_button')}</span>
                    </>
                  )}
                </button>
              </form>

              <div className="flex items-start gap-4 p-6 bg-primary/5 rounded-3xl border border-primary/10">
                  <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <p className="text-[10px] font-black text-gray-800/60 dark:text-primary/60 leading-relaxed uppercase tracking-widest">
                      {t('admin.students.import_hint')}
                  </p>
              </div>
           </div>
        </div>
      </div>

      {/* Student Matrix Table */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
                <h2 className="text-3xl font-black uppercase tracking-tighter">{t('admin.students.saved_students')}</h2>
                <div className="bg-primary/10 px-4 py-2 rounded-xl text-primary text-xs font-black">
                   {filteredStudents.length}
                </div>
            </div>
        </div>

        <div className="bg-white dark:bg-[#151520] border border-gray-100 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-sm">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-start border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-white/[0.01]">
                  <th className="py-8 px-10 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.3em] text-start">{t('admin.students.name_id')}</th>
                  <th className="py-8 px-10 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.3em] text-start">{t('admin.students.level_section')}</th>
                  <th className="py-8 px-10 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.3em] text-start">{t('admin.students.status')}</th>
                  <th className="py-8 px-10 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.3em] text-inline-end">{t('admin.students.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.03]">
                {filteredStudents.length === 0 ? (
                  <tr>
                      <td colSpan="4" className="text-center py-40">
                          <div className="flex flex-col items-center gap-6 opacity-30 grayscale">
                              <Users className="w-20 h-20 text-gray-400" />
                              <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-xs">{t('admin.students.no_students')}</p>
                          </div>
                      </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.id} className="group hover:bg-gray-50/30 dark:hover:bg-white/[0.01] transition-all">
                      <td className="py-8 px-10">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-white dark:bg-black rounded-2xl flex items-center justify-center border border-gray-100 dark:border-white/10 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 overflow-hidden relative">
                            {s.avatar_url ? (
                              <img src={s.avatar_url} alt={s.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="text-2xl font-black text-gray-100 dark:text-white/5">{s.name?.charAt(0)}</div>
                            )}
                          </div>
                          <div>
                            <p className="text-gray-900 dark:text-white font-black tracking-tight text-xl group-hover:text-primary transition-colors leading-tight">{s.name}</p>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.4em] mt-1.5">{s.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-8 px-10">
                        <div className="flex flex-wrap gap-2">
                          <span className="px-4 py-2 rounded-xl bg-blue-500/5 border border-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest">
                            {t('admin.students.level')} {s.level}
                          </span>
                          <span className="px-4 py-2 rounded-xl bg-purple-500/5 border border-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-widest">
                            {t('admin.students.section')} {s.section || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="py-8 px-10">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_12px_rgba(16,185,129,0.5)]"></div>
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 italic opacity-60">{t('admin.students.protected')}</span>
                        </div>
                      </td>
                      <td className="py-8 px-10">
                        <div className="flex items-center justify-inline-end gap-3 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                          <button onClick={() => handleResetPassword(s.id)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-400 hover:text-blue-500 transition-all shadow-sm">
                              <Key className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDeleteStudent(s.id, s.name)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-400 hover:text-rose-500 transition-all shadow-sm">
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
            <div className="absolute top-0 inset-inline-end-0 w-64 h-64 bg-primary/10 hidden rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
                    <UserPlus className="w-7 h-7 text-primary dark:text-primary" />
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
                        <input type="text" value={newStudent.id} onChange={(e) => setNewStudent({ ...newStudent, id: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 font-black focus:ring-4 focus:ring-primary/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner placeholder-gray-400/50" placeholder="e.g. 2024001" required />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.students.full_name')} *</label>
                        <input type="text" value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 font-black focus:ring-4 focus:ring-primary/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner placeholder-gray-400/50" placeholder={t('admin.students.full_name')} required />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.students.password')}</label>
                    <input type="text" value={newStudent.password} onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 font-black focus:ring-4 focus:ring-primary/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner placeholder-gray-400/50" placeholder="Leave empty for default" />
                    <p className="text-[9px] text-primary font-black uppercase tracking-widest opacity-60 ml-1">{t('admin.students.password_hint')}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.students.level')}</label>
                        <input type="number" value={newStudent.level} onChange={(e) => setNewStudent({ ...newStudent, level: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 font-black focus:ring-4 focus:ring-primary/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner" min="1" max="4" />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.students.section')}</label>
                        <input type="text" value={newStudent.section} onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 font-black focus:ring-4 focus:ring-primary/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner placeholder-gray-400/50" placeholder="e.g. 1" />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.students.select_dept')}</label>
                    <div className="relative">
                        <select
                            value={newStudent.department_id}
                            onChange={(e) => setNewStudent({ ...newStudent, department_id: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 font-black focus:ring-4 focus:ring-primary/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner appearance-none uppercase tracking-widest text-[11px]"
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
                  <button type="submit" disabled={adding} className="flex-1 bg-primary hover:bg-primary text-white font-black py-5 rounded-[2rem] shadow-xl shadow-primary/20 transition-[color,background-color,border-color,transform,opacity] hover:scale-[1.02] active:scale-95 disabled:opacity-50">
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
          background: var(--primary-alpha-10, rgba(46, 204, 113, 0.1)); 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--primary-alpha-20, rgba(46, 204, 113, 0.2)); }
      `}</style>
    </div>
  );
};

export default StudentsManager;