import React, { useState, useRef } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, Book, Shield, Moon, Sun, 
  Camera, Save, Lock, Bell, CheckCircle2, AlertCircle, Loader2,
  Settings as SettingsIcon, Layout, Palette, Zap, Globe, ShieldCheck,
  Building2, GraduationCap, Sparkles, Languages
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DoctorSettings = () => {
  const { t, i18n } = useTranslation();
  const { doctor, doctorApi, login, token } = useDoctorAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const fileInputRef = useRef(null);
  
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: doctor?.name || '',
    email: doctor?.email || '',
    bio: doctor?.bio || '',
    phone: doctor?.phone || '',
    avatar_url: doctor?.avatar_url || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await doctorApi('put', '/doctor/profile', profileData);
      login(token, res.data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
        const res = await doctorApi('post', '/doctor/upload-avatar', formData, {
            'Content-Type': 'multipart/form-data'
        });
        const newAvatarUrl = res.data.avatar_url;
        setProfileData(prev => ({ ...prev, avatar_url: newAvatarUrl }));
        const updatedDoctor = { ...doctor, avatar_url: newAvatarUrl };
        login(token, updatedDoctor);
        toast.success('Picture updated');
    } catch (err) {
        toast.error('Upload failed');
    } finally {
        setUploadingAvatar(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Passwords mismatch');
    }
    setLoading(true);
    try {
      await doctorApi('put', '/doctor/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Security updated');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error('Failed to change');
    } finally {
      setLoading(false);
    }
  };

  const SECTIONS = [
    { id: 'profile', label: t('settings.profile'), icon: User, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { id: 'security', label: t('settings.security'), icon: Shield, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'appearance', label: t('settings.appearance'), icon: Palette, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'notifications', label: t('settings.notifications'), icon: Bell, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  ];

  return (
    <div className="max-w-[1400px] mx-auto pb-20 space-y-10 px-4">
      {/* Header Hub */}
      <div className="bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-white/5 rounded-[3.5rem] p-10 shadow-sm">
          <div className="flex items-center gap-8">
              <div className="w-20 h-20 rounded-3xl bg-violet-600 flex items-center justify-center shadow-2xl shadow-violet-600/30">
                  <SettingsIcon className="w-10 h-10 text-white" />
              </div>
              <div>
                  <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{t('settings.title')}</h2>
                      <span className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[9px] font-black text-violet-500 uppercase tracking-widest">{t('sidebar.menu')}</span>
                  </div>
                  <p className="text-sm text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                      <Zap className="w-4 h-4" /> {t('settings.desc')}
                  </p>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Navigation Rail */}
        <div className="lg:col-span-3 space-y-4">
            {SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                    <motion.button
                        key={section.id}
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-4 px-8 py-5 rounded-[2rem] font-black transition-all text-[11px] uppercase tracking-widest border text-start ${
                            isActive 
                                ? 'bg-white dark:bg-white/5 text-violet-600 dark:text-white border-gray-100 dark:border-white/10 shadow-xl shadow-black/5' 
                                : 'text-gray-400 border-transparent hover:bg-gray-50 dark:hover:bg-white/[0.02]'
                        }`}
                    >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? section.bg + ' ' + section.color : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                            <Icon className="w-4 h-4" />
                        </div>
                        <span>{section.label}</span>
                    </motion.button>
                );
            })}
        </div>

        {/* Content Bento */}
        <div className="lg:col-span-9">
            <motion.div 
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-white/5 rounded-[4rem] p-12 shadow-sm relative overflow-hidden min-h-[700px]"
            >
                {/* Profile Section */}
                {activeSection === 'profile' && (
                    <div className="space-y-12">
                        <div className="flex flex-col md:flex-row gap-10 items-center">
                            <div className="relative group">
                                <div className="w-40 h-40 rounded-[3rem] bg-gradient-to-br from-violet-600 to-fuchsia-600 p-1.5 shadow-2xl relative overflow-hidden">
                                    <div className="w-full h-full rounded-[2.8rem] bg-white dark:bg-[#0A0A0A] flex items-center justify-center overflow-hidden">
                                        <img 
                                            src={profileData.avatar_url || `https://ui-avatars.com/api/?name=${doctor?.name}&background=8b5cf6&color=fff&size=256`} 
                                            alt="Avatar" 
                                            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${uploadingAvatar ? 'opacity-30' : 'opacity-100'}`}
                                        />
                                    </div>
                                    {uploadingAvatar && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Loader2 className="w-10 h-10 text-white animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                <motion.button 
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => fileInputRef.current.click()}
                                    className="absolute bottom-2 end-2 w-12 h-12 bg-violet-600 text-white rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white dark:border-[#0c0c0e]"
                                >
                                    <Camera className="w-5 h-5" />
                                </motion.button>
                            </div>
                            <div className="text-center md:text-start">
                                <h4 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">{doctor?.name}</h4>
                                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                    <span className="px-4 py-1.5 rounded-xl bg-violet-500/5 border border-violet-500/10 text-[9px] font-black text-violet-500 uppercase tracking-widest flex items-center gap-2">
                                        <Building2 className="w-3 h-3" /> {doctor?.department || 'Faculty Member'}
                                    </span>
                                    <span className="px-4 py-1.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                        <ShieldCheck className="w-3 h-3" /> Verified Instructor
                                    </span>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleProfileUpdate} className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[
                                    { label: 'Full Name', icon: User, value: profileData.name, key: 'name' },
                                    { label: 'Email Address', icon: Mail, value: profileData.email, key: 'email' },
                                    { label: 'Phone Number', icon: Phone, value: profileData.phone, key: 'phone', placeholder: '+20 1XX XXX XXXX' },
                                    { label: 'Instructor ID', icon: GraduationCap, value: doctor?.id, disabled: true },
                                ].map((field, i) => (
                                    <div key={i} className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ms-1 flex items-center gap-2">
                                            <field.icon className="w-3 h-3 text-violet-500" /> {field.label}
                                        </label>
                                        <input 
                                            type="text" 
                                            value={field.value}
                                            disabled={field.disabled}
                                            placeholder={field.placeholder}
                                            onChange={(e) => !field.disabled && setProfileData({...profileData, [field.key]: e.target.value})}
                                            className={`w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-[1.5rem] py-5 px-6 text-gray-900 dark:text-white focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-black ${field.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ms-1">Professional Bio</label>
                                <textarea 
                                    rows="4"
                                    value={profileData.bio}
                                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                                    placeholder="Brief introduction..."
                                    className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-[1.5rem] py-5 px-6 text-gray-900 dark:text-white focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-semibold resize-none"
                                />
                            </div>

                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="bg-violet-600 hover:bg-violet-700 text-white font-black px-12 py-5 rounded-[1.8rem] shadow-2xl shadow-violet-600/30 flex items-center justify-center gap-3 text-xs uppercase tracking-widest disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Update Profile</>}
                            </motion.button>
                        </form>
                    </div>
                )}

                {/* Security Section */}
                {activeSection === 'security' && (
                    <div className="space-y-12 max-w-xl">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center shadow-inner">
                                <Shield className="w-8 h-8 text-amber-500" />
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Security Protocol</h4>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Manage your access keys</p>
                            </div>
                        </div>

                        <form onSubmit={handlePasswordChange} className="space-y-8">
                            {[
                                { label: 'Current Access Key', key: 'currentPassword' },
                                { label: 'New Access Key', key: 'newPassword' },
                                { label: 'Confirm New Key', key: 'confirmPassword' },
                            ].map((f, i) => (
                                <div key={i} className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ms-1">{f.label}</label>
                                    <input 
                                        type="password" 
                                        required
                                        value={passwordData[f.key]}
                                        onChange={(e) => setPasswordData({...passwordData, [f.key]: e.target.value})}
                                        className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-[1.5rem] py-5 px-6 text-gray-900 dark:text-white focus:ring-4 focus:ring-amber-500/10 outline-none transition-all font-black"
                                    />
                                </div>
                            ))}

                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-5 rounded-[1.8rem] shadow-2xl shadow-amber-500/30 flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
                            >
                                <Lock className="w-4 h-4" /> Change Access Key
                            </motion.button>
                        </form>
                    </div>
                )}

                {/* Appearance Section */}
                {activeSection === 'appearance' && (
                    <div className="space-y-12">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                                <Palette className="w-8 h-8 text-emerald-500" />
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Look & Feel</h4>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Interface Customization</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <button 
                                onClick={() => !isDarkMode && toggleTheme()}
                                className={`group p-8 rounded-[2.5rem] border transition-all text-start relative overflow-hidden ${isDarkMode ? 'bg-violet-600 border-violet-600 shadow-2xl shadow-violet-600/20' : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 hover:border-violet-500/30'}`}
                            >
                                <div className={`w-12 h-12 rounded-2xl mb-6 flex items-center justify-center transition-all ${isDarkMode ? 'bg-white/20 text-white' : 'bg-white dark:bg-white/10 text-gray-400 group-hover:text-violet-500'}`}>
                                    <Moon className="w-6 h-6" />
                                </div>
                                <h5 className={`text-lg font-black uppercase tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900 dark:text-white'}`}>Obsidian Dark</h5>
                                <p className={`text-[10px] font-bold ${isDarkMode ? 'text-white/60' : 'text-gray-400'}`}>Premium dark interface for focus.</p>
                                {isDarkMode && <Sparkles className="absolute top-4 end-4 w-4 h-4 text-white/40" />}
                            </button>

                            <button 
                                onClick={() => isDarkMode && toggleTheme()}
                                className={`group p-8 rounded-[2.5rem] border transition-all text-start relative overflow-hidden ${!isDarkMode ? 'bg-indigo-600 border-indigo-600 shadow-2xl shadow-indigo-600/20' : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 hover:border-indigo-500/30'}`}
                            >
                                <div className={`w-12 h-12 rounded-2xl mb-6 flex items-center justify-center transition-all ${!isDarkMode ? 'bg-white/20 text-white' : 'bg-white dark:bg-white/10 text-gray-400 group-hover:text-indigo-500'}`}>
                                    <Sun className="w-6 h-6" />
                                </div>
                                <h5 className={`text-lg font-black uppercase tracking-tight mb-2 ${!isDarkMode ? 'text-white' : 'text-gray-900 dark:text-white'}`}>Crystal Light</h5>
                                <p className={`text-[10px] font-bold ${!isDarkMode ? 'text-white/60' : 'text-gray-400'}`}>Clean and bright high-contrast view.</p>
                                {!isDarkMode && <Sparkles className="absolute top-4 end-4 w-4 h-4 text-white/40" />}
                            </button>

                            {/* Language Selector */}
                            <button 
                                onClick={() => {
                                    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
                                    i18n.changeLanguage(newLang);
                                    toast.success(t('settings.update_success'));
                                }}
                                className="group p-8 rounded-[2.5rem] border transition-all text-start relative overflow-hidden bg-primary/10 border-primary/20 hover:bg-primary/20"
                            >
                                <div className="w-12 h-12 rounded-2xl mb-6 bg-primary/20 text-primary flex items-center justify-center">
                                    <Languages className="w-6 h-6" />
                                </div>
                                <h5 className="text-lg font-black uppercase tracking-tight mb-2 text-primary">
                                    {i18n.language === 'ar' ? 'English' : 'العربية'}
                                </h5>
                                <p className="text-[10px] font-bold text-primary/60">Switch system language.</p>
                                <Sparkles className="absolute top-4 end-4 w-4 h-4 text-primary/40" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Alerts Section */}
                {activeSection === 'notifications' && (
                    <div className="space-y-12">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                                <Bell className="w-8 h-8 text-rose-500" />
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Notification Alerts</h4>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Stay updated with the portal</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                { id: 'email_tasks', label: 'Task Assignments', desc: 'Email when admins assign new tasks.' },
                                { id: 'push_submissions', label: 'Student Uploads', desc: 'Alert when students submit work.' },
                                { id: 'email_announcements', label: 'System News', desc: 'Receive portal updates and announcements.' },
                            ].map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-8 rounded-[2.5rem] bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 group hover:border-rose-500/20 transition-all">
                                    <div className="flex-1 pe-10">
                                        <h5 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight mb-1">{item.label}</h5>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.desc}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-rose-500 shadow-sm"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSettings;
