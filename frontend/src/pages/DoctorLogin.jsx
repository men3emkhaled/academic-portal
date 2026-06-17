import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDoctorAuth } from '../context/DoctorAuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, GraduationCap, Microscope, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField, Spinner } from '@/components/common';

const DoctorLogin = () => {
   const { token, login } = useDoctorAuth();
   const { t, i18n } = useTranslation();
   const isAr = i18n.language === 'ar';
   const navigate = useNavigate();
   const [credentials, setCredentials] = useState({ email: '', password: '' });
   const [loading, setLoading] = useState(false);

   useEffect(() => {
      if (token) navigate('/doctor/dashboard', { replace: true });
   }, [token, navigate]);

   const handleLogin = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
         const res = await api.post('/doctor/login', credentials);
         login(res.data.token, res.data.doctor);
         toast.success(t('auth.instructor_portal') + ' Authorized');
         navigate('/doctor/dashboard', { replace: true });
      } catch (error) {
         toast.error(t('auth.login_failed'));
      } finally {
         setLoading(false);
      }
   };

   const features = [GraduationCap, Microscope, BookOpen];

   return (
      <div className="min-h-screen w-full flex bg-background text-foreground font-sans">
         {/* LEFT PANEL: FACULTY BRAND */}
         <div className="hidden lg:flex w-[55%] flex-col justify-center items-center text-center p-16 border-e border-border bg-muted/30">
            <motion.div
               initial={{ opacity: 0, y: 8 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.3, ease: 'easeOut' }}
               className="flex flex-col items-center max-w-md"
            >
               <div className="w-32 h-32 flex items-center justify-center mb-8">
                  <img src="/logo.png" className="w-full h-full object-contain" alt="Logo" />
               </div>

               <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                  {t('auth.instructor_portal')}
               </h1>

               <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {t('mavi.login_desc')}
               </p>

               <div className="flex justify-center gap-4 pt-10">
                  {features.map((Icon, i) => (
                     <div
                        key={Icon?.displayName || i}
                        className="size-12 rounded-lg border border-border bg-card flex items-center justify-center"
                     >
                        <Icon className="size-5 text-primary" />
                     </div>
                  ))}
               </div>
            </motion.div>
         </div>

         {/* RIGHT PANEL: SECURE ACCESS */}
         <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16">
            <motion.div
               initial={{ opacity: 0, y: 8 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.3, ease: 'easeOut' }}
               className="w-full max-w-sm"
            >
               {/* Brand mark for mobile */}
               <div className="lg:hidden mb-8 flex flex-col items-center">
                  <img src="/logo.png" className="w-14 h-14 object-contain" alt="Logo" />
               </div>

               <div className="text-start mb-8">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                     {t('auth.sign_in')}
                  </h2>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                     {t('auth.instructor_portal')}
                  </p>
               </div>

               <form onSubmit={handleLogin} className="space-y-4">
                  <FormField label={t('auth.instructor_id')} htmlFor="doctor-email">
                     <div className="relative">
                        <Mail className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                           id="doctor-email"
                           type="email"
                           value={credentials.email}
                           onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                           placeholder="staff@znu.edu"
                           className="ps-8"
                        />
                     </div>
                  </FormField>

                  <FormField label={t('auth.access_key')} htmlFor="doctor-password">
                     <div className="relative">
                        <Lock className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                           id="doctor-password"
                           type="password"
                           value={credentials.password}
                           onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                           placeholder="••••••••"
                           className="ps-8"
                        />
                     </div>
                  </FormField>

                  <Button type="submit" size="lg" disabled={loading} className="w-full mt-2">
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
            </motion.div>
         </div>
      </div>
   );
};

export default DoctorLogin;
