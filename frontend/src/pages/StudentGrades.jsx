import React, { useEffect } from 'react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useStudentData } from '../context/StudentDataContext';
import { useNavigate } from 'react-router-dom';
import { BarChart3, TrendingUp, CheckCircle2, BookOpen, Target, Award, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';

const StudentGrades = () => {
  const { student, logout } = useStudentAuth();
  const { gradesData, loadingGrades } = useStudentData();
  const navigate = useNavigate();

  const grades = gradesData.grades;
  const summary = gradesData.summary;
  const loading = loadingGrades;

  useEffect(() => {
    if (!student) {
      navigate('/student/login');
    }
  }, [student, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/student/login');
    toast.success('Logged out successfully');
  };

  const getGradeColor = (score, maxScore) => {
    if (score === null || score === undefined) return 'text-gray-500';
    const percentage = (score / maxScore) * 100;
    if (percentage >= 50) return 'text-emerald-600 dark:text-emerald-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  const formatScore = (score) => {
    if (score === null || score === undefined) return '-';
    const num = Number(score);
    return Number.isInteger(num) ? num : num.toFixed(1).replace(/\.0$/, '');
  };

  const getCourseStatus = (grade) => {
    const midtermExists = grade.midterm_score !== null && grade.midterm_score !== undefined;
    const practicalExists = grade.practical_score !== null && grade.practical_score !== undefined;
    const oralExists = grade.oral_score !== null && grade.oral_score !== undefined;
    const total = (grade.midterm_score || 0) + (grade.practical_score || 0) + (grade.oral_score || 0);
    if (midtermExists && practicalExists && oralExists) {
      const percentage = (total / grade.max_score) * 100;
      return percentage >= 50 ? 'Passing' : 'Failing';
    }
    return 'Pending';
  };

  const getStatusUI = (status) => {
    if (status === 'Passing') return {
      bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400',
      glow: 'from-emerald-500/20', icon: <CheckCircle2 className="w-4 h-4" />
    };
    if (status === 'Failing') return {
      bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-600 dark:text-rose-400',
      glow: 'from-rose-500/20', icon: <AlertCircle className="w-4 h-4" />
    };
    return {
      bg: 'bg-gray-100 dark:bg-white/5', border: 'border-gray-200 dark:border-white/10', text: 'text-gray-500 dark:text-gray-400',
      glow: 'from-gray-500/10', icon: <TrendingUp className="w-4 h-4" />
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-500 overflow-hidden relative">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400 font-bold text-xs tracking-wide">Loading Grades...</p>
        </div>
      </div>
    );
  }

  // Circular Gauge Component for Overall Percentage
  const PercentageGauge = ({ percentage }) => {
    const radius = 80;
    const circumference = Math.PI * radius; // Semi-circle
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative flex flex-col items-center justify-center h-48 overflow-hidden">
        <svg viewBox="0 0 200 120" className="w-64 h-auto overflow-visible">
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            stroke="currentColor" strokeWidth="16" strokeLinecap="round" fill="transparent"
            className="text-gray-100 dark:text-white/5"
          />
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            stroke="url(#gradient)" strokeWidth="16" strokeLinecap="round" fill="transparent"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1500 ease-out"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute bottom-6 flex flex-col items-center">
          <span className="text-5xl font-black text-gray-900 dark:text-white drop-shadow-sm">{percentage}%</span>
          <span className="text-xs font-bold text-primary uppercase tracking-widest mt-1">Overall</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white font-sans transition-colors duration-500 relative overflow-hidden">
      {/* Background Ambient Orbs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 dark:bg-primary/10 blur-[150px] rounded-full mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 dark:bg-blue-500/10 blur-[150px] rounded-full mix-blend-multiply dark:mix-blend-screen"></div>
      </div>

      <Sidebar activePage="grades" onLogout={handleLogout} />

      <div className="md:ml-64 pb-24 md:pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

          <div className="flex items-center gap-4 mb-2">
            <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-2xl border border-primary/20 shadow-sm">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">Academic Performance</h1>
              <p className="text-gray-500 dark:text-gray-400 font-semibold mt-1">Detailed breakdown of your grades and standing.</p>
            </div>
          </div>

          {/* BENTO GRID ANALYTICS HEADER */}
          {summary && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Massive Gauge Card (Spans 2 columns on lg) */}
              <div className="lg:col-span-2 relative overflow-hidden bg-white/80 dark:bg-[#111]/80 backdrop-blur-2xl rounded-[2rem] border border-gray-200 dark:border-white/10 p-8 shadow-sm dark:shadow-xl flex flex-col justify-center items-center group">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                <div className="w-full flex justify-between items-start absolute top-8 px-8">
                  <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" /> Current Standing
                  </h2>
                  <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-500/20">
                    Active Term
                  </div>
                </div>

                <div className="mt-12 w-full max-w-md">
                  <PercentageGauge percentage={summary.overallPercentage || 0} />
                </div>
              </div>

              {/* Smaller Stat Widgets (Stacked) */}
              <div className="flex flex-col gap-6">
                <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-2xl rounded-[2rem] border border-gray-200 dark:border-white/10 p-6 shadow-sm hover:border-primary/30 transition-colors flex items-center gap-5 group">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 dark:bg-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
                    <Award className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Score</p>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                      {formatScore(summary.totalEarned || 0)}
                      <span className="text-sm text-gray-400 font-semibold ml-1">/ {formatScore(summary.totalPossible || 0)}</span>
                    </h3>
                  </div>
                </div>

                <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-2xl rounded-[2rem] border border-gray-200 dark:border-white/10 p-6 shadow-sm hover:border-emerald-500/30 transition-colors flex items-center gap-5 group">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 dark:bg-white/5 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform shadow-inner">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Passed</p>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                      {summary.coursesPassed || 0} <span className="text-sm text-gray-400 font-semibold ml-1">courses</span>
                    </h3>
                  </div>
                </div>

                <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-2xl rounded-[2rem] border border-gray-200 dark:border-white/10 p-6 shadow-sm hover:border-blue-500/30 transition-colors flex items-center gap-5 group">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 dark:bg-white/5 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform shadow-inner">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Enrolled</p>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                      {summary.totalCourses || grades.length} <span className="text-sm text-gray-400 font-semibold ml-1">total</span>
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* COURSES GRID */}
          <div className="mt-12">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Course Breakdown</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {grades.length === 0 ? (
                <div className="col-span-full py-20 bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-[2rem] border-2 border-dashed border-gray-300 dark:border-white/10 text-center shadow-sm">
                  <p className="text-gray-500 dark:text-gray-400 text-xl font-bold">No enrolled courses found.</p>
                </div>
              ) : (
                grades.map((grade, idx) => {
                  const total = (grade.midterm_score || 0) + (grade.practical_score || 0) + (grade.oral_score || 0);
                  const status = getCourseStatus(grade);
                  const ui = getStatusUI(status);

                  return (
                    <div key={idx} className="relative overflow-hidden group bg-white/90 dark:bg-[#111]/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2rem] p-6 sm:p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 flex flex-col">
                      {/* Dynamic Background Glow */}
                      <div className={`absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br ${ui.glow} to-transparent opacity-20 dark:opacity-40 rounded-full blur-[60px] group-hover:opacity-50 transition-opacity pointer-events-none`}></div>

                      <div className="relative z-10 flex-1">
                        <div className="flex justify-between items-start gap-4 mb-6">
                          <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight flex-1">{grade.course_name}</h3>
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${ui.bg} ${ui.border} ${ui.text} shrink-0`}>
                            {ui.icon}
                            <span className="text-xs font-black uppercase tracking-widest">{status}</span>
                          </div>
                        </div>

                        {/* Embossed Inner Scores Grid */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                          <div className="bg-gray-100/50 dark:bg-black/30 border border-gray-200/50 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center shadow-inner group-hover:bg-white dark:group-hover:bg-white/5 transition-colors">
                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Mid</span>
                            <span className={`text-xl font-black ${getGradeColor(grade.midterm_score, grade.midterm_max)}`}>
                              {formatScore(grade.midterm_score)}
                            </span>
                          </div>
                          <div className="bg-gray-100/50 dark:bg-black/30 border border-gray-200/50 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center shadow-inner group-hover:bg-white dark:group-hover:bg-white/5 transition-colors">
                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Prac</span>
                            <span className={`text-xl font-black ${getGradeColor(grade.practical_score, grade.practical_max)}`}>
                              {formatScore(grade.practical_score)}
                            </span>
                          </div>
                          <div className="bg-gray-100/50 dark:bg-black/30 border border-gray-200/50 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center shadow-inner group-hover:bg-white dark:group-hover:bg-white/5 transition-colors">
                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Oral</span>
                            <span className={`text-xl font-black ${getGradeColor(grade.oral_score, grade.oral_max)}`}>
                              {formatScore(grade.oral_score)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer: Total Score */}
                      <div className="relative z-10 pt-5 border-t border-gray-100 dark:border-white/10 flex justify-between items-center mt-auto">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Total Score</span>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-3xl font-black ${getGradeColor(total, grade.max_score)}`}>
                            {formatScore(total)}
                          </span>
                          <span className="text-gray-400 dark:text-gray-500 font-bold text-sm">/ {grade.max_score}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentGrades;