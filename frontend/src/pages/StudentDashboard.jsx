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
      <Sidebar activePage="dashboard" onLogout={handleLogout} />
      
      <div className="flex-1 ml-0 md:ml-64 pb-20 md:pb-8 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-primary mb-2">
              Welcome back, {student?.name}
            </h1>
            <p className="text-gray-400 text-sm md:text-base">
              Student ID: {student?.id} • Level {student?.level} • Section {student?.section || 'Not assigned'}
            </p>
            <button 
              onClick={() => setShowChangePassword(true)}
              className="mt-2 text-sm text-primary hover:underline"
            >
              Change Password
            </button>
          </div>

          {summary && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
              <div className="bg-white/5 rounded-xl p-4 md:p-6 border border-white/10">
                <h3 className="text-gray-400 text-xs md:text-sm mb-2">Total Score</h3>
                <p className="text-2xl md:text-3xl font-bold text-primary">{summary.totalEarned || 0}</p>
                <p className="text-xs text-gray-500">out of {summary.totalPossible || 0}</p>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 md:p-6 border border-white/10">
                <h3 className="text-gray-400 text-xs md:text-sm mb-2">Overall Percentage</h3>
                <p className="text-2xl md:text-3xl font-bold text-primary">{summary.overallPercentage || 0}%</p>
                <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${summary.overallPercentage || 0}%` }} />
                </div>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 md:p-6 border border-white/10">
                <h3 className="text-gray-400 text-xs md:text-sm mb-2">Courses with Grades</h3>
                <p className="text-2xl md:text-3xl font-bold text-primary">{summary.coursesWithGrades || 0}</p>
                <p className="text-xs text-gray-500">out of {grades.length} courses</p>
              </div>
            </div>
          )}

          <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-white/10">
              <h2 className="text-lg md:text-xl font-semibold text-primary">Your Grades</h2>
              <p className="text-gray-400 text-xs md:text-sm mt-1">Midterm • Practical • Oral scores</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm md:text-base">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left py-3 px-3 md:py-4 md:px-6 text-primary">Course</th>
                    <th className="text-center py-3 px-3 md:py-4 md:px-6 text-primary">Mid</th>
                    <th className="text-center py-3 px-3 md:py-4 md:px-6 text-primary">Prac</th>
                    <th className="text-center py-3 px-3 md:py-4 md:px-6 text-primary">Oral</th>
                    <th className="text-center py-3 px-3 md:py-4 md:px-6 text-primary">Total</th>
                    <th className="text-center py-3 px-3 md:py-4 md:px-6 text-primary">Max</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 md:py-12 text-gray-400">
                        No grades available yet.
                      </td>
                    </tr>
                  ) : (
                    grades.map((grade, idx) => {
                      const total = (grade.midterm_score || 0) + (grade.practical_score || 0) + (grade.oral_score || 0);
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

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-charcoal border border-primary/30 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl md:text-2xl font-bold text-primary mb-5">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-1 text-sm">Current Password</label>
                <input
                  type="password"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                  className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-1 text-sm">New Password</label>
                <input
                  type="password"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                  className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary"
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
                  className="w-full bg-dark/50 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={changingPassword} className="flex-1 bg-primary text-dark font-semibold py-2 rounded-xl hover:bg-primaryDark transition-all disabled:opacity-50">
                  {changingPassword ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setShowChangePassword(false)} className="px-4 py-2 border border-white/20 rounded-xl hover:bg-white/10 transition-all">
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