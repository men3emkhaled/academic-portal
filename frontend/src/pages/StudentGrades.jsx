import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useStudentData } from '../context/StudentDataContext';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, TrendingUp, CheckCircle2, 
  BookOpen, Target, Award, AlertCircle,
  Zap, ArrowRight, Star, Layers, GraduationCap
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
    if (percentage >= 50) return 'text-[#10b981] dark:text-[#2cfc7d]';
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
        <div className="w-12 h-12 border-2 border-gray-200 dark:border-white/10 border-t-[#2cfc7d] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c14] text-gray-900 dark:text-white font-sans transition-colors duration-500 overflow-x-hidden relative" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] inset-inline-end-[-5%] w-[50vw] h-[50vw] bg-[#8b5cf6]/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] inset-inline-start-[-5%] w-[40vw] h-[40vw] bg-[#2cfc7d]/3 blur-[100px] rounded-full"></div>
      </div>

      <Sidebar onLogout={handleLogout} />

      <main className="md:ps-72 min-h-screen relative z-10 flex flex-col">
        
        {/* HERO SECTION */}
        <section className="px-6 lg:px-10 pt-16 pb-12 max-w-[1500px] mx-auto w-full space-y-12">
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2cfc7d]"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30">{t('grades.title')}</span>
              </div>
              <h1 className={`text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-[0.95] tracking-tighter uppercase text-gray-900 dark:text-white ${isAr ? 'font-arabic' : ''}`}>
                {t('mavi.academic')}
              </h1>
            </div>

            <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-10 rounded-[3rem] shadow-xl flex items-center gap-8 group">
               <div className="w-20 h-20 rounded-full bg-[#10b981]/10 dark:bg-[#2cfc7d]/10 flex items-center justify-center text-[#10b981] dark:text-[#2cfc7d] group-hover:scale-110 transition-transform shadow-inner">
                  <Star className="w-10 h-10 fill-current" />
               </div>
               <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30">{t('grades.overall')}</span>
                  <div className="text-5xl font-black tracking-tighter text-gray-900 dark:text-white">{summary.overallPercentage || 0}%</div>
               </div>
            </div>
          </div>
 
          {/* SEMESTER TABS */}
          {availableSemesters.length > 0 && (
            <div className="flex items-center gap-1 bg-white dark:bg-white/5 p-1.5 rounded-[1.8rem] border border-gray-100 dark:border-white/5 self-start">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-3 shrink-0">
                {isAr ? 'الفصل الدراسي:' : 'Semester:'}
              </span>
              {availableSemesters.map((sem) => {
                const isSel = selectedSemester === sem;
                return (
                  <button
                    key={sem}
                    onClick={() => setSelectedSemester(sem)}
                    className={`px-5 py-2.5 rounded-[1.2rem] text-[10px] font-black tracking-widest transition-all ${
                      isSel
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-sm'
                        : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {isAr ? `الترم ${sem}` : `Semester ${sem}`}
                  </button>
                );
              })}
            </div>
          )}
 
          {/* MAIN BENTO GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
            
            {/* Stats Summary Row */}
            <div className="order-2 lg:order-1 lg:col-span-8 bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[3rem] p-12 flex flex-col md:flex-row justify-between gap-12 group hover:shadow-2xl transition-all duration-700">
               <div className="space-y-6 flex-1">
                  <p className={`text-3xl font-black leading-tight tracking-tight ${isAr ? 'font-arabic' : ''}`}>
                    {t('mavi.grades_desc')}
                  </p>
               </div>
               <div className="grid grid-cols-2 gap-10 md:w-1/2 border-t md:border-t-0 md:border-s border-gray-100 dark:border-white/5 pt-10 md:pt-0 md:ps-12">
                  <div className="space-y-1">
                     <span className="text-4xl font-black text-[#10b981] dark:text-[#2cfc7d]">{summary.totalEarned || 0}</span>
                     <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30">{t('grades.total_score')}</p>
                  </div>
                  <div className="space-y-1">
                     <span className="text-4xl font-black text-gray-900 dark:text-white">{summary.coursesPassed || 0}</span>
                     <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30">{t('grades.passed')}</p>
                  </div>
                  <div className="space-y-1">
                     <span className="text-4xl font-black text-[#8b5cf6]">{summary.totalPossible || 0}</span>
                     <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30">{t('mavi.max_potential')}</p>
                  </div>
                  <div className="space-y-1">
                     <span className="text-4xl font-black text-gray-900 dark:text-white">{grades.length}</span>
                     <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/30">{t('grades.enrolled')}</p>
                  </div>
               </div>
            </div>
 
            {/* Insight Card */}
            <div className="order-3 lg:order-2 lg:col-span-4 bg-[#8b5cf6] rounded-[3rem] p-12 text-white flex flex-col justify-between space-y-8 relative overflow-hidden group">
               <div className="absolute top-[-10%] inset-inline-end-[-10%] w-40 h-40 bg-white/10 blur-[40px] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
               <div className="space-y-4 relative z-10">
                  <GraduationCap className="w-10 h-10 mb-4 animate-bounce" />
                  <h3 className="text-2xl font-black uppercase italic leading-none">{isAr ? 'حالة القيد الأكاديمي' : 'Academic Standing'}</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">
                    {isAr ? 'المستوى الدراسي والشعبة المقيد بها الطالب حالياً' : 'Current registered level and section details'}
                  </p>
               </div>
               <div className="flex items-center justify-between relative z-10">
                  <span className="text-[4rem] font-black tracking-tighter leading-none">
                    {isAr ? `مستوى ${student?.level || 1}` : `L${student?.level || 1}`}
                  </span>
                  <div className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center font-black text-lg shadow-2xl">
                    {isAr ? `ش ${student?.section || '—'}` : `S${student?.section || '—'}`}
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
                  <div className="bg-[#10b981]/10 dark:bg-[#2cfc7d]/10 px-6 py-2 rounded-2xl text-[#10b981] dark:text-[#2cfc7d] text-xs font-black uppercase tracking-widest">
                     {grades.length} {t('mavi.total')}
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {grades.map((grade, idx) => {
                    const total = (grade.midterm_score || 0) + (grade.practical_score || 0) + (grade.oral_score || 0);
                    const status = getCourseStatus(grade);
                    const isPassing = status === t('grades.passing');

                    return (
                      <div 
                        key={grade?.course_id || idx}
                        className="group bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[3rem] p-10 space-y-10 hover:border-[#10b981] dark:hover:border-[#2cfc7d] transition-all duration-700 hover:-translate-y-2 hover:shadow-2xl shadow-sm relative overflow-hidden"
                      >
                        <div className="flex justify-between items-start">
                           <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-[#2cfc7d]/10 flex items-center justify-center text-[#10b981] dark:text-[#2cfc7d] group-hover:bg-[#10b981] dark:group-hover:bg-[#2cfc7d] group-hover:text-white dark:group-hover:text-black transition-all duration-500 shadow-inner">
                              <BookOpen className="w-7 h-7" />
                           </div>
                           <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${isPassing ? 'bg-[#10b981]/10 border-[#10b981]/20 text-[#10b981] dark:text-[#2cfc7d]' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                              {status}
                           </div>
                        </div>

                        <div className="space-y-2">
                          <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">{t('mavi.module')} {idx + 1}</span>
                          <h3 className={`text-2xl font-black leading-tight uppercase tracking-tighter ${isAr ? 'font-arabic' : ''}`}>
                            {grade.course_name}
                          </h3>
                        </div>

                        <div className="grid grid-cols-3 gap-4 border-t border-black/5 dark:border-white/5 pt-8">
                           <div className="flex flex-col">
                              <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('grades.midterm')}</span>
                              <span className={`text-lg font-black ${getGradeColor(grade.midterm_score, grade.midterm_max)}`}>{formatScore(grade.midterm_score)}</span>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('grades.practical')}</span>
                              <span className={`text-lg font-black ${getGradeColor(grade.practical_score, grade.practical_max)}`}>{formatScore(grade.practical_score)}</span>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('grades.oral')}</span>
                              <span className={`text-lg font-black ${getGradeColor(grade.oral_score, grade.oral_max)}`}>{formatScore(grade.oral_score)}</span>
                           </div>
                        </div>

                        <div className="flex items-center justify-between bg-gray-50 dark:bg-white/5 rounded-2xl p-6 group-hover:bg-gray-100 dark:group-hover:bg-white/10 transition-colors">
                           <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('grades.total_score')}</span>
                           <div className="flex items-baseline gap-1">
                              <span className={`text-3xl font-black ${getGradeColor(total, grade.max_score)}`}>{formatScore(total)}</span>
                              <span className="text-xs font-black opacity-30">/ {grade.max_score}</span>
                           </div>
                        </div>
                      </div>
                    );
                  })}
               </div>
            </div>

          </div>
        </section>
      </main>


    </div>
  );
};

export default StudentGrades;