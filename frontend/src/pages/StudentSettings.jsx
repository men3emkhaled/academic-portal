import React, { useState, useRef } from 'react';
import {
  User, Lock, Moon, Sun, LogOut, Mail,
  Camera, Loader2, ShieldCheck, Languages,
  Palette, AlertTriangle
} from 'lucide-react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { transliterateArabic } from '../utils/transliteration';
import {
  PageContainer,
  PageHeader,
  SectionCard,
  FormField,
  StatusBadge,
} from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

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
    if (passwordData.newPassword.length < 6) {
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

  const levelLabel = isAr
    ? (student?.level === 1 ? 'الفرقة الأولى'
      : student?.level === 2 ? 'الفرقة الثانية'
      : student?.level === 3 ? 'الفرقة الثالثة'
      : student?.level === 4 ? 'الفرقة الرابعة' : `الفرقة ${student?.level}`)
    : (student?.level === 1 ? 'First Year'
      : student?.level === 2 ? 'Second Year'
      : student?.level === 3 ? 'Third Year'
      : student?.level === 4 ? 'Fourth Year' : `Year ${student?.level}`);

  const handleLanguageToggle = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    toast.success(t('settings.update_success'));
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans" dir={isAr ? 'rtl' : 'ltr'}>
      <Sidebar onLogout={handleLogout} />

      <main className="md:ps-72 min-h-screen flex flex-col">
        <PageContainer>
          <PageHeader
            icon={ShieldCheck}
            title={t('mavi.settings')}
            description={t('mavi.encrypted_protocol')}
          />

          {/* Profile summary */}
          <SectionCard bodyClassName="p-5">
            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:text-start">
              {/* Avatar */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative flex size-24 items-center justify-center overflow-hidden rounded-xl border bg-muted text-muted-foreground transition-colors hover:border-primary"
                  aria-label={isAr ? 'تغيير الصورة الشخصية' : 'Change profile photo'}
                >
                  {student?.avatar_url ? (
                    <img
                      src={student.avatar_url}
                      alt={student.name}
                      className={cn('size-full object-cover', isUploadingAvatar && 'opacity-40')}
                    />
                  ) : (
                    <User className="size-10" />
                  )}

                  <span className="absolute inset-0 flex items-center justify-center bg-foreground/40 text-background opacity-0 transition-opacity hover:opacity-100">
                    <Camera className="size-6" />
                  </span>

                  {isUploadingAvatar && (
                    <span className="absolute inset-0 flex items-center justify-center bg-background/60">
                      <Loader2 className="size-6 animate-spin text-primary" />
                    </span>
                  )}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1 space-y-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <span className="text-xs text-muted-foreground">{t('mavi.verification_uid')}</span>
                    <span className="text-xs font-medium text-foreground">ZNU-{student?.id}</span>
                  </div>
                  <h2 className={cn('truncate text-lg font-semibold text-foreground', isAr && 'font-arabic')}>
                    {isAr ? student?.name : transliterateArabic(student?.name)}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <StatusBadge variant="neutral">
                    {t('settings.level')}: {levelLabel}
                  </StatusBadge>
                  <StatusBadge variant="neutral">
                    {t('settings.section')}: {student?.section || 'X-00'}
                  </StatusBadge>
                  <StatusBadge variant="success">{t('mavi.active')}</StatusBadge>
                </div>
              </div>
            </div>
          </SectionCard>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Security column */}
            <div className="space-y-6 lg:col-span-2">
              {/* Recovery email */}
              <SectionCard
                title={t('settings.recovery_email')}
                bodyClassName="p-5"
              >
                <form onSubmit={handleLinkEmail} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <FormField
                    label={t('settings.recovery_email')}
                    htmlFor="recovery-email"
                    className="flex-1"
                  >
                    <Input
                      id="recovery-email"
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder={student?.email || t('settings.enter_email')}
                    />
                  </FormField>
                  <Button type="submit" disabled={isLinking} className="sm:mb-0.5">
                    {isLinking ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        {t('mavi.synching')}
                      </>
                    ) : (
                      <>
                        <Mail className="size-4" />
                        {t('settings.link')}
                      </>
                    )}
                  </Button>
                </form>
              </SectionCard>

              {/* Change password */}
              <SectionCard
                title={t('settings.change_password')}
                bodyClassName="p-5"
              >
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <FormField label={t('settings.current_password')} htmlFor="current-password">
                    <Input
                      id="current-password"
                      type="password"
                      value={passwordData.oldPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                      placeholder={t('settings.current_password')}
                    />
                  </FormField>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField label={t('settings.new_password')} htmlFor="new-password">
                      <Input
                        id="new-password"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder={t('settings.new_password')}
                      />
                    </FormField>
                    <FormField label={t('settings.confirm_password')} htmlFor="confirm-password">
                      <Input
                        id="confirm-password"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder={t('settings.confirm_password')}
                      />
                    </FormField>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isChangingPassword}>
                      {isChangingPassword ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          {t('mavi.encrypting')}
                        </>
                      ) : (
                        <>
                          <Lock className="size-4" />
                          {t('settings.update_password')}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </SectionCard>
            </div>

            {/* Preferences column */}
            <div className="space-y-6">
              {/* Appearance */}
              <SectionCard
                title={t('settings.appearance')}
                description={t('mavi.interface_customization')}
                bodyClassName="p-2"
              >
                <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-card text-muted-foreground">
                      {isDarkMode ? <Moon className="size-4" /> : <Sun className="size-4" />}
                    </span>
                    <span className="truncate text-sm font-medium text-foreground">
                      {isDarkMode ? t('settings.dark') : t('settings.light')}
                    </span>
                  </div>
                  <Switch
                    checked={isDarkMode}
                    onCheckedChange={toggleTheme}
                    aria-label={t('settings.appearance')}
                  />
                </div>

                <Separator className="my-1" />

                <button
                  type="button"
                  onClick={handleLanguageToggle}
                  className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-card text-muted-foreground">
                      <Languages className="size-4" />
                    </span>
                    <span className="truncate text-sm font-medium text-foreground">
                      {isAr ? 'العربية' : 'English'}
                    </span>
                  </div>
                  <Palette className="size-4 text-muted-foreground" />
                </button>
              </SectionCard>

              {/* Danger zone */}
              <SectionCard
                title={t('settings.danger_zone')}
                description={t('mavi.system_override_actions')}
                bodyClassName="p-5"
                className="border-destructive/30"
              >
                <div className="flex items-start gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-destructive/20 bg-destructive/10 text-destructive">
                    <AlertTriangle className="size-4" />
                  </span>
                  <p className="text-sm text-muted-foreground">
                    {t('mavi.system_override_actions')}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleLogout}
                  className="mt-4 w-full"
                >
                  <LogOut className={cn('size-4', isAr && 'rotate-180')} />
                  {t('sidebar.logout')}
                </Button>
              </SectionCard>
            </div>
          </div>
        </PageContainer>
      </main>
    </div>
  );
};

export default StudentSettings;
