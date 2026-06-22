import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { GraduationCap, User, BookOpen, Plus, Trash2, Edit3, Award, Users, Search, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const StudentCoursesGradesManager = ({ students, refreshStudents }) => {
  const { t, i18n } = useTranslation();
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
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id?.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6 pb-10 max-w-[1200px] mx-auto w-full px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.records.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('admin.records.description')}</p>
        </div>
      </div>

      {/* Select Student */}
      <div className="bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
          <div className="w-full lg:w-80 space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">{t('admin.records.search_label')}</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('admin.records.search_placeholder')}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">{t('admin.records.select_label')}</label>
              <select value={selectedStudent?.id || ''} onChange={(e) => handleSelectStudent(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none">
                <option value="">{t('admin.records.students_found', { count: filteredStudents.length })}</option>
                {filteredStudents.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                ))}
              </select>
            </div>
          </div>

          {selectedStudent ? (
            <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#059669]/5 border border-[#059669]/10 rounded-lg p-4">
              <div className="w-16 h-16 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                <User className="w-8 h-8 text-[#059669]/40" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                <div>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{t('admin.records.name_label')}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedStudent.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{t('admin.records.level_label')}</p>
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#059669] text-white">{t('admin.records.level_short', { level: selectedStudent.level })}</span>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{t('admin.records.section_label')}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedStudent.section || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{t('admin.records.id_label')}</p>
                  <p className="text-sm font-medium text-[#059669]">{selectedStudent.id}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center py-8 text-sm text-gray-400">
              {t('admin.records.no_student_selected')}
            </div>
          )}
        </div>
      </div>

      {selectedStudent && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Course Enrollment */}
          <div className="bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#059669]" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('admin.records.enrollment_title')}</h3>
              </div>
              <button onClick={() => setShowAddCourseModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-medium rounded-lg transition-colors">
                <Plus className="w-3.5 h-3.5" />{t('admin.records.add_course_btn')}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <th className="py-3 px-4 text-xs font-medium text-gray-500 text-start">{t('admin.records.course_name_col')}</th>
                    <th className="py-3 px-4 text-xs font-medium text-gray-500 text-start">{t('admin.records.semester_col')}</th>
                    <th className="py-3 px-4 text-xs font-medium text-gray-500 text-end">{t('admin.records.actions_col')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {studentCourses.length === 0 ? (
                    <tr><td colSpan="3" className="text-center py-12 text-sm text-gray-400">{t('admin.records.no_courses')}</td></tr>
                  ) : (
                    studentCourses.map((sc) => (
                      <tr key={sc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{sc.course_name}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                            {t('admin.records.semester_label', { count: sc.semester })}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-end">
                          <button onClick={() => handleRemoveCourseFromStudent(sc.course_id, sc.course_name)}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Grade Records */}
          <div className="bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('admin.records.grades_title')}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <th className="py-3 px-4 text-xs font-medium text-gray-500 text-start">{t('admin.records.course_name_col')}</th>
                    <th className="py-3 px-4 text-xs font-medium text-gray-500 text-center">{t('admin.records.midterm_col')}</th>
                    <th className="py-3 px-4 text-xs font-medium text-gray-500 text-center">{t('admin.records.practical_col')}</th>
                    <th className="py-3 px-4 text-xs font-medium text-gray-500 text-center">{t('admin.records.oral_col')}</th>
                    <th className="py-3 px-4 text-xs font-medium text-gray-500 text-end">{t('admin.records.actions_col')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {studentGrades.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-12 text-sm text-gray-400">{t('admin.records.no_grades')}</td></tr>
                  ) : (
                    studentGrades.map((grade, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <p className="text-sm text-gray-900 dark:text-white truncate max-w-[160px]">{grade.course_name}</p>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-sm font-medium ${grade.midterm_score ? 'text-amber-600' : 'text-gray-300'}`}>
                            {grade.midterm_score || '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-sm font-medium ${grade.practical_score ? 'text-[#059669]' : 'text-gray-300'}`}>
                            {grade.practical_score || '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-sm font-medium ${grade.oral_score ? 'text-[#059669]' : 'text-gray-300'}`}>
                            {grade.oral_score || '—'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-end">
                          <button onClick={() => handleEditStudentGrade(grade)}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {showAddCourseModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowAddCourseModal(false)} className="absolute inset-0 bg-black/40" />
          <div className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-gray-700 rounded-xl w-full max-w-md relative z-10 p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#059669]" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('admin.records.enroll_modal_title')}</h3>
              </div>
              <button onClick={() => setShowAddCourseModal(false)} className="w-7 h-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">{t('admin.records.choose_course_label')}</label>
                <select value={selectedCourseToAdd} onChange={(e) => setSelectedCourseToAdd(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none">
                  <option value="">{t('admin.records.choose_course_placeholder')}</option>
                  {availableCourses.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({t('admin.records.semester_label', { count: c.semester })})</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleAddCourseToStudent} className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" />{t('admin.records.add_btn')}
                </button>
                <button onClick={() => { setShowAddCourseModal(false); setSelectedCourseToAdd(''); }}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors">
                  {t('admin.records.cancel_btn')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Grade Modal */}
      {showGradeModal && editingGrade && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowGradeModal(false)} className="absolute inset-0 bg-black/40" />
          <div className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-gray-700 rounded-xl w-full max-w-md relative z-10 p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('admin.records.edit_grade_title')}</h3>
              </div>
              <button onClick={() => setShowGradeModal(false)} className="w-7 h-7 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <form onSubmit={handleUpdateStudentGrade} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">{t('admin.records.exam_type_label')}</label>
                  <select value={editGradeForm.examType} onChange={(e) => setEditGradeForm({ ...editGradeForm, examType: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none">
                    <option value="midterm">{t('admin.records.exam_types.midterm')}</option>
                    <option value="practical">{t('admin.records.exam_types.practical')}</option>
                    <option value="oral">{t('admin.records.exam_types.oral')}</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">{t('admin.records.score_label')}</label>
                  <input type="number" step="0.5" value={editGradeForm.score} onChange={(e) => setEditGradeForm({ ...editGradeForm, score: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">{t('admin.records.status_label')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {['completed', 'pending', 'not_held'].map(status => (
                    <button key={status} type="button" onClick={() => setEditGradeForm({ ...editGradeForm, status })}
                      className={`py-2 rounded-lg text-xs font-medium border transition-colors flex items-center justify-center gap-1.5 ${
                        editGradeForm.status === status
                          ? 'bg-[#059669]/10 border-[#059669]/50 text-[#059669]'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-[#059669]/30'
                      }`}>
                      {status === 'completed' && <CheckCircle className="w-3.5 h-3.5" />}
                      {status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                      {status === 'not_held' && <AlertCircle className="w-3.5 h-3.5" />}
                      {t(`admin.records.statuses.${status}`)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors">{t('admin.records.save_btn')}</button>
                <button type="button" onClick={() => setShowGradeModal(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors">{t('admin.records.cancel_btn')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCoursesGradesManager;
