import React, { useState, useRef } from 'react';
import { Settings2, User, Fingerprint, Lock, Moon, Sun, LogOut, Mail, Send, Camera, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';
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
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);
  const { student, logout, linkEmail, changePassword, uploadAvatar } = useStudentAuth();

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

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append('avatar', file);

    const result = await uploadAvatar(formData);
    setIsUploadingAvatar(false);

    if (result.success) {
      toast.success('Profile picture updated!');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white font-sans transition-colors duration-500 relative overflow-hidden">
      {/* Background Ambient Orbs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 dark:bg-primary/10 blur-[150px] rounded-full mix-blend-multiply dark:mix-blend-screen"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 dark:bg-blue-500/10 blur-[150px] rounded-full mix-blend-multiply dark:mix-blend-screen"></div>
      </div>

      <Sidebar activePage="settings" onLogout={handleLogout} />

      <div className="md:ml-64 pb-24 md:pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-2xl border border-primary/20 shadow-sm">
              <Settings2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">Settings</h1>
              <p className="text-gray-500 dark:text-gray-400 font-semibold mt-1">Manage your account preferences and security.</p>
            </div>
          </div>

          {/* Cinematic Hero Profile Card */}
          <div className="relative rounded-[2.5rem] bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm dark:shadow-2xl">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 dark:bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10 p-8 sm:p-12 flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar Upload Container */}
              <div className="relative group shrink-0">
                <div 
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-[2rem] bg-gray-100 dark:bg-black/50 border border-gray-200 dark:border-white/20 flex items-center justify-center overflow-hidden shadow-xl cursor-pointer relative z-10 group-hover:border-primary/50 transition-all duration-300 group-hover:shadow-[0_0_40px_rgba(46,204,113,0.3)]"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {student?.avatar_url ? (
                    <img 
                      src={student.avatar_url} 
                      alt={student.name} 
                      className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${isUploadingAvatar ? 'opacity-30 blur-sm' : 'opacity-100'}`} 
                    />
                  ) : (
                    <User className={`w-16 h-16 text-gray-400 dark:text-gray-600 transition-transform duration-500 group-hover:scale-110 group-hover:text-primary ${isUploadingAvatar ? 'opacity-30' : 'opacity-100'}`} />
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                    <Camera className="w-8 h-8 text-white" />
                  </div>

                  {isUploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                />
              </div>

              {/* Profile Info */}
              <div className="text-center md:text-left flex-1 mt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 text-xs font-black uppercase tracking-widest mb-4">
                  <Fingerprint className="w-3.5 h-3.5 text-primary" /> ID: {student?.id}
                </div>
                <h2 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-2">{student?.name}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-lg font-bold mb-6">Student Records</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3 shadow-inner">
                    <span className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Level</span>
                    <span className="text-gray-900 dark:text-white font-black">{student?.level}</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3 shadow-inner">
                    <span className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Section</span>
                    <span className="text-gray-900 dark:text-white font-black">{student?.section || 'Not assigned'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Grid Control Center */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column (Security) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl rounded-[2.5rem] border border-gray-200 dark:border-white/10 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <ShieldCheck className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">Account Security</h3>
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Authentication and recovery</p>
                  </div>
                </div>

                {/* Email Section */}
                <div className="mb-10">
                  <h4 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                    <Mail className="w-4 h-4 text-blue-500" /> Recovery Email
                  </h4>
                  {student?.email ? (
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4 mb-4 shadow-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">Linked: <span className="text-primary">{student.email}</span></p>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 font-medium">Link an email address to recover your password if you forget it.</p>
                  )}

                  <form onSubmit={handleLinkEmail} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder={student?.email ? "Update email address..." : "Enter your email address..."}
                      className="flex-1 bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-bold focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all shadow-inner"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isLinking}
                      className="bg-gray-100 hover:bg-blue-500 text-gray-600 hover:text-white dark:bg-white/5 dark:hover:bg-blue-500 dark:text-gray-300 dark:hover:text-white border border-gray-200 dark:border-white/10 font-black py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {student?.email ? "Update" : "Link"} <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>

                <div className="w-full h-px bg-gray-100 dark:bg-white/10 mb-8"></div>

                {/* Password Section */}
                <div>
                  <h4 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <Lock className="w-4 h-4 text-amber-500" /> Change Password
                  </h4>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <input
                          type="password"
                          value={passwordData.oldPassword}
                          onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                          placeholder="Current password"
                          className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-bold focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all shadow-inner"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          placeholder="New password"
                          className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-bold focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all shadow-inner"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          placeholder="Confirm new password"
                          className="w-full bg-gray-50/50 dark:bg-black/50 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 font-bold focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all shadow-inner"
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="w-full bg-gray-900 hover:bg-black text-white dark:bg-white dark:hover:bg-gray-200 dark:text-[#0a0a0a] font-black py-4 rounded-2xl shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-2"
                    >
                      {isChangingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              
              {/* Appearance */}
              <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl rounded-[2.5rem] border border-gray-200 dark:border-white/10 p-8 shadow-sm h-48 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight">Appearance</h3>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Toggle visual theme</p>
                </div>
                
                <div className="flex items-center justify-between mt-4 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl p-4 shadow-inner">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-500'}`}>
                      {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">{isDarkMode ? 'Dark' : 'Light'} Mode</span>
                  </div>

                  {/* Custom Premium Switch */}
                  <button
                    onClick={toggleTheme}
                    className={`relative w-14 h-8 rounded-full transition-colors duration-500 shadow-inner ${
                      isDarkMode ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-500 flex items-center justify-center ${
                      isDarkMode ? 'translate-x-7' : 'translate-x-1'
                    }`}>
                      {isDarkMode && <div className="w-2 h-2 rounded-full bg-primary"></div>}
                    </div>
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-50 dark:bg-rose-500/5 border border-red-200 dark:border-rose-500/20 rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between group hover:border-red-300 dark:hover:border-rose-500/40 transition-colors duration-300">
                <div className="mb-8">
                  <h3 className="text-xl font-black text-red-600 dark:text-rose-500 leading-tight">Danger Zone</h3>
                  <p className="text-sm font-bold text-red-400 dark:text-rose-500/70">End your current session</p>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 bg-red-100 hover:bg-red-200 text-red-600 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-500 border border-red-200 dark:border-rose-500/20 font-black py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <LogOut className="w-5 h-5" /> Sign Out
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentSettings;