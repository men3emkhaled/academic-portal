import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useStudentData } from '../context/StudentDataContext';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, CheckCircle2, 
  ArrowRight, Layers, ChevronDown, ExternalLink, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';

const StudentGrades = () => {
  const { student, logout } = useStudentAuth();
  const { gradesData, loadingGrades } = useStudentData();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const isAr = i18n.language === 'ar';
  const allGrades = gradesData.grades || [];
  const loading = loadingGrades;

  const [selectedSemester, setSelectedSemester] = useState(null);
  const [activeDetailGrade, setActiveDetailGrade] = useState(null);

  const availableSemesters = useMemo(() => {
    // Use semester from the course data (always present even if no grades yet)
    const sems = allGrades
      .map(g => g.semester)
      .filter(s => s !== null && s !== undefined);
    return [...new Set(sems)].sort((a, b) => Number(a) - Number(b));
  }, [allGrades]);

  useEffect(() => {
    if (availableSemesters.length > 0 && selectedSemester === null) {
      setSelectedSemester(availableSemesters[0]);
    }
  }, [availableSemesters, selectedSemester]);

  const grades = useMemo(() => {
    if (selectedSemester === null) return allGrades;
    return allGrades.filter(g => Number(g.semester) === Number(selectedSemester));
  }, [allGrades, selectedSemester]);

  const summary = useMemo(() => {
    let totalEarned = 0;
    let totalPossible = 0;
    let coursesPassed = 0;
    
    grades.forEach(grade => {
      const midterm = parseFloat(grade.midterm_score) || 0;
      const practical = parseFloat(grade.practical_score) || 0;
      const oral = parseFloat(grade.oral_score) || 0;
      
      const earned = midterm + practical + oral;
      totalPossible += grade.max_score;
      totalEarned += earned;
      
      const allExist = (grade.midterm_score !== null && grade.midterm_score !== undefined) &&
                       (grade.practical_score !== null && grade.practical_score !== undefined);
      
      if (allExist) {
        const percentage = (earned / grade.max_score) * 100;
        if (percentage >= 50) coursesPassed++;
      }
    });
    
    const overallPercentage = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
    
    return {
      totalEarned,
      totalPossible,
      overallPercentage,
      coursesPassed,
      totalCourses: grades.length
    };
  }, [grades]);

  useEffect(() => {
    if (!student) navigate('/student/login');
  }, [student, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/student/login');
    toast.success(`${t('sidebar.logout')} ${t('auth.success')}`);
  };

  const getGradeColor = (score, maxScore) => {
    if (score === null || score === undefined) return 'text-gray-400';
    const percentage = (score / maxScore) * 100;
    if (percentage >= 50) return 'text-[#059669] dark:text-[#34d399]';
    return 'text-rose-500';
  };

  const formatScore = (score) => {
    if (score === null || score === undefined) return '-';
    const num = Number(score);
    return Number.isInteger(num) ? num : num.toFixed(1).replace(/\.0$/, '');
  };

  const getCourseStatus = (grade) => {
    const midterm = parseFloat(grade.midterm_score) || 0;
    const practical = parseFloat(grade.practical_score) || 0;
    const oral = parseFloat(grade.oral_score) || 0;
    const total = midterm + practical + oral;
    const percentage = (total / grade.max_score) * 100;
    if (grade.midterm_score !== null && grade.practical_score !== null) {
        return percentage >= 50 ? t('grades.passing') : t('grades.failing');
    }
    return t('grades.pending');
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-white dark:bg-[#0c0c14]">
        <div className="w-12 h-12 border-2 border-gray-200 dark:border-white/10 border-t-[#34d399] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c14] text-gray-900 dark:text-white font-sans transition-colors duration-500 overflow-x-hidden relative" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] inset-inline-end-[-5%] w-[50vw] h-[50vw] bg-[#059669]/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] inset-inline-start-[-5%] w-[40vw] h-[40vw] bg-[#34d399]/3 blur-[100px] rounded-full"></div>
      </div>

      <Sidebar onLogout={handleLogout} />

      <main className="md:ps-72 min-h-screen relative z-10 flex flex-col">
        
        {/* HERO SECTION */}
          <section className="px-6 lg:px-10 pt-14 md:pt-16 pb-12 max-w-[1500px] mx-auto w-full space-y-4 md:space-y-12">
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 md:gap-10">
            <div className="space-y-4">
               <h1 className={`text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-[0.95] tracking-tighter uppercase text-gray-900 dark:text-white ${isAr ? 'font-arabic' : ''}`}>
                  {t('grades.title')}
              </h1>
            </div>
          </div>
 
          {/* SEMESTER TABS / SELECT */}
          {availableSemesters.length > 0 && (
            <>
              {/* Desktop view tabs */}
              <div className="hidden md:flex items-center gap-1 bg-white dark:bg-white/5 p-1 md:p-1.5 rounded-xl md:rounded-[1.8rem] md:border md:border-gray-100 md:dark:border-white/5 self-start">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-2 md:px-3 shrink-0">
                  {t('grades.semester_label')}
                </span>
                {availableSemesters.map((sem) => {
                  const isSel = selectedSemester === sem;
                  return (
                    <button
                      key={sem}
                      onClick={() => setSelectedSemester(sem)}
                      className={`px-2.5 md:px-5 py-1.5 md:py-2.5 rounded-lg md:rounded-[1.2rem] text-[10px] font-black tracking-widest transition-all ${
                        isSel
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-sm'
                          : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {t('grades.semester_value', { num: sem })}
                    </button>
                  );
                })}
              </div>

              {/* Mobile view select dropdown */}
              <div className="block md:hidden relative w-full max-w-xs self-start">
                <select
                  value={selectedSemester || ''}
                  onChange={(e) => setSelectedSemester(Number(e.target.value))}
                  className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl ps-4 pe-10 py-2.5 text-xs font-black uppercase tracking-wider text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#34d399]/20 appearance-none cursor-pointer"
                >
                  {availableSemesters.map((sem) => (
                    <option key={sem} value={sem} className="bg-white dark:bg-[#0c0c14] text-black dark:text-white">
                      {t('grades.semester_value', { num: sem })}
                    </option>
                  ))}
                </select>
                <div className={`absolute inset-y-0 ${isAr ? 'left-3' : 'right-3'} flex items-center pointer-events-none text-gray-400`}>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </>
          )}
 
          {/* MAIN BENTO GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
            
             <div className="order-2 lg:order-1 lg:col-span-12 bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-2xl md:rounded-[3rem] p-6 md:p-12 flex flex-col md:flex-row justify-between gap-6 md:gap-12 group md:hover:shadow-2xl shadow-sm transition-all duration-700">
                <div className="hidden md:block space-y-6 flex-1">
                   <p className={`text-3xl font-black leading-tight tracking-tight ${isAr ? 'font-arabic' : ''}`}>
                     {t('grades.desc')}
                   </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-6 md:gap-10 md:w-1/2 md:border-s md:border-gray-100 md:dark:border-white/5 md:ps-12">
                   <div className="space-y-1 flex flex-col justify-center">
                      <span className="text-2xl md:text-4xl font-black text-[#059669] dark:text-[#34d399] leading-none">{summary.totalEarned || 0}</span>
                      <p className="text-[9px] md:text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-white/30">
                        {t('grades.earned_points')}
                      </p>
                   </div>
                   <div className="space-y-1 flex flex-col justify-center">
                      <span className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white leading-none">{summary.coursesPassed || 0}</span>
                      <p className="text-[9px] md:text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-white/30">
                        {t('grades.passed')}
                      </p>
                   </div>
                   <div className="space-y-1 flex flex-col justify-center">
                      <span className="text-2xl md:text-4xl font-black text-[#059669] dark:text-[#34d399] leading-none">{summary.totalPossible || 0}</span>
                      <p className="text-[9px] md:text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-white/30">
                        {t('grades.max_score')}
                      </p>
                   </div>
                   <div className="space-y-1 flex flex-col justify-center">
                      <span className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white leading-none">{grades.length}</span>
                      <p className="text-[9px] md:text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-white/30">
                        {t('grades.enrolled')}
                      </p>
                   </div>
                </div>
             </div>
 
            {/* GRADES MATRIX */}
            <div className="order-1 lg:order-3 lg:col-span-12 space-y-8">
               <div className="flex items-center justify-between px-2">
                  <div className="flex flex-col">
                    <h2 className={`text-3xl font-black uppercase tracking-tight ${isAr ? 'font-arabic' : ''}`}>
                      {t('grades.breakdown')}
                    </h2>
                  </div>
                  <div className="bg-[#059669]/10 dark:bg-[#34d399]/10 px-6 py-2 rounded-2xl text-[#059669] dark:text-[#34d399] text-xs font-black uppercase tracking-widest">
                     {grades.length} {t('grades.courses')}
                  </div>
               </div>

               {/* Desktop Grid Layout */}
               <div className="hidden md:grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-8">
                  {grades.map((grade, idx) => {
                     const total = (grade.midterm_score || 0) + (grade.practical_score || 0) + (grade.oral_score || 0);
                     const status = getCourseStatus(grade);
                     const isPassing = status === t('grades.passing');

                     return (
                       <div 
                         key={grade?.course_id || idx}
                         className="group md:bg-white md:dark:bg-[#0d0d14] border-b md:border border-gray-100 dark:border-white/5 md:rounded-[2.5rem] p-3 md:p-6 sm:md:p-8 space-y-2 md:space-y-6 md:hover:border-[#059669] md:dark:hover:border-[#34d399] md:transition-all md:duration-700 md:hover:-translate-y-1.5 md:hover:shadow-2xl md:shadow-sm relative overflow-hidden"
                       >
                         <div className="hidden md:block absolute top-0 inset-x-0 h-0.5 bg-[#059669]/40 dark:bg-[#34d399]/40" />

                         <div className="flex items-center md:items-start justify-between gap-2 md:gap-4">
                           <h3 className={`text-sm md:text-lg sm:md:text-xl font-bold md:font-black leading-tight uppercase tracking-tight md:tracking-tighter flex-1 ${isAr ? 'font-arabic' : ''}`}>
                             {grade.course_name}
                           </h3>
                           <div className={`px-2 md:px-3 py-0.5 md:py-1.5 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest border transition-all shrink-0 ${isPassing ? 'bg-[#059669]/10 border-[#059669]/20 text-[#059669] dark:text-[#34d399]' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                             {status}
                           </div>
                         </div>

                         <div className="grid grid-cols-3 gap-1 md:gap-3 md:border-t md:border-black/5 md:dark:border-white/5 md:pt-6">
                           <div className="flex items-center md:flex-col gap-1.5 md:gap-0">
                             <span className="text-[9px] md:text-[11px] font-bold md:font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-gray-400 md:mb-1.5">{t('grades.midterm')}</span>
                             <span className={`text-sm md:text-xl font-bold md:font-black ${getGradeColor(grade.midterm_score, grade.midterm_max)}`}>{formatScore(grade.midterm_score)}</span>
                           </div>
                           <div className="flex items-center md:flex-col gap-1.5 md:gap-0">
                             <span className="text-[9px] md:text-[11px] font-bold md:font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-gray-400 md:mb-1.5">{t('grades.practical')}</span>
                             <span className={`text-sm md:text-xl font-bold md:font-black ${getGradeColor(grade.practical_score, grade.practical_max)}`}>{formatScore(grade.practical_score)}</span>
                           </div>
                           <div className="flex items-center md:flex-col gap-1.5 md:gap-0">
                             <span className="text-[9px] md:text-[11px] font-bold md:font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-gray-400 md:mb-1.5">{t('grades.oral')}</span>
                             <span className={`text-sm md:text-xl font-bold md:font-black ${getGradeColor(grade.oral_score, grade.oral_max)}`}>{formatScore(grade.oral_score)}</span>
                           </div>
                         </div>

                         <div className="hidden md:flex items-center justify-between bg-gray-50 dark:bg-white/5 rounded-2xl p-4 sm:p-5 group-hover:bg-gray-100 dark:group-hover:bg-white/10 transition-colors">
                           <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('grades.total_score')}</span>
                           <div className="flex items-baseline gap-1">
                             <span className={`text-xl sm:text-2xl font-black ${getGradeColor(total, grade.max_score)}`}>{formatScore(total)}</span>
                             <span className="text-xs font-black opacity-30">/ {grade.max_score}</span>
                           </div>
                         </div>
                       </div>
                     );
                  })}
               </div>

               {/* Mobile Table Layout */}
               <div className="block md:hidden border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-[#0e0e16] shadow-sm">
                 <table className="w-full text-start border-collapse">
                   <thead>
                     <tr className="bg-[#132d6c] text-white">
                       <th className={`px-4 py-3 text-xs font-black uppercase tracking-wider text-start ${isAr ? 'text-right' : 'text-left'}`}>
                          {t('grades.subject_col')}
                        </th>
                        <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-center w-24">
                          {t('grades.grade_col')}
                        </th>
                        <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-center w-28">
                          {t('grades.action_col')}
                       </th>
                     </tr>
                   </thead>
                   <tbody>
                     {grades.map((grade, idx) => {
                       const total = (grade.midterm_score || 0) + (grade.practical_score || 0) + (grade.oral_score || 0);
                       const percentage = grade.max_score > 0 ? Math.round((total / grade.max_score) * 100) : 0;
                       
                       return (
                         <tr key={grade?.course_id || idx} className="border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                           <td className={`px-4 py-4 text-xs font-bold text-gray-900 dark:text-white text-start leading-snug ${isAr ? 'text-right' : 'text-left'}`}>
                             {grade.course_name}
                           </td>
                           <td className="px-4 py-4 text-center">
                             <div className="inline-flex w-10 h-10 rounded-full border-2 border-emerald-500 dark:border-emerald-400 flex items-center justify-center font-black text-[11px] text-[#059669] dark:text-[#34d399] bg-transparent">
                               {percentage}%
                             </div>
                           </td>
                           <td className="px-4 py-4 text-center">
                             <button
                               onClick={() => setActiveDetailGrade(grade)}
                               className="inline-flex items-center justify-center gap-1.5 bg-[#059669] dark:bg-[#34d399] hover:opacity-90 active:scale-95 text-white dark:text-black rounded-lg px-3 py-2 text-[10px] font-black tracking-wider uppercase transition-all shadow-sm"
                             >
                               <ExternalLink className="w-3.5 h-3.5" />
                               {t('grades.details_btn')}
                             </button>
                           </td>
                         </tr>
                       );
                     })}
                   </tbody>
                 </table>
                  </div>
               </div>
            </div>

          </section>
        </main>

       {/* Grade Details Modal */}
      {activeDetailGrade && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 dark:bg-black/85 backdrop-blur-sm" 
            onClick={() => setActiveDetailGrade(null)} 
          />
          
          <div className="relative w-full max-w-md bg-white dark:bg-[#0e0e16] border border-gray-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="h-2 bg-gradient-to-r from-[#059669] to-[#34d399]"></div>
            
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#059669] dark:text-[#34d399]">
                    {t('grades.details_title')}
                  </span>
                  <h3 className={`text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase leading-tight ${isAr ? 'font-arabic' : ''}`}>
                    {activeDetailGrade.course_name}
                  </h3>
                </div>
                <button 
                  onClick={() => setActiveDetailGrade(null)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3.5 text-start">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl">
                  <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                    {t('grades.midterm')}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-base font-black ${getGradeColor(activeDetailGrade.midterm_score, activeDetailGrade.midterm_max)}`}>
                      {formatScore(activeDetailGrade.midterm_score)}
                    </span>
                    <span className="text-xs font-bold opacity-30">/ {activeDetailGrade.midterm_max}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl">
                  <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                    {t('grades.practical')}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-base font-black ${getGradeColor(activeDetailGrade.practical_score, activeDetailGrade.practical_max)}`}>
                      {formatScore(activeDetailGrade.practical_score)}
                    </span>
                    <span className="text-xs font-bold opacity-30">/ {activeDetailGrade.practical_max}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl">
                  <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                    {t('grades.oral')}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-base font-black ${getGradeColor(activeDetailGrade.oral_score, activeDetailGrade.oral_max)}`}>
                      {formatScore(activeDetailGrade.oral_score)}
                    </span>
                    <span className="text-xs font-bold opacity-30">/ {activeDetailGrade.oral_max}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-emerald-500/5 dark:bg-emerald-400/5 border border-emerald-500/10 dark:border-emerald-400/10 rounded-2xl mt-4">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-[#34d399]">
                    {t('grades.total_score')}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-lg font-black ${getGradeColor(
                      (activeDetailGrade.midterm_score || 0) + (activeDetailGrade.practical_score || 0) + (activeDetailGrade.oral_score || 0),
                      activeDetailGrade.max_score
                    )}`}>
                      {formatScore((activeDetailGrade.midterm_score || 0) + (activeDetailGrade.practical_score || 0) + (activeDetailGrade.oral_score || 0))}
                    </span>
                    <span className="text-xs font-bold opacity-30">/ {activeDetailGrade.max_score}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setActiveDetailGrade(null)}
                className="w-full py-3.5 bg-gray-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-wider text-[11px] rounded-2xl hover:opacity-95 active:scale-[0.99] transition-all shadow-sm"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentGrades;