import React, { useState, useEffect } from 'react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import studentApi from '../services/studentApi';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const { student, logout, changePassword } = useStudentAuth();
  const navigate = useNavigate();
  const [grades, setGrades] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [changingPassword, setChangingPassword] = useState(false);

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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.new.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }
    if (passwordData.new === passwordData.current) {
      toast.error('New password must be different from current password');
      return;
    }
    
    setChangingPassword(true);
    const result = await changePassword(passwordData.current, passwordData.new);
    setChangingPassword(false);
    
    if (result.success) {
      toast.success('Password changed successfully');
      setShowChangePassword(false);
      setPasswordData({ current: '', new: '', confirm: '' });
    } else {
      toast.error(result.message);
    }
  };

  // ✅ دالة تحديد لون الدرجة (ناجح/راسب)
  const getGradeColor = (score, maxScore) => {
    if (score === null || score === undefined) return 'text-gray-500';
    const roundedScore = Math.round(score);
    const percentage = (roundedScore / maxScore) * 100;
    if (percentage >= 50) return 'text-green-400';
    return 'text-red-400';
  };

  // ✅ دالة تقريب الدرجة
  const formatScore = (score) => {
    if (score === null || score === undefined) return '-';
    return Math.round(score);
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
      <Sidebar onLogout={handleLogout} />
      
      {/* المحتوى الرئيسي */}
      <div className="md:ml-64 pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2 break-words">
              Welcome back, {student?.name}
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              🎓 Student ID: {student?.id} • Level {student?.level} • Section {student?.section || 'Not assigned'}
            </p>
            <button 
              onClick={() => setShowChangePassword(true)}
              className="mt-3 text-sm text-primary hover:underline flex items-center gap-1"
            >
              🔐 Change Password
            </button>
          </div>

          {/* Stats Cards - المجموع من 240 */}
          {summary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10 hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-400 text-sm sm:text-base">Total Score</h3>
                  <span className="text-2xl">📊</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-primary mt-2">{summary.totalEarned || 0}</p>
                <p className="text-xs text-gray-500 mt-1">out of {summary.totalPossible || 240}</p>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10 hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-400 text-sm sm:text-base">Overall Percentage</h3>
                  <span className="text-2xl">📈</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-primary mt-2">{summary.overallPercentage || 0}%</p>
                <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500" 
                    style={{ width: `${summary.overallPercentage || 0}%` }} 
                  />
                </div>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10 hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-400 text-sm sm:text-base">Courses Passed</h3>
                  <span className="text-2xl">✅</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-primary mt-2">{summary.coursesWithGrades || 0}</p>
                <p className="text-xs text-gray-500 mt-1">out of {summary.totalCourses || grades.length} courses</p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 sm:p-6 border border-white/10 hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-400 text-sm sm:text-base">Total Courses</h3>
                  <span className="text-2xl">📚</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-primary mt-2">{summary.totalCourses || grades.length}</p>
                <p className="text-xs text-gray-500 mt-1">Semester 2</p>
              </div>
            </div>
          )}

          {/* Grades Table */}
          <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-white/10">
              <h2 className="text-lg sm:text-xl font-semibold text-primary">Your Grades</h2>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">
                Midterm (max {grades[0]?.midterm_max || 15}) • Practical (max {grades[0]?.practical_max || 15}) • Oral (max {grades[0]?.oral_max || 10})
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm sm:text-base">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left py-3 px-3 sm:py-4 sm:px-6 text-primary text-xs sm:text-sm">Course</th>
                    <th className="text-center py-3 px-3 sm:py-4 sm:px-6 text-primary text-xs sm:text-sm">Midterm</th>
                    <th className="text-center py-3 px-3 sm:py-4 sm:px-6 text-primary text-xs sm:text-sm">Practical</th>
                    <th className="text-center py-3 px-3 sm:py-4 sm:px-6 text-primary text-xs sm:text-sm">Oral</th>
                    <th className="text-center py-3 px-3 sm:py-4 sm:px-6 text-primary text-xs sm:text-sm">Total</th>
                    <th className="text-center py-3 px-3 sm:py-4 sm:px-6 text-primary text-xs sm:text-sm">Max</th>
                    <th className="text-center py-3 px-3 sm:py-4 sm:px-6 text-primary text-xs sm:text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 sm:py-12 text-gray-400">
                        📭 No grades available yet.
                      </td>
                    </tr>
                  ) : (
                    grades.map((grade, idx) => {
                      const total = (grade.midterm_score || 0) + (grade.practical_score || 0) + (grade.oral_score || 0);
                      const percentage = grade.max_score > 0 ? (total / grade.max_score) * 100 : 0;
                      const isPassing = percentage >= 50;
                      
                      return (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition">
                          <td className="py-2 px-3 sm:py-3 sm:px-6 font-medium text-white text-xs sm:text-sm break-words max-w-[150px] sm:max-w-none">
                            {grade.course_name}
                          </td>
                          <td className="text-center py-2 px-3 sm:py-3 sm:px-6">
                            <span className={getGradeColor(grade.midterm_score, grade.midterm_max)}>
                              {formatScore(grade.midterm_score)}
                            </span>
                            {grade.midterm_status === 'pending' && (
                              <span className="text-[10px] text-yellow-500 block">pending</span>
                            )}
                          </td>
                          <td className="text-center py-2 px-3 sm:py-3 sm:px-6">
                            <span className={getGradeColor(grade.practical_score, grade.practical_max)}>
                              {formatScore(grade.practical_score)}
                            </span>
                            {grade.practical_status === 'pending' && (
                              <span className="text-[10px] text-yellow-500 block">pending</span>
                            )}
                          </td>
                          <td className="text-center py-2 px-3 sm:py-3 sm:px-6">
                            <span className={getGradeColor(grade.oral_score, grade.oral_max)}>
                              {formatScore(grade.oral_score)}
                            </span>
                            {grade.oral_status === 'pending' && (
                              <span className="text-[10px] text-yellow-500 block">pending</span>
                            )}
                          </td>
                          <td className="text-center py-2 px-3 sm:py-3 sm:px-6 font-semibold text-primary">
                            {Math.round(total)}
                          </td>
                          <td className="text-center py-2 px-3 sm:py-3 sm:px-6 text-gray-400">
                            {grade.max_score}
                          </td>
                          <td className="text-center py-2 px-3 sm:py-3 sm:px-6">
                            {total > 0 && (
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                isPassing 
                                  ? 'bg-green-400/20 text-green-400' 
                                  : 'bg-red-400/20 text-red-400'
                              }`}>
                                {isPassing ? 'Passing' : 'Failing'}
                              </span>
                            )}
                            {total === 0 && (
                              <span className="text-xs text-gray-500">Not graded</span>
                            )}
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
          <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10 text-center">
            <p className="text-xs text-gray-400">
              📝 Each course total = Midterm + Practical + Oral • Total possible = 240 (6 courses × 40)
            </p>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-primary/30 rounded-2xl p-5 sm:p-6 w-full max-w-md mx-4">
            <h2 className="text-xl sm:text-2xl font-bold text-primary mb-5">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-1 text-sm">Current Password</label>
                <input
                  type="password"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                  className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1 text-sm">New Password</label>
                <input
                  type="password"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                  className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 4 characters</p>
              </div>
              <div>
                <label className="block text-gray-300 mb-1 text-sm">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                  className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="submit" 
                  disabled={changingPassword} 
                  className="flex-1 bg-primary text-dark font-semibold py-2.5 rounded-xl hover:bg-primaryDark transition-all disabled:opacity-50"
                >
                  {changingPassword ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowChangePassword(false)} 
                  className="px-4 py-2.5 border border-white/20 rounded-xl hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;