import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, BookOpen, FolderOpen, Award, ClipboardList, BarChart3, PieChart, Bell, Settings, LogOut, Upload, Menu, Calendar as CalendarIcon, MessageSquare, Sun, Moon, UserCheck, Languages } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const MENU_ITEMS = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="size-5" /> },
  { id: 'courses', label: 'Courses', icon: <BookOpen className="size-5" /> },
  { id: 'schedule', label: 'Schedule', icon: <CalendarIcon className="size-5" /> },
  { id: 'materials', label: 'Materials', icon: <FolderOpen className="size-5" /> },
  { id: 'quizzes', label: 'Quizzes', icon: <Award className="size-5" /> },
  { id: 'tasks', label: 'Tasks', icon: <ClipboardList className="size-5" /> },
  { id: 'inquiries', label: 'Support', icon: <MessageSquare className="size-5" /> },
  { id: 'grades', label: 'Grades', icon: <BarChart3 className="size-5" /> },
  { id: 'analytics', label: 'Analytics', icon: <PieChart className="size-5" /> },
  { id: 'attendance', label: 'Attendance', icon: <UserCheck className="size-5" /> },
];

const DoctorSidebar = ({ activeTab, setActiveTab, doctor, onLogout, unreadCount = 0 }) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { theme, toggleTheme } = useTheme();

  const [dragPosition, setDragPosition] = useState(null);
  const dockRef = useRef(null);
  const indicatorRef = useRef(null);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  const bottomBarItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="size-5" /> },
    { id: 'courses', label: 'Courses', icon: <BookOpen className="size-5" /> },
    { id: 'schedule', label: 'Schedule', icon: <CalendarIcon className="size-5" /> },
    { id: 'attendance', label: 'Attendance', icon: <UserCheck className="size-5" /> },
  ];

  const menuItems = MENU_ITEMS.filter(item => !bottomBarItems.find(b => b.id === item.id));

  // Also add notifications and settings to menu items for mobile
  menuItems.push({ id: 'notifications', label: 'Notifications', icon: <Bell className="size-5" /> });
  menuItems.push({ id: 'settings', label: 'Settings', icon: <Settings className="size-5" /> });

  // Move attendance to the bottom for mobile if it's in menuItems
  const attendanceIdx = menuItems.findIndex(item => item.id === 'attendance');
  if (attendanceIdx !== -1) {
    const [attendanceItem] = menuItems.splice(attendanceIdx, 1);
    menuItems.push(attendanceItem);
  }

  // ============= Desktop floating rail =============
  if (!isMobile) {
    return (
      <div className="fixed inset-inline-start-6 top-6 bottom-6 w-64 z-50">
        <div className="h-full bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">

          {/* Avatar header */}
          <div className="flex items-center gap-3 p-4 border-b border-border">
            <Avatar size="lg" className="shrink-0">
              <AvatarImage
                src={doctor?.avatar_url}
                alt={doctor?.name}
              />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {(doctor?.name || 'D').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-foreground truncate">{doctor?.name || 'Instructor'}</h1>
              <p className="text-xs text-muted-foreground truncate">{t('doctor.sidebar.role', 'Senior Instructor')}</p>
            </div>
          </div>

          {/* Upload Material CTA */}
          <div className="px-3 pt-3">
            <Button
              onClick={() => setActiveTab('materials')}
              className="w-full"
              size="lg"
            >
              <Upload className="size-4" />
              <span>{t('doctor.sidebar.upload_material', 'Upload Material')}</span>
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-3">
            <nav className="space-y-0.5">
              {MENU_ITEMS.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full relative flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors
                      ${isActive
                        ? 'bg-muted text-foreground font-medium'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}
                    `}
                  >
                    {isActive && (
                      <span className="absolute inset-inline-start-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-primary" />
                    )}
                    <span className={isActive ? 'text-primary' : ''}>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Footer: notifications + toggles */}
          <div className="p-3 border-t border-border space-y-2">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full relative flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors
                ${activeTab === 'notifications'
                  ? 'bg-muted text-foreground font-medium'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}
              `}
            >
              {activeTab === 'notifications' && (
                <span className="absolute inset-inline-start-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-primary" />
              )}
              <span className="relative">
                <Bell className={`size-5 ${activeTab === 'notifications' ? 'text-primary' : ''}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -end-0.5 size-2 rounded-full bg-primary ring-2 ring-card" />
                )}
              </span>
              <span className="truncate">{t('sidebar.notifications', 'Notifications')}</span>
              {unreadCount > 0 && (
                <span className="ms-auto bg-primary/10 text-primary text-xs font-medium px-1.5 py-0.5 rounded-md">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            <TooltipProvider delayDuration={200}>
              <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={toggleLanguage} className="flex-1 text-muted-foreground hover:text-foreground">
                      <Languages className="size-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isAr ? 'English' : 'العربية'}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setActiveTab('settings')}
                      className={`flex-1 ${activeTab === 'settings' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      <Settings className="size-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t('sidebar.settings', 'Settings')}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={toggleTheme} className="flex-1 text-muted-foreground hover:text-foreground">
                      {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{theme === 'dark' ? t('sidebar.light', 'Light') : t('sidebar.dark', 'Dark')}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={onLogout} className="flex-1 text-muted-foreground hover:text-destructive">
                      <LogOut className="size-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t('sidebar.logout', 'Logout')}</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </div>
      </div>
    );
  }

  const isDraggingRef = useRef(false);
  const touchStartXRef = useRef(0);
  const canDragRef = useRef(false);

  // ============= Mobile Dock =============
  const handleTouchStart = (e) => {
    isDraggingRef.current = false;
    touchStartXRef.current = e.targetTouches[0].clientX;

    if (!dockRef.current) return;
    const rect = dockRef.current.getBoundingClientRect();
    const relativeX = e.targetTouches[0].clientX - rect.left;
    let percent = (relativeX / rect.width) * 100;
    if (i18n.language === 'ar') percent = 100 - percent;

    const itemWidth = 100 / bottomBarItems.length;
    const touchedIndex = Math.max(0, Math.min(Math.floor(percent / itemWidth), bottomBarItems.length - 1));
    const currentIndex = bottomBarItems.findIndex(item => activeTab === item.id);

    canDragRef.current = touchedIndex === currentIndex;
  };

  const handleTouchMove = (e) => {
    if (!canDragRef.current) return;
    if (Math.abs(e.targetTouches[0].clientX - touchStartXRef.current) > 10) {
      isDraggingRef.current = true;
    }
    if (isDraggingRef.current) {
      updateDragPosition(e.targetTouches[0].clientX);
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
      setActiveTab(bottomBarItems[safeIndex].id);
    }
    setDragPosition(null);
    isDraggingRef.current = false;
    canDragRef.current = false;
  };

  const currentIndex = bottomBarItems.findIndex(item => activeTab === item.id);
  const itemWidthPercent = 100 / bottomBarItems.length;

  // Animation Logic for the Indicator (Jelly / Liquid effect)
  let translateX = 0;
  let indicatorWidthPercent = itemWidthPercent;
  let stretchOrigin = 'center';

  if (dragPosition !== null) {
    // Smooth finger tracking without snapping to intermediate tabs
    const minTranslateX = itemWidthPercent / 2;
    const maxTranslateX = 100 - (itemWidthPercent / 2);
    translateX = Math.max(minTranslateX, Math.min(dragPosition, maxTranslateX));

    // Maintain standard width during drag
    indicatorWidthPercent = itemWidthPercent;
    stretchOrigin = 'center';
  } else {
    // Resting state
    translateX = (currentIndex * itemWidthPercent) + (itemWidthPercent / 2);
  }

  const activeIndex = dragPosition !== null
    ? Math.max(0, Math.min(Math.floor(dragPosition / itemWidthPercent), bottomBarItems.length - 1))
    : currentIndex;

  return (
    <>
      <div className="fixed start-0 end-0 bottom-4 z-50 flex items-center justify-center gap-3 px-4 pointer-events-none">
        {/* Main Capsule */}
        <div
          ref={dockRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex-1 flex items-center relative bg-card border border-border rounded-xl py-3 shadow-sm pointer-events-auto touch-none select-none overflow-hidden"
        >
          {/* Animated Jelly Indicator */}
          <div
            ref={indicatorRef}
            className={`absolute top-1/2 -translate-y-1/2 h-14 bg-muted rounded-lg z-0 ${dragPosition === null && !isAnimatingRef.current ? 'transition-all duration-[150ms] cubic-bezier(0.34,1.56,0.64,1)' : ''}`}
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
                  const duration = 120;

                  // Direct DOM animation - bypasses React completely
                  const animateSlide = (timestamp) => {
                    if (!startTime) startTime = timestamp;
                    const elapsed = timestamp - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    // Easing (cubic out)
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const fingerPercent = startPercent + (endPercent - startPercent) * eased;

                    // Smooth continuous stretch through the entire journey
                    const journeyMidpoint = (startPercent + endPercent) / 2;
                    const totalDist = Math.abs(endPercent - startPercent);
                    const distFromMidpoint = Math.abs(fingerPercent - journeyMidpoint);

                    // stretchFactor: 1 at midpoint, 0 at start/end
                    const stretchFactor = totalDist > 0 ? Math.max(0, 1 - (distFromMidpoint / (totalDist / 2))) : 0;

                    // Expand width slightly at the midpoint of the journey for a liquid effect
                    const w = itemWidthPercent + (itemWidthPercent * 0.8 * stretchFactor);
                    const pos = fingerPercent;

                    // Apply directly to DOM
                    el.style.transition = 'none';
                    el.style.width = `${w}%`;
                    if (i18n.language === 'ar') {
                      el.style.insetInlineStart = `${pos}%`;
                      el.style.transform = `translate(50%, -50%)`;
                      el.style.transformOrigin = 'center';
                    } else {
                      el.style.insetInlineStart = `${pos}%`;
                      el.style.transform = `translate(-50%, -50%)`;
                      el.style.transformOrigin = 'center';
                    }

                    if (progress < 1) {
                      requestAnimationFrame(animateSlide);
                    } else {
                      // Animation done - navigate and reset
                      el.style.transition = '';
                      isAnimatingRef.current = false;
                      setActiveTab(item.id); setIsOpen(false);
                    }
                  };

                  requestAnimationFrame(animateSlide);
                }}
                className="relative flex-1 flex flex-col items-center gap-1.5 cursor-pointer z-10"
              >
                <div className={`flex items-center justify-center transition-colors duration-300 ${isHighlighted ? 'text-primary' : 'text-muted-foreground'}`}>
                  {React.cloneElement(item.icon, { className: 'w-[22px] h-[22px]' })}
                </div>
                <span className={`text-[10px] font-medium transition-colors duration-300 leading-none ${isHighlighted ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Separate Menu Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="size-14 flex items-center justify-center bg-card border border-border rounded-xl shadow-sm pointer-events-auto text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[60]" onClick={() => setIsOpen(false)} />
          <div className="fixed bottom-32 start-6 end-6 bg-card border border-border rounded-xl shadow-sm z-[70] animate-slideUp overflow-hidden">
            <div className="p-4 text-center border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">{t('sidebar.menu', 'Menu')}</h3>
            </div>
            <div className="p-3 max-h-[50vh] overflow-y-auto hidden-scrollbar">
              <div className="grid grid-cols-2 gap-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                    className={`flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-lg text-sm transition-colors
                      ${activeTab === item.id
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}
                    `}
                  >
                    {item.icon}
                    <span className="text-xs text-center leading-tight">{item.label}</span>
                  </button>
                ))}
                <div className="col-span-2 my-1">
                  <Separator />
                </div>
                <div className="col-span-2 flex justify-center gap-2 p-1">
                  <Button
                    variant="outline"
                    size="icon-lg"
                    onClick={toggleLanguage}
                    className="text-muted-foreground hover:text-foreground"
                    title={isAr ? 'English' : 'العربية'}
                  >
                    <Languages className="size-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-lg"
                    onClick={toggleTheme}
                    className="text-muted-foreground hover:text-foreground"
                    title={theme === 'dark' ? t('sidebar.light', 'Light') : t('sidebar.dark', 'Dark')}
                  >
                    {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon-lg"
                    onClick={onLogout}
                    title={t('sidebar.logout', 'Logout')}
                  >
                    <LogOut className="size-5" />
                  </Button>
                </div>
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

export default DoctorSidebar;
