import React, { useState, useEffect, useRef } from 'react';
import { Menu, LogOut, Sun, Moon, Languages, ArrowRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const AdminSidebar = ({ activeTab, setActiveTab, admin, onLogout, availableTabs }) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { theme, toggleTheme } = useTheme();
  const isAr = i18n.language === 'ar';

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
      {/* Desktop Version - Floating rail */}
      {!isMobile && (
        <div
          className="fixed z-50 w-72 transition-all duration-300"
          style={{ insetInlineStart: '1.5rem', top: '1rem', bottom: '1rem' }}
        >
          <div className="h-full flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">

            {/* Brand */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
              <div className="inline-flex items-center justify-center size-10 rounded-lg overflow-hidden border border-border bg-muted shrink-0">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {admin?.name || t('admin.header.admin_label')}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {t('admin.header.admin_label')}
                </p>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto hidden-scrollbar">
              {safeTabs.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'group/item relative w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                      isActive
                        ? 'bg-muted text-foreground font-medium'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                      isAr && 'font-arabic'
                    )}
                  >
                    {isActive && (
                      <span className="absolute inset-y-1 start-0 w-0.5 rounded-full bg-primary" />
                    )}
                    <span className={cn('shrink-0', isActive ? 'text-primary' : 'text-muted-foreground group-hover/item:text-foreground')}>
                      {React.cloneElement(item.icon, { className: 'size-4' })}
                    </span>
                    <span className="truncate">{t(`admin.sidebar.tabs.${item.id}`)}</span>
                  </button>
                );
              })}
            </nav>

            {/* Footer controls */}
            <div className="border-t border-border p-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => i18n.changeLanguage(isAr ? 'en' : 'ar')}
                  className="flex-1 h-9 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                  aria-label={isAr ? 'English' : 'العربية'}
                >
                  <Languages className="size-4" />
                </button>
                <button
                  onClick={toggleTheme}
                  className="flex-1 h-9 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                  aria-label={theme === 'dark' ? t('sidebar.light') : t('sidebar.dark')}
                >
                  {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
                </button>
                <button
                  onClick={onLogout}
                  className="flex-1 h-9 flex items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  aria-label={t('admin.sidebar.logout')}
                >
                  <LogOut className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Version - Bottom dock */}
      {isMobile && (
        <>
          <div className="fixed start-0 end-0 bottom-0 z-50 flex items-center justify-center p-0 pointer-events-none">
            <div
              ref={dockRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="relative flex items-center w-full overflow-hidden border-t border-border bg-card pt-3 pb-[calc(1.2rem+env(safe-area-inset-bottom))] pointer-events-auto touch-none select-none"
            >
              {/* Active Indicator Line */}
              <div
                className="absolute top-0 h-0.5 rounded-full bg-primary transition-all duration-300"
                style={{
                  width: `${itemWidthPercent * 0.5}%`,
                  insetInlineStart: `${(currentIndex * itemWidthPercent) + (itemWidthPercent * 0.25)}%`,
                  display: currentIndex === -1 ? 'none' : 'block'
                }}
              />

              {bottomBarItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      'relative z-10 flex-1 flex flex-col items-center gap-0.5 cursor-pointer transition-colors active:opacity-70',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    <div className="flex items-center justify-center">
                      {React.cloneElement(item.icon, { className: 'w-[18px] h-[18px]' })}
                    </div>
                    <span className={cn('text-[10px] font-medium', isAr && 'font-arabic')}>
                      {t(`admin.sidebar.tabs.${item.id}`)}
                    </span>
                  </div>
                );
              })}

              {/* Menu Button */}
              <div
                onClick={() => setIsOpen(true)}
                className="relative z-10 flex-1 flex flex-col items-center gap-0.5 cursor-pointer text-muted-foreground transition-colors active:opacity-70"
              >
                <div className="flex items-center justify-center">
                  <Menu className="w-[18px] h-[18px]" />
                </div>
                <span className={cn('text-[10px] font-medium', isAr && 'font-arabic')}>
                  {t('sidebar.menu')}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Menu Overlay */}
          {isOpen && (
            <>
              <div className="fixed inset-0 bg-black/50 z-[60]" onClick={() => setIsOpen(false)} />
              <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] start-4 end-4 z-[70] overflow-hidden rounded-xl border border-border bg-card shadow-sm animate-slideUp">
                <div className="px-5 py-3.5 border-b border-border">
                  <h4 className={cn('text-sm font-semibold text-foreground', isAr && 'font-arabic')}>
                    {t('sidebar.menu')}
                  </h4>
                </div>

                <div className="px-2 py-2 space-y-0.5 max-h-[45vh] overflow-y-auto hidden-scrollbar">
                  {menuItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          'group/item w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-md text-sm transition-colors',
                          isActive
                            ? 'bg-muted text-foreground font-medium'
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        )}
                      >
                        <span className="flex items-center gap-3 min-w-0">
                          <span className={cn('shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')}>
                            {React.cloneElement(item.icon, { className: 'size-4' })}
                          </span>
                          <span className={cn('truncate', isAr && 'font-arabic')}>
                            {t(`admin.sidebar.tabs.${item.id}`)}
                          </span>
                        </span>
                        <ArrowRight className={cn('size-4 opacity-0 transition-opacity group-hover/item:opacity-60', isAr && 'rotate-180')} />
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-border p-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => i18n.changeLanguage(isAr ? 'en' : 'ar')}
                      className="flex-1 h-10 flex flex-col items-center justify-center gap-0.5 rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                    >
                      <Languages className="size-4" />
                      <span className="text-[10px] font-medium">{isAr ? 'English' : 'العربية'}</span>
                    </button>
                    <button
                      onClick={toggleTheme}
                      className="flex-1 h-10 flex flex-col items-center justify-center gap-0.5 rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                    >
                      {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
                      <span className="text-[10px] font-medium">{theme === 'dark' ? t('sidebar.light') : t('sidebar.dark')}</span>
                    </button>
                    <button
                      onClick={onLogout}
                      className="flex-1 h-10 flex flex-col items-center justify-center gap-0.5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <LogOut className="size-4" />
                      <span className="text-[10px] font-medium">{t('admin.sidebar.logout')}</span>
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
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp { animation: slideUp 0.2s ease-out forwards; }
        .hidden-scrollbar::-webkit-scrollbar { display: none; }
        .hidden-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};

export default AdminSidebar;
