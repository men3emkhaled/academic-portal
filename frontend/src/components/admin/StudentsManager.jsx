import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
  Users, UserPlus, Trash2, Key, Edit3, 
  Upload, FileSpreadsheet, ChevronRight, CheckCircle,
  Activity, Shield, GraduationCap, Layers, ShieldCheck,
  Search, Info, UserCircle, Settings, UploadCloud, X, User
} from 'lucide-react';

const AVAILABLE_PERMISSIONS = [
  { key: 'manage_courses', label_ar: 'المقررات والمهام الأكاديمية', label_en: 'Courses & Academic Tasks' },
  { key: 'manage_grades', label_ar: 'رفع وتعديل درجات الطلاب', label_en: 'Upload & Edit Grades' },
  { key: 'manage_resources', label_ar: 'المحاضرات والمصادر والملفات التعليمية', label_en: 'Lectures & Study Resources' },
  { key: 'manage_roadmap', label_ar: 'إدارة خارطة الطريق والمسار المهني', label_en: 'Roadmap & Career Tracks' },
  { key: 'manage_timetable', label_ar: 'الجداول الدراسية وجدول الامتحانات', label_en: 'Timetables & Exam Schedules' },
  { key: 'manage_notifications', label_ar: 'الإشعارات وتنبيهات الجوال الذكية', label_en: 'System & Push Notifications' },
  { key: 'manage_quizzes', label_ar: 'إعداد الاختبارات وتصحيح الإجابات', label_en: 'Quizzes & Quiz Reviews' },
  { key: 'manage_events', label_ar: 'الفعاليات الجامعية والأنشطة الطلابية', label_en: 'Events & Student Activities' },
];

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editStudent, setEditStudent] = useState({
    name: '',
    level: '1',
    section: '',
    department_id: ''
  });
  const [editRole, setEditRole] = useState({
    role: 'student',
    permissions: []
  });
  const [updating, setUpdating] = useState(false);

  const handleEditClick = (student) => {
    setSelectedStudent(student);
    setEditStudent({
      name: student.name || '',
      level: student.level?.toString() || '1',
      section: student.section?.toString() || '',
      department_id: student.department_id || ''
    });
    setShowEditModal(true);
  };

  const handleRoleClick = (student) => {
    setSelectedStudent(student);
    setEditRole({
      role: student.role || 'student',
      permissions: student.permissions || []
    });
    setShowRoleModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editStudent.name) {
      toast.error(t('admin.messages.id_name_req'));
      return;
    }
    setUpdating(true);
    try {
      await handleEditStudentInfo(selectedStudent.id, {
        name: editStudent.name,
        level: parseInt(editStudent.level),
        section: editStudent.section ? parseInt(editStudent.section) : null,
        department_id: editStudent.department_id || null
      });
      setShowEditModal(false);
    } catch (error) {
      // toast shown in parent
    } finally {
      setUpdating(false);
    }
  };

  const handlePermissionToggle = (permKey) => {
    const currentPerms = editRole.permissions || [];
    let newPerms;
    if (currentPerms.includes(permKey)) {
      newPerms = currentPerms.filter(p => p !== permKey);
    } else {
      newPerms = [...currentPerms, permKey];
    }
    setEditRole({
      ...editRole,
      permissions: newPerms
    });
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await handleManageRole(selectedStudent.id, editRole.role, editRole.permissions);
      setShowRoleModal(false);
    } catch (error) {
      // toast shown in parent
    } finally {
      setUpdating(false);
    }
  };

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
    <div className="space-y-8 sm:space-y-16 lg:space-y-24 animate-in fade-in duration-700 pb-20 max-w-[1500px] mx-auto w-full px-4 sm:px-0 text-start relative z-10">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] inset-inline-end-[-5%] w-[50vw] h-[50vw] bg-[#8b5cf6]/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] inset-inline-start-[-5%] w-[40vw] h-[40vw] bg-[#2cfc7d]/3 blur-[100px] rounded-full"></div>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-10 relative z-10">
        <div className="space-y-2 sm:space-y-4 max-w-2xl text-start">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2cfc7d]"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30">{t('admin.sidebar.tabs.students')}</span>
          </div>
          <h1 className={`text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-[0.95] tracking-tighter uppercase text-gray-900 dark:text-white ${i18n.language === 'ar' ? 'font-arabic' : ''}`}>
            {t('admin.students.title')}
          </h1>
        </div>

        <div className="bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white p-6 sm:p-8 rounded-[2.5rem] shadow-lg shadow-purple-600/20 flex flex-col justify-between relative overflow-hidden group min-w-[280px] w-full lg:w-auto">
          <div className="absolute inset-inline-end-0 top-0 w-32 h-32 bg-white/10 hidden rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-black/10 px-3 py-1 rounded-full">{t('admin.students.total_students')}</span>
          </div>
          <div className="mt-4 relative z-10 text-start">
            <p className="text-5xl sm:text-6xl font-black tracking-tighter">{students.length}</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">{t('admin.students.active_nodes')}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Actions & Import */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 relative z-20">
        {/* Left: Quick Actions & Search */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          <div className="relative group">
            <Search className="absolute inset-inline-start-6 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-[#8b5cf6] transition-colors" />
            <input 
              type="text"
              placeholder={t('admin.students.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[2rem] ps-14 sm:ps-16 pe-6 sm:pe-8 py-4.5 sm:py-6 text-gray-900 dark:text-white font-black focus:ring-4 focus:ring-[#8b5cf6]/10 focus:border-[#8b5cf6]/30 outline-none transition-all shadow-inner uppercase tracking-widest text-[10px] sm:text-[11px]"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="w-full group bg-black dark:bg-white text-white dark:text-black rounded-[2.5rem] p-6 sm:p-10 flex items-center justify-between gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl relative overflow-hidden text-start"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="flex items-center gap-4 sm:gap-6 relative z-10">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 dark:bg-black/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                <UserPlus className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div className="text-start">
                 <span className="block text-lg sm:text-2xl font-black uppercase tracking-tighter leading-none">{t('admin.students.add_student')}</span>
                 <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-1 sm:mt-1.5 block">{t('admin.students.init_node')}</span>
              </div>
            </div>
            <ChevronRight className={`w-6 h-6 sm:w-8 sm:h-8 opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all ${i18n.language === 'ar' ? 'rotate-180 group-hover:-translate-x-2' : ''}`} />
          </button>
        </div>

        {/* Right: Import Matrix */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[2.5rem] sm:rounded-[3.5rem] p-6 sm:p-10 lg:p-12 shadow-sm relative overflow-hidden group flex flex-col justify-between text-start">
           <div className="absolute inset-inline-end-0 top-0 w-96 h-96 bg-[#8b5cf6]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />
           
           <div className="relative z-10 space-y-6 sm:space-y-8 text-start">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#8b5cf6]/10 rounded-2xl flex items-center justify-center border border-[#8b5cf6]/10 text-[#8b5cf6]">
                  <UploadCloud className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div>
                    <h3 className="text-xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">{t('admin.students.import_title')}</h3>
                    <p className="text-[9px] sm:text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] mt-1 sm:mt-1.5 block leading-none">{t('admin.students.import_description')}</p>
                </div>
              </div>

              <form onSubmit={handleUploadStudents} className="flex flex-col md:flex-row items-stretch gap-4 sm:gap-6">
                <label className="relative flex-1 flex flex-col items-center justify-center gap-3 sm:gap-4 cursor-pointer bg-gray-50 dark:bg-black/40 border-2 border-gray-100 dark:border-white/10 border-dashed rounded-[2.5rem] p-6 sm:p-12 hover:border-[#8b5cf6]/40 hover:bg-[#8b5cf6]/5 transition-all group/label shadow-inner overflow-hidden">
                  <FileSpreadsheet className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 group-hover/label:text-[#8b5cf6] group-hover/label:scale-110 transition-all duration-500 relative z-10" />
                  <span className="text-gray-500 dark:text-gray-400 font-black text-center text-[9px] sm:text-[10px] uppercase tracking-[0.2em] relative z-10">
                    {studentsFile ? (
                        <span className="text-[#8b5cf6] dark:text-[#d4a3ff] break-all px-4">{studentsFile.name}</span>
                    ) : t('admin.students.click_to_upload')}
                  </span>
                  <input id="studentsFileInput" type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setStudentsFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                </label>
                <button type="submit" disabled={uploading || !studentsFile} className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-black py-5 sm:py-8 px-8 sm:px-12 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 h-auto flex flex-col items-center justify-center gap-2 sm:gap-3 group/btn">
                  {uploading ? (
                    <Activity className="w-6 h-6 sm:w-8 sm:h-8 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 sm:w-8 sm:h-8 group-hover/btn:-translate-y-1 transition-transform" />
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em]">{t('admin.students.upload_button')}</span>
                    </>
                  )}
                </button>
              </form>

              <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 bg-[#8b5cf6]/5 rounded-3xl border border-[#8b5cf6]/10">
                  <Info className="w-4 h-4 sm:w-5 sm:h-5 text-[#8b5cf6] mt-0.5 shrink-0" />
                  <p className="text-[9px] sm:text-[10px] font-black text-gray-800/60 dark:text-[#d4a3ff]/60 leading-relaxed uppercase tracking-widest text-start">
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
                <div className="bg-[#2cfc7d]/10 px-4 py-2 rounded-xl text-[#2cfc7d] text-xs font-black">
                   {filteredStudents.length}
                </div>
            </div>
        </div>

        <div className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-sm">
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
                      <td className="py-8 px-10 text-start">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-white dark:bg-black rounded-2xl flex items-center justify-center border border-gray-100 dark:border-white/10 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 overflow-hidden relative">
                            {s.avatar_url ? (
                              <img src={s.avatar_url} alt={s.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-[#8b5cf6]/10 dark:bg-white/5 flex items-center justify-center">
                                <User className="w-8 h-8 text-[#8b5cf6] dark:text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="text-start">
                            <p className="text-gray-900 dark:text-white font-black tracking-tight text-xl group-hover:text-[#2cfc7d] transition-colors leading-tight">{s.name}</p>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.4em] mt-1.5">{s.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-8 px-10 text-start">
                        <div className="flex flex-wrap gap-2">
                          <span className="px-4 py-2 rounded-xl bg-blue-500/5 border border-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest">
                            {t('admin.students.level')} {s.level}
                          </span>
                          <span className="px-4 py-2 rounded-xl bg-purple-500/5 border border-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-widest">
                            {t('admin.students.section')} {s.section || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="py-8 px-10 text-start">
                        <div className="flex items-center gap-3">
                          {s.role && s.role !== 'student' ? (
                            <span className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-[#d4a3ff] text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              {s.role}
                            </span>
                          ) : (
                            <>
                              <div className="w-2 h-2 rounded-full bg-[#2cfc7d] shadow-[0_0_12px_rgba(44,252,125,0.5)]"></div>
                              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 italic opacity-60">{t('admin.students.protected')}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-8 px-10 text-inline-end">
                        <div className="flex items-center justify-inline-end gap-3 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                          <button onClick={() => handleEditClick(s)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-400 hover:text-amber-500 transition-all shadow-sm" title={t('admin.students.edit_details')}>
                              <Edit3 className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleRoleClick(s)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-400 hover:text-purple-500 transition-all shadow-sm" title={t('admin.students.change_role')}>
                              <Shield className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleResetPassword(s.id)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-400 hover:text-blue-500 transition-all shadow-sm" title={t('admin.students.reset_password')}>
                              <Key className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDeleteStudent(s.id, s.name)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-400 hover:text-rose-500 transition-all shadow-sm" title={t('admin.students.delete')}>
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
      </div>      {/* Premium Add Student Modal */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-10">
          <div 
            onClick={() => setShowAddModal(false)}
            className="absolute inset-0 bg-gray-950/40 dark:bg-black/80 backdrop-blur-sm" 
          />
          <div 
            className="bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-6 sm:p-10 w-full max-w-2xl shadow-2xl relative overflow-hidden z-10 text-start animate-in zoom-in-95 duration-200" 
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Glows */}
            <div className="absolute top-0 inset-inline-end-0 w-64 h-64 bg-purple-500/10 hidden rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-[#8b5cf6]/10 dark:bg-[#8b5cf6]/20 rounded-2xl flex items-center justify-center border border-[#8b5cf6]/20 shadow-inner">
                    <UserPlus className="w-7 h-7 text-[#8b5cf6] dark:text-[#d4a3ff]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t('admin.students.add_modal_title')}</h3>
                    <p className="text-gray-400 text-xs lg:text-sm font-black uppercase tracking-widest mt-1">{t('admin.students.init_node')}</p>
                  </div>
                </div>
                <button onClick={() => setShowAddModal(false)} className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-xs lg:text-sm font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.students.student_id')} *</label>
                        <input type="text" value={newStudent.id} onChange={(e) => setNewStudent({ ...newStudent, id: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 text-base lg:text-lg font-black focus:ring-4 focus:ring-[#8b5cf6]/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner placeholder-gray-400/50" placeholder="e.g. 2024001" required />
                    </div>
                    <div className="space-y-3">
                        <label className="text-xs lg:text-sm font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.students.full_name')} *</label>
                        <input type="text" value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 text-base lg:text-lg font-black focus:ring-4 focus:ring-[#8b5cf6]/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner placeholder-gray-400/50" placeholder={t('admin.students.full_name')} required />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-xs lg:text-sm font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.students.password')}</label>
                    <input type="text" value={newStudent.password} onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 text-base lg:text-lg font-black focus:ring-4 focus:ring-[#8b5cf6]/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner placeholder-gray-400/50" placeholder="Leave empty for default" />
                    <p className="text-[11px] lg:text-xs text-[#8b5cf6] dark:text-[#d4a3ff] font-black uppercase tracking-widest opacity-60 ml-1">{t('admin.students.password_hint')}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-xs lg:text-sm font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.students.level')}</label>
                        <input type="number" value={newStudent.level} onChange={(e) => setNewStudent({ ...newStudent, level: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 text-base lg:text-lg font-black focus:ring-4 focus:ring-[#8b5cf6]/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner" min="1" max="4" />
                    </div>
                    <div className="space-y-3">
                        <label className="text-xs lg:text-sm font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.students.section')}</label>
                        <input type="text" value={newStudent.section} onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 text-base lg:text-lg font-black focus:ring-4 focus:ring-[#8b5cf6]/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner placeholder-gray-400/50" placeholder="e.g. 1" />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-xs lg:text-sm font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.students.select_dept')}</label>
                    <div className="relative">
                        <select
                            value={newStudent.department_id}
                            onChange={(e) => setNewStudent({ ...newStudent, department_id: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 text-base lg:text-lg font-black focus:ring-4 focus:ring-[#8b5cf6]/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner appearance-none uppercase tracking-wider"
                        >
                            <option value="" className="bg-white dark:bg-[#0c0c0e] dark:text-white">{t('admin.students.no_dept')}</option>
                            {departments.map(d => (
                                <option key={d.id} value={d.id} className="bg-white dark:bg-[#0c0c0e] dark:text-white">{d.name} ({d.code})</option>
                            ))}
                        </select>
                        <div className="absolute inset-inline-end-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <ChevronRight className="w-5 h-5 rotate-90" />
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-10 border-t border-gray-100 dark:border-white/5">
                  <button type="submit" disabled={adding} className="flex-1 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-black py-5 rounded-[2rem] shadow-xl shadow-purple-500/20 transition-[color,background-color,border-color,transform,opacity] hover:scale-[1.02] active:scale-95 disabled:opacity-50">
                    {adding ? <Activity className="w-6 h-6 animate-spin mx-auto" /> : (
                      <span className="uppercase tracking-widest text-sm lg:text-base">{t('admin.students.save_student')}</span>
                    )}
                  </button>
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-12 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-black py-5 rounded-[2rem] transition-[color,background-color,border-color,transform,opacity] uppercase tracking-widest text-sm lg:text-base">
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Student Modal */}
      {showEditModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-10">
          <div 
            onClick={() => setShowEditModal(false)}
            className="absolute inset-0 bg-gray-950/40 dark:bg-black/80 backdrop-blur-sm" 
          />
          <div 
            className="bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-6 sm:p-10 w-full max-w-2xl shadow-2xl relative overflow-hidden z-10 text-start animate-in zoom-in-95 duration-200" 
            onClick={e => e.stopPropagation()}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-amber-500/10 dark:bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-inner">
                    <Edit3 className="w-7 h-7 text-amber-500 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t('admin.students.edit_details')}</h3>
                    <p className="text-gray-400 text-xs lg:text-sm font-black uppercase tracking-widest mt-1">{selectedStudent?.id}</p>
                  </div>
                </div>
                <button onClick={() => setShowEditModal(false)} className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="space-y-3">
                    <label className="text-xs lg:text-sm font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.students.full_name')} *</label>
                    <input type="text" value={editStudent.name} onChange={(e) => setEditStudent({ ...editStudent, name: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 text-base lg:text-lg font-black focus:ring-4 focus:ring-amber-500/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner placeholder-gray-400/50" required placeholder={t('admin.students.full_name')} />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-xs lg:text-sm font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.students.level')}</label>
                        <input type="number" value={editStudent.level} onChange={(e) => setEditStudent({ ...editStudent, level: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 text-base lg:text-lg font-black focus:ring-4 focus:ring-amber-500/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner" min="1" max="4" />
                    </div>
                    <div className="space-y-3">
                        <label className="text-xs lg:text-sm font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.students.section')}</label>
                        <input type="text" value={editStudent.section} onChange={(e) => setEditStudent({ ...editStudent, section: e.target.value })} className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 text-base lg:text-lg font-black focus:ring-4 focus:ring-amber-500/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner placeholder-gray-400/50" placeholder="e.g. 1" />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-xs lg:text-sm font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.students.select_dept')}</label>
                    <div className="relative">
                        <select
                            value={editStudent.department_id}
                            onChange={(e) => setEditStudent({ ...editStudent, department_id: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 text-base lg:text-lg font-black focus:ring-4 focus:ring-amber-500/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner appearance-none uppercase tracking-wider"
                        >
                            <option value="" className="bg-white dark:bg-[#0c0c0e] dark:text-white">{t('admin.students.no_dept')}</option>
                            {departments.map(d => (
                                <option key={d.id} value={d.id} className="bg-white dark:bg-[#0c0c0e] dark:text-white">{d.name} ({d.code})</option>
                            ))}
                        </select>
                        <div className="absolute inset-inline-end-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <ChevronRight className="w-5 h-5 rotate-90" />
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-10 border-t border-gray-100 dark:border-white/5">
                  <button type="submit" disabled={updating} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-amber-500/20 transition-[color,background-color,border-color,transform,opacity] hover:scale-[1.02] active:scale-95 disabled:opacity-50">
                    {updating ? <Activity className="w-6 h-6 animate-spin mx-auto" /> : (
                      <span className="uppercase tracking-widest text-sm lg:text-base">{t('admin.students.save_student')}</span>
                    )}
                  </button>
                  <button type="button" onClick={() => setShowEditModal(false)} className="px-12 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-black py-5 rounded-[2rem] transition-[color,background-color,border-color,transform,opacity] uppercase tracking-widest text-sm lg:text-base">
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Manage Role Modal */}
      {showRoleModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-10">
          <div 
            onClick={() => setShowRoleModal(false)}
            className="absolute inset-0 bg-gray-950/40 dark:bg-black/80 backdrop-blur-sm" 
          />
          <div 
            className="bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-6 sm:p-10 w-full max-w-2xl shadow-2xl relative overflow-hidden z-10 text-start animate-in zoom-in-95 duration-200" 
            onClick={e => e.stopPropagation()}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-purple-500/10 dark:bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/20 shadow-inner">
                    <Shield className="w-7 h-7 text-purple-500 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{t('admin.students.change_role')}</h3>
                    <p className="text-gray-400 text-xs lg:text-sm font-black uppercase tracking-widest mt-1">{selectedStudent?.name} ({selectedStudent?.id})</p>
                  </div>
                </div>
                <button onClick={() => setShowRoleModal(false)} className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleRoleSubmit} className="space-y-6">
                <div className="space-y-3">
                    <label className="text-xs lg:text-sm font-black text-gray-400 uppercase tracking-widest ml-1">{t('admin.students.change_role')}</label>
                    <div className="relative">
                        <select
                            value={editRole.role}
                            onChange={(e) => setEditRole({ ...editRole, role: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 text-base lg:text-lg font-black focus:ring-4 focus:ring-purple-500/10 outline-none transition-[color,background-color,border-color,transform,opacity] shadow-inner appearance-none uppercase tracking-wider"
                        >
                            <option value="student" className="bg-white dark:bg-[#0c0c0e] dark:text-white">Student (طالب)</option>
                            <option value="assistant" className="bg-white dark:bg-[#0c0c0e] dark:text-white">Assistant (معيد / مساعد محاضر)</option>
                            <option value="admin" className="bg-white dark:bg-[#0c0c0e] dark:text-white">Admin (مسؤول إدارة النظام)</option>
                        </select>
                        <div className="absolute inset-inline-end-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <ChevronRight className="w-5 h-5 rotate-90" />
                        </div>
                    </div>
                </div>

                {/* Permissions Toggles for Assistant Role */}
                {editRole.role === 'assistant' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300 text-start">
                    <label className="text-xs lg:text-sm font-black text-gray-400 uppercase tracking-widest ml-1">
                      {i18n.language === 'ar' ? 'التبويبات المتاحة للوصول' : 'Accessible Tabs / Permissions'}
                    </label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50/50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-[2rem] p-5 max-h-[220px] overflow-y-auto custom-scrollbar">
                      {AVAILABLE_PERMISSIONS.map((perm) => {
                        const isChecked = (editRole.permissions || []).includes(perm.key);
                        return (
                          <div 
                            key={perm.key}
                            onClick={() => handlePermissionToggle(perm.key)}
                            className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer select-none
                              ${isChecked 
                                ? 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400 font-bold scale-[1.01]' 
                                : 'bg-white dark:bg-[#101015]/40 border-gray-100 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.03]'
                              }
                            `}
                          >
                            <span className="text-[11px] lg:text-xs font-black tracking-wide text-start">
                              {i18n.language === 'ar' ? perm.label_ar : perm.label_en}
                            </span>
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all
                              ${isChecked 
                                ? 'bg-purple-500 border-purple-500 text-white' 
                                : 'border-gray-300 dark:border-white/20'
                              }
                            `}>
                              {isChecked && (
                                <svg className="w-3.5 h-3.5 stroke-[3] stroke-white" fill="none" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Admin Complete Access Info */}
                {editRole.role === 'admin' && (
                  <div className="p-5 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold leading-relaxed text-start flex items-start gap-4 animate-in fade-in duration-300">
                    <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>
                      {i18n.language === 'ar' 
                        ? 'يمتلك مسؤول إدارة النظام (Admin) صلاحيات وصول كاملة ومطلقة لجميع تبويبات وأدوات النظام بشكل تلقائي.' 
                        : 'Administrators (Admins) automatically have full, unrestricted access to all tabs and system tools.'}
                    </span>
                  </div>
                )}

                <div className="flex gap-4 pt-10 border-t border-gray-100 dark:border-white/5">
                  <button type="submit" disabled={updating} className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-purple-500/20 transition-[color,background-color,border-color,transform,opacity] hover:scale-[1.02] active:scale-95 disabled:opacity-50">
                    {updating ? <Activity className="w-6 h-6 animate-spin mx-auto" /> : (
                      <span className="uppercase tracking-widest text-sm lg:text-base">{t('admin.students.save_student')}</span>
                    )}
                  </button>
                  <button type="button" onClick={() => setShowRoleModal(false)} className="px-12 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-black py-5 rounded-[2rem] transition-[color,background-color,border-color,transform,opacity] uppercase tracking-widest text-sm lg:text-base">
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: rgba(139, 92, 246, 0.2); 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(139, 92, 246, 0.4); }
      `}</style>
    </div>
  );
};

export default StudentsManager;