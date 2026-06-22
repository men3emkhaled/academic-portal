import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Settings, LogOut, Bell, ShieldCheck, User, Sun, Moon, Languages, ArrowRight, LayoutDashboard, Database, Smartphone, Heart, ScrollText, Mail, ClipboardList, CheckSquare, Award, CheckCircle, Calendar, Users, UserCheck, Map, FileText, BookOpen } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const AdminSidebar = ({ activeTab, setActiveTab, admin, onLogout, availableTabs }) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { theme, toggleTheme } = useTheme();

  // Hooks MUST be at the top
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

  const safeTabs = availableTabs || [];
  
  // Mobile specific: select first 4 important tabs for the bottom bar
  const mobileDockIds = ['overview', 'students', 'courses', 'timetable'];
  const bottomBarItems = safeTabs.filter(tab => mobileDockIds.includes(tab.id)).slice(0, 4);
  // Add Menu item
  const menuItems = safeTabs.filter(item => !bottomBarItems.find(b => b.id === item.id));

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
    const itemWidth = 100 / (bottomBarItems.length + 1); // +1 for Menu
    const touchedIndex = Math.max(0, Math.min(Math.floor(percent / itemWidth), bottomBarItems.length));
    const currentIndex = bottomBarItems.findIndex(item => activeTab === item.id);
    canDragRef.current = touchedIndex === currentIndex;
  };

  const handleTouchMove = (e) => {
    if (!canDragRef.current || !rectRef.current) return;
    const clientX = e.targetTouches[0].clientX;
    const diff = Math.abs(clientX - touchStartXRef.current);
    
    if (diff > 10) isDraggingRef.current = true;
    
    if (isDraggingRef.current) {
      const rect = rectRef.current;
      let percent = ((clientX - rect.left) / rect.width) * 100;
      if (i18n.language === 'ar') percent = 100 - percent;
      
      const newPos = Math.max(0, Math.min(percent, 100));
      // Only update if change is significant to avoid unnecessary re-renders
      setDragPosition(prev => Math.abs(prev - newPos) > 0.5 ? newPos : prev);
    }
  };

  const handleTouchEnd = () => {
    if (dragPosition !== null && isDraggingRef.current && canDragRef.current) {
      const itemWidth = 100 / (bottomBarItems.length + 1);
      const index = Math.floor(dragPosition / itemWidth);
      if (index === bottomBarItems.length) {
        setIsOpen(true);
      } else {
        const safeIndex = Math.max(0, Math.min(index, bottomBarItems.length - 1));
        setActiveTab(bottomBarItems[safeIndex].id);
      }
    }
    setDragPosition(null);
    isDraggingRef.current = false;
    canDragRef.current = false;
  };

  const currentIndex = bottomBarItems.findIndex(item => activeTab === item.id);
  const totalMobileItems = bottomBarItems.length + 1;
  const itemWidthPercent = 100 / totalMobileItems;

  return (
    <>
      {/* Desktop Version - Floating Sidebar Style */}
      {!isMobile && (
        <div className="fixed z-50 transition-all duration-700 w-72" style={{ insetInlineStart: '1.5rem', top: '1rem', bottom: '1rem' }}>
          <div className="h-full bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-white/10 rounded-xl flex flex-col overflow-hidden relative">
            
            <div className="p-6 pb-2 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full overflow-hidden bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-[10px] font-medium text-gray-900 dark:text-white opacity-40 mt-3">{t('admin.header.admin_label')}</h1>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto hidden-scrollbar relative z-10">
              {safeTabs.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`
                      w-full relative flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200
                      ${isActive ? 'text-white font-medium' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}
                    `}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-[#059669] rounded-lg" />
                    )}
                    <span className={`relative z-10 ${isActive ? 'text-white' : ''}`}>
                      {item.icon}
                    </span>
                    <span className={`relative z-10 text-xs ${i18n.language === 'ar' ? 'font-arabic' : ''}`}>
                      {t(`admin.sidebar.tabs.${item.id}`)}
                    </span>
                    {isActive && (
                      <div className="absolute start-0 w-0.5 h-5 bg-white rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="p-4 pt-0 relative z-10">
              <div className="bg-gray-50/50 dark:bg-white/[0.02] rounded-lg p-1.5 flex gap-1 border border-gray-100 dark:border-white/5">
                <button onClick={() => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')} className="flex-1 h-10 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-white/5 transition-all text-gray-400 hover:text-[#059669]">
                  <Languages className="w-4 h-4" />
                </button>
                <button onClick={toggleTheme} className="flex-1 h-10 flex items-center justify-center rounded-md hover:bg-white dark:hover:bg-white/5 transition-all text-gray-400 hover:text-[#059669]">
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button onClick={onLogout} className="flex-1 h-10 flex items-center justify-center rounded-md hover:bg-rose-500/10 transition-all text-gray-400 hover:text-rose-500">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Version - Facebook Dock Style */}
      {isMobile && (
        <>
          <div className="fixed start-0 end-0 bottom-0 z-50 flex items-center justify-center p-0 pointer-events-none">
            <div
              ref={dockRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="flex items-center w-full bg-white dark:bg-[#0c0c0c] border-t border-gray-100 dark:border-white/[0.05] pb-[calc(1rem+env(safe-area-inset-bottom))] pt-2 pointer-events-auto touch-none select-none overflow-hidden relative"
            >
              <div
                className="absolute top-0 h-0.5 bg-[#059669] transition-all duration-300 rounded-full"
                style={{
                  width: `${itemWidthPercent * 0.5}%`,
                  insetInlineStart: `${(currentIndex * itemWidthPercent) + (itemWidthPercent * 0.25)}%`,
                  display: currentIndex === -1 ? 'none' : 'block'
                }}
              />

              {bottomBarItems.map((item, idx) => {
                const isActive = activeTab === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative flex-1 flex flex-col items-center gap-0.5 cursor-pointer z-10 ${isActive ? 'text-[#059669]' : 'text-gray-400 dark:text-white/60'}`}
                  >
                    <div className={`flex items-center justify-center ${isActive ? '' : 'opacity-60 dark:opacity-100'}`}>
                      {React.cloneElement(item.icon, { className: 'w-[18px] h-[18px]' })}
                    </div>
                    <span className={`text-[8px] font-medium tracking-wide ${i18n.language === 'ar' ? 'font-arabic' : ''} ${isActive ? 'opacity-100' : 'opacity-40 dark:opacity-80'}`}>
                      {t(`admin.sidebar.tabs.${item.id}`)}
                    </span>
                  </div>
                );
              })}

              {/* Menu Button */}
              <div
                onClick={() => setIsOpen(true)}
                className="relative flex-1 flex flex-col items-center gap-0.5 cursor-pointer z-10 text-gray-400 dark:text-white/60"
              >
                <div className="flex items-center justify-center opacity-60 dark:opacity-100">
                  <Menu className="w-[18px] h-[18px]" />
                </div>
                <span className={`text-[8px] font-medium tracking-wide ${i18n.language === 'ar' ? 'font-arabic' : ''} opacity-40 dark:opacity-80`}>
                  {t('sidebar.menu')}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Menu Overlay */}
          {isOpen && (
            <>
              <div className="fixed inset-0 bg-black/40 z-[60]" onClick={() => setIsOpen(false)} />
              <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] start-6 end-6 bg-white dark:bg-[#0c0c14] border border-gray-100 dark:border-white/10 rounded-xl z-[70] animate-slideUp overflow-hidden">
                <div className="p-6 pb-2 text-center">
                  <h4 className={`text-lg font-semibold text-gray-900 dark:text-white ${i18n.language === 'ar' ? 'font-arabic' : ''}`}>{t('sidebar.menu')}</h4>
                </div>
                
                <div className="px-4 pb-2 space-y-1 max-h-[45vh] overflow-y-auto hidden-scrollbar">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                      className={`
                        flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all
                        ${activeTab === item.id 
                          ? 'bg-[#059669] text-white' 
                          : 'text-gray-500 dark:text-white/30 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                         <span>{item.icon}</span>
                         <span className={`text-xs ${i18n.language === 'ar' ? 'font-arabic' : ''}`}>{t(`admin.sidebar.tabs.${item.id}`)}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="p-4 pt-3 border-t border-gray-100 dark:border-white/5">
                  <div className="flex gap-3">
                    <button onClick={() => i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar')} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-400 hover:text-[#059669] text-xs">
                      <Languages className="w-4 h-4" />
                      <span>{t(i18n.language === 'ar' ? 'admin.sidebar.language_en' : 'admin.sidebar.language_ar')}</span>
                    </button>
                    <button onClick={toggleTheme} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-400 hover:text-[#059669] text-xs">
                      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      <span>{theme === 'dark' ? t('sidebar.light') : t('sidebar.dark')}</span>
                    </button>
                    <button onClick={onLogout} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-rose-500/5 border border-rose-500/10 text-rose-500 hover:bg-rose-500/10 text-xs">
                      <LogOut className="w-4 h-4" />
                      <span>{t('admin.sidebar.logout')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
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

export default AdminSidebar;
