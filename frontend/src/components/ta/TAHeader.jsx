import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Search } from 'lucide-react';

const TAHeader = ({ ta, onSearch, notifications, unreadCount, onMarkRead, onMarkAllRead, setActiveTab }) => {
  const { t, i18n } = useTranslation();

  return (
    <header className="relative z-20 px-6 lg:px-10 py-5 flex items-center justify-between gap-4 border-b border-gray-100 dark:border-white/5">
      <div className="flex items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('common.search') + '...'}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full bg-gray-100 dark:bg-white/5 border border-transparent focus:border-[#059669] rounded-2xl py-3 ps-12 pe-6 text-sm outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative group">
          <button
            onClick={() => setActiveTab('notifications')}
            className="relative p-3 rounded-2xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
          >
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-black text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default TAHeader;
