import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDoctorAuth } from '../context/DoctorAuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { GraduationCap, Lock, Mail, ChevronRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const DoctorLogin = () => {
  const { token, login } = useDoctorAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      navigate('/doctor/dashboard', { replace: true });
    }
  }, [token, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/doctor/login', credentials);
      login(res.data.token, res.data.doctor);
      toast.success('Welcome back, Dr. ' + res.data.doctor.name);
      navigate('/doctor/dashboard', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-[#050505] relative overflow-hidden transition-colors duration-300">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-500/5 dark:bg-violet-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md bg-white/80 dark:bg-[#111111]/80 border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-10 shadow-xl dark:shadow-2xl backdrop-blur-2xl animate-fadeInUp relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-violet-500/10 dark:bg-violet-500/20 rounded-2xl flex items-center justify-center border border-violet-500/20 dark:border-violet-500/30">
            <GraduationCap className="w-10 h-10 text-violet-500 dark:text-violet-400" />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center mb-2 tracking-tight">Doctor Portal</h2>
        <p className="text-gray-500 dark:text-slate-400 text-center mb-8 text-sm uppercase tracking-widest font-medium">Faculty Access Node</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-gray-700 dark:text-slate-300 ml-4 text-xs font-bold uppercase tracking-widest">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 dark:text-slate-500" />
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                className="w-full bg-gray-100 dark:bg-slate-900/50 border border-gray-200 dark:border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:border-violet-500/50 focus:outline-none transition-all"
                placeholder="doctor@university.edu"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-gray-700 dark:text-slate-300 ml-4 text-xs font-bold uppercase tracking-widest">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 dark:text-slate-500" />
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full bg-gray-100 dark:bg-slate-900/50 border border-gray-200 dark:border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:border-violet-500/50 focus:outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-500 text-white dark:text-black font-bold py-4 rounded-2xl transition-all hover:scale-[1.02] hover:shadow-[0_10px_20px_rgba(139,92,246,0.2)] dark:hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100 mt-4 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white dark:border-black/20 border-t-transparent dark:border-t-black rounded-full animate-spin" />
            ) : (
              <>Sign In <ChevronRight className="w-5 h-5" /></>
            )}
          </button>
        </form>
        <div className="mt-6 flex justify-center">
          <button onClick={toggleTheme} className="p-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-violet-500 transition-all">
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorLogin;
