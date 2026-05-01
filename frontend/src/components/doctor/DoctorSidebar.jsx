import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, BookOpen, FolderOpen, Award, ClipboardList, 
  BarChart3, PieChart, Bell, Settings, LogOut, Upload, Menu, X, Calendar as CalendarIcon 
} from 'lucide-react';

const MENU_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'schedule', label: 'Schedule', icon: CalendarIcon },
  { id: 'materials', label: 'Materials', icon: FolderOpen },
  { id: 'quizzes', label: 'Quizzes', icon: Award },
  { id: 'tasks', label: 'Tasks', icon: ClipboardList },
  { id: 'grades', label: 'Grades', icon: BarChart3 },
  { id: 'analytics', label: 'Analytics', icon: PieChart },
];

const DoctorSidebar = ({ activeTab, setActiveTab, doctor, onLogout }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const bottomBarItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'materials', label: 'Materials', icon: FolderOpen },
  ];

  const moreMenuItems = MENU_ITEMS.filter(item => !bottomBarItems.find(b => b.id === item.id));

  if (!isMobile) {
    return (
      <div className="w-72 bg-doctor-sidebar border-r border-white/5 flex flex-col h-full z-50">
        {/* Doctor Profile Section */}
        <div className="p-8 text-center">
          <div className="relative inline-block mb-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-doctor-primary to-doctor-secondary p-[2px] shadow-lg shadow-doctor-primary/20">
              <div className="w-full h-full rounded-[22px] bg-doctor-sidebar flex items-center justify-center overflow-hidden">
                <img 
                  src={`https://ui-avatars.com/api/?name=${doctor?.name}&background=8b5cf6&color=fff&size=128`} 
                  alt={doctor?.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-doctor-sidebar rounded-full"></div>
          </div>
          <h2 className="text-white font-bold text-lg tracking-tight">Dr. {doctor?.name}</h2>
          <p className="text-doctor-text-muted text-xs font-medium uppercase tracking-widest mt-1">Senior Instructor</p>
        </div>

        {/* Upload Button */}
        <div className="px-6 mb-8">
          <button 
            onClick={() => setActiveTab('materials')}
            className="w-full bg-doctor-primary hover:bg-doctor-primary/90 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-doctor-primary/20 transition-all active:scale-95"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Material</span>
          </button>
        </div>

        {/* Main Menu */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto hidden-scrollbar">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-doctor-primary/10 text-doctor-primary border border-doctor-primary/20' 
                    : 'text-doctor-text-muted hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-doctor-primary' : ''}`} />
                <span className="font-bold text-[15px]">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-doctor-primary shadow-[0_0_10px_#8b5cf6]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Menu */}
        <div className="p-4 border-t border-white/5 space-y-1">
          <button className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-doctor-text-muted hover:text-white hover:bg-white/5 transition-all">
            <Bell className="w-5 h-5" />
            <span className="font-bold text-[15px]">Notifications</span>
          </button>
          <button 
            onClick={() => { setActiveTab('settings'); setIsMoreOpen(false); }}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all ${
              activeTab === 'settings' ? 'bg-doctor-primary/10 text-doctor-primary border border-doctor-primary/20' : 'text-doctor-text-muted hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-bold text-[15px]">Settings</span>
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-red-400 hover:bg-red-400/10 transition-all mt-2"
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
      <div className="fixed bottom-0 left-0 right-0 bg-doctor-sidebar/95 backdrop-blur-xl border-t border-white/5 z-50 flex items-center justify-around px-2 pb-safe pt-2 shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
        {bottomBarItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsMoreOpen(false); }}
              className={`flex flex-col items-center gap-1.5 px-4 py-2 rounded-2xl transition-all ${
                isActive 
                  ? 'text-doctor-primary bg-doctor-primary/10 border border-doctor-primary/10' 
                  : 'text-doctor-text-muted'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          className={`flex flex-col items-center gap-1.5 px-4 py-2 rounded-2xl transition-all ${
            isMoreOpen ? 'text-doctor-primary bg-doctor-primary/10 border border-doctor-primary/10' : 'text-doctor-text-muted'
          }`}
        >
          {isMoreOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          <span className="text-[10px] font-bold uppercase tracking-wider">More</span>
        </button>
      </div>

      {/* More Menu Backdrop */}
      {isMoreOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45]"
          onClick={() => setIsMoreOpen(false)}
        />
      )}

      {/* More Menu Content */}
      {isMoreOpen && (
        <div className="fixed bottom-24 left-4 right-4 bg-doctor-sidebar border border-white/10 rounded-[2.5rem] shadow-2xl z-[46] p-4 animate-slideUp overflow-hidden">
          <div className="grid grid-cols-2 gap-2">
            {moreMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsMoreOpen(false); }}
                  className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all ${
                    isActive 
                      ? 'bg-doctor-primary/10 text-doctor-primary border border-doctor-primary/10' 
                      : 'text-doctor-text-muted hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-bold text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
          <div className="h-px bg-white/5 my-4 mx-2" />
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => { setActiveTab('settings'); setIsMoreOpen(false); }}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all ${
                activeTab === 'settings' ? 'bg-doctor-primary/10 text-doctor-primary border border-doctor-primary/20' : 'text-doctor-text-muted hover:bg-white/5'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="font-bold text-sm">Settings</span>
            </button>
            <button 
              onClick={onLogout}
              className="flex items-center gap-3 px-5 py-4 rounded-2xl text-red-400 hover:bg-red-400/10 transition-all"
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
      `}</style>
    </>
  );
};

export default DoctorSidebar;
