import React, { useState, useEffect } from 'react';
import { Settings2, User, Edit3, Fingerprint, Lock, Moon, Sun, LogOut, Mail, Send } from 'lucide-react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';

const StudentSettings = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [emailInput, setEmailInput] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const { student, logout, linkEmail, changePassword } = useStudentAuth();

  const handleLogout = () => {
    logout();
    navigate('/student/login');
    toast.success('Logged out successfully');
  };

  const handleLinkEmail = async (e) => {
    e.preventDefault();
    if (!emailInput) {
      toast.error('Please enter an email address');
      return;
    }
    
    setIsLinking(true);
    const result = await linkEmail(emailInput);
    setIsLinking(false);
    
    if (result.success) {
      toast.success('Verification email sent! Check your inbox.');
      setEmailInput('');
    } else {
      toast.error(result.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordData.oldPassword || !passwordData.newPassword) {
      toast.error('All fields are required');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);
    const result = await changePassword(passwordData.oldPassword, passwordData.newPassword);
    setIsChangingPassword(false);

    if (result.success) {
      toast.success('Password updated successfully!');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark text-gray-900 dark:text-white font-body transition-colors duration-300">
      <Sidebar activePage="settings" onLogout={handleLogout} />

      <div className="md:ml-64 pb-24 md:pb-8">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-10">
            <h1 className="font-headline text-4xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-white/70 leading-tight pb-2 mb-2">
              <span className="flex items-center gap-3"><Settings2 className="text-primary" /> Settings</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your account preferences</p>
          </div>

          {/* Profile Information Section */}
          <div className="mb-8">
            <div className="flex items-end justify-between mb-4">
              <h2 className="font-headline font-extrabold text-3xl tracking-tighter text-gray-900 dark:text-white">Profile</h2>
              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Student Records</span>
            </div>
            <div className="bg-white dark:bg-dark-card rounded-[2rem] border border-gray-200 dark:border-white/10 p-8 shadow-sm dark:shadow-2xl relative overflow-hidden group hover:border-primary/20 dark:hover:border-white/20 transition-all duration-500">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-dark-glass backdrop-blur-md overflow-hidden border-2 border-primary/20 flex items-center justify-center text-4xl shadow-sm">
                    👤
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-primary text-white dark:text-[#001204] p-1 rounded-full border-4 border-white dark:border-[#001204] shadow-sm dark:shadow-lg">
                    <Edit3 className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-gray-900 dark:text-white font-headline font-bold text-xl">{student?.name}</div>
                  <div className="text-gray-500 dark:text-gray-400 font-label text-sm flex items-center gap-2">
                    <Fingerprint className="w-4 h-4" /> ID: {student?.id}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-100 dark:border-white/10">
                <div>
                  <label className="block text-gray-400 dark:text-gray-500 text-xs mb-1 font-bold uppercase tracking-wider">Level</label>
                  <p className="text-gray-800 dark:text-white text-base font-medium">{student?.level}</p>
                </div>
                <div>
                  <label className="block text-gray-400 dark:text-gray-500 text-xs mb-1 font-bold uppercase tracking-wider">Section</label>
                  <p className="text-gray-800 dark:text-white text-base font-medium">{student?.section || 'Not assigned'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Security & Email Section */}
          <div className="mb-8">
            <div className="flex items-end justify-between mb-4">
              <h2 className="font-headline font-extrabold text-2xl tracking-tight text-gray-900 dark:text-white">Account Security</h2>
              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Authentication</span>
            </div>
            
            <div className="bg-white dark:bg-dark-card rounded-[2rem] border border-gray-200 dark:border-white/10 p-8 shadow-sm dark:shadow-2xl relative overflow-hidden group hover:border-primary/20 dark:hover:border-white/20 transition-all duration-500 mb-4">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                  <Mail className="w-5 h-5 text-primary" /> Email Address
                </h3>
                {student?.email ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Your linked email: <span className="text-gray-900 dark:text-white font-semibold">{student.email}</span></p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">You haven't linked an email yet. Link an email to recover your password.</p>
                )}
              </div>

              <form onSubmit={handleLinkEmail} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder={student?.email ? "Update email address..." : "Enter your email address..."}
                  className="flex-1 bg-gray-50 dark:bg-dark text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 shadow-inner rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500/40"
                  required
                />
                <button
                  type="submit"
                  disabled={isLinking}
                  className="bg-primary/10 dark:bg-primary/20 hover:bg-primary/20 dark:hover:bg-primary/30 text-primary border border-primary/20 dark:border-primary/30 font-headline font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {student?.email ? "Update Email" : "Link Email"} <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            <div className="bg-white dark:bg-dark-card rounded-[2rem] border border-gray-200 dark:border-white/10 p-8 shadow-sm dark:shadow-2xl relative overflow-hidden group hover:border-primary/20 dark:hover:border-white/20 transition-all duration-500">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                  <Lock className="w-5 h-5 text-primary" /> Change Password
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Update your account password securely.</p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-xs uppercase tracking-widest text-primary font-bold px-1 mb-2 block">Current Password</label>
                    <input
                      type="password"
                      value={passwordData.oldPassword}
                      onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                      placeholder="Enter current password"
                      className="w-full bg-gray-50 dark:bg-dark text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 shadow-inner rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500/40"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-primary font-bold px-1 mb-2 block">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      placeholder="New password"
                      className="w-full bg-gray-50 dark:bg-dark text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 shadow-inner rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500/40"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-primary font-bold px-1 mb-2 block">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      placeholder="Confirm new password"
                      className="w-full bg-gray-50 dark:bg-dark text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 shadow-inner rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500/40"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full bg-primary text-white dark:text-[#064200] font-headline font-bold py-4 rounded-xl shadow-[0_4px_15px_rgba(46,204,113,0.3)] dark:shadow-[0_0_20px_rgba(142,255,113,0.3)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isChangingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>

          {/* Appearance Section */}
          <div className="mb-8">
            <div className="flex items-end justify-between mb-4">
              <h2 className="font-headline font-extrabold text-2xl tracking-tight text-gray-900 dark:text-white">Appearance</h2>
              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Theme and Visuals</span>
            </div>
            <div className="bg-white dark:bg-dark-card rounded-[2rem] border border-gray-200 dark:border-white/10 p-8 shadow-sm dark:shadow-2xl relative overflow-hidden group hover:border-primary/20 dark:hover:border-white/20 transition-all duration-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-dark-glass backdrop-blur-md flex items-center justify-center text-primary text-xl border border-gray-200 dark:border-white/5">
                    {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="text-gray-900 dark:text-white font-bold">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Toggle the visual appearance of the application</div>
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative w-14 h-7 rounded-full transition-all duration-300 shadow-inner ${
                    isDarkMode ? 'bg-primary' : 'bg-gray-300'
                  }`}
                  aria-label="Toggle dark mode"
                >
                  <span
                    className={`absolute top-1 w-5 h-5 rounded-full transition-all duration-300 shadow-md ${
                      isDarkMode ? 'bg-dark left-8' : 'bg-white left-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone Section */}
          <div className="mb-8">
            <div className="flex items-end justify-between mb-4">
              <h2 className="font-headline font-extrabold text-2xl tracking-tight text-red-500">Danger Zone</h2>
              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-red-400 dark:text-red-500/50 font-bold">End Session</span>
            </div>
            <div className="bg-white dark:bg-dark-card rounded-[2rem] border border-red-200 dark:border-red-500/20 p-8 shadow-sm dark:shadow-2xl relative overflow-hidden group hover:border-red-300 dark:hover:border-red-500/40 hover:shadow-[0_4px_20px_rgba(239,68,68,0.1)] dark:hover:shadow-[0_12px_40px_rgba(255,0,0,0.1)] transition-all duration-500">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between group/btn"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500"><LogOut className="w-5 h-5" /></div>
                  <div className="text-left">
                    <div className="text-red-500 font-bold">Log Out</div>
                    <div className="text-xs text-red-400 dark:text-red-500/60 font-medium">Securely sign out of this device</div>
                  </div>
                </div>
                <span className="text-red-300 dark:text-red-500/40 group-hover/btn:translate-x-1 transition-transform"><LogOut className="w-4 h-4" /></span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .font-headline { font-family: 'Manrope', 'Inter', sans-serif; }
        .bg-dark-glass { background: rgba(17, 17, 17, 0.7); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
      `}</style>
    </div>
  );
};

export default StudentSettings;