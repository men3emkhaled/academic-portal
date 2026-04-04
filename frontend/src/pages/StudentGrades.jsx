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
      // ✅ المسار الصحيح: /grades/my-grades
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

  const getGradeColor = (score, maxScore) => {
    if (score === null || score === undefined) return 'text-gray-500';
    const percentage = (score / maxScore) * 100;
    if (percentage >= 50) return 'text-green-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-dark">
      <Sidebar activePage="grades" onLogout={handleLogout} />
      
      <div className="flex-1 ml-0 md:ml-64 pb-20 md:pb-8 p-4 md:p-8">
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
                <p className="text-xs text-gray-500">out of {summary.totalPossible || 0}</p>
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
                      const percentage = grade.max_score > 0 ? (total / grade.max_score) * 100 : 0;
                      const isPassing = percentage >= 50;
                      return (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition">
                          <td className="py-2 px-3 md:py-3 md:px-6 font-medium text-white text-xs md:text-base">{grade.course_name}</td>
                          <td className="text-center py-2 px-3 md:py-3 md:px-6">
                            <span className={getGradeColor(grade.midterm_score, grade.max_score)}>
                              {grade.midterm_score || '-'}
                            </span>
                            {grade.midterm_status === 'pending' && <span className="text-xs text-yellow-500 block">pending</span>}
                          </td>
                          <td className="text-center py-2 px-3 md:py-3 md:px-6">
                            <span className={getGradeColor(grade.practical_score, grade.max_score)}>
                              {grade.practical_score || '-'}
                            </span>
                            {grade.practical_status === 'pending' && <span className="text-xs text-yellow-500 block">pending</span>}
                          </td>
                          <td className="text-center py-2 px-3 md:py-3 md:px-6">
                            <span className={getGradeColor(grade.oral_score, grade.max_score)}>
                              {grade.oral_score || '-'}
                            </span>
                            {grade.oral_status === 'pending' && <span className="text-xs text-yellow-500 block">pending</span>}
                          </td>
                          <td className="text-center py-2 px-3 md:py-3 md:px-6 font-semibold text-primary">{total}</td>
                          <td className="text-center py-2 px-3 md:py-3 md:px-6 text-gray-400">{grade.max_score}</td>
                          <td className="text-center py-2 px-3 md:py-3 md:px-6">
                            {total > 0 && (
                              <span className={`text-xs px-2 py-1 rounded-full ${isPassing ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'}`}>
                                {isPassing ? 'Passing' : 'Failing'}
                              </span>
                            )}
                            {total === 0 && <span className="text-xs text-gray-500">Not graded</span>}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentGrades;