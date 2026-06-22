import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTAAuth } from '../../context/TAAuthContext';
import toast from 'react-hot-toast';
import { 
  BarChart3, Users, Award, FileSpreadsheet, Edit2, 
  Save, X, Search, BookOpen, Download, 
  ShieldAlert, TrendingUp
} from 'lucide-react';

const TAGradesView = ({ courses }) => {
  const { taApi } = useTAAuth();
  const { t } = useTranslation();
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
      const res = await taApi('get', `/ta/grades/${selectedCourseId}`);
      setGrades(res.data);
    } catch (err) {
      toast.error(t('doctor.grades.failed_sync'));
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
      await taApi('put', `/ta/grades/${selectedCourseId}/enrollments/${enrollmentId}`, editValues);
      toast.success(t('doctor.grades.performance_synced'));
      setEditingEnrollmentId(null);
      fetchGrades();
    } catch (err) {
      toast.error(err.response?.data?.message || t('doctor.grades.failed_update'));
    } finally {
      setSaving(false);
    }
  };

  const exportToCSV = () => {
    if (!grades.length) return toast.error(t('doctor.grades.no_data_export'));

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
    const courseName = courses.find(c => c.id === parseInt(selectedCourseId))?.name || t('doctor.grades.performance_management');
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${courseName}_Grades.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(t('doctor.grades.report_exported'));
  };

  const filteredGrades = grades.filter(g =>
    (g.student_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    String(g.student_id || '').includes(searchTerm)
  );

  const avgTotal = grades.length > 0
    ? (grades.reduce((sum, g) => sum + (g.total_score || 0), 0) / (grades.length * 40) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-[#059669]" />
            <span className="text-xs text-gray-400 font-medium">{t('doctor.grades.performance_management')}</span>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('doctor.grades.academic_register')}</h2>
          <p className="text-sm text-gray-500">{t('doctor.grades.subtitle')}</p>
        </div>
        {selectedCourseId && grades.length > 0 && (
          <button onClick={exportToCSV} className="bg-gray-900 dark:bg-white text-white dark:text-black font-medium px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm transition-all hover:opacity-90">
            <Download className="w-4 h-4" />
            {t('doctor.grades.export_performance')}
          </button>
        )}
      </div>

      {/* Course Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {courses.map(course => (
          <button
            key={course.id}
            onClick={() => setSelectedCourseId(course.id)}
            className={`p-5 rounded-xl border transition-all text-start ${
              selectedCourseId === course.id 
              ? 'bg-white dark:bg-white border-[#059669] shadow-md' 
              : 'bg-white/50 dark:bg-white/[0.02] border-gray-100 dark:border-white/5 hover:border-[#059669]/30'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
              selectedCourseId === course.id ? 'bg-[#059669] text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400'
            }`}>
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className={`font-semibold text-sm mb-0.5 ${selectedCourseId === course.id ? 'text-gray-900' : 'text-gray-600 dark:text-gray-400'}`}>{course.name}</h4>
            <p className={`text-xs ${selectedCourseId === course.id ? 'text-[#059669]' : 'text-gray-400'}`}>{course.code}</p>
          </button>
        ))}
      </div>

      {/* Summary Stats */}
      {selectedCourseId && grades.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: t('doctor.grades.register_size'), value: grades.length, icon: Users, sub: t('doctor.grades.active_enrollments') },
            { label: t('doctor.grades.average_score'), value: `${avgTotal}%`, icon: TrendingUp, sub: t('doctor.grades.class_momentum') },
            { label: t('doctor.grades.maximum_points'), value: '40', icon: Award, sub: t('doctor.grades.points') }
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#059669]/10 flex items-center justify-center text-[#059669]">
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-400">{stat.label}</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-[10px] text-gray-400">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grade Table */}
      <div className="bg-white dark:bg-[#0c0c0e]/40 border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-white/5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-5 h-5 text-[#059669]" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t('doctor.grades.academic_register')}</h3>
          </div>
          {selectedCourseId && grades.length > 0 && (
            <div className="relative max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('doctor.grades.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-gray-900 dark:text-white text-sm outline-none transition-all"
              />
            </div>
          )}
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-[#059669]/20 border-t-[#059669] rounded-full animate-spin"></div>
              <p className="text-gray-400 text-sm">{t('doctor.grades.synchronizing_register')}</p>
            </div>
          ) : !selectedCourseId ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ShieldAlert className="w-10 h-10 text-gray-300 dark:text-white/10 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('doctor.grades.sync_pending')}</h3>
              <p className="text-sm text-gray-400">{t('doctor.grades.sync_pending_desc')}</p>
            </div>
          ) : filteredGrades.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ShieldAlert className="w-10 h-10 text-gray-300 dark:text-white/10 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('doctor.grades.no_records')}</h3>
              <p className="text-sm text-gray-400">{t('doctor.grades.no_records_desc')}</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-gray-400 text-xs">
                  <th className="px-5 py-3 text-start font-medium">{t('doctor.grades.student_identity')}</th>
                  <th className="px-5 py-3 text-center font-medium">{t('doctor.grades.section')}</th>
                  <th className="px-5 py-3 text-center font-medium">{t('doctor.grades.midterm')} /20</th>
                  <th className="px-5 py-3 text-center font-medium">{t('doctor.grades.practical')} /10</th>
                  <th className="px-5 py-3 text-center font-medium">{t('doctor.grades.oral')} /10</th>
                  <th className="px-5 py-3 text-center font-medium">{t('doctor.grades.points')}</th>
                  <th className="px-5 py-3 text-end font-medium">{t('doctor.grades.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredGrades.map((g) => {
                  const isEditing = editingEnrollmentId === g.enrollment_id;

                  return (
                    <tr key={g.enrollment_id || g.student_id} className={`border-t border-gray-100 dark:border-white/5 ${isEditing ? 'bg-[#059669]/5' : 'hover:bg-gray-50 dark:hover:bg-white/[0.02]'}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#059669]/10 flex items-center justify-center font-semibold text-[#059669] text-sm">
                            {g.student_name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{g.student_name}</div>
                            <div className="text-xs text-gray-400">{t('doctor.grades.id_prefix')} {g.student_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="text-xs text-gray-500 bg-white dark:bg-black/20 px-3 py-1 rounded-lg border border-gray-100 dark:border-white/5">
                          {g.section || '—'}
                        </span>
                      </td>
                      {isEditing ? (
                        <>
                          {['midterm_score', 'practical_score', 'oral_score'].map((field, idx) => (
                            <td key={field} className="px-5 py-4 text-center">
                              <input
                                type="number" min="0" max={idx === 0 ? 20 : 10} step="0.5"
                                className="w-20 bg-white dark:bg-black border border-[#059669]/40 rounded-lg py-2 px-3 text-center text-sm font-medium text-gray-900 dark:text-white outline-none"
                                value={editValues[field]}
                                onChange={(e) => setEditValues({ ...editValues, [field]: e.target.value })}
                                autoFocus={idx === 0}
                              />
                            </td>
                          ))}
                          <td className="px-5 py-4 text-center">
                            <span className="text-base font-semibold text-gray-900 dark:text-white">
                              {g.total_score !== null ? g.total_score : '—'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-end">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => handleSaveGrade(g.enrollment_id)} disabled={saving} className="w-9 h-9 bg-[#059669] text-white rounded-lg flex items-center justify-center hover:bg-[#047857] transition-all">
                                {saving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
                              </button>
                              <button onClick={handleCancelEdit} disabled={saving} className="w-9 h-9 bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-rose-500 rounded-lg flex items-center justify-center transition-all">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-5 py-4 text-center">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {g.midterm_score !== null ? g.midterm_score : '—'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {g.practical_score !== null ? g.practical_score : '—'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {g.oral_score !== null ? g.oral_score : '—'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className={`text-sm font-semibold px-3 py-1 rounded-lg ${
                              (g.total_score || 0) >= 30 ? 'bg-emerald-500/10 text-emerald-600' :
                              (g.total_score || 0) < 20 && g.total_score !== null ? 'bg-rose-500/10 text-rose-600' :
                              'bg-gray-100 dark:bg-black/20 text-gray-900 dark:text-white'
                            }`}>
                              {g.total_score !== null ? g.total_score : 0}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-end">
                            <button onClick={() => handleEditClick(g)} className="w-9 h-9 rounded-lg bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-[#059669] hover:border-[#059669]/30 transition-all">
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
    </div>
  );
};

export default TAGradesView;
