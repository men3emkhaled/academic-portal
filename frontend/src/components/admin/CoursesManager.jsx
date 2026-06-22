import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
  BookOpen, Plus, Edit3, Trash2, 
  Layers, CheckCircle, Tag, AlignLeft, X
} from 'lucide-react';

const CoursesManager = ({ departments }) => {
  const { t, i18n } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    semester: '1',
    credits: '3',
    department_id: '',
    description: ''
  });

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/courses?clear=true');
      setCourses(res.data);
    } catch (error) {
      toast.error(t('admin.messages.load_courses_failed'));
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCourses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingCourse) {
        await api.put(`/courses/${editingCourse.id}`, formData);
        toast.success(t('common.success'));
      } else {
        await api.post('/courses', formData);
        toast.success(t('common.success'));
      }
      resetForm();
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.messages.operation_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(t('admin.courses.delete_confirm', { name }))) return;
    try {
      await api.delete(`/courses/${id}`);
      toast.success(t('common.success'));
      fetchCourses();
    } catch (error) {
      toast.error(t('admin.messages.delete_course_failed'));
    }
  };

  const editCourse = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      code: course.code,
      semester: course.semester?.toString() || '1',
      credits: course.credits?.toString() || '3',
      department_id: course.department_id || '',
      description: course.description || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingCourse(null);
    setFormData({
      name: '',
      code: '',
      semester: '1',
      credits: '3',
      department_id: '',
      description: ''
    });
  };

  const isAr = i18n.language === 'ar';

  return (
    <div className="space-y-6 pb-10 max-w-[1400px] mx-auto w-full text-start px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.courses.title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {courses.length} {t('admin.courses.validated_modules')}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('admin.courses.add_course')}
        </button>
      </div>

      {/* Courses Grouped by Department → Semester */}
      {(() => {
        const deptMap = new Map();
        courses.forEach(course => {
          const deptKey = course.department_name || t('admin.courses.shared_dept');
          const sem = course.semester ?? 1;
          if (!deptMap.has(deptKey)) deptMap.set(deptKey, new Map());
          const semMap = deptMap.get(deptKey);
          if (!semMap.has(sem)) semMap.set(sem, []);
          semMap.get(sem).push(course);
        });

        if (courses.length === 0) {
          return (
            <div className="py-20 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-400">{t('admin.courses.no_courses')}</p>
            </div>
          );
        }

        return (
          <div className="space-y-8">
            {[...deptMap.entries()].map(([deptName, semMap]) => (
              <div key={deptName} className="space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="w-1 h-8 bg-[#059669] rounded-full" />
                  <div>
                    <p className="text-xs text-gray-400">{t('admin.courses.department_label')}</p>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {deptName}
                    </h2>
                  </div>
                  <span className="ml-auto text-xs text-gray-400">
                    {t('admin.courses.module_count', { count: [...semMap.values()].flat().length })}
                  </span>
                </div>

                <div className="space-y-4 pl-4 border-l-2 border-gray-100 dark:border-gray-800">
                  {[...semMap.entries()].sort(([a],[b]) => a - b).map(([sem, semCourses]) => (
                    <div key={sem} className="space-y-3">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300">
                        {t('admin.courses.semester_badge', { num: sem })}
                        <span className="text-gray-400">· {t('admin.courses.course_count', { count: semCourses.length })}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {semCourses.map((course) => (
                          <div
                            key={course.id}
                            className="bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex justify-between items-start mb-3">
                                <div className="w-10 h-10 bg-[#059669]/10 rounded-lg flex items-center justify-center">
                                  <Tag className="w-5 h-5 text-[#059669]" />
                                </div>
                                <div className="flex gap-1.5">
                                  <button onClick={(e) => { e.stopPropagation(); editCourse(course); }} className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-[#059669] hover:border-[#059669] hover:text-white transition-colors">
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); handleDelete(course.id, course.name); }} className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-red-500 hover:border-red-500 hover:text-white transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              <span className="text-xs text-gray-400">{course.code || '—'}</span>
                              <h3 className="text-base font-semibold text-gray-900 dark:text-white mt-1 line-clamp-2">
                                {course.name}
                              </h3>
                              <div className="flex flex-wrap gap-2 mt-3">
                                <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs text-gray-500">
                                  {t('admin.courses.sem_badge', { num: course.semester })}
                                </span>
                                <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs text-gray-500">
                                  {t('admin.courses.crd_badge', { count: course.credit_hours || course.credits || 3 })}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={resetForm} className="absolute inset-0 bg-black/40" />
          <div className="bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#059669]/10 rounded-lg flex items-center justify-center text-[#059669]">
                  {editingCourse ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {editingCourse ? t('admin.courses.edit_course') : t('admin.courses.add_new_course')}
                  </h3>
                  <p className="text-xs text-gray-400">{t('admin.courses.form_hint')}</p>
                </div>
              </div>
              <button onClick={resetForm} className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500">{t('admin.courses.course_name')} *</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none" placeholder={t('admin.courses.placeholder_name')} required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500">{t('admin.courses.course_code')} *</label>
                    <input type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none uppercase" placeholder={t('admin.courses.placeholder_code')} required />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-500">{t('admin.courses.semester')}</label>
                      <input type="number" value={formData.semester} onChange={e => setFormData({ ...formData, semester: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none" min="1" max="12" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-500">{t('admin.courses.credit_hours')}</label>
                      <input type="number" value={formData.credits} onChange={e => setFormData({ ...formData, credits: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none" min="1" max="10" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500">{t('admin.doctors.department')}</label>
                    <select value={formData.department_id} onChange={e => setFormData({ ...formData, department_id: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none">
                      <option value="">{t('admin.students.no_dept')}</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">{t('admin.courses.description_label')}</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none resize-none min-h-[80px]" placeholder={t('admin.courses.description_placeholder')} />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button type="submit" disabled={loading} className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {loading ? t('admin.courses.saving') : (editingCourse ? t('common.save') : t('admin.courses.add_course'))}
                </button>
                <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors">
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesManager;
