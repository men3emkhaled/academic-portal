import React from 'react';
import { Search, ShieldCheck, Sun, Moon, Bell } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const AdminHeader = ({ 
  admin, onSearch, setActiveTab, hasNotificationsAccess
}) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className="h-20 lg:h-24 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/[0.03] flex items-center justify-between px-4 lg:px-10 z-40 transition-colors duration-300">
      {/* Search Bar */}
      <div className="relative w-full max-w-[180px] sm:max-w-96 group">
        <Search className="absolute left-4 lg:left-5 top-1/2 -translate-y-1/2 w-4 lg:w-5 h-4 lg:h-5 text-gray-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
        <input 
          type="text" 
          placeholder="Search global records..."
          onChange={(e) => onSearch && onSearch(e.target.value)}
          className="w-full bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl lg:rounded-2xl py-2.5 lg:py-3.5 pl-11 lg:pl-14 pr-4 lg:pr-6 text-sm lg:text-base text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 lg:gap-6">
        


        {/* Alerts Shortcut */}
        {hasNotificationsAccess && (
          <button 
            onClick={() => setActiveTab('notifications')}
            className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl border bg-gray-50 border-gray-200 text-gray-500 hover:text-emerald-500 hover:bg-gray-100 dark:bg-white/5 dark:border-white/5 dark:text-slate-400 dark:hover:text-emerald-400 dark:hover:bg-white/10 flex items-center justify-center transition-all"
          >
            <Bell className="w-4 lg:w-5 h-4 lg:h-5" />
          </button>
        )}

        <div className="hidden lg:block h-10 w-[1px] bg-gray-200 dark:bg-white/5 mx-2"></div>

        {/* Profile Info */}
        <div className="flex items-center gap-2 lg:gap-3 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900 dark:text-white tracking-tight leading-none mb-1 group-hover:text-emerald-500 transition-colors">{admin?.name || 'Admin'}</p>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active Node</p>
          </div>
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-[2px] group-hover:scale-105 transition-transform shadow-lg shadow-emerald-500/20">
             <div className="w-full h-full rounded-[9px] lg:rounded-[14px] bg-white dark:bg-[#050505] flex items-center justify-center overflow-hidden">
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
             </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
