import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { 
  Users, Activity, AlertTriangle, CheckCircle2, 
  BarChart3, UserCheck, Calendar, Search
} from 'lucide-react';

const DoctorAnalytics = ({ courses }) => {
  const { doctorApi } = useDoctorAuth();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (selectedCourseId) {
      fetchAnalytics();
    } else {
      setData(null);
    }
  }, [selectedCourseId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await doctorApi('get', `/doctor/course-analytics/${selectedCourseId}`);
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load course analytics');
    } finally {
      setLoading(false);
    }
  };

  const filteredAtRisk = data?.at_risk_students?.filter(s => 
    s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.student_id.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-red-500" /> Smart Analytics
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-500 mt-1">
          Identify at-risk students based on attendance and performance
        </p>
      </div>

      <select
        value={selectedCourseId}
        onChange={(e) => setSelectedCourseId(e.target.value)}
        className="w-full sm:max-w-md bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-xl p-3.5 text-gray-900 dark:text-white font-medium focus:border-red-500/50 focus:outline-none transition-colors"
      >
        <option value="">-- Select a Course --</option>
        {courses.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl p-6 animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-white/10 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : !selectedCourseId ? (
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl p-16 text-center">
          <BarChart3 className="w-14 h-14 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-slate-500 font-medium">Select a course to view smart analytics</p>
        </div>
      ) : !data ? null : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl p-5">
              <Users className="w-8 h-8 text-blue-500 mb-3" />
              <p className="text-2xl font-black">{data.total_students || 0}</p>
              <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">Total Students</p>
            </div>

            <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl p-5">
              <Calendar className="w-8 h-8 text-violet-500 mb-3" />
              <p className="text-2xl font-black">{data.total_sessions || 0}</p>
              <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">Total Sessions</p>
            </div>

            <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl p-5">
              <UserCheck className="w-8 h-8 text-emerald-500 mb-3" />
              <p className="text-2xl font-black text-emerald-500">{data.average_attendance_percentage || 0}%</p>
              <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">Avg Attendance</p>
            </div>

            <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl p-5">
              <AlertTriangle className="w-8 h-8 text-red-500 mb-3" />
              <p className="text-2xl font-black text-red-500">{data.at_risk_count || 0}</p>
              <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">At-Risk Students</p>
            </div>
          </div>

          {/* At Risk Table */}
          <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-[2rem] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-lg font-black flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" /> At-Risk Students Analysis
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm focus:border-red-500/50 outline-none transition-all w-full sm:w-64"
                />
              </div>
            </div>

            <div className="p-6">
              {filteredAtRisk.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-16 h-16 text-emerald-500/20 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No students at risk found matching your search</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-white/10">
                        <th className="pb-4 text-xs font-bold text-gray-500 uppercase">Student</th>
                        <th className="pb-4 text-xs font-bold text-gray-500 uppercase">Section</th>
                        <th className="pb-4 text-xs font-bold text-gray-500 uppercase text-center">Attendance</th>
                        <th className="pb-4 text-xs font-bold text-gray-500 uppercase text-center">Avg Quiz</th>
                        <th className="pb-4 text-xs font-bold text-gray-500 uppercase">Risk Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                      {filteredAtRisk.map(student => (
                        <tr key={student.student_id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="py-4">
                            <p className="font-bold">{student.student_name}</p>
                            <p className="text-xs text-gray-500">{student.student_id}</p>
                          </td>
                          <td className="py-4 font-medium">{student.section || '—'}</td>
                          <td className="py-4 text-center">
                            <span className={`text-sm font-black ${student.attendance_percentage < 50 ? 'text-red-500' : 'text-amber-500'}`}>
                              {student.attendance_percentage !== null ? `${student.attendance_percentage}%` : '—'}
                            </span>
                          </td>
                          <td className="py-4 text-center">
                            <span className={`text-sm font-black ${student.avg_score < 50 ? 'text-red-500' : 'text-amber-500'}`}>
                              {student.avg_score !== null ? `${student.avg_score}%` : '—'}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className="text-xs font-bold bg-red-500/10 text-red-500 px-3 py-1 rounded-full border border-red-500/10">
                              {student.risk_reason}
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
        </div>
      )}
    </div>
  );
};

export default DoctorAnalytics;
