import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDoctorAuth } from '../context/DoctorAuthContext';
import doctorApi from '../services/doctorApi';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, GraduationCap, Microscope, BookOpen, Eye, EyeOff } from 'lucide-react';

const DoctorLogin = () => {
   const { token, login } = useDoctorAuth();
   const { isDarkMode } = useTheme();
   const { t, i18n } = useTranslation();
   const navigate = useNavigate();
   const [credentials, setCredentials] = useState({ email: '', password: '' });
   const [loading, setLoading] = useState(false);
   const [showPassword, setShowPassword] = useState(false);

   useEffect(() => {
      if (token) navigate('/doctor/dashboard', { replace: true });
   }, [token, navigate]);

   const handleLogin = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
         const res = await doctorApi.post('/doctor/login', credentials);
         login(res.data.token, res.data.doctor);
         toast.success(t('auth.instructor_portal') + ' Authorized');
         navigate('/doctor/dashboard', { replace: true });
      } catch (error) {
         toast.error(error.response?.data?.message || t('auth.login_failed'));
      } finally {
         setLoading(false);
      }
   };

   return (
      <div
         className={`min-h-screen w-full flex overflow-hidden font-sans relative ${isDarkMode ? 'bg-[#010101] text-white' : 'bg-[#fafafa] text-gray-900'}`}
      >
         {/* Background -- single combined gradient layer */}
         <div className="absolute inset-0 z-0 pointer-events-none">
            <div
               className="absolute inset-0"
               style={{
                  background: isDarkMode
                     ? 'radial-gradient(ellipse at top right, rgba(139,92,246,0.06), transparent 50%), radial-gradient(ellipse at bottom left, rgba(217,70,239,0.06), transparent 50%)'
                     : 'radial-gradient(ellipse at top right, rgba(139,92,246,0.05), transparent 50%), radial-gradient(ellipse at bottom left, rgba(217,70,239,0.05), transparent 50%)',
               }}
            />
         </div>

         <div className="w-full flex relative z-10">
            {/* LEFT PANEL: CENTERED FACULTY PRESTIGE */}
            <div
               className={`hidden lg:flex w-[55%] flex-col justify-center items-center text-center p-20 relative overflow-hidden border-e transition-colors duration-500 ${isDarkMode ? 'border-white/5 bg-black/20' : 'border-gray-100 bg-white/40'}`}
            >
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

               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
                  className="relative z-10 space-y-10"
               >
                  <div className="space-y-4">
                     <h1 className={`text-[clamp(4rem,8vw,8rem)] font-black uppercase text-gray-900 dark:text-white ${i18n.language === 'ar' ? 'font-arabic leading-[1.2] tracking-normal' : 'leading-[0.9] tracking-tighter'}`}>
                        {t('auth.instructor_portal').split(' ')[0]} <br />
                        <span className="text-violet-500">{t('auth.instructor_portal').split(' ')[1]}.</span>
                     </h1>
                  </div>

                  <p className={`text-2xl font-medium max-w-lg leading-relaxed mx-auto ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`}>
                     {t('mavi.login_desc')}
                  </p>

                  <div className="flex justify-center gap-8 pt-6">
                     {[GraduationCap, Microscope, BookOpen].map((Icon, i) => (
                        <div key={Icon?.displayName || i} className="flex flex-col items-center gap-3 group">
                           <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center transition-all duration-500 group-hover:-translate-y-2 ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
                              <Icon className="w-7 h-7 text-violet-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                           </div>
                        </div>
                     ))}
                  </div>
               </motion.div>
            </div>

            {/* RIGHT PANEL: SECURE ACCESS */}
            <div
               className={`flex-1 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-24 relative overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#010101]' : 'bg-[#fafafa]'}`}
            >
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="w-full max-w-md relative z-10 text-center flex flex-col"
               >
                  {/* Elegant Brand Icon for Mobile */}
                  <div className="lg:hidden mb-6 flex flex-col items-center">
                     <img src="/logo.png" className="w-20 h-20 object-contain mb-4" alt="Logo" />
                     <div className="h-px w-12 bg-violet-500/30"></div>
                  </div>

                  <div className="text-start mb-6 lg:mb-8">
                     <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-gray-900 dark:text-white leading-none">{t('auth.sign_in')}</h2>
                     <p className="mt-2 text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest">{t('auth.instructor_portal')}</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-6 lg:space-y-8">
                     <div className="space-y-6">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 ms-6">{t('auth.instructor_id')}</label>
                           <div className={`group relative flex items-center rounded-[1.75rem] border transition-all duration-500 focus-within:ring-8 focus-within:ring-violet-500/5 ${isDarkMode ? 'bg-black/40 border-white/5 focus-within:border-violet-500' : 'bg-gray-50 border-gray-100 focus-within:border-violet-500 shadow-inner'}`}>
                              <Mail className={`ms-6 w-5 h-5 transition-colors ${isDarkMode ? 'text-white/10 group-focus-within:text-violet-500' : 'text-gray-300 group-focus-within:text-violet-500'}`} />
                              <input
                                 type="email"
                                 value={credentials.email}
                                 onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                                 placeholder="staff@znu.edu"
                                 className="w-full bg-transparent py-4 px-6 text-base font-bold outline-none placeholder:opacity-20 tracking-tight"
                              />
                           </div>
                        </div>

                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 ms-6">{t('auth.access_key')}</label>
                           <div className={`group relative flex items-center rounded-[1.75rem] border transition-all duration-500 focus-within:ring-8 focus-within:ring-violet-500/5 ${isDarkMode ? 'bg-black/40 border-white/5 focus-within:border-violet-500' : 'bg-gray-50 border-gray-100 focus-within:border-violet-500 shadow-inner'}`}>
                              <Lock className={`ms-6 w-5 h-5 transition-colors ${isDarkMode ? 'text-white/10 group-focus-within:text-violet-500' : 'text-gray-300 group-focus-within:text-violet-500'}`} />
                              <input
                                 type={showPassword ? 'text' : 'password'}
                                 value={credentials.password}
                                 onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                 placeholder="••••••••"
                                 className="w-full bg-transparent py-4 px-6 text-base font-bold outline-none tracking-widest placeholder:tracking-normal placeholder:opacity-20"
                              />
                              <button type="button" onClick={() => setShowPassword(!showPassword)} className="me-4 p-2 rounded-full transition-colors hover:bg-white/5">
                                 {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                              </button>
                           </div>
                        </div>
                     </div>

                     <motion.button
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                        className={`w-full font-black py-4 rounded-[1.75rem] flex items-center justify-center gap-4 text-xs uppercase tracking-[0.6em] shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden group ${isDarkMode ? 'bg-white text-black' : 'bg-gray-900 text-white'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                     >
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/20 to-violet-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        {loading ? (
                           <div className="flex items-center gap-3">
                              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                              <span>{t('auth.processing')}</span>
                           </div>
                        ) : <>{t('auth.authenticate')} <ArrowRight className={`w-5 h-5 ${i18n.language === 'ar' ? 'rotate-180' : ''}`} /></>}
                     </motion.button>
                  </form>
               </motion.div>
            </div>
         </div>
      </div>
   );
};

export default DoctorLogin;
