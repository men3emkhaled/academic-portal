import React from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  GraduationCap, User, BookOpen, Plus, 
  Trash2, Edit3, Award, Activity, 
  CheckCircle, Hash, ChevronRight, LayoutDashboard,
  Shield, Map, Users
} from 'lucide-react';

const StudentCoursesGradesManager = ({
  students,
  selectedStudent,
  setSelectedStudent,
  studentCourses,
  availableCourses,
  studentGrades,
  showAddCourseModal,
  setShowAddCourseModal,
  selectedCourseToAdd,
  setSelectedCourseToAdd,
  editingGrade,
  setEditingGrade,
  editGradeForm,
  setEditGradeForm,
  showGradeModal,
  setShowGradeModal,
  handleSelectStudent,
  handleRemoveCourseFromStudent,
  handleAddCourseToStudent,
  handleEditStudentGrade,
  handleUpdateStudentGrade,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredStudents = (students || []).filter(s => 
    (s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.id?.toString().includes(searchTerm))
  );

  return (
    <div className="animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-2 h-10 bg-cyan-500 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              <GraduationCap className="w-7 h-7 text-cyan-500 dark:text-cyan-400" /> Academic Registry
            </h2>
            <p className="text-gray-500 dark:text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Individual Student Module Control</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {/* Selection & Profile Card */}
        <div className="admin-card relative overflow-hidden group transition-colors">
            
            <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-end gap-8">
                    <div className="w-full md:w-1/3 space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4">Search Node</label>
                            <div className="relative">
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                                <input 
                                    type="text"
                                    placeholder="ID or Name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="admin-input pl-12 h-[50px] text-sm"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4">Select Target Node</label>
                            <div className="relative">
                                <select
                                    value={selectedStudent?.id || ''}
                                    onChange={(e) => handleSelectStudent(e.target.value)}
                                    className="admin-input appearance-none pl-12 h-[50px] text-sm"
                                >
                                    <option value="">-- {filteredStudents.length} Students Found --</option>
                                    {filteredStudents.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                                    ))}
                                </select>
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                            </div>
                        </div>
                    </div>

                    {selectedStudent ? (
                        <div className="flex-1 w-full flex flex-col md:flex-row items-center gap-8 bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-3xl p-6 animate-fadeIn transition-colors">
                            <div className="w-20 h-20 rounded-[1.5rem] bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 overflow-hidden shrink-0">
                                {selectedStudent.avatar_url ? (
                                    <img src={selectedStudent.avatar_url} alt={selectedStudent.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-8 h-8" />
                                )}
                            </div>
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest">Full Name</p>
                                    <p className="text-gray-900 dark:text-white font-black tracking-tight">{selectedStudent.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest">Academic Lv</p>
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-black uppercase tracking-tighter border border-cyan-500/20">
                                        LEVEL_{selectedStudent.level}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest">Unit Section</p>
                                    <p className="text-gray-900 dark:text-white font-black tracking-tight">{selectedStudent.section || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest">Node ID</p>
                                    <p className="text-gray-400 dark:text-slate-400 font-bold tracking-widest text-xs flex items-center gap-1">
                                        <Hash className="w-3 h-3" /> {selectedStudent.id}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 w-full h-[88px] border border-gray-200 dark:border-white/5 border-dashed rounded-3xl flex items-center justify-center grayscale opacity-30">
                            <p className="text-xs font-black text-gray-500 dark:text-slate-500 uppercase tracking-[0.3em]">No node selected for inspection</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {selectedStudent && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fadeInUp">
            {/* Enrollment Ledger */}
            <div className="bg-white dark:bg-[#111111]/40 border border-gray-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm dark:shadow-2xl h-fit transition-colors">
                <div className="p-8 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.1em]">Enrollment Ledger</h3>
                    </div>
                    <button 
                        onClick={() => setShowAddCourseModal(true)} 
                        className="px-4 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400 hover:bg-cyan-600 dark:hover:bg-cyan-500 hover:text-white dark:hover:text-black transition-all flex items-center gap-2"
                    >
                        <Plus className="w-3 h-3" /> New Link
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-white/[0.01]">
                                <th className="py-5 px-8 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">Module Title</th>
                                <th className="py-5 px-6 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">Term</th>
                                <th className="py-5 px-8 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/[0.03]">
                            {studentCourses.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="text-center py-16 opacity-20 grayscale">
                                        <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">No active modules</p>
                                    </td> 
                                </tr>
                            ) : (
                                studentCourses.map((sc) => (
                                    <tr key={sc.id} className="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="py-5 px-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                                                    <BookOpen className="w-4 h-4" />
                                                </div>
                                                <p className="text-gray-900 dark:text-white font-black tracking-tight">{sc.course_name}</p>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6">
                                            <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-lg">Semester {sc.semester}</span>
                                        </td>
                                        <td className="py-5 px-8 text-right">
                                            <button 
                                                onClick={() => handleRemoveCourseFromStudent(sc.course_id, sc.course_name)} 
                                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-500 hover:bg-red-600 dark:hover:bg-red-500 hover:text-white transition-all transform hover:scale-105"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Assessment Matrix */}
            <div className="bg-white dark:bg-[#111111]/40 border border-gray-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm dark:shadow-2xl h-fit transition-colors">
                <div className="p-8 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.1em]">Assessment Matrix</h3>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-white/[0.01]">
                                <th className="py-5 px-8 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">Module</th>
                                <th className="py-5 px-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] text-center">MID</th>
                                <th className="py-5 px-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] text-center">PRC</th>
                                <th className="py-5 px-4 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] text-center">ORL</th>
                                <th className="py-5 px-8 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] text-right">Flow</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/[0.03]">
                            {studentGrades.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-16 opacity-20 grayscale">
                                        <Award className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">No evaluation found</p>
                                    </td> 
                                </tr>
                            ) : (
                                studentGrades.map((grade, idx) => (
                                    <tr key={idx} className="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="py-5 px-8">
                                            <p className="text-gray-900 dark:text-white font-black tracking-tight text-xs leading-tight max-w-[120px] truncate">{grade.course_name}</p>
                                        </td>
                                        <td className="py-5 px-4 text-center">
                                            <div className={`w-10 h-10 rounded-xl mx-auto flex items-center justify-center text-xs font-black border transition-all ${
                                                grade.midterm_score ? 'bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400' : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/5 text-gray-400 dark:text-slate-700'
                                            }`}>
                                                {grade.midterm_score || '--'}
                                            </div>
                                        </td>
                                        <td className="py-5 px-4 text-center">
                                            <div className={`w-10 h-10 rounded-xl mx-auto flex items-center justify-center text-xs font-black border transition-all ${
                                                grade.practical_score ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400' : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/5 text-gray-400 dark:text-slate-700'
                                            }`}>
                                                {grade.practical_score || '--'}
                                            </div>
                                        </td>
                                        <td className="py-5 px-4 text-center">
                                            <div className={`w-10 h-10 rounded-xl mx-auto flex items-center justify-center text-xs font-black border transition-all ${
                                                grade.oral_score ? 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400' : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/5 text-gray-400 dark:text-slate-700'
                                            }`}>
                                                {grade.oral_score || '--'}
                                            </div>
                                        </td>
                                        <td className="py-5 px-8 text-right">
                                            <button 
                                                onClick={() => handleEditStudentGrade(grade)} 
                                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-slate-400 hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all transform hover:scale-105"
                                            >
                                                <Edit3 className="w-4 h-4" />
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
        <div className="admin-modal-backdrop" onClick={() => setShowAddCourseModal(false)}>
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl relative overflow-hidden animate-fadeInUp transition-colors" onClick={(e) => e.stopPropagation()}>
            
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 bg-cyan-500/10 dark:bg-cyan-500/20 rounded-2xl flex items-center justify-center border border-cyan-500/20 dark:border-cyan-500/30 text-cyan-600 dark:text-cyan-400">
                        <BookOpen className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Deploy Module</h3>
                        <p className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase tracking-widest">Enrolling for {selectedStudent.name}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4">Target Course</label>
                        <select value={selectedCourseToAdd} onChange={(e) => setSelectedCourseToAdd(e.target.value)} className="admin-input appearance-none">
                            <option value="">-- Catalog Select --</option>
                            {availableCourses.map(c => (
                            <option key={c.id} value={c.id}>{c.name} (S{c.semester})</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button onClick={handleAddCourseToStudent} className="flex-1 admin-btn-primary h-[60px] font-black uppercase tracking-widest">INITIATE LINK</button>
                        <button onClick={() => { setShowAddCourseModal(false); setSelectedCourseToAdd(''); }} className="px-8 admin-btn-secondary h-[60px] font-bold uppercase">ABORT</button>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Grade Modal */}
      {showGradeModal && editingGrade && selectedStudent && (
        <div className="admin-modal-backdrop" onClick={() => setShowGradeModal(false)}>
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl relative overflow-hidden animate-fadeInUp transition-colors" onClick={(e) => e.stopPropagation()}>
            
            <div className="relative z-10">
                <div className="flex items-center gap-5 mb-10">
                    <div className="w-16 h-16 bg-orange-500/10 dark:bg-orange-500/20 rounded-2xl flex items-center justify-center border border-orange-500/20 dark:border-orange-500/30 text-orange-600 dark:text-orange-400">
                        <Award className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Assessment Update</h3>
                        <p className="text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-widest">Target: {editingGrade.course_name}</p>
                    </div>
                </div>

                <form onSubmit={handleUpdateStudentGrade} className="space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4">Evaluation Type</label>
                            <select value={editGradeForm.examType} onChange={(e) => setEditGradeForm({ ...editGradeForm, examType: e.target.value })} className="admin-input appearance-none">
                            <option value="midterm">MIDTERM_EXAM</option>
                            <option value="practical">PRACTICAL_EXAM</option>
                            <option value="oral">ORAL_EXAM</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4">Score Ingestion</label>
                            <input type="number" step="0.5" placeholder="00.0" value={editGradeForm.score} onChange={(e) => setEditGradeForm({ ...editGradeForm, score: e.target.value })} className="admin-input" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4">Execution Status</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['completed', 'pending', 'not_held'].map(status => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setEditGradeForm({ ...editGradeForm, status })}
                                    className={`py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                        editGradeForm.status === status 
                                            ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-600 dark:text-emerald-400' 
                                            : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/5 text-gray-500 dark:text-slate-500 hover:bg-gray-200 dark:hover:bg-white/10'
                                    }`}
                                >
                                    {status.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button type="submit" className="flex-1 admin-btn-primary h-[65px] font-black uppercase tracking-widest">APPLY OVERWRITE</button>
                        <button type="button" onClick={() => setShowGradeModal(false)} className="px-10 py-5 admin-btn-secondary h-[65px] font-bold uppercase">ABORT</button>
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