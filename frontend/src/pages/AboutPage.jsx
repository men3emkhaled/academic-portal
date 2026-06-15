import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { landingTranslations } from '../utils/landingTranslations';

export default function AboutPage() {
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start text-start">

          {/* Left Description Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#2cfc7d]"></div>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">{tLocal.about.subtitle}</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-[1.05]">
              {tLocal.about.title}
            </h2>

            <p className="text-xs md:text-sm text-slate-500 dark:text-gray-400 font-medium leading-relaxed">
              {tLocal.about.text1}
            </p>

            <p className="text-xs md:text-sm text-slate-500 dark:text-gray-400 font-medium leading-relaxed">
              {tLocal.about.text2}
            </p>
          </div>

          {/* Right Highlights Column */}
          <div className="lg:col-span-6 space-y-6">
            {tLocal.about.features.map((feat, idx) => (
              <div
                key={feat?.id || idx}
                className="bg-white dark:bg-[#0d0d14] border border-gray-200/50 dark:border-white/5 p-7 rounded-[2rem] hover:scale-[1.02] transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2cfc7d]/10 flex items-center justify-center text-[#2cfc7d] font-black text-xs">
                    0{idx + 1}
                  </div>
                  <h3 className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">
                    {feat.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-400 font-medium leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </main>

      {/* Shared Footer */}
      <Footer />

    </div>
  );
}
