import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../context/StudentAuthContext';
import toast from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';
import { useMsal } from "@azure/msal-react";
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, GraduationCap, BookOpen, Clock, Database } from 'lucide-react';

const StudentLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, googleLogin, microsoftLogin, token, loading: authLoading } = useStudentAuth();
  const { isDarkMode } = useTheme();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const navigate = useNavigate();
  const { instance } = useMsal();

  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      const result = await googleLogin(tokenResponse.access_token);
      setLoading(false);
      if (result.success) {
        toast.success(t('auth.signed_in_google'));
        navigate('/student/dashboard');
      } else {
        toast.error(result.message);
      }
    },
    onError: () => toast.error(t('auth.login_failed'))
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) return toast.error(t('auth.fill_fields'));
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
    if (result.success) {
      toast.success(t('auth.signed_in'));
      navigate('/student/dashboard');
    } else {
      toast.error(result.message || t('auth.login_failed'));
    }
  };

  const handleMicrosoftLogin = async () => {
    try {
      setLoading(true);
      const response = await instance.loginPopup({
        scopes: ["user.read", "openid", "profile", "email"],
        prompt: "select_account"
      });
      const result = await microsoftLogin(response.accessToken);
      setLoading(false);
      if (result.success) {
        toast.success(t('auth.signed_in_microsoft'));
        navigate('/student/dashboard');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      setLoading(false);
      if (error.name !== 'BrowserAuthError') {
        toast.error(t('auth.login_failed'));
      }
    }
  };

  useEffect(() => {
    if (!authLoading && token) navigate('/student/dashboard', { replace: true });
  }, [token, authLoading, navigate]);

  return (
    <div className={`min-h-screen w-full flex overflow-hidden font-sans relative ${isDarkMode ? 'bg-[#0c0c14] text-white' : 'bg-gray-50 text-gray-900'}`} dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* MAVI BACKGROUND ARCHITECTURE */}
      {/* Background -- single combined gradient layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: isDarkMode
              ? 'radial-gradient(ellipse at top right, rgba(16,185,129,0.06), transparent 50%), radial-gradient(ellipse at bottom left, rgba(20,184,166,0.06), transparent 50%)'
              : 'radial-gradient(ellipse at top right, rgba(16,185,129,0.05), transparent 50%), radial-gradient(ellipse at bottom left, rgba(16,185,129,0.05), transparent 50%)',
          }}
        />
      </div>

      <div className="w-full flex relative z-10">

        {/* LEFT PANEL: CINEMATIC BRANDING */}
        <div className={`hidden lg:flex w-[55%] flex-col justify-center items-center p-20 text-center relative overflow-hidden border-e transition-colors duration-500 ${isDarkMode ? 'border-white/5 bg-black' : 'border-gray-100 bg-white'}`}>
          
          {/* Logo Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative z-10"
          >
             <div className="w-64 h-64 flex items-center justify-center mb-0">
                <img src="/logo.png" className="w-full h-full object-contain" alt="Logo" />
             </div>
          </motion.div>

          {/* Core Branding */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
            className="relative z-10 space-y-10"
          >
            <div className="space-y-4">
               <h1 className={`text-[clamp(4rem,8vw,8rem)] font-black uppercase text-gray-900 dark:text-white ${isAr ? 'font-arabic leading-[1.2] tracking-normal' : 'leading-[0.9] tracking-tighter'}`}>
                 {t('auth.student_portal').split(' ')[0]} <br />
                 <span className="text-[#10b981] dark:text-[#2cfc7d]">{t('auth.student_portal').split(' ')[1]}.</span>
               </h1>
            </div>
            
            <p className={`text-2xl font-medium max-w-lg leading-relaxed mx-auto ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`}>
              {t('mavi.login_desc')}
            </p>

            <div className="flex justify-center gap-8 pt-6">
              {[GraduationCap, BookOpen, Clock].map((Icon, i) => (
                <div key={i} className="flex flex-col items-center gap-3 group">
                  <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center transition-all duration-500 group-hover:-translate-y-2 ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
                    <Icon className="w-7 h-7 text-[#10b981] opacity-40 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* RIGHT PANEL: SECURE ACCESS */}
            <div
               className={`flex-1 flex flex-col items-center justify-center p-8 lg:p-24 relative overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#010101]' : 'bg-[#fafafa]'}`}
            >
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.4, ease: "easeOut" }}
                 className="w-full max-w-md relative z-10 text-center flex flex-col"
               >
                  {/* Elegant Brand Icon for Mobile */}
                  <div className="lg:hidden mb-10 flex flex-col items-center">
                     <img src="/logo.png" className="w-20 h-20 object-contain mb-4" alt="Logo" />
                     <div className="h-px w-12 bg-emerald-500/30"></div>
                  </div>

                  <div className="text-start mb-12">
                     <h2 className="text-5xl lg:text-6xl font-black uppercase tracking-tighter text-gray-900 dark:text-white leading-none">{t('auth.sign_in')}</h2>
                     <p className="mt-4 text-sm font-bold text-gray-400 uppercase tracking-widest">{t('auth.student_portal')}</p>
                  </div>

            <form onSubmit={handleLogin} className="space-y-10">
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 ms-6">{t('auth.student_id')}</label>
                  <div className={`group relative flex items-center rounded-[2.5rem] border transition-all duration-500 focus-within:ring-8 focus-within:ring-emerald-500/5 ${isDarkMode ? 'bg-black/40 border-white/5 focus-within:border-emerald-500' : 'bg-gray-50 border-gray-100 focus-within:border-emerald-500 shadow-inner'}`}>
                    <Mail className={`ms-8 w-6 h-6 transition-colors ${isDarkMode ? 'text-white/10 group-focus-within:text-emerald-500' : 'text-gray-300 group-focus-within:text-emerald-500'}`} />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={t('auth.enter_id')}
                      className="w-full bg-transparent py-7 px-8 text-xl font-bold outline-none placeholder:opacity-20 uppercase tracking-tight"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 ms-6">{t('auth.access_key')}</label>
                  <div className={`group relative flex items-center rounded-[2.5rem] border transition-all duration-500 focus-within:ring-8 focus-within:ring-emerald-500/5 ${isDarkMode ? 'bg-black/40 border-white/5 focus-within:border-emerald-500' : 'bg-gray-50 border-gray-100 focus-within:border-emerald-500 shadow-inner'}`}>
                    <Lock className={`ms-8 w-6 h-6 transition-colors ${isDarkMode ? 'text-white/10 group-focus-within:text-emerald-500' : 'text-gray-300 group-focus-within:text-emerald-500'}`} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent py-7 px-8 text-xl font-bold outline-none tracking-widest placeholder:tracking-normal placeholder:opacity-20"
                    />
                  </div>
                </div>
              </div>

              <motion.button
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  className={`w-full font-black py-7 rounded-[2.5rem] flex items-center justify-center gap-4 text-xs uppercase tracking-[0.6em] shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden group ${isDarkMode ? 'bg-white text-black' : 'bg-gray-900 text-white'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#2cfc7d]/0 via-[#2cfc7d]/20 to-[#2cfc7d]/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      <span>{t('auth.processing')}</span>
                    </div>
                  ) : <>{t('auth.authenticate')} <ArrowRight className={`w-6 h-6 ${isAr ? 'rotate-180' : ''}`} /></>}
                </motion.button>

                <div className="grid grid-cols-2 gap-5 pt-2">
                  <button onClick={() => triggerGoogleLogin()} type="button" className={`flex items-center justify-center gap-4 py-6 border rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${isDarkMode ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-[#10b981]' : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-[#10b981]'}`}>
                    <img src="https://www.google.com/favicon.ico" className="w-4 h-4 grayscale group-hover:grayscale-0 transition-all" alt="G" /> {t('auth.google_sign_in')}
                  </button>
                  <button onClick={handleMicrosoftLogin} type="button" className={`flex items-center justify-center gap-4 py-6 border rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${isDarkMode ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-blue-500' : 'bg-white border-gray-100 hover:bg-gray-50 hover:border-blue-500'}`}>
                    <img src="https://www.microsoft.com/favicon.ico" className="w-4 h-4 grayscale group-hover:grayscale-0 transition-all" alt="M" /> {t('auth.microsoft_sign_in')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Floating Aesthetic Nodes */}
          <div className="absolute bottom-10 left-10 w-24 h-24 opacity-5 pointer-events-none">
             <Database className="w-full h-full text-[#2cfc7d]" />
          </div>
        </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
        .font-arabic { font-family: 'Cairo', sans-serif !important; }
      `}</style>
    </div>
  );
};

export default StudentLogin;