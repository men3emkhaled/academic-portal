import React, { useState } from 'react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';

const StudentSettings = () => {
  const { student, logout, changePassword } = useStudentAuth();
  const navigate = useNavigate();
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');

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
      setPasswordData({ current: '', new: '', confirm: '' });
    } else {
      toast.error(result.message);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    toast.success(`${newMode ? 'Dark' : 'Light'} mode activated`);
  };

  return (
    <div className="flex min-h-screen bg-dark">
      <Sidebar activePage="settings" onLogout={handleLogout} />
      
      <div className="flex-1 ml-0 md:ml-64 p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
              ⚙️ Settings
            </h1>
            <p className="text-gray-400">
              Manage your account preferences
            </p>
          </div>

          {/* Profile Info */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Full Name</label>
                <p className="text-white text-lg font-medium">{student?.name}</p>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Student ID</label>
                <p className="text-white text-lg font-medium">{student?.id}</p>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Level</label>
                <p className="text-white text-lg font-medium">{student?.level}</p>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Section</label>
                <p className="text-white text-lg font-medium">{student?.section || 'Not assigned'}</p>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Change Password</h2>
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
              <button
                type="submit"
                disabled={changingPassword}
                className="px-6 py-2 bg-primary text-dark font-semibold rounded-xl hover:bg-primaryDark transition-all disabled:opacity-50"
              >
                {changingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Preferences */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Preferences</h2>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-white font-medium">Dark Mode</p>
                <p className="text-gray-400 text-sm">Switch between light and dark theme</p>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                  darkMode ? 'bg-primary' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-300 ${
                    darkMode ? 'left-8' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="mt-6 p-6 bg-red-500/10 rounded-xl border border-red-500/30">
            <h2 className="text-xl font-semibold text-red-400 mb-2">Danger Zone</h2>
            <p className="text-gray-400 text-sm mb-4">Once you logout, you will need to login again</p>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-500/20 text-red-400 font-semibold rounded-xl hover:bg-red-500/30 transition-all"
            >
              Logout Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSettings;