import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Settings, LogOut, Bell, ShieldCheck, User
} from 'lucide-react';

const AdminSidebar = ({ activeTab, setActiveTab, admin, onLogout, availableTabs }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine bottom bar items dynamically or hardcode the most important ones
  const bottomBarIds = ['overview', 'students', 'courses'];
  const bottomBarItems = availableTabs.filter(tab => bottomBarIds.includes(tab.id)).slice(0, 3);
  
  // Fallback if the admin doesn't have permissions for the preferred bottom bar items
  if (bottomBarItems.length < 3 && availableTabs.length >= 3) {
      const extraItems = availableTabs.filter(tab => !bottomBarItems.find(b => b.id === tab.id)).slice(0, 3 - bottomBarItems.length);
      bottomBarItems.push(...extraItems);
  }

  const moreMenuItems = availableTabs.filter(item => !bottomBarItems.find(b => b.id === item.id));

  if (!isMobile) {
    return (
      <div className="w-72 bg-white dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-white/[0.03] flex flex-col h-full z-50 transition-colors duration-300">
        {/* Admin Profile Section */}
        <div className="p-8 text-center">
          <div className="relative inline-block mb-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-[2px] shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full rounded-[22px] bg-white dark:bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
                <ShieldCheck className="w-10 h-10 text-emerald-500" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-[#0a0a0a] rounded-full"></div>
          </div>
          <h2 className="text-gray-900 dark:text-white font-bold text-lg tracking-tight">{admin?.name || 'Admin'}</h2>
          <p className="text-gray-500 dark:text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">{admin?.role || 'System Node'}</p>
        </div>

        {/* Main Menu */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto hidden-scrollbar pb-6">
          {availableTabs.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent'
                }`}
              >
                <span className={isActive ? 'text-emerald-500 dark:text-emerald-400' : ''}>{item.icon}</span>
                <span className="font-bold text-[15px]">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-white/[0.03] space-y-1 mt-auto">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-bold text-[15px]">Logout</span>
          </button>
        </div>
      </div>
    );
  }

  // ============= Mobile Bottom Bar =============
  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-gray-200 dark:border-white/[0.03] z-50 flex items-center justify-around px-2 pb-safe pt-2 shadow-[0_-8px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.5)] transition-colors duration-300">
        {bottomBarItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsMoreOpen(false); }}
              className={`flex flex-col items-center gap-1.5 px-4 py-2 rounded-2xl transition-all ${
                isActive 
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/10' 
                  : 'text-gray-500 dark:text-slate-400'
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          className={`flex flex-col items-center gap-1.5 px-4 py-2 rounded-2xl transition-all ${
            isMoreOpen ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/10' : 'text-gray-500 dark:text-slate-400'
          }`}
        >
          {isMoreOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          <span className="text-[10px] font-bold uppercase tracking-wider">More</span>
        </button>
      </div>

      {/* More Menu Backdrop */}
      {isMoreOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/60 dark:bg-black/60 backdrop-blur-sm z-[45]"
          onClick={() => setIsMoreOpen(false)}
        />
      )}

      {/* More Menu Content */}
      {isMoreOpen && (
        <div className="fixed bottom-24 left-4 right-4 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl z-[46] p-4 animate-slideUp overflow-hidden max-h-[60vh] flex flex-col">
          <div className="grid grid-cols-2 gap-2 overflow-y-auto hidden-scrollbar pb-2">
            {moreMenuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsMoreOpen(false); }}
                  className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all ${
                    isActive 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10' 
                      : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span className={isActive ? 'text-emerald-500 dark:text-emerald-400' : ''}>{item.icon}</span>
                  <span className="font-bold text-[13px] sm:text-sm truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
          <div className="h-px bg-gray-200 dark:bg-white/5 my-4 mx-2 shrink-0" />
          <div className="grid grid-cols-1 gap-2 shrink-0">
            <button 
              onClick={onLogout}
              className="flex items-center justify-center gap-3 px-5 py-4 rounded-2xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-bold text-sm">Logout</span>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .pb-safe { padding-bottom: max(env(safe-area-inset-bottom, 0.75rem), 0.75rem); }
        .hidden-scrollbar::-webkit-scrollbar { display: none; }
        .hidden-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};

export default AdminSidebar;
