import React, { useState, useEffect, useRef } from 'react';
import { Home, Calendar, Library, FileText, Map, Bell, CheckSquare, Settings, LogOut, Menu, ShieldCheck, Sun, Moon, LayoutDashboard, BookOpen, TrendingUp, Languages, Sparkles } from 'lucide-react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const Sidebar = ({ onLogout }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { student, logout } = useStudentAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
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
  const rectRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const bottomBarItems = [
    { id: 'dashboard', label: t('sidebar.dashboard'), icon: <Home className="w-5 h-5" />, path: '/student/dashboard' },
    { id: 'timetable', label: t('sidebar.timetable'), icon: <Calendar className="w-5 h-5" />, path: '/student/timetable' },
    { id: 'materials', label: t('sidebar.materials'), icon: <Library className="w-5 h-5" />, path: '/student/materials' },
    { id: 'notifications', label: t('sidebar.notifications'), icon: <Bell className="w-5 h-5" />, path: '/student/notifications' },
    { id: 'menu', label: t('sidebar.menu'), icon: <Menu className="w-5 h-5" />, path: '/student/menu' },
  ];

  const menuItems = [
    { id: 'course-registration', label: t('sidebar.course_registration'), icon: <BookOpen className="w-5 h-5" />, path: '/student/registration' },
    { id: 'quizzes', label: t('sidebar.quizzes'), icon: <FileText className="w-5 h-5" />, path: '/student/quizzes' },
    { id: 'roadmap', label: t('sidebar.roadmap'), icon: <Map className="w-5 h-5" />, path: '/student/roadmap' },
    { id: 'personal-tasks', label: t('sidebar.personal_tasks'), icon: <CheckSquare className="w-5 h-5" />, path: '/student/personal-tasks' },
    { id: 'ai', label: 'Zag AI', icon: <Sparkles className="w-5 h-5" />, path: '/student/ai' },
    { id: 'settings', label: t('sidebar.settings'), icon: <Settings className="w-5 h-5" />, path: '/student/settings' },
  ];

  if (student && (student.role === 'assistant' || student.role === 'admin')) {
    menuItems.push({ id: 'admin-panel', label: t('sidebar.admin_panel'), icon: <ShieldCheck className="w-5 h-5" />, path: '/admin' });
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
      { id: 'materials', label: t('sidebar.materials'), icon: <Library className="w-5 h-5" />, path: '/student/materials' },
      { id: 'grades', label: t('sidebar.courses_grades'), icon: <TrendingUp className="w-5 h-5" />, path: '/student/grades' },
      { id: 'notifications', label: t('sidebar.notifications'), icon: <Bell className="w-5 h-5" />, path: '/student/notifications' },
      ...menuItems
    ];

    return (
      <TooltipProvider delayDuration={300}>
        <div
          className="fixed z-50 w-64"
          style={{ insetInlineStart: '1rem', top: '1rem', bottom: '1rem' }}
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <div className="h-full bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">

            {/* Brand */}
            <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border">
              <div className="flex items-center justify-center size-8 rounded-md overflow-hidden bg-muted border border-border shrink-0">
                <img src="/logo.png" alt="ZNU Logo" className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground leading-tight truncate">ZNU Portal</p>
                {student?.name && (
                  <p className="text-xs text-muted-foreground leading-tight truncate">{student.name}</p>
                )}
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto hidden-scrollbar">
              {desktopItems.map((item) => {
                const isActive = isItemActive(item.path);
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={cn(
                      'relative group/item flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                      isAr ? 'font-arabic' : '',
                      isActive
                        ? 'bg-muted text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    )}
                  >
                    {isActive && (
                      <span className="absolute inset-y-1.5 start-0 w-0.5 rounded-full bg-primary" />
                    )}
                    <span
                      className={cn(
                        'shrink-0 transition-colors',
                        isActive ? 'text-primary' : 'text-muted-foreground group-hover/item:text-foreground'
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Tray */}
            <Separator />
            <div className="flex items-center gap-1 px-2 py-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleLanguage}
                    aria-label={t('sidebar.language', 'Language')}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Languages className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isAr ? 'English' : 'العربية'}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    aria-label={t('sidebar.theme', 'Theme')}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{theme === 'dark' ? t('sidebar.light_mode', 'Light') : t('sidebar.dark_mode', 'Dark')}</TooltipContent>
              </Tooltip>

              <div className="flex-1" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    aria-label={t('sidebar.logout', 'Logout')}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t('sidebar.logout', 'Logout')}</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        <style>{`
          .hidden-scrollbar::-webkit-scrollbar { display: none; }
          .hidden-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </TooltipProvider>
    );
  }


  // ============= Mobile Dock (Facebook Style) =============

  // Mobile Handlers

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

    canDragRef.current = touchedIndex === currentIndex;
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
      navigate(bottomBarItems[safeIndex].path);
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
          className="flex items-center w-full bg-card border-t border-border pb-[calc(1.2rem+env(safe-area-inset-bottom))] pt-3 pointer-events-auto touch-none select-none overflow-hidden relative"
        >
          {/* Active Indicator Line (Facebook Style) */}
          <div
            className="absolute top-0 h-0.5 bg-primary transition-all duration-300 rounded-full"
            style={{
              width: `${itemWidthPercent * 0.5}%`,
              insetInlineStart: `${(currentIndex * itemWidthPercent) + (itemWidthPercent * 0.25)}%`,
              display: currentIndex === -1 ? 'none' : 'block'
            }}
          />

          {bottomBarItems.map((item, idx) => {
            const isActive = currentIndex === idx;

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (isActive) return;
                  navigate(item.path);
                }}
                className={cn(
                  'relative flex-1 flex flex-col items-center gap-1 cursor-pointer z-10 transition-colors active:scale-95',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <div className={cn('flex items-center justify-center transition-transform duration-200', isActive ? 'scale-105' : '')}>
                  {React.cloneElement(item.icon, { className: 'w-[18px] h-[18px]' })}
                </div>
                <span className={cn('text-[10px] font-medium transition-colors', isAr ? 'font-arabic' : '')}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .hidden-scrollbar::-webkit-scrollbar { display: none; }
        .hidden-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};

export default Sidebar;
