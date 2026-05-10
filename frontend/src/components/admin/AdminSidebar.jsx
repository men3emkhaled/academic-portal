import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Settings, LogOut, Bell, ShieldCheck, User, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const AdminSidebar = ({ activeTab, setActiveTab, admin, onLogout, availableTabs }) => {
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
  const bottomBarItems = availableTabs.filter(tab => bottomBarIds.includes(tab.id)).slice(0, 3);
  if (bottomBarItems.length < 3 && availableTabs.length >= 3) {
      const extraItems = availableTabs.filter(tab => !bottomBarItems.find(b => b.id === tab.id)).slice(0, 3 - bottomBarItems.length);
      bottomBarItems.push(...extraItems);
  }

  const menuItems = availableTabs.filter(item => !bottomBarItems.find(b => b.id === item.id));

  // ============= Sidebar Desktop =============
  if (!isMobile) {
    return (
      <div className="fixed left-6 top-10 bottom-10 w-72 z-50 transition-all duration-700">
        <div className="h-full bg-white/70 dark:bg-[#080808]/70 backdrop-blur-3xl border border-white/20 dark:border-white/5 rounded-[3rem] shadow-[0_32px_64px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden relative group/sidebar">

          <div className="p-8 pb-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full overflow-hidden shadow-2xl bg-white dark:bg-white/5 border border-white/20 transition-transform duration-500 group-hover/sidebar:scale-110">
              <img src="/logo.png" alt="ZNU Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-sm font-black uppercase tracking-[0.4em] text-gray-900 dark:text-white opacity-40 mt-4">{admin?.name || 'Admin'}</h1>
            <p className="text-gray-500 dark:text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">{admin?.role || 'System Node'}</p>
          </div>

          <nav className="flex-1 px-4 py-8 grid grid-cols-2 gap-2 overflow-y-auto hidden-scrollbar relative z-10">
            {availableTabs.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full relative group/item flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all duration-500
                    ${isActive ? 'text-gray-900 dark:text-white font-black' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}
                  `}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gray-100 dark:bg-white/5 rounded-2xl animate-in fade-in zoom-in-95 duration-500" />
                  )}
                  <span className={`relative z-10 transition-all duration-500 ${isActive ? 'scale-110 text-emerald-500 dark:text-emerald-400' : 'group-hover/item:scale-110'}`}>
                    {item.icon}
                  </span>
                  <span className="relative z-10 text-[9px] font-black uppercase tracking-[0.1em] text-center leading-tight">{item.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-emerald-500 rounded-full shadow-[0_4px_15px_rgba(16,185,129,0.5)]" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-6 pt-0 relative z-10">
            <div className="bg-gray-50/50 dark:bg-white/[0.02] rounded-[2rem] p-2 flex gap-1 border border-gray-100 dark:border-white/5">
              <button onClick={toggleTheme} className="flex-1 h-12 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-white/5 transition-all text-gray-400 hover:text-emerald-500">
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

  // ============= Mobile Dock =============
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
      setActiveTab(bottomBarItems[safeIndex].id);
    }
    setDragPosition(null);
  };

  const currentIndex = bottomBarItems.findIndex(item => activeTab === item.id);
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
      <div className="fixed left-0 right-0 bottom-4 z-50 flex items-center justify-center gap-3 px-4 pointer-events-none">
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
              left: `${translateX}%`,
              transform: `translate(-50%, -50%)`,
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
                    el.style.left = `${pos}%`;
                    el.style.transformOrigin = dist > 0 ? 'left' : dist < 0 ? 'right' : 'center';
                    
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
          className="w-14 h-14 flex items-center justify-center bg-[#1c1c1e] dark:bg-[#1c1c1e] [.light_&]:bg-white/80 backdrop-blur-3xl border border-white/[0.06] dark:border-white/[0.06] [.light_&]:border-black/[0.06] rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)] [.light_&]:shadow-[0_8px_32px_rgba(0,0,0,0.12)] pointer-events-auto text-white/80 dark:text-white/80 [.light_&]:text-gray-700 transition-all active:scale-90 shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={() => setIsOpen(false)} />
          <div className="fixed bottom-32 left-6 right-6 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl z-[70] animate-slideUp overflow-hidden">
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
                      ${activeTab === item.id ? 'bg-emerald-500/10 text-emerald-500 font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}
                    `}
                  >
                    {item.icon}
                    <span className="font-bold text-[11px] uppercase tracking-wide text-center leading-tight">{item.label}</span>
                  </button>
                ))}

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-2xl transition-all text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 border border-gray-100 dark:border-white/5"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  <span className="font-bold text-[11px] uppercase tracking-wide text-center leading-tight">
                    {theme === 'dark' ? 'Light' : 'Dark'}
                  </span>
                </button>

                {/* Logout */}
                <button
                  onClick={onLogout}
                  className="flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-2xl transition-all text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-bold text-[11px] uppercase tracking-wide text-center leading-tight">Logout</span>
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

export default AdminSidebar;
