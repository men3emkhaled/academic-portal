import React, { useState } from 'react';
import ActivityLogsManager from './ActivityLogsManager';
import StudentLogins from './StudentLogins';
import { useTranslation } from 'react-i18next';
import { 
  ShieldAlert, Users, Activity, Clock, 
  Terminal, LayoutDashboard, ChevronRight,
  Shield, History, Fingerprint, Eye
} from 'lucide-react';

const LogsDashboard = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('admin');

  return (
    <div className="animate-in fade-in duration-700 pb-10 text-start">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-[#8b5cf6]/10 dark:bg-[#8b5cf6]/20 rounded-3xl flex items-center justify-center border border-[#8b5cf6]/20 shadow-inner group">
            <History className="w-8 h-8 text-[#8b5cf6] group-hover:rotate-12 transition-transform" />
          </div>
          <div>
            <h2 className={`text-4xl font-black text-gray-900 dark:text-white tracking-tighter ${i18n.language === 'ar' ? 'font-arabic' : ''}`}>
              {t('admin.logs.title')}
            </h2>
            <div className="flex items-center gap-3 mt-1.5">
                <span className="text-gray-500 dark:text-slate-400 text-xs font-black uppercase tracking-[0.2em]">{t('admin.logs.audit_trail')}</span>
                <div className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                <span className="text-[#8b5cf6] text-[10px] font-black uppercase tracking-widest">{t('admin.logs.real_time')}</span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1.5 bg-white/50 dark:bg-[#0d0d14] border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm">
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-[color,background-color,border-color,transform,opacity] ${
                activeTab === 'admin'
                  ? 'bg-[#8b5cf6] text-white shadow-lg shadow-purple-500/20'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              {t('admin.logs.admin_tab')}
            </button>
            <button
              onClick={() => setActiveTab('student')}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-[color,background-color,border-color,transform,opacity] ${
                activeTab === 'student'
                  ? 'bg-[#2cfc7d] text-black shadow-lg shadow-green-500/20'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              {t('admin.logs.student_tab')}
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="animate-in slide-in-from-bottom-4 duration-700">
        <div className="bg-white/40 dark:bg-[#0d0d14] border border-gray-100 dark:border-white/5 rounded-[3rem] overflow-hidden">
            {activeTab === 'admin' ? <ActivityLogsManager /> : <StudentLogins />}
        </div>
      </div>
    </div>
  );
};

export default LogsDashboard;
