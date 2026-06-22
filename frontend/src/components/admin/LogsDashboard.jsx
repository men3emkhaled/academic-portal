import React, { useState } from 'react';
import ActivityLogsManager from './ActivityLogsManager';
import StudentLogins from './StudentLogins';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, Users, History } from 'lucide-react';

const LogsDashboard = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('admin');

  return (
    <div className="space-y-6 pb-10 max-w-[1200px] mx-auto w-full px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6 text-[#059669]" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.logs.title')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('admin.logs.audit_trail')}</p>
          </div>
        </div>
        {/* Tab Switcher */}
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <button onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'admin' ? 'bg-[#059669] text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}>
            <ShieldAlert className="w-4 h-4" />{t('admin.logs.admin_tab')}
          </button>
          <button onClick={() => setActiveTab('student')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'student' ? 'bg-[#059669] text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}>
            <Users className="w-4 h-4" />{t('admin.logs.student_tab')}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-[#0d0d14] border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        {activeTab === 'admin' ? <ActivityLogsManager /> : <StudentLogins />}
      </div>
    </div>
  );
};

export default LogsDashboard;
