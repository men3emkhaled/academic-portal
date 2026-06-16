import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../context/StudentAuthContext';
import toast from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';
import { useMsal } from "@azure/msal-react";
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, GraduationCap, BookOpen, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField, Spinner } from '@/components/common';

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
    <div className="min-h-screen w-full flex font-sans bg-background text-foreground" dir={isAr ? 'rtl' : 'ltr'}>

      {/* LEFT PANEL: BRANDING */}
      <div className="hidden lg:flex w-[45%] flex-col justify-center items-center p-16 text-center border-e border-border bg-card">
        <div className="w-full max-w-md flex flex-col items-center gap-10">
          <img src="/logo.png" className="w-40 h-40 object-contain" alt="Logo" />

          <div className="space-y-4">
            <h1 className={`text-3xl font-semibold text-foreground ${isAr ? 'leading-snug' : 'leading-tight'}`}>
              {t('auth.student_portal')}
            </h1>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mx-auto">
              {t('mavi.login_desc')}
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            {[GraduationCap, BookOpen, Clock].map((Icon, i) => (
              <div
                key={Icon?.displayName || i}
                className="size-11 rounded-lg border border-border bg-background flex items-center justify-center"
              >
                <Icon className="size-5 text-primary" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: SECURE ACCESS */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          {/* Brand mark for mobile */}
          <div className="lg:hidden mb-8 flex flex-col items-center gap-3">
            <img src="/logo.png" className="w-16 h-16 object-contain" alt="Logo" />
          </div>

          <div className="text-start mb-6">
            <h2 className="text-2xl font-semibold text-foreground">{t('auth.sign_in')}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t('auth.student_portal')}</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <FormField label={t('auth.student_id')} htmlFor="student-id">
                <div className="relative">
                  <Mail className="absolute top-1/2 -translate-y-1/2 start-2.5 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="student-id"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t('auth.enter_id')}
                    className="ps-8"
                  />
                </div>
              </FormField>

              <FormField label={t('auth.access_key')} htmlFor="access-key">
                <div className="relative">
                  <Lock className="absolute top-1/2 -translate-y-1/2 start-2.5 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="access-key"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="ps-8"
                  />
                </div>
              </FormField>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Spinner className="text-current" />
                    <span>{t('auth.processing')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('auth.authenticate')}</span>
                    <ArrowRight className={isAr ? 'rotate-180' : ''} />
                  </>
                )}
              </Button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => triggerGoogleLogin()}
              >
                <img src="https://www.google.com/favicon.ico" className="size-4" alt="" />
                <span>{t('auth.google_sign_in')}</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleMicrosoftLogin}
              >
                <img src="https://www.microsoft.com/favicon.ico" className="size-4" alt="" />
                <span>{t('auth.microsoft_sign_in')}</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentLogin;
