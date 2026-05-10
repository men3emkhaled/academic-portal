const fs = require('fs');
const path = require('path');

const sidebarContent = fs.readFileSync('/home/men3emk1/Documents/academic-portal/academic-portal/frontend/src/components/Sidebar.jsx', 'utf8');

// Extract the mobile animation logic and dock from Sidebar.jsx
const mobileDockLogicMatch = sidebarContent.match(/const handleTouchStart =[\s\S]*?const activeIndex =.*?;/s);
const mobileDockLogic = mobileDockLogicMatch ? mobileDockLogicMatch[0] : '';

const mobileDockRenderMatch = sidebarContent.match(/<div className="fixed left-0 right-0 bottom-4 z-50 flex items-center justify-center gap-3 px-4 pointer-events-none">[\s\S]*?<style>{`/s);
let mobileDockRender = mobileDockRenderMatch ? mobileDockRenderMatch[0].replace('<style>{`', '') : '';

// Function to adapt the mobile dock for Admin and Doctor
function adaptMobileDock(renderStr, isRouting) {
  if (!isRouting) {
    // Replace navigate with setActiveTab
    renderStr = renderStr.replace(/navigate\(item\.path\)/g, 'setActiveTab(item.id); setIsOpen(false)');
    renderStr = renderStr.replace(/to=\{item\.path\}/g, '');
    renderStr = renderStr.replace(/<NavLink/g, '<button onClick={() => { setActiveTab(item.id); setIsOpen(false); }}');
    renderStr = renderStr.replace(/<\/NavLink>/g, '</button>');
    renderStr = renderStr.replace(/isActive \? 'bg-primary\/10 text-primary font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white\/5'/g, "activeTab === item.id ? 'bg-primary/10 text-primary font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'");
  }
  return renderStr;
}

// ================= ADMIN SIDEBAR =================
const adminSidebarContent = `import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Settings, LogOut, Bell, ShieldCheck, User, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const AdminSidebar = ({ activeTab, setActiveTab, admin, onLogout, availableTabs }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { theme, toggleTheme } = useTheme();

  // Mobile-specific hooks
  const [dragPosition, setDragPosition] = useState(null); // Percentage 0-100
  const dockRef = useRef(null);
  const indicatorRef = useRef(null);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const bottomBarIds = ['overview', 'students', 'courses'];
  const bottomBarItems = availableTabs.filter(tab => bottomBarIds.includes(tab.id)).slice(0, 3);
  if (bottomBarItems.length < 3 && availableTabs.length >= 3) {
      const extraItems = availableTabs.filter(tab => !bottomBarItems.find(b => b.id === tab.id)).slice(0, 3 - bottomBarItems.length);
      bottomBarItems.push(...extraItems);
  }

  const menuItems = availableTabs.filter(item => !bottomBarItems.find(b => b.id === item.id));

  // ============= Sidebar Desktop =============
  if (!isMobile) {
    return (
      <div className="fixed left-6 top-10 bottom-10 w-72 z-50 transition-all duration-700">
        <div className="h-full bg-white/70 dark:bg-[#080808]/70 backdrop-blur-3xl border border-white/20 dark:border-white/5 rounded-[3rem] shadow-[0_32px_64px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden relative group/sidebar">

          <div className="p-8 pb-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full overflow-hidden shadow-2xl bg-white dark:bg-white/5 border border-white/20 transition-transform duration-500 group-hover/sidebar:scale-110">
              <img src="/logo.png" alt="ZNU Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-sm font-black uppercase tracking-[0.4em] text-gray-900 dark:text-white opacity-40 mt-4">{admin?.name || 'Admin'}</h1>
            <p className="text-gray-500 dark:text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">{admin?.role || 'System Node'}</p>
          </div>

          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto hidden-scrollbar relative z-10">
            {availableTabs.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={\`w-full relative group/item flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-500
                    \${isActive ? 'text-gray-900 dark:text-white font-black' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}
                  \`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gray-100 dark:bg-white/5 rounded-2xl animate-in fade-in zoom-in-95 duration-500" />
                  )}
                  <span className={\`relative z-10 transition-all duration-500 \${isActive ? 'scale-110 text-emerald-500 dark:text-emerald-400' : 'group-hover/item:scale-110'}\`}>
                    {item.icon}
                  </span>
                  <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                  {isActive && (
                    <div className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-full shadow-[4px_0_15px_rgba(16,185,129,0.5)]" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-6 pt-0 relative z-10">
            <div className="bg-gray-50/50 dark:bg-white/[0.02] rounded-[2rem] p-2 flex gap-1 border border-gray-100 dark:border-white/5">
              <button onClick={toggleTheme} className="flex-1 h-12 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-white/5 transition-all text-gray-400 hover:text-emerald-500">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={onLogout} className="flex-1 h-12 flex items-center justify-center rounded-xl hover:bg-rose-500/10 transition-all text-gray-400 hover:text-rose-500">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============= Mobile Dock =============
  ${mobileDockLogic.replace(/location\.pathname === item\.path/g, 'activeTab === item.id').replace(/navigate\(bottomBarItems\[safeIndex\]\.path\)/g, 'setActiveTab(bottomBarItems[safeIndex].id)')}

  return (
    <>
      ${adaptMobileDock(mobileDockRender, false).replace(/bg-primary\/10 text-primary/g, 'bg-emerald-500/10 text-emerald-500')}
      <style>{\`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
        .hidden-scrollbar::-webkit-scrollbar { display: none; }
        .hidden-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      \`}</style>
    </>
  );
};

export default AdminSidebar;
`;

// ================= DOCTOR SIDEBAR =================
const doctorSidebarContent = `import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, BookOpen, FolderOpen, Award, ClipboardList, BarChart3, PieChart, Bell, Settings, LogOut, Upload, Menu, X, Calendar as CalendarIcon, MessageSquare, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const MENU_ITEMS = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'courses', label: 'Courses', icon: <BookOpen className="w-5 h-5" /> },
  { id: 'schedule', label: 'Schedule', icon: <CalendarIcon className="w-5 h-5" /> },
  { id: 'materials', label: 'Materials', icon: <FolderOpen className="w-5 h-5" /> },
  { id: 'quizzes', label: 'Quizzes', icon: <Award className="w-5 h-5" /> },
  { id: 'tasks', label: 'Tasks', icon: <ClipboardList className="w-5 h-5" /> },
  { id: 'inquiries', label: 'Support', icon: <MessageSquare className="w-5 h-5" /> },
  { id: 'grades', label: 'Grades', icon: <BarChart3 className="w-5 h-5" /> },
  { id: 'analytics', label: 'Analytics', icon: <PieChart className="w-5 h-5" /> },
];

const DoctorSidebar = ({ activeTab, setActiveTab, doctor, onLogout, unreadCount = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { theme, toggleTheme } = useTheme();

  const [dragPosition, setDragPosition] = useState(null);
  const dockRef = useRef(null);
  const indicatorRef = useRef(null);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const bottomBarItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'courses', label: 'Courses', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'materials', label: 'Materials', icon: <FolderOpen className="w-5 h-5" /> },
  ];

  const menuItems = MENU_ITEMS.filter(item => !bottomBarItems.find(b => b.id === item.id));
  
  // Also add notifications and settings to menu items for mobile
  menuItems.push({ id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> });
  menuItems.push({ id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> });

  if (!isMobile) {
    return (
      <div className="fixed left-6 top-10 bottom-10 w-72 z-50 transition-all duration-700">
        <div className="h-full bg-white/70 dark:bg-[#080808]/70 backdrop-blur-3xl border border-white/20 dark:border-white/5 rounded-[3rem] shadow-[0_32px_64px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden relative group/sidebar">

          <div className="p-8 pb-4 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full overflow-hidden shadow-2xl bg-white dark:bg-white/5 border border-white/20 transition-transform duration-500 group-hover/sidebar:scale-110">
              <img 
                src={doctor?.avatar_url || \`https://ui-avatars.com/api/?name=\${doctor?.name}&background=8b5cf6&color=fff&size=128\`} 
                alt={doctor?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white mt-4">Inst. {doctor?.name}</h1>
            <p className="text-gray-500 dark:text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">Senior Instructor</p>
          </div>

          <div className="px-6 mb-4">
            <button 
              onClick={() => setActiveTab('materials')}
              className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#8b5cf6]/20 transition-all active:scale-95 text-sm uppercase tracking-widest"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Material</span>
            </button>
          </div>

          <nav className="flex-1 px-4 pb-8 space-y-1 overflow-y-auto hidden-scrollbar relative z-10">
            {MENU_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={\`w-full relative group/item flex items-center gap-4 px-6 py-3.5 rounded-2xl transition-all duration-500
                    \${isActive ? 'text-gray-900 dark:text-white font-black' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}
                  \`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gray-100 dark:bg-white/5 rounded-2xl animate-in fade-in zoom-in-95 duration-500" />
                  )}
                  <span className={\`relative z-10 transition-all duration-500 \${isActive ? 'scale-110 text-[#8b5cf6]' : 'group-hover/item:scale-110'}\`}>
                    {item.icon}
                  </span>
                  <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                  {isActive && (
                    <div className="absolute left-0 w-1 h-6 bg-[#8b5cf6] rounded-full shadow-[4px_0_15px_rgba(139,92,246,0.5)]" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-6 pt-0 relative z-10 border-t border-gray-100 dark:border-white/5 pt-4">
            <button 
              onClick={() => setActiveTab('notifications')}
              className={\`w-full relative group/item flex items-center gap-4 px-6 py-3 rounded-2xl transition-all duration-500 mb-2
                \${activeTab === 'notifications' ? 'text-gray-900 dark:text-white font-black' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}
              \`}
            >
              {activeTab === 'notifications' && <div className="absolute inset-0 bg-gray-100 dark:bg-white/5 rounded-2xl" />}
              <div className="relative">
                <Bell className={\`w-5 h-5 transition-all duration-500 \${activeTab === 'notifications' ? 'text-[#8b5cf6]' : ''}\`} />
                {unreadCount > 0 && <div className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full"></div>}
              </div>
              <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.2em]">Notifications</span>
              {unreadCount > 0 && <span className="ml-auto bg-rose-500/10 text-rose-500 text-[10px] font-black px-2 py-0.5 rounded-lg">{unreadCount > 99 ? '99+' : unreadCount}</span>}
            </button>
            <div className="bg-gray-50/50 dark:bg-white/[0.02] rounded-[2rem] p-2 flex gap-1 border border-gray-100 dark:border-white/5">
              <button onClick={() => setActiveTab('settings')} className={\`flex-1 h-12 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-white/5 transition-all \${activeTab === 'settings' ? 'text-[#8b5cf6]' : 'text-gray-400 hover:text-[#8b5cf6]'}\`}>
                <Settings className="w-5 h-5" />
              </button>
              <button onClick={toggleTheme} className="flex-1 h-12 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-white/5 transition-all text-gray-400 hover:text-[#8b5cf6]">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={onLogout} className="flex-1 h-12 flex items-center justify-center rounded-xl hover:bg-rose-500/10 transition-all text-gray-400 hover:text-rose-500">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============= Mobile Dock =============
  ${mobileDockLogic.replace(/location\.pathname === item\.path/g, 'activeTab === item.id').replace(/navigate\(bottomBarItems\[safeIndex\]\.path\)/g, 'setActiveTab(bottomBarItems[safeIndex].id)')}

  return (
    <>
      ${adaptMobileDock(mobileDockRender, false).replace(/bg-primary\/10 text-primary/g, 'bg-[#8b5cf6]/10 text-[#8b5cf6]')}
      <style>{\`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
        .hidden-scrollbar::-webkit-scrollbar { display: none; }
        .hidden-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      \`}</style>
    </>
  );
};

export default DoctorSidebar;
`;

fs.writeFileSync('/home/men3emk1/Documents/academic-portal/academic-portal/frontend/src/components/admin/AdminSidebar.jsx', adminSidebarContent);
fs.writeFileSync('/home/men3emk1/Documents/academic-portal/academic-portal/frontend/src/components/doctor/DoctorSidebar.jsx', doctorSidebarContent);
console.log('Sidebars updated successfully!');
