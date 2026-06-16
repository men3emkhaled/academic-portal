import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  GraduationCap, BookOpen, Plus,
  Trash2, Edit3, Award,
  CheckCircle, Hash, Users, UserCircle, AlertCircle, Clock
} from 'lucide-react';
import {
  PageHeader,
  SectionCard,
  StatCard,
  DataTable,
  StatusBadge,
  EmptyState,
  SearchInput,
  Toolbar,
  FormField,
  Modal,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

const StudentCoursesGradesManager = ({ students, refreshStudents }) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentCourses, setStudentCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [studentGrades, setStudentGrades] = useState([]);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [selectedCourseToAdd, setSelectedCourseToAdd] = useState('');
  const [editingGrade, setEditingGrade] = useState(null);
  const [editGradeForm, setEditGradeForm] = useState({ examType: 'midterm', score: '', status: 'completed' });
  const [showGradeModal, setShowGradeModal] = useState(false);

  const handleSelectStudent = async (id) => {
    if (!id) { setSelectedStudent(null); setStudentCourses([]); setStudentGrades([]); return; }
    const student = (students || []).find(s => String(s.id) === String(id));
    setSelectedStudent(student || null);
    try {
      const [coursesRes, gradesRes, availRes] = await Promise.all([
        api.get(`/admin/students/${id}/courses`),
        api.get(`/admin/students/${id}/grades`),
        api.get('/courses'),
      ]);
      setStudentCourses(coursesRes.data || []);
      setStudentGrades(gradesRes.data?.grades || []);
      setAvailableCourses(availRes.data || []);
    } catch { toast.error(t('admin.records.load_data_failed')); }
  };

  const handleRemoveCourseFromStudent = async (courseId, courseName) => {
    if (!window.confirm(t('admin.records.remove_course_confirm', { name: courseName }))) return;
    try {
      await api.delete(`/admin/students/${selectedStudent.id}/courses/${courseId}`);
      toast.success(t('admin.records.course_removed'));
      handleSelectStudent(selectedStudent.id);
    } catch { toast.error(t('admin.records.remove_course_failed')); }
  };

  const handleAddCourseToStudent = async () => {
    if (!selectedCourseToAdd) { toast.error(t('admin.records.select_course_error')); return; }
    try {
      await api.post(`/admin/students/${selectedStudent.id}/courses`, { course_id: selectedCourseToAdd });
      toast.success(t('admin.records.course_added'));
      setShowAddCourseModal(false);
      setSelectedCourseToAdd('');
      handleSelectStudent(selectedStudent.id);
    } catch { toast.error(t('admin.records.add_course_failed')); }
  };

  const handleEditStudentGrade = (grade) => {
    setEditingGrade(grade);
    setEditGradeForm({ examType: 'midterm', score: '', status: 'completed' });
    setShowGradeModal(true);
  };

  const handleUpdateStudentGrade = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/students/${selectedStudent.id}/grades/${editingGrade.course_id}`, editGradeForm);
      toast.success(t('admin.records.grade_updated'));
      setShowGradeModal(false);
      handleSelectStudent(selectedStudent.id);
    } catch { toast.error(t('admin.records.update_grade_failed')); }
  };

  const filteredStudents = (students || []).filter(s =>
    (s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id?.toString().includes(searchTerm))
  );

  const courseColumns = [
    {
      key: 'course_name',
      header: t('admin.records.course_name_col'),
      render: (sc) => (
        <div className="flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
            <CheckCircle className="size-4" />
          </span>
          <span className="font-medium text-foreground">{sc.course_name}</span>
        </div>
      ),
    },
    {
      key: 'semester',
      header: t('admin.records.semester_col'),
      render: (sc) => (
        <StatusBadge variant="neutral">
          {t('admin.records.semester_label', { count: sc.semester })}
        </StatusBadge>
      ),
    },
    {
      key: 'actions',
      header: t('admin.records.actions_col'),
      headClassName: 'text-end',
      cellClassName: 'text-end',
      render: (sc) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleRemoveCourseFromStudent(sc.course_id, sc.course_name)}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          aria-label={t('admin.records.actions_col')}
          title={t('admin.records.actions_col')}
        >
          <Trash2 className="size-4" />
        </Button>
      ),
    },
  ];

  const scoreCell = (value) => (
    <span className={value ? 'font-medium text-foreground' : 'text-muted-foreground'}>
      {value || '—'}
    </span>
  );

  const gradeColumns = [
    {
      key: 'course_name',
      header: t('admin.records.course_name_col'),
      render: (grade) => (
        <span className="block max-w-[180px] truncate font-medium text-foreground">{grade.course_name}</span>
      ),
    },
    {
      key: 'midterm_score',
      header: t('admin.records.midterm_col'),
      headClassName: 'text-center',
      cellClassName: 'text-center',
      render: (grade) => scoreCell(grade.midterm_score),
    },
    {
      key: 'practical_score',
      header: t('admin.records.practical_col'),
      headClassName: 'text-center',
      cellClassName: 'text-center',
      render: (grade) => scoreCell(grade.practical_score),
    },
    {
      key: 'oral_score',
      header: t('admin.records.oral_col'),
      headClassName: 'text-center',
      cellClassName: 'text-center',
      render: (grade) => scoreCell(grade.oral_score),
    },
    {
      key: 'actions',
      header: t('admin.records.actions_col'),
      headClassName: 'text-end',
      cellClassName: 'text-end',
      render: (grade) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleEditStudentGrade(grade)}
          className="text-muted-foreground hover:text-foreground"
          aria-label={t('admin.records.actions_col')}
          title={t('admin.records.actions_col')}
        >
          <Edit3 className="size-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 text-start animate-in fade-in duration-300">
      <PageHeader
        icon={GraduationCap}
        title={t('admin.records.title')}
        description={t('admin.records.description')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('admin.sidebar.tabs.students')}
          value={students?.length || 0}
          icon={Users}
          accent
        />
      </div>

      {/* Selection & Profile */}
      <SectionCard title={t('admin.records.search_label')}>
        <div className="space-y-4">
          <Toolbar>
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('admin.records.search_placeholder')}
            />
            <div className="w-full sm:w-72">
              <Select
                value={selectedStudent?.id ? String(selectedStudent.id) : ''}
                onValueChange={handleSelectStudent}
              >
                <SelectTrigger className="w-full" aria-label={t('admin.records.select_label')}>
                  <SelectValue placeholder={t('admin.records.students_found', { count: filteredStudents.length })} />
                </SelectTrigger>
                <SelectContent>
                  {filteredStudents.map(s => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name} ({s.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Toolbar>

          {selectedStudent ? (
            <div className="flex flex-col gap-4 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-center animate-in fade-in duration-300">
              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-card">
                {selectedStudent.avatar_url ? (
                  <img src={selectedStudent.avatar_url} alt={selectedStudent.name} className="size-full object-cover" />
                ) : (
                  <UserCircle className="size-8 text-muted-foreground" />
                )}
              </div>
              <div className="grid flex-1 grid-cols-2 gap-4 md:grid-cols-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{t('admin.records.name_label')}</p>
                  <p className="text-sm font-medium text-foreground">{selectedStudent.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{t('admin.records.level_label')}</p>
                  <StatusBadge variant="accent">{`LVL ${selectedStudent.level}`}</StatusBadge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{t('admin.records.section_label')}</p>
                  <p className="text-sm font-medium text-foreground">{selectedStudent.section || '—'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{t('admin.records.id_label')}</p>
                  <p className="flex items-center gap-1 text-sm font-medium text-foreground">
                    <Hash className="size-3.5 text-muted-foreground" /> {selectedStudent.id}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title={t('admin.records.no_student_selected')}
            />
          )}
        </div>
      </SectionCard>

      {selectedStudent && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 animate-in fade-in duration-300">
          {/* Course Enrollment */}
          <SectionCard
            title={t('admin.records.enrollment_title')}
            actions={
              <Button size="sm" onClick={() => setShowAddCourseModal(true)}>
                <Plus className="size-4" /> {t('admin.records.add_course_btn')}
              </Button>
            }
            bodyClassName="p-0"
          >
            <DataTable
              columns={courseColumns}
              rows={studentCourses}
              getRowKey={(sc) => sc.id}
              className="rounded-none border-0"
              empty={
                <EmptyState
                  icon={BookOpen}
                  title={t('admin.records.no_courses')}
                  className="border-0"
                />
              }
            />
          </SectionCard>

          {/* Grade Records */}
          <SectionCard title={t('admin.records.grades_title')} bodyClassName="p-0">
            <DataTable
              columns={gradeColumns}
              rows={studentGrades}
              getRowKey={(grade, idx) => grade.course_id ?? idx}
              className="rounded-none border-0"
              empty={
                <EmptyState
                  icon={Award}
                  title={t('admin.records.no_grades')}
                  className="border-0"
                />
              }
            />
          </SectionCard>
        </div>
      )}

      {/* Add Course Modal */}
      <Modal
        open={showAddCourseModal && !!selectedStudent}
        onOpenChange={(open) => { if (!open) { setShowAddCourseModal(false); setSelectedCourseToAdd(''); } }}
        title={t('admin.records.enroll_modal_title')}
        description={selectedStudent ? t('admin.records.enroll_modal_subtitle', { name: selectedStudent.name }) : undefined}
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => { setShowAddCourseModal(false); setSelectedCourseToAdd(''); }}
            >
              {t('admin.records.cancel_btn')}
            </Button>
            <Button onClick={handleAddCourseToStudent}>
              <Plus className="size-4" /> {t('admin.records.add_btn')}
            </Button>
          </>
        }
      >
        <FormField label={t('admin.records.choose_course_label')} htmlFor="add-course-select">
          <Select value={selectedCourseToAdd} onValueChange={setSelectedCourseToAdd}>
            <SelectTrigger id="add-course-select" className="w-full">
              <SelectValue placeholder={t('admin.records.choose_course_placeholder')} />
            </SelectTrigger>
            <SelectContent>
              {availableCourses.map(c => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name} (Term {c.semester})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </Modal>

      {/* Edit Grade Modal */}
      <Modal
        open={showGradeModal && !!editingGrade && !!selectedStudent}
        onOpenChange={(open) => { if (!open) setShowGradeModal(false); }}
        title={t('admin.records.edit_grade_title')}
        description={editingGrade ? t('admin.records.edit_grade_subtitle', { name: editingGrade.course_name }) : undefined}
        size="lg"
      >
        <form id="edit-grade-form" onSubmit={handleUpdateStudentGrade} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label={t('admin.records.exam_type_label')} htmlFor="grade-exam-type">
              <Select
                value={editGradeForm.examType}
                onValueChange={(value) => setEditGradeForm({ ...editGradeForm, examType: value })}
              >
                <SelectTrigger id="grade-exam-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="midterm">{t('admin.records.exam_types.midterm')}</SelectItem>
                  <SelectItem value="practical">{t('admin.records.exam_types.practical')}</SelectItem>
                  <SelectItem value="oral">{t('admin.records.exam_types.oral')}</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label={t('admin.records.score_label')} htmlFor="grade-score">
              <Input
                id="grade-score"
                type="number"
                step="0.5"
                placeholder="0.0"
                value={editGradeForm.score}
                onChange={(e) => setEditGradeForm({ ...editGradeForm, score: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label={t('admin.records.status_label')}>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              {['completed', 'pending', 'not_held'].map(status => {
                const isActive = editGradeForm.status === status;
                const StatusIcon = status === 'completed' ? CheckCircle : status === 'pending' ? Clock : AlertCircle;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setEditGradeForm({ ...editGradeForm, status })}
                    aria-pressed={isActive}
                    className={[
                      'flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'border-primary/30 bg-primary/10 text-primary'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                    ].join(' ')}
                  >
                    <StatusIcon className="size-4" />
                    {t(`admin.records.statuses.${status}`)}
                  </button>
                );
              })}
            </div>
          </FormField>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowGradeModal(false)}>
              {t('admin.records.cancel_btn')}
            </Button>
            <Button type="submit">{t('admin.records.save_btn')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentCoursesGradesManager;
