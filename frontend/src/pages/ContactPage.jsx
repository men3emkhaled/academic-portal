import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { landingTranslations } from '../utils/landingTranslations';

export default function ContactPage() {
  const { isDarkMode } = useTheme();
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const tLocal = isAr ? landingTranslations.ar : landingTranslations.en;

  return (
    <div className={`min-h-screen text-start font-sans transition-colors duration-500 overflow-x-hidden relative flex flex-col justify-between ${isDarkMode ? 'bg-[#030307] text-white' : 'bg-[#f8fafc] text-slate-900'}`}>

      {/* Dynamic Animated Ambient Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -50, 30, 0],
            scale: [1, 1.15, 0.9, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[10%] w-[450px] h-[450px] bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -30, 40, 0],
            y: [0, 60, -30, 0],
            scale: [1, 0.9, 1.1, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] right-[15%] w-[500px] h-[500px] bg-emerald-500/5 dark:bg-[#2cfc7d]/5 rounded-full blur-[130px]"
        />
      </div>

      {/* Shared Header Navigation */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-grow z-10 max-w-[1200px] mx-auto px-6 py-12 md:py-16 w-full">
        
        <div className="space-y-6 text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">
            {tLocal.contact.title}
          </h2>

          <p className="text-xs md:text-sm text-gray-400 font-medium leading-relaxed">
            {tLocal.contact.subtitle}
          </p>
        </div>

        {/* Clean Cards Layout for contacts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white dark:bg-[#0d0d14] border border-gray-200/50 dark:border-white/5 p-7 rounded-[2rem] text-start flex flex-col justify-between min-h-[190px] hover:scale-[1.02] transition-transform">
            <div className="w-11 h-11 rounded-xl bg-[#2cfc7d]/10 flex items-center justify-center flex-shrink-0 text-[#2cfc7d]">
              <MapPin className="w-4.5 h-4.5" />
            </div>
            <div className="space-y-0.5 mt-6">
              <span className="block text-[8px] font-black uppercase tracking-wider opacity-40">{t('landing.contact_address')}</span>
              <span className="text-xs font-bold leading-relaxed">{tLocal.contact.address}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0d0d14] border border-gray-200/50 dark:border-white/5 p-7 rounded-[2rem] text-start flex flex-col justify-between min-h-[190px] hover:scale-[1.02] transition-transform">
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0 text-purple-500">
              <Mail className="w-4.5 h-4.5" />
            </div>
            <div className="space-y-0.5 mt-6">
              <span className="block text-[8px] font-black uppercase tracking-wider opacity-40">Email</span>
              <span className="text-xs font-bold text-slate-500 dark:text-gray-400">info@znu.edu.eg</span>
              <span className="block text-[9px] text-gray-400 mt-1">{tLocal.contact.email}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0d0d14] border border-gray-200/50 dark:border-white/5 p-7 rounded-[2rem] text-start flex flex-col justify-between min-h-[190px] hover:scale-[1.02] transition-transform">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-500">
              <Phone className="w-4.5 h-4.5" />
            </div>
            <div className="space-y-0.5 mt-6">
              <span className="block text-[8px] font-black uppercase tracking-wider opacity-40">Hotline</span>
              <span className="text-xs font-bold text-slate-400 dark:text-gray-500">{tLocal.contact.phone}</span>
            </div>
          </div>

        </div>

      </main>

      {/* Shared Footer */}
      <Footer />

    </div>
  );
}
