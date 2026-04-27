import React, { useState } from 'react';
import { Settings2, User, Edit3, Fingerprint, Lock, Moon, LogOut, Mail, Send } from 'lucide-react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';

const StudentSettings = () => {
  const { student, logout, linkEmail, forgotPassword } = useStudentAuth();
  const navigate = useNavigate();
  
  const [emailInput, setEmailInput] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');

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

  const handleForgotPassword = async () => {
    if (!student?.email) {
      toast.error('You need to link an email first before resetting password.');
      return;
    }

    setIsSendingReset(true);
    const result = await forgotPassword(student.id);
    setIsSendingReset(false);

    if (result.success) {
      toast.success('Password reset link sent to your email!');
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
    <div className="min-h-screen bg-dark text-white font-body">
      <Sidebar activePage="settings" onLogout={handleLogout} />

      <div className="md:ml-64 pb-24 md:pb-8">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-10">
            <h1 className="font-headline text-4xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 leading-tight pb-2 mb-2">
              <span className="flex items-center gap-3"><Settings2 /> Settings</span>
            </h1>
            <p className="text-gray-400 text-sm">Manage your account preferences</p>
          </div>

          {/* Profile Information Section */}
          <div className="mb-8">
            <div className="flex items-end justify-between mb-4">
              <h2 className="font-headline font-extrabold text-3xl tracking-tighter text-white">Profile</h2>
              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-gray-500">Student Records</span>
            </div>
            <div className="bg-dark-card rounded-[2rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all duration-500">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-dark-glass backdrop-blur-md overflow-hidden border-2 border-primary/20 flex items-center justify-center text-4xl">
                    👤
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-primary text-[#001204] p-1 rounded-full border-4 border-[#001204] shadow-lg">
                    <Edit3 className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-white font-headline font-bold text-xl">{student?.name}</div>
                  <div className="text-gray-400 font-label text-sm flex items-center gap-2">
                    <Fingerprint className="w-4 h-4" /> ID: {student?.id}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/10">
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Level</label>
                  <p className="text-white text-base font-medium">{student?.level}</p>
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Section</label>
                  <p className="text-white text-base font-medium">{student?.section || 'Not assigned'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Security & Email Section */}
          <div className="mb-8">
            <div className="flex items-end justify-between mb-4">
              <h2 className="font-headline font-extrabold text-2xl tracking-tight text-white">Account Security</h2>
              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-gray-500">Authentication</span>
            </div>
            
            <div className="bg-dark-card rounded-[2rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all duration-500 mb-4">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                  <Mail className="w-5 h-5 text-primary" /> Email Address
                </h3>
                {student?.email ? (
                  <p className="text-gray-400 text-sm">Your linked email: <span className="text-white font-semibold">{student.email}</span></p>
                ) : (
                  <p className="text-gray-400 text-sm">You haven't linked an email yet. Link an email to recover your password.</p>
                )}
              </div>

              <form onSubmit={handleLinkEmail} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder={student?.email ? "Update email address..." : "Enter your email address..."}
                  className="flex-1 bg-dark text-white border border-white/10 shadow-inner rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-primary/40 transition-all text-white placeholder:text-gray-500/40"
                  required
                />
                <button
                  type="submit"
                  disabled={isLinking}
                  className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 font-headline font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {student?.email ? "Update Email" : "Link Email"} <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            <div className="bg-dark-card rounded-[2rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all duration-500">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                    <Lock className="w-5 h-5 text-primary" /> Password
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Instead of changing your password here, we will send a secure reset link to your linked email address.
                  </p>
                </div>
                <button
                  onClick={handleForgotPassword}
                  disabled={isSendingReset}
                  className="w-full sm:w-auto bg-primary text-[#064200] font-headline font-bold py-3.5 px-6 rounded-xl shadow-[0_0_20px_rgba(142,255,113,0.3)] hover:brightness-110 active:scale-[0.98] transition-all whitespace-nowrap disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Send Reset Link <Mail className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="mb-8">
            <div className="flex items-end justify-between mb-4">
              <h2 className="font-headline font-extrabold text-2xl tracking-tight text-white">Preferences</h2>
              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-gray-500">Personalization</span>
            </div>
            <div className="bg-dark-card rounded-[2rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all duration-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-dark-glass backdrop-blur-md flex items-center justify-center text-primary text-xl">
                    🌙
                  </div>
                  <div>
                    <div className="text-white font-semibold">Dark Mode</div>
                    <div className="text-xs text-gray-500">Optimized for nocturnal studying</div>
                  </div>
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
          </div>

          {/* Danger Zone Section */}
          <div className="mb-8">
            <div className="flex items-end justify-between mb-4">
              <h2 className="font-headline font-extrabold text-2xl tracking-tight text-error">Danger Zone</h2>
              <span className="font-label text-[10px] uppercase tracking-[0.2em] text-error/50">End Session</span>
            </div>
            <div className="bg-dark-card rounded-[2rem] border border-red-500/20 p-8 shadow-2xl relative overflow-hidden group hover:border-red-500/40 hover:shadow-[0_12px_40px_rgba(255,0,0,0.1)] transition-all duration-500">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center text-error"><LogOut className="w-5 h-5" /></div>
                  <div className="text-left">
                    <div className="text-error font-semibold">Log Out</div>
                    <div className="text-xs text-error/60">Securely sign out of this device</div>
                  </div>
                </div>
                <span className="text-error/40 group-hover:translate-x-1 transition-transform"><LogOut className="w-4 h-4" /></span>
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