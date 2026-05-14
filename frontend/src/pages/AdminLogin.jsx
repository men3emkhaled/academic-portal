import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Terminal, Lock, Fingerprint, ArrowRight, ShieldCheck, Activity, Cpu } from 'lucide-react';

const AdminLogin = () => {
  const { token, login } = useAuth();
  const { isDarkMode } = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  // 3D Tilt Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 100, damping: 20 });
  const springY = useSpring(y, { stiffness: 100, damping: 20 });
  const rotateX = useTransform(springY, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-7deg", "7deg"]);

  useEffect(() => {
    if (token) navigate('/admin', { replace: true });
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/admin/login', credentials);
      login(res.data.token);
      toast.success(t('auth.admin_portal') + ' Authorized');
      navigate('/admin', { replace: true });
    } catch (error) {
      toast.error(t('auth.login_failed'));
    } finally {
      setLoading(false);
    }
  };

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
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 12, repeat: Infinity }}
          className={`absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] blur-[150px] rounded-full ${isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-500/5'}`}
        />
        <div className={`absolute inset-0 ${isDarkMode ? 'bg-[radial-gradient(circle_at_center,#ffffff02_1px,transparent_1px)]' : 'bg-[radial-gradient(circle_at_center,#00000003_1px,transparent_1px)]'} bg-[size:5rem_5rem]`}></div>
      </div>

      <div className="w-full flex relative z-10">
        {/* LEFT PANEL: CENTERED ADMIN AUTHORITY */}
        <motion.div 
          layoutId="hero-panel"
          className={`hidden lg:flex w-[50%] flex-col justify-center items-center text-center p-24 border-r transition-colors ${isDarkMode ? 'border-white/5 bg-black/20' : 'border-gray-100 bg-white/40'} backdrop-blur-3xl`}
        >
           <motion.div 
             style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
             onMouseMove={(e) => {
               const rect = e.currentTarget.getBoundingClientRect();
               x.set((e.clientX - rect.left) / rect.width - 0.5);
               y.set((e.clientY - rect.top) / rect.height - 0.5);
             }}
             onMouseLeave={() => { x.set(0); y.set(0); }}
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
                 <motion.h1 layoutId="portal-title" className="text-8xl font-black tracking-tighter leading-none">
                    {t('auth.admin_portal').split(' ')[0]} <br />
                    <span className="text-emerald-500">{t('auth.admin_portal').split(' ')[1]}.</span>
                 </motion.h1>
                 <motion.p layoutId="portal-desc" className={`text-2xl font-medium transition-colors ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`}>
                    {t('auth.next_gen_node')}.
                 </motion.p>
              </div>

              <div className="flex gap-6">
                 {[ShieldCheck, Activity, Cpu].map((Icon, i) => (
                    <div key={i} className={`w-16 h-16 rounded-2xl border flex items-center justify-center transition-all ${isDarkMode ? 'bg-white/[0.02] border-white/5 text-emerald-500/40' : 'bg-white/60 border-gray-100 text-emerald-600/60'}`}>
                       <Icon className="w-7 h-7" />
                    </div>
                 ))}
              </div>
           </motion.div>
        </motion.div>

        {/* RIGHT PANEL: SECURE LOGIN */}
        <motion.div 
          layoutId="form-panel"
          className={`flex-1 flex flex-col items-center justify-center p-8 lg:p-24 backdrop-blur-md ${isDarkMode ? 'bg-[#010101]/50' : 'bg-white/40'}`}
        >
           <div className="w-full max-w-sm space-y-12">
              <div className="space-y-3">
                 <h2 className="text-5xl font-black uppercase tracking-tighter">{t('auth.sign_in')}.</h2>
                 <p className={`text-[11px] font-black uppercase tracking-[0.6em] ${isDarkMode ? 'text-white/20' : 'text-gray-300'}`}>{t('auth.institutional_access')}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                 <div className="space-y-4">
                    <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`}>{t('auth.admin_id')}</label>
                    <div className={`relative flex items-center border rounded-[2rem] transition-all focus-within:ring-4 focus-within:ring-emerald-500/10 ${isDarkMode ? 'bg-white/[0.02] border-white/10 focus-within:border-emerald-500/50' : 'bg-gray-50 border-gray-100 focus-within:border-emerald-500/50'}`}>
                       <Terminal className={`${i18n.language === 'ar' ? 'mr-7' : 'ml-7'} w-6 h-6 ${isDarkMode ? 'text-white/20' : 'text-gray-300'}`} />
                       <input 
                         type="text"
                         value={credentials.username}
                         onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                         placeholder={t('auth.enter_id')}
                         className="w-full bg-transparent py-6 px-8 text-xl font-bold outline-none"
                       />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`}>{t('auth.access_key')}</label>
                    <div className={`relative flex items-center border rounded-[2rem] transition-all focus-within:ring-4 focus-within:ring-emerald-500/10 ${isDarkMode ? 'bg-white/[0.02] border-white/10 focus-within:border-emerald-500/50' : 'bg-gray-50 border-gray-100 focus-within:border-emerald-500/50'}`}>
                       <Fingerprint className={`${i18n.language === 'ar' ? 'mr-7' : 'ml-7'} w-6 h-6 ${isDarkMode ? 'text-white/20' : 'text-gray-300'}`} />
                       <input 
                         type="password"
                         value={credentials.password}
                         onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                         placeholder="••••••••"
                         className="w-full bg-transparent py-6 px-8 text-xl font-bold outline-none tracking-widest"
                       />
                    </div>
                 </div>

                 <motion.button 
                   whileHover={{ scale: 1.02, y: -2 }}
                   whileTap={{ scale: 0.98 }}
                   className={`w-full font-black py-6 rounded-[2.5rem] flex items-center justify-center gap-4 text-xs uppercase tracking-[0.5em] shadow-2xl transition-all relative overflow-hidden group ${isDarkMode ? 'bg-emerald-500 text-white' : 'bg-gray-900 text-white'}`}
                 >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    {loading ? "..." : <>{t('auth.sign_in')} <ArrowRight className="w-5 h-5" /></>}
                 </motion.button>
              </form>
           </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AdminLogin;
