import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { TrendingUp, Users, Award, Download, FileSpreadsheet, Edit2, Save, X } from 'lucide-react';

const DoctorGradesView = ({ courses }) => {
  const { doctorApi } = useDoctorAuth();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingEnrollmentId, setEditingEnrollmentId] = useState(null);
  const [editValues, setEditValues] = useState({ midterm_score: '', practical_score: '', oral_score: '' });
  const [saving, setSaving] = useState(false);

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
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-black mb-4 flex items-center gap-2">
            <TrendingUp className="text-violet-500" /> View Course Grades
          </h3>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full md:max-w-md bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-4 text-gray-900 dark:text-white"
          >
            <option value="">-- Choose a course --</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {selectedCourseId && grades.length > 0 && (
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-2xl transition-colors shadow-[0_8px_20px_rgba(16,185,129,0.3)] mt-8 md:mt-0"
          >
            <FileSpreadsheet className="w-5 h-5" /> Export CSV
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[2rem] p-6 min-h-[500px]">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
          </div>
        ) : !selectedCourseId ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-50 text-gray-500">
            <Users className="w-16 h-16 mb-4" />
            <p>Select a course to view student grades</p>
          </div>
        ) : grades.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-50 text-gray-500">
            <Award className="w-16 h-16 mb-4" />
            <p>No students enrolled or no grades available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <th className="p-4 font-bold">Student</th>
                  <th className="p-4 font-bold text-center">Section</th>
                  <th className="p-4 font-bold text-center">Midterm (20)</th>
                  <th className="p-4 font-bold text-center">Practical (10)</th>
                  <th className="p-4 font-bold text-center">Oral (10)</th>
                  <th className="p-4 font-bold text-center">Total (40)</th>
                  <th className="p-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((g, idx) => (
                  <tr key={g.student_id} className={`border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors ${idx % 2 === 0 ? 'bg-transparent' : 'bg-gray-50/50 dark:bg-white/[0.01]'}`}>
                    <td className="p-4">
                      <div className="font-bold text-gray-900 dark:text-white">{g.student_name}</div>
                      <div className="text-xs text-gray-500">ID: {g.student_id}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 px-2 py-1 rounded text-xs font-bold">
                        {g.section || '-'}
                      </span>
                    </td>
                    {editingEnrollmentId === g.enrollment_id ? (
                      <>
                        <td className="p-4 text-center">
                          <input
                            type="number"
                            min="0"
                            max="20"
                            className="w-16 p-1 border rounded text-center dark:bg-black/50 dark:text-white"
                            value={editValues.midterm_score}
                            onChange={(e) => setEditValues({ ...editValues, midterm_score: e.target.value })}
                          />
                        </td>
                        <td className="p-4 text-center">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            className="w-16 p-1 border rounded text-center dark:bg-black/50 dark:text-white"
                            value={editValues.practical_score}
                            onChange={(e) => setEditValues({ ...editValues, practical_score: e.target.value })}
                          />
                        </td>
                        <td className="p-4 text-center">
                          <input
                            type="number"
                            min="0"
                            max="10"
                            className="w-16 p-1 border rounded text-center dark:bg-black/50 dark:text-white"
                            value={editValues.oral_score}
                            onChange={(e) => setEditValues({ ...editValues, oral_score: e.target.value })}
                          />
                        </td>
                        <td className="p-4 text-center text-gray-400">-</td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleSaveGrade(g.enrollment_id)} disabled={saving} className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200">
                              <Save className="w-4 h-4" />
                            </button>
                            <button onClick={handleCancelEdit} disabled={saving} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-4 text-center font-medium">
                          {g.midterm_score !== null ? g.midterm_score : '-'}
                        </td>
                        <td className="p-4 text-center font-medium">
                          {g.practical_score !== null ? g.practical_score : '-'}
                        </td>
                        <td className="p-4 text-center font-medium">
                          {g.oral_score !== null ? g.oral_score : '-'}
                        </td>
                        <td className="p-4 text-center">
                          <span className="font-black text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-3 py-1 rounded-lg">
                            {g.total_score !== null ? g.total_score : 0}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleEditClick(g)} className="p-1.5 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-violet-100 hover:text-violet-600 dark:hover:bg-violet-500/20 dark:hover:text-violet-400 transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorGradesView;
