import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Briefcase, Shield, Sun, Moon, Languages } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const portals = [
  {
    id: 'student',
    label: 'portals.student',
    icon: GraduationCap,
    path: '/student/login',
  },
  {
    id: 'doctor',
    label: 'portals.doctor',
    icon: Briefcase,
    path: '/doctor/login',
  },
  {
    id: 'admin',
    label: 'portals.admin',
    icon: Shield,
    path: '/admin/login',
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
        className="pointer-events-auto flex items-center gap-1 border border-border bg-card rounded-full p-1.5 shadow-sm"
        style={{ animation: 'portalSwitcherIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Language Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLanguage}
          className="rounded-full text-muted-foreground"
          title="Toggle Language"
          aria-label="Toggle Language"
        >
          <Languages className="size-4" />
          <span className="hidden sm:inline text-xs font-medium">
            {i18n.language === 'ar' ? 'EN' : 'العربية'}
          </span>
        </Button>

        <div className="w-px h-5 mx-0.5 bg-border" />

        {/* Portal Options */}
        <div className="flex items-center gap-0.5 relative">
          {portals.map((portal) => {
            const Icon = portal.icon;
            const isActive = portal.id === activeId;

            return (
              <button
                key={portal.id}
                type="button"
                onClick={() => navigate(portal.path)}
                className={`relative flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring z-10 ${
                  isActive
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activePortalUnderline"
                    className="absolute inset-0 rounded-full bg-primary -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon className="size-4" />
                <span className="hidden sm:inline">{t(portal.label)}</span>
              </button>
            );
          })}
        </div>

        <div className="w-px h-5 mx-0.5 bg-border" />

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full text-muted-foreground"
          title="Toggle Theme"
          aria-label="Toggle Theme"
        >
          {isDarkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
      </div>
      <style>{`
        @keyframes portalSwitcherIn {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default PortalSwitcher;
