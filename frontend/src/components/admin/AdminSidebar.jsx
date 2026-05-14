import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      <div className="fixed z-50 transition-all duration-300 w-72" style={{ insetInlineStart: '1.5rem', top: '1rem', bottom: '1rem' }}>
        <div className="h-full bg-white dark:bg-[#0d0d0d] backdrop-blur-md border border-white/20 dark:border-white/5 rounded-[3rem] shadow-[0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden relative group/sidebar">

          <div className="p-8 pb-4 text-center flex flex-col items-center">
            <div className="relative inline-flex items-center justify-center w-28 h-28 transition-transform duration-300 group-hover/sidebar:scale-105 will-change-transform">
              <img src="/logo.png" alt={t('dashboard.id_card')} className="w-full h-full object-contain relative z-10" />
            </div>
            <h1 className="text-sm font-black uppercase tracking-[0.4em] text-gray-900 dark:text-white mt-6 group-hover/sidebar:tracking-[0.45em] transition-[letter-spacing,color] duration-300">{admin?.name || t('admin.header.admin_label')}</h1>
          </div>

          <nav className="flex-1 px-5 py-8 grid grid-cols-2 gap-3 overflow-y-auto hidden-scrollbar relative z-10">
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
                    <motion.div
                      layoutId="activeTabBg"
                      className="absolute inset-0 bg-gray-100/50 dark:bg-white/[0.05] border border-gray-200/50 dark:border-white/10 rounded-[2rem] shadow-sm"
                    />
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
            <div className="bg-gray-50/50 dark:bg-white/[0.02] backdrop-blur-xl rounded-[2.5rem] p-2 flex gap-1 border border-gray-100 dark:border-white/5">
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

  // ============= Mobile Dock Logic =============
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
    // In RTL, 0% on screen (left) is 100% in terms of "start" position.
    // However, the dock logic usually treats left-to-right as 0-100.
    setDragPosition(Math.max(0, Math.min(percent, 100)));
  };

  const handleTouchEnd = () => {
    if (dragPosition !== null) {
      const itemWidth = 100 / bottomBarItems.length;
      // In RTL, the first item (overview) is on the right.
      // So if dragPosition is 90% (near the right), index should be 0.
      let index;
      if (i18n.language === 'ar') {
        index = Math.floor((100 - dragPosition) / itemWidth);
      } else {
        index = Math.floor(dragPosition / itemWidth);
      }
      const safeIndex = Math.max(0, Math.min(index, bottomBarItems.length - 1));
      setActiveTab(bottomBarItems[safeIndex].id);
    }
    setDragPosition(null);
  };

  const currentIndex = bottomBarItems.findIndex(item => activeTab === item.id);
  const itemWidthPercent = 100 / bottomBarItems.length;

  let translateX = 0;
  let indicatorWidthPercent = itemWidthPercent;
  let stretchOrigin = 'center';

  if (dragPosition !== null) {
    const fingerPercent = Math.max(0, Math.min(dragPosition, 100));
    // For RTL, we need to map fingerPercent back to logical position.
    const logicalFingerPercent = i18n.language === 'ar' ? 100 - fingerPercent : fingerPercent;

    const closestIndex = Math.floor(logicalFingerPercent / itemWidthPercent);
    const safeClosestIndex = Math.max(0, Math.min(closestIndex, bottomBarItems.length - 1));
    const closestTabCenterPercent = (safeClosestIndex * itemWidthPercent) + (itemWidthPercent / 2);

    const distanceFromCenter = logicalFingerPercent - closestTabCenterPercent;
    const absDistance = Math.abs(distanceFromCenter);
    const stretchFactor = Math.min(absDistance / (itemWidthPercent / 2), 1);
    const maxStretchPercent = itemWidthPercent * 1.8;
    indicatorWidthPercent = itemWidthPercent + (maxStretchPercent - itemWidthPercent) * stretchFactor;

    stretchOrigin = distanceFromCenter > 0 ? (i18n.language === 'ar' ? 'end' : 'start') : (i18n.language === 'ar' ? 'start' : 'end');
    translateX = closestTabCenterPercent + (distanceFromCenter * 0.5);
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
          className="flex-1 flex items-center relative bg-[#1c1c1e] dark:bg-[#1c1c1e] backdrop-blur-3xl border border-white/[0.06] dark:border-white/[0.06] rounded-[2rem] py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)] pointer-events-auto touch-none select-none overflow-hidden [.light_&]:bg-white/80 [.light_&]:border-black/[0.06] [.light_&]:shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
        >
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
                className="relative flex-1 flex flex-col items-center gap-1.5 cursor-pointer z-10"
              >
                <div className={`flex items-center justify-center transition-colors duration-300 ${isHighlighted ? 'text-white dark:text-white [.light_&]:text-gray-900' : 'text-white/60 dark:text-white/60 [.light_&]:text-gray-500'}`}>
                  {React.cloneElement(item.icon, { className: 'w-[22px] h-[22px]' })}
                </div>
                <span className={`text-[10px] font-semibold transition-colors duration-300 leading-none ${isHighlighted ? 'text-white dark:text-white [.light_&]:text-gray-900' : 'text-white/40 dark:text-white/40 [.light_&]:text-gray-400'}`}>
                  {t(`admin.sidebar.tabs.${item.id}`)}
                </span>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 flex items-center justify-center bg-[#1c1c1e] dark:bg-[#1c1c1e] [.light_&]:bg-white/80 backdrop-blur-3xl border border-white/[0.06] dark:border-white/[0.06] [.light_&]:border-black/[0.06] rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)] [.light_&]:shadow-[0_8px_32px_rgba(0,0,0,0.12)] pointer-events-auto text-white/80 dark:text-white/80 [.light_&]:text-gray-700 transition-all active:scale-90 shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-32 inset-x-6 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl z-[70] overflow-hidden"
            >
              <div className="p-4 pt-6 text-center border-b border-gray-100 dark:border-white/5">
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest">{t('admin.sidebar.menu')}</h3>
              </div>
              <div className="p-3 max-h-[50vh] overflow-y-auto hidden-scrollbar">
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

                  <button
                    onClick={() => { const newLang = i18n.language === 'ar' ? 'en' : 'ar'; i18n.changeLanguage(newLang); }}
                    className="flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-2xl transition-all text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 border border-gray-100 dark:border-white/5"
                  >
                    <Languages className="w-5 h-5" />
                    <span className="font-bold text-[11px] uppercase tracking-wide text-center leading-tight">
                      {i18n.language === 'ar' ? t('settings.english') : t('settings.arabic')}
                    </span>
                  </button>
                  <button
                    onClick={toggleTheme}
                    className="flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-2xl transition-all text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 border border-gray-100 dark:border-white/5"
                  >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    <span className="font-bold text-[11px] uppercase tracking-wide text-center leading-tight">
                      {theme === 'dark' ? t('sidebar.light') : t('sidebar.dark')}
                    </span>
                  </button>

                  <button
                    onClick={onLogout}
                    className="flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-2xl transition-all text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-bold text-[11px] uppercase tracking-wide text-center leading-tight">{t('admin.sidebar.logout')}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .hidden-scrollbar::-webkit-scrollbar { display: none; }
        .hidden-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};

export default AdminSidebar;
