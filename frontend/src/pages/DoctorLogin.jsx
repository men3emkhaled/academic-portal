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
      toast.success('Welcome back, Inst. ' + res.data.doctor.name);
      navigate('/doctor/dashboard', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-[#0a0a0a] overflow-hidden font-sans text-gray-900 dark:text-white transition-colors duration-500 relative pt-[48px]">
      

      {/* LEFT PANEL: Branding (Matches Student style) */}
      <div className="hidden lg:flex w-1/2 relative bg-gray-50 dark:bg-[#0a0a0a] items-center justify-center p-12 overflow-hidden border-r border-gray-200 dark:border-white/5 transition-colors duration-500">
        <div className="absolute inset-0 z-0 opacity-60 dark:opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-violet-500/20 blur-[150px] rounded-full animate-[spin_20s_linear_infinite]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] bg-indigo-500/10 blur-[150px] rounded-full animate-pulse-slow"></div>
        </div>

        <div className="relative z-10 w-full max-w-lg flex flex-col gap-12 text-center items-center">
          <div className="space-y-6 animate-fadeInUp">
            <div className="relative group">
              <div className="absolute -inset-8 bg-violet-500/10 blur-3xl rounded-full opacity-60"></div>
              <div className="relative inline-flex items-center justify-center w-48 h-48 rounded-full bg-white dark:bg-white/5 border border-violet-500/20 overflow-hidden shadow-2xl">
                <img src="/logo.png" alt="ZNU Logo" className="w-full h-full object-contain p-6" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter leading-tight">
                Instructor <br />
                <span className="text-violet-500">Portal.</span>
              </h1>
              <p className="text-xs font-black uppercase tracking-[0.5em] text-violet-500/60 mt-2">Faculty Login</p>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed max-w-md mx-auto font-medium">
              Welcome, Instructor! Login to manage your courses and students.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: The Form (Matches Student style) */}
      <div className="w-full lg:w-1/2 flex flex-col relative justify-center items-center p-6 sm:p-12 lg:p-20 bg-gray-50 dark:bg-[#0a0a0a]">
        <div className="w-full max-w-md relative z-10 animate-fadeInUp">
          <div className="mb-10 text-center lg:text-left">
            <div className="lg:hidden inline-flex mb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white dark:bg-white/5 border border-violet-500/20 shadow-xl overflow-hidden">
                <img src="/logo.png" alt="ZNU Logo" className="w-full h-full object-contain p-4" />
              </div>
            </div>
            <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Login</h2>
            <p className="text-gray-500 mt-2 text-sm font-medium">Please enter your email and password.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 pl-1">Email Address</label>
              <div className="relative flex items-center bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
                <div className="pl-5 pr-1 flex items-center justify-center shrink-0">
                  <Mail className={`w-6 h-6 transition-all duration-500 ${isDarkMode ? 'text-white' : 'text-black'}`} />
                </div>
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  className="w-full bg-transparent py-4 px-5 text-gray-900 dark:text-white font-bold text-xl focus:outline-none"
                  placeholder="doctor@university.edu"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 pl-1">Password</label>
              <div className="relative flex items-center bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
                <div className="pl-5 pr-1 flex items-center justify-center shrink-0">
                  <Lock className={`w-6 h-6 transition-all duration-500 ${isDarkMode ? 'text-white' : 'text-black'}`} />
                </div>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full bg-transparent py-4 px-5 text-gray-900 dark:text-white font-bold text-xl tracking-[0.3em] placeholder:tracking-normal focus:outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full overflow-hidden bg-violet-600 dark:bg-violet-500 text-white dark:text-black font-extrabold text-lg py-4 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl disabled:opacity-50 group mt-4"
            >
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 dark:via-black/20 to-transparent skew-x-12"></div>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-12 pt-6 border-t border-gray-200 dark:border-white/5 text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Authorized Faculty Use Only</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorLogin;
