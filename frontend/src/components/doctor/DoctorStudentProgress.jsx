import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import toast from 'react-hot-toast';
import { Activity, Users, Search, CheckCircle2, XCircle, Clock, TrendingUp, Award } from 'lucide-react';

const DoctorStudentProgress = ({ courses }) => {
  const { doctorApi } = useDoctorAuth();
  const { t } = useTranslation();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    if (selectedCourseId) {
      fetchProgress();
    } else {
      setStudents([]);
    }
  }, [selectedCourseId]);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const res = await doctorApi('get', `/doctor/progress/${selectedCourseId}`);
      setStudents(res.data);
    } catch (err) {
      toast.error(t('doctor.student_progress.failed_load'));
    } finally {
      setLoading(false);
    }
  };

  const filtered = students
    .filter(s =>
      s.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(s.student_id).includes(searchTerm)
    )
    .sort((a, b) => {
      if (sortBy === 'name') return (a.student_name || '').localeCompare(b.student_name || '');
      if (sortBy === 'quiz') return (b.avg_quiz_score || 0) - (a.avg_quiz_score || 0);
      if (sortBy === 'grade') return (b.grade_total || 0) - (a.grade_total || 0);
      if (sortBy === 'progress') return (b.progress_percentage || 0) - (a.progress_percentage || 0);
      return 0;
    });

  const getScoreColor = (score) => {
    if (score === null || score === undefined) return 'text-gray-400';
    if (score >= 75) return 'text-emerald-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const getProgressBar = (value, max = 100) => {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
      <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-2 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${
            pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : pct > 0 ? 'bg-red-400' : 'bg-gray-200 dark:bg-white/10'
          }`}
          style={{ width: `${pct}%` }}
        ></div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#059669]" /> {t('doctor.student_progress.title')}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {t('doctor.student_progress.subtitle')}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={selectedCourseId}
          onChange={(e) => { setSelectedCourseId(e.target.value); setSearchTerm(''); }}
          className="flex-1 bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-xl p-3 text-gray-900 dark:text-white text-sm outline-none"
        >
          <option value="">{t('doctor.student_progress.select_course')}</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {students.length > 0 && (
          <>
            <div className="relative sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder={t('doctor.student_progress.search_students')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm outline-none text-gray-900 dark:text-white" />
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white outline-none">
              <option value="name">{t('doctor.student_progress.sort_name')}</option>
              <option value="quiz">{t('doctor.student_progress.sort_quiz')}</option>
              <option value="grade">{t('doctor.student_progress.sort_grade')}</option>
              <option value="progress">{t('doctor.student_progress.sort_progress')}</option>
            </select>
          </>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-white/10 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-1/3 mb-2"></div>
                  <div className="h-2 bg-gray-100 dark:bg-white/5 rounded w-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !selectedCourseId ? (
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-xl p-12 text-center">
          <Users className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">{t('doctor.student_progress.select_hint')}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-xl p-12 text-center">
          <Users className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            {searchTerm ? t('doctor.student_progress.no_students_search') : t('doctor.student_progress.no_students_course')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(s => {
            return (
              <div key={s.student_id} className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 rounded-xl p-4 hover:shadow-sm transition-all">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-center gap-3 lg:w-48 shrink-0">
                    <div className="w-10 h-10 bg-[#059669]/10 rounded-full overflow-hidden flex items-center justify-center text-[#059669] font-medium text-sm">
                      {s.avatar_url ? (
                        <img src={s.avatar_url} alt={s.student_name} className="w-full h-full object-cover" />
                      ) : (
                        s.student_name?.charAt(0)?.toUpperCase() || '?'
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{s.student_name}</p>
                      <p className="text-xs text-gray-400">
                        {t('doctor.student_progress.id_prefix')} {s.student_id} {s.section && `· ${t('doctor.student_progress.sec_prefix')} ${s.section}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-400">{t('doctor.student_progress.quizzes')}</span>
                        <span className="text-xs font-medium text-gray-600 dark:text-slate-300">{s.quizzes_completed}/{s.quizzes_total}</span>
                      </div>
                      {getProgressBar(s.quizzes_completed, s.quizzes_total)}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-400">{t('doctor.student_progress.avg_score')}</span>
                        <span className={`text-xs font-medium ${getScoreColor(s.avg_quiz_score)}`}>
                          {s.avg_quiz_score !== null ? `${s.avg_quiz_score}%` : '—'}
                        </span>
                      </div>
                      {getProgressBar(s.avg_quiz_score || 0)}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-400">{t('doctor.student_progress.tasks')}</span>
                        <span className="text-xs font-medium text-gray-600 dark:text-slate-300">{s.tasks_completed}/{s.tasks_total}</span>
                      </div>
                      {getProgressBar(s.tasks_completed, s.tasks_total)}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-400">{t('doctor.student_progress.grade')}</span>
                        <span className={`text-xs font-medium ${
                          s.grade_total >= 30 ? 'text-emerald-500' : s.grade_total >= 20 ? 'text-amber-500' : 'text-rose-500'
                        }`}>
                          {s.grade_total}/40
                        </span>
                      </div>
                      {getProgressBar(s.grade_total, 40)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DoctorStudentProgress;
