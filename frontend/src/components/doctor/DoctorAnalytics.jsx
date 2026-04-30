import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { PieChart, Users, AlertTriangle, UserMinus, ShieldAlert, Award, FileSpreadsheet } from 'lucide-react';

const DoctorAnalytics = ({ courses }) => {
  const { doctorApi } = useDoctorAuth();
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedCourseId) {
      fetchAnalytics();
    }
  }, [selectedCourseId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await doctorApi('get', `/doctor/course-analytics/${selectedCourseId}`);
      setAnalytics(res.data);
    } catch (err) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!analytics || !analytics.at_risk_students.length) return;
    
    // Generate CSV for At-Risk Students
    const headers = ['Student ID', 'Student Name', 'Section', 'Reason', 'Attendance %', 'Missed Sessions', 'Avg Score %'];
    const rows = analytics.at_risk_students.map(s => [
      s.student_id,
      `"${s.student_name}"`, // Wrap in quotes in case of commas
      s.section,
      `"${s.risk_reason}"`,
      s.attendance_percentage || 'N/A',
      s.missed_sessions || 'N/A',
      s.avg_score || 'N/A'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + "\n" 
      + rows.map(e => e.join(',')).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `at_risk_students_${selectedCourseId}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header & Course Selection */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <PieChart className="w-6 h-6 text-purple-500" /> Course Analytics
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-500 mt-1">Smart insights and at-risk student detection</p>
        </div>
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-gray-900 dark:text-white font-bold focus:border-purple-500 focus:outline-none min-w-[200px]"
        >
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
        </div>
      ) : !analytics ? (
        <div className="text-center py-20 text-gray-500">Select a course to view analytics</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/5 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 dark:text-slate-500">Total Enrolled</p>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">{analytics.total_students}</h3>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/5 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                  <UserMinus className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 dark:text-slate-500">Avg Attendance</p>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                    {analytics.total_sessions > 0 ? `${analytics.average_attendance_percentage}%` : 'No Data'}
                  </h3>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-white/[0.02] border border-red-200/60 dark:border-red-500/20 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-red-500 dark:text-red-400">At-Risk Students</p>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">{analytics.at_risk_count}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* At-Risk Students Table */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-gray-200/60 dark:border-white/5 flex items-center justify-between bg-red-50/50 dark:bg-red-500/5">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-black">
                <ShieldAlert className="w-5 h-5" /> Students Requiring Attention
              </div>
              <button 
                onClick={downloadCSV}
                disabled={analytics.at_risk_count === 0}
                className="flex items-center gap-2 bg-white dark:bg-black/20 text-gray-700 dark:text-gray-300 font-bold px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 text-sm"
              >
                <FileSpreadsheet className="w-4 h-4" /> Export CSV
              </button>
            </div>
            
            {analytics.at_risk_count === 0 ? (
              <div className="p-10 text-center text-gray-500">
                <Award className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="font-bold">Great job!</p>
                <p className="text-sm mt-1">No students are currently marked as at-risk.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 dark:bg-black/20 text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                      <th className="p-4 border-b border-gray-200/60 dark:border-white/5">Student</th>
                      <th className="p-4 border-b border-gray-200/60 dark:border-white/5">Section</th>
                      <th className="p-4 border-b border-gray-200/60 dark:border-white/5">Risk Reason</th>
                      <th className="p-4 border-b border-gray-200/60 dark:border-white/5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {analytics.at_risk_students.map((student, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                        <td className="p-4 border-b border-gray-200/60 dark:border-white/5">
                          <p className="font-bold text-gray-900 dark:text-white">{student.student_name}</p>
                          <p className="text-xs text-gray-500">{student.student_id}</p>
                        </td>
                        <td className="p-4 border-b border-gray-200/60 dark:border-white/5 font-medium text-gray-700 dark:text-gray-300">
                          {student.section}
                        </td>
                        <td className="p-4 border-b border-gray-200/60 dark:border-white/5">
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 rounded-md">
                            <AlertTriangle className="w-3 h-3" />
                            {student.risk_reason}
                          </span>
                        </td>
                        <td className="p-4 border-b border-gray-200/60 dark:border-white/5 text-right">
                          <button 
                            className="text-purple-600 dark:text-purple-400 font-bold hover:underline text-xs"
                            onClick={() => toast('Feature coming soon: Send Warning Email')}
                          >
                            Contact
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DoctorAnalytics;
