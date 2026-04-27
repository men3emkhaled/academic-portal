import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  BarChart3, Upload, Building2, BookOpen, 
  Award, FileSpreadsheet, Activity, CheckCircle, 
  AlertCircle, ChevronRight, Hash, Database
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
      toast.error('Source matrix and target course required');
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
      toast.success(`Successfully indexed ${res.data.count} score units`);
      setGradesFile(null);
      setSelectedCourseId('');
      document.getElementById('gradesFileInput').value = '';

      setTimeout(() => {
        setStep(0);
        setUploadingGrades(false);
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Matrix ingestion failure');
      setStep(0);
      setUploadingGrades(false);
    }
  };

  const handleClearGrades = async () => {
    if (!selectedCourseId) {
      toast.error('Please select a course to clear grades for');
      return;
    }
    
    const courseName = courses.find(c => c.id == selectedCourseId)?.name || 'the selected course';
    
    if (!window.confirm(`Are you sure you want to clear ALL ${selectedExamType} grades for ${courseName}? This action cannot be undone.`)) {
      return;
    }
    
    setUploadingGrades(true);
    try {
      const res = await api.delete(`/grades/admin/clear-course-grades?courseId=${selectedCourseId}&examType=${selectedExamType}`);
      toast.success(res.data.message || 'Cleared grades successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to clear grades');
    } finally {
      setUploadingGrades(false);
    }
  };

  const getStepText = () => {
    switch (step) {
      case 1: return 'STREAMING_UPLOADS';
      case 2: return 'PARSING_LOGIC_MATRIX';
      case 3: return 'COMMITTING_TO_LEDGER';
      case 4: return 'TRANSACTION_COMPLETE';
      default: return '';
    }
  };

  return (
    <div className="animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-2 h-10 bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)]"></div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-orange-500 dark:text-orange-400" /> Grade Ingestion
            </h2>
            <p className="text-gray-500 dark:text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Bulk Assessment Architecture</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
            <div className="admin-card relative overflow-hidden group transition-colors">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[80px] rounded-full group-hover:bg-orange-500/10 transition-all duration-700"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-orange-500/10 dark:bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500/20 dark:border-orange-500/30">
                            <Database className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Node Configuration</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4 flex items-center gap-2">
                                    <Building2 className="w-3 h-3" /> Target Department
                                </label>
                                <select
                                    value={selectedDepartmentId}
                                    onChange={(e) => {
                                        setSelectedDepartmentId(e.target.value);
                                        setSelectedCourseId('');
                                    }}
                                    className="admin-input appearance-none"
                                    disabled={uploadingGrades}
                                >
                                    <option value="">-- Sector Link --</option>
                                    {departments.map((d) => (
                                        <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4 flex items-center gap-2">
                                    <BookOpen className="w-3 h-3" /> Core Course
                                </label>
                                <select
                                    value={selectedCourseId}
                                    onChange={(e) => setSelectedCourseId(e.target.value)}
                                    className={`admin-input appearance-none transition-all ${!selectedDepartmentId ? 'opacity-30 cursor-not-allowed' : ''}`}
                                    disabled={uploadingGrades || !selectedDepartmentId}
                                >
                                    <option value="">-- Module Link --</option>
                                    {filteredCourses.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name} (T{c.semester})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest ml-4 flex items-center gap-2">
                                    <Award className="w-3 h-3" /> Event Type
                                </label>
                                <select
                                    value={selectedExamType}
                                    onChange={(e) => setSelectedExamType(e.target.value)}
                                    className="admin-input appearance-none"
                                    disabled={uploadingGrades}
                                >
                                    <option value="midterm">MIDTERM_EVALUATION</option>
                                    <option value="practical">PRACTICAL_ASSESSMENT</option>
                                    <option value="oral">ORAL_EXAMINATION</option>
                                </select>
                            </div>

                            <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl p-5 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-1">Matrix Schema</p>
                                    <p className="text-xs font-bold text-gray-700 dark:text-slate-600 tracking-tight">ID, NAME, SCORE</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleUploadGrades} className="space-y-6 border-t border-gray-100 dark:border-white/5 pt-8">
                        <div className="flex flex-col sm:flex-row gap-6 items-center">
                            <label className={`relative flex-1 flex items-center justify-center gap-3 cursor-pointer bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-white/5 border-dashed rounded-3xl p-6 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all group ${uploadingGrades ? 'opacity-50 pointer-events-none' : ''}`}>
                                <FileSpreadsheet className="w-6 h-6 text-gray-400 dark:text-slate-500 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors" />
                                <span className="text-gray-700 dark:text-slate-300 font-black uppercase text-xs tracking-widest truncate max-w-[250px]">
                                    {gradesFile ? gradesFile.name : 'Select Matrix Source'}
                                </span>
                                <input id="gradesFileInput" type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setGradesFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" disabled={uploadingGrades} />
                            </label>

                            <div className="flex flex-col gap-3 w-full sm:w-auto">
                                <button
                                    type="submit"
                                    disabled={uploadingGrades || !selectedCourseId || !gradesFile}
                                    className="px-12 admin-btn-primary h-[50px] font-black uppercase tracking-widest"
                                >
                                    {uploadingGrades ? <Activity className="w-6 h-6 animate-spin mx-auto" /> : 'INITIATE SYNC'}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleClearGrades}
                                    disabled={uploadingGrades || !selectedCourseId}
                                    className="px-12 h-[50px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl hover:bg-red-500/20 hover:text-red-700 dark:hover:text-red-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Clear Grades
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#111111]/40 border border-gray-200 dark:border-white/5 rounded-[2.5rem] p-10 h-full flex flex-col justify-center items-center relative overflow-hidden text-center group transition-colors shadow-sm dark:shadow-2xl">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/20 to-transparent"></div>
                 
                 {!uploadingGrades && step === 0 ? (
                     <div className="animate-fadeIn">
                        <BarChart3 className="w-20 h-20 text-gray-200 dark:text-slate-800 mb-8 mx-auto" />
                        <h4 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.4em] mb-4">Ingestion Engine</h4>
                        <p className="text-xs font-bold text-gray-500 dark:text-slate-600 leading-relaxed">System ready for assessment matrix synchronization. Please configure node parameters.</p>
                     </div>
                 ) : (
                     <div className="w-full space-y-10 animate-fadeIn">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full border-4 border-gray-100 dark:border-white/5 border-t-orange-500 animate-spin mx-auto"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                {step === 4 ? <CheckCircle className="w-12 h-12 text-emerald-500 dark:text-emerald-400" /> : <Activity className="w-10 h-10 text-orange-500 dark:text-orange-400 animate-pulse" />}
                            </div>
                        </div>

                        <div>
                            <h4 className={`text-sm font-black uppercase tracking-[0.2em] mb-4 transition-colors ${step === 4 ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400'}`}>
                                {getStepText()}
                            </h4>
                            <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-2 overflow-hidden border border-gray-200 dark:border-white/5">
                                <div 
                                    className={`h-full transition-all duration-700 rounded-full ${step === 4 ? 'bg-emerald-500' : 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]'}`} 
                                    style={{ width: `${(step / 4) * 100}%` }} 
                                />
                            </div>
                        </div>

                        {step === 4 && (
                            <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-500/60 uppercase tracking-widest animate-bounce">Ledger Overwrite Successful</p>
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