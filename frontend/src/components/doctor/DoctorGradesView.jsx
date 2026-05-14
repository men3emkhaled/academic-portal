import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, Users, Award, FileSpreadsheet, Edit2, 
  Save, X, Search, Filter, BookOpen, Download, 
  CheckCircle2, AlertCircle, ChevronRight, GraduationCap, Target,
  Sparkles, ShieldAlert, TrendingUp, ArrowRight
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
      toast.error('Failed to synchronize grade data');
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
      toast.success('Performance synchronized');
      setEditingEnrollmentId(null);
      fetchGrades();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update grade');
    } finally {
      setSaving(false);
    }
  };

  const exportToCSV = () => {
    if (!grades.length) return toast.error('No data for export');

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
    link.setAttribute("download", `${courseName}_Performance_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Performance report exported');
  };

  const filteredGrades = grades.filter(g =>
    (g.student_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    String(g.student_id || '').includes(searchTerm)
  );

  const avgTotal = grades.length > 0
    ? (grades.reduce((sum, g) => sum + (g.total_score || 0), 0) / (grades.length * 40) * 100).toFixed(1)
    : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-10 pb-12"
    >
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Performance Management</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-none">Academic Register</h2>
          <p className="text-gray-500 dark:text-gray-400 font-semibold max-w-xl">
            Record assessment results, analyze performance trends, and synchronize academic reports.
          </p>
        </div>
        
        {selectedCourseId && grades.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportToCSV}
            className="bg-gray-900 dark:bg-white text-white dark:text-black font-black px-10 py-5 rounded-2xl shadow-2xl shadow-black/10 flex items-center gap-4 transition-all"
          >
            <Download className="w-5 h-5" />
            <span className="text-xs uppercase tracking-widest">Export Performance Data</span>
          </motion.button>
        )}
      </div>

      {/* Course Selection Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map(course => (
              <motion.button
                key={course.id}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                onClick={() => setSelectedCourseId(course.id)}
                className={`relative p-8 rounded-[2.5rem] border transition-all text-start group overflow-hidden ${
                    selectedCourseId === course.id 
                    ? 'bg-white dark:bg-white border-transparent shadow-2xl' 
                    : 'bg-white/50 dark:bg-white/[0.02] border-gray-100 dark:border-white/5 hover:border-violet-500/20'
                }`}
              >
                  <div className={`absolute -end-8 -bottom-8 w-32 h-32 rounded-full blur-3xl transition-opacity ${selectedCourseId === course.id ? 'bg-violet-500/10 opacity-100' : 'bg-violet-500/5 opacity-0 group-hover:opacity-100'}`}></div>
                  
                  <div className="space-y-6 relative z-10">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${selectedCourseId === course.id ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20' : 'bg-gray-100 dark:bg-white/5 text-gray-400 group-hover:scale-110'}`}>
                          <BookOpen className="w-6 h-6" />
                      </div>
                      <div>
                          <h4 className={`font-black text-sm mb-1 truncate ${selectedCourseId === course.id ? 'text-gray-900' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'}`}>{course.name}</h4>
                          <p className={`text-[10px] font-black uppercase tracking-widest ${selectedCourseId === course.id ? 'text-violet-600' : 'text-gray-400 opacity-60'}`}>{course.code}</p>
                      </div>
                  </div>
              </motion.button>
          ))}
      </div>

      {/* Analytics Summary */}
      <AnimatePresence>
        {selectedCourseId && grades.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { label: 'Register Size', value: grades.length, icon: Users, color: 'blue', sub: 'Active Enrollments' },
              { label: 'Class Momentum', value: `${avgTotal}%`, icon: TrendingUp, color: 'emerald', sub: 'Average Score' },
              { label: 'Target Score', value: '40', icon: Award, color: 'violet', sub: 'Maximum Points' }
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8 flex items-center gap-8 shadow-sm">
                <div className={`w-16 h-16 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center shadow-inner`}>
                    <stat.icon className={`w-7 h-7 text-${stat.color}-500`} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{stat.label}</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white leading-none">{stat.value}</p>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2 opacity-60">{stat.sub}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Register Table */}
      <motion.div 
        layout
        className="bg-white dark:bg-[#080808]/40 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-[3.5rem] overflow-hidden shadow-2xl"
      >
        <div className="p-10 lg:p-14 border-b border-gray-100 dark:border-white/5 flex flex-col xl:flex-row xl:items-center justify-between gap-10">
            <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Active Performance Flow</h3>
                </div>
                <p className="text-xs text-gray-400 font-semibold max-w-md">Real-time academic evaluation for enrolled students.</p>
            </div>
            
            {selectedCourseId && grades.length > 0 && (
                <div className="relative group min-w-[360px]">
                    <Search className="absolute start-7 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Filter by student name or profile ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-[1.8rem] py-4.5 ps-16 pe-8 text-gray-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-violet-500/5 transition-all"
                    />
                </div>
            )}
        </div>

        <div className="p-8 lg:p-14 overflow-x-auto min-h-[500px] custom-scrollbar">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-32 gap-6"
              >
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-violet-500/10 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-transparent border-t-violet-500 rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Synchronizing Register...</p>
              </motion.div>
            ) : !selectedCourseId ? (
              <motion.div 
                key="no-course"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-32 text-center"
              >
                <div className="w-24 h-24 bg-gray-100 dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-10 border border-gray-200 dark:border-white/5">
                  <Target className="w-12 h-12 text-gray-300 dark:text-white/10" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Sync Pending</h3>
                <p className="text-gray-400 font-semibold max-w-sm mx-auto">Select a course module above to unlock the academic register and manage student evaluations.</p>
              </motion.div>
            ) : filteredGrades.length === 0 ? (
              <motion.div 
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-32 text-center"
              >
                <div className="w-20 h-20 bg-rose-500/5 rounded-[2rem] flex items-center justify-center mb-8">
                  <ShieldAlert className="w-10 h-10 text-rose-500/20" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">No Records Found</h3>
                <p className="text-gray-400 font-semibold">No students match your filter parameters within this module.</p>
              </motion.div>
            ) : (
              <motion.table 
                key="table"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full text-start border-separate border-spacing-y-4"
              >
                <thead>
                  <tr className="text-gray-400">
                    <th className="px-8 pb-4 text-[9px] font-black uppercase tracking-[0.2em]">Student Identity</th>
                    <th className="px-8 pb-4 text-[9px] font-black uppercase tracking-[0.2em] text-center">Section</th>
                    <th className="px-8 pb-4 text-[9px] font-black uppercase tracking-[0.2em] text-center">Midterm <span className="text-gray-500 opacity-60">/20</span></th>
                    <th className="px-8 pb-4 text-[9px] font-black uppercase tracking-[0.2em] text-center">Practical <span className="text-gray-500 opacity-60">/10</span></th>
                    <th className="px-8 pb-4 text-[9px] font-black uppercase tracking-[0.2em] text-center">Oral <span className="text-gray-500 opacity-60">/10</span></th>
                    <th className="px-8 pb-4 text-[9px] font-black uppercase tracking-[0.2em] text-center">Sync Result</th>
                    <th className="px-8 pb-4 text-[9px] font-black uppercase tracking-[0.2em] text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGrades.map((g) => {
                    const isEditing = editingEnrollmentId === g.enrollment_id;
                    const isHighPerformance = (g.total_score || 0) >= 30;
                    const isRisk = (g.total_score || 0) < 20 && g.total_score !== null;

                    return (
                      <motion.tr 
                        layout
                        key={g.enrollment_id || g.student_id}
                        className={`group transition-all ${isEditing ? 'scale-[1.01]' : ''}`}
                      >
                        <td className={`bg-gray-50/50 dark:bg-white/[0.02] px-8 py-7 rounded-s-[2.5rem] border-y border-s border-gray-100 dark:border-white/5 transition-all ${isEditing ? 'bg-violet-500/[0.05] border-violet-500/40' : 'group-hover:bg-violet-500/[0.03]'}`}>
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-violet-500/10 flex items-center justify-center font-black text-violet-600 dark:text-violet-400 text-sm border border-violet-500/10">
                                    {g.avatar_url ? (
                                        <img src={g.avatar_url} alt={g.student_name} className="w-full h-full object-cover" />
                                    ) : (
                                        g.student_name.charAt(0)
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-black text-gray-900 dark:text-white truncate max-w-[200px] leading-none mb-2">{g.student_name}</div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {g.student_id}</div>
                                </div>
                            </div>
                        </td>
                        <td className={`bg-gray-50/50 dark:bg-white/[0.02] px-8 py-7 border-y border-gray-100 dark:border-white/5 transition-all text-center ${isEditing ? 'bg-violet-500/[0.05] border-violet-500/40' : 'group-hover:bg-violet-500/[0.03]'}`}>
                            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 bg-white dark:bg-black/20 px-4 py-2 rounded-xl border border-gray-100 dark:border-white/5">
                                {g.section || '—'}
                            </span>
                        </td>

                        {isEditing ? (
                          <>
                            <td className="bg-violet-500/[0.05] px-8 py-7 border-y border-violet-500/40 text-center">
                              <input
                                type="number" min="0" max="20" step="0.5"
                                className="w-24 bg-white dark:bg-black border border-violet-500/40 rounded-2xl py-3 px-4 text-center text-sm font-black text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
                                value={editValues.midterm_score}
                                onChange={(e) => setEditValues({ ...editValues, midterm_score: e.target.value })}
                                autoFocus
                              />
                            </td>
                            <td className="bg-violet-500/[0.05] px-8 py-7 border-y border-violet-500/40 text-center">
                              <input
                                type="number" min="0" max="10" step="0.5"
                                className="w-24 bg-white dark:bg-black border border-violet-500/40 rounded-2xl py-3 px-4 text-center text-sm font-black text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
                                value={editValues.practical_score}
                                onChange={(e) => setEditValues({ ...editValues, practical_score: e.target.value })}
                              />
                            </td>
                            <td className="bg-violet-500/[0.05] px-8 py-7 border-y border-violet-500/40 text-center">
                              <input
                                type="number" min="0" max="10" step="0.5"
                                className="w-24 bg-white dark:bg-black border border-violet-500/40 rounded-2xl py-3 px-4 text-center text-sm font-black text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
                                value={editValues.oral_score}
                                onChange={(e) => setEditValues({ ...editValues, oral_score: e.target.value })}
                              />
                            </td>
                            <td className="bg-violet-500/[0.05] px-8 py-7 border-y border-violet-500/40 text-center">
                              <Sparkles className="w-5 h-5 text-violet-500 mx-auto animate-pulse" />
                            </td>
                            <td className="bg-violet-500/[0.05] px-8 py-7 rounded-e-[2.5rem] border-y border-e border-violet-500/40 text-end">
                              <div className="flex items-center justify-end gap-3">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleSaveGrade(g.enrollment_id)}
                                  disabled={saving}
                                  className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20"
                                >
                                  {saving ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Save className="w-5 h-5" />}
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={handleCancelEdit}
                                  disabled={saving}
                                  className="w-12 h-12 bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-rose-500 rounded-2xl flex items-center justify-center transition-all"
                                >
                                  <X className="w-5 h-5" />
                                </motion.button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className={`bg-gray-50/50 dark:bg-white/[0.02] px-8 py-7 border-y border-gray-100 dark:border-white/5 text-center transition-all group-hover:bg-violet-500/[0.03]`}>
                                <span className="text-base font-black text-gray-900 dark:text-white">
                                    {g.midterm_score !== null ? g.midterm_score : <span className="opacity-10">—</span>}
                                </span>
                            </td>
                            <td className={`bg-gray-50/50 dark:bg-white/[0.02] px-8 py-7 border-y border-gray-100 dark:border-white/5 text-center transition-all group-hover:bg-violet-500/[0.03]`}>
                                <span className="text-base font-black text-gray-900 dark:text-white">
                                    {g.practical_score !== null ? g.practical_score : <span className="opacity-10">—</span>}
                                </span>
                            </td>
                            <td className={`bg-gray-50/50 dark:bg-white/[0.02] px-8 py-7 border-y border-gray-100 dark:border-white/5 text-center transition-all group-hover:bg-violet-500/[0.03]`}>
                                <span className="text-base font-black text-gray-900 dark:text-white">
                                    {g.oral_score !== null ? g.oral_score : <span className="opacity-10">—</span>}
                                </span>
                            </td>
                            <td className={`bg-gray-50/50 dark:bg-white/[0.02] px-8 py-7 border-y border-gray-100 dark:border-white/5 text-center transition-all group-hover:bg-violet-500/[0.03]`}>
                                <div className={`inline-flex flex-col items-center justify-center min-w-[5rem] py-3 px-5 rounded-[1.5rem] border ${
                                    isHighPerformance ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                                    isRisk ? 'bg-rose-500/5 border-rose-500/20 text-rose-600 dark:text-rose-400' :
                                    'bg-white dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white'
                                } shadow-sm`}>
                                    <span className="text-lg font-black leading-none">{g.total_score !== null ? g.total_score : 0}</span>
                                    <span className="text-[8px] font-black uppercase mt-1.5 opacity-60 tracking-widest">Points</span>
                                </div>
                            </td>
                            <td className={`bg-gray-50/50 dark:bg-white/[0.02] px-8 py-7 rounded-e-[2.5rem] border-y border-e border-gray-100 dark:border-white/5 text-end transition-all group-hover:bg-violet-500/[0.03]`}>
                                <motion.button
                                    whileHover={{ scale: 1.1, x: -5 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleEditClick(g)}
                                    className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-violet-500 hover:border-violet-500/30 transition-all shadow-sm"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </motion.button>
                            </td>
                          </>
                        )}
                      </motion.tr>
                    );
                  })}
                </tbody>
              </motion.table>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.1);
          border-radius: 10px;
        }
        .hidden-scrollbar::-webkit-scrollbar { display: none; }
        .hidden-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </motion.div>
  );
};

export default DoctorGradesView;
