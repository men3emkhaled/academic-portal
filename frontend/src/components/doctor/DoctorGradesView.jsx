import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { 
  BarChart3, Users, Award, FileSpreadsheet, Edit2, 
  Save, X, Search, Filter, BookOpen, Download, 
  CheckCircle2, AlertCircle, ChevronRight, GraduationCap, Target
} from 'lucide-react';

const DoctorGradesView = ({ courses }) => {
  const { doctorApi } = useDoctorAuth();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingEnrollmentId, setEditingEnrollmentId] = useState(null);
  const [editValues, setEditValues] = useState({ midterm_score: '', practical_score: '', oral_score: '' });
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (selectedCourseId) {
      fetchGrades();
    } else {
      setGrades([]);
    }
  }, [selectedCourseId]);

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const res = await doctorApi('get', `/doctor/grades/${selectedCourseId}`);
      setGrades(res.data);
    } catch (err) {
      toast.error('Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (g) => {
    setEditingEnrollmentId(g.enrollment_id);
    setEditValues({
      midterm_score: g.midterm_score !== null ? g.midterm_score : '',
      practical_score: g.practical_score !== null ? g.practical_score : '',
      oral_score: g.oral_score !== null ? g.oral_score : ''
    });
  };

  const handleCancelEdit = () => {
    setEditingEnrollmentId(null);
    setEditValues({ midterm_score: '', practical_score: '', oral_score: '' });
  };

  const handleSaveGrade = async (enrollmentId) => {
    setSaving(true);
    try {
      await doctorApi('put', `/doctor/grades/${selectedCourseId}/enrollments/${enrollmentId}`, editValues);
      toast.success('Grade updated successfully');
      setEditingEnrollmentId(null);
      fetchGrades();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update grade');
    } finally {
      setSaving(false);
    }
  };

  const exportToCSV = () => {
    if (!grades.length) return toast.error('No data to export');

    const headers = ['Student ID', 'Student Name', 'Section', 'Midterm', 'Practical', 'Oral', 'Total'];
    const rows = grades.map(g => [
      g.student_id,
      g.student_name,
      g.section || 'N/A',
      g.midterm_score || 0,
      g.practical_score || 0,
      g.oral_score || 0,
      g.total_score || 0
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    const courseName = courses.find(c => c.id === parseInt(selectedCourseId))?.name || 'Course';
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${courseName}_Grades.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV exported successfully');
  };

  const filteredGrades = grades.filter(g =>
    g.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(g.student_id).includes(searchTerm)
  );

  const avgTotal = grades.length > 0
    ? (grades.reduce((sum, g) => sum + (g.total_score || 0), 0) / grades.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-8 animate-fadeIn pb-24 lg:pb-0">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-rose-500" />
            Performance & Grades
          </h2>
          <p className="text-doctor-text-muted font-medium">Record academic results, manage course scores, and export performance reports.</p>
        </div>
        
        {selectedCourseId && grades.length > 0 && (
          <button
            onClick={exportToCSV}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center gap-3 transition-all active:scale-95"
          >
            <Download className="w-5 h-5" />
            <span>Export Report</span>
          </button>
        )}
      </div>

      {/* Course Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {courses.map(course => (
              <button
                key={course.id}
                onClick={() => setSelectedCourseId(course.id)}
                className={`relative p-5 rounded-[1.8rem] border transition-all text-left group overflow-hidden ${
                    selectedCourseId === course.id 
                    ? 'bg-doctor-primary/10 border-doctor-primary shadow-xl shadow-doctor-primary/10' 
                    : 'bg-doctor-card border-white/5 hover:border-white/20'
                }`}
              >
                  {/* Decoration */}
                  <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-3xl transition-opacity ${selectedCourseId === course.id ? 'bg-doctor-primary/20 opacity-100' : 'bg-white/5 opacity-0 group-hover:opacity-100'}`}></div>
                  
                  <div className="flex items-center gap-4 relative z-10">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${selectedCourseId === course.id ? 'bg-doctor-primary text-white' : 'bg-white/5 text-doctor-text-muted group-hover:scale-110'}`}>
                          <BookOpen className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                          <h4 className={`font-bold truncate ${selectedCourseId === course.id ? 'text-white' : 'text-doctor-text-muted group-hover:text-white'}`}>{course.name}</h4>
                          <p className="text-[10px] font-black uppercase tracking-widest text-doctor-text-muted opacity-60 mt-1">{course.code}</p>
                      </div>
                  </div>
              </button>
          ))}
      </div>

      {/* Stats Summary */}
      {selectedCourseId && grades.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slideUp">
          <div className="bg-doctor-card border border-white/5 rounded-[2rem] p-6 flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-doctor-primary/10 flex items-center justify-center">
                <Users className="w-7 h-7 text-doctor-primary" />
            </div>
            <div>
                <p className="text-[10px] font-black text-doctor-text-muted uppercase tracking-widest mb-1">Enrolled Students</p>
                <p className="text-3xl font-black text-white">{grades.length}</p>
            </div>
          </div>
          <div className="bg-doctor-card border border-white/5 rounded-[2rem] p-6 flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                <Target className="w-7 h-7 text-rose-500" />
            </div>
            <div>
                <p className="text-[10px] font-black text-doctor-text-muted uppercase tracking-widest mb-1">Average Performance</p>
                <p className="text-3xl font-black text-white">{avgTotal}%</p>
            </div>
          </div>
          <div className="bg-doctor-card border border-white/5 rounded-[2rem] p-6 flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <Award className="w-7 h-7 text-emerald-500" />
            </div>
            <div>
                <p className="text-[10px] font-black text-doctor-text-muted uppercase tracking-widest mb-1">Highest Possible</p>
                <p className="text-3xl font-black text-white">40</p>
            </div>
          </div>
        </div>
      )}

      {/* Grades View Container */}
      <div className="bg-doctor-card border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/20">
        <div className="p-8 md:p-10 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <Filter className="w-5 h-5 text-doctor-text-muted" />
                </div>
                <h3 className="text-xl font-black text-white">Academic Register</h3>
            </div>
            
            {selectedCourseId && grades.length > 0 && (
                <div className="relative group min-w-[300px]">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-doctor-text-muted group-focus-within:text-doctor-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by student name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-[1.8rem] py-4 pl-14 pr-6 text-white text-sm focus:outline-none focus:border-doctor-primary/40 focus:bg-white/[0.08] transition-all"
                    />
                </div>
            )}
        </div>

        <div className="p-4 md:p-8 overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-12 h-12 border-4 border-doctor-primary/20 border-t-doctor-primary rounded-full animate-spin"></div>
              <p className="text-doctor-text-muted font-bold text-sm">Synchronizing grade data...</p>
            </div>
          ) : !selectedCourseId ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-8">
                <GraduationCap className="w-12 h-12 text-white/10" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Select a Course</h3>
              <p className="text-doctor-text-muted max-w-xs">Choose a course from the cards above to start managing student grades and performance.</p>
            </div>
          ) : filteredGrades.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-8">
                <AlertCircle className="w-12 h-12 text-white/10" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">No Records Found</h3>
              <p className="text-doctor-text-muted">No students currently match your selection or search criteria.</p>
            </div>
          ) : (
              <table className="w-full text-left border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-doctor-text-muted">
                    <th className="px-6 pb-2 text-[10px] font-black uppercase tracking-widest">Student Information</th>
                    <th className="px-6 pb-2 text-[10px] font-black uppercase tracking-widest text-center">Section</th>
                    <th className="px-6 pb-2 text-[10px] font-black uppercase tracking-widest text-center">Midterm (20)</th>
                    <th className="px-6 pb-2 text-[10px] font-black uppercase tracking-widest text-center">Practical (10)</th>
                    <th className="px-6 pb-2 text-[10px] font-black uppercase tracking-widest text-center">Oral (10)</th>
                    <th className="px-6 pb-2 text-[10px] font-black uppercase tracking-widest text-center">Total Score</th>
                    <th className="px-6 pb-2 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGrades.map((g) => {
                    const isEditing = editingEnrollmentId === g.enrollment_id;
                    const isHighPerformance = (g.total_score || 0) >= 30;
                    const isRisk = (g.total_score || 0) < 20 && g.total_score !== null;

                    return (
                      <tr 
                        key={g.enrollment_id || g.student_id}
                        className={`group transition-all ${isEditing ? 'scale-[1.01]' : 'hover:scale-[1.005]'}`}
                      >
                        <td className={`bg-white/5 px-6 py-5 rounded-l-[1.8rem] border-y border-l border-white/5 transition-all ${isEditing ? 'bg-doctor-primary/10 border-doctor-primary/40' : 'group-hover:bg-white/[0.08] group-hover:border-white/20'}`}>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-doctor-primary/20 to-doctor-secondary/20 flex items-center justify-center font-black text-doctor-primary text-xs border border-white/10">
                                    {g.student_name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm leading-none mb-1">{g.student_name}</p>
                                    <p className="text-[10px] font-medium text-doctor-text-muted">ID: {g.student_id}</p>
                                </div>
                            </div>
                        </td>
                        <td className={`bg-white/5 px-6 py-5 border-y border-white/5 transition-all text-center ${isEditing ? 'bg-doctor-primary/10 border-doctor-primary/40' : 'group-hover:bg-white/[0.08] group-hover:border-white/20'}`}>
                            <span className="text-[10px] font-black text-doctor-text-muted bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                                {g.section || '—'}
                            </span>
                        </td>

                        {isEditing ? (
                          <>
                            <td className="bg-white/5 px-6 py-5 border-y border-white/5 text-center bg-doctor-primary/10 border-doctor-primary/40">
                              <input
                                type="number" min="0" max="20" step="0.5"
                                className="w-20 bg-white/10 border border-doctor-primary/40 rounded-xl py-2 px-3 text-center text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-doctor-primary/30"
                                value={editValues.midterm_score}
                                onChange={(e) => setEditValues({ ...editValues, midterm_score: e.target.value })}
                                autoFocus
                              />
                            </td>
                            <td className="bg-white/5 px-6 py-5 border-y border-white/5 text-center bg-doctor-primary/10 border-doctor-primary/40">
                              <input
                                type="number" min="0" max="10" step="0.5"
                                className="w-20 bg-white/10 border border-doctor-primary/40 rounded-xl py-2 px-3 text-center text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-doctor-primary/30"
                                value={editValues.practical_score}
                                onChange={(e) => setEditValues({ ...editValues, practical_score: e.target.value })}
                              />
                            </td>
                            <td className="bg-white/5 px-6 py-5 border-y border-white/5 text-center bg-doctor-primary/10 border-doctor-primary/40">
                              <input
                                type="number" min="0" max="10" step="0.5"
                                className="w-20 bg-white/10 border border-doctor-primary/40 rounded-xl py-2 px-3 text-center text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-doctor-primary/30"
                                value={editValues.oral_score}
                                onChange={(e) => setEditValues({ ...editValues, oral_score: e.target.value })}
                              />
                            </td>
                            <td className="bg-white/5 px-6 py-5 border-y border-white/5 text-center bg-doctor-primary/10 border-doctor-primary/40 font-black text-doctor-text-muted italic">—</td>
                            <td className="bg-white/5 px-6 py-5 rounded-r-[1.8rem] border-y border-r border-white/5 text-right bg-doctor-primary/10 border-doctor-primary/40">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleSaveGrade(g.enrollment_id)}
                                  disabled={saving}
                                  className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-all active:scale-90 shadow-lg shadow-emerald-500/20"
                                  title="Save Changes"
                                >
                                  {saving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Save className="w-5 h-5" />}
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  disabled={saving}
                                  className="w-10 h-10 bg-white/10 text-rose-400 rounded-xl flex items-center justify-center hover:bg-rose-500/10 transition-all active:scale-90"
                                  title="Cancel"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className={`bg-white/5 px-6 py-5 border-y border-white/5 text-center transition-all ${isEditing ? 'bg-doctor-primary/10 border-doctor-primary/40' : 'group-hover:bg-white/[0.08] group-hover:border-white/20'}`}>
                                <span className="text-sm font-bold text-white">
                                    {g.midterm_score !== null ? g.midterm_score : <span className="text-white/10">—</span>}
                                </span>
                            </td>
                            <td className={`bg-white/5 px-6 py-5 border-y border-white/5 text-center transition-all ${isEditing ? 'bg-doctor-primary/10 border-doctor-primary/40' : 'group-hover:bg-white/[0.08] group-hover:border-white/20'}`}>
                                <span className="text-sm font-bold text-white">
                                    {g.practical_score !== null ? g.practical_score : <span className="text-white/10">—</span>}
                                </span>
                            </td>
                            <td className={`bg-white/5 px-6 py-5 border-y border-white/5 text-center transition-all ${isEditing ? 'bg-doctor-primary/10 border-doctor-primary/40' : 'group-hover:bg-white/[0.08] group-hover:border-white/20'}`}>
                                <span className="text-sm font-bold text-white">
                                    {g.oral_score !== null ? g.oral_score : <span className="text-white/10">—</span>}
                                </span>
                            </td>
                            <td className={`bg-white/5 px-6 py-5 border-y border-white/5 text-center transition-all ${isEditing ? 'bg-doctor-primary/10 border-doctor-primary/40' : 'group-hover:bg-white/[0.08] group-hover:border-white/20'}`}>
                                <div className={`inline-flex flex-col items-center justify-center min-w-[3.5rem] py-2 px-3 rounded-2xl border ${
                                    isHighPerformance ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                                    isRisk ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
                                    'bg-white/5 border-white/10 text-white'
                                }`}>
                                    <span className="text-sm font-black leading-none">{g.total_score !== null ? g.total_score : 0}</span>
                                    <span className="text-[8px] font-black uppercase mt-1 opacity-60">Result</span>
                                </div>
                            </td>
                            <td className={`bg-white/5 px-6 py-5 rounded-r-[1.8rem] border-y border-r border-white/5 text-right transition-all ${isEditing ? 'bg-doctor-primary/10 border-doctor-primary/40' : 'group-hover:bg-white/[0.08] group-hover:border-white/20'}`}>
                                <button
                                    onClick={() => handleEditClick(g)}
                                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-doctor-text-muted hover:text-doctor-primary hover:bg-doctor-primary/10 hover:border-doctor-primary/30 transition-all active:scale-90"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
          )}
        </div>
      </div>

      <style>{`
        .hidden-scrollbar::-webkit-scrollbar { display: none; }
        .hidden-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default DoctorGradesView;
