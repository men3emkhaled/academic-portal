import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { TrendingUp, Users, Award, Download, FileSpreadsheet } from 'lucide-react';

const DoctorGradesView = ({ courses }) => {
  const { doctorApi } = useDoctorAuth();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);

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
