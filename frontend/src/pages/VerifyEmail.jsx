import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Fingerprint, CheckCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import studentApi from '../services/studentApi';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FormField } from '@/components/common';

const VerifyEmail = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error(t('verify_email.invalid_token'));
      navigate('/student/login');
    }
  }, [token, navigate, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentId.trim()) {
      toast.error(t('verify_email.enter_id_prompt'));
      return;
    }

    setLoading(true);
    try {
      const res = await studentApi.post('/student/verify-email', { token, studentId });
      setSuccess(true);
      toast.success(res.data.message || t('verify_email.success_message'));
    } catch (error) {
      toast.error(error.response?.data?.message || t('common.error'));
    }
    setLoading(false);
  };

  if (!token) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="items-center text-center">
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl border border-border bg-muted">
              <ShieldCheck className="size-5 text-primary" />
            </div>
            <CardTitle className="text-lg font-semibold">{t('verify_email.title')}</CardTitle>
            <CardDescription>{t('verify_email.subtitle')}</CardDescription>
          </CardHeader>

          <CardContent>
            {success ? (
              <div className="flex flex-col items-center text-center py-2">
                <div className="mb-4 flex size-12 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                  <CheckCircle className="size-6" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">{t('verify_email.verified_title')}</h3>
                <p className="text-sm text-muted-foreground mb-5">{t('verify_email.verified_subtitle')}</p>
                <Button onClick={() => navigate('/student/login')} className="w-full">
                  <span>{t('verify_email.go_to_login')}</span>
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <FormField label={t('verify_email.student_id_label')} htmlFor="verify-id" required>
                  <div className="relative flex items-center">
                    <Fingerprint className="pointer-events-none absolute start-2.5 size-4 text-muted-foreground" />
                    <Input
                      id="verify-id"
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="ps-9"
                      placeholder={t('verify_email.student_id_placeholder')}
                      required
                      disabled={loading}
                    />
                  </div>
                </FormField>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? t('verify_email.verifying') : t('verify_email.verify_button')}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmail;
