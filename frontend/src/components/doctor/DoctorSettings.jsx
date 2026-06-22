import React, { useState, useRef } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import { 
  User, Mail, Phone, Book, Shield, Moon, Sun, 
  Camera, Save, Lock, Bell, Loader2,
  Settings as SettingsIcon, Palette, Zap, Globe,
  Building2, GraduationCap, Languages
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
      toast.success(t('settings.update_success'));
    } catch (err) {
      toast.error(t('doctor.settings.update_failed'));
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
        login(token, { ...doctor, avatar_url: newAvatarUrl });
        toast.success(t('doctor.settings.picture_updated'));
    } catch (err) {
        toast.error(t('doctor.settings.upload_failed'));
    } finally {
        setUploadingAvatar(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error(t('doctor.settings.password_mismatch'));
    }
    setLoading(true);
    try {
      await doctorApi('put', '/doctor/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success(t('doctor.settings.password_changed'));
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(t('doctor.settings.failed_to_change_password'));
    } finally {
      setLoading(false);
    }
  };

  const SECTIONS = [
    { id: 'profile', label: t('doctor.settings.profile'), icon: User },
    { id: 'security', label: t('doctor.settings.security'), icon: Shield },
    { id: 'appearance', label: t('doctor.settings.appearance'), icon: Palette },
    { id: 'notifications', label: t('doctor.settings.notifications_section'), icon: Bell },
  ];

  return (
    <div className="max-w-[1400px] mx-auto pb-20 space-y-6 px-4">
      <div className="bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-white/5 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#059669] flex items-center justify-center">
                  <SettingsIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('settings.title')}</h2>
                  <p className="text-sm text-gray-400">{t('settings.desc')}</p>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 space-y-2">
            {SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                    <button key={section.id} onClick={() => setActiveSection(section.id)} className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl font-medium text-sm transition-all border text-start ${
                        isActive 
                            ? 'bg-white dark:bg-white/5 text-[#059669] border-gray-100 dark:border-white/10 shadow-sm' 
                            : 'text-gray-400 border-transparent hover:bg-gray-50 dark:hover:bg-white/[0.02]'
                    }`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-[#059669]/10 text-[#059669]' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
                            <Icon className="w-4 h-4" />
                        </div>
                        <span>{section.label}</span>
                    </button>
                );
            })}
        </div>

        <div className="lg:col-span-9">
            <div className="bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-white/5 rounded-xl p-6 shadow-sm min-h-[500px]">
                {activeSection === 'profile' && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                            <div className="relative group">
                                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-[#059669] to-[#34d399] p-1 shadow-lg overflow-hidden">
                                    <div className="w-full h-full rounded-xl bg-white dark:bg-[#0A0A0A] flex items-center justify-center overflow-hidden">
                                        <img 
                                            src={profileData.avatar_url || `https://ui-avatars.com/api/?name=${doctor?.name}&background=059669&color=fff&size=128`} 
                                            alt="Avatar" 
                                            className={`w-full h-full object-cover ${uploadingAvatar ? 'opacity-30' : ''}`}
                                        />
                                    </div>
                                    {uploadingAvatar && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                <button onClick={() => fileInputRef.current.click()} className="absolute bottom-1 right-1 w-9 h-9 bg-[#059669] text-white rounded-lg flex items-center justify-center shadow-md border-2 border-white dark:border-[#0c0c0e]">
                                    <Camera className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="text-center md:text-start">
                                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{doctor?.name}</h4>
                                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                    <span className="px-3 py-1 rounded-lg bg-[#059669]/5 border border-[#059669]/10 text-xs text-[#059669] font-medium flex items-center gap-1">
                                        <Building2 className="w-3 h-3" /> {doctor?.department || t('doctor.settings.faculty_member')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleProfileUpdate} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {[
                                    { label: t('doctor.settings.full_name'), icon: User, value: profileData.name, key: 'name' },
                                    { label: t('doctor.settings.email_address'), icon: Mail, value: profileData.email, key: 'email' },
                                    { label: t('doctor.settings.phone_number'), icon: Phone, value: profileData.phone, key: 'phone', placeholder: t('doctor.settings.phone_placeholder') },
                                    { label: t('doctor.settings.instructor_id'), icon: GraduationCap, value: doctor?.id, disabled: true },
                                ].map((field, i) => (
                                    <div key={i} className="space-y-2">
                                        <label className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                            <field.icon className="w-3 h-3 text-[#059669]" /> {field.label}
                                        </label>
                                        <input type="text" value={field.value} disabled={field.disabled} placeholder={field.placeholder}
                                            onChange={(e) => !field.disabled && setProfileData({...profileData, [field.key]: e.target.value})}
                                            className={`w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white outline-none transition-all ${field.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-gray-400 font-medium">{t('doctor.settings.professional_bio')}</label>
                                <textarea rows="3" value={profileData.bio}
                                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                                    placeholder={t('doctor.settings.bio_placeholder')}
                                    className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white outline-none resize-none"
                                />
                            </div>

                            <button type="submit" disabled={loading} className="bg-[#059669] hover:bg-[#047857] text-white font-medium px-8 py-3 rounded-xl flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> {t('doctor.settings.update_profile')}</>}
                            </button>
                        </form>
                    </div>
                )}

                {activeSection === 'security' && (
                    <div className="space-y-6 max-w-xl">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                <Shield className="w-6 h-6 text-amber-500" />
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{t('doctor.settings.security')}</h4>
                                <p className="text-xs text-gray-400">{t('doctor.settings.manage_keys')}</p>
                            </div>
                        </div>

                        <form onSubmit={handlePasswordChange} className="space-y-5">
                            {[
                                { label: t('doctor.settings.current_access_key'), key: 'currentPassword' },
                                { label: t('doctor.settings.new_access_key'), key: 'newPassword' },
                                { label: t('doctor.settings.confirm_new_key'), key: 'confirmPassword' },
                            ].map((f, i) => (
                                <div key={i} className="space-y-2">
                                    <label className="text-xs text-gray-400 font-medium">{f.label}</label>
                                    <input type="password" required value={passwordData[f.key]}
                                        onChange={(e) => setPasswordData({...passwordData, [f.key]: e.target.value})}
                                        className="w-full bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white outline-none"
                                    />
                                </div>
                            ))}

                            <button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 text-sm transition-all">
                                <Lock className="w-4 h-4" /> {t('doctor.settings.change_access_key')}
                            </button>
                        </form>
                    </div>
                )}

                {activeSection === 'appearance' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <Palette className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{t('doctor.settings.appearance')}</h4>
                                <p className="text-xs text-gray-400">{t('doctor.settings.look_and_feel')}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button onClick={() => isDarkMode && toggleTheme()} className={`p-5 rounded-xl border transition-all text-start ${
                                !isDarkMode ? 'bg-[#059669] border-[#059669] text-white' : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 hover:border-[#059669]/30 text-gray-900 dark:text-white'
                            }`}>
                                <div className={`w-10 h-10 rounded-lg mb-4 flex items-center justify-center ${
                                    !isDarkMode ? 'bg-white/20' : 'bg-white dark:bg-white/10 text-gray-400'
                                }`}>
                                    <Sun className="w-5 h-5" />
                                </div>
                                <h5 className="font-semibold mb-1">{t('doctor.settings.light_title')}</h5>
                                <p className="text-xs opacity-70">{t('doctor.settings.light_desc')}</p>
                            </button>

                            <button onClick={() => !isDarkMode && toggleTheme()} className={`p-5 rounded-xl border transition-all text-start ${
                                isDarkMode ? 'bg-[#059669] border-[#059669] text-white' : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 hover:border-[#059669]/30 text-gray-900 dark:text-white'
                            }`}>
                                <div className={`w-10 h-10 rounded-lg mb-4 flex items-center justify-center ${
                                    isDarkMode ? 'bg-white/20' : 'bg-white dark:bg-white/10 text-gray-400'
                                }`}>
                                    <Moon className="w-5 h-5" />
                                </div>
                                <h5 className="font-semibold mb-1">{t('doctor.settings.dark_title')}</h5>
                                <p className="text-xs opacity-70">{t('doctor.settings.dark_desc')}</p>
                            </button>

                            <button onClick={() => { i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar'); }} className="p-5 rounded-xl border border-[#059669]/20 bg-[#059669]/5 text-start">
                                <div className="w-10 h-10 rounded-lg mb-4 bg-[#059669]/20 flex items-center justify-center text-[#059669]">
                                    <Languages className="w-5 h-5" />
                                </div>
                                <h5 className="font-semibold mb-1 text-gray-900 dark:text-white">
                                    {i18n.language === 'ar' ? t('settings.english') : t('settings.arabic')}
                                </h5>
                                <p className="text-xs text-gray-400">{t('doctor.settings.switch_language')}</p>
                            </button>
                        </div>
                    </div>
                )}

                {activeSection === 'notifications' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
                                <Bell className="w-6 h-6 text-rose-500" />
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{t('doctor.settings.notifications_section')}</h4>
                                <p className="text-xs text-gray-400">{t('doctor.settings.stay_updated')}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {[
                                { label: t('doctor.settings.task_assignments'), desc: t('doctor.settings.task_assignments_desc') },
                                { label: t('doctor.settings.student_uploads'), desc: t('doctor.settings.student_uploads_desc') },
                                { label: t('doctor.settings.system_news'), desc: t('doctor.settings.system_news_desc') },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                                    <div>
                                        <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-0.5">{item.label}</h5>
                                        <p className="text-xs text-gray-400">{item.desc}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#059669]"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSettings;
