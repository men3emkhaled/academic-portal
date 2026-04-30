import React, { useState, useEffect } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { PieChart, TrendingUp, Users, Award, Target, Zap, BarChart3 } from 'lucide-react';

const DoctorQuizAnalytics = ({ courses }) => {
  const { doctorApi } = useDoctorAuth();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedCourseId) {
      fetchAnalytics();
    } else {
      setAnalytics(null);
    }
  }, [selectedCourseId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await doctorApi('get', `/doctor/analytics/${selectedCourseId}`);
      setAnalytics(res.data);
    } catch (err) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const distColors = {
    '0-20': { bg: 'bg-red-500', text: 'text-red-600 dark:text-red-400', light: 'bg-red-50 dark:bg-red-500/10' },
    '20-40': { bg: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400', light: 'bg-orange-50 dark:bg-orange-500/10' },
    '40-60': { bg: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', light: 'bg-amber-50 dark:bg-amber-500/10' },
    '60-80': { bg: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400', light: 'bg-blue-50 dark:bg-blue-500/10' },
    '80-100': { bg: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', light: 'bg-emerald-50 dark:bg-emerald-500/10' },
  };

  const allRanges = ['0-20', '20-40', '40-60', '60-80', '80-100'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <PieChart className="w-6 h-6 text-indigo-500" /> Quiz Analytics
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-500 mt-1">
          Detailed performance analytics for your quizzes
        </p>
      </div>

      {/* Course Selector */}
      <select
        value={selectedCourseId}
        onChange={(e) => setSelectedCourseId(e.target.value)}
        className="w-full sm:max-w-md bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-xl p-3.5 text-gray-900 dark:text-white font-medium focus:border-indigo-500/50 focus:outline-none transition-colors"
      >
        <option value="">-- Select a Course --</option>
        {courses.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl p-6 animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-white/10 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : !selectedCourseId ? (
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl p-16 text-center">
          <BarChart3 className="w-14 h-14 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-slate-500 font-medium">Select a course to view quiz analytics</p>
        </div>
      ) : !analytics ? null : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                  <Award className="w-5 h-5 text-indigo-500" />
                </div>
              </div>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{analytics.summary?.total_quizzes || 0}</p>
              <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Total Quizzes</p>
            </div>

            <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
              </div>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{analytics.summary?.students_attempted || 0}</p>
              <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Students Attempted</p>
            </div>

            <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
              <p className="text-2xl font-black text-emerald-500">{analytics.summary?.overall_avg || '—'}%</p>
              <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Overall Average</p>
            </div>

            <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber-500" />
                </div>
              </div>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{analytics.summary?.published_quizzes || 0}</p>
              <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Published</p>
            </div>
          </div>

          {/* Score Distribution */}
          {analytics.distribution && analytics.distribution.length > 0 && (
            <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-500" /> Score Distribution
              </h3>
              <div className="space-y-3">
                {allRanges.map(range => {
                  const item = analytics.distribution.find(d => d.range === range);
                  const count = item ? parseInt(item.count) : 0;
                  const totalAttempts = analytics.distribution.reduce((sum, d) => sum + parseInt(d.count), 0);
                  const pct = totalAttempts > 0 ? (count / totalAttempts) * 100 : 0;
                  const colors = distColors[range];

                  return (
                    <div key={range} className="flex items-center gap-4">
                      <span className={`text-xs font-bold w-16 text-right ${colors.text}`}>{range}%</span>
                      <div className="flex-1 bg-gray-100 dark:bg-white/5 rounded-full h-6 overflow-hidden relative">
                        <div
                          className={`h-full ${colors.bg} rounded-full transition-all duration-700 flex items-center justify-end pr-2`}
                          style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                        >
                          {count > 0 && (
                            <span className="text-[10px] font-bold text-white">{count}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-gray-400 dark:text-slate-500 w-12">{pct.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Per-Quiz Breakdown */}
          {analytics.quizzes && analytics.quizzes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-500" /> Per-Quiz Performance
              </h3>
              {analytics.quizzes.map(q => {
                const passRate = q.completed_attempts > 0
                  ? Math.round((q.passed_count / q.completed_attempts) * 100)
                  : 0;

                return (
                  <div
                    key={q.id}
                    className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl p-5 hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900 dark:text-white truncate">{q.title}</h4>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                            q.is_published
                              ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10'
                              : 'text-gray-500 bg-gray-100 dark:bg-white/5'
                          }`}>
                            {q.is_published ? 'Live' : 'Draft'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-slate-500">
                          ⏱ {q.time_limit_minutes}min · 🎯 Pass: {q.passing_score}%
                        </p>
                      </div>

                      {/* Quiz Metrics */}
                      <div className="flex flex-wrap gap-4">
                        <div className="text-center">
                          <p className="text-lg font-black text-gray-900 dark:text-white">{q.completed_attempts || 0}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Completed</p>
                        </div>
                        <div className="text-center">
                          <p className={`text-lg font-black ${
                            (q.avg_score || 0) >= 70 ? 'text-emerald-500' : (q.avg_score || 0) >= 50 ? 'text-amber-500' : 'text-red-500'
                          }`}>
                            {q.avg_score !== null ? `${q.avg_score}%` : '—'}
                          </p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Average</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-black text-blue-500">{q.max_score !== null ? `${Math.round(q.max_score)}%` : '—'}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Highest</p>
                        </div>
                        <div className="text-center">
                          <p className={`text-lg font-black ${passRate >= 70 ? 'text-emerald-500' : passRate >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                            {q.completed_attempts > 0 ? `${passRate}%` : '—'}
                          </p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pass Rate</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {analytics.quizzes && analytics.quizzes.length === 0 && (
            <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-2xl p-16 text-center">
              <Award className="w-14 h-14 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-slate-500 font-medium">No quizzes found for this course</p>
              <p className="text-xs text-gray-400 dark:text-slate-600 mt-1">Create a quiz to start seeing analytics</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DoctorQuizAnalytics;
