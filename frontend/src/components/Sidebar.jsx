import React, { useState, useEffect } from 'react';
import { Home, Calendar, Library, BarChart3, FileText, Map, Bell, CheckSquare, Settings, LogOut, Menu, X, ShieldCheck } from 'lucide-react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useStudentAuth } from '../context/StudentAuthContext';

const Sidebar = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { student } = useStudentAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const bottomBarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" />, path: '/student/dashboard' },
    { id: 'timetable', label: 'Timetable', icon: <Calendar className="w-5 h-5" />, path: '/student/timetable' },
    { id: 'materials', label: 'Materials', icon: <Library className="w-5 h-5" />, path: '/student/materials' },
  ];

  const menuItems = [
    { id: 'grades', label: 'Grades', icon: <BarChart3 className="w-5 h-5" />, path: '/student/grades' },
    { id: 'quizzes', label: 'Quizzes', icon: <FileText className="w-5 h-5" />, path: '/student/quizzes' },
    { id: 'roadmap', label: 'Roadmap', icon: <Map className="w-5 h-5" />, path: '/student/roadmap' },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" />, path: '/student/notifications' },
    { id: 'personal-tasks', label: 'My Tasks', icon: <CheckSquare className="w-5 h-5" />, path: '/student/personal-tasks' },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/student/settings' },
  ];

  if (student && (student.role === 'assistant' || student.role === 'admin')) {
    menuItems.push({ id: 'admin-panel', label: 'Admin Panel', icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />, path: '/admin' });
  }

  const handleLogout = () => {
    onLogout();
    navigate('/student/login');
  };

  // ============= Sidebar Desktop =============
  if (!isMobile) {
    return (
      <div className="fixed left-0 top-0 h-full w-64 bg-dark-card border-r border-white/5 z-40 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
        <div className="p-6 border-b border-white/5 flex items-center gap-4 bg-gradient-to-b from-white/[0.02] to-transparent">
          <div className="relative flex flex-shrink-0 items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-green-700 shadow-[0_0_20px_rgba(142,255,113,0.3)]">
            <div className="absolute inset-[2px] bg-[#050505] rounded-xl"></div>
            <div className="relative font-black text-2xl text-transparent bg-clip-text bg-gradient-to-br from-white to-primary tracking-tighter font-headline">
              Z
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 tracking-tight leading-none font-headline">
              ZNU
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary/70 mt-1">
              CS Portal
            </p>
          </div>
        </div>

        {student && (
          <div className="p-5 border-b border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10 flex flex-col gap-3">
              <h3 className="text-white font-headline font-bold text-[15px] leading-snug line-clamp-2">
                {student.name}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black tracking-widest uppercase text-dark bg-primary px-2 py-1 rounded-md leading-none shadow-[0_0_10px_rgba(var(--primary),0.3)]">
                  ID: {student.id}
                </span>
                <span className="text-[10px] font-bold tracking-widest uppercase text-gray-300 bg-white/5 px-2 py-1 border border-white/10 rounded-md leading-none">
                  Lvl {student.level}
                </span>
                <span className="text-[10px] font-bold tracking-widest uppercase text-gray-300 bg-white/5 px-2 py-1 border border-white/10 rounded-md leading-none">
                  Sec {student.section || '—'}
                </span>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto hidden-scrollbar">
          {[...bottomBarItems, ...menuItems].map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300
                ${isActive 
                  ? 'bg-primary/10 text-primary shadow-[inset_0_0_20px_rgba(142,255,113,0.05)] border border-primary/20 font-semibold' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent font-medium'
                }
              `}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-2xl text-red-400 font-bold bg-red-400/5 border border-red-400/10 hover:bg-red-400/10 hover:border-red-400/20 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    );
  }

  // ============= Bottom Navigation Bar Mobile =============
  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-dark-glass/95 backdrop-blur-xl border-t border-white/10 z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] pb-safe px-2 pb-2 pt-2">
        <div className="flex justify-around items-center">
          {bottomBarItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive: navActive }) => `
                  flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300
                  ${isActive || navActive 
                    ? 'text-primary bg-primary/10 shadow-[inset_0_0_15px_rgba(142,255,113,0.1)] border border-primary/10' 
                    : 'text-gray-500 hover:bg-white/5 hover:text-gray-300 border border-transparent'
                  }
                `}
              >
                <span>{item.icon}</span>
                <span className="text-[11px] font-semibold">{item.label}</span>
              </NavLink>
            );
          })}
          <button
            onClick={() => setIsOpen(true)}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-2xl text-gray-500 hover:bg-white/5 hover:text-gray-300 border border-transparent transition-all"
          >
            <Menu className="w-6 h-6" />
            <span className="text-[11px] font-semibold">More</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed bottom-24 left-4 right-4 bg-dark-card border border-white/10 rounded-[2rem] shadow-2xl z-50 animate-slideUp overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-[14px] bg-gradient-to-br from-primary to-green-700 shadow-[0_0_15px_rgba(142,255,113,0.3)]">
                  <div className="absolute inset-[2px] bg-[#050505] rounded-[12px]"></div>
                  <span className="relative font-black text-xl text-primary font-headline">Z</span>
                </div>
                <div>
                  <h3 className="text-[16px] font-extrabold text-white leading-none tracking-tight font-headline mb-1">ZNU Menu</h3>
                  {student && (
                    <p className="text-[11px] text-primary/70 font-bold uppercase tracking-widest mt-1 truncate max-w-[120px]">{student.name.split(' ')[0]}</p>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-3 max-h-[55vh] overflow-y-auto hidden-scrollbar">
              <div className="space-y-1">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`
                        flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300
                        ${isActive 
                          ? 'bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_0_15px_rgba(142,255,113,0.05)]' 
                          : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                        }
                      `}
                    >
                      <div className={`p-1.5 rounded-xl ${isActive ? 'bg-primary/20 text-primary' : 'bg-white/5 text-gray-400'}`}>
                        {item.icon}
                      </div>
                      <span className="font-semibold">{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(142,255,113,0.8)]" />
                      )}
                    </NavLink>
                  );
                })}
              </div>
              
              <div className="my-3 mx-2 h-px bg-white/5" />
              
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="flex items-center justify-center gap-3 w-full px-4 py-4 rounded-2xl text-red-400 font-bold bg-red-400/5 border border-red-400/10 hover:bg-red-400/10 hover:border-red-400/20 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-bold">Logout Securely</span>
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slideUp { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .font-headline { font-family: 'Manrope', 'Inter', sans-serif; }
        .hidden-scrollbar::-webkit-scrollbar { display: none; }
        .hidden-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 1rem); }
      `}</style>
    </>
  );
};

export default Sidebar;