import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
  GraduationCap, User, BookOpen, Plus, 
  Trash2, Edit3, Award, Activity, 
  CheckCircle, Hash, ChevronRight, LayoutDashboard,
  Shield, Map, Users, Search, UserCircle, ArrowRight
} from 'lucide-react';

const StudentCoursesGradesManager = ({ students, refreshStudents }) => {
  const { t } = useTranslation();
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
    } catch { toast.error('Failed to load student data'); }
  };

  const handleRemoveCourseFromStudent = async (courseId, courseName) => {
    if (!window.confirm(`Remove ${courseName}?`)) return;
    try {
      await api.delete(`/admin/students/${selectedStudent.id}/courses/${courseId}`);
      toast.success('Course removed');
      handleSelectStudent(selectedStudent.id);
    } catch { toast.error('Failed to remove course'); }
  };

  const handleAddCourseToStudent = async () => {
    if (!selectedCourseToAdd) { toast.error('Select a course'); return; }
    try {
      await api.post(`/admin/students/${selectedStudent.id}/courses`, { course_id: selectedCourseToAdd });
      toast.success('Course added');
      setShowAddCourseModal(false);
      setSelectedCourseToAdd('');
      handleSelectStudent(selectedStudent.id);
    } catch { toast.error('Failed to add course'); }
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
      toast.success('Grade updated');
      setShowGradeModal(false);
      handleSelectStudent(selectedStudent.id);
    } catch { toast.error('Failed to update grade'); }
  };

  const filteredStudents = (students || []).filter(s => 
    (s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id?.toString().includes(searchTerm))
  );

  return (
    <div className="animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-cyan-500/10 dark:bg-cyan-500/20 rounded-2xl flex items-center justify-center border border-cyan-500/20 shadow-inner">
            <GraduationCap className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {t('admin.records.title')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold mt-1 uppercase tracking-widest">{t('admin.records.description')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {/* Selection & Profile Card */}
        <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group transition-all duration-300">
            {/* Background Glow */}
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-[70px] pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-8">
                    <div className="w-full lg:w-[400px] space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-4">{t('admin.records.search_label')}</label>
                            <div className="relative">
                                <Search className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                                <input 
                                    type="text"
                                    placeholder={t('admin.records.search_placeholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-gray-50/50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl px-12 py-3.5 text-sm font-black focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all shadow-inner"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-4">{t('admin.records.select_label')}</label>
                            <div className="relative">
                                <Users className="absolute inset-inline-start-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                                <select
                                    value={selectedStudent?.id || ''}
                                    onChange={(e) => handleSelectStudent(e.target.value)}
                                    className="w-full bg-gray-50/50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl px-12 py-3.5 text-sm font-black focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all shadow-inner appearance-none uppercase tracking-widest"
                                >
                                    <option value="">{t('admin.records.students_found', { count: filteredStudents.length })}</option>
                                    {filteredStudents.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                                    ))}
                                </select>
                                <ChevronRight className="absolute inset-inline-end-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 rotate-90" />
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:block w-px h-24 bg-gray-100 dark:bg-white/10"></div>

                    {selectedStudent ? (
                        <div className="flex-1 flex flex-col sm:flex-row items-center gap-8 bg-cyan-500/5 dark:bg-cyan-500/10 border border-cyan-500/10 dark:border-cyan-500/20 rounded-[2.5rem] p-6 animate-in fade-in zoom-in duration-500 shadow-sm">
                            <div className="w-24 h-24 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-lg shrink-0 overflow-hidden group-hover:scale-105 transition-transform duration-500">
                                {selectedStudent.avatar_url ? (
                                    <img src={selectedStudent.avatar_url} alt={selectedStudent.name} className="w-full h-full object-cover" />
                                ) : (
                                    <UserCircle className="w-12 h-12 text-gray-300" />
                                )}
                            </div>
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Name</p>
                                    <p className="text-gray-900 dark:text-white font-black tracking-tight text-lg leading-tight uppercase">{selectedStudent.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('admin.records.level_label')}</p>
                                    <span className="inline-flex items-center px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 text-xs font-black uppercase tracking-tight border border-cyan-500/20">
                                        LEVEL {selectedStudent.level}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('admin.records.section_label')}</p>
                                    <p className="text-gray-900 dark:text-white font-black tracking-tight text-lg">{selectedStudent.section || '—'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('admin.records.id_label')}</p>
                                    <p className="text-gray-500 dark:text-gray-400 font-black tracking-widest text-sm flex items-center gap-1">
                                        <Hash className="w-3.5 h-3.5 text-cyan-500" /> {selectedStudent.id}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center py-10 opacity-40 grayscale group-hover:opacity-60 transition-opacity">
                            <Users className="w-10 h-10 mb-3 text-gray-400" />
                            <p className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">{t('admin.records.no_student_selected')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {selectedStudent && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-in slide-in-from-bottom-6 duration-700">
            {/* Course Enrollment */}
            <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-sm relative group">
                <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-cyan-500/5 rounded-full blur-[70px] pointer-events-none"></div>

                <div className="p-8 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.01] flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cyan-500/10 dark:bg-cyan-500/20 rounded-xl flex items-center justify-center border border-cyan-500/20">
                            <BookOpen className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('admin.records.enrollment_title')}</h3>
                    </div>
                    <button 
                        onClick={() => setShowAddCourseModal(true)} 
                        className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:shadow-xl shadow-cyan-500/20 flex items-center gap-2 hover:scale-[1.02] active:scale-95"
                    >
                        <Plus className="w-4 h-4" /> {t('admin.records.add_course_btn')}
                    </button>
                </div>

                <div className="overflow-x-auto relative z-10">
                    <table className="w-full text-inline-start border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-white/[0.01]">
                                <th className="py-5 px-8 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('admin.records.course_name_col')}</th>
                                <th className="py-5 px-6 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('admin.records.semester_col')}</th>
                                <th className="py-5 px-8 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-inline-end">{t('admin.records.actions_col')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {studentCourses.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="text-center py-24 opacity-30 grayscale group-hover:opacity-40 transition-opacity">
                                        <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                            <BookOpen className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">{t('admin.records.no_courses')}</p>
                                    </td> 
                                </tr>
                            ) : (
                                studentCourses.map((sc) => (
                                    <tr key={sc.id} className="group/item hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="py-6 px-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-white/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shadow-inner group-hover/item:bg-cyan-600 group-hover/item:text-white transition-all duration-300">
                                                    <CheckCircle className="w-4.5 h-4.5" />
                                                </div>
                                                <p className="text-gray-900 dark:text-white font-black tracking-tight text-base group-hover/item:text-cyan-600 dark:group-hover/item:text-cyan-400 transition-colors uppercase">{sc.course_name}</p>
                                            </div>
                                        </td>
                                        <td className="py-6 px-6">
                                            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-3 py-1.5 rounded-lg">{t('admin.records.semester_label', { count: sc.semester })}</span>
                                        </td>
                                        <td className="py-6 px-8 text-inline-end">
                                            <button 
                                                onClick={() => handleRemoveCourseFromStudent(sc.course_id, sc.course_name)} 
                                                className="w-11 h-11 flex items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-500 hover:bg-rose-600 dark:hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                title="Remove Course"
                                            >
                                                <Trash2 className="w-4.5 h-4.5" />
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
            <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-sm relative group">
                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-orange-500/5 rounded-full blur-[70px] pointer-events-none"></div>

                <div className="p-8 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.01] flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500/10 dark:bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500/20">
                            <Award className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('admin.records.grades_title')}</h3>
                    </div>
                </div>

                <div className="overflow-x-auto relative z-10">
                    <table className="w-full text-inline-start border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-white/[0.01]">
                                <th className="py-5 px-8 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('admin.records.course_name_col')}</th>
                                <th className="py-5 px-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">{t('admin.records.midterm_col')}</th>
                                <th className="py-5 px-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">{t('admin.records.practical_col')}</th>
                                <th className="py-5 px-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">{t('admin.records.oral_col')}</th>
                                <th className="py-5 px-8 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-inline-end">{t('admin.records.actions_col')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {studentGrades.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-24 opacity-30 grayscale group-hover:opacity-40 transition-opacity">
                                        <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                            <Award className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">{t('admin.records.no_grades')}</p>
                                    </td> 
                                </tr>
                            ) : (
                                studentGrades.map((grade, idx) => (
                                    <tr key={idx} className="group/grade hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="py-6 px-8">
                                            <p className="text-gray-900 dark:text-white font-black tracking-tight text-sm leading-tight max-w-[150px] truncate group-hover/grade:text-orange-600 dark:group-hover/grade:text-orange-400 transition-colors uppercase">{grade.course_name}</p>
                                        </td>
                                        <td className="py-6 px-4 text-center">
                                            <div className={`w-11 h-11 rounded-xl mx-auto flex items-center justify-center text-sm font-black border transition-all duration-300 ${
                                                grade.midterm_score ? 'bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400 shadow-inner shadow-orange-500/10 group-hover/grade:scale-110' : 'bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-300 dark:text-gray-700'
                                            }`}>
                                                {grade.midterm_score || '—'}
                                            </div>
                                        </td>
                                        <td className="py-6 px-4 text-center">
                                            <div className={`w-11 h-11 rounded-xl mx-auto flex items-center justify-center text-sm font-black border transition-all duration-300 ${
                                                grade.practical_score ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400 shadow-inner shadow-cyan-500/10 group-hover/grade:scale-110' : 'bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-300 dark:text-gray-700'
                                            }`}>
                                                {grade.practical_score || '—'}
                                            </div>
                                        </td>
                                        <td className="py-6 px-4 text-center">
                                            <div className={`w-11 h-11 rounded-xl mx-auto flex items-center justify-center text-sm font-black border transition-all duration-300 ${
                                                grade.oral_score ? 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400 shadow-inner shadow-purple-500/10 group-hover/grade:scale-110' : 'bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-300 dark:text-gray-700'
                                            }`}>
                                                {grade.oral_score || '—'}
                                            </div>
                                        </td>
                                        <td className="py-6 px-8 text-inline-end">
                                            <button 
                                                onClick={() => handleEditStudentGrade(grade)} 
                                                className="w-11 h-11 flex items-center justify-center rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-500 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all shadow-sm group-hover/grade:scale-[1.05]"
                                                title="Edit Grade"
                                            >
                                                <Edit3 className="w-4.5 h-4.5" />
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
      </div>

      {/* Add Course Modal */}
      {showAddCourseModal && selectedStudent && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setShowAddCourseModal(false)}>
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            {/* Modal Glow */}
            <div className="absolute top-0 inset-inline-end-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-5 mb-10 pb-6 border-b border-gray-100 dark:border-white/10">
                    <div className="w-14 h-14 bg-cyan-500/10 dark:bg-cyan-500/20 rounded-2xl flex items-center justify-center border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 shadow-inner">
                        <BookOpen className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">{t('admin.records.enroll_modal_title')}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">{t('admin.records.enroll_modal_subtitle', { name: selectedStudent.name })}</p>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('admin.records.choose_course_label')}</label>
                        <div className="relative">
                            <select value={selectedCourseToAdd} onChange={(e) => setSelectedCourseToAdd(e.target.value)} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-6 py-4.5 font-black focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all shadow-inner appearance-none uppercase tracking-widest text-[13px]">
                                <option value="">{t('admin.records.choose_course_placeholder')}</option>
                                {availableCourses.map(c => (
                                <option key={c.id} value={c.id}>{c.name} (Semester {c.semester})</option>
                                ))}
                            </select>
                            <ChevronRight className="absolute inset-inline-end-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 rotate-90" />
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-white/10">
                        <button onClick={handleAddCourseToStudent} className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-widest text-[11px]">{t('admin.records.add_btn')}</button>
                        <button onClick={() => { setShowAddCourseModal(false); setSelectedCourseToAdd(''); }} className="px-10 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-black py-5 rounded-2xl transition-all hover:bg-gray-200 dark:hover:bg-white/10 uppercase tracking-widest text-[11px]">{t('admin.records.cancel_btn')}</button>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Grade Modal */}
      {showGradeModal && editingGrade && selectedStudent && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setShowGradeModal(false)}>
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-10 w-full max-w-xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            {/* Modal Glow */}
            <div className="absolute top-0 inset-inline-end-0 w-64 h-64 bg-orange-500/10 blur-[80px] rounded-full pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-5 mb-10 pb-6 border-b border-gray-100 dark:border-white/10">
                    <div className="w-14 h-14 bg-orange-500/10 dark:bg-orange-500/20 rounded-2xl flex items-center justify-center border border-orange-500/20 text-orange-600 dark:text-orange-400 shadow-inner">
                        <Award className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">{t('admin.records.edit_grade_title')}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">{t('admin.records.edit_grade_subtitle', { name: editingGrade.course_name })}</p>
                    </div>
                </div>

                <form onSubmit={handleUpdateStudentGrade} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('admin.records.exam_type_label')}</label>
                            <div className="relative">
                                <select value={editGradeForm.examType} onChange={(e) => setEditGradeForm({ ...editGradeForm, examType: e.target.value })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-6 py-4.5 font-black focus:ring-4 focus:ring-orange-500/10 outline-none transition-all shadow-inner appearance-none uppercase tracking-widest text-[13px]">
                                    <option value="midterm">{t('admin.records.exam_types.midterm')}</option>
                                    <option value="practical">{t('admin.records.exam_types.practical')}</option>
                                    <option value="oral">{t('admin.records.exam_types.oral')}</option>
                                </select>
                                <ChevronRight className="absolute inset-inline-end-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 rotate-90" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('admin.records.score_label')}</label>
                            <input type="number" step="0.5" placeholder="0.0" value={editGradeForm.score} onChange={(e) => setEditGradeForm({ ...editGradeForm, score: e.target.value })} className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-6 py-4.5 font-black focus:ring-4 focus:ring-orange-500/10 outline-none transition-all shadow-inner text-[15px]" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">{t('admin.records.status_label')}</label>
                        <div className="grid grid-cols-3 gap-4">
                            {['completed', 'pending', 'not_held'].map(status => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setEditGradeForm({ ...editGradeForm, status })}
                                    className={`py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${
                                        editGradeForm.status === status 
                                            ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 shadow-inner' 
                                            : 'bg-gray-50/50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10'
                                    }`}
                                >
                                    {t(`admin.records.statuses.${status}`)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6 border-t border-gray-100 dark:border-white/10">
                        <button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-widest text-[11px]">{t('admin.records.save_btn')}</button>
                        <button type="button" onClick={() => setShowGradeModal(false)} className="px-10 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-black py-5 rounded-2xl transition-all hover:bg-gray-200 dark:hover:bg-white/10 uppercase tracking-widest text-[11px]">{t('admin.records.cancel_btn')}</button>
                    </div>
                </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCoursesGradesManager;
