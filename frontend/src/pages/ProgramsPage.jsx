import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import TiltCard from '../components/TiltCard';
import { programsData } from '../utils/programsData';
import { landingTranslations } from '../utils/landingTranslations';

export default function ProgramsPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const { isDarkMode } = useTheme();
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const tLocal = isAr ? landingTranslations.ar : landingTranslations.en;

  const filteredPrograms = activeCategory === 'all'
    ? programsData
    : programsData.filter(p => p.category === activeCategory);

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
      <main className="flex-grow z-10 max-w-[1400px] mx-auto px-6 lg:px-8 py-12 md:py-16 w-full">
        
        {/* Category Filters Panel */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-4 max-w-2xl text-start">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#2cfc7d]"></div>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">{tLocal.nav.programs}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">
              {tLocal.programs.title}
            </h2>
            <p className="text-xs md:text-sm text-gray-400 font-medium leading-relaxed">
              {tLocal.programs.subtitle}
            </p>
          </div>

          {/* Filters Switcher */}
          <div className="flex flex-wrap gap-2 bg-gray-100/50 dark:bg-white/[0.02] border border-gray-200/20 dark:border-white/5 p-1 rounded-2xl">
            {Object.keys(tLocal.filters).map((categoryKey) => {
              const isActive = activeCategory === categoryKey;
              return (
                <button
                  key={categoryKey}
                  onClick={() => setActiveCategory(categoryKey)}
                  className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  {tLocal.filters[categoryKey]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3D Perspective Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPrograms.map((prog) => (
            <TiltCard key={prog.id} className="h-full">
              <div
                onClick={() => {
                  navigate(`/programs/${prog.id}`);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="cursor-pointer group relative h-full bg-white dark:bg-[#0d0d14] border border-gray-200/30 dark:border-white/5 rounded-[2rem] p-7 hover:bg-slate-950 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-500 shadow-sm flex flex-col justify-between overflow-hidden min-h-[360px]"
              >

                <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-[#2cfc7d]/5 group-hover:bg-white/10 blur-3xl rounded-full transition-all duration-500" />

                <div className="space-y-4 relative z-10 text-start">
                  <div className="flex justify-between items-center">
                    <span className="px-3.5 py-1.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-[9px] font-black uppercase tracking-wider group-hover:bg-slate-900/10 dark:group-hover:bg-black/5 group-hover:border-slate-800/10 dark:group-hover:border-slate-900/10 transition-colors">
                      {isAr ? prog.facultyAr : prog.facultyEn}
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2cfc7d]" />
                  </div>

                  <h3 className="text-lg sm:text-xl font-black tracking-tight uppercase leading-snug line-clamp-2">
                    {isAr ? prog.titleAr : prog.titleEn}
                  </h3>

                  <p className="text-xs text-slate-500 group-hover:text-slate-200 dark:text-gray-400 dark:group-hover:text-slate-700 leading-relaxed font-medium line-clamp-3">
                    {isAr ? prog.descAr : prog.descEn}
                  </p>
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-white/5 group-hover:border-white/20 dark:group-hover:border-black/10 transition-all space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-0.5">
                      <span className="block text-[8px] font-black uppercase tracking-wider opacity-40">{tLocal.programs.duration}</span>
                      <span className="text-xs font-black flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#2cfc7d] group-hover:text-[#2cfc7d] dark:group-hover:text-emerald-700 transition-colors" />
                        {isAr ? prog.durationAr : prog.durationEn}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="block text-[8px] font-black uppercase tracking-wider opacity-40">{tLocal.programs.fees}</span>
                      <span className="text-xs font-black text-purple-600 dark:text-[#c084fc] group-hover:text-[#2cfc7d] dark:group-hover:text-purple-700 transition-colors">
                        {prog.fees} {tLocal.programs.egp}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[9px] font-black uppercase tracking-wider opacity-50 group-hover:opacity-100 transition-opacity">
                      {tLocal.programs.learnMore}
                    </span>
                    <ChevronRight className={`w-4.5 h-4.5 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all ${isAr ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                  </div>
                </div>

              </div>
            </TiltCard>
          ))}
        </div>

      </main>

      {/* Shared Footer */}
      <Footer />

    </div>
  );
}
