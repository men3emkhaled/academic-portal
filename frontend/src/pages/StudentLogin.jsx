import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../context/StudentAuthContext';
import toast from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';
import { useMsal } from "@azure/msal-react";
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Fingerprint, Lock, Eye, EyeOff, ArrowRight, Sparkles, Globe, Zap, Stars } from 'lucide-react';

const StudentLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, googleLogin, microsoftLogin, token, loading: authLoading } = useStudentAuth();
  const { isDarkMode } = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { instance } = useMsal();

  // --- SSO HANDLERS ---
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
      console.error(error);
      if (error.name !== 'BrowserAuthError') {
        toast.error(t('auth.login_failed'));
      }
    }
  };

  // 3D Tilt Values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 100, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 20 });
  const rotateX = useTransform(springY, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-8deg", "8deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  useEffect(() => {
    if (!authLoading && token) navigate('/student/dashboard', { replace: true });
  }, [token, authLoading, navigate]);

  const particles = Array.from({ length: 20 });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`min-h-screen w-full flex overflow-hidden font-sans transition-colors duration-700 relative ${isDarkMode ? 'bg-[#010101] text-white' : 'bg-[#fafafa] text-gray-900'}`}
    >
      {/* Background Living Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div 
          layoutId="bg-glow-1"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
          className={`absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] blur-[150px] rounded-full ${isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-500/5'}`}
        />
        <motion.div 
          layoutId="bg-glow-2"
          className={`absolute bottom-[-10%] left-[-5%] w-[50vw] h-[50vw] blur-[150px] rounded-full ${isDarkMode ? 'bg-blue-600/5' : 'bg-blue-600/[0.03]'}`}
        />
        {particles.map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: Math.random() * 100 + "%", y: Math.random() * 100 + "%" }}
            animate={{ y: ["-10%", "110%"], opacity: [0, 0.5, 0] }}
            transition={{ duration: Math.random() * 10 + 10, repeat: Infinity, ease: "linear", delay: Math.random() * 10 }}
            className={`absolute w-1 h-1 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-black/5'}`}
          />
        ))}
        <div className={`absolute inset-0 ${isDarkMode ? 'bg-[radial-gradient(circle_at_center,#ffffff02_1px,transparent_1px)]' : 'bg-[radial-gradient(circle_at_center,#00000003_1px,transparent_1px)]'} bg-[size:4rem_4rem]`}></div>
      </div>

      <div className="w-full flex relative z-10">
        
        {/* LEFT PANEL: CENTERED BRANDING */}
        <motion.div 
          layoutId="hero-panel"
          className={`hidden lg:flex w-[50%] flex-col justify-center items-center text-center p-24 border-e transition-colors ${isDarkMode ? 'border-white/5 bg-black/20' : 'border-gray-100 bg-white/40'} backdrop-blur-3xl`}
        >
           <motion.div 
             style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
             onMouseMove={handleMouseMove}
             onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
             className="flex flex-col items-center space-y-16"
           >
              {/* MAGNIFIED LOGO - NO BACKGROUND */}
              <motion.div layoutId="logo-container" className="relative w-max">
                 <div className={`absolute -inset-20 blur-[100px] rounded-full ${isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-500/10'}`}></div>
                 <motion.div 
                   whileHover={{ scale: 1.05 }}
                   className="relative w-56 h-56 flex items-center justify-center p-0"
                 >
                    <img src="/logo.png" className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]" alt="ZNU" />
                 </motion.div>
              </motion.div>

              <div className="space-y-6">
                 <motion.h1 
                   layoutId="portal-title" 
                   initial={{ y: 20, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   className="text-8xl font-black tracking-tighter leading-none"
                 >
                    {t('auth.student_portal').split(' ')[0]} <br />
                    <span className="text-emerald-500">{t('auth.student_portal').split(' ')[1]}.</span>
                 </motion.h1>
                 <motion.p layoutId="portal-desc" className={`text-2xl font-medium max-w-sm transition-colors ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`}>
                    {t('auth.next_gen_node')}.
                 </motion.p>
              </div>

              <div className="flex gap-4">
                 {[Globe, Zap, Stars].map((Icon, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ y: -8, backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)" }}
                      className={`w-16 h-16 rounded-2xl border flex items-center justify-center transition-all ${isDarkMode ? 'bg-white/[0.02] border-white/5 text-emerald-500/40' : 'bg-white/60 border-gray-100 text-emerald-600/60'}`}
                    >
                       <Icon className="w-7 h-7" />
                    </motion.div>
                 ))}
              </div>
           </motion.div>
        </motion.div>

        {/* RIGHT PANEL: SECURE AUTH */}
        <motion.div 
          layoutId="form-panel"
          className={`flex-1 flex flex-col items-center justify-center p-8 lg:p-24 backdrop-blur-md ${isDarkMode ? 'bg-[#010101]/50' : 'bg-white/40'}`}
        >
           <div className="w-full max-w-sm space-y-12">
              <div className="space-y-3">
                 <h2 className="text-5xl font-black uppercase tracking-tighter">{t('auth.sign_in')}</h2>
                 <p className={`text-[11px] font-black uppercase tracking-[0.6em] ${isDarkMode ? 'text-white/20' : 'text-gray-300'}`}>{t('auth.institutional_access')}</p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); login(username, password); }} className="space-y-8">
                 <div className="space-y-4">
                    <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`}>{t('auth.student_id')}</label>
                    <div className={`relative flex items-center border rounded-[2rem] transition-all focus-within:ring-4 focus-within:ring-emerald-500/10 ${isDarkMode ? 'bg-white/[0.02] border-white/10 focus-within:border-emerald-500/50' : 'bg-gray-50 border-gray-100 focus-within:border-emerald-500/50'}`}>
                       <Fingerprint className={`ms-7 w-6 h-6 transition-colors ${isDarkMode ? 'text-white/20' : 'text-gray-300'}`} />
                       <input 
                         type="text"
                         value={username}
                         onChange={(e) => setUsername(e.target.value)}
                         placeholder={t('auth.enter_id')}
                         className="w-full bg-transparent py-6 px-8 text-xl font-bold outline-none placeholder:opacity-20"
                       />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`}>{t('auth.access_key')}</label>
                    <div className={`relative flex items-center border rounded-[2rem] transition-all focus-within:ring-4 focus-within:ring-blue-500/10 ${isDarkMode ? 'bg-white/[0.02] border-white/10 focus-within:border-blue-500/50' : 'bg-gray-50 border-gray-100 focus-within:border-blue-500/50'}`}>
                       <Lock className={`ms-7 w-6 h-6 transition-colors ${isDarkMode ? 'text-white/20' : 'text-gray-300'}`} />
                       <input 
                         type={showPassword ? 'text' : 'password'}
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         placeholder="••••••••"
                         className="w-full bg-transparent py-6 px-8 text-xl font-bold outline-none tracking-widest placeholder:tracking-normal placeholder:opacity-20"
                       />
                    </div>
                 </div>

                 <motion.button 
                   whileHover={{ scale: 1.02, y: -2 }}
                   whileTap={{ scale: 0.98 }}
                   disabled={loading}
                   className={`w-full font-black py-6 rounded-[2.5rem] flex items-center justify-center gap-4 text-xs uppercase tracking-[0.5em] shadow-2xl transition-all relative overflow-hidden group ${isDarkMode ? 'bg-white text-black' : 'bg-gray-900 text-white'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                 >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    {loading ? t('auth.processing') : <>{t('auth.authenticate')} <ArrowRight className="w-5 h-5" /></>}
                 </motion.button>

                 <div className="grid grid-cols-2 gap-5 pt-4">
                    <button onClick={() => triggerGoogleLogin()} type="button" className={`flex items-center justify-center gap-4 py-5 border rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${isDarkMode ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]' : 'bg-white border-gray-100 hover:bg-gray-50'}`}>
                       <img src="https://www.google.com/favicon.ico" className="w-4 h-4 grayscale" alt="G" /> {t('auth.google_sign_in')}
                    </button>
                    <button onClick={handleMicrosoftLogin} type="button" className={`flex items-center justify-center gap-4 py-5 border rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${isDarkMode ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]' : 'bg-white border-gray-100 hover:bg-gray-50'}`}>
                       <img src="https://www.microsoft.com/favicon.ico" className="w-4 h-4 grayscale" alt="M" /> {t('auth.microsoft_sign_in')}
                    </button>
                 </div>
              </form>
           </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StudentLogin;