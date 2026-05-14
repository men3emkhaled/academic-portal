import React from 'react';
import { Search, ShieldCheck, Sun, Moon, Bell, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

const AdminHeader = ({ 
  admin, onSearch, setActiveTab, hasNotificationsAccess
}) => {
  const { t, i18n } = useTranslation();
  const { isDarkMode, toggleTheme } = useTheme();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="h-20 lg:h-24 bg-white/80 dark:bg-[#050505]/95 backdrop-blur-md border-b border-gray-200 dark:border-white/[0.03] flex items-center justify-between px-6 lg:px-12 z-40 transition-[background-color,border-color] duration-300">
      <div className="relative w-full max-w-[200px] sm:max-w-md group">
        <div className="absolute inset-y-0 inset-inline-start-0 flex items-center inset-inline-start-4 lg:inset-inline-start-6 pointer-events-none">
          <Search className="w-4 lg:w-5 h-4 lg:h-5 text-gray-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
        </div>
        <input 
          type="text" 
          placeholder={t('admin.header.search_placeholder')}
          onChange={(e) => onSearch && onSearch(e.target.value)}
          className="w-full bg-gray-50/50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl lg:rounded-[2rem] py-2.5 lg:py-4 ps-12 lg:ps-16 pe-4 lg:pe-6 text-sm lg:text-base text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white dark:focus:bg-white/5 transition-[background-color,box-shadow,border-color] duration-200 font-medium"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 lg:gap-6">
        
        {/* Language Toggle */}
        <button 
          onClick={toggleLanguage}
          className="w-10 h-10 lg:w-12 lg:h-12 rounded-[1.25rem] lg:rounded-[1.5rem] border bg-gray-50/50 border-gray-200 text-gray-500 hover:text-emerald-500 hover:bg-white dark:bg-white/[0.03] dark:border-white/5 dark:text-slate-400 dark:hover:text-emerald-400 dark:hover:bg-white/10 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm"
        >
          <Languages className="w-4 lg:w-5 h-4 lg:h-5" />
        </button>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="w-10 h-10 lg:w-12 lg:h-12 rounded-[1.25rem] lg:rounded-[1.5rem] border bg-gray-50/50 border-gray-200 text-gray-500 hover:text-emerald-500 hover:bg-white dark:bg-white/[0.03] dark:border-white/5 dark:text-slate-400 dark:hover:text-emerald-400 dark:hover:bg-white/10 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm"
        >
          {isDarkMode ? <Sun className="w-4 lg:w-5 h-4 lg:h-5" /> : <Moon className="w-4 lg:w-5 h-4 lg:h-5" />}
        </button>

        {/* Alerts Shortcut */}
        {hasNotificationsAccess && (
          <button 
            onClick={() => setActiveTab('notifications')}
            className="w-10 h-10 lg:w-12 lg:h-12 rounded-[1.25rem] lg:rounded-[1.5rem] border bg-gray-50/50 border-gray-200 text-gray-500 hover:text-emerald-500 hover:bg-white dark:bg-white/[0.03] dark:border-white/5 dark:text-slate-400 dark:hover:text-emerald-400 dark:hover:bg-white/10 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm"
          >
            <Bell className="w-4 lg:w-5 h-4 lg:h-5" />
          </button>
        )}

        <div className="hidden lg:block h-10 w-[1px] bg-gray-200 dark:bg-white/5 mx-2"></div>

        {/* Profile Info */}
        <div className="flex items-center gap-3 lg:gap-4 group cursor-pointer">
          <div className="text-inline-end hidden sm:block">
            <p className="text-sm font-black text-gray-900 dark:text-white tracking-tight leading-none group-hover:text-emerald-500 transition-colors">{admin?.name || t('admin.header.admin_label')}</p>
          </div>
          <div className="w-11 h-11 lg:w-14 lg:h-14 rounded-2xl lg:rounded-[1.75rem] bg-gradient-to-br from-emerald-500 to-teal-600 p-[2px] group-hover:scale-105 group-hover:rotate-3 transition-all shadow-lg shadow-emerald-500/20">
             <div className="w-full h-full rounded-[14px] lg:rounded-[25px] bg-white dark:bg-[#050505] flex items-center justify-center overflow-hidden">
                <ShieldCheck className="w-6 lg:w-8 h-6 lg:h-8 text-emerald-500" />
             </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
