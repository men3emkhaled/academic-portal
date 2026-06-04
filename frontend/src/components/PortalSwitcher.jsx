import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Briefcase, Shield, Sun, Moon, Languages, Home } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const portals = [
  {
    id: 'student',
    label: 'portals.student',
    icon: GraduationCap,
    path: '/student/login',
    color: 'emerald',
    glowColor: 'rgba(16,185,129,0.25)',
  },
  {
    id: 'doctor',
    label: 'portals.doctor',
    icon: Briefcase,
    path: '/doctor/login',
    color: 'violet',
    glowColor: 'rgba(139,92,246,0.25)',
  },
  {
    id: 'admin',
    label: 'portals.admin',
    icon: Shield,
    path: '/admin/login',
    color: 'emerald',
    glowColor: 'rgba(16,185,129,0.25)',
  },
];

const PortalSwitcher = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleTheme, isDarkMode } = useTheme();
  const { t, i18n } = useTranslation();

  const getActivePortal = () => {
    if (location.pathname.startsWith('/student')) return 'student';
    if (location.pathname.startsWith('/doctor')) return 'doctor';
    if (location.pathname.startsWith('/admin')) return 'admin';
    return 'student';
  };

  const activeId = getActivePortal();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="fixed top-6 sm:top-8 inset-x-0 flex justify-center z-[200] pointer-events-none px-4">
      <div
        className={`pointer-events-auto flex items-center border rounded-full p-1.5 shadow-2xl transition-all duration-300 hover:scale-[1.02] ${
          isDarkMode 
            ? 'bg-black/60 border-white/10 shadow-black/60 backdrop-blur-md' 
            : 'bg-white/80 border-gray-200/30 shadow-gray-200/60 backdrop-blur-md'
        }`}
        style={{ animation: 'portalSwitcherIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Language Selector (First) */}
        <button
          onClick={toggleLanguage}
          className={`px-2.5 sm:px-4 py-2 sm:py-3 rounded-full flex items-center gap-1.5 transition-all duration-300 ${
            isDarkMode ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Languages className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
            {i18n.language === 'ar' ? 'EN' : 'العربية'}
          </span>
        </button>

        <div className={`w-px h-5 sm:h-6 mx-1 sm:mx-1.5 transition-colors ${isDarkMode ? 'bg-white/10' : 'bg-gray-200/60'}`} />

        {/* Temporary removed website switcher */}
        {/*
        <button
          onClick={() => navigate('/')}
          className={`px-2.5 sm:px-4 py-2 sm:py-3 rounded-full flex items-center gap-1.5 transition-all duration-300 ${
            isDarkMode ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
          }`}
          title={i18n.language === 'ar' ? 'العودة لموقع الجامعة' : 'Back to Website'}
        >
          <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden md:inline text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
            {i18n.language === 'ar' ? 'عن الجامعة' : 'About'}
          </span>
        </button>

        <div className={`w-px h-5 sm:h-6 mx-1 sm:mx-1.5 transition-colors ${isDarkMode ? 'bg-white/10' : 'bg-gray-200/60'}`} />
        */}

        {/* Portals Options Grid */}
        <div className="flex items-center gap-1 relative">
          {portals.map((portal) => {
            const Icon = portal.icon;
            const isActive = portal.id === activeId;

            return (
              <button
                key={portal.id}
                onClick={() => navigate(portal.path)}
                className={`
                  relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-widest
                  transition-all duration-500 z-10
                  ${isActive
                    ? (isDarkMode ? 'text-white font-extrabold' : 'text-gray-900 font-extrabold')
                    : (isDarkMode ? 'text-white/30 hover:text-white/70' : 'text-gray-400 hover:text-gray-900')}
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="activePortalUnderline"
                    className={`absolute inset-0 rounded-full -z-10 border ${
                      isDarkMode ? 'bg-white/10 border-white/10' : 'bg-gray-100 border-gray-200/50'
                    }`}
                    style={{ boxShadow: `0 0 20px ${portal.glowColor}` }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  >
                    <motion.div
                      layoutId="activePortalDot"
                      className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.7)] ${
                        isDarkMode ? 'bg-white' : 'bg-gray-800'
                      }`}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  </motion.div>
                )}

                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-500 ${isActive ? 'scale-110' : 'scale-100 opacity-50'}`} />
                <span className="hidden sm:inline">{t(portal.label)}</span>
              </button>
            );
          })}
        </div>

        <div className={`w-px h-5 sm:h-6 mx-1 sm:mx-2 transition-colors ${isDarkMode ? 'bg-white/10' : 'bg-gray-200/60'}`} />

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`p-2.5 sm:p-3 rounded-full transition-all duration-300 ${
            isDarkMode ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          {isDarkMode ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
        </button>
      </div>
      <style>{`
        @keyframes portalSwitcherIn { 
          from { opacity: 0; transform: translateY(-20px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
      `}</style>
    </div>
  );
};

export default PortalSwitcher;
