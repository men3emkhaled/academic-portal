import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Briefcase, Shield, Sun, Moon, Languages } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const portals = [
  {
    id: 'student',
    label: 'portals.student',
    icon: GraduationCap,
    path: '/student/login',
    color: 'emerald',
    glowColor: 'rgba(16,185,129,0.3)',
  },
  {
    id: 'doctor',
    label: 'portals.doctor',
    icon: Briefcase,
    path: '/doctor/login',
    color: 'violet',
    glowColor: 'rgba(139,92,246,0.3)',
  },
  {
    id: 'admin',
    label: 'portals.admin',
    icon: Shield,
    path: '/admin/login',
    color: 'emerald',
    glowColor: 'rgba(16,185,129,0.3)',
  },
];

const PortalSwitcher = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleTheme, isDarkMode } = useTheme();
  const { t, i18n } = useTranslation();
  const [hoveredId, setHoveredId] = useState(null);

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
    <div className="fixed top-8 inset-x-0 flex justify-center z-[200] pointer-events-none px-4">
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`pointer-events-auto flex items-center border rounded-full p-1.5 shadow-2xl transition-colors duration-700 ${isDarkMode ? 'bg-black/40 border-white/10 shadow-black/50' : 'bg-white/70 border-gray-100 shadow-gray-200/50 backdrop-blur-2xl'}`}
      >
        <button
          onClick={toggleLanguage}
          className={`px-4 py-3 rounded-full flex items-center gap-2 transition-all duration-300 ${isDarkMode ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
        >
          <Languages className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">{i18n.language === 'ar' ? 'EN' : 'العربية'}</span>
        </button>

        <div className={`w-px h-6 mx-1 transition-colors ${isDarkMode ? 'bg-white/10' : 'bg-gray-100'}`} />

        <div className="flex items-center gap-1 relative">
          {portals.map((portal) => {
            const Icon = portal.icon;
            const isActive = portal.id === activeId;
            
            return (
              <button
                key={portal.id}
                onClick={() => navigate(portal.path)}
                onMouseEnter={() => setHoveredId(portal.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`
                  relative flex items-center gap-2 px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest
                  transition-colors duration-500 z-10
                  ${isActive 
                    ? (isDarkMode ? 'text-white' : 'text-gray-900') 
                    : (isDarkMode ? 'text-white/30 hover:text-white/70' : 'text-gray-400 hover:text-gray-900')}
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className={`absolute inset-0 rounded-full -z-10 border transition-colors ${isDarkMode ? 'bg-white/10 border-white/10' : 'bg-gray-100 border-gray-200'}`}
                    style={{ boxShadow: `0 0 25px ${portal.glowColor}` }}
                  >
                     <motion.div 
                        layoutId="active-dot"
                        className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] ${isDarkMode ? 'bg-white' : 'bg-gray-800'}`}
                     />
                  </motion.div>
                )}
                
                <Icon className={`w-4 h-4 transition-transform duration-500 ${isActive ? 'scale-110' : 'scale-100 opacity-50'}`} />
                <span className="hidden sm:inline">{t(portal.label)}</span>
              </button>
            );
          })}
        </div>

        <div className={`w-px h-6 mx-3 transition-colors ${isDarkMode ? 'bg-white/10' : 'bg-gray-100'}`} />

        <button
          onClick={toggleTheme}
          className={`p-3 rounded-full transition-all duration-300 ${isDarkMode ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </motion.div>
    </div>
  );
};

export default PortalSwitcher;
