import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, BookOpen, FolderOpen, Award, ClipboardList, BarChart3, PieChart, Bell, Settings, LogOut, Upload, Menu, X, Calendar as CalendarIcon, MessageSquare, Sun, Moon, UserCheck, Languages } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const MENU_ITEMS = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'courses', label: 'Courses', icon: <BookOpen className="w-5 h-5" /> },
  { id: 'schedule', label: 'Schedule', icon: <CalendarIcon className="w-5 h-5" /> },
  { id: 'materials', label: 'Materials', icon: <FolderOpen className="w-5 h-5" /> },
  { id: 'quizzes', label: 'Quizzes', icon: <Award className="w-5 h-5" /> },
  { id: 'tasks', label: 'Tasks', icon: <ClipboardList className="w-5 h-5" /> },
  { id: 'inquiries', label: 'Support', icon: <MessageSquare className="w-5 h-5" /> },
  { id: 'grades', label: 'Grades', icon: <BarChart3 className="w-5 h-5" /> },
  { id: 'analytics', label: 'Analytics', icon: <PieChart className="w-5 h-5" /> },
  { id: 'attendance', label: 'Attendance', icon: <UserCheck className="w-5 h-5" /> },
];

const DoctorSidebar = ({ activeTab, setActiveTab, doctor, onLogout, unreadCount = 0 }) => {
  const { t, i18n } = useTranslation();
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

  const bottomBarItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'courses', label: 'Courses', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'schedule', label: 'Schedule', icon: <CalendarIcon className="w-5 h-5" /> },
    { id: 'attendance', label: 'Attendance', icon: <UserCheck className="w-5 h-5" /> },
  ];

  const menuItems = MENU_ITEMS.filter(item => !bottomBarItems.find(b => b.id === item.id));

  // Also add notifications and settings to menu items for mobile
  menuItems.push({ id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> });
  menuItems.push({ id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> });

  // Move attendance to the bottom for mobile if it's in menuItems
  const attendanceIdx = menuItems.findIndex(item => item.id === 'attendance');
  if (attendanceIdx !== -1) {
    const [attendanceItem] = menuItems.splice(attendanceIdx, 1);
    menuItems.push(attendanceItem);
  }

  if (!isMobile) {
    return (
      <div className="fixed inset-inline-start-14 top-10 bottom-10 w-72 z-50 transition-all duration-700">
        <div className="h-full bg-white/70 dark:bg-[#0c0c0e]/70 backdrop-blur-sm border border-white/20 dark:border-white/5 rounded-[3rem] shadow-[0_32px_64px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden relative group/sidebar">

          <div className="p-8 pb-4 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full overflow-hidden shadow-2xl bg-white dark:bg-white/5 border border-white/20 transition-transform duration-500 group-hover/sidebar:scale-110">
              <img
                src={doctor?.avatar_url || `https://ui-avatars.com/api/?name=${doctor?.name}&background=8b5cf6&color=fff&size=128`}
                alt={doctor?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white mt-4">Inst. {doctor?.name}</h1>
            <p className="text-gray-500 dark:text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">Senior Instructor</p>
          </div>

          <div className="px-6 mb-4">
            <button
              onClick={() => setActiveTab('materials')}
              className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#8b5cf6]/20 transition-all active:scale-95 text-sm uppercase tracking-widest"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Material</span>
            </button>
          </div>

          <nav className="flex-1 px-4 pb-8 space-y-1 overflow-y-auto hidden-scrollbar relative z-10">
            {MENU_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full relative group/item flex items-center gap-4 px-6 py-3.5 rounded-2xl transition-all duration-500
                    ${isActive ? 'text-gray-900 dark:text-white font-black' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}
                  `}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gray-100 dark:bg-white/5 rounded-2xl animate-in fade-in zoom-in-95 duration-500" />
                  )}
                  <span className={`relative z-10 transition-all duration-500 ${isActive ? 'scale-110 text-[#8b5cf6]' : 'group-hover/item:scale-110'}`}>
                    {item.icon}
                  </span>
                  <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                  {isActive && (
                    <div className="absolute start-0 w-1 h-6 bg-[#8b5cf6] rounded-full shadow-[4px_0_15px_rgba(139,92,246,0.5)]" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-6 pt-0 relative z-10 border-t border-gray-100 dark:border-white/5 pt-4">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full relative group/item flex items-center gap-4 px-6 py-3 rounded-2xl transition-all duration-500 mb-2
                ${activeTab === 'notifications' ? 'text-gray-900 dark:text-white font-black' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}
              `}
            >
              {activeTab === 'notifications' && <div className="absolute inset-0 bg-gray-100 dark:bg-white/5 rounded-2xl" />}
              <div className="relative">
                <Bell className={`w-5 h-5 transition-all duration-500 ${activeTab === 'notifications' ? 'text-[#8b5cf6]' : ''}`} />
                {unreadCount > 0 && <div className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full"></div>}
              </div>
              <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.2em]">Notifications</span>
              {unreadCount > 0 && <span className="ml-auto bg-rose-500/10 text-rose-500 text-[10px] font-black px-2 py-0.5 rounded-lg">{unreadCount > 99 ? '99+' : unreadCount}</span>}
            </button>
            <div className="bg-gray-50/50 dark:bg-white/[0.02] rounded-[2rem] p-2 flex gap-1 border border-gray-100 dark:border-white/5">
              <button onClick={() => { const newLang = i18n.language === 'ar' ? 'en' : 'ar'; i18n.changeLanguage(newLang); }} className="flex-1 h-12 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-white/5 transition-all text-gray-400 hover:text-[#8b5cf6]">
                <Languages className="w-5 h-5" />
              </button>
              <button onClick={() => setActiveTab('settings')} className={`flex-1 h-12 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-white/5 transition-all ${activeTab === 'settings' ? 'text-[#8b5cf6]' : 'text-gray-400 hover:text-[#8b5cf6]'}`}>
                <Settings className="w-5 h-5" />
              </button>
              <button onClick={toggleTheme} className="flex-1 h-12 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-white/5 transition-all text-gray-400 hover:text-[#8b5cf6]">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={onLogout} className="flex-1 h-12 flex items-center justify-center rounded-xl hover:bg-rose-500/10 transition-all text-gray-400 hover:text-rose-500">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
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
          className="flex-1 flex items-center relative bg-[#1c1c1e] dark:bg-[#1c1c1e] backdrop-blur-sm border border-white/[0.06] dark:border-white/[0.06] rounded-[2rem] py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)] pointer-events-auto touch-none select-none overflow-hidden [.light_&]:bg-white/80 [.light_&]:border-black/[0.06] [.light_&]:shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
        >
          {/* Animated Jelly Indicator */}
          <div
            ref={indicatorRef}
            className={`absolute top-1/2 -translate-y-1/2 h-14 bg-white/[0.15] dark:bg-white/[0.15] rounded-[1.75rem] z-0 [.light_&]:bg-black/[0.07] ${dragPosition === null && !isAnimatingRef.current ? 'transition-all duration-[150ms] cubic-bezier(0.34,1.56,0.64,1)' : ''}`}
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
          className="w-14 h-14 flex items-center justify-center bg-[#1c1c1e] dark:bg-[#1c1c1e] [.light_&]:bg-white/80 backdrop-blur-sm border border-white/[0.06] dark:border-white/[0.06] [.light_&]:border-black/[0.06] rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)] [.light_&]:shadow-[0_8px_32px_rgba(0,0,0,0.12)] pointer-events-auto text-white/80 dark:text-white/80 [.light_&]:text-gray-700 transition-all active:scale-90 shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={() => setIsOpen(false)} />
          <div className="fixed bottom-32 start-6 end-6 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl z-[70] animate-slideUp overflow-hidden">
            <div className="p-4 pt-6 text-center border-b border-gray-100 dark:border-white/5">
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest">Menu</h3>
            </div>
            <div className="p-3 max-h-[50vh] overflow-y-auto hidden-scrollbar">
              <div className="grid grid-cols-2 gap-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                    className={`flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-2xl transition-all
                      ${activeTab === item.id ? 'bg-[#8b5cf6]/10 text-[#8b5cf6] font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}
                    `}
                  >
                    {item.icon}
                    <span className="font-bold text-[11px] uppercase tracking-wide text-center leading-tight">{item.label}</span>
                  </button>
                ))}
                  <div className="col-span-2 my-1 mx-2 h-px bg-gray-100 dark:bg-white/5" />
                  <div className="col-span-2 flex justify-center gap-3 p-1">
                  <button
                    onClick={() => { const newLang = i18n.language === 'ar' ? 'en' : 'ar'; i18n.changeLanguage(newLang); }}
                    className="w-14 h-14 flex items-center justify-center rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 transition-all active:scale-95"
                    title={i18n.language === 'ar' ? 'English' : 'العربية'}
                  >
                    <Languages className="w-6 h-6" />
                  </button>
                  <button
                    onClick={toggleTheme}
                    className="w-14 h-14 flex items-center justify-center rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 transition-all active:scale-95"
                    title={theme === 'dark' ? 'Light' : 'Dark'}
                  >
                    {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                  </button>
                  <button
                    onClick={onLogout}
                    className="w-14 h-14 flex items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/20 hover:text-rose-600 border border-rose-100 dark:border-rose-500/20 hover:border-rose-200 dark:hover:border-rose-500/30 transition-all active:scale-95"
                    title="Logout"
                  >
                    <LogOut className="w-6 h-6" />
                  </button>
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
