import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Globe, Sun, Moon, LogIn, Users } from 'lucide-react';
import { landingTranslations } from '../utils/landingTranslations';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const tLocal = isAr ? landingTranslations.ar : landingTranslations.en;

  const changeLanguage = () => {
    const nextLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(nextLang);
  };

  // Determine current active tab from pathname
  const currentPath = location.pathname;
  const activeTab = currentPath === '/' ? 'home' 
    : currentPath === '/programs' ? 'programs' 
    : currentPath === '/about' ? 'about' 
    : currentPath === '/contact' ? 'contact' 
    : 'home';

  const handleTabChange = (tabId) => {
    const targetPath = tabId === 'home' ? '/' : `/${tabId}`;
    navigate(targetPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300 border-b border-gray-100 dark:border-white/5 bg-white/80 dark:bg-[#030307]/80 backdrop-blur-xl">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">

        {/* Logo Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleTabChange('home')}>
          <img src="/logo.png" alt="ZNU Logo" className="w-11 h-11 object-contain hover:scale-105 transition-transform" />
          <div className="flex flex-col justify-center">
            <span className="block font-black text-sm uppercase tracking-wider text-slate-800 dark:text-white leading-none">
              {t('header.portal_title')}
            </span>
          </div>
        </div>

        {/* Main Tab Links */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1.5 bg-gray-100/50 dark:bg-white/[0.03] border border-gray-200/20 dark:border-white/5 rounded-full">
          {Object.keys(tLocal.nav).slice(0, 4).map((tabKey) => {
            const tabId = tabKey === 'home' ? 'home' : tabKey === 'programs' ? 'programs' : tabKey === 'about' ? 'about' : 'contact';
            const isActive = activeTab === tabId;
            return (
              <button
                key={tabId}
                onClick={() => handleTabChange(tabId)}
                className={`relative px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                  isActive ? 'text-black dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute inset-0 bg-white dark:bg-white/10 rounded-full shadow-sm -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {tLocal.nav[tabKey]}
              </button>
            );
          })}
        </nav>

        {/* Quick Action Tray */}
        <div className="flex items-center gap-3">
          {/* Language Switch */}
          <button
            onClick={changeLanguage}
            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 border border-gray-200/20 dark:border-white/5 transition-colors"
            title="Toggle Language"
          >
            <Globe className="w-4.5 h-4.5 text-gray-500 dark:text-gray-400" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 border border-gray-200/20 dark:border-white/5 transition-colors"
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-4.5 h-4.5 text-yellow-400" /> : <Moon className="w-4.5 h-4.5 text-gray-600" />}
          </button>

          {/* Portal Action Buttons */}
          <button
            onClick={() => navigate('/student/login')}
            className="flex items-center gap-2 bg-[#2cfc7d] hover:bg-[#1ebf5e] text-black font-black text-[11px] uppercase tracking-wider px-5 py-3 rounded-full hover:scale-105 transition-all shadow-md shadow-emerald-500/10"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{tLocal.nav.portal}</span>
          </button>

          <button
            onClick={() => navigate('/doctor/login')}
            className="hidden sm:flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-black font-black text-[11px] uppercase tracking-wider px-5 py-3 rounded-full hover:scale-105 transition-all shadow-sm"
          >
            <Users className="w-3.5 h-3.5" />
            <span>{tLocal.nav.faculty}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
