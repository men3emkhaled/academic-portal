import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { FormField, Spinner } from '@/components/common';

const ResetPassword = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { resetPassword } = useStudentAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error(t('auth.reset_password.error_invalid_token'));
      navigate('/student/login');
    }
  }, [token, navigate, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error(t('auth.reset_password.error_mismatch'));
      return;
    }
    if (password.length < 4) {
      toast.error(t('auth.reset_password.error_min_length'));
      return;
    }

    setLoading(true);
    const result = await resetPassword(token, password);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      toast.success(t('auth.reset_password.success_toast'));
      setTimeout(() => {
        navigate('/student/login');
      }, 3000);
    } else {
      toast.error(result.message || t('auth.reset_password.error_failed'));
    }
  };

  if (!token) return null;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-md">
        <Card>
          <CardContent className="p-2 sm:p-4">
            <div className="flex flex-col items-center mb-6 text-center">
              <div className="flex items-center justify-center size-12 mb-4 rounded-xl border border-border bg-muted">
                <Lock className="size-5 text-primary" />
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                {t('auth.reset_password.title')}
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {t('auth.reset_password.desc')}
              </p>
            </div>

            {success ? (
              <div className="text-center py-4">
                <div className="size-12 rounded-xl border border-border bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="size-6" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-1.5">
                  {t('auth.reset_password.success_title')}
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  {t('auth.reset_password.success_desc')}
                </p>
                <Button
                  className="w-full"
                  onClick={() => navigate('/student/login')}
                >
                  {t('auth.reset_password.go_to_login')}
                  <ArrowRight className={`size-4 ${isAr ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <FormField
                  label={t('auth.reset_password.new_password')}
                  htmlFor="new-password"
                  required
                >
                  <div className="relative flex items-center">
                    <Input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-9 pe-9"
                      placeholder="••••••••"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-2.5 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </FormField>

                <FormField
                  label={t('auth.reset_password.confirm_password')}
                  htmlFor="confirm-password"
                  required
                >
                  <Input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-9"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </FormField>

                <Button type="submit" className="w-full mt-1" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner className="text-current" />
                      {t('auth.reset_password.resetting')}
                    </>
                  ) : (
                    t('auth.reset_password.reset_btn')
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
