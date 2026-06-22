import React, { useState, useEffect } from 'react';
import { LayoutDashboard, BookOpen, FolderOpen, Award, ClipboardList, BarChart3, PieChart, Bell, Settings, LogOut, Upload, Menu, X, Calendar as CalendarIcon, MessageSquare, Sun, Moon, UserCheck, Languages, Users } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const DoctorSidebar = ({ activeTab, setActiveTab, doctor, onLogout, unreadCount = 0 }) => {
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
    { id: 'overview', label: t('doctor.sidebar.overview'), icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'courses', label: t('doctor.sidebar.courses'), icon: <BookOpen className="w-5 h-5" /> },
    { id: 'schedule', label: t('doctor.sidebar.schedule'), icon: <CalendarIcon className="w-5 h-5" /> },
    { id: 'attendance', label: t('doctor.sidebar.attendance'), icon: <UserCheck className="w-5 h-5" /> },
  ];

  const menuItems = [
    { id: 'materials', label: t('doctor.sidebar.materials'), icon: <FolderOpen className="w-5 h-5" /> },
    { id: 'quizzes', label: t('doctor.sidebar.quizzes'), icon: <Award className="w-5 h-5" /> },
    { id: 'tasks', label: t('doctor.sidebar.tasks'), icon: <ClipboardList className="w-5 h-5" /> },
    { id: 'official-tasks', label: t('doctor.sidebar.official_tasks'), icon: <ClipboardList className="w-5 h-5" /> },
    { id: 'inquiries', label: t('doctor.sidebar.inquiries'), icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'grades', label: t('doctor.sidebar.grades'), icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'analytics', label: t('doctor.sidebar.analytics'), icon: <PieChart className="w-5 h-5" /> },
    { id: 'assistants', label: t('doctor.sidebar.assistants'), icon: <Users className="w-5 h-5" /> },
    { id: 'notifications', label: t('doctor.sidebar.notifications'), icon: <Bell className="w-5 h-5" /> },
    { id: 'settings', label: t('doctor.sidebar.settings'), icon: <Settings className="w-5 h-5" /> },
  ];

  if (!isMobile) {
    return (
      <div className="fixed inset-inline-start-14 top-10 bottom-10 w-72 z-50">
        <div className="h-full bg-white/70 dark:bg-[#0c0c0e]/70 backdrop-blur-sm border border-white/20 dark:border-white/5 rounded-xl shadow-lg flex flex-col overflow-hidden">

          <div className="p-6 pb-3 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full overflow-hidden border border-white/20">
              <img
                src={doctor?.avatar_url || `https://ui-avatars.com/api/?name=${doctor?.name}&background=059669&color=fff&size=96`}
                alt={doctor?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-sm font-semibold text-gray-900 dark:text-white mt-3">Dr. {doctor?.name}</h1>
            <p className="text-gray-500 dark:text-slate-500 text-xs mt-0.5">{t('doctor.sidebar.senior_instructor')}</p>
          </div>

          <div className="px-4 mb-3">
            <button
              onClick={() => setActiveTab('materials')}
              className="w-full bg-[#059669] hover:bg-[#047857] text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-sm"
            >
              <Upload className="w-4 h-4" />
              <span>{t('doctor.sidebar.upload_material')}</span>
            </button>
          </div>

          <nav className="flex-1 px-3 pb-6 space-y-1 overflow-y-auto">
            {[...bottomBarItems, ...menuItems].map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm
                    ${isActive ? 'bg-[#059669]/10 text-[#059669] font-semibold' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'}
                  `}
                >
                  <span className={`shrink-0 ${isActive ? 'text-[#059669]' : ''}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {item.id === 'notifications' && unreadCount > 0 && (
                    <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">{unreadCount > 99 ? '99+' : unreadCount}</span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-100 dark:border-white/5">
            <div className="bg-gray-50/50 dark:bg-white/[0.02] rounded-lg p-1.5 flex gap-1 border border-gray-100 dark:border-white/5">
              <button onClick={() => { const newLang = i18n.language === 'ar' ? 'en' : 'ar'; i18n.changeLanguage(newLang); }} className="flex-1 h-10 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-white/5 transition-all text-gray-400 hover:text-[#059669]">
                <Languages className="w-4 h-4" />
              </button>
              <button onClick={() => setActiveTab('settings')} className={`flex-1 h-10 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-white/5 transition-all ${activeTab === 'settings' ? 'text-[#059669]' : 'text-gray-400 hover:text-[#059669]'}`}>
                <Settings className="w-4 h-4" />
              </button>
              <button onClick={toggleTheme} className="flex-1 h-10 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-white/5 transition-all text-gray-400 hover:text-[#059669]">
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button onClick={onLogout} className="flex-1 h-10 flex items-center justify-center rounded-lg hover:bg-rose-500/10 transition-all text-gray-400 hover:text-rose-500">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed start-0 end-0 bottom-4 z-50 flex items-center justify-center gap-2 px-4">
        <div className="flex-1 flex items-center bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl py-2 shadow-lg">
          {bottomBarItems.map((item, idx) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                className={`flex-1 flex flex-col items-center gap-0.5 py-1 transition-colors ${
                  isActive ? 'text-[#059669]' : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {React.cloneElement(item.icon, { className: 'w-5 h-5' })}
                <span className={`text-[9px] leading-none ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
          <button
            onClick={() => setIsOpen(true)}
            className="flex flex-col items-center gap-0.5 py-1 px-3 text-gray-400 dark:text-gray-500"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[9px] leading-none">{t('doctor.sidebar.more')}</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[60]" onClick={() => setIsOpen(false)} />
          <div className="fixed bottom-24 start-4 end-4 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl z-[70]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">{t('doctor.sidebar.menu')}</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-3 gap-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                    className={`flex flex-col items-center justify-center gap-1.5 px-2 py-3 rounded-xl transition-all text-xs
                      ${activeTab === item.id ? 'bg-[#059669]/10 text-[#059669] font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}
                    `}
                  >
                    {item.icon}
                    <span className="text-center leading-tight">{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex justify-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
                <button
                  onClick={() => { const newLang = i18n.language === 'ar' ? 'en' : 'ar'; i18n.changeLanguage(newLang); }}
                  className="flex-1 h-10 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                >
                  <Languages className="w-4 h-4" />
                </button>
                <button
                  onClick={toggleTheme}
                  className="flex-1 h-10 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button
                  onClick={onLogout}
                  className="flex-1 h-10 flex items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default DoctorSidebar;
