import React, { useState, useRef } from 'react';
import { useDoctorAuth } from '../../context/DoctorAuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Shield, Moon, Sun,
  Camera, Save, Lock, Bell, Loader2,
  Settings as SettingsIcon, Palette, Globe, ShieldCheck,
  Building2, GraduationCap, Check, Languages
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  PageContainer,
  PageHeader,
  SectionCard,
  FormField,
  StatusBadge,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

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
    { id: 'profile', label: t('settings.profile'), icon: User },
    { id: 'security', label: t('settings.security'), icon: Shield },
    { id: 'appearance', label: t('settings.appearance'), icon: Palette },
    { id: 'notifications', label: t('settings.notifications'), icon: Bell },
  ];

  const notificationPrefs = [
    { id: 'email_tasks', label: 'Task Assignments', desc: 'Email when admins assign new tasks.' },
    { id: 'push_submissions', label: 'Student Uploads', desc: 'Alert when students submit work.' },
    { id: 'email_announcements', label: 'System News', desc: 'Receive portal updates and announcements.' },
  ];

  return (
    <PageContainer>
      <PageHeader
        icon={SettingsIcon}
        title={t('settings.title')}
        description={t('settings.desc')}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Section nav rail */}
        <nav className="lg:col-span-3">
          <div className="flex gap-1 overflow-x-auto rounded-lg border bg-card p-1 lg:flex-col lg:overflow-visible">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`flex w-full shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors text-start ${
                    isActive
                      ? 'bg-muted font-medium text-foreground'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
                >
                  <Icon className={`size-4 ${isActive ? 'text-primary' : ''}`} />
                  <span className="truncate">{section.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content */}
        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15 }}
            >
              {/* Profile Section */}
              {activeSection === 'profile' && (
                <SectionCard
                  title={t('settings.profile')}
                  description="Manage your public instructor profile."
                  bodyClassName="space-y-6"
                >
                  <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                    <div className="relative shrink-0">
                      <Avatar size="lg" className="size-20">
                        <AvatarImage
                          src={profileData.avatar_url || `https://ui-avatars.com/api/?name=${doctor?.name}&background=2ecc71&color=fff&size=256`}
                          alt={doctor?.name}
                          className={uploadingAvatar ? 'opacity-40' : ''}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {(doctor?.name || 'D').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {uploadingAvatar && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="size-6 animate-spin text-primary" />
                        </div>
                      )}
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        onClick={() => fileInputRef.current.click()}
                        className="absolute bottom-0 end-0 rounded-full"
                        aria-label="Change photo"
                      >
                        <Camera className="size-3.5" />
                      </Button>
                    </div>
                    <div className="text-center sm:text-start">
                      <h3 className="text-base font-semibold text-foreground">{doctor?.name}</h3>
                      <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                        <StatusBadge variant="neutral" icon={Building2}>
                          {doctor?.department || 'Faculty Member'}
                        </StatusBadge>
                        <StatusBadge variant="success" icon={ShieldCheck}>
                          Verified Instructor
                        </StatusBadge>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleProfileUpdate} className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField label="Full Name" htmlFor="profile-name">
                        <div className="relative">
                          <User className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="profile-name"
                            type="text"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            className="ps-8"
                          />
                        </div>
                      </FormField>
                      <FormField label="Email Address" htmlFor="profile-email">
                        <div className="relative">
                          <Mail className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="profile-email"
                            type="text"
                            value={profileData.email}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            className="ps-8"
                          />
                        </div>
                      </FormField>
                      <FormField label="Phone Number" htmlFor="profile-phone">
                        <div className="relative">
                          <Phone className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="profile-phone"
                            type="text"
                            value={profileData.phone}
                            placeholder="+20 1XX XXX XXXX"
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            className="ps-8"
                          />
                        </div>
                      </FormField>
                      <FormField label="Instructor ID" htmlFor="profile-id">
                        <div className="relative">
                          <GraduationCap className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="profile-id"
                            type="text"
                            value={doctor?.id || ''}
                            disabled
                            className="ps-8"
                          />
                        </div>
                      </FormField>
                    </div>

                    <FormField label="Professional Bio" htmlFor="profile-bio">
                      <Textarea
                        id="profile-bio"
                        rows={4}
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        placeholder="Brief introduction..."
                        className="resize-none"
                      />
                    </FormField>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={loading}>
                        {loading ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <>
                            <Save className="size-4" />
                            <span>Update Profile</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </SectionCard>
              )}

              {/* Security Section */}
              {activeSection === 'security' && (
                <SectionCard
                  title="Security"
                  description="Manage your password and access keys."
                  bodyClassName="max-w-xl"
                >
                  <form onSubmit={handlePasswordChange} className="space-y-5">
                    {[
                      { label: 'Current Password', key: 'currentPassword' },
                      { label: 'New Password', key: 'newPassword' },
                      { label: 'Confirm New Password', key: 'confirmPassword' },
                    ].map((f) => (
                      <FormField key={f.key} label={f.label} htmlFor={`pw-${f.key}`}>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id={`pw-${f.key}`}
                            type="password"
                            required
                            value={passwordData[f.key]}
                            onChange={(e) => setPasswordData({ ...passwordData, [f.key]: e.target.value })}
                            className="ps-8"
                          />
                        </div>
                      </FormField>
                    ))}

                    <div className="flex justify-end">
                      <Button type="submit" disabled={loading}>
                        {loading ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
                        <span>Change Password</span>
                      </Button>
                    </div>
                  </form>
                </SectionCard>
              )}

              {/* Appearance Section */}
              {activeSection === 'appearance' && (
                <SectionCard
                  title={t('settings.appearance')}
                  description="Customize the look and language of your portal."
                  bodyClassName="space-y-6"
                >
                  <div>
                    <h4 className="mb-3 text-sm font-medium text-foreground">Theme</h4>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => !isDarkMode && toggleTheme()}
                        aria-pressed={isDarkMode}
                        className={`relative rounded-lg border p-4 text-start transition-colors ${
                          isDarkMode
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-card hover:bg-muted/50'
                        }`}
                      >
                        <div className="mb-3 flex size-9 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                          <Moon className="size-4" />
                        </div>
                        <h5 className="text-sm font-medium text-foreground">Dark</h5>
                        <p className="mt-0.5 text-xs text-muted-foreground">Dark interface for focus.</p>
                        {isDarkMode && (
                          <span className="absolute end-3 top-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="size-3" />
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => isDarkMode && toggleTheme()}
                        aria-pressed={!isDarkMode}
                        className={`relative rounded-lg border p-4 text-start transition-colors ${
                          !isDarkMode
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-card hover:bg-muted/50'
                        }`}
                      >
                        <div className="mb-3 flex size-9 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                          <Sun className="size-4" />
                        </div>
                        <h5 className="text-sm font-medium text-foreground">Light</h5>
                        <p className="mt-0.5 text-xs text-muted-foreground">Clean high-contrast view.</p>
                        {!isDarkMode && (
                          <span className="absolute end-3 top-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="size-3" />
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3 text-sm font-medium text-foreground">Language</h4>
                    <div className="flex items-center justify-between gap-3 rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                          <Globe className="size-4" />
                        </span>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {i18n.language === 'ar' ? 'العربية' : 'English'}
                          </p>
                          <p className="text-xs text-muted-foreground">Switch system language.</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newLang = i18n.language === 'ar' ? 'en' : 'ar';
                          i18n.changeLanguage(newLang);
                          toast.success(t('settings.update_success'));
                        }}
                      >
                        <Languages className="size-4" />
                        <span>{i18n.language === 'ar' ? 'English' : 'العربية'}</span>
                      </Button>
                    </div>
                  </div>
                </SectionCard>
              )}

              {/* Notifications Section */}
              {activeSection === 'notifications' && (
                <SectionCard
                  title={t('settings.notifications')}
                  description="Choose which alerts you receive from the portal."
                  bodyClassName="divide-y divide-border"
                >
                  {notificationPrefs.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                      <div className="min-w-0 pe-4">
                        <h5 className="text-sm font-medium text-foreground">{item.label}</h5>
                        <p className="mt-0.5 text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch defaultChecked aria-label={item.label} />
                    </div>
                  ))}
                </SectionCard>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </PageContainer>
  );
};

export default DoctorSettings;
