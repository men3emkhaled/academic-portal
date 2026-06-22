import React, { useState, useRef } from 'react';
import { 
  Settings2, User, Fingerprint, Lock, 
  Moon, Sun, LogOut, Mail, Send, 
  Camera, Loader2, ShieldCheck, 
  CheckCircle2, Languages, Zap, 
  ArrowRight, Star, Layers,
  Trash2, ShieldAlert, Eye, EyeOff
} from 'lucide-react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { transliterateArabic } from '../utils/transliteration';

const StudentSettings = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  
  const isAr = i18n.language === 'ar';
  
  const [emailInput, setEmailInput] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showPwd, setShowPwd] = useState({ old: false, new: false, confirm: false });
  const fileInputRef = useRef(null);
  const { student, logout, linkEmail, changePassword, uploadAvatar } = useStudentAuth();

  const handleLogout = () => {
    logout();
    navigate('/student/login');
    toast.success(`${t('sidebar.logout')} ${t('auth.success')}`);
  };

  const handleLinkEmail = async (e) => {
    e.preventDefault();
    if (!emailInput) {
      toast.error(t('settings.enter_email'));
      return;
    }
    
    setIsLinking(true);
    const result = await linkEmail(emailInput);
    setIsLinking(false);
    
    if (result.success) {
      toast.success(t('settings.verification_sent'));
      setEmailInput('');
    } else {
      toast.error(result.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordData.oldPassword || !passwordData.newPassword) {
      toast.error(t('auth.all_fields'));
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t('settings.pass_mismatch'));
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error(t('settings.pass_length'));
      return;
    }

    setIsChangingPassword(true);
    const result = await changePassword(passwordData.oldPassword, passwordData.newPassword);
    setIsChangingPassword(false);

    if (result.success) {
      toast.success(t('settings.pass_updated'));
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      toast.error(result.message);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('settings.select_image'));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error(t('settings.image_size'));
      return;
    }

    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append('avatar', file);

    const result = await uploadAvatar(formData);
    setIsUploadingAvatar(false);

    if (result.success) {
      toast.success(t('settings.avatar_updated'));
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0c0c14] text-gray-900 dark:text-white font-sans transition-colors duration-500 overflow-x-hidden relative" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] inset-inline-end-[-5%] w-[50vw] h-[50vw] bg-[#059669]/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] inset-inline-start-[-5%] w-[40vw] h-[40vw] bg-[#34d399]/3 blur-[100px] rounded-full"></div>
      </div>

      <Sidebar onLogout={handleLogout} />

      <main className="md:ps-72 min-h-screen relative z-10 flex flex-col">
        
        {/* HERO SECTION */}
        <section className="px-6 lg:px-10 pt-16 pb-12 max-w-[1500px] mx-auto w-full space-y-12 text-start">
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            <div className="space-y-4 text-start">
              <h1 className={`text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-[0.95] tracking-tighter uppercase text-gray-900 dark:text-white ${isAr ? 'font-arabic' : ''}`}>
                {t('mavi.settings')}
              </h1>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
            
            {/* PROFILE HERO BENTO CARD */}
            <div className="lg:col-span-12 bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[3rem] p-10 md:p-16 flex flex-col md:flex-row items-center gap-12 group hover:shadow-2xl transition-all duration-700 text-start overflow-hidden relative">
               <div className="absolute top-[-20%] inset-inline-end-[-10%] w-[40%] h-[150%] bg-[#34d399]/5 blur-[80px] rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-1000"></div>
               
               {/* Avatar Container */}
               <div className="relative shrink-0 z-10">
                  <div 
                    className="w-48 h-48 rounded-[3.5rem] bg-gray-50 dark:bg-white/5 border-2 border-gray-100 dark:border-white/10 flex items-center justify-center overflow-hidden shadow-2xl cursor-pointer group/avatar hover:border-[#059669] dark:hover:border-[#34d399] transition-all duration-500"
                    onClick={() => fileInputRef.current?.click()}
                  >
                     {student?.avatar_url ? (
                       <img src={student.avatar_url} alt={student.name} className={`w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-700 ${isUploadingAvatar ? 'opacity-30 blur-sm' : ''}`} />
                     ) : (
                       <User className="w-20 h-20 text-gray-200 dark:text-white/10 group-hover/avatar:text-[#059669] transition-colors" />
                     )}
                     
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                        <Camera className="w-10 h-10 text-white" />
                     </div>

                     {isUploadingAvatar && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                           <Loader2 className="w-10 h-10 text-[#34d399] animate-spin" />
                        </div>
                     )}
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
               </div>

               {/* Profile Info */}
               <div className="flex-1 space-y-6 z-10 text-center md:text-start">
                  <div className="space-y-2">
                     <div className="flex items-center justify-center md:justify-start gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#059669] dark:text-[#34d399]">{t('mavi.verification_uid')}</span>
                        <div className="h-px w-10 bg-gray-100 dark:bg-white/10"></div>
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">ZNU-{student?.id}</span>
                     </div>
                     <h2 className={`text-4xl md:text-6xl font-black tracking-tighter uppercase text-gray-900 dark:text-white ${isAr ? 'font-arabic' : ''}`}>
                        {isAr ? student?.name : transliterateArabic(student?.name)}
                     </h2>
                  </div>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                     <div className="bg-gray-50 dark:bg-white/5 px-6 py-3 rounded-2xl border border-gray-100 dark:border-white/5">
                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 block mb-1">{t('settings.level')}</span>
                        <span className="text-sm font-black uppercase text-gray-900 dark:text-white">
                           {student?.level === 1 ? t('settings.level_1') :
                              student?.level === 2 ? t('settings.level_2') :
                              student?.level === 3 ? t('settings.level_3') :
                              student?.level === 4 ? t('settings.level_4') : t('settings.level_num', { num: student?.level })}
                        </span>
                     </div>
                     <div className="bg-gray-50 dark:bg-white/5 px-6 py-3 rounded-2xl border border-gray-100 dark:border-white/5">
                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 block mb-1">{t('settings.section')}</span>
                        <span className="text-sm font-black uppercase text-gray-900 dark:text-white">{student?.section || 'X-00'}</span>
                     </div>
                     <div className="bg-[#059669] dark:bg-[#34d399] px-6 py-3 rounded-2xl shadow-lg">
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/50 dark:text-black/50 block mb-1">{t('mavi.status')}</span>
                        <span className="text-sm font-black uppercase text-white dark:text-black">{t('mavi.active')}</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* SECURITY BENTO CARD */}
            <div className="lg:col-span-8 bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[3rem] p-10 md:p-12 space-y-12 text-start group hover:shadow-2xl transition-all duration-700">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                     <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                     <h3 className="text-2xl font-black uppercase tracking-tight">{t('settings.security')}</h3>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">{t('mavi.encrypted_protocol')}</p>
                  </div>
               </div>

               {/* Email Form */}
               <div className="space-y-6">
                  <div className="flex items-center gap-3">
                     <Mail className="w-4 h-4 text-gray-400" />
                     <h4 className="text-xs font-black uppercase tracking-widest">{t('settings.recovery_email')}</h4>
                  </div>
                  <form onSubmit={handleLinkEmail} className="flex flex-col md:flex-row gap-4">
                     <input 
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder={student?.email || t('settings.enter_email')}
                        className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-[2rem] px-8 py-5 font-black text-xs uppercase tracking-widest focus:ring-2 focus:ring-[#059669] outline-none"
                     />
                     <button 
                        type="submit"
                        disabled={isLinking}
                        className="bg-black dark:bg-white text-white dark:text-black px-10 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-40"
                     >
                        {isLinking ? t('mavi.synching') : t('settings.link')}
                     </button>
                  </form>
               </div>

               <div className="h-px bg-black/5 dark:bg-white/5"></div>

               {/* Password Form */}
               <div className="space-y-8">
                  <div className="flex items-center gap-3">
                     <Lock className="w-4 h-4 text-gray-400" />
                     <h4 className="text-xs font-black uppercase tracking-widest">{t('settings.change_password')}</h4>
                  </div>
                  <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="md:col-span-2 relative">
                        <input 
                           type={showPwd.old ? 'text' : 'password'}
                           value={passwordData.oldPassword}
                           onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                           placeholder={t('settings.current_password')}
                           className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-[2rem] px-8 py-5 font-black text-xs uppercase tracking-widest focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                        <button type="button" onClick={() => setShowPwd({...showPwd, old: !showPwd.old})} className="absolute end-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-white/5">
                          {showPwd.old ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                        </button>
                     </div>
                      <div className="relative">
                         <input 
                            type={showPwd.new ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            placeholder={t('settings.new_password')}
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-[2rem] px-8 py-5 font-black text-xs uppercase tracking-widest focus:ring-2 focus:ring-amber-500 outline-none"
                         />
                         <button type="button" onClick={() => setShowPwd({...showPwd, new: !showPwd.new})} className="absolute end-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-white/5">
                           {showPwd.new ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                         </button>
                         {passwordData.newPassword && (
                            <PasswordStrengthBar password={passwordData.newPassword} />
                         )}
                      </div>
                      <div className="relative">
                        <input 
                           type={showPwd.confirm ? 'text' : 'password'}
                           value={passwordData.confirmPassword}
                           onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                           placeholder={t('settings.confirm_password')}
                           className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-[2rem] px-8 py-5 font-black text-xs uppercase tracking-widest focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                        <button type="button" onClick={() => setShowPwd({...showPwd, confirm: !showPwd.confirm})} className="absolute end-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-white/5">
                          {showPwd.confirm ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                        </button>
                      </div>
                     <button 
                        type="submit"
                        disabled={isChangingPassword}
                        className="md:col-span-2 bg-[#059669] text-white py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] hover:shadow-[0_0_30px_rgba(5,150,105,0.3)] transition-all active:scale-[0.98] disabled:opacity-40"
                     >
                        {isChangingPassword ? t('mavi.encrypting') : t('settings.update_password')}
                     </button>
                  </form>
               </div>
            </div>

            {/* PREFERENCES BENTO CARD */}
            <div className="lg:col-span-4 space-y-8">
               
               {/* Appearance Card */}
               <div className="bg-white dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[3rem] p-10 space-y-8 text-start group hover:shadow-2xl transition-all duration-700">
                  <div className="space-y-1">
                     <h3 className="text-xl font-black uppercase tracking-tight">{t('settings.appearance')}</h3>
                     <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-400">{t('mavi.interface_customization')}</p>
                  </div>

                  <div className="space-y-4">
                     {/* Theme Toggle */}
                     <button 
                        onClick={toggleTheme}
                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 p-6 rounded-[2rem] flex items-center justify-between group/toggle"
                     >
                        <div className="flex items-center gap-4">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-500'}`}>
                              {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                           </div>
                           <span className="text-xs font-black uppercase tracking-widest">{isDarkMode ? t('settings.dark') : t('settings.light')}</span>
                        </div>
                        <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-[#34d399]' : 'bg-gray-200 dark:bg-white/10'}`}>
                           <div className={`w-4 h-4 rounded-full bg-white transition-all ${isDarkMode ? (isAr ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'}`}></div>
                        </div>
                     </button>

                     {/* Language Toggle */}
                     <button 
                        onClick={() => {
                           const newLang = i18n.language === 'ar' ? 'en' : 'ar';
                           i18n.changeLanguage(newLang);
                           toast.success(t('settings.update_success'));
                        }}
                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 p-6 rounded-[2rem] flex items-center justify-between group/toggle"
                     >
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-[#059669]/10 flex items-center justify-center text-[#059669]">
                              <Languages className="w-5 h-5" />
                           </div>
                           <span className="text-xs font-black uppercase tracking-widest">{t('settings.english')}</span>
                        </div>
                        <Zap className="w-4 h-4 text-[#34d399] opacity-0 group-hover/toggle:opacity-100 transition-opacity" />
                     </button>
                  </div>
               </div>

               {/* Logout / Danger Card */}
               <div className="bg-rose-500 rounded-[3rem] p-10 space-y-8 text-white relative overflow-hidden group">
                  <div className="absolute top-[-20%] inset-inline-end-[-20%] w-40 h-40 bg-white/10 blur-[40px] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
                  
                  <div className="space-y-2 relative z-10">
                     <ShieldAlert className="w-10 h-10 mb-4" />
                     <h3 className="text-2xl font-black uppercase italic leading-none">{t('settings.danger_zone')}</h3>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">{t('mavi.system_override_actions')}</p>
                  </div>

                  <button 
                     onClick={handleLogout}
                     className="w-full bg-white text-rose-500 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl relative z-10"
                  >
                     <LogOut className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} /> {t('sidebar.logout')}
                  </button>
               </div>

            </div>

          </div>
        </section>
      </main>


    </div>
  );
};

const PasswordStrengthBar = ({ password }) => {
  const getStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[!@#$%^&*()_\-+=[\]{}|;:'",.<>/?`~]/.test(pw)) score++;
    return score;
  };

  const score = getStrength(password);
  const maxScore = 5;
  const pct = (score / maxScore) * 100;

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];

  return (
    <div className="mt-2 px-2 space-y-1">
      <div className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${colors[score] || 'bg-gray-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={`text-[9px] font-black uppercase tracking-wider ${score <= 2 ? 'text-red-500' : score <= 3 ? 'text-yellow-500' : 'text-green-500'}`}>
        {labels[score]}
      </p>
    </div>
  );
};

export default StudentSettings;