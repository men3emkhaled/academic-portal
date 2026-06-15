import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ChevronRight, MapPin, Mail, Phone, ArrowRight, ArrowLeft } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

// Shared Components & Utils
import Header from '../components/Header';
import Footer from '../components/Footer';
import TiltCard from '../components/TiltCard';
import { programsData } from '../utils/programsData';
import { landingTranslations } from '../utils/landingTranslations';

// Highly Formal Academic Crest Component for Zagazig National University
const AcademicCrest = () => {
  return (
    <div className="relative w-full max-w-[340px] sm:max-w-[380px] mx-auto select-none z-10 flex justify-center items-center">
      {/* Light soft ambient glow behind the logo to fit the premium theme */}
      <div className="absolute inset-8 bg-[#2cfc7d]/10 blur-[50px] rounded-full -z-10 animate-pulse-slow" />
      <motion.img
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        src="/logo.png"
        alt="Zagazig National University Logo"
        className="w-full h-auto object-contain max-h-[350px] drop-shadow-[0_15px_30px_rgba(44,252,125,0.12)] dark:drop-shadow-[0_15px_30px_rgba(44,252,125,0.04)]"
      />
    </div>
  );
};

export default function LandingPage() {
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

      {/* Main Content Area (displays everything sequentially on the Home route) */}
      <main className="flex-grow z-10">

        {/* Hero & Stats Section */}
        <section className="max-w-[1400px] mx-auto px-6 lg:px-8 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Hero Information */}
            <div className="lg:col-span-7 space-y-6 md:space-y-8 text-start">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200/50 dark:border-white/5 bg-white/50 dark:bg-white/[0.02]">
                <div className="w-2 h-2 rounded-full bg-[#2cfc7d] shadow-[0_0_10px_#2cfc7d]"></div>
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400">
                  {tLocal.hero.tagline}
                </span>
              </div>

              <h1 className={`text-[clamp(2.5rem,5.5vw,5.5rem)] font-black leading-[0.95] tracking-tighter uppercase text-slate-900 dark:text-white ${isAr ? 'font-arabic' : ''}`}>
                {tLocal.hero.title}
              </h1>

              <p className="text-base md:text-lg text-slate-500 dark:text-gray-400 max-w-xl font-medium leading-relaxed">
                {tLocal.hero.desc}
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={() => {
                    navigate('/programs');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-slate-900 dark:bg-white text-white dark:text-black font-black text-xs md:text-sm uppercase tracking-widest px-8 py-5 rounded-3xl hover:scale-105 transition-all shadow-lg flex items-center gap-2 group"
                >
                  <span>{tLocal.hero.explorePrograms}</span>
                  {isAr ? <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> : <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </button>
                <button
                  onClick={() => {
                    navigate('/about');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-white/50 dark:bg-white/[0.02] text-slate-800 dark:text-slate-300 border border-gray-200 dark:border-white/10 font-black text-xs md:text-sm uppercase tracking-widest px-8 py-5 rounded-3xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                >
                  {tLocal.hero.aboutUniversity}
                </button>
              </div>
            </div>

            {/* Highly Formal Academic Crest Asset */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <AcademicCrest />
            </div>

          </div>

          {/* Minimalist Stats Shelf */}
          <div className="mt-20 pt-12 border-t border-gray-200/50 dark:border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-start space-y-1">
              <p className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">4,600+</p>
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-gray-500">{tLocal.stats.students}</p>
            </div>
            <div className="text-start space-y-1">
              <p className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">7</p>
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-gray-500">{tLocal.stats.faculties}</p>
            </div>
            <div className="text-start space-y-1">
              <p className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">11</p>
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-gray-500">{tLocal.stats.programs}</p>
            </div>
            <div className="text-start space-y-1">
              <p className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">100%</p>
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-gray-500">{tLocal.stats.training}</p>
            </div>
          </div>
        </section>

        {/* Programs Showcase Section */}
        <section className="border-t border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-black/10 py-20">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPrograms.slice(0, 6).map((prog) => (
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

            <div className="mt-12 flex justify-center">
              <button
                onClick={() => {
                  navigate('/programs');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-slate-900 dark:bg-white text-white dark:text-black font-black text-xs md:text-sm uppercase tracking-widest px-8 py-4.5 rounded-3xl hover:scale-105 transition-all shadow-md flex items-center gap-2 group"
              >
                <span>{isAr ? "مشاهدة جميع البرامج" : "View All Programs"}</span>
                {isAr ? <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> : <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>

          </div>
        </section>

        {/* About Section */}
        <section className="py-20 border-t border-gray-100 dark:border-white/5">
          <div className="max-w-[1200px] mx-auto px-6">
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
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 border-t border-gray-100 dark:border-white/5 bg-gray-50/20 dark:bg-black/5">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="space-y-6 text-center max-w-2xl mx-auto mb-12">
              <div className="flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2cfc7d]"></div>
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">{tLocal.nav.contact}</span>
              </div>

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
                  <span className="block text-[8px] font-black uppercase tracking-wider opacity-40">{isAr ? "الموقع" : "Location"}</span>
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
          </div>
        </section>

      </main>

      {/* Shared Footer */}
      <Footer />

    </div>
  );
}
