import React, { useState, useEffect } from 'react';
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

  // الأيقونات الأساسية للـ Bottom Bar
  const bottomBarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠', path: '/student/dashboard' },
    { id: 'timetable', label: 'Timetable', icon: '📅', path: '/student/timetable' },
    { id: 'materials', label: 'Materials', icon: '📚', path: '/student/materials' },
  ];

  // باقي العناصر للـ Hamburger Menu
  const menuItems = [
    { id: 'grades', label: 'Grades', icon: '📊', path: '/student/grades' },
    { id: 'roadmap', label: 'Roadmap', icon: '🗺️', path: '/student/roadmap' },
    { id: 'notifications', label: 'Notifications', icon: '🔔', path: '/student/notifications' },
    { id: 'settings', label: 'Settings', icon: '⚙️', path: '/student/settings' },
  ];

  const handleLogout = () => {
    onLogout();
    navigate('/student/login');
  };

  // ============= Sidebar للـ Desktop =============
  if (!isMobile) {
    return (
      <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-dark-card to-dark border-r border-primary/20 z-40 flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-primary/20">
          <h1 className="text-xl font-bold text-primary">Academic Portal</h1>
          <p className="text-xs text-gray-500 mt-1">Faculty of CI</p>
        </div>

        {/* Student Info */}
        {student && (
          <div className="p-4 border-b border-white/10 bg-white/5">
            <p className="text-sm text-gray-400 truncate">{student.name}</p>
            <p className="text-xs text-primary mt-1">ID: {student.id}</p>
            <p className="text-xs text-gray-500">Level {student.level} • Sec {student.section || '—'}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {[...bottomBarItems, ...menuItems].map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-primary/20 text-primary border-l-4 border-primary' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
          >
            <span className="text-xl">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    );
  }

  // ============= Bottom Navigation Bar للموبايل =============
  return (
    <>
      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-dark-card/95 backdrop-blur-lg border-t border-primary/20 z-50 shadow-lg">
        <div className="flex justify-around items-center py-2 px-2">
          {bottomBarItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive: navActive }) => `
                  flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200
                  ${isActive || navActive 
                    ? 'text-primary bg-primary/10' 
                    : 'text-gray-400 hover:text-gray-300'
                  }
                `}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-[11px] font-medium">{item.label}</span>
              </NavLink>
            );
          })}
          
          {/* Hamburger Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-gray-400 hover:text-gray-300 hover:bg-white/5 transition-all"
          >
            <span className="text-2xl">☰</span>
            <span className="text-[11px] font-medium">More</span>
          </button>
        </div>
      </div>

      {/* Hamburger Modal */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="fixed bottom-20 left-4 right-4 bg-dark-card border border-primary/20 rounded-2xl shadow-2xl z-50 animate-slideUp overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-primary/5">
              <div>
                <h3 className="text-lg font-bold text-primary">Menu</h3>
                {student && (
                  <p className="text-xs text-gray-400 mt-0.5">{student.name}</p>
                )}
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
              >
                ✕
              </button>
            </div>
            
            {/* Menu Items */}
            <div className="p-3 max-h-[60vh] overflow-y-auto">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                      ${isActive 
                        ? 'bg-primary/20 text-primary' 
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }
                    `}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <span className="ml-auto text-xs text-primary">●</span>
                    )}
                  </NavLink>
                );
              })}
              
              {/* Divider */}
              <div className="my-2 h-px bg-white/10" />
              
              {/* Logout */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
              >
                <span className="text-xl">🚪</span>
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.25s ease-out;
        }
      `}</style>
    </>
  );
};

export default Sidebar;