import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { Home, Calendar, Library, BarChart3, FileText, Map, Bell, CheckSquare, Settings, LogOut, Menu, X, ShieldCheck, Sun, Moon, LayoutDashboard, BookOpen, TrendingUp, Languages } from 'lucide-react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const Sidebar = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { student, logout } = useStudentAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Mobile-specific hooks moved here to avoid "fewer hooks than expected" error
  const [dragPosition, setDragPosition] = useState(null); // Percentage 0-100
  const dockRef = React.useRef(null);
  const indicatorRef = React.useRef(null);
  const isAnimatingRef = React.useRef(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const bottomBarItems = [
    { id: 'dashboard', label: t('sidebar.dashboard'), icon: <LayoutDashboard className="w-5 h-5" />, path: '/student/dashboard' },
    { id: 'timetable', label: t('sidebar.timetable'), icon: <Calendar className="w-5 h-5" />, path: '/student/timetable' },
    { id: 'materials', label: t('sidebar.materials'), icon: <BookOpen className="w-5 h-5" />, path: '/student/materials' },
    { id: 'grades', label: t('sidebar.courses_grades'), icon: <TrendingUp className="w-5 h-5" />, path: '/student/grades' },
  ];

  const menuItems = [
    { id: 'quizzes', label: t('sidebar.quizzes'), icon: <FileText className="w-5 h-5" />, path: '/student/quizzes' },
    { id: 'roadmap', label: t('sidebar.roadmap'), icon: <Map className="w-5 h-5" />, path: '/student/roadmap' },
    { id: 'notifications', label: t('sidebar.notifications'), icon: <Bell className="w-5 h-5" />, path: '/student/notifications' },
    { id: 'personal-tasks', label: t('sidebar.personal_tasks'), icon: <CheckSquare className="w-5 h-5" />, path: '/student/personal-tasks' },
    { id: 'settings', label: t('sidebar.settings'), icon: <Settings className="w-5 h-5" />, path: '/student/settings' },
  ];

  if (student && (student.role === 'assistant' || student.role === 'admin')) {
    menuItems.push({ id: 'admin-panel', label: t('sidebar.admin_panel'), icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />, path: '/admin' });
  }

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
    else logout();
    navigate('/student/login');
  };

  // ============= Sidebar Desktop =============
  if (!isMobile) {
    return (
      <div className="fixed z-50 transition-all duration-700 w-72" style={{ insetInlineStart: '1.5rem', top: '1rem', bottom: '1rem' }}>
        <div className="h-full bg-white/70 dark:bg-[#080808]/70 backdrop-blur-3xl border border-white/20 dark:border-white/5 rounded-[3rem] shadow-[0_32px_64px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden relative group/sidebar">

          <div className="p-8 pb-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full overflow-hidden shadow-2xl bg-white dark:bg-white/5 border border-white/20 transition-transform duration-500 group-hover/sidebar:scale-110">
              <img src="/logo.png" alt="ZNU Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-sm font-black uppercase tracking-[0.4em] text-gray-900 dark:text-white opacity-40 mt-4">Portal</h1>
          </div>

          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto hidden-scrollbar relative z-10">
            {[...bottomBarItems, ...menuItems].map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => `
                  relative group/item flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-500
                  ${isActive ? 'text-gray-900 dark:text-white font-black' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}
                `}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute inset-0 bg-gray-100 dark:bg-white/5 rounded-2xl animate-in fade-in zoom-in-95 duration-500" />
                    )}
                    <span className={`relative z-10 transition-all duration-500 ${isActive ? 'scale-110 text-primary' : 'group-hover/item:scale-110'}`}>
                      {item.icon}
                    </span>
                    <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                    {isActive && (
                      <div className="absolute inset-inline-start-0 w-1 h-6 bg-primary rounded-full shadow-[4px_0_15px_rgba(46,204,113,0.5)]" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="p-6 pt-0 relative z-10">
            <div className="bg-gray-50/50 dark:bg-white/[0.02] rounded-[2rem] p-2 flex gap-1 border border-gray-100 dark:border-white/5">
              <button onClick={toggleLanguage} className="flex-1 h-12 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-white/5 transition-all text-gray-400 hover:text-primary">
                <Languages className="w-5 h-5" />
              </button>
              <button onClick={toggleTheme} className="flex-1 h-12 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-white/5 transition-all text-gray-400 hover:text-primary">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={handleLogout} className="flex-1 h-12 flex items-center justify-center rounded-xl hover:bg-rose-500/10 transition-all text-gray-400 hover:text-rose-500">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============= Mobile Dock (Dynamic Island Style) =============

  const handleTouchStart = (e) => {
    updateDragPosition(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    updateDragPosition(e.targetTouches[0].clientX);
  };

  const updateDragPosition = (clientX) => {
    if (!dockRef.current) return;
    const rect = dockRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const percent = (relativeX / rect.width) * 100;
    setDragPosition(Math.max(0, Math.min(percent, 100)));
  };

  const handleTouchEnd = () => {
    if (dragPosition !== null) {
      const itemWidth = 100 / bottomBarItems.length;
      const index = Math.floor(dragPosition / itemWidth);
      const safeIndex = Math.max(0, Math.min(index, bottomBarItems.length - 1));
      navigate(bottomBarItems[safeIndex].path);
    }
    setDragPosition(null);
  };

  const currentIndex = bottomBarItems.findIndex(item => location.pathname === item.path);
  const itemWidthPercent = 100 / bottomBarItems.length;

  // Animation Logic for the Indicator (Jelly / Liquid effect)
  let translateX = 0;
  let indicatorWidthPercent = itemWidthPercent;
  let stretchOrigin = 'center';

  if (dragPosition !== null) {
    // 1. Center of the finger
    const fingerPercent = Math.max(0, Math.min(dragPosition, 100));

    // 2. Center of the closest tab
    const closestIndex = Math.floor(fingerPercent / itemWidthPercent);
    const safeClosestIndex = Math.max(0, Math.min(closestIndex, bottomBarItems.length - 1));
    const closestTabCenterPercent = (safeClosestIndex * itemWidthPercent) + (itemWidthPercent / 2);

    // 3. Distance from closest tab
    const distanceFromCenter = fingerPercent - closestTabCenterPercent;
    const absDistance = Math.abs(distanceFromCenter);

    // 4. Stretch factor (peaks exactly halfway between two tabs)
    const stretchFactor = Math.min(absDistance / (itemWidthPercent / 2), 1);

    // 5. Calculate width (base is full tab width, stretch adds up to ~80% more width)
    const maxStretchPercent = itemWidthPercent * 1.8;
    indicatorWidthPercent = itemWidthPercent + (maxStretchPercent - itemWidthPercent) * stretchFactor;

    // 6. Set transform origin based on drag direction to anchor the stretch
    if (distanceFromCenter > 0) {
      stretchOrigin = 'left'; // Stretching to the right
      translateX = closestTabCenterPercent;
    } else {
      stretchOrigin = 'right'; // Stretching to the left
      translateX = closestTabCenterPercent;
    }

    // Smoothly shift translateX towards the finger to make the 'head' follow the finger
    translateX = closestTabCenterPercent + (distanceFromCenter * 0.5);

  } else {
    // Resting state
    translateX = (currentIndex * itemWidthPercent) + (itemWidthPercent / 2);
  }

  const activeIndex = dragPosition !== null
    ? Math.max(0, Math.min(Math.floor(dragPosition / itemWidthPercent), bottomBarItems.length - 1))
    : currentIndex;

  return (
    <>
      <div className="fixed inset-inline-start-0 inset-inline-end-0 bottom-4 z-50 flex items-center justify-center gap-3 px-4 pointer-events-none">
        {/* Main Capsule */}
        <div
          ref={dockRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex-1 flex items-center relative bg-[#1c1c1e] dark:bg-[#1c1c1e] backdrop-blur-3xl border border-white/[0.06] dark:border-white/[0.06] rounded-[2rem] py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)] pointer-events-auto touch-none select-none overflow-hidden [.light_&]:bg-white/80 [.light_&]:border-black/[0.06] [.light_&]:shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
        >
          {/* Animated Jelly Indicator */}
          <div
            ref={indicatorRef}
            className={`absolute top-1/2 -translate-y-1/2 h-14 bg-white/[0.15] dark:bg-white/[0.15] rounded-[1.75rem] z-0 [.light_&]:bg-black/[0.07] ${dragPosition === null && !isAnimatingRef.current ? 'transition-all duration-[350ms] cubic-bezier(0.34,1.56,0.64,1)' : ''}`}
            style={{
              width: `${indicatorWidthPercent}%`,
              insetInlineStart: `${translateX}%`,
              transform: `translate(${i18n.language === 'ar' ? '50%' : '-50%'}, -50%)`,
              transformOrigin: stretchOrigin,
              transition: dragPosition !== null ? 'none' : undefined,
            }}
          />

          {bottomBarItems.map((item, idx) => {
            const isHighlighted = activeIndex === idx;

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (idx === currentIndex || isAnimatingRef.current) return;

                  const el = indicatorRef.current;
                  if (!el) return;

                  isAnimatingRef.current = true;

                  const startPercent = (currentIndex * itemWidthPercent) + (itemWidthPercent / 2);
                  const endPercent = (idx * itemWidthPercent) + (itemWidthPercent / 2);

                  let startTime = null;
                  const duration = 400;

                  // Direct DOM animation - bypasses React completely
                  const animateSlide = (timestamp) => {
                    if (!startTime) startTime = timestamp;
                    const elapsed = timestamp - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    // Easing (cubic out)
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const fingerPercent = startPercent + (endPercent - startPercent) * eased;

                    // Calculate jelly stretch (same logic as drag)
                    const closestIdx = Math.floor(fingerPercent / itemWidthPercent);
                    const safeIdx = Math.max(0, Math.min(closestIdx, bottomBarItems.length - 1));
                    const tabCenter = (safeIdx * itemWidthPercent) + (itemWidthPercent / 2);
                    const dist = fingerPercent - tabCenter;
                    const absDist = Math.abs(dist);
                    const stretch = Math.min(absDist / (itemWidthPercent / 2), 1);
                    const maxW = itemWidthPercent * 1.8;
                    const w = itemWidthPercent + (maxW - itemWidthPercent) * stretch;
                    const pos = tabCenter + (dist * 0.5);

                    // Apply directly to DOM
                    el.style.transition = 'none';
                    el.style.width = `${w}%`;
                    if (i18n.language === 'ar') {
                      el.style.insetInlineStart = `${pos}%`;
                      el.style.transform = `translate(50%, -50%)`;
                      el.style.transformOrigin = dist > 0 ? 'right' : dist < 0 ? 'left' : 'center';
                    } else {
                      el.style.insetInlineStart = `${pos}%`;
                      el.style.transform = `translate(-50%, -50%)`;
                      el.style.transformOrigin = dist > 0 ? 'left' : dist < 0 ? 'right' : 'center';
                    }

                    if (progress < 1) {
                      requestAnimationFrame(animateSlide);
                    } else {
                      // Animation done - navigate and reset
                      el.style.transition = '';
                      isAnimatingRef.current = false;
                      navigate(item.path);
                    }
                  };

                  requestAnimationFrame(animateSlide);
                }}
                className="relative flex-1 flex flex-col items-center gap-1.5 cursor-pointer z-10"
              >
                <div className={`flex items-center justify-center transition-colors duration-300 ${isHighlighted ? 'text-white dark:text-white [.light_&]:text-gray-900' : 'text-white/60 dark:text-white/60 [.light_&]:text-gray-500'}`}>
                  {React.cloneElement(item.icon, { className: 'w-[22px] h-[22px]' })}
                </div>
                <span className={`text-[10px] font-semibold transition-colors duration-300 leading-none ${isHighlighted ? 'text-white dark:text-white [.light_&]:text-gray-900' : 'text-white/40 dark:text-white/40 [.light_&]:text-gray-400'}`}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Separate Menu Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 flex items-center justify-center bg-[#1c1c1e] dark:bg-[#1c1c1e] [.light_&]:bg-white/80 backdrop-blur-3xl border border-white/[0.06] dark:border-white/[0.06] [.light_&]:border-black/[0.06] rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)] [.light_&]:shadow-[0_8px_32px_rgba(0,0,0,0.12)] pointer-events-auto text-white/80 dark:text-white/80 [.light_&]:text-gray-700 transition-all active:scale-90 shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={() => setIsOpen(false)} />
          <div className="fixed bottom-32 inset-inline-start-6 inset-inline-end-6 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl z-[70] animate-slideUp overflow-hidden">
            <div className="p-4 pt-6 text-center border-b border-gray-100 dark:border-white/5">
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest">{t('sidebar.menu')}</h3>
            </div>
            <div className="p-3 max-h-[50vh] overflow-y-auto hidden-scrollbar">
              <div className="grid grid-cols-1 gap-1">
                {menuItems.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) => `
                      flex items-center gap-4 px-5 py-4 rounded-2xl transition-all
                      ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}
                    `}
                  >
                    {item.icon}
                    <span className="font-bold text-sm">{item.label}</span>
                  </NavLink>
                ))}
              </div>
              <div className="my-3 mx-2 h-px bg-gray-100 dark:bg-white/5" />
              <div className="flex gap-2 p-1">
                <button onClick={toggleLanguage} className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 font-bold border border-gray-200 dark:border-white/5">
                  <Languages className="w-5 h-5" />
                  <span>{i18n.language === 'ar' ? 'English' : 'العربية'}</span>
                </button>
                <button onClick={toggleTheme} className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 font-bold border border-gray-200 dark:border-white/5">
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  <span>{theme === 'dark' ? t('sidebar.light') : t('sidebar.dark')}</span>
                </button>
                <button onClick={handleLogout} className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 font-bold border border-rose-100 dark:border-rose-500/20">
                  <LogOut className="w-5 h-5" />
                  <span>{t('sidebar.logout')}</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
        .hidden-scrollbar::-webkit-scrollbar { display: none; }
        .hidden-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};

export default Sidebar;