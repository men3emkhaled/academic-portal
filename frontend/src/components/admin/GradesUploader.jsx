import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { 
  BarChart3, Building2, BookOpen, 
  Award, FileSpreadsheet, Activity, CheckCircle, 
  AlertCircle, Settings, UploadCloud, Trash2,
  ChevronRight, Database, Search, FileText, Zap, Info
} from 'lucide-react';

const GradesUploader = ({ courses = [], departments = [] }) => {
  const { t, i18n } = useTranslation();
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

  return (
    <div className="space-y-8 lg:space-y-10 animate-in fade-in duration-700">
      {/* Header Bento Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-start">
        <div className="lg:col-span-2 flex items-center gap-6 bg-white/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 p-8 rounded-[2.5rem] shadow-sm">
          <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner group transition-transform duration-500 hover:scale-110">
            <BarChart3 className="w-8 h-8 text-primary dark:text-primary" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {t('admin.grades.title')}
            </h2>
            <p className="text-gray-500 dark:text-slate-500 text-sm font-bold mt-1 uppercase tracking-widest">{t('admin.grades.description')}</p>
          </div>
        </div>
        
        <div className="bg-primary text-white p-8 rounded-[2.5rem] shadow-lg shadow-primary/20 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-inline-end-0 top-0 w-32 h-32 bg-white/10 hidden rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-black/10 px-3 py-1 rounded-full">{t('admin.grades.status.node')}</span>
          </div>
          <div className="mt-4 relative z-10">
            <p className="text-4xl font-black uppercase tracking-tighter">SYNC</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">{t('admin.grades.status.access')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        
        {/* Left Column: Settings & File Upload */}
        <div className="xl:col-span-2 space-y-8">
            <div className="bg-white/50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-[3rem] p-8 lg:p-12 shadow-sm relative overflow-hidden group">
                <div className="absolute -inset-inline-start-20 -top-20 w-80 h-80 bg-primary/5 rounded-full hidden pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>

                <div className="relative z-10 space-y-10">
                    <div className="flex items-center gap-4 mb-2 text-start">
                        <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center border border-gray-100 dark:border-white/10 shadow-sm">
                            <Settings className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">{t('admin.grades.settings.title')}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Selections */}
                        <div className="space-y-6 text-start">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Building2 className="w-4 h-4" /> {t('admin.grades.settings.dept_label')}
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedDepartmentId}
                                        onChange={(e) => {
                                            setSelectedDepartmentId(e.target.value);
                                            setSelectedCourseId('');
                                        }}
                                        className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner appearance-none uppercase tracking-widest text-[11px]"
                                        disabled={uploadingGrades}
                                    >
                                        <option value="">{t('admin.grades.settings.dept_placeholder')}</option>
                                        {departments.map((d) => (
                                            <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                                        ))}
                                    </select>
                                    <ChevronRight className={`absolute inset-inline-end-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 rotate-90 ${i18n.language === 'ar' ? '-rotate-90' : ''}`} />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" /> {t('admin.grades.settings.course_label')}
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedCourseId}
                                        onChange={(e) => setSelectedCourseId(e.target.value)}
                                        className={`w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner appearance-none uppercase tracking-widest text-[11px] ${!selectedDepartmentId ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={uploadingGrades || !selectedDepartmentId}
                                    >
                                        <option value="">{t('admin.grades.settings.course_placeholder')}</option>
                                        {filteredCourses.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name} (Term {c.semester})</option>
                                        ))}
                                    </select>
                                    <ChevronRight className={`absolute inset-inline-end-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 rotate-90 ${i18n.language === 'ar' ? '-rotate-90' : ''}`} />
                                </div>
                            </div>
                        </div>

                        {/* Exam Type & Info */}
                        <div className="space-y-6 text-start">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Award className="w-4 h-4" /> {t('admin.grades.settings.exam_type_label')}
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedExamType}
                                        onChange={(e) => setSelectedExamType(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-white/[0.02] text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4.5 font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner appearance-none uppercase tracking-widest text-[11px]"
                                        disabled={uploadingGrades}
                                    >
                                        <option value="midterm">{t('admin.grades.exam_types.midterm')}</option>
                                        <option value="practical">{t('admin.grades.exam_types.practical')}</option>
                                        <option value="oral">{t('admin.grades.exam_types.oral')}</option>
                                    </select>
                                    <ChevronRight className={`absolute inset-inline-end-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 rotate-90 ${i18n.language === 'ar' ? '-rotate-90' : ''}`} />
                                </div>
                            </div>

                            <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-6 flex items-start gap-4 shadow-inner group-hover:bg-primary/10 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                                    <Info className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Schema Protocol</p>
                                    <p className="text-xs font-bold text-gray-600 dark:text-slate-400 leading-relaxed">{t('admin.grades.settings.file_format_hint')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleUploadGrades} className="space-y-8 border-t border-gray-100 dark:border-white/5 pt-10">
                        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
                            {/* File Upload Area */}
                            <label className={`relative flex-1 flex flex-col items-center justify-center gap-5 cursor-pointer bg-white/30 dark:bg-white/[0.01] border-2 border-gray-100 dark:border-white/5 border-dashed rounded-[2.5rem] p-10 hover:border-primary/40 hover:bg-primary/5 transition-all group/label shadow-inner overflow-hidden text-center ${uploadingGrades ? 'opacity-50 pointer-events-none' : ''}`}>
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover/label:opacity-100 transition-opacity"></div>
                                <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center group-hover/label:bg-primary/10 group-hover/label:scale-110 transition-all duration-500 shadow-inner relative z-10">
                                    <UploadCloud className="w-8 h-8 text-gray-300 dark:text-slate-700 group-hover/label:text-primary transition-colors" />
                                </div>
                                
                                <span className="text-gray-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] relative z-10">
                                    {gradesFile ? (
                                        <span className="flex flex-col items-center gap-1">
                                            <span className="text-primary font-black truncate max-w-[250px] block">{gradesFile.name}</span>
                                            <span className="text-[9px] text-gray-400 uppercase tracking-widest mt-1 italic">Payload Verified</span>
                                        </span>
                                    ) : t('admin.grades.upload.click_to_upload')}
                                </span>
                                <input id="gradesFileInput" type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setGradesFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" disabled={uploadingGrades} />
                            </label>

                            <div className="flex flex-col gap-5 w-full lg:w-[320px] shrink-0 justify-center">
                                <button
                                    type="submit"
                                    disabled={uploadingGrades || !selectedCourseId || !gradesFile}
                                    className="w-full bg-primary hover:bg-primary text-white font-black py-5 rounded-[2.5rem] shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 group h-[70px]"
                                >
                                    {uploadingGrades ? <Activity className="w-6 h-6 animate-spin" /> : <><CheckCircle className="w-6 h-6 group-hover:scale-110 transition-transform" /> <span className="uppercase tracking-widest text-xs">{t('admin.grades.upload.upload_button')}</span></>}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleClearGrades}
                                    disabled={uploadingGrades || !selectedCourseId}
                                    className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 font-black py-5 rounded-[2.5rem] transition-all disabled:opacity-50 h-[70px] flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]"
                                >
                                    <Trash2 className="w-5 h-5" /> {t('admin.grades.upload.delete_button')}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        {/* Right Column: Status Panel */}
        <div className="xl:col-span-1">
            <div className="bg-white/50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-[3rem] p-10 lg:p-12 h-full flex flex-col justify-center items-center relative overflow-hidden text-center shadow-sm min-h-[400px]">
                 {/* Cinematic Glow */}
                 <div className="absolute top-0 inset-inline-start-0 w-full h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
                 
                 {!uploadingGrades && step === 0 ? (
                     <div className="space-y-8 animate-in fade-in zoom-in duration-700">
                        <div className="w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner border border-gray-100 dark:border-white/5 group hover:border-primary/30 transition-all duration-700 hover:rotate-12">
                            <FileText className="w-10 h-10 text-gray-200 dark:text-slate-800 group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                            <h4 className="text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4">Relay Status</h4>
                            <p className="text-xs font-bold text-gray-400 dark:text-slate-600 leading-relaxed max-w-[220px] mx-auto uppercase tracking-widest italic">{t('admin.grades.status.ready')}</p>
                        </div>
                     </div>
                 ) : (
                     <div className="w-full space-y-10 animate-in fade-in zoom-in duration-500">
                        <div className="relative flex justify-center">
                            {/* Spinning Ring */}
                            <div className="w-32 h-32 rounded-full border-[3px] border-gray-100 dark:border-white/5 border-t-primary animate-spin shadow-2xl"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                {step === 4 ? (
                                    <CheckCircle className="w-12 h-12 text-primary animate-in zoom-in duration-500" />
                                ) : (
                                    <Activity className="w-10 h-10 text-primary animate-pulse" />
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className={`text-xs font-black uppercase tracking-[0.3em] transition-colors duration-500 ${step === 4 ? 'text-primary' : 'text-primary'}`}>
                                {getStepText()}
                            </h4>
                            
                            {/* Premium Progress Bar */}
                            <div className="w-full bg-gray-100 dark:bg-black/40 rounded-full h-3 overflow-hidden border border-gray-100 dark:border-white/10 shadow-inner p-0.5">
                                <div 
                                    className={`h-full rounded-full transition-all duration-700 ${step === 4 ? 'bg-primary shadow-[0_0_15px_rgba(46,204,113,0.4)]' : 'bg-primary shadow-[0_0_20px_rgba(46,204,113,0.4)]'}`} 
                                    style={{ width: `${(step / 4) * 100}%` }}
                                />
                            </div>
                        </div>

                        {step === 4 && (
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] animate-bounce italic">
                                {t('admin.grades.status.save_success')}
                            </p>
                        )}
                     </div>
                 )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default GradesUploader;