import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Briefcase, Shield, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const portals = [
  {
    id: 'student',
    label: 'Student',
    icon: GraduationCap,
    path: '/student/login',
    color: 'from-emerald-500 to-green-400',
    activeClass: 'bg-white dark:bg-[#1a1a1a] text-emerald-600 dark:text-emerald-400 shadow-sm border border-gray-200 dark:border-white/5',
    hoverClass: 'hover:bg-gray-50/50 dark:hover:bg-white/5 hover:text-emerald-600 dark:hover:text-emerald-400',
  },
  {
    id: 'doctor',
    label: 'Instructor',
    icon: Briefcase,
    path: '/doctor/login',
    color: 'from-blue-500 to-cyan-400',
    activeClass: 'bg-white dark:bg-[#1a1a1a] text-blue-600 dark:text-blue-400 shadow-sm border border-gray-200 dark:border-white/5',
    hoverClass: 'hover:bg-gray-50/50 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-blue-400',
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: Shield,
    path: '/admin',
    color: 'from-violet-500 to-purple-400',
    activeClass: 'bg-white dark:bg-[#1a1a1a] text-violet-600 dark:text-violet-400 shadow-sm border border-gray-200 dark:border-white/5',
    hoverClass: 'hover:bg-gray-50/50 dark:hover:bg-white/5 hover:text-violet-600 dark:hover:text-violet-400',
  },
];

const PortalSwitcher = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [hoveredId, setHoveredId] = useState(null);

  const getActivePortal = () => {
    if (location.pathname.startsWith('/student')) return 'student';
    if (location.pathname.startsWith('/doctor')) return 'doctor';
    if (location.pathname.startsWith('/admin')) return 'admin';
    return 'student';
  };

  const activeId = getActivePortal();

  const handleSwitch = (portal) => {
    if (portal.id !== activeId) {
      navigate(portal.path);
    }
  };

  return (
    <div className="fixed top-4 sm:top-6 inset-x-0 flex justify-center z-[100] animate-fadeIn pointer-events-none px-4">
      <div className="pointer-events-auto flex items-center justify-center gap-1 sm:gap-2 bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-full p-1 sm:p-1.5 shadow-xl shadow-black/5 dark:shadow-white/5">
        {portals.map((portal) => {
          const Icon = portal.icon;
          const isActive = portal.id === activeId;
          const isHovered = portal.id === hoveredId;

          return (
            <button
              key={portal.id}
              onClick={() => handleSwitch(portal)}
              onMouseEnter={() => setHoveredId(portal.id)}
              onMouseLeave={() => setHoveredId(null)}
              disabled={isActive}
              className={`
                relative flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-[11px] sm:text-xs font-bold
                transition-all duration-300 whitespace-nowrap
                ${isActive
                  ? `${portal.activeClass} cursor-default scale-100`
                  : `border border-transparent text-gray-500 dark:text-gray-400 ${portal.hoverClass} cursor-pointer scale-[0.98] sm:scale-95 hover:scale-100`
                }
              `}
              title={`Switch to ${portal.label} Portal`}
            >
              {isActive && (
                <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gradient-to-r ${portal.color} blur-[1px]`} />
              )}
              
              <Icon
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 transition-transform duration-300 ${isHovered && !isActive ? 'scale-110' : ''}`}
              />

              <span className="tracking-wide">{portal.label}</span>
            </button>
          );
        })}

        <div className="w-px h-6 bg-gray-200/50 dark:border-white/10 mx-1" />

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all duration-300"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

export default PortalSwitcher;
