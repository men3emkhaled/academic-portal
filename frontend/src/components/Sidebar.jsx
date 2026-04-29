import React, { useState, useEffect } from 'react';
import { Home, Calendar, Library, BarChart3, FileText, Map, Bell, CheckSquare, Settings, LogOut, Menu, X, ShieldCheck, Sun, Moon } from 'lucide-react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const Sidebar = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isPWA, setIsPWA] = useState(false);
  const { student } = useStudentAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Detect PWA standalone mode
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true
      || document.referrer.includes('android-app://');
    setIsPWA(isStandalone);
  }, []);

  // Set CSS custom property for bottom bar height so pages can add proper padding
  useEffect(() => {
    if (isMobile) {
      const barHeight = isPWA ? 80 : 70;
      document.documentElement.style.setProperty('--bottom-bar-h', `${barHeight}px`);
    } else {
      document.documentElement.style.removeProperty('--bottom-bar-h');
    }
  }, [isMobile, isPWA]);

  const bottomBarItems = [
    { id: 'dashboard', label: t('sidebar.dashboard'), icon: <Home className="w-5 h-5" />, path: '/student/dashboard' },
    { id: 'timetable', label: t('sidebar.timetable'), icon: <Calendar className="w-5 h-5" />, path: '/student/timetable' },
    { id: 'materials', label: t('sidebar.materials'), icon: <Library className="w-5 h-5" />, path: '/student/materials' },
  ];

  const menuItems = [
    { id: 'grades', label: t('sidebar.courses_grades'), icon: <BarChart3 className="w-5 h-5" />, path: '/student/grades' },
    { id: 'quizzes', label: t('sidebar.quizzes'), icon: <FileText className="w-5 h-5" />, path: '/student/quizzes' },
    { id: 'roadmap', label: t('sidebar.roadmap'), icon: <Map className="w-5 h-5" />, path: '/student/roadmap' },
    { id: 'notifications', label: t('sidebar.notifications'), icon: <Bell className="w-5 h-5" />, path: '/student/notifications' },
    { id: 'personal-tasks', label: t('sidebar.personal_tasks'), icon: <CheckSquare className="w-5 h-5" />, path: '/student/personal-tasks' },
    { id: 'settings', label: t('sidebar.settings'), icon: <Settings className="w-5 h-5" />, path: '/student/settings' },
  ];

  if (student && (student.role === 'assistant' || student.role === 'admin')) {
    menuItems.push({ id: 'admin-panel', label: 'Admin Panel', icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />, path: '/admin' });
  }

  const handleLogout = () => {
    onLogout();
    navigate('/student/login');
  };

  // ============= Sidebar Desktop =============
  if (!isMobile) {
    return (
      <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-white/5 z-40 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.5)] transition-colors duration-300">
        <div className="p-6 border-b border-gray-200 dark:border-white/5 flex items-center gap-4 bg-gradient-to-b from-gray-50 to-white dark:from-white/[0.02] dark:to-transparent">
          <div className="relative flex flex-shrink-0 items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-green-700 shadow-[0_0_20px_rgba(142,255,113,0.3)]">
            <div className="absolute inset-[2px] bg-white dark:bg-[#050505] rounded-xl transition-colors duration-300"></div>
            <div className="relative font-black text-2xl text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-primary dark:from-white dark:to-primary tracking-tighter font-headline">
              Z
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 tracking-tight leading-none font-headline">
              ZNU
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary/80 dark:text-primary/70 mt-1">
              CS Portal
            </p>
          </div>
        </div>

        {student && (
          <div className="p-5 border-b border-gray-200 dark:border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10 flex flex-col gap-3">
              <h3 className="text-gray-900 dark:text-white font-headline font-bold text-[15px] leading-snug line-clamp-2">
                {student.name}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black tracking-widest uppercase text-white dark:text-dark bg-primary px-2 py-1 rounded-md leading-none shadow-[0_0_10px_rgba(var(--primary),0.3)]">
                  ID: {student.id}
                </span>
                <span className="text-[10px] font-bold tracking-widest uppercase text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 px-2 py-1 border border-gray-200 dark:border-white/10 rounded-md leading-none">
                  Lvl {student.level}
                </span>
                <span className="text-[10px] font-bold tracking-widest uppercase text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 px-2 py-1 border border-gray-200 dark:border-white/10 rounded-md leading-none">
                  Sec {student.section || '—'}
                </span>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto hidden-scrollbar">
          {[...bottomBarItems, ...menuItems].map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300
                ${isActive
                  ? 'bg-primary/10 text-primary shadow-[inset_0_0_20px_rgba(46,204,113,0.05)] border border-primary/20 font-semibold'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white border border-transparent font-medium'
                }
              `}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-white/5 flex flex-col gap-2">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-2xl text-gray-700 dark:text-gray-300 font-bold bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span>{theme === 'dark' ? t('sidebar.light_mode', 'Light Mode') : t('sidebar.dark_mode', 'Dark Mode')}</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-2xl text-red-500 dark:text-red-400 font-bold bg-red-50 dark:bg-red-400/5 border border-red-100 dark:border-red-400/10 hover:bg-red-100 dark:hover:bg-red-400/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>{t('sidebar.logout')}</span>
          </button>
        </div>
      </div>
    );
  }

  // ============= Bottom Navigation Bar Mobile =============
  return (
    <>
      <div
        className="fixed left-0 right-0 bg-white/95 dark:bg-dark-glass/95 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.5)] px-2 pt-2 transition-colors duration-300"
        style={{
          bottom: 0,
          paddingBottom: isPWA
            ? 'max(env(safe-area-inset-bottom, 12px), 12px)'
            : 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
        }}
      >
        <div className="flex justify-around items-center">
          {bottomBarItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive: navActive }) => `
                  flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300
                  ${isActive || navActive
                    ? 'text-primary bg-primary/10 shadow-[inset_0_0_15px_rgba(46,204,113,0.1)] border border-primary/10'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-300 border border-transparent'
                  }
                `}
              >
                <span>{item.icon}</span>
                <span className="text-[11px] font-semibold">{item.label}</span>
              </NavLink>
            );
          })}
          <button
            onClick={() => setIsOpen(true)}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-2xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-300 border border-transparent transition-all"
          >
            <Menu className="w-6 h-6" />
            <span className="text-[11px] font-semibold">{t('sidebar.more', 'More')}</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-gray-900/60 dark:bg-black/80 backdrop-blur-md z-50 transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed bottom-24 left-4 right-4 bg-white dark:bg-dark-card border border-gray-200 dark:border-white/10 rounded-[2rem] shadow-2xl z-50 animate-slideUp overflow-hidden transition-colors duration-300">
            <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-[14px] bg-gradient-to-br from-primary to-green-700 shadow-[0_0_15px_rgba(142,255,113,0.3)]">
                  <div className="absolute inset-[2px] bg-white dark:bg-[#050505] rounded-[12px] transition-colors duration-300"></div>
                  <span className="relative font-black text-xl text-primary font-headline">Z</span>
                </div>
                <div>
                  <h3 className="text-[16px] font-extrabold text-gray-900 dark:text-white leading-none tracking-tight font-headline mb-1">ZNU Menu</h3>
                  {student && (
                    <p className="text-[11px] text-primary/80 dark:text-primary/70 font-bold uppercase tracking-widest mt-1 truncate max-w-[120px]">{student.name.split(' ')[0]}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 max-h-[55vh] overflow-y-auto hidden-scrollbar">
              <div className="space-y-1">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`
                        flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300
                        ${isActive
                          ? 'bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_0_15px_rgba(46,204,113,0.05)]'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white border border-transparent'
                        }
                      `}
                    >
                      <div className={`p-1.5 rounded-xl transition-colors duration-300 ${isActive ? 'bg-primary/20 text-primary' : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400'}`}>
                        {item.icon}
                      </div>
                      <span className="font-semibold">{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(142,255,113,0.8)]" />
                      )}
                    </NavLink>
                  );
                })}
              </div>

              <div className="my-3 mx-2 h-px bg-gray-200 dark:bg-white/5" />

              <div className="flex gap-2">
                <button
                  onClick={toggleTheme}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-2xl text-gray-700 dark:text-gray-300 font-bold bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  <span className="font-bold">{theme === 'dark' ? 'Light' : 'Dark'}</span>
                </button>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="flex-[2] flex items-center justify-center gap-3 px-4 py-4 rounded-2xl text-red-500 dark:text-red-400 font-bold bg-red-50 dark:bg-red-400/5 border border-red-100 dark:border-red-400/10 hover:bg-red-100 dark:hover:bg-red-400/10 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-bold">{t('sidebar.logout')}</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slideUp { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .font-headline { font-family: 'Manrope', 'Inter', sans-serif; }
        .hidden-scrollbar::-webkit-scrollbar { display: none; }
        .hidden-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 1rem); }

        /* PWA standalone: ensure fixed elements stay visible */
        @media (display-mode: standalone) {
          html {
            height: 100%;
            overflow: auto;
          }
          body {
            min-height: 100%;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;