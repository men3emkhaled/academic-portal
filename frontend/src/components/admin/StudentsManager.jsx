import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  Users, UserPlus, Trash2, Key, Edit3,
  Upload, FileSpreadsheet, ShieldCheck,
  Shield, GraduationCap, Info, User, X
} from 'lucide-react';

import {
  PageContainer,
  PageHeader,
  StatCard,
  SectionCard,
  Toolbar,
  SearchInput,
  DataTable,
  StatusBadge,
  EmptyState,
  FormField,
  Modal,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

const AVAILABLE_PERMISSIONS = [
  { key: 'manage_courses', label_ar: 'المقررات والمهام الأكاديمية', label_en: 'Courses & Academic Tasks' },
  { key: 'manage_grades', label_ar: 'رفع وتعديل درجات الطلاب', label_en: 'Upload & Edit Grades' },
  { key: 'manage_resources', label_ar: 'المحاضرات والمصادر والملفات التعليمية', label_en: 'Lectures & Study Resources' },
  { key: 'manage_roadmap', label_ar: 'إدارة خارطة الطريق والمسار المهني', label_en: 'Roadmap & Career Tracks' },
  { key: 'manage_timetable', label_ar: 'الجداول الدراسية وجدول الامتحانات', label_en: 'Timetables & Exam Schedules' },
  { key: 'manage_notifications', label_ar: 'الإشعارات وتنبيهات الجوال الذكية', label_en: 'System & Push Notifications' },
  { key: 'manage_quizzes', label_ar: 'إعداد الاختبارات وتصحيح الإجابات', label_en: 'Quizzes & Quiz Reviews' },
  { key: 'manage_events', label_ar: 'الفعاليات الجامعية والأنشطة الطلابية', label_en: 'Events & Student Activities' },
  { key: 'manage_material_hub', label_ar: 'ناشر موثوق — رفع مواد بدون مراجعة', label_en: 'Trusted Publisher — Post Without Review' },
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
  const isAr = i18n.language === 'ar';
  const [uploading, setUploading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [newStudent, setNewStudent] = useState({
    id: '',
    name: '',
    password: '',
    level: '1',
    section: '',
    department_id: '',
    batch: '2025'
  });
  const [adding, setAdding] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editStudent, setEditStudent] = useState({
    name: '',
    level: '1',
    section: '',
    department_id: '',
    batch: '2025'
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
      department_id: student.department_id || '',
      batch: student.batch?.toString() || '2025'
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
        department_id: editStudent.department_id || null,
        batch: parseInt(editStudent.batch) || 2025
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
      await onAddStudent({
        ...newStudent,
        batch: parseInt(newStudent.batch) || 2025
      });
      toast.success(t('common.success'));
      setShowAddModal(false);
      setNewStudent({
        id: '',
        name: '',
        password: '',
        level: '1',
        section: '',
        department_id: '',
        batch: '2025'
      });
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.messages.add_student_failed'));
    } finally {
      setAdding(false);
    }
  };

  const uniqueLevels = [...new Set(students.map(s => s.level).filter(Boolean))].sort((a, b) => a - b);
  const uniqueSections = [...new Set(students.map(s => s.section).filter(Boolean))].sort((a, b) => {
    const na = parseInt(a, 10);
    const nb = parseInt(b, 10);
    if (isNaN(na) || isNaN(nb)) return a.toString().localeCompare(b.toString());
    return na - nb;
  });

  const hasActiveFilter = isFilterActive || searchTerm.trim() !== '';

  const filteredStudents = hasActiveFilter
    ? students.filter(s => {
        // Search term check
        const matchesSearch = !searchTerm.trim() ||
                             s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             s.id?.toString().includes(searchTerm);

        // Department check
        const matchesDept = selectedDept === 'all' || s.department_id?.toString() === selectedDept.toString();

        // Level check
        const matchesLevel = selectedLevel === 'all' || s.level?.toString() === selectedLevel.toString();

        // Section check
        const matchesSection = selectedSection === 'all' || s.section?.toString() === selectedSection.toString();

        return matchesSearch && matchesDept && matchesLevel && matchesSection;
      })
    : [];

  const resetFilters = () => {
    setSelectedDept('all');
    setSelectedLevel('all');
    setSelectedSection('all');
    setIsFilterActive(false);
    setSearchTerm('');
  };

  const showAllStudents = () => {
    setSelectedDept('all');
    setSelectedLevel('all');
    setSelectedSection('all');
    setIsFilterActive(true);
  };

  const tableColumns = [
    {
      key: 'name',
      header: t('admin.students.name_id'),
      render: (s) => (
        <div className="flex items-center gap-3">
          <Avatar>
            {s.avatar_url ? <AvatarImage src={s.avatar_url} alt={s.name} /> : null}
            <AvatarFallback>
              <User className="size-4" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{s.name}</p>
            <p className="truncate text-xs text-muted-foreground">{s.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'level_section',
      header: t('admin.students.level_section'),
      render: (s) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge variant="neutral">
            {t('admin.students.level')} {s.level}
          </StatusBadge>
          <StatusBadge variant="neutral">
            {t('admin.students.section')} {s.section || '—'}
          </StatusBadge>
          <StatusBadge variant="neutral">
            {isAr ? 'العام الدراسي' : 'Academic Year'} {s.batch || 2025}
          </StatusBadge>
        </div>
      ),
    },
    {
      key: 'status',
      header: t('admin.students.status'),
      render: (s) => (
        s.role && s.role !== 'student' ? (
          <StatusBadge variant="accent" icon={ShieldCheck}>{s.role}</StatusBadge>
        ) : (
          <StatusBadge variant="neutral">{t('admin.students.protected')}</StatusBadge>
        )
      ),
    },
    {
      key: 'actions',
      header: t('admin.students.actions'),
      headClassName: 'text-end',
      cellClassName: 'text-end',
      render: (s) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => handleEditClick(s)} aria-label={t('admin.students.edit_details')} title={t('admin.students.edit_details')}>
            <Edit3 className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleRoleClick(s)} aria-label={t('admin.students.change_role')} title={t('admin.students.change_role')}>
            <Shield className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleResetPassword(s.id)} aria-label={t('admin.students.reset_password')} title={t('admin.students.reset_password')}>
            <Key className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteStudent(s.id, s.name)} aria-label={t('admin.students.delete')} title={t('admin.students.delete')} className="hover:bg-destructive/10 hover:text-destructive">
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer size="wide" className={isAr ? 'font-arabic' : undefined}>
      {/* Header */}
      <PageHeader
        icon={GraduationCap}
        title={t('admin.students.title')}
        description={t('admin.sidebar.tabs.students')}
        actions={
          <Button onClick={() => setShowAddModal(true)}>
            <UserPlus className="size-4" />
            {t('admin.students.add_student')}
          </Button>
        }
      />

      {/* Key metric + Import */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatCard
          label={t('admin.students.total_students')}
          value={students.length}
          icon={GraduationCap}
          hint={t('admin.students.active_nodes')}
          accent
        />

        <SectionCard
          title={t('admin.students.import_title')}
          description={t('admin.students.import_description')}
          className="lg:col-span-2"
        >
          <form onSubmit={handleUploadStudents} className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <label className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 px-4 py-6 text-center transition-colors hover:border-primary/40 hover:bg-muted/50">
                <FileSpreadsheet className="size-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {studentsFile ? (
                    <span className="break-all font-medium text-foreground">{studentsFile.name}</span>
                  ) : t('admin.students.click_to_upload')}
                </span>
                <input
                  id="studentsFileInput"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setStudentsFile(e.target.files[0])}
                  className="sr-only"
                />
              </label>
              <Button type="submit" size="lg" disabled={uploading || !studentsFile} className="sm:self-stretch">
                <Upload className="size-4" />
                {uploading ? t('common.loading') : t('admin.students.upload_button')}
              </Button>
            </div>

            <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3">
              <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                {t('admin.students.import_hint')}
              </p>
            </div>
          </form>
        </SectionCard>
      </div>

      {/* Students table */}
      <SectionCard
        title={t('admin.students.saved_students')}
        actions={
          hasActiveFilter ? (
            <StatusBadge variant="accent">{filteredStudents.length}</StatusBadge>
          ) : null
        }
        bodyClassName="space-y-4"
      >
        {/* Filter toolbar */}
        <Toolbar>
          <SearchInput
            placeholder={t('admin.students.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={selectedDept}
              onValueChange={(v) => { setSelectedDept(v); setIsFilterActive(true); }}
            >
              <SelectTrigger className="h-8 w-full sm:w-44" aria-label={isAr ? 'القسم الدراسي' : 'Department'}>
                <SelectValue placeholder={isAr ? 'كل الأقسام' : 'All Departments'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isAr ? 'كل الأقسام' : 'All Departments'}</SelectItem>
                {departments.map(d => (
                  <SelectItem key={d.id} value={d.id.toString()}>{isAr ? d.name_ar : d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedLevel}
              onValueChange={(v) => { setSelectedLevel(v); setIsFilterActive(true); }}
            >
              <SelectTrigger className="h-8 w-full sm:w-36" aria-label={isAr ? 'المستوى' : 'Level'}>
                <SelectValue placeholder={isAr ? 'كل المستويات' : 'All Levels'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isAr ? 'كل المستويات' : 'All Levels'}</SelectItem>
                {uniqueLevels.map(lvl => (
                  <SelectItem key={lvl} value={lvl.toString()}>{isAr ? `المستوى ${lvl}` : `Level ${lvl}`}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedSection}
              onValueChange={(v) => { setSelectedSection(v); setIsFilterActive(true); }}
            >
              <SelectTrigger className="h-8 w-full sm:w-36" aria-label={isAr ? 'الشعبة' : 'Section'}>
                <SelectValue placeholder={isAr ? 'كل الشعب' : 'All Sections'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isAr ? 'كل الشعب' : 'All Sections'}</SelectItem>
                {uniqueSections.map(sec => (
                  <SelectItem key={sec} value={sec.toString()}>{isAr ? `شعبة ${sec}` : `Section ${sec}`}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilter && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X className="size-4" />
                {isAr ? 'إعادة تعيين' : 'Reset'}
              </Button>
            )}
          </div>
        </Toolbar>

        {!hasActiveFilter ? (
          <EmptyState
            icon={Users}
            title={isAr ? 'حدد فلتر لعرض الطلاب' : 'Select filters to display students'}
            description={isAr
              ? 'الرجاء اختيار قسم معين، شعبة، مستوى دراسي، أو البحث باسم الطالب لعرض النتائج وتجنب بطء التحميل.'
              : 'Please choose a department, section, level or type student name to load records. This optimizes portal speed.'}
            action={
              <Button variant="outline" size="sm" onClick={showAllStudents}>
                {isAr ? 'عرض جميع الطلاب' : 'Show All Students'}
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={tableColumns}
            rows={filteredStudents}
            getRowKey={(s) => s.id}
            empty={
              <EmptyState icon={Users} title={t('admin.students.no_students')} />
            }
          />
        )}
      </SectionCard>

      {/* Add Student Modal */}
      <Modal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        title={t('admin.students.add_modal_title')}
        description={t('admin.students.init_node')}
        size="lg"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" form="add-student-form" disabled={adding}>
              {adding ? t('common.loading') : t('admin.students.save_student')}
            </Button>
          </>
        }
      >
        <form id="add-student-form" onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label={t('admin.students.student_id')} htmlFor="add-student-id" required>
              <Input
                id="add-student-id"
                type="text"
                value={newStudent.id}
                onChange={(e) => setNewStudent({ ...newStudent, id: e.target.value })}
                placeholder="e.g. 2024001"
                required
              />
            </FormField>
            <FormField label={t('admin.students.full_name')} htmlFor="add-student-name" required>
              <Input
                id="add-student-name"
                type="text"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                placeholder={t('admin.students.full_name')}
                required
              />
            </FormField>
          </div>

          <FormField label={t('admin.students.password')} htmlFor="add-student-password" hint={t('admin.students.password_hint')}>
            <Input
              id="add-student-password"
              type="text"
              value={newStudent.password}
              onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
              placeholder="Leave empty for default"
            />
          </FormField>

          <div className="grid grid-cols-3 gap-4">
            <FormField label={t('admin.students.level')} htmlFor="add-student-level">
              <Input
                id="add-student-level"
                type="number"
                value={newStudent.level}
                onChange={(e) => setNewStudent({ ...newStudent, level: e.target.value })}
                min="1"
                max="4"
              />
            </FormField>
            <FormField label={t('admin.students.section')} htmlFor="add-student-section">
              <Input
                id="add-student-section"
                type="text"
                value={newStudent.section}
                onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })}
                placeholder="e.g. 1"
              />
            </FormField>
            <FormField label={isAr ? 'سنة الالتحاق' : 'Academic Year'} htmlFor="add-student-batch">
              <Input
                id="add-student-batch"
                type="number"
                value={newStudent.batch}
                onChange={(e) => setNewStudent({ ...newStudent, batch: e.target.value })}
                placeholder="e.g. 2025"
              />
            </FormField>
          </div>

          <FormField label={t('admin.students.select_dept')}>
            <Select
              value={newStudent.department_id ? newStudent.department_id.toString() : ''}
              onValueChange={(v) => setNewStudent({ ...newStudent, department_id: v })}
            >
              <SelectTrigger className="h-8 w-full">
                <SelectValue placeholder={t('admin.students.no_dept')} />
              </SelectTrigger>
              <SelectContent>
                {departments.map(d => (
                  <SelectItem key={d.id} value={d.id.toString()}>{d.name} ({d.code})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        title={t('admin.students.edit_details')}
        description={selectedStudent?.id}
        size="lg"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setShowEditModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" form="edit-student-form" disabled={updating}>
              {updating ? t('common.loading') : t('admin.students.save_student')}
            </Button>
          </>
        }
      >
        <form id="edit-student-form" onSubmit={handleEditSubmit} className="space-y-4">
          <FormField label={t('admin.students.full_name')} htmlFor="edit-student-name" required>
            <Input
              id="edit-student-name"
              type="text"
              value={editStudent.name}
              onChange={(e) => setEditStudent({ ...editStudent, name: e.target.value })}
              placeholder={t('admin.students.full_name')}
              required
            />
          </FormField>

          <div className="grid grid-cols-3 gap-4">
            <FormField label={t('admin.students.level')} htmlFor="edit-student-level">
              <Input
                id="edit-student-level"
                type="number"
                value={editStudent.level}
                onChange={(e) => setEditStudent({ ...editStudent, level: e.target.value })}
                min="1"
                max="4"
              />
            </FormField>
            <FormField label={t('admin.students.section')} htmlFor="edit-student-section">
              <Input
                id="edit-student-section"
                type="text"
                value={editStudent.section}
                onChange={(e) => setEditStudent({ ...editStudent, section: e.target.value })}
                placeholder="e.g. 1"
              />
            </FormField>
            <FormField label={isAr ? 'سنة الالتحاق' : 'Academic Year'} htmlFor="edit-student-batch">
              <Input
                id="edit-student-batch"
                type="number"
                value={editStudent.batch}
                onChange={(e) => setEditStudent({ ...editStudent, batch: e.target.value })}
                placeholder="e.g. 2025"
              />
            </FormField>
          </div>

          <FormField label={t('admin.students.select_dept')}>
            <Select
              value={editStudent.department_id ? editStudent.department_id.toString() : ''}
              onValueChange={(v) => setEditStudent({ ...editStudent, department_id: v })}
            >
              <SelectTrigger className="h-8 w-full">
                <SelectValue placeholder={t('admin.students.no_dept')} />
              </SelectTrigger>
              <SelectContent>
                {departments.map(d => (
                  <SelectItem key={d.id} value={d.id.toString()}>{d.name} ({d.code})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </form>
      </Modal>

      {/* Manage Role Modal */}
      <Modal
        open={showRoleModal}
        onOpenChange={setShowRoleModal}
        title={t('admin.students.change_role')}
        description={selectedStudent ? `${selectedStudent.name} (${selectedStudent.id})` : undefined}
        size="lg"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setShowRoleModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" form="role-student-form" disabled={updating}>
              {updating ? t('common.loading') : t('admin.students.save_student')}
            </Button>
          </>
        }
      >
        <form id="role-student-form" onSubmit={handleRoleSubmit} className="space-y-4">
          <FormField label={t('admin.students.change_role')}>
            <Select
              value={editRole.role}
              onValueChange={(v) => setEditRole({ ...editRole, role: v })}
            >
              <SelectTrigger className="h-8 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student (طالب)</SelectItem>
                <SelectItem value="assistant">Assistant (معيد / مساعد محاضر)</SelectItem>
                <SelectItem value="admin">Admin (مسؤول إدارة النظام)</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          {/* Permissions toggles for assistant role */}
          {editRole.role === 'assistant' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <p className="text-sm font-medium text-foreground">
                {isAr ? 'التبويبات المتاحة للوصول' : 'Accessible Tabs / Permissions'}
              </p>
              <div className="grid max-h-[260px] grid-cols-1 gap-1.5 overflow-y-auto rounded-lg border bg-muted/30 p-2 md:grid-cols-2">
                {AVAILABLE_PERMISSIONS.map((perm) => {
                  const isChecked = (editRole.permissions || []).includes(perm.key);
                  return (
                    <label
                      key={perm.key}
                      className="flex cursor-pointer items-center justify-between gap-3 rounded-md border bg-card px-3 py-2 transition-colors hover:bg-muted/50"
                    >
                      <span className="text-xs text-foreground">
                        {isAr ? perm.label_ar : perm.label_en}
                      </span>
                      <Switch
                        checked={isChecked}
                        onCheckedChange={() => handlePermissionToggle(perm.key)}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Admin complete access info */}
          {editRole.role === 'admin' && (
            <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm text-primary animate-in fade-in duration-200">
              <Shield className="mt-0.5 size-4 shrink-0" />
              <span>
                {isAr
                  ? 'يمتلك مسؤول إدارة النظام (Admin) صلاحيات وصول كاملة ومطلقة لجميع تبويبات وأدوات النظام بشكل تلقائي.'
                  : 'Administrators (Admins) automatically have full, unrestricted access to all tabs and system tools.'}
              </span>
            </div>
          )}
        </form>
      </Modal>
    </PageContainer>
  );
};

export default StudentsManager;
