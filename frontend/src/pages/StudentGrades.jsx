import React, { useState, useEffect } from 'react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useNavigate } from 'react-router-dom';
import studentApi from '../services/studentApi';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';

const StudentGrades = () => {
  const { student, logout } = useStudentAuth();
  const navigate = useNavigate();
  const [grades, setGrades] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) {
      navigate('/student/login');
      return;
    }
    fetchGrades();
  }, [student, navigate]);

  const fetchGrades = async () => {
    try {
      const response = await studentApi.get('/grades/my-grades');
      setGrades(response.data.grades || []);
      setSummary(response.data.summary || null);
    } catch (error) {
      console.error('Error fetching grades:', error);
      toast.error('Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/student/login');
    toast.success('Logged out successfully');
  };

  // دالة تحديد لون الدرجة
  const getGradeColor = (score, maxScore) => {
    if (score === null || score === undefined) return 'text-gray-500';
    const roundedScore = Math.round(score);
    const percentage = (roundedScore / maxScore) * 100;
    if (percentage >= 50) return 'text-green-400';
    return 'text-red-400';
  };

  // دالة تقريب الدرجة
  const formatScore = (score) => {
    if (score === null || score === undefined) return '-';
    return Math.round(score);
  };

  // ✅ دالة تحديد حالة المادة (ناجح/راسب/قيد الانتظار) - بعد اكتمال الدرجات فقط
  const getCourseStatus = (grade) => {
    const midtermExists = grade.midterm_score !== null && grade.midterm_score !== undefined;
    const practicalExists = grade.practical_score !== null && grade.practical_score !== undefined;
    const oralExists = grade.oral_score !== null && grade.oral_score !== undefined;
    
    const total = (grade.midterm_score || 0) + (grade.practical_score || 0) + (grade.oral_score || 0);
    
    // لو كل الدرجات نزلت
    if (midtermExists && practicalExists && oralExists) {
      const percentage = (total / grade.max_score) * 100;
      return percentage >= 50 ? 'Passing' : 'Failing';
    }
    
    // لو لسا في درجات ناقصة
    return 'Pending';
  };

  // ✅ دالة لون الحالة
  const getStatusColor = (status) => {
    if (status === 'Passing') return 'bg-green-400/20 text-green-400';
    if (status === 'Failing') return 'bg-red-400/20 text-red-400';
    return 'bg-yellow-500/20 text-yellow-400';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-dark">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      <Sidebar activePage="grades" onLogout={handleLogout} />
      
      <div className="md:ml-64 pb-24 md:pb-8 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-primary mb-2">📊 My Grades</h1>
            <p className="text-gray-400 text-sm md:text-base">Academic performance for Semester 2</p>
          </div>

          {summary && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 md:gap-6 mb-8">
              <div className="bg-white/5 rounded-xl p-4 md:p-6 border border-white/10">
                <h3 className="text-gray-400 text-xs md:text-sm mb-2">Total Score</h3>
                <p className="text-2xl md:text-3xl font-bold text-primary">{summary.totalEarned || 0}</p>
                <p className="text-xs text-gray-500">out of {summary.totalPossible || 240}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 md:p-6 border border-white/10">
                <h3 className="text-gray-400 text-xs md:text-sm mb-2">Overall Percentage</h3>
                <p className="text-2xl md:text-3xl font-bold text-primary">{summary.overallPercentage || 0}%</p>
                <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${summary.overallPercentage || 0}%` }} />
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 md:p-6 border border-white/10">
                <h3 className="text-gray-400 text-xs md:text-sm mb-2">Courses Enrolled</h3>
                <p className="text-2xl md:text-3xl font-bold text-primary">{grades.length}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 md:p-6 border border-white/10">
                <h3 className="text-gray-400 text-xs md:text-sm mb-2">Courses with Grades</h3>
                <p className="text-2xl md:text-3xl font-bold text-primary">{summary.coursesWithGrades || 0}</p>
              </div>
            </div>
          )}

          <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm md:text-base">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left py-3 px-3 md:py-4 md:px-6 text-primary">Course Name</th>
                    <th className="text-center py-3 px-3 md:py-4 md:px-6 text-primary">Midterm</th>
                    <th className="text-center py-3 px-3 md:py-4 md:px-6 text-primary">Practical</th>
                    <th className="text-center py-3 px-3 md:py-4 md:px-6 text-primary">Oral</th>
                    <th className="text-center py-3 px-3 md:py-4 md:px-6 text-primary">Total</th>
                    <th className="text-center py-3 px-3 md:py-4 md:px-6 text-primary">Max</th>
                    <th className="text-center py-3 px-3 md:py-4 md:px-6 text-primary">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 md:py-12 text-gray-400">
                        No grades available yet.
                      </td>
                    </tr>
                  ) : (
                    grades.map((grade, idx) => {
                      const total = (grade.midterm_score || 0) + (grade.practical_score || 0) + (grade.oral_score || 0);
                      const midtermExists = grade.midterm_score !== null && grade.midterm_score !== undefined;
                      const practicalExists = grade.practical_score !== null && grade.practical_score !== undefined;
                      const oralExists = grade.oral_score !== null && grade.oral_score !== undefined;
                      const allGradesExist = midtermExists && practicalExists && oralExists;
                      
                      // ✅ تحديد الحالة بناءً على اكتمال الدرجات
                      let status = 'Pending';
                      let statusColor = 'bg-yellow-500/20 text-yellow-400';
                      
                      if (allGradesExist) {
                        const percentage = (total / grade.max_score) * 100;
                        if (percentage >= 50) {
                          status = 'Passing';
                          statusColor = 'bg-green-400/20 text-green-400';
                        } else {
                          status = 'Failing';
                          statusColor = 'bg-red-400/20 text-red-400';
                        }
                      }
                      
                      return (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition">
                          <td className="py-2 px-3 md:py-3 md:px-6 font-medium text-white text-xs md:text-base">
                            {grade.course_name}
                          </td>
                          <td className="text-center py-2 px-3 md:py-3 md:px-6">
                            <span className={getGradeColor(grade.midterm_score, grade.midterm_max)}>
                              {formatScore(grade.midterm_score)}
                            </span>
                            {!midtermExists && (
                              <span className="text-[10px] text-yellow-500 block">pending</span>
                            )}
                          </td>
                          <td className="text-center py-2 px-3 md:py-3 md:px-6">
                            <span className={getGradeColor(grade.practical_score, grade.practical_max)}>
                              {formatScore(grade.practical_score)}
                            </span>
                            {!practicalExists && (
                              <span className="text-[10px] text-yellow-500 block">pending</span>
                            )}
                          </td>
                          <td className="text-center py-2 px-3 md:py-3 md:px-6">
                            <span className={getGradeColor(grade.oral_score, grade.oral_max)}>
                              {formatScore(grade.oral_score)}
                            </span>
                            {!oralExists && (
                              <span className="text-[10px] text-yellow-500 block">pending</span>
                            )}
                          </td>
                          <td className="text-center py-2 px-3 md:py-3 md:px-6 font-semibold text-primary">
                            {Math.round(total)}
                          </td>
                          <td className="text-center py-2 px-3 md:py-3 md:px-6 text-gray-400">
                            {grade.max_score}
                          </td>
                          <td className="text-center py-2 px-3 md:py-3 md:px-6">
                            <span className={`text-xs px-2 py-1 rounded-full ${statusColor}`}>
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Note */}
          <div className="mt-6 p-3 bg-white/5 rounded-lg border border-white/10 text-center">
            <p className="text-xs text-gray-400">
              📝 Each course total = Midterm + Practical + Oral • Status only appears when all three grades are available
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentGrades;