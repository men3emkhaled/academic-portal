import React, { useState, useEffect } from 'react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useNavigate } from 'react-router-dom';
import studentApi from '../services/studentApi';
import api from '../services/api';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const getGradeColor = (score, maxScore) => {
    if (score === null || score === undefined) return 'text-gray-500';
    const percentage = (score / maxScore) * 100;
    if (percentage >= 50) return 'text-green-400';
    return 'text-red-400';
  };

  return (
    <div className="flex min-h-screen bg-dark">
      <Sidebar activePage="dashboard" onLogout={handleLogout} />
      
      <div className="flex-1 ml-0 md:ml-64 p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
              Welcome back, {student?.name}
            </h1>
            <p className="text-gray-400">
              Student ID: {student?.id} • Level {student?.level} • Section {student?.section || 'Not assigned'}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-gray-400 text-sm mb-2">Total Score</h3>
              <p className="text-3xl font-bold text-primary">{summary?.totalEarned || 0}</p>
              <p className="text-sm text-gray-500">out of {summary?.totalPossible || 0}</p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-gray-400 text-sm mb-2">Overall Percentage</h3>
              <p className="text-3xl font-bold text-primary">{summary?.overallPercentage || 0}%</p>
              <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${summary?.overallPercentage || 0}%` }}
                />
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-gray-400 text-sm mb-2">Courses with Grades</h3>
              <p className="text-3xl font-bold text-primary">{summary?.coursesWithGrades || 0}</p>
              <p className="text-sm text-gray-500">out of {grades.length} courses</p>
            </div>
          </div>

          {/* Grades Table */}
          <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-primary">Your Grades</h2>
              <p className="text-gray-400 text-sm mt-1">Midterm • Practical • Oral scores</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left py-4 px-6 text-primary">Course</th>
                    <th className="text-center py-4 px-6 text-primary">Midterm</th>
                    <th className="text-center py-4 px-6 text-primary">Practical</th>
                    <th className="text-center py-4 px-6 text-primary">Oral</th>
                    <th className="text-center py-4 px-6 text-primary">Total</th>
                    <th className="text-center py-4 px-6 text-primary">Max</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((grade, idx) => {
                    const total = (grade.midterm_score || 0) + (grade.practical_score || 0) + (grade.oral_score || 0);
                    return (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition">
                        <td className="py-3 px-6 font-medium text-white">{grade.course_name}</td>
                        <td className="text-center py-3 px-6">
                          {grade.midterm_score !== null ? (
                            <span className={getGradeColor(grade.midterm_score, grade.max_score)}>
                              {grade.midterm_score}
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                          {grade.midterm_status === 'pending' && (
                            <span className="text-xs text-yellow-500 block">pending</span>
                          )}
                        </td>
                        <td className="text-center py-3 px-6">
                          {grade.practical_score !== null ? (
                            <span className={getGradeColor(grade.practical_score, grade.max_score)}>
                              {grade.practical_score}
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                          {grade.practical_status === 'pending' && (
                            <span className="text-xs text-yellow-500 block">pending</span>
                          )}
                        </td>
                        <td className="text-center py-3 px-6">
                          {grade.oral_score !== null ? (
                            <span className={getGradeColor(grade.oral_score, grade.max_score)}>
                              {grade.oral_score}
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                          {grade.oral_status === 'pending' && (
                            <span className="text-xs text-yellow-500 block">pending</span>
                          )}
                        </td>
                        <td className="text-center py-3 px-6 font-semibold text-primary">{total}</td>
                        <td className="text-center py-3 px-6 text-gray-400">{grade.max_score}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Change Password Modal */}
          {showChangePassword && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-charcoal border border-primary/30 rounded-2xl p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold text-primary mb-5">Change Password</h2>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-1">Current Password</label>
                    <input
                      type="password"
                      value={passwordData.current}
                      onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                      className="w-full bg-dark border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">New Password</label>
                    <input
                      type="password"
                      value={passwordData.new}
                      onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                      className="w-full bg-dark border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                      className="w-full bg-dark border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={changingPassword} className="flex-1 bg-primary text-dark font-semibold py-2 rounded-xl hover:bg-primaryDark transition">
                      {changingPassword ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type="button" onClick={() => setShowChangePassword(false)} className="px-4 py-2 border border-white/20 rounded-xl hover:bg-white/10 transition">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;