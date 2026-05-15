import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Settings, LogOut, Bell, ShieldCheck, User, Sun, Moon, Languages } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const AdminSidebar = ({ activeTab, setActiveTab, admin, onLogout, availableTabs }) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { theme, toggleTheme } = useTheme();

  // Hooks MUST be at the top level and always called in the same order
  const [dragPosition, setDragPosition] = useState(null); 
  const dockRef = useRef(null);
  const indicatorRef = useRef(null);
  const isAnimatingRef = useRef(false);
  const isDraggingRef = useRef(false);
  const touchStartXRef = useRef(0);
  const canDragRef = useRef(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Shared Logic
  const bottomBarIds = ['overview', 'students', 'courses'];
  const safeTabs = availableTabs || [];
  const bottomBarItems = safeTabs.filter(tab => bottomBarIds.includes(tab.id)).slice(0, 3);
  if (bottomBarItems.length < 3 && safeTabs.length >= 3) {
    const extraItems = safeTabs.filter(tab => !bottomBarItems.find(b => b.id === tab.id)).slice(0, 3 - bottomBarItems.length);
    bottomBarItems.push(...extraItems);
  }
  const menuItems = safeTabs.filter(item => !bottomBarItems.find(b => b.id === item.id));

  // Mobile Handlers
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
    if (Math.abs(e.targetTouches[0].clientX - touchStartXRef.current) > 10) isDraggingRef.current = true;
    if (isDraggingRef.current) {
      if (!dockRef.current) return;
      const rect = dockRef.current.getBoundingClientRect();
      let percent = ((e.targetTouches[0].clientX - rect.left) / rect.width) * 100;
      if (i18n.language === 'ar') percent = 100 - percent;
      setDragPosition(Math.max(0, Math.min(percent, 100)));
    }
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

  // Render logic
  const currentIndex = bottomBarItems.findIndex(item => activeTab === item.id);
  const itemWidthPercent = 100 / (bottomBarItems.length || 1);
  const translateX = dragPosition !== null 
    ? Math.max(itemWidthPercent / 2, Math.min(dragPosition, 100 - (itemWidthPercent / 2)))
    : (currentIndex * itemWidthPercent) + (itemWidthPercent / 2);

  // Unified Return
  return (
    <>
      {/* Desktop Version */}
      {!isMobile && (
        <div className="fixed z-50 transition-all duration-300 w-72 inset-y-0 start-0 border-e border-white/5 bg-white dark:bg-[#0c0c14]">
          <div className="h-full flex flex-col overflow-hidden relative group/sidebar">
            <div className="p-8 pb-4 text-center flex flex-col items-center">
              <div className="relative inline-flex items-center justify-center w-28 h-28 transition-transform duration-300 group-hover/sidebar:scale-105">
                <img src="/logo.png" alt="logo" className="w-full h-full object-contain relative z-10" />
              </div>
              <h1 className="text-sm font-black uppercase tracking-[0.4em] text-gray-900 dark:text-white mt-6">{admin?.name || t('admin.header.admin_label')}</h1>
            </div>
            <nav className="flex-1 px-5 py-8 grid grid-cols-2 gap-3 overflow-y-auto no-scrollbar">
              {safeTabs.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full relative group/item flex flex-col items-center justify-center gap-2.5 p-5 rounded-[2rem] transition-all
                    ${activeTab === item.id ? 'text-gray-900 dark:text-white font-black' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}
                  `}
                >
                  {activeTab === item.id && (
                    <div className="absolute inset-0 bg-gray-100/50 dark:bg-white/[0.05] border border-gray-200/50 dark:border-white/10 rounded-[2rem]" />
                  )}
                  <span className={`relative z-10 ${activeTab === item.id ? 'text-emerald-500' : ''}`}>{item.icon}</span>
                  <span className="relative z-10 text-[9px] font-black uppercase tracking-[0.1em] text-center leading-tight">
                    {t(`admin.sidebar.tabs.${item.id}`)}
                  </span>
                </button>
              ))}
            </nav>
            <div className="p-6 pt-0">
              <div className="bg-gray-50/50 dark:bg-white/[0.02] rounded-[2.5rem] p-2 flex gap-1 border border-gray-100 dark:border-white/5">
                <button onClick={() => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')} className="flex-1 h-12 flex items-center justify-center rounded-2xl hover:bg-white dark:hover:bg-white/5 text-gray-400 hover:text-emerald-500">
                  <Languages className="w-5 h-5" />
                </button>
                <button onClick={toggleTheme} className="flex-1 h-12 flex items-center justify-center rounded-2xl hover:bg-white dark:hover:bg-white/5 text-gray-400 hover:text-emerald-500">
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button onClick={onLogout} className="flex-1 h-12 flex items-center justify-center rounded-2xl hover:bg-rose-500/10 text-gray-400 hover:text-rose-500">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Version */}
      {isMobile && (
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
                className="absolute top-1/2 -translate-y-1/2 h-14 bg-white/[0.15] rounded-[1.75rem] z-0 transition-all duration-300"
                style={{
                  width: `${itemWidthPercent}%`,
                  insetInlineStart: `${translateX}%`,
                  transform: `translate(${i18n.language === 'ar' ? '50%' : '-50%'}, -50%)`,
                }}
              />
              {bottomBarItems.map((item, idx) => {
                const isHighlighted = (dragPosition !== null)
                  ? (i18n.language === 'ar' ? Math.floor((100 - dragPosition) / itemWidthPercent) : Math.floor(dragPosition / itemWidthPercent)) === idx
                  : currentIndex === idx;
                return (
                  <div key={item.id} onClick={() => setActiveTab(item.id)} className="relative w-[4.5rem] flex flex-col items-center gap-1.5 cursor-pointer z-10">
                    <div className={`transition-colors ${isHighlighted ? 'text-white dark:text-white' : 'text-white/40'}`}>
                      {React.cloneElement(item.icon, { className: 'w-[20px] h-[20px]' })}
                    </div>
                    <span className={`text-[9px] font-semibold truncate w-full text-center px-1 ${isHighlighted ? 'text-white' : 'text-white/40'}`}>
                      {t(`admin.sidebar.tabs.${item.id}`)}
                    </span>
                  </div>
                );
              })}
            </div>
            <button onClick={() => setIsOpen(true)} className="w-14 h-14 flex items-center justify-center bg-[#1c1c1e] border border-white/[0.06] rounded-full shadow-xl pointer-events-auto text-white active:scale-90 shrink-0">
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)} />
          
          <div className={`fixed bottom-32 inset-x-6 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl z-[70] transition-all transform ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
            <div className="p-5 flex items-center justify-between border-b border-gray-100 dark:border-white/5">
              <div className="w-10" />
              <h3 className="text-xl font-black uppercase tracking-widest">{t('admin.sidebar.menu')}</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-3 max-h-[50vh] overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-2 gap-2">
                {menuItems.map((item) => (
                  <button key={item.id} onClick={() => { setActiveTab(item.id); setIsOpen(false); }} className={`flex flex-col items-center gap-2 p-4 rounded-2xl ${activeTab === item.id ? 'bg-emerald-500/10 text-emerald-500 font-bold' : 'text-gray-400'}`}>
                    {item.icon}
                    <span className="font-bold text-[11px] uppercase tracking-wide text-center">{t(`admin.sidebar.tabs.${item.id}`)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};

export default AdminSidebar;
