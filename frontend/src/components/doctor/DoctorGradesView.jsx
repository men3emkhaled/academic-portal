import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { BarChart3, Users, Award, FileSpreadsheet, Edit2, Save, X, Search } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-rose-500" /> Student Grades
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-500 mt-1">View and edit grades for your courses</p>
        </div>
        {selectedCourseId && grades.length > 0 && (
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-5 rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95 text-sm"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV
          </button>
        )}
      </div>

      {/* Course Selector + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <select
            value={selectedCourseId}
            onChange={(e) => { setSelectedCourseId(e.target.value); setSearchTerm(''); }}
            className="w-full bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-xl p-3.5 text-gray-900 dark:text-white font-medium focus:border-rose-500/50 focus:outline-none transition-colors"
          >
            <option value="">-- Select a Course --</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        {selectedCourseId && grades.length > 0 && (
          <div className="relative sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-xl pl-10 pr-4 py-3.5 text-gray-900 dark:text-white text-sm focus:border-rose-500/50 focus:outline-none transition-colors"
            />
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {selectedCourseId && grades.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-gray-900 dark:text-white">{grades.length}</p>
            <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Students</p>
          </div>
          <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-rose-500">{avgTotal}</p>
            <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Avg Total</p>
          </div>
          <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-emerald-500">40</p>
            <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Max Score</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8">
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-12 bg-gray-100 dark:bg-white/5 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        ) : !selectedCourseId ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-slate-600">
            <Users className="w-14 h-14 mb-3" />
            <p className="font-medium text-gray-500 dark:text-slate-500">Select a course to view grades</p>
          </div>
        ) : filteredGrades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-slate-600">
            <Award className="w-14 h-14 mb-3" />
            <p className="font-medium text-gray-500 dark:text-slate-500">
              {searchTerm ? 'No students match your search' : 'No students enrolled'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200/60 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]">
                  <th className="p-4 text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Student</th>
                  <th className="p-4 text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider text-center">Section</th>
                  <th className="p-4 text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider text-center">Midterm (20)</th>
                  <th className="p-4 text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider text-center">Practical (10)</th>
                  <th className="p-4 text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider text-center">Oral (10)</th>
                  <th className="p-4 text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider text-center">Total</th>
                  <th className="p-4 text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider text-center w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.03]">
                {filteredGrades.map((g) => {
                  const isEditing = editingEnrollmentId === g.enrollment_id;

                  return (
                    <tr
                      key={g.enrollment_id || g.student_id}
                      className={`transition-colors ${
                        isEditing
                          ? 'bg-violet-50/50 dark:bg-violet-500/[0.04]'
                          : 'hover:bg-gray-50/50 dark:hover:bg-white/[0.01]'
                      }`}
                    >
                      <td className="p-4">
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">{g.student_name}</div>
                        <div className="text-xs text-gray-400 dark:text-slate-600">ID: {g.student_id}</div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-xs font-bold bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-lg">
                          {g.section || '—'}
                        </span>
                      </td>

                      {isEditing ? (
                        <>
                          <td className="p-4 text-center">
                            <input
                              type="number" min="0" max="20" step="0.5"
                              className="w-16 p-2 border border-violet-300 dark:border-violet-500/30 rounded-lg text-center text-sm font-semibold bg-white dark:bg-black/30 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                              value={editValues.midterm_score}
                              onChange={(e) => setEditValues({ ...editValues, midterm_score: e.target.value })}
                              autoFocus
                            />
                          </td>
                          <td className="p-4 text-center">
                            <input
                              type="number" min="0" max="10" step="0.5"
                              className="w-16 p-2 border border-violet-300 dark:border-violet-500/30 rounded-lg text-center text-sm font-semibold bg-white dark:bg-black/30 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                              value={editValues.practical_score}
                              onChange={(e) => setEditValues({ ...editValues, practical_score: e.target.value })}
                            />
                          </td>
                          <td className="p-4 text-center">
                            <input
                              type="number" min="0" max="10" step="0.5"
                              className="w-16 p-2 border border-violet-300 dark:border-violet-500/30 rounded-lg text-center text-sm font-semibold bg-white dark:bg-black/30 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                              value={editValues.oral_score}
                              onChange={(e) => setEditValues({ ...editValues, oral_score: e.target.value })}
                            />
                          </td>
                          <td className="p-4 text-center text-gray-300 dark:text-slate-600 font-bold">—</td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleSaveGrade(g.enrollment_id)}
                                disabled={saving}
                                className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                                title="Save"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                disabled={saving}
                                className="p-2 bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-4 text-center text-sm font-medium text-gray-700 dark:text-slate-300">
                            {g.midterm_score !== null ? g.midterm_score : <span className="text-gray-300 dark:text-slate-600">—</span>}
                          </td>
                          <td className="p-4 text-center text-sm font-medium text-gray-700 dark:text-slate-300">
                            {g.practical_score !== null ? g.practical_score : <span className="text-gray-300 dark:text-slate-600">—</span>}
                          </td>
                          <td className="p-4 text-center text-sm font-medium text-gray-700 dark:text-slate-300">
                            {g.oral_score !== null ? g.oral_score : <span className="text-gray-300 dark:text-slate-600">—</span>}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-block min-w-[3rem] font-black text-sm px-3 py-1.5 rounded-lg ${
                              (g.total_score || 0) >= 30
                                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                                : (g.total_score || 0) >= 20
                                ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10'
                                : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10'
                            }`}>
                              {g.total_score !== null ? g.total_score : 0}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleEditClick(g)}
                              className="p-2 bg-gray-50 dark:bg-white/5 border border-gray-200/60 dark:border-white/5 text-gray-500 dark:text-slate-400 rounded-lg hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-violet-500/10 dark:hover:text-violet-400 transition-all"
                              title="Edit Grades"
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
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorGradesView;
