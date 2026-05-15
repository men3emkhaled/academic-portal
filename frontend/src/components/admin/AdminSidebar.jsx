import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Settings, LogOut, Bell, ShieldCheck, User, Sun, Moon, Languages } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const AdminSidebar = ({ activeTab, setActiveTab, admin, onLogout, availableTabs }) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { theme, toggleTheme } = useTheme();

  // Mobile-specific hooks
  const [dragPosition, setDragPosition] = useState(null); // Percentage 0-100
  const dockRef = useRef(null);
  const indicatorRef = useRef(null);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const bottomBarIds = ['overview', 'students', 'courses'];
  const safeTabs = availableTabs || [];
  const bottomBarItems = safeTabs.filter(tab => bottomBarIds.includes(tab.id)).slice(0, 3);
  if (bottomBarItems.length < 3 && safeTabs.length >= 3) {
    const extraItems = safeTabs.filter(tab => !bottomBarItems.find(b => b.id === tab.id)).slice(0, 3 - bottomBarItems.length);
    bottomBarItems.push(...extraItems);
  }

  const menuItems = safeTabs.filter(item => !bottomBarItems.find(b => b.id === item.id));

  // ============= Sidebar Desktop =============
  if (!isMobile) {
    return (
      <div className="fixed z-50 transition-all duration-300 w-72 inset-y-0 start-0 border-e border-white/5 bg-white dark:bg-[#0c0c14]">
        <div className="h-full flex flex-col overflow-hidden relative group/sidebar">

          <div className="p-8 pb-4 text-center flex flex-col items-center">
            <div className="relative inline-flex items-center justify-center w-28 h-28 transition-transform duration-300 group-hover/sidebar:scale-105 will-change-transform">
              <img src="/logo.png" alt={t('dashboard.id_card')} className="w-full h-full object-contain relative z-10" />
            </div>
            <h1 className="text-sm font-black uppercase tracking-[0.4em] text-gray-900 dark:text-white mt-6 group-hover/sidebar:tracking-[0.45em] transition-[letter-spacing,color] duration-300">{admin?.name || t('admin.header.admin_label')}</h1>
          </div>

          <nav className="flex-1 px-5 py-8 grid grid-cols-2 gap-3 overflow-y-auto no-scrollbar relative z-10">
            {safeTabs.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full relative group/item flex flex-col items-center justify-center gap-2.5 p-5 rounded-[2rem] transition-[color,background-color] duration-200
                    ${isActive ? 'text-gray-900 dark:text-white font-black' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}
                  `}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gray-100/50 dark:bg-white/[0.05] border border-gray-200/50 dark:border-white/10 rounded-[2rem] shadow-sm animate-in fade-in duration-300" />
                  )}
                  <span className={`relative z-10 transition-transform duration-300 will-change-transform ${isActive ? 'scale-110 text-emerald-500 dark:text-emerald-400' : 'group-hover/item:scale-110 group-hover/item:text-emerald-500/70'}`}>
                    {item.icon}
                  </span>
                  <span className="relative z-10 text-[9px] font-black uppercase tracking-[0.1em] text-center leading-tight">
                    {t(`admin.sidebar.tabs.${item.id}`)}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="p-6 pt-0 relative z-10">
            <div className="bg-gray-50/50 dark:bg-white/[0.02] rounded-[2.5rem] p-2 flex gap-1 border border-gray-100 dark:border-white/5">
              <button onClick={() => { const newLang = i18n.language === 'ar' ? 'en' : 'ar'; i18n.changeLanguage(newLang); }} className="flex-1 h-12 flex items-center justify-center rounded-2xl hover:bg-white dark:hover:bg-white/5 transition-all text-gray-400 hover:text-emerald-500">
                <Languages className="w-5 h-5" />
              </button>
              <button onClick={toggleTheme} className="flex-1 h-12 flex items-center justify-center rounded-2xl hover:bg-white dark:hover:bg-white/5 transition-all text-gray-400 hover:text-emerald-500">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={onLogout} className="flex-1 h-12 flex items-center justify-center rounded-2xl hover:bg-rose-500/10 transition-all text-gray-400 hover:text-rose-500">
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

  // ============= Mobile Dock Logic =============
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

  return (
    <>
      <div className="fixed inset-x-0 bottom-4 z-50 flex items-center justify-center gap-3 px-4 pointer-events-none">
        <div
          ref={dockRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex items-center relative bg-white/90 dark:bg-[#1c1c1e] border border-gray-200 dark:border-white/[0.06] rounded-[2rem] py-3 shadow-xl pointer-events-auto touch-none select-none overflow-hidden"
        >
          <div
            ref={indicatorRef}
            className={`absolute top-1/2 -translate-y-1/2 h-14 bg-white/[0.15] dark:bg-white/[0.15] rounded-[1.75rem] z-0 [.light_&]:bg-black/[0.07] ${dragPosition === null && !isAnimatingRef.current ? 'transition-all duration-300 cubic-bezier(0.34,1.56,0.64,1)' : ''}`}
            style={{
              width: `${indicatorWidthPercent}%`,
              insetInlineStart: `${translateX}%`,
              transform: `translate(${i18n.language === 'ar' ? '50%' : '-50%'}, -50%)`,
              transformOrigin: stretchOrigin,
              transition: dragPosition !== null ? 'none' : undefined,
            }}
          />

          {bottomBarItems.map((item, idx) => {
            const isHighlighted = (dragPosition !== null)
              ? (i18n.language === 'ar' ? Math.floor((100 - dragPosition) / itemWidthPercent) : Math.floor(dragPosition / itemWidthPercent)) === idx
              : currentIndex === idx;

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (idx === currentIndex || isAnimatingRef.current) return;
                  setActiveTab(item.id);
                }}
                className="relative w-[4.5rem] flex flex-col items-center gap-1.5 cursor-pointer z-10"
              >
                <div className={`flex items-center justify-center transition-colors duration-300 ${isHighlighted ? 'text-white dark:text-white [.light_&]:text-gray-900' : 'text-white/60 dark:text-white/60 [.light_&]:text-gray-500'}`}>
                  {React.cloneElement(item.icon, { className: 'w-[20px] h-[20px]' })}
                </div>
                <span className={`text-[9px] font-semibold transition-colors duration-300 whitespace-nowrap truncate w-full text-center px-1 ${isHighlighted ? 'text-white dark:text-white [.light_&]:text-gray-900' : 'text-white/40 dark:text-white/40 [.light_&]:text-gray-400'}`}>
                  {t(`admin.sidebar.tabs.${item.id}`)}
                </span>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 flex items-center justify-center bg-[#1c1c1e] dark:bg-[#1c1c1e] [.light_&]:bg-white/80 border border-white/[0.06] dark:border-white/[0.06] [.light_&]:border-black/[0.06] rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)] [.light_&]:shadow-[0_8px_32px_rgba(0,0,0,0.12)] pointer-events-auto text-white/80 dark:text-white/80 [.light_&]:text-gray-700 transition-all active:scale-90 shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Menu Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />
      
      {/* Mobile Menu Sheet */}
      <div 
        className={`fixed bottom-32 inset-x-6 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl z-[70] overflow-hidden transition-all duration-300 transform ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}
      >
        <div className="p-5 pt-7 flex items-center justify-between border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
          <div className="w-10 h-10" /> {/* Spacer */}
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest">{t('admin.sidebar.menu')}</h3>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-3 max-h-[50vh] overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-2 gap-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                className={`flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-2xl transition-all
                  ${activeTab === item.id ? 'bg-emerald-500/10 text-emerald-500 font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}
                `}
              >
                {item.icon}
                <span className="font-bold text-[11px] uppercase tracking-wide text-center leading-tight">{t(`admin.sidebar.tabs.${item.id}`)}</span>
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
                title={theme === 'dark' ? t('admin.sidebar.light') : t('admin.sidebar.dark')}
              >
                {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>
              <button
                onClick={onLogout}
                className="w-14 h-14 flex items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/20 hover:text-rose-600 border border-rose-100 dark:border-rose-500/20 hover:border-rose-200 dark:hover:border-rose-500/30 transition-all active:scale-95"
                title={t('admin.sidebar.logout')}
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};

export default AdminSidebar;
