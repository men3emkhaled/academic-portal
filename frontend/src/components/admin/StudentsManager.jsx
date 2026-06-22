import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
  Users, UserPlus, Trash2, Key, Edit3, 
  Upload, FileSpreadsheet, CheckCircle,
  Shield, Search, Info, X, User
} from 'lucide-react';

const PERMISSION_KEYS = [
  'manage_courses', 'manage_grades', 'manage_resources', 'manage_roadmap',
  'manage_timetable', 'manage_notifications', 'manage_quizzes', 'manage_events', 'manage_material_hub'
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
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [newStudent, setNewStudent] = useState({
    id: '', name: '', password: '', level: '1', section: '', department_id: '', batch: '2025'
  });
  const [adding, setAdding] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editStudent, setEditStudent] = useState({
    name: '', level: '1', section: '', department_id: '', batch: '2025'
  });
  const [editRole, setEditRole] = useState({ role: 'student', permissions: [] });
  const [updating, setUpdating] = useState(false);

  const handleEditClick = (student) => {
    setSelectedStudent(student);
    setEditStudent({
      name: student.name || '',
      level: student.level?.toString() || '1',
      section: student.section?.toString() || '',
      department_id: student.department_id || '',
      batch: student.batch?.toString() || '2025'
    });
    setShowEditModal(true);
  };

  const handleRoleClick = (student) => {
    setSelectedStudent(student);
    setEditRole({ role: student.role || 'student', permissions: student.permissions || [] });
    setShowRoleModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editStudent.name) { toast.error(t('admin.messages.id_name_req')); return; }
    setUpdating(true);
    try {
      await handleEditStudentInfo(selectedStudent.id, {
        name: editStudent.name,
        level: parseInt(editStudent.level),
        section: editStudent.section ? parseInt(editStudent.section) : null,
        department_id: editStudent.department_id || null,
        batch: parseInt(editStudent.batch) || 2025
      });
      setShowEditModal(false);
    } catch (error) {} finally { setUpdating(false); }
  };

  const handlePermissionToggle = (permKey) => {
    const currentPerms = editRole.permissions || [];
    const newPerms = currentPerms.includes(permKey)
      ? currentPerms.filter(p => p !== permKey)
      : [...currentPerms, permKey];
    setEditRole({ ...editRole, permissions: newPerms });
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await handleManageRole(selectedStudent.id, editRole.role, editRole.permissions);
      setShowRoleModal(false);
    } catch (error) {} finally { setUpdating(false); }
  };

  const handleUploadStudents = async (e) => {
    e.preventDefault();
    if (!studentsFile) { toast.error(t('admin.messages.upload_file_req')); return; }
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
    } finally { setUploading(false); }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newStudent.id || !newStudent.name) { toast.error(t('admin.messages.id_name_req')); return; }
    setAdding(true);
    try {
      await onAddStudent({ ...newStudent, batch: parseInt(newStudent.batch) || 2025 });
      toast.success(t('common.success'));
      setShowAddModal(false);
      setNewStudent({ id: '', name: '', password: '', level: '1', section: '', department_id: '', batch: '2025' });
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.messages.add_student_failed'));
    } finally { setAdding(false); }
  };

  const uniqueLevels = [...new Set(students.map(s => s.level).filter(Boolean))].sort((a, b) => a - b);
  const uniqueSections = [...new Set(students.map(s => s.section).filter(Boolean))].sort((a, b) => {
    const na = parseInt(a, 10); const nb = parseInt(b, 10);
    if (isNaN(na) || isNaN(nb)) return a.toString().localeCompare(b.toString());
    return na - nb;
  });

  const hasActiveFilter = isFilterActive || searchTerm.trim() !== '';

  const filteredStudents = hasActiveFilter 
    ? students.filter(s => {
        const matchesSearch = !searchTerm.trim() || s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || s.id?.toString().includes(searchTerm);
        const matchesDept = selectedDept === 'all' || s.department_id?.toString() === selectedDept.toString();
        const matchesLevel = selectedLevel === 'all' || s.level?.toString() === selectedLevel.toString();
        const matchesSection = selectedSection === 'all' || s.section?.toString() === selectedSection.toString();
        return matchesSearch && matchesDept && matchesLevel && matchesSection;
      })
    : [];

  const renderModal = (visible, onClose, title, subtitle, icon, children) =>
    visible && createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div onClick={onClose} className="absolute inset-0 bg-black/40" />
        <div className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-gray-700 rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto relative z-10 p-6" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#059669]/10 rounded-lg flex items-center justify-center text-[#059669]">
                {icon}
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
                {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          {children}
        </div>
      </div>,
      document.body
    );

  return (
    <div className="space-y-6 pb-10 max-w-[1400px] mx-auto w-full px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.students.title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {students.length} {t('admin.students.total_students')}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors">
            <UserPlus className="w-4 h-4" />
            {t('admin.students.add_student')}
          </button>
        </div>
      </div>

      {/* Search + Import */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder={t('admin.students.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none"
          />
        </div>

        <form onSubmit={handleUploadStudents} className="flex gap-2">
          <label className="relative flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-[#059669]/40 transition-colors text-sm text-gray-500">
            <FileSpreadsheet className="w-4 h-4" />
            {studentsFile ? <span className="text-[#059669] max-w-[120px] truncate">{studentsFile.name}</span> : t('admin.students.click_to_upload')}
            <input id="studentsFileInput" type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setStudentsFile(e.target.files[0])} className="hidden" />
          </label>
          <button type="submit" disabled={uploading || !studentsFile} className="px-4 py-2 bg-[#059669] hover:bg-[#047857] disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
            {uploading ? '...' : <Upload className="w-4 h-4" />}
          </button>
        </form>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select value={selectedDept} onChange={(e) => { setSelectedDept(e.target.value); setIsFilterActive(true); }}
          className="bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#059669]/30 outline-none">
          <option value="all">{t('admin.students.all_depts')}</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select value={selectedLevel} onChange={(e) => { setSelectedLevel(e.target.value); setIsFilterActive(true); }}
          className="bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#059669]/30 outline-none">
          <option value="all">{t('admin.students.all_levels')}</option>
          {uniqueLevels.map(lvl => <option key={lvl} value={lvl}>{t('admin.students.level_num', { num: lvl })}</option>)}
        </select>
        <select value={selectedSection} onChange={(e) => { setSelectedSection(e.target.value); setIsFilterActive(true); }}
          className="bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#059669]/30 outline-none">
          <option value="all">{t('admin.students.all_sections')}</option>
          {uniqueSections.map(sec => <option key={sec} value={sec}>{t('admin.students.section', { num: sec })}</option>)}
        </select>
        {hasActiveFilter && (
          <button onClick={() => { setSelectedDept('all'); setSelectedLevel('all'); setSelectedSection('all'); setIsFilterActive(false); setSearchTerm(''); }}
            className="px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Info hint for import */}
      {!hasActiveFilter && (
        <div className="flex items-start gap-2 p-3 bg-[#059669]/5 rounded-lg border border-[#059669]/10">
          <Info className="w-4 h-4 text-[#059669] mt-0.5 shrink-0" />
          <p className="text-xs text-gray-500">{t('admin.students.import_hint')}</p>
        </div>
      )}

      {/* Table */}
      {!hasActiveFilter ? (
        <div className="py-16 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <h3 className="text-base font-medium text-gray-500 dark:text-gray-400">{t('admin.students.select_filters')}</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
            {t('admin.students.filter_hint')}
          </p>
          <button onClick={() => { setSelectedDept('all'); setSelectedLevel('all'); setSelectedSection('all'); setIsFilterActive(true); }}
            className="mt-4 px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors">
            {t('admin.students.show_all')}
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 text-start">{t('admin.students.name_id')}</th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 text-start">{t('admin.students.level_section')}</th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 text-start">{t('admin.students.status')}</th>
                  <th className="py-3 px-4 text-xs font-medium text-gray-500 text-end">{t('admin.students.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredStudents.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-16 text-sm text-gray-400">{t('admin.students.no_students')}</td></tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                            {s.avatar_url ? (
                              <img src={s.avatar_url} alt={s.name} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <User className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</p>
                            <span className="text-xs text-gray-400">{s.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          <span className="px-2 py-0.5 rounded text-xs bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            {t('admin.students.level')} {s.level}
                          </span>
                          <span className="px-2 py-0.5 rounded text-xs bg-[#059669]/10 text-[#059669]">
                            {t('admin.students.section')} {s.section || '—'}
                          </span>
                          <span className="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-500">
                            {s.batch || 2025}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {s.role && s.role !== 'student' ? (
                          <span className="px-2 py-0.5 rounded text-xs bg-[#059669]/10 text-[#059669]">
                            {t(`admin.students.roles.${s.role}`, s.role)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">{t('admin.students.protected')}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => handleEditClick(s)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors" title={t('admin.students.edit_details')}>
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleRoleClick(s)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#059669] hover:bg-[#059669]/10 transition-colors" title={t('admin.students.change_role')}>
                            <Shield className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleResetPassword(s.id)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors" title={t('admin.students.reset_password')}>
                            <Key className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteStudent(s.id, s.name)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors" title={t('admin.students.delete')}>
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
      )}

      {/* Add Modal */}
      {renderModal(showAddModal, () => setShowAddModal(false), t('admin.students.add_modal_title'), t('admin.students.init_node'), <UserPlus className="w-5 h-5" />,
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">{t('admin.students.student_id')} *</label>
              <input type="text" value={newStudent.id} onChange={(e) => setNewStudent({ ...newStudent, id: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none" placeholder={t('admin.students.id_placeholder')} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">{t('admin.students.full_name')} *</label>
              <input type="text" value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">{t('admin.students.password')}</label>
            <input type="text" value={newStudent.password} onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none" placeholder={t('admin.students.password_hint')} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">{t('admin.students.level')}</label>
              <input type="number" value={newStudent.level} onChange={(e) => setNewStudent({ ...newStudent, level: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none" min="1" max="4" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">{t('admin.students.section')}</label>
              <input type="text" value={newStudent.section} onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none" placeholder={t('admin.students.section_placeholder')} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">{t('admin.students.batch_label')}</label>
              <input type="number" value={newStudent.batch} onChange={(e) => setNewStudent({ ...newStudent, batch: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none" placeholder={t('admin.students.batch_placeholder')} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">{t('admin.students.select_dept')}</label>
            <select value={newStudent.department_id} onChange={(e) => setNewStudent({ ...newStudent, department_id: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none">
              <option value="">{t('admin.students.no_dept')}</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="submit" disabled={adding} className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
              {adding ? '...' : t('admin.students.save_student')}
            </button>
            <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors">
              {t('common.cancel')}
            </button>
          </div>
        </form>
      )}

      {/* Edit Modal */}
      {renderModal(showEditModal, () => setShowEditModal(false), t('admin.students.edit_details'), selectedStudent?.id, <Edit3 className="w-5 h-5" />,
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">{t('admin.students.full_name')} *</label>
            <input type="text" value={editStudent.name} onChange={(e) => setEditStudent({ ...editStudent, name: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none" required />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">{t('admin.students.level')}</label>
              <input type="number" value={editStudent.level} onChange={(e) => setEditStudent({ ...editStudent, level: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none" min="1" max="4" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">{t('admin.students.section')}</label>
              <input type="text" value={editStudent.section} onChange={(e) => setEditStudent({ ...editStudent, section: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none" placeholder={t('admin.students.section_placeholder')} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">{t('admin.students.batch_label')}</label>
              <input type="number" value={editStudent.batch} onChange={(e) => setEditStudent({ ...editStudent, batch: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none" placeholder={t('admin.students.batch_placeholder')} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">{t('admin.students.select_dept')}</label>
            <select value={editStudent.department_id} onChange={(e) => setEditStudent({ ...editStudent, department_id: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none">
              <option value="">{t('admin.students.no_dept')}</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="submit" disabled={updating} className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
              {updating ? '...' : t('admin.students.save_student')}
            </button>
            <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors">
              {t('common.cancel')}
            </button>
          </div>
        </form>
      )}

      {/* Role Modal */}
      {renderModal(showRoleModal, () => setShowRoleModal(false), t('admin.students.change_role'), `${selectedStudent?.name} (${selectedStudent?.id})`, <Shield className="w-5 h-5" />,
        <form onSubmit={handleRoleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">{t('admin.students.change_role')}</label>
            <select value={editRole.role} onChange={(e) => setEditRole({ ...editRole, role: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none">
              <option value="student">{t('admin.students.roles.student')}</option>
              <option value="assistant">{t('admin.students.roles.assistant')}</option>
              <option value="admin">{t('admin.students.roles.admin')}</option>
            </select>
          </div>
          {editRole.role === 'assistant' && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500">{t('admin.students.change_role')}</label>
              <div className="grid grid-cols-1 gap-1.5 max-h-[200px] overflow-y-auto">
                {PERMISSION_KEYS.map((permKey) => {
                  const isChecked = (editRole.permissions || []).includes(permKey);
                  return (
                    <div key={permKey} onClick={() => handlePermissionToggle(permKey)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer text-sm
                        ${isChecked ? 'bg-[#059669]/10 border-[#059669]/30 text-[#059669]' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                      <span>{t(`admin.students.permissions.${permKey}`)}</span>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${isChecked ? 'bg-[#059669] border-[#059669]' : 'border-gray-300 dark:border-gray-600'}`}>
                        {isChecked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" stroke="currentColor" /></svg>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {editRole.role === 'admin' && (
            <div className="p-3 rounded-lg bg-[#059669]/10 border border-[#059669]/20 text-xs text-[#059669]">
              {t('admin.students.full_access')}
            </div>
          )}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="submit" disabled={updating} className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
              {updating ? '...' : t('admin.students.save_student')}
            </button>
            <button type="button" onClick={() => setShowRoleModal(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors">
              {t('common.cancel')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default StudentsManager;
