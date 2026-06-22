import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
  Building2, BookOpen, Award, FileSpreadsheet, CheckCircle, 
  UploadCloud, Trash2, Info, Upload
} from 'lucide-react';

const GradesUploader = ({ courses = [], departments = [] }) => {
  const { t } = useTranslation();
  const [gradesFile, setGradesFile] = useState(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('midterm');
  const [uploadingGrades, setUploadingGrades] = useState(false);

  const filteredCourses = selectedDepartmentId
    ? courses.filter(c => c.department_id == selectedDepartmentId)
    : [];

  const handleUploadGrades = async (e) => {
    e.preventDefault();
    if (!gradesFile || !selectedCourseId) {
      toast.error(t('admin.messages.fields_req'));
      return;
    }

    const formData = new FormData();
    formData.append('file', gradesFile);
    formData.append('courseId', selectedCourseId);
    formData.append('examType', selectedExamType);

    setUploadingGrades(true);

    try {
      const res = await api.post('/grades/admin/upload-advanced', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(t('admin.grades.upload.success_msg', { count: res.data.count }));
      setGradesFile(null);
      setSelectedCourseId('');
      const fileInput = document.getElementById('gradesFileInput');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.messages.upload_failed'));
    } finally {
      setUploadingGrades(false);
    }
  };

  const handleClearGrades = async () => {
    if (!selectedCourseId) {
      toast.error(t('admin.messages.select_course_req'));
      return;
    }
    
    const courseName = courses.find(c => c.id == selectedCourseId)?.name || t('admin.grades.upload.delete_selected');
    const examTypeLabel = t(`admin.grades.exam_types.${selectedExamType}`);
    
    if (!window.confirm(t('admin.grades.upload.delete_confirm', { type: examTypeLabel, course: courseName }))) {
      return;
    }
    
    setUploadingGrades(true);
    try {
      await api.delete(`/grades/admin/clear-course-grades?courseId=${selectedCourseId}&examType=${selectedExamType}`);
      toast.success(t('common.success'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.messages.delete_failed'));
    } finally {
      setUploadingGrades(false);
    }
  };

  return (
    <div className="space-y-6 pb-10 max-w-[1200px] mx-auto w-full px-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('admin.grades.title')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t('admin.grades.page_access')}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="xl:col-span-2 bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-[#059669]" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t('admin.grades.settings.title')}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">{t('admin.grades.settings.dept_label')}</label>
                  <select value={selectedDepartmentId} onChange={(e) => { setSelectedDepartmentId(e.target.value); setSelectedCourseId(''); }}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none"
                    disabled={uploadingGrades}>
                    <option value="">{t('admin.grades.settings.dept_placeholder')}</option>
                    {departments.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">{t('admin.grades.settings.course_label')}</label>
                  <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}
                    className={`w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none ${!selectedDepartmentId ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={uploadingGrades || !selectedDepartmentId}>
                    <option value="">{t('admin.grades.settings.course_placeholder')}</option>
                    {filteredCourses.map((c) => <option key={c.id} value={c.id}>{c.name} ({t('admin.courses.sem_badge', { num: c.semester })})</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500">{t('admin.grades.settings.exam_type_label')}</label>
                  <select value={selectedExamType} onChange={(e) => setSelectedExamType(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] outline-none"
                    disabled={uploadingGrades}>
                    <option value="midterm">{t('admin.grades.exam_types.midterm')}</option>
                    <option value="practical">{t('admin.grades.exam_types.practical')}</option>
                    <option value="oral">{t('admin.grades.exam_types.oral')}</option>
                  </select>
                </div>
                <div className="flex items-start gap-2 p-3 bg-[#059669]/5 rounded-lg border border-[#059669]/10">
                  <Info className="w-4 h-4 text-[#059669] mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-500">{t('admin.grades.settings.file_format_hint')}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleUploadGrades} className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <label className={`relative flex items-center justify-center gap-3 cursor-pointer bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-[#059669]/40 transition-colors ${uploadingGrades ? 'opacity-50 pointer-events-none' : ''}`}>
                <UploadCloud className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                <span className="text-sm text-gray-500">
                  {gradesFile ? <span className="text-[#059669]">{gradesFile.name}</span> : t('admin.grades.upload.click_to_upload')}
                </span>
                <input id="gradesFileInput" type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setGradesFile(e.target.files[0])} className="hidden" disabled={uploadingGrades} />
              </label>

              <div className="flex gap-3">
                <button type="submit" disabled={uploadingGrades || !selectedCourseId || !gradesFile}
                  className="px-4 py-2 bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  {t('admin.grades.upload.upload_button')}
                </button>
                <button type="button" onClick={handleClearGrades} disabled={uploadingGrades || !selectedCourseId}
                  className="px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-500 text-sm font-medium rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  {t('admin.grades.upload.delete_button')}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Status Panel */}
        <div className="bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center min-h-[200px]">
          {uploadingGrades ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-gray-200 dark:border-gray-700 border-t-[#059669] rounded-full animate-spin" />
              <p className="text-sm text-gray-500">{t('admin.grades.page_relay')}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <FileSpreadsheet className="w-10 h-10 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-400">{t('admin.grades.status.ready')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GradesUploader;
