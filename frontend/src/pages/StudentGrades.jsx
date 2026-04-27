import React, { useEffect } from 'react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useStudentData } from '../context/StudentDataContext';
import { useNavigate } from 'react-router-dom';
import { BarChart3, TrendingUp, CheckCircle2, BookOpen } from 'lucide-react';
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
    if (percentage >= 50) return 'text-[#22c55e] dark:text-[#4ade80]';
    return 'text-[#ef4444] dark:text-[#f87171]';
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

  const getStatusColor = (status) => {
    if (status === 'Passing') return 'bg-green-100 dark:bg-green-400/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-400/30';
    if (status === 'Failing') return 'bg-red-100 dark:bg-red-400/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-400/30';
    return 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-inner';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark text-gray-900 dark:text-white font-body transition-colors duration-300">
        <Sidebar onLogout={handleLogout} />
        <div className="md:ml-64 flex justify-center items-center h-screen">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark text-gray-900 dark:text-white font-body transition-colors duration-300">
      <Sidebar activePage="grades" onLogout={handleLogout} />

      <div className="md:ml-64 pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-10">
            <h1 className="font-headline text-4xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-white/70 leading-none mb-2">
              My Grades
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">All enrolled courses</p>
          </div>

          {/* Stats Cards */}
          {summary && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-white/5 rounded-xl p-6 relative overflow-hidden group shadow-sm dark:shadow-none">
                <div className="absolute top-0 right-0 p-3 opacity-10 dark:opacity-20 group-hover:opacity-100 transition-opacity">
                  <BarChart3 className="w-12 h-12 text-primary" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-widest mb-2">Total Score</p>
                <h3 className="text-3xl font-headline font-bold text-primary">
                  {formatScore(summary.totalEarned || 0)}
                  <span className="text-lg text-gray-400 dark:text-gray-500">/{formatScore(summary.totalPossible || 0)}</span>
                </h3>
              </div>

              <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-white/5 rounded-xl p-6 relative overflow-hidden group shadow-sm dark:shadow-none">
                <div className="absolute top-0 right-0 p-3 opacity-10 dark:opacity-20 group-hover:opacity-100 transition-opacity">
                  <TrendingUp className="w-12 h-12 text-secondary" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-widest mb-2">Overall %</p>
                <h3 className="text-3xl font-headline font-bold text-secondary">{summary.overallPercentage || 0}%</h3>
                <div className="mt-2 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${summary.overallPercentage || 0}%` }} />
                </div>
              </div>

              <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-white/5 rounded-xl p-6 relative overflow-hidden group shadow-sm dark:shadow-none">
                <div className="absolute top-0 right-0 p-3 opacity-10 dark:opacity-20 group-hover:opacity-100 transition-opacity">
                  <CheckCircle2 className="w-12 h-12 text-tertiary" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-widest mb-2">Courses Passed</p>
                <h3 className="text-3xl font-headline font-bold text-tertiary">{summary.coursesPassed || 0}<span className="text-lg text-gray-400 dark:text-gray-500">/{summary.totalCourses || grades.length}</span></h3>
              </div>

              <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-white/5 rounded-xl p-6 relative overflow-hidden group shadow-sm dark:shadow-none">
                <div className="absolute top-0 right-0 p-3 opacity-5 dark:opacity-20 group-hover:opacity-20 dark:group-hover:opacity-100 transition-opacity text-gray-900 dark:text-white">
                  <BookOpen className="w-12 h-12" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-widest mb-2">Total Courses</p>
                <h3 className="text-3xl font-headline font-bold text-gray-900 dark:text-white">{summary.totalCourses || grades.length}</h3>
              </div>
            </div>
          )}

          {/* Grades Section - Card Layout */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline font-bold text-2xl tracking-tight flex items-center gap-3">
                <span className="w-2 h-8 bg-primary rounded-full"></span>
                Your Grades
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {grades.length === 0 ? (
                <div className="col-span-full text-center py-16 bg-white dark:bg-white/5 rounded-3xl border border-dashed border-gray-300 dark:border-gray-600 shadow-sm dark:shadow-none">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">No enrolled courses found.</p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">You are not enrolled in any courses yet.</p>
                </div>
              ) : (
                grades.map((grade, idx) => {
                  const total = (grade.midterm_score || 0) + (grade.practical_score || 0) + (grade.oral_score || 0);
                  const status = getCourseStatus(grade);
                  const statusColor = getStatusColor(status);
                  
                  return (
                    <div key={idx} className="relative overflow-hidden group bg-white dark:bg-dark-card border border-gray-200 dark:border-white/5 rounded-[1.5rem] p-6 hover:border-primary/40 dark:hover:border-primary/40 hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(46,204,113,0.15)] dark:hover:shadow-[0_12px_40px_rgba(142,255,113,0.15)] transition-all duration-500 shadow-sm dark:shadow-none">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] dark:from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                      <div className="flex justify-between items-start mb-5 relative">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className="font-headline font-bold text-lg leading-tight text-gray-900 dark:text-white">{grade.course_name}</h4>
                          </div>
                          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Course</span>
                        </div>
                        {status !== 'Pending' && (
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColor}`}>
                            {status}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gray-50 dark:bg-dark border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-inner px-3 py-3 rounded-xl text-center group-hover:border-gray-200 dark:group-hover:border-white/10 transition-colors">
                          <span className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Midterm</span>
                          <span className={`text-xl font-headline font-bold ${getGradeColor(grade.midterm_score, grade.midterm_max)}`}>
                            {formatScore(grade.midterm_score)}
                          </span>
                        </div>
                        <div className="bg-gray-50 dark:bg-dark border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-inner px-3 py-3 rounded-xl text-center group-hover:border-gray-200 dark:group-hover:border-white/10 transition-colors">
                          <span className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Practical</span>
                          <span className={`text-xl font-headline font-bold ${getGradeColor(grade.practical_score, grade.practical_max)}`}>
                            {formatScore(grade.practical_score)}
                          </span>
                        </div>
                        <div className="bg-gray-50 dark:bg-dark border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-inner px-3 py-3 rounded-xl text-center group-hover:border-gray-200 dark:group-hover:border-white/10 transition-colors">
                          <span className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Oral</span>
                          <span className={`text-xl font-headline font-bold ${getGradeColor(grade.oral_score, grade.oral_max)}`}>
                            {formatScore(grade.oral_score)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-gray-100 dark:border-white/5 flex justify-between items-center">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold">Total Score</span>
                        <div className="text-right">
                          <span className={`text-2xl font-headline font-extrabold ${getGradeColor(total, grade.max_score)}`}>
                            {formatScore(total)}
                          </span>
                          <span className="text-gray-400 dark:text-gray-500 text-sm font-bold opacity-80 dark:opacity-60"> / {grade.max_score}</span>
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
      <style>{`
        .font-headline { font-family: 'Manrope', 'Inter', sans-serif; }
        .bg-dark-glass { background: rgba(17, 17, 17, 0.7); backdrop-filter: blur(12px); }
      `}</style>
    </div>
  );
};

export default StudentGrades;