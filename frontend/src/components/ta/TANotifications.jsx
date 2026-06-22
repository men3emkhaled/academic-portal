import React from 'react';
import { Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TANotifications = ({ notifications, loading }) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{t('ta.notifications.title')}</h1>
      <p className="text-gray-500 dark:text-gray-400 font-medium">{t('ta.notifications.subtitle')}</p>
      <div className="bg-white dark:bg-[#0c0c0e] border border-gray-100 dark:border-white/5 rounded-2xl p-6">
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Bell className="w-12 h-12 mb-4 opacity-50" />
          <p className="font-medium">{t('ta.notifications.empty')}</p>
        </div>
      </div>
    </div>
  );
};

export default TANotifications;
