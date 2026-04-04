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
      const response = await studentApi.get('/my-grades');
      setGrades(response.data.grades);
      setSummary(response.data.summary);
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

  const getStatusBadge = (status) => {
    if (status === 'completed') {
      return <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">Completed</span>;
    } else if (status === 'pending') {
      return <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">Pending</span>;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-dark">
      <Sidebar activePage="grades" onLogout={handleLogout} />
      
      <div className="flex-1 ml-0 md:ml-64 p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
              📊 My Grades
            </h1>
            <p className="text-gray-400">
              Academic performance for Semester 2
            </p>
          </div>

          {/* Stats Summary */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-gray-400 text-sm">Total Score</p>
                <p className="text-2xl font-bold text-primary">{summary.totalEarned}</p>
                <p className="text-xs text-gray-500">out of {summary.totalPossible}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-gray-400 text-sm">Overall Percentage</p>
                <p className="text-2xl font-bold text-primary">{summary.overallPercentage}%</p>
                <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${summary.overallPercentage}%` }} />
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-gray-400 text-sm">Courses Enrolled</p>
                <p className="text-2xl font-bold text-primary">{grades.length}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-gray-400 text-sm">Courses with Grades</p>
                <p className="text-2xl font-bold text-primary">{summary.coursesWithGrades}</p>
              </div>
            </div>
          )}

          {/* Grades Table */}
          <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left py-4 px-6 text-primary">Course Name</th>
                    <th className="text-center py-4 px-6 text-primary">Midterm</th>
                    <th className="text-center py-4 px-6 text-primary">Practical</th>
                    <th className="text-center py-4 px-6 text-primary">Oral</th>
                    <th className="text-center py-4 px-6 text-primary">Total</th>
                    <th className="text-center py-4 px-6 text-primary">Max Score</th>
                    <th className="text-center py-4 px-6 text-primary">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((grade, idx) => {
                    const total = (grade.midterm_score || 0) + (grade.practical_score || 0) + (grade.oral_score || 0);
                    const percentage = (total / grade.max_score) * 100;
                    const isPassing = percentage >= 50;
                    
                    return (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition">
                        <td className="py-3 px-6 font-medium text-white">{grade.course_name}</td>
                        <td className="text-center py-3 px-6">
                          {grade.midterm_score !== null ? (
                            <span className={getGradeColor(grade.midterm_score, grade.max_score)}>
                              {grade.midterm_score}
                            </span>
                          ) : <span className="text-gray-500">—</span>}
                          {getStatusBadge(grade.midterm_status)}
                        </td>
                        <td className="text-center py-3 px-6">
                          {grade.practical_score !== null ? (
                            <span className={getGradeColor(grade.practical_score, grade.max_score)}>
                              {grade.practical_score}
                            </span>
                          ) : <span className="text-gray-500">—</span>}
                          {getStatusBadge(grade.practical_status)}
                        </td>
                        <td className="text-center py-3 px-6">
                          {grade.oral_score !== null ? (
                            <span className={getGradeColor(grade.oral_score, grade.max_score)}>
                              {grade.oral_score}
                            </span>
                          ) : <span className="text-gray-500">—</span>}
                          {getStatusBadge(grade.oral_status)}
                        </td>
                        <td className="text-center py-3 px-6">
                          <span className={`font-bold ${isPassing ? 'text-green-400' : total > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                            {total}
                          </span>
                        </td>
                        <td className="text-center py-3 px-6 text-gray-400">{grade.max_score}</td>
                        <td className="text-center py-3 px-6">
                          {total > 0 && (
                            <span className={`text-xs px-2 py-1 rounded-full ${isPassing ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'}`}>
                              {isPassing ? 'Passing' : 'Failing'}
                            </span>
                          )}
                          {total === 0 && <span className="text-xs text-gray-500">Not graded</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Note */}
          <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-sm text-gray-400">
              📝 <span className="text-green-400">Green</span> = Passing (≥50%) • 
              <span className="text-red-400 ml-1">Red</span> = Failing (&lt;50%) • 
              <span className="text-yellow-400 ml-1">Yellow</span> = Pending
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentGrades;