import React, { useState } from 'react';
import ActivityLogsManager from './ActivityLogsManager';
import StudentLogins from './StudentLogins';
import { ShieldAlert, Users } from 'lucide-react';

const LogsDashboard = () => {
  const [activeTab, setActiveTab] = useState('admin');

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('admin')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
            activeTab === 'admin'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-white/[0.02] text-slate-400 hover:text-white border border-white/5 hover:bg-white/[0.05]'
          }`}
        >
          <ShieldAlert className="w-5 h-5" />
          Admin Activity Logs
        </button>
        <button
          onClick={() => setActiveTab('student')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
            activeTab === 'student'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'bg-white/[0.02] text-slate-400 hover:text-white border border-white/5 hover:bg-white/[0.05]'
          }`}
        >
          <Users className="w-5 h-5" />
          Student Logins
        </button>
      </div>

      <div className="animate-fadeIn">
        {activeTab === 'admin' ? <ActivityLogsManager /> : <StudentLogins />}
      </div>
    </div>
  );
};

export default LogsDashboard;
