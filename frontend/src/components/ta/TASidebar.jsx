import React, { useState, useEffect } from 'react';
import { LayoutDashboard, BookOpen, ClipboardList, Settings, LogOut, Bell, Menu, X, Sun, Moon, Languages, Users, FileText, GraduationCap, CalendarCheck, Megaphone, BarChart3 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const MENU_ITEMS = [
  { id: 'overview', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'courses', icon: <BookOpen className="w-5 h-5" /> },
  { id: 'materials', icon: <FileText className="w-5 h-5" /> },
  { id: 'quizzes', icon: <GraduationCap className="w-5 h-5" /> },
  { id: 'tasks', icon: <ClipboardList className="w-5 h-5" /> },
  { id: 'attendance', icon: <CalendarCheck className="w-5 h-5" /> },
  { id: 'grades', icon: <BarChart3 className="w-5 h-5" /> },
  { id: 'announcements', icon: <Megaphone className="w-5 h-5" /> },
  { id: 'students', icon: <Users className="w-5 h-5" /> },
];

const TASidebar = ({ activeTab, setActiveTab, ta, onLogout }) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const bottomBarItems = [
    { id: 'overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'courses', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'materials', icon: <FileText className="w-5 h-5" /> },
    { id: 'quizzes', icon: <GraduationCap className="w-5 h-5" /> },
    { id: 'tasks', icon: <ClipboardList className="w-5 h-5" /> },
  ];

  const menuItems = MENU_ITEMS.filter(item => !bottomBarItems.find(b => b.id === item.id));
  menuItems.push({ id: 'notifications', icon: <Bell className="w-5 h-5" /> });
  menuItems.push({ id: 'settings', icon: <Settings className="w-5 h-5" /> });

  if (!isMobile) {
    return (
      <div className="fixed inset-inline-start-14 top-10 bottom-10 w-72 z-50 transition-all duration-700">
        <div className="h-full bg-white/70 dark:bg-[#0c0c0e]/70 backdrop-blur-sm border border-white/20 dark:border-white/5 rounded-[3rem] shadow-[0_32px_64px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden relative group/sidebar">
          <div className="p-8 pb-4 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full overflow-hidden shadow-2xl bg-white dark:bg-white/5 border border-white/20 transition-transform duration-500 group-hover/sidebar:scale-110">
              <img
                src={ta?.avatar_url || `https://ui-avatars.com/api/?name=${ta?.name}&background=059669&color=fff&size=128`}
                alt={ta?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white mt-4">{ta?.name}</h1>
            <p className="text-[#059669] text-xs font-medium uppercase tracking-widest mt-1">{t('ta.sidebar.role')}</p>
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
                    <div className="absolute inset-0 bg-gray-100 dark:bg-white/5 rounded-2xl" />
                  )}
                  <span className={`relative z-10 transition-all duration-500 ${isActive ? 'scale-110 text-[#059669]' : 'group-hover/item:scale-110'}`}>
                    {item.icon}
                  </span>
                  <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.2em]">{t('ta.sidebar.' + item.id)}</span>
                  {isActive && (
                    <div className="absolute start-0 w-1 h-6 bg-[#059669] rounded-full shadow-[4px_0_15px_rgba(5,150,105,0.5)]" />
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
                <Bell className={`w-5 h-5 transition-all duration-500 ${activeTab === 'notifications' ? 'text-[#059669]' : ''}`} />
              </div>
              <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.2em]">{t('ta.sidebar.notifications')}</span>
            </button>
            <div className="bg-gray-50/50 dark:bg-white/[0.02] rounded-[2rem] p-2 flex gap-1 border border-gray-100 dark:border-white/5">
              <button onClick={() => { const newLang = i18n.language === 'ar' ? 'en' : 'ar'; i18n.changeLanguage(newLang); }} className="flex-1 h-12 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-white/5 transition-all text-gray-400 hover:text-[#059669]">
                <Languages className="w-5 h-5" />
              </button>
              <button onClick={() => setActiveTab('settings')} className={`flex-1 h-12 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-white/5 transition-all ${activeTab === 'settings' ? 'text-[#059669]' : 'text-gray-400 hover:text-[#059669]'}`}>
                <Settings className="w-5 h-5" />
              </button>
              <button onClick={toggleTheme} className="flex-1 h-12 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-white/5 transition-all text-gray-400 hover:text-[#059669]">
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

  return (
    <>
      <div className="fixed start-0 end-0 bottom-4 z-50 flex items-center justify-center gap-3 px-4 pointer-events-none">
        <div className="flex-1 flex items-center relative bg-[#1c1c1e] dark:bg-[#1c1c1e] backdrop-blur-sm border border-white/[0.06] rounded-[2rem] py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] pointer-events-auto touch-none select-none overflow-hidden [.light_&]:bg-white/80 [.light_&]:border-black/[0.06] [.light_&]:shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
          {bottomBarItems.map((item) => {
            const isHighlighted = activeTab === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="relative flex-1 flex flex-col items-center gap-1.5 cursor-pointer z-10"
              >
                <div className={`flex items-center justify-center transition-colors duration-300 ${isHighlighted ? 'text-white [.light_&]:text-gray-900' : 'text-white/60 [.light_&]:text-gray-500'}`}>
                  {React.cloneElement(item.icon, { className: 'w-[22px] h-[22px]' })}
                </div>
                <span className={`text-[10px] font-semibold transition-colors duration-300 leading-none ${isHighlighted ? 'text-white [.light_&]:text-gray-900' : 'text-white/40 [.light_&]:text-gray-400'}`}>
                  {t('ta.sidebar.' + item.id)}
                </span>
              </div>
            );
          })}
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 flex items-center justify-center bg-[#1c1c1e] dark:bg-[#1c1c1e] [.light_&]:bg-white/80 backdrop-blur-sm border border-white/[0.06] [.light_&]:border-black/[0.06] rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.5)] [.light_&]:shadow-[0_8px_32px_rgba(0,0,0,0.12)] pointer-events-auto text-white/80 [.light_&]:text-gray-700 transition-all active:scale-90 shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={() => setIsOpen(false)} />
          <div className="fixed bottom-32 start-6 end-6 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl z-[70] animate-slideUp overflow-hidden">
            <div className="p-4 pt-6 text-center border-b border-gray-100 dark:border-white/5">
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest">{t('ta.sidebar.menu')}</h3>
            </div>
            <div className="p-3 max-h-[50vh] overflow-y-auto hidden-scrollbar">
              <div className="grid grid-cols-2 gap-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                    className={`flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-2xl transition-all
                      ${activeTab === item.id ? 'bg-[#059669]/10 text-[#059669] font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}
                    `}
                  >
                    {item.icon}
                    <span className="font-bold text-[11px] uppercase tracking-wide text-center leading-tight">{t('ta.sidebar.' + item.id)}</span>
                  </button>
                ))}
                <div className="col-span-2 my-1 mx-2 h-px bg-gray-100 dark:bg-white/5" />
                <div className="col-span-2 flex justify-center gap-3 p-1">
                  <button
                    onClick={() => { const newLang = i18n.language === 'ar' ? 'en' : 'ar'; i18n.changeLanguage(newLang); }}
                    className="w-14 h-14 flex items-center justify-center rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 transition-all active:scale-95"
                  >
                    <Languages className="w-6 h-6" />
                  </button>
                  <button
                    onClick={toggleTheme}
                    className="w-14 h-14 flex items-center justify-center rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 transition-all active:scale-95"
                  >
                    {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                  </button>
                  <button
                    onClick={onLogout}
                    className="w-14 h-14 flex items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/20 hover:text-rose-600 border border-rose-100 dark:border-rose-500/20 hover:border-rose-200 dark:hover:border-rose-500/30 transition-all active:scale-95"
                  >
                    <LogOut className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default TASidebar;
