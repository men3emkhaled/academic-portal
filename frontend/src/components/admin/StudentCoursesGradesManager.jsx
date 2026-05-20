import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
  GraduationCap, User, BookOpen, Plus, 
  Trash2, Edit3, Award, Activity, 
  CheckCircle, Hash, ChevronRight,
  Shield, Users, Search, UserCircle, X, Save, AlertCircle, Clock
} from 'lucide-react';

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
    (s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id?.toString().includes(searchTerm))
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-10 text-start">
      {/* Header Bento Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex items-center gap-8 bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 p-10 rounded-[3rem] shadow-sm relative overflow-hidden group text-start">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#8b5cf6]/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
          <div className="w-20 h-20 bg-[#8b5cf6]/10 dark:bg-[#8b5cf6]/20 rounded-[1.75rem] flex items-center justify-center border border-[#8b5cf6]/20 shadow-inner group-hover:scale-110 transition-transform duration-500 relative z-10">
            <GraduationCap className="w-10 h-10 text-[#8b5cf6]" />
          </div>
          <div className="relative z-10">
            <h2 className={`text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none ${i18n.language === 'ar' ? 'font-arabic' : ''}`}>
              {t('admin.records.title')}
            </h2>
            <p className="text-gray-400 dark:text-slate-400 text-[11px] font-black mt-3 uppercase tracking-widest italic opacity-60">{t('admin.records.description')}</p>
          </div>
        </div>
        
        <div className="bg-[#8b5cf6] text-white p-10 rounded-[3rem] shadow-2xl shadow-purple-500/20 flex flex-col justify-between relative overflow-hidden group text-start">
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-12 h-12 rounded-[1.25rem] bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-black/10 px-4 py-1.5 rounded-full backdrop-blur-md">Node Population</span>
          </div>
          <div className="mt-8 relative z-10">
            <p className="text-5xl font-black tracking-tighter leading-none">{students?.length || 0}</p>
            <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-60 mt-3">Registered Entities</p>
          </div>
        </div>
      </div>

      {/* Selection & Profile Section */}
      <div className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[3.5rem] p-10 lg:p-12 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-12">
                  <div className="w-full lg:w-[450px] space-y-8 text-start">
                      <div className="space-y-4">
                          <label className="text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest ml-4 italic">{t('admin.records.search_label')}</label>
                          <div className="relative group/input">
                              <Search className="absolute inset-inline-start-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover/input:text-[#8b5cf6] transition-colors" />
                              <input 
                                  type="text"
                                  placeholder={t('admin.records.search_placeholder')}
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  className="w-full bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-white/10 rounded-2xl px-14 py-5 font-black text-[13px] focus:ring-4 focus:ring-[#8b5cf6]/10 outline-none transition-all shadow-inner"
                              />
                          </div>
                      </div>
                      <div className="space-y-4">
                          <label className="text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest ml-4 italic">{t('admin.records.select_label')}</label>
                          <div className="relative">
                              <Users className="absolute inset-inline-start-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8b5cf6]" />
                              <select
                                  value={selectedStudent?.id || ''}
                                  onChange={(e) => handleSelectStudent(e.target.value)}
                                  className="w-full bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-white/10 rounded-2xl px-14 py-5 font-black text-[13px] text-gray-900 dark:text-white focus:ring-4 focus:ring-[#8b5cf6]/10 outline-none transition-all appearance-none shadow-inner uppercase tracking-widest"
                              >
                                  <option value="" className="bg-white dark:bg-[#0d0d14] dark:text-white">{t('admin.records.students_found', { count: filteredStudents.length })}</option>
                                  {filteredStudents.map(s => (
                                      <option key={s.id} value={s.id} className="bg-white dark:bg-[#0d0d14] dark:text-white">{s.name} ({s.id})</option>
                                  ))}
                              </select>
                              <ChevronRight className={`absolute inset-inline-end-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#8b5cf6] rotate-90 ${i18n.language === 'ar' ? 'rotate-[-90deg]' : ''}`} />
                          </div>
                      </div>
                  </div>

                  <div className="hidden lg:block w-px h-32 bg-gray-100 dark:bg-white/5"></div>

                  {selectedStudent ? (
                      <div className="flex-1 flex flex-col sm:flex-row items-center gap-10 bg-[#8b5cf6]/5 border border-[#8b5cf6]/10 rounded-[3rem] p-8 animate-in fade-in zoom-in duration-700 shadow-sm relative overflow-hidden group/card text-start">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-[#8b5cf6]/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover/card:scale-150 transition-transform duration-1000"></div>
                          <div className="w-28 h-28 rounded-3xl bg-white dark:bg-black border border-gray-100 dark:border-white/10 flex items-center justify-center shadow-lg shrink-0 overflow-hidden group-hover/card:scale-105 transition-transform duration-500 relative z-10">
                              {selectedStudent.avatar_url ? (
                                  <img src={selectedStudent.avatar_url} alt={selectedStudent.name} className="w-full h-full object-cover" />
                              ) : (
                                  <UserCircle className="w-16 h-16 text-[#8b5cf6]/30" />
                              )}
                          </div>
                          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8 w-full relative z-10">
                              <div className="space-y-2">
                                  <p className="text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest italic">{t('admin.records.name_label')}</p>
                                  <p className="text-gray-900 dark:text-white font-black tracking-tighter text-xl leading-tight uppercase group-hover/card:text-[#8b5cf6] transition-colors">{selectedStudent.name}</p>
                              </div>
                              <div className="space-y-2">
                                  <p className="text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest italic">{t('admin.records.level_label')}</p>
                                  <span className="inline-flex items-center px-4 py-2 rounded-xl bg-[#8b5cf6] text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-purple-500/20">
                                      LVL {selectedStudent.level}
                                  </span>
                              </div>
                              <div className="space-y-2">
                                  <p className="text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest italic">{t('admin.records.section_label')}</p>
                                  <p className="text-gray-900 dark:text-white font-black tracking-tighter text-xl uppercase">{selectedStudent.section || '—'}</p>
                              </div>
                              <div className="space-y-2">
                                  <p className="text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest italic">{t('admin.records.id_label')}</p>
                                  <p className="text-[#8b5cf6] font-black tracking-widest text-sm flex items-center gap-2">
                                      <Hash className="w-4 h-4" /> {selectedStudent.id}
                                  </p>
                              </div>
                          </div>
                      </div>
                  ) : (
                      <div className="flex-1 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[3rem] flex flex-col items-center justify-center py-12 opacity-30 grayscale group-hover:opacity-50 transition-all duration-700">
                          <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-5 shadow-inner">
                              <Users className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] italic">{t('admin.records.no_student_selected')}</p>
                      </div>
                  )}
              </div>
          </div>
      </div>

      {selectedStudent && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 animate-in slide-in-from-bottom-8 duration-1000">
          {/* Course Enrollment */}
          <div className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[3.5rem] overflow-hidden shadow-sm relative group text-start">
              <div className="p-10 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#8b5cf6]/10 rounded-2xl flex items-center justify-center border border-[#8b5cf6]/20 shadow-inner">
                          <BookOpen className="w-6 h-6 text-[#8b5cf6]" />
                      </div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">{t('admin.records.enrollment_title')}</h3>
                  </div>
                  <button 
                      onClick={() => setShowAddCourseModal(true)} 
                      className="px-6 py-4 bg-[#8b5cf6] hover:bg-black dark:hover:bg-white dark:hover:text-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-purple-500/20 flex items-center gap-3 group/btn"
                  >
                      <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" /> {t('admin.records.add_course_btn')}
                  </button>
              </div>

              <div className="overflow-x-auto relative z-10 custom-scrollbar">
                  <table className="w-full text-start border-collapse">
                      <thead>
                          <tr className="bg-gray-50/50 dark:bg-white/[0.01]">
                              <th className="py-6 px-10 text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest text-start">{t('admin.records.course_name_col')}</th>
                              <th className="py-6 px-6 text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest text-start">{t('admin.records.semester_col')}</th>
                              <th className="py-6 px-10 text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest text-end">{t('admin.records.actions_col')}</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                          {studentCourses.length === 0 ? (
                              <tr>
                                  <td colSpan="3" className="text-center py-32 opacity-20 italic">
                                      <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                                          <BookOpen className="w-10 h-10 text-gray-400" />
                                      </div>
                                      <p className="text-[11px] font-black uppercase tracking-[0.4em]">{t('admin.records.no_courses')}</p>
                                  </td> 
                              </tr>
                          ) : (
                              studentCourses.map((sc) => (
                                  <tr key={sc.id} className="group/item hover:bg-[#8b5cf6]/5 transition-all duration-500">
                                      <td className="py-8 px-10">
                                          <div className="flex items-center gap-5">
                                              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-black border border-gray-100 dark:border-white/10 flex items-center justify-center text-[#8b5cf6] shadow-inner group-hover/item:bg-[#8b5cf6] group-hover/item:text-white transition-all duration-500">
                                                  <CheckCircle className="w-5 h-5" />
                                              </div>
                                              <p className="text-gray-900 dark:text-white font-black tracking-tighter text-lg group-hover/item:text-[#8b5cf6] transition-colors uppercase">{sc.course_name}</p>
                                          </div>
                                      </td>
                                      <td className="py-8 px-6">
                                          <span className="text-[10px] font-black text-gray-500 dark:text-slate-300 uppercase tracking-widest bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/10 px-4 py-2 rounded-xl shadow-inner">
                                              {t('admin.records.semester_label', { count: sc.semester })}
                                          </span>
                                      </td>
                                      <td className="py-8 px-10 text-end">
                                          <button 
                                              onClick={() => handleRemoveCourseFromStudent(sc.course_id, sc.course_name)} 
                                              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm opacity-0 group-hover/item:opacity-100 scale-90 group-hover/item:scale-100"
                                              title="Remove Course"
                                          >
                                              <Trash2 className="w-5 h-5" />
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
          <div className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[3.5rem] overflow-hidden shadow-sm relative group text-start">
              <div className="p-10 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-inner">
                          <Award className="w-6 h-6 text-amber-500" />
                      </div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">{t('admin.records.grades_title')}</h3>
                  </div>
              </div>

              <div className="overflow-x-auto relative z-10 custom-scrollbar">
                  <table className="w-full text-start border-collapse">
                      <thead>
                          <tr className="bg-gray-50/50 dark:bg-white/[0.01]">
                              <th className="py-6 px-10 text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest text-start">{t('admin.records.course_name_col')}</th>
                              <th className="py-6 px-4 text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest text-center">{t('admin.records.midterm_col')}</th>
                              <th className="py-6 px-4 text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest text-center">{t('admin.records.practical_col')}</th>
                              <th className="py-6 px-4 text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest text-center">{t('admin.records.oral_col')}</th>
                              <th className="py-6 px-10 text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest text-end">{t('admin.records.actions_col')}</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                          {studentGrades.length === 0 ? (
                              <tr>
                                  <td colSpan="5" className="text-center py-32 opacity-20 italic">
                                      <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                                          <Award className="w-10 h-10 text-gray-400" />
                                      </div>
                                      <p className="text-[11px] font-black uppercase tracking-[0.4em]">{t('admin.records.no_grades')}</p>
                                  </td> 
                              </tr>
                          ) : (
                              studentGrades.map((grade, idx) => (
                                  <tr key={idx} className="group/grade hover:bg-amber-500/5 transition-all duration-500">
                                      <td className="py-8 px-10">
                                          <p className="text-gray-900 dark:text-white font-black tracking-tighter text-sm leading-tight max-w-[150px] truncate group-hover/grade:text-amber-500 transition-colors uppercase italic">{grade.course_name}</p>
                                      </td>
                                      <td className="py-8 px-4 text-center">
                                          <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-sm font-black border transition-all duration-500 ${
                                              grade.midterm_score ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 shadow-inner group-hover/grade:scale-110 group-hover/grade:rotate-6' : 'bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-300'
                                          }`}>
                                              {grade.midterm_score || '—'}
                                          </div>
                                      </td>
                                      <td className="py-8 px-4 text-center">
                                          <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-sm font-black border transition-all duration-500 ${
                                              grade.practical_score ? 'bg-[#8b5cf6]/10 border-[#8b5cf6]/30 text-[#8b5cf6] shadow-inner group-hover/grade:scale-110 group-hover/grade:-rotate-6' : 'bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-300'
                                          }`}>
                                              {grade.practical_score || '—'}
                                          </div>
                                      </td>
                                      <td className="py-8 px-4 text-center">
                                          <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-sm font-black border transition-all duration-500 ${
                                              grade.oral_score ? 'bg-purple-500/10 border-purple-500/30 text-purple-600 shadow-inner group-hover/grade:scale-110 group-hover/grade:rotate-6' : 'bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-300'
                                          }`}>
                                              {grade.oral_score || '—'}
                                          </div>
                                      </td>
                                      <td className="py-8 px-10 text-end">
                                          <button 
                                              onClick={() => handleEditStudentGrade(grade)} 
                                              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-400 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all shadow-sm opacity-0 group-hover/grade:opacity-100 scale-90 group-hover/grade:scale-100"
                                              title="Edit Grade"
                                          >
                                              <Edit3 className="w-5 h-5" />
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300" onClick={() => setShowAddCourseModal(false)}>
          <div className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/10 rounded-[3.5rem] p-10 lg:p-12 w-full max-w-xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500 text-start" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#8b5cf6]/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-6 mb-10 pb-8 border-b border-gray-100 dark:border-white/5">
                    <div className="w-16 h-16 bg-[#8b5cf6]/10 rounded-[1.5rem] flex items-center justify-center border border-[#8b5cf6]/20 text-[#8b5cf6] shadow-inner">
                        <BookOpen className="w-9 h-9" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">{t('admin.records.enroll_modal_title')}</h3>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-3 italic opacity-60">{t('admin.records.enroll_modal_subtitle', { name: selectedStudent.name })}</p>
                    </div>
                    <button onClick={() => setShowAddCourseModal(false)} className="ms-auto w-12 h-12 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:bg-rose-500 hover:text-white transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-10">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 italic">{t('admin.records.choose_course_label')}</label>
                        <div className="relative">
                            <select value={selectedCourseToAdd} onChange={(e) => setSelectedCourseToAdd(e.target.value)} className="w-full bg-gray-50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-[1.5rem] px-8 py-6 font-black focus:ring-4 focus:ring-[#8b5cf6]/10 outline-none transition-all appearance-none shadow-inner uppercase tracking-widest text-sm">
                                <option value="" className="bg-white dark:bg-[#0d0d14] dark:text-white">{t('admin.records.choose_course_placeholder')}</option>
                                {availableCourses.map(c => (
                                <option key={c.id} value={c.id} className="bg-white dark:bg-[#0d0d14] dark:text-white">{c.name} (Term {c.semester})</option>
                                ))}
                            </select>
                            <ChevronRight className={`absolute inset-inline-end-8 top-1/2 -translate-y-1/2 pointer-events-none text-[#8b5cf6] rotate-90 ${i18n.language === 'ar' ? 'rotate-[-90deg]' : ''}`} />
                        </div>
                    </div>
                    <div className="flex gap-4 pt-6 border-t border-gray-100 dark:border-white/5">
                        <button onClick={handleAddCourseToStudent} className="flex-1 bg-[#8b5cf6] text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-purple-500/30 transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-3">
                            <Plus className="w-5 h-5" /> {t('admin.records.add_btn')}
                        </button>
                        <button onClick={() => { setShowAddCourseModal(false); setSelectedCourseToAdd(''); }} className="px-10 bg-gray-50 dark:bg-white/5 text-gray-400 font-black py-6 rounded-[2rem] transition-all hover:bg-gray-100 dark:hover:bg-white/10 uppercase tracking-[0.2em] text-[11px]">{t('admin.records.cancel_btn')}</button>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Grade Modal */}
      {showGradeModal && editingGrade && selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300" onClick={() => setShowGradeModal(false)}>
          <div className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/10 rounded-[3.5rem] p-10 lg:p-12 w-full max-w-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500 text-start" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-6 mb-10 pb-8 border-b border-gray-100 dark:border-white/5">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-[1.5rem] flex items-center justify-center border border-amber-500/20 text-amber-500 shadow-inner">
                        <Award className="w-9 h-9" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">{t('admin.records.edit_grade_title')}</h3>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-3 italic opacity-60">{t('admin.records.edit_grade_subtitle', { name: editingGrade.course_name })}</p>
                    </div>
                    <button onClick={() => setShowGradeModal(false)} className="ms-auto w-12 h-12 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:bg-rose-500 hover:text-white transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleUpdateStudentGrade} className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 italic">{t('admin.records.exam_type_label')}</label>
                            <div className="relative">
                                <select value={editGradeForm.examType} onChange={(e) => setEditGradeForm({ ...editGradeForm, examType: e.target.value })} className="w-full bg-gray-50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-[1.5rem] px-8 py-6 font-black focus:ring-4 focus:ring-amber-500/10 outline-none transition-all appearance-none shadow-inner uppercase tracking-widest text-sm">
                                    <option value="midterm" className="bg-white dark:bg-[#0d0d14] dark:text-white">{t('admin.records.exam_types.midterm')}</option>
                                    <option value="practical" className="bg-white dark:bg-[#0d0d14] dark:text-white">{t('admin.records.exam_types.practical')}</option>
                                    <option value="oral" className="bg-white dark:bg-[#0d0d14] dark:text-white">{t('admin.records.exam_types.oral')}</option>
                                </select>
                                <ChevronRight className={`absolute inset-inline-end-8 top-1/2 -translate-y-1/2 pointer-events-none text-amber-500 rotate-90 ${i18n.language === 'ar' ? 'rotate-[-90deg]' : ''}`} />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 italic">{t('admin.records.score_label')}</label>
                            <div className="relative group/score">
                                <Award className="absolute inset-inline-start-6 top-1/2 -translate-y-1/2 w-6 h-6 text-amber-500 group-hover/score:scale-110 transition-transform" />
                                <input type="number" step="0.5" placeholder="0.0" value={editGradeForm.score} onChange={(e) => setEditGradeForm({ ...editGradeForm, score: e.target.value })} className="w-full bg-gray-50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-[1.5rem] px-16 py-6 font-black focus:ring-4 focus:ring-amber-500/10 outline-none transition-all shadow-inner text-xl" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 italic">{t('admin.records.status_label')}</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {['completed', 'pending', 'not_held'].map(status => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setEditGradeForm({ ...editGradeForm, status })}
                                    className={`py-6 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest border transition-all duration-500 flex flex-col items-center gap-3 ${
                                        editGradeForm.status === status 
                                            ? 'bg-[#8b5cf6]/10 border-[#8b5cf6]/50 text-[#8b5cf6] shadow-xl scale-105' 
                                            : 'bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-400 hover:border-[#8b5cf6]/30'
                                    }`}
                                >
                                    {status === 'completed' && <CheckCircle className="w-5 h-5" />}
                                    {status === 'pending' && <Clock className="w-5 h-5" />}
                                    {status === 'not_held' && <AlertCircle className="w-5 h-5" />}
                                    {t(`admin.records.statuses.${status}`)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-8 border-t border-gray-100 dark:border-white/5">
                        <button type="submit" className="flex-1 bg-amber-500 text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-amber-500/30 transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-4 group">
                            <Save className="w-6 h-6 group-hover:scale-110 transition-transform" /> {t('admin.records.save_btn')}
                        </button>
                        <button type="button" onClick={() => setShowGradeModal(false)} className="px-12 bg-gray-50 dark:bg-white/5 text-gray-400 font-black py-6 rounded-[2rem] transition-all hover:bg-gray-100 dark:hover:bg-white/10 uppercase tracking-[0.2em] text-[11px]">{t('admin.records.cancel_btn')}</button>
                    </div>
                </form>
            </div>
          </div>
        </div>
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

export default StudentCoursesGradesManager;
