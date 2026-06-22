import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTAAuth } from '../../context/TAAuthContext';
import toast from 'react-hot-toast';
import { Users, Search, BookOpen, Award, ShieldAlert, GraduationCap, Activity } from 'lucide-react';

const TAStudents = ({ courses }) => {
  const { t } = useTranslation();
  const { taApi } = useTAAuth();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (selectedCourseId) {
      fetchStudents();
    } else {
      setStudents([]);
    }
  }, [selectedCourseId]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await taApi('get', `/ta/courses/${selectedCourseId}/students`);
      setStudents(res.data);
    } catch (err) {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const name = (s.name || s.student_name || '').toLowerCase();
    const email = (s.email || '').toLowerCase();
    const query = searchTerm.toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="w-5 h-5 text-[#059669]" />
            <span className="text-xs text-gray-400 font-medium">{t('doctor.grades.performance_management')}</span>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Student Registry</h2>
          <p className="text-sm text-gray-500">View and manage enrolled students across courses</p>
        </div>
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

      {/* Students Table */}
      <div className="bg-white dark:bg-[#0c0c0e]/40 border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-white/5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-[#059669]" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Enrolled Students</h3>
            {selectedCourseId && students.length > 0 && (
              <span className="text-xs bg-[#059669]/10 text-[#059669] px-2 py-0.5 rounded-full font-medium">{students.length}</span>
            )}
          </div>
          {selectedCourseId && students.length > 0 && (
            <div className="relative max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
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
              <p className="text-gray-400 text-sm">Loading students...</p>
            </div>
          ) : !selectedCourseId ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ShieldAlert className="w-10 h-10 text-gray-300 dark:text-white/10 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Select a Course</h3>
              <p className="text-sm text-gray-400">Choose a course above to view enrolled students</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Users className="w-10 h-10 text-gray-300 dark:text-white/10 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No Students Found</h3>
              <p className="text-sm text-gray-400">{searchTerm ? 'Try a different search term' : 'No students are enrolled in this course'}</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-gray-400 text-xs">
                  <th className="px-5 py-3 text-start font-medium">Name</th>
                  <th className="px-5 py-3 text-start font-medium">Email</th>
                  <th className="px-5 py-3 text-center font-medium">Section</th>
                  <th className="px-5 py-3 text-center font-medium">Level</th>
                  <th className="px-5 py-3 text-center font-medium">Progress</th>
                  <th className="px-5 py-3 text-center font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, idx) => {
                  const sName = student.name || student.student_name || 'Unknown';
                  const sEmail = student.email || student.student_email || '—';
                  const sSection = student.section || '—';
                  const sLevel = student.level || student.year || '—';
                  const sProgress = student.progress !== undefined ? student.progress : null;
                  const sStatus = student.status || student.enrollment_status || 'active';

                  return (
                    <tr key={student.id || idx} className="border-t border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#059669]/10 flex items-center justify-center font-semibold text-[#059669] text-sm">
                            {sName.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{sName}</div>
                            <div className="text-xs text-gray-400">#{student.id || student.student_id || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{sEmail}</span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="text-xs text-gray-500 bg-white dark:bg-black/20 px-3 py-1 rounded-lg border border-gray-100 dark:border-white/5">
                          {sSection}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="text-sm text-gray-900 dark:text-white">{sLevel}</span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        {sProgress !== null ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-20 bg-gray-100 dark:bg-white/5 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#059669] transition-all"
                                style={{ width: `${Math.min(sProgress, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{sProgress}%</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          sStatus === 'active'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : sStatus === 'inactive'
                            ? 'bg-gray-100 dark:bg-white/5 text-gray-500'
                            : sStatus === 'suspended'
                            ? 'bg-rose-500/10 text-rose-600'
                            : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            sStatus === 'active'
                              ? 'bg-emerald-500'
                              : sStatus === 'inactive'
                              ? 'bg-gray-400'
                              : sStatus === 'suspended'
                              ? 'bg-rose-500'
                              : 'bg-amber-500'
                          }`}></span>
                          {sStatus.charAt(0).toUpperCase() + sStatus.slice(1)}
                        </span>
                      </td>
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

export default TAStudents;
