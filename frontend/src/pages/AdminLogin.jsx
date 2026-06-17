import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Terminal, Fingerprint, ArrowRight, ShieldCheck, Activity, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField, Spinner } from '@/components/common';

const AdminLogin = () => {
   const { token, login } = useAuth();
   const { t, i18n } = useTranslation();
   const navigate = useNavigate();
   const isAr = i18n.language === 'ar';
   const [credentials, setCredentials] = useState({ username: '', password: '' });
   const [loading, setLoading] = useState(false);

   useEffect(() => {
      if (token) navigate('/admin', { replace: true });
   }, [token, navigate]);

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
         const res = await api.post('/admin/login', credentials);
         login(res.data.token);
         toast.success(t('auth.admin_portal') + ' Authorized');
         navigate('/admin', { replace: true });
      } catch (error) {
         toast.error(t('auth.login_failed'));
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="min-h-screen w-full flex bg-background text-foreground font-sans">
         {/* LEFT PANEL: BRAND */}
         <div className="hidden lg:flex w-[55%] flex-col justify-center items-center text-center p-16 border-e border-border bg-muted/40">
            <motion.div
               initial={{ opacity: 0, y: 8 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.3, ease: 'easeOut' }}
               className="w-full max-w-md space-y-10"
            >
               <div className="flex justify-center">
                  <img src="/logo.png" className="w-44 h-44 object-contain" alt="Logo" />
               </div>

               <div className="space-y-3">
                  <h1 className="text-3xl font-semibold tracking-tight">
                     {t('auth.admin_portal')}
                  </h1>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                     {t('mavi.login_desc')}
                  </p>
               </div>

               <div className="flex justify-center gap-3 pt-2">
                  {[ShieldCheck, Activity, Cpu].map((Icon, i) => (
                     <div
                        key={Icon?.displayName || i}
                        className="size-11 rounded-lg border border-border bg-card flex items-center justify-center"
                     >
                        <Icon className="size-5 text-primary" />
                     </div>
                  ))}
               </div>
            </motion.div>
         </div>

         {/* RIGHT PANEL: SECURE LOGIN */}
         <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 lg:p-16">
            <motion.div
               initial={{ opacity: 0, y: 8 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.3, ease: 'easeOut' }}
               className="w-full max-w-sm"
            >
               {/* Brand icon for mobile */}
               <div className="lg:hidden mb-8 flex flex-col items-center gap-3">
                  <img src="/logo.png" className="w-16 h-16 object-contain" alt="Logo" />
               </div>

               <div className="text-start mb-8">
                  <h2 className="text-2xl font-semibold tracking-tight">{t('auth.sign_in')}</h2>
                  <p className="mt-1.5 text-sm text-muted-foreground">{t('auth.admin_portal')}</p>
               </div>

               <form onSubmit={handleSubmit} className="space-y-5">
                  <FormField label={t('auth.admin_id')} htmlFor="admin-username">
                     <div className="relative">
                        <Terminal className="pointer-events-none absolute top-1/2 -translate-y-1/2 start-2.5 size-4 text-muted-foreground" />
                        <Input
                           id="admin-username"
                           type="text"
                           value={credentials.username}
                           onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                           placeholder={t('auth.enter_id')}
                           className="ps-9"
                        />
                     </div>
                  </FormField>

                  <FormField label={t('auth.access_key')} htmlFor="admin-password">
                     <div className="relative">
                        <Fingerprint className="pointer-events-none absolute top-1/2 -translate-y-1/2 start-2.5 size-4 text-muted-foreground" />
                        <Input
                           id="admin-password"
                           type="password"
                           value={credentials.password}
                           onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                           placeholder="••••••••"
                           className="ps-9"
                        />
                     </div>
                  </FormField>

                  <Button type="submit" size="lg" disabled={loading} className="w-full">
                     {loading ? (
                        <>
                           <Spinner className="text-current" />
                           <span>{t('auth.processing')}</span>
                        </>
                     ) : (
                        <>
                           <span>{t('auth.authenticate')}</span>
                           <ArrowRight className={`size-4 ${isAr ? 'rotate-180' : ''}`} />
                        </>
                     )}
                  </Button>
               </form>
            </motion.div>
         </div>
      </div>
   );
};

export default AdminLogin;
