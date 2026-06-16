import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Globe, Sun, Moon, LogIn, Users } from 'lucide-react';
import { landingTranslations } from '../utils/landingTranslations';
import { Button } from '@/components/ui/button';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const { i18n } = useTranslation();
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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Logo Brand */}
        <button
          type="button"
          onClick={() => handleTabChange('home')}
          className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <img src="/logo.png" alt="ZNU Logo" className="w-9 h-9 object-contain" />
          <span className="text-sm font-semibold text-foreground leading-tight text-start">
            {isAr ? "جامعة الزقازيق الأهلية" : "Zagazig National"}
          </span>
        </button>

        {/* Main Tab Links */}
        <nav className="hidden lg:flex items-center gap-1 p-1 bg-muted border border-border rounded-lg">
          {Object.keys(tLocal.nav).slice(0, 4).map((tabKey) => {
            const tabId = tabKey === 'home' ? 'home' : tabKey === 'programs' ? 'programs' : tabKey === 'about' ? 'about' : 'contact';
            const isActive = activeTab === tabId;
            return (
              <button
                key={tabId}
                onClick={() => handleTabChange(tabId)}
                className={`relative px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute inset-0 bg-background border border-border rounded-md -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                {tLocal.nav[tabKey]}
              </button>
            );
          })}
        </nav>

        {/* Quick Action Tray */}
        <div className="flex items-center gap-2">
          {/* Language Switch */}
          <Button
            variant="ghost"
            size="icon"
            onClick={changeLanguage}
            title="Toggle Language"
            aria-label="Toggle Language"
          >
            <Globe className="size-4 text-muted-foreground" />
          </Button>

          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title="Toggle Theme"
            aria-label="Toggle Theme"
          >
            {isDarkMode
              ? <Sun className="size-4 text-muted-foreground" />
              : <Moon className="size-4 text-muted-foreground" />}
          </Button>

          {/* Portal Action Buttons */}
          <Button
            size="sm"
            onClick={() => navigate('/student/login')}
          >
            <LogIn className="size-3.5" />
            <span>{tLocal.nav.portal}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/doctor/login')}
            className="hidden sm:inline-flex"
          >
            <Users className="size-3.5" />
            <span>{tLocal.nav.faculty}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
