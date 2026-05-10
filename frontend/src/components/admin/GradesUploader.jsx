import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  BarChart3, Building2, BookOpen, 
  Award, FileSpreadsheet, Activity, CheckCircle, 
  AlertCircle, Settings, UploadCloud, Trash2
} from 'lucide-react';

const GradesUploader = ({ courses, departments }) => {
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
      // Fake delays for smooth UI transitions
      await new Promise(resolve => setTimeout(resolve, 600));
      setStep(2);
      await new Promise(resolve => setTimeout(resolve, 800));
      setStep(3);

      const res = await api.post('/grades/admin/upload-advanced', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setStep(4);
      toast.success(`Successfully uploaded ${res.data.count} student grades`);
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
    
    if (!window.confirm(`Are you sure you want to delete ALL ${selectedExamType} grades for ${courseName}? This action cannot be undone.`)) {
      return;
    }
    
    setUploadingGrades(true);
    try {
      const res = await api.delete(`/grades/admin/clear-course-grades?courseId=${selectedCourseId}&examType=${selectedExamType}`);
      toast.success(res.data.message || 'Grades deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete grades');
    } finally {
      setUploadingGrades(false);
    }
  };

  const getStepText = () => {
    switch (step) {
      case 1: return 'Reading File...';
      case 2: return 'Processing Grades...';
      case 3: return 'Saving to Database...';
      case 4: return 'Upload Complete';
      default: return '';
    }
  };

  return (
    <div className="animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-500/10 dark:bg-orange-500/20 rounded-2xl flex items-center justify-center border border-orange-500/20 shadow-inner">
            <BarChart3 className="w-7 h-7 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Upload Grades
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold mt-1">Upload student grades from an Excel or CSV file</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Settings & File Upload */}
        <div className="xl:col-span-2 space-y-6">
            <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
                
                {/* Subtle Background Glow */}
                <div className="absolute -left-20 -top-20 w-64 h-64 bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-[60px] pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-orange-500/10 dark:bg-orange-500/20 rounded-[1.2rem] flex items-center justify-center border border-orange-500/20 shadow-inner">
                            <Settings className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Settings</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        {/* Course Selection */}
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 flex items-center gap-2">
                                    <Building2 className="w-4 h-4" /> Select Department
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedDepartmentId}
                                        onChange={(e) => {
                                            setSelectedDepartmentId(e.target.value);
                                            setSelectedCourseId('');
                                        }}
                                        className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3.5 font-semibold focus:ring-2 focus:ring-orange-500/50 outline-none transition-all shadow-inner appearance-none"
                                        disabled={uploadingGrades}
                                    >
                                        <option value="">-- Choose Department --</option>
                                        {departments.map((d) => (
                                            <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-4 pointer-events-none text-gray-400">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 flex items-center gap-2">
                                    <BookOpen className="w-4 h-4" /> Select Course
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedCourseId}
                                        onChange={(e) => setSelectedCourseId(e.target.value)}
                                        className={`w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3.5 font-semibold focus:ring-2 focus:ring-orange-500/50 outline-none transition-all shadow-inner appearance-none ${!selectedDepartmentId ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={uploadingGrades || !selectedDepartmentId}
                                    >
                                        <option value="">-- Choose Course --</option>
                                        {filteredCourses.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name} (Term {c.semester})</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-4 pointer-events-none text-gray-400">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Exam Type & Schema */}
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 flex items-center gap-2">
                                    <Award className="w-4 h-4" /> Exam Type
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedExamType}
                                        onChange={(e) => setSelectedExamType(e.target.value)}
                                        className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3.5 font-semibold focus:ring-2 focus:ring-orange-500/50 outline-none transition-all shadow-inner appearance-none"
                                        disabled={uploadingGrades}
                                    >
                                        <option value="midterm">Midterm</option>
                                        <option value="practical">Practical</option>
                                        <option value="oral">Oral</option>
                                    </select>
                                    <div className="absolute right-4 top-4 pointer-events-none text-gray-400">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-orange-50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/10 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-orange-800 dark:text-orange-300 uppercase tracking-widest mb-1">File Format</p>
                                    <p className="text-sm font-bold text-orange-700 dark:text-orange-400/80">Columns: ID, Name, Score</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleUploadGrades} className="space-y-6 border-t border-gray-100 dark:border-white/10 pt-8">
                        <div className="flex flex-col sm:flex-row gap-6 items-stretch">
                            {/* File Upload Area */}
                            <label className={`relative flex-1 flex flex-col items-center justify-center gap-3 cursor-pointer bg-gray-50/50 dark:bg-black/40 border-2 border-gray-200 dark:border-white/10 border-dashed rounded-[2rem] p-8 hover:border-orange-500/50 hover:bg-orange-50 dark:hover:bg-orange-500/5 transition-all group ${uploadingGrades ? 'opacity-50 pointer-events-none' : ''}`}>
                                <div className="w-14 h-14 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center group-hover:bg-orange-100 dark:group-hover:bg-orange-500/20 group-hover:scale-110 transition-all shadow-inner">
                                    <UploadCloud className="w-6 h-6 text-gray-400 dark:text-gray-500 group-hover:text-orange-500 transition-colors" />
                                </div>
                                
                                <span className="text-gray-700 dark:text-gray-300 font-bold text-center">
                                    {gradesFile ? (
                                        <span className="flex flex-col items-center gap-1">
                                            <span className="text-orange-600 dark:text-orange-400 font-black truncate max-w-[200px] block">{gradesFile.name}</span>
                                            <span className="text-xs text-gray-500">File ready</span>
                                        </span>
                                    ) : 'Click to select Excel / CSV file'}
                                </span>
                                <input id="gradesFileInput" type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setGradesFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" disabled={uploadingGrades} />
                            </label>

                            <div className="flex flex-col gap-4 w-full sm:w-auto shrink-0 justify-center">
                                <button
                                    type="submit"
                                    disabled={uploadingGrades || !selectedCourseId || !gradesFile}
                                    className="px-10 bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-2xl shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 h-[60px]"
                                >
                                    {uploadingGrades ? <Activity className="w-6 h-6 animate-spin mx-auto" /> : 'Upload Grades'}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleClearGrades}
                                    disabled={uploadingGrades || !selectedCourseId}
                                    className="px-10 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-500 font-bold py-4 rounded-2xl transition-all disabled:opacity-50 h-[60px] flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete All Grades
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        {/* Right Column: Status Panel */}
        <div className="xl:col-span-1">
            <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-10 h-full flex flex-col justify-center items-center relative overflow-hidden text-center shadow-sm">
                 {/* Decorative Top Line */}
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50"></div>
                 
                 {!uploadingGrades && step === 0 ? (
                     <div className="animate-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <FileSpreadsheet className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                        </div>
                        <h4 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">Upload Status</h4>
                        <p className="text-sm font-bold text-gray-400 dark:text-gray-500 leading-relaxed max-w-[200px] mx-auto">Ready to upload. Please select a department, course, and file.</p>
                     </div>
                 ) : (
                     <div className="w-full space-y-8 animate-in fade-in duration-500">
                        <div className="relative flex justify-center">
                            {/* Spinning Ring */}
                            <div className="w-28 h-28 rounded-full border-[3px] border-gray-100 dark:border-white/5 border-t-orange-500 animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                {step === 4 ? (
                                    <CheckCircle className="w-10 h-10 text-emerald-500 animate-in zoom-in duration-300" />
                                ) : (
                                    <Activity className="w-8 h-8 text-orange-500 animate-pulse" />
                                )}
                            </div>
                        </div>

                        <div>
                            <h4 className={`text-sm font-black uppercase tracking-wider mb-4 transition-colors duration-500 ${step === 4 ? 'text-emerald-500' : 'text-orange-500'}`}>
                                {getStepText()}
                            </h4>
                            
                            {/* Progress Bar */}
                            <div className="w-full bg-gray-100 dark:bg-black/50 rounded-full h-2.5 overflow-hidden border border-gray-200 dark:border-white/10 shadow-inner">
                                <div 
                                    className={`h-full transition-all duration-700 ease-out rounded-full ${step === 4 ? 'bg-emerald-500' : 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]'}`} 
                                    style={{ width: `${(step / 4) * 100}%` }} 
                                />
                            </div>
                        </div>

                        {step === 4 && (
                            <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest animate-bounce">Grades saved successfully</p>
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