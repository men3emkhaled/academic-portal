import React, { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { Home, Calendar, Library, BarChart3, FileText, Map, Bell, CheckSquare, Settings, LogOut, Menu, X, ShieldCheck, Sun, Moon, LayoutDashboard, BookOpen, TrendingUp, Languages, ArrowRight } from 'lucide-react';
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

  const isItemActive = (itemPath) => {
    if (location.pathname === itemPath) return true;
    if (itemPath === '/student/dashboard' && location.pathname.startsWith('/student/course/')) return true;
    return false;
  };

  // Mobile-specific hooks moved here to avoid "fewer hooks than expected" error
  const [dragPosition, setDragPosition] = useState(null); // Percentage 0-100
  const dockRef = React.useRef(null);
  const indicatorRef = React.useRef(null);
  const isAnimatingRef = React.useRef(false);
  const dragPositionRef = useRef(null);
  const isDraggingRef = useRef(false);
  const touchStartXRef = useRef(0);
  const canDragRef = useRef(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const bottomBarItems = [
    { id: 'dashboard', label: t('sidebar.dashboard'), icon: <Home className="w-5 h-5" />, path: '/student/dashboard' },
    { id: 'timetable', label: t('sidebar.timetable'), icon: <Calendar className="w-5 h-5" />, path: '/student/timetable' },
    { id: 'materials', label: t('sidebar.materials'), icon: <BookOpen className="w-5 h-5" />, path: '/student/materials' },
    { id: 'notifications', label: t('sidebar.notifications'), icon: <Bell className="w-5 h-5" />, path: '/student/notifications' },
    { id: 'menu', label: t('sidebar.menu'), icon: <Menu className="w-5 h-5" />, path: '#menu' },
  ];

  const menuItems = [
    // { id: 'grades', label: t('sidebar.courses_grades'), icon: <TrendingUp className="w-5 h-5" />, path: '/student/grades' },
    { id: 'quizzes', label: t('sidebar.quizzes'), icon: <FileText className="w-5 h-5" />, path: '/student/quizzes' },
    { id: 'roadmap', label: t('sidebar.roadmap'), icon: <Map className="w-5 h-5" />, path: '/student/roadmap' },
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
    // Desktop items list should include everything
    const desktopItems = [
      { id: 'dashboard', label: t('sidebar.dashboard'), icon: <LayoutDashboard className="w-5 h-5" />, path: '/student/dashboard' },
      { id: 'timetable', label: t('sidebar.timetable'), icon: <Calendar className="w-5 h-5" />, path: '/student/timetable' },
      { id: 'materials', label: t('sidebar.materials'), icon: <BookOpen className="w-5 h-5" />, path: '/student/materials' },
      // { id: 'grades', label: t('sidebar.courses_grades'), icon: <TrendingUp className="w-5 h-5" />, path: '/student/grades' },
      { id: 'notifications', label: t('sidebar.notifications'), icon: <Bell className="w-5 h-5" />, path: '/student/notifications' },
      ...menuItems
    ];

    return (
      <div className="fixed z-50 transition-all duration-700 w-72" style={{ insetInlineStart: '1.5rem', top: '1rem', bottom: '1rem' }}>
        <div className="h-full bg-white dark:bg-[#080808] border border-gray-100 dark:border-white/10 rounded-[3rem] shadow-[0_32px_64px_rgba(0,0,0,0.05)] dark:shadow-[0_32px_64px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden relative group/sidebar">

          <div className="p-8 pb-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full overflow-hidden shadow-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 transition-transform duration-500 group-hover/sidebar:scale-110">
              <img src="/logo.png" alt="ZNU Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-sm font-black uppercase tracking-[0.4em] text-gray-900 dark:text-white opacity-40 mt-4">Portal</h1>
          </div>

          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto hidden-scrollbar relative z-10">
            {desktopItems.map((item) => {
              const isActive = isItemActive(item.path);
              return (
              <NavLink
                key={item.id}
                to={item.path}
                className={`
                  relative group/item flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-500
                  ${isActive ? 'text-gray-900 dark:text-white font-black' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}
                `}
              >
                  <>
                    {isActive && (
                      <div className="absolute inset-0 bg-gray-100 dark:bg-white/5 rounded-2xl animate-in fade-in zoom-in-95 duration-500" />
                    )}
                    <span className={`relative z-10 transition-all duration-500 ${isActive ? 'scale-110 text-primary' : 'group-hover/item:scale-110'}`}>
                      {item.icon}
                    </span>
                    <span className={`relative z-10 text-[11px] font-black uppercase tracking-[0.2em] ${i18n.language === 'ar' ? 'font-arabic' : ''}`}>{item.label}</span>
                    {isActive && (
                      <div className="absolute start-0 w-1 h-6 bg-primary rounded-full shadow-[4px_0_15px_rgba(46,204,113,0.5)]" />
                    )}
                  </>
              </NavLink>
            )})}
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


  // ============= Mobile Dock (Facebook Style) =============

  // Mobile Handlers
  const rectRef = useRef(null);

  const handleTouchStart = (e) => {
    isDraggingRef.current = false;
    touchStartXRef.current = e.targetTouches[0].clientX;

    if (!dockRef.current) return;
    
    // Cache the rect on touchstart
    rectRef.current = dockRef.current.getBoundingClientRect();
    const rect = rectRef.current;
    
    const relativeX = e.targetTouches[0].clientX - rect.left;
    let percent = (relativeX / rect.width) * 100;
    if (i18n.language === 'ar') percent = 100 - percent;

    const itemWidth = 100 / bottomBarItems.length;
    const touchedIndex = Math.max(0, Math.min(Math.floor(percent / itemWidth), bottomBarItems.length - 1));
    const currentIndex = bottomBarItems.findIndex(item => isItemActive(item.path));

    canDragRef.current = touchedIndex === currentIndex && bottomBarItems[touchedIndex].id !== 'menu';
  };

  const handleTouchMove = (e) => {
    if (!canDragRef.current || !rectRef.current) return;
    const clientX = e.targetTouches[0].clientX;
    const diff = Math.abs(clientX - touchStartXRef.current);
    
    if (diff > 10) {
      isDraggingRef.current = true;
    }
    
    if (isDraggingRef.current) {
      const rect = rectRef.current;
      let percent = ((clientX - rect.left) / rect.width) * 100;
      if (i18n.language === 'ar') percent = 100 - percent;
      
      const newPos = Math.max(0, Math.min(percent, 100));
      // Optimization: Only update if movement is significant
      setDragPosition(prev => Math.abs(prev - newPos) > 0.5 ? newPos : prev);
    }
  };

  const updateDragPosition = (clientX) => {
    if (!dockRef.current) return;
    const rect = dockRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    let percent = (relativeX / rect.width) * 100;
    if (i18n.language === 'ar') {
      percent = 100 - percent;
    }
    setDragPosition(Math.max(0, Math.min(percent, 100)));
  };

  const handleTouchEnd = () => {
    if (dragPosition !== null && isDraggingRef.current && canDragRef.current) {
      const itemWidth = 100 / bottomBarItems.length;
      const index = Math.floor(dragPosition / itemWidth);
      const safeIndex = Math.max(0, Math.min(index, bottomBarItems.length - 1));
      if (bottomBarItems[safeIndex].id === 'menu') {
        setIsOpen(true);
      } else {
        navigate(bottomBarItems[safeIndex].path);
      }
    }
    setDragPosition(null);
    isDraggingRef.current = false;
    canDragRef.current = false;
  };

  const currentIndex = bottomBarItems.findIndex(item => isItemActive(item.path));
  const itemWidthPercent = 100 / bottomBarItems.length;

  // Animation Logic for the Indicator
  let translateX = 0;
  let indicatorWidthPercent = itemWidthPercent;
  let stretchOrigin = 'center';

  if (dragPosition !== null) {
    const minTranslateX = itemWidthPercent / 2;
    const maxTranslateX = 100 - (itemWidthPercent / 2);
    translateX = Math.max(minTranslateX, Math.min(dragPosition, maxTranslateX));
    indicatorWidthPercent = itemWidthPercent;
    stretchOrigin = 'center';
  } else {
    translateX = (currentIndex * itemWidthPercent) + (itemWidthPercent / 2);
  }

  const activeIndex = dragPosition !== null
    ? Math.max(0, Math.min(Math.floor(dragPosition / itemWidthPercent), bottomBarItems.length - 1))
    : currentIndex;

  return (
    <>
      <div className="fixed start-0 end-0 bottom-0 z-50 flex items-center justify-center p-0 pointer-events-none">
        {/* Dock Bar */}
        <div
          ref={dockRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex items-center w-full bg-white/95 dark:bg-[#0c0c0c]/95 backdrop-blur-xl border-t border-gray-100 dark:border-white/[0.05] pb-[calc(1.2rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pointer-events-auto touch-none select-none overflow-hidden relative"
        >
          {/* Active Indicator Line (Facebook Style) */}
          <div
            className={`absolute top-0 h-0.5 bg-primary transition-all duration-300 rounded-full`}
            style={{
              width: `${itemWidthPercent * 0.5}%`,
              insetInlineStart: `${(currentIndex * itemWidthPercent) + (itemWidthPercent * 0.25)}%`,
              display: currentIndex === -1 ? 'none' : 'block'
            }}
          />

          {bottomBarItems.map((item, idx) => {
            const isActive = currentIndex === idx;
            const isMenu = item.id === 'menu';

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (isMenu) {
                    setIsOpen(true);
                    return;
                  }
                  if (isActive) return;
                  navigate(item.path);
                }}
                className={`relative flex-1 flex flex-col items-center gap-0.5 cursor-pointer z-10 transition-all active:scale-90 ${isActive ? 'text-primary' : 'text-gray-400 dark:text-white/60'}`}
              >
                <div className={`flex items-center justify-center transition-all duration-300 ${isActive ? 'scale-110' : 'opacity-60 dark:opacity-100'}`}>
                  {React.cloneElement(item.icon, { className: 'w-[18px] h-[18px]' })}
                </div>
                <span className={`text-[8px] font-black uppercase tracking-widest transition-all ${i18n.language === 'ar' ? 'font-arabic' : ''} ${isActive ? 'opacity-100' : 'opacity-40 dark:opacity-80'}`}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-md z-[60]" onClick={() => setIsOpen(false)} />
          <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] start-6 end-6 bg-white dark:bg-[#0c0c14] border border-gray-100 dark:border-white/10 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.3)] z-[70] animate-slideUp overflow-hidden">
            <div className="p-8 pt-10 text-center relative overflow-hidden">
              <div className="absolute top-0 inset-inline-start-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <h4 className={`text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter ${i18n.language === 'ar' ? 'font-arabic' : ''}`}>{t('sidebar.menu')}</h4>
            </div>
            
            <div className="px-6 pb-2 space-y-2 max-h-[45vh] overflow-y-auto hidden-scrollbar">
              <div className="grid grid-cols-1 gap-2">
                {menuItems.map((item) => {
                  const isActive = isItemActive(item.path);
                  return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`
                      group flex items-center justify-between px-6 py-5 rounded-[1.5rem] transition-all duration-500
                      ${isActive 
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-xl scale-[1.02]' 
                        : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/30 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'}
                    `}
                  >
                    <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${i18n.language === 'ar' ? 'order-last' : ''}`}>
                          {item.icon}
                       </div>
                       <span className={`text-[11px] font-black uppercase tracking-widest ${i18n.language === 'ar' ? 'font-arabic' : ''}`}>{item.label}</span>
                    </div>
                    <ArrowRight className={`w-4 h-4 opacity-20 group-hover:opacity-100 transition-all ${i18n.language === 'ar' ? 'rotate-180' : ''}`} />
                  </NavLink>
                )})}
              </div>
            </div>

            <div className="p-6 pt-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={toggleLanguage}
                  className="flex flex-col items-center gap-3 p-4 rounded-[2rem] bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-all active:scale-95 group shadow-sm"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-black/40 flex items-center justify-center text-gray-400 group-hover:text-primary shadow-inner transition-colors">
                     <Languages className="w-5 h-5" />
                  </div>
                  <span className="text-[7px] font-black uppercase tracking-widest text-gray-400">{i18n.language === 'ar' ? 'English' : 'العربية'}</span>
                </button>
                <button
                  onClick={toggleTheme}
                  className="flex flex-col items-center gap-3 p-4 rounded-[2rem] bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-all active:scale-95 group shadow-sm"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-black/40 flex items-center justify-center text-gray-400 group-hover:text-primary shadow-inner transition-colors">
                     {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </div>
                  <span className="text-[7px] font-black uppercase tracking-widest text-gray-400">{theme === 'dark' ? t('sidebar.light') : t('sidebar.dark')}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex flex-col items-center gap-3 p-4 rounded-[2rem] bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/10 hover:bg-rose-500/10 transition-all active:scale-95 group shadow-sm"
                >
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-rose-500/20 flex items-center justify-center text-rose-500 shadow-inner transition-colors">
                     <LogOut className="w-5 h-5" />
                  </div>
                  <span className="text-[7px] font-black uppercase tracking-widest text-rose-500">{t('sidebar.logout')}</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
        .font-arabic { font-family: 'Cairo', sans-serif !important; }
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