import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Building2, BookOpen, Award, Activity, CheckCircle,
  Settings, UploadCloud, Trash2, Database, FileText, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageContainer, PageHeader, SectionCard, StatCard, FormField } from '@/components/common';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const GradesUploader = ({ courses = [], departments = [] }) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [gradesFile, setGradesFile] = useState(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('midterm');
  const [uploadingGrades, setUploadingGrades] = useState(false);
  const [step, setStep] = useState(0);

  const filteredCourses = selectedDepartmentId
    ? courses.filter(c => c.department_id == selectedDepartmentId)
    : [];

  const handleUploadGrades = async (e) => {
    e.preventDefault();
    if (!gradesFile || !selectedCourseId) {
      toast.error('Please select a course and an Excel/CSV file');
      return;
    }

    const formData = new FormData();
    formData.append('file', gradesFile);
    formData.append('courseId', selectedCourseId);
    formData.append('examType', selectedExamType);

    setUploadingGrades(true);
    setStep(1);

    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      setStep(2);
      await new Promise(resolve => setTimeout(resolve, 800));
      setStep(3);

      const res = await api.post('/grades/admin/upload-advanced', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setStep(4);
      toast.success(t('admin.grades.upload.success_msg', { count: res.data.count }));
      setGradesFile(null);
      setSelectedCourseId('');
      const fileInput = document.getElementById('gradesFileInput');
      if (fileInput) fileInput.value = '';

      setTimeout(() => {
        setStep(0);
        setUploadingGrades(false);
      }, 2500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload grades');
      setStep(0);
      setUploadingGrades(false);
    }
  };

  const handleClearGrades = async () => {
    if (!selectedCourseId) {
      toast.error('Please select a course first');
      return;
    }

    const courseName = courses.find(c => c.id == selectedCourseId)?.name || 'the selected course';
    const examTypeLabel = t(`admin.grades.exam_types.${selectedExamType}`);

    if (!window.confirm(t('admin.grades.upload.delete_confirm', { type: examTypeLabel, course: courseName }))) {
      return;
    }

    setUploadingGrades(true);
    try {
      await api.delete(`/grades/admin/clear-course-grades?courseId=${selectedCourseId}&examType=${selectedExamType}`);
      toast.success(t('common.success'));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete grades');
    } finally {
      setUploadingGrades(false);
    }
  };

  const getStepText = () => {
    switch (step) {
      case 1: return t('admin.grades.status.step1');
      case 2: return t('admin.grades.status.step2');
      case 3: return t('admin.grades.status.step3');
      case 4: return t('admin.grades.status.step4');
      default: return '';
    }
  };

  const dir = isAr ? 'rtl' : 'ltr';
  const active = uploadingGrades || step > 0;

  return (
    <PageContainer>
      <PageHeader
        icon={Database}
        title={t('admin.grades.title')}
        description={t('admin.grades.settings.file_format_hint')}
        actions={
          <StatCard
            label={t('admin.grades.status.node')}
            value="SYNC"
            icon={Database}
            hint={t('admin.grades.status.access')}
            accent
            className="min-w-[180px]"
          />
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left: settings + file upload */}
        <div className="space-y-6 xl:col-span-2">
          <SectionCard
            header={
              <header className="flex items-center gap-3 border-b border-border px-4 py-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                  <Settings className="size-4" />
                </span>
                <h2 className={cn('text-sm font-medium text-foreground', isAr && 'font-arabic')}>
                  {t('admin.grades.settings.title')}
                </h2>
              </header>
            }
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Department */}
              <FormField
                htmlFor="grades-dept"
                label={
                  <span className="flex items-center gap-2">
                    <Building2 className="size-4 text-muted-foreground" />
                    {t('admin.grades.settings.dept_label')}
                  </span>
                }
              >
                <Select
                  value={selectedDepartmentId}
                  onValueChange={(val) => { setSelectedDepartmentId(val); setSelectedCourseId(''); }}
                  disabled={uploadingGrades}
                  dir={dir}
                >
                  <SelectTrigger id="grades-dept" className="w-full" dir={dir}>
                    <SelectValue placeholder={t('admin.grades.settings.dept_placeholder')} />
                  </SelectTrigger>
                  <SelectContent dir={dir}>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)} className={isAr ? 'font-arabic' : ''}>
                        {d.name} ({d.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              {/* Course */}
              <FormField
                htmlFor="grades-course"
                label={
                  <span className="flex items-center gap-2">
                    <BookOpen className="size-4 text-muted-foreground" />
                    {t('admin.grades.settings.course_label')}
                  </span>
                }
              >
                <Select
                  value={selectedCourseId}
                  onValueChange={setSelectedCourseId}
                  disabled={uploadingGrades || !selectedDepartmentId}
                  dir={dir}
                >
                  <SelectTrigger id="grades-course" className="w-full" dir={dir}>
                    <SelectValue placeholder={t('admin.grades.settings.course_placeholder')} />
                  </SelectTrigger>
                  <SelectContent dir={dir}>
                    {filteredCourses.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)} className={isAr ? 'font-arabic' : ''}>
                        {c.name} (Term {c.semester})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              {/* Exam type */}
              <FormField
                htmlFor="grades-exam-type"
                label={
                  <span className="flex items-center gap-2">
                    <Award className="size-4 text-muted-foreground" />
                    {t('admin.grades.settings.exam_type_label')}
                  </span>
                }
              >
                <Select
                  value={selectedExamType}
                  onValueChange={setSelectedExamType}
                  disabled={uploadingGrades}
                  dir={dir}
                >
                  <SelectTrigger id="grades-exam-type" className="w-full" dir={dir}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir={dir}>
                    <SelectItem value="midterm" className={isAr ? 'font-arabic' : ''}>{t('admin.grades.exam_types.midterm')}</SelectItem>
                    <SelectItem value="practical" className={isAr ? 'font-arabic' : ''}>{t('admin.grades.exam_types.practical')}</SelectItem>
                    <SelectItem value="oral" className={isAr ? 'font-arabic' : ''}>{t('admin.grades.exam_types.oral')}</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              {/* Format hint */}
              <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-card text-muted-foreground">
                  <Info className="size-4" />
                </span>
                <p className={cn('text-xs leading-relaxed text-muted-foreground', isAr && 'font-arabic')}>
                  {t('admin.grades.settings.file_format_hint')}
                </p>
              </div>
            </div>

            {/* File upload + actions */}
            <form onSubmit={handleUploadGrades} className="mt-4 space-y-4 border-t border-border pt-4">
              <label
                className={cn(
                  'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center transition-colors hover:border-primary/40 hover:bg-muted/50',
                  uploadingGrades && 'pointer-events-none opacity-50'
                )}
              >
                <span className="flex size-12 items-center justify-center rounded-lg border bg-card text-muted-foreground">
                  <UploadCloud className="size-5" />
                </span>
                {gradesFile ? (
                  <span className="flex flex-col items-center gap-1">
                    <span className="block max-w-[280px] truncate text-sm font-medium text-primary">{gradesFile.name}</span>
                    <span className="text-xs text-muted-foreground">{t('admin.grades.status.access')}</span>
                  </span>
                ) : (
                  <span className={cn('text-sm font-medium text-muted-foreground', isAr && 'font-arabic')}>
                    {t('admin.grades.upload.click_to_upload')}
                  </span>
                )}
                <input
                  id="gradesFileInput"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setGradesFile(e.target.files[0])}
                  className="sr-only"
                  disabled={uploadingGrades}
                />
              </label>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="submit"
                  size="lg"
                  disabled={uploadingGrades || !selectedCourseId || !gradesFile}
                  className="flex-1"
                >
                  {uploadingGrades ? (
                    <Activity className="size-4 animate-spin" />
                  ) : (
                    <CheckCircle className="size-4" />
                  )}
                  <span className={isAr ? 'font-arabic' : ''}>{t('admin.grades.upload.upload_button')}</span>
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  size="lg"
                  onClick={handleClearGrades}
                  disabled={uploadingGrades || !selectedCourseId}
                  className="sm:w-auto"
                >
                  <Trash2 className="size-4" />
                  <span className={isAr ? 'font-arabic' : ''}>{t('admin.grades.upload.delete_button')}</span>
                </Button>
              </div>
            </form>
          </SectionCard>
        </div>

        {/* Right: status panel */}
        <SectionCard
          title={t('admin.grades.status.node')}
          bodyClassName="flex min-h-[280px] flex-col items-center justify-center text-center"
        >
          <AnimatePresence mode="wait">
            {!active ? (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center gap-4"
              >
                <span className="flex size-14 items-center justify-center rounded-xl border bg-muted text-muted-foreground">
                  <FileText className="size-6" />
                </span>
                <p className={cn('max-w-[220px] text-sm text-muted-foreground', isAr && 'font-arabic')}>
                  {t('admin.grades.status.ready')}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full space-y-5"
              >
                <span
                  className={cn(
                    'mx-auto flex size-14 items-center justify-center rounded-xl border',
                    step === 4 ? 'border-primary/20 bg-primary/10 text-primary' : 'border-border bg-muted text-muted-foreground'
                  )}
                >
                  {step === 4 ? (
                    <CheckCircle className="size-6" />
                  ) : (
                    <Activity className="size-6 animate-spin" />
                  )}
                </span>

                <div className="space-y-3">
                  <p className={cn('text-sm font-medium', step === 4 ? 'text-primary' : 'text-foreground', isAr && 'font-arabic')}>
                    {getStepText()}
                  </p>

                  {/* Quiet inline progress */}
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${(step / 4) * 100}%` }}
                    />
                  </div>
                </div>

                {step === 4 && (
                  <p className={cn('text-xs text-primary', isAr && 'font-arabic')}>
                    {t('admin.grades.status.save_success')}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </SectionCard>
      </div>
    </PageContainer>
  );
};

export default GradesUploader;
